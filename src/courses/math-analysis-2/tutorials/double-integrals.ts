import type { Question } from "../../../types";

/* ================================================================== *
 *  TUTORIAL SHEET — Double integrals (official MA2 exercise sheet,
 *  A.A. 2025-26: Ex_doubleintegrals.pdf). Answers cross-checked
 *  against Sol_doubleintegrals.pdf AND recomputed independently.
 *  Numeric answers are decimals; the exact closed form lives in the
 *  explanation. All 7 exercises of the sheet are covered (10 cards).
 * ================================================================== */

const SRC = "Ex_doubleintegrals";

export const tutorialQuestions: Question[] = [
  /* ---------------- Esercise 1a ---------------- */
  {
    id: "ma2-tut-di-1",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1a`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute $\\displaystyle\\iint_D (1 + \\sin^2 x \\cos x)\\,y \\,dx\\,dy$ over the square $D = [0,1]\\times[0,1]$ (two decimals).",
    answer: 0.5993,
    tolerance: 0.01,
    explanation:
      "On a rectangle the integrand factors as $g(x)h(y)$, so Fubini splits the double integral into a product: $\\int_0^1 y\\,dy = \\tfrac12$ and $\\int_0^1 (1+\\sin^2 x\\cos x)\\,dx = 1 + \\int_0^1 \\sin^2 x\\cos x\\,dx$. For the last piece substitute $t = \\sin x$, $dt = \\cos x\\,dx$: $\\int_0^{\\sin 1} t^2\\,dt = \\tfrac{\\sin^3(1)}{3}$. Exact value: $\\tfrac12\\left(1 + \\tfrac{\\sin^3(1)}{3}\\right) \\approx 0.5993$.",
    theory:
      "Rectangle + separable integrand $\\Rightarrow$ the double integral is the product of two single integrals. Spot the pattern $u'(x)\\,u(x)^n$ ($\\sin^2 x\\cos x$ here) — it integrates to $u^{n+1}/(n+1)$ by substitution.",
  },

  /* ---------------- Esercise 1b ---------------- */
  {
    id: "ma2-tut-di-2",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1b`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute $\\displaystyle\\iint_D \\cos^2 x \\cos y \\,dx\\,dy$ where $D = \\{(x,y): 0 \\le x \\le 1,\\ 0 \\le y \\le x\\}$ (two decimals).",
    answer: 0.2808,
    tolerance: 0.01,
    explanation:
      "$D$ is the triangle with vertices $(0,0)$, $(1,0)$, $(1,1)$ — an $x$-normal domain, so integrate in $y$ first: $\\int_0^x \\cos y\\,dy = \\sin x$. That leaves $\\int_0^1 \\cos^2 x\\,\\sin x\\,dx$; substitute $t = \\cos x$, $dt = -\\sin x\\,dx$, giving $\\int_{\\cos 1}^{1} t^2\\,dt = \\tfrac13 - \\tfrac{\\cos^3(1)}{3}$. Exact value: $\\tfrac{1-\\cos^3(1)}{3} \\approx 0.2808$.",
    theory:
      "For a normal (non-rectangular) domain, sketch it first, then let the inner variable run between the two boundary graphs. The inner integral often *creates* the substitution factor for the outer one — here $\\sin x$ paired with $\\cos^2 x$.",
  },

  /* ---------------- Esercise 1c ---------------- */
  {
    id: "ma2-tut-di-3",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1c`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute $\\displaystyle\\iint_D y\\,e^{xy} \\,dx\\,dy$ over the square $D = \\{(x,y): 0 \\le x \\le 1,\\ 0 \\le y \\le 1\\}$ (two decimals).",
    answer: 0.7183,
    tolerance: 0.01,
    explanation:
      "The order of integration is the whole game. Integrating in $x$ first is clean because $y$ is a constant there: $\\int_0^1 y\\,e^{xy}\\,dx = \\left[e^{xy}\\right]_0^1 = e^y - 1$. Then $\\int_0^1 (e^y - 1)\\,dy = e - 1 - 1 = e - 2 \\approx 0.7183$. Integrating in $y$ first would force integration by parts — legal, but twice the work.",
    theory:
      "Fubini lets you pick the order on a rectangle. Before computing, ask: in which order does the inner integral hit an exact antiderivative? A factor like $y\\,e^{xy}$ is exactly $\\partial_x e^{xy}$ — read the integrand as a derivative in one of the variables.",
  },

  /* ---------------- Esercise 2 ---------------- */
  {
    id: "ma2-tut-di-4",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Consider $D = \\{(x,y) \\in \\mathbb R^2 : x^2 + y^2 \\le 1,\\ x^2 - y \\le 1\\}$. Call $D$ *$x$-normal* if it can be written as $\\{a \\le x \\le b,\\ g_1(x) \\le y \\le g_2(x)\\}$, and *$y$-normal* if it can be written as $\\{c \\le y \\le d,\\ h_1(y) \\le x \\le h_2(y)\\}$, with continuous boundary functions. Then $D$ is:",
    options: [
      { id: "A", content: "$x$-normal but not $y$-normal" },
      { id: "B", content: "$y$-normal but not $x$-normal" },
      { id: "C", content: "both $x$-normal and $y$-normal" },
      { id: "D", content: "neither $x$-normal nor $y$-normal" },
    ],
    correct: "C",
    explanation:
      "Sketch: the unit circle and the parabola $y = x^2 - 1$ (vertex $(0,-1)$, opening upwards) meet at $(\\pm 1, 0)$ and at the vertex itself. **$x$-normal:** for $x \\in [-1,1]$ the slice is the single interval $x^2 - 1 \\le y \\le \\sqrt{1-x^2}$ (the lower bound is always $\\le 0 \\le$ the upper), so A's denial of $y$-normality is the only thing left to check. **$y$-normal:** for $-1 \\le y \\le 0$ the parabola is the binding constraint ($1+y \\le 1-y^2$ there), giving $|x| \\le \\sqrt{1+y}$; for $0 \\le y \\le 1$ the circle binds, giving $|x| \\le \\sqrt{1-y^2}$. Every horizontal slice is one interval, so $D$ is $y$-normal too — with a *piecewise* boundary function, which is perfectly allowed. Hence C; B and D fail because the vertical slices clearly work.",
    theory:
      "Normality is about slices: a domain is normal w.r.t. an axis when every slice perpendicular to it is a single segment. The boundary functions may be defined piecewise — what breaks normality is a slice that splits into two or more pieces (e.g. an annulus sliced through the hole).",
  },

  /* ---------------- Esercise 3 ---------------- */
  {
    id: "ma2-tut-di-5",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** A metal slab occupies $D = \\{(x,y): x \\ge 0,\\ |y| \\le 1 - x^2\\}$ and has density $d(x,y) = |x|\\,e^{y}$. Compute its mass $m(D) = \\iint_D d(x,y)\\,dx\\,dy$ (two decimals).",
    answer: 0.5431,
    tolerance: 0.01,
    explanation:
      "$D$ is $x$-normal: $x \\in [0,1]$ (we need $1 - x^2 \\ge 0$) with $-(1-x^2) \\le y \\le 1-x^2$, and $|x| = x$ there. Inner integral: $\\int_{-(1-x^2)}^{1-x^2} e^y\\,dy = e^{1-x^2} - e^{x^2-1}$, so $m = \\int_0^1 x\\left(e^{1-x^2} - e^{x^2-1}\\right)dx$. Substitute $t = x^2$, $dt = 2x\\,dx$: $\\tfrac12\\int_0^1 (e^{1-t} - e^{t-1})\\,dt = \\tfrac12\\left(e + e^{-1} - 2\\right)$. Exact value: $\\cosh(1) - 1 \\approx 0.5431$.",
    theory:
      "Mass = integral of the density: $m(D) = \\iint_D d\\,dA$. When the integrand carries a factor $x$ and the bounds depend on $x^2$, the substitution $t = x^2$ is almost always the move — the stray $x$ is exactly the $dt/2$ you need.",
  },

  /* ---------------- Esercise 4a ---------------- */
  {
    id: "ma2-tut-di-6",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 4a`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Compute $\\displaystyle\\iint_D |y - x| \\,dx\\,dy$ where $D = \\{(x,y): -1 \\le x \\le 1,\\ x^2 \\le y \\le 1\\}$. Give the value as a decimal.",
    answer: 0.8333,
    tolerance: 0.01,
    explanation:
      "An absolute value in the integrand means: split the domain along the line where it changes sign, here $y = x$. Rewrite $D$ as $y$-normal ($y \\in [0,1]$, $-\\sqrt y \\le x \\le \\sqrt y$); since $y \\le \\sqrt y$ on $[0,1]$ the line $x = y$ really cuts each slice. On $D_1$ ($x < y$): $\\int_0^1\\!\\int_{-\\sqrt y}^{y} (y-x)\\,dx\\,dy = \\int_0^1\\left(\\tfrac{y^2}{2} + y^{3/2} + \\tfrac{y}{2}\\right)dy = \\tfrac16 + \\tfrac25 + \\tfrac14 = \\tfrac{49}{60}$. On $D_2$ ($x \\ge y$): $\\int_0^1\\!\\int_{y}^{\\sqrt y} (x-y)\\,dx\\,dy = \\tfrac14 - \\tfrac25 + \\tfrac16 = \\tfrac{1}{60}$. Total: $\\tfrac{49}{60} + \\tfrac{1}{60} = \\tfrac56 \\approx 0.8333$. Dropping the absolute value (integrating $y - x$ everywhere) is the classic slip — it silently subtracts the $D_2$ contribution instead of adding it.",
    theory:
      "$|f|$ is not integrable by antiderivative tricks: partition the domain by the zero set of the inside, flip the sign on the negative part, and add the pieces by additivity. Choosing the slicing direction so the split line enters each slice only once keeps the bookkeeping linear.",
  },

  /* ---------------- Esercise 4b ---------------- */
  {
    id: "ma2-tut-di-7",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 4b`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute $\\displaystyle\\iint_D (3xy - 2x) \\,dx\\,dy$ where $D = \\{(x,y): x^2 + 4y^2 \\le 4,\\ x \\ge 0,\\ y \\ge 0\\}$ (quarter of an ellipse; use elliptic coordinates). Give the value as a decimal.",
    answer: -1.1667,
    tolerance: 0.01,
    explanation:
      "The boundary is $\\tfrac{x^2}{4} + y^2 = 1$: semi-axes $a = 2$, $b = 1$. Elliptic coordinates $x = 2r\\cos\\theta$, $y = r\\sin\\theta$ map $D$ to $r \\in [0,1]$, $\\theta \\in [0,\\tfrac\\pi2]$, with Jacobian $|\\det J\\Phi| = abr = 2r$ (NOT $r$ — that's the trap). Then $\\iint_D (3xy - 2x) = 12\\int_0^1 r^3 dr \\int_0^{\\pi/2}\\cos\\theta\\sin\\theta\\,d\\theta - 8\\int_0^1 r^2 dr \\int_0^{\\pi/2}\\cos\\theta\\,d\\theta = 12\\cdot\\tfrac14\\cdot\\tfrac12 - 8\\cdot\\tfrac13\\cdot 1 = \\tfrac32 - \\tfrac83 = -\\tfrac76 \\approx -1.1667$. A negative result is fine: the $-2x$ term outweighs $3xy$ on this region.",
    theory:
      "For $\\tfrac{x^2}{a^2} + \\tfrac{y^2}{b^2} \\le 1$ use $x = ar\\cos\\theta$, $y = br\\sin\\theta$ with $dA = ab\\,r\\,dr\\,d\\theta$: the ellipse becomes the unit disk $r \\le 1$. Always multiply by the Jacobian of the *specific* change of variables, not the polar one by reflex.",
  },

  /* ---------------- Esercise 5 ---------------- */
  {
    id: "ma2-tut-di-8",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Using polar coordinates, compute $\\displaystyle\\iint_D |x + y| \\,dx\\,dy$ where $D = \\{(x,y): 1 \\le x^2 + y^2 \\le 4\\}$ (two decimals).",
    answer: 13.1993,
    tolerance: 0.01,
    explanation:
      "$D$ is the annulus $r \\in [1,2]$, $\\theta \\in [-\\pi,\\pi]$, and in polar $|x+y| = r\\,|\\cos\\theta + \\sin\\theta| = r\\sqrt2\\,\\left|\\sin\\!\\left(\\theta + \\tfrac\\pi4\\right)\\right|$. With the Jacobian $r$: $\\iint_D |x+y|\\,dA = \\sqrt2\\int_1^2 r^2\\,dr \\int_{-\\pi}^{\\pi}\\left|\\sin\\!\\left(\\theta+\\tfrac\\pi4\\right)\\right|d\\theta = \\sqrt2 \\cdot \\tfrac73 \\cdot 4$, since $|\\sin|$ integrates to $4$ over any full period. Exact value: $\\tfrac{28\\sqrt2}{3} \\approx 13.1993$. The sheet's route splits $D$ along the line $y = -x$ into the half where $x + y \\ge 0$ ($\\theta \\in [-\\tfrac\\pi4, \\tfrac{3\\pi}4]$, giving $\\tfrac{14\\sqrt2}{3}$) and its mirror image, which contributes the same amount by the symmetry of both $D$ and $|x+y|$ about that line.",
    theory:
      "Annuli and disks scream polar coordinates: $dA = r\\,dr\\,d\\theta$. For absolute values of linear expressions, either split the angular range where the sign flips, or exploit a symmetry of domain + integrand to compute one part and double it.",
  },

  /* ---------------- Esercise 6 ---------------- */
  {
    id: "ma2-tut-di-9",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** The slab $D = \\{(x,y): x^2 + y^2 \\le 1,\\ y \\ge 0\\}$ (upper half-disk) has constant density $d(x,y) = c > 0$. Its barycenter $(\\bar x, \\bar y)$ is:",
    options: [
      { id: "A", content: "$\\left(0,\\ \\tfrac{2}{\\pi}\\right)$" },
      { id: "B", content: "$\\left(0,\\ \\tfrac{4}{3\\pi}\\right)$" },
      { id: "C", content: "$\\left(0,\\ \\tfrac{1}{2}\\right)$" },
      { id: "D", content: "$\\left(\\tfrac{4}{3\\pi},\\ \\tfrac{4}{3\\pi}\\right)$" },
    ],
    correct: "B",
    explanation:
      "Mass first: $m(D) = c\\cdot\\text{Area} = c\\tfrac\\pi2$. $\\bar x = 0$ without computing anything: $D$ is symmetric about the $y$-axis and $x$ is odd in $x$, killing D. For $\\bar y$, polar coordinates ($r \\in [0,1]$, $\\theta \\in [0,\\pi]$, Jacobian $r$): $\\bar y = \\tfrac{2}{c\\pi}\\int_0^1\\!\\int_0^\\pi c\\,r\\sin\\theta\\cdot r\\,d\\theta\\,dr = \\tfrac2\\pi \\cdot \\tfrac13 \\cdot 2 = \\tfrac{4}{3\\pi} \\approx 0.424$. Note the constant $c$ cancels — a uniform slab's barycenter is purely geometric. A ($\\tfrac2\\pi$) is what you get if you forget the Jacobian $r$ in the moment integral; C plants the barycenter at half the radius, but the half-disk's area is concentrated low, so $\\bar y < \\tfrac12$.",
    theory:
      "Barycenter: $\\bar x = \\tfrac{1}{m}\\iint x\\,d\\,dA$, $\\bar y = \\tfrac{1}{m}\\iint y\\,d\\,dA$ with $m = \\iint d\\,dA$. Hunt symmetries first: an axis of symmetry of the region (with matching density) forces the barycenter onto it, wiping out one integral for free.",
  },

  /* ---------------- Esercise 7 ---------------- */
  {
    id: "ma2-tut-di-10",
    type: "numeric",
    topic: "Double & triple integrals",
    tags: ["tutorial"],
    source: `${SRC} · Ex 7`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute $\\displaystyle\\iint_D (x - 1) \\,dx\\,dy$ where $D = \\{(x,y): x^2 + y^2 \\le 2x,\\ x \\ge 1,\\ y \\ge 0\\}$ (two decimals).",
    answer: 0.3333,
    tolerance: 0.01,
    explanation:
      "Complete the square: $x^2 + y^2 \\le 2x \\iff (x-1)^2 + y^2 \\le 1$, a disk of radius 1 centred at $(1,0)$; the constraints $x \\ge 1$, $y \\ge 0$ cut out one quarter of it. Use polar coordinates *centred at the disk's centre*: $x = 1 + r\\cos\\theta$, $y = r\\sin\\theta$, so $D$ becomes $r \\in [0,1]$, $\\theta \\in [0,\\tfrac\\pi2]$ and — the payoff — the integrand collapses to $x - 1 = r\\cos\\theta$. With Jacobian $r$: $\\int_0^1\\!\\int_0^{\\pi/2} r\\cos\\theta\\cdot r\\,d\\theta\\,dr = \\int_0^1 r^2\\,dr \\cdot \\left[\\sin\\theta\\right]_0^{\\pi/2} = \\tfrac13 \\approx 0.3333$. Standard polar centred at the origin would leave $r$-bounds depending on $\\theta$ ($r \\le 2\\cos\\theta$) — much messier.",
    theory:
      "When the boundary is a circle *not* centred at the origin, complete the square to find its centre and shift the polar coordinates there: the translation has Jacobian 1, so $dA$ is still $r\\,dr\\,d\\theta$. Bonus points when the shift also simplifies the integrand, as with $x - 1$ here.",
  },
];
