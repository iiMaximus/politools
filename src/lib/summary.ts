import type { Course } from "../types";
import { dueCount, levelFromXp, masteredCount } from "./adaptive";
import { readProgress, type CourseProgress } from "./progress";

export interface CourseSummary {
  id: string;
  lessonsDone: number;
  lessonsTotal: number;
  mastered: number;
  practiceTotal: number;
  due: number;
  examSolved: number;
  examTotal: number;
  xp: number;
  level: number;
  /** 0..1 overall completion (lessons + mastered cards + solved exams) */
  pct: number;
  started: boolean;
}

export function summarize(course: Course, progress: CourseProgress): CourseSummary {
  const lessonsTotal = course.lessons.length;
  const lessonsDone = course.lessons.filter((l) => progress.lessons[l.id]?.completed).length;
  const practiceTotal = course.practice.length;
  const mastered = masteredCount(course.practice, progress);
  const due = dueCount(course.practice, progress);
  const examTotal = course.exam.length;
  const examSolved = course.exam.filter((e) => progress.exams[e.id]?.solved).length;
  const denom = lessonsTotal + practiceTotal + examTotal;
  const done = lessonsDone + mastered + examSolved;
  return {
    id: course.meta.id,
    lessonsDone,
    lessonsTotal,
    mastered,
    practiceTotal,
    due,
    examSolved,
    examTotal,
    xp: progress.xp,
    level: levelFromXp(progress.xp).level,
    pct: denom ? done / denom : 0,
    started: done > 0 || progress.xp > 0,
  };
}

/** Snapshot summary straight from storage (non-reactive). */
export function summarizeFromStorage(course: Course): CourseSummary {
  return summarize(course, readProgress(course.meta.id));
}

export interface OverallSummary {
  lessonsDone: number;
  lessonsTotal: number;
  mastered: number;
  practiceTotal: number;
  examSolved: number;
  examTotal: number;
  due: number;
  xp: number;
  pct: number;
  coursesStarted: number;
}

export function aggregate(summaries: CourseSummary[]): OverallSummary {
  const sum = (f: (s: CourseSummary) => number) => summaries.reduce((a, s) => a + f(s), 0);
  const lessonsTotal = sum((s) => s.lessonsTotal);
  const practiceTotal = sum((s) => s.practiceTotal);
  const examTotal = sum((s) => s.examTotal);
  const lessonsDone = sum((s) => s.lessonsDone);
  const mastered = sum((s) => s.mastered);
  const examSolved = sum((s) => s.examSolved);
  const denom = lessonsTotal + practiceTotal + examTotal;
  return {
    lessonsDone,
    lessonsTotal,
    mastered,
    practiceTotal,
    examSolved,
    examTotal,
    due: sum((s) => s.due),
    xp: sum((s) => s.xp),
    pct: denom ? (lessonsDone + mastered + examSolved) / denom : 0,
    coursesStarted: summaries.filter((s) => s.started).length,
  };
}
