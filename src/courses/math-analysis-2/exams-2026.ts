import type { ExamProblem, NumericQuestion, Question } from "../../types";

/* ================================================================== *
 *  REAL PAST-EXAM PAPERS — A.A. 2025-26, ingested 2026-07:
 *
 *  · JUNE 10th 2026 paper (Sol_June26.pdf) — 7 MCQ + the 9-point
 *    Green's-theorem problem. Fully solved by the professor; every
 *    answer below matches the official "Solution." box AND was
 *    recomputed independently.
 *  · APPELLO 2 (2_Exam_Me.pdf, 02KXUJM/02KXULI/02KXUTR) — 7 MCQ + the
 *    9-point divergence-theorem problem, fully solved; same double
 *    verification.
 *  · 1_Exam_Me.pdf is APPELLO 1 — the SAME paper already ingested in
 *    past-exams.ts (ma2-ap1-e1…e8), so it is deliberately skipped here.
 *
 *  Option letters are the papers' own lettering (kept verbatim).
 *  Tagged past-exam → the official mock draws from here first.
 * ================================================================== */

const SRC_JUNE = "JUNE 10th 2026 · A.A. 2025-26";
const SRC_AP2 = "APPELLO 2 · A.A. 2025-26";

export const examQuestions2026: Question[] = [
  /* ---------------------- JUNE 10th 2026 paper --------------------- */
  {
    id: "ma2-ex26-j1",
    topic: "Limits & continuity",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 1`,
    difficulty: "medium",
    prompt:
      "**[Real exam — JUNE 2026]** Let $F : D = \\operatorname{dom} F \\to \\mathbb R^2$ be defined as $F = (f_1, f_2)$ and let $D_1 = \\operatorname{dom} f_1$, $D_2 = \\operatorname{dom} f_2$. Then:",
    options: [
      { id: "A", content: "If $(x,y) \\in D_1 \\cup D_2$, then $(x,y) \\in D$." },
      { id: "B", content: "If $D_1$ is open, then $D$ is open." },
      { id: "C", content: "If $D_1$ is closed and $D_2$ is connected, then $D$ is closed and connected." },
      { id: "D", content: "If $D$ is open, then $D_1 \\cap D_2$ is open." },
    ],
    correct: "D",
    explanation:
      "The domain of a vector-valued function is where BOTH components make sense: $D = D_1 \\cap D_2$. So the sets in D are literally the same set — if $D$ is open, $D_1 \\cap D_2$ is open, tautologically true. A needs the intersection, not the union: a point where only $f_1$ is defined is not in $D$. B fails because intersecting the open $D_1$ with a non-open $D_2$ can destroy openness (take $D_1 = \\mathbb R^2$, $D_2$ a closed half-plane). C fails twice: the intersection of a closed set with a connected set need be neither closed nor connected.",
    theory:
      "$\\operatorname{dom}(f_1, f_2) = \\operatorname{dom} f_1 \\cap \\operatorname{dom} f_2$ — test every set-theoretic claim against that single identity.",
  },
  {
    id: "ma2-ex26-j2",
    topic: "Differential calculus",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 2`,
    difficulty: "hard",
    prompt:
      "**[Real exam — JUNE 2026]** Let $f(x,y) = \\dfrac{x|x|\\cos y}{|x| + |y|}$ if $(x,y) \\ne (0,0)$ and $f(0,0) = 0$. Then:",
    options: [
      { id: "A", content: "$\\dfrac{\\partial f}{\\partial x}(0,0) = 1$." },
      { id: "B", content: "$\\dfrac{\\partial f}{\\partial y}(0,0) = \\dfrac12$." },
      { id: "C", content: "$\\dfrac{\\partial f}{\\partial x}(0,0) = 0$." },
      { id: "D", content: "$\\dfrac{\\partial f}{\\partial y}(0,0)$ does not exist." },
    ],
    correct: "A",
    explanation:
      "Piecewise definition at the origin ⇒ use the DEFINITION of the partial derivative. Along the $x$-axis: $f(h, 0) = \\frac{h|h|\\cos 0}{|h|} = h$, so $\\partial_x f(0,0) = \\lim_{h\\to0} \\frac{h - 0}{h} = 1$ — A, not C. Along the $y$-axis: $f(0, h) = \\frac{0}{|h|} = 0$, so $\\partial_y f(0,0) = 0$: it exists (kills D) and is $0$, not $\\tfrac12$ (kills B).",
    theory:
      "At the seam of a piecewise function the only legal move is the limit of the difference quotient — plug the axis into $f$ FIRST, then divide by $h$.",
  },
  {
    id: "ma2-ex26-j3",
    topic: "Series & power series",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Real exam — JUNE 2026]** The set of convergence of the power series $\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(x+2)^n}{\\sqrt{1+n}}$ equals:",
    options: [
      { id: "A", content: "$[-1, 1]$." },
      { id: "B", content: "$[-3, -1)$." },
      { id: "C", content: "$(-1, 1]$." },
      { id: "D", content: "$(-3, -1]$." },
    ],
    correct: "B",
    explanation:
      "The series is centred at $x_0 = -2$ with radius $R = 1$ (ratio test: $\\sqrt{(n+2)/(n+1)} \\to 1$), so the candidate interval is $(-3, -1)$ — A and C forget the shift to the centre $-2$ entirely. Endpoints: at $x = -3$ the series is $\\sum (-1)^n/\\sqrt{1+n}$, convergent by Leibniz; at $x = -1$ it is $\\sum 1/\\sqrt{1+n}$, a divergent $p$-series ($p = \\tfrac12 \\le 1$). Include $-3$, exclude $-1$: $[-3, -1)$. D swaps the endpoint behaviour.",
    theory:
      "Radius first, then ALWAYS test both endpoints separately — the classic pattern is Leibniz-convergence at one end, $p$-series divergence at the other.",
  },
  {
    id: "ma2-ex26-j4",
    topic: "Double & triple integrals",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 4`,
    difficulty: "easy",
    prompt:
      "**[Real exam — JUNE 2026]** Let $D := \\{(x,y) \\in \\mathbb R^2 : x^2 + y^2 \\le 1,\\ y \\ge 1 - x\\}$. The area of $D$ equals:",
    options: [
      { id: "A", content: "$\\dfrac{\\pi - 2}{4}$." },
      { id: "B", content: "$\\dfrac{\\pi - 2}{2}$." },
      { id: "C", content: "$\\dfrac{2 - \\pi}{4}$." },
      { id: "D", content: "$\\dfrac{\\pi - 2}{8}$." },
    ],
    correct: "A",
    explanation:
      "Draw it: the line $y = 1 - x$ cuts the unit circle at $(1,0)$ and $(0,1)$, so $D$ is the circular segment between that chord and the arc — all inside the first quadrant. Area $=$ quarter-disk $-$ triangle with legs $1$: $\\frac{\\pi}{4} - \\frac12 = \\frac{\\pi-2}{4}$. B forgets to halve the unit square when subtracting the triangle ($\\pi/2 - 1$ scaled); C has the sign backwards — and $2 - \\pi < 0$ can never be an area; D halves the correct answer once more.",
    theory:
      "Circular segment $=$ sector $-$ triangle. A ten-second sketch beats setting up any integral.",
  },
  {
    id: "ma2-ex26-j5",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 5`,
    difficulty: "medium",
    prompt:
      "**[Real exam — JUNE 2026]** The length of the curve $\\gamma(t) = \\left(t + \\dfrac{t^2}{2},\\ \\dfrac{2\\sqrt2}{3} t^{3/2},\\ \\dfrac{\\sqrt3}{2} t^2\\right)$, $t \\in [0,1]$, equals:",
    options: [
      { id: "A", content: "$2$." },
      { id: "B", content: "$\\dfrac{\\sqrt2}{3}$." },
      { id: "C", content: "$\\sqrt3$." },
      { id: "D", content: "$\\dfrac32$." },
    ],
    correct: "A",
    explanation:
      "$\\gamma'(t) = (1 + t,\\ \\sqrt2\\, t^{1/2},\\ \\sqrt3\\, t)$, so $\\lVert\\gamma'\\rVert^2 = (1+t)^2 + 2t + 3t^2 = 4t^2 + 4t + 1 = (2t+1)^2$ — a perfect square, planted on purpose. $L = \\int_0^1 (2t+1)\\,dt = 1 + 1 = 2$. D is $\\int_0^1 (1+t)\\,dt$ — keeping only the first component of the speed; B and C just recycle the curve's coefficients and come from not expanding the square at all.",
    theory:
      "Exam-grade length integrals ALWAYS hide a perfect square under the root: expand $\\lVert\\gamma'\\rVert^2$ fully and factor before integrating.",
  },
  {
    id: "ma2-ex26-j6",
    topic: "Series & power series",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 6`,
    difficulty: "easy",
    prompt:
      "**[Real exam — JUNE 2026]** Let $(a_n)$ be a sequence and let $S_N = \\displaystyle\\sum_{n=1}^{N} a_n$. The series $\\displaystyle\\sum_{n=1}^{\\infty} a_n$ is convergent if:",
    options: [
      { id: "A", content: "The limit $\\lim_{N\\to\\infty} S_N$ exists." },
      { id: "B", content: "$\\lim_{n\\to\\infty} a_n = 0$." },
      { id: "C", content: "The sequence $S_N$ is bounded." },
      { id: "D", content: "The limit $\\lim_{N\\to\\infty} S_N$ exists and belongs to $\\mathbb R$." },
    ],
    correct: "D",
    explanation:
      "By definition the series converges when the partial sums tend to a FINITE limit — D is exactly that. A is the trap: the limit may exist but equal $\\pm\\infty$ (e.g. $\\sum 1/n$ has $S_N \\to +\\infty$ — limit exists, series diverges). B is only a necessary condition, never sufficient — again the harmonic series. C is not enough either: $\\sum (-1)^n$ has bounded partial sums $\\{-1, 0\\}$ yet oscillates.",
    theory:
      "Convergent series $\\iff$ $S_N \\to S \\in \\mathbb R$ (finite!). $a_n \\to 0$ is necessary; boundedness of $S_N$ suffices only for positive-term series.",
  },
  {
    id: "ma2-ex26-j7",
    topic: "Surfaces, flux & the big theorems",
    tags: ["past-exam"],
    source: `${SRC_JUNE} · Ex 7`,
    difficulty: "hard",
    prompt:
      "**[Real exam — JUNE 2026]** Let $F(x,y,z) = (y^2 + y,\\ 0,\\ z^3)$ and $\\Sigma := \\{(x,y,z) \\in \\mathbb R^3 : x^2 + y^2 \\le 1,\\ z = 2 + y\\}$ with unit normal $n$ satisfying $n \\cdot k > 0$. The work of $F$ along $\\partial\\Sigma$ positively oriented with $n$ equals: *(hint: use Stokes' theorem)*",
    options: [
      { id: "A", content: "$-\\dfrac{\\pi}{2}$" },
      { id: "B", content: "$-2\\pi$" },
      { id: "C", content: "$-\\pi$" },
      { id: "D", content: "$-4\\pi$" },
    ],
    correct: "C",
    explanation:
      "Stokes: $\\oint_{\\partial\\Sigma} F \\cdot dl = \\iint_\\Sigma \\operatorname{curl} F \\cdot n\\,d\\sigma$. Here $\\operatorname{curl} F = (0, 0, -(2y+1))$. Parametrize the tilted disk as $\\sigma(u,v) = (u, v, 2+v)$ over $B_1(0)$; then $N = \\sigma_u \\times \\sigma_v = (0, -1, 1)$, upward as required. Only the third component matters: $\\operatorname{curl}F \\cdot N = -(2v+1)$. Over the symmetric unit disk $\\iint 2v = 0$, so the flux is $-\\iint_{B_1} 1\\,dudv = -\\operatorname{area}(B_1) = -\\pi$. B and D scale the disk area wrong ($2\\pi$, $4\\pi$); A halves it — all slips in $\\operatorname{area}(B_1) = \\pi$.",
    theory:
      "Stokes converts boundary work into a curl flux; on a symmetric domain every odd term dies and only the constant part of $\\operatorname{curl}F \\cdot N$ survives.",
  },

  /* ------------------------- APPELLO 2 paper ----------------------- */
  {
    id: "ma2-ex26-a2e1",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 1`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 2]** Let $\\gamma$ be the arc of the circle centered at the origin joining $(2,0)$ and $(0,2)$ counterclockwise. Then $\\displaystyle\\int_\\gamma xy\\,ds$ equals:",
    options: [
      { id: "A", content: "$4$" },
      { id: "B", content: "$-4$" },
      { id: "C", content: "$\\dfrac14$" },
      { id: "D", content: "$2$" },
    ],
    correct: "A",
    explanation:
      "Parametrize: $\\gamma(t) = (2\\cos t, 2\\sin t)$, $t \\in [0, \\pi/2]$, so $\\lVert\\gamma'(t)\\rVert = 2$. Then $\\int_\\gamma xy\\,ds = \\int_0^{\\pi/2} 4\\cos t \\sin t \\cdot 2\\,dt = 8\\left[\\tfrac{\\sin^2 t}{2}\\right]_0^{\\pi/2} = 4$. B is impossible twice over: $ds$-integrals never feel orientation, and $xy \\ge 0$ on this quarter-circle anyway. D forgets the speed factor $\\lVert\\gamma'\\rVert = 2$; C additionally forgets the radius in $xy = 4\\cos t\\sin t$.",
    theory:
      "Scalar line integrals: $\\int_\\gamma f\\,ds = \\int f(\\gamma(t))\\,\\lVert\\gamma'(t)\\rVert\\,dt$ — always multiply by the speed, and orientation is irrelevant.",
  },
  {
    id: "ma2-ex26-a2e2",
    topic: "Taylor & optimization",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 2`,
    difficulty: "hard",
    prompt: "**[Real exam — APPELLO 2]** The function $f(x,y) = 3y^2 - x^2 y^2$:",
    options: [
      { id: "A", content: "has infinitely many saddle-type critical points" },
      { id: "B", content: "has three saddle-type critical points and one local minimum point" },
      { id: "C", content: "has infinitely many local maximum points" },
      { id: "D", content: "has exactly five critical points" },
    ],
    correct: "C",
    explanation:
      "$\\nabla f = (-2xy^2,\\ 2y(3 - x^2)) = (0,0)$ forces $y = 0$: the critical points are the WHOLE $x$-axis $P_x = (x, 0)$ — infinitely many, so B and D are out immediately. Factor $f = y^2(3 - x^2)$ with $f(P_x) = 0$. For $|x| > \\sqrt3$: nearby $f = y^2(3-x^2) \\le 0 = f(P_x)$, so each such $P_x$ is a local MAXIMUM — infinitely many of them: C. (For $|x| < \\sqrt3$ the axis points are local minima, and only $(\\pm\\sqrt3, 0)$ see both signs — two saddle-type points, not infinitely many, so A fails.)",
    theory:
      "When $\\nabla f$ vanishes on a whole curve the Hessian is degenerate everywhere on it — factor $f$ and study its SIGN around each critical point instead.",
  },
  {
    id: "ma2-ex26-a2e3",
    topic: "Series & power series",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 3`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 2]** The radius of convergence of the series $\\displaystyle\\sum_{n=0}^{\\infty} (-1)^n \\frac{n^5}{3^n} (x+1)^{5n}$ equals:",
    options: [
      { id: "A", content: "$3$" },
      { id: "B", content: "$3^{1/5}$" },
      { id: "C", content: "$\\dfrac13$" },
      { id: "D", content: "$3^{-1/5}$" },
    ],
    correct: "B",
    explanation:
      "The powers jump in steps of $5$, so substitute $y = (x+1)^5$: the series $S(y) = \\sum (-1)^n \\frac{n^5}{3^n} y^n$ has $\\frac1R = \\lim \\frac{(n+1)^5}{3^{n+1}} \\cdot \\frac{3^n}{n^5} = \\frac13$, i.e. it converges for $|y| < 3$. Undo the substitution: $|x+1|^5 < 3 \\iff |x+1| < 3^{1/5}$. A stops at the $y$-radius and forgets to undo the substitution; C is the ratio limit $\\tfrac13$ mistaken for $R$; D combines both errors.",
    theory:
      "For lacunary powers $(x - x_0)^{kn}$, find the radius in $y = (x - x_0)^k$ first, then take the $k$-th root to return to $x$.",
  },
  {
    id: "ma2-ex26-a2e4",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 4`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 2]** Let $D = \\{(x,y) \\in \\mathbb R^2 : 7x^2 + y^2 \\le 11,\\ y \\ge x + 1,\\ x \\ge 0\\}$ be a positively oriented Jordan region. Then $\\displaystyle\\int_{\\partial D} \\left(x^3 - \\tfrac{x}{2}y^2,\\ \\tfrac{x^2}{2}y + e^{2-y}\\right)\\cdot dl$ equals:",
    options: [
      { id: "A", content: "$\\dfrac35$" },
      { id: "B", content: "$\\dfrac94$" },
      { id: "C", content: "$\\dfrac73$" },
      { id: "D", content: "$\\dfrac27$" },
    ],
    correct: "C",
    explanation:
      "Green's theorem: $\\oint_{\\partial D} F \\cdot dl = \\iint_D (\\partial_x F_2 - \\partial_y F_1) = \\iint_D (xy - (-xy)) = 2\\iint_D xy$. Find where the line meets the ellipse: $7x^2 + (x+1)^2 = 11 \\Rightarrow 4x^2 + x - 5 = 0 \\Rightarrow x = 1$ (taking $x \\ge 0$). So $D$ is $x$-normal: $0 \\le x \\le 1$, $1 + x \\le y \\le \\sqrt{11 - 7x^2}$. Then $2\\iint_D xy = \\int_0^1 x\\left[(11 - 7x^2) - (1+x)^2\\right]dx = \\int_0^1 (10x - 2x^2 - 8x^3)\\,dx = 5 - \\tfrac23 - 2 = \\tfrac73$. The other fractions come from slips in expanding $(1+x)^2$ or in the intersection abscissa — the $e^{2-y}$ term never matters: it disappears under $\\partial_x$.",
    theory:
      "Work around a closed Jordan curve $=$ $\\iint (\\partial_x F_2 - \\partial_y F_1)$ by Green; intersect the boundary curves FIRST to set up the normal domain.",
  },
  {
    id: "ma2-ex26-a2e5",
    topic: "Surfaces, flux & the big theorems",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 5`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 2]** Let $\\Sigma$ be the cartesian surface $z = y^2 - x^2$ defined on $D = \\{(x,y) \\in \\mathbb R^2 : 1 \\le x^2 + y^2 \\le 9\\}$. Then $\\displaystyle\\int_\\Sigma \\frac{z + x^2}{\\sqrt{1 + 4x^2 + 4y^2}}\\,d\\sigma$ equals:",
    options: [
      { id: "A", content: "$10\\pi$" },
      { id: "B", content: "$20\\pi$" },
      { id: "C", content: "$40\\pi$" },
      { id: "D", content: "$80\\pi$" },
    ],
    correct: "B",
    explanation:
      "For a graph $z = f(x,y)$, $d\\sigma = \\sqrt{1 + |\\nabla f|^2}\\,dudv = \\sqrt{1 + 4u^2 + 4v^2}\\,dudv$ — EXACTLY the denominator, so it cancels. On $\\Sigma$, $z + x^2 = (v^2 - u^2) + u^2 = v^2$. What remains is a plain double integral: $\\iint_D v^2\\,dudv = \\int_0^{2\\pi}\\!\\!\\sin^2\\theta\\,d\\theta \\int_1^3 r^3\\,dr = \\pi \\cdot \\frac{81 - 1}{4} = 20\\pi$. C uses $2\\pi$ for $\\int \\sin^2$ (forgetting it averages to $\\tfrac12$); D also drops the $\\tfrac14$ from $r^4/4$; A halves the correct result.",
    theory:
      "When an exam integrand carries $\\sqrt{1 + |\\nabla f|^2}$ in the denominator, it is rigged to cancel $d\\sigma$ — recognize it and the surface integral collapses to a polar double integral.",
  },
  {
    id: "ma2-ex26-a2e6",
    topic: "Differential calculus",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 2]** The equation of the tangent plane to the graph of the function $f(x,y) = y\\log(x^2 + y^2)$ at the point $(1, 1, f(1,1))$ is:",
    options: [
      { id: "A", content: "$z = -1 + x + (\\log 2 + 1)y$" },
      { id: "B", content: "$z = -2 + x + (\\log 2 + 1)y$" },
      { id: "C", content: "$z = \\log 2 + x + (\\log 2 + 1)y$" },
      { id: "D", content: "$z = \\log 2 + (x - 1) + (\\log 2 + 1)y$" },
    ],
    correct: "B",
    explanation:
      "$f(1,1) = \\log 2$ and $\\nabla f = \\left(\\frac{2xy}{x^2+y^2},\\ \\log(x^2+y^2) + \\frac{2y^2}{x^2+y^2}\\right)$, so $\\nabla f(1,1) = (1, \\log 2 + 1)$. Plane: $z = \\log 2 + 1\\cdot(x-1) + (\\log 2 + 1)(y - 1)$. Expand ALL of it: $z = \\log 2 + x - 1 + (\\log 2 + 1)y - \\log 2 - 1 = -2 + x + (\\log 2 + 1)y$. The distractors are half-expanded forms: D keeps $(x-1)$ but replaced $(y-1)$ by $y$ without fixing the constant; C drops both $-1$'s; A expands the $x$ part only.",
    theory:
      "Tangent plane: $z = f(P_0) + \\nabla f(P_0)\\cdot(P - P_0)$ — expand the constants completely before comparing with the options.",
  },
  {
    id: "ma2-ex26-a2e7",
    topic: "Series & power series",
    tags: ["past-exam"],
    source: `${SRC_AP2} · Ex 7`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 2]** Let $\\{a_n\\}_n$ be a positive sequence such that $\\lim_{n\\to\\infty} a_n \\left(n \\log^{1/4}(n)\\right) = 4$. Then $\\displaystyle\\sum_{n=1}^{\\infty} a_n$ is:",
    options: [
      { id: "A", content: "$+\\infty$" },
      { id: "B", content: "$-\\infty$" },
      { id: "C", content: "convergent" },
      { id: "D", content: "oscillating" },
    ],
    correct: "A",
    explanation:
      "The hypothesis says $a_n \\sim \\frac{4}{n\\log^{1/4} n}$, so by asymptotic comparison the series behaves like $\\sum \\frac{1}{n\\log^{1/4} n}$. Integral test with $y = \\log x$: $\\int_2^\\infty \\frac{dx}{x\\log^{1/4} x} = \\int_{\\log 2}^\\infty y^{-1/4}\\,dy = +\\infty$ since $\\tfrac14 < 1$ — the log power is too weak, so C fails. Positive terms make the partial sums increasing: they can only converge or blow up to $+\\infty$, so B and D are structurally impossible. Answer: diverges to $+\\infty$.",
    theory:
      "Bertrand-type series: $\\sum \\frac{1}{n\\log^\\alpha n}$ converges iff $\\alpha > 1$. Positive-term series never oscillate — they converge or diverge to $+\\infty$.",
  },
];

