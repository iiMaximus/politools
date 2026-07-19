import type { McqQuestion } from "../../types";

/**
 * Real PoliTo LAG midterm — June 2025, versions B1, C1, D1.
 * Version A1 is already ingested in linear-algebra-cards.json (lag-q201..q208).
 * Answers taken from the key grid at the top of course_material/Algebra/_text/LAG/exams/2.txt;
 * B1-Q5 (blank in the grid) and D1-Q6 (smudged) were solved by hand and cross-checked
 * against the same question templates in versions whose key is legible.
 */
export const examJune2025: McqQuestion[] = [
  // ───────────────────────────── Version B1 ─────────────────────────────
  {
    id: "lag-jun25-b1-q1",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Let $A=(a_{ij})$ be the $3\\times 3$ matrix such that $a_{ij}=1$ if $i+j=4$ and $a_{ij}=0$ if $i+j\\neq 4$. Find the correct statement.",
    options: [
      { id: "A", content: "The matrix $A$ is not diagonalizable." },
      { id: "B", content: "The matrix $A$ is not invertible." },
      { id: "C", content: "The matrix $A$ is the matrix of a rotation in the space." },
      { id: "D", content: "The matrix $A$ is orthogonal." },
    ],
    correct: "D",
    explanation:
      "The entries with $i+j=4$ are $(1,3),(2,2),(3,1)$, so $A=\\begin{pmatrix}0&0&1\\\\0&1&0\\\\1&0&0\\end{pmatrix}$ — the exchange (anti-diagonal) matrix. Its columns are the standard basis vectors in a different order, hence orthonormal: $A^\\top A=I$, so $A$ is orthogonal and (D) is true. (A) fails because $A$ is real symmetric, hence diagonalizable by the spectral theorem. (B) fails because $\\det A=-1\\neq 0$ (it is a permutation matrix of a transposition), so $A$ is invertible. (C) fails because a rotation matrix must have determinant $+1$, while $\\det A=-1$: $A$ is a reflection, not a rotation.",
    theory:
      "Permutation matrices are orthogonal; they represent rotations only when their determinant is $+1$, and every real symmetric matrix is diagonalizable.",
    source: "LAG exams/2.txt (June 2025, version B1, Q1)",
  },
  {
    id: "lag-jun25-b1-q2",
    module: "Written part",
    topic: "Linear systems & rank",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** If $u$ and $v$ are distinct vectors such that $Au = b$ and $Av = b$ for some vector $b$, then it is necessarily true that:",
    options: [
      { id: "A", content: "The determinant of $A$ is zero." },
      { id: "B", content: "$A$ is invertible." },
      { id: "C", content: "The system of equations $Ax = b$ has infinitely many solutions." },
      { id: "D", content: "The vector $u - v$ is a solution of the system of equations $Ax = b$." },
    ],
    correct: "C",
    explanation:
      "Since $A(u-v)=Au-Av=b-b=0$ and $u\\neq v$, the kernel of $A$ contains the nonzero vector $u-v$, hence all its multiples. The solution set of $Ax=b$ is $u+\\ker A$, so it contains $u+t(u-v)$ for every $t\\in\\mathbb{R}$: infinitely many solutions, which makes (C) true. (A) is not necessarily true because $A$ need not be square, so 'the determinant of $A$' may not even be defined. (B) is false: a system with two distinct solutions can never come from an invertible (square) matrix. (D) is false: $u-v$ solves the homogeneous system $Ax=0$, not $Ax=b$ (unless $b=0$, which is not guaranteed).",
    theory:
      "Two distinct solutions of $Ax=b$ force a non-trivial kernel, and then the whole affine line $u+t(u-v)$ solves the system: a linear system has $0$, $1$, or infinitely many solutions.",
    source: "LAG exams/2.txt (June 2025, version B1, Q2)",
  },
  {
    id: "lag-jun25-b1-q3",
    module: "Written part",
    topic: "Lines & planes",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Consider the family of lines $s_t : 2x = 2y = tz + 2t$ where $t \\in \\mathbb{R}$. Find the correct statement.",
    options: [
      { id: "A", content: "There exists $a \\in \\mathbb{R}$ such that $s_a$ and $s_0$ are skew lines." },
      {
        id: "B",
        content:
          "There does not exist $a \\in \\mathbb{R}$, with $a \\neq 0$, such that the lines $s_a$ and $s_0$ are parallel lines.",
      },
      { id: "C", content: "For all $a \\in \\mathbb{R}$ the lines $s_a$ and $s_0$ are orthogonal." },
      {
        id: "D",
        content: "For all $a \\in \\mathbb{R}$, with $a \\neq 0$, the lines $s_a$ and $s_0$ are not coplanar.",
      },
    ],
    correct: "B",
    explanation:
      "For $t=0$ the equations give $2x=2y=0$: $s_0$ is the $z$-axis, direction $(0,0,1)$. For $a\\neq 0$, $s_a$ satisfies $x=y$ and $2y=a(z+2)$, so parametrizing by $y$ gives direction $(1,1,2/a)$, whose first two components are nonzero — it can never be proportional to $(0,0,1)$. Hence no $a\\neq 0$ makes $s_a$ parallel to $s_0$, and (B) is true. (A) and (D) are false: every line of the family lies in the plane $x=y$ (and in fact passes through $(0,0,-2)$), so any two of them are coplanar, never skew. (C) is false: $(0,0,1)\\cdot(1,1,2/a)=2/a\\neq 0$, so $s_a$ and $s_0$ are not orthogonal for $a\\neq 0$.",
    theory:
      "Lines are parallel iff their direction vectors are proportional; a family of lines satisfying a common linear equation lies in one plane, so its members are pairwise coplanar and never skew.",
    source: "LAG exams/2.txt (June 2025, version B1, Q3)",
  },
  {
    id: "lag-jun25-b1-q4",
    module: "Written part",
    topic: "Conics & quadrics",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Let $a \\in \\mathbb{R}$ and consider the conic of equation $$C_a : (x - 2y + a)^2 = 3.$$ Then it is necessarily true that:",
    options: [
      { id: "A", content: "For all values of $a$, $C_a \\cap \\mathbb{R}^2 \\neq \\emptyset$." },
      { id: "B", content: "For exactly two values of $a$, $C_a$ is a hyperbola." },
      { id: "C", content: "For no value of $a$, $C_a$ is a degenerate parabola." },
      { id: "D", content: "For infinitely many values of $a$, $C_a$ is an ellipse." },
    ],
    correct: "A",
    explanation:
      "The equation factors as $(x-2y+a-\\sqrt{3})(x-2y+a+\\sqrt{3})=0$: for every $a$, $C_a$ is the pair of real parallel lines $x-2y+a=\\pm\\sqrt{3}$, so it always contains real points and (A) is true. (B) is false: the quadratic part is the perfect square $(x-2y)^2$, whose matrix $\\begin{pmatrix}1&-2\\\\-2&4\\end{pmatrix}$ has determinant $0$, so the conic is of parabolic type for every $a$ — never a hyperbola. (C) is false for the same reason but in the opposite direction: it is a degenerate parabola (two parallel lines) for every $a$, not for no value of $a$. (D) is false: a degenerate parabolic-type conic is never an ellipse.",
    theory:
      "A conic $(\\ell(x,y))^2=c$ with $\\ell$ linear and $c>0$ always splits into two real parallel lines: a degenerate parabola, nonempty for every value of the parameter.",
    source: "LAG exams/2.txt (June 2025, version B1, Q4)",
  },
  {
    id: "lag-jun25-b1-q5",
    module: "Written part",
    topic: "Linear maps",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $F : \\mathbb{R}^2 \\to \\mathbb{R}^2$ be the linear map such that $$F(e_1) = e_1 + e_2 \\quad\\text{and}\\quad F(e_2) = e_1 + e_2,$$ where $\\{e_1, e_2\\}$ is a basis of $\\mathbb{R}^2$. Then it is necessarily true that:",
    options: [
      { id: "A", content: "$F$ is surjective." },
      { id: "B", content: "$2$ is an eigenvalue of $F$." },
      { id: "C", content: "There does not exist a basis of $\\mathbb{R}^2$ made by eigenvectors of $F$." },
      { id: "D", content: "$\\ker F = \\{(0,0)\\}$." },
    ],
    correct: "B",
    explanation:
      "In the basis $\\{e_1,e_2\\}$ the matrix of $F$ is $\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$, with characteristic polynomial $\\lambda^2-2\\lambda=\\lambda(\\lambda-2)$; the eigenvalues are $0$ and $2$, so $2$ is an eigenvalue ($F(e_1+e_2)=2(e_1+e_2)$) and (B) is true. (A) and (D) are false: the matrix has rank $1$ and $\\det=0$, so $F(e_1-e_2)=0$ gives a non-trivial kernel and a $1$-dimensional image — $F$ is neither injective nor surjective. (C) is false: the two distinct eigenvalues $0$ and $2$ give the eigenvector basis $\\{e_1-e_2,\\;e_1+e_2\\}$ of $\\mathbb{R}^2$.",
    theory:
      "For a rank-one map $F$ with $F(e_1)=F(e_2)=w$, the eigenvalues are $0$ (on $e_1-e_2$) and the 'trace' value on $w$; distinct eigenvalues always yield a basis of eigenvectors.",
    source: "LAG exams/2.txt (June 2025, version B1, Q5)",
  },
  {
    id: "lag-jun25-b1-q6",
    module: "Written part",
    topic: "Linear systems & rank",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $A$ and $B$ be $n\\times n$ matrices. If $\\operatorname{rk}(A) = \\operatorname{rk}(B)$, then it is necessarily true that:",
    options: [
      { id: "A", content: "$\\dim \\operatorname{Row}A = \\dim \\operatorname{Col}B$." },
      { id: "B", content: "$A$ and $B$ have the same number of non-zero rows." },
      { id: "C", content: "The systems $Ax = b$ and $Bx = b$ have the same solution space." },
      { id: "D", content: "$A$ and $B$ are row-equivalent." },
    ],
    correct: "A",
    explanation:
      "For any matrix, row rank equals column rank equals $\\operatorname{rk}$: $\\dim\\operatorname{Row}A=\\operatorname{rk}(A)=\\operatorname{rk}(B)=\\dim\\operatorname{Col}B$, so (A) is always true. (B) is false: rank does not count non-zero rows — e.g. $\\begin{pmatrix}1&0\\\\1&0\\end{pmatrix}$ has two non-zero rows but rank $1$, while $\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$ has one. (C) is false: equal rank says nothing about the actual solution sets — $A=I$ and $B=2I$ have equal rank but $Ax=b$ and $Bx=b$ have different solutions for $b\\neq 0$. (D) is false: row-equivalent matrices must share the same row space, not merely the same rank.",
    theory:
      "The fundamental rank theorem: $\\dim\\operatorname{Row}M=\\dim\\operatorname{Col}M=\\operatorname{rk}(M)$ for every matrix, so equal ranks equate any row-space dimension with any column-space dimension.",
    source: "LAG exams/2.txt (June 2025, version B1, Q6)",
  },
  {
    id: "lag-jun25-b1-q7",
    module: "Written part",
    topic: "Vector spaces & bases",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $\\{v_1, v_2, v_3\\} \\subset \\mathbb{R}^5$ be a linearly independent set and set $V = L\\{v_1, v_2, v_3\\}$. Find the correct statement.",
    options: [
      {
        id: "A",
        content: "There exists $v \\in V$ such that $\\{v_1, v_2, v_3, v\\}$ is a linearly independent set.",
      },
      { id: "B", content: "There exists exactly one basis of $\\mathbb{R}^5$ containing $v_1, v_2$ and $v_3$." },
      {
        id: "C",
        content: "There exists $v \\in \\mathbb{R}^5$ such that $\\{v_1, v_2, v_3, v\\}$ is a linearly independent set.",
      },
      {
        id: "D",
        content: "For some $u, v \\in V$ the set $\\{v_1, v_2, v_3, u, v\\}$ is a basis of $\\mathbb{R}^5$.",
      },
    ],
    correct: "C",
    explanation:
      "$V$ is a $3$-dimensional subspace of the $5$-dimensional space $\\mathbb{R}^5$, so $V\\neq\\mathbb{R}^5$ and any $v\\notin V$ makes $\\{v_1,v_2,v_3,v\\}$ linearly independent — such $v$ exists, so (C) is true. (A) is false: every $v\\in V$ is a linear combination of $v_1,v_2,v_3$, so adding it always produces a dependent set. (D) is false: with $u,v\\in V$ the five vectors still span only the $3$-dimensional $V$, never all of $\\mathbb{R}^5$. (B) is false: the completion of an independent set to a basis is far from unique — there are infinitely many choices of the two extra vectors.",
    theory:
      "An independent set extends by $v$ iff $v$ lies outside its span; since a proper subspace never exhausts the ambient space, extensions always exist and in infinitely many ways.",
    source: "LAG exams/2.txt (June 2025, version B1, Q7)",
  },
  {
    id: "lag-jun25-b1-q8",
    module: "Written part",
    topic: "Orthogonality & quadratic forms",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Consider the quadratic form $q(x, y, z) = (x + y + z)^2 - (x + y - z)^2$ and let $A$ be its associated symmetric matrix. Find the correct statement.",
    options: [
      { id: "A", content: "$q$ is positive definite." },
      { id: "B", content: "The eigenvalues of $A$ are all negative." },
      { id: "C", content: "The characteristic polynomial of $A$ is $x^3$." },
      { id: "D", content: "$q$ is indefinite." },
    ],
    correct: "D",
    explanation:
      "By the difference-of-squares identity, $q=\\big[(x+y+z)+(x+y-z)\\big]\\big[(x+y+z)-(x+y-z)\\big]=(2x+2y)(2z)=4xz+4yz$. Then $q(1,0,1)=4>0$ and $q(1,0,-1)=-4<0$, so $q$ takes both signs: it is indefinite and (D) is true. (A) is false since $q$ takes negative values. (B) is false: an indefinite form has eigenvalues of both signs (here $0$ and $\\pm 2\\sqrt{2}$; also $\\operatorname{tr}A=0$ rules out all-negative). (C) is false: the characteristic polynomial is $-\\lambda^3+8\\lambda$, not $\\lambda^3$ — if it were $x^3$ all eigenvalues would be $0$ and the symmetric matrix would be the zero matrix, but $q\\not\\equiv 0$.",
    theory:
      "A difference of squares of two independent linear forms factors as a product of linear forms, hence is an indefinite quadratic form (eigenvalues of both signs).",
    source: "LAG exams/2.txt (June 2025, version B1, Q8)",
  },

  // ───────────────────────────── Version C1 ─────────────────────────────
  {
    id: "lag-jun25-c1-q1",
    module: "Written part",
    topic: "Linear maps",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $F : \\mathbb{R}^2 \\to \\mathbb{R}^2$ be the linear map such that $$F(e_1) = e_1 + e_2 \\quad\\text{and}\\quad F(e_2) = e_1 + e_2,$$ where $\\{e_1, e_2\\}$ is a basis of $\\mathbb{R}^2$. Then it is necessarily true that:",
    options: [
      { id: "A", content: "$F$ is surjective." },
      { id: "B", content: "$1$ is an eigenvalue of $F$." },
      { id: "C", content: "There exists a basis of $\\mathbb{R}^2$ made by eigenvectors of $F$." },
      { id: "D", content: "$\\ker F = \\{(0,0)\\}$." },
    ],
    correct: "C",
    explanation:
      "The matrix of $F$ in the basis $\\{e_1,e_2\\}$ is $\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$, whose characteristic polynomial $\\lambda^2-2\\lambda$ gives the two distinct eigenvalues $0$ and $2$. Distinct eigenvalues yield independent eigenvectors: $F(e_1-e_2)=0$ and $F(e_1+e_2)=2(e_1+e_2)$, so $\\{e_1-e_2,\\;e_1+e_2\\}$ is a basis of eigenvectors and (C) is true. (A) is false: the image is the line spanned by $e_1+e_2$ (rank $1$), so $F$ is not surjective. (B) is false: the eigenvalues are $0$ and $2$, not $1$. (D) is false: $e_1-e_2$ is a nonzero kernel vector.",
    theory:
      "A linear map with $n$ distinct eigenvalues on an $n$-dimensional space is always diagonalizable — the eigenvectors form a basis even when the map is singular.",
    source: "LAG exams/2.txt (June 2025, version C1, Q1)",
  },
  {
    id: "lag-jun25-c1-q2",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Let $A=(a_{ij})$ be the $3\\times 3$ matrix such that $a_{ij}=1$ if $i+j$ is even and $a_{ij}=0$ if $i+j$ is odd. Find the correct statement.",
    options: [
      { id: "A", content: "The matrix $\\frac{\\sqrt{3}}{3}A$ is not diagonalizable." },
      { id: "B", content: "The matrix $\\frac{\\sqrt{3}}{3}A$ is orthogonal." },
      { id: "C", content: "The matrix $\\frac{\\sqrt{3}}{3}A$ is the matrix of a rotation in the space." },
      { id: "D", content: "The matrix $\\frac{\\sqrt{3}}{3}A$ has rank $2$." },
    ],
    correct: "D",
    explanation:
      "The condition '$i+j$ even' gives $A=\\begin{pmatrix}1&0&1\\\\0&1&0\\\\1&0&1\\end{pmatrix}$. Rows $1$ and $3$ are equal while rows $1$ and $2$ are independent, so $\\operatorname{rk}A=2$; multiplying by the nonzero scalar $\\frac{\\sqrt{3}}{3}$ does not change the rank, hence (D) is true. (A) is false: $\\frac{\\sqrt{3}}{3}A$ is real symmetric, so the spectral theorem makes it diagonalizable. (B) is false: an orthogonal matrix has orthonormal columns and is invertible, but this matrix is singular (rank $2<3$). (C) is false: a rotation matrix is orthogonal with determinant $1$, impossible for a singular matrix.",
    theory:
      "Scalar multiples preserve rank and symmetry: a symmetric singular matrix stays diagonalizable but can never be orthogonal or a rotation, since those require full rank.",
    source: "LAG exams/2.txt (June 2025, version C1, Q2)",
  },
  {
    id: "lag-jun25-c1-q3",
    module: "Written part",
    topic: "Orthogonality & quadratic forms",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Consider the quadratic form $q(x, y, z) = (x - 2y + z)^2 + (x + 2y - z)^2$ and let $A$ be its associated symmetric matrix. Find the correct statement.",
    options: [
      { id: "A", content: "$q$ is positive definite." },
      { id: "B", content: "The characteristic polynomial of $A$ is $x^3$." },
      { id: "C", content: "The product of the eigenvalues of $A$ is zero." },
      { id: "D", content: "$q$ is indefinite." },
    ],
    correct: "C",
    explanation:
      "Writing $w=2y-z$, we get $q=(x-w)^2+(x+w)^2=2x^2+2w^2=2x^2+2(2y-z)^2$, so $A=\\begin{pmatrix}2&0&0\\\\0&8&-4\\\\0&-4&2\\end{pmatrix}$ and $\\det A=2(16-16)=0$. The product of the eigenvalues equals $\\det A=0$, so (C) is true. (A) is false: $q$ vanishes on the nonzero vector $(0,1,2)$ (where $x=0$ and $2y=z$), so $q$ is only positive semidefinite. (D) is false: as a sum of squares, $q\\ge 0$ everywhere, never negative. (B) is false: $\\operatorname{tr}A=12\\neq 0$, while a characteristic polynomial $x^3$ would force trace $0$ (indeed the eigenvalues are $0,2,10$).",
    theory:
      "A sum of squares of two linear forms in three variables is positive semidefinite with a non-trivial radical, so $\\det A$ (the product of eigenvalues) is $0$.",
    source: "LAG exams/2.txt (June 2025, version C1, Q3)",
  },
  {
    id: "lag-jun25-c1-q4",
    module: "Written part",
    topic: "Matrices & determinants",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $A$ and $B$ be $n\\times n$ matrices. If $\\operatorname{Det}(A) = \\operatorname{Det}(B)$, then it is necessarily true that:",
    options: [
      {
        id: "A",
        content:
          "The system $ABx = b$ has a unique solution if and only if the system $BAx = b$ has a unique solution.",
      },
      { id: "B", content: "$A$ and $B$ are row-equivalent." },
      { id: "C", content: "$\\dim \\operatorname{Row}A = \\dim \\operatorname{Row}B$." },
      { id: "D", content: "$\\operatorname{Col}A = \\operatorname{Col}B$." },
    ],
    correct: "A",
    explanation:
      "By Binet's theorem $\\det(AB)=\\det A\\,\\det B=\\det(BA)$, so $AB$ is invertible exactly when $BA$ is; a square system has a unique solution iff its matrix has nonzero determinant, hence the two systems are simultaneously uniquely solvable and (A) is true — note this needs no hypothesis at all. (C) is false: equal determinants do not force equal rank — e.g. two singular $3\\times 3$ matrices both have $\\det=0$ but can have ranks $1$ and $2$. (B) is false for the same example: matrices of different rank are never row-equivalent. (D) is false: even matrices with equal determinant and equal rank can have different column spaces — e.g. $\\operatorname{diag}(1,0)$ and $\\operatorname{diag}(0,1)$ both have determinant $0$ and rank $1$, but their column spaces are the two different coordinate axes.",
    theory:
      "$\\det(AB)=\\det(BA)=\\det A\\det B$ always, so $ABx=b$ and $BAx=b$ are simultaneously Cramer systems; a determinant only detects invertibility, not the rank or the spaces themselves.",
    source: "LAG exams/2.txt (June 2025, version C1, Q4)",
  },
  {
    id: "lag-jun25-c1-q5",
    module: "Written part",
    topic: "Lines & planes",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Consider the family of lines $s_t : x = y = tz + 2t$ where $t \\in \\mathbb{R}$. Find the correct statement.",
    options: [
      { id: "A", content: "There exists $a \\in \\mathbb{R}$ such that $s_a$ and $s_0$ are skew lines." },
      { id: "B", content: "For all $a \\in \\mathbb{R}$ the lines $s_a$ and $s_0$ are parallel lines." },
      {
        id: "C",
        content: "There exists $a \\in \\mathbb{R}$ such that the lines $s_a$ and $s_0$ intersect in exactly one point.",
      },
      {
        id: "D",
        content: "For all $a \\in \\mathbb{R}$, with $a \\neq 0$, the lines $s_a$ and $s_0$ are not coplanar.",
      },
    ],
    correct: "C",
    explanation:
      "$s_0$ is $x=y=0$, the $z$-axis, with direction $(0,0,1)$. For $a\\neq 0$, $s_a$ is $x=y$, $y=a(z+2)$, with direction $(1,1,1/a)$; setting $x=y=0$ gives $z=-2$, so $s_a$ passes through $(0,0,-2)$, which also lies on $s_0$. Since the directions $(1,1,1/a)$ and $(0,0,1)$ are not proportional, $s_a$ and $s_0$ (e.g. $a=1$) meet in exactly the one point $(0,0,-2)$, so (C) is true. (A) and (D) are false: all the lines lie in the plane $x=y$ (indeed they share the point $(0,0,-2)$), so no pair is skew and every pair is coplanar. (B) is false: the directions differ, so the lines are incident, not parallel.",
    theory:
      "Two coplanar lines with non-proportional directions intersect in exactly one point; a common point of a family of lines makes every pair intersecting, never skew or parallel.",
    source: "LAG exams/2.txt (June 2025, version C1, Q5)",
  },
  {
    id: "lag-jun25-c1-q6",
    module: "Written part",
    topic: "Linear systems & rank",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** If $u$ and $v$ are distinct vectors such that $Au = 0$ and $Av = 0$, then it is necessarily true that:",
    options: [
      { id: "A", content: "The determinant of $A$ is one." },
      { id: "B", content: "The system of equations $Ax = 0$ has finitely many solutions." },
      { id: "C", content: "$A$ is not invertible." },
      { id: "D", content: "The vector $u$ is a solution of the system of equations $Ax = v$." },
    ],
    correct: "C",
    explanation:
      "Since $u\\neq v$, the vector $u-v\\neq 0$ satisfies $A(u-v)=0$: the kernel of $A$ is non-trivial. A non-square matrix is never invertible, and a square matrix with non-trivial kernel is singular — in every case $A$ is not invertible, so (C) is true. (A) is false: if defined at all, the determinant must be $0$, not $1$ (an invertible matrix has trivial kernel). (B) is false: the kernel contains the whole line $t(u-v)$, so $Ax=0$ has infinitely many solutions. (D) is false: $Au=0$, but $v$ need not be the zero vector, so $u$ generally does not solve $Ax=v$.",
    theory:
      "Two distinct kernel vectors force $\\ker A\\neq\\{0\\}$, which simultaneously kills invertibility and makes the homogeneous solution set infinite (a subspace of positive dimension).",
    source: "LAG exams/2.txt (June 2025, version C1, Q6)",
  },
  {
    id: "lag-jun25-c1-q7",
    module: "Written part",
    topic: "Vector spaces & bases",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $\\{v_1, v_2, v_3\\} \\subset \\mathbb{R}^5$ be a linearly independent set and set $V = L\\{v_1, v_2, v_3\\}$. Find the correct statement.",
    options: [
      {
        id: "A",
        content: "For no $u, v \\in V$ the set $\\{v_1, v_2, v_3, u, v\\}$ is a basis of $\\mathbb{R}^5$.",
      },
      { id: "B", content: "There exists exactly one basis of $\\mathbb{R}^5$ containing $v_1, v_2$ and $v_3$." },
      {
        id: "C",
        content: "There exists $v \\in V$ such that $\\{v_1, v_2, v_3, v\\}$ is a linearly independent set.",
      },
      {
        id: "D",
        content: "There does not exist $v \\in \\mathbb{R}^5$ such that $\\{v_1, v_2, v_3, v\\}$ is a linearly independent set.",
      },
    ],
    correct: "A",
    explanation:
      "If $u,v\\in V$ then all five vectors lie in the $3$-dimensional subspace $V$, so $L\\{v_1,v_2,v_3,u,v\\}=V\\neq\\mathbb{R}^5$: the set can never span $\\mathbb{R}^5$, let alone be a basis (five vectors in a $3$-dimensional space are also automatically dependent). Hence (A) is true. (C) is false: any $v\\in V$ is a combination of $v_1,v_2,v_3$, so the enlarged set is always dependent. (D) is false: since $\\dim\\mathbb{R}^5=5>3$, vectors outside $V$ exist and extend the set independently. (B) is false: such an extension can be completed to a basis in infinitely many ways.",
    theory:
      "Vectors taken inside a span add nothing: a basis extension must use vectors outside the current span, and more than $\\dim V$ vectors inside $V$ are always dependent.",
    source: "LAG exams/2.txt (June 2025, version C1, Q7)",
  },
  {
    id: "lag-jun25-c1-q8",
    module: "Written part",
    topic: "Conics & quadrics",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Let $a \\in \\mathbb{R}$ and consider the conic of equation $$C_a : (2x - y + a)^2 = 2.$$ Then it is necessarily true that:",
    options: [
      { id: "A", content: "For at least one value of $a$, $C_a \\cap \\mathbb{R}^2 = \\emptyset$." },
      { id: "B", content: "For exactly two values of $a$, $C_a$ is a hyperbola." },
      { id: "C", content: "For infinitely many values of $a$, $C_a$ is an ellipse." },
      { id: "D", content: "For all values of $a$, $C_a$ is a degenerate parabola." },
    ],
    correct: "D",
    explanation:
      "The equation factors as $(2x-y+a-\\sqrt{2})(2x-y+a+\\sqrt{2})=0$, i.e. the two real parallel lines $2x-y+a=\\pm\\sqrt{2}$. The quadratic part is the perfect square $(2x-y)^2$, whose matrix $\\begin{pmatrix}4&-2\\\\-2&1\\end{pmatrix}$ has determinant $0$: parabolic type, and since it splits into parallel lines it is a degenerate parabola for every $a$, so (D) is true. (A) is false: two real lines always contain real points, so $C_a$ is never empty. (B) and (C) are false: a conic with degenerate parabolic quadratic part is never a hyperbola nor an ellipse, for any $a$ — the parameter $a$ only translates the pair of lines.",
    theory:
      "In $(\\ell(x,y)+a)^2=c$ the parameter $a$ merely shifts the two parallel lines $\\ell=-a\\pm\\sqrt{c}$; the conic type (degenerate parabola) is the same for every $a$.",
    source: "LAG exams/2.txt (June 2025, version C1, Q8)",
  },

  // ───────────────────────────── Version D1 ─────────────────────────────
  {
    id: "lag-jun25-d1-q1",
    module: "Written part",
    topic: "Vector spaces & bases",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $\\{v_1, v_2, v_3\\} \\subset \\mathbb{R}^5$ be a linearly independent set and set $V = L\\{v_1, v_2, v_3\\}$. Find the correct statement.",
    options: [
      { id: "A", content: "There exists exactly one basis of $\\mathbb{R}^5$ containing $v_1, v_2$ and $v_3$." },
      {
        id: "B",
        content: "There exists $v \\in V$ such that $\\{v_1, v_2, v_3, v\\}$ is a linearly independent set.",
      },
      {
        id: "C",
        content: "For some $u, v \\in V$ the set $\\{v_1, v_2, v_3, u, v\\}$ is a basis of $\\mathbb{R}^5$.",
      },
      {
        id: "D",
        content: "There exists $v \\in \\mathbb{R}^5$ such that $\\{v_1, v_2, v_3, v\\}$ is a linearly independent set.",
      },
    ],
    correct: "D",
    explanation:
      "$V$ is a $3$-dimensional subspace of $\\mathbb{R}^5$, hence a proper subspace: any vector $v\\in\\mathbb{R}^5\\setminus V$ is not a combination of $v_1,v_2,v_3$, so $\\{v_1,v_2,v_3,v\\}$ is linearly independent — such $v$ exists and (D) is true. (B) is false: every $v\\in V$ already depends on $v_1,v_2,v_3$, so the enlarged set is dependent. (C) is false: with $u,v\\in V$ the five vectors span only $V$ ($\\dim 3$), never $\\mathbb{R}^5$. (A) is false: an independent set can be completed to a basis in infinitely many different ways, not exactly one.",
    theory:
      "By the basis-extension theorem, any independent set in a space of larger dimension can be extended (in infinitely many ways) using vectors outside its span — and only with such vectors.",
    source: "LAG exams/2.txt (June 2025, version D1, Q1)",
  },
  {
    id: "lag-jun25-d1-q2",
    module: "Written part",
    topic: "Orthogonality & quadratic forms",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Consider the quadratic form $q(x, y, z) = (2x + y + z)^2 - (2x + y - z)^2$ and let $A$ be its associated symmetric matrix. Find the correct statement.",
    options: [
      { id: "A", content: "$q$ is positive definite." },
      { id: "B", content: "The eigenvalues of $A$ are all negative." },
      { id: "C", content: "The characteristic polynomial of $A$ is $x^3$." },
      { id: "D", content: "$q$ is indefinite." },
    ],
    correct: "D",
    explanation:
      "By the difference-of-squares identity, $q=\\big[(2x+y+z)+(2x+y-z)\\big]\\big[(2x+y+z)-(2x+y-z)\\big]=(4x+2y)(2z)=8xz+4yz$. Then $q(1,0,1)=8>0$ and $q(1,0,-1)=-8<0$: $q$ takes both signs, so it is indefinite and (D) is true, while (A) is immediately false. (B) is false: $\\operatorname{tr}A=0$, so the eigenvalues cannot all be negative (they are $0,\\pm 2\\sqrt{5}$). (C) is false: a symmetric matrix with characteristic polynomial $x^3$ would have all eigenvalues $0$ and hence be the zero matrix, but $q\\not\\equiv 0$; the actual characteristic polynomial is $-\\lambda^3+20\\lambda$.",
    theory:
      "$(P)^2-(Q)^2=(P+Q)(P-Q)$ turns a difference of squares into a product of independent linear forms — always an indefinite quadratic form with zero trace contribution.",
    source: "LAG exams/2.txt (June 2025, version D1, Q2)",
  },
  {
    id: "lag-jun25-d1-q3",
    module: "Written part",
    topic: "Conics & quadrics",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Let $a \\in \\mathbb{R}$ and consider the conic of equation $$C_a : (2x - y + a)^2 = 2.$$ Then it is necessarily true that:",
    options: [
      { id: "A", content: "For exactly two values of $a$, $C_a$ is a degenerate parabola." },
      { id: "B", content: "For at least one value of $a$, $C_a \\cap \\mathbb{R}^2 = \\emptyset$." },
      { id: "C", content: "For no value of $a$, $C_a$ is a hyperbola." },
      { id: "D", content: "For infinitely many values of $a$, $C_a$ is an ellipse." },
    ],
    correct: "C",
    explanation:
      "For every $a$ the equation splits as $2x-y+a=\\pm\\sqrt{2}$: a pair of real parallel lines. The quadratic part $(2x-y)^2$ has matrix $\\begin{pmatrix}4&-2\\\\-2&1\\end{pmatrix}$ with determinant $0$, so the conic is of parabolic type for every $a$ and can never be a hyperbola — (C) is true. (A) is false: it is a degenerate parabola for all values of $a$, not just two. (B) is false: the two lines always carry real points, so $C_a$ is never empty. (D) is false: a degenerate parabolic conic is never an ellipse.",
    theory:
      "The type of a conic is decided by the invariants of its quadratic part; a perfect-square quadratic part has zero discriminant, so the conic is parabolic (here: two parallel lines) for every value of the translation parameter.",
    source: "LAG exams/2.txt (June 2025, version D1, Q3)",
  },
  {
    id: "lag-jun25-d1-q4",
    module: "Written part",
    topic: "Eigenvalues & diagonalization",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Let $A=(a_{ij})$ be the $3\\times 3$ matrix such that $a_{ij}=1$ if $i+j=4$ and $a_{ij}=0$ if $i+j\\neq 4$. Find the correct statement.",
    options: [
      { id: "A", content: "The matrix $A$ is not diagonalizable." },
      { id: "B", content: "The matrix $A$ is the matrix of a rotation in the space." },
      { id: "C", content: "The matrix $A$ is orthogonal." },
      { id: "D", content: "The matrix $A$ has rank $1$." },
    ],
    correct: "C",
    explanation:
      "The entries with $i+j=4$ are $(1,3),(2,2),(3,1)$, so $A=\\begin{pmatrix}0&0&1\\\\0&1&0\\\\1&0&0\\end{pmatrix}$, the exchange matrix. Its columns are $e_3,e_2,e_1$ — an orthonormal set — so $A^\\top A=I$ and $A$ is orthogonal: (C) is true. (A) is false: $A$ is real symmetric, hence diagonalizable (eigenvalues $1,1,-1$). (B) is false: $\\det A=-1$ (a transposition permutation), while a rotation requires determinant $+1$ — $A$ is a reflection. (D) is false: the three columns are linearly independent, so $\\operatorname{rk}A=3$, not $1$.",
    theory:
      "A permutation matrix is always orthogonal with $\\det=\\pm 1$ (the sign of the permutation); it represents a rotation only when the sign is $+1$.",
    source: "LAG exams/2.txt (June 2025, version D1, Q4)",
  },
  {
    id: "lag-jun25-d1-q5",
    module: "Written part",
    topic: "Lines & planes",
    tags: ["past-exam"],
    difficulty: "hard",
    prompt:
      "**[Real exam — June 2025]** Consider the family of lines $s_t : 3x = 3y = tz + 2t$ where $t \\in \\mathbb{R}$. Find the correct statement.",
    options: [
      {
        id: "A",
        content: "There does not exist $a \\in \\mathbb{R}$ such that $s_a$ and $s_0$ are skew lines.",
      },
      {
        id: "B",
        content:
          "There exists $a \\in \\mathbb{R}$, with $a \\neq 0$, such that the lines $s_a$ and $s_0$ are parallel lines.",
      },
      { id: "C", content: "For all $a \\in \\mathbb{R}$ the lines $s_a$ and $s_0$ are orthogonal." },
      {
        id: "D",
        content: "For all $a \\in \\mathbb{R}$, with $a \\neq 0$, the lines $s_a$ and $s_0$ are not coplanar.",
      },
    ],
    correct: "A",
    explanation:
      "Every line of the family satisfies $3x=3y$, i.e. lies in the plane $x=y$; two lines in a common plane are coplanar, hence never skew, so (A) is true (and (D) is false for the same reason — in fact all the lines even share the point $(0,0,-2)$). (B) is false: $s_0$ is the $z$-axis with direction $(0,0,1)$, while for $a\\neq 0$ the line $s_a$ ($x=y$, $3y=a(z+2)$) has direction $(1,1,3/a)$, never proportional to $(0,0,1)$. (C) is false: $(0,0,1)\\cdot(1,1,3/a)=3/a\\neq 0$ for $a\\neq 0$, so the lines are not orthogonal (and $s_0$ is certainly not orthogonal to itself).",
    theory:
      "Skewness requires non-coplanarity: lines cut out by a common linear equation all lie in one plane, so within such a family skew pairs are impossible.",
    source: "LAG exams/2.txt (June 2025, version D1, Q5)",
  },
  {
    id: "lag-jun25-d1-q6",
    module: "Written part",
    topic: "Matrices & determinants",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $A$ and $B$ be $n\\times n$ matrices. If $\\operatorname{Det}(A) = \\operatorname{Det}(B)$, then it is necessarily true that:",
    options: [
      { id: "A", content: "$\\dim \\operatorname{Col}A = \\dim \\operatorname{Col}B$." },
      { id: "B", content: "$\\operatorname{Ker}A = 0$ if and only if $\\operatorname{Ker}B = 0$." },
      { id: "C", content: "The systems $Ax = b$ and $Bx = b$ have the same solution space." },
      { id: "D", content: "$A$ and $B$ are row-equivalent." },
    ],
    correct: "B",
    explanation:
      "For a square matrix, $\\operatorname{Ker}A=\\{0\\}$ iff $\\det A\\neq 0$. Since $\\det A=\\det B$, the determinants are simultaneously zero or nonzero, so the kernels are simultaneously trivial: (B) is true. (A) is false: equal determinants do not force equal rank — two singular matrices both have $\\det=0$ yet can have ranks $1$ and $2$. (C) is false: $A=I$ and any other matrix $B$ with $\\det B=1$ (e.g. $\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$) give different solutions of $Ax=b$ vs $Bx=b$. (D) is false: singular matrices of different rank share $\\det=0$ but are never row-equivalent.",
    theory:
      "The determinant is an invertibility detector: $\\det\\neq 0\\iff\\operatorname{Ker}=\\{0\\}\\iff$ full rank; beyond that yes/no answer it does not determine rank, solution sets, or row-equivalence class.",
    source: "LAG exams/2.txt (June 2025, version D1, Q6)",
  },
  {
    id: "lag-jun25-d1-q7",
    module: "Written part",
    topic: "Linear maps",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** Let $F : \\mathbb{R}^2 \\to \\mathbb{R}^2$ be the linear map such that $$F(e_1) = e_1 + e_2 \\quad\\text{and}\\quad F(e_2) = e_1 + e_2,$$ where $\\{e_1, e_2\\}$ is a basis of $\\mathbb{R}^2$. Then it is necessarily true that:",
    options: [
      { id: "A", content: "There does not exist a basis of $\\mathbb{R}^2$ made by eigenvectors of $F$." },
      { id: "B", content: "$\\operatorname{Im}F = \\mathbb{R}^2$." },
      { id: "C", content: "$F$ is not injective." },
      { id: "D", content: "$1$ is an eigenvalue of $F$." },
    ],
    correct: "C",
    explanation:
      "The matrix of $F$ in the basis $\\{e_1,e_2\\}$ is $\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$, which is singular: $F(e_1-e_2)=F(e_1)-F(e_2)=0$, so the kernel contains the nonzero vector $e_1-e_2$ and $F$ is not injective — (C) is true. (B) is false: the image is spanned by the single vector $e_1+e_2$ (rank $1$), so $\\operatorname{Im}F\\neq\\mathbb{R}^2$. (D) is false: the characteristic polynomial $\\lambda^2-2\\lambda$ has roots $0$ and $2$, not $1$. (A) is false: the distinct eigenvalues $0$ and $2$ give the eigenvector basis $\\{e_1-e_2,\\;e_1+e_2\\}$.",
    theory:
      "A map sending two basis vectors to the same image has $e_1-e_2$ in its kernel: rank $1$, hence neither injective nor surjective, yet still diagonalizable when the eigenvalues are distinct.",
    source: "LAG exams/2.txt (June 2025, version D1, Q7)",
  },
  {
    id: "lag-jun25-d1-q8",
    module: "Written part",
    topic: "Linear systems & rank",
    tags: ["past-exam"],
    difficulty: "medium",
    prompt:
      "**[Real exam — June 2025]** If $u$ and $v$ are distinct vectors such that $Au = b$ and $Av = b$ for some vector $b$, then it is necessarily true that:",
    options: [
      { id: "A", content: "The vector $u - v$ is a solution of the system of equations $Ax = 0$." },
      { id: "B", content: "The determinant of $A$ is zero." },
      { id: "C", content: "$A$ is invertible." },
      { id: "D", content: "The system of equations $Ax = b$ has finitely many solutions." },
    ],
    correct: "A",
    explanation:
      "By linearity $A(u-v)=Au-Av=b-b=0$, so $u-v$ solves the homogeneous system $Ax=0$: (A) is always true. (B) is not necessarily true because $A$ need not be square, and 'the determinant of $A$' is only defined for square matrices (when $A$ is square the determinant is indeed $0$, but the statement is not guaranteed in general). (C) is false: two distinct solutions of $Ax=b$ mean a non-trivial kernel, incompatible with invertibility. (D) is false: the solution set is $u+\\ker A$ and $\\ker A$ contains the whole line spanned by $u-v\\neq 0$, so there are infinitely many solutions.",
    theory:
      "The difference of two solutions of $Ax=b$ always solves $Ax=0$: solution sets of consistent linear systems are affine translates of the kernel.",
    source: "LAG exams/2.txt (June 2025, version D1, Q8)",
  },
];
