import type { Question } from "../../../types";

/* ================================================================== *
 *  TUTORIAL SHEET — "Ex_Taylor&criticalpoints" (A.A. 2025-26)
 *  Official exercise sheet converted to practice questions; every
 *  answer cross-checked against Sol_Taylor&Criticalpoints and
 *  recomputed independently. Ex 3b: the Sol sheet's closing sentence
 *  has a typo ("P4, P6 are local maximum points") — its own argument
 *  (det Hg > 0, g_xx > 0) proves they are local minima; we use the
 *  corrected classification.
 * ================================================================== */

const SRC = "Ex_Taylor&criticalpoints";
const P = "**[Tutorial sheet]** ";

export const tutorialQuestions: Question[] = [
  /* ---------------- Ex 1 — Taylor expansion ---------------- */
  {
    id: "ma2-tut-tc-1",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "easy",
    prompt:
      P +
      "Compute the Taylor polynomial of order $2$ of $f(x,y) = e^{xy}\\cos y$ at $P=(0,0)$. Enter the coefficient of $y^2$ in that polynomial.",
    answer: -0.5,
    tolerance: 0.001,
    placeholder: "e.g. -0.5",
    explanation:
      "The $y^2$ coefficient is $\\tfrac12 f_{yy}(0,0)$. From $f_y = e^{xy}(x\\cos y - \\sin y)$ we get $f_{yy} = e^{xy}\\big(\\cos y\\,(x^2-1) - 2x\\sin y\\big)$, so $f_{yy}(0,0) = -1$ and the coefficient is $-\\tfrac12$. (Full polynomial: $T_2 = 1 + xy - \\tfrac12 y^2$.) A common slip is entering $f_{yy}(0,0)=-1$ itself and forgetting the $\\tfrac12$ from the Taylor formula.",
    theory:
      "Order-2 Taylor at $P$: $T_2(P+h) = f(P) + \\nabla f(P)\\cdot h + \\tfrac12\\, h^{T} H_f(P)\\, h$. Pure second-order coefficients carry the factor $\\tfrac12$; the mixed $xy$ coefficient is $f_{xy}(P)$ itself because the $\\tfrac12$ cancels the $2$ from symmetry.",
  },
  {
    id: "ma2-tut-tc-2",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "medium",
    prompt:
      P +
      "Compute the Taylor polynomial of order $2$ of the function $f\\colon\\mathbb{R}^2\\to\\mathbb{R}$ given by $f(x,y) = e^{xy}\\cos y$ at the point $P=(0,0)$.",
    options: [
      { id: "A", content: "$T_2(x,y) = 1 + xy + \\tfrac12 y^2$" },
      { id: "B", content: "$T_2(x,y) = 1 + xy - \\tfrac12 y^2$" },
      { id: "C", content: "$T_2(x,y) = 1 - xy - \\tfrac12 y^2$" },
      { id: "D", content: "$T_2(x,y) = 1 + \\tfrac12 x^2 - \\tfrac12 y^2$" },
    ],
    correct: "B",
    explanation:
      "At $(0,0)$: $f=1$, $\\nabla f = (0,0)$, and the Hessian is $\\begin{pmatrix}0 & 1\\\\ 1 & -1\\end{pmatrix}$ (from $f_{xx}=y^2e^{xy}\\cos y$, $f_{xy}=e^{xy}(\\cos y\\,(xy+1)-y\\sin y)$, $f_{yy}=e^{xy}(\\cos y\\,(x^2-1)-2x\\sin y)$). So $T_2 = 1 + \\tfrac12(2xy - y^2) = 1 + xy - \\tfrac12 y^2$ — option B. Option A flips the sign of $f_{yy}$ (forgetting $\\cos''=-\\cos$), C flips the mixed term, D invents an $x^2$ term even though $f_{xx}(0,0)=y^2e^{xy}\\cos y\\big|_{(0,0)}=0$.",
    theory:
      "Shortcut worth knowing: multiply the 1-D expansions $e^{xy}\\approx 1+xy$ and $\\cos y \\approx 1-\\tfrac12 y^2$ and drop terms of order $>2$ (counting total degree). This reproduces $1+xy-\\tfrac12 y^2$ without any partial derivatives — a fast check on the Hessian computation.",
  },
  {
    id: "ma2-tut-tc-3",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "easy",
    prompt:
      P +
      "Using the order-2 Taylor polynomial of $f(x,y)=e^{xy}\\cos y$ at $(0,0)$, approximate $f(0.2,\\,0.1)$ (three decimals).",
    answer: 1.015,
    tolerance: 0.001,
    placeholder: "e.g. 1.015",
    explanation:
      "$T_2(x,y) = 1 + xy - \\tfrac12 y^2$, so $T_2(0.2, 0.1) = 1 + 0.02 - 0.005 = 1.015$. The true value is $e^{0.02}\\cos(0.1) \\approx 1.01510$ — the quadratic polynomial is accurate to about $10^{-4}$ this close to the expansion point.",
    theory:
      "This is what Taylor polynomials are for: near $P$ the error of $T_2$ is $o(\\lVert h\\rVert^2)$, so for small displacements the polynomial evaluation replaces the transcendental one almost exactly.",
  },

  /* ---------------- Ex 2a — critical points of x²y + x² − 2y ---------------- */
  {
    id: "ma2-tut-tc-4",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "easy",
    prompt:
      P +
      "Find the critical points of $f(x,y) = x^2 y + x^2 - 2y$. How many critical points does $f$ have?",
    answer: 2,
    tolerance: 0.001,
    placeholder: "integer",
    explanation:
      "$\\nabla f = (2xy + 2x,\\ x^2 - 2) = (0,0)$ gives the system $2x(y+1)=0$, $x^2=2$. The second equation forces $x=\\pm\\sqrt2 \\neq 0$, so the first forces $y=-1$. Exactly two critical points: $(\\sqrt2, -1)$ and $(-\\sqrt2, -1)$. Note that $x=0$ is *not* allowed by $x^2-2=0$ — reading the factored first equation alone and keeping the $x=0$ branch is the standard way to overcount.",
    theory:
      "Critical points of a $C^1$ function are the solutions of $\\nabla f = 0$ — solve the system by factoring each equation and intersecting the cases; every case must satisfy *all* equations simultaneously.",
  },
  {
    id: "ma2-tut-tc-5",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      P +
      "Classify the critical point $(\\sqrt2, -1)$ of $f(x,y) = x^2 y + x^2 - 2y$.",
    options: [
      { id: "A", content: "Local minimum" },
      { id: "B", content: "Local maximum" },
      { id: "C", content: "Saddle point" },
      { id: "D", content: "The Hessian test is inconclusive there" },
    ],
    correct: "C",
    explanation:
      "$H_f(x,y) = \\begin{pmatrix} 2y+2 & 2x \\\\ 2x & 0 \\end{pmatrix}$. At $(\\sqrt2,-1)$: $\\det H_f = (2y+2)\\cdot 0 - (2x)^2 = -8 < 0$, so it is a saddle point (same at $(-\\sqrt2,-1)$). A and B require $\\det H_f > 0$; D requires $\\det H_f = 0$ — here the determinant is strictly negative, so the test *does* decide.",
    theory:
      "Second-derivative test in 2D: $\\det H_f > 0$ with $f_{xx}>0$ → local min; $\\det H_f>0$ with $f_{xx}<0$ → local max; $\\det H_f<0$ → saddle; $\\det H_f=0$ → inconclusive. When a diagonal Hessian entry is $0$ but the off-diagonal is not, the determinant is automatically negative: instant saddle.",
  },
  {
    id: "ma2-tut-tc-6",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      P +
      "For $f(x,y) = x^2 y + x^2 - 2y$, compute $\\det H_f$ at the critical point $(\\sqrt2, -1)$.",
    answer: -8,
    tolerance: 0.001,
    placeholder: "e.g. -8",
    explanation:
      "$f_{xx} = 2y+2$, $f_{xy} = 2x$, $f_{yy} = 0$. At $(\\sqrt2, -1)$: $f_{xx} = 0$, $f_{xy} = 2\\sqrt2$, so $\\det H_f = 0\\cdot 0 - (2\\sqrt2)^2 = -8$. The same value holds at $(-\\sqrt2,-1)$ because $\\det H_f = -4x^2$ only depends on $x^2$.",
    theory:
      "$\\det H_f = f_{xx}f_{yy} - f_{xy}^2$ (Schwarz guarantees $f_{xy}=f_{yx}$ for $C^2$ functions). Its sign is the whole classification story in 2D; its value also equals the product of the two Hessian eigenvalues.",
  },

  /* ---------------- Ex 2b — critical points of x cos y ---------------- */
  {
    id: "ma2-tut-tc-7",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      P +
      "Find and classify the critical points of $f(x,y) = x\\cos y$.",
    options: [
      {
        id: "A",
        content:
          "Infinitely many: $P_k = (0,\\ \\tfrac{\\pi}{2} + k\\pi)$, $k\\in\\mathbb{Z}$, and all of them are saddle points",
      },
      {
        id: "B",
        content: "Exactly one critical point, the origin $(0,0)$, and it is a saddle point",
      },
      {
        id: "C",
        content:
          "Infinitely many: $P_k = (0,\\ \\tfrac{\\pi}{2} + k\\pi)$, alternating local maxima and local minima as $k$ varies",
      },
      {
        id: "D",
        content: "None: $\\cos y = 0$ and $\\sin y = 0$ have no common solution",
      },
    ],
    correct: "A",
    explanation:
      "$\\nabla f = (\\cos y,\\ -x\\sin y) = (0,0)$: the first equation gives $y = \\tfrac{\\pi}{2}+k\\pi$, where $\\sin y = \\pm 1 \\ne 0$, so the second forces $x=0$. Hence $P_k = (0, \\tfrac{\\pi}{2}+k\\pi)$, $k\\in\\mathbb{Z}$. The Hessian is $\\begin{pmatrix} 0 & -\\sin y \\\\ -\\sin y & x\\cos y\\end{pmatrix}$ with $\\det H_f = -\\sin^2 y = -(\\pm1)^2 = -1 < 0$ at every $P_k$: all saddles (A). B misses the whole family (and $(0,0)$ is not even critical: $\\cos 0 = 1$). C is tempting by analogy with $\\cos$ in 1D, but the determinant is negative for *every* $k$ — no alternation. D wrongly requires $\\sin y = 0$ instead of $x\\sin y = 0$.",
    theory:
      "Critical sets can be infinite families; classify them all at once by evaluating $\\det H_f$ with the family parameter left in. Here $\\det H_f(P_k) = -(-1)^{2k} = -1$ independently of $k$.",
  },
  {
    id: "ma2-tut-tc-8",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "easy",
    prompt:
      P +
      "For $f(x,y) = x\\cos y$, compute $\\det H_f$ at the critical point $(0, \\tfrac{\\pi}{2})$.",
    answer: -1,
    tolerance: 0.001,
    placeholder: "e.g. -1",
    explanation:
      "$f_{xx} = 0$, $f_{xy} = -\\sin y$, $f_{yy} = -x\\cos y$... at $(0,\\tfrac{\\pi}{2})$ the diagonal vanishes and $f_{xy} = -1$, so $\\det H_f = 0 - (-1)^2 = -1$. Negative determinant → saddle, confirming the classification of the whole family $P_k$.",
    theory:
      "A Hessian with zero diagonal and nonzero off-diagonal entries always has negative determinant — such critical points are saddles without further work.",
  },

  /* ---------------- Ex 2c — critical points of (x+2)y e^{y−x} ---------------- */
  {
    id: "ma2-tut-tc-9",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "hard",
    prompt:
      P +
      "Find and classify the critical points of $f(x,y) = (x+2)\\,y\\,e^{y-x}$.",
    options: [
      { id: "A", content: "$(-2, 0)$ and $(-1, -1)$, both saddle points" },
      { id: "B", content: "$(-2, 0)$ is a local minimum and $(-1, -1)$ is a saddle point" },
      { id: "C", content: "$(-2, 0)$ and $(-1, -1)$, both local minima" },
      { id: "D", content: "$(-2, 0)$ is a saddle point and $(-1, -1)$ is a local minimum" },
    ],
    correct: "D",
    explanation:
      "$\\nabla f = \\big(-e^{y-x}y(x+1),\\ e^{y-x}(x+2)(y+1)\\big) = (0,0)$ (the exponential never vanishes) gives $y(x+1)=0$ and $(x+2)(y+1)=0$: the branch $y=0$ forces $x=-2$, the branch $x=-1$ forces $y=-1$, so $P_1=(-2,0)$, $P_2=(-1,-1)$. Hessian entries: $f_{xx}=e^{y-x}xy$, $f_{xy}=-e^{y-x}(x+1)(y+1)$, $f_{yy}=e^{y-x}(x+2)(y+2)$. At $P_1$: $f_{xx}=f_{yy}=0$, $f_{xy}=e^2$, so $\\det H_f=-e^4<0$: saddle. At $P_2$ ($e^{y-x}=e^0=1$): $f_{xx}=1$, $f_{xy}=0$, $f_{yy}=1$, so $\\det H_f=1>0$ with $f_{xx}=1>0$: local minimum. That is option D; the others mix up which point gets which label.",
    theory:
      "With products and exponentials, factor the gradient before solving: $e^{g}$ never vanishes and can be divided out, leaving polynomial case analysis. Then classify each point separately — different critical points of the same function routinely have different natures.",
  },
  {
    id: "ma2-tut-tc-10",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      P +
      "$f(x,y) = (x+2)\\,y\\,e^{y-x}$ has a local minimum point. Compute the value of $f$ at that point.",
    answer: -1,
    tolerance: 0.001,
    placeholder: "e.g. -1",
    explanation:
      "The local minimum is at $(-1,-1)$ (where $\\det H_f = 1 > 0$ and $f_{xx} = 1 > 0$; the other critical point $(-2,0)$ is a saddle). There $f(-1,-1) = (-1+2)\\cdot(-1)\\cdot e^{-1-(-1)} = 1\\cdot(-1)\\cdot e^{0} = -1$.",
    theory:
      "Always finish an optimization by evaluating $f$ at the classified points — the exam asks for locations *and* values, and the exponential factor simplifying to $e^0=1$ here is the kind of arithmetic gift worth noticing.",
  },

  /* ---------------- Ex 3a — degenerate Hessian: ½ + 100(x−y)² ---------------- */
  {
    id: "ma2-tut-tc-11",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "easy",
    prompt:
      P +
      "Study minimum and maximum points of $f(x,y) = \\tfrac12 + 100(x-y)^2$. What is the minimum value attained by $f$ on $\\mathbb{R}^2$?",
    answer: 0.5,
    tolerance: 0.001,
    placeholder: "e.g. 0.5",
    explanation:
      "$100(x-y)^2 \\ge 0$ always, with equality exactly when $x=y$. So $f \\ge \\tfrac12$ everywhere and $f = \\tfrac12$ on the whole line $x=y$: the global minimum value is $\\tfrac12$, attained at infinitely many points. No Hessian needed — the direct inequality is the whole argument.",
    theory:
      "When $f = c + (\\text{something})^2\\cdot(\\text{positive constant})$, read the minimum off directly: squares are the cheapest lower bounds in optimization.",
  },
  {
    id: "ma2-tut-tc-12",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "hard",
    prompt:
      P +
      "For $f(x,y) = \\tfrac12 + 100(x-y)^2$, the critical points fill the line $C = \\{x = y\\}$ and $\\det H_f = 200^2 - 200^2 = 0$ there. What can be correctly concluded about the points of $C$?",
    options: [
      {
        id: "A",
        content: "Since the Hessian test is inconclusive, nothing can be said about their nature",
      },
      {
        id: "B",
        content:
          "Every point of $C$ is a global minimum point: $f = \\tfrac12$ on $C$ while $f > \\tfrac12$ off $C$, by direct comparison",
      },
      { id: "C", content: "$\\det H_f = 0$ means they are all saddle points" },
      {
        id: "D",
        content: "Only the origin is a minimum point; the other points of $C$ are not extrema",
      },
    ],
    correct: "B",
    explanation:
      "The Hessian $\\begin{pmatrix}200 & -200\\\\ -200 & 200\\end{pmatrix}$ has zero determinant, so the second-derivative *test* gives no verdict — but the *function* still can be analyzed directly: $f(x,x) = \\tfrac12$ and $f(x,y) = \\tfrac12 + 100(x-y)^2 > \\tfrac12$ whenever $x \\ne y$. Hence every point of $C$ is a (non-strict, non-isolated) global minimum: option B. A confuses \"the test fails\" with \"no conclusion is possible\"; C misreads $\\det = 0$ as the saddle condition (that is $\\det < 0$); D has no basis — all points of the line are on equal footing.",
    theory:
      "$\\det H_f = 0$ ends the second-derivative test, not the analysis. Fall back on the definition: compare $f$ at the candidate with $f$ nearby (or globally). Degenerate minima typically come in continua, like this whole line of minimizers.",
  },

  /* ---------------- Ex 3b — sinh(x⁴ + y³ − 4x² − 3y²) ---------------- */
  {
    id: "ma2-tut-tc-13",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      P +
      "To study the minimum and maximum points of $f(x,y) = \\sinh(x^4 + y^3 - 4x^2 - 3y^2)$, the solution studies $g(x,y) = x^4 + y^3 - 4x^2 - 3y^2$ instead. Why is this legitimate?",
    options: [
      {
        id: "A",
        content:
          "$\\sinh$ is strictly increasing, so $P_0$ is a min/max point of $f$ if and only if it is a min/max point of $g$",
      },
      {
        id: "B",
        content: "$\\sinh$ is bounded, so it cannot change where the extrema are",
      },
      {
        id: "C",
        content: "$\\sinh(0) = 0$, so $f$ and $g$ have the same zeros and hence the same extrema",
      },
      {
        id: "D",
        content: "It is only an approximation, valid because $\\sinh t \\approx t$ near $t = 0$",
      },
    ],
    correct: "A",
    explanation:
      "If $\\varphi$ is strictly increasing, then $g(P) \\le g(Q) \\iff \\varphi(g(P)) \\le \\varphi(g(Q))$: order is preserved, so local/global min and max points of $f = \\varphi\\circ g$ coincide exactly with those of $g$. That is A. B is doubly wrong ($\\sinh$ is unbounded, and boundedness would not preserve extrema anyway); C: sharing zeros says nothing about extrema; D: the equivalence is exact, not an approximation — it holds for all values of $g$, not just near $0$.",
    theory:
      "Monotone-composition trick: to optimize $\\varphi(g)$ with $\\varphi$ strictly increasing, optimize $g$. This is why one minimizes $\\lVert x\\rVert^2$ instead of $\\lVert x\\rVert$, or a log-likelihood instead of a likelihood. (Extremum *values* change — $f = \\sinh(g)$ at the point — but *locations* do not.)",
  },
  {
    id: "ma2-tut-tc-14",
    type: "numeric",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      P +
      "How many critical points does $g(x,y) = x^4 + y^3 - 4x^2 - 3y^2$ (and hence $f = \\sinh\\circ g$) have?",
    answer: 6,
    tolerance: 0.001,
    placeholder: "integer",
    explanation:
      "$\\nabla g = (4x^3 - 8x,\\ 3y^2 - 6y) = \\big(4x(x^2-2),\\ 3y(y-2)\\big) = (0,0)$: $x \\in \\{0, \\sqrt2, -\\sqrt2\\}$ and $y \\in \\{0, 2\\}$ independently, so the critical points are the $3 \\times 2 = 6$ combinations $(0,0)$, $(0,2)$, $(\\pm\\sqrt2, 0)$, $(\\pm\\sqrt2, 2)$.",
    theory:
      "When $\\nabla g$ separates — each component depends on one variable only — the critical set is the Cartesian product of the 1-D root sets, and counting is just multiplication.",
  },
  {
    id: "ma2-tut-tc-15",
    topic: "Taylor & optimization",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "hard",
    prompt:
      P +
      "Classify the six critical points of $g(x,y) = x^4 + y^3 - 4x^2 - 3y^2$ (equivalently of $f = \\sinh\\circ g$): $(0,0)$, $(0,2)$, $(\\pm\\sqrt2, 0)$, $(\\pm\\sqrt2, 2)$.",
    options: [
      {
        id: "A",
        content:
          "$(0,0)$ local minimum; $(\\pm\\sqrt2, 2)$ local maxima; the other three saddle points",
      },
      { id: "B", content: "All six are saddle points" },
      {
        id: "C",
        content:
          "$(0,0)$ local maximum; $(\\pm\\sqrt2, 2)$ local minima; $(0,2)$ and $(\\pm\\sqrt2, 0)$ saddle points",
      },
      {
        id: "D",
        content:
          "$(0,0)$ and $(\\pm\\sqrt2, 2)$ local maxima; $(0,2)$ and $(\\pm\\sqrt2, 0)$ local minima",
      },
    ],
    correct: "C",
    explanation:
      "$H_g = \\begin{pmatrix}12x^2-8 & 0\\\\ 0 & 6y-6\\end{pmatrix}$, $\\det H_g = 24(3x^2-2)(y-1)$. At $(0,0)$: $(-8)(-6)=48>0$ with $g_{xx}=-8<0$ → local max. At $(\\pm\\sqrt2,2)$: $(16)(6)=96>0$ with $g_{xx}=16>0$ → local minima. At $(0,2)$ and $(\\pm\\sqrt2,0)$ the factors have opposite signs, $\\det H_g<0$ → saddles. That is option C. (The official Sol sheet's last line says \"$P_4, P_6$ are local maximum points\" — a typo: its own computation $\\partial^2 g/\\partial x^2(P_4), \\partial^2 g/\\partial x^2(P_6) > 0$ proves they are minima.) A flips every extremum; B ignores the four points with positive determinant; D cannot happen for a diagonal Hessian whose entries it just computed.",
    theory:
      "Diagonal Hessians classify instantly: both diagonal entries negative → max, both positive → min, opposite signs → saddle. Since $\\sinh$ is strictly increasing, this classification transfers verbatim to $f=\\sinh(g)$; only the extremal *values* change (e.g. $f(0,0)=\\sinh 0=0$, $f(\\pm\\sqrt2,2)=\\sinh(-8)$).",
  },
];
