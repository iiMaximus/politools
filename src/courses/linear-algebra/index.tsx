import type { Course } from "../../types";
import lessons from "./linear-algebra-lessons.json";
import cards from "./linear-algebra-cards.json";
import examProblems from "./linear-algebra-exam.json";

const linearAlgebra: Course = {
  meta: {
    id: "linear-algebra",
    title: "Linear Algebra & Geometry",
    short: "LAG",
    tagline: "Exam sprint: MATLAB, official MCQs, and every parseable source exercise.",
    description:
      "A complete Linear Algebra and Geometry sprint built from the Algebra/LAG folder: Carlini theory notes and exercise sheets, Ruatta solved practice classes, Cascavita MATLAB sessions, Festa numerical linear algebra slides, and official exam booklets. Use Learn for the theory map, Practice for official MCQs and first-move drills, and Exams for the full written exercise bank.",
    accent: "#2f7dd1",
    accent2: "#24b39b",
    icon: "SquareFunction",
    year: 1,
    semester: 2,
    credits: 10,
    examDate: "2026-07-02",
    syllabus: [
      "MATLAB syntax, indexing and plotting",
      "Floating point, errors and numerical methods",
      "LU, Cholesky, QR and least squares",
      "Eigenvalues, power methods and SVD",
      "Vectors, products, lines and planes",
      "Matrices, systems, rank and determinants",
      "Subspaces, bases and linear maps",
      "Eigenvectors, diagonalization and orthogonality",
      "Quadratic forms, conics, quadrics and spheres",
    ],
    status: "complete",
  },
  lessons: lessons as unknown as Course["lessons"],
  practice: cards as unknown as Course["practice"],
  exam: examProblems as unknown as Course["exam"],
};

export default linearAlgebra;
