import type { Course } from "../types";
import type { CourseProgress } from "./progress";
import { GATE_MASTERY, courseSections, topicMastery, type PathSection } from "./path";

/* ================================================================== *
 *  BATTLE PLAN — deadlines for finishing each part of a course before
 *  its exam. The plan is anchored the first time it's computed (start
 *  date persisted per course), then sections get FIXED deadlines spread
 *  across the summer proportionally to their size, leaving a review
 *  buffer before the exam for mocks and due-clearing. Deadlines don't
 *  drift when you fall behind — that's the point of a deadline.
 * ================================================================== */

const DAY = 86_400_000;
/** last stretch is for mock exams + review, not new material */
export const REVIEW_BUFFER_DAYS = 10;

export interface PlanItem {
  section: PathSection;
  /** epoch ms — end of that day */
  deadline: number;
  done: boolean;
  overdue: boolean;
  /** the first not-done item — what to work on now */
  current: boolean;
}

export interface CoursePlan {
  items: PlanItem[];
  /** when new material should stop and mocks/review begin */
  reviewStart: number;
  examAt: number;
  overdueCount: number;
  onTrack: boolean;
  /** first not-done item */
  next: PlanItem | null;
}

const KEY = (courseId: string) => `polito:plan:${courseId}`;

interface PlanAnchor {
  start: number;
  examIso: string;
}

function readAnchor(courseId: string): PlanAnchor | null {
  try {
    const raw = localStorage.getItem(KEY(courseId));
    return raw ? (JSON.parse(raw) as PlanAnchor) : null;
  } catch {
    return null;
  }
}

function writeAnchor(courseId: string, a: PlanAnchor) {
  try {
    localStorage.setItem(KEY(courseId), JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

function parseIso(iso: string): number | null {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).getTime();
}

function endOfDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();
}

/** a section counts as finished like a path gate: lessons read + cards locked in */
function sectionDone(course: Course, s: PathSection, progress: CourseProgress): boolean {
  const lessonsDone = s.lessons.every((l) => progress.lessons[l.id]?.completed);
  if (!lessonsDone) return false;
  if (!s.topics.length) return true;
  const { mastered, total } = topicMastery(course, s.topics, progress);
  return total === 0 || mastered >= Math.max(1, Math.ceil(total * GATE_MASTERY));
}

export function coursePlan(
  course: Course,
  progress: CourseProgress,
  examIso: string | undefined,
  now = Date.now()
): CoursePlan | null {
  if (!examIso) return null;
  const examAt = parseIso(examIso);
  if (!examAt || examAt <= now) return null;
  const sections = courseSections(course);
  if (!sections.length) return null;

  // anchor the plan once; re-anchor if the exam date changed
  let anchor = readAnchor(course.meta.id);
  if (!anchor || anchor.examIso !== examIso || anchor.start >= examAt) {
    anchor = { start: now, examIso };
    writeAnchor(course.meta.id, anchor);
  }

  const reviewStart = Math.max(anchor.start + DAY, examAt - REVIEW_BUFFER_DAYS * DAY);
  const span = reviewStart - anchor.start;

  // deadlines proportional to section size (lessons carry the weight)
  const weights = sections.map((s) => Math.max(1, s.lessons.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cum = 0;
  const items: PlanItem[] = sections.map((s, i) => {
    cum += weights[i];
    const deadline = endOfDay(anchor.start + (cum / totalWeight) * span);
    const done = sectionDone(course, s, progress);
    return { section: s, deadline, done, overdue: !done && deadline < now, current: false };
  });

  const next = items.find((it) => !it.done) ?? null;
  if (next) next.current = true;
  const overdueCount = items.filter((it) => it.overdue).length;

  return { items, reviewStart, examAt, overdueCount, onTrack: overdueCount === 0, next };
}

export function planDateLabel(ts: number): string {
  return new Date(ts)
    .toLocaleDateString("en", { month: "short", day: "numeric" })
    .toUpperCase();
}
