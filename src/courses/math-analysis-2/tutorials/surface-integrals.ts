import type { Question } from "../../../types";

/* ================================================================== *
 *  TUTORIAL SHEET — Surface integrals (official MA2 exercise sheet,
 *  A.A. 2025-26: Ex_surfaceintegrals.pdf). Answers cross-checked
 *  against Sol_surfaceintegrals.pdf AND recomputed independently.
 *  Numeric answers are decimals; the exact closed form lives in the
 *  explanation. All 10 exercises of the sheet are covered (13 cards).
 *  Note: the printed final line of Sol_ Ex 1 has a factor-2 slip; the
 *  value here follows the solution's own derivation, re-verified by a
 *  second, independent parametrization.
 * ================================================================== */

const SRC = "Ex_surfaceintegrals";

export const tutorialQuestions: Question[] = [
  /* ---------------- Esercise 1 ---------------- */
  {
    id: "ma2-tut-si-1",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Let $\\sigma(u,v) = (uv,\\ u+v,\\ u-v)$ on $D = \\{(u,v): u \\ge 0,\\ v \\ge 0,\\ u^2+v^2 \\le 1\\}$. Compute the area of $\\Sigma = \\sigma(D)$ (three decimals).",
    answer: 1.7533,
    tolerance: 0.01,
    explanation:
      "The full pipeline: parametrize (given), build the normal, take its norm, integrate. $\\partial_u\\sigma = (v,1,1)$, $\\partial_v\\sigma = (u,1,-1)$, so $N = \\partial_u\\sigma \\wedge \\partial_v\\sigma = (-2,\\ u+v,\\ v-u)$ and $\\lVert N\\rVert = \\sqrt{4 + (u+v)^2 + (v-u)^2} = \\sqrt{2}\\sqrt{2+u^2+v^2}$ — the cross terms $\\pm 2uv$ cancel. $D$ is the quarter disk, so in polar coordinates: $\\text{Area} = \\sqrt2\\,\\tfrac{\\pi}{2}\\int_0^1 \\sqrt{2+r^2}\\,r\\,dr = \\sqrt2\\,\\tfrac{\\pi}{2}\\left[\\tfrac13(2+r^2)^{3/2}\\right]_0^1 = \\tfrac{\\sqrt2\\,\\pi}{6}(3\\sqrt3 - 2\\sqrt2) = \\tfrac{\\pi}{6}(3\\sqrt6-4) \\approx 1.7533$. (Careful if you check against the official PDF: its very last line prints $\\tfrac{\\sqrt2}{3}\\pi(3\\sqrt3-2\\sqrt2)$, but its own previous step $\\sqrt2\\,\\tfrac\\pi4\\cdot\\tfrac23\\,s^{3/2}\\big|_2^3$ equals $\\tfrac{\\sqrt2\\,\\pi}{6}(3\\sqrt3-2\\sqrt2)$ — a factor-2 typo, confirmed by recomputing on the equivalent graph $x = (y^2-z^2)/4$.)",
    theory:
      "Area of a regular parametric surface: $\\text{Area}(\\Sigma) = \\iint_D \\lVert \\partial_u\\sigma \\wedge \\partial_v\\sigma\\rVert\\,du\\,dv$. Always simplify $\\lVert N \\rVert$ symbolically before integrating — squared cross products love to collapse ($(a+b)^2 + (a-b)^2 = 2a^2+2b^2$ here), and the leftover usually begs for polar coordinates.",
  },

  /* ---------------- Esercise 2 ---------------- */
  {
    id: "ma2-tut-si-2",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute the area of the graph surface $\\sigma(x,y) = (x,\\ y,\\ 7 + 2x^2 + 2y^2)$ over the unit disk $D = \\{x^2+y^2 \\le 1\\}$ (two decimals).",
    answer: 9.0442,
    tolerance: 0.01,
    explanation:
      "For a cartesian (graph) surface $z = f(x,y)$ there is no cross product to grind: $\\lVert N\\rVert = \\sqrt{1 + (\\partial_x f)^2 + (\\partial_y f)^2}$. Here $\\partial_x f = 4x$, $\\partial_y f = 4y$, so $\\lVert N \\rVert = \\sqrt{1+16(x^2+y^2)}$ — radial, so polar coordinates: $\\text{Area} = 2\\pi\\int_0^1 \\sqrt{1+16r^2}\\,r\\,dr$. Substitute $s = 1+16r^2$, $ds = 32r\\,dr$: $\\tfrac{2\\pi}{32}\\cdot\\tfrac23\\,s^{3/2}\\big|_1^{17} = \\tfrac{\\pi}{24}(17\\sqrt{17}-1) \\approx 9.0442$. Note the constant $7$ in $z$ never appears — vertical translation doesn't change area.",
    theory:
      "Graphs are the friendliest surfaces: $N = (-\\partial_x f,\\ -\\partial_y f,\\ 1)$, so $\\lVert N \\rVert = \\sqrt{1+\\lVert\\nabla f\\rVert^2} \\ge 1$ (a graph is never smaller than its shadow). Radially symmetric $\\lVert\\nabla f\\rVert$ over a disk $\\Rightarrow$ polar + the substitution $s = 1 + c\\,r^2$.",
  },

  /* ---------------- Esercise 3 ---------------- */
  {
    id: "ma2-tut-si-3",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Let $\\Sigma$ be the graph of $f(x,y) = xy$ over $D = \\{0 \\le y \\le \\sqrt3\\,x,\\ x^2+y^2 \\le 1\\}$. Compute $\\displaystyle\\int_\\Sigma z\\,d\\sigma$ (four decimals).",
    answer: 0.1207,
    tolerance: 0.01,
    explanation:
      "A scalar surface integral: pull everything back to $D$ via $\\int_\\Sigma g\\,d\\sigma = \\iint_D g(x,y,f(x,y))\\,\\lVert N\\rVert\\,dx\\,dy$. On the graph, $z = xy$, and $\\lVert N \\rVert = \\sqrt{1+y^2+x^2}$ ($\\partial_x f = y$, $\\partial_y f = x$). $D$ is the unit-disk sector between the $x$-axis and $y = \\sqrt3 x$, i.e. $\\theta \\in [0, \\tfrac\\pi3]$. Polar splits the integral: $\\int_0^{\\pi/3}\\cos\\theta\\sin\\theta\\,d\\theta = \\tfrac{\\sin^2\\theta}{2}\\big|_0^{\\pi/3} = \\tfrac38$, and $\\int_0^1 r^3\\sqrt{1+r^2}\\,dr = \\tfrac12\\int_1^2(s-1)\\sqrt s\\,ds = \\tfrac{2}{15}(\\sqrt2+1)$ with $s = 1+r^2$. Product: $\\tfrac38\\cdot\\tfrac{2}{15}(\\sqrt2+1) = \\tfrac{\\sqrt2+1}{20} \\approx 0.1207$.",
    theory:
      "Scalar integrals $\\int_\\Sigma g\\,d\\sigma$ have no orientation — only the *modulus* of the normal enters. Recipe: substitute the parametrization into $g$, multiply by $\\lVert N \\rVert$, integrate over the parameter domain. The stray power of $r$ from $xy = r^2\\cos\\theta\\sin\\theta$ plus the Jacobian is exactly what the substitution $s = 1+r^2$ wants ($r^3\\,dr = \\tfrac12(s-1)\\,ds$).",
  },

  /* ---------------- Esercise 4 ---------------- */
  {
    id: "ma2-tut-si-4",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 4`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** On the sphere patch $\\sigma(u,v) = (R\\sin v\\cos u,\\ R\\sin v\\sin u,\\ R\\cos v)$ with $u \\in [0,\\tfrac\\pi2]$, $v \\in [0,\\tfrac\\pi4]$, compute $\\displaystyle\\int_\\Sigma \\frac{xyz}{(1+z^2)(x^2+y^2)}\\,d\\sigma$ for $R = 1$ (four decimals).",
    answer: 0.0719,
    tolerance: 0.01,
    explanation:
      "For the sphere the normal is worth memorizing: $N = \\partial_u\\sigma\\wedge\\partial_v\\sigma$ has $\\lVert N\\rVert = R^2\\lvert\\sin v\\rvert = R^2\\sin v$ on $v \\in [0,\\tfrac\\pi4]$. Substituting $x^2+y^2 = R^2\\sin^2 v$ and $z = R\\cos v$, the integrand collapses: $f(\\sigma)\\lVert N\\rVert = \\dfrac{R^3\\cos u\\sin u\\,\\cos v\\sin v}{1+R^2\\cos^2 v}$, which separates. The $u$-part gives $\\int_0^{\\pi/2}\\cos u\\sin u\\,du = \\tfrac12$; for the $v$-part substitute $s = R^2\\cos^2 v$: $\\int_0^{\\pi/4}\\frac{\\cos v\\sin v}{1+R^2\\cos^2 v}dv = \\tfrac{1}{2R^2}\\log\\frac{2(1+R^2)}{2+R^2}$. Total (the sheet's general answer): $\\dfrac{R}{4}\\log\\dfrac{2(1+R^2)}{2+R^2}$. At $R=1$: $\\tfrac14\\log\\tfrac43 \\approx 0.0719$.",
    theory:
      "Spherical patches: $\\lVert N \\rVert = R^2\\sin v\\,du\\,dv$ is the area element — but check the sign of $\\sin v$ on your $v$-range before dropping the absolute value. Before integrating, rewrite the integrand in terms of the invariants the parametrization hands you ($x^2+y^2$, $z$): massive cancellations are the norm, not the exception, and $\\int \\frac{u'}{a+u}$-shaped leftovers give logarithms.",
  },

  /* ---------------- Esercise 5 ---------------- */
  {
    id: "ma2-tut-si-5",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the flux of $F(x,y,z) = (xy,\\ xy,\\ z)$ through the paraboloid cap $\\Sigma = \\{z = 1 - x^2 - y^2,\\ z \\ge 0\\}$, oriented with upward normal ($\\hat n \\cdot \\hat k > 0$) (two decimals).",
    answer: 1.5708,
    tolerance: 0.01,
    explanation:
      "Flux pipeline: parametrize $\\sigma(u,v) = (u,\\ v,\\ 1-u^2-v^2)$ over the unit disk, normal $N = (-\\partial_u f,\\ -\\partial_v f,\\ 1) = (2u,\\ 2v,\\ 1)$ (upward, as requested — no flip needed), dot, integrate: $F(\\sigma)\\cdot N = 2u^2v + 2uv^2 + 1 - u^2 - v^2$. Now *look before you integrate*: $2u^2v$ is odd in $v$ and $2uv^2$ is odd in $u$, and the disk is symmetric in both — those two terms integrate to zero for free. What survives is $\\iint_{u^2+v^2\\le1}(1-u^2-v^2)\\,du\\,dv = 2\\pi\\int_0^1 (1-r^2)r\\,dr = 2\\pi\\left(\\tfrac12-\\tfrac14\\right) = \\tfrac\\pi2 \\approx 1.5708$.",
    theory:
      "Flux through a parametric surface: $\\int_\\Sigma F\\cdot\\hat n\\,d\\sigma = \\iint_D F(\\sigma(u,v))\\cdot N(u,v)\\,du\\,dv$ — the *unnormalized* $N$ goes in, because $\\hat n\\,d\\sigma = N\\,du\\,dv$. For graphs, $N = (-f_u, -f_v, 1)$ is the upward choice. Kill odd-in-$u$ or odd-in-$v$ terms over symmetric domains before touching polar coordinates.",
  },

  /* ---------------- Esercise 6 ---------------- */
  {
    id: "ma2-tut-si-6",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the flux of $F(x,y,z) = (y,\\ -x,\\ z)$ through the helicoid $\\sigma(u,\\theta) = (u\\cos\\theta,\\ u\\sin\\theta,\\ \\theta)$, $u \\in [0,2]$, $\\theta \\in [0,4\\pi]$, with the orientation induced by $\\sigma$ (two decimals).",
    answer: 183.0464,
    tolerance: 0.01,
    explanation:
      "Same pipeline on a genuinely non-graph surface. $\\partial_u\\sigma = (\\cos\\theta, \\sin\\theta, 0)$, $\\partial_\\theta\\sigma = (-u\\sin\\theta, u\\cos\\theta, 1)$, so $N = (\\sin\\theta,\\ -\\cos\\theta,\\ u)$. On the surface $F(\\sigma) = (u\\sin\\theta,\\ -u\\cos\\theta,\\ \\theta)$, and the dot product cleans up beautifully: $F\\cdot N = u\\sin^2\\theta + u\\cos^2\\theta + u\\theta = u(1+\\theta)$. Separable: $\\int_0^2 u\\,du\\int_0^{4\\pi}(1+\\theta)\\,d\\theta = 2\\,(4\\pi + 8\\pi^2) = 8\\pi(1+2\\pi) \\approx 183.0464$. Don't shrink the range by reflex: the helicoid makes *two* full turns, $\\theta \\in [0, 4\\pi]$, and since the integrand grows with $\\theta$ the second turn contributes more than the first.",
    theory:
      "When no theorem applies (the helicoid is not closed and bounds nothing convenient), the definition is the tool: $N = \\partial_u\\sigma\\wedge\\partial_\\theta\\sigma$, dot with $F\\circ\\sigma$, integrate over the *parameter* box — whose bounds you copy from the problem, not from habit. Expect $\\sin^2+\\cos^2$ collapses when the surface has a rotational structure.",
  },

  /* ---------------- Esercise 7 ---------------- */
  {
    id: "ma2-tut-si-7",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 7`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Let $F = (3xy^2,\\ 3x^2y,\\ (x^2+y^2)z^2)$ and let $D$ be the solid cylinder $x^2+y^2 \\le 4$, $0 \\le z \\le 3$. Compute the flux $\\displaystyle\\int_{\\partial D} F\\cdot\\hat n\\,d\\sigma$ through the whole boundary, exterior normal (two decimals).",
    answer: 452.3893,
    tolerance: 0.01,
    explanation:
      "Doing this by hand means parametrizing three pieces (lateral wall, top, bottom) and orienting each outward — the divergence theorem does it in one shot: $F \\in C^1(\\mathbb R^3)$ and $D$ is a solid with piecewise regular boundary, so $\\int_{\\partial D} F\\cdot\\hat n\\,d\\sigma = \\iiint_D \\operatorname{div}F\\,dV$. Here $\\operatorname{div} F = 3y^2 + 3x^2 + 2z(x^2+y^2) = (x^2+y^2)(3+2z)$ — it factors, which is the green light for cylindrical coordinates: $\\int_0^2\\!\\int_0^{2\\pi}\\!\\int_0^3 r^2(3+2t)\\,r\\,dt\\,d\\theta\\,dr = \\left(\\int_0^2 r^3 dr\\right)(2\\pi)\\left(\\int_0^3 (3+2t)\\,dt\\right) = 4\\cdot 2\\pi\\cdot 18 = 144\\pi \\approx 452.39$. Don't forget the Jacobian $r$ (making $r^2 \\cdot r = r^3$).",
    theory:
      "Gauss/divergence theorem: for a *closed* surface bounding a solid $D$, with $F$ of class $C^1$ on $D$ and exterior normal, flux $= \\iiint_D \\operatorname{div}F\\,dV$. Reach for it whenever the boundary has several faces — one triple integral beats three oriented surface integrals, and $\\operatorname{div}F$ is often far simpler than $F$.",
  },

  /* ---------------- Esercise 8 — theorem applicability ---------------- */
  {
    id: "ma2-tut-si-8",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 8`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Let $\\Omega = \\{x^2+y^2 \\le 3z^2,\\ 0 \\le z \\le 2\\}$ (a solid cone) and $F = (x + \\cos(yz) - z^3e^y,\\ ze^x + y + x^3,\\ x^3y^2 + \\sin(xy))$. For the flux $\\int_{\\partial\\Omega} F\\cdot\\hat n\\,d\\sigma$ (exterior normal), which statement is correct?",
    options: [
      {
        id: "A",
        content:
          "The divergence theorem does not apply: $F$ is not $C^1$ on the cone because of the vertex at the origin.",
      },
      {
        id: "B",
        content:
          "By the divergence theorem the flux equals $2\\cdot\\text{Vol}(\\Omega)$: every nonlinear term of $F$ disappears when computing $\\operatorname{div}F$, which is the constant $2$.",
      },
      {
        id: "C",
        content:
          "By the divergence theorem the flux is $0$: the transcendental terms cancel and $\\operatorname{div}F = 0$.",
      },
      {
        id: "D",
        content:
          "The flux must be computed directly, parametrizing the lateral surface and the top disk separately: the theorem needs a smooth boundary, and the cone's vertex breaks it.",
      },
    ],
    correct: "B",
    explanation:
      "The field is engineered to look terrifying, but the divergence only sees $\\partial_x F_1 + \\partial_y F_2 + \\partial_z F_3$: $\\partial_x(x + \\cos(yz) - z^3e^y) = 1$, $\\partial_y(ze^x + y + x^3) = 1$, $\\partial_z(x^3y^2 + \\sin(xy)) = 0$ — every scary term lives in the *wrong variable* for its slot and dies. So $\\operatorname{div}F = 2$ and the flux is $2\\,\\text{Vol}(\\Omega)$ (B). A is wrong on both counts: $F$ is polynomial/trigonometric/exponential, hence $C^1$ on all of $\\mathbb R^3$ — smoothness of the *field* is what the theorem asks on $\\Omega$, and the vertex is no obstruction for it. D confuses the hypotheses: a *piecewise* regular boundary (cone wall + top disk) is exactly what the theorem allows. C computes the divergence wrong — the surviving derivatives give $1+1+0 = 2$, not $0$.",
    theory:
      "Applicability check for Gauss: (1) closed boundary of a bounded solid, (2) $F \\in C^1$ on the solid, (3) exterior orientation — corners and edges of the boundary are fine because they have zero area. Exam pattern: monstrous fields with constant divergence. Always compute $\\operatorname{div}F$ *before* deciding a flux is hard.",
  },

  /* ---------------- Esercise 8 — the value ---------------- */
  {
    id: "ma2-tut-si-9",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 8`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** With $\\Omega = \\{x^2+y^2 \\le 3z^2,\\ 0 \\le z \\le 2\\}$ and $F = (x + \\cos(yz) - z^3e^y,\\ ze^x + y + x^3,\\ x^3y^2 + \\sin(xy))$, compute $\\displaystyle\\int_{\\partial\\Omega} F\\cdot\\hat n\\,d\\sigma$ with exterior normal (two decimals).",
    answer: 50.2655,
    tolerance: 0.01,
    explanation:
      "$\\operatorname{div}F = 1 + 1 + 0 = 2$ (all the nonlinear terms are differentiated in a variable they don't contain), so by the divergence theorem the flux is $2\\,\\text{Vol}(\\Omega)$. The solid is a cone: at height $z$ the cross-section $x^2+y^2 \\le 3z^2$ is a disk of radius $\\sqrt3\\,z$, area $3\\pi z^2$. Slicing: $\\text{Vol} = \\int_0^2 3\\pi z^2\\,dz = 8\\pi$ (equivalently, cylindrical coordinates with $r \\le \\sqrt3\\,t$ as in the sheet). Flux $= 2\\cdot 8\\pi = 16\\pi \\approx 50.2655$. Computing this directly would mean parametrizing the cone wall $z = \\sqrt{(x^2+y^2)/3}$ *and* the top disk $z = 2$, orienting both outward — and integrating that field. Don't.",
    theory:
      "Constant divergence $c$ $\\Rightarrow$ flux through the closed boundary $= c\\cdot\\text{Vol}$. Volumes of solids of revolution fall to slicing: $\\text{Vol} = \\int \\text{Area}(z)\\,dz$. A cone of base radius $\\rho$ and height $h$ has volume $\\tfrac13\\pi\\rho^2 h$ — here $\\tfrac13\\pi(2\\sqrt3)^2\\cdot 2 = 8\\pi$, a one-line sanity check.",
  },

  /* ---------------- Esercise 9 — orientation ---------------- */
  {
    id: "ma2-tut-si-10",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 9`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** $\\Sigma = \\{x^2+y^2 \\le 1,\\ z = 3-2x-2y\\}$ is oriented so that $\\hat n\\cdot\\hat k > 0$, and parametrized by $\\sigma(u,v) = (u,\\ v,\\ 3-2u-2v)$ on the unit disk. Which normal vector $N(u,v)$ correctly realizes the requested orientation?",
    options: [
      {
        id: "A",
        content:
          "$N = (2,\\ 2,\\ 1)$ — the parametrization's own $\\partial_u\\sigma\\wedge\\partial_v\\sigma$, which already has $N\\cdot\\hat k = 1 > 0$.",
      },
      {
        id: "B",
        content:
          "$N = (-2,\\ -2,\\ -1)$ — the natural normal of $\\sigma$ points downward and must be flipped.",
      },
      {
        id: "C",
        content: "$N = (-2,\\ -2,\\ 1)$ — the graph normal is $(\\partial_u f,\\ \\partial_v f,\\ 1)$.",
      },
      {
        id: "D",
        content:
          "$N = (0,\\ 0,\\ 1)$ — only the $\\hat k$ component matters when the condition is $\\hat n\\cdot\\hat k > 0$.",
      },
    ],
    correct: "A",
    explanation:
      "Compute, don't guess: $\\partial_u\\sigma = (1,0,-2)$, $\\partial_v\\sigma = (0,1,-2)$, and $\\partial_u\\sigma\\wedge\\partial_v\\sigma = (2,\\ 2,\\ 1)$. Check the requested condition: $N\\cdot\\hat k = 1 > 0$ — the natural normal already complies, so A and no flip (B is what you'd do only if the check had failed; flipping here would compute the flux with the *wrong* sign). C misremembers the graph formula: for $z = f(u,v)$ the upward normal is $(-\\partial_u f,\\ -\\partial_v f,\\ 1) = (2,2,1)$ since $\\partial_u f = \\partial_v f = -2$ — the minus signs are load-bearing. D throws away the tangential components: $(0,0,1)$ is not normal to this tilted plane at all, and using it changes the integrand ($\\operatorname{curl}F\\cdot N$ needs the full vector).",
    theory:
      "Orientation workflow: (1) compute $N = \\partial_u\\sigma\\wedge\\partial_v\\sigma$; (2) test it against the stated condition ($N\\cdot\\hat k$, outward vs. inward, etc.); (3) flip the sign only if the test fails. For graphs $z = f$: $N = (-f_u, -f_v, 1)$ is always the upward one. The condition $\\hat n\\cdot\\hat k>0$ selects a side — it does not replace the normal.",
  },

  /* ---------------- Esercise 9 — the value ---------------- */
  {
    id: "ma2-tut-si-11",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 9`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** With $\\Sigma = \\{x^2+y^2 \\le 1,\\ z = 3-2x-2y\\}$ oriented so $\\hat n\\cdot\\hat k > 0$ and $F = (-y^3,\\ x^3,\\ -z^3)$, use Stokes' theorem to compute the circulation $\\displaystyle\\oint_{\\partial\\Sigma} F\\cdot d\\mathbf l$ (two decimals).",
    answer: 4.7124,
    tolerance: 0.01,
    explanation:
      "Directly, this is a line integral of cubics around a tilted ellipse — ugly. Stokes trades it for a flux: $\\oint_{\\partial\\Sigma}F\\cdot d\\mathbf l = \\int_\\Sigma \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma$ with the boundary oriented compatibly with $\\hat n$ (right-hand rule). $\\operatorname{curl}F = (\\partial_y F_3 - \\partial_z F_2,\\ \\partial_z F_1 - \\partial_x F_3,\\ \\partial_x F_2 - \\partial_y F_1) = (0,\\ 0,\\ 3x^2+3y^2)$ — the $-z^3$ component has zero curl contribution. With $\\sigma(u,v) = (u,v,3-2u-2v)$ and $N = (2,2,1)$ (which has $N\\cdot\\hat k > 0$, matching the orientation): $\\operatorname{curl}F\\cdot N = 3(u^2+v^2)$, so the answer is $3\\iint_{u^2+v^2\\le1}(u^2+v^2)\\,du\\,dv = 3\\int_0^{2\\pi}\\!\\!\\int_0^1 r^3\\,dr\\,d\\theta = 6\\pi\\cdot\\tfrac14 = \\tfrac{3\\pi}{2} \\approx 4.7124$. Note the plane's tilt never shows up: $\\operatorname{curl}F$ is vertical and $N\\cdot\\hat k = 1$.",
    theory:
      "Stokes converts circulation into curl flux (and back — use whichever side is easier). The curl of $(-y^n, x^n, \\ast)$-type fields is vertical, so on any surface parametrized over a disk the flux reduces to a polar integral. Checklist: $F \\in C^1$, $\\Sigma$ regular with regular boundary, orientations *compatible* — normal and boundary direction linked by the right-hand rule.",
  },

  /* ---------------- Esercise 10 — orientation ---------------- */
  {
    id: "ma2-tut-si-12",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 10`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** $\\Sigma = \\{\\tfrac{1}{16}x^2 + y^2 + z^2 = 6,\\ x \\le 4\\}$ is the ellipsoid minus a cap, oriented by the normal pointing *inside* the ellipsoid. Its boundary is the circle $x = 4$, $y^2+z^2 = 5$, and we parametrize it by $\\gamma(\\theta) = (4,\\ \\sqrt5\\cos\\theta,\\ \\sqrt5\\sin\\theta)$, $\\theta \\in [0,2\\pi]$. Which statement about Stokes' theorem is correct here?",
    options: [
      {
        id: "A",
        content:
          "$\\int_\\Sigma \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma = -\\int_\\gamma F\\cdot d\\mathbf l$: an inward normal always puts a minus sign in front of the line integral.",
      },
      {
        id: "B",
        content:
          "Stokes' theorem does not apply: $\\Sigma$ is not the graph of a function over a plane domain.",
      },
      {
        id: "C",
        content:
          "$\\int_\\Sigma \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma = 0$: the boundary lies in the plane $x = 4$, so the circulation of any field along it vanishes.",
      },
      {
        id: "D",
        content:
          "$\\int_\\Sigma \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma = \\int_\\gamma F\\cdot d\\mathbf l$: for the inward orientation of $\\Sigma$, the given $\\gamma$ runs in the compatible direction.",
      },
    ],
    correct: "D",
    explanation:
      "Orientation is the entire exercise. Flipping the surface normal *does* flip the compatible boundary direction — but the question is which direction the *given* $\\gamma$ runs. Check with the right-hand rule at $\\gamma(0) = (4,\\sqrt5,0)$: the inward normal there points towards the axis, roughly $-(1,2\\sqrt5,0)$-ward, and $\\gamma'(0) = (0,0,\\sqrt5)$; walking along $\\gamma$ with your head along $\\hat n$, the surface stays on your left — compatible. So the theorem reads with a plus sign for this $\\gamma$ (D). The sheet reaches the same conclusion by two sign flips: outward-compatible orientation would be $-\\gamma$, and inward negates it back, $-(-\\int_\\gamma) = +\\int_\\gamma$. A applies the sign flip once instead of twice — the classic error. B invents a hypothesis: Stokes needs a regular *oriented* surface with regular boundary; ellipsoid patches qualify without being graphs. C confuses a planar boundary with zero circulation — here $\\int_\\gamma F\\cdot d\\mathbf l = -60\\pi \\ne 0$.",
    theory:
      "Compatibility (right-hand rule): thumb along $\\hat n$, fingers give the boundary direction — equivalently, walking the boundary with head along $\\hat n$, the surface is on your left. Reversing $\\hat n$ reverses the compatible boundary orientation. When a problem hands you a parametrized boundary, *test* it against the chosen normal at one convenient point instead of stacking abstract sign rules.",
  },

  /* ---------------- Esercise 10 — the value ---------------- */
  {
    id: "ma2-tut-si-13",
    type: "numeric",
    topic: "Surfaces, flux & the big theorems",
    tags: ["tutorial"],
    source: `${SRC} · Ex 10`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $\\Sigma = \\{\\tfrac{1}{16}x^2 + y^2 + z^2 = 6,\\ x \\le 4\\}$ with normal pointing inside the ellipsoid, and $F = (3x^2yz,\\ 5xz,\\ 2xy)$. Compute $\\displaystyle\\int_\\Sigma \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma$ (one decimal; the value is negative).",
    answer: -188.4956,
    tolerance: 0.01,
    explanation:
      "Integrating $\\operatorname{curl}F$ over an ellipsoid patch directly would be brutal — Stokes says the answer only depends on the boundary: the circle $x = 4$, $y^2 + z^2 = 6 - 1 = 5$. With the inward normal, the compatible boundary orientation is exactly $\\gamma(\\theta) = (4,\\ \\sqrt5\\cos\\theta,\\ \\sqrt5\\sin\\theta)$ (right-hand-rule check at one point), so $\\int_\\Sigma \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma = \\int_\\gamma F\\cdot d\\mathbf l$. On $\\gamma$: $F(\\gamma) = (240\\cos\\theta\\sin\\theta,\\ 20\\sqrt5\\sin\\theta,\\ 8\\sqrt5\\cos\\theta)$ and $\\gamma' = (0,\\ -\\sqrt5\\sin\\theta,\\ \\sqrt5\\cos\\theta)$ — the huge first component is multiplied by $0$ and never matters. Dot: $-100\\sin^2\\theta + 40\\cos^2\\theta$, and over a full period $\\sin^2$ and $\\cos^2$ each integrate to $\\pi$: total $-100\\pi + 40\\pi = -60\\pi \\approx -188.4956$.",
    theory:
      "Curl flux only sees the boundary: any two surfaces with the same (compatibly oriented) boundary give the same $\\int \\operatorname{curl}F\\cdot\\hat n\\,d\\sigma$. So replace ugly surfaces by their boundary circle (or by a flat disk spanning it). Over $[0,2\\pi]$: $\\int\\sin^2 = \\int\\cos^2 = \\pi$, $\\int\\sin\\cos = 0$ — the three identities that finish most of these integrals.",
  },
];