/**
 * Auto-gradable parts of the two real 9-point problems. The shared
 * `exam-group:*` tag lets the mock runner keep all three parts from one
 * paper together instead of presenting three unrelated numeric drills as
 * a single "Exercise 8".
 */
export const examOpenParts2026: NumericQuestion[] = [
  {
    id: "ma2-ex26-j8a",
    type: "numeric",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam", "exam-open", "exam-group:june-2026"],
    source: `${SRC_JUNE} · Ex 8(a)`,
    difficulty: "medium",
    prompt:
      "**[Real exam — JUNE 2026 · Exercise 8(a)]** For $F(x,y)=(x^3-y^2,\\ e^{2y}+2x(y+1))$, compute the scalar curl $\\partial_xF_2-\\partial_yF_1$ at $(0,0)$.",
    answer: 2,
    tolerance: 0.001,
    explanation:
      "$\\partial_xF_2=2(y+1)$ and $\\partial_yF_1=-2y$, hence $\\operatorname{curl}F=4y+2$ and $\\operatorname{curl}F(0,0)=2$. Since the curl is not identically zero, $F$ is not conservative on $\\mathbb R^2$.",
    theory:
      "In the plane, test conservativeness with $\\partial_xQ-\\partial_yP$. It must vanish everywhere on the simply connected domain, not just at one point.",
  },
  {
    id: "ma2-ex26-j8b",
    type: "numeric",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam", "exam-open", "exam-group:june-2026"],
    source: `${SRC_JUNE} · Ex 8(b)`,
    difficulty: "hard",
    prompt:
      "**[Real exam — JUNE 2026 · Exercise 8(b)]** $D_1$ is the disk $x^2+(y-3)^2\\le25$, and $\\partial D_1$ is counter-clockwise. If $\\oint_{\\partial D_1}F\\cdot d\\ell=C\\pi$, enter $C$.",
    answer: 350,
    tolerance: 0.001,
    unit: "·π",
    explanation:
      "Green gives $\\oint_{\\partial D_1}F\\cdot d\\ell=\\iint_{D_1}(4y+2)\\,dA$. The disk has area $25\\pi$ and centroid height $\\bar y=3$, so the integral is $(4\\cdot3+2)25\\pi=350\\pi$. Treating the $y$-term as odd would be wrong because the disk is centred at $y=3$, not at the origin.",
    theory:
      "$\\iint_D y\\,dA=\\bar y\\,|D|$ is the centroid shortcut; check the region's actual centre before claiming symmetry.",
  },
  {
    id: "ma2-ex26-j8c",
    type: "numeric",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam", "exam-open", "exam-group:june-2026"],
    source: `${SRC_JUNE} · Ex 8(c)`,
    difficulty: "hard",
    prompt:
      "**[Real exam — JUNE 2026 · Exercise 8(c)]** $D_2$ is the unit disk and $\\partial D_2$ is run clockwise. If $\\oint_{\\partial D_2}F\\cdot d\\ell=C\\pi$, enter $C$.",
    answer: -2,
    tolerance: 0.001,
    unit: "·π",
    explanation:
      "For the positive counter-clockwise orientation, Green gives $\\iint_{D_2}(4y+2)\\,dA=0+2\\pi=2\\pi$. The paper specifies clockwise orientation, so reverse the sign: $-2\\pi$.",
    theory:
      "Green's theorem uses positive (counter-clockwise) orientation. A clockwise traversal multiplies the result by $-1$.",
  },
  {
    id: "ma2-ex26-a2e8c",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["past-exam", "exam-open", "exam-group:appello-2-2026"],
    source: `${SRC_AP2} · Ex 8(c)`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 2 · Exercise 8(c)]** For the solid cylinder $x^2+y^2\\le4$, $-1\\le z\\le1$ and $F=(x^3+e^{2z},3yz,z+1)$, the total outward flux is $C\\pi$. Enter $C$.",
    answer: 32,
    tolerance: 0.001,
    unit: "·π",
    explanation:
      "$\\operatorname{div}F=3x^2+3z+1$. Over the cylinder, the three terms integrate to $24\\pi$, $0$ by odd symmetry in $z$, and the volume $8\\pi$. Therefore the total outward flux is $32\\pi$.",
    theory:
      "For a closed surface, use Gauss first: total outward flux equals the triple integral of the divergence over the enclosed solid.",
  },
  {
    id: "ma2-ex26-a2e8d",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["past-exam", "exam-open", "exam-group:appello-2-2026"],
    source: `${SRC_AP2} · Ex 8(d)`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 2 · Exercise 8(d)]** For the same cylinder and field, the combined outward flux through the upper and lower bases is $C\\pi$. Enter $C$.",
    answer: 8,
    tolerance: 0.001,
    unit: "·π",
    explanation:
      "On the lower base $z=-1$, the outward normal is $-k$ and $F\\cdot(-k)=-(z+1)=0$. On the upper base $z=1$, $F\\cdot k=z+1=2$, so the flux is $2\\cdot\\pi(2^2)=8\\pi$.",
    theory:
      "On horizontal faces only the $z$-component crosses. The lower outward normal points downward; never reuse the upper normal there.",
  },
  {
    id: "ma2-ex26-a2e8e",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["past-exam", "exam-open", "exam-group:appello-2-2026"],
    source: `${SRC_AP2} · Ex 8(e)`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 2 · Exercise 8(e)]** For the same cylinder and field, the outward flux through only the lateral surface is $C\\pi$. Enter $C$.",
    answer: 24,
    tolerance: 0.001,
    unit: "·π",
    explanation:
      "Flux is additive. Subtract the two bases from the closed-surface total: $32\\pi-8\\pi=24\\pi$. This is much shorter and safer than parametrizing the lateral surface and carrying the $e^{2z}$ term directly.",
    theory:
      "When a closed surface is split into easy and hard pieces, compute the total by Gauss and obtain the hard piece by subtraction.",
  },
];

