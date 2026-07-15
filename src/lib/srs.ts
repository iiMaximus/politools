import type { CardState } from "./progress";

/* ================================================================== *
 *  SPACED REPETITION (SM-2 lite)
 *  Pure scheduling math — no storage, no imports beyond the CardState
 *  type. progress.ts writes the fields; adaptive.ts / game.ts read
 *  them. Binary grades only: an MCQ answer is "good" or "again", a
 *  Scroll self-rating maps Known → good, Drill-again → again.
 *
 *  Legacy cards (recorded before SRS shipped) have no `due` field;
 *  effectiveDue() derives one so old progress keeps its meaning:
 *  a wrong-and-not-remastered card is due immediately (the old
 *  isDue rule) and a mastered card starts to decay after 10 days
 *  (the old first rust tier).
 * ================================================================== */

export interface SrsFields {
  /** growth multiplier for the review interval (1.3 .. 3.0) */
  ease: number;
  /** current interval in days (0 = relearning) */
  intervalDays: number;
  /** epoch ms when this card should next be reviewed */
  due: number;
  /** times the card fell back to relearning */
  lapses: number;
}

export type SrsGrade = "again" | "good";

export const DEFAULT_EASE = 2.3;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const MAX_INTERVAL_DAYS = 120;

const DAY = 86_400_000;
/** a missed card comes back within the same session */
const AGAIN_DELAY_MS = 10 * 60_000;

/** Deterministic per-card jitter in [-10%, +10%] so reviews de-clump
 *  across days instead of all landing on the same morning. */
export function intervalJitter(cardId: string): number {
  let h = 2166136261;
  for (let i = 0; i < cardId.length; i++) {
    h ^= cardId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (((h >>> 0) % 2001) / 2000 - 0.5) * 0.2;
}

/** Next SRS state after answering `cardId` with `grade`. */
export function schedule(
  cardId: string,
  prev: Pick<CardState, "ease" | "intervalDays" | "lapses"> | undefined,
  grade: SrsGrade,
  now = Date.now()
): SrsFields {
  const ease = prev?.ease ?? DEFAULT_EASE;
  const lapses = prev?.lapses ?? 0;

  if (grade === "again") {
    return {
      ease: Math.max(MIN_EASE, ease - 0.2),
      intervalDays: 0,
      due: now + AGAIN_DELAY_MS,
      lapses: lapses + 1,
    };
  }

  const prevInterval = prev?.intervalDays ?? 0;
  let intervalDays: number;
  if (prevInterval <= 0) intervalDays = 1;
  else if (prevInterval < 3) intervalDays = 3;
  else intervalDays = Math.round(prevInterval * ease * (1 + intervalJitter(cardId)));
  intervalDays = Math.max(1, Math.min(MAX_INTERVAL_DAYS, intervalDays));

  return {
    ease: Math.min(MAX_EASE, ease + 0.03),
    intervalDays,
    due: now + intervalDays * DAY,
    lapses,
  };
}

/** When is this card due? Handles legacy cards with no SRS fields.
 *  Unseen cards are never "due" — they are new, not overdue. */
export function effectiveDue(card: CardState | undefined, _now = Date.now()): number {
  if (!card || card.attempts === 0) return Infinity;
  if (card.due != null) return card.due;
  // legacy card recorded before SRS: derive the old semantics
  if (card.mastered) return card.lastSeen + 10 * DAY;
  if (card.wrong > 0) return 0;
  return card.lastSeen + DAY;
}

/** How far past due, measured in units of the card's own interval.
 *  0 while not yet due; 1.0 = a full interval overdue. */
export function overdueRatio(card: CardState | undefined, now = Date.now()): number {
  const due = effectiveDue(card, now);
  if (!Number.isFinite(due) || now <= due) return 0;
  const intervalMs = Math.max(1, card?.intervalDays ?? (card?.mastered ? 10 : 1)) * DAY;
  return (now - due) / intervalMs;
}

/** Will this card come due within the next `days` days? */
export function dueWithin(card: CardState | undefined, days: number, now = Date.now()): boolean {
  return effectiveDue(card, now) <= now + days * DAY;
}

/** Human label for a card's next review ("in 10 min", "tomorrow", "in 3 d"). */
export function nextReviewLabel(due: number | undefined, now = Date.now()): string | null {
  if (due == null) return null;
  const delta = due - now;
  if (delta <= 60_000) return "now";
  if (delta < 3_600_000) return `in ${Math.round(delta / 60_000)} min`;
  // 22h+ reads as "tomorrow", not "in 24 h" (labels render ms after stamping)
  if (delta < 22 * 3_600_000) return `in ${Math.round(delta / 3_600_000)} h`;
  const days = Math.max(1, Math.round(delta / DAY));
  if (days === 1) return "tomorrow";
  if (days < 14) return `in ${days} d`;
  return `in ${Math.round(days / 7)} w`;
}
