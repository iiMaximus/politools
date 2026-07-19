import type { Question } from "../../../types";

/* ================================================================== *
 *  OFFICIAL TUTORIAL SHEET — "Numerical series & power series"
 *  (A.A. 2025-26). Transcribed from course_material/Math Analysis II/
 *  Material(1)/Exercise sheets/Ex_series.pdf; every answer checked
 *  against "Exercise sheets - Solutions/sol_series.pdf" AND recomputed
 *  (the deciding test is named in each explanation).
 *  Not ingested: Ex 7.1 (only asks for a convergence set — R = 1 alone
 *  is trivial) and Ex 10 (f^(28)(0) = 28!·(4/3)^14/14 is unusable as a
 *  numeric input) — both verified, cut for format, not correctness.
 * ================================================================== */

const SRC = "Ex_series";
const TOPIC = "Series & power series";

export const tutorialQuestions: Question[] = [
  /* ---------------------- Esercise 1 (5 parts) --------------------- */
  {
    id: "ma2-tut-se-1",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1.1`,
    difficulty: "easy",
    prompt:
      "**[Tutorial sheet]** Establish if the following is a convergent, divergent or oscillating series: $\\displaystyle\\sum_{k=1}^{+\\infty}\\left(e^{\\frac{1}{2k}} - 1\\right)$",
    options: [
      { id: "A", content: "divergent" },
      { id: "B", content: "absolutely convergent" },
      { id: "C", content: "convergent, but not absolutely convergent" },
      { id: "D", content: "oscillating" },
    ],
    correct: "A",
    explanation:
      "Positive terms ($e^{1/(2k)} \\ge e^0 = 1$), so B/C/D all hinge on how fast they shrink — and they don't shrink fast enough. Since $\\lim_{x\\to0}\\frac{e^x-1}{x} = 1$, we get $e^{\\frac{1}{2k}} - 1 \\sim \\frac{1}{2k}$. **Asymptotic comparison** with $\\frac12\\sum 1/k$ (harmonic, divergent) makes the series divergent. D is impossible outright: a positive-term series has increasing partial sums, so it either converges or diverges to $+\\infty$ — it can never oscillate.",
    theory:
      "For positive-term series, swap the general term for its asymptotic equivalent ($e^x - 1 \\sim x$, $\\sin x \\sim x$, $\\log(1+x) \\sim x$ as $x \\to 0$) and compare with the $p$-series $\\sum 1/k^p$: convergent iff $p > 1$.",
  },
  {
    id: "ma2-tut-se-2",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1.2`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Establish if the following is a convergent, divergent or oscillating series: $\\displaystyle\\sum_{k=1}^{+\\infty} \\frac{e^{\\frac1k}-1}{k+\\log k+\\arctan(k^7)}$",
    options: [
      { id: "A", content: "divergent" },
      { id: "B", content: "oscillating" },
      { id: "C", content: "absolutely convergent" },
      { id: "D", content: "convergent, but not absolutely convergent" },
    ],
    correct: "C",
    explanation:
      "Numerator: $e^{1/k} - 1 \\sim \\frac1k$. Denominator: $\\log k$ grows slower than $k$ and $\\arctan(k^7)$ is bounded by $\\pi/2$, so it behaves like $k$. The term is $\\sim \\frac{1}{k^2}$, and **asymptotic comparison** with the convergent $p$-series $\\sum 1/k^2$ ($p = 2 > 1$) gives convergence — A is out. The terms are positive, so the series equals its series of moduli: convergence here IS absolute convergence, which is why C beats D. B is impossible for positive terms (monotone partial sums).",
    theory:
      "A positive-term series that converges is automatically absolutely convergent — 'convergent but not absolutely' can only happen with sign changes.",
  },
  {
    id: "ma2-tut-se-3",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1.3`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** The series $\\displaystyle\\sum_{k=1}^{+\\infty} \\frac{4^{k+3}}{(k+1)!}$ converges. Compute its exact value (two decimals).",
    answer: 793.57,
    tolerance: 1e-3,
    explanation:
      "Convergence is the **ratio test**: $\\frac{a_{k+1}}{a_k} = \\frac{4^{k+4}}{(k+2)!}\\cdot\\frac{(k+1)!}{4^{k+3}} = \\frac{4}{k+2} \\to 0 < 1$. For the value, pull out $4^2$ and shift the index onto the exponential series $e^x = \\sum_{n\\ge0} x^n/n!$: $\\sum_{k\\ge1} \\frac{4^{k+3}}{(k+1)!} = 16\\sum_{n\\ge2}\\frac{4^n}{n!} = 16\\left(e^4 - 1 - 4\\right) = 16(e^4 - 5) \\approx 793.57$.",
    theory:
      "Factorials in the denominator scream ratio test; for the sum itself, massage the series into $\\sum x^n/n!$ and subtract the missing initial terms.",
  },
  {
    id: "ma2-tut-se-4",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1.4`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Establish if the following is a convergent, divergent or oscillating series: $\\displaystyle\\sum_{k=1}^{+\\infty} \\frac{1}{3k^{k+2}}$",
    options: [
      { id: "A", content: "convergent, but not absolutely convergent" },
      { id: "B", content: "absolutely convergent" },
      { id: "C", content: "oscillating" },
      { id: "D", content: "divergent" },
    ],
    correct: "B",
    explanation:
      "The $k$ in the exponent is the tell for the **root test**: $\\sqrt[k]{a_k} = \\frac{1}{3^{1/k}\\,k^{1+2/k}} \\to 0 < 1$ (using $3^{1/k} \\to 1$ and $k^{2/k} = e^{\\frac{2\\log k}{k}} \\to 1$, while the leftover factor $k \\to \\infty$ in the denominator). Root limit below 1 ⇒ convergent, and the terms are positive, so absolutely convergent — that rules out A (needs sign changes), C (positive terms can't oscillate) and D.",
    theory:
      "When the general term is (something)$^k$, take the $k$-th root: limit $< 1$ converges, $> 1$ diverges, $= 1$ says nothing. Handy limits: $c^{1/k} \\to 1$ and $k^{1/k} \\to 1$.",
  },
  {
    id: "ma2-tut-se-5",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 1.5`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Establish if the following is a convergent, divergent or oscillating series: $\\displaystyle\\sum_{k=1}^{+\\infty}(-1)^{k+1}\\,\\frac{k^2}{k^2+7}$",
    options: [
      { id: "A", content: "absolutely convergent" },
      { id: "B", content: "divergent" },
      { id: "C", content: "convergent, but not absolutely convergent" },
      { id: "D", content: "oscillating" },
    ],
    correct: "D",
    explanation:
      "$\\frac{k^2}{k^2+7} \\to 1 \\ne 0$: the **necessary condition** fails, so the series cannot converge — A and C are dead, and Leibniz is NOT applicable (it needs terms $\\to 0$). Divergent vs oscillating needs the partial sums: write $(-1)^{k+1}\\frac{k^2}{k^2+7} = (-1)^{k+1} + 7\\frac{(-1)^k}{k^2+7}$. The second piece is an absolutely convergent series (moduli $\\sim 7/k^2$), so its partial sums tend to some finite $l$; the first piece has partial sums bouncing between two values. Even- and odd-indexed partial sums therefore converge to two DIFFERENT finite limits (they differ by 1), so $S_N$ has no limit but stays bounded: the series is oscillating, not divergent to $\\pm\\infty$ — that kills B.",
    theory:
      "Terms not tending to 0 only tells you 'not convergent'. To split divergent from oscillating, study the even and odd partial-sum subsequences: two different finite limits ⇒ oscillating.",
  },

  /* --------------------------- Esercise 2 -------------------------- */
  {
    id: "ma2-tut-se-6",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Show that the series $\\displaystyle\\sum_{k=2}^{+\\infty} \\frac{e^{-2k}}{2^{2-k}}$ converges and compute its value (four decimals).",
    answer: 0.0251,
    tolerance: 5e-4,
    explanation:
      "Rewrite until a **geometric series** appears: $\\frac{e^{-2k}}{2^{2-k}} = \\frac14\\left(\\frac{2}{e^2}\\right)^k$, ratio $q = 2/e^2 \\approx 0.27 < 1$, hence convergent. Mind the starting index $k=2$: $\\frac14\\sum_{k\\ge2} q^k = \\frac14\\cdot\\frac{q^2}{1-q} = \\frac14\\cdot\\frac{4/e^4}{(e^2-2)/e^2} = \\frac{1}{e^2(e^2-2)} \\approx 0.0251$.",
    theory:
      "$\\sum_{k\\ge k_0} q^k = \\frac{q^{k_0}}{1-q}$ for $|q|<1$ — either use this directly or subtract the missing terms from $\\frac{1}{1-q}$. Forgetting the starting index is the classic point-loser here.",
  },

  /* --------------------------- Esercise 3 -------------------------- */
  {
    id: "ma2-tut-se-7",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Establish if the series $\\displaystyle\\sum_{k=0}^{+\\infty} \\cos(k\\pi)\\,\\frac{1}{\\sqrt{k+3}}$ converges and, if so, whether it is also absolutely convergent. The series is:",
    options: [
      { id: "A", content: "convergent, but not absolutely convergent" },
      { id: "B", content: "absolutely convergent" },
      { id: "C", content: "divergent" },
      { id: "D", content: "oscillating" },
    ],
    correct: "A",
    explanation:
      "First unmask the sign: $\\cos(k\\pi) = (-1)^k$, so this is an alternating series. **Leibniz** applies: $\\frac{1}{\\sqrt{k+3}}$ is positive, decreasing, and $\\to 0$ ⇒ convergent (kills C and D). For absolute convergence look at the moduli: $\\sum \\frac{1}{\\sqrt{k+3}} = \\sum_{n\\ge3}\\frac{1}{\\sqrt n}$, a $p$-series with $p = \\frac12 \\le 1$ ⇒ divergent. Convergent but NOT absolutely — B overclaims.",
    theory:
      "Alternating series routine: (1) check absolute convergence via the moduli; (2) if that fails, check Leibniz (positive, decreasing, $\\to 0$). Passing only step 2 is exactly 'convergent, not absolutely'.",
  },

  /* --------------------------- Esercise 4 -------------------------- */
  {
    id: "ma2-tut-se-8",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 4`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the value of the series $\\displaystyle\\sum_{k=1}^{+\\infty} \\left[\\cos\\left(\\frac{\\pi}{k}\\right) - \\cos\\left(\\frac{\\pi}{k+1}\\right)\\right]$",
    answer: -2,
    tolerance: 0.01,
    explanation:
      "This is a **telescoping series**: in the partial sum every $\\cos(\\pi/j)$ appears once with $+$ and once with $-$, so everything cancels except the ends: $S_N = \\cos(\\pi) - \\cos\\left(\\frac{\\pi}{N+1}\\right)$. Letting $N \\to \\infty$: $\\frac{\\pi}{N+1} \\to 0$, so $S_N \\to \\cos(\\pi) - \\cos(0) = -1 - 1 = -2$.",
    theory:
      "When the term is $f(k) - f(k+1)$, the partial sum collapses to $f(1) - f(N+1)$: the series converges iff $\\lim_N f(N+1)$ exists, with value $f(1) - \\lim f$.",
  },

  /* --------------------------- Esercise 5 -------------------------- */
  {
    id: "ma2-tut-se-9",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** The series $\\displaystyle\\sum_{k=1}^{+\\infty} \\frac{3k-2}{\\sqrt{k^{\\alpha}(2k-1)}}$ converges exactly for $\\alpha > c$. Find the threshold $c$.",
    answer: 3,
    tolerance: 0.01,
    explanation:
      "Positive terms, so extract the power behaviour as $k \\to \\infty$: $\\frac{3k-2}{\\sqrt{k^{\\alpha}(2k-1)}} \\sim \\frac{3k}{\\sqrt{2k^{\\alpha+1}}} = \\frac{3}{\\sqrt2}\\,k^{-\\frac{\\alpha-1}{2}}$. **Asymptotic comparison** reduces everything to the $p$-series with $p = \\frac{\\alpha-1}{2}$ (the official solution reaches the same inequality via the integral criterion): convergence iff $\\frac{\\alpha-1}{2} > 1 \\iff \\alpha > 3$. So $c = 3$ — and note $\\alpha = 3$ itself gives the harmonic series, divergent.",
    theory:
      "For parameter problems, reduce the term to $C\\,k^{-p(\\alpha)}$ and solve $p(\\alpha) > 1$. Always sanity-check the boundary value: $p = 1$ is divergent.",
  },

  /* --------------------------- Esercise 6 -------------------------- */
  {
    id: "ma2-tut-se-10",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Study the behaviour of the series $\\displaystyle\\sum_{k=0}^{+\\infty}(4^k + 7^k)\\,b^k$ for $b = -\\tfrac15$. The series is:",
    options: [
      { id: "A", content: "absolutely convergent" },
      { id: "B", content: "convergent, but not absolutely convergent" },
      { id: "C", content: "divergent to $+\\infty$" },
      { id: "D", content: "oscillating" },
    ],
    correct: "D",
    explanation:
      "Split into two **geometric series** with ratios $4b$ and $7b$. At $b = -\\frac15$: $|4b| = \\frac45 < 1$ (fine) but $|7b| = \\frac75 > 1$, so the term $(4^k+7^k)\\left(-\\frac15\\right)^k = (-1)^k\\left[\\left(\\frac45\\right)^k + \\left(\\frac75\\right)^k\\right]$ has magnitude blowing up — no convergence of any kind (A, B out). The sign alternates while the size explodes, so even- and odd-indexed partial sums run off in opposite directions: the series oscillates rather than diverging to $+\\infty$ (C describes the case $b \\ge \\frac17$, where all terms are positive). Full picture from the sheet: convergent with sum $\\frac{1}{1-4b} + \\frac{1}{1-7b}$ for $|b| < \\frac17$, divergent to $+\\infty$ for $b \\ge \\frac17$, oscillating for $b \\le -\\frac17$.",
    theory:
      "$\\sum q^k$: converges iff $|q| < 1$, diverges to $+\\infty$ if $q \\ge 1$, oscillates if $q \\le -1$. A sum of geometrics is ruled by the WORST ratio — here $7b$.",
  },

  /* -------------------------- Esercise 7.2 ------------------------- */
  {
    id: "ma2-tut-se-11",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 7.2`,
    difficulty: "medium",
    prompt:
      "**[Tutorial sheet]** Compute the radius of convergence (in $x$) of the power series $\\displaystyle\\sum_{k=1}^{+\\infty}(k+1)(3x-2)^k$ (three decimals).",
    answer: 0.3333,
    tolerance: 5e-3,
    explanation:
      "Substitute $y = 3x - 2$ and study $\\sum(k+1)y^k$: the **ratio criterion** gives $\\frac{k+2}{k+1} \\to 1$, so $R_y = 1$. At $y = \\pm1$ the term $(k+1)(\\pm1)^k$ does not tend to 0, so both endpoints fail. Convergence iff $|3x-2| < 1 \\iff x \\in \\left(\\frac13, 1\\right)$: an interval centred at $x_0 = \\frac23$ of half-length $R = \\frac13 \\approx 0.333$ (exact: $1/3$). The substitution SHRINKS the radius by the factor 3 in front of $x$ — answering $1$ is the classic trap. On $\\left(\\frac13,1\\right)$ the convergence is also absolute.",
    theory:
      "For $\\sum a_k(\\lambda x - \\mu)^k$, find $R_y$ for $\\sum a_k y^k$, then $R_x = R_y/|\\lambda|$ around the centre $x_0 = \\mu/\\lambda$. Endpoints always need a separate numerical-series check.",
  },

  /* --------------------------- Esercise 8 -------------------------- */
  {
    id: "ma2-tut-se-12",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 8`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $f(x) = \\displaystyle\\sum_{k=1}^{+\\infty} \\frac{x^{2k+4}}{3k(k+5)}$. Then:",
    options: [
      { id: "A", content: "$f'(0) \\ne 0$" },
      { id: "B", content: "$f^{(10)}(0) = \\dfrac{10!}{72}$" },
      { id: "C", content: "$f(2) = \\displaystyle\\sum_{k=1}^{+\\infty} \\frac{2^{2k+4}}{3k(k+5)}$" },
      { id: "D", content: "$f(-2) = \\displaystyle\\sum_{k=1}^{+\\infty} \\frac{(-2)^{2k+4}}{3k(k+5)}$" },
    ],
    correct: "B",
    explanation:
      "Domain first: $f(x) = x^4\\sum_k \\frac{(x^2)^k}{3k(k+5)}$, and by the **ratio criterion** the series in $y = x^2$ has $R = 1$, so $f$ only exists for $|x| \\le 1$: the writings in C and D evaluate a series that does not converge at $x = \\pm2$ — plugging a point outside the convergence set into the formula is exactly the trap. A: the lowest power present is $x^{2\\cdot1+4} = x^6$, so every derivative up to order 5 vanishes at 0; $f'(0) = 0$. B: the coefficient of $x^{10}$ comes from $2k+4 = 10 \\Rightarrow k = 3$, i.e. $a_{10} = \\frac{1}{3\\cdot3\\cdot8} = \\frac{1}{72}$, and $f^{(10)}(0) = 10!\\,a_{10} = \\frac{10!}{72}$.",
    theory:
      "Inside the convergence interval, $f^{(n)}(x_0) = n!\\,a_n$: read derivatives straight off the coefficients. Outside the interval the series formula means nothing.",
  },

  /* --------------------------- Esercise 9 -------------------------- */
  {
    id: "ma2-tut-se-13",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 9`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $f(x) = \\displaystyle\\sum_{n=0}^{+\\infty} a_n(1-x)^n$, where $\\{a_n\\}_n \\subseteq \\mathbb R$ is such that $\\lim_{n\\to+\\infty} \\sqrt[n]{|a_n|} = 1$. Then:",
    options: [
      { id: "A", content: "$f^{(n)}(1) = a_n n!$, for all $n \\ge 1$" },
      { id: "B", content: "$f$ is differentiable at $x = -1$" },
      { id: "C", content: "$f^{(n)}(1) = (-1)^n a_n n!$, for all $n \\ge 1$" },
      { id: "D", content: "$f$ has domain $(-1, 1)$" },
    ],
    correct: "C",
    explanation:
      "Rewrite $(1-x)^n = (-1)^n(x-1)^n$: this is a power series centred at $x_0 = 1$ with coefficients $b_n = (-1)^n a_n$. The **root criterion** gives $R = 1$ (since $\\sqrt[n]{|b_n|} = \\sqrt[n]{|a_n|} \\to 1$), so the domain sits inside $[0, 2]$ — centred at 1, not at 0, which kills D, and $x = -1$ is at distance 2 from the centre, far outside: B fails. Differentiating term by term at the centre: $f^{(n)}(1) = b_n\\,n! = (-1)^n a_n n!$ — C. Option A is C without the sign: it forgets that expanding in powers of $(1-x)$ instead of $(x-1)$ flips the sign of every odd coefficient.",
    theory:
      "Always rewrite $\\sum a_n(c - x)^n$ as $\\sum (-1)^n a_n (x - c)^n$ before using any power-series fact: the centre is $c$ and the coefficient picks up $(-1)^n$.",
  },

  /* -------------------------- Esercise 11 -------------------------- */
  {
    id: "ma2-tut-se-14",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 11`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $\\displaystyle\\sum_{k=0}^{+\\infty} a_k x^k$ be a power series with radius of convergence $R = 3$. Then:",
    options: [
      { id: "A", content: "$\\displaystyle\\sum_{k=0}^{+\\infty} a_k x^{3k+2}$ is divergent at $x = 3$" },
      { id: "B", content: "the radius of convergence of $\\displaystyle\\sum_{k=0}^{+\\infty} a_k x^{4k+3}$ is $R = \\sqrt[4]{3}$" },
      { id: "C", content: "the radius of convergence of $\\displaystyle\\sum_{k=0}^{+\\infty} a_k x^{4k+3}$ is $R = 3$" },
      { id: "D", content: "$\\displaystyle\\sum_{k=0}^{+\\infty} a_k x^k$ is divergent at $x = -5$" },
    ],
    correct: "B",
    explanation:
      "Write $\\sum a_k x^{4k+3} = x^3 \\sum a_k (x^4)^k$: it converges when $|x|^4 < 3$, i.e. $|x| < \\sqrt[4]{3}$, and cannot converge when $|x|^4 > 3$ — so the radius is $\\sqrt[4]{3}$, not 3 (C false): substituting $x^4$ takes the fourth ROOT of the radius. A and D fail for a subtler reason: outside the radius a power series does NOT converge, but 'divergent' (partial sums $\\to \\pm\\infty$) is not guaranteed — without knowing the $a_k$ the series at such points could just as well be oscillating. 'Not convergent' and 'divergent' are different claims, and the exam options exploit exactly that gap.",
    theory:
      "If $\\sum a_k y^k$ has radius $R$, then $\\sum a_k x^{mk+q} = x^q\\sum a_k(x^m)^k$ has radius $R^{1/m}$. Outside any radius you may only claim NON-convergence, never divergence to $\\pm\\infty$.",
  },

  /* -------------------------- Esercise 12 -------------------------- */
  {
    id: "ma2-tut-se-15",
    type: "numeric",
    topic: TOPIC,
    tags: ["tutorial"],
    source: `${SRC} · Ex 12`,
    difficulty: "hard",
    prompt:
      "**[Tutorial sheet]** Let $g(x) = \\dfrac{x}{x^2 - x - 2}$. Using the Maclaurin series of $g$, compute $g^{(5)}(0)$ (two decimals).",
    answer: -41.25,
    tolerance: 1e-3,
    explanation:
      "Factor and split: $x^2 - x - 2 = (x-2)(x+1)$, and **partial fractions** give $g(x) = \\frac{2}{3}\\cdot\\frac{1}{x-2} + \\frac{1}{3}\\cdot\\frac{1}{x+1}$. Each piece is geometric: $\\frac{2}{3(x-2)} = -\\frac13\\cdot\\frac{1}{1-x/2} = -\\frac13\\sum \\frac{x^k}{2^k}$ (needs $|x|<2$) and $\\frac{1}{3(x+1)} = \\frac13\\sum(-1)^k x^k$ (needs $|x|<1$). So $g(x) = \\sum_k \\frac13\\left((-1)^k - \\frac{1}{2^k}\\right)x^k$ on the intersection $(-1,1)$. Then $g^{(5)}(0) = 5!\\,a_5 = 5!\\cdot\\frac13\\left(-1 - \\frac{1}{32}\\right) = -\\frac{11}{32}\\cdot5! = -41.25$ (exact: $-\\frac{11}{32}\\cdot120 = -\\frac{1320}{32}$). Computing five derivatives by hand instead is a bloodbath — the series does it in two lines.",
    theory:
      "Rational function ⇒ partial fractions ⇒ geometric series. The convergence set is the INTERSECTION of the pieces' sets, and $g^{(n)}(0) = n!\\,a_n$ turns high derivatives into coefficient lookups.",
  },
];
