import type { ExamProblem, Question } from "../../types";

/* ================================================================== *
 *  MA2 EXAM ARCHIVE — representative questions from the professor's
 *  2014–2023 Mechanical Engineering collection.
 *
 *  Every selected answer was checked twice: against the collection's
 *  official answer tables and by an independent calculation. Questions
 *  that require a missing diagram, use the retired ODE syllabus, or have
 *  ambiguous transcription/answer data are deliberately not included.
 *
 *  A few option orders are changed from the papers so the archive bank is
 *  exactly balanced across A/B/C/D. The mathematical wording is preserved.
 * ================================================================== */

const TAGS = ["past-exam", "archive"];
const source = (session: string, exercise: number) =>
  `ExamsCollection 14-23 · ${session} · Ex ${exercise}`;

export const archiveExamQuestions: Question[] = [
  /* ------------------------- Limits & continuity ------------------------ */
  {
    id: "ma2-arch-2018-jun18-e3",
    topic: "Limits & continuity",
    tags: TAGS,
    source: source("June 18th 2018", 3),
    difficulty: "medium",
    prompt:
      "Let $f(x,y)=1-\\sqrt{4-x^2-y^2}$. Which of the following statements is FALSE?",
    options: [
      { id: "A", content: "The domain of $f$ is closed and bounded." },
      { id: "B", content: "The graph of $f$ is a half-sphere." },
      { id: "C", content: "$f$ has no maximum point." },
      { id: "D", content: "$\\nabla f(1,1)=(1/\\sqrt2,1/\\sqrt2)$." },
    ],
    correct: "C",
    explanation:
      "The domain is the closed disk $x^2+y^2\\le4$, so A is true. Squaring $z=1-\\sqrt{4-x^2-y^2}$ gives $x^2+y^2+(z-1)^2=4$ with $z\\le1$, so B is true. On the boundary $f=1$, hence a maximum DOES exist and C is the false statement. In the interior, $\\nabla f=(x,y)/\\sqrt{4-x^2-y^2}$, which at $(1,1)$ is $(1/\\sqrt2,1/\\sqrt2)$, so D is true.",
    theory:
      "Start a multivariable question by finding the natural domain. A continuous function on a compact domain attains its maximum and minimum; here the values can also be read directly from the radial formula.",
  },
  {
    id: "ma2-arch-2023-jun12-e3",
    topic: "Limits & continuity",
    tags: TAGS,
    source: source("June 12th 2023", 3),
    difficulty: "easy",
    prompt: "Given a function $f:\\mathbb R^2\\to\\mathbb R$, which statement is necessarily true?",
    options: [
      {
        id: "A",
        content:
          "If $f$ is differentiable at $(x_0,y_0)$, then $f$ is of class $C^2$ in a neighbourhood of $(x_0,y_0)$.",
      },
      {
        id: "B",
        content: "If $f$ is continuous at $(x_0,y_0)$, then $f$ is differentiable there.",
      },
      {
        id: "C",
        content:
          "If the first partial derivatives of $f$ exist at $(x_0,y_0)$, then $f$ is continuous there.",
      },
      {
        id: "D",
        content: "If $f$ is differentiable at $(x_0,y_0)$, then $f$ is continuous there.",
      },
    ],
    correct: "D",
    explanation:
      "Differentiability gives $f(P_0+h)=f(P_0)+L(h)+o(\\lVert h\\rVert)$, whose last two terms tend to zero, so differentiability implies continuity: D. It does not imply $C^2$ regularity in a whole neighbourhood (A). Continuity alone need not give derivatives (B), and even the existence of both partial derivatives at one point need not give continuity there (C).",
    theory:
      "The implication chain is: continuous partial derivatives near a point ⇒ differentiable there ⇒ continuous there. Neither reverse implication is automatic.",
  },

  /* -------------------------- Differential calculus --------------------- */
  {
    id: "ma2-arch-2019-jun17-e2",
    topic: "Differential calculus",
    tags: TAGS,
    source: source("June 17th 2019", 2),
    difficulty: "medium",
    prompt:
      "For $f(x,y)=\\sin x\\,\\cos^2y$, find the directional derivative with respect to the unit vector associated with $u=(2,1)$.",
    options: [
      {
        id: "A",
        content:
          "$(2/\\sqrt5)\\cos y\\,(\\cos x\\cos y-\\sin x\\sin y)$",
      },
      {
        id: "B",
        content:
          "$(2/\\sqrt5)\\sin x\\sin y\\cos y-(2/\\sqrt5)\\cos x\\cos^2y$",
      },
      { id: "C", content: "$2\\cos y\\,(\\cos x\\cos y-\\sin x\\sin y)$" },
      { id: "D", content: "$4\\cos x\\cos^2y-\\sin x\\sin y\\cos y$" },
    ],
    correct: "A",
    explanation:
      "Normalize first: $v=(2,1)/\\sqrt5$. Since $\\nabla f=(\\cos x\\cos^2y,-2\\sin x\\cos y\\sin y)$, the dot product is $(2/\\sqrt5)\\cos y(\\cos x\\cos y-\\sin x\\sin y)$, so A. B has the sign pattern reversed, C uses the non-unit vector and is too large by $\\sqrt5$, and D uses neither the correct normalization nor the correct coefficient of $f_y$.",
    theory:
      "A directional derivative in the direction of a vector $u$ uses the unit vector $u/\\lVert u\\rVert$: $D_uf=\\nabla f\\cdot u/\\lVert u\\rVert$.",
  },
  {
    id: "ma2-arch-2022-sep05-e1",
    topic: "Differential calculus",
    tags: TAGS,
    source: source("September 5th 2022", 1),
    difficulty: "easy",
    prompt:
      "Let $f:\\mathbb R^2\\to\\mathbb R$ be of class $C^1$, with $\\nabla f(0,0)=(-2,5)$. In a neighbourhood of $t=0$, the function $g(t)=f(2t,t)$ is:",
    options: [
      { id: "A", content: "constant" },
      { id: "B", content: "decreasing" },
      { id: "C", content: "increasing" },
      { id: "D", content: "positive" },
    ],
    correct: "C",
    explanation:
      "By the chain rule, $g'(0)=\\nabla f(0,0)\\cdot(2,1)=(-2)2+5=1>0$. Continuity of $g'$ (because $f$ is $C^1$) keeps $g'$ positive on some interval around zero, so g is increasing: C. The derivative is not zero (A) or negative (B), and the sign of the value $g(0)=f(0,0)$ is unknown, so D cannot be inferred.",
    theory:
      "For a path $\\gamma(t)$, $(f\\circ\\gamma)'(t)=\\nabla f(\\gamma(t))\\cdot\\gamma'(t)$. A positive derivative at a point, together with continuity, gives local increase.",
  },
  {
    id: "ma2-arch-2023-feb16-e1",
    topic: "Differential calculus",
    tags: TAGS,
    source: source("February 16th 2023", 1),
    difficulty: "easy",
    prompt:
      "Let $f:\\mathbb R^2\\to\\mathbb R$ be of class $C^1$. Which is the tangent plane to its graph at $(2,3,f(2,3))$?",
    options: [
      {
        id: "A",
        content:
          "$z=f(2,3)-f_x(2,3)(x-2)-f_y(2,3)(y-3)$",
      },
      {
        id: "B",
        content:
          "$z=f(2,3)+f_x(2,3)(x-2)+f_y(2,3)(y-3)$",
      },
      {
        id: "C",
        content: "$z=f_x(2,3)(x-2)+f_y(2,3)(y-3)$",
      },
      {
        id: "D",
        content: "$z=-f_x(2,3)(x-2)-f_x(2,3)(y-3)$",
      },
    ],
    correct: "B",
    explanation:
      "The first-order expansion at $(2,3)$ is $f(x,y)\\approx f(2,3)+f_x(2,3)(x-2)+f_y(2,3)(y-3)$, hence B. A reverses both slopes, C omits the height $f(2,3)$ and therefore generally misses the point of tangency, while D has wrong signs and incorrectly uses $f_x$ for the y-slope.",
    theory:
      "At $(a,b)$ the tangent plane is $z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)$: value plus linear increment.",
  },

  /* -------------------------- Taylor & optimization --------------------- */
  {
    id: "ma2-arch-2018-feb06-e1",
    topic: "Taylor & optimization",
    tags: TAGS,
    source: source("February 6th 2018", 1),
    difficulty: "hard",
    prompt: "The function $f(x,y)=\\tfrac14x^4-3xy+\\tfrac12y^2$:",
    options: [
      { id: "A", content: "has a saddle point and two local maximum points" },
      { id: "B", content: "has a local minimum point and a local maximum point" },
      { id: "C", content: "has a local minimum point and two saddle points" },
      { id: "D", content: "has two local minimum points and a saddle point" },
    ],
    correct: "D",
    explanation:
      "The critical equations are $x^3-3y=0$ and $-3x+y=0$, hence $y=3x$ and $x(x^2-9)=0$: $(0,0),(3,9),(-3,-9)$. The Hessian is $[[3x^2,-3],[-3,1]]$ with determinant $3x^2-9$. At the origin it is negative, so the point is a saddle. At $x=\\pm3$ the determinant is 18 and $f_{xx}=27>0$, so both are strict local minima. Thus D; A and B invent maxima, while C miscounts the minima and saddles.",
    theory:
      "Solve the full gradient system before classifying. In two variables: det Hessian < 0 gives a saddle; det > 0 with $f_{xx}>0$ gives a local minimum.",
  },
  {
    id: "ma2-arch-2018-feb19-e7",
    topic: "Taylor & optimization",
    tags: TAGS,
    source: source("February 19th 2018", 7),
    difficulty: "medium",
    prompt:
      "Find the Taylor polynomial of degree 2 centred at $(0,0)$ for $f(x,y)=\\log(1+2x+5y)$.",
    options: [
      { id: "A", content: "$2x+5y-2x^2-\\tfrac{25}{2}y^2$" },
      { id: "B", content: "$1-2x^2-10xy-\\tfrac{25}{2}y^2$" },
      { id: "C", content: "$2x+5y-2x^2-10xy-\\tfrac{25}{2}y^2$" },
      { id: "D", content: "$2x+5y-4x^2-20xy-25y^2$" },
    ],
    correct: "C",
    explanation:
      "Put $u=2x+5y$ in $\\log(1+u)=u-u^2/2+o(u^2)$. Expanding gives $2x+5y-\\tfrac12(4x^2+20xy+25y^2)$, which is C. A drops the mixed term, B wrongly adds a constant 1 and omits the linear part, and D forgets the factor $1/2$ in the quadratic term.",
    theory:
      "For a composition $\\phi(L(x,y))$ with linear $L$, substitute $L$ into the one-variable Taylor series and keep only terms up to the requested total degree.",
  },
  {
    id: "ma2-arch-2022-sep05-e2",
    topic: "Taylor & optimization",
    tags: TAGS,
    source: source("September 5th 2022", 2),
    difficulty: "medium",
    prompt:
      "For $f(x,y)=x^2-2x+3y^2+(x-1+y)^3+5$, the point $(1,0)$:",
    options: [
      { id: "A", content: "is a local maximum point" },
      { id: "B", content: "is a local minimum point" },
      { id: "C", content: "is a saddle point" },
      { id: "D", content: "is not a critical point" },
    ],
    correct: "B",
    explanation:
      "Write $u=x-1$. Then $f=4+u^2+3y^2+(u+y)^3$. The gradient at $(u,y)=(0,0)$ vanishes, so D is false. The Hessian there is $\\operatorname{diag}(2,6)$, positive definite; equivalently, the positive quadratic term dominates the cubic near the origin. Therefore $(1,0)$ is a strict local minimum: B, not a maximum (A) or saddle (C).",
    theory:
      "At a critical point, a positive-definite Hessian gives a strict local minimum. Higher-order terms cannot overturn a non-degenerate positive quadratic form sufficiently close to the point.",
  },

  /* ----------------------- Double & triple integrals -------------------- */
  {
    id: "ma2-arch-2015-sep14-e2",
    topic: "Double & triple integrals",
    tags: TAGS,
    source: source("September 14th 2015", 2),
    difficulty: "easy",
    prompt:
      "Let $f:\\mathbb R^2\\to\\mathbb R$ be continuous. Rewrite $\\int_1^2\\int_0^3 f(2x,3y)\\,dy\\,dx$ after the change of variables $u=2x$, $v=3y$.",
    options: [
      { id: "A", content: "$\\int_2^4\\int_0^9 f(u,v)\\,dv\\,du$" },
      { id: "B", content: "$6\\int_2^4\\int_0^9 f(u,v)\\,dv\\,du$" },
      { id: "C", content: "$\\tfrac16\\int_1^2\\int_0^3 f(u,v)\\,dv\\,du$" },
      { id: "D", content: "$\\tfrac16\\int_2^4\\int_0^9 f(u,v)\\,dv\\,du$" },
    ],
    correct: "D",
    explanation:
      "The new bounds are $u\\in[2,4]$ and $v\\in[0,9]$. Also $dx=du/2$ and $dy=dv/3$, so $dx\\,dy=(1/6)du\\,dv$: D. A forgets the Jacobian, B uses its reciprocal, and C keeps the old bounds after changing variables.",
    theory:
      "A change of variables changes both the region and the area element. For the diagonal map $(u,v)=(2x,3y)$, $dx\\,dy=|\\det\\partial(x,y)/\\partial(u,v)|du\\,dv=du\\,dv/6$.",
  },
  {
    id: "ma2-arch-2018-feb06-e2",
    topic: "Double & triple integrals",
    tags: TAGS,
    source: source("February 6th 2018", 2),
    difficulty: "hard",
    prompt:
      "Let $\\Omega=\\{(x,y,z):x^2+y^2+z^2\\le2,\\ x\\ge0,\\ y\\ge0,\\ z\\ge0\\}$. Compute $\\iiint_\\Omega x^5yz\\,dxdydz$.",
    options: [
      { id: "A", content: "$1/12$" },
      { id: "B", content: "$1/15$" },
      { id: "C", content: "$-1/15$" },
      { id: "D", content: "$-1/12$" },
    ],
    correct: "B",
    explanation:
      "Use first-octant spherical coordinates with radius $R=\\sqrt2$. The integral separates as $\\int_0^Rr^9dr\\int_0^{\\pi/2}\\sin^7\\varphi\\cos\\varphi\\,d\\varphi\\int_0^{\\pi/2}\\cos^5\\theta\\sin\\theta\\,d\\theta=(R^{10}/10)(1/8)(1/6)=1/15$. The integrand is nonnegative on the octant, so C and D are impossible; A comes from an exponent/Jacobian slip.",
    theory:
      "In spherical coordinates, include the Jacobian $r^2\\sin\\varphi$ before counting powers. Octant monomials often split into three elementary beta-type integrals.",
  },
  {
    id: "ma2-arch-2019-feb18-e2",
    topic: "Double & triple integrals",
    tags: TAGS,
    source: source("February 18th 2019", 2),
    difficulty: "medium",
    prompt:
      "Let $D=\\{(x,y):0\\le x\\le1,\\ 0\\le y\\le2-x\\}$. Compute $\\iint_D|x-y|\\,dxdy$.",
    options: [
      { id: "A", content: "$5/6$" },
      { id: "B", content: "$3/2$" },
      { id: "C", content: "$1/6$" },
      { id: "D", content: "$0$" },
    ],
    correct: "A",
    explanation:
      "The sign changes on $y=x$, which lies inside the vertical slice for $0\\le x\\le1$. Thus the integral is $\\int_0^1[\\int_0^x(x-y)dy+\\int_x^{2-x}(y-x)dy]dx=\\int_0^1[x^2/2+2(1-x)^2]dx=5/6$. C keeps only the first triangle, B is an overestimate, and D is impossible because $|x-y|$ is positive except on one line.",
    theory:
      "For an absolute-value integrand, split the region along its zero set before integrating. Never cancel positive and negative pieces after the absolute value has been applied.",
  },
  {
    id: "ma2-arch-2022-sep05-e7",
    topic: "Double & triple integrals",
    tags: TAGS,
    source: source("September 5th 2022", 7),
    difficulty: "hard",
    prompt:
      "Find the volume of $D=\\{(x,y,z):x^2+y^2\\le z\\le-2x+3\\}$.",
    options: [
      { id: "A", content: "$2\\pi$" },
      { id: "B", content: "$4\\pi$" },
      { id: "C", content: "$8\\pi$" },
      { id: "D", content: "$\\pi$" },
    ],
    correct: "C",
    explanation:
      "The projection satisfies $x^2+y^2\\le-2x+3$, i.e. $(x+1)^2+y^2\\le4$. Set $u=x+1$, $v=y$. The height becomes $-2x+3-(x^2+y^2)=4-u^2-v^2$. Over the radius-2 disk, the volume is $2\\pi\\int_0^2(4-r^2)r\\,dr=8\\pi$: C. A, B and D result from losing the full angular factor or the quadratic height.",
    theory:
      "For volume between two graphs, first solve where upper ≥ lower. Completing the square often reveals a shifted disk; translate it before switching to polar coordinates.",
  },

  /* ------------------ Curves, line integrals & vector fields ------------ */
  {
    id: "ma2-arch-2018-feb06-e3",
    topic: "Curves, line integrals & vector fields",
    tags: TAGS,
    source: source("February 6th 2018", 3),
    difficulty: "medium",
    prompt:
      "Let $Q=(2,3)$ and let $F:\\mathbb R^2\\setminus\\{Q\\}\\to\\mathbb R^2$ be of class $C^1$. Assume $\\oint_\\gamma F\\cdot d\\ell=0$ for every simple closed regular curve in the domain. Then:",
    options: [
      { id: "A", content: "$F$ cannot be conservative because the domain is not simply connected." },
      { id: "B", content: "$F$ is conservative on $\\mathbb R^2\\setminus\\{Q\\}$." },
      { id: "C", content: "$F$ is not irrotational on $\\mathbb R^2\\setminus\\{Q\\}$." },
      { id: "D", content: "$F$ is conservative only on sets that do not contain the origin." },
    ],
    correct: "B",
    explanation:
      "Zero circulation around every closed curve is the path-independence criterion, so F is conservative: B. Simple connectedness is a sufficient shortcut from irrotationality, not a necessary condition for an already conservative field, so A is false. Conservative $C^1$ fields are irrotational, killing C. D names the wrong puncture (the excluded point is Q) and also contradicts the global zero-loop hypothesis.",
    theory:
      "The decisive equivalence is conservative ⇔ path independent ⇔ every closed-loop integral is zero. Domain topology matters only when trying to infer this from curl alone.",
  },
  {
    id: "ma2-arch-2020-feb03-e2",
    topic: "Curves, line integrals & vector fields",
    tags: TAGS,
    source: source("February 3rd 2020", 2),
    difficulty: "medium",
    prompt:
      "Let $\\gamma_1(t)=(t,t)$ and $\\gamma_2(t)=(t,t^5)$ for $0\\le t\\le1$, and $F(x,y)=(2e^{3y}-4ye^x,\\ 6xe^{3y}-4e^x)$. Then:",
    options: [
      { id: "A", content: "the two work integrals have opposite signs" },
      { id: "B", content: "$\\int_{\\gamma_1}F\\cdot d\\ell>\\int_{\\gamma_2}F\\cdot d\\ell$" },
      { id: "C", content: "$\\int_{\\gamma_1}F\\cdot d\\ell<\\int_{\\gamma_2}F\\cdot d\\ell$" },
      { id: "D", content: "$\\int_{\\gamma_1}F\\cdot d\\ell=\\int_{\\gamma_2}F\\cdot d\\ell$" },
    ],
    correct: "D",
    explanation:
      "Here $P_y=6e^{3y}-4e^x=Q_x$ on the simply connected plane, so F is conservative; in fact $U=2xe^{3y}-4ye^x$ is a potential. Both curves run from $(0,0)$ to $(1,1)$, hence both integrals equal $U(1,1)-U(0,0)$: D. Therefore neither strict inequality (B or C) nor opposite signs (A) is possible.",
    theory:
      "Before parametrizing a line integral, test whether the field is conservative. Equal endpoints then make the path shape irrelevant.",
  },
  {
    id: "ma2-arch-2022-sep05-e5",
    topic: "Curves, line integrals & vector fields",
    tags: TAGS,
    source: source("September 5th 2022", 5),
    difficulty: "easy",
    prompt:
      "Let $g(x,y)=\\log(x^2+y^2)-7$ and $\\gamma(t)=(3\\cos t,\\sin t)$, $0\\le t\\le\\pi/2$. Compute $\\int_\\gamma\\nabla g\\cdot d\\ell$.",
    options: [
      { id: "A", content: "$-\\log9$" },
      { id: "B", content: "$\\log3$" },
      { id: "C", content: "$\\log12$" },
      { id: "D", content: "$\\log2$" },
    ],
    correct: "A",
    explanation:
      "A gradient field integrates by endpoints: $\\gamma(0)=(3,0)$ and $\\gamma(\\pi/2)=(0,1)$. Therefore the integral is $g(0,1)-g(3,0)=(-7)-(\\log9-7)=-\\log9$: A. B has the wrong magnitude/sign, while C and D do not correspond to either endpoint difference.",
    theory:
      "The fundamental theorem for line integrals says $\\int_\\gamma\\nabla g\\cdot d\\ell=g(\\gamma(b))-g(\\gamma(a))$; the parametrization between the endpoints is irrelevant.",
  },
  {
    id: "ma2-arch-2017-jun19-e7",
    topic: "Curves, line integrals & vector fields",
    tags: TAGS,
    source: source("June 19th 2017", 7),
    difficulty: "medium",
    prompt:
      "Compute the work of $F(x,y)=(-y/(x^2+y^2),\\ x/(x^2+y^2))$ along the unit circle run counterclockwise exactly once.",
    options: [
      { id: "A", content: "$0$, because $F$ is conservative on the punctured plane" },
      { id: "B", content: "$0$, by Green's theorem on the unit disk" },
      { id: "C", content: "$2\\pi$" },
      { id: "D", content: "it cannot be computed because $F$ is undefined at the origin" },
    ],
    correct: "C",
    explanation:
      "Parametrize $\\gamma(t)=(\\cos t,\\sin t)$, $0\\le t\\le2\\pi$. Then $F(\\gamma)=(-\\sin t,\\cos t)=\\gamma'(t)$, so $F\\cdot\\gamma'=1$ and the work is $2\\pi$: C. A is false because the angular field is not conservative on the punctured plane. B applies Green across a disk where F is not defined, and D is false because the curve itself stays in the field's domain.",
    theory:
      "An irrotational field on a punctured domain can have nonzero circulation around the hole. Green's theorem needs the field to be regular on the entire enclosed region.",
  },

  /* ---------------- Surfaces, flux & the big theorems ------------------ */
  {
    id: "ma2-arch-2014-feb21-e5",
    topic: "Surfaces, flux & the big theorems",
    tags: TAGS,
    source: source("February 21st 2014", 5),
    difficulty: "medium",
    prompt:
      "Let $f(x,y)=x^3+3y^2$ on $[0,1]\\times[0,3]$ and let $\\Sigma$ be its graph. Compute $\\int_\\Sigma(5x+2y)/\\sqrt{1+9x^4+36y^2}\\,d\\sigma$.",
    options: [
      { id: "A", content: "$16$" },
      { id: "B", content: "$33/2$" },
      { id: "C", content: "$15$" },
      { id: "D", content: "$80/3$" },
    ],
    correct: "B",
    explanation:
      "For the graph, $d\\sigma=\\sqrt{1+f_x^2+f_y^2}dxdy=\\sqrt{1+9x^4+36y^2}dxdy$, so the radical cancels exactly. The remaining rectangle integral is $\\int_0^1\\int_0^3(5x+2y)dydx=15/2+9=33/2$: B. A and C come from incomplete arithmetic, while D comes from failing to use the graph-area cancellation.",
    theory:
      "For a graph $z=f(x,y)$, $d\\sigma=\\sqrt{1+f_x^2+f_y^2}dxdy$. Exam integrands are often engineered so that this factor cancels.",
  },
  {
    id: "ma2-arch-2018-jun18-e1",
    topic: "Surfaces, flux & the big theorems",
    tags: TAGS,
    source: source("June 18th 2018", 1),
    difficulty: "hard",
    prompt:
      "Let $\\Omega=\\{(x,y,z):x^2+y^2+z^2\\le4,\\ z\\ge\\sqrt{x^2+y^2}\\}$. Find the outer flux of $F=(y^2z+7,\\ 10-xz,\\ 2xy+z^2)$ through $\\partial\\Omega$.",
    options: [
      { id: "A", content: "$4\\pi$" },
      { id: "B", content: "$2\\pi$" },
      { id: "C", content: "$0$" },
      { id: "D", content: "$4\\pi\\sqrt2$" },
    ],
    correct: "A",
    explanation:
      "The divergence theorem gives flux $=\\iiint_\\Omega\\operatorname{div}F=\\iiint_\\Omega2z$. In cylindrical coordinates, $0\\le r\\le\\sqrt2$, $r\\le z\\le\\sqrt{4-r^2}$. Hence the flux is $2\\pi\\int_0^{\\sqrt2}[(4-r^2)-r^2]r\\,dr=4\\pi$: A. B loses a factor two, C ignores the positive divergence, and D incorrectly treats the cone/sphere intersection radius as a multiplicative factor.",
    theory:
      "For outer flux through a closed surface, try Gauss first: $\\iint_{\\partial\\Omega}F\\cdot n=\\iiint_\\Omega\\operatorname{div}F$. Then derive the cone/sphere bounds geometrically.",
  },
  {
    id: "ma2-arch-2021-jun16-e6",
    topic: "Surfaces, flux & the big theorems",
    tags: TAGS,
    source: source("June 16th 2021", 6),
    difficulty: "hard",
    prompt:
      "Let $\\Sigma=\\{x^2+y^2+z^2=4,\\ z\\ge1\\}$ be oriented upward. Find the flux of $\\operatorname{curl}F$ through $\\Sigma$ for $F=(-y(z+3),\\ 4xz,\\ 3xy)$.",
    options: [
      { id: "A", content: "$24\\pi$" },
      { id: "B", content: "$0$" },
      { id: "C", content: "$18\\pi$" },
      { id: "D", content: "$3\\pi$" },
    ],
    correct: "A",
    explanation:
      "By Stokes, replace the cap with the flat disk $z=1$, $x^2+y^2\\le3$, with upward normal. The curl is $(-x,-4y,5z+3)$, so on the disk its normal component is $8$. The flux is $8\\cdot3\\pi=24\\pi$: A. B would require zero normal curl; C and D use the wrong disk radius or omit the constant part of the curl.",
    theory:
      "The flux of a curl depends only on the oriented boundary. Replace a difficult spanning surface by a flat disk whenever the boundary and orientation agree.",
  },
  {
    id: "ma2-arch-2023-feb02-e1",
    topic: "Surfaces, flux & the big theorems",
    tags: TAGS,
    source: source("February 2nd 2023", 1),
    difficulty: "hard",
    prompt:
      "Let $\\Sigma$ be the upward-oriented graph $z=3+2xy^2$ over $x^2+y^2\\le4$, and $F=(z,3x,4-x^2-y^2)$. Find the flux of $\\operatorname{curl}F$ through $\\Sigma$.",
    options: [
      { id: "A", content: "$12\\pi$" },
      { id: "B", content: "$8\\pi$" },
      { id: "C", content: "$0$" },
      { id: "D", content: "$4\\pi$" },
    ],
    correct: "A",
    explanation:
      "Here $\\operatorname{curl}F=(-2y,1+2x,3)$ and the upward graph vector is $N=(-2y^2,-4xy,1)$. Their dot product is $4y^3-4xy-8x^2y+3$. Every nonconstant term is odd in x or y and integrates to zero over the centred disk, leaving $3\\cdot\\pi(2^2)=12\\pi$: A. B and D use the wrong disk area/constant, while C overlooks the surviving constant term.",
    theory:
      "For an upward graph $z=g(x,y)$ use $N=(-g_x,-g_y,1)$. On symmetric domains, identify odd terms before doing any integration.",
  },

  /* ------------------------- Series & power series ---------------------- */
  {
    id: "ma2-arch-2018-sep10-e1",
    topic: "Series & power series",
    tags: TAGS,
    source: source("September 10th 2018", 1),
    difficulty: "medium",
    prompt:
      "Find the set of convergence of $\\sum_{n=0}^{\\infty}\\frac{n^2+4n+4}{n^3+5n^2+3n+7}(x+3)^n$.",
    options: [
      { id: "A", content: "$[-4,-2]$" },
      { id: "B", content: "$(-4,-2)$" },
      { id: "C", content: "$(-4,-2]$" },
      { id: "D", content: "$[-4,-2)$" },
    ],
    correct: "D",
    explanation:
      "The coefficient is asymptotic to $1/n$, so the radius about $-3$ is 1. At $x=-2$ the series behaves like $\\sum1/n$ and diverges; at $x=-4$ it behaves like $\\sum(-1)^n/n$ and converges by Leibniz. Therefore the interval is $[-4,-2)$: D. B drops the convergent left endpoint, C keeps the divergent right one, and A keeps both.",
    theory:
      "After finding a power series radius, test each endpoint separately. Opposite endpoints often turn the same coefficients into a positive harmonic-type series and an alternating one.",
  },
  {
    id: "ma2-arch-2023-feb02-e7",
    topic: "Series & power series",
    tags: TAGS,
    source: source("February 2nd 2023", 7),
    difficulty: "hard",
    prompt:
      "Assume $\\sum_{n=0}^{\\infty}a_nx^n$ is absolutely convergent at $x=4$ and does not converge at $x=-4$. What follows?",
    options: [
      { id: "A", content: "Its radius of convergence satisfies $R<4$." },
      { id: "B", content: "Its radius of convergence satisfies $R=4$." },
      { id: "C", content: "Its radius of convergence satisfies $R>4$." },
      { id: "D", content: "No such power series exists." },
    ],
    correct: "D",
    explanation:
      "Absolute convergence at 4 means $\\sum|a_n4^n|<\\infty$. But $|a_n(-4)^n|=|a_n4^n|$, so the series must also converge absolutely at -4. The hypotheses contradict each other, hence D. A conflicts with convergence at 4, C would put both endpoints strictly inside the radius, and even R=4 (B) cannot make absolute convergence depend on the sign of the endpoint.",
    theory:
      "At symmetric points $x=\\pm r$, absolute convergence is identical because $|a_n(\\pm r)^n|=|a_n|r^n$. Only conditional boundary behaviour can differ by sign.",
  },
  {
    id: "ma2-arch-2023-sep11-e4",
    topic: "Series & power series",
    tags: TAGS,
    source: source("September 11th 2023", 4),
    difficulty: "easy",
    prompt: "Let $(a_n)$ be a sequence of real numbers. Which statement is necessarily true?",
    options: [
      { id: "A", content: "If $a_n\\to0$, then $\\sum a_n$ converges." },
      { id: "B", content: "If $a_n^\\alpha\\to0$ for some $\\alpha>1$, then $\\sum a_n$ converges." },
      { id: "C", content: "If $\\sum a_n$ converges, then $a_n\\to0$." },
      { id: "D", content: "If $\\sum a_n$ diverges, then $a_n\\to+\\infty$." },
    ],
    correct: "C",
    explanation:
      "Convergence of the partial sums forces $a_n=S_n-S_{n-1}\\to0$, so C. A is the classic converse error: $a_n=1/n$ tends to zero but the harmonic series diverges. The same example defeats B for every $\\alpha>1$, since $(1/n)^\\alpha\\to0$. D is false because divergent series may still have terms tending to zero, again as $\\sum1/n$ shows.",
    theory:
      "The term test is one-way: $\\sum a_n$ convergent ⇒ $a_n\\to0$. A nonzero term limit proves divergence, but a zero limit proves nothing by itself.",
  },

  /* ----------------------------- Fourier series ------------------------- */
  {
    id: "ma2-arch-2014-feb03-e2",
    topic: "Fourier series",
    tags: TAGS,
    source: source("February 3rd 2014", 2),
    difficulty: "hard",
    prompt:
      "A $2\\pi$-periodic integrable function has Fourier series $S(x)=\\sqrt3+\\sum_{n=1}^{\\infty}(\\sqrt2/\\sqrt3)^n\\cos(nx)$. What is $\\lVert f\\rVert_2^2$ on $[-\\pi,\\pi]$?",
    options: [
      { id: "A", content: "$5\\pi$" },
      { id: "B", content: "$9\\pi$" },
      { id: "C", content: "$5$" },
      { id: "D", content: "$8\\pi$" },
    ],
    correct: "D",
    explanation:
      "With the paper's convention $f\\sim a_0+\\sum(a_n\\cos nx+b_n\\sin nx)$, Parseval gives $\\lVert f\\rVert_2^2=2\\pi a_0^2+\\pi\\sum(a_n^2+b_n^2)$. Thus $2\\pi(3)+\\pi\\sum_{n\\ge1}(2/3)^n=6\\pi+2\\pi=8\\pi$: D. A and B mishandle the constant/geometric sum, while C loses the integration factor $\\pi$.",
    theory:
      "Under the $a_0$ (not $a_0/2$) convention, Parseval's constant contribution is $2\\pi a_0^2$; all nonconstant sine/cosine coefficients carry $\\pi$.",
  },
  {
    id: "ma2-arch-2016-feb13-e5",
    topic: "Fourier series",
    tags: TAGS,
    source: source("February 13th 2016", 5),
    difficulty: "medium",
    prompt:
      "Let $f$ be $2\\pi$-periodic and equal to $9x+7\\pi$ on $[-\\pi,\\pi)$. To what value does its Fourier series converge at $x=-\\pi$?",
    options: [
      { id: "A", content: "$16\\pi$" },
      { id: "B", content: "$-2\\pi$" },
      { id: "C", content: "$7\\pi$" },
      { id: "D", content: "It does not converge." },
    ],
    correct: "C",
    explanation:
      "At the periodic jump, the Fourier series converges to the midpoint of the one-sided limits. From the right at $-\\pi$, the limit is $9(-\\pi)+7\\pi=-2\\pi$. From the left, periodicity brings us to $\\pi^-$, giving $9\\pi+7\\pi=16\\pi$. Their average is $7\\pi$: C. A and B are the individual traces, and D ignores the Dirichlet midpoint theorem.",
    theory:
      "At a jump of a piecewise smooth periodic function, the Fourier series converges to $(f(x^-)+f(x^+))/2$, not necessarily to the assigned point value.",
  },
  {
    id: "ma2-arch-2018-feb19-e4",
    topic: "Fourier series",
    tags: TAGS,
    source: source("February 19th 2018", 4),
    difficulty: "easy",
    prompt:
      "Let $f$ be $2\\pi$-periodic with $f(x)=-x$ for $x\\in(-\\pi,0)$ and $f(x)=2\\pi-x$ for $x\\in[0,\\pi]$. If $S$ is the sum of its Fourier series, find $S(0)$.",
    options: [
      { id: "A", content: "$2\\pi$" },
      { id: "B", content: "$\\pi$" },
      { id: "C", content: "$0$" },
      { id: "D", content: "$\\pi/2$" },
    ],
    correct: "B",
    explanation:
      "The left limit at zero is 0 and the right limit is $2\\pi$. Fourier convergence at the jump gives their midpoint, $S(0)=\\pi$: B. A and C select one side only; D divides by 4 instead of averaging the two traces.",
    theory:
      "At a jump, add the left and right limits and divide by two. The actual value assigned at the jump does not control the Fourier limit.",
  },
  {
    id: "ma2-arch-2021-jun16-e10",
    topic: "Fourier series",
    tags: TAGS,
    source: source("June 16th 2021", 10),
    difficulty: "medium",
    prompt:
      "Let $f$ be $2\\pi$-periodic with $f(x)=x+\\pi$ for $-\\pi\\le x<0$ and $f(x)=-\\pi\\cos x$ for $0\\le x<\\pi$. If $S$ is its Fourier-series sum, which pair is correct?",
    options: [
      { id: "A", content: "$S(0)=0,\\quad S(\\pi)=\\pi/2$" },
      { id: "B", content: "$S(0)=0,\\quad S(\\pi)=0$" },
      { id: "C", content: "$S(0)=\\pi,\\quad S(\\pi)=\\pi/2$" },
      { id: "D", content: "$S(0)=\\pi,\\quad S(\\pi)=0$" },
    ],
    correct: "A",
    explanation:
      "At 0 the traces are $\\pi$ and $-\\pi$, so their average is 0. At $\\pi$, the left trace is $-\\pi\\cos\\pi=\\pi$, while the periodic right trace equals the value approached at $-\\pi$, namely 0; the average is $\\pi/2$. Hence A. B misses the endpoint jump, while C and D fail to average at zero.",
    theory:
      "At an interval endpoint, use periodic one-sided limits: the right trace at $\\pi$ is the trace just to the right of $-\\pi$.",
  },
  {
    id: "ma2-arch-2023-sep11-e2",
    topic: "Fourier series",
    tags: TAGS,
    source: source("September 11th 2023", 2),
    difficulty: "easy",
    prompt:
      "Let $f$ be $2\\pi$-periodic and integrable on $(-\\pi,\\pi)$, with Fourier series $\\sum_{n=1}^{\\infty}a_n\\cos(nx)$ (no constant or sine terms). What is necessarily true?",
    options: [
      { id: "A", content: "$f$ is odd." },
      { id: "B", content: "$\\int_{-\\pi}^{\\pi}f(x)\\,dx=0$." },
      { id: "C", content: "$\\int_{-\\pi}^{\\pi}f(x)^2\\,dx=0$." },
      { id: "D", content: "$\\int_{-\\pi}^{\\pi}f(x)^2\\,dx=+\\infty$." },
    ],
    correct: "B",
    explanation:
      "The missing constant coefficient means $a_0=(1/2\\pi)\\int_{-\\pi}^{\\pi}f=0$, so B. A reverses parity: cosine terms are even, not odd (up to equality almost everywhere). C would force $f=0$ almost everywhere, which the coefficients need not do, and D is not implied by the existence of a cosine expansion.",
    theory:
      "The constant Fourier coefficient records the mean. No constant term means zero average over a period; cosine terms encode the even part and sine terms the odd part.",
  },
];

