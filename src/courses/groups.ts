import type { Course } from "../types";
import { getCourse } from "./registry";

export interface CourseGroup {
  id: string;
  title: string;
  short: string;
  tagline: string;
  description: string;
  accent: string;
  accent2: string;
  icon: string;
  year: Course["meta"]["year"];
  semester: Course["meta"]["semester"];
  courseIds: string[];
}

export const COURSE_GROUPS: CourseGroup[] = [
  {
    id: "electronic-systems",
    title: "Electronic Systems",
    short: "Electronic Systems",
    tagline: "Choose Fundamentals or Electronic Systems, then drill the right bank.",
    description:
      "The electronic systems material is split into two study tracks. Pick the fundamentals bank for circuits and phasors, or the electronic systems bank for op-amps, logic and interfaces.",
    accent: "#0f9f8f",
    accent2: "#2f8cff",
    icon: "CircuitBoard",
    year: 2,
    semester: 2,
    courseIds: ["fundamentals-electronic-systems", "electronic-systems"],
  },
];

export const GROUPED_COURSE_IDS = new Set(COURSE_GROUPS.flatMap((group) => group.courseIds));

export function getCourseGroup(id: string): CourseGroup | undefined {
  return COURSE_GROUPS.find((group) => group.id === id);
}

export function getCourseGroupCourses(group: CourseGroup): Course[] {
  return group.courseIds.flatMap((id) => {
    const course = getCourse(id);
    return course ? [course] : [];
  });
}
