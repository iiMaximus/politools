import type { Course, Lesson } from "../types";
import type { CourseProgress } from "./progress";

/* ================================================================== *
 *  PATH MODEL — shared by the skill path and mini-boss fights.
 *  A course is split into SECTIONS (lecture groups); each section
 *  knows which practice topics belong to it, so the path can gate on
 *  mastery and the mini-boss can build a scoped deck.
 * ================================================================== */

export interface PathSection {
  /** lecture-group title, also the mini-boss key */
  title: string;
  lessons: Lesson[];
  /** practice topics that belong to this section */
  topics: string[];
}

export const GATE_MASTERY = 0.5;

/**
 * Topic association strategies, in order:
 *  1. one distinct practice topic per lesson (topic-file courses like
 *     thermo/ESMM) → each lesson brings its own topic into the section;
 *  2. lecture title doubles as the practice topic (the MA2 modules);
 *  3. no mapping → section gets no topics (path falls back to one
 *     generic gate on the whole bank).
 */
export function courseSections(course: Course): PathSection[] {
  const { lessons, practice } = course;

  const distinctTopics: string[] = [];
  for (const q of practice) {
    if (q.topic && !distinctTopics.includes(q.topic)) distinctTopics.push(q.topic);
  }
  const perLesson = distinctTopics.length === lessons.length ? distinctTopics : null;

  const sections: PathSection[] = [];
  const index = new Map<string, PathSection>();
  lessons.forEach((l, i) => {
    const key = l.lecture ?? "Lessons";
    let s = index.get(key);
    if (!s) {
      s = { title: key, lessons: [], topics: [] };
      index.set(key, s);
      sections.push(s);
    }
    s.lessons.push(l);
    if (perLesson && !s.topics.includes(perLesson[i])) s.topics.push(perLesson[i]);
  });

  if (!perLesson) {
    for (const s of sections) {
      if (practice.some((q) => q.topic === s.title)) s.topics = [s.title];
    }
  }
  return sections;
}

export function sectionQuestions(course: Course, section: PathSection) {
  return course.practice.filter((q) => q.topic && section.topics.includes(q.topic));
}

export function topicMastery(
  course: Course,
  topics: string[],
  progress: CourseProgress
): { mastered: number; total: number } {
  const pool = topics.length
    ? course.practice.filter((q) => q.topic && topics.includes(q.topic))
    : course.practice;
  return {
    mastered: pool.filter((q) => progress.cards[q.id]?.mastered).length,
    total: pool.length,
  };
}
