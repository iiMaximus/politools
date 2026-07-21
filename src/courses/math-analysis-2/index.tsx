import type { Course } from "../../types";
import * as limits from "./modules/limits";
import * as differential from "./modules/differential";
import * as taylorOptimization from "./modules/taylor-optimization";
import * as multipleIntegrals from "./modules/multiple-integrals";
import * as curvesFields from "./modules/curves-fields";
import * as surfacesFlux from "./modules/surfaces-flux";
import * as series from "./modules/series";
import * as fourier from "./modules/fourier";
import * as odes from "./modules/odes";
import { numericDrills } from "./numeric";
import { examOpenParts2026, examProblems2026, examQuestions2026 } from "./exams-2026";
import { archiveExamProblems, archiveExamQuestions } from "./exams-archive";
import { pastExamProblems, pastExamQuestions } from "./past-exams";
import { tutorialQuestions as tutCurves } from "./tutorials/curves-functions";
import { tutorialQuestions as tutDouble } from "./tutorials/double-integrals";
import { tutorialQuestions as tutTaylor } from "./tutorials/taylor-critical";
import { tutorialQuestions as tutFourier } from "./tutorials/fourier-sheet";
import { tutorialQuestions as tutLine } from "./tutorials/line-integrals";
import { tutorialQuestions as tutSurface } from "./tutorials/surface-integrals";
import { tutorialQuestions as tutTriple } from "./tutorials/triple-integrals";
import { tutorialQuestions as tutSeries } from "./tutorials/series-sheet";

/** Official exercise-sheet drills (Ex_* + Sol_* PDFs) — the exam is based on these. */
const tutorialSheets = [
  ...tutCurves,
  ...tutTaylor,
  ...tutDouble,
  ...tutTriple,
  ...tutLine,
  ...tutSurface,
  ...tutSeries,
  ...tutFourier,
];

/**
 * The course is assembled from one file per module (modules/*.tsx), each
 * exporting { MODULE, lessons, practice, exam }. Order here = syllabus order.
 */
const MODULES = [
  limits,
  differential,
  taylorOptimization,
  multipleIntegrals,
  curvesFields,
  surfacesFlux,
  series,
  fourier,
  odes,
];

const mathAnalysis2: Course = {
  meta: {
    id: "math-analysis-2",
    title: "Mathematical Analysis II",
    short: "Analysis II",
    tagline: "The complete AM2 toolkit — from gradients to Stokes, series and Fourier.",
    description:
      "The full Mathematical Analysis II course, taught end to end and grounded in the official tutorials: multivariable limits and continuity, differential calculus and the gradient, Taylor expansions and free/constrained optimization, double and triple integrals, curves, line integrals and vector fields, surfaces and the big theorems (Green, Gauss, Stokes), numerical and power series, and Fourier series — plus an off-syllabus ODE module — with simulations, worked examples, adaptive practice and real past-exam problems.",
    accent: "#8b7bff",
    accent2: "#b18cff",
    icon: "Sigma",
    year: 2,
    semester: 1,
    credits: 10,
    examDate: "2026-09-09",
    syllabus: MODULES.map((m) => m.MODULE),
    status: "complete",
  },
  lessons: MODULES.flatMap((m) => m.lessons),
  practice: [
    ...MODULES.flatMap((m) => m.practice),
    ...numericDrills,
    ...tutorialSheets,
    ...pastExamQuestions,
    ...examQuestions2026,
    ...examOpenParts2026,
    ...archiveExamQuestions,
  ],
  exam: [
    ...MODULES.flatMap((m) => m.exam),
    ...pastExamProblems,
    ...examProblems2026,
    ...archiveExamProblems,
  ],
};

export default mathAnalysis2;
