import type { Question } from "../types";
import type { CardState, CourseProgress } from "./progress";
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

function weight(state: CardState | undefined): number {
  if (!state || state.attempts === 0) return 60; // unseen
  const overdue = effectiveDue(state) <= Date.now();
  if (overdue && !state.mastered) return 100; // due review
  if (overdue) return 90; // mastered but expired — polish the rust
  if (state.mastered) return 5; // keep fresh mastered out of the way
  return 40; // seen but not locked in
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
  return [...questions]
    .map((q) => {
      const state = progress.cards[q.id];
      const jitter = Math.random() * 18;
      return { q, score: weight(state) + jitter };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.q);
}

export function masteredCount(questions: Question[], progress: CourseProgress): number {
  return questions.filter((q) => progress.cards[q.id]?.mastered).length;
}

export function dueCount(questions: Question[], progress: CourseProgress): number {
  return questions.filter((q) => isDue(progress.cards[q.id])).length;
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
