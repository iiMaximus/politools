import { useEffect, useState } from "react";
import type { Course, Question } from "../types";
import type { CardState, CourseProgress } from "./progress";
import { MASTERY_THRESHOLD, masteryScore } from "./mastery";

/* ================================================================== *
 *  GAME CORE
 *  One localStorage store for everything that makes studying a game:
 *  daily activity (streak + heatmap), freeze tokens, rust, quests,
 *  achievements, beers, boss victories, account rank and settings.
 *  Deliberately imports NOTHING from progress.ts or the course
 *  registry — callers pass the data in, so there are no import cycles.
 * ================================================================== */

/* ------------------------------ state ----------------------------- */

export interface DayActivity {
  answers: number;
  correct: number;
  xp: number;
  lessons: number;
  polished: number;
  dueCleared: number;
  mixSessions: number;
  earlyBird: boolean; // studied before 07:00
  nightOwl: boolean; // studied after 23:00
  byCourse: Record<string, { answers: number; correct: number }>;
}

export interface BossRecord {
  at: number;
  won: boolean;
  grade: number; // 18..31 (31 = 30 e lode)
  heartsLeft: number;
  accuracy: number; // 0..1
  /** highest hit combo of the fight (absent on old records) */
  bestCombo?: number;
}

export type QuestKind =
  | "answers"
  | "correct-in-course"
  | "clear-due"
  | "polish"
  | "lesson"
  | "mix"
  | "boss"
  | "mock";

export interface QuestInstance {
  id: string;
  kind: QuestKind;
  courseId?: string;
  courseTitle?: string;
  label: string;
  icon: string;
  target: number;
  /** for totals-based metrics: metric value when the quest was generated */
  baseline: number;
  rewardXp: number;
  completedAt?: number;
}

export interface GameTotals {
  answers: number;
  correct: number;
  polished: number;
  dueCleared: number;
  mixSessions: number;
  bossWins: number;
  perfectSessions: number;
  lessons: number;
  questsDone: number;
}

export interface GameSettings {
  focusCourses: string[];
  passedCourses: string[];
  examDates: Record<string, string>;
  sound: boolean;
  /** per-course topic focus (empty/absent = whole course) — Phase 6 */
  focusTopics?: Record<string, string[]>;
}

export interface MockExamRecord {
  at: number;
  grade: number; // 17..31 via gradeFromScore
  pct: number; // 0..1
  byTopic: Record<string, { correct: number; total: number }>;
  durationSec: number;
  questionCount: number;
}

export interface GameState {
  v: number;
  activity: Record<string, DayActivity>;
  frozenDays: string[];
  freezeTokens: number;
  lastFreezeStreak: number; // streak length when the last token was earned
  bonusXp: number;
  beers: number;
  boss: Record<string, BossRecord[]>;
  /** mini-boss victories: courseId → section title → best grade */
  miniBoss: Record<string, Record<string, number>>;
  achievements: Record<string, number>;
  totals: GameTotals;
  quests: { date: string; items: QuestInstance[] };
  settings: GameSettings;
  /** timed mock-exam history per course */
  mockExams: Record<string, MockExamRecord[]>;
  /** beer-shop purchases (cosmetics, boss perks) — Phase 7 */
  unlocks: string[];
  spentBeers: number;
  /** account level at the last rank sync — guards the rank-up toast */
  lastRankLevel?: number;
  /** highest total XP ever observed (via syncRank) */
  peakXp?: number;
  /** fastest perfect Daily Mix (seconds, 10+ cards) */
  fastestPerfectMix?: number;
}

const KEY = "polito:game:v1";

const emptyTotals = (): GameTotals => ({
  answers: 0,
  correct: 0,
  polished: 0,
  dueCleared: 0,
  mixSessions: 0,
  bossWins: 0,
  perfectSessions: 0,
  lessons: 0,
  questsDone: 0,
});

const defaultState = (): GameState => ({
  v: 2,
  activity: {},
  frozenDays: [],
  freezeTokens: 1,
  lastFreezeStreak: 0,
  bonusXp: 0,
  beers: 0,
  boss: {},
  miniBoss: {},
  achievements: {},
  totals: emptyTotals(),
  mockExams: {},
  unlocks: [],
  spentBeers: 0,
  quests: { date: "", items: [] },
  settings: {
    focusCourses: [...DEFAULT_FOCUS],
    passedCourses: [],
    examDates: {},
    sound: true,
  },
});

/** The September 2026 session: MA2 (Sep 9), LAG (Sep 14), Thermo (Sep 16). */
const DEFAULT_FOCUS = ["math-analysis-2", "linear-algebra", "thermodynamics"] as const;
/** previous seasons' defaults — stored settings that still match one of these
 *  were never hand-picked, so they follow the new default */
const STALE_FOCUS_DEFAULTS = [["thermodynamics", "math-analysis-2", "statistics"]];

let cached: GameState | null = null;
const listeners = new Set<() => void>();

function read(): GameState {
  if (cached) return cached;
  let value = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      value = {
        ...value,
        ...parsed,
        totals: { ...emptyTotals(), ...(parsed.totals ?? {}) },
        settings: { ...value.settings, ...(parsed.settings ?? {}) },
        quests: parsed.quests ?? value.quests,
        miniBoss: parsed.miniBoss ?? {},
        mockExams: parsed.mockExams ?? {},
        unlocks: parsed.unlocks ?? [],
        spentBeers: parsed.spentBeers ?? 0,
        v: 2,
      };
      // renamed achievements keep their unlock timestamps
      const renames: [string, string][] = [["sicko-mode", "warp-speed"]];
      for (const [oldId, newId] of renames) {
        if (value.achievements[oldId] != null) {
          value.achievements = { ...value.achievements, [newId]: value.achievements[oldId] };
          delete value.achievements[oldId];
        }
      }
      // stored focus list that still equals an old season's default was
      // never hand-picked — roll it forward to the current session
      const focusKey = [...value.settings.focusCourses].sort().join("|");
      if (STALE_FOCUS_DEFAULTS.some((d) => [...d].sort().join("|") === focusKey)) {
        value.settings = { ...value.settings, focusCourses: [...DEFAULT_FOCUS] };
      }
    }
  } catch {
    /* corrupt storage → fresh start */
  }
  cached = value;
  return value;
}

