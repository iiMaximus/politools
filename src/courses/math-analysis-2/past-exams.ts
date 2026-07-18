import type { ExamProblem, McqQuestion } from "../../types";

/* ================================================================== *
 *  REAL PAST-EXAM PAPER — APPELLO 1, A.A. 2025-26 (02KXUJM/…):
 *  7 MCQ exercises + the 9-point open problem, transcribed from the
 *  official solved paper (course_material/Algebra/_text/LAG/exams/3.txt
 *  — misfiled under LAG, it's the MA2 appello). Correct answers come
 *  from the paper's own "Solution." lines; explanations follow the
 *  official worked solutions. Tagged past-exam → the official mock's
 *  quiz section draws from here first.
 *  NOTE: Ex 2 is a Fourier-series question — topic moves to the
 *  "Fourier series" module when it lands (Phase C).
 * ================================================================== */

const SRC = "APPELLO 1 · A.A. 2025-26";

export const pastExamQuestions: McqQuestion[] = [
  {
    id: "ma2-ap1-e1",
    topic: "Taylor & optimization",
    tags: ["past-exam"],
    source: `${SRC} · Ex 1`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 1]** Let $f(x,y) = \\left(1 - \\cos(x^2 + y^3)\\right)\\sin(x - y^2)$. Then:",
    options: [
      { id: "A", content: "$(0,0)$ is a critical point for $f$ of saddle type" },
      { id: "B", content: "$(0,0)$ is a local maximum point for $f$" },
      { id: "C", content: "$(0,0)$ is a local minimum point for $f$" },
      { id: "D", content: "$(0,0)$ is not a critical point for $f$" },
    ],
    correct: "A",
    explanation:
      "Both partials vanish at the origin (every term carries a factor that dies at $(0,0)$), so it IS a critical point — D is out. The Hessian is degenerate here, so classify by sign study: $f(0,0) = 0$, and along the $x$-axis $f(t, 0) = (1-\\cos t^2)\\sin t > 0$ for small $t > 0$ while $f(-t, 0) = -f(t,0) < 0$. Values above AND below $f(0,0)$ in every ball → saddle. Not a max (B) nor a min (C).",
    theory:
      "When the Hessian test fails (degenerate), go back to the definition: compare $f$ with $f(P_0)$ along well-chosen paths near the point.",
  },
  {
    id: "ma2-ap1-e2",
    topic: "Series & power series",
    tags: ["past-exam"],
    source: `${SRC} · Ex 2`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 1]** Let $f:\\mathbb R \\to \\mathbb R$ be $2\\pi$-periodic with $\\lVert f\\rVert_2 < \\infty$ and Fourier series $S(x) = \\displaystyle\\sum_{n=1}^{\\infty} \\frac{2(-1)^n}{\\sqrt{n(n+1)}}\\,\\sin(nx)$. Then:",
    options: [
      { id: "A", content: "$\\lVert f\\rVert_2 = 2\\sqrt{\\pi}$" },
      { id: "B", content: "$\\lVert f\\rVert_2 = 4\\sqrt{\\pi}$" },
      { id: "C", content: "$\\lVert f\\rVert_2 = 2\\pi$" },
      { id: "D", content: "$\\lVert f\\rVert_2 = 4\\pi$" },
    ],
    correct: "A",
    explanation:
      "Bessel–Plancherel: $\\lVert f\\rVert_2^2 = \\pi\\sum b_n^2 = \\pi \\sum \\frac{4}{n(n+1)} = 4\\pi\\sum \\frac{1}{n(n+1)}$. The last series telescopes: $\\sum \\left(\\frac1n - \\frac1{n+1}\\right) = 1$. So $\\lVert f\\rVert_2^2 = 4\\pi$ and $\\lVert f\\rVert_2 = 2\\sqrt{\\pi}$ — D is the classic trap of forgetting the final square root.",
    theory:
      "Plancherel converts a norm question into a numeric series; telescoping sums like $\\sum 1/(n(n+1))$ are the professor's favourite fuel for it.",
  },
  {
    id: "ma2-ap1-e3",
    topic: "Series & power series",
    tags: ["past-exam"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 1]** The series $\\displaystyle\\sum_{n=1}^{\\infty} (-1)^n\\,\\frac{4\\log(n^3)}{n^3 + \\log^4(n)}$ is:",
    options: [
      { id: "A", content: "oscillating" },
      { id: "B", content: "convergent, but not absolutely convergent" },
      { id: "C", content: "divergent" },
      { id: "D", content: "absolutely convergent" },
    ],
    correct: "D",
    explanation:
      "Take moduli: $\\left|a_n\\right| = \\frac{12\\log n}{n^3 + \\log^4 n} \\le \\frac{12 n}{n^3} = \\frac{12}{n^2}$ (using $\\log n \\le n$ and dropping the positive $\\log^4 n$). Comparison with $\\sum 12/n^2$ (convergent $p$-series) gives absolute convergence — which is stronger than B, and rules out A and C.",
    theory:
      "For alternating series ALWAYS test absolute convergence first: if the moduli converge you're done, no Leibniz needed.",
  },
  {
    id: "ma2-ap1-e4",
    topic: "Differential calculus",
    tags: ["past-exam"],
    source: `${SRC} · Ex 4`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 1]** Let $f(x,y) = y\\,\\sin(x/y)$ if $y \\ne 0$ and $f(x,y) = 0$ if $y = 0$, and let $v = \\left(\\tfrac{\\sqrt2}{2}, \\tfrac{\\sqrt2}{2}\\right)$. The directional derivative $D_v f(0,0)$:",
    options: [
      { id: "A", content: "does not exist" },
      { id: "B", content: "equals $0$" },
      { id: "C", content: "equals $\\tfrac{\\sqrt2}{2}\\sin 1$" },
      { id: "D", content: "equals $\\tfrac12 \\sin 1$" },
    ],
    correct: "C",
    explanation:
      "The function is defined piecewise, so use the DEFINITION: $D_v f(0,0) = \\lim_{h\\to0} \\frac{f(hv) - f(0,0)}{h}$. Along $v$: $f\\!\\left(\\tfrac{h\\sqrt2}{2}, \\tfrac{h\\sqrt2}{2}\\right) = \\tfrac{h\\sqrt2}{2}\\sin(1)$ (the ratio $x/y = 1$!). Dividing by $h$: $D_v f = \\tfrac{\\sqrt2}{2}\\sin 1$.",
    theory:
      "Piecewise functions at the seam ⇒ gradient formulas are off the table; the limit definition of $D_v$ is the only legal move.",
  },
  {
    id: "ma2-ap1-e5",
    topic: "Double & triple integrals",
    tags: ["past-exam"],
    source: `${SRC} · Ex 5`,
    difficulty: "hard",
    prompt:
      "**[Real exam — APPELLO 1]** Let $A = \\{(x,y,z) \\in \\mathbb R^3 : 2 + \\sqrt{x^2+z^2} \\le y \\le 4\\}$ be a homogeneous solid. Its center of mass is:",
    options: [
      { id: "A", content: "$\\tfrac{1}{|A|}\\left(0, \\tfrac{32\\pi}{3}, 0\\right)$" },
      { id: "B", content: "$\\tfrac{1}{|A|}\\left(0, \\tfrac{28\\pi}{3}, 0\\right)$" },
      { id: "C", content: "$\\left(0, \\tfrac{28\\pi}{3}, 0\\right)$" },
      { id: "D", content: "$\\tfrac{1}{|A|}\\left(0, \\tfrac{16\\pi}{3}, 0\\right)$" },
    ],
    correct: "B",
    explanation:
      "$A$ is a cone-like solid, $xz$-normal: over the disk $\\sqrt{x^2+z^2}\\le 2$, $y$ runs from $2+\\sqrt{x^2+z^2}$ to $4$. Symmetry kills $x_G$ and $z_G$. For $y$: $\\int_A y = \\tfrac12\\int_{B_2}\\left(16 - (2+r)^2\\right) = \\tfrac12\\int_0^{2\\pi}\\!\\!\\int_0^2 (12 - 4r - r^2)\\,r\\,dr\\,d\\theta = \\tfrac{28\\pi}{3}$. The center of mass carries the $\\tfrac{1}{|A|}$ factor (C forgets it; A and D are integration slips).",
    theory:
      "Center of mass = (1/volume) × first moments. Spot symmetries first — they wipe out two of the three integrals for free.",
  },
  {
    id: "ma2-ap1-e6",
    topic: "Double & triple integrals",
    tags: ["past-exam"],
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 1]** Let $D = \\{(x,y) \\in \\mathbb R^2 : 1 \\le x^2+y^2 \\le 9,\\ y \\ge 0\\}$. Then $\\displaystyle\\iint_D \\frac{2y + x^2}{x^2+y^2}\\,dxdy$ equals:",
    options: [
      { id: "A", content: "$\\dfrac{5+\\pi}{3}$" },
      { id: "B", content: "$\\dfrac{3-\\pi\\sqrt2}{2}$" },
      { id: "C", content: "$\\dfrac{8}{9}\\pi$" },
      { id: "D", content: "$8 + 2\\pi$" },
    ],
    correct: "D",
    explanation:
      "Half-annulus → polar, $r \\in [1,3]$, $\\theta \\in [0,\\pi]$. The integrand splits: $\\frac{2r\\sin\\theta}{r^2}\\,r = 2\\sin\\theta$ gives $\\int_0^{\\pi} 2\\sin\\theta\\,d\\theta \\cdot \\int_1^3 dr = 4 \\cdot 2 = 8$; and $\\frac{r^2\\cos^2\\theta}{r^2}\\,r = r\\cos^2\\theta$ gives $\\int_1^3 r\\,dr \\cdot \\int_0^\\pi \\cos^2\\theta\\,d\\theta = 4 \\cdot \\tfrac{\\pi}{2} = 2\\pi$. Total $8 + 2\\pi$.",
    theory:
      "Annuli scream polar coordinates: $x^2+y^2 = r^2$ simplifies the denominator, and don't forget the Jacobian $r$.",
  },
  {
    id: "ma2-ap1-e7",
    topic: "Curves, line integrals & vector fields",
    tags: ["past-exam"],
    source: `${SRC} · Ex 7`,
    difficulty: "medium",
    prompt:
      "**[Real exam — APPELLO 1]** Let $F(x,y) = (3x^2\\sin y + y^2,\\ x^3\\cos y + 2xy + 1)$ and $G = F + (2x, y)$. Let $\\gamma_1, \\gamma_2$ be two curves from $P=(0,0)$ to $Q=(2,1)$ and $\\gamma = \\gamma_1 \\cup (-\\gamma_2)$. Then:",
    options: [
      { id: "A", content: "$\\int_\\gamma F\\cdot dl \\ne \\int_\\gamma (F+G)\\cdot dl$" },
      { id: "B", content: "$\\int_{\\gamma_1} (F+G)\\cdot dl = -\\int_{\\gamma_2} (F+G)\\cdot dl$" },
      { id: "C", content: "$\\int_{\\gamma_1} F\\cdot dl = \\int_{\\gamma_2} F\\cdot dl$" },
      { id: "D", content: "$\\int_{\\gamma_1} F\\cdot dl + \\int_{\\gamma_2} F\\cdot dl = \\int_{\\gamma} F\\cdot dl$" },
    ],
    correct: "C",
    explanation:
      "Check $F$: $\\partial_x(x^3\\cos y + 2xy + 1) - \\partial_y(3x^2\\sin y + y^2) = 3x^2\\cos y + 2y - 3x^2\\cos y - 2y = 0$ — irrotational on the simply connected $\\mathbb R^2$, hence conservative. Conservative ⇒ the integral depends only on endpoints, and $\\gamma_1, \\gamma_2$ share both: C. ($G$ adds $(2x, y)$, which is also conservative, so A's inequality has no teeth — but B has the wrong sign and D breaks the orientation of $-\\gamma_2$.)",
    theory:
      "Irrotational + simply connected domain ⇒ conservative ⇒ path independence. The exam LOVES dressing this up with decoy fields.",
  },
];

