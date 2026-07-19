import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";

export const MODULE = "Fourier series";

/* ================================================================== *
 *  Figure — partial sums of the square-wave Fourier series
 *  (the deck's own flagship plot, recomputed live):
 *  S_N(x) = Σ_{k=1}^{N} 4/(π(2k−1)) · sin((2k−1)x)  →  sign(x) on (−π,π)
 * ================================================================== */
function SquareWavePartials() {
  const W = 460;
  const H = 220;
  const padX = 14;
  const padY = 12;
  const SAMPLES = 240;
  const xs: number[] = [];
  for (let i = 0; i <= SAMPLES; i++) xs.push(-Math.PI + (2 * Math.PI * i) / SAMPLES);
  const X = (x: number) => padX + ((x + Math.PI) / (2 * Math.PI)) * (W - 2 * padX);
  const Y = (v: number) => H / 2 - (v * (H / 2 - padY)) / 1.35;
  const partial = (terms: number) =>
    xs
      .map((x) => {
        let s = 0;
        for (let k = 1; k <= terms; k++) s += (4 / (Math.PI * (2 * k - 1))) * Math.sin((2 * k - 1) * x);
        return `${X(x).toFixed(1)},${Y(s).toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
      {/* axes */}
      <line x1={padX} y1={H / 2} x2={W - padX} y2={H / 2} stroke="var(--color-line)" strokeWidth={1} />
      <line x1={W / 2} y1={padY} x2={W / 2} y2={H - padY} stroke="var(--color-line)" strokeWidth={1} />
      {/* the square wave itself */}
      <line x1={X(-Math.PI)} y1={Y(-1)} x2={X(0)} y2={Y(-1)} stroke="var(--good)" strokeWidth={1.6} strokeDasharray="6 4" />
      <line x1={X(0)} y1={Y(1)} x2={X(Math.PI)} y2={Y(1)} stroke="var(--good)" strokeWidth={1.6} strokeDasharray="6 4" />
      {/* partial sums with 1, 2 and 8 nonzero harmonics */}
      <polyline points={partial(1)} fill="none" stroke="var(--accent)" strokeWidth={1.3} opacity={0.3} />
      <polyline points={partial(2)} fill="none" stroke="var(--accent)" strokeWidth={1.3} opacity={0.55} />
      <polyline points={partial(8)} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      {/* legend */}
      <text x={padX + 4} y={padY + 10} fontSize={10} fill="var(--color-faint)">
        S_N with 1, 2, 8 harmonics
      </text>
      <text x={W - padX - 4} y={Y(1) - 6} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--good)">
        f = ±1
      </text>
      <text x={X(-Math.PI)} y={H - 2} fontSize={10} fill="var(--color-faint)">
        −π
      </text>
      <text x={X(Math.PI) - 10} y={H - 2} fontSize={10} fill="var(--color-faint)">
        π
      </text>
    </svg>
  );
}

/* ================================================================== */

export const lessons: Lesson[] = [
  /* ================================================================ *
   * LESSON 1 — Periodic functions & trigonometric polynomials
   * ================================================================ */
  {
    id: "fourier-trig-polynomials",
    title: "Periodic functions & trigonometric polynomials",
    lecture: MODULE,
    summary:
      "Taylor needs smoothness — an ON/OFF signal has none. Fourier's answer: build periodic functions from sines and cosines, and let orthogonality reverse-engineer the coefficients.",
    minutes: 22,
    objectives: [
      "Verify T-periodicity and rescale it: f(αx) is T/α-periodic",
      "Read the coefficients of a trigonometric polynomial",
      "Use the orthogonality integrals to derive the Fourier-coefficient formulas",
      "Kill half the coefficients in advance with even/odd symmetry",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Taylor's theorem and power series approximate <Tex>{"C^k"}</Tex> (
            <Tex>{"k \\ge 1"}</Tex>) or analytic functions. But many functions modelling natural
            phenomena are <strong>not</strong> <Tex>{"C^k"}</Tex> or analytic — the deck's opening
            example is the ON/OFF signal, <Tex>{"f(t) = 1"}</Tex> for <Tex>{"t \\ge 0"}</Tex> and{" "}
            <Tex>{"0"}</Tex> for <Tex>{"t < 0"}</Tex>, which is not even continuous. The question of
            this module: can we approximate <em>non-regular</em> functions using series of elementary
            functions? Yes — and the second, subtler question is <em>in which sense</em> the series
            converges.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "T-periodic function",
        content: (
          <>
            Let <Tex>{"f:\\mathbb{R}\\to\\mathbb{R}"}</Tex> and <Tex>{"T > 0"}</Tex>. We say{" "}
            <Tex>{"f"}</Tex> is <strong>T-periodic</strong> if{" "}
            <Tex>{"f(x+T) = f(x)"}</Tex> for all <Tex>{"x \\in \\mathbb{R}"}</Tex>. Both{" "}
            <Tex>{"\\sin x"}</Tex> and <Tex>{"\\cos x"}</Tex> are <Tex>{"2\\pi"}</Tex>-periodic.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Two facts the deck asks you to prove",
        content: (
          <>
            If <Tex>{"f"}</Tex> is T-periodic, then (1) <Tex>{"f"}</Tex> is also{" "}
            <Tex>{"nT"}</Tex>-periodic for every <Tex>{"n \\in \\mathbb{N}"}</Tex>, and (2) for any{" "}
            <Tex>{"\\alpha > 0"}</Tex> the rescaled function <Tex>{"g(x) = f(\\alpha x)"}</Tex> is{" "}
            <Tex>{"\\tfrac{T}{\\alpha}"}</Tex>-periodic. Example: <Tex>{"\\cos(2x)"}</Tex> is{" "}
            <Tex>{"\\pi"}</Tex>-periodic, and so is <Tex>{"|\\cos x|"}</Tex> — spotting the{" "}
            <em>true</em> (smallest) period is often the whole trick of an exercise.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Trigonometric polynomial",
        content: (
          <>
            Given <Tex>{"a_0, a_1, \\dots, a_N, b_1, \\dots, b_N \\in \\mathbb{R}"}</Tex>, a function
            of the form{" "}
            <Tex>{"P(x) = a_0 + \\sum_{n=1}^{N} a_n\\cos(nx) + b_n\\sin(nx)"}</Tex> is called a{" "}
            <strong>trigonometric polynomial</strong>. The deck's example:{" "}
            <Tex>{"P(x) = 1 + 2\\cos(3x) - 3\\sin(4x)"}</Tex> has <Tex>{"a_0 = 1"}</Tex>,{" "}
            <Tex>{"a_3 = 2"}</Tex>, <Tex>{"b_4 = -3"}</Tex> and every other coefficient zero. Sums and
            products of trigonometric polynomials are again trigonometric polynomials.
          </>
        ),
      },
      { kind: "heading", text: "Orthogonality — the dot product behind everything" },
      {
        kind: "formula",
        tex: "\\int_{-\\pi}^{\\pi} \\cos(nx)\\sin(kx)\\,dx = 0, \\qquad \\int_{-\\pi}^{\\pi} \\cos(nx)\\cos(kx)\\,dx = \\int_{-\\pi}^{\\pi} \\sin(nx)\\sin(kx)\\,dx = \\begin{cases} 0 & n \\ne k \\\\ \\pi & n = k \\end{cases}",
        tag: "F.1",
        caption: (
          <>
            Valid for all <Tex>{"n, k \\in \\mathbb{N}_+"}</Tex>; proved with the Werner
            product-to-sum formulas, e.g.{" "}
            <Tex>{"\\cos\\alpha\\cos\\beta = \\tfrac12\\cos(\\alpha+\\beta) + \\tfrac12\\cos(\\alpha-\\beta)"}</Tex>.
            Distinct harmonics are <em>orthogonal</em> — they don't see each other under the integral.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Now the deck's “reverse engineering”: suppose a <Tex>{"2\\pi"}</Tex>-periodic{" "}
            <Tex>{"f"}</Tex> can be written as{" "}
            <Tex>{"f(x) = a_0 + \\sum_{n=1}^{\\infty} a_n\\cos(nx) + b_n\\sin(nx)"}</Tex>. How must
            the coefficients be chosen? Multiply both sides by <Tex>{"\\cos(kx)"}</Tex> and integrate
            over <Tex>{"[-\\pi,\\pi]"}</Tex>: orthogonality wipes out every term except{" "}
            <Tex>{"\\pi a_k"}</Tex>. Multiplying by <Tex>{"\\sin(kx)"}</Tex> isolates{" "}
            <Tex>{"\\pi b_k"}</Tex>; integrating with no factor at all leaves{" "}
            <Tex>{"2\\pi a_0"}</Tex>.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "a_0 = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(x)\\,dx, \\qquad a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx, \\qquad b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin(nx)\\,dx \\quad (n \\ge 1)",
        tag: "F.2",
        caption: (
          <>
            The <strong>Fourier coefficients</strong> of <Tex>{"f"}</Tex>; the series{" "}
            <Tex>{"a_0 + \\sum_{n\\ge1} a_n\\cos(nx) + b_n\\sin(nx)"}</Tex> built with them is the{" "}
            <strong>Fourier series of f</strong>. Note <Tex>{"a_0"}</Tex> is exactly the{" "}
            <em>mean value</em> of <Tex>{"f"}</Tex> over one period.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Convention alert: a₀, not a₀/2",
        content: (
          <>
            This course writes the constant term as <Tex>{"a_0"}</Tex> with the{" "}
            <Tex>{"\\tfrac{1}{2\\pi}"}</Tex> in front of the integral. Many textbooks instead write{" "}
            <Tex>{"\\tfrac{a_0}{2} + \\sum(\\cdots)"}</Tex> with{" "}
            <Tex>{"a_0 = \\tfrac{1}{\\pi}\\int f"}</Tex>. Both describe the same series, but every
            identity below (energy, Bessel–Parseval) is written in the{" "}
            <strong>professor's convention</strong> — mixing the two costs you factors of 2 and 4
            exactly where the exam checks them.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Symmetry kills half the work",
        content: (
          <>
            If <Tex>{"f"}</Tex> is <strong>even</strong> (<Tex>{"f(-x) = f(x)"}</Tex>):{" "}
            <Tex>{"b_n = 0"}</Tex> for all <Tex>{"n \\ge 1"}</Tex> — a pure cosine series. If{" "}
            <Tex>{"f"}</Tex> is <strong>odd</strong> (<Tex>{"f(-x) = -f(x)"}</Tex>):{" "}
            <Tex>{"a_n = 0"}</Tex> for all <Tex>{"n \\ge 0"}</Tex> — a pure sine series,{" "}
            <em>including</em> <Tex>{"a_0 = 0"}</Tex>. Check parity before integrating anything: it
            answers structure questions (“which terms appear?”) with zero computation.
          </>
        ),
      },
      { kind: "heading", text: "The two flagship examples" },
      {
        kind: "example",
        title: "Worked example — the square wave",
        content: (
          <>
            <p>
              Let <Tex>{"f"}</Tex> be <Tex>{"2\\pi"}</Tex>-periodic with <Tex>{"f(x) = -1"}</Tex> on{" "}
              <Tex>{"[-\\pi, 0)"}</Tex> and <Tex>{"f(x) = 1"}</Tex> on <Tex>{"[0, \\pi)"}</Tex>. It is
              odd, so <Tex>{"a_n = 0"}</Tex> for every <Tex>{"n \\ge 0"}</Tex> and
            </p>
            <p>
              <Tex>{"b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin(nx)\\,dx = \\frac{2}{\\pi}\\int_{0}^{\\pi} \\sin(nx)\\,dx = \\frac{2}{\\pi n}\\left(1 - (-1)^n\\right),"}</Tex>
            </p>
            <p>
              which is <Tex>{"\\tfrac{4}{\\pi n}"}</Tex> for odd <Tex>{"n"}</Tex> and 0 for even{" "}
              <Tex>{"n"}</Tex>. Keeping only the odd harmonics <Tex>{"n = 2n-1"}</Tex>:
            </p>
            <p>
              <Tex>{"S(x) = \\sum_{n=1}^{\\infty} \\frac{4}{\\pi(2n-1)}\\,\\sin\\big((2n-1)x\\big)."}</Tex>
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <SquareWavePartials />,
        caption: (
          <>
            Partial sums of the square-wave series, exactly as plotted in the deck: with more
            harmonics the sum hugs the flat levels <Tex>{"\\pm 1"}</Tex>, while small overshoots
            persist near the jump — a first hint that “convergence” will need a careful definition.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the sawtooth f(x) = x",
        content: (
          <>
            <p>
              Let <Tex>{"f"}</Tex> be <Tex>{"2\\pi"}</Tex>-periodic with <Tex>{"f(x) = x"}</Tex> on{" "}
              <Tex>{"[-\\pi, \\pi)"}</Tex>. Again odd, so only sines survive. Integration by parts:
            </p>
            <p>
              <Tex>{"b_n = \\frac{2}{\\pi}\\int_0^{\\pi} x\\sin(nx)\\,dx = \\frac{2}{\\pi}\\left[-\\frac{x\\cos(nx)}{n}\\Big|_0^{\\pi} + \\frac{1}{n}\\int_0^{\\pi}\\cos(nx)\\,dx\\right] = \\frac{2}{n}(-1)^{n+1},"}</Tex>
            </p>
            <p>
              so{" "}
              <Tex>{"S(x) = \\sum_{n=1}^{\\infty} \\frac{2}{n}(-1)^{n+1}\\sin(nx)."}</Tex> Memorize
              both examples: the deck reuses them for every convergence and energy statement that
              follows.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-fou-cp1",
          difficulty: "easy",
          prompt: (
            <>
              Let <Tex>{"f"}</Tex> be odd and <Tex>{"2\\pi"}</Tex>-periodic. Its Fourier series:
            </>
          ),
          options: [
            {
              id: "A",
              content: (
                <>
                  contains only <Tex>{"\\sin(nx)"}</Tex> terms — even the constant{" "}
                  <Tex>{"a_0"}</Tex> vanishes.
                </>
              ),
            },
            { id: "B", content: <>contains only <Tex>{"\\cos(nx)"}</Tex> terms.</> },
            {
              id: "C",
              content: (
                <>
                  contains only sines, plus possibly a nonzero constant <Tex>{"a_0"}</Tex>.
                </>
              ),
            },
            { id: "D", content: <>cannot be constrained without computing the integrals.</> },
          ],
          correct: "A",
          explanation: (
            <>
              Odd functions integrate to zero against every even function — and both{" "}
              <Tex>{"\\cos(nx)"}</Tex> and the constant 1 are even, so <Tex>{"a_n = 0"}</Tex> for{" "}
              <em>all</em> <Tex>{"n \\ge 0"}</Tex>: answer A. C is the classic slip of forgetting that{" "}
              <Tex>{"a_0"}</Tex> (the mean of an odd function) also dies. B swaps the roles of the
              parities, and D ignores that symmetry decides this without any integral.
            </>
          ),
          theory: <>Odd f ⇒ pure sine series (a₀ included in the massacre); even f ⇒ pure cosine series plus mean.</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-fou-cp2",
          difficulty: "easy",
          prompt: (
            <>
              <Tex>{"f"}</Tex> is <Tex>{"2\\pi"}</Tex>-periodic and <Tex>{"g(x) = f(3x)"}</Tex>. Then{" "}
              <Tex>{"g"}</Tex> is:
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"6\\pi"}</Tex>-periodic.</> },
            { id: "B", content: <><Tex>{"2\\pi"}</Tex>-periodic, same as <Tex>{"f"}</Tex>.</> },
            { id: "C", content: <><Tex>{"\\tfrac{2\\pi}{3}"}</Tex>-periodic.</> },
            { id: "D", content: <><Tex>{"\\tfrac{2\\pi}{9}"}</Tex>-periodic.</> },
          ],
          correct: "C",
          explanation: (
            <>
              <Tex>{"g\\big(x + \\tfrac{2\\pi}{3}\\big) = f(3x + 2\\pi) = f(3x) = g(x)"}</Tex> —
              compressing the graph by 3 divides the period by 3: answer C. A multiplies instead of
              dividing (stretching would do that, i.e. <Tex>{"f(x/3)"}</Tex>); B forgets rescaling
              changes the period at all; D divides twice.
            </>
          ),
          theory: <>f T-periodic ⇒ f(αx) is (T/α)-periodic — the deck's remark (2), used every time the period isn't 2π.</>,
        },
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — Convergence: energy (L²) and pointwise
   * ================================================================ */
  {
    id: "fourier-convergence",
    title: "Convergence: the L² norm, Bessel–Parseval and pointwise values",
    lecture: MODULE,
    summary:
      "Does the Fourier series equal f, and in which sense? In energy: always (Bessel–Parseval). Point by point: only with piecewise regularity — and at a jump the series votes for the average.",
    minutes: 25,
    objectives: [
      "Work with the sup norm and the L² (quadratic) norm on periodic functions",
      "Compute the energy of a partial sum and state Riemann–Lebesgue",
      "State Bessel–Parseval: S_N → f in ‖·‖₂ — and what it does NOT say",
      "Decide piecewise regularity and evaluate the series pointwise via the jump-average theorem",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Let <Tex>{"S(x) = a_0 + \\sum_{n\\ge1} a_n\\cos(nx) + b_n\\sin(nx)"}</Tex> be the Fourier
            series built from <Tex>{"f"}</Tex>. Is it true that <Tex>{"f = S"}</Tex>? If yes, in which
            sense? To make “close” precise we need a <strong>norm</strong> — a way to measure the
            magnitude of a function. The course uses two.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "The two norms",
        content: (
          <>
            For <Tex>{"f:\\mathbb{R}\\to\\mathbb{R}"}</Tex>, <Tex>{"2\\pi"}</Tex>-periodic:{" "}
            <Tex>{"\\lVert f\\rVert_\\infty := \\sup_{x\\in[-\\pi,\\pi]}|f(x)|"}</Tex> (the{" "}
            <strong><Tex>{"L^\\infty"}</Tex>-norm</strong>, the “highest value”), and{" "}
            <Tex>{"\\lVert f\\rVert_2 := \\Big(\\int_{-\\pi}^{\\pi} f^2(x)\\,dx\\Big)^{1/2}"}</Tex>{" "}
            (the <strong><Tex>{"L^2"}</Tex>-norm or quadratic norm</strong>, the “energy” of{" "}
            <Tex>{"f"}</Tex> on <Tex>{"[-\\pi,\\pi]"}</Tex>).
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "‖·‖∞ is stronger than ‖·‖₂",
        content: (
          <>
            There is a constant <Tex>{"C>0"}</Tex> with{" "}
            <Tex>{"\\lVert f\\rVert_2 \\le C\\lVert f\\rVert_\\infty"}</Tex> (indeed{" "}
            <Tex>{"C = \\sqrt{2\\pi}"}</Tex>), but <em>no</em> reverse inequality exists: two
            functions can be <Tex>{"\\varepsilon"}</Tex>-close in energy while their sup distance
            stays large (think of a tall, extremely thin spike). So closeness in{" "}
            <Tex>{"\\lVert\\cdot\\rVert_\\infty"}</Tex> implies closeness in{" "}
            <Tex>{"\\lVert\\cdot\\rVert_2"}</Tex>, never the other way. Unlike{" "}
            <Tex>{"\\mathbb{R}^n"}</Tex>, on function spaces norms are <strong>not</strong>{" "}
            equivalent.
          </>
        ),
      },
      {
        kind: "definition",
        term: "N-th partial sum",
        content: (
          <>
            For <Tex>{"N \\in \\mathbb{N}_+"}</Tex>,{" "}
            <Tex>{"S_N(x) = a_0 + \\sum_{n=1}^{N} a_n\\cos(nx) + b_n\\sin(nx)"}</Tex> — the
            trigonometric polynomial keeping the first <Tex>{"N"}</Tex> harmonics of the Fourier
            series of <Tex>{"f"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\lVert S_N\\rVert_2^2 = 2\\pi a_0^2 + \\pi\\sum_{n=1}^{N}\\left(a_n^2 + b_n^2\\right)",
        tag: "F.3",
        caption: (
          <>
            The energy of the partial sum. Expand the square: orthogonality (F.1) kills every cross
            term, and each harmonic deposits its own energy — <Tex>{"2\\pi"}</Tex> for the constant,{" "}
            <Tex>{"\\pi"}</Tex> per <Tex>{"\\cos"}</Tex>/<Tex>{"\\sin"}</Tex>. A Pythagoras theorem
            for functions.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Riemann–Lebesgue lemma",
        content: (
          <>
            Let <Tex>{"f"}</Tex> be <Tex>{"2\\pi"}</Tex>-periodic with{" "}
            <Tex>{"\\lVert f\\rVert_2 < \\infty"}</Tex>. Then (1){" "}
            <Tex>{"\\lVert f\\rVert_2^2 = \\lVert f - S_N\\rVert_2^2 + 2\\pi a_0^2 + \\pi\\sum_{n=1}^{N}(a_n^2+b_n^2)"}</Tex>{" "}
            for every <Tex>{"N"}</Tex> — the error and the partial sum split the energy exactly; (2)
            the series <Tex>{"\\sum_{n=1}^{\\infty}(a_n^2+b_n^2)"}</Tex> converges; (3) consequently{" "}
            <Tex>{"a_n \\to 0"}</Tex> and <Tex>{"b_n \\to 0"}</Tex>: high-frequency coefficients of
            any finite-energy function must fade out.
          </>
        ),
      },
      { kind: "heading", text: "Convergence in energy: Bessel–Parseval" },
      {
        kind: "formula",
        tex: "\\lim_{N\\to\\infty}\\lVert f - S_N\\rVert_2 = 0 \\qquad \\text{and} \\qquad \\lVert f\\rVert_2^2 = 2\\pi a_0^2 + \\pi\\sum_{n=1}^{\\infty}\\left(a_n^2 + b_n^2\\right)",
        tag: "F.4",
        caption: (
          <>
            <strong>Theorem (Bessel–Parseval</strong>, a.k.a. Bessel–Plancherel<strong>)</strong>: for
            any <Tex>{"2\\pi"}</Tex>-periodic <Tex>{"f"}</Tex> with{" "}
            <Tex>{"\\lVert f\\rVert_2 < \\infty"}</Tex>, the partial sums approximate{" "}
            <Tex>{"f"}</Tex> with respect to <Tex>{"\\lVert\\cdot\\rVert_2"}</Tex>, and the energy of{" "}
            <Tex>{"f"}</Tex> equals the total energy of its harmonics.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "BE CAREFUL — the deck's own warning sign",
        content: (
          <>
            <Tex>{"\\lVert f - S_N\\rVert_2 \\to 0"}</Tex> does <strong>not</strong> imply that{" "}
            <Tex>{"f"}</Tex> and its Fourier series are equal point by point! Energy convergence
            averages over the interval; it tolerates disagreement at individual points (the square
            wave and its series disagree at the jumps, yet the energy error still vanishes). Pointwise
            equality needs <em>stronger assumptions</em> on <Tex>{"f"}</Tex> — that is the second half
            of this lesson.
          </>
        ),
      },
      { kind: "heading", text: "Pointwise convergence needs regularity" },
      {
        kind: "definition",
        term: "Piecewise regular function",
        content: (
          <>
            A <Tex>{"2\\pi"}</Tex>-periodic <Tex>{"f"}</Tex> is <strong>piecewise regular</strong> if
            there are finitely many points{" "}
            <Tex>{"-\\pi = x_0 < x_1 < \\cdots < x_k = \\pi"}</Tex> such that (1){" "}
            <Tex>{"f \\in C^1((x_i, x_{i+1}))"}</Tex> on each subinterval, and (2) the one-sided
            limits of <Tex>{"f"}</Tex> <em>and of</em> <Tex>{"f'"}</Tex> at every <Tex>{"x_i"}</Tex>{" "}
            exist finite. In other words: <Tex>{"f"}</Tex> and <Tex>{"f'"}</Tex> have at most finitely
            many discontinuity points, all of jump type.
          </>
        ),
      },
      {
        kind: "example",
        title: "Regular or not? The deck's four test cases",
        content: (
          <>
            <p>
              <strong>Piecewise regular:</strong> <Tex>{"f(x) = \\tfrac{\\pi}{2} - |x|"}</Tex>{" "}
              (continuous, corner at 0 with finite one-sided slopes <Tex>{"\\mp 1"}</Tex>), and the
              step <Tex>{"f(x) = x^2"}</Tex> on <Tex>{"[-\\pi,0]"}</Tex>, <Tex>{"1"}</Tex> on{" "}
              <Tex>{"(0,\\pi]"}</Tex> (one jump, finite limits of <Tex>{"f"}</Tex> and{" "}
              <Tex>{"f'"}</Tex> on both sides).
            </p>
            <p>
              <strong>Not piecewise regular:</strong> <Tex>{"f(x) = \\tfrac1x"}</Tex> (with{" "}
              <Tex>{"f(0)=0"}</Tex>) — the one-sided limits at 0 are <Tex>{"\\pm\\infty"}</Tex>, not
              finite; and <Tex>{"f(x) = \\sqrt{|x|}"}</Tex> — continuous, but{" "}
              <Tex>{"f'(x) = \\tfrac{1}{2\\sqrt{x}} \\to +\\infty"}</Tex> as{" "}
              <Tex>{"x \\to 0^+"}</Tex>: the <em>derivative's</em> limits fail. Condition (2) checks{" "}
              <Tex>{"f'"}</Tex> too — that's the part everyone forgets.
            </p>
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\forall x_0 \\in \\mathbb{R}: \\qquad \\lim_{N\\to\\infty} S_N(x_0) = \\frac{1}{2}\\left(\\lim_{x\\to x_0^-} f(x) + \\lim_{x\\to x_0^+} f(x)\\right)",
        tag: "F.5",
        caption: (
          <>
            <strong>Theorem (pointwise convergence)</strong>: valid for <Tex>{"f"}</Tex>{" "}
            <Tex>{"2\\pi"}</Tex>-periodic and <em>piecewise regular</em>. The Fourier series converges
            at every single point — to the average of the one-sided limits.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The two consequences you actually use",
        content: (
          <>
            (1) If <Tex>{"f \\in C(\\mathbb{R})"}</Tex> is <Tex>{"2\\pi"}</Tex>-periodic (and
            piecewise regular), then <Tex>{"f(x) = S(x)"}</Tex> for <em>every</em>{" "}
            <Tex>{"x \\in \\mathbb{R}"}</Tex> — at continuity points the two one-sided limits agree,
            and their average is just <Tex>{"f(x_0)"}</Tex>. (2) At a jump discontinuity{" "}
            <Tex>{"x_0"}</Tex>, the series equals the <strong>average of the jump</strong> — no matter
            what value <Tex>{"f(x_0)"}</Tex> itself was assigned.
          </>
        ),
      },
      {
        kind: "example",
        title: "Sanity check on the flagship examples",
        content: (
          <>
            <p>
              <strong>Square wave at</strong> <Tex>{"x=0"}</Tex>: the limits are <Tex>{"-1"}</Tex> and{" "}
              <Tex>{"1"}</Tex>, so the series must give <Tex>{"0"}</Tex> — and indeed every term{" "}
              <Tex>{"\\sin((2n-1)\\cdot 0) = 0"}</Tex>. The series ignores the assigned value{" "}
              <Tex>{"f(0) = 1"}</Tex> and votes for the midpoint.
            </p>
            <p>
              <strong>Sawtooth at</strong> <Tex>{"x=\\pi"}</Tex>: limits <Tex>{"\\pi"}</Tex> (from the
              left) and <Tex>{"-\\pi"}</Tex> (from the right, by periodicity) — average{" "}
              <Tex>{"0"}</Tex>, and indeed <Tex>{"\\sin(n\\pi) = 0"}</Tex> termwise. Elsewhere both
              functions are continuous, so the series reproduces them exactly.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-fou-cp3",
          difficulty: "easy",
          prompt: (
            <>
              <Tex>{"f"}</Tex> is <Tex>{"2\\pi"}</Tex>-periodic and piecewise regular, with{" "}
              <Tex>{"\\lim_{x\\to 2^-} f(x) = 5"}</Tex> and <Tex>{"\\lim_{x\\to 2^+} f(x) = 1"}</Tex>.
              The Fourier series of <Tex>{"f"}</Tex> at <Tex>{"x = 2"}</Tex> converges to:
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"5"}</Tex>, the left value.</> },
            { id: "B", content: <><Tex>{"3"}</Tex>.</> },
            { id: "C", content: <><Tex>{"1"}</Tex>, the right value.</> },
            { id: "D", content: <>Nothing — at a jump the series does not converge.</> },
          ],
          correct: "B",
          explanation: (
            <>
              The pointwise theorem (F.5) gives the average of the one-sided limits:{" "}
              <Tex>{"\\tfrac12(5+1) = 3"}</Tex> — answer B. A and C each privilege one side, but the
              series is perfectly democratic. D is exactly what the theorem refutes: piecewise regular
              functions get convergence at <em>every</em> point, jumps included.
            </>
          ),
          theory: <>At a jump the Fourier series converges to the midpoint ½(f(x₀⁻)+f(x₀⁺)), regardless of the value assigned to f(x₀).</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-fou-cp4",
          difficulty: "medium",
          prompt: (
            <>
              Which of the following <Tex>{"2\\pi"}</Tex>-periodic functions (given on{" "}
              <Tex>{"[-\\pi,\\pi]"}</Tex>) is <strong>not</strong> piecewise regular?
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"f(x) = \\tfrac{\\pi}{2} - |x|"}</Tex></> },
            {
              id: "B",
              content: <>The step: <Tex>{"x^2"}</Tex> on <Tex>{"[-\\pi,0]"}</Tex>, <Tex>{"1"}</Tex> on <Tex>{"(0,\\pi]"}</Tex>.</>,
            },
            { id: "C", content: <>The square wave <Tex>{"f(x) = \\pm 1"}</Tex>.</> },
            { id: "D", content: <><Tex>{"f(x) = \\sqrt{|x|}"}</Tex></> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"\\sqrt{|x|}"}</Tex> is continuous but its derivative blows up at 0 (
              <Tex>{"f' \\to \\pm\\infty"}</Tex>), so condition (2) — finite one-sided limits of{" "}
              <Tex>{"f'"}</Tex> — fails: answer D. A has only a corner (slopes <Tex>{"\\mp1"}</Tex>{" "}
              are finite), and B, C have only jump discontinuities with finite limits of{" "}
              <Tex>{"f"}</Tex> and <Tex>{"f'"}</Tex>: jumps are allowed, vertical tangents are not.
            </>
          ),
          theory: <>Piecewise regular checks BOTH f and f′: finitely many discontinuities, all of jump type — infinite limits (of either) disqualify.</>,
        },
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — Bessel–Parseval in action
   * ================================================================ */
  {
    id: "fourier-parseval-applications",
    title: "Bessel–Parseval in action: energies, integrals & exact sums",
    lecture: MODULE,
    summary:
      "The appello move: turn ‖f‖₂ into a numerical series of squared coefficients, sum it (geometric or telescoping), and don't forget the final square root. Plus: integrals read off coefficients, π²/6, and general period T.",
    minutes: 25,
    objectives: [
      "Compute ‖f‖₂ directly from a given Fourier series (the real-exam question type)",
      "Read integrals ∫f, ∫f cos(nx), ∫f sin(nx) off the coefficient table",
      "Extract exact numeric sums (π²/6 and friends) from Parseval or pointwise values",
      "Adapt every formula to a general period T — and recognize the complex form",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Bessel–Parseval is not just theory — it is a <strong>calculator</strong>. The written exam
            hands you a Fourier series and asks for <Tex>{"\\lVert f\\rVert_2"}</Tex>: a question
            about an unknown function answered entirely through its coefficients. The whole game is
            (F.4) read from right to left, plus one numerical series you already know how to sum from
            the series module — geometric or telescoping.
          </p>
        ),
      },
      {
        kind: "steps",
        title: "‖f‖₂ from a series, in three moves",
        steps: [
          {
            label: "Read the coefficients",
            content: (
              <>
                Match the given series against{" "}
                <Tex>{"a_0 + \\sum a_n\\cos(nx) + b_n\\sin(nx)"}</Tex>. Signs like{" "}
                <Tex>{"(-1)^n"}</Tex> and square roots in <Tex>{"a_n, b_n"}</Tex> will disappear when
                squared — don't let them scare you.
              </>
            ),
          },
          {
            label: "Sum the squares",
            content: (
              <>
                Compute <Tex>{"\\sum_{n\\ge1}(a_n^2 + b_n^2)"}</Tex>. In practice it is geometric (
                <Tex>{"a_n = q^{n/2}"}</Tex> squares to <Tex>{"q^n"}</Tex>) or telescoping (
                <Tex>{"b_n^2 = \\tfrac{c}{n(n+1)}"}</Tex> collapses to <Tex>{"c"}</Tex>). Watch the
                starting index of the geometric sum.
              </>
            ),
          },
          {
            label: "Assemble — and finish the square root",
            content: (
              <>
                <Tex>{"\\lVert f\\rVert_2^2 = 2\\pi a_0^2 + \\pi\\sum(a_n^2+b_n^2)"}</Tex>. If the
                question asks for <Tex>{"\\lVert f\\rVert_2"}</Tex> (no square), take the root at the
                very end — forgetting it is the classic distractor.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example (from the deck) — show that ‖f‖₂² = 8π",
        content: (
          <>
            <p>
              Let <Tex>{"f"}</Tex> be <Tex>{"2\\pi"}</Tex>-periodic with{" "}
              <Tex>{"\\lVert f\\rVert_2 < \\infty"}</Tex> and Fourier series{" "}
              <Tex>{"S(x) = \\sqrt{3} + \\sum_{n=1}^{\\infty} \\big(\\sqrt{\\tfrac23}\\big)^{n}\\cos(nx)."}</Tex>
            </p>
            <p>
              Coefficients: <Tex>{"a_0 = \\sqrt3"}</Tex>, <Tex>{"a_n = (2/3)^{n/2}"}</Tex>,{" "}
              <Tex>{"b_n = 0"}</Tex>. Squaring: <Tex>{"a_0^2 = 3"}</Tex> and{" "}
              <Tex>{"a_n^2 = (2/3)^n"}</Tex> — a geometric series from <Tex>{"n=1"}</Tex>:
            </p>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty}\\Big(\\tfrac23\\Big)^{n} = \\frac{2/3}{1-2/3} = 2, \\qquad \\lVert f\\rVert_2^2 = 2\\pi\\cdot 3 + \\pi\\cdot 2 = 8\\pi."}</Tex>
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "This is a literal appello question",
        content: (
          <>
            APPELLO 1 gave{" "}
            <Tex>{"S(x) = \\sum_{n=1}^{\\infty} \\tfrac{2(-1)^n}{\\sqrt{n(n+1)}}\\sin(nx)"}</Tex> and
            asked for <Tex>{"\\lVert f\\rVert_2"}</Tex>. Squaring kills both the sign and the root:{" "}
            <Tex>{"b_n^2 = \\tfrac{4}{n(n+1)}"}</Tex>, and{" "}
            <Tex>{"\\sum \\tfrac{1}{n(n+1)} = \\sum\\big(\\tfrac1n - \\tfrac1{n+1}\\big) = 1"}</Tex>{" "}
            telescopes. Telescoping squares are the professor's favourite fuel — and the wrong answers
            offered always include the value with the final square root forgotten.
          </>
        ),
      },
      { kind: "heading", text: "Reading integrals off the coefficients" },
      {
        kind: "formula",
        tex: "\\int_{-\\pi}^{\\pi} f(x)\\,dx = 2\\pi a_0, \\qquad \\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx = \\pi a_n, \\qquad \\int_{-\\pi}^{\\pi} f(x)\\sin(nx)\\,dx = \\pi b_n",
        tag: "F.6",
        caption: (
          <>
            The coefficient formulas (F.2) read backwards. A harmonic that is <em>absent</em> from the
            series has coefficient 0 — its integral is 0 with no computation. And by periodicity{" "}
            <Tex>{"\\int_0^{2\\pi} = \\int_{-\\pi}^{\\pi}"}</Tex>: shift any full-period integral to
            the symmetric window first.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the tutorial's Ex 3 function",
        content: (
          <>
            <p>
              Let <Tex>{"f(x) = -1 + \\sum_{k=1}^{\\infty} \\tfrac{1}{5^k}\\sin(2kx)"}</Tex> (only{" "}
              <em>even</em> harmonics <Tex>{"\\sin(2kx)"}</Tex> appear, plus the constant{" "}
              <Tex>{"a_0 = -1"}</Tex>). Then:
            </p>
            <p>
              <Tex>{"\\int_{-\\pi}^{\\pi} f(x)\\cos(x)\\,dx = \\pi a_1 = 0"}</Tex> — no cosine
              harmonics at all;{" "}
              <Tex>{"\\int_0^{2\\pi} f(x)\\sin(2x)\\,dx = \\pi \\tilde b_2 = \\tfrac{\\pi}{5}"}</Tex>{" "}
              — <Tex>{"\\sin(2x)"}</Tex> is the <Tex>{"k=1"}</Tex> term, so its coefficient is{" "}
              <Tex>{"5^{-1}"}</Tex>, not <Tex>{"5^{-2}"}</Tex>. Index-matching (<Tex>{"n = 2k"}</Tex>)
              is the entire difficulty of this exercise type.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Exact sums for free" },
      {
        kind: "example",
        title: "Worked example (from the deck) — Basel via Parseval",
        content: (
          <>
            <p>
              Take the sawtooth <Tex>{"f(x) = x"}</Tex> on <Tex>{"[-\\pi,\\pi)"}</Tex> with{" "}
              <Tex>{"b_n = \\tfrac{2}{n}(-1)^{n+1}"}</Tex>. Compute the energy directly:{" "}
              <Tex>{"\\lVert f\\rVert_2^2 = \\int_{-\\pi}^{\\pi} x^2\\,dx = \\tfrac{2\\pi^3}{3}"}</Tex>.
              Parseval computes it again through the coefficients:{" "}
              <Tex>{"\\pi\\sum_{n=1}^{\\infty} \\tfrac{4}{n^2}"}</Tex>. Equating:
            </p>
            <p>
              <Tex>{"\\frac{2\\pi^3}{3} = 4\\pi\\sum_{n=1}^{\\infty}\\frac{1}{n^2} \\quad\\Longrightarrow\\quad \\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}."}</Tex>
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Two channels to a numeric sum",
        content: (
          <>
            <strong>Parseval channel</strong>: equate <Tex>{"\\int f^2"}</Tex> with the coefficient
            energy — produces sums of <em>squares</em> like <Tex>{"\\sum 1/n^2"}</Tex>,{" "}
            <Tex>{"\\sum 1/n^4"}</Tex>. <strong>Pointwise channel</strong>: evaluate the series at a
            smart <Tex>{"x_0"}</Tex> where every <Tex>{"\\cos"}</Tex>/<Tex>{"\\sin"}</Tex> becomes{" "}
            <Tex>{"0"}</Tex> or <Tex>{"\\pm1"}</Tex> and use{" "}
            <Tex>{"S(x_0) = f(x_0)"}</Tex> (continuity) — produces first-power sums like{" "}
            <Tex>{"\\sum 1/(2k+1)^2"}</Tex> from the tutorial's triangular wave. Choose the channel by
            matching the power of <Tex>{"n"}</Tex> in the target sum against the coefficients.
          </>
        ),
      },
      { kind: "heading", text: "General period T — and the complex form" },
      {
        kind: "formula",
        tex: "a_0 + \\sum_{n=1}^{\\infty} a_n\\cos\\Big(\\tfrac{2\\pi}{T}nx\\Big) + b_n\\sin\\Big(\\tfrac{2\\pi}{T}nx\\Big), \\qquad a_0 = \\tfrac{1}{T}\\int_{-T/2}^{T/2} f, \\quad a_n = \\tfrac{2}{T}\\int_{-T/2}^{T/2} f(x)\\cos\\Big(\\tfrac{2\\pi}{T}nx\\Big)dx, \\quad b_n = \\tfrac{2}{T}\\int_{-T/2}^{T/2} f(x)\\sin\\Big(\\tfrac{2\\pi}{T}nx\\Big)dx",
        tag: "F.7",
        caption: (
          <>
            The Fourier series of a <Tex>{"T"}</Tex>-periodic <Tex>{"f"}</Tex>: harmonics at
            multiples of the fundamental frequency <Tex>{"\\tfrac{2\\pi}{T}"}</Tex>. All results —
            Riemann–Lebesgue, Bessel–Parseval, pointwise convergence — remain true for{" "}
            <Tex>{"T"}</Tex>-periodic functions.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\lVert f\\rVert_2^2 = \\int_{-T/2}^{T/2} f^2(x)\\,dx = T a_0^2 + \\frac{T}{2}\\sum_{n=1}^{\\infty}\\left(a_n^2 + b_n^2\\right)",
        tag: "F.8",
        caption: (
          <>
            The <strong>Parseval identity</strong> for period <Tex>{"T"}</Tex>. Check the consistency:{" "}
            <Tex>{"T = 2\\pi"}</Tex> gives back <Tex>{"2\\pi a_0^2 + \\pi\\sum(\\cdots)"}</Tex> of
            (F.4).
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The wrong-period import",
        content: (
          <>
            Using the <Tex>{"2\\pi"}</Tex>-formulas on a function of period <Tex>{"T \\ne 2\\pi"}</Tex>{" "}
            is the number-one error of this chapter. For a <Tex>{"1"}</Tex>-periodic function the
            harmonics are <Tex>{"\\sin(2\\pi kx)"}</Tex>, the coefficient integrals carry factor{" "}
            <Tex>{"2"}</Tex> (not <Tex>{"\\tfrac1\\pi"}</Tex>), and the energy factors are{" "}
            <Tex>{"T = 1"}</Tex> and <Tex>{"\\tfrac{T}{2} = \\tfrac12"}</Tex> (not{" "}
            <Tex>{"2\\pi"}</Tex> and <Tex>{"\\pi"}</Tex>). The tutorial's Ex 5 is built precisely to
            catch this.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Complex form (final comment of the deck)",
        content: (
          <>
            The same series can be written as{" "}
            <Tex>{"\\sum_{n=-\\infty}^{\\infty} c_n e^{inx}"}</Tex> with <Tex>{"c_0 = a_0"}</Tex>,{" "}
            <Tex>{"c_n = \\tfrac12(a_n - ib_n)"}</Tex> and{" "}
            <Tex>{"c_{-n} = \\overline{c_n}"}</Tex> for <Tex>{"n \\ge 1"}</Tex> — a direct consequence
            of <Tex>{"e^{it} = \\cos t + i\\sin t"}</Tex>. Same coefficients, tidier bookkeeping; know
            the dictionary in both directions.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-fou-cp5",
          difficulty: "medium",
          prompt: (
            <>
              The sawtooth <Tex>{"f(x) = x"}</Tex> on <Tex>{"[-\\pi,\\pi)"}</Tex> has{" "}
              <Tex>{"b_n = \\tfrac{2}{n}(-1)^{n+1}"}</Tex> and{" "}
              <Tex>{"\\lVert f\\rVert_2^2 = \\tfrac{2\\pi^3}{3}"}</Tex>. Parseval then gives{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} \\tfrac{1}{n^2} ="}</Tex>
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"\\tfrac{\\pi^2}{6}"}</Tex></> },
            { id: "B", content: <><Tex>{"\\tfrac{\\pi^2}{8}"}</Tex></> },
            { id: "C", content: <><Tex>{"\\tfrac{\\pi^3}{6}"}</Tex></> },
            { id: "D", content: <><Tex>{"\\tfrac{\\pi^2}{12}"}</Tex></> },
          ],
          correct: "A",
          explanation: (
            <>
              <Tex>{"\\tfrac{2\\pi^3}{3} = \\pi\\sum b_n^2 = 4\\pi\\sum \\tfrac{1}{n^2}"}</Tex>, so
              the sum is <Tex>{"\\tfrac{2\\pi^2}{12} = \\tfrac{\\pi^2}{6}"}</Tex> — answer A. B is
              the odd-harmonics-only sum <Tex>{"\\sum 1/(2k+1)^2"}</Tex>; C keeps a stray factor of{" "}
              <Tex>{"\\pi"}</Tex> (the answer must be dimensionless in <Tex>{"\\pi^2"}</Tex>, since
              both sides carry <Tex>{"\\pi^3"}</Tex>); D is the alternating sum{" "}
              <Tex>{"\\sum (-1)^{n+1}/n^2"}</Tex>.
            </>
          ),
          theory: <>Parseval equates a directly computed ∫f² with the coefficient energy — any famous sum of squares of coefficients falls out.</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-fou-cp6",
          difficulty: "medium",
          prompt: (
            <>
              <Tex>{"f(x) = \\tfrac{1}{\\pi}\\sin(2\\pi x)"}</Tex> is <Tex>{"1"}</Tex>-periodic (its
              only coefficient is <Tex>{"b_1 = \\tfrac1\\pi"}</Tex>). Its energy{" "}
              <Tex>{"\\lVert f\\rVert_2^2 = \\int_{-1/2}^{1/2} f^2"}</Tex> equals:
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"\\tfrac{1}{\\pi^2}"}</Tex></> },
            { id: "B", content: <><Tex>{"\\tfrac{1}{2\\pi^2}"}</Tex></> },
            { id: "C", content: <><Tex>{"\\tfrac{1}{\\pi}"}</Tex></> },
            { id: "D", content: <><Tex>{"\\tfrac{1}{2}"}</Tex></> },
          ],
          correct: "B",
          explanation: (
            <>
              Period <Tex>{"T = 1"}</Tex>, so Parseval (F.8) reads{" "}
              <Tex>{"\\lVert f\\rVert_2^2 = \\tfrac{T}{2}b_1^2 = \\tfrac12\\cdot\\tfrac{1}{\\pi^2}"}</Tex>{" "}
              — answer B. A forgets the <Tex>{"\\tfrac{T}{2}"}</Tex> factor entirely; C is what the{" "}
              <Tex>{"2\\pi"}</Tex>-period formula <Tex>{"\\pi b_1^2"}</Tex> would give — the
              wrong-period import; D drops <Tex>{"b_1^2"}</Tex>.
            </>
          ),
          theory: <>For period T the energy factors are T (constant) and T/2 (each harmonic) — recompute them before every Parseval, don't recycle 2π and π.</>,
        },
      },
    ],
  },
];

/* ================================================================== *
 *  PRACTICE — grounded in Ex_Fourierseries; answers verified against
 *  Sol_Fourier (tagged "tutorial" with the exercise number).
 * ================================================================== */
export const practice: Question[] = [
  /* ---------------- Ex 1 — structure of the series of |cos x| ------ */
  {
    id: "ma2-fou-q1",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The Fourier series of the function <Tex>{"f(x) = |\\cos(x)|"}</Tex> is equal to:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\sum_{n=1}^{\\infty} b_n\\sin(nx)"}</Tex>, <Tex>{"b_n \\in \\mathbb{R}"}</Tex></> },
      { id: "B", content: <><Tex>{"\\sum_{n=1}^{\\infty} a_n\\cos(2nx)"}</Tex>, <Tex>{"a_n \\in \\mathbb{R}"}</Tex></> },
      { id: "C", content: <><Tex>{"a_0 + \\sum_{n=1}^{\\infty} a_n\\cos(2nx)"}</Tex>, <Tex>{"a_n \\in \\mathbb{R}"}</Tex></> },
      { id: "D", content: <><Tex>{"\\sum_{n=1}^{\\infty} b_n\\sin(2nx)"}</Tex>, <Tex>{"b_n \\in \\mathbb{R}"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        Three structural observations, no integrals: <Tex>{"|\\cos x|"}</Tex> is <strong>even</strong>{" "}
        (all sines die — A and D out), it is <strong><Tex>{"\\pi"}</Tex>-periodic</strong> (only the
        doubled harmonics <Tex>{"\\cos(2nx)"}</Tex> survive), and its mean{" "}
        <Tex>{"a_0 = \\tfrac{1}{\\pi}\\int_{-\\pi/2}^{\\pi/2} |\\cos x|\\,dx = \\tfrac{2}{\\pi} \\ne 0"}</Tex>{" "}
        — so the constant must appear, which is exactly what B forgets. Answer C.
      </>
    ),
    theory: (
      <>
        Parity decides sin vs cos; the true period decides which harmonics appear; the sign of the mean
        decides whether a₀ stays. Structure questions never need the full coefficient integrals.
      </>
    ),
    source: "Ex_Fourierseries · Ex 1",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 2 — trigonometric polynomial of order 1 ----- */
  {
    id: "ma2-fou-q2",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The trigonometric polynomial of order 1 of the <Tex>{"2\\pi"}</Tex>-periodic function{" "}
        <Tex>{"f"}</Tex> with <Tex>{"f(x) = |x| + 2"}</Tex>, <Tex>{"x \\in [-\\pi,\\pi]"}</Tex>, is:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"S_1(x) = \\tfrac{\\pi}{2} - \\tfrac{4}{\\pi}\\cos x"}</Tex></> },
      { id: "B", content: <><Tex>{"S_1(x) = 2 + \\tfrac{\\pi}{2} - \\tfrac{4}{\\pi}\\cos x"}</Tex></> },
      { id: "C", content: <><Tex>{"S_1(x) = 2 + \\tfrac{\\pi}{2} - \\tfrac{4}{\\pi}\\sin x"}</Tex></> },
      { id: "D", content: <><Tex>{"S_1(x) = 2\\pi + \\tfrac{\\pi^2}{2} - 4\\cos x"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"f"}</Tex> is even, so <Tex>{"S_1 = a_0 + a_1\\cos x"}</Tex> — C's sine is impossible.{" "}
        <Tex>{"a_0 = \\tfrac{1}{2\\pi}\\int_{-\\pi}^{\\pi}(|x|+2)dx = \\tfrac{1}{\\pi}\\int_0^{\\pi}(x+2)dx = \\tfrac{\\pi}{2}+2"}</Tex>{" "}
        (A silently drops the +2 shift), and by parts{" "}
        <Tex>{"a_1 = \\tfrac{2}{\\pi}\\int_0^{\\pi}(x+2)\\cos x\\,dx = -\\tfrac{4}{\\pi}"}</Tex> (the
        constant 2 contributes nothing since <Tex>{"\\int_0^\\pi\\cos x\\,dx = 0"}</Tex>). Answer B. D
        forgot the normalizing factors <Tex>{"\\tfrac{1}{2\\pi}, \\tfrac1\\pi"}</Tex> — its terms are
        the raw integrals.
      </>
    ),
    theory: (
      <>
        A vertical shift f + c only moves a₀ by c: the oscillating coefficients never see constants.
        And S₁ is just a₀ + a₁cos x + b₁sin x — compute two coefficients, not the whole series.
      </>
    ),
    source: "Ex_Fourierseries · Ex 2",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 3(i) — ‖f‖₂ by Bessel–Parseval -------------- */
  {
    id: "ma2-fou-q3",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Let <Tex>{"f(x) = -1 + \\sum_{k=1}^{\\infty} \\tfrac{1}{5^k}\\sin(2kx)"}</Tex>. Then{" "}
        <Tex>{"\\lVert f\\rVert_2"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{7}{2}\\sqrt{\\tfrac{\\pi}{6}}"}</Tex></> },
      { id: "B", content: <><Tex>{"\\tfrac{5}{2}\\sqrt{\\tfrac{\\pi}{6}}"}</Tex></> },
      { id: "C", content: <><Tex>{"\\tfrac{49\\pi}{24}"}</Tex></> },
      { id: "D", content: <><Tex>{"\\sqrt{\\tfrac{\\pi}{24}}"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        Coefficients: <Tex>{"a_0 = -1"}</Tex>, <Tex>{"b_k = 5^{-k}"}</Tex> on harmonics{" "}
        <Tex>{"\\sin(2kx)"}</Tex>. Bessel–Parseval:{" "}
        <Tex>{"\\lVert f\\rVert_2^2 = 2\\pi(-1)^2 + \\pi\\sum_{k\\ge1} 5^{-2k} = 2\\pi + \\pi\\cdot\\tfrac{1/25}{1-1/25} = 2\\pi + \\tfrac{\\pi}{24} = \\tfrac{49\\pi}{24}"}</Tex>,
        hence{" "}
        <Tex>{"\\lVert f\\rVert_2 = 7\\sqrt{\\tfrac{\\pi}{24}} = \\tfrac72\\sqrt{\\tfrac{\\pi}{6}}"}</Tex>{" "}
        — answer A. C stops at <Tex>{"\\lVert f\\rVert_2^2"}</Tex> (forgot the root); B uses{" "}
        <Tex>{"\\pi a_0^2"}</Tex> instead of <Tex>{"2\\pi a_0^2"}</Tex> (the constant carries double
        weight in this convention); D throws the constant term away entirely.
      </>
    ),
    theory: (
      <>
        ‖f‖₂² = 2πa₀² + πΣ(aₙ²+bₙ²): the constant term weighs 2π, every harmonic π. Squaring
        coefficients qᵏ produces a geometric series in q² — then finish with the square root.
      </>
    ),
    source: "Ex_Fourierseries · Ex 3",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 3(ii) — full-period integral ---------------- */
  {
    id: "ma2-fou-q4",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        For the same <Tex>{"f(x) = -1 + \\sum_{k=1}^{\\infty} \\tfrac{1}{5^k}\\sin(2kx)"}</Tex>,
        compute <Tex>{"\\int_0^{2\\pi} f(x)\\,dx"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"0"}</Tex></> },
      { id: "B", content: <><Tex>{"-1"}</Tex></> },
      { id: "C", content: <><Tex>{"-\\pi"}</Tex></> },
      { id: "D", content: <><Tex>{"-2\\pi"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        Over a full period every sine integrates to zero, so only the constant survives:{" "}
        <Tex>{"\\int_0^{2\\pi} f = \\int_{-\\pi}^{\\pi} f = 2\\pi a_0 = -2\\pi"}</Tex> — answer D. A
        forgets that the mean here is not zero; B returns <Tex>{"a_0"}</Tex> itself, forgetting to
        multiply by the interval length <Tex>{"2\\pi"}</Tex>; C uses length <Tex>{"\\pi"}</Tex>.
      </>
    ),
    theory: <>∫ over one full period = 2πa₀ (period 2π): the oscillating part of a Fourier series never contributes to the mean.</>,
    source: "Ex_Fourierseries · Ex 3",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 3(iii) — absent harmonic -------------------- */
  {
    id: "ma2-fou-q5",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Still with <Tex>{"f(x) = -1 + \\sum_{k=1}^{\\infty} \\tfrac{1}{5^k}\\sin(2kx)"}</Tex>,
        compute <Tex>{"\\int_{-\\pi}^{\\pi} f(x)\\sin(x)\\,dx"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{\\pi}{5}"}</Tex></> },
      { id: "B", content: <><Tex>{"0"}</Tex></> },
      { id: "C", content: <><Tex>{"\\tfrac{2\\pi}{5}"}</Tex></> },
      { id: "D", content: <><Tex>{"-2\\pi"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"\\int_{-\\pi}^{\\pi} f\\sin(nx)\\,dx = \\pi b_n"}</Tex>, and <Tex>{"\\sin(x)"}</Tex> is
        the harmonic <Tex>{"n = 1"}</Tex> — an <em>odd</em> harmonic, absent from a series that only
        contains <Tex>{"\\sin(2kx)"}</Tex>. Orthogonality gives 0 — answer B. A treats{" "}
        <Tex>{"\\sin x"}</Tex> as the <Tex>{"k=1"}</Tex> term (that one is <Tex>{"\\sin 2x"}</Tex>!);
        C doubles that error; D answers a different question (<Tex>{"\\int f"}</Tex>). The constant{" "}
        <Tex>{"-1"}</Tex> also contributes nothing since <Tex>{"\\int_{-\\pi}^{\\pi}\\sin x = 0"}</Tex>.
      </>
    ),
    theory: <>Integrating f against a harmonic that does not appear in its series gives 0 — orthogonality does all the work.</>,
    source: "Ex_Fourierseries · Ex 3",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 3(iv) — present harmonic, index match ------- */
  {
    id: "ma2-fou-q6",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        And <Tex>{"\\int_0^{2\\pi} f(x)\\sin(6x)\\,dx"}</Tex> for the same <Tex>{"f"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{\\pi}{125}"}</Tex></> },
      { id: "B", content: <><Tex>{"\\tfrac{\\pi}{5^6}"}</Tex></> },
      { id: "C", content: <><Tex>{"0"}</Tex></> },
      { id: "D", content: <><Tex>{"\\tfrac{2\\pi}{125}"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        Shift to the symmetric window (<Tex>{"\\int_0^{2\\pi} = \\int_{-\\pi}^{\\pi}"}</Tex> by
        periodicity) and match indices: <Tex>{"\\sin(6x) = \\sin(2kx)"}</Tex> with{" "}
        <Tex>{"k = 3"}</Tex>, whose coefficient is <Tex>{"5^{-3}"}</Tex>. So the integral is{" "}
        <Tex>{"\\pi b_3 = \\tfrac{\\pi}{125}"}</Tex> — answer A. B plugs <Tex>{"n = 6"}</Tex> into{" "}
        <Tex>{"5^{-k}"}</Tex> without converting <Tex>{"n = 2k"}</Tex>; C is the reflex “6 isn't in
        the series” — but the even harmonic 6 <em>is</em> there; D uses <Tex>{"2\\pi"}</Tex> instead
        of <Tex>{"\\pi"}</Tex> as the orthogonality constant.
      </>
    ),
    theory: (
      <>
        ∫f sin(mx) over a period = π × (coefficient of sin(mx)). When the series runs over sin(2kx),
        first solve m = 2k for k, then read the coefficient — index matching is the whole exercise.
      </>
    ),
    source: "Ex_Fourierseries · Ex 3",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 4(ii) — a₀ of the triangular wave ----------- */
  {
    id: "ma2-fou-q7",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        Let <Tex>{"f"}</Tex> be the even, <Tex>{"6"}</Tex>-periodic function with{" "}
        <Tex>{"f(x) = 6-2x"}</Tex> on <Tex>{"[0,3]"}</Tex>. Its Fourier coefficient{" "}
        <Tex>{"a_0"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{3}{2}"}</Tex></> },
      { id: "B", content: <><Tex>{"9"}</Tex></> },
      { id: "C", content: <><Tex>{"3"}</Tex></> },
      { id: "D", content: <><Tex>{"6"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        With period <Tex>{"T=6"}</Tex>:{" "}
        <Tex>{"a_0 = \\tfrac{1}{6}\\int_{-3}^{3} f = \\tfrac{2}{6}\\int_0^3 (6-2x)dx = \\tfrac13\\left[6x - x^2\\right]_0^3 = 3"}</Tex>{" "}
        — answer C. Sanity check: the triangular wave runs between 0 and 6, so its mean must be 3. A
        integrates over half the period but divides by the whole one; B is the raw{" "}
        <Tex>{"\\int_0^3 f = 9"}</Tex> with no normalization; D confuses the mean with the peak{" "}
        <Tex>{"f(0) = 6"}</Tex>.
      </>
    ),
    theory: <>a₀ = (1/T)∫ over one period = the mean value of f — for an even function, (2/T)∫ over the half period.</>,
    source: "Ex_Fourierseries · Ex 4",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 4(iii) — evaluating the series -------------- */
  {
    id: "ma2-fou-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For the same triangular wave (<Tex>{"f"}</Tex> even, 6-periodic, <Tex>{"f(x) = 6-2x"}</Tex> on{" "}
        <Tex>{"[0,3]"}</Tex>), the value of its Fourier series at <Tex>{"x = 6"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"-6"}</Tex></> },
      { id: "B", content: <><Tex>{"0"}</Tex></> },
      { id: "C", content: <><Tex>{"3"}</Tex></> },
      { id: "D", content: <><Tex>{"6"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"f"}</Tex> is continuous (a triangular wave — the even reflection glues seamlessly and{" "}
        <Tex>{"f(3)=0"}</Tex> matches the next tooth), so the series equals <Tex>{"f"}</Tex>{" "}
        everywhere: <Tex>{"S(6) = f(6) = f(0) = 6"}</Tex> by 6-periodicity — answer D. A plugs{" "}
        <Tex>{"x=6"}</Tex> into <Tex>{"6-2x"}</Tex>, but that formula only lives on{" "}
        <Tex>{"[0,3]"}</Tex>: reduce mod 6 first! B applies a jump-average reflex where there is no
        jump; C confuses the value with the mean <Tex>{"a_0 = 3"}</Tex>.
      </>
    ),
    theory: (
      <>
        To evaluate a periodic function: reduce the point modulo T into the defining window, then
        apply the formula. Continuity ⇒ series = f at every point, no averaging needed.
      </>
    ),
    source: "Ex_Fourierseries · Ex 4",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 4(iv) — numeric sum from S(0) --------------- */
  {
    id: "ma2-fou-q9",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The triangular wave above has Fourier series{" "}
        <Tex>{"3 + \\tfrac{24}{\\pi^2}\\sum_{k=0}^{\\infty} \\tfrac{1}{(2k+1)^2}\\cos\\big(\\tfrac{(2k+1)\\pi x}{3}\\big)"}</Tex>.
        Then <Tex>{"\\sum_{k=1}^{\\infty} \\tfrac{1}{(2k+1)^2}"}</Tex> (starting from{" "}
        <Tex>{"k=1"}</Tex>) equals:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{\\pi^2}{8} - 1"}</Tex></> },
      { id: "B", content: <><Tex>{"\\tfrac{\\pi^2}{8}"}</Tex></> },
      { id: "C", content: <><Tex>{"\\tfrac{\\pi^2}{6}"}</Tex></> },
      { id: "D", content: <><Tex>{"\\tfrac{\\pi^2}{24}"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        Evaluate at the smart point <Tex>{"x=0"}</Tex>, where every cosine is 1 and continuity gives{" "}
        <Tex>{"S(0) = f(0) = 6"}</Tex>:{" "}
        <Tex>{"6 = 3 + \\tfrac{24}{\\pi^2}\\sum_{k=0}^{\\infty}\\tfrac{1}{(2k+1)^2}"}</Tex>, so the
        sum from <Tex>{"k=0"}</Tex> is <Tex>{"\\tfrac{\\pi^2}{8}"}</Tex> — that is B, the trap: the
        question starts at <Tex>{"k=1"}</Tex>, so subtract the <Tex>{"k=0"}</Tex> term (which is 1):{" "}
        <Tex>{"\\tfrac{\\pi^2}{8} - 1"}</Tex>, answer A. C is the sum over <em>all</em> integers{" "}
        <Tex>{"\\sum 1/n^2"}</Tex>; D is its even-harmonics complement{" "}
        <Tex>{"\\sum 1/(2k)^2 = \\tfrac{\\pi^2}{24}"}</Tex>.
      </>
    ),
    theory: (
      <>
        Evaluate a computed series at a point where cos/sin collapse to ±1 or 0 and the pointwise
        theorem prices the left side — then mind the starting index before boxing the answer.
      </>
    ),
    source: "Ex_Fourierseries · Ex 4",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 5(ii) — coefficients of the 1-periodic saw -- */
  {
    id: "ma2-fou-q10",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Let <Tex>{"f"}</Tex> be <Tex>{"1"}</Tex>-periodic with <Tex>{"f(x) = x"}</Tex> on{" "}
        <Tex>{"[0,\\tfrac12]"}</Tex> and <Tex>{"f(x) = x-1"}</Tex> on <Tex>{"(\\tfrac12,1]"}</Tex>.
        Its Fourier series is <Tex>{"\\sum_{k=1}^{\\infty} b_k\\sin(2\\pi kx)"}</Tex> with{" "}
        <Tex>{"b_k ="}</Tex>
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{2}{k}(-1)^{k+1}"}</Tex></> },
      { id: "B", content: <><Tex>{"\\tfrac{(-1)^{k}}{\\pi k}"}</Tex></> },
      { id: "C", content: <><Tex>{"\\tfrac{1}{\\pi k}"}</Tex></> },
      { id: "D", content: <><Tex>{"\\tfrac{(-1)^{k+1}}{\\pi k}"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        On <Tex>{"(-\\tfrac12,\\tfrac12]"}</Tex> the function is just <Tex>{"y = x"}</Tex>: odd, so
        pure sine series with <Tex>{"T=1"}</Tex> harmonics <Tex>{"\\sin(2\\pi kx)"}</Tex>. By parts:{" "}
        <Tex>{"b_k = 2\\int_{-1/2}^{1/2} x\\sin(2\\pi kx)dx = 4\\int_0^{1/2} x\\sin(2\\pi kx)dx = -\\tfrac{\\cos(\\pi k)}{\\pi k} = \\tfrac{(-1)^{k+1}}{\\pi k}"}</Tex>{" "}
        — answer D. A is the coefficient of the <Tex>{"2\\pi"}</Tex>-periodic sawtooth{" "}
        <Tex>{"f(x)=x"}</Tex> on <Tex>{"[-\\pi,\\pi)"}</Tex> — the wrong-period import; B has the sign
        of <Tex>{"\\cos(\\pi k)"}</Tex> unflipped; C loses the alternation entirely.
      </>
    ),
    theory: (
      <>
        For period T the coefficient integral is (2/T)∫ f sin(2πkx/T); shifting the defining window by
        a period to (−T/2, T/2] often reveals the symmetry that kills half the coefficients.
      </>
    ),
    source: "Ex_Fourierseries · Ex 5",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 5(iii) — sum at the jump -------------------- */
  {
    id: "ma2-fou-q11",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        For that same 1-periodic sawtooth, the sum of its Fourier series at{" "}
        <Tex>{"x = \\tfrac12"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac12"}</Tex></> },
      { id: "B", content: <><Tex>{"-\\tfrac12"}</Tex></> },
      { id: "C", content: <><Tex>{"0"}</Tex></> },
      { id: "D", content: <><Tex>{"1"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"x = \\tfrac12"}</Tex> is a jump: from the left <Tex>{"f \\to \\tfrac12"}</Tex>, from
        the right (branch <Tex>{"x-1"}</Tex>) <Tex>{"f \\to -\\tfrac12"}</Tex>. The series converges
        to the average <Tex>{"\\tfrac12(\\tfrac12 - \\tfrac12) = 0"}</Tex> — answer C, confirmed
        termwise since every <Tex>{"\\sin(\\pi k) = 0"}</Tex>. A is the left limit (and the assigned
        value <Tex>{"f(\\tfrac12)"}</Tex> — which the series ignores!), B the right limit, D their
        distance rather than their midpoint.
      </>
    ),
    theory: <>At a jump the series takes the midpoint of the two one-sided limits — the value f assigns at the point is irrelevant.</>,
    source: "Ex_Fourierseries · Ex 5",
    tags: ["tutorial"],
  },
  /* ---------------- Ex 5(v) — ‖S₂‖₂ with period T = 1 -------------- */
  {
    id: "ma2-fou-q12",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Still for the 1-periodic sawtooth (<Tex>{"b_k = \\tfrac{(-1)^{k+1}}{\\pi k}"}</Tex>), the
        partial sum <Tex>{"S_2(x) = \\tfrac1\\pi\\sin(2\\pi x) - \\tfrac{1}{2\\pi}\\sin(4\\pi x)"}</Tex>{" "}
        has quadratic norm <Tex>{"\\lVert S_2\\rVert_2 ="}</Tex>
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac12\\sqrt{\\tfrac{5}{\\pi}}"}</Tex></> },
      { id: "B", content: <><Tex>{"\\tfrac{1}{2\\pi}\\sqrt{\\tfrac{5}{2}}"}</Tex></> },
      { id: "C", content: <><Tex>{"\\tfrac{5}{8\\pi^2}"}</Tex></> },
      { id: "D", content: <><Tex>{"\\tfrac{1}{\\pi}\\sqrt{\\tfrac{5}{2}}"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        Period <Tex>{"T = 1"}</Tex>, so the energy formula is{" "}
        <Tex>{"\\lVert S_2\\rVert_2^2 = \\tfrac{T}{2}\\sum_{k=1}^{2} b_k^2 = \\tfrac12\\cdot\\tfrac{1}{\\pi^2}\\big(1 + \\tfrac14\\big) = \\tfrac{5}{8\\pi^2}"}</Tex>,
        hence{" "}
        <Tex>{"\\lVert S_2\\rVert_2 = \\tfrac{1}{2\\pi}\\sqrt{\\tfrac52}"}</Tex> — answer B. A comes
        from recycling the <Tex>{"2\\pi"}</Tex>-period formula <Tex>{"\\pi\\sum b_k^2"}</Tex> — the
        wrong-period trap this exercise was built for; C stops at the squared norm; D loses the{" "}
        <Tex>{"\\tfrac{T}{2} = \\tfrac12"}</Tex> factor.
      </>
    ),
    theory: <>Parseval with period T: ‖f‖₂² = Ta₀² + (T/2)Σ(aₖ²+bₖ²). Recompute the two prefactors from T before plugging anything in.</>,
    source: "Ex_Fourierseries · Ex 5",
    tags: ["tutorial"],
  },
  /* ---------------- Theory — L² vs pointwise ----------------------- */
  {
    id: "ma2-fou-q13",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        <Tex>{"f"}</Tex> is <Tex>{"2\\pi"}</Tex>-periodic with <Tex>{"\\lVert f\\rVert_2 < \\infty"}</Tex>{" "}
        and <em>no further regularity</em>. Bessel–Parseval guarantees{" "}
        <Tex>{"\\lVert f - S_N\\rVert_2 \\to 0"}</Tex>. Which conclusion is correct?
      </>
    ),
    options: [
      { id: "A", content: <>Hence <Tex>{"S_N(x) \\to f(x)"}</Tex> at every point <Tex>{"x"}</Tex>.</> },
      { id: "B", content: <>Hence <Tex>{"S_N \\to f"}</Tex> uniformly, i.e. in <Tex>{"\\lVert\\cdot\\rVert_\\infty"}</Tex>.</> },
      { id: "C", content: <>The Fourier coefficients of such an <Tex>{"f"}</Tex> need not tend to 0.</> },
      {
        id: "D",
        content: (
          <>
            Convergence in energy does not by itself give pointwise convergence; for that, the
            course's theorem asks <Tex>{"f"}</Tex> to be piecewise regular.
          </>
        ),
      },
    ],
    correct: "D",
    explanation: (
      <>
        The deck flags exactly this with a warning sign: <Tex>{"\\lVert\\cdot\\rVert_2"}</Tex>{" "}
        convergence is an averaged statement and does <em>not</em> imply <Tex>{"f = S"}</Tex> point by
        point — pointwise convergence is a separate theorem requiring piecewise regularity: answer D,
        and A is precisely the unwarranted upgrade. B is even stronger than A (the sup norm dominates{" "}
        <Tex>{"\\lVert\\cdot\\rVert_2"}</Tex>, not vice versa). C contradicts Riemann–Lebesgue:{" "}
        <Tex>{"\\sum(a_n^2+b_n^2) < \\infty"}</Tex> forces <Tex>{"a_n, b_n \\to 0"}</Tex>.
      </>
    ),
    theory: (
      <>
        Keep the three convergence levels straight — energy (free, from ‖f‖₂ finite), pointwise (needs
        piecewise regular), uniform (needs even more) — and never promote one to another for free.
      </>
    ),
  },
  /* ---------------- Appello-style Plancherel drill ----------------- */
  {
    id: "ma2-fou-q14",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        <Tex>{"f"}</Tex> is <Tex>{"2\\pi"}</Tex>-periodic with <Tex>{"\\lVert f\\rVert_2 < \\infty"}</Tex>{" "}
        and Fourier series{" "}
        <Tex>{"S(x) = 1 + \\sum_{n=1}^{\\infty} \\tfrac{1}{2^n}\\sin(nx)"}</Tex>. Then{" "}
        <Tex>{"\\lVert f\\rVert_2^2 ="}</Tex>
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\tfrac{7\\pi}{3}"}</Tex></> },
      { id: "B", content: <><Tex>{"\\tfrac{\\pi}{3}"}</Tex></> },
      { id: "C", content: <><Tex>{"3\\pi"}</Tex></> },
      { id: "D", content: <><Tex>{"\\tfrac{10\\pi}{3}"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"a_0 = 1"}</Tex>, <Tex>{"b_n = 2^{-n}"}</Tex>, so{" "}
        <Tex>{"\\lVert f\\rVert_2^2 = 2\\pi\\cdot 1 + \\pi\\sum_{n\\ge1} 4^{-n} = 2\\pi + \\pi\\cdot\\tfrac{1/4}{3/4} = 2\\pi + \\tfrac{\\pi}{3} = \\tfrac{7\\pi}{3}"}</Tex>{" "}
        — answer A. B throws away the constant's <Tex>{"2\\pi a_0^2"}</Tex>; C forgets to square the
        coefficients (<Tex>{"\\sum 2^{-n} = 1"}</Tex> gives <Tex>{"3\\pi"}</Tex>); D sums the
        geometric series from <Tex>{"n=0"}</Tex> (<Tex>{"\\tfrac43"}</Tex>) — the index trap.
      </>
    ),
    theory: (
      <>
        The appello recipe: square each coefficient (qⁿ → q²ⁿ), sum the geometric/telescoping series
        from the correct starting index, add 2πa₀², and only take a square root if the question asks
        for ‖f‖₂ rather than ‖f‖₂².
      </>
    ),
  },
];

/* ================================================================== *
 *  EXAM — worked walkthroughs of the tutorial sheet's big exercises,
 *  following Sol_Fourier's method step by step.
 * ================================================================== */
export const exam: ExamProblem[] = [
  {
    id: "ma2-fou-e1",
    title: "The triangular wave, end to end (coefficients, values, a numeric sum)",
    meta: "Ex_Fourierseries · Ex 4 · tutorial walkthrough",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"f"}</Tex> be the even, <Tex>{"6"}</Tex>-periodic function such that{" "}
        <Tex>{"f(x) = 6-2x"}</Tex> for <Tex>{"x \\in [0,3]"}</Tex>. (i) Draw the graph of{" "}
        <Tex>{"f"}</Tex>; (ii) knowing that its Fourier series equals{" "}
        <Tex>{"a_0 + \\tfrac{24}{\\pi^2}\\sum_{k=0}^{\\infty} \\tfrac{1}{(2k+1)^2}\\cos\\big(\\tfrac{(2k+1)\\pi x}{3}\\big) + \\sum_{k=1}^{\\infty} b_k\\sin\\big(\\tfrac{k\\pi}{3}x\\big)"}</Tex>,
        compute <Tex>{"a_0, a_n, b_n"}</Tex>; (iii) compute the value of the series at{" "}
        <Tex>{"x=1"}</Tex> and <Tex>{"x=6"}</Tex>; (iv) compute{" "}
        <Tex>{"\\sum_{k=1}^{\\infty} \\tfrac{1}{(2k+1)^2}"}</Tex>.
      </>
    ),
    given: (
      <>
        Period <Tex>{"T = 6"}</Tex>, so the fundamental frequency is{" "}
        <Tex>{"\\tfrac{2\\pi}{T} = \\tfrac{\\pi}{3}"}</Tex>: the harmonics are{" "}
        <Tex>{"\\cos\\big(\\tfrac{n\\pi}{3}x\\big), \\sin\\big(\\tfrac{n\\pi}{3}x\\big)"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "(i) See the graph: a continuous triangular wave",
        content: (
          <>
            On <Tex>{"[0,3]"}</Tex> the graph descends from <Tex>{"f(0)=6"}</Tex> to{" "}
            <Tex>{"f(3)=0"}</Tex>; evenness mirrors it onto <Tex>{"[-3,0]"}</Tex>, and 6-periodicity
            repeats the tent forever: peaks of height 6 at <Tex>{"x \\in 6\\mathbb{Z}"}</Tex>, zeros at{" "}
            <Tex>{"x = 3 + 6\\mathbb{Z}"}</Tex>. Crucially the pieces glue with <em>no jumps</em>:{" "}
            <Tex>{"f"}</Tex> is continuous on <Tex>{"\\mathbb{R}"}</Tex> and piecewise regular
            (corners only), so the pointwise theorem will give <Tex>{"S = f"}</Tex> everywhere.
          </>
        ),
      },
      {
        title: "(ii) Read aₙ and bₙ off the given series, by evenness",
        content: (
          <>
            <Tex>{"f"}</Tex> even <Tex>{"\\Rightarrow b_n = 0"}</Tex> for all <Tex>{"n \\ge 1"}</Tex>{" "}
            (consistent with the sine sum being present only formally). Comparing the cosine sum with{" "}
            <Tex>{"\\sum_n a_n\\cos\\big(\\tfrac{n\\pi}{3}x\\big)"}</Tex>: the harmonics present are
            the odd ones <Tex>{"n = 2k+1"}</Tex>, so{" "}
            <Tex>{"a_n = \\tfrac{24}{\\pi^2 n^2}"}</Tex> for <Tex>{"n"}</Tex> odd and{" "}
            <Tex>{"a_n = 0"}</Tex> for <Tex>{"n"}</Tex> even, <Tex>{"n \\ge 2"}</Tex>.
          </>
        ),
      },
      {
        title: "(ii) Compute a₀ — the mean over one period",
        content: (
          <>
            <Tex>{"a_0 = \\tfrac{1}{6}\\int_{-3}^{3} f(x)dx = \\tfrac{1}{3}\\int_0^3 (6-2x)dx = \\tfrac13\\big[6x - x^2\\big]_0^3 = \\tfrac13(18-9) = 3"}</Tex>.
            Geometric sanity check: a tent oscillating between 0 and 6 has mean 3.
          </>
        ),
      },
      {
        title: "(iii) Evaluate the series through continuity",
        content: (
          <>
            Since <Tex>{"f"}</Tex> is continuous and piecewise regular,{" "}
            <Tex>{"S(x_0) = \\lim_N S_N(x_0) = f(x_0)"}</Tex> for every <Tex>{"x_0"}</Tex>. Hence{" "}
            <Tex>{"S(1) = f(1) = 6 - 2 = 4"}</Tex>, and{" "}
            <Tex>{"S(6) = f(6) = f(0) = 6"}</Tex> — reduce modulo the period <em>before</em> touching
            the formula <Tex>{"6-2x"}</Tex>, which only holds on <Tex>{"[0,3]"}</Tex> (plugging in{" "}
            <Tex>{"x=6"}</Tex> raw would give the nonsense <Tex>{"-6"}</Tex>).
          </>
        ),
      },
      {
        title: "(iv) Harvest the numeric sum at the smart point x = 0",
        content: (
          <>
            At <Tex>{"x=0"}</Tex> every cosine equals 1:{" "}
            <Tex>{"6 = f(0) = S(0) = 3 + \\tfrac{24}{\\pi^2}\\sum_{k=0}^{\\infty}\\tfrac{1}{(2k+1)^2}"}</Tex>,
            so <Tex>{"\\sum_{k=0}^{\\infty}\\tfrac{1}{(2k+1)^2} = \\tfrac{\\pi^2}{8}"}</Tex>. The
            requested sum starts at <Tex>{"k=1"}</Tex>: subtract the <Tex>{"k=0"}</Tex> term, equal to
            1, to get{" "}
            <Tex>{"\\sum_{k=1}^{\\infty}\\tfrac{1}{(2k+1)^2} = \\tfrac{\\pi^2}{8} - 1"}</Tex>.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"a_0 = 3"}</Tex>; <Tex>{"a_n = \\tfrac{24}{\\pi^2 n^2}"}</Tex> for odd{" "}
        <Tex>{"n"}</Tex>, <Tex>{"0"}</Tex> for even <Tex>{"n"}</Tex>; <Tex>{"b_n = 0"}</Tex>;{" "}
        <Tex>{"S(1) = 4"}</Tex>, <Tex>{"S(6) = 6"}</Tex>;{" "}
        <Tex>{"\\sum_{k\\ge1} \\tfrac{1}{(2k+1)^2} = \\tfrac{\\pi^2}{8} - 1"}</Tex>.
      </>
    ),
    tips: (
      <>
        Three recurring traps, all tested here: evaluate periodic functions by reducing{" "}
        <Tex>{"x"}</Tex> mod <Tex>{"T"}</Tex> first; check continuity before quoting the pointwise
        theorem (no jump → no averaging); and watch the starting index when a numeric sum is
        harvested — the <Tex>{"k=0"}</Tex> term is where the last mark hides.
      </>
    ),
  },
  {
    id: "ma2-fou-e2",
    title: "The 1-periodic sawtooth: coefficients, jump values and energy",
    meta: "Ex_Fourierseries · Ex 5 · tutorial walkthrough",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"f"}</Tex> be the <Tex>{"1"}</Tex>-periodic function with{" "}
        <Tex>{"f(x) = x"}</Tex> on <Tex>{"[0,\\tfrac12]"}</Tex> and <Tex>{"f(x) = x-1"}</Tex> on{" "}
        <Tex>{"(\\tfrac12, 1]"}</Tex>. (i) Draw the graph; (ii) compute the Fourier series of{" "}
        <Tex>{"f"}</Tex>; (iii) find the sum of the series at <Tex>{"x = \\tfrac12"}</Tex>; (iv) find{" "}
        <Tex>{"\\lim_{N\\to\\infty} S_N(x)"}</Tex> for <Tex>{"x \\in [-\\tfrac12, 1]"}</Tex>; (v)
        write <Tex>{"S_2"}</Tex> and compute <Tex>{"\\lVert S_2\\rVert_2"}</Tex>.
      </>
    ),
    given: (
      <>
        Period <Tex>{"T = 1"}</Tex>: harmonics <Tex>{"\\sin(2\\pi kx), \\cos(2\\pi kx)"}</Tex>,
        coefficient factor <Tex>{"\\tfrac{2}{T} = 2"}</Tex>, energy factors <Tex>{"T = 1"}</Tex> and{" "}
        <Tex>{"\\tfrac{T}{2} = \\tfrac12"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "(i) Shift the window and see the symmetry",
        content: (
          <>
            Moving the branch on <Tex>{"(\\tfrac12, 1]"}</Tex> left by one period shows that on{" "}
            <Tex>{"(-\\tfrac12, \\tfrac12]"}</Tex> the function is simply <Tex>{"y = x"}</Tex>: a
            sawtooth with jumps of height 1 at every half-integer{" "}
            <Tex>{"x = \\tfrac{2k+1}{2}"}</Tex>, continuous elsewhere and piecewise regular. On the
            symmetric window it is <strong>odd</strong>, so{" "}
            <Tex>{"a_n = 0"}</Tex> for all <Tex>{"n \\ge 0"}</Tex>: a pure sine series{" "}
            <Tex>{"S(x) = \\sum_{k\\ge1} b_k\\sin(2\\pi kx)"}</Tex>.
          </>
        ),
      },
      {
        title: "(ii) Coefficients by integration by parts",
        content: (
          <>
            <Tex>{"b_k = 2\\int_{-1/2}^{1/2} f(x)\\sin(2\\pi kx)dx = 4\\int_0^{1/2} x\\sin(2\\pi kx)dx"}</Tex>{" "}
            (even integrand). Parts:{" "}
            <Tex>{"= \\tfrac{4}{2\\pi k}\\Big(-x\\cos(2\\pi kx)\\Big|_0^{1/2} + \\int_0^{1/2}\\cos(2\\pi kx)dx\\Big) = \\tfrac{2}{\\pi k}\\cdot\\tfrac12\\big(-\\cos(\\pi k)\\big) = \\tfrac{(-1)^{k+1}}{\\pi k}"}</Tex>,
            using <Tex>{"\\cos(\\pi k) = (-1)^k"}</Tex> and{" "}
            <Tex>{"\\int_0^{1/2}\\cos(2\\pi kx)dx = \\tfrac{\\sin(\\pi k)}{2\\pi k} = 0"}</Tex>. So{" "}
            <Tex>{"S(x) = \\sum_{k=1}^{\\infty} \\tfrac{(-1)^{k+1}}{\\pi k}\\sin(2\\pi kx)"}</Tex>.
          </>
        ),
      },
      {
        title: "(iii) Sum at the jump x = 1/2",
        content: (
          <>
            <Tex>{"x = \\tfrac12"}</Tex> is a discontinuity: left limit <Tex>{"\\tfrac12"}</Tex>,
            right limit <Tex>{"-\\tfrac12"}</Tex> (the next branch). The pointwise theorem gives the
            average:{" "}
            <Tex>{"S\\big(\\tfrac12\\big) = \\tfrac12\\big(\\tfrac12 + (-\\tfrac12)\\big) = 0"}</Tex>.
            Consistency check: every term <Tex>{"\\sin(\\pi k) = 0"}</Tex>, so the series is literally{" "}
            <Tex>{"0"}</Tex> there — while the assigned value was <Tex>{"f(\\tfrac12) = \\tfrac12"}</Tex>:
            the series overrules it.
          </>
        ),
      },
      {
        title: "(iv) The pointwise limit on [−1/2, 1]",
        content: (
          <>
            At continuity points the series reproduces <Tex>{"f"}</Tex>; at the two jumps it takes the
            midpoint 0:{" "}
            <Tex>{"\\lim_N S_N(x) = x"}</Tex> for <Tex>{"x \\in (-\\tfrac12, \\tfrac12)"}</Tex>,{" "}
            <Tex>{"= x-1"}</Tex> for <Tex>{"x \\in (\\tfrac12, 1]"}</Tex>, and{" "}
            <Tex>{"= 0"}</Tex> at <Tex>{"x = \\pm\\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "(v) S₂ and its energy — with the T = 1 Parseval",
        content: (
          <>
            <Tex>{"S_2(x) = b_1\\sin(2\\pi x) + b_2\\sin(4\\pi x) = \\tfrac{1}{\\pi}\\sin(2\\pi x) - \\tfrac{1}{2\\pi}\\sin(4\\pi x)"}</Tex>.
            Energy with period-1 weights:{" "}
            <Tex>{"\\lVert S_2\\rVert_2^2 = \\tfrac{T}{2}\\big(b_1^2 + b_2^2\\big) = \\tfrac12\\cdot\\tfrac{1}{\\pi^2}\\big(1 + \\tfrac14\\big) = \\tfrac{5}{8\\pi^2}"}</Tex>,
            hence{" "}
            <Tex>{"\\lVert S_2\\rVert_2 = \\tfrac{1}{2\\pi}\\sqrt{\\tfrac52}"}</Tex>. Using the{" "}
            <Tex>{"2\\pi"}</Tex>-period weight <Tex>{"\\pi"}</Tex> here is the error the exercise is
            designed to catch.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"S(x) = \\sum_{k\\ge1} \\tfrac{(-1)^{k+1}}{\\pi k}\\sin(2\\pi kx)"}</Tex>;{" "}
        <Tex>{"S(\\tfrac12) = 0"}</Tex>; the limit is <Tex>{"x"}</Tex>, resp. <Tex>{"x-1"}</Tex>, on
        the two open branches and <Tex>{"0"}</Tex> at <Tex>{"x = \\pm\\tfrac12"}</Tex>;{" "}
        <Tex>{"S_2(x) = \\tfrac1\\pi\\sin(2\\pi x) - \\tfrac{1}{2\\pi}\\sin(4\\pi x)"}</Tex> with{" "}
        <Tex>{"\\lVert S_2\\rVert_2 = \\tfrac{1}{2\\pi}\\sqrt{\\tfrac52}"}</Tex>.
      </>
    ),
    tips: (
      <>
        Period <Tex>{"T \\ne 2\\pi"}</Tex> changes <em>everything</em>: frequencies{" "}
        <Tex>{"\\tfrac{2\\pi}{T}k"}</Tex>, coefficient factor <Tex>{"\\tfrac{2}{T}"}</Tex>, Parseval
        weights <Tex>{"T"}</Tex> and <Tex>{"\\tfrac{T}{2}"}</Tex>. Also: shifting the defining window
        to <Tex>{"(-\\tfrac T2, \\tfrac T2]"}</Tex> is what reveals oddness — symmetry hides in the
        wrong window.
      </>
    ),
  },
];
