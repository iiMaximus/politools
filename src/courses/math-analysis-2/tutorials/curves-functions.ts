import type { Question } from "../../../types";

/* ================================================================== *
 *  OFFICIAL TUTORIAL SHEET — "Curves & Functions in several
 *  variables" (A.A. 2025-26). Transcribed from the professor's
 *  exercise sheet; every answer checked against the official
 *  Sol_curves&functions.pdf AND recomputed independently.
 *  Ex 1-5: curves (simple/closed/regular, tangent lines, length).
 *  Ex 6-9: domains, gradients, tangent planes, directional derivatives.
 * ================================================================== */

const SRC = "Ex_curves&functions";
const TOPIC = "Curves, line integrals & vector fields";

export const tutorialQuestions: Question[] = [
  /* ---------------- Ex 1 — helix-like curve: classification ---------------- */
  {
    id: "ma2-tut-cf-1",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Let $\\gamma\\colon [0, 2\\pi] \\to \\mathbb R^3$ be the parametric curve $\\gamma(t) = (t\\cos t,\\ t^2,\\ t\\sin t)$. Then $\\gamma$ is:",
    options: [
      { id: "A", content: "simple, closed and regular" },
      { id: "B", content: "simple, not closed, and regular" },
      { id: "C", content: "not simple, not closed, and regular" },
      { id: "D", content: "simple, not closed, and not regular (since $\\gamma'$ vanishes at $t=0$)" },
    ],
    correct: "B",
    explanation:
      "Simple: $\\gamma(t_1) = \\gamma(t_2)$ forces $t_1^2 = t_2^2$, and on $[0,2\\pi]$ both are $\\ge 0$, so $t_1 = t_2$ — C is out. Closed: $\\gamma(0) = (0,0,0) \\ne (2\\pi, 4\\pi^2, 0) = \\gamma(2\\pi)$, so A is out. Regular: $\\gamma'(t) = (\\cos t - t\\sin t,\\ 2t,\\ \\sin t + t\\cos t)$; the middle component $2t = 0$ only at $t = 0$, where $\\gamma'(0) = (1,0,0) \\ne \\mathbf 0$ — so $\\gamma'$ never vanishes and D is wrong.",
    theory:
      "Check the three properties independently: simple = injective on the interior, closed = endpoints coincide, regular = $\\gamma \\in C^1$ with $\\gamma'(t) \\ne \\mathbf 0$ everywhere. One injective component is enough to prove simplicity.",
  },

  /* ---------------- Ex 1 — tangent vector component ---------------- */
  {
    id: "ma2-tut-cf-2",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** For the curve $\\gamma(t) = (t\\cos t,\\ t^2,\\ t\\sin t)$, $t \\in [0,2\\pi]$, compute the $y$-component of the tangent vector $\\gamma'(t_0)$ at the point $\\gamma(t_0) = (-\\pi, \\pi^2, 0)$ (two decimals).",
    answer: 6.2832,
    tolerance: 0.01,
    explanation:
      "First find $t_0$: $y(t_0) = t_0^2 = \\pi^2$ with $t_0 \\ge 0$ gives $t_0 = \\pi$ (and indeed $\\pi\\cos\\pi = -\\pi$, $\\pi\\sin\\pi = 0$). Then $\\gamma'(t) = (\\cos t - t\\sin t,\\ 2t,\\ \\sin t + t\\cos t)$, so $\\gamma'(\\pi) = (-1,\\ 2\\pi,\\ -\\pi)$: the $y$-component is $2\\pi \\approx 6.28$.",
    theory:
      "Tangent line at $\\gamma(t_0)$: $r(t) = \\gamma(t_0) + t\\,\\gamma'(t_0)$. Always recover the parameter $t_0$ from the given point before differentiating.",
  },

  /* ---------------- Ex 2 — length of a circular helix ---------------- */
  {
    id: "ma2-tut-cf-3",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute the length of the curve $\\gamma\\colon [0,2\\pi] \\to \\mathbb R^3$, $\\gamma(t) = (3\\cos t,\\ 4t - 2,\\ 3\\sin t)$ (two decimals).",
    answer: 31.4159,
    tolerance: 0.01,
    explanation:
      "$\\gamma'(t) = (-3\\sin t,\\ 4,\\ 3\\cos t)$, so $\\lVert\\gamma'(t)\\rVert = \\sqrt{9\\sin^2 t + 16 + 9\\cos^2 t} = \\sqrt{9 + 16} = 5$ — constant speed. Hence $l(\\gamma) = \\int_0^{2\\pi} 5\\,dt = 10\\pi \\approx 31.42$.",
    theory:
      "$l(\\gamma) = \\int_a^b \\lVert\\gamma'(t)\\rVert\\,dt$. For a circular helix $(R\\cos t,\\ ct,\\ R\\sin t)$ the speed $\\sqrt{R^2 + c^2}$ is constant thanks to $\\sin^2 + \\cos^2 = 1$.",
  },

  /* ---------------- Ex 3 — professor's MCQ on (t, t, sin t) ---------------- */
  {
    id: "ma2-tut-cf-4",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Let $\\gamma\\colon [0,2\\pi] \\to \\mathbb R^3$ be the curve $\\gamma(t) = (t,\\ t,\\ \\sin t)$. We can assert that:",
    options: [
      { id: "A", content: "$l(\\gamma) \\ge 2\\sqrt 2\\,\\pi$" },
      { id: "B", content: "the trace of $\\gamma$ is contained in the sphere of radius $\\pi$ centred at the origin" },
      { id: "C", content: "$\\gamma$ is not regular" },
      { id: "D", content: "$\\gamma$ is closed and simple" },
    ],
    correct: "A",
    explanation:
      "$\\gamma'(t) = (1, 1, \\cos t) \\ne \\mathbf 0$ always, so the curve IS regular — C false. $\\gamma(0) = (0,0,0) \\ne (2\\pi, 2\\pi, 0) = \\gamma(2\\pi)$: simple but not closed — D false. $\\lVert\\gamma(\\pi)\\rVert = \\sqrt{\\pi^2 + \\pi^2 + 0} = \\sqrt 2\\,\\pi > \\pi$, so the trace leaves the ball of radius $\\pi$ — B false. Finally $l(\\gamma) = \\int_0^{2\\pi}\\sqrt{2 + \\cos^2 t}\\,dt \\ge \\int_0^{2\\pi}\\sqrt 2\\,dt = 2\\sqrt 2\\,\\pi$ since $\\cos^2 t \\ge 0$ — A is correct.",
    theory:
      "When a length integral has no elementary antiderivative, bound it: $\\lVert\\gamma'\\rVert \\ge m$ on $[a,b]$ gives $l(\\gamma) \\ge m(b-a)$. Estimates often decide MCQs faster than exact computation.",
  },

  /* ---------------- Ex 4 — elliptic helix: tangent vector ---------------- */
  {
    id: "ma2-tut-cf-5",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 4`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Let $\\gamma\\colon [-6\\pi, 6\\pi] \\to \\mathbb R^3$, $\\gamma(t) = (-3\\cos t,\\ 2\\sin t,\\ t)$ (a simple, non-closed, regular elliptic helix). Compute the $x$-component of the tangent vector $\\gamma'(t_0)$ at the point $\\gamma(t_0) = (0,\\ 2,\\ \\tfrac{\\pi}{2})$.",
    answer: 3,
    tolerance: 0.01,
    explanation:
      "The third component pins the parameter: $z(t_0) = t_0 = \\tfrac{\\pi}{2}$ (consistent: $-3\\cos\\tfrac{\\pi}{2} = 0$, $2\\sin\\tfrac{\\pi}{2} = 2$). Then $\\gamma'(t) = (3\\sin t,\\ 2\\cos t,\\ 1)$, so $\\gamma'(\\tfrac{\\pi}{2}) = (3,\\ 0,\\ 1)$ — the $x$-component is $3$. Watch the sign: differentiating $-3\\cos t$ gives $+3\\sin t$.",
    theory:
      "A strictly monotone component (here $z = t$) makes a curve simple and gives the fastest way to solve $\\gamma(t_0) = P$ for $t_0$.",
  },

  /* ---------------- Ex 5 — professor's MCQ on a segment ---------------- */
  {
    id: "ma2-tut-cf-6",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Let $\\gamma\\colon [0,5] \\to \\mathbb R^2$ be the curve $\\gamma(t) = (2t + 5,\\ 3t + 2)$. We can assert that:",
    options: [
      { id: "A", content: "$l(\\gamma) = 65$" },
      { id: "B", content: "the trace of $\\gamma$ is the segment from the point $(5,2)$ to $(7,5)$" },
      { id: "C", content: "$l(\\gamma) = 5\\sqrt{13}$" },
      { id: "D", content: "$\\gamma$ is not regular" },
    ],
    correct: "C",
    explanation:
      "$\\gamma'(t) = (2,3) \\ne (0,0)$ for every $t$, so the curve is regular — D false. $l(\\gamma) = \\int_0^5 \\sqrt{2^2 + 3^2}\\,dt = 5\\sqrt{13} \\approx 18.03$ — C correct, and A confuses $5\\sqrt{13}$ with $5 \\cdot 13 = 65$. B is a trap: $(7,5) = \\gamma(1)$, so the trace runs from $(5,2)$ all the way to $\\gamma(5) = (15,17)$ and strictly contains that segment.",
    theory:
      "A straight segment traversed at constant speed has $l = \\lVert\\gamma'\\rVert \\cdot (b - a)$; always evaluate the endpoints before trusting a claimed trace.",
  },

  /* ---------------- Ex 6.1 — domain with root in denominator ---------------- */
  {
    id: "ma2-tut-cf-7",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 6`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute the domain of $f(x,y) = \\dfrac{1}{\\sqrt{x^2 - y^2}}$.",
    options: [
      { id: "A", content: "$\\{(x,y) \\in \\mathbb R^2 : |x| \\ge |y|\\}$" },
      { id: "B", content: "$\\{(x,y) \\in \\mathbb R^2 : x > y\\}$" },
      { id: "C", content: "$\\{(x,y) \\in \\mathbb R^2 : x^2 + y^2 > 0\\}$" },
      { id: "D", content: "$\\{(x,y) \\in \\mathbb R^2 : |x| > |y|\\}$" },
    ],
    correct: "D",
    explanation:
      "Two conditions stack: the square root needs $x^2 - y^2 \\ge 0$ AND the denominator needs $x^2 - y^2 \\ne 0$, hence $x^2 - y^2 > 0$, i.e. $|x| > |y|$. A forgets the denominator (allows $x^2 = y^2$, where $f$ blows up). B drops the absolute values: $x^2 > y^2$ is $|x| > |y|$, not $x > y$ (e.g. $x = -3, y = 1$ is in the domain). C tests the wrong expression entirely.",
    theory:
      "$\\sqrt{g} \\ge 0$-condition plus $g \\ne 0$ in a denominator merge into the strict inequality $g > 0$; and $a^2 > b^2 \\iff |a| > |b|$, never $a > b$.",
  },

  /* ---------------- Ex 6.2 — fourth root minus cube root ---------------- */
  {
    id: "ma2-tut-cf-8",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the domain of $f(x,y) = \\sqrt[4]{1 - |x|y} - \\sqrt[3]{x^2 + y^2 - y^4}$.",
    options: [
      { id: "A", content: "$\\{(x,y) \\in \\mathbb R^2 : |x|\\,y \\le 1\\}$, i.e. $y \\le \\tfrac{1}{|x|}$ when $x \\ne 0$, all $y$ when $x = 0$" },
      { id: "B", content: "$\\{(x,y) \\in \\mathbb R^2 : |x|\\,y \\le 1 \\ \\wedge\\ x^2 + y^2 - y^4 \\ge 0\\}$" },
      { id: "C", content: "$\\{(x,y) \\in \\mathbb R^2 : |x|\\,y < 1\\}$" },
      { id: "D", content: "all of $\\mathbb R^2$" },
    ],
    correct: "A",
    explanation:
      "Even-order roots need a non-negative radicand: $1 - |x|y \\ge 0$, i.e. $|x|y \\le 1$. The cube root is an ODD root — defined for every real number — so $x^2 + y^2 - y^4$ imposes nothing, which kills B (the classic over-restriction). C wrongly makes the inequality strict: the fourth root of $0$ is fine. D forgets the fourth root condition. For $x \\ne 0$ the condition reads $y \\le \\tfrac{1}{|x|}$; for $x = 0$ it is $1 \\ge 0$, always true.",
    theory:
      "Odd roots ($\\sqrt[3]{\\cdot}, \\sqrt[5]{\\cdot}$) are defined on all of $\\mathbb R$; only even roots and logarithms/denominators generate domain conditions.",
  },

  /* ---------------- Ex 6.3 — root plus logarithm ---------------- */
  {
    id: "ma2-tut-cf-9",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the domain of $f(x,y) = \\sqrt{1 - xy} + \\log(x^2 + y^2 - 2)$.",
    options: [
      { id: "A", content: "$\\{(x,y) \\in \\mathbb R^2 : xy < 1 \\ \\wedge\\ x^2 + y^2 \\ge 2\\}$" },
      { id: "B", content: "$\\{(x,y) \\in \\mathbb R^2 : xy \\le 1 \\ \\wedge\\ x^2 + y^2 > 2\\}$" },
      { id: "C", content: "$\\{(x,y) \\in \\mathbb R^2 : xy \\le 1 \\ \\vee\\ x^2 + y^2 > 2\\}$" },
      { id: "D", content: "$\\{(x,y) \\in \\mathbb R^2 : x^2 + y^2 > 2\\}$" },
    ],
    correct: "B",
    explanation:
      "The square root needs $1 - xy \\ge 0$ (zero allowed → NON-strict $xy \\le 1$); the logarithm needs a strictly positive argument, $x^2 + y^2 - 2 > 0$ (strict — $\\log 0$ undefined). Both must hold simultaneously, so the conditions join with AND: that is B. A swaps the strict/non-strict inequalities exactly backwards. C uses OR — a sum of two functions is defined only on the intersection of their domains, not the union. D ignores the square root. Geometrically: outside the circle of radius $\\sqrt 2$, below/on the hyperbola $xy = 1$.",
    theory:
      "Domain of a sum = intersection of domains. Square roots give $\\ge$, logarithms and denominators give strict conditions.",
  },

  /* ---------------- Ex 7.1 — gradient of (x+y)/(x−y) ---------------- */
  {
    id: "ma2-tut-cf-10",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 7`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** For $f(x,y) = \\dfrac{x+y}{x-y}$, compute the partial derivative $\\partial_x f$ at the point $P = (1, -1)$ (two decimals).",
    answer: 0.5,
    tolerance: 0.01,
    explanation:
      "Quotient rule: $\\partial_x f = \\dfrac{(x-y) - (x+y)}{(x-y)^2} = \\dfrac{-2y}{(x-y)^2}$. At $(1,-1)$: $\\dfrac{-2(-1)}{(1-(-1))^2} = \\dfrac{2}{4} = \\dfrac12$. (Similarly $\\partial_y f = \\tfrac{2x}{(x-y)^2}$ gives $\\nabla f(1,-1) = (\\tfrac12, \\tfrac12)$.)",
    theory:
      "For partial derivatives, freeze the other variable and apply the one-variable rules; simplify symbolically before substituting the point.",
  },

  /* ---------------- Ex 7.2 — gradient in three variables ---------------- */
  {
    id: "ma2-tut-cf-11",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 7`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** For $f(x,y,z) = x^2(y - z) - \\log x$, compute the partial derivative $\\partial_x f$ at the point $P = (2, 1, -1)$ (two decimals).",
    answer: 7.5,
    tolerance: 0.01,
    explanation:
      "$\\partial_x f = 2x(y - z) - \\tfrac1x$. At $(2, 1, -1)$: $2 \\cdot 2 \\cdot (1 - (-1)) - \\tfrac12 = 8 - \\tfrac12 = \\tfrac{15}{2} = 7.5$. The classic slips are $y - z = 1 - 1 = 0$ (sign of $z$) and dropping the $-\\tfrac1x$ from $\\log x$. The full gradient is $\\nabla f(P) = (\\tfrac{15}{2}, 4, -4)$ since $\\partial_y f = x^2$ and $\\partial_z f = -x^2$.",
    theory:
      "In three variables the gradient has three entries; terms not containing the differentiation variable (like $\\log x$ for $\\partial_y$) vanish.",
  },

  /* ---------------- Ex 8.1 — tangent plane at the origin ---------------- */
  {
    id: "ma2-tut-cf-12",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 8`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** $f(x,y) = \\sin x \\cos y$ is differentiable ($C^1$ on $\\mathbb R^2$). Its tangent plane at $P = (0,0)$ has equation $z = c_1 x + c_2 y + c_3$. Compute $c_1$.",
    answer: 1,
    tolerance: 0.01,
    explanation:
      "$\\partial_x f = \\cos x \\cos y$ and $\\partial_y f = -\\sin x \\sin y$ are continuous everywhere, so $f$ is differentiable and the tangent plane is $z = f(0,0) + \\nabla f(0,0) \\cdot (x, y)$. Since $f(0,0) = 0$ and $\\nabla f(0,0) = (1, 0)$, the plane is $z = x$: $c_1 = 1$ (and $c_2 = c_3 = 0$). Near the origin, $\\sin x \\cos y \\approx x$ — the linearization in action.",
    theory:
      "$C^1 \\Rightarrow$ differentiable (sufficient criterion); tangent plane: $z = f(P_0) + \\nabla f(P_0) \\cdot (P - P_0)$.",
  },

  /* ---------------- Ex 8.2 — tangent plane to a log ---------------- */
  {
    id: "ma2-tut-cf-13",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 8`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** $f(x,y) = \\log(1 + x^2 - y^2)$ is differentiable on its (open) domain. The equation of the tangent plane to $f$ at $P = (1, 0)$ is:",
    options: [
      { id: "A", content: "$z = 2x + \\log 2 - 2$" },
      { id: "B", content: "$z = x - 1$" },
      { id: "C", content: "$z = \\log 2 + 2(x-1) - 2y$" },
      { id: "D", content: "$z = x + \\log 2 - 1$" },
    ],
    correct: "D",
    explanation:
      "$\\partial_x f = \\dfrac{2x}{1 + x^2 - y^2}$, $\\partial_y f = \\dfrac{-2y}{1 + x^2 - y^2}$ — continuous on the domain, so $f$ is differentiable. At $(1,0)$: $f = \\log 2$, $\\partial_x f = \\tfrac22 = 1$, $\\partial_y f = 0$. Plane: $z = \\log 2 + 1\\cdot(x - 1) + 0 \\cdot y = x + \\log 2 - 1$ — D. A uses slope $2$ (forgets the denominator $1 + x^2 - y^2 = 2$). B drops the height $f(P) = \\log 2$. C keeps the raw numerators $2x$ and $-2y$ evaluated without the denominator.",
    theory:
      "For $\\log(g)$, the chain rule divides by $g$: $\\partial(\\log g) = \\partial g / g$ — evaluating that denominator at $P$ is the step distractors skip.",
  },

  /* ---------------- Ex 9.1 — directional derivative via gradient ---------------- */
  {
    id: "ma2-tut-cf-14",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 9`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute the directional derivative of $f(x,y,z) = x^3 y - yz + 2$ at $P = (1, 1, -1)$ along the direction $\\bar v = (0, 1, 0)$.",
    answer: 2,
    tolerance: 0.01,
    explanation:
      "$f$ is a polynomial, hence differentiable, and $|\\bar v| = 1$, so $\\tfrac{\\partial f}{\\partial \\bar v}(P) = \\nabla f(P) \\cdot \\bar v$. $\\nabla f = (3x^2 y,\\ x^3 - z,\\ -y)$, so $\\nabla f(1,1,-1) = (3,\\ 1-(-1),\\ -1) = (3, 2, -1)$ and the dot product with $(0,1,0)$ picks out the middle entry: $2$.",
    theory:
      "For differentiable $f$ and unit $\\bar v$: $\\partial f/\\partial\\bar v = \\nabla f \\cdot \\bar v$; along a coordinate direction this is just the corresponding partial derivative.",
  },

  /* ---------------- Ex 9.2 — directional derivative without differentiability ---------------- */
  {
    id: "ma2-tut-cf-15",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 9`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $f(x,y) = \\dfrac{x^3 y}{x^6 + y^2}$ for $(x,y) \\ne (0,0)$ and $f(0,0) = 0$. Consider $\\dfrac{\\partial f}{\\partial \\bar v}(0,0)$ with $\\bar v = \\left(\\tfrac{1}{\\sqrt 2}, \\tfrac{1}{\\sqrt 2}\\right)$. Then:",
    options: [
      { id: "A", content: "it does not exist, because $f$ is not continuous at $(0,0)$" },
      { id: "B", content: "it equals $\\tfrac12$" },
      { id: "C", content: "it equals $0$, but $f$ is NOT differentiable at $(0,0)$ (so $\\nabla f \\cdot \\bar v$ was never justified)" },
      { id: "D", content: "it equals $0$, and $f$ is differentiable at $(0,0)$" },
    ],
    correct: "C",
    explanation:
      "$f$ is not even continuous at the origin: along $\\beta(t) = (t, t^3)$, $f = \\tfrac{t^6}{2t^6} = \\tfrac12 \\not\\to 0$ — so D is out, and the formula $\\nabla f \\cdot \\bar v$ is off the table. But the directional derivative can still exist by definition (A confuses the two notions): $f(\\tfrac{h}{\\sqrt2}, \\tfrac{h}{\\sqrt2}) = \\dfrac{h^4/4}{h^6/8 + h^2/2} = \\dfrac{2h^2}{4 + h^4}$, so $\\dfrac{\\partial f}{\\partial\\bar v}(0,0) = \\lim_{h\\to 0} \\dfrac{1}{h}\\cdot\\dfrac{2h^2}{4+h^4} = \\lim_{h\\to 0}\\dfrac{2h}{4 + h^4} = 0$. B is the limit of $f$ along the cubic path, not a derivative.",
    theory:
      "Directional derivatives can exist at a point where $f$ is not even continuous — existence of $\\partial f/\\partial\\bar v$ (a 1-D limit) is strictly weaker than differentiability. When differentiability fails, fall back to $\\lim_{h\\to0} \\frac{f(P + h\\bar v) - f(P)}{h}$.",
  },
];
