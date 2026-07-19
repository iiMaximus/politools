import type { McqQuestion } from "../../types";

/* ================================================================== *
 *  REAL PAST-EXAM PAPER — LAG MIDTERM, JULY 2025.
 *  Versions Y1, Z1, W1 transcribed from
 *  course_material/Algebra/_text/LAG/exams/1.txt (version X1 already
 *  lives in linear-algebra-cards.json as lag-q193…lag-q200).
 *  Correct answers come from the handwritten answer key at the bottom
 *  of the scan where legible (Z1: Q3,Q4,Q5,Q7,Q8; W1: Q1,Q6,Q7,Q8;
 *  Y1: Q4,Q5,Q6,Q7 readable in the grid); the remaining items were
 *  solved from scratch and cross-checked against the same template in
 *  a version whose key cell IS legible.
 *  NOTES:
 *  - Z1.Q2 is a verbatim duplicate of X1.Q5 (lag-q197) — skipped.
 *  - W1.Q8: the OCR drops minus signs throughout the scan; the legible
 *    key cell (D = x^2(x+2), eigenvalues 0,0,-2) forces the stem to be
 *    Av = -2v (the Y1 twin uses Av = +2v with key C, consistent).
 * ================================================================== */

const PREFIX = "**[Real exam — July 2025]** ";

