import type { ReactNode } from "react";

/* ================================================================== *
 *  CONTENT MODEL
 *  Every course is a self-contained module that plugs into the hub.
 *  Content is authored as TSX so lessons can embed live React
 *  simulations, KaTeX math and rich figures directly.
 * ================================================================== */

export type CourseId = string;

export interface CourseMeta {
  /** url slug, e.g. "thermodynamics" */
  id: CourseId;
  title: string;
  /** compact title for chips/cards */
  short: string;
  /** one-line hook shown on the hub */
  tagline: string;
  /** longer paragraph for the course landing */
  description: string;
  /** primary + secondary accent colors that re-theme the whole course */
  accent: string;
  accent2: string;
  /** lucide icon name rendered via the Icon component */
  icon: string;
  year: 1 | 2 | 3;
  semester: 1 | 2;
  /** ECTS credits, optional */
  credits?: number;
  /** ISO date of the next exam, optional → drives the countdown */
  examDate?: string;
  /** high-level syllabus chapters shown on the course page */
  syllabus: string[];
  /** authoring status so the hub can show coverage honestly */
  status: "sample" | "in-progress" | "complete";
}

/* ------------------------------ Lessons --------------------------- */

export type LessonBlock =
  | { kind: "prose"; content: ReactNode }
  | { kind: "heading"; text: string; id?: string }
  | { kind: "definition"; term: string; content: ReactNode }
  | { kind: "formula"; tex: string; caption?: ReactNode; tag?: string }
  | {
      kind: "callout";
      tone: "key" | "info" | "tip" | "trap" | "warn";
      title?: string;
      content: ReactNode;
    }
  | { kind: "figure"; render: () => ReactNode; caption?: ReactNode }
  | { kind: "sim"; title: string; render: () => ReactNode; caption?: ReactNode }
  | { kind: "example"; title?: string; content: ReactNode }
  | { kind: "steps"; title?: string; steps: { label?: string; content: ReactNode }[] }
  | { kind: "checkpoint"; question: Question };

export interface Lesson {
  id: string;
  title: string;
  /** lecture this lesson belongs to (groups the lesson list), e.g. "Thermodynamics 1" */
  lecture?: string;
  /** short subtitle / summary line */
  summary: string;
  /** estimated reading+interaction time in minutes */
  minutes: number;
  /** "what you'll be able to do" bullets */
  objectives: string[];
  blocks: LessonBlock[];
}

/* --------------------------- Practice MCQ ------------------------- */

export type Difficulty = "easy" | "medium" | "hard";

export interface Option {
  id: string; // "A" | "B" | "C" | "D"
  content: ReactNode;
}

export interface QuestionVisual {
  type: "image";
  src: string;
  alt: string;
  caption?: ReactNode;
}

export interface Question {
  id: string;
  /** the lecture this card belongs to — powers practice-by-lecture */
  topic?: string;
  /** optional parent module/group used to organize lectures (e.g. "Module A: …") */
  module?: string;
  difficulty: Difficulty;
  prompt: ReactNode;
  options: Option[];
  /** id of the correct option */
  correct: string;
  /** why the right answer is right and the others wrong */
  explanation: ReactNode;
  /** optional source figure needed to answer the card */
  visual?: QuestionVisual;
  /** generalized theory so the student can solve variants */
  theory?: ReactNode;
  source?: string;
  tags?: string[];
}

/* ------------------------------ Exams ----------------------------- */

export interface SolutionStep {
  title: string;
  content: ReactNode;
}

export interface ExamProblem {
  id: string;
  title: string;
  /** e.g. "2024 · Winter session · 12 pts" */
  meta: string;
  difficulty: Difficulty;
  topic?: string;
  statement: ReactNode;
  /** known data, optional */
  given?: ReactNode;
  steps: SolutionStep[];
  finalAnswer: ReactNode;
  /** examiner tips / common traps */
  tips?: ReactNode;
}

/* ----------------------------- Course ----------------------------- */

export interface Course {
  meta: CourseMeta;
  lessons: Lesson[];
  practice: Question[];
  exam: ExamProblem[];
}
