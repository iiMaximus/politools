import type { ExamProblem, McqQuestion } from "../../types";

/**
 * LAG Book1 sample-exam booklet — net-new quizzes only.
 *
 * Full audit (all 23 photos in course_material/Algebra/LAG/Book1 read and
 * transcribed; they cover booklet pages 2-46 completely):
 *
 *   Chapter 1 "Sample exams": Sample A quiz Q1-Q8 (pp.2-3) + exercise 1.1.2;
 *   Sample B quiz Q1-Q8 (pp.5-7) + exercise 1.2.2; Sample C quiz Q1-Q8
 *   (pp.9-11) + exercise 1.3.2; Sample D quiz Q1-Q8 (pp.12-14) + exercise
 *   1.4.2. Chapter 2 repeats every quiz with its worked solution and a printed
 *   answer table per sample: A (p.15): b d a c c c b c · B (p.23): d d a b
 *   c a a a · C (p.31): a b b c b c a b · D (p.37): c d d c b b b b.
 *   Chapter 3 (pp.43-46) is a glossary — no questions.
 *
 * That makes exactly 32 quizzes in the whole booklet. Cross-check against
 * linear-algebra-cards.json (63 cards whose source contains "Book1"): all 32
 * are already ingested — most twice, once from the quiz pages and once from
 * the solution pages. The only quiz without a quiz-page card, Sample B Q2
 * (rank/determinant of the 3x3 matrix with rows 1 2 3 / 4 5 6 / 7 8 9), is
 * ingested via its solution-page card "LAG Book1, p.24, Exercise 2 (Solutions
 * of sample exams)" — same mathematical content, hence a duplicate. The four
 * EXERCISE sections are open free-response problems, not quizzes, so they are
 * out of scope for MCQ ingestion.
 *
 * Consequently there are no net-new Book1 quizzes to add.
 */
export const book1Extra: McqQuestion[] = [];

/**
 * LAG exam simulation (29 May 2026), Exercise 5 — the open endomorphism
 * problem, transcribed as a step-by-step walkthrough faithful to the official
 * worked solution in
 * course_material/Algebra/_text/LAG/exams/LAG_exam_simulation_29_mag_26_solutions.txt.
 * (Exercises 1-4 of the simulation are MCQs and are not part of this export.)
 */