export const examJuly2025: McqQuestion[] = [
  /* ----------------------------- Y1 ----------------------------- */
  {
    id: "lag-jul25-y1-q1",
    module: "Written part",
    topic: "Linear maps",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q1)",
    prompt:
      PREFIX +
      "Consider the linear mapping $f : \\mathbb{R}^{3,3} \\to \\mathbb{R}^{3,3}$ such that $f(A) = A^\\top - A$. Find the correct statement.",
    options: [
      { id: "A", content: "$\\dim \\operatorname{Im} f = 2$." },
      { id: "B", content: "$\\dim \\operatorname{Ker} f = 1$." },
      { id: "C", content: "The identity matrix $I_3$ is not an eigenvector of $f$." },
      { id: "D", content: "Zero is an eigenvalue of $f$." },
    ],
    correct: "D",
    explanation:
      "$A\\in\\operatorname{Ker} f$ iff $A^\\top=A$, so the kernel is the space of symmetric matrices, which is non-trivial (dimension $6$) — hence $0$ is an eigenvalue of $f$, and (D) is correct. (A) fails: every output $A^\\top-A$ is antisymmetric and every antisymmetric $C$ equals $f(-C/2)$, so $\\operatorname{Im} f$ is the antisymmetric matrices with dimension $3(3-1)/2=3$, not $2$. (B) fails: $\\dim\\operatorname{Ker} f=3(3+1)/2=6$, not $1$. (C) fails: $f(I_3)=I_3^\\top-I_3=0=0\\cdot I_3$ and $I_3\\neq0$, so $I_3$ IS an eigenvector, with eigenvalue $0$.",
    theory:
      "For $f(A)=A^\\top-A$ on $\\mathbb{R}^{n,n}$: kernel = symmetric matrices ($\\dim n(n+1)/2$, eigenvalue $0$), image = antisymmetric matrices ($\\dim n(n-1)/2$, eigenvalue $-2$ since $f(A)=-2A$ when $A^\\top=-A$). A vector in the kernel of a linear map is exactly an eigenvector of eigenvalue $0$.",
  },
  {
    id: "lag-jul25-y1-q2",
    module: "Written part",
    topic: "Linear maps",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q2)",
    prompt:
      PREFIX +
      "Consider the linear mapping $f : \\mathbb{R}_2[x] \\to \\mathbb{R}_3[x]$ such that $f(p(x)) = (x+1)p(x)$. Find the correct statement.",
    options: [
      { id: "A", content: "$\\operatorname{Im} f = L\\{x+1,\\ x^2+x,\\ x^3+x^2\\}$." },
      { id: "B", content: "$\\operatorname{Ker} f = L\\{x+1\\}$." },
      { id: "C", content: "$f^{-1}(x+1) = L\\{1\\}$." },
      { id: "D", content: "$f$ is not injective." },
    ],
    correct: "A",
    explanation:
      "The image is spanned by the images of the basis $\\{1,x,x^2\\}$: $f(1)=x+1$, $f(x)=x^2+x$, $f(x^2)=x^3+x^2$, so $\\operatorname{Im} f=L\\{x+1,\\ x^2+x,\\ x^3+x^2\\}$ — (A) is correct. (B) fails: $(x+1)p(x)=0$ forces $p=0$ (a product of non-zero polynomials is non-zero), so $\\operatorname{Ker} f=\\{0\\}$, not a line. (D) fails for the same reason: trivial kernel means $f$ IS injective. (C) fails: since $f$ is injective, the preimage of $x+1$ is the single polynomial $p(x)=1$, i.e. the point $\\{1\\}$; the subspace $L\\{1\\}$ contains e.g. $2$, but $f(2)=2x+2\\neq x+1$.",
    theory:
      "For a linear map, $\\operatorname{Im} f$ is spanned by the images of a basis of the domain. Multiplication by a fixed non-zero polynomial is always injective, and the preimage of a single vector under an injective map is a single point (an affine coset $p_0+\\operatorname{Ker} f$, which is a subspace only when the vector is $0$).",
  },
  {
    id: "lag-jul25-y1-q3",
    module: "Written part",
    topic: "Lines & planes",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q3)",
    prompt:
      PREFIX +
      "Let $a\\in\\mathbb{R}$ and consider the lines $l:\\begin{cases}x=0\\\\ y=0\\end{cases}$ and $r:\\begin{cases}y=1\\\\ z=a\\end{cases}$. Find the correct statement.",
    options: [
      { id: "A", content: "for exactly two values of $a$, the distance between $l$ and $r$ is $d(l,r)=2$." },
      { id: "B", content: "for at least one value of $a$, $l$ and $r$ are coplanar." },
      { id: "C", content: "for infinitely many values of $a$, $l$ and $r$ are parallel." },
      { id: "D", content: "for all values of $a$, $l\\cap r=\\emptyset$." },
    ],
    correct: "D",
    explanation:
      "$l$ is the $z$-axis: direction $\\vec u=(0,0,1)$ through the origin. $r=\\{(t,1,a): t\\in\\mathbb{R}\\}$: direction $\\vec v=(1,0,0)$ through $(0,1,a)$. The directions are never proportional, so the lines are never parallel — (C) fails. $\\vec u\\times\\vec v=(0,1,0)\\neq\\vec 0$ and $d(l,r)=\\dfrac{|(0,1,a)\\cdot(0,1,0)|}{|(0,1,0)|}=1$ for every $a$: the lines are skew for all $a$. Hence they never meet — (D) is correct — and are never coplanar — (B) fails. (A) fails because the distance is always $1$, never $2$ (zero values of $a$, not two).",
    theory:
      "Two lines with directions $\\vec u,\\vec v$ and points $P_1,P_2$: parallel iff $\\vec u\\parallel\\vec v$; otherwise $d=\\dfrac{|(P_2-P_1)\\cdot(\\vec u\\times\\vec v)|}{|\\vec u\\times\\vec v|}$, and they are coplanar (hence incident) iff this distance is $0$. Here the parameter $a$ slides $r$ along $l$'s direction, so it changes nothing.",
  },
  {
    id: "lag-jul25-y1-q4",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q4)",
    prompt:
      PREFIX +
      "Consider the matrix $A=\\begin{pmatrix} 2 & 2 & 2 \\\\ 2 & 2 & 2 \\\\ 2 & 2 & 2 \\end{pmatrix}$. Find the correct statement.",
    options: [
      { id: "A", content: "$0$ and $36$ are eigenvalues of $A^2$." },
      { id: "B", content: "$A^2$ is not diagonalizable." },
      { id: "C", content: "The characteristic polynomial of $A^2$ is $-x^3+8x^2-2x+1$." },
      { id: "D", content: "$0$ and $2$ are eigenvalues of $A^2$." },
    ],
    correct: "A",
    explanation:
      "$A$ has rank $1$, so $0$ is an eigenvalue with multiplicity $2$; the trace $6$ gives the last eigenvalue $6$ (eigenvector $(1,1,1)$, since every row sums to $6$). Then $A^2$ has eigenvalues $0^2,0^2,6^2=0,0,36$ — (A) is correct. (B) fails: $A$ is symmetric, so $A$ (and hence $A^2$) is diagonalizable by the spectral theorem. (C) fails: the characteristic polynomial of $A^2$ is $x^2(36-x)=-x^3+36x^2$; the proposed polynomial takes value $1$ at $x=0$, impossible since $\\det(A^2)=0$. (D) fails: $2$ is not an eigenvalue of $A^2$ (only $0$ and $36$ are).",
    theory:
      "A rank-$1$ $n\\times n$ matrix with constant entries $c$ has eigenvalues $0$ ($n-1$ times) and $nc$ (once, eigenvector $(1,\\dots,1)$). If $Av=\\lambda v$ then $A^2v=\\lambda^2 v$, so $A^2$ has the squared eigenvalues with the same eigenvectors. Symmetric $\\Rightarrow$ diagonalizable, always.",
  },
  {
    id: "lag-jul25-y1-q5",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q5)",
    prompt:
      PREFIX +
      "Let $A$ be a square matrix such that $\\dim \\operatorname{Ker} A = 2$, $\\operatorname{rk}(A)=1$, and there exists a non-zero vector $v$ such that $Av=2v$. Then the characteristic polynomial of $A$ is:",
    options: [
      { id: "A", content: "$x(2-x)^2$." },
      { id: "B", content: "$x(x+2)^2$." },
      { id: "C", content: "$x^2(2-x)$." },
      { id: "D", content: "$x^2(x+2)$." },
    ],
    correct: "C",
    explanation:
      "Rank–nullity: $n=\\operatorname{rk}(A)+\\dim\\operatorname{Ker} A=1+2=3$, so $A$ is $3\\times3$. $\\dim\\operatorname{Ker} A=2$ means $0$ is an eigenvalue with geometric — hence at least algebraic — multiplicity $2$; $Av=2v$ with $v\\neq0$ makes $2$ the third eigenvalue. Eigenvalues $0,0,2$ give $\\det(A-xI)=(0-x)^2(2-x)=x^2(2-x)$ — (C). (A) fails: it has the root $0$ only once, contradicting the $2$-dimensional kernel. (B) and (D) fail: they use the eigenvalue $-2$, but the data give $+2$.",
    theory:
      "Read the spectrum off the data: $\\dim\\operatorname{Ker} A$ = geometric multiplicity of the eigenvalue $0$; rank–nullity fixes the size $n$; each relation $Av=\\lambda v$ ($v\\neq0$) contributes the eigenvalue $\\lambda$. With all $n$ eigenvalues found, the characteristic polynomial is $\\prod_i(\\lambda_i-x)$ — match roots AND multiplicities against the options.",
  },
  {
    id: "lag-jul25-y1-q6",
    module: "Written part",
    topic: "Orthogonality & quadratic forms",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q6)",
    prompt: PREFIX + "Consider the quadratic form $q(x,y,z,t)$. Find the correct implication.",
    options: [
      { id: "A", content: "If $q(x,y,z,t)+3t^2$ is positive definite, then $q(x,y,z,t)$ is positive definite." },
      { id: "B", content: "If $q(x,y,z,t)$ is positive definite, then $q(x,y,z,t)+2x^2+3y^2+4z^2+5t^2$ is positive definite." },
      { id: "C", content: "If $q(x,y,z,t)-2t^2$ is positive definite, then $q(x,y,z,t)$ is indefinite." },
      { id: "D", content: "If $q(x,y,z,t)$ is negative definite, then $q(x,y,z,t)-2x^2-3y^2-4z^2$ is indefinite." },
    ],
    correct: "B",
    explanation:
      "(B) is correct: $2x^2+3y^2+4z^2+5t^2\\geq0$ always, so adding it to a form that is $>0$ on every non-zero vector keeps it $>0$ — still positive definite. (A) fails: $q=x^2+y^2+z^2-t^2$ is indefinite, yet $q+3t^2=x^2+y^2+z^2+2t^2$ is positive definite. (C) fails: if $q-2t^2$ is positive definite then $q=(q-2t^2)+2t^2$ is a sum of a positive definite and a positive semidefinite form, hence positive definite — the opposite of indefinite. (D) fails: subtracting the semidefinite form $2x^2+3y^2+4z^2\\ge0$ from a negative definite $q$ only makes every value more negative — the result stays negative definite, it cannot be indefinite.",
    theory:
      "Definiteness is about the sign of $q(v)$ on all $v\\neq0$. Adding a positive semidefinite form preserves positive definiteness (and subtracting one preserves negative definiteness), but the converse implications are false: the added term can be what rescues the sign. To kill a wrong implication, test diagonal counterexamples like $x^2+y^2+z^2-t^2$.",
  },
  {
    id: "lag-jul25-y1-q7",
    module: "Written part",
    topic: "Distances, circles & spheres",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q7)",
    prompt:
      PREFIX +
      "Consider the spheres $S_1: x^2+y^2+z^2-2x+2y=2$ and $S_2: x^2+y^2+z^2-x+3y+z=2$. Find the correct statement.",
    options: [
      { id: "A", content: "$S_1\\cap S_2=\\emptyset$." },
      { id: "B", content: "$S_1\\cap S_2=\\{P\\},\\ P\\in\\mathbb{R}^3$." },
      { id: "C", content: "$S_1\\cap S_2$ is a circle of radius $1$." },
      { id: "D", content: "$S_1\\cap S_2$ is a circle of radius $2$." },
    ],
    correct: "D",
    explanation:
      "Completing squares in $S_1$: $(x-1)^2+(y+1)^2+z^2=2+1+1=4$, so $C_1=(1,-1,0)$ and $r_1=2$. Subtracting the two equations kills the quadratic terms and gives the radical plane $\\pi:(-2x+2y)-(-x+3y+z)=0$, i.e. $x+y+z=0$, and $S_1\\cap S_2=S_1\\cap\\pi$. The center $C_1$ satisfies $1-1+0=0$, so $\\pi$ passes through the center: the section is a great circle of radius $r_1=2$ — (D). Check on $S_2$: $C_2=(\\tfrac12,-\\tfrac32,-\\tfrac12)$, $r_2^2=\\tfrac{19}{4}$, $d(C_2,\\pi)=\\tfrac{\\sqrt3}{2}$, and $\\sqrt{19/4-3/4}=2$ — consistent. (A),(B) fail: the intersection is a genuine circle, not empty or a point. (C) fails: the radius is $2$, not $1$.",
    theory:
      "For two intersecting spheres, subtract the equations to get the radical plane $\\pi$; then $S_1\\cap S_2=S_1\\cap\\pi$, a circle of radius $\\sqrt{r^2-d(C,\\pi)^2}$. If the plane passes through the center ($d=0$) the circle is a great circle with the sphere's own radius.",
  },
  {
    id: "lag-jul25-y1-q8",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Y1, Q8)",
    prompt:
      PREFIX +
      "For $a,b \\in \\mathbb{R}$ consider the matrix $A=\\begin{pmatrix} 1+b^2 & a \\\\ 0 & b^2+1 \\end{pmatrix}$. Find the correct statement.",
    options: [
      { id: "A", content: "For all $a,b\\in\\mathbb{R}$ the matrix $A$ is not diagonalizable." },
      { id: "B", content: "For all $a,b\\in\\mathbb{R}$ zero is an eigenvalue of $A$." },
      { id: "C", content: "for finitely many $a\\in\\mathbb{R}$, the matrix $A$ is diagonalizable." },
      { id: "D", content: "There are no value of $a,b\\in\\mathbb{R}$ such that one is an eigenvalue of $A$." },
    ],
    correct: "C",
    explanation:
      "$A$ is triangular, so its eigenvalues are the diagonal entries $1+b^2$ and $b^2+1$ — a DOUBLE eigenvalue $\\lambda=1+b^2$ for every $a,b$. A matrix with a single repeated eigenvalue is diagonalizable iff it already equals $\\lambda I$, i.e. iff $a=0$. So the set of values of $a$ giving a diagonalizable matrix is $\\{0\\}$ — finitely many — and (C) is correct. (A) fails precisely at $a=0$ (then $A=(1+b^2)I$ is diagonal). (B) fails: $1+b^2\\geq1>0$, so zero is never an eigenvalue. (D) fails: for $b=0$ both diagonal entries equal $1$, so $1$ IS an eigenvalue for those values.",
    theory:
      "Triangular matrix $\\Rightarrow$ eigenvalues on the diagonal. When the two diagonal entries coincide, diagonalizability of a $2\\times2$ matrix forces $A=\\lambda I$, so any non-zero off-diagonal entry destroys it. Zero (resp. one) is an eigenvalue iff some diagonal entry is $0$ (resp. $1$).",
  },

  /* ----------------------------- Z1 ----------------------------- */
  {
    id: "lag-jul25-z1-q1",
    module: "Written part",
    topic: "Orthogonality & quadratic forms",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q1)",
    prompt: PREFIX + "Consider the quadratic form $q(x,y,z)$. Find the correct implication.",
    options: [
      { id: "A", content: "If $q(x,y,z)-2x^2$ is positive definite, then $q(x,y,z)$ is indefinite." },
      { id: "B", content: "If $q(x,y,z)+4x^2$ is positive definite, then $q(x,y,z)$ is positive definite." },
      { id: "C", content: "If $q(x,y,z)$ is indefinite, then $q(x,y,z)+(x+5y)^2$ is indefinite." },
      { id: "D", content: "If $q(x,y,z)$ is positive definite, then $q(x,y,z)+(x+y)^2$ is positive definite." },
    ],
    correct: "D",
    explanation:
      "(D) is correct: $(x+y)^2\\geq0$ for every vector, so adding it to a form with $q(v)>0$ for all $v\\neq0$ keeps every value $>0$. (A) fails: if $q-2x^2$ is positive definite then $q=(q-2x^2)+2x^2$ is positive definite (positive definite + positive semidefinite), so it cannot be indefinite. (B) fails: $q=-2x^2+y^2+z^2$ is indefinite, yet $q+4x^2=2x^2+y^2+z^2$ is positive definite. (C) fails: take $q=y^2-(x+5y)^2$, which is indefinite ($q(-5,1,0)=1>0$, $q(1,0,0)=-1<0$); then $q+(x+5y)^2=y^2$ is only positive semidefinite, not indefinite.",
    theory:
      "A perfect square like $(x+y)^2$ is positive semidefinite, so adding it preserves positive definiteness. It cannot certify anything about the original form, though: the square may be exactly the piece that fixes (or hides) a bad direction. Disprove implications with diagonal or rank-degenerate counterexamples.",
  },
  {
    id: "lag-jul25-z1-q3",
    module: "Written part",
    topic: "Linear maps",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q3)",
    prompt:
      PREFIX +
      "Consider the linear mapping $f : \\mathbb{R}^{3,3} \\to \\mathbb{R}^{3,3}$ such that $f(A) = A + A^\\top$. Find the correct statement.",
    options: [
      { id: "A", content: "The identity matrix $I_3$ is not an eigenvector of $f$." },
      { id: "B", content: "$f$ does not have real eigenvalues." },
      { id: "C", content: "$\\dim \\operatorname{Ker} f = 2$." },
      { id: "D", content: "$\\dim \\operatorname{Im} f = 6$." },
    ],
    correct: "D",
    explanation:
      "Every output $A+A^\\top$ is symmetric, and every symmetric matrix $S$ is reached: $f(S/2)=S$. So $\\operatorname{Im} f$ is the space of $3\\times3$ symmetric matrices, of dimension $3(3+1)/2=6$ — (D) is correct. (A) fails: $f(I_3)=I_3+I_3=2I_3$, so $I_3$ is an eigenvector with eigenvalue $2$. (B) fails: $f$ has the real eigenvalues $2$ (on symmetric matrices) and $0$ (on antisymmetric ones). (C) fails: $\\operatorname{Ker} f=\\{A: A^\\top=-A\\}$ is the antisymmetric matrices, of dimension $3(3-1)/2=3$, not $2$.",
    theory:
      "For $f(A)=A+A^\\top$: kernel = antisymmetric matrices ($\\dim n(n-1)/2$), image = symmetric matrices ($\\dim n(n+1)/2$), eigenvalues $0$ and $2$. Symmetric and antisymmetric matrices decompose $\\mathbb{R}^{n,n}$ into the two eigenspaces.",
  },
  {
    id: "lag-jul25-z1-q4",
    module: "Written part",
    topic: "Distances, circles & spheres",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q4)",
    prompt:
      PREFIX +
      "Consider the spheres $S_1: x^2+y^2+z^2-2x+2y=7$ and $S_2: x^2+y^2+z^2-x+3y+z=7$. Find the correct statement.",
    options: [
      { id: "A", content: "$S_1\\cap S_2$ is a circle of radius $2$." },
      { id: "B", content: "$S_1\\cap S_2=\\emptyset$." },
      { id: "C", content: "$S_1\\cap S_2=\\{P\\},\\ P\\in\\mathbb{R}^3$." },
      { id: "D", content: "$S_1\\cap S_2$ is a circle of radius $3$." },
    ],
    correct: "D",
    explanation:
      "$S_1$: $(x-1)^2+(y+1)^2+z^2=7+2=9$, so $C_1=(1,-1,0)$, $r_1=3$. Subtracting the equations gives the radical plane $\\pi: x+y+z=0$, and $S_1\\cap S_2=S_1\\cap\\pi$. Since $C_1$ lies on $\\pi$ ($1-1+0=0$), the plane cuts a great circle of radius $r_1=3$ — (D). Cross-check with $S_2$: $C_2=(\\tfrac12,-\\tfrac32,-\\tfrac12)$, $r_2^2=7+\\tfrac{11}{4}=\\tfrac{39}{4}$, $d(C_2,\\pi)=\\tfrac{\\sqrt3}{2}$, radius $\\sqrt{39/4-3/4}=3$ — same circle. (A) fails: the radius is $3$, not $2$. (B),(C) fail: the intersection is a full circle, not empty and not a single point.",
    theory:
      "Two spheres intersect in the circle cut on either sphere by their radical plane (the difference of the two equations). Radius: $\\sqrt{r^2-d(C,\\pi)^2}$; when the center lies on the plane the circle has the sphere's radius.",
  },
  {
    id: "lag-jul25-z1-q5",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q5)",
    prompt:
      PREFIX +
      "Consider the matrix $A=\\begin{pmatrix} 1 & 1 & 1 \\\\ 1 & 1 & 1 \\\\ 1 & 1 & 1 \\end{pmatrix}$. Find the correct statement.",
    options: [
      { id: "A", content: "$0$ and $1$ are eigenvalues of $A$." },
      { id: "B", content: "$A^2$ is diagonalizable." },
      { id: "C", content: "$1$ and $9$ are eigenvalues of $A^2$." },
      { id: "D", content: "The characteristic polynomial of $A^2$ is $-x^3+3x^2-x+1$." },
    ],
    correct: "B",
    explanation:
      "$A$ is symmetric, so it is diagonalizable by the spectral theorem — and then $A^2$ is diagonalizable too (same eigenvectors, squared eigenvalues); (B) is correct. The spectrum: $A$ has rank $1$, so $0$ has multiplicity $2$, and the trace $3$ gives the third eigenvalue $3$; hence $A$ has eigenvalues $0,0,3$ and $A^2$ has $0,0,9$. (A) fails: $1$ is not an eigenvalue of $A$ (only $0$ and $3$). (C) fails: $1$ is not an eigenvalue of $A^2$ (only $0$ and $9$). (D) fails: the characteristic polynomial of $A^2$ is $x^2(9-x)=-x^3+9x^2$; the proposed one equals $1$ at $x=0$, impossible because $\\det(A^2)=0$.",
    theory:
      "The all-ones $n\\times n$ matrix has eigenvalues $0$ ($n-1$ times) and $n$ (once). Symmetric matrices are always diagonalizable, and powers of a diagonalizable matrix stay diagonalizable. Quick sanity check for characteristic polynomials: the value at $x=0$ must be $\\det$, and a singular matrix forces constant term $0$.",
  },
  {
    id: "lag-jul25-z1-q6",
    module: "Written part",
    topic: "Lines & planes",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q6)",
    prompt:
      PREFIX +
      "Let $a\\in\\mathbb{R}$ and consider the lines $l:\\begin{cases}x=0\\\\ y=0\\end{cases}$ and $r:\\begin{cases}y=1\\\\ z=a\\end{cases}$. Find the correct statement.",
    options: [
      { id: "A", content: "for infinitely many values of $a$, $l$ and $r$ are parallel." },
      { id: "B", content: "for all values of $a$, the distance between $l$ and $r$ is $d(l,r)=1$." },
      { id: "C", content: "for at least one value of $a$, $l$ and $r$ are coplanar." },
      { id: "D", content: "for all values of $a$, $l\\cap r\\neq\\emptyset$." },
    ],
    correct: "B",
    explanation:
      "$l$ is the $z$-axis (direction $\\vec u=(0,0,1)$, through the origin); $r=\\{(t,1,a)\\}$ has direction $\\vec v=(1,0,0)$ and passes through $(0,1,a)$. $\\vec u\\times\\vec v=(0,1,0)$, so $d(l,r)=\\dfrac{|(0,1,a)\\cdot(0,1,0)|}{|(0,1,0)|}=1$ for every $a$ — (B) is correct. (A) fails: the directions $(0,0,1)$ and $(1,0,0)$ are never proportional. (C) fails: distance $1>0$ means the lines are skew for every $a$, hence never coplanar. (D) fails: skew lines never intersect.",
    theory:
      "Skew-line distance: $d=\\dfrac{|(P_2-P_1)\\cdot(\\vec u\\times\\vec v)|}{|\\vec u\\times\\vec v|}$. Moving $r$ by the parameter $a$ along $l$'s own direction leaves the distance unchanged — that is why the answer holds for ALL $a$.",
  },
  {
    id: "lag-jul25-z1-q7",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q7)",
    prompt:
      PREFIX +
      "For $a,b \\in \\mathbb{R}$ consider the matrix $A=\\begin{pmatrix} a^2 & 1 \\\\ 0 & a^2+b^2+1 \\end{pmatrix}$. Find the correct statement.",
    options: [
      { id: "A", content: "For all $a,b\\in\\mathbb{R}$ the matrix $A$ is diagonalizable." },
      { id: "B", content: "For all $a,b\\in\\mathbb{R}$ zero is an eigenvalue of $A$." },
      { id: "C", content: "For finitely many $a,b\\in\\mathbb{R}$ the matrix $A$ is invertible." },
      { id: "D", content: "There are three distinct values of $a\\in\\mathbb{R}$ for which zero is an eigenvalue of $A$." },
    ],
    correct: "A",
    explanation:
      "$A$ is triangular with eigenvalues $a^2$ and $a^2+b^2+1$. Their difference is $b^2+1\\geq1>0$: the two eigenvalues are ALWAYS distinct, and a $2\\times2$ matrix with two distinct eigenvalues is always diagonalizable — (A) is correct. (B) fails: $0$ is an eigenvalue iff $a^2=0$ (the other entry $a^2+b^2+1\\geq1$ is never zero), i.e. only when $a=0$. (C) fails: $\\det A=a^2(a^2+b^2+1)\\neq0$ iff $a\\neq0$, so $A$ is invertible for infinitely many pairs $(a,b)$. (D) fails: zero is an eigenvalue exactly for $a=0$ — one value, not three.",
    theory:
      "For triangular matrices, compare the diagonal entries: if they can never coincide (here they differ by $b^2+1>0$), the matrix is diagonalizable for every parameter choice. Zero is an eigenvalue iff the determinant (product of diagonal entries) vanishes.",
  },
  {
    id: "lag-jul25-z1-q8",
    module: "Written part",
    topic: "Linear maps",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version Z1, Q8)",
    prompt:
      PREFIX +
      "Consider the linear mapping $f : \\mathbb{R}_2[x] \\to \\mathbb{R}_3[x]$ such that $f(p(x)) = (x+1)p(x)$. Find the correct statement.",
    options: [
      { id: "A", content: "$f^{-1}(x+1)$ is not a subspace of $\\mathbb{R}_2[x]$." },
      { id: "B", content: "$\\operatorname{Ker} f = L\\{x+1,\\ x^2+x\\}$." },
      { id: "C", content: "$\\operatorname{Im} f = L\\{x^3+1\\}$." },
      { id: "D", content: "$f$ is an endomorphism." },
    ],
    correct: "A",
    explanation:
      "$f$ is injective ($(x+1)p=0\\Rightarrow p=0$), so $f^{-1}(x+1)$ is the single point $\\{1\\}$ (because $f(1)=x+1$). It does not contain the zero polynomial, so it is not a subspace — (A) is correct: preimages of non-zero vectors are affine cosets, never subspaces. (B) fails: the kernel is $\\{0\\}$, not a $2$-dimensional space. (C) fails: $\\operatorname{Im} f=L\\{x+1,\\ x^2+x,\\ x^3+x^2\\}$ is $3$-dimensional; note $x^3+1=(x+1)(x^2-x+1)$ does belong to the image, but the image is far bigger than the line $L\\{x^3+1\\}$. (D) fails: an endomorphism needs equal domain and codomain, while here $f:\\mathbb{R}_2[x]\\to\\mathbb{R}_3[x]$.",
    theory:
      "$f^{-1}(w)$ is either empty or the coset $p_0+\\operatorname{Ker} f$; it is a subspace only when $w=0$. For injective maps it is a single point. An endomorphism is a linear map from a space to itself.",
  },

  /* ----------------------------- W1 ----------------------------- */
  {
    id: "lag-jul25-w1-q1",
    module: "Written part",
    topic: "Lines & planes",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q1)",
    prompt:
      PREFIX +
      "Let $a\\in\\mathbb{R}$ and consider the lines $l:\\begin{cases}x=0\\\\ y=0\\end{cases}$ and $r:\\begin{cases}y=1\\\\ z=a\\end{cases}$. Find the correct statement.",
    options: [
      { id: "A", content: "for infinitely many values of $a$, $l$ and $r$ are parallel." },
      { id: "B", content: "for all values of $a$, $l\\cap r=\\emptyset$." },
      { id: "C", content: "for exactly two values of $a$, the distance between $l$ and $r$ is $d(l,r)=2$." },
      { id: "D", content: "for at least one value of $a$, $l$ and $r$ are coplanar." },
    ],
    correct: "B",
    explanation:
      "$l$ is the $z$-axis with direction $(0,0,1)$; $r=\\{(t,1,a)\\}$ has direction $(1,0,0)$ and point $(0,1,a)$. The cross product of the directions is $(0,1,0)\\neq\\vec0$ and $d(l,r)=|(0,1,a)\\cdot(0,1,0)|=1$ for every $a$: the lines are skew for all $a$, so they never intersect — (B) is correct. (A) fails: $(0,0,1)$ and $(1,0,0)$ are never parallel. (C) fails: the distance is identically $1$, so NO value of $a$ gives distance $2$. (D) fails: skew lines are never coplanar.",
    theory:
      "Classify a pair of lines: parallel (proportional directions), incident (distance $0$), or skew (positive distance via $d=\\frac{|(P_2-P_1)\\cdot(\\vec u\\times\\vec v)|}{|\\vec u\\times\\vec v|}$). A parameter that translates one line along the other's direction never changes the classification.",
  },
  {
    id: "lag-jul25-w1-q2",
    module: "Written part",
    topic: "Linear maps",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q2)",
    prompt:
      PREFIX +
      "Consider the linear mapping $f : \\mathbb{R}^{3,3} \\to \\mathbb{R}^{3,3}$ such that $f(A) = A^\\top - A$. Find the correct statement.",
    options: [
      { id: "A", content: "$f$ does not have real eigenvalues." },
      { id: "B", content: "$\\dim \\operatorname{Ker} f = 5$." },
      { id: "C", content: "If $B\\in\\mathbb{R}^{3,3}$ has positive entries, then $B+B^\\top$ is an eigenvector of $f$." },
      { id: "D", content: "$\\dim \\operatorname{Im} f = 4$." },
    ],
    correct: "C",
    explanation:
      "$B+B^\\top$ is always symmetric, and if $B$ has positive entries then $B+B^\\top\\neq0$. Then $f(B+B^\\top)=(B+B^\\top)^\\top-(B+B^\\top)=0=0\\cdot(B+B^\\top)$: a non-zero vector mapped to $0$ times itself IS an eigenvector (eigenvalue $0$) — (C) is correct. (A) fails: $f$ has the real eigenvalues $0$ (on symmetric matrices) and $-2$ (on antisymmetric ones, where $f(A)=-A-A=-2A$). (B) fails: the kernel is the symmetric matrices, dimension $6$, not $5$. (D) fails: the image is the antisymmetric matrices, dimension $3$, not $4$.",
    theory:
      "Eigenvectors of eigenvalue $0$ are exactly the non-zero kernel vectors — do not discard them because the eigenvalue is zero. For $f(A)=A^\\top-A$: $\\operatorname{Ker}$ = symmetric ($\\dim 6$ for $n=3$), $\\operatorname{Im}$ = antisymmetric ($\\dim 3$), spectrum $\\{0,-2\\}$.",
  },
  {
    id: "lag-jul25-w1-q3",
    module: "Written part",
    topic: "Orthogonality & quadratic forms",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q3)",
    prompt: PREFIX + "Consider the quadratic form $q(x,y,z,t)$. Find the correct implication.",
    options: [
      { id: "A", content: "If $q(x,y,z,t)-2t^2$ is positive definite, then $q(x,y,z,t)$ is indefinite." },
      { id: "B", content: "If $q(x,y,z,t)$ is positive definite, then $q(x,y,z,t)-2x^2+3y^2+4z^2+5t^2$ is positive definite." },
      { id: "C", content: "If $q(x,y,z,t)$ is negative definite, then $q(x,y,z,t)-2x^2-3y^2-4z^2-t^2$ is negative definite." },
      { id: "D", content: "If $q(x,y,z,t)+3t^2$ is positive definite, then $q(x,y,z,t)$ is positive definite." },
    ],
    correct: "C",
    explanation:
      "(C) is correct: $2x^2+3y^2+4z^2+t^2\\geq0$, so subtracting it from a form that is $<0$ on every non-zero vector keeps every value $<0$ — still negative definite. (A) fails: $q-2t^2$ positive definite gives $q=(q-2t^2)+2t^2$ positive definite (sum of positive definite and semidefinite), never indefinite. (B) fails: the $-2x^2$ term can break definiteness — take $q=x^2+\\tfrac12(y^2+z^2+t^2)$ (positive definite); then the new form has $x^2$-coefficient $1-2=-1$, so it is negative along $(1,0,0,0)$ and positive along $(0,1,0,0)$: indefinite. (D) fails: $q=x^2+y^2+z^2-t^2$ is indefinite yet $q+3t^2=x^2+y^2+z^2+2t^2$ is positive definite.",
    theory:
      "Same-sign reinforcement is safe: negative definite minus a positive semidefinite form stays negative definite (and positive definite plus semidefinite stays positive definite). Mixed-sign corrections ($-2x^2$ inside an otherwise positive combination) and converse implications must be tested with explicit counterexamples.",
  },
  {
    id: "lag-jul25-w1-q4",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q4)",
    prompt:
      PREFIX +
      "Consider the matrix $A=\\begin{pmatrix} 2 & 2 & 2 \\\\ 2 & 2 & 2 \\\\ 2 & 2 & 2 \\end{pmatrix}$. Find the correct statement.",
    options: [
      { id: "A", content: "The characteristic polynomial of $A^2$ is $-x^3+8x^2-2x+1$." },
      { id: "B", content: "$0$ and $2$ are eigenvalues of $A^2$." },
      { id: "C", content: "$2$ and $12$ are eigenvalues of $A^2$." },
      { id: "D", content: "$A^2$ is diagonalizable." },
    ],
    correct: "D",
    explanation:
      "$A$ is symmetric, hence diagonalizable (spectral theorem), and $A^2$ is diagonalized by the same basis with squared eigenvalues — (D) is correct. The spectrum: $A$ has rank $1$, so eigenvalues $0,0$ and (from the trace) $6$; therefore $A^2$ has eigenvalues $0,0,36$. (A) fails: the characteristic polynomial of $A^2$ is $x^2(36-x)=-x^3+36x^2$, and the proposed polynomial has non-zero constant term although $\\det(A^2)=0$. (B) fails: $2$ is not an eigenvalue of $A^2$. (C) fails: neither $2$ nor $12$ is an eigenvalue of $A^2$ — only $0$ and $36$.",
    theory:
      "Symmetric $\\Rightarrow$ diagonalizable, and if $P^{-1}AP=D$ then $P^{-1}A^2P=D^2$: powers inherit diagonalizability. Constant-entry matrices: rank $1$, eigenvalues $0$ ($n-1$ times) and $n\\cdot c$; squaring squares the eigenvalues.",
  },
  {
    id: "lag-jul25-w1-q5",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q5)",
    prompt:
      PREFIX +
      "For $a,b \\in \\mathbb{R}$ consider the matrix $A=\\begin{pmatrix} 1+b^2 & a \\\\ 0 & b^2+1 \\end{pmatrix}$. Find the correct statement.",
    options: [
      { id: "A", content: "For all $a,b\\in\\mathbb{R}$, the matrix $A$ is not diagonalizable." },
      { id: "B", content: "For all $a,b\\in\\mathbb{R}$ zero is an eigenvalue of $A$." },
      { id: "C", content: "For infinitely many $a\\in\\mathbb{R}$ the matrix $A$ is diagonalizable." },
      { id: "D", content: "There are no values of $a,b\\in\\mathbb{R}$ such that zero is an eigenvalue of $A$." },
    ],
    correct: "D",
    explanation:
      "$A$ is triangular, so its eigenvalues are the diagonal entries — both equal to $1+b^2\\geq1>0$. Zero can therefore never be an eigenvalue, for any $a,b$ — (D) is correct (equivalently $\\det A=(1+b^2)^2\\geq1$, never $0$). (B) is the exact opposite. (A) fails: for $a=0$, $A=(1+b^2)I$ is already diagonal. (C) fails: with a repeated eigenvalue $\\lambda=1+b^2$, $A$ is diagonalizable iff $A=\\lambda I$ iff $a=0$ — a single value of $a$, not infinitely many.",
    theory:
      "Triangular matrices show their eigenvalues on the diagonal; $0$ is an eigenvalue iff $\\det=0$. With a repeated eigenvalue, a $2\\times2$ matrix is diagonalizable only if it is scalar, so the off-diagonal parameter decides everything.",
  },
  {
    id: "lag-jul25-w1-q6",
    module: "Written part",
    topic: "Distances, circles & spheres",
    difficulty: "hard",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q6)",
    prompt:
      PREFIX +
      "Consider the spheres $S_1: x^2+y^2+z^2-2x+2y=14$ and $S_2: x^2+y^2+z^2-x+3y+z=14$. Find the correct statement.",
    options: [
      { id: "A", content: "$S_1\\cap S_2$ is a circle of radius $4$." },
      { id: "B", content: "$S_1\\cap S_2=\\emptyset$." },
      { id: "C", content: "$S_1\\cap S_2=\\{P\\},\\ P\\in\\mathbb{R}^3$." },
      { id: "D", content: "$S_1\\cap S_2$ is a circle of radius $3$." },
    ],
    correct: "A",
    explanation:
      "$S_1$: $(x-1)^2+(y+1)^2+z^2=14+2=16$, so $C_1=(1,-1,0)$ and $r_1=4$. The radical plane (difference of the equations) is $\\pi: x+y+z=0$ and contains $C_1$ ($1-1+0=0$), so $S_1\\cap S_2=S_1\\cap\\pi$ is a great circle of radius $4$ — (A). Check via $S_2$: $C_2=(\\tfrac12,-\\tfrac32,-\\tfrac12)$, $r_2^2=14+\\tfrac{11}{4}=\\tfrac{67}{4}$, $d(C_2,\\pi)=\\tfrac{\\sqrt3}{2}$, radius $\\sqrt{67/4-3/4}=\\sqrt{16}=4$ — consistent. (B),(C) fail: the spheres share a whole circle. (D) fails: the radius is $4$, not $3$.",
    theory:
      "This family of exam questions keeps the same two sphere centers and only moves the right-hand side $k$: the radical plane $x+y+z=0$ always passes through $C_1=(1,-1,0)$, so the answer is simply the radius $r_1=\\sqrt{k+2}$ of the first sphere.",
  },
  {
    id: "lag-jul25-w1-q7",
    module: "Written part",
    topic: "Linear maps",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q7)",
    prompt:
      PREFIX +
      "Consider the linear mapping $f : \\mathbb{R}_2[x] \\to \\mathbb{R}_3[x]$ such that $f(p(x)) = (x+1)p(x)$. Find the correct statement.",
    options: [
      { id: "A", content: "$\\operatorname{Im} f = L\\{x^3+x^2\\}$." },
      { id: "B", content: "$f^{-1}(x+1) = 1$." },
      { id: "C", content: "$\\operatorname{Ker} f = L\\{x-1\\}$." },
      { id: "D", content: "$f$ is surjective." },
    ],
    correct: "B",
    explanation:
      "$(x+1)p(x)=x+1$ holds exactly for the constant polynomial $p(x)=1$, and $f$ is injective, so the preimage of $x+1$ is precisely $1$ — (B) is correct. (A) fails: the image is $L\\{x+1,\\ x^2+x,\\ x^3+x^2\\}$, a $3$-dimensional space, not the single line spanned by $x^3+x^2$. (C) fails: $f(x-1)=(x+1)(x-1)=x^2-1\\neq0$; the kernel is $\\{0\\}$ because $(x+1)p=0$ forces $p=0$. (D) fails: $\\dim\\operatorname{Im} f=\\dim\\mathbb{R}_2[x]=3<4=\\dim\\mathbb{R}_3[x]$, so $f$ cannot be surjective.",
    theory:
      "Multiplication by a fixed non-zero polynomial is injective and raises degree, so it is never surjective onto the bigger space. To find $f^{-1}(w)$, solve $f(p)=w$ directly — for injective $f$ the solution, if any, is unique.",
  },
  {
    id: "lag-jul25-w1-q8",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    difficulty: "medium",
    tags: ["past-exam"],
    source: "LAG exams/1.txt (July 2025, version W1, Q8)",
    prompt:
      PREFIX +
      "Let $A$ be a square matrix such that $\\dim \\operatorname{Ker} A = 2$, $\\operatorname{rk}(A)=1$, and there exists a non-zero vector $v$ such that $Av=-2v$. Then the characteristic polynomial of $A$ is:",
    options: [
      { id: "A", content: "$x(2-x)^2$." },
      { id: "B", content: "$x(x+2)^2$." },
      { id: "C", content: "$x^2(2-x)$." },
      { id: "D", content: "$x^2(x+2)$." },
    ],
    correct: "D",
    explanation:
      "Rank–nullity gives $n=1+2=3$. The $2$-dimensional kernel makes $0$ an eigenvalue of multiplicity $2$, and $Av=-2v$ ($v\\neq0$) contributes the eigenvalue $-2$. So the roots of the characteristic polynomial are $0$ (double) and $-2$ (simple): $x^2(x+2)$ — (D). (A) and (C) fail: they have the root $+2$, but the data give $Av=-2v$; option (C) $x^2(2-x)$ would be the answer of the twin version where $Av=+2v$. (B) fails: it has $0$ as a SIMPLE root and $-2$ double, contradicting $\\dim\\operatorname{Ker} A=2$.",
    theory:
      "Build the characteristic polynomial from the spectrum: kernel dimension = multiplicity of the root $0$, each relation $Av=\\lambda v$ adds the root $\\lambda$, and rank–nullity fixes the total degree. Then match both the ROOTS and their MULTIPLICITIES against the options — the exam's favourite trap is swapping them.",
  },
];
