import { useEffect, useState } from "react";
import type { Course, Question } from "../types";
import type { CardState, CourseProgress } from "./progress";

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
}

export type QuestKind =
  | "answers"
  | "correct-in-course"
  | "clear-due"
  | "polish"
  | "lesson"
  | "mix"
  | "boss";

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
}

export interface GameState {
  v: 1;
  activity: Record<string, DayActivity>;
  frozenDays: string[];
  freezeTokens: number;
  lastFreezeStreak: number; // streak length when the last token was earned
  bonusXp: number;
  beers: number;
  boss: Record<string, BossRecord[]>;
  achievements: Record<string, number>;
  totals: GameTotals;
  quests: { date: string; items: QuestInstance[] };
  settings: GameSettings;
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
  v: 1,
  activity: {},
  frozenDays: [],
  freezeTokens: 1,
  lastFreezeStreak: 0,
  bonusXp: 0,
  beers: 0,
  boss: {},
  achievements: {},
  totals: emptyTotals(),
  quests: { date: "", items: [] },
  settings: {
    focusCourses: ["thermodynamics", "math-analysis-2", "statistics"],
    passedCourses: [],
    examDates: {},
    sound: true,
  },
});

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
      };
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
  | { type: "beer" };

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

/** Days after which a mastered card starts to corrode. */
export const RUST_TIERS = [10, 21, 42] as const;
export const RUST_LABELS = ["", "tarnished", "rusty", "corroded"] as const;

export function rustLevel(card: Pick<CardState, "mastered" | "lastSeen"> | undefined): 0 | 1 | 2 | 3 {
  if (!card || !card.mastered || !card.lastSeen) return 0;
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

export function readiness(course: Course, progress: CourseProgress, state: GameState = read()): Readiness {
  const qs = course.practice;
  const total = qs.length;
  let masteryCredit = 0;
  let due = 0;
  let rusty = 0;
  for (const q of qs) {
    const card = progress.cards[q.id];
    if (card?.mastered) {
      const r = rustLevel(card);
      if (r > 0) rusty += 1;
      masteryCredit += RUST_CREDIT[r];
    } else if (card && card.wrong > 0) {
      due += 1;
    }
  }
  const mastery = total ? masteryCredit / total : 0;
  const lessons = course.lessons.length
    ? course.lessons.filter((l) => progress.lessons[l.id]?.completed).length / course.lessons.length
    : 0;
  const exams = course.exam.length
    ? course.exam.filter((e) => progress.exams[e.id]?.solved).length / course.exam.length
    : 0;
  const duePenalty = total ? due / total : 0;

  const raw = 0.55 * mastery + 0.2 * lessons + 0.25 * exams - 0.12 * duePenalty;
  const score = Math.round(Math.max(0, Math.min(1, raw)) * 100);

  const attempted = qs.some((q) => (progress.cards[q.id]?.attempts ?? 0) > 0);
  let grade: number | null = null;
  if (attempted || lessons > 0) {
    grade = score < 35 ? 17 : Math.min(31, Math.round(18 + ((score - 35) / 65) * 13));
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
}

export function logAnswer({ courseId, isCorrect, xp, wasDue, wasRusty }: AnswerLog) {
  const hour = new Date().getHours();
  let state = withDay(read(), (d) => ({
    ...d,
    answers: d.answers + 1,
    correct: d.correct + (isCorrect ? 1 : 0),
    xp: d.xp + xp,
    polished: d.polished + (isCorrect && wasRusty ? 1 : 0),
    dueCleared: d.dueCleared + (isCorrect && wasDue ? 1 : 0),
    earlyBird: d.earlyBird || hour < 7,
    nightOwl: d.nightOwl || hour >= 23,
    byCourse: {
      ...d.byCourse,
      [courseId]: {
        answers: (d.byCourse[courseId]?.answers ?? 0) + 1,
        correct: (d.byCourse[courseId]?.correct ?? 0) + (isCorrect ? 1 : 0),
      },
    },
  }));
  state = {
    ...state,
    totals: {
      ...state.totals,
      answers: state.totals.answers + 1,
      correct: state.totals.correct + (isCorrect ? 1 : 0),
      polished: state.totals.polished + (isCorrect && wasRusty ? 1 : 0),
      dueCleared: state.totals.dueCleared + (isCorrect && wasDue ? 1 : 0),
    },
  };
  afterMutation(state);
}

export function logLessonCompleted() {
  let state = withDay(read(), (d) => ({ ...d, lessons: d.lessons + 1 }));
  state = { ...state, totals: { ...state.totals, lessons: state.totals.lessons + 1 } };
  afterMutation(state);
}

export function logMixSession(perfect: boolean, questionCount: number) {
  let state = withDay(read(), (d) => ({ ...d, mixSessions: d.mixSessions + 1 }));
  state = {
    ...state,
    totals: {
      ...state.totals,
      mixSessions: state.totals.mixSessions + 1,
      perfectSessions:
        state.totals.perfectSessions + (perfect && questionCount >= 10 ? 1 : 0),
    },
  };
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

export function addBonusXp(amount: number) {
  const state = read();
  write({ ...state, bonusXp: state.bonusXp + amount });
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
