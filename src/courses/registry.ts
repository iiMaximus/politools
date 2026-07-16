import { useEffect, useState } from "react";
import type { Course } from "../types";

/* ================================================================== *
 *  COURSE REGISTRY — code-split per course.
 *  Each course lives in its own lazy chunk (dynamic import), so a phone
 *  visiting one course downloads only that course's content. Loaded
 *  courses land in a module cache with a tiny pub/sub; `getCourse` is a
 *  synchronous cache read for code that runs after a `useCourse`/
 *  `loadCourse` has resolved.
 *  Adding a course = build its folder + add one LOADERS line.
 * ================================================================== */

const LOADERS: Record<string, () => Promise<{ default: Course }>> = {
  thermodynamics: () => import("./thermodynamics"),
  "math-analysis-2": () => import("./math-analysis-2"),
  mechanics: () => import("./mechanics"),
  cybersecurity: () => import("./cybersecurity"),
  statistics: () => import("./statistics"),
  "linear-algebra": () => import("./linear-algebra"),
  "fundamentals-electronic-systems": () => import("./fundamentals-electronic-systems"),
  "electronic-systems": () => import("./electronic-systems"),
};

/** hub display order */
const COURSE_IDS = [
  "thermodynamics",
  "math-analysis-2",
  "mechanics",
  "cybersecurity",
  "statistics",
  "linear-algebra",
  "fundamentals-electronic-systems",
  "electronic-systems",
];

// statistics is hidden until its content is finished (still reachable by URL)
const HIDDEN_FROM_HUB = new Set(["cybersecurity", "statistics"]);

const cache = new Map<string, Course>();
const pending = new Map<string, Promise<Course | undefined>>();
const subs = new Set<() => void>();

export function courseExists(id: string): boolean {
  return id in LOADERS;
}

/** Load one course chunk (cached, deduped). */
export function loadCourse(id: string): Promise<Course | undefined> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  const loader = LOADERS[id];
  if (!loader) return Promise.resolve(undefined);
  let p = pending.get(id);
  if (!p) {
    p = loader().then((m) => {
      cache.set(id, m.default);
      pending.delete(id);
      subs.forEach((fn) => fn());
      return m.default;
    });
    pending.set(id, p);
  }
  return p;
}

/** Synchronous cache read — undefined until the chunk has loaded. */
export function getCourse(id: string): Course | undefined {
  return cache.get(id);
}

/** Currently loaded, hub-visible courses (hub order). */
export function allCourses(): Course[] {
  return COURSE_IDS.filter((id) => !HIDDEN_FROM_HUB.has(id))
    .map((id) => cache.get(id))
    .filter((c): c is Course => !!c);
}

/** React hook: one course, loaded on demand. */
export function useCourse(id: string): { course: Course | undefined; loading: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subs.add(fn);
    void loadCourse(id);
    return () => {
      subs.delete(fn);
    };
  }, [id]);
  const course = cache.get(id);
  return { course, loading: !course && courseExists(id) };
}

/** React hook: progressively load every hub course (dashboard use).
 *  Renders update as chunks arrive; `ready` once all are in. */
export function useAllCourses(): { courses: Course[]; ready: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subs.add(fn);
    for (const id of COURSE_IDS) void loadCourse(id);
    return () => {
      subs.delete(fn);
    };
  }, []);
  const courses = allCourses();
  return { courses, ready: courses.length === COURSE_IDS.filter((id) => !HIDDEN_FROM_HUB.has(id)).length };
}

/** Await a specific set of courses (Daily Mix, stats). */
export async function loadCourses(ids: string[]): Promise<Course[]> {
  const loaded = await Promise.all(ids.map((id) => loadCourse(id)));
  return loaded.filter((c): c is Course => !!c);
}

/** React hook: a specific set of courses (course groups). */
export function useCourses(ids: string[]): { courses: Course[]; ready: boolean } {
  const [, force] = useState(0);
  const key = ids.join(",");
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subs.add(fn);
    for (const id of ids) void loadCourse(id);
    return () => {
      subs.delete(fn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const courses = ids.map((id) => cache.get(id)).filter((c): c is Course => !!c);
  return { courses, ready: courses.length === ids.filter(courseExists).length };
}