function write(next: GameState) {
  cached = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable */
  }
  listeners.forEach((fn) => fn());
}

export function readGame(): GameState {
  return read();
}

export function useGame(): GameState {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return read();
}

/* --------------------------- game events -------------------------- */

export type GameEvent =
  | { type: "achievement"; id: string; title: string; icon: string }
  | { type: "quest"; label: string; rewardXp: number }
  | { type: "rank-up"; rank: string; level: number }
  | { type: "freeze-used"; day: string }
  | { type: "freeze-earned" }
  | { type: "beer" }
  | { type: "purchase"; title: string; icon: string };

const eventListeners = new Set<(e: GameEvent) => void>();

export function onGameEvent(fn: (e: GameEvent) => void): () => void {
  eventListeners.add(fn);
  return () => {
    eventListeners.delete(fn);
  };
}

function emit(e: GameEvent) {
  eventListeners.forEach((fn) => fn(e));
}

/* ------------------------------ dates ----------------------------- */

export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  return dayKey(date);
}

export function daysUntil(iso: string | undefined): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/* --------------------------- day activity ------------------------- */

const emptyDay = (): DayActivity => ({
  answers: 0,
  correct: 0,
  xp: 0,
  lessons: 0,
  polished: 0,
  dueCleared: 0,
  mixSessions: 0,
  earlyBird: false,
  nightOwl: false,
  byCourse: {},
});

export function todayActivity(state: GameState = read()): DayActivity {
  return state.activity[dayKey()] ?? emptyDay();
}

/** A day "counts" for the streak with a small but honest amount of study. */
export function dayQualifies(a: DayActivity | undefined): boolean {
  if (!a) return false;
  return a.answers >= 5 || a.lessons >= 1 || a.mixSessions >= 1;
}

/* ------------------------------ streak ---------------------------- */

export interface StreakInfo {
  current: number;
  /** true when today hasn't qualified yet (flame shown "at risk") */
  atRisk: boolean;
  freezeTokens: number;
  best: number;
}

