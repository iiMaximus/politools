import type { Course } from "../../types";
import * as limits from "./modules/limits";
import * as differential from "./modules/differential";
import * as taylorOptimization from "./modules/taylor-optimization";
import * as multipleIntegrals from "./modules/multiple-integrals";
import * as curvesFields from "./modules/curves-fields";
import * as surfacesFlux from "./modules/surfaces-flux";
import * as series from "./modules/series";
import * as odes from "./modules/odes";

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
  odes,
];

const mathAnalysis2: Course = {
  meta: {
    id: "math-analysis-2",
    title: "Mathematical Analysis II",
    short: "Analysis II",
    tagline: "The complete AM2 toolkit — from gradients to Stokes, series and ODEs.",
    description:
      "The full Mathematical Analysis II course, taught end to end: multivariable limits and continuity, differential calculus and the gradient, Taylor expansions and free/constrained optimization, double and triple integrals, curves, line integrals and vector fields, surfaces and the big theorems (Green, Gauss, Stokes), numerical and power series, and ordinary differential equations — with simulations, worked examples, adaptive practice and exam-style problems for every module.",
    accent: "#8b7bff",
    accent2: "#b18cff",
    icon: "Sigma",
    year: 2,
    semester: 1,
    credits: 10,
    examDate: "2026-09-02",
    syllabus: MODULES.map((m) => m.MODULE),
    status: "complete",
  },
  lessons: MODULES.flatMap((m) => m.lessons),
  practice: MODULES.flatMap((m) => m.practice),
  exam: MODULES.flatMap((m) => m.exam),
};

export default mathAnalysis2;
