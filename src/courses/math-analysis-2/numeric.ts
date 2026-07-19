import type { NumericQuestion } from "../../types";

/* ================================================================== *
 *  NUMERIC DRILLS — free-answer questions checked with tolerance.
 *  The AM2 written exam wants numbers; these train computing them
 *  under commitment. Topics match the module names so they group
 *  with the right lectures.
 * ================================================================== */

export const numericDrills: NumericQuestion[] = [
  {
    id: "num-grad-magnitude",
    type: "numeric",
    topic: "Differential calculus",
    difficulty: "easy",
    prompt:
      "For $f(x,y) = x^2 y$, compute $\\lVert \\nabla f(2,3) \\rVert$ (two decimals).",
    answer: 12.65,
    tolerance: 0.01,
    explanation:
      "$\\nabla f = (2xy,\\ x^2) = (12, 4)$ at $(2,3)$, so $\\lVert\\nabla f\\rVert = \\sqrt{144+16} = \\sqrt{160} \\approx 12.65$.",
    theory: "The gradient collects the partials; its norm is the steepest-ascent rate at the point.",
  },
  {
    id: "num-directional-derivative",
    type: "numeric",
    topic: "Differential calculus",
    difficulty: "medium",
    prompt:
      "For $f(x,y) = x^2 + y^2$, compute the directional derivative at $(1,2)$ in the direction of the vector $(1,1)$ (two decimals).",
    answer: 4.24,
    tolerance: 0.01,
    explanation:
      "Normalize: $u = (1,1)/\\sqrt2$. $\\nabla f(1,2) = (2,4)$, so $D_u f = (2+4)/\\sqrt2 = 6/\\sqrt2 = 3\\sqrt2 \\approx 4.24$. Forgetting to normalize is the classic slip.",
    theory: "$D_u f = \\nabla f \\cdot u$ with $u$ a *unit* vector.",
  },
  {
    id: "num-double-rect",
    type: "numeric",
    topic: "Double & triple integrals",
    difficulty: "easy",
    prompt: "Compute $\\iint_R xy\\,dA$ over the rectangle $R = [0,2]\\times[0,3]$.",
    answer: 9,
    tolerance: 0.01,
    explanation:
      "Separable on a rectangle: $\\left(\\int_0^2 x\\,dx\\right)\\left(\\int_0^3 y\\,dy\\right) = 2 \\cdot \\tfrac92 = 9$.",
    theory: "When the integrand factors as $g(x)h(y)$ over a rectangle, the double integral is the product of two single integrals.",
  },
  {
    id: "num-triangle-area",
    type: "numeric",
    topic: "Double & triple integrals",
    difficulty: "easy",
    prompt:
      "Using a double integral (or otherwise), compute the area of the triangle with vertices $(0,0)$, $(4,0)$, $(0,3)$.",
    answer: 6,
    tolerance: 0.01,
    explanation: "$\\iint_T 1\\,dA$ = area $= \\tfrac12 \\cdot 4 \\cdot 3 = 6$.",
    theory: "Integrating $1$ over a region returns its area — a sanity check worth doing before harder integrands.",
  },
  {
    id: "num-paraboloid-volume",
    type: "numeric",
    topic: "Double & triple integrals",
    difficulty: "hard",
    prompt:
      "Compute the volume under $z = 4 - x^2 - y^2$ and above the plane $z = 0$ (two decimals).",
    answer: 25.13,
    tolerance: 0.01,
    explanation:
      "Polar over the disk $r \\le 2$: $\\int_0^{2\\pi}\\!\\!\\int_0^2 (4 - r^2)\\,r\\,dr\\,d\\theta = 2\\pi\\left[2r^2 - \\tfrac{r^4}{4}\\right]_0^2 = 8\\pi \\approx 25.13$. Don't drop the Jacobian $r$.",
    theory: "Circular symmetry → polar coordinates, $dA = r\\,dr\\,d\\theta$; the domain boundary is where $z = 0$.",
  },
  {
    id: "num-arc-length",
    type: "numeric",
    topic: "Curves, line integrals & vector fields",
    difficulty: "easy",
    prompt: "Compute the length of the curve $\\mathbf r(t) = (3t,\\ 4t)$ for $t \\in [0,2]$.",
    answer: 10,
    tolerance: 0.01,
    explanation: "$\\lVert \\mathbf r'(t)\\rVert = \\sqrt{9+16} = 5$ is constant, so $L = 5 \\cdot 2 = 10$.",
    theory: "$L = \\int_a^b \\lVert \\mathbf r'(t) \\rVert\\,dt$ — speed integrated over time.",
  },
  {
    id: "num-conservative-work",
    type: "numeric",
    topic: "Curves, line integrals & vector fields",
    difficulty: "medium",
    prompt:
      "Compute $\\int_C \\mathbf F \\cdot d\\mathbf r$ for $\\mathbf F = (y,\\ x)$ along any path from $(0,0)$ to $(2,3)$.",
    answer: 6,
    tolerance: 0.01,
    explanation:
      "$\\mathbf F = \\nabla(xy)$ is conservative, so the integral is $\\varphi(2,3) - \\varphi(0,0) = 6 - 0 = 6$, path be damned.",
    theory: "For conservative fields the line integral depends only on the endpoints: find a potential and evaluate.",
  },
  {
    id: "num-geometric-series",
    type: "numeric",
    topic: "Series & power series",
    difficulty: "easy",
    prompt: "Compute $\\displaystyle\\sum_{n=0}^{\\infty} \\left(\\tfrac13\\right)^n$ (one decimal).",
    answer: 1.5,
    tolerance: 0.01,
    explanation: "Geometric with $q = 1/3$: $\\dfrac{1}{1 - 1/3} = \\dfrac{3}{2} = 1.5$.",
    theory: "$\\sum_{n=0}^\\infty q^n = 1/(1-q)$ for $|q| < 1$; check where the sum starts before plugging in.",
  },
  {
    id: "num-taylor-e02",
    type: "numeric",
    topic: "Taylor & optimization",
    difficulty: "medium",
    prompt:
      "Use the second-order Maclaurin polynomial of $e^x$ to approximate $e^{0.2}$ (two decimals).",
    answer: 1.22,
    tolerance: 0.005,
    explanation:
      "$P_2(x) = 1 + x + x^2/2$, so $P_2(0.2) = 1 + 0.2 + 0.02 = 1.22$ (the true value is $\\approx 1.2214$).",
    theory: "Truncated Taylor series turn transcendental values into arithmetic; the remainder tells you how far to trust them.",
  },
  {
    id: "num-ode-growth",
    type: "numeric",
    topic: "Ordinary differential equations (extra)",
    difficulty: "medium",
    prompt: "Solve $y' = 2y$, $y(0) = 3$, and compute $y(1)$ (two decimals).",
    answer: 22.17,
    tolerance: 0.005,
    explanation: "$y = 3e^{2t}$, so $y(1) = 3e^2 \\approx 22.17$.",
    theory: "Linear growth equations $y' = ky$ always give $y_0 e^{kt}$ — recognize them before separating variables.",
  },
];