export function streakInfo(state: GameState = read()): StreakInfo {
  const frozen = new Set(state.frozenDays);
  const today = dayKey();
  const todayQ = dayQualifies(state.activity[today]);

  let current = 0;
  let cursor = todayQ ? today : shiftDay(today, -1);
  while (dayQualifies(state.activity[cursor]) || frozen.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  // best streak across history (bounded scan over recorded days)
  const days = Object.keys(state.activity).filter((k) => dayQualifies(state.activity[k]));
  const all = new Set([...days, ...state.frozenDays]);
  let best = current;
  for (const start of all) {
    if (all.has(shiftDay(start, -1))) continue; // not a streak start
    let len = 0;
    let c = start;
    while (all.has(c)) {
      len += 1;
      c = shiftDay(c, 1);
    }
    if (len > best) best = len;
  }

  return { current, atRisk: !todayQ && current > 0, freezeTokens: state.freezeTokens, best };
}

/**
 * Called on load: spend freeze tokens on yesterday's gap (single-day mercy)
 * so a one-day slip doesn't kill the flame while you slept.
 */
export function reconcileFreezes() {
  const state = read();
  const today = dayKey();
  const yesterday = shiftDay(today, -1);
  const dayBefore = shiftDay(today, -2);
  const frozen = new Set(state.frozenDays);
  const missedYesterday =
    !dayQualifies(state.activity[yesterday]) &&
    !frozen.has(yesterday) &&
    (dayQualifies(state.activity[dayBefore]) || frozen.has(dayBefore));
  if (missedYesterday && state.freezeTokens > 0) {
    write({
      ...state,
      freezeTokens: state.freezeTokens - 1,
      frozenDays: [...state.frozenDays, yesterday],
    });
    emit({ type: "freeze-used", day: yesterday });
  }
}

/* ------------------------------- rust ----------------------------- */

/** Days after which a legacy (pre-SRS) mastered card starts to corrode. */
export const RUST_TIERS = [10, 21, 42] as const;
export const RUST_LABELS = ["", "tarnished", "rusty", "corroded"] as const;

/** How far past its SRS due date a mastered card is, in units of its own
 *  interval, decides the rust tier. Legacy cards (no SRS fields yet) fall
 *  back to the original fixed day tiers. */
export function rustLevel(
  card: Pick<CardState, "mastered" | "lastSeen" | "due" | "intervalDays"> | undefined
): 0 | 1 | 2 | 3 {
  if (!card || !card.mastered) return 0;
  if (card.due != null && card.intervalDays != null) {
    const over = (Date.now() - card.due) / (Math.max(1, card.intervalDays) * 86_400_000);
    if (over >= 3) return 3;
    if (over >= 1.5) return 2;
    if (over >= 0.5) return 1;
    return 0;
  }
  if (!card.lastSeen) return 0;
  const days = (Date.now() - card.lastSeen) / 86_400_000;
  if (days >= RUST_TIERS[2]) return 3;
  if (days >= RUST_TIERS[1]) return 2;
  if (days >= RUST_TIERS[0]) return 1;
  return 0;
}

export function rustyCount(questions: Question[], progress: CourseProgress): number {
  return questions.filter((q) => rustLevel(progress.cards[q.id]) > 0).length;
}

/* ---------------------------- readiness ---------------------------- */

export interface Readiness {
  /** 0..100 */
  score: number;
  /** projected grade: null = not enough signal, 17 = below pass, 31 = 30 e lode */
  grade: number | null;
  gradeLabel: string;
  rusty: number;
  due: number;
  daysLeft: number | null;
}

const RUST_CREDIT = [1, 0.65, 0.4, 0.2] as const;

/** One grading law for readiness, boss fights and mock exams:
 *  score 0..100 → 17 (below pass) .. 31 (30 e lode). */
export function gradeFromScore(score: number): number {
  return score < 35 ? 17 : Math.min(31, Math.round(18 + ((score - 35) / 65) * 13));
}

/** Best mock grade for a course within the last `days` days. */
export function bestRecentMock(courseId: string, days: number, state: GameState = read()): MockExamRecord | null {
  const cutoff = Date.now() - days * 86_400_000;
  const recent = (state.mockExams[courseId] ?? []).filter((r) => r.at >= cutoff);
  if (!recent.length) return null;
  return recent.reduce((a, b) => (b.grade > a.grade ? b : a));
}

export function readiness(course: Course, progress: CourseProgress, state: GameState = read()): Readiness {
  const qs = course.practice;
  const total = qs.length;
  let masteryCredit = 0;
  let due = 0;
  let rusty = 0;
  for (const q of qs) {
    const card = progress.cards[q.id];
    if (!card || card.attempts === 0) continue;
    const evidence = masteryScore(card, q.difficulty);
    const r = rustLevel(card);
    if (evidence >= MASTERY_THRESHOLD && r > 0) rusty += 1;
    // The richer score already includes recent accuracy, spacing and recency;
    // rust credit remains as a small extra guard for legacy cards.
    masteryCredit += evidence * RUST_CREDIT[r];
    if ((card.due ?? Number.POSITIVE_INFINITY) <= Date.now()) due += 1;
  }
  const mastery = total ? masteryCredit / total : 0;
  const lessons = course.lessons.length
    ? course.lessons.filter((l) => progress.lessons[l.id]?.completed).length / course.lessons.length
    : 0;
  const exams = course.exam.length
    ? course.exam.filter((e) => progress.exams[e.id]?.solved).length / course.exam.length
    : 0;
  const duePenalty = total ? due / total : 0;

  // a recent timed mock is the strongest signal there is
  const recentMock = bestRecentMock(course.meta.id, 21, state);
  const mock = recentMock ? recentMock.pct : 0;

  const raw =
    0.5 * mastery + 0.15 * lessons + 0.2 * exams + 0.15 * mock - 0.12 * duePenalty;
  const score = Math.round(Math.max(0, Math.min(1, raw)) * 100);

  const attempted = qs.some((q) => (progress.cards[q.id]?.attempts ?? 0) > 0);
  let grade: number | null = null;
  if (attempted || lessons > 0) {
    grade = gradeFromScore(score);
  }
  const gradeLabel =
    grade === null ? "—" : grade < 18 ? "<18" : grade >= 31 ? "30L" : String(grade);

  const examDate = state.settings.examDates[course.meta.id] ?? course.meta.examDate;
  return { score, grade, gradeLabel, rusty, due, daysLeft: daysUntil(examDate) };
}

/* --------------------------- account rank -------------------------- */

export const RANKS = [
  "Matricola",
  "Studente",
  "Sgobbone",
  "Secchione",
  "Tutor",
  "Laureando",
  "Ingegnere",
  "Ricercatore",
  "Professore",
  "Rettore",
] as const;

/** Cumulative XP needed to *reach* level n (level 1 = 0 XP). */
function cumXp(level: number): number {
  // 150, 350, 600, 900, 1250, ... (arithmetic growth)
  return 25 * (level - 1) * (level + 4);
}

export interface RankInfo {
  level: number;
  rank: string;
  into: number;
  needed: number;
  pct: number;
}

export function rankFromXp(totalXp: number): RankInfo {
  let level = 1;
  while (cumXp(level + 1) <= totalXp) level += 1;
  const base = cumXp(level);
  const next = cumXp(level + 1);
  const into = totalXp - base;
  const needed = next - base;
  const rank = RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))];
  return { level, rank, into, needed, pct: Math.round((into / needed) * 100) };
}

/** Called wherever total XP is summed (hub/stats). Records the peak and,
 *  on crossing a level boundary, fires the rank-up toast — exactly once.
 *  The first-ever sync only records a baseline (no retroactive toast). */
export function syncRank(totalXp: number) {
  const state = read();
  const { level, rank } = rankFromXp(totalXp);
  const prevLevel = state.lastRankLevel ?? 0;
  const peakXp = Math.max(state.peakXp ?? 0, totalXp);
  if (level === prevLevel && peakXp === (state.peakXp ?? 0)) return;
  if (level > prevLevel && prevLevel > 0) emit({ type: "rank-up", rank, level });
  afterMutation({ ...state, lastRankLevel: level, peakXp }); // peakXp achievements unlock here
}

/* ------------------------------ quests ----------------------------- */

export interface QuestContext {
  /** focus courses with live numbers, computed by the caller from the registry */
  courses: { id: string; title: string; due: number; rusty: number; hasLessonsLeft: boolean }[];
}

function pickDaily(seedStr: string, n: number): number {
  // deterministic tiny hash → stable quest picks for the whole day
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % n;
}