export const simulationExercise: ExamProblem[] = [
  {
    id: "lag-sim-ex5",
    title: "Parametric endomorphism $F_\\alpha$: kernel, image, diagonalizability",
    meta: "LAG exam simulation · 29 May 2026 · Ex 5 · past-exam",
    difficulty: "medium",
    topic: "Linear maps",
    statement:
      "Consider the linear endomorphism $F_\\alpha : \\mathbb{R}^3 \\to \\mathbb{R}^3$ defined by $F_\\alpha(x, y, z) = (x + 2y + \\alpha z,\\; 2y,\\; \\alpha x + 2y + z)$, where $\\alpha \\in \\mathbb{R}$ is a parameter. (a) For which values of $\\alpha$ is $\\dim(\\ker F_\\alpha)$ minimized? (b) For which values of $\\alpha$ does the vector $(1, 2, 3)^T$ belong to $\\operatorname{Im} F_\\alpha$? (c) Is $F_1$ diagonalizable?",
    given:
      "Matrix of $F_\\alpha$ with respect to the standard basis: $A_\\alpha = \\begin{pmatrix} 1 & 2 & \\alpha \\\\ 0 & 2 & 0 \\\\ \\alpha & 2 & 1 \\end{pmatrix}$.",
    steps: [
      {
        title: "Set up: matrix of $F_\\alpha$ and its determinant",
        content:
          "Reading the coefficients of $F_\\alpha(x,y,z)$ column by column gives $A_\\alpha = \\begin{pmatrix} 1 & 2 & \\alpha \\\\ 0 & 2 & 0 \\\\ \\alpha & 2 & 1 \\end{pmatrix}$. Expand $\\det(A_\\alpha)$ along the second row, which has a single non-zero entry: $\\det(A_\\alpha) = 2\\,\\det\\begin{pmatrix} 1 & \\alpha \\\\ \\alpha & 1 \\end{pmatrix} = 2(1 - \\alpha^2)$. The determinant vanishes exactly at $\\alpha = \\pm 1$ — these two singular values of the parameter drive every part of the exercise.",
      },
      {
        title: "(a) Minimize $\\dim(\\ker F_\\alpha)$ via rank-nullity",
        content:
          "By the Rank-Nullity Theorem, $\\dim(\\ker F_\\alpha) = 3 - \\operatorname{rank}(A_\\alpha)$, so the kernel is smallest exactly when the rank is largest. The rank is maximal ($=3$) if and only if $\\det(A_\\alpha) \\neq 0$, i.e. $2(1-\\alpha^2) \\neq 0$. Hence for every $\\alpha \\neq \\pm 1$ we get $\\operatorname{rank}(A_\\alpha) = 3$ and $\\dim(\\ker F_\\alpha) = 0$ — the minimum possible dimension. Answer: the minimum is $0$, achieved for all $\\alpha \\neq \\pm 1$.",
      },
      {
        title: "(b) Generic case $\\alpha \\neq \\pm 1$: automatic membership",
        content:
          "For $\\alpha \\neq \\pm 1$ the determinant is non-zero, so $F_\\alpha$ is an isomorphism of $\\mathbb{R}^3$; in particular it is surjective and $(1,2,3)^T \\in \\operatorname{Im} F_\\alpha$ with no computation needed. Only the two singular cases $\\alpha = 1$ and $\\alpha = -1$ require a manual check of the system $A_\\alpha (x,y,z)^T = (1,2,3)^T$.",
      },
      {
        title: "(b) Singular case $\\alpha = 1$: contradiction",
        content:
          "For $\\alpha = 1$ the first and third equations of $A_1 (x,y,z)^T = (1,2,3)^T$ read $x + 2y + z = 1$ and $x + 2y + z = 3$: the same left-hand side would have to equal two different values simultaneously. The system is inconsistent, so for $\\alpha = 1$ the vector $(1,2,3)^T$ is NOT in the image.",
      },
      {
        title: "(b) Singular case $\\alpha = -1$: consistent system",
        content:
          "For $\\alpha = -1$ the system reads $x + 2y - z = 1$, $\\;2y = 2$, $\\;-x + 2y + z = 3$. The second equation forces $y = 1$; substituting, the first and third equations become $x - z = -1$ and $-x + z = 1$ — the same relation written twice. The system is consistent (one free variable), so $(1,2,3)^T \\in \\operatorname{Im} F_{-1}$. Conclusion of (b): the vector belongs to $\\operatorname{Im} F_\\alpha$ if and only if $\\alpha \\neq 1$.",
      },
      {
        title: "(c) Eigenvalues of $A_1$",
        content:
          "For $\\alpha = 1$, $A_1 = \\begin{pmatrix} 1 & 2 & 1 \\\\ 0 & 2 & 0 \\\\ 1 & 2 & 1 \\end{pmatrix}$. Expanding the characteristic determinant along the second row: $p_{A_1}(\\lambda) = \\det(A_1 - \\lambda I) = (2-\\lambda)\\left[(1-\\lambda)^2 - 1\\right] = -\\lambda(2-\\lambda)^2$. The eigenvalues are $\\lambda_1 = 0$ with algebraic multiplicity $1$ and $\\lambda_2 = 2$ with algebraic multiplicity $2$.",
      },
      {
        title: "(c) Geometric multiplicity of $\\lambda_2 = 2$ decides",
        content:
          "$A_1$ is diagonalizable if and only if each eigenvalue's geometric multiplicity equals its algebraic multiplicity; a simple eigenvalue such as $\\lambda_1 = 0$ always satisfies this, so only $\\lambda_2 = 2$ is at risk. Compute $A_1 - 2I = \\begin{pmatrix} -1 & 2 & 1 \\\\ 0 & 0 & 0 \\\\ 1 & 2 & -1 \\end{pmatrix}$. The first and third rows are not proportional, so $\\operatorname{rank}(A_1 - 2I) = 2$, giving geometric multiplicity $3 - 2 = 1 < 2$. Hence $A_1$ — and therefore $F_1$ — is NOT diagonalizable.",
      },
    ],
    finalAnswer:
      "(a) $\\min \\dim(\\ker F_\\alpha) = 0$, achieved for every $\\alpha \\neq \\pm 1$. (b) $(1,2,3)^T \\in \\operatorname{Im} F_\\alpha$ if and only if $\\alpha \\neq 1$: for $\\alpha \\neq \\pm 1$ by surjectivity, for $\\alpha = -1$ by the direct check; it fails only at $\\alpha = 1$. (c) No: $F_1$ is not diagonalizable, because $\\lambda = 2$ has algebraic multiplicity $2$ but geometric multiplicity $3 - \\operatorname{rank}(A_1 - 2I) = 1$.",
    tips:
      "Compute $\\det(A_\\alpha)$ as a polynomial in the parameter first: its roots are the only values where anything interesting (rank drop, non-surjectivity) can happen — everywhere else the map is an isomorphism and both kernel and image questions answer themselves. When an eigenvalue is repeated, never judge diagonalizability from the characteristic polynomial alone: compare geometric vs algebraic multiplicity via $\\dim E_\\lambda = n - \\operatorname{rank}(A - \\lambda I)$. Trap: $A_1$ is not symmetric ($a_{12} = 2$ but $a_{21} = 0$), so the spectral-theorem shortcut 'symmetric $\\Rightarrow$ diagonalizable' does not apply here.",
  },
];
