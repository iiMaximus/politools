import type { Difficulty } from "../types";

/* ================================================================== *
 *  MASTERY EVIDENCE
 *  A card is not "mastered" merely because it was answered twice in a
 *  row. Mastery blends recent accuracy, question difficulty, retrieval
 *  on a later occasion, current recency and lapse history. The module is
 *  deliberately storage-agnostic so progress.ts can write the evidence
 *  while adaptive.ts / summaries can score it without an import cycle.
 * ================================================================== */

export interface AnswerEvent {
  at: number;
  correct: boolean;
  /** Difficulty known by the answering surface; legacy callers may omit it. */
  difficulty?: Difficulty;
  /** What the learner entered/picked. Stored only when the surface supplies it. */
  selectedAnswer?: string;
  /** Correct option/value, for a useful mistake-history entry. */
  correctAnswer?: string;
  /** Optional timing signal. It is recorded, but not required by the score. */
  responseMs?: number;
  /** practice, daily-mix, mistake-lab, checkpoint, boss, scroll, ... */
  mode?: string;
  selfRated?: boolean;
  /** Migration bridge: this answer followed a legacy mastered card with no event history. */
  carriedLegacyMastery?: boolean;
  /** Scheduling state immediately before this retrieval. */
  intervalBeforeDays?: number;
  wasDue?: boolean;
}

export interface MasteryEvidence {
  attempts: number;
  correct: number;
  wrong: number;
  streak: number;
  mastered: boolean;
  lastSeen: number;
  intervalDays?: number;
  due?: number;
  lapses?: number;
  history?: AnswerEvent[];
}

export interface MasteryBreakdown {
  score: number;
  recentAccuracy: number;
  evidence: number;
  spacedRecall: number;
  recency: number;
  hasSpacedRecall: boolean;
}

export const MASTERY_THRESHOLD = 0.75;
export const ANSWER_HISTORY_LIMIT = 24;

const DAY = 86_400_000;
const SPACED_GAP_MS = 6 * 3_600_000;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function difficultyOf(
  requested: Difficulty | undefined,
  history: AnswerEvent[]
): Difficulty {
  return requested ?? [...history].reverse().find((e) => e.difficulty)?.difficulty ?? "medium";
}

function recentAccuracy(state: MasteryEvidence, history: AnswerEvent[]): number {
  if (!history.length) {
    // Beta(1,1) prior keeps a single lucky answer from reading as 100% certainty.
    return (state.correct + 1) / (state.attempts + 2);
  }
  const recent = history.slice(-8);
  let earned = 0;
  let possible = 0;
  recent.forEach((event, i) => {
    const chronologicalWeight = 0.65 + 0.35 * ((i + 1) / recent.length);
    const sourceWeight = event.selfRated ? 0.55 : 1;
    const weight = chronologicalWeight * sourceWeight;
    possible += weight;
    if (event.correct) earned += weight;
  });
  return possible ? earned / possible : 0;
}

function spacedRecall(history: AnswerEvent[]): { score: number; present: boolean } {
  const correct = history.filter((event) => event.correct && !event.selfRated);
  let longestGap = 0;
  for (let i = 1; i < correct.length; i++) {
    longestGap = Math.max(longestGap, correct[i].at - correct[i - 1].at);
  }
  // A successful answer after a real scheduled interval is unambiguous recall evidence.
  const scheduledRecall = correct.some(
    (event) => event.wasDue && (event.intervalBeforeDays ?? 0) >= 1
  );
  const present = scheduledRecall || longestGap >= SPACED_GAP_MS;
  if (!present) return { score: 0, present: false };
  const days = Math.max(longestGap / DAY, scheduledRecall ? 1 : 0);
  // 1 day ≈ .33, 3 days ≈ .67, 7+ days = 1.
  return { score: clamp01(Math.log2(1 + days) / 3), present: true };
}

function recency(state: MasteryEvidence, now: number): number {
  if (!state.lastSeen) return 0;
  if (state.due == null) {
    const days = Math.max(0, (now - state.lastSeen) / DAY);
    return Math.exp(-days / 21);
  }
  if (now <= state.due) return 1;
  const intervalMs = Math.max(1, state.intervalDays ?? 1) * DAY;
  return Math.exp(-(now - state.due) / intervalMs);
}

/** Pure 0..1 score with an inspectable breakdown for UI and tests. */
export function masteryBreakdown(
  state: MasteryEvidence | undefined,
  difficulty?: Difficulty,
  now = Date.now()
): MasteryBreakdown {
  if (!state || state.attempts <= 0) {
    return {
      score: 0,
      recentAccuracy: 0,
      evidence: 0,
      spacedRecall: 0,
      recency: 0,
      hasSpacedRecall: false,
    };
  }

  const history = state.history ?? [];
  const level = difficultyOf(difficulty, history);
  const accuracy = recentAccuracy(state, history);
  const requiredCorrect = level === "hard" ? 2 : level === "medium" ? 3 : 4;
  const evidence = clamp01(state.correct / requiredCorrect);
  const spaced = spacedRecall(history);
  const fresh = recency(state, now);
  const consistency = clamp01(state.streak / 3);
  const difficultyBonus = level === "hard" ? 0.03 : level === "easy" ? -0.02 : 0;
  const lapsePenalty = Math.min(0.2, (state.lapses ?? 0) * 0.035);

  let score =
    0.48 * accuracy +
    0.17 * evidence +
    0.2 * spaced.score +
    0.1 * consistency +
    0.05 * fresh +
    difficultyBonus -
    lapsePenalty;
  // Recency matters even after a strong historical run; a badly overdue card decays.
  score *= 0.7 + 0.3 * fresh;

  const last = history[history.length - 1];
  if (last && !last.correct) score = Math.min(score, 0.35);
  // Repetition in one sitting is learning, not durable mastery. A later retrieval is required.
  if (history.length && !spaced.present) score = Math.min(score, 0.73);

  if (last?.correct && history.some((event) => event.carriedLegacyMastery)) {
    score = Math.max(score, 0.76 * (0.75 + 0.25 * fresh));
  }

  // Preserve pre-history mastered cards while they are still reasonably fresh. Their next answer
  // starts collecting the richer evidence, and any wrong answer demotes immediately.
  if (!history.length && state.mastered) score = Math.max(score, 0.76 * (0.75 + 0.25 * fresh));

  return {
    score: clamp01(score),
    recentAccuracy: accuracy,
    evidence,
    spacedRecall: spaced.score,
    recency: fresh,
    hasSpacedRecall: spaced.present,
  };
}

export function masteryScore(
  state: MasteryEvidence | undefined,
  difficulty?: Difficulty,
  now = Date.now()
): number {
  return masteryBreakdown(state, difficulty, now).score;
}

export function hasMastery(
  state: MasteryEvidence | undefined,
  difficulty?: Difficulty,
  now = Date.now()
): boolean {
  return masteryScore(state, difficulty, now) >= MASTERY_THRESHOLD;
}

export function masteryLabel(score: number): "unseen" | "learning" | "shaky" | "mastered" {
  if (score <= 0) return "unseen";
  if (score < 0.5) return "learning";
  if (score < MASTERY_THRESHOLD) return "shaky";
  return "mastered";
}