export function ensureQuests(ctx: QuestContext): QuestInstance[] {
  const state = read();
  const today = dayKey();
  if (state.quests.date === today && state.quests.items.length) return state.quests.items;

  const items: QuestInstance[] = [];
  const t = state.totals;

  // 1 — always: a volume quest (keeps the flame alive)
  items.push({
    id: `${today}-answers`,
    kind: "answers",
    label: "Answer 15 questions",
    icon: "Zap",
    target: 15,
    baseline: 0,
    rewardXp: 25,
  });

  // 2 — the most urgent maintenance quest available
  const withDue = [...ctx.courses].sort((a, b) => b.due - a.due)[0];
  const withRust = [...ctx.courses].sort((a, b) => b.rusty - a.rusty)[0];
  if (withDue && withDue.due > 0) {
    items.push({
      id: `${today}-due`,
      kind: "clear-due",
      courseId: withDue.id,
      courseTitle: withDue.title,
      label: `Clear ${Math.min(withDue.due, 8)} due reviews in ${withDue.title}`,
      icon: "RotateCcw",
      target: Math.min(withDue.due, 8),
      baseline: t.dueCleared,
      rewardXp: 35,
    });
  } else if (withRust && withRust.rusty > 0) {
    items.push({
      id: `${today}-polish`,
      kind: "polish",
      courseId: withRust.id,
      courseTitle: withRust.title,
      label: `Polish ${Math.min(withRust.rusty, 6)} rusty cards`,
      icon: "Sparkles",
      target: Math.min(withRust.rusty, 6),
      baseline: t.polished,
      rewardXp: 35,
    });
  } else {
    items.push({
      id: `${today}-mix`,
      kind: "mix",
      label: "Finish a Daily Mix",
      icon: "Shuffle",
      target: 1,
      baseline: t.mixSessions,
      rewardXp: 30,
    });
  }

  // 3 — rotating flavor quest, deterministic per day
  const flavors: QuestInstance[] = [];
  const lessonCourse = ctx.courses.find((c) => c.hasLessonsLeft);
  if (lessonCourse) {
    flavors.push({
      id: `${today}-lesson`,
      kind: "lesson",
      courseId: lessonCourse.id,
      courseTitle: lessonCourse.title,
      label: `Complete a lesson in ${lessonCourse.title}`,
      icon: "BookOpen",
      target: 1,
      baseline: t.lessons,
      rewardXp: 30,
    });
  }
  const focus = ctx.courses[pickDaily(today, Math.max(1, ctx.courses.length))];
  if (focus) {
    flavors.push({
      id: `${today}-course-correct`,
      kind: "correct-in-course",
      courseId: focus.id,
      courseTitle: focus.title,
      label: `Get 8 correct in ${focus.title}`,
      icon: "Target",
      target: 8,
      baseline: 0,
      rewardXp: 30,
    });
  }
  flavors.push({
    id: `${today}-boss`,
    kind: "boss",
    label: "Win a boss fight",
    icon: "Swords",
    target: 1,
    baseline: t.bossWins,
    rewardXp: 50,
  });
  if (!items.some((i) => i.kind === "mix")) {
    flavors.push({
      id: `${today}-mix`,
      kind: "mix",
      label: "Finish a Daily Mix",
      icon: "Shuffle",
      target: 1,
      baseline: t.mixSessions,
      rewardXp: 30,
    });
  }
  items.push(flavors[pickDaily(`${today}:flavor`, flavors.length)]);

  write({ ...state, quests: { date: today, items } });
  return items;
}

function mockCount(state: GameState): number {
  return Object.values(state.mockExams).reduce((n, rs) => n + rs.length, 0);
}

export function questProgress(q: QuestInstance, state: GameState = read()): number {
  const day = todayActivity(state);
  const t = state.totals;
  let value = 0;
  switch (q.kind) {
    case "answers":
      value = day.answers;
      break;
    case "correct-in-course":
      value = q.courseId ? day.byCourse[q.courseId]?.correct ?? 0 : 0;
      break;
    case "clear-due":
      value = t.dueCleared - q.baseline;
      break;
    case "polish":
      value = t.polished - q.baseline;
      break;
    case "lesson":
      value = t.lessons - q.baseline;
      break;
    case "mix":
      value = t.mixSessions - q.baseline;
      break;
    case "boss":
      value = t.bossWins - q.baseline;
      break;
    case "mock":
      value = mockCount(state) - q.baseline;
      break;
  }
  return Math.max(0, Math.min(q.target, value));
}

function evaluateQuests(state: GameState): GameState {
  if (state.quests.date !== dayKey()) return state;
  let changed = false;
  let bonus = 0;
  let done = 0;
  const items = state.quests.items.map((q) => {
    if (q.completedAt) return q;
    if (questProgress(q, state) >= q.target) {
      changed = true;
      bonus += q.rewardXp;
      done += 1;
      emit({ type: "quest", label: q.label, rewardXp: q.rewardXp });
      return { ...q, completedAt: Date.now() };
    }
    return q;
  });
  if (!changed) return state;
  return {
    ...state,
    quests: { ...state.quests, items },
    bonusXp: state.bonusXp + bonus,
    totals: { ...state.totals, questsDone: state.totals.questsDone + done },
  };
}

/* --------------------------- achievements -------------------------- */

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  check: (s: GameState) => boolean;
}

const allBossRecords = (s: GameState): BossRecord[] => Object.values(s.boss).flat();

/** a win in some course that came after ≥5 losses in that same course */
function wonAfterLosses(s: GameState, losses: number): boolean {
  return Object.values(s.boss).some((records) => {
    let lost = 0;
    for (const r of records) {
      if (r.won && lost >= losses) return true;
      if (!r.won) lost += 1;
    }
    return false;
  });
}

/** a later win in some course that beats an earlier win's grade */
function beatOwnGrade(s: GameState): boolean {
  return Object.values(s.boss).some((records) => {
    let best = -1;
    for (const r of records) {
      if (!r.won) continue;
      if (best >= 0 && r.grade > best) return true;
      best = Math.max(best, r.grade);
    }
    return false;
  });
}

