import { useEffect, useState } from "react";
import { logAnswer, logLessonCompleted } from "./game";
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

function read(courseId: string): CourseProgress {
  if (cache.has(courseId)) return cache.get(courseId)!;
  let value = empty();
  try {
    const raw = localStorage.getItem(KEY(courseId));
    if (raw) value = { ...empty(), ...(JSON.parse(raw) as CourseProgress) };
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

export const MASTERY_STREAK = 2;

/** Record an MCQ answer and update XP. Returns the awarded XP. */
export function recordAnswer(courseId: string, cardId: string, isCorrect: boolean): number {
  const p = read(courseId);
  const prev = p.cards[cardId] ?? newCard();
  const now = Date.now();
  // "due" = past its review date (legacy cards bridged by effectiveDue)
  const overdue = effectiveDue(prev, now) <= now;
  const streak = isCorrect ? prev.streak + 1 : 0;
  const card: CardState = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    wrong: prev.wrong + (isCorrect ? 0 : 1),
    streak,
    mastered: prev.mastered || streak >= MASTERY_STREAK,
    lastSeen: now,
    ...schedule(cardId, prev, isCorrect ? "good" : "again", now),
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
  const card: CardState = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (known ? 1 : 0),
    wrong: prev.wrong + (known ? 0 : 1),
    streak,
    mastered: prev.mastered || streak >= MASTERY_STREAK,
    lastSeen: now,
    ...schedule(cardId, prev, known ? "good" : "again", now),
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
