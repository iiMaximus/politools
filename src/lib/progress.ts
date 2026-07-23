import { useEffect, useState } from "react";
import type { Difficulty } from "../types";
import { logAnswer, logLessonCompleted } from "./game";
import {
  ANSWER_HISTORY_LIMIT,
  hasMastery,
  masteryScore,
  type AnswerEvent,
} from "./mastery";
import { effectiveDue, schedule } from "./srs";

/* ================================================================== *
 *  PROGRESS STORE
 *  Per-course progress persisted in localStorage with a tiny pub/sub
 *  so every component (course page, practice, hub) stays in sync.
 *  Every answer/lesson is also mirrored into lib/game.ts (streaks,
 *  quests, achievements) — game.ts never imports back, no cycles.
 * ================================================================== */

export interface CardState {
  attempts: number;
  correct: number;
  wrong: number;
  streak: number;
  mastered: boolean;
  lastSeen: number;
  /** SRS fields (lib/srs.ts) — absent on cards from before SRS shipped;
   *  effectiveDue() bridges those until their next answer stamps them. */
  ease?: number;
  intervalDays?: number;
  due?: number;
  lapses?: number;
  /** Recent retrieval evidence used by the meaningful mastery model. */
  history?: AnswerEvent[];
  /** Last known question difficulty; older answering surfaces may omit it. */
  difficulty?: Difficulty;
  /** Cached 0..1 score for simple consumers; adaptive.ts recomputes it with current recency. */
  mastery?: number;
  /** Most recent false -> true mastery transition, used by the weekly leaderboard. */
  masteredAt?: number;
  /** Persistent error history and recovery state for Mistake Lab. */
  mistake?: MistakeRecord;
}

export interface MistakeRecord {
  count: number;
  openedAt: number;
  lastWrongAt: number;
  /** Wrong-answer events only, newest last. */
  events: AnswerEvent[];
  /** Correct answers since the most recent error. */
  correctSince: number;
  lastReviewedAt?: number;
  resolvedAt?: number;
}

export interface AnswerContext {
  difficulty?: Difficulty;
  selectedAnswer?: string;
  correctAnswer?: string;
  responseMs?: number;
  mode?: string;
}

export interface CourseProgress {
  xp: number;
  cards: Record<string, CardState>;
  lessons: Record<string, { completed: boolean; lastViewed: number }>;
  exams: Record<string, { revealed: boolean; solved: boolean }>;
}

const KEY = (courseId: string) => `polito:progress:${courseId}`;

const empty = (): CourseProgress => ({ xp: 0, cards: {}, lessons: {}, exams: {} });

const cache = new Map<string, CourseProgress>();
const listeners = new Map<string, Set<() => void>>();
const RECOVERY_GAP_MS = 6 * 3_600_000;

function normalizeProgress(value: CourseProgress): CourseProgress {
  let changed = false;
  const cards: Record<string, CardState> = {};
  for (const [id, card] of Object.entries(value.cards ?? {})) {
    if (!card.mistake && card.wrong > 0 && !card.mastered) {
      const at = card.lastSeen || 0;
      const legacyEvent: AnswerEvent = { at, correct: false, mode: "legacy" };
      cards[id] = {
        ...card,
        mistake: {
          count: card.wrong,
          openedAt: at,
          lastWrongAt: at,
          events: [legacyEvent],
          correctSince: 0,
        },
      };
      changed = true;
    } else {
      cards[id] = card;
    }
  }
  return changed ? { ...value, cards } : value;
}

function read(courseId: string): CourseProgress {
  if (cache.has(courseId)) return cache.get(courseId)!;
  let value = empty();
  try {
    const raw = localStorage.getItem(KEY(courseId));
    if (raw) value = normalizeProgress({ ...empty(), ...(JSON.parse(raw) as CourseProgress) });
  } catch {
    /* ignore corrupt storage */
  }
  cache.set(courseId, value);
  return value;
}

