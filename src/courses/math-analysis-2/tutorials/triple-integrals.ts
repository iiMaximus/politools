import type { Question } from "../../../types";

/* ================================================================== *
 *  OFFICIAL TUTORIAL SHEET — "Ex_tripleintegrals" (A.A. 2025-26)
 *  8 exercises transcribed from the professor's exercise sheet
 *  (course_material/Math Analysis II/Material(1)/Exercise sheets/
 *  Ex_tripleintegrals.pdf). Every answer comes from the official
 *  solutions (Sol_tripleintegrals.pdf) AND was recomputed
 *  independently (exact + numerical quadrature) — all 8 match.
 *  Layout: one NumericQuestion per exercise (q1–q8) + 4 MCQ
 *  set-up questions on the discrete modelling choices (q9–q12).
 * ================================================================== */

const SRC = "Ex_tripleintegrals";
const TOPIC = "Double & triple integrals";
const TAGS = ["tutorial"];

export const tutorialQuestions: Question[] = [
  /* ------------------------- Ex 1 — 4/3 ------------------------- */
  {
    id: "ma2-tut-ti-1",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 1`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute the volume of the set $D = \\{(x,y,z) \\in \\mathbb{R}^3 : 0 \\le y \\le 2 - x - z,\\ x \\ge 0,\\ z \\ge 0\\}$. (Decimal, 2+ d.p.)",
    answer: 1.3333,
    placeholder: "volume",
    explanation:
      "$D$ is $y$-simple: for each $(x,z)$ with $x \\ge 0$, $z \\ge 0$, $x + z \\le 2$, the variable $y$ runs from $0$ to $2 - x - z$. So $\\mathrm{Vol}(D) = \\iint_{T} (2 - x - z)\\,dx\\,dz$ over the triangle $T$ with legs $2$. Slicing (as the official solution does, by layers $D_z$): $\\int_0^2 \\big[\\int_0^{2-z}(2 - x - z)\\,dx\\big]dz = \\int_0^2 \\frac{(2-z)^2}{2}\\,dz = \\frac{4}{3} \\approx 1.3333$. Sanity check: $D$ is the tetrahedron with vertices $(0,0,0),(2,0,0),(0,2,0),(0,0,2)$, and $\\frac{1}{6}\\,abc = \\frac{8}{6} = \\frac{4}{3}$. A common slip is integrating the plane $2 - x - z$ over the full square $[0,2]^2$ (gives $4$) instead of the triangle where the height is non-negative.",
    theory:
      "A set $\\{(x,y,z) : (x,z) \\in T,\\ g_1(x,z) \\le y \\le g_2(x,z)\\}$ is a normal (simple) domain: reduce the triple integral to $\\iint_T \\big[\\int_{g_1}^{g_2} f\\,dy\\big]dA$. With $f = 1$ the inner integral is just the segment length $g_2 - g_1$.",
  },

  /* ------------------------- Ex 2 — 9π ------------------------- */
  {
    id: "ma2-tut-ti-2",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 2`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Compute $\\int_D f\\,dx\\,dy\\,dz$ where $f(x,y,z) = z$ and $D = \\{(x,y,z) \\in \\mathbb{R}^3 : x^2 + y^2 \\le 2,\\ 0 \\le z \\le 3\\}$. (Decimal, 2+ d.p.)",
    answer: 28.2743,
    placeholder: "integral value",
    explanation:
      "$D$ is a cylinder, so use cylindrical coordinates $x = r\\cos\\theta$, $y = r\\sin\\theta$, $z = t$ with Jacobian $|\\det J\\Phi| = r$: the box is $r \\in [0, \\sqrt{2}]$, $\\theta \\in [0, 2\\pi]$, $t \\in [0,3]$. Everything separates: $\\int_D z\\,dV = \\big(\\int_0^{\\sqrt 2} r\\,dr\\big)\\big(\\int_0^{2\\pi} d\\theta\\big)\\big(\\int_0^3 t\\,dt\\big) = 1 \\cdot 2\\pi \\cdot \\frac{9}{2} = 9\\pi \\approx 28.2743$. Equivalently: (base area $2\\pi$) $\\times \\int_0^3 z\\,dz$, since the integrand is independent of $(x,y)$. Watch the radius: $x^2 + y^2 \\le 2$ means $r \\le \\sqrt{2}$, not $r \\le 2$ — using radius $2$ inflates the answer by a factor $2$ (to $18\\pi$).",
    theory:
      "On a product domain $B \\times [a,b]$ with integrand depending on one group of variables, the triple integral factors. Cylindrical coordinates carry Jacobian $r$; the radius bound comes from $r^2 = x^2 + y^2$, so always take a square root of the constant.",
  },

  /* ----------------------- Ex 3 — 62π/5 ----------------------- */
  {
    id: "ma2-tut-ti-3",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute, using the spherical coordinates, $\\int_D f\\,dx\\,dy\\,dz$ where $f(x,y,z) = x^2 + y^2 + z^2$ and $D = \\{(x,y,z) \\in \\mathbb{R}^3 : 1 \\le x^2 + y^2 + z^2 \\le 4,\\ z \\ge 0\\}$. (Decimal, 2+ d.p.)",
    answer: 38.9557,
    placeholder: "integral value",
    explanation:
      "$D$ is the upper half of a spherical shell with radii $1$ and $2$ (from $1 \\le r^2 \\le 4$, so $r \\in [1,2]$ — not $[1,4]$). In spherical coordinates $x = r\\cos\\theta\\sin\\varphi$, $y = r\\sin\\theta\\sin\\varphi$, $z = r\\cos\\varphi$: the half-space $z \\ge 0$ means $\\cos\\varphi \\ge 0$, i.e. $\\varphi \\in [0, \\tfrac{\\pi}{2}]$, and $\\theta \\in [0, 2\\pi)$. With $|\\det J\\Phi| = r^2\\sin\\varphi$ and $x^2+y^2+z^2 = r^2$: $\\int_1^2\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi/2} r^2 \\cdot r^2 \\sin\\varphi\\,d\\varphi\\,d\\theta\\,dr = 2\\pi \\big[\\tfrac{r^5}{5}\\big]_1^2 \\big[-\\cos\\varphi\\big]_0^{\\pi/2} = 2\\pi \\cdot \\tfrac{31}{5} \\cdot 1 = \\tfrac{62}{5}\\pi \\approx 38.9557$. The two classic traps: taking $r \\in [1,4]$ (forgetting the bounds are on $r^2$) and taking $\\varphi \\in [0,\\pi]$ (forgetting $z \\ge 0$ halves the shell).",
    theory:
      "Spherical coordinates shine when both the domain and the integrand are radial: $x^2+y^2+z^2 = r^2$ turns the integrand into $r^2$ and the integral fully separates as $(\\int r^4 dr)(\\int \\sin\\varphi\\, d\\varphi)(\\int d\\theta)$. $\\varphi$ is measured from the positive $z$-axis: upper half-space $\\Leftrightarrow \\varphi \\le \\pi/2$.",
  },

  /* ----------------------- Ex 4 — 5π/3 ------------------------ */
  {
    id: "ma2-tut-ti-4",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 4`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $V = \\{(x,y,z) \\in \\mathbb{R}^3 : x^2 + y^2 + z^2 \\le 4,\\ \\sqrt{3(x^2+y^2)} \\le z\\}$ and $f(x,y,z) = 5z(x^2+y^2)$. Compute $\\int_V f\\,dx\\,dy\\,dz$. (Decimal, 2+ d.p.)",
    answer: 5.236,
    placeholder: "integral value",
    explanation:
      "$V$ is an 'ice-cream cone': the ball of radius $2$ cut by the cone $z \\ge \\sqrt{3}\\sqrt{x^2+y^2}$. First find the shadow: a vertical line at $(x,y)$ meets $V$ iff $\\sqrt{3(x^2+y^2)} \\le \\sqrt{4 - x^2 - y^2}$, i.e. $3(x^2+y^2) \\le 4 - x^2 - y^2 \\Leftrightarrow x^2 + y^2 \\le 1$. So $V$ is $xy$-normal over the unit disc, with $\\sqrt{3(x^2+y^2)} \\le z \\le \\sqrt{4-x^2-y^2}$. In cylindrical coordinates ($z$ from $\\sqrt{3}\\,r$ to $\\sqrt{4-r^2}$, Jacobian $r$), the inner integral is $\\int 5t\\,dt = \\tfrac{5}{2}\\big[(4-r^2) - 3r^2\\big] = 10(1 - r^2)$, so $\\int_V f\\,dV = \\int_0^1\\!\\int_0^{2\\pi} 10\\,r^3(1-r^2)\\,d\\theta\\,dr = 20\\pi\\big[\\tfrac{r^4}{4} - \\tfrac{r^6}{6}\\big]_0^1 = \\tfrac{5}{3}\\pi \\approx 5.2360$. Taking the shadow to be the full disc of radius $2$ (ignoring the cone/sphere intersection) is the standard error here.",
    theory:
      "For a cone-and-sphere region, intersect the two $z$-constraints to find where a vertical line actually meets the solid — that inequality in $x^2+y^2$ IS the projection. Then integrate in $z$ first (normal-domain setup); cylindrical coordinates handle the remaining radial double integral.",
  },

  /* ------------------------ Ex 5 — 3/2 ------------------------ */
  {
    id: "ma2-tut-ti-5",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 5`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Find the coordinate $z_G$ of the barycenter of the set $A = \\{(x,y,z) \\in \\mathbb{R}^3 : x^2 + y^2 + z^2 \\le 16,\\ z \\ge 0\\}$ with density $d = c > 0$. (Decimal)",
    answer: 1.5,
    placeholder: "z_G",
    explanation:
      "$A$ is the upper half-ball of radius $4$. By definition $z_G = \\frac{1}{m(A)}\\int_A z\\,c\\,dV$ — the constant $c$ appears in both mass and moment, so it cancels. Mass: $m(A) = c \\cdot \\tfrac{1}{2} \\cdot \\tfrac{4}{3}\\pi 4^3 = \\tfrac{128}{3}\\pi c$. Moment (spherical coordinates, $z = r\\cos\\varphi$, Jacobian $r^2\\sin\\varphi$): $\\int_A z\\,dV = \\int_0^4\\! r^3 dr \\int_0^{\\pi/2}\\! \\cos\\varphi\\sin\\varphi\\, d\\varphi \\int_0^{2\\pi}\\! d\\theta = \\tfrac{4^4}{4} \\cdot \\tfrac{1}{2} \\cdot 2\\pi = 64\\pi$. Hence $z_G = \\frac{64\\pi c}{128\\pi c/3} = \\tfrac{3}{2} = 1.5$. This matches the classic formula: the centroid of a half-ball sits at $\\tfrac{3R}{8}$ from the flat face ($\\tfrac{3\\cdot 4}{8} = \\tfrac{3}{2}$). Forgetting the $\\tfrac12$ in $\\int\\cos\\varphi\\sin\\varphi\\,d\\varphi$ (substitute $t=\\sin\\varphi$) or using the full-ball volume are the usual slips.",
    theory:
      "Barycenter: $z_G = \\frac{\\int z\\,d\\,dV}{\\int d\\,dV}$. Constant density always cancels — you are computing the centroid. For a half-ball of radius $R$: $z_G = \\tfrac{3R}{8}$; memorize it as a check, derive it with spherical coordinates in exams.",
  },

  /* ----------------------- Ex 6 — 8π/9 ------------------------ */
  {
    id: "ma2-tut-ti-6",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 6`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Compute $\\int_D \\frac{y}{3}(x^2+z^2)\\,dx\\,dy\\,dz$ where $D = \\{(x,y,z) \\in \\mathbb{R}^3 : x^2 + y^2 + z^2 \\ge 6,\\ 0 \\le y \\le 4 - x^2 - z^2\\}$. (Decimal, 2+ d.p.)",
    answer: 2.7925,
    placeholder: "integral value",
    explanation:
      "Both constraints involve only $x^2 + z^2$ and $y$ — the symmetry axis is the $y$-axis, so use cylindrical coordinates AROUND $y$: $x = r\\cos\\theta$, $y = t$, $z = r\\sin\\theta$, Jacobian $r$, $r^2 = x^2+z^2$. The conditions become $r^2 + t^2 \\ge 6$ and $0 \\le t \\le 4 - r^2$, i.e. $t \\in [\\sqrt{6-r^2},\\ 4-r^2]$ (outside the sphere but under the paraboloid). This interval is nonempty iff $\\sqrt{6-r^2} \\le 4-r^2$: with $u = r^2$, $u^2 - 7u + 10 \\ge 0 \\Leftrightarrow u \\le 2$ (the branch $u \\ge 5$ is killed by $t \\ge 0$), so $r \\in [0,\\sqrt 2]$. Then $\\int_D \\tfrac{y}{3}(x^2+z^2)dV = \\tfrac{2\\pi}{3}\\int_0^{\\sqrt 2} r^3 \\cdot \\tfrac{(4-r^2)^2 - (6-r^2)}{2}\\,dr = \\tfrac{\\pi}{3}\\int_0^{\\sqrt 2} r^3(10 - 7r^2 + r^4)\\,dr = \\tfrac{\\pi}{3}\\big(10 + 2 - \\tfrac{28}{3}\\big) = \\tfrac{8}{9}\\pi \\approx 2.7925$. Missing the nonemptiness condition (integrating $r$ up to $2$) is the killer mistake.",
    theory:
      "Pick the cylindrical axis along the symmetry axis of the DOMAIN, whatever letter it is. After the change of variables, always ask for which $r$ the $t$-interval is nonempty — that inequality gives the true radial bounds, usually smaller than each surface alone suggests.",
  },

  /* ----------------------- Ex 7 — π²/2 ------------------------ */
  {
    id: "ma2-tut-ti-7",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 7`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the volume of the set $D$ obtained by the rotation of the graph of $y = \\sin x$, $0 \\le x \\le \\pi$, around the $x$-axis. (Decimal, 2+ d.p.)",
    answer: 4.9348,
    placeholder: "volume",
    explanation:
      "Slice perpendicular to the rotation axis: at each fixed $\\bar{x} \\in [0,\\pi]$ the cross-section is the disc $D_x = \\{(y,z) : y^2 + z^2 \\le \\sin^2 x\\}$ of radius $\\sin x$, area $\\pi\\sin^2 x$. Integrating the slice areas: $\\mathrm{Vol}(D) = \\int_0^{\\pi} \\pi\\sin^2 x\\,dx = \\tfrac{\\pi}{2}\\int_0^{\\pi}(1 - \\cos 2x)\\,dx = \\tfrac{\\pi}{2}\\big[x - \\tfrac{\\sin 2x}{2}\\big]_0^{\\pi} = \\tfrac{\\pi^2}{2} \\approx 4.9348$. The half-angle identity $\\sin^2 x = \\tfrac12(1-\\cos 2x)$ does the work; guessing $\\int_0^\\pi \\sin^2 = 1$ or forgetting the $\\pi$ from the disc area gives the wrong order of magnitude.",
    theory:
      "Solid of revolution about the $x$-axis $\\Rightarrow$ disc method: $V = \\pi\\int_a^b f(x)^2\\,dx$. This is nothing but the layer-by-layer (Cavalieri) reduction of a triple integral with $f \\equiv 1$: cross-sections are discs of radius $|f(x)|$.",
  },

  /* ---------------------- Ex 8 — 1024π/15 ---------------------- */
  {
    id: "ma2-tut-ti-8",
    type: "numeric",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 8`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Compute the moment of inertia with respect to the $z$-axis of $D = \\{(x,y,z) \\in \\mathbb{R}^3 : x^2 + y^2 + z^2 \\le 16,\\ x \\ge 0,\\ y \\ge 0,\\ z \\ge 0\\}$ with density $d = c > 0$. Give the numerical value of $I_z/c$. (Decimal, 1+ d.p.)",
    answer: 214.4661,
    placeholder: "I_z / c",
    explanation:
      "$I_z = \\int_D c\\,(x^2+y^2)\\,dV$ — the squared distance to the $z$-axis, not to the origin. $D$ is one octant of the ball of radius $4$, so in spherical coordinates $r \\in [0,4]$, $\\varphi \\in [0,\\tfrac{\\pi}{2}]$, $\\theta \\in [0,\\tfrac{\\pi}{2}]$ (both $x,y \\ge 0$ cut $\\theta$ to a quarter-turn, $z \\ge 0$ cuts $\\varphi$ in half). Since $x^2 + y^2 = r^2\\sin^2\\varphi$ and the Jacobian is $r^2\\sin\\varphi$: $I_z = c\\int_0^4 r^4 dr \\int_0^{\\pi/2}\\sin^3\\varphi\\,d\\varphi \\int_0^{\\pi/2} d\\theta = c \\cdot \\tfrac{4^5}{5} \\cdot \\tfrac{2}{3} \\cdot \\tfrac{\\pi}{2} = \\tfrac{1024}{15}\\pi c \\approx 214.4661\\,c$. ($\\int_0^{\\pi/2}\\sin^3 = \\int_0^1 (1-t^2)dt = \\tfrac23$ via $t = \\cos\\varphi$.) Cross-check: the full ball has $I_z = \\tfrac{2}{5}MR^2 = \\tfrac{8}{15}\\pi c R^5$; one octant is $\\tfrac18$ of it $= \\tfrac{1024}{15}\\pi c$. ✓",
    theory:
      "$I_{\\text{axis}} = \\int d \\cdot (\\text{dist to axis})^2\\,dV$; for the $z$-axis the distance squared is $x^2+y^2 = r^2\\sin^2\\varphi$ in spherical coordinates. Powers of $\\sin\\varphi$ integrate via $t = \\cos\\varphi$; symmetry lets you compute a fraction of a ball as that fraction of the full-ball moment.",
  },

  /* ============ MCQ set-up questions (discrete choices) ============ */

  /* -------------- Ex 3 setup — spherical box (A) --------------- */
  {
    id: "ma2-tut-ti-9",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** In spherical coordinates $x = r\\cos\\theta\\sin\\varphi$, $y = r\\sin\\theta\\sin\\varphi$, $z = r\\cos\\varphi$, the set $D = \\{1 \\le x^2 + y^2 + z^2 \\le 4,\\ z \\ge 0\\}$ becomes:",
    options: [
      { id: "A", content: "$r \\in [1,2],\\ \\varphi \\in [0, \\tfrac{\\pi}{2}],\\ \\theta \\in [0, 2\\pi)$" },
      { id: "B", content: "$r \\in [1,4],\\ \\varphi \\in [0, \\tfrac{\\pi}{2}],\\ \\theta \\in [0, 2\\pi)$" },
      { id: "C", content: "$r \\in [1,2],\\ \\varphi \\in [0, \\pi],\\ \\theta \\in [0, 2\\pi)$" },
      { id: "D", content: "$r \\in [1,2],\\ \\varphi \\in [0, \\tfrac{\\pi}{2}],\\ \\theta \\in [0, \\pi]$" },
    ],
    correct: "A",
    explanation:
      "Since $x^2+y^2+z^2 = r^2$, the shell condition $1 \\le r^2 \\le 4$ gives $r \\in [1,2]$ — B falls into the trap of reading the bounds of $r^2$ as bounds of $r$. The half-space $z \\ge 0$ reads $r\\cos\\varphi \\ge 0 \\Leftrightarrow \\varphi \\in [0,\\tfrac{\\pi}{2}]$ — C keeps the whole sphere and would double the answer. $\\theta$ is untouched by both conditions, so it makes the full turn $[0,2\\pi)$ — D's half-turn would halve the answer (that restriction corresponds to $y \\ge 0$, not $z \\ge 0$). A is correct.",
    theory:
      "Translate each Cartesian condition separately: radial bounds always come from square roots of the $r^2$ bounds; sign conditions on $z$ restrict $\\varphi$ (colatitude); sign conditions on $x$ or $y$ restrict $\\theta$ (longitude).",
  },

  /* --------------- Ex 4 setup — projection (B) ----------------- */
  {
    id: "ma2-tut-ti-10",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 4`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Let $V = \\{(x,y,z) : x^2 + y^2 + z^2 \\le 4,\\ \\sqrt{3(x^2+y^2)} \\le z\\}$ (ball cut by a cone). To write $V$ as an $xy$-normal domain, its projection onto the $xy$-plane is:",
    options: [
      { id: "A", content: "the disc $x^2 + y^2 \\le 4$" },
      { id: "B", content: "the disc $x^2 + y^2 \\le 1$" },
      { id: "C", content: "the disc $x^2 + y^2 \\le 3$" },
      { id: "D", content: "the annulus $1 \\le x^2 + y^2 \\le 4$" },
    ],
    correct: "B",
    explanation:
      "A vertical line over $(x,y)$ meets $V$ iff the cone floor sits below the sphere ceiling: $\\sqrt{3(x^2+y^2)} \\le \\sqrt{4 - x^2 - y^2}$. Squaring: $3(x^2+y^2) \\le 4 - (x^2+y^2) \\Leftrightarrow x^2+y^2 \\le 1$ — answer B (geometrically, the cone pierces the sphere on the circle $r = 1$, $z = \\sqrt 3$). A is the shadow of the whole ball, ignoring the cone; C mistakes the coefficient $3$ in the cone for the radius; D would describe a region outside the cone, but the solid (cone interior) projects onto a full disc, not an annulus.",
    theory:
      "Projection of a solid bounded below by $z = g_1$ and above by $z = g_2$: solve $g_1 \\le g_2$ in the base variables. Never read the shadow off one surface alone — it is the region where BOTH constraints are simultaneously satisfiable.",
  },

  /* ------------- Ex 8 setup — I_z integrand (C) ---------------- */
  {
    id: "ma2-tut-ti-11",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 8`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** The moment of inertia with respect to the $z$-axis of a solid $D$ with density $d(x,y,z)$ is the integral $\\int_D d(x,y,z)\\,g(x,y,z)\\,dx\\,dy\\,dz$ where $g$ equals:",
    options: [
      { id: "A", content: "$x^2 + y^2 + z^2$" },
      { id: "B", content: "$z^2$" },
      { id: "C", content: "$x^2 + y^2$" },
      { id: "D", content: "$\\sqrt{x^2 + y^2}$" },
    ],
    correct: "C",
    explanation:
      "The moment of inertia about an axis weights each mass element by its SQUARED distance to that axis. The distance from $(x,y,z)$ to the $z$-axis is $\\sqrt{x^2+y^2}$, so $g = x^2 + y^2$ — answer C. A is the squared distance to the origin (the polar moment about a point); B is the squared distance to the $xy$-plane (that factor appears in $I_x + I_y$, not $I_z$); D forgets to square the distance and has the wrong physical dimensions.",
    theory:
      "$I_{\\text{axis}} = \\int_D d \\cdot \\rho_{\\text{axis}}^2\\,dV$ where $\\rho_{\\text{axis}}$ is the distance to the axis: $I_z$ uses $x^2+y^2$, $I_x$ uses $y^2+z^2$, $I_y$ uses $x^2+z^2$. In cylindrical/spherical coordinates about $z$: $x^2+y^2 = r^2$ resp. $r^2\\sin^2\\varphi$.",
  },

  /* ---------- Ex 6 setup — coordinate choice (D) --------------- */
  {
    id: "ma2-tut-ti-12",
    topic: TOPIC,
    tags: TAGS,
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** For $D = \\{(x,y,z) : x^2 + y^2 + z^2 \\ge 6,\\ 0 \\le y \\le 4 - x^2 - z^2\\}$, which change of variables is best adapted to computing $\\int_D \\frac{y}{3}(x^2+z^2)\\,dV$?",
    options: [
      { id: "A", content: "Spherical coordinates centred at the origin" },
      { id: "B", content: "Cylindrical coordinates around the $z$-axis: $x = r\\cos\\theta,\\ y = r\\sin\\theta,\\ z = t$" },
      { id: "C", content: "No change of variables — integrate in Cartesian coordinates, $x$ first" },
      { id: "D", content: "Cylindrical coordinates around the $y$-axis: $x = r\\cos\\theta,\\ y = t,\\ z = r\\sin\\theta$" },
    ],
    correct: "D",
    explanation:
      "Look at what the constraints and the integrand depend on: the paraboloid condition $0 \\le y \\le 4 - (x^2+z^2)$ and the factor $x^2+z^2$ involve only the combination $x^2 + z^2$ and the coordinate $y$ — the whole problem is rotationally symmetric about the $y$-AXIS. Cylindrical coordinates around $y$ (D) turn the domain into $\\{r \\le \\sqrt 2,\\ \\sqrt{6-r^2} \\le t \\le 4-r^2\\}$ with integrand $\\tfrac{t}{3}r^2$ and Jacobian $r$: fully explicit bounds. B (around $z$) leaves $x^2+z^2 = r^2\\cos^2\\theta + t^2$ — a mess; A makes the paraboloid $r\\,t$-coupled and non-separable; C forces nested square-root bounds in all three variables. The sphere condition $r^2 + t^2 \\ge 6$ is handled inside the $t$-bounds.",
    theory:
      "Choose coordinates adapted to the symmetry of the DOMAIN + INTEGRAND, not by habit: paraboloids/cones/cylinders with axis along a coordinate direction call for cylindrical coordinates around THAT axis. The letters are irrelevant — only the role each variable plays matters.",
  },
];