/** a qualifying study day after a gap of 3+ empty days */
function returnedAfterBreak(s: GameState): boolean {
  const days = Object.keys(s.activity)
    .filter((k) => dayQualifies(s.activity[k]))
    .sort();
  for (let i = 1; i < days.length; i++) {
    const [y1, m1, d1] = days[i - 1].split("-").map(Number);
    const [y2, m2, d2] = days[i].split("-").map(Number);
    const gap = (new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86_400_000;
    if (gap >= 4) return true; // 3+ full days of grass between sessions
  }
  return false;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-blood", title: "First Blood", desc: "Answer your first question correctly.", icon: "Swords", check: (s) => s.totals.correct >= 1 },
  { id: "prima-fiamma", title: "Prima Fiamma", desc: "Reach a 3-day study streak.", icon: "Flame", check: (s) => streakInfo(s).current >= 3 },
  { id: "settimana-perfetta", title: "Settimana Perfetta", desc: "Reach a 7-day study streak.", icon: "CalendarCheck", check: (s) => streakInfo(s).current >= 7 },
  { id: "perpetuum-mobile", title: "Perpetuum Mobile", desc: "Reach a 30-day study streak — a violation of thermodynamics.", icon: "Infinity", check: (s) => streakInfo(s).current >= 30 },
  { id: "centurion", title: "Centurione", desc: "100 correct answers, total.", icon: "Shield", check: (s) => s.totals.correct >= 100 },
  { id: "macchina", title: "La Macchina", desc: "500 correct answers, total.", icon: "Cog", check: (s) => s.totals.correct >= 500 },
  { id: "millennial", title: "Mille e Non Più Mille", desc: "1000 correct answers, total.", icon: "Crown", check: (s) => s.totals.correct >= 1000 },
  { id: "entropy-slayer", title: "Entropy Slayer", desc: "Clear 50 due reviews.", icon: "RotateCcw", check: (s) => s.totals.dueCleared >= 50 },
  { id: "restauratore", title: "Il Restauratore", desc: "Polish 25 rusty cards back to shine.", icon: "Sparkles", check: (s) => s.totals.polished >= 25 },
  { id: "mixologo", title: "Mixologo", desc: "Finish 10 Daily Mixes.", icon: "Shuffle", check: (s) => s.totals.mixSessions >= 10 },
  { id: "boss-slayer", title: "Boss Slayer", desc: "Win your first boss fight.", icon: "Trophy", check: (s) => s.totals.bossWins >= 1 },
  { id: "farmer", title: "Boss Farmer", desc: "Win 5 boss fights.", icon: "Axe", check: (s) => s.totals.bossWins >= 5 },
  { id: "flawless", title: "Flawless", desc: "A perfect session of 10+ questions.", icon: "Gem", check: (s) => s.totals.perfectSessions >= 1 },
  { id: "notte-prima", title: "Notte Prima Degli Esami", desc: "100+ answers in a single day.", icon: "MoonStar", check: (s) => Object.values(s.activity).some((a) => a.answers >= 100) },
  { id: "allodola", title: "L'Allodola", desc: "Study before 07:00.", icon: "Sunrise", check: (s) => Object.values(s.activity).some((a) => a.earlyBird) },
  { id: "gufo", title: "Il Gufo", desc: "Study after 23:00.", icon: "Moon", check: (s) => Object.values(s.activity).some((a) => a.nightOwl) },
  { id: "questaiolo", title: "Questaiolo", desc: "Complete 25 daily quests.", icon: "ScrollText", check: (s) => s.totals.questsDone >= 25 },
  { id: "collezionista", title: "Il Collezionista", desc: "Unlock 12 achievements.", icon: "Medal", check: (s) => Object.keys(s.achievements).length >= 12 },
  // ---- the pop-culture wing ----
  { id: "how-did-we-get-here", title: "How Did We Get Here?", desc: "Study 5 different courses in a single day. Speedrunning the whole degree.", icon: "Blocks", check: (s) => Object.values(s.activity).some((a) => Object.keys(a.byCourse).length >= 5) },
  { id: "over-9000", title: "It's Over 9000!", desc: "Break 9000 total XP. The scouter did not survive.", icon: "Zap", check: (s) => (s.peakXp ?? 0) >= 9000 },
  { id: "you-died", title: "YOU DIED", desc: "Lose 5 boss fights. The bonfire is lit — rest, then try again.", icon: "Skull", check: (s) => allBossRecords(s).filter((r) => !r.won).length >= 5 },
  { id: "git-gud", title: "Git Gud", desc: "Beat a boss you had already lost to five times. Hesitation is defeat.", icon: "Swords", check: (s) => wonAfterLosses(s, 5) },
  { id: "still-alive", title: "Still Alive", desc: "Beat a final boss with exactly one heart left. This was a triumph.", icon: "HeartPulse", check: (s) => allBossRecords(s).some((r) => r.won && r.heartsLeft === 1) },
  { id: "new-game-plus", title: "New Game+", desc: "Rematch a beaten boss and top your previous grade.", icon: "Gamepad2", check: beatOwnGrade },
  { id: "speedrun", title: "Speedrun any%", desc: "Perfect Daily Mix (10+ cards) in under 3 minutes. World-record pace.", icon: "Timer", check: (s) => (s.fastestPerfectMix ?? Infinity) <= 180 },
  { id: "99-problems", title: "99 Problems", desc: "Clear 99 due reviews, total. A card ain't one.", icon: "ListChecks", check: (s) => s.totals.dueCleared >= 99 },
  { id: "mob-grinder", title: "Mob Grinder", desc: "Answer 500 questions, total. A fully automated XP farm.", icon: "Hammer", check: (s) => s.totals.answers >= 500 },
  { id: "warp-speed", title: "Warp Speed", desc: "50 correct answers in a single day. Engage.", icon: "Rocket", check: (s) => Object.values(s.activity).some((a) => a.correct >= 50) },
  { id: "touch-grass", title: "Touch Grass", desc: "Return after 3+ days away. The grass was touched. Welcome back.", icon: "Sprout", check: returnedAfterBreak },
  { id: "hollow-knight", title: "Hollow Knight", desc: "Defeat the final boss of 5 different courses.", icon: "Ghost", check: (s) => Object.entries(s.boss).filter(([, rs]) => rs.some((r) => r.won)).length >= 5 },
  { id: "cake-is-a-lie", title: "The Cake Is a Lie", desc: "Three perfect sessions. The cake remains theoretical.", icon: "Cake", check: (s) => s.totals.perfectSessions >= 3 },
  { id: "combo-breaker", title: "C-C-C-Combo Breaker!", desc: "Hit a ×10 combo in a boss fight.", icon: "Activity", check: (s) => allBossRecords(s).some((r) => (r.bestCombo ?? 0) >= 10) },
  { id: "leeroy", title: "Leeroy Jenkins", desc: "Win a boss fight with under 70% accuracy. At least you have chicken.", icon: "Megaphone", check: (s) => allBossRecords(s).some((r) => r.won && r.accuracy < 0.7) },
  { id: "all-your-base", title: "All Your Base", desc: "Score 28+ against three different final bosses. All your base are belong to you.", icon: "Castle", check: (s) => Object.entries(s.boss).filter(([, rs]) => rs.some((r) => r.won && r.grade >= 28)).length >= 3 },
  { id: "simulazione", title: "Simulazione", desc: "Take your first timed mock exam.", icon: "FileCheck", check: (s) => mockCount(s) >= 1 },
  { id: "prova-generale", title: "Prova Generale", desc: "Score 27+ on a mock exam. The real thing should be scared.", icon: "GraduationCap", check: (s) => Object.values(s.mockExams).some((rs) => rs.some((r) => r.grade >= 27)) },
  { id: "trenta-lode-casa", title: "Trenta e Lode (in casa)", desc: "A perfect 30 e lode on a mock exam.", icon: "Crown", check: (s) => Object.values(s.mockExams).some((rs) => rs.some((r) => r.grade >= 31)) },
  { id: "one-more-turn", title: "One More Turn", desc: "Study past 23:00 and before 07:00 within the same day. A true Civilization moment.", icon: "Hourglass", check: (s) => Object.values(s.activity).some((a) => a.earlyBird && a.nightOwl) },
  { id: "take-my-beers", title: "Shut Up and Take My Beers", desc: "Spend 5 beers at La Birreria.", icon: "Beer", check: (s) => s.spentBeers >= 5 },
  { id: "appello-infinito", title: "Appello Infinito", desc: "Sit 5 mock exams. The real appello holds no surprises.", icon: "FileCheck", check: (s) => mockCount(s) >= 5 },
  { id: "ultra-combo", title: "ULTRA COMBO", desc: "Chain a ×15 combo in a boss fight. The announcer loses it.", icon: "Zap", check: (s) => allBossRecords(s).some((r) => (r.bestCombo ?? 0) >= 15) },
  { id: "flawless-victory", title: "Flawless Victory", desc: "30 e lode against a final boss — perfect accuracy, all hearts.", icon: "Gem", check: (s) => allBossRecords(s).some((r) => r.won && r.grade >= 31) },
  { id: "first-try", title: "First Try!", desc: "Defeat a final boss on your very first attempt in that course.", icon: "Timer", check: (s) => Object.values(s.boss).some((rs) => rs.length >= 1 && rs[0].won) },
  { id: "world-tour", title: "World Tour", desc: "Study in 7 different courses, ever. See the whole map.", icon: "Compass", check: (s) => { const set = new Set<string>(); for (const a of Object.values(s.activity)) for (const id of Object.keys(a.byCourse)) set.add(id); return set.size >= 7; } },
  { id: "l33t", title: "1337", desc: "Reach 1337 total XP. Elite.", icon: "Gamepad2", check: (s) => (s.peakXp ?? 0) >= 1337 },
  { id: "cento-quest", title: "Questmaster 100", desc: "Complete 100 daily quests.", icon: "ScrollText", check: (s) => s.totals.questsDone >= 100 },
  { id: "konami", title: "The Konami Code", desc: "↑ ↑ ↓ ↓ ← → ← → B A — some knowledge predates the syllabus. (+100 XP)", icon: "Gamepad2", check: (s) => s.unlocks.includes("konami-code") },
  { id: "dangerous-alone", title: "It's Dangerous to Go Alone!", desc: "Take this. Read your first lesson.", icon: "Swords", check: (s) => s.totals.lessons >= 1 },
  { id: "study-club", title: "First Rule of Study Club", desc: "You do not talk about Study Club. You show up — 10 days in a row.", icon: "Users", check: (s) => streakInfo(s).current >= 10 },
  { id: "the-force", title: "The Force Is Strong With This One", desc: "Win a boss fight with 90%+ accuracy.", icon: "Star", check: (s) => allBossRecords(s).some((r) => r.won && r.accuracy >= 0.9) },
  { id: "do-or-do-not", title: "Do or Do Not", desc: "There is no try: complete all three daily quests in one day.", icon: "Target", check: (s) => s.quests.date === dayKey() && s.quests.items.length >= 3 && s.quests.items.every((q) => !!q.completedAt) },
  { id: "make-it-so", title: "Make It So", desc: "Complete 50 daily quests. The bridge is yours, Number One.", icon: "Compass", check: (s) => s.totals.questsDone >= 50 },
  { id: "say-my-name", title: "Say My Name", desc: "Reach the rank of Rettore. You're the one who knocks — on the rector's door.", icon: "Crown", check: (s) => (s.peakXp ?? 0) >= 21600 },
];

function evaluateAchievements(state: GameState): GameState {
  let changed = false;
  const unlocked = { ...state.achievements };
  // two passes so meta-achievements (collezionista) can see this round's unlocks
  for (let pass = 0; pass < 2; pass++) {
    const probe: GameState = { ...state, achievements: unlocked };
    for (const a of ACHIEVEMENTS) {
      if (!unlocked[a.id] && a.check(probe)) {
        unlocked[a.id] = Date.now();
        changed = true;
        emit({ type: "achievement", id: a.id, title: a.title, icon: a.icon });
      }
    }
  }
  return changed ? { ...state, achievements: unlocked } : state;
}

/* ------------------------- mutation logging ------------------------ */

function withDay(state: GameState, fn: (d: DayActivity) => DayActivity): GameState {
  const key = dayKey();
  const day = state.activity[key] ?? emptyDay();
  return { ...state, activity: { ...state.activity, [key]: fn(day) } };
}

function afterMutation(state: GameState): void {
  let next = evaluateQuests(state);

  // earn a freeze token every 7 streak days (hold at most 2)
  const streak = streakInfo(next).current;
  if (streak > 0 && streak % 7 === 0 && next.lastFreezeStreak !== streak && next.freezeTokens < 2) {
    next = { ...next, freezeTokens: next.freezeTokens + 1, lastFreezeStreak: streak };
    emit({ type: "freeze-earned" });
  }

  next = evaluateAchievements(next);
  write(next);
}

export interface AnswerLog {
  courseId: string;
  isCorrect: boolean;
  xp: number;
  wasDue: boolean;
  wasRusty: boolean;
  /** self-graded recall (Scroll "Known"/"Again") — counts toward the day's
   *  activity and streak, but never toward accuracy-based quests/totals */
  selfRated?: boolean;
}

export function logAnswer({ courseId, isCorrect, xp, wasDue, wasRusty, selfRated }: AnswerLog) {
  const hour = new Date().getHours();
  const scored = !selfRated; // honest accuracy signals only
  let state = withDay(read(), (d) => ({
    ...d,
    answers: d.answers + 1,
    correct: d.correct + (scored && isCorrect ? 1 : 0),
    xp: d.xp + xp,
    polished: d.polished + (scored && isCorrect && wasRusty ? 1 : 0),
    dueCleared: d.dueCleared + (scored && isCorrect && wasDue ? 1 : 0),
    earlyBird: d.earlyBird || hour < 7,
    nightOwl: d.nightOwl || hour >= 23,
    byCourse: {
      ...d.byCourse,
      [courseId]: {
        answers: (d.byCourse[courseId]?.answers ?? 0) + 1,
        correct: (d.byCourse[courseId]?.correct ?? 0) + (scored && isCorrect ? 1 : 0),
      },
    },
  }));
  state = {
    ...state,
    totals: {
      ...state.totals,
      answers: state.totals.answers + 1,
      correct: state.totals.correct + (scored && isCorrect ? 1 : 0),
      polished: state.totals.polished + (scored && isCorrect && wasRusty ? 1 : 0),
      dueCleared: state.totals.dueCleared + (scored && isCorrect && wasDue ? 1 : 0),
    },
  };
  afterMutation(state);
}

export function logLessonCompleted() {
  let state = withDay(read(), (d) => ({ ...d, lessons: d.lessons + 1 }));
  state = { ...state, totals: { ...state.totals, lessons: state.totals.lessons + 1 } };
  afterMutation(state);
}

export function logMixSession(perfect: boolean, questionCount: number, durationSec?: number) {
  let state = withDay(read(), (d) => ({ ...d, mixSessions: d.mixSessions + 1 }));
  const countsPerfect = perfect && questionCount >= 10;
  state = {
    ...state,
    totals: {
      ...state.totals,
      mixSessions: state.totals.mixSessions + 1,
      perfectSessions: state.totals.perfectSessions + (countsPerfect ? 1 : 0),
    },
  };
  if (countsPerfect && durationSec != null) {
    state = {
      ...state,
      fastestPerfectMix: Math.min(state.fastestPerfectMix ?? Infinity, Math.round(durationSec)),
    };
  }
  afterMutation(state);
}

export function logBossResult(courseId: string, rec: BossRecord) {
  let state = read();
  state = {
    ...state,
    boss: { ...state.boss, [courseId]: [...(state.boss[courseId] ?? []), rec] },
  };
  if (rec.won) {
    state = {
      ...state,
      beers: state.beers + 1,
      bonusXp: state.bonusXp + 60,
      totals: { ...state.totals, bossWins: state.totals.bossWins + 1 },
    };
    emit({ type: "beer" });
  }
  afterMutation(state);
}

export function logMockExam(courseId: string, rec: MockExamRecord) {
  const state = read();
  afterMutation({
    ...state,
    mockExams: { ...state.mockExams, [courseId]: [...(state.mockExams[courseId] ?? []), rec] },
    bonusXp: state.bonusXp + 50,
  });
}

export function logMiniBossResult(courseId: string, section: string, won: boolean, grade: number) {
  if (!won) return;
  const state = read();
  const forCourse = state.miniBoss[courseId] ?? {};
  const best = Math.max(forCourse[section] ?? 0, grade);
  afterMutation({
    ...state,
    miniBoss: { ...state.miniBoss, [courseId]: { ...forCourse, [section]: best } },
    bonusXp: state.bonusXp + 25,
  });
}

export function miniBossGrade(courseId: string, section: string, state: GameState = read()): number | null {
  return state.miniBoss[courseId]?.[section] ?? null;
}

/* ----------------------------- beer shop --------------------------- */

export interface ShopItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  cost: number;
  kind: "freeze" | "boss-heart" | "cosmetic" | "repair" | "xp" | "double-mix";
}

