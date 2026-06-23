import type { Course } from "../types";
import thermodynamics from "./thermodynamics";
import mathAnalysis2 from "./math-analysis-2";
import mechanics from "./mechanics";
import cybersecurity from "./cybersecurity";

/**
 * Central course registry. Adding a course = build its folder (meta + lessons +
 * practice + exam following the thermodynamics template) and add one line here.
 */
const COURSES: Course[] = [thermodynamics, mathAnalysis2, mechanics, cybersecurity];

export function allCourses(): Course[] {
  return COURSES;
}

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.meta.id === id);
}
