import type { Question } from "../../../types";

/* ================================================================== *
 *  TUTORIAL SHEET — Line integrals (official MA2 exercise sheet
 *  "Ex_lineintegrals", A.A. 2025-2026, with solutions from
 *  "Sol_lineintegrals"). Every answer re-derived and numerically
 *  cross-checked before inclusion.
 * ================================================================== */

const TOPIC = "Curves, line integrals & vector fields";

export const tutorialQuestions: Question[] = [
  /* ---------------- Ex 1a — first-type integral, half circle ---------------- */
  {
    id: "ma2-tut-li-1",
    type: "numeric",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 1a",
    prompt:
      "**[Tutorial sheet]** Compute $\\int_\\gamma f\\,ds$ where $f(x,y) = \\dfrac{y}{x^2+y^2}$ and $\\gamma$ is the upper half circumference centred at the origin with radius $R$. (The result is the same for every $R>0$ — enter that value.)",
    answer: 2,
    tolerance: 0.01,
    explanation:
      "Parametrize $\\gamma(t) = (R\\cos t, R\\sin t)$, $t \\in [0,\\pi]$. Then $\\lVert\\gamma'(t)\\rVert = \\lVert(-R\\sin t, R\\cos t)\\rVert = R$, so $ds = R\\,dt$. On the curve $x^2+y^2 = R^2$, hence $f(\\gamma(t)) = \\dfrac{R\\sin t}{R^2}$ and\n\n$$\\int_\\gamma f\\,ds = \\int_0^\\pi \\frac{R\\sin t}{R^2}\\,R\\,dt = \\int_0^\\pi \\sin t\\,dt = [-\\cos t]_0^\\pi = 2.$$\n\nThe two factors of $R$ cancel exactly, which is why the answer is $2$ independently of the radius. Always evaluate $f$ **on the curve** before integrating — here the constraint $x^2+y^2 = R^2$ collapses the denominator.",
    theory:
      "First-type (scalar) line integral: $\\int_\\gamma f\\,ds = \\int_a^b f(\\gamma(t))\\,\\lVert\\gamma'(t)\\rVert\\,dt$. It is orientation-independent and needs a regular $C^1$ parametrization with $\\gamma'(t) \\ne 0$.",
  },

  /* ---------------- Ex 1b — first-type integral, parabola arc ---------------- */
  {
    id: "ma2-tut-li-2",
    type: "numeric",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 1b",
    prompt:
      "**[Tutorial sheet]** Compute $\\int_\\gamma f\\,ds$ where $f(x,y) = \\sqrt{1 + 3x + y^2}$ and $\\gamma$ is the arc of the parabola $x = y^2$, $y \\in [-1,1]$ (two decimals).",
    answer: 4.67,
    tolerance: 0.01,
    explanation:
      "Exact value: $\\tfrac{14}{3} \\approx 4.67$. Since the parabola is given as $x = y^2$, use $y$ itself as the parameter: $\\gamma(t) = (t^2, t)$, $t \\in [-1,1]$, so $\\gamma'(t) = (2t,1)$ and $\\lVert\\gamma'(t)\\rVert = \\sqrt{4t^2+1}$. On the curve, $1 + 3x + y^2 = 1 + 3t^2 + t^2 = 1 + 4t^2$, so the integrand becomes\n\n$$\\sqrt{1+4t^2}\\,\\sqrt{4t^2+1} = 1 + 4t^2,$$\n\nand the square roots vanish entirely:\n\n$$\\int_{-1}^{1} (1+4t^2)\\,dt = 2\\int_0^1 (1+4t^2)\\,dt = 2\\left(1 + \\tfrac{4}{3}\\right) = \\tfrac{14}{3}.$$\n\nThis pairing of $f(\\gamma(t))$ with $\\lVert\\gamma'\\rVert$ into a perfect square is a designed feature of many exam integrals — expect it.",
    theory:
      "For a curve given as $x = g(y)$, parametrize by $y$: $\\gamma(t) = (g(t), t)$ with $ds = \\sqrt{g'(t)^2 + 1}\\,dt$. Substitute the curve equation into $f$ first — simplifications usually appear only after that.",
  },

  /* ---------------- Ex 2 — second-type integral, direct computation ---------------- */
  {
    id: "ma2-tut-li-3",
    type: "numeric",
    topic: TOPIC,
    difficulty: "easy",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 2",
    prompt:
      "**[Tutorial sheet]** Compute the line integral of second type $\\int_\\gamma F \\cdot dl$ where $F(x,y) = (x^2,\\ x+y)$ and $\\gamma(t) = (t^2,\\ t - t^2)$, $t \\in [0,1]$ (two decimals).",
    answer: 0.17,
    tolerance: 0.01,
    explanation:
      "Exact value: $\\tfrac{1}{6} \\approx 0.17$. Direct recipe: $\\gamma'(t) = (2t,\\ 1-2t)$, and on the curve $x = t^2$, $y = t - t^2$, so $F(\\gamma(t)) = (t^4,\\ t^2 + t - t^2) = (t^4,\\ t)$ — note how $x + y$ collapses to $t$. Then\n\n$$\\int_\\gamma F\\cdot dl = \\int_0^1 (t^4, t)\\cdot(2t, 1-2t)\\,dt = \\int_0^1 \\left(2t^5 + t - 2t^2\\right)dt = \\frac{2}{6} + \\frac{1}{2} - \\frac{2}{3} = \\frac{1}{6}.$$\n\nNo conservativity check is needed when you integrate directly along one given curve — the theorems only matter when you want to change the path or find a potential.",
    theory:
      "Second-type (work) integral: $\\int_\\gamma F\\cdot dl = \\int_a^b F(\\gamma(t))\\cdot\\gamma'(t)\\,dt$. Unlike $\\int f\\,ds$, it flips sign when the orientation is reversed.",
  },

  /* ---------------- Ex 3 — Green's theorem on the unit square ---------------- */
  {
    id: "ma2-tut-li-4",
    type: "numeric",
    topic: TOPIC,
    difficulty: "easy",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 3",
    prompt:
      "**[Tutorial sheet]** Let $D = [0,1]\\times[0,1]$ and $F(x,y) = (y^2,\\ x)$. Compute $\\oint_{\\partial D} F\\cdot dl$ with $\\partial D$ oriented anticlockwise.",
    answer: 0,
    tolerance: 0.01,
    explanation:
      "By Green's Theorem (valid since $F \\in C^1$ and $D$ is a Jordan region with positively oriented boundary),\n\n$$\\oint_{\\partial D} F\\cdot dl = \\iint_D \\left(\\frac{\\partial F_2}{\\partial x} - \\frac{\\partial F_1}{\\partial y}\\right)dx\\,dy = \\iint_D (1 - 2y)\\,dx\\,dy = \\int_0^1 (1-2y)\\,dy = 1 - 1 = 0.$$\n\nThe circulation vanishes even though $F$ is **not** conservative ($\\operatorname{curl} F = 1-2y \\not\\equiv 0$): the positive part of the curl over $y < \\tfrac12$ exactly cancels the negative part over $y > \\tfrac12$. Zero circulation on one particular loop never proves conservativity.",
    theory:
      "Green's Theorem: $\\oint_{\\partial D} F\\cdot dl = \\iint_D (\\partial_x F_2 - \\partial_y F_1)\\,dA$ for positively (anticlockwise) oriented boundary. It converts a 4-segment boundary computation into one double integral.",
  },

  /* ---------------- Ex 4 — Green's theorem kills ugly terms ---------------- */
  {
    id: "ma2-tut-li-5",
    type: "numeric",
    topic: TOPIC,
    difficulty: "hard",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 4",
    prompt:
      "**[Tutorial sheet]** Compute $\\oint_{\\partial\\Omega} F\\cdot dl$ where $F(x,y) = \\left(6xy^2 - e^{x^8\\sin x},\\ 12x^2y - \\cos\\!\\left(y^4 + e^{y^2-7y}\\right)\\right)$ and $\\Omega = \\{(x,y): 1 \\le x^2+y^2 \\le 5,\\ 0 \\le y \\le x+1\\}$, with positively oriented boundary.",
    answer: 31,
    tolerance: 0.01,
    explanation:
      "Do **not** try to integrate the monstrous terms — Green's Theorem removes them. The term $-e^{x^8\\sin x}$ depends only on $x$ (so its $\\partial_y$ is $0$) and $-\\cos(y^4+e^{y^2-7y})$ depends only on $y$ (so its $\\partial_x$ is $0$). Hence\n\n$$\\operatorname{curl} F = \\partial_x F_2 - \\partial_y F_1 = 24xy - 12xy = 12xy,$$\n\nand $\\oint_{\\partial\\Omega} F\\cdot dl = 12\\iint_\\Omega xy\\,dA$. Describe $\\Omega$ (the part of the annulus of radii $1$ and $\\sqrt5$ in the first quadrant below $y = x+1$) as an $x$-normal domain: for $0 \\le x \\le 1$, $\\sqrt{1-x^2} \\le y \\le x+1$; for $1 < x \\le \\sqrt5$, $0 \\le y \\le \\sqrt{5-x^2}$. Then\n\n$$\\iint_\\Omega xy\\,dA = \\frac12\\int_0^1 x\\left[(1+x)^2 - (1-x^2)\\right]dx + \\frac12\\int_1^{\\sqrt5} x(5-x^2)\\,dx = \\frac{7}{12} + 2 = \\frac{31}{12},$$\n\nso the circulation is $12\\cdot\\frac{31}{12} = 31$.",
    theory:
      "When a closed-curve work integral contains terms impossible to antidifferentiate, that is a signal to use Green's Theorem: any term of $F_1$ depending only on $x$, or of $F_2$ depending only on $y$, drops out of the curl.",
  },

  /* ---------------- Ex 5 — area via Green's theorem ---------------- */
  {
    id: "ma2-tut-li-6",
    type: "numeric",
    topic: TOPIC,
    difficulty: "hard",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 5",
    prompt:
      "**[Tutorial sheet]** Let $D$ be the region delimited by the trace of $\\gamma(t) = (t^3,\\ t(1-t))$, $t \\in [0,1]$, and the $x$-axis. Using Green's Theorem, compute the area of $D$ (two decimals).",
    answer: 0.15,
    tolerance: 0.01,
    explanation:
      "Exact value: $\\tfrac{3}{20} = 0.15$. Pick any $F$ with $\\operatorname{curl} F = 1$, e.g. $F = (0, x)$; then $\\text{Area}(D) = \\oint_{\\partial D} x\\,dy$ over the **anticlockwise** boundary. The boundary is the segment $\\beta(t) = (t,0)$ (where $dy = 0$, contributing nothing) plus the arc $\\gamma$ traversed from $(1,0)$ back to $(0,0)$, i.e. reversed: $\\tilde\\gamma(t) = \\gamma(1-t) = ((1-t)^3,\\ t(1-t))$. So\n\n$$\\text{Area} = \\int_0^1 (1-t)^3\\,\\frac{d}{dt}\\big[t(1-t)\\big]\\,dt = \\int_0^1 (1-t)^3(1-2t)\\,dt \\overset{s=1-t}{=} \\int_0^1 s^3(2s-1)\\,ds = \\frac{2}{5} - \\frac{1}{4} = \\frac{3}{20}.$$\n\nSanity check with the other area formula, $\\oint(-y)\\,dx$ along $\\gamma$ itself: $\\int_0^1 t(1-t)\\cdot 3t^2\\,dt = 3(\\tfrac14 - \\tfrac15) = \\tfrac{3}{20}$ — same answer. If you get a negative area you ran the boundary clockwise; fix the orientation, don't just drop the sign blindly.",
    theory:
      "Green area formulas: $\\text{Area} = \\oint_{\\partial D} x\\,dy = -\\oint_{\\partial D} y\\,dx = \\tfrac12\\oint_{\\partial D}(x\\,dy - y\\,dx)$, all with anticlockwise boundary. To reverse a parametrization on $[0,1]$, compose with $\\phi(t) = 1-t$.",
  },

  /* ---------------- Ex 6a — conservative or not (2D) ---------------- */
  {
    id: "ma2-tut-li-7",
    topic: TOPIC,
    difficulty: "easy",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 6a",
    prompt:
      "**[Tutorial sheet]** Is the vector field $F(x,y) = (\\sin x + y,\\ -x + \\cos y)$ conservative on $D = \\mathbb{R}^2$?",
    options: [
      {
        id: "A",
        content:
          "Yes — $F \\in C^1(\\mathbb{R}^2)$ and $\\mathbb{R}^2$ is simply connected, which is enough.",
      },
      {
        id: "B",
        content:
          "Yes — a potential is $U(x,y) = -\\cos x + \\sin y + xy$.",
      },
      {
        id: "C",
        content:
          "No — $\\partial_x F_2 - \\partial_y F_1 = -1 - 1 = -2 \\ne 0$, so $F$ is not even irrotational.",
      },
      {
        id: "D",
        content:
          "No — $\\mathbb{R}^2$ is not simply connected, so no potential can exist.",
      },
    ],
    correct: "C",
    explanation:
      "$\\operatorname{curl} F = \\partial_x(-x+\\cos y) - \\partial_y(\\sin x + y) = -1 - 1 = -2 \\ne 0$. Being irrotational is **necessary** for a $C^1$ field to be conservative (mixed partials of a potential must agree), so $F$ cannot be conservative — **C**.\n\n- **A** inverts the logic: simple connectedness upgrades *irrotational* to *conservative*; it never replaces the curl check itself.\n- **B**: that $U$ gives $\\nabla U = (\\sin x + y,\\ \\cos y + x)$ — the sign of the $x$ in the second component is wrong, so it is not a potential of $F$.\n- **D** is false twice: $\\mathbb{R}^2$ *is* simply connected, and even if it were not, that alone would not rule out a potential.",
    theory:
      "For $F \\in C^1(D)$: conservative $\\Rightarrow$ irrotational, always. The converse holds when $D$ is simply connected. Workflow: compute $\\operatorname{curl} F = \\partial_x F_2 - \\partial_y F_1$ first — if it is nonzero anywhere, stop: not conservative.",
  },

  /* ---------------- Ex 6b — conservative or not (3D) ---------------- */
  {
    id: "ma2-tut-li-8",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 6b",
    prompt:
      "**[Tutorial sheet]** Is the vector field $F(x,y,z) = (x(1-e^z),\\ -y,\\ e^z)$ conservative on $D = \\mathbb{R}^3$?",
    options: [
      {
        id: "A",
        content:
          "No — $\\operatorname{curl} F = (0,\\ -x e^z,\\ 0) \\ne (0,0,0)$, so $F$ is not irrotational.",
      },
      {
        id: "B",
        content:
          "Yes — all components are $C^1$ and $\\mathbb{R}^3$ is simply connected, which guarantees a potential.",
      },
      {
        id: "C",
        content:
          "No — the first curl component $\\partial_y F_3 - \\partial_z F_2 = -2y \\ne 0$.",
      },
      {
        id: "D",
        content:
          "Yes — a potential is $U(x,y,z) = \\tfrac{x^2}{2}(1-e^z) - \\tfrac{y^2}{2} + e^z$.",
      },
    ],
    correct: "A",
    explanation:
      "In 3D the full curl is $\\operatorname{curl} F = (\\partial_y F_3 - \\partial_z F_2,\\ \\partial_z F_1 - \\partial_x F_3,\\ \\partial_x F_2 - \\partial_y F_1)$. Here: first component $0 - 0 = 0$; second $\\partial_z[x(1-e^z)] - \\partial_x e^z = -xe^z - 0 = -xe^z$; third $0 - 0 = 0$. Since $\\operatorname{curl} F = (0, -xe^z, 0)$ is not identically zero, $F$ is not conservative — **A**.\n\n- **B** repeats the classic inversion: simple connectedness only matters *after* the curl is zero; it cannot manufacture a potential for a non-irrotational field.\n- **C** computes the wrong entry: $F_3 = e^z$ has no $y$-dependence and $F_2 = -y$ has no $z$-dependence, so that component is $0$, not $-2y$.\n- **D**: check by differentiating — $\\partial_z U = -\\tfrac{x^2}{2}e^z + e^z \\ne e^z = F_3$, so it is not a potential.\n\nOne nonzero curl component anywhere is enough to conclude; you need not check the rest.",
    theory:
      "3D conservativity check: compute all three components of $\\operatorname{curl} F$. A single nonzero component kills conservativity on any domain. Verifying a claimed potential is cheap — just take its gradient — so always test option-style 'potentials' directly.",
  },

  /* ---------------- Ex 7 — work of a conservative field via potential ---------------- */
  {
    id: "ma2-tut-li-9",
    type: "numeric",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 7",
    prompt:
      "**[Tutorial sheet]** Let $\\gamma:[a,b]\\to\\mathbb{R}^2$ be a regular curve with $\\gamma(a) = \\left(0, -\\tfrac{7}{4}\\right)$ and $\\gamma(b) = \\left(\\tfrac{\\pi}{6}, 3\\right)$, and let $F(x,y) = \\left(e^x + 3y\\cos(3x),\\ \\sin(3x)\\right)$. Compute $\\int_\\gamma F\\cdot dl$ (two decimals).",
    answer: 3.69,
    tolerance: 0.01,
    explanation:
      "Exact value: $2 + e^{\\pi/6} \\approx 3.69$. The curve is unknown between its endpoints, so the integral can only be computed if $F$ is conservative. Check: $\\operatorname{curl} F = \\partial_x\\sin(3x) - \\partial_y[e^x + 3y\\cos(3x)] = 3\\cos(3x) - 3\\cos(3x) = 0$, and $\\mathbb{R}^2$ is simply connected, so $F$ has a potential. Find it from the **simpler** equation first: $\\partial_y U = \\sin(3x)$ gives $U = y\\sin(3x) + g(x)$; substituting into $\\partial_x U = e^x + 3y\\cos(3x)$ yields $3y\\cos(3x) + g'(x) = e^x + 3y\\cos(3x)$, so $g(x) = e^x$. Hence $U(x,y) = y\\sin(3x) + e^x$ and\n\n$$\\int_\\gamma F\\cdot dl = U\\!\\left(\\tfrac{\\pi}{6},3\\right) - U\\!\\left(0,-\\tfrac{7}{4}\\right) = \\left(3\\sin\\tfrac{\\pi}{2} + e^{\\pi/6}\\right) - (0 + 1) = 2 + e^{\\pi/6}.$$\n\nThe unused endpoint value $-\\tfrac74$ multiplies $\\sin(0) = 0$ — data designed to punish sign slips, not to be discarded by guessing.",
    theory:
      "Fundamental theorem for conservative fields: $\\int_\\gamma F\\cdot dl = U(\\gamma(b)) - U(\\gamma(a))$ — the path is irrelevant. To find $U$, integrate the component with fewer terms and fix the 'constant' (a function of the other variable) with the remaining equation. Alternative: replace $\\gamma$ by the straight segment between the endpoints and integrate directly.",
  },

  /* ---------------- Ex 8 — when is φ(x)·F conservative? ---------------- */
  {
    id: "ma2-tut-li-10",
    topic: TOPIC,
    difficulty: "hard",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 8",
    prompt:
      "**[Tutorial sheet]** Let $F(x,y) = (e^{x-y},\\ -e^{x-y})$ and $\\phi \\in C^1(\\mathbb{R})$. Define $G(x,y) = \\phi(x)F(x,y)$. Then $G$ is conservative on $\\mathbb{R}^2$ **if and only if**:",
    options: [
      { id: "A", content: "$\\phi = 0$." },
      { id: "B", content: "$\\phi$ is constant." },
      { id: "C", content: "$\\phi(x) = x$." },
      { id: "D", content: "$\\phi(x) > 0$ for every $x \\in \\mathbb{R}$." },
    ],
    correct: "B",
    explanation:
      "Since $G \\in C^1(\\mathbb{R}^2)$ and $\\mathbb{R}^2$ is simply connected, $G$ is conservative $\\iff$ $\\operatorname{curl} G = 0$. By the product rule,\n\n$$\\operatorname{curl} G = \\partial_x[\\phi(x)F_2] - \\partial_y[\\phi(x)F_1] = \\phi'(x)F_2 + \\phi(x)\\underbrace{(\\partial_x F_2 - \\partial_y F_1)}_{\\operatorname{curl} F}.$$\n\nHere $\\operatorname{curl} F = -e^{x-y} - (-e^{x-y}) = 0$ ($F$ itself is conservative), so $\\operatorname{curl} G = \\phi'(x)F_2(x,y)$. Since $F_2 = -e^{x-y} < 0$ **never vanishes**, $\\operatorname{curl} G \\equiv 0 \\iff \\phi'(x) = 0$ for all $x$, i.e. $\\phi$ constant — **B**.\n\n- **A** ($\\phi = 0$) is sufficient but fails 'only if': any other constant also works, so the equivalence is false.\n- **C** gives $\\phi' = 1 \\ne 0$, making $\\operatorname{curl} G = F_2 \\ne 0$ — not conservative.\n- **D** confuses positivity with constancy: e.g. $\\phi(x) = e^x > 0$ has $\\phi' \\ne 0$, so $G$ is not conservative.\n\nIn 'if and only if' questions, test each candidate in **both** directions — sufficiency alone is a trap.",
    theory:
      "Multiplying a conservative field by a non-constant scalar function generally destroys conservativity: $\\operatorname{curl}(\\phi F) = \\phi\\operatorname{curl} F + \\nabla\\phi \\times F$ (in 2D: $\\phi'(x)F_2$ when $\\phi = \\phi(x)$). The product stays conservative iff the extra term vanishes identically.",
  },

  /* ---------------- Ex 9i — parameters making F conservative ---------------- */
  {
    id: "ma2-tut-li-11",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 9i",
    prompt:
      "**[Tutorial sheet]** Let $F(x,y,z) = \\left(\\sin y + 2bz + ay,\\ 2x + x\\cos y,\\ b(x^2+y^2)\\right)$ with $a,b \\in \\mathbb{R}$. For which values of $a$ and $b$ is $F$ conservative on $\\mathbb{R}^3$?",
    options: [
      { id: "A", content: "$a = 0$, $b = 2$." },
      { id: "B", content: "$a = 2$, $b$ arbitrary." },
      { id: "C", content: "$a = 1$, $b = 0$." },
      { id: "D", content: "$a = 2$, $b = 0$." },
    ],
    correct: "D",
    explanation:
      "$F \\in C^1(\\mathbb{R}^3)$ and $\\mathbb{R}^3$ is simply connected, so conservative $\\iff$ $\\operatorname{curl} F = (0,0,0)$ **identically in** $(x,y,z)$:\n\n- $\\partial_y F_3 - \\partial_z F_2 = 2by - 0 = 0$ for all $y$ $\\Rightarrow b = 0$;\n- $\\partial_z F_1 - \\partial_x F_3 = 2b - 2bx = 0$ for all $x$ $\\Rightarrow b = 0$ (consistent);\n- $\\partial_x F_2 - \\partial_y F_1 = (2 + \\cos y) - (\\cos y + a) = 2 - a = 0$ $\\Rightarrow a = 2$.\n\nSo $a = 2$, $b = 0$ — **D**. The key word is *identically*: an equation like $2by = 0$ must hold for **every** $y$, forcing the coefficient $b$ to vanish, not just at special points.\n\n- **A** swaps the roles of the two parameters.\n- **B** ignores the first and second curl components, which both force $b = 0$.\n- **C**: with $a = 1$ the third component leaves $2 - a = 1 \\ne 0$.",
    theory:
      "Parameter-fitting for conservativity: impose each curl component $= 0$ as a polynomial/functional identity in the variables and solve for the parameters. Every component must vanish simultaneously — checking one is never enough.",
  },

  /* ---------------- Ex 9iii — work via the potential ---------------- */
  {
    id: "ma2-tut-li-12",
    type: "numeric",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 9iii",
    prompt:
      "**[Tutorial sheet]** With $a = 2$, $b = 0$ the field $F(x,y,z) = (\\sin y + 2y,\\ 2x + x\\cos y,\\ 0)$ is conservative on $\\mathbb{R}^3$. Compute $\\int_\\gamma F\\cdot dl$ for $\\gamma(t) = \\left(t,\\ \\tfrac{\\pi}{2}t,\\ 2t^3\\right)$, $t \\in [0,1]$ (two decimals).",
    answer: 4.14,
    tolerance: 0.01,
    explanation:
      "Exact value: $1 + \\pi \\approx 4.14$. Find the potential from $\\nabla U = F$: the third equation $\\partial_z U = 0$ says $U$ does not depend on $z$; then $\\partial_x U = \\sin y + 2y$ gives $U = x(\\sin y + 2y) + h(y)$, and $\\partial_y U = x\\cos y + 2x + h'(y) = 2x + x\\cos y$ forces $h' = 0$. With the normalization $U(0,0,0)=0$: $U(x,y,z) = x\\sin y + 2xy$. By the fundamental theorem,\n\n$$\\int_\\gamma F\\cdot dl = U(\\gamma(1)) - U(\\gamma(0)) = U\\!\\left(1,\\tfrac{\\pi}{2},2\\right) - U(0,0,0) = \\sin\\tfrac{\\pi}{2} + 2\\cdot\\tfrac{\\pi}{2} = 1 + \\pi.$$\n\nThe cubic $z$-component $2t^3$ of the curve is irrelevant: $F_3 = 0$ and $U$ is $z$-free. Recognizing which data a conservative-field problem makes redundant is half the solution.",
    theory:
      "For 3D potentials, start from the most restrictive equation (here $\\partial_z U = 0$), then integrate the others, letting each 'constant of integration' depend on the remaining variables. Endpoints are all that matter afterwards: $\\int_\\gamma F\\cdot dl = U(\\text{end}) - U(\\text{start})$.",
  },

  /* ---------------- Ex 10 — circulation of a perturbed conservative field ---------------- */
  {
    id: "ma2-tut-li-13",
    topic: TOPIC,
    difficulty: "medium",
    tags: ["tutorial"],
    source: "Ex_lineintegrals · Ex 10",
    prompt:
      "**[Tutorial sheet]** Let $\\Omega \\subseteq \\mathbb{R}^2$ be a simply connected domain and $F \\in C^1(\\Omega)$ a conservative vector field. Define $G(x,y) = \\left(F_1(x,y) + \\cos(x^3),\\ F_2(x,y) - \\arctan(y^2)\\right)$. Which assertion is correct?",
    options: [
      {
        id: "A",
        content:
          "There exists a simple closed regular curve $\\gamma$ with trace in $\\Omega$ such that $\\oint_\\gamma G\\cdot dl \\ne 0$.",
      },
      {
        id: "B",
        content:
          "For every simple regular curve $\\gamma$ (closed or not) with trace in $\\Omega$, $\\int_\\gamma G\\cdot dl = 0$.",
      },
      {
        id: "C",
        content:
          "For every simple **closed** regular curve $\\gamma$ with trace in $\\Omega$, $\\oint_\\gamma G\\cdot dl = 0$.",
      },
      {
        id: "D",
        content:
          "Nothing can be concluded without knowing $F$ explicitly.",
      },
    ],
    correct: "C",
    explanation:
      "The added field $H(x,y) = (\\cos(x^3),\\ -\\arctan(y^2))$ has $\\operatorname{curl} H = \\partial_x[-\\arctan(y^2)] - \\partial_y[\\cos(x^3)] = 0 - 0 = 0$ (each component depends on one variable only). Since $F$ is conservative it is irrotational, so $\\operatorname{curl} G = \\operatorname{curl} F + \\operatorname{curl} H = 0$; with $\\Omega$ simply connected, $G$ is conservative and admits a potential $U$. Then $\\int_\\gamma G\\cdot dl = U(\\gamma(b)) - U(\\gamma(a))$, which is $0$ whenever $\\gamma(b) = \\gamma(a)$, i.e. on every **closed** curve — **C**.\n\n- **A** and its stronger cousin **B** of the 'never zero' flavour contradict conservativity: no closed loop can carry nonzero circulation.\n- **B** overreaches in the other direction: on an *open* curve the integral equals $U(\\text{end}) - U(\\text{start})$, generally nonzero — the word 'closed' is load-bearing.\n- **D** is too pessimistic: conservativity of $F$ plus $\\operatorname{curl} H = 0$ is exactly enough structure, no formulas needed.\n\nNote you cannot conclude that $\\cos(x^3)$ has an elementary antiderivative — and you don't need one: existence of a potential is a curl statement, not a closed-form statement.",
    theory:
      "The sum of conservative fields is conservative. On a simply connected domain, any $C^1$ field whose components satisfy $\\partial_x G_2 = \\partial_y G_1$ has zero circulation on all closed curves; on open curves the integral is the potential difference of the endpoints, not zero in general.",
  },
];
