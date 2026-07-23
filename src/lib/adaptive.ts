import type { Course, Question } from "../types";
import {
  MASTERY_THRESHOLD,
  masteryBreakdown,
  masteryScore as scoreMastery,
} from "./mastery";
import { mistakeIsOpen, type CardState, type CourseProgress } from "./progress";
import { dueWithin, effectiveDue } from "./srs";

/* ================================================================== *
 *  ADAPTIVE SCHEDULING
 *  Decides the order questions appear in a practice session:
 *   - overdue reviews first (including mastered cards whose SRS
 *     interval has expired — rust re-enters the queue here)
 *   - unseen preferred over repeats
 *   - weak cards weighted above mastered ones
 *   - freshly mastered cards appear rarely
 * ================================================================== */

export const XP_PER_LEVEL = 120;

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, perLevel: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

/** Past its SRS review date (unseen cards are new, never due). */
export function isDue(state: CardState | undefined): boolean {
  return effectiveDue(state) <= Date.now();
}

export function questionMastery(q: Question, state: CardState | undefined, now = Date.now()): number {
  return scoreMastery(state, q.difficulty, now);
}

export function questionIsMastered(
  q: Question,
  state: CardState | undefined,
  now = Date.now()
): boolean {
  return questionMastery(q, state, now) >= MASTERY_THRESHOLD;
}

/** Shared priority: due errors → open mistakes → shaky recall → unseen → stable mastery. */
export function questionPriority(q: Question, state: CardState | undefined, now = Date.now()): number {
  if (!state || state.attempts === 0) return 64;
  const overdue = effectiveDue(state, now) <= now;
  const mistake = mistakeIsOpen(state);
  const mastery = questionMastery(q, state, now);
  if (overdue && mistake) return 145;
  if (overdue) return 130;
  if (mistake) return 118;
  if (mastery < 0.5) return 92;
  if (mastery < MASTERY_THRESHOLD) return 72;
  return 10 + 10 * (1 - mastery);
}

/** How many cards come due within the next `days` days (review forecast). */
export function dueForecast(questions: Question[], progress: CourseProgress, days: number): number {
  return questions.filter((q) => dueWithin(progress.cards[q.id], days)).length;
}

/**
 * Build an ordered session queue. Deterministic-ish weighting plus light
 * jitter so repeated sessions don't feel identical.
 */
export function buildSession(questions: Question[], progress: CourseProgress): Question[] {
  const now = Date.now();
  return [...questions]
    .map((q) => {
      const state = progress.cards[q.id];
      const jitter = Math.random() * 18;
      return { q, score: questionPriority(q, state, now) + jitter };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.q);
}

export function masteredCount(questions: Question[], progress: CourseProgress): number {
  const now = Date.now();
  return questions.filter((q) => questionIsMastered(q, progress.cards[q.id], now)).length;
}

/** Fractional mastery credit avoids pretending a 74% card contributes the same as an unseen one. */
export function masteryAverage(questions: Question[], progress: CourseProgress): number {
  if (!questions.length) return 0;
  const now = Date.now();
  return (
    questions.reduce((sum, q) => sum + questionMastery(q, progress.cards[q.id], now), 0) /
    questions.length
  );
}

export function openMistakeCount(questions: Question[], progress: CourseProgress): number {
  return questions.filter((q) => mistakeIsOpen(progress.cards[q.id])).length;
}

export function dueCount(questions: Question[], progress: CourseProgress): number {
  return questions.filter((q) => isDue(progress.cards[q.id])).length;
}

/** Topics the learner has actually reached: attempted cards or a corresponding completed lesson. */
export function reachedTopics(course: Course, progress: CourseProgress): Set<string> {
  const reached = new Set<string>();
  const topics: string[] = [];
  for (const q of course.practice) {
    if (q.topic && !topics.includes(q.topic)) topics.push(q.topic);
    if (q.topic && (progress.cards[q.id]?.attempts ?? 0) > 0) reached.add(q.topic);
  }

  // A one-lesson, practice-first course uses that lesson as the doorway to its
  // whole bank (for example an exam-MCQ map rather than one lesson per topic).
  if (course.lessons.length === 1 && progress.lessons[course.lessons[0].id]?.completed) {
    topics.forEach((topic) => reached.add(topic));
  }

  // Topic-file courses keep lessons and topics in the same source order.
  if (topics.length === course.lessons.length) {
    course.lessons.forEach((lesson, i) => {
      if (progress.lessons[lesson.id]?.completed && topics[i]) reached.add(topics[i]);
    });
  }

  for (const lesson of course.lessons) {
    if (!progress.lessons[lesson.id]?.completed) continue;
    const names = new Set([lesson.title, lesson.lecture].filter(Boolean) as string[]);
    for (const q of course.practice) {
      if (!q.topic) continue;
      // `lecture` often equals the question topic (MA2 modules). Do not match a
      // question's broad `module` to the lesson lecture: in LAG that would make
      // completing one MATLAB lesson unlock every MATLAB topic at once.
      if (names.has(q.topic) || q.module === lesson.title) reached.add(q.topic);
    }
  }
  return reached;
}

export function questionIsReached(
  q: Question,
  course: Course,
  progress: CourseProgress,
  topics = reachedTopics(course, progress)
): boolean {
  if ((progress.cards[q.id]?.attempts ?? 0) > 0) return true;
  if (q.topic) return topics.has(q.topic);
  return Object.values(progress.lessons).some((lesson) => lesson.completed);
}

export interface LearningSignal {
  mastery: number;
  recentAccuracy: number;
  spacedRecall: number;
  due: boolean;
  mistake: boolean;
}

export function learningSignal(
  q: Question,
  state: CardState | undefined,
  now = Date.now()
): LearningSignal {
  const detail = masteryBreakdown(state, q.difficulty, now);
  return {
    mastery: detail.score,
    recentAccuracy: detail.recentAccuracy,
    spacedRecall: detail.spacedRecall,
    due: effectiveDue(state, now) <= now,
    mistake: mistakeIsOpen(state),
  };
}

/** Fisher–Yates, used to randomize option order at answer time. */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