function write(courseId: string, next: CourseProgress) {
  cache.set(courseId, next);
  try {
    localStorage.setItem(KEY(courseId), JSON.stringify(next));
  } catch {
    /* storage full / unavailable */
  }
  listeners.get(courseId)?.forEach((fn) => fn());
}

export function newCard(): CardState {
  return { attempts: 0, correct: 0, wrong: 0, streak: 0, mastered: false, lastSeen: 0 };
}

/** Kept for old UI copy/import compatibility; mastery now requires spaced evidence too. */
export const MASTERY_STREAK = 2;

function appendHistory(history: AnswerEvent[] | undefined, event: AnswerEvent): AnswerEvent[] {
  return [...(history ?? []), event].slice(-ANSWER_HISTORY_LIMIT);
}

function updateMistake(
  previous: MistakeRecord | undefined,
  event: AnswerEvent,
  mastered: boolean
): MistakeRecord | undefined {
  if (!event.correct) {
    return {
      count: (previous?.count ?? 0) + 1,
      openedAt: previous?.openedAt ?? event.at,
      lastWrongAt: event.at,
      events: [...(previous?.events ?? []), event].slice(-ANSWER_HISTORY_LIMIT),
      correctSince: 0,
      lastReviewedAt: previous?.resolvedAt ? undefined : previous?.lastReviewedAt,
      resolvedAt: undefined,
    };
  }
  if (!previous) return undefined;
  const correctSince = previous.correctSince + 1;
  const recoveryWasSpaced =
    event.at - previous.lastWrongAt >= RECOVERY_GAP_MS ||
    Boolean(event.wasDue && (event.intervalBeforeDays ?? 0) >= 1);
  return {
    ...previous,
    correctSince,
    // Existing historical spacing does not close a newly opened case. The
    // learner must retrieve successfully again after the latest error.
    resolvedAt: mastered && recoveryWasSpaced ? event.at : undefined,
  };
}

/** Record an answer and update XP, mastery evidence and Mistake Lab history. */
export function recordAnswer(
  courseId: string,
  cardId: string,
  isCorrect: boolean,
  context: AnswerContext = {}
): number {
  const p = read(courseId);
  const prev = p.cards[cardId] ?? newCard();
  const now = Date.now();
  // "due" = past its review date (legacy cards bridged by effectiveDue)
  const overdue = effectiveDue(prev, now) <= now;
  const streak = isCorrect ? prev.streak + 1 : 0;
  const difficulty = context.difficulty ?? prev.difficulty;
  const event: AnswerEvent = {
    at: now,
    correct: isCorrect,
    difficulty,
    selectedAnswer: context.selectedAnswer,
    correctAnswer: context.correctAnswer,
    responseMs: context.responseMs,
    mode: context.mode,
    intervalBeforeDays: prev.intervalDays,
    wasDue: overdue,
    carriedLegacyMastery: Boolean(prev.mastered && !prev.history?.length),
  };
  const history = appendHistory(prev.history, event);
  const scheduled = schedule(cardId, prev, isCorrect ? "good" : "again", now);
  const draft: CardState = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    wrong: prev.wrong + (isCorrect ? 0 : 1),
    streak,
    mastered: false,
    lastSeen: now,
    ...scheduled,
    history,
    difficulty,
  };
  const score = masteryScore(draft, difficulty, now);
  const mastered = hasMastery(draft, difficulty, now);
  const card: CardState = {
    ...draft,
    mastered,
    mastery: score,
    masteredAt: mastered
      ? prev.mastered
        ? (prev.masteredAt ?? prev.lastSeen)
        : now
      : prev.masteredAt,
    mistake: updateMistake(prev.mistake, event, mastered),
  };
  // XP: solid reward for correct, streak bonus, token reward for trying.
  const gained = isCorrect ? 12 + Math.min(streak - 1, 4) * 3 : 2;
  write(courseId, { ...p, xp: p.xp + gained, cards: { ...p.cards, [cardId]: card } });
  logAnswer({
    courseId,
    isCorrect,
    xp: gained,
    wasDue: overdue,
    wasRusty: overdue && prev.mastered,
  });
  return gained;
}

