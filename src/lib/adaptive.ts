import type { Question } from "../types";
import type { CardState, CourseProgress } from "./progress";

/* ================================================================== *
 *  ADAPTIVE SCHEDULING
 *  Decides the order questions appear in a practice session:
 *   - due (answered wrong, not yet remastered) first
 *   - unseen preferred over repeats
 *   - weak cards weighted above mastered ones
 *   - mastered cards appear rarely
 * ================================================================== */

export const XP_PER_LEVEL = 120;

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, perLevel: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

export function isDue(state: CardState | undefined): boolean {
  return !!state && state.wrong > 0 && !state.mastered;
}

function weight(state: CardState | undefined): number {
  if (!state || state.attempts === 0) return 60; // unseen
  if (state.wrong > 0 && !state.mastered) return 100; // due review
  if (state.mastered) return 8; // keep mastered out of the way
  return 40; // seen but not locked in
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