export const archiveExamProblems: ExamProblem[] = [
  {
    id: "ma2-arch-problem-2014-feb03-e8",
    title: "Conservative parameters, potential and endpoint work",
    meta: "ExamsCollection 14-23 · February 3rd 2014 · Ex 8 · 9 points · past-exam · archive",
    difficulty: "hard",
    topic: "Curves, line integrals & vector fields",
    statement:
      "Let $F:\\mathbb R^3\\to\\mathbb R^3$ be $F=(e^y+\\alpha y,\\ xe^y+e^z+2x+\\beta yz,\\ ye^z+3y^2)$. (a) Find $\\alpha,\\beta$ so that F is conservative. (b) For those values, find a potential U with $U(1,0,2)=10$. (c) Compute the work along $\\gamma(t)=(t,\\sin(\\pi t/2),\\sqrt t)$, $0\\le t\\le1$.",
    steps: [
      {
        title: "Match the cross-partials",
        content:
          "Write $F=(P,Q,R)$. Conservativity requires $P_y=Q_x$: $e^y+\\alpha=e^y+2$, so $\\alpha=2$. It also requires $Q_z=R_y$: $e^z+\\beta y=e^z+6y$, so $\\beta=6$. The remaining equality $P_z=R_x=0$ is automatic.",
      },
      {
        title: "Integrate one component and recover the missing terms",
        content:
          "Integrating $P=e^y+2y$ with respect to x gives $U=xe^y+2xy+h(y,z)$. Matching $U_y$ with Q gives $h_y=e^z+6yz$, hence $h=ye^z+3y^2z+k(z)$. Matching $U_z$ with R gives $k'(z)=0$.",
      },
      {
        title: "Use the normalization",
        content:
          "Thus $U=xe^y+ye^z+2xy+3y^2z+C$. At $(1,0,2)$ all terms vanish except $xe^y=1$, so $1+C=10$ and $C=9$.",
      },
      {
        title: "Use endpoints, not the parametrization",
        content:
          "The curve starts at $(0,0,0)$ and ends at $(1,1,1)$. Since F is conservative, the work is $U(1,1,1)-U(0,0,0)=(2e+14)-9=2e+5$.",
      },
    ],
    finalAnswer:
      "$\\alpha=2$, $\\beta=6$; $U(x,y,z)=xe^y+ye^z+2xy+3y^2z+9$; work $=2e+5$.",
    tips:
      "For a parameterized conservativity problem, solve the cross-partial equations first. Once a potential exists, a complicated curve is a decoy: only its endpoints matter.",
  },
  {
    id: "ma2-arch-problem-2023-feb16-e8",
    title: "Surface integral with an exact graph-factor cancellation",
    meta: "ExamsCollection 14-23 · February 16th 2023 · Ex 8 · 9 points · past-exam · archive",
    difficulty: "hard",
    topic: "Surfaces, flux & the big theorems",
    statement:
      "Let $\\Sigma=\\{(x,y,z):z=\\sqrt{1+x^2+y^2},\\ x^2+y^2\\le2,\\ y\\ge0\\}$ and $f(x,y,z)=y^3z/\\sqrt{2(x^2+y^2)+1}$. Compute $\\int_\\Sigma f\\,d\\sigma$ by (a) describing the projection in polar coordinates, (b) reducing to a double integral, and (c) evaluating it.",
    steps: [
      {
        title: "Project the graph",
        content:
          "The projection is the upper half-disk $A=\\{x^2+y^2\\le2,\\ y\\ge0\\}$. In polar coordinates: $0\\le r\\le\\sqrt2$, $0\\le\\theta\\le\\pi$.",
      },
      {
        title: "Compute the graph element",
        content:
          "For $z=g(x,y)=\\sqrt{1+x^2+y^2}$, $g_x=x/g$ and $g_y=y/g$. Therefore $d\\sigma=\\sqrt{1+g_x^2+g_y^2}dxdy=\\sqrt{1+2r^2}/\\sqrt{1+r^2}\\,dxdy$.",
      },
      {
        title: "Expose the cancellation",
        content:
          "On the surface, $z=\\sqrt{1+r^2}$. Multiplying f by $d\\sigma$ cancels both radicals: $[y^3\\sqrt{1+r^2}/\\sqrt{1+2r^2}][\\sqrt{1+2r^2}/\\sqrt{1+r^2}]dxdy=y^3dxdy$.",
      },
      {
        title: "Integrate in polar coordinates",
        content:
          "Since $y=r\\sin\\theta$ and $dxdy=rdrd\\theta$, the integral is $\\int_0^{\\sqrt2}r^4dr\\int_0^\\pi\\sin^3\\theta d\\theta=(4\\sqrt2/5)(4/3)=16\\sqrt2/15$.",
      },
    ],
    finalAnswer: "$\\displaystyle\\int_\\Sigma f\\,d\\sigma=\\frac{16\\sqrt2}{15}$.",
    tips:
      "Do not expand a graph surface integral blindly. Substitute the surface equation into the integrand and compare its radicals with the graph-area factor first; this problem is designed to collapse to $\\iint_Ay^3dxdy$.",
  },
  {
    id: "ma2-arch-problem-2023-sep11-e8",
    title: "Exact sum and Maclaurin series of a geometric power series",
    meta: "ExamsCollection 14-23 · September 11th 2023 · Ex 8 · 9 points · past-exam · archive",
    difficulty: "medium",
    topic: "Series & power series",
    statement:
      "Consider $\\sum_{n=1}^{\\infty}(-1)^n x^{n+3}/2^{n+1}$. (a) Prove convergence in $(-2,2)$ and divergence outside it. (b) Compute its exact sum $f(x)$ for $|x|<2$. (c) Write the Maclaurin series of f.",
    steps: [
      {
        title: "Recognize the geometric ratio",
        content:
          "Factor the nth term as $(x^3/2)(-x/2)^n$. The geometric ratio is $q=-x/2$, so convergence requires $|q|<1$, i.e. $|x|<2$.",
      },
      {
        title: "Check the endpoints and the exterior",
        content:
          "At $x=2$ the terms are $4(-1)^n$, and at $x=-2$ they are constantly $-4$; neither tends to zero. For $|x|>2$ their magnitude grows, so the series diverges everywhere outside $(-2,2)$.",
      },
      {
        title: "Sum the geometric tail",
        content:
          "For $|x|<2$, $f(x)=(x^3/2)\\sum_{n=1}^{\\infty}q^n=(x^3/2)q/(1-q)=-x^4/[2(x+2)]$.",
      },
      {
        title: "Recover the Maclaurin expansion",
        content:
          "Expand $1/(x+2)=(1/2)/(1+x/2)$ for $|x|<2$. This gives $f(x)=-x^4/4+x^5/8-x^6/16+\\cdots$, exactly $\\sum_{n=1}^{\\infty}(-1)^nx^{n+3}/2^{n+1}$.",
      },
    ],
    finalAnswer:
      "Convergence exactly for $|x|<2$; $f(x)=-x^4/[2(x+2)]$; Maclaurin series $-x^4/4+x^5/8-x^6/16+\\cdots$ for $|x|<2$.",
    tips:
      "The exam asks separately for interval, closed form and Maclaurin series. State the radius with the closed form: the rational expression exists beyond the disk, but this particular power-series representation does not converge there.",
  },
];
