import type { Course, Question } from "../types";
import type { CourseProgress } from "./progress";
import { effectiveDue } from "./srs";
import { questionIsMastered, questionMastery } from "./adaptive";

/* ================================================================== *
 *  WEAK-TOPIC ANALYTICS — pure math over practice banks + progress.
 *  Powers the CoursePage topic heat table, the Stats page and the
 *  "drill your weakest topic" CTAs.
 * ================================================================== */

export interface TopicStat {
  topic: string;
  total: number;
  attempted: number;
  attempts: number;
  correct: number;
  /** null until the topic has been attempted */
  accuracy: number | null;
  mastered: number;
  due: number;
  /** mean SRS interval of seen cards (days) — retention stability */
  avgIntervalDays: number;
  /** 0..1 — higher = weaker (blend of low mastery, low accuracy, open dues) */
  weakness: number;
}

export function topicStats(course: Course, progress: CourseProgress): TopicStat[] {
  const groups = new Map<string, Question[]>();
  for (const q of course.practice) {
    const key = q.topic ?? "General";
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  const now = Date.now();
  const out: TopicStat[] = [];
  for (const [topic, qs] of groups) {
    let attempted = 0;
    let attempts = 0;
    let correct = 0;
    let mastered = 0;
    let masteryCredit = 0;
    let due = 0;
    let intervalSum = 0;
    let intervalN = 0;
    for (const q of qs) {
      const card = progress.cards[q.id];
      if (!card || card.attempts === 0) continue;
      attempted += 1;
      attempts += card.attempts;
      correct += card.correct;
      const evidence = questionMastery(q, card, now);
      masteryCredit += evidence;
      if (questionIsMastered(q, card, now)) mastered += 1;
      if (effectiveDue(card, now) <= now) due += 1;
      if (card.intervalDays != null) {
        intervalSum += card.intervalDays;
        intervalN += 1;
      }
    }
    const accuracy = attempts > 0 ? correct / attempts : null;
    const masteryRatio = qs.length ? masteryCredit / qs.length : 0;
    const dueRatio = qs.length ? due / qs.length : 0;
    // untouched topics score weak too — an exam doesn't skip them
    const weakness =
      0.5 * (1 - masteryRatio) + 0.3 * (1 - (accuracy ?? 0.5)) + 0.2 * dueRatio;
    out.push({
      topic,
      total: qs.length,
      attempted,
      attempts,
      correct,
      accuracy,
      mastered,
      due,
      avgIntervalDays: intervalN ? intervalSum / intervalN : 0,
      weakness,
    });
  }
  return out;
}

export function weakestTopics(stats: TopicStat[], n = 2): TopicStat[] {
  return [...stats].filter((s) => s.total >= 3).sort((a, b) => b.weakness - a.weakness).slice(0, n);
}

/** Cards coming due per day: index 0 = overdue now, 1..days = that day. */
export function reviewForecast(
  questions: Question[],
  progress: CourseProgress,
  days = 7,
  now = Date.now()
): number[] {
  const DAY = 86_400_000;
  const buckets = new Array<number>(days + 1).fill(0);
  for (const q of questions) {
    const card = progress.cards[q.id];
    if (!card || card.attempts === 0) continue;
    const due = effectiveDue(card, now);
    if (!Number.isFinite(due)) continue;
    if (due <= now) buckets[0] += 1;
    else {
      const d = Math.ceil((due - now) / DAY);
      if (d <= days) buckets[d] += 1;
    }
  }
  return buckets;
}