/** consumables sit in `unlocks` until something eats them */
export const CONSUMABLE_KINDS: ShopItem["kind"][] = ["boss-heart", "double-mix"];

export const SHOP: ShopItem[] = [
  { id: "xp-potion", title: "XP potion", desc: "Chug for +100 XP, instantly. Tastes like graduation.", icon: "Zap", cost: 1, kind: "xp" },
  { id: "boss-heart", title: "Boss retry heart", desc: "+1 heart in your next boss fight. Liquid courage.", icon: "Heart", cost: 1, kind: "boss-heart" },
  { id: "double-mix", title: "Double-XP Mix", desc: "Your next Daily Mix pays double combo XP + a finish bonus.", icon: "Shuffle", cost: 2, kind: "double-mix" },
  { id: "freeze-token", title: "Extra freeze token", desc: "One more day of streak insurance — can exceed the usual cap of 2.", icon: "Snowflake", cost: 2, kind: "freeze" },
  { id: "streak-repair", title: "Streak repair kit", desc: "Retroactively patches up to 3 missed days and reconnects your flame.", icon: "Flame", cost: 3, kind: "repair" },
  { id: "avatar-invader", title: "Invader avatar", desc: "Swap the graduation cap for a space invader. Permanent drip.", icon: "Gamepad2", cost: 2, kind: "cosmetic" },
  { id: "skin-gold", title: "Golden confetti", desc: "Every celebration rains gold. Permanent. Pure class.", icon: "Sparkles", cost: 3, kind: "cosmetic" },
];

