import type { Question } from "../../../types";

/* ================================================================== *
 *  OFFICIAL TUTORIAL SHEET — "Exercise Sheet: Fourier's series"
 *  (A.A. 2025-26). Transcribed from
 *  course_material/Math Analysis II/Material(1)/Exercise sheets/
 *  Ex_Fourierseries.pdf; answers taken from Sol_Fourier.pdf AND
 *  independently recomputed. Multi-part exercises are split into one
 *  card per part so each can be drilled with commitment.
 *  Topic = "Fourier series" → cards group with that module's lectures.
 * ================================================================== */

const SRC = "Ex_Fourierseries";
const P = "**[Tutorial sheet]** ";

export const tutorialQuestions: Question[] = [
  /* ---------------- Esercise 1 — series structure of |cos x| ------- */
  {
    id: "ma2-tut-fo-1",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 1`,
    difficulty: "medium",
    prompt:
      P +
      "The Fourier series of the function $f(x) = |\\cos x|$ is equal to:",
    options: [
      { id: "A", content: "$\\displaystyle\\sum_{n=1}^{\\infty} b_n \\sin(nx)$, $b_n \\in \\mathbb R$" },
      { id: "B", content: "$\\displaystyle\\sum_{n=1}^{\\infty} a_n \\cos(2nx)$, $a_n \\in \\mathbb R$" },
      { id: "C", content: "$a_0 + \\displaystyle\\sum_{n=1}^{\\infty} a_n \\cos(2nx)$, $a_n \\in \\mathbb R$" },
      { id: "D", content: "$\\displaystyle\\sum_{n=1}^{\\infty} b_n \\sin(2nx)$, $b_n \\in \\mathbb R$" },
    ],
    correct: "C",
    explanation:
      "Two structural observations decide everything before any integral. **Parity:** $f(-x) = |\\cos(-x)| = |\\cos x|$, so $f$ is even → every sine coefficient vanishes, killing A and D. **Period:** $|\\cos(x+\\pi)| = |-\\cos x| = |\\cos x|$, so $f$ is $\\pi$-periodic, not just $2\\pi$-periodic — the fundamental harmonic is $\\cos(2x)$ and only frequencies $2n$ appear. That leaves B vs C, which differ only in the constant term. But $a_0$ is the *mean value* of $f$: $a_0 = \\tfrac1\\pi\\int_{-\\pi/2}^{\\pi/2} |\\cos x|\\,dx = \\tfrac2\\pi\\int_0^{\\pi/2}\\cos x\\,dx = \\tfrac2\\pi \\neq 0$ — obvious anyway, since $|\\cos x| \\ge 0$ and is not identically zero, so its average cannot be $0$. B misses it; **C** is correct.",
    theory:
      "Before computing any coefficient, extract structure: even function → cosines only; odd function → sines only; true period $T$ smaller than the nominal one → only harmonics of $2\\pi/T$ survive. The constant term $a_0$ is the mean of $f$ over one period — a positive function always has $a_0 > 0$.",
  },

  /* ---------------- Esercise 2 — order-1 trig polynomial ----------- */
  {
    id: "ma2-tut-fo-2",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 2`,
    difficulty: "medium",
    prompt:
      P +
      "The trigonometric polynomial of order $1$ of the $2\\pi$-periodic function $f$ such that $f(x) = |x| + 2$, $x \\in [-\\pi, \\pi]$, is equal to:",
    options: [
      { id: "A", content: "$S_1(x) = \\dfrac{\\pi}{2} - \\dfrac{4}{\\pi}\\cos x$" },
      { id: "B", content: "$S_1(x) = 2 + \\dfrac{\\pi}{2} - \\dfrac{4}{\\pi}\\cos x$" },
      { id: "C", content: "$S_1(x) = 2 + \\dfrac{\\pi}{2} - \\dfrac{4}{\\pi}\\sin x$" },
      { id: "D", content: "$S_1(x) = 2\\pi + \\dfrac{\\pi^2}{2} - 4\\cos x$" },
    ],
    correct: "B",
    explanation:
      "$f$ is even ($|x|+2$ is even), so $S_1(x) = a_0 + a_1\\cos x$ with no sine — C is out on parity alone. The constant is the mean: $a_0 = \\tfrac{1}{2\\pi}\\int_{-\\pi}^{\\pi}(|x|+2)\\,dx = \\tfrac1\\pi\\int_0^\\pi (x+2)\\,dx = \\tfrac1\\pi\\left(\\tfrac{\\pi^2}{2} + 2\\pi\\right) = \\tfrac{\\pi}{2} + 2$. For $a_1 = \\tfrac2\\pi\\int_0^\\pi (x+2)\\cos x\\,dx$: integrate by parts, $\\int_0^\\pi x\\cos x\\,dx = [x\\sin x]_0^\\pi - \\int_0^\\pi \\sin x\\,dx = 0 - 2 = -2$, and $\\int_0^\\pi 2\\cos x\\,dx = 0$, so $a_1 = -\\tfrac4\\pi$. Hence **B**. A is the answer for $|x|$ alone — it forgets that the shift $+2$ moves the mean up by exactly $2$. D forgets every normalizing factor ($\\tfrac{1}{2\\pi}$ and $\\tfrac1\\pi$) in the coefficient formulas.",
    theory:
      "$S_N(x) = a_0 + \\sum_{n=1}^N (a_n\\cos nx + b_n\\sin nx)$ with $a_0 = \\frac{1}{2\\pi}\\int_{-\\pi}^\\pi f$, $a_n = \\frac1\\pi\\int_{-\\pi}^\\pi f\\cos nx\\,dx$. Adding a constant $c$ to $f$ changes only $a_0$ (by $c$): the oscillating coefficients see $f - \\bar f$ only. For even $f$, halve the domain and double: $a_n = \\frac2\\pi\\int_0^\\pi f\\cos nx\\,dx$.",
  },

  /* ---------------- Esercise 3 — series given, extract data -------- */
  {
    id: "ma2-tut-fo-3",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "hard",
    type: "numeric",
    prompt:
      P +
      "Let $f(x) = -1 + \\displaystyle\\sum_{k=1}^{\\infty} \\frac{1}{5^k}\\sin(2kx)$. Compute $\\lVert f\\rVert_2 = \\left(\\int_{-\\pi}^{\\pi} f(x)^2\\,dx\\right)^{1/2}$ (two decimals).",
    answer: 2.5326,
    tolerance: 0.01,
    explanation:
      "The function is *given* as its Fourier series: $a_0 = -1$, $\\tilde b_n = 1/5^k$ when $n = 2k$ and $0$ otherwise. Bessel–Plancherel converts the norm into a numeric series: $\\lVert f\\rVert_2^2 = 2\\pi a_0^2 + \\pi\\sum_n (\\tilde a_n^2 + \\tilde b_n^2) = 2\\pi + \\pi\\sum_{k=1}^\\infty \\frac{1}{25^k}$. The geometric tail is $\\sum_{k\\ge1} 25^{-k} = \\frac{1/25}{1 - 1/25} = \\frac{1}{24}$, so $\\lVert f\\rVert_2^2 = 2\\pi + \\frac{\\pi}{24} = \\frac{49\\pi}{24}$ and $\\lVert f\\rVert_2 = \\frac72\\sqrt{\\frac\\pi6} \\approx 2.53$. Watch the two classic slips: the constant term carries weight $2\\pi$, not $\\pi$ (it is $a_0^2$ integrated over the whole period), and the coefficients get *squared* — $1/5^k \\to 1/25^k$.",
    theory:
      "Plancherel on $[-\\pi,\\pi]$: $\\int_{-\\pi}^\\pi f^2 = 2\\pi a_0^2 + \\pi\\sum_{n\\ge1}(a_n^2 + b_n^2)$. It holds because the trig system is orthogonal: cross terms integrate to zero, $\\int\\cos^2 nx = \\int\\sin^2 nx = \\pi$, $\\int a_0^2 = 2\\pi a_0^2$. Geometric series $\\sum_{k\\ge1} r^k = \\frac{r}{1-r}$ finishes these off.",
  },
  {
    id: "ma2-tut-fo-4",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "easy",
    type: "numeric",
    prompt:
      P +
      "Let $f(x) = -1 + \\displaystyle\\sum_{k=1}^{\\infty} \\frac{1}{5^k}\\sin(2kx)$. Compute $\\displaystyle\\int_0^{2\\pi} f(x)\\,dx$ (two decimals).",
    answer: -6.2832,
    tolerance: 0.01,
    explanation:
      "Every harmonic $\\sin(2kx)$ integrates to zero over the full period $[0, 2\\pi]$ (a whole number of oscillations), so only the constant survives: $\\int_0^{2\\pi} f = 2\\pi \\cdot a_0 = 2\\pi\\cdot(-1) = -2\\pi \\approx -6.28$. Equivalently: the integral of $f$ over one period is always $2\\pi a_0$, because $a_0$ *is* the mean value of $f$.",
    theory:
      "$\\int_{\\text{period}} \\cos(nx)\\,dx = \\int_{\\text{period}} \\sin(nx)\\,dx = 0$ for $n \\ge 1$. Hence for any Fourier series, $\\int_0^{2\\pi} f = 2\\pi a_0$ — integrating over a period is a projection onto the constant mode.",
  },
  {
    id: "ma2-tut-fo-5",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "medium",
    type: "numeric",
    prompt:
      P +
      "Let $f(x) = -1 + \\displaystyle\\sum_{k=1}^{\\infty} \\frac{1}{5^k}\\sin(2kx)$. Compute $\\displaystyle\\int_{-\\pi}^{\\pi} f(x)\\sin(x)\\,dx$.",
    answer: 0,
    tolerance: 0.01,
    explanation:
      "This integral is $\\pi$ times the coefficient of $\\sin(x)$ in the series — and there is no $\\sin(x)$ term: $f$ contains only *even* frequencies $\\sin(2kx)$ ($k \\ge 1$), i.e. $\\tilde b_1 = 0$. Orthogonality does the rest: $\\int_{-\\pi}^\\pi \\sin(2kx)\\sin(x)\\,dx = 0$ for every $k$ (different frequencies), and $\\int_{-\\pi}^\\pi (-1)\\sin x\\,dx = 0$ (constant ⊥ sine). So the answer is $0$ — no computation, just reading which harmonics are present.",
    theory:
      "Integrating $f$ against $\\sin(nx)$ or $\\cos(nx)$ over a period *extracts* that coefficient: $\\int_{-\\pi}^\\pi f\\sin(nx)\\,dx = \\pi b_n$. If the frequency $n$ does not appear in the series, the integral is zero. This is the whole point of orthogonality — each harmonic can be probed independently.",
  },
  {
    id: "ma2-tut-fo-6",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 3`,
    difficulty: "hard",
    type: "numeric",
    prompt:
      P +
      "Let $f(x) = -1 + \\displaystyle\\sum_{k=1}^{\\infty} \\frac{1}{5^k}\\sin(2kx)$. Compute $\\displaystyle\\int_0^{2\\pi} f(x)\\sin(6x)\\,dx$ (four decimals).",
    answer: 0.0251,
    tolerance: 0.001,
    explanation:
      "Same extraction as before, but now the probed frequency *is* present: $\\sin(6x) = \\sin(2kx)$ with $k = 3$, whose coefficient is $\\frac{1}{5^3} = \\frac{1}{125}$. Orthogonality wipes out the constant and every $k \\neq 3$ term, leaving $\\int_0^{2\\pi} \\frac{1}{125}\\sin^2(6x)\\,dx = \\frac{1}{125}\\cdot\\pi = \\frac{\\pi}{125} \\approx 0.0251$. The trap is the index map: the coefficient of $\\sin(6x)$ is indexed by $k = 3$ (since $2k = 6$), i.e. $1/5^3$ — not $1/5^6$. Writing $\\tilde b_n$ for the coefficient of $\\sin(nx)$: $\\tilde b_6 = 1/5^3$, and the integral is $\\pi\\tilde b_6$.",
    theory:
      "$\\int_{\\text{period}} f\\sin(nx)\\,dx = \\pi b_n$ because $\\int \\sin^2(nx)\\,dx = \\pi$ over any full period. When a series is written with a compressed index (only frequencies $2k$, $3k$, …), always translate to the frequency actually asked for before reading off the coefficient.",
  },

  /* ---------------- Esercise 4 — even 6-periodic triangle wave ----- */
  {
    id: "ma2-tut-fo-7",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 4`,
    difficulty: "easy",
    type: "numeric",
    prompt:
      P +
      "Let $f$ be the even, $6$-periodic function with $f(x) = 6 - 2x$ for $x \\in [0,3]$, and Fourier series $a_0 + \\dfrac{24}{\\pi^2}\\displaystyle\\sum_{k=0}^{\\infty}\\frac{1}{(2k+1)^2}\\cos\\Big(\\frac{(2k+1)\\pi x}{3}\\Big) + \\displaystyle\\sum_{k=1}^{\\infty} b_k\\sin\\Big(\\frac{k\\pi}{3}x\\Big)$. Compute $a_0$.",
    answer: 3,
    tolerance: 0.01,
    explanation:
      "$a_0$ is the mean value over one period. With period $T = 6$ and evenness: $a_0 = \\frac16\\int_{-3}^{3} f = \\frac13\\int_0^3 (6-2x)\\,dx = \\frac13\\left[6x - x^2\\right]_0^3 = \\frac13(18 - 9) = 3$. Geometric check: $f$ is a triangle wave sliding linearly from $6$ down to $0$ on $[0,3]$, so its average is $\\frac{6+0}{2} = 3$. (The $b_k$ in the given form are all $0$ — an even function has no sine terms; the cosine amplitudes $\\frac{24}{\\pi^2 n^2}$ for odd $n$ are handed to you by the sheet.)",
    theory:
      "For period $T$: $a_0 = \\frac1T\\int_{-T/2}^{T/2} f$, and evenness lets you halve the domain and double. A linear ramp's mean is the midpoint of its endpoint values — always sanity-check $a_0$ against the picture.",
  },
  {
    id: "ma2-tut-fo-8",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 4`,
    difficulty: "medium",
    prompt:
      P +
      "Let $f$ be the even, $6$-periodic function with $f(x) = 6 - 2x$ for $x \\in [0,3]$, and let $S$ be its Fourier series. The values $S(1)$ and $S(6)$ are, respectively:",
    options: [
      { id: "A", content: "$S(1) = 4$ and $S(6) = 6$" },
      { id: "B", content: "$S(1) = 4$ and $S(6) = -6$" },
      { id: "C", content: "$S(1) = 3$ and $S(6) = 3$" },
      { id: "D", content: "$S(1) = 4$ and $S(6) = 0$" },
    ],
    correct: "A",
    explanation:
      "First check continuity: on $[0,3]$, $f$ runs from $f(0)=6$ to $f(3)=0$; the even reflection glues smoothly at $x=0$ (both sides give $6$) and the $6$-periodic extension glues at $x = \\pm 3$ (both sides give $0$). So $f$ is continuous on all of $\\mathbb R$, and the pointwise convergence theorem gives $S(x_0) = f(x_0)$ *everywhere* — no jump averages needed. Then $S(1) = f(1) = 6 - 2 = 4$, and by periodicity $S(6) = f(6) = f(6 - 6) = f(0) = 6$. **B** plugs $x = 6$ into the formula $6-2x$ outside its interval of validity $[0,3]$ — the formula does not extend, the *periodicity* does. **D** evaluates at the wrong representative (it computes $f(3) = 0$). **C** confuses the value of the series with the mean $a_0 = 3$.",
    theory:
      "For piecewise-$C^1$ periodic $f$, the Fourier series converges at every $x_0$ to $\\frac12\\big(f(x_0^+) + f(x_0^-)\\big)$ — which is just $f(x_0)$ wherever $f$ is continuous. Always reduce the evaluation point into one fundamental period *first*, then use the defining formula.",
  },
  {
    id: "ma2-tut-fo-9",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 4`,
    difficulty: "hard",
    type: "numeric",
    prompt:
      P +
      "Let $f$ be the even, $6$-periodic function with $f(x) = 6 - 2x$ for $x \\in [0,3]$, whose Fourier series is $3 + \\dfrac{24}{\\pi^2}\\displaystyle\\sum_{k=0}^{\\infty}\\frac{1}{(2k+1)^2}\\cos\\Big(\\frac{(2k+1)\\pi x}{3}\\Big)$. Using it, compute $\\displaystyle\\sum_{k=1}^{\\infty}\\frac{1}{(2k+1)^2}$ — note the sum starts at $k = 1$ (four decimals).",
    answer: 0.2337,
    tolerance: 0.002,
    explanation:
      "Evaluate the series at a point where everything collapses: at $x = 0$ every cosine equals $1$, and $f$ is continuous there, so $S(0) = f(0) = 6$ gives $6 = 3 + \\frac{24}{\\pi^2}\\sum_{k=0}^\\infty \\frac{1}{(2k+1)^2}$. Solving: $\\sum_{k=0}^\\infty \\frac{1}{(2k+1)^2} = \\frac{3\\pi^2}{24} = \\frac{\\pi^2}{8}$ — the classic odd-squares sum. But the question starts at $k = 1$, so subtract the $k=0$ term (which is $1$): $\\sum_{k=1}^\\infty \\frac{1}{(2k+1)^2} = \\frac{\\pi^2}{8} - 1 \\approx 0.2337$. Forgetting to drop that first term (answering $\\frac{\\pi^2}{8} \\approx 1.2337$) is *the* trap here.",
    theory:
      "Evaluating a known Fourier series at a well-chosen point (usually $x = 0$ or the jump/corner locations) turns it into a numeric identity — this is how $\\sum 1/n^2 = \\pi^2/6$ and $\\sum 1/(2k+1)^2 = \\pi^2/8$ are derived. Always match the summation range of the identity against the one asked.",
  },

  /* ---------------- Esercise 5 — 1-periodic sawtooth --------------- */
  {
    id: "ma2-tut-fo-10",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "hard",
    prompt:
      P +
      "Let $f$ be the $1$-periodic function with $f(x) = x$ for $x \\in [0, \\tfrac12]$ and $f(x) = x - 1$ for $x \\in (\\tfrac12, 1]$. Its Fourier series is $S(x) = \\displaystyle\\sum_{k=1}^{\\infty} b_k \\sin(2\\pi k x)$ with $b_k$ equal to:",
    options: [
      { id: "A", content: "$b_k = \\dfrac{1}{\\pi k}$" },
      { id: "B", content: "$b_k = \\dfrac{(-1)^{k+1}}{2\\pi k}$" },
      { id: "C", content: "$b_k = \\dfrac{(-1)^{k}}{\\pi k}$" },
      { id: "D", content: "$b_k = \\dfrac{(-1)^{k+1}}{\\pi k}$" },
    ],
    correct: "D",
    explanation:
      "On $(-\\tfrac12, \\tfrac12]$ the function is just $f(x) = x$ (for $x \\in (\\tfrac12, 1]$, shift by one period), so it is odd (up to the single point $x=\\tfrac12$) — pure sine series, frequencies $2\\pi k$ because the period is $T = 1$. Coefficients: $b_k = 2\\int_{-1/2}^{1/2} x\\sin(2\\pi kx)\\,dx = 4\\int_0^{1/2} x\\sin(2\\pi kx)\\,dx$. By parts: $= \\frac{4}{2\\pi k}\\Big(\\big[-x\\cos(2\\pi kx)\\big]_0^{1/2} + \\int_0^{1/2}\\cos(2\\pi kx)\\,dx\\Big) = \\frac{4}{2\\pi k}\\cdot\\Big(-\\frac{\\cos(\\pi k)}{2}\\Big) = \\frac{(-1)^{k+1}}{\\pi k}$, since $\\cos(\\pi k) = (-1)^k$ and the leftover cosine integral vanishes ($\\sin(\\pi k) = 0$). So **D**: $b_1 = \\frac1\\pi > 0$, alternating. **C** has the sign flipped (it would start negative, but near $x = 0^+$ the sawtooth rises like $x$, matching $+\\sin$). **A** drops the alternation coming from $\\cos(\\pi k)$. **B** forgets to combine the $4$ with the $\\frac{1}{2\\pi k}$ correctly.",
    theory:
      "For period $T$: $S(x) = a_0 + \\sum_k\\big(a_k\\cos\\frac{2\\pi kx}{T} + b_k\\sin\\frac{2\\pi kx}{T}\\big)$ with $b_k = \\frac2T\\int_{-T/2}^{T/2} f\\sin\\frac{2\\pi kx}{T}\\,dx$. First redraw the function on a symmetric interval to spot parity; the boundary term of the integration by parts, $\\cos(\\pi k) = (-1)^k$, is what produces alternating signs in every sawtooth.",
  },
  {
    id: "ma2-tut-fo-11",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "medium",
    prompt:
      P +
      "Let $f$ be the $1$-periodic function with $f(x) = x$ for $x \\in [0, \\tfrac12]$ and $f(x) = x - 1$ for $x \\in (\\tfrac12, 1]$. The sum of its Fourier series at $x = \\tfrac12$ is:",
    options: [
      { id: "A", content: "$\\tfrac12$" },
      { id: "B", content: "$0$" },
      { id: "C", content: "$-\\tfrac12$" },
      { id: "D", content: "the series does not converge at $x = \\tfrac12$" },
    ],
    correct: "B",
    explanation:
      "$x = \\tfrac12$ is a jump point: from the left $f \\to \\tfrac12$ (branch $f(x)=x$), from the right $f \\to \\tfrac12 - 1 = -\\tfrac12$ (branch $f(x) = x-1$). The pointwise convergence theorem for piecewise-$C^1$ functions says the series converges there to the *average of the two one-sided limits*: $S(\\tfrac12) = \\frac12\\big(\\tfrac12 + (-\\tfrac12)\\big) = 0$. Cross-check directly from the series: every term is $b_k\\sin(2\\pi k \\cdot \\tfrac12) = b_k\\sin(\\pi k) = 0$, so the sum is trivially $0$. **A** is the left limit (the actual value $f(\\tfrac12) = \\tfrac12$ — irrelevant: the series does not care about the value *at* the jump), **C** is the right limit, and **D** is false — Dirichlet's theorem guarantees convergence at jumps, just not to $f$.",
    theory:
      "Dirichlet / pointwise convergence: for piecewise-$C^1$ periodic $f$, $\\lim_{N\\to\\infty}S_N f(x_0) = \\frac12\\big(f(x_0^+) + f(x_0^-)\\big)$ at every point — equal to $f(x_0)$ at continuity points, the mid-jump value at discontinuities. Redefining $f$ at a single point changes nothing in the series.",
  },
  {
    id: "ma2-tut-fo-12",
    topic: "Fourier series",
    tags: ["tutorial"],
    source: `${SRC} · Ex 5`,
    difficulty: "medium",
    type: "numeric",
    prompt:
      P +
      "Let $f$ be the $1$-periodic sawtooth above, with Fourier series $S(x) = \\displaystyle\\sum_{k=1}^{\\infty} \\frac{(-1)^{k+1}}{\\pi k}\\sin(2\\pi kx)$, and let $S_2$ be its partial sum of order $2$. Compute $\\lVert S_2\\rVert_2 = \\left(\\int_0^1 S_2(x)^2\\,dx\\right)^{1/2}$ (four decimals).",
    answer: 0.2516,
    tolerance: 0.002,
    explanation:
      "The order-2 partial sum keeps $k = 1, 2$: $S_2(x) = \\frac1\\pi\\sin(2\\pi x) - \\frac{1}{2\\pi}\\sin(4\\pi x)$. On a period of length $1$, each $\\sin(2\\pi kx)$ has $\\int_0^1 \\sin^2(2\\pi kx)\\,dx = \\frac12$, and cross terms vanish by orthogonality, so $\\lVert S_2\\rVert_2^2 = \\frac12\\big(b_1^2 + b_2^2\\big) = \\frac{1}{2\\pi^2}\\Big(1 + \\frac14\\Big) = \\frac{5}{8\\pi^2}$. Hence $\\lVert S_2\\rVert_2 = \\frac{1}{2\\pi}\\sqrt{\\frac52} \\approx 0.2516$. Note the convention shift from the $2\\pi$-periodic case: on period $T$ the weight per harmonic is $T/2$ (here $\\tfrac12$), not $\\pi$ — using $\\pi$ here is the standard slip.",
    theory:
      "Plancherel on period $T$: $\\int_0^T f^2 = T a_0^2 + \\frac T2\\sum_k (a_k^2 + b_k^2)$; for $T = 2\\pi$ this reduces to the familiar $2\\pi a_0^2 + \\pi\\sum(\\cdot)$. A truncated series $S_N$ obeys the same identity with the sum stopped at $N$ — and $\\lVert S_N\\rVert_2 \\le \\lVert f\\rVert_2$ always (Bessel).",
  },
];