export const pastExamProblems: ExamProblem[] = [
  {
    id: "ma2-ap1-e8",
    title: "Stokes on a paraboloid collar (the real 9-point problem)",
    meta: `${SRC} · Ex 8 · 9 points · past-exam`,
    difficulty: "hard",
    topic: "Surfaces, flux & the big theorems",
    statement:
      "Let $F(x,y,z) = (3z-1,\\ 2x+3y,\\ 4yz + 2e^z)$ and $\\Sigma = \\{(x,y,z) : z = x^2+y^2-1,\\ 0 \\le z \\le 3\\}$, oriented with unit normal $n$ such that $n\\cdot k > 0$. (a) Draw and parametrize $\\Sigma$. (b) Compute $\\operatorname{curl} F$. (c) Compute the flux of $\\operatorname{curl} F$ through $\\Sigma$. (d) Parametrize $\\partial\\Sigma$ and compute the work of $F$ on $\\partial\\Sigma$ positively oriented.",
    steps: [
      {
        title: "(a) Parametrize the collar",
        content:
          "$z = x^2+y^2-1$ with $0 \\le z \\le 3$ means $1 \\le x^2+y^2 \\le 4$ — a paraboloid *collar* over the annulus $D = \\{1 \\le u^2+v^2 \\le 4\\}$. Cartesian graph parametrization: $\\sigma(u,v) = (u,\\ v,\\ u^2+v^2-1)$, $(u,v) \\in D$.",
      },
      {
        title: "(b) Curl",
        content:
          "$\\operatorname{curl} F = \\left(\\partial_y F_3 - \\partial_z F_2,\\ \\partial_z F_1 - \\partial_x F_3,\\ \\partial_x F_2 - \\partial_y F_1\\right) = (4z,\\ 3,\\ 2)$.",
      },
      {
        title: "(c) Flux — let symmetry do the killing",
        content:
          "$N = \\sigma_u \\times \\sigma_v = (-2u, -2v, 1)$ (upward: $N\\cdot k = 1 > 0$ ✓). Then $\\operatorname{curl}F(\\sigma)\\cdot N = -8u(u^2+v^2-1) - 6v + 2$. Over the symmetric annulus every term odd in $u$ or $v$ integrates to zero — only the constant survives: $\\iint_D 2\\,dudv = 2\\,\\text{area}(D) = 2(4\\pi - \\pi) = 6\\pi$.",
      },
      {
        title: "(d) Boundary + Stokes",
        content:
          "$\\partial\\Sigma$ = two circles: $\\gamma_1(t) = (\\cos t, -\\sin t, 0)$ (inner, $r=1$, at $z=0$, clockwise seen from above) and $\\gamma_2(t) = (2\\cos t, 2\\sin t, 3)$ (outer, $r=2$, at $z=3$, counterclockwise) — that's positive orientation for the upward normal. Stokes: $\\oint_{\\partial\\Sigma} F\\cdot dl = \\iint_\\Sigma \\operatorname{curl}F\\cdot n = 6\\pi$ — no line integrals computed by hand.",
      },
    ],
    finalAnswer: "$\\operatorname{curl} F = (4z, 3, 2)$; flux $= 6\\pi$; work on $\\partial\\Sigma = 6\\pi$ by Stokes.",
    tips:
      "This is the full 9-point structure: parametrize → curl → flux → boundary work via Stokes. Two recurring traps: check the normal really points the requested way ($N\\cdot k > 0$), and orient BOTH boundary circles consistently — the inner one runs backwards.",
  },
];