/** is there a recent gap (≤3 days) the repair kit could patch? */
export function streakRepairable(state: GameState = read()): boolean {
  const frozen = new Set(state.frozenDays);
  let cursor = shiftDay(dayKey(), -1);
  let gap = 0;
  while (gap < 3 && !dayQualifies(state.activity[cursor]) && !frozen.has(cursor)) {
    gap += 1;
    cursor = shiftDay(cursor, -1);
  }
  return gap > 0 && gap <= 3 && (dayQualifies(state.activity[cursor]) || frozen.has(cursor));
}

export function availableBeers(state: GameState = read()): number {
  return Math.max(0, state.beers - state.spentBeers);
}

export function buyShopItem(id: string): "ok" | "poor" | "owned" | "nothing" {
  const item = SHOP.find((i) => i.id === id);
  if (!item) return "poor";
  const state = read();
  if (item.kind === "cosmetic" && state.unlocks.includes(id)) return "owned";
  if (availableBeers(state) < item.cost) return "poor";
  let next: GameState = { ...state, spentBeers: state.spentBeers + item.cost };
  if (item.kind === "freeze") {
    next = { ...next, freezeTokens: next.freezeTokens + 1 };
  } else if (item.kind === "xp") {
    next = { ...next, bonusXp: next.bonusXp + 100 };
  } else if (item.kind === "repair") {
    if (!streakRepairable(state)) return "nothing"; // no charge — nothing to fix
    const frozen = new Set(state.frozenDays);
    const patched: string[] = [];
    let cursor = shiftDay(dayKey(), -1);
    while (patched.length < 3 && !dayQualifies(state.activity[cursor]) && !frozen.has(cursor)) {
      patched.push(cursor);
      cursor = shiftDay(cursor, -1);
    }
    next = { ...next, frozenDays: [...next.frozenDays, ...patched] };
  } else {
    next = { ...next, unlocks: [...next.unlocks, id] };
  }
  // achievements (e.g. big spender) can unlock on a purchase
  afterMutation(next);
  emit({ type: "purchase", title: item.title, icon: item.icon });
  return "ok";
}