export const examProblems2026: ExamProblem[] = [
  {
    id: "ma2-ex26-j8",
    title: "Green's theorem on two disks (June 2026, the 9-point problem)",
    meta: `${SRC_JUNE} · Ex 8 · 9 points · past-exam`,
    difficulty: "hard",
    topic: "Curves, line integrals & vector fields",
    statement:
      "Let $F(x,y) = (x^3 - y^2,\\ e^{2y} + 2x(y+1))$ and $D_1 = \\{(x,y) \\in \\mathbb R^2 : x^2 + (y-3)^2 \\le 25\\}$, $D_2 = \\{(x,y) \\in \\mathbb R^2 : x^2 + y^2 \\le 1\\}$. (a) Say if $F$ is conservative in $\\mathbb R^2$. (b) Sketch $D_1$ with boundary $\\partial D_1$ positively oriented and compute the work of $F$ along $\\partial D_1$. (c) Sketch $D_2$ with boundary $\\partial D_2$ run clockwise and compute the work of $F$ along $\\partial D_2$. (d) Sketch $\\mathcal K = D_1 \\setminus D_2$ with boundary positively oriented. Justify your answers.",
    steps: [
      {
        title: "(a) Conservative? Run the curl test",
        content:
          "$F \\in C^1(\\mathbb R^2)$ and $\\mathbb R^2$ is simply connected, so $F$ is conservative $\\iff$ it is irrotational. Compute $\\operatorname{curl} F = \\partial_x\\left(e^{2y} + 2x(y+1)\\right) - \\partial_y\\left(x^3 - y^2\\right) = 2(y+1) - (-2y) = 4y + 2$, which is $\\ne 0$ whenever $y \\ne -\\tfrac12$. NOT conservative — and this non-zero curl is exactly the fuel for the rest of the problem.",
      },
      {
        title: "(b) Work along the big circle via Green",
        content:
          "$D_1$ is the disk of radius $5$ centred at $(0, 3)$; positively oriented means counterclockwise. Green: $\\oint_{\\partial D_1} F \\cdot dl = \\iint_{D_1} (4y + 2)\\,dxdy$. Use the centroid shortcut: $\\iint_{D_1} y = y_G \\cdot |D_1| = 3 \\cdot 25\\pi$, so the work is $4 \\cdot 75\\pi + 2 \\cdot 25\\pi = 300\\pi + 50\\pi = 350\\pi$. (Same by polar centred at $(0,3)$: $y = 3 + r\\sin\\theta$, the $\\sin\\theta$ term dies, $\\iint 14 = 350\\pi$.)",
      },
      {
        title: "(c) Work along the small circle — mind the orientation",
        content:
          "$D_2$ is the unit disk at the origin, but $\\partial D_2$ is run CLOCKWISE — not positively oriented, so Green picks up a minus sign: $\\oint_{\\partial D_2} F \\cdot dl = -\\iint_{D_2} (4y+2)\\,dxdy = -\\left(4 \\cdot 0 + 2\\pi\\right) = -2\\pi$ (the $y$-moment vanishes by symmetry, $|D_2| = \\pi$).",
      },
      {
        title: "(d) The annular region: orient BOTH boundary pieces",
        content:
          "$\\mathcal K = D_1 \\setminus D_2$ has two boundary circles. Positive orientation keeps $\\mathcal K$ on the left: the outer circle $\\partial D_1$ runs counterclockwise, the inner circle $\\partial D_2$ runs CLOCKWISE. Consistency check: $\\oint_{\\partial\\mathcal K} F \\cdot dl = \\iint_{\\mathcal K} (4y+2) = 350\\pi - 2\\pi = 348\\pi$, which is exactly (b) $+$ (c) $= 350\\pi + (-2\\pi)$ — the orientations agree.",
      },
    ],
    finalAnswer:
      "$\\operatorname{curl} F = 4y + 2 \\ne 0$ so $F$ is NOT conservative; work along $\\partial D_1$ (ccw) $= 350\\pi$; work along $\\partial D_2$ (cw) $= -2\\pi$; $\\mathcal K$ is positively oriented with the outer circle counterclockwise and the inner circle clockwise.",
    tips:
      "Two mark-savers: (1) the centroid shortcut $\\iint_D y\\,dxdy = y_G|D|$ kills the off-centre disk integral in one line — no polar substitution needed; (2) a clockwise boundary flips the sign of Green's theorem, and in $D_1 \\setminus D_2$ the inner circle ALWAYS runs opposite to the outer one. The examiner plants the off-centre disk hoping you integrate $4y$ as zero by 'symmetry' — the symmetry is around $y = 3$, not $y = 0$.",
  },
  {
    id: "ma2-ex26-a2e8",
    title: "Divergence theorem on a cylinder (Appello 2, the 9-point problem)",
    meta: `${SRC_AP2} · Ex 8 · 9 points · past-exam`,
    difficulty: "hard",
    topic: "Surfaces, flux & the big theorems",
    statement:
      "Let $F(x,y,z) = (x^3 + e^{2z},\\ 3yz,\\ z + 1)$ and $A = \\{(x,y,z) \\in \\mathbb R^3 : x^2 + y^2 \\le 4,\\ -1 \\le z \\le 1\\}$. (a) Draw the cylinder $A$. (b) Compute the divergence of $F$. (c) Compute the outward flux of $F$ through the boundary of $A$. (d) Parametrize the two bases of $A$ and compute the outward flux of $F$ through the two bases. (e) Compute the outward flux of $F$ through the lateral surface of $A$.",
    steps: [
      {
        title: "(a) The solid",
        content:
          "$A$ is the solid cylinder of radius $2$ around the $z$-axis: lower base $B_2(0) \\times \\{z = -1\\}$, upper base $B_2(0) \\times \\{z = 1\\}$, height $2$, volume $|A| = 4\\pi \\cdot 2 = 8\\pi$.",
      },
      {
        title: "(b) Divergence",
        content:
          "$\\operatorname{div} F = \\partial_x(x^3 + e^{2z}) + \\partial_y(3yz) + \\partial_z(z+1) = 3x^2 + 3z + 1$. Note $e^{2z}$ contributes nothing — it sits in the $x$-slot but depends only on $z$.",
      },
      {
        title: "(c) Total outward flux by Gauss",
        content:
          "$\\iint_{\\partial A} F \\cdot n\\,d\\sigma = \\iiint_A (3x^2 + 3z + 1)\\,dxdydz$. Term by term: $\\iiint 3x^2 = 3 \\cdot \\left(\\iint_{B_2} x^2\\right) \\cdot 2 = 3 \\cdot 4\\pi \\cdot 2 = 24\\pi$ (in polar $\\iint_{B_2} x^2 = \\int_0^{2\\pi}\\cos^2\\theta \\int_0^2 r^3 dr = \\pi \\cdot 4$); $\\iiint 3z = 0$ by odd symmetry in $z \\in [-1,1]$; $\\iiint 1 = |A| = 8\\pi$. Total: $24\\pi + 8\\pi = 32\\pi$.",
      },
      {
        title: "(d) Flux through the two bases — only the z-component crosses",
        content:
          "Lower base $\\sigma_1(u,v) = (u, v, -1)$ with OUTWARD normal $N_1 = (0,0,-1)$ (down!): $F \\cdot N_1 = -(z+1)\\big|_{z=-1} = 0$ — the lower base contributes NOTHING. Upper base $\\sigma_2(u,v) = (u, v, 1)$, outward $N_2 = (0,0,1)$: $F \\cdot N_2 = (z+1)\\big|_{z=1} = 2$, giving $2 \\cdot |B_2| = 2 \\cdot 4\\pi = 8\\pi$. Bases total: $0 + 8\\pi = 8\\pi$. The scary components $x^3 + e^{2z}$ and $3yz$ are horizontal — they never cross a horizontal base.",
      },
      {
        title: "(e) Lateral surface by additivity — never parametrized",
        content:
          "$\\partial A =$ lateral $\\cup$ bases and flux is additive, so $\\text{flux}_{\\text{lat}} = \\text{flux}_{\\partial A} - \\text{flux}_{\\text{bases}} = 32\\pi - 8\\pi = 24\\pi$. No cylindrical parametrization, no $e^{2z}$ integral — Gauss plus subtraction does all the work.",
      },
    ],
    finalAnswer:
      "$\\operatorname{div} F = 3x^2 + 3z + 1$; total outward flux $= 32\\pi$; bases: lower $0$, upper $8\\pi$ (total $8\\pi$); lateral surface $= 24\\pi$.",
    tips:
      "This is the standard 9-point split: div → Gauss for the total → direct flux on the easy faces → additivity for the hard face. Two classic mark-losses: the OUTWARD normal on the LOWER base points DOWN $(0,0,-1)$ — using $+k$ there flips a sign; and trying to integrate $e^{2z}$ over the lateral surface directly — the problem is designed so you never have to.",
  },
];