/** Record a self-graded recall (Scroll formula cards: Known / Drill again).
 *  Feeds the SRS and the streak, but game.ts treats it as self-rated so it
 *  never inflates accuracy-based quests. Returns the awarded XP. */
export function recordSelfRating(courseId: string, cardId: string, known: boolean): number {
  const p = read(courseId);
  const prev = p.cards[cardId] ?? newCard();
  const now = Date.now();
  const streak = known ? prev.streak + 1 : 0;
  const event: AnswerEvent = {
    at: now,
    correct: known,
    difficulty: prev.difficulty,
    mode: "scroll",
    selfRated: true,
    intervalBeforeDays: prev.intervalDays,
    wasDue: effectiveDue(prev, now) <= now,
    carriedLegacyMastery: Boolean(prev.mastered && !prev.history?.length),
  };
  const history = appendHistory(prev.history, event);
  const draft: CardState = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (known ? 1 : 0),
    wrong: prev.wrong + (known ? 0 : 1),
    streak,
    mastered: false,
    lastSeen: now,
    ...schedule(cardId, prev, known ? "good" : "again", now),
    history,
    difficulty: prev.difficulty,
  };
  const score = masteryScore(draft, prev.difficulty, now);
  const mastered = hasMastery(draft, prev.difficulty, now);
  const card: CardState = {
    ...draft,
    mastered,
    mastery: score,
    masteredAt: mastered
      ? prev.mastered
        ? (prev.masteredAt ?? prev.lastSeen)
        : now
      : prev.masteredAt,
    // A self-rating is useful retrieval evidence, but is not a wrong-answer misconception and
    // cannot silently resolve an existing Mistake Lab item.
    mistake: prev.mistake,
  };
  const gained = known ? 2 : 1;
  write(courseId, { ...p, xp: p.xp + gained, cards: { ...p.cards, [cardId]: card } });
  logAnswer({ courseId, isCorrect: known, xp: gained, wasDue: false, wasRusty: false, selfRated: true });
  return gained;
}

export function markLesson(courseId: string, lessonId: string, completed: boolean) {
  const p = read(courseId);
  const wasCompleted = p.lessons[lessonId]?.completed ?? false;
  write(courseId, {
    ...p,
    lessons: { ...p.lessons, [lessonId]: { completed, lastViewed: Date.now() } },
  });
  if (completed && !wasCompleted) logLessonCompleted();
}

export function setExamState(
  courseId: string,
  examId: string,
  patch: Partial<{ revealed: boolean; solved: boolean }>
) {
  const p = read(courseId);
  const prev = p.exams[examId] ?? { revealed: false, solved: false };
  write(courseId, { ...p, exams: { ...p.exams, [examId]: { ...prev, ...patch } } });
}

export function resetCourse(courseId: string) {
  write(courseId, empty());
}

/** Mark that the learner opened the theory/explanation before retrying a mistake. */
export function markMistakeReviewed(courseId: string, cardId: string) {
  const p = read(courseId);
  const card = p.cards[cardId];
  if (!card?.mistake) return;
  write(courseId, {
    ...p,
    cards: {
      ...p.cards,
      [cardId]: {
        ...card,
        mistake: { ...card.mistake, lastReviewedAt: Date.now() },
      },
    },
  });
}

export function mistakeIsOpen(card: CardState | undefined): boolean {
  return Boolean(card?.mistake && !card.mistake.resolvedAt);
}

/** Non-reactive snapshot read (for aggregate dashboards). */
export function readProgress(courseId: string): CourseProgress {
  return read(courseId);
}

/** React hook: live, synced view of a course's progress. */
export function useCourseProgress(courseId: string): CourseProgress {
  const [, force] = useState(0);
  useEffect(() => {
    const set = listeners.get(courseId) ?? new Set();
    const fn = () => force((n) => n + 1);
    set.add(fn);
    listeners.set(courseId, set);
    return () => {
      set.delete(fn);
    };
  }, [courseId]);
  return read(courseId);
}
