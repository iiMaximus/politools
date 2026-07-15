import type { Course } from "../../types";
import { loadTopic } from "../../lib/loadTopic";
import cards from "./linear-algebra-cards.json";
import examProblems from "./linear-algebra-exam.json";

// MATLAB part (first exam part)
import matlabBasics from "./topics/matlab-basics.json";
import matlabErrors from "./topics/matlab-errors.json";
import matlabSystems from "./topics/matlab-systems.json";
import matlabEigen from "./topics/matlab-eigen.json";
// Written part — theory (CARLINI lectures)
import thVectors from "./topics/th-vectors.json";
import thLinesPlanes from "./topics/th-lines-planes.json";
import thMatrices from "./topics/th-matrices.json";
import thSystems from "./topics/th-systems.json";
import thVectorSpaces from "./topics/th-vector-spaces.json";
import thLinearMaps from "./topics/th-linear-maps.json";
import thEigen from "./topics/th-eigen.json";
import thOrthogonality from "./topics/th-orthogonality.json";
import thConics from "./topics/th-conics.json";
import thDistances from "./topics/th-distances.json";

const TOPIC_FILES: [string, { lecture?: string }][] = [
  ["matlab-basics", matlabBasics],
  ["matlab-errors", matlabErrors],
  ["matlab-systems", matlabSystems],
  ["matlab-eigen", matlabEigen],
  ["th-vectors", thVectors],
  ["th-lines-planes", thLinesPlanes],
  ["th-matrices", thMatrices],
  ["th-systems", thSystems],
  ["th-vector-spaces", thVectorSpaces],
  ["th-linear-maps", thLinearMaps],
  ["th-eigen", thEigen],
  ["th-orthogonality", thOrthogonality],
  ["th-conics", thConics],
  ["th-distances", thDistances],
];

const LESSONS = TOPIC_FILES.map(
  ([slug, raw]) => loadTopic(raw, slug, { lecture: raw.lecture, tutorial: "", fallbackTitle: slug }).lesson
);

const linearAlgebra: Course = {
  meta: {
    id: "linear-algebra",
    title: "Linear Algebra & Geometry",
    short: "LAG",
    tagline: "Exam sprint: MATLAB fluency + every official MCQ + worked exercises.",
    description:
      "A full Linear Algebra & Geometry sprint built straight from the course material. The MATLAB part (Cascavita sessions + Festa numerical LA) teaches every command you must use; the written part covers all the theory (Carlini lectures) with the real multiple-choice questions from the sample-exam book and past papers, plus worked open exercises.",
    accent: "#2f7dd1",
    accent2: "#24b39b",
    icon: "SquareFunction",
    year: 1,
    semester: 2,
    credits: 10,
    examDate: "2026-09-14",
    syllabus: [
      "MATLAB: syntax, matrices, indexing & plotting",
      "Floating point, errors & conditioning",
      "Linear systems: \\, LU, Cholesky, QR, least squares",
      "Eigenvalues, power method & SVD",
      "Vectors, lines & planes",
      "Matrices, systems, rank & determinants",
      "Vector spaces, bases & linear maps",
      "Eigenvalues, diagonalization & orthogonality",
      "Quadratic forms, conics, quadrics, distances",
    ],
    status: "complete",
  },
  lessons: LESSONS,
  practice: cards as unknown as Course["practice"],
  exam: examProblems as unknown as Course["exam"],
};

export default linearAlgebra;