/** One-shot named flag (easter eggs): lands in `unlocks`, optional XP. */
export function unlockFlag(id: string, xp = 0): boolean {
  const state = read();
  if (state.unlocks.includes(id)) return false;
  afterMutation({ ...state, unlocks: [...state.unlocks, id], bonusXp: state.bonusXp + xp });
  return true;
}

/** Consume a one-shot unlock (e.g. the boss retry heart). */
export function consumeUnlock(id: string): boolean {
  const state = read();
  const idx = state.unlocks.indexOf(id);
  if (idx < 0) return false;
  const unlocks = [...state.unlocks];
  unlocks.splice(idx, 1);
  write({ ...state, unlocks });
  return true;
}

export function addBonusXp(amount: number) {
  const state = read();
  write({ ...state, bonusXp: state.bonusXp + amount });
}

/** Wipe one course's game-side history (boss fights, mini-bosses, mocks). */
export function resetCourseGame(courseId: string) {
  const state = read();
  const boss = { ...state.boss };
  const miniBoss = { ...state.miniBoss };
  const mockExams = { ...state.mockExams };
  delete boss[courseId];
  delete miniBoss[courseId];
  delete mockExams[courseId];
  write({ ...state, boss, miniBoss, mockExams });
}

export function updateSettings(patch: Partial<GameSettings>) {
  const state = read();
  write({ ...state, settings: { ...state.settings, ...patch } });
}

export function bestBossGrade(courseId: string, state: GameState = read()): BossRecord | null {
  const runs = (state.boss[courseId] ?? []).filter((r) => r.won);
  if (!runs.length) return null;
  return runs.reduce((a, b) => (b.grade > a.grade ? b : a));
}
