import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { PartialSumsSim } from "../sims/PartialSumsSim";

export const MODULE = "Series & power series";

/* ================= Test-picker table for the criteria lesson ========== */
const TD = "border-b border-[var(--color-line)] p-2 text-xs";
const TDM = TD + " text-[var(--color-ink)]";

function TestTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Terms look like</th>
            <th className="border-b border-[var(--color-line)] p-2">Reach for</th>
            <th className="border-b border-[var(--color-line)] p-2">Example</th>
            <th className="border-b border-[var(--color-line)] p-2">Verdict</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={TD}>powers and roots of n</td>
            <td className={TD + " font-semibold"}>asymptotic comparison</td>
            <td className={TDM}>
              <Tex>{"\\tfrac{n+1}{n^3+2} \\sim \\tfrac{1}{n^2}"}</Tex>
            </td>
            <td className={TD}>convergent (α = 2)</td>
          </tr>
          <tr>
            <td className={TD}>
              factorials, <Tex>{"c^n"}</Tex>
            </td>
            <td className={TD + " font-semibold"}>ratio criterion</td>
            <td className={TDM}>
              <Tex>{"\\sum \\tfrac{3^n}{n!},\\ \\ell = 0"}</Tex>
            </td>
            <td className={TD}>convergent</td>
          </tr>
          <tr>
            <td className={TD}>
              a whole <Tex>{"(\\cdots)^n"}</Tex> power
            </td>
            <td className={TD + " font-semibold"}>root criterion</td>
            <td className={TDM}>
              <Tex>{"\\sum \\left(\\tfrac{n}{2n+1}\\right)^{\\!n},\\ \\ell = \\tfrac12"}</Tex>
            </td>
            <td className={TD}>convergent</td>
          </tr>
          <tr>
            <td className={TD}>
              <Tex>{"f(n)"}</Tex> with f positive, decreasing
            </td>
            <td className={TD + " font-semibold"}>integral criterion</td>
            <td className={TDM}>
              <Tex>{"\\sum \\tfrac{1}{n \\log^2 n}"}</Tex>
            </td>
            <td className={TD}>convergent</td>
          </tr>
          <tr>
            <td className={TD}>sin, cos, log, exp of small arguments</td>
            <td className={TD + " font-semibold"}>equivalents first</td>
            <td className={TDM}>
              <Tex>{"\\sin\\tfrac{1}{n} \\sim \\tfrac{1}{n}"}</Tex>
            </td>
            <td className={TD}>divergent (α = 1)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ====== Zigzag of the alternating harmonic partial sums (real data) ====== */
function LeibnizZigzag() {
  const N = 14;
  const sums: number[] = [];
  let s = 0;
  for (let n = 1; n <= N; n++) {
    s += (n % 2 === 1 ? 1 : -1) / n;
    sums.push(s);
  }
  const L = Math.LN2;
  const W = 420;
  const H = 200;
  const padL = 40;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const yMin = 0.42;
  const yMax = 1.05;
  const x = (n: number) => padL + ((n - 1) / (N - 1)) * (W - padL - padR);
  const y = (v: number) => padT + ((yMax - v) / (yMax - yMin)) * (H - padT - padB);
  const poly = sums.map((v, i) => `${x(i + 1).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
      <line x1={padL} y1={y(L)} x2={W - padR} y2={y(L)} stroke="var(--good)" strokeWidth={1.5} strokeDasharray="6 4" />
      <text x={W - padR} y={y(L) - 6} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--good)">
        log 2 ≈ 0.6931
      </text>
      <polyline points={poly} fill="none" stroke="var(--accent)" strokeWidth={1.4} opacity={0.5} />
      {sums.map((v, i) => (
        <circle key={i} cx={x(i + 1)} cy={y(v)} r={3.4} fill="var(--accent)" />
      ))}
      <text x={x(1)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--color-faint)">
        S(1) = 1
      </text>
      <text x={x(2)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--color-faint)">
        S(2) = 0.5
      </text>
      <text x={x(N)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--color-faint)">
        n = {N}
      </text>
    </svg>
  );
}

/* ============ Catalogue of Taylor series at x₀ = 0 (lesson 5) ============ */
function TaylorTable() {
  const rows: [string, string, string][] = [
    ["e^x", "\\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\cdots", "\\text{all } x"],
    ["\\sin x", "\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n+1)!}\\, x^{2n+1} = x - \\frac{x^3}{3!} + \\cdots", "\\text{all } x"],
    ["\\cos x", "\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n)!}\\, x^{2n} = 1 - \\frac{x^2}{2!} + \\cdots", "\\text{all } x"],
    ["\\sinh x", "\\sum_{n=0}^{\\infty} \\frac{x^{2n+1}}{(2n+1)!} = x + \\frac{x^3}{3!} + \\cdots", "\\text{all } x"],
    ["\\cosh x", "\\sum_{n=0}^{\\infty} \\frac{x^{2n}}{(2n)!} = 1 + \\frac{x^2}{2!} + \\cdots", "\\text{all } x"],
    ["\\frac{1}{1-x}", "\\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + \\cdots", "|x| < 1"],
    ["\\log(1+x)", "\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{n+1}\\, x^{n+1} = x - \\frac{x^2}{2} + \\cdots", "-1 < x \\le 1"],
    ["\\arctan x", "\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2n+1}\\, x^{2n+1} = x - \\frac{x^3}{3} + \\cdots", "-1 \\le x \\le 1"],
    ["(1+x)^{\\alpha}", "\\sum_{n=0}^{\\infty} \\binom{\\alpha}{n} x^n = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!}x^2 + \\cdots", "|x| < 1"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Function</th>
            <th className="border-b border-[var(--color-line)] p-2">Taylor series at x₀ = 0</th>
            <th className="border-b border-[var(--color-line)] p-2">Valid for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className={TDM}>
                <Tex>{r[0]}</Tex>
              </td>
              <td className={TDM}>
                <Tex>{r[1]}</Tex>
              </td>
              <td className={TD}>
                <Tex>{r[2]}</Tex>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const lessons: Lesson[] = [
  /* ================================================================ *
   * LESSON 1 — Numerical series (deck 7, part 1): partial sums,
   * the three behaviours, geometric & telescoping series
   * ================================================================ */
  {
    id: "numerical-series",
    title: "Numerical series: partial sums, geometric & telescoping",
    lecture: MODULE,
    summary:
      "An infinite sum is a limit of partial sums with exactly three fates — convergent, divergent to ±∞, or oscillating — and that definition already sums geometric and telescoping series exactly.",
    minutes: 22,
    objectives: [
      "Define a series through its sequence of partial sums",
      "Classify a series as convergent, divergent to ±∞, or oscillating — the three behaviours from the slides",
      "Sum geometric and telescoping series (Mengoli's series) exactly",
      "Apply the necessary condition for convergence — and explain why the harmonic series defeats its converse",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            When we were kids we learnt to sum a <em>finite</em> amount of numbers. Can we sum
            infinitely many? Naively, no — and the slides open with a warning shot. Take{" "}
            <strong>Grandi's series</strong> <Tex>{"1 - 1 + 1 - 1 + \\cdots"}</Tex> and call its
            "sum" <Tex>{"S"}</Tex>. Bracketing in pairs gives{" "}
            <Tex>{"(1-1)+(1-1)+\\cdots = 0"}</Tex>; writing <Tex>{"S = 1 - S"}</Tex> gives{" "}
            <Tex>{"S = \\tfrac12"}</Tex>. Two "answers" from one series: naive infinite addition is
            inconsistent, so the problem <em>must be tackled carefully</em>. The fix: add the first{" "}
            <Tex>{"N"}</Tex> terms only, and study that sequence as <Tex>{"N"}</Tex> grows.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Series & partial sums",
        content: (
          <>
            Given a sequence <Tex>{"(a_n)_n \\subset \\mathbb{R}"}</Tex>, the sequence of{" "}
            <strong>partial sums</strong> is <Tex>{"S_0 = a_0"}</Tex>,{" "}
            <Tex>{"S_1 = a_0 + a_1"}</Tex>, …,{" "}
            <Tex>{"S_N = \\sum_{n=0}^{N} a_n"}</Tex>. The <strong>series</strong> of{" "}
            <Tex>{"a_n"}</Tex> (or infinite sum of <Tex>{"a_n"}</Tex>) is defined as{" "}
            <Tex>{"\\sum_{n=0}^{\\infty} a_n := \\lim_{N\\to\\infty} S_N"}</Tex>. A series is not a
            new kind of addition — it is the <strong>limit of a sequence</strong>, and every theorem
            of this module is secretly a statement about <Tex>{"(S_N)_N"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The three behaviours (the professor's classification)",
        content: (
          <>
            Exactly one of three things happens to <Tex>{"S_N"}</Tex>:
            <br />• <Tex>{"\\lim S_N = S \\in \\mathbb{R}"}</Tex> — the series is{" "}
            <strong>convergent</strong> with sum <Tex>{"S"}</Tex>;
            <br />• <Tex>{"\\lim S_N = \\pm\\infty"}</Tex> — the series is{" "}
            <strong>divergent to ±∞</strong>;
            <br />• <Tex>{"\\lim S_N"}</Tex> does not exist — the series is{" "}
            <strong>oscillating</strong> (Grandi's <Tex>{"\\sum (-1)^n"}</Tex>: the partial sums
            bounce 1, 0, 1, 0, …).
            <br />
            Exams use this three-way language — "oscillating" is a separate verdict, not a synonym of
            divergent.
          </>
        ),
      },
      { kind: "heading", text: "Geometric series — the one you can always sum" },
      {
        kind: "prose",
        content: (
          <p>
            Take <Tex>{"a_n = q^n"}</Tex> with <Tex>{"q \\in \\mathbb{R}"}</Tex>. The trick that
            unlocks everything: multiply the partial sum by <Tex>{"q"}</Tex> and subtract. In{" "}
            <Tex>{"S_N - qS_N = (1 + q + \\cdots + q^N) - (q + q^2 + \\cdots + q^{N+1})"}</Tex> every
            middle term cancels, leaving <Tex>{"(1-q)S_N = 1 - q^{N+1}"}</Tex>.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\sum_{n=0}^{N} q^n = \\frac{1-q^{N+1}}{1-q} \\qquad (q \\ne 1)",
        tag: "7.1",
        caption: (
          <>
            An <em>exact</em> formula for the partial sum — rare luxury. Everything now depends on
            what <Tex>{"q^{N+1}"}</Tex> does as <Tex>{"N\\to\\infty"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\sum_{n=0}^{\\infty} q^n \\;=\\; \\begin{cases} \\dfrac{1}{1-q} & |q| < 1 \\\\[4pt] +\\infty \\ \\ (\\text{divergent}) & q \\ge 1 \\\\[2pt] \\text{oscillating} & q \\le -1 \\end{cases}",
        tag: "7.2",
        caption: (
          <>
            The full trichotomy from the slides. For <Tex>{"q \\ge 1"}</Tex> the partial sums climb
            without bound; for <Tex>{"q \\le -1"}</Tex> they jump back and forth and{" "}
            <Tex>{"\\lim S_N"}</Tex> does not exist. Starting at <Tex>{"n=1"}</Tex> instead removes
            the first term: <Tex>{"\\sum_{n=1}^{\\infty} q^n = \\tfrac{q}{1-q}"}</Tex> for{" "}
            <Tex>{"|q| < 1"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The starting index changes the answer",
        content: (
          <>
            <Tex>{"\\sum_{n=0}^{\\infty} (1/2)^n = 2"}</Tex> but{" "}
            <Tex>{"\\sum_{n=1}^{\\infty} (1/2)^n = 1"}</Tex> — the formulas in (7.2) differ by the
            missing first term. Half of all wrong answers on geometric-series questions are index
            slips. Always check where the sum starts before reaching for{" "}
            <Tex>{"\\tfrac{1}{1-q}"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Algebra of series (linearity)",
        content: (
          <>
            If <Tex>{"\\sum a_n"}</Tex> and <Tex>{"\\sum b_n"}</Tex> are <strong>both</strong>{" "}
            convergent, then <Tex>{"\\sum (a_n + b_n) = \\sum a_n + \\sum b_n"}</Tex> and{" "}
            <Tex>{"\\sum \\lambda a_n = \\lambda \\sum a_n"}</Tex> for every{" "}
            <Tex>{"\\lambda \\in \\mathbb{R}"}</Tex>. This is how messy sums split into geometric
            pieces — see the next example, straight from the slides.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked examples — geometric series in disguise",
        content: (
          <>
            <p>
              <strong>(a)</strong> Compute{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{2^{2n}}{5^n}"}</Tex>. Rewrite the term:{" "}
              <Tex>{"\\dfrac{2^{2n}}{5^n} = \\left(\\dfrac{4}{5}\\right)^{\\!n}"}</Tex> — geometric
              with <Tex>{"q = \\tfrac45"}</Tex>, starting at <Tex>{"n=1"}</Tex>:{" "}
              <Tex>{"\\dfrac{4/5}{1-4/5} = 4."}</Tex>
            </p>
            <p>
              <strong>(b — from the slides)</strong> Compute{" "}
              <Tex>{"\\sum_{n=0}^{\\infty} \\dfrac{4^n + 5^n}{10^n}"}</Tex>. Split by linearity into
              two geometric series:{" "}
              <Tex>{"\\sum \\left(\\tfrac{2}{5}\\right)^{\\!n} + \\sum \\left(\\tfrac{1}{2}\\right)^{\\!n} = \\dfrac{1}{1-2/5} + \\dfrac{1}{1-1/2} = \\dfrac53 + 2 = \\dfrac{11}{3}."}</Tex>
            </p>
            <p>
              <strong>(c — from the slides)</strong>{" "}
              <Tex>{"\\sum_{n=0}^{\\infty} \\dfrac{4^n + 1}{2^n} = \\sum 2^n + \\sum \\left(\\tfrac12\\right)^{\\!n}"}</Tex>:
              the first piece has <Tex>{"q = 2 \\ge 1"}</Tex>, so the whole series is{" "}
              <strong>divergent to +∞</strong>. Splitting works for verdicts too — one divergent
              positive piece sinks the ship.
            </p>
          </>
        ),
      },
      {
        kind: "sim",
        title: "Partial-sums explorer — watch S_N converge (or not)",
        render: () => <PartialSumsSim />,
        caption: (
          <>
            Four fates for <Tex>{"S_N"}</Tex>: the geometric sums race to 1, the harmonic sums creep to
            infinity even though their terms vanish, <Tex>{"\\sum 1/n^2"}</Tex> crawls to{" "}
            <Tex>{"\\pi^2/6"}</Tex>, and the alternating harmonic zigzags onto{" "}
            <Tex>{"\\log 2"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Telescoping series" },
      {
        kind: "prose",
        content: (
          <p>
            The second family you can sum exactly. If each term splits as a{" "}
            <strong>difference of consecutive values</strong>, <Tex>{"a_n = b_n - b_{n+1}"}</Tex>, then
            the partial sum collapses: <Tex>{"S_N = b_1 - b_{N+1}"}</Tex>. The whole series lives or
            dies with <Tex>{"\\lim b_{N+1}"}</Tex>. (Notation from here on: the slides write{" "}
            <Tex>{"\\log"}</Tex> for the natural logarithm <Tex>{"\\ln"}</Tex>.)
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — Mengoli's series",
        content: (
          <>
            <p>
              The slides' star telescope: show that{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{1}{n(n+1)} = 1"}</Tex> (
              <strong>Mengoli's series</strong>). Partial fractions give{" "}
              <Tex>{"\\dfrac{1}{n(n+1)} = \\dfrac{1}{n} - \\dfrac{1}{n+1}"}</Tex>, so
            </p>
            <p>
              <Tex>{"S_N = \\left(1 - \\tfrac12\\right) + \\left(\\tfrac12 - \\tfrac13\\right) + \\cdots + \\left(\\tfrac{1}{N} - \\tfrac{1}{N+1}\\right) = 1 - \\tfrac{1}{N+1}."}</Tex>
            </p>
            <p>
              As <Tex>{"N\\to\\infty"}</Tex>, <Tex>{"S_N \\to 1"}</Tex>: the series is convergent with
              sum exactly <Tex>{"1"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — telescopes that diverge (from the slides)",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum_{n=1}^{\\infty} \\log\\!\\left(1+\\tfrac1n\\right)"}</Tex>:
              since <Tex>{"\\log(1+\\tfrac1n) = \\log\\tfrac{n+1}{n} = \\log(n+1) - \\log n"}</Tex>,
              the sum collapses to <Tex>{"S_N = \\log(N+1) \\to +\\infty"}</Tex>:{" "}
              <strong>divergent to +∞</strong>.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum_{n=1}^{\\infty} \\left(\\sqrt{n+1} - \\sqrt{n}\\right)"}</Tex>:
              telescoping gives <Tex>{"S_N = \\sqrt{N+1} - 1 \\to +\\infty"}</Tex>:{" "}
              <strong>divergent to +∞</strong>.
            </p>
            <p>
              In both cases the terms tend to <Tex>{"0"}</Tex>, yet the series diverges — hold that
              thought for the next section.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "The necessary condition — and its famous failure" },
      {
        kind: "callout",
        tone: "key",
        title: "Necessary condition for convergence",
        content: (
          <>
            If <Tex>{"\\sum a_n"}</Tex> is convergent, then <Tex>{"\\lim_{n\\to\\infty} a_n = 0"}</Tex>{" "}
            (because <Tex>{"a_n = S_n - S_{n-1} \\to S - S = 0"}</Tex>). Contrapositive — your fastest
            weapon: if <Tex>{"a_n \\not\\to 0"}</Tex>, the series is <strong>not convergent</strong>,
            no further test needed. But the slides shout it in red: the opposite implication does{" "}
            <strong>NOT</strong> hold — <Tex>{"a_n \\to 0"}</Tex> alone proves nothing.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — one-line divergence (from the slides)",
        content: (
          <>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty} \\left(1 - \\tfrac{2}{n}\\right)^{\\!n}"}</Tex>: the terms
              tend to <Tex>{"e^{-2} \\approx 0.135 \\ne 0"}</Tex> (the standard limit{" "}
              <Tex>{"(1+\\tfrac{c}{n})^n \\to e^{c}"}</Tex>), so the series is{" "}
              <strong>divergent</strong> by the necessary condition. Done in one line — always run
              this check first.
            </p>
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            The counterexample every examiner loves: the <strong>harmonic series</strong>{" "}
            <Tex>{"\\sum_{n=1}^{\\infty} \\tfrac{1}{n}"}</Tex>. Its terms tend to 0, yet it diverges.
            Group the terms in blocks of doubling length —{" "}
            <Tex>{"\\tfrac13 + \\tfrac14 \\ge \\tfrac24 = \\tfrac12"}</Tex>,{" "}
            <Tex>{"\\tfrac15 + \\tfrac16 + \\tfrac17 + \\tfrac18 \\ge \\tfrac48 = \\tfrac12"}</Tex>, and
            so on: every block contributes at least <Tex>{"\\tfrac12"}</Tex>, and there are infinitely
            many blocks.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "S_{2^k} \\;\\ge\\; 1 + \\frac{k}{2} \\;\\xrightarrow{k\\to\\infty}\\; +\\infty",
        tag: "7.3",
        caption: (
          <>
            Oresme's grouping bound: the partial sums are unbounded, so{" "}
            <Tex>{"\\sum 1/n"}</Tex> is divergent to +∞ — glacially (about <Tex>{"\\log N"}</Tex>),
            but surely.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Fundamental theorem for series: only the tail matters",
        content: (
          <>
            <Tex>{"\\sum_{n=0}^{\\infty} a_n"}</Tex> is convergent{" "}
            <Tex>{"\\iff"}</Tex> there exists <Tex>{"N"}</Tex> such that{" "}
            <Tex>{"\\sum_{n=N}^{\\infty} a_n"}</Tex> is convergent. Changing or dropping finitely many
            terms never changes the <em>behaviour</em> (it changes the sum). This is why hypotheses
            like "decreasing" or "positive" only ever need to hold <em>eventually</em>.
          </>
        ),
      },
      {
        kind: "steps",
        title: "First attack on any numerical series",
        steps: [
          {
            label: "Zero check",
            content: (
              <>
                Does <Tex>{"a_n \\to 0"}</Tex>? If not, write "not convergent by the necessary
                condition" and stop. (Positive terms → divergent to +∞.)
              </>
            ),
          },
          {
            label: "Exact forms",
            content: (
              <>
                Is it geometric (sum with (7.2), minding the start index) or telescoping (collapse{" "}
                <Tex>{"S_N"}</Tex>)? Then you get the exact sum, not just a verdict. Linearity splits
                mixed sums into these pieces.
              </>
            ),
          },
          {
            label: "Otherwise, classify",
            content: (
              <>
                Positive terms → the convergence criteria of the next lesson. Arbitrary or alternating
                signs → absolute convergence and Leibniz (lesson 3).
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp1",
          difficulty: "easy",
          prompt: (
            <>
              What is <Tex>{"\\sum_{n=1}^{\\infty} \\left(\\tfrac12\\right)^{\\!n}"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"2"}</Tex> },
            { id: "B", content: <Tex>{"1"}</Tex> },
            { id: "C", content: <Tex>{"\\tfrac12"}</Tex> },
            { id: "D", content: <>It diverges.</> },
          ],
          correct: "B",
          explanation: (
            <>
              The sum starts at <Tex>{"n=1"}</Tex>, so use <Tex>{"\\tfrac{q}{1-q} = \\tfrac{1/2}{1/2} = 1"}</Tex> —
              answer B. A is the <Tex>{"n=0"}</Tex> value <Tex>{"\\tfrac{1}{1-q}=2"}</Tex> (the index
              trap); C is only the first term; D is wrong because <Tex>{"|q| = \\tfrac12"}</Tex> is
              below 1.
            </>
          ),
          theory: <>Geometric from n=1 sums to q/(1−q); from n=0 to 1/(1−q). Check the start index first.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            The slides are honest about what comes next: computing the exact <em>value</em> of{" "}
            <Tex>{"\\sum a_n"}</Tex> is usually <strong>very hard</strong> (geometric and telescoping
            are the friendly exceptions; power series will add a few more later). So we tackle the
            easier problem — establishing the <em>behaviour</em>: convergent, divergent or
            oscillating. The tools for that are the <strong>convergence criteria</strong>.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — Series with positive terms (deck 7, part 2):
   * comparison, asymptotic comparison, ratio, root, integral
   * ================================================================ */
  {
    id: "positive-series-tests",
    title: "Series with positive terms: comparison, ratio, root, integral",
    lecture: MODULE,
    summary:
      "Positive-term series never oscillate — so a handful of criteria, anchored on Σ 1/n^α, decides every convergence question.",
    minutes: 25,
    objectives: [
      "Explain why a series with positive terms is either convergent or divergent to +∞ — never oscillating",
      "Decide convergence with the comparison and asymptotic comparison criteria, anchored on Σ 1/n^α",
      "Run the ratio, root and integral criteria and know when each is the right tool",
      "Recognize when a criterion is inconclusive (ℓ = 1) and switch strategy",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A series <Tex>{"\\sum a_n"}</Tex> has <strong>positive terms</strong> if{" "}
            <Tex>{"a_n \\ge 0"}</Tex> for every <Tex>{"n"}</Tex>. Then the partial sums can only
            increase, and a monotone sequence has exactly two fates: bounded and convergent, or
            blowing up to <Tex>{"+\\infty"}</Tex>. That is the slides' first theorem of this section —
            and the first step towards studying behaviour.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Positive terms ⇒ never oscillating",
        content: (
          <>
            Let <Tex>{"a_n \\ge 0"}</Tex> for all <Tex>{"n"}</Tex>. Then{" "}
            <em>either</em> <Tex>{"\\sum a_n"}</Tex> is convergent <em>or</em> it is divergent to{" "}
            <Tex>{"+\\infty"}</Tex> — the oscillating case is impossible (proof: <Tex>{"(S_N)_N"}</Tex>{" "}
            is non-decreasing). Convergence is then equivalent to the partial sums being bounded,
            which is why bounding a series by another one settles the question — and why every
            comparison-type criterion exists.
          </>
        ),
      },
      { kind: "heading", text: "The measuring stick: Σ 1/n^α" },
      {
        kind: "formula",
        tex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^{\\alpha}} \\;\\; \\begin{cases} \\text{convergent} & \\alpha > 1 \\\\[2pt] \\text{divergent} & \\alpha \\le 1 \\end{cases}",
        tag: "7.4",
        caption: (
          <>
            The reference family (the "generalized harmonic" or p-series; the professor writes{" "}
            <Tex>{"\\alpha"}</Tex>). <Tex>{"\\alpha=1"}</Tex> is the harmonic series (divergent);{" "}
            <Tex>{"\\alpha=2"}</Tex> is convergent to <Tex>{"\\pi^2/6"}</Tex>. The boundary is strict:
            even <Tex>{"\\alpha = 1.001"}</Tex> converges. Proved with the integral criterion at the
            end of this lesson. (Fun fact: the deck opens with Riemann's{" "}
            <Tex>{"\\zeta(s) = 1 + \\tfrac{1}{2^s} + \\tfrac{1}{3^s} + \\cdots"}</Tex> — for{" "}
            <Tex>{"\\alpha > 1"}</Tex> this sum is exactly <Tex>{"\\zeta(\\alpha)"}</Tex>.)
          </>
        ),
      },
      { kind: "heading", text: "Comparison & asymptotic comparison" },
      {
        kind: "definition",
        term: "Comparison criterion",
        content: (
          <>
            Suppose <Tex>{"0 \\le a_n \\le b_n"}</Tex> for all <Tex>{"n"}</Tex> (or eventually — the
            tail theorem). Then: (1) if <Tex>{"\\sum b_n"}</Tex> is convergent, so is{" "}
            <Tex>{"\\sum a_n"}</Tex>; (2) if <Tex>{"\\sum a_n"}</Tex> is divergent, so is{" "}
            <Tex>{"\\sum b_n"}</Tex>. Smaller than convergent ⇒ convergent; bigger than divergent ⇒
            divergent.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Mind the direction of the inequality",
        content: (
          <>
            Bounding your series from <em>below</em> by a convergent series proves nothing, and
            bounding it from <em>above</em> by a divergent one proves nothing either. Only the two
            combinations in the definition are conclusive. If your inequality points the wrong way,
            you have learned exactly nothing — switch to the asymptotic version below, which has no
            direction to get wrong.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Asymptotic comparison criterion (the workhorse)",
        content: (
          <>
            Let <Tex>{"a_n \\ge 0,\\ b_n > 0"}</Tex> with <Tex>{"a_n \\sim b_n"}</Tex> as{" "}
            <Tex>{"n\\to+\\infty"}</Tex> (that is, <Tex>{"\\lim a_n/b_n = 1"}</Tex>). Then{" "}
            <Tex>{"\\sum a_n"}</Tex> is convergent <Tex>{"\\iff"}</Tex> <Tex>{"\\sum b_n"}</Tex> is
            convergent. Constants are free: if <Tex>{"a_n/b_n \\to c"}</Tex> with{" "}
            <Tex>{"0 < c < \\infty"}</Tex>, then <Tex>{"a_n \\sim c\\,b_n"}</Tex> and multiplying by{" "}
            <Tex>{"c"}</Tex> never changes behaviour. In practice: replace <Tex>{"a_n"}</Tex> by its
            equivalent (keep leading powers; use the Analysis I equivalents for sin, log, exp) and
            read the verdict off (7.4).
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked examples — asymptotic comparison (from the slides)",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum \\dfrac{n^3+2n+3}{3n^5+2n+1}"}</Tex>: keep leading
              powers, <Tex>{"a_n \\sim \\dfrac{n^3}{3n^5} = \\dfrac{1}{3n^2}"}</Tex>. Same behaviour
              as <Tex>{"\\sum 1/n^2"}</Tex> (α = 2) ⇒ <strong>convergent</strong>.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\dfrac{n-\\sqrt{n}}{n^3+3n}"}</Tex>:{" "}
              <Tex>{"a_n \\sim \\dfrac{n}{n^3} = \\dfrac{1}{n^2}"}</Tex> ⇒{" "}
              <strong>convergent</strong>.
            </p>
            <p>
              <strong>(c)</strong> <Tex>{"\\sum \\left[\\log(n+3) - \\log(n+1)\\right]"}</Tex>:{" "}
              <Tex>{"a_n = \\log\\!\\left(1 + \\tfrac{2}{n+1}\\right) \\sim \\tfrac{2}{n}"}</Tex> ⇒
              harmonic behaviour, <strong>divergent</strong>.
            </p>
            <p>
              <strong>(d)</strong> <Tex>{"\\sum \\dfrac{e^{\\cos n}}{n^2+1}"}</Tex>: no equivalent
              exists (the numerator oscillates), so use plain comparison:{" "}
              <Tex>{"0 < e^{\\cos n} \\le e"}</Tex>, hence{" "}
              <Tex>{"a_n \\le \\tfrac{e}{n^2}"}</Tex> ⇒ <strong>convergent</strong>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — equivalents vs the zero check (from the slides)",
        content: (
          <>
            <p>
              <Tex>{"\\sum n^2\\left(e^{1/n} - \\cos\\tfrac1n - \\tfrac1n\\right)"}</Tex>: expand with
              Taylor at <Tex>{"t = \\tfrac1n \\to 0"}</Tex>:{" "}
              <Tex>{"e^{t} = 1 + t + \\tfrac{t^2}{2} + o(t^2)"}</Tex>,{" "}
              <Tex>{"\\cos t = 1 - \\tfrac{t^2}{2} + o(t^2)"}</Tex>, so the bracket is{" "}
              <Tex>{"t^2 + o(t^2) = \\tfrac{1}{n^2} + o\\!\\left(\\tfrac{1}{n^2}\\right)"}</Tex>.
              Multiplying by <Tex>{"n^2"}</Tex>: the terms tend to <Tex>{"1 \\ne 0"}</Tex> ⇒{" "}
              <strong>divergent</strong> by the necessary condition.
            </p>
            <p>
              Compare with <Tex>{"\\sum \\sin\\tfrac1n"}</Tex> (terms{" "}
              <Tex>{"\\sim \\tfrac1n"}</Tex>: divergent, α = 1) and{" "}
              <Tex>{"\\sum \\left(1-\\cos\\tfrac1n\\right)"}</Tex> (terms{" "}
              <Tex>{"\\sim \\tfrac{1}{2n^2}"}</Tex>: convergent, α = 2). The necessary condition
              cannot separate those two — both term sequences vanish. The <em>speed</em> at which they
              vanish is what decides, and equivalents measure exactly that.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Ratio & root criteria" },
      {
        kind: "formula",
        tex: "\\text{Ratio: } \\ell = \\lim_{n\\to\\infty} \\frac{a_{n+1}}{a_n} \\qquad \\begin{cases} \\ell \\in [0,1) & \\text{convergent} \\\\ \\ell > 1 \\ (\\text{or } \\infty) & \\text{divergent} \\\\ \\ell = 1 & \\text{no conclusion} \\end{cases}",
        tag: "7.5",
        caption: (
          <>
            The ratio criterion (terms <Tex>{"a_n > 0"}</Tex>). Built for factorials and powers: the
            ratio kills <Tex>{"n!"}</Tex> and <Tex>{"c^n"}</Tex> cleanly.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\text{Root: } \\ell = \\lim_{n\\to\\infty} \\sqrt[n]{a_n} \\qquad \\text{same verdicts as (7.5)}",
        tag: "7.6",
        caption: (
          <>
            The root criterion. Built for terms that are a whole <Tex>{"n"}</Tex>-th power. Useful
            limits: <Tex>{"\\sqrt[n]{n} \\to 1"}</Tex>,{" "}
            <Tex>{"\\left(1+\\tfrac{c}{n}\\right)^{\\!n} \\to e^c"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "ℓ = 1: the criteria go silent",
        content: (
          <>
            Both <Tex>{"\\sum \\tfrac1n"}</Tex> (divergent) and <Tex>{"\\sum \\tfrac1{n^2}"}</Tex>{" "}
            (convergent) give <Tex>{"\\ell=1"}</Tex> in the ratio <em>and</em> root criteria. Any
            series whose term is a ratio of powers of <Tex>{"n"}</Tex> will land on{" "}
            <Tex>{"\\ell=1"}</Tex> — using ratio/root there is wasted ink. That territory belongs to
            asymptotic comparison.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked examples — ratio criterion (from the slides)",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum \\dfrac{3^n}{n!}"}</Tex>:{" "}
              <Tex>{"\\dfrac{a_{n+1}}{a_n} = \\dfrac{3}{n+1} \\to 0"}</Tex> ⇒{" "}
              <strong>convergent</strong> (so is <Tex>{"\\sum \\tfrac{n^2}{n!}"}</Tex>, same story).
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\dfrac{(n!)^3}{(3n)!}"}</Tex>:{" "}
              <Tex>{"\\dfrac{a_{n+1}}{a_n} = \\dfrac{(n+1)^3}{(3n+1)(3n+2)(3n+3)} \\to \\dfrac{1}{27}"}</Tex>{" "}
              (below 1) ⇒ <strong>convergent</strong>.
            </p>
            <p>
              <strong>(c — the classic)</strong> <Tex>{"\\sum \\dfrac{n!}{n^n}"}</Tex>:{" "}
              <Tex>{"\\dfrac{a_{n+1}}{a_n} = \\left(\\dfrac{n}{n+1}\\right)^{\\!n} = \\dfrac{1}{(1+1/n)^n} \\to \\dfrac{1}{e} \\approx 0.37"}</Tex>{" "}
              ⇒ <strong>convergent</strong>. Against factorials and <Tex>{"n^n"}</Tex>, the ratio
              criterion almost always produces <Tex>{"e"}</Tex> somewhere.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — root criterion (from the slides)",
        content: (
          <>
            <p>
              <Tex>{"\\sum \\left(1 - \\dfrac{2}{n}\\right)^{\\!n^2}"}</Tex>: the whole term is an{" "}
              <Tex>{"n"}</Tex>-th power of an <Tex>{"n"}</Tex>-th power, so take the root:{" "}
              <Tex>{"\\sqrt[n]{a_n} = \\left(1 - \\tfrac{2}{n}\\right)^{\\!n} \\to e^{-2} \\approx 0.135"}</Tex>,
              below 1 ⇒ <strong>convergent</strong>.
            </p>
            <p>
              Contrast with lesson 1's <Tex>{"\\sum (1-\\tfrac2n)^n"}</Tex> — exponent{" "}
              <Tex>{"n"}</Tex>, terms <Tex>{"\\to e^{-2} \\ne 0"}</Tex>, divergent. The exponent{" "}
              <Tex>{"n^2"}</Tex> is what makes the terms vanish fast enough here.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Integral criterion" },
      {
        kind: "definition",
        term: "Integral criterion",
        content: (
          <>
            Let <Tex>{"f: [1,+\\infty) \\to [0,+\\infty)"}</Tex> be continuous and{" "}
            <strong>decreasing</strong>, and set <Tex>{"a_n := f(n)"}</Tex>. Then{" "}
            <Tex>{"\\sum_{n=1}^{\\infty} a_n"}</Tex> is convergent{" "}
            <Tex>{"\\iff"}</Tex> <Tex>{"\\int_1^{+\\infty} f(x)\\,dx"}</Tex> is convergent (the sum is
            squeezed between two integrals — draw the rectangles under the graph).
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked examples — integral criterion (from the slides)",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum_{n=2}^{\\infty} \\dfrac{1}{n\\log n}"}</Tex>:
              substitute <Tex>{"u = \\log x"}</Tex> in{" "}
              <Tex>{"\\int_2^{\\infty} \\tfrac{dx}{x\\log x} = \\int_{\\log 2}^{\\infty} \\tfrac{du}{u} = +\\infty"}</Tex>{" "}
              ⇒ <strong>divergent to +∞</strong>. No comparison with a pure{" "}
              <Tex>{"1/n^{\\alpha}"}</Tex> can catch this one — it sits exactly between{" "}
              <Tex>{"\\sum \\tfrac1n"}</Tex> and every <Tex>{"\\sum \\tfrac{1}{n^{1+\\varepsilon}}"}</Tex>.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\dfrac{1}{n^{\\alpha}}"}</Tex>: for{" "}
              <Tex>{"f(x) = x^{-\\alpha}"}</Tex> the integral{" "}
              <Tex>{"\\int_1^{\\infty} x^{-\\alpha}dx"}</Tex> is finite exactly when{" "}
              <Tex>{"\\alpha > 1"}</Tex> — that is the promised proof of (7.4).
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <TestTable />,
        caption: "Criterion selection at a glance: read the shape of the term, pick the tool built for it.",
      },
      {
        kind: "steps",
        title: "Choosing the right criterion",
        steps: [
          {
            label: "Zero check",
            content: (
              <>
                Always first: if <Tex>{"a_n \\not\\to 0"}</Tex>, it diverges — done in one line.
              </>
            ),
          },
          {
            label: "Read the shape",
            content: (
              <>
                Powers/roots of <Tex>{"n"}</Tex> → asymptotic comparison with (7.4). Factorials or{" "}
                <Tex>{"c^n"}</Tex> → ratio. A whole <Tex>{"(\\cdots)^n"}</Tex> → root. Decreasing{" "}
                <Tex>{"f(n)"}</Tex> with an easy antiderivative (logs!) → integral criterion.
              </>
            ),
          },
          {
            label: "Simplify first",
            content: (
              <>
                Replace sin/cos/log/exp of small arguments by their equivalents before comparing —{" "}
                <Tex>{"\\sin\\tfrac1n \\sim \\tfrac1n"}</Tex>, <Tex>{"\\log(1+\\tfrac1n) \\sim \\tfrac1n"}</Tex>,{" "}
                <Tex>{"1-\\cos\\tfrac1n \\sim \\tfrac1{2n^2}"}</Tex>.
              </>
            ),
          },
          {
            label: "If ℓ = 1, change tool",
            content: (
              <>
                An inconclusive ratio/root is not a dead end — it is a sign the term is polynomial-like,
                so go back to comparison.
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp2",
          difficulty: "medium",
          prompt: (
            <>
              What is the right verdict — and tool — for{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{2n+3}{n^3+1}"}</Tex>?
            </>
          ),
          options: [
            {
              id: "A",
              content: (
                <>
                  Converges: the terms are <Tex>{"\\sim 2/n^2"}</Tex>, asymptotic comparison with{" "}
                  <Tex>{"\\sum 1/n^2"}</Tex>.
                </>
              ),
            },
            { id: "B", content: <>Diverges: the ratio test gives a limit above 1.</> },
            { id: "C", content: <>Diverges: the terms behave like <Tex>{"1/n"}</Tex>.</> },
            { id: "D", content: <>Diverges: the terms do not tend to 0.</> },
          ],
          correct: "A",
          explanation: (
            <>
              Keep leading powers: <Tex>{"\\tfrac{2n+3}{n^3+1} \\sim \\tfrac{2n}{n^3} = \\tfrac{2}{n^2}"}</Tex>,
              and <Tex>{"\\sum 1/n^2"}</Tex> converges (α = 2) — answer A. B is false: the ratio
              criterion gives <Tex>{"\\ell=1"}</Tex> here (polynomial terms), no verdict. C
              mis-cancels the degrees (3 − 1 = 2, not 1). D is false — the terms clearly vanish.
            </>
          ),
          theory: <>Ratio of polynomials: degree difference d ⇒ behaves like 1/n^d; converges iff d ≥ 2 (i.e. d above 1).</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp3",
          difficulty: "medium",
          prompt: (
            <>
              The ratio criterion applied to <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n!}{100^n}"}</Tex>{" "}
              gives:
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"\\ell = 0"}</Tex> — converges.</> },
            { id: "B", content: <><Tex>{"\\ell = 1"}</Tex> — inconclusive.</> },
            { id: "C", content: <><Tex>{"\\ell = \\tfrac{1}{100}"}</Tex> — converges.</> },
            { id: "D", content: <><Tex>{"\\ell = +\\infty"}</Tex> — diverges.</> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"\\dfrac{a_{n+1}}{a_n} = \\dfrac{(n+1)!}{100^{n+1}}\\cdot\\dfrac{100^n}{n!} = \\dfrac{n+1}{100} \\to +\\infty"}</Tex>{" "}
              — answer D: the factorial beats <em>any</em> exponential, so the terms explode. A and C
              describe the reciprocal series <Tex>{"\\sum 100^n/n!"}</Tex> (which does converge); B is
              wrong — the limit is unambiguous here.
            </>
          ),
          theory: <>Growth ladder: n! beats cⁿ beats n^p beats log n. The ratio criterion formalizes it.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            The slides end this section with a red warning: these criteria are for{" "}
            <strong>positive terms only</strong>. The moment signs start changing, cancellation enters
            the game and a series can converge <em>because of</em> its signs — that is the next
            lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — Series with arbitrary / alternating sign (deck 7, part 3):
   * absolute convergence first, then Leibniz
   * ================================================================ */
  {
    id: "alternating-series",
    title: "Series with arbitrary sign: absolute convergence & Leibniz",
    lecture: MODULE,
    summary:
      "Positive-term criteria stop working when signs change. Absolute convergence rescues most cases; for alternating signs, Leibniz turns 'decreasing to zero' into convergence — with a built-in error bound.",
    minutes: 20,
    objectives: [
      "Recognize a series with arbitrary sign and know that positive-term criteria do NOT apply to it",
      "Test absolute convergence first, and use 'absolutely convergent ⇒ convergent'",
      "Apply the Leibniz criterion to series with alternating sign and bound the truncation error",
      "Classify a series as absolutely convergent, convergent (but not absolutely), or not convergent",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A series <Tex>{"\\sum a_n"}</Tex> has <strong>arbitrary sign</strong> if infinitely many
            terms are positive and infinitely many are negative — think{" "}
            <Tex>{"\\sum \\tfrac{(-1)^n}{n}"}</Tex> or <Tex>{"\\sum \\sin(n)"}</Tex>. The slides put a
            "BE CAREFUL" sign here: the criteria for positive terms do <strong>NOT</strong> work for
            series with arbitrary sign — partial sums no longer march one way, so the whole
            bounded-implies-convergent machinery collapses. Two rescue tools exist: absolute
            convergence (general) and Leibniz (for alternating signs).
          </p>
        ),
      },
      { kind: "heading", text: "Absolute convergence" },
      {
        kind: "definition",
        term: "Absolute convergence",
        content: (
          <>
            <Tex>{"\\sum a_n"}</Tex> is <strong>absolutely convergent</strong> if{" "}
            <Tex>{"\\sum |a_n|"}</Tex> is convergent. The point of the definition:{" "}
            <Tex>{"\\sum |a_n|"}</Tex> is a series with <em>positive terms</em>, so the entire lesson-2
            toolbox applies to it.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Absolutely convergent ⇒ convergent (one-way!)",
        content: (
          <>
            Theorem: if <Tex>{"\\sum a_n"}</Tex> is absolutely convergent, then{" "}
            <Tex>{"\\sum a_n"}</Tex> is convergent. The opposite implication does{" "}
            <strong>NOT</strong> hold: <Tex>{"\\sum \\tfrac{(-1)^n}{n}"}</Tex> is convergent (Leibniz,
            below) but not absolutely convergent (its absolute series is harmonic). Beyond this
            theorem there are <em>no</em> general results for arbitrary sign — which is why you always
            try absolute convergence first.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — absolute convergence in action (from the slides)",
        content: (
          <>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{\\sin(n)}{n^2}"}</Tex>: the signs are a mess (no
              alternation, no pattern), so Leibniz is useless — but{" "}
              <Tex>{"\\left|\\dfrac{\\sin n}{n^2}\\right| \\le \\dfrac{1}{n^2}"}</Tex>, and{" "}
              <Tex>{"\\sum 1/n^2"}</Tex> converges. The series is{" "}
              <strong>absolutely convergent</strong>, hence convergent. This is the standard cure for
              bounded oscillating numerators.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Classification order: absolute first",
        content: (
          <>
            Given a series with varying signs, always test <Tex>{"\\sum |a_n|"}</Tex> first with the
            positive-term toolbox. If it converges, you are done — the strongest verdict, and no
            Leibniz hypotheses to verify. Only when <Tex>{"\\sum|a_n|"}</Tex> diverges do you reach for
            Leibniz to salvage plain convergence.
          </>
        ),
      },
      { kind: "heading", text: "Alternating sign & the Leibniz criterion" },
      {
        kind: "prose",
        content: (
          <p>
            One special class <em>is</em> easy: series with <strong>alternating sign</strong>,{" "}
            <Tex>{"\\sum (-1)^n a_n"}</Tex> with <Tex>{"a_n \\ge 0"}</Tex>. The signs push the partial
            sums up, then down, then up… If the push sizes <Tex>{"a_n"}</Tex> shrink to zero{" "}
            <em>monotonically</em>, each swing overshoots the target by less than the one before, and
            the sums are squeezed onto a limit. That intuition is a theorem:
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Leibniz criterion (series with alternating sign)",
        content: (
          <>
            Let <Tex>{"a_n \\ge 0"}</Tex> for all <Tex>{"n"}</Tex>. If{" "}
            <Tex>{"\\lim_{n\\to\\infty} a_n = 0"}</Tex> and <Tex>{"(a_n)_n"}</Tex> is{" "}
            <strong>decreasing</strong> (at least eventually), then{" "}
            <Tex>{"\\sum_{n=0}^{\\infty} (-1)^n a_n"}</Tex> is convergent. Both hypotheses matter —
            "decreasing" is the one students forget to check.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "|S - S_N| \\;\\le\\; a_{N+1}",
        tag: "7.7",
        caption: (
          <>
            The Leibniz error bound (a practical add-on to the slides' statement): truncating after{" "}
            <Tex>{"N"}</Tex> terms costs at most the <strong>first omitted term</strong>, and the sum
            always lies between two consecutive partial sums. Free precision control — examiners love
            asking for it.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <LeibnizZigzag />,
        caption: (
          <>
            Partial sums of <Tex>{"\\sum (-1)^{n+1}/n"}</Tex> (computed, not sketched): each swing
            crosses <Tex>{"\\log 2"}</Tex> and shrinks, so consecutive sums bracket the limit.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the alternating harmonic series (and all its cousins)",
        content: (
          <>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n} = 1 - \\tfrac12 + \\tfrac13 - \\tfrac14 + \\cdots"}</Tex>
            </p>
            <p>
              Check Leibniz: <Tex>{"a_n = \\tfrac1n"}</Tex> is positive, decreasing, and tends to 0 —
              all boxes ticked, so it <strong>converges</strong> (its sum is <Tex>{"\\log 2"}</Tex>,
              as the power-series lessons will prove). How many terms guarantee an error of at most{" "}
              <Tex>{"10^{-2}"}</Tex>? By (7.7) we need{" "}
              <Tex>{"a_{N+1} = \\tfrac{1}{N+1} \\le 10^{-2}"}</Tex>, i.e. <Tex>{"N \\ge 99"}</Tex>.
              Slow — but perfectly controlled.
            </p>
            <p>
              Slide exercise, same one-liner: <Tex>{"\\sum \\dfrac{(-1)^n}{n^{\\alpha}}"}</Tex> is
              convergent for <strong>every</strong> <Tex>{"\\alpha > 0"}</Tex> (Leibniz), but
              absolutely convergent only for <Tex>{"\\alpha > 1"}</Tex> (compare (7.4)).
            </p>
          </>
        ),
      },
      {
        kind: "definition",
        term: "Convergent but not absolutely (a.k.a. conditional convergence)",
        content: (
          <>
            A series that is convergent while <Tex>{"\\sum |a_n|"}</Tex> diverges is{" "}
            <strong>convergent but not absolutely convergent</strong> — the slides' phrasing; most
            books say <strong>conditionally convergent</strong>. It converges only thanks to sign
            cancellation.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — classify (from the slides)",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum (-1)^n\\left(3^{1/n} - 1\\right)"}</Tex>: since{" "}
              <Tex>{"3^{1/n} - 1 = e^{(\\log 3)/n} - 1 \\sim \\dfrac{\\log 3}{n}"}</Tex>, the absolute
              series behaves like the harmonic series ⇒ <em>not</em> absolutely convergent. But{" "}
              <Tex>{"a_n = 3^{1/n}-1"}</Tex> is positive, decreasing, → 0 ⇒ Leibniz applies. Verdict:{" "}
              <strong>convergent, not absolutely</strong>.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\dfrac{(-1)^n}{n!}"}</Tex> and{" "}
              <Tex>{"\\sum (-1)^n n^2 e^{-n}"}</Tex>: the absolute series{" "}
              <Tex>{"\\sum \\tfrac{1}{n!}"}</Tex> (ratio: <Tex>{"\\ell = 0"}</Tex>) and{" "}
              <Tex>{"\\sum \\tfrac{n^2}{e^n}"}</Tex> (root:{" "}
              <Tex>{"\\ell = \\tfrac1e"}</Tex>) both converge. Verdict for both:{" "}
              <strong>absolutely convergent</strong> — no need to even mention Leibniz.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "“Σ|aₙ| diverges” does NOT mean the series diverges",
        content: (
          <>
            Divergence of the absolute series only rules out <em>absolute</em> convergence — the
            alternating harmonic series is the standing counterexample. Writing “diverges because{" "}
            <Tex>{"\\sum \\tfrac1n"}</Tex> diverges” about <Tex>{"\\sum \\tfrac{(-1)^{n+1}}{n}"}</Tex>{" "}
            is the single most common error in this chapter. The correct chain is one-directional:
            absolute ⇒ convergent, never the reverse.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Why “not absolutely” deserves respect (Riemann)",
        content: (
          <>
            A convergent-but-not-absolutely-convergent series is fragile: Riemann proved its terms can
            be <strong>rearranged</strong> to converge to <em>any</em> value you like, or to diverge.
            Absolutely convergent series, by contrast, keep the same sum under any rearrangement. The
            distinction is not pedantry — it is structural.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — a parameter question from the slides",
        content: (
          <>
            <p>
              Find all <Tex>{"\\beta \\in \\mathbb{R}"}</Tex> such that{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} \\left(n\\sin\\dfrac{\\beta}{n^2} - \\log\\!\\left(1+\\dfrac{3}{n}\\right)\\right)"}</Tex>{" "}
              is convergent.
            </p>
            <p>
              Expand both pieces:{" "}
              <Tex>{"n\\sin\\tfrac{\\beta}{n^2} = \\tfrac{\\beta}{n} + O\\!\\left(\\tfrac{1}{n^5}\\right)"}</Tex>{" "}
              and{" "}
              <Tex>{"\\log\\!\\left(1+\\tfrac{3}{n}\\right) = \\tfrac{3}{n} - \\tfrac{9}{2n^2} + O\\!\\left(\\tfrac{1}{n^3}\\right)"}</Tex>.
              The term is{" "}
              <Tex>{"\\tfrac{\\beta-3}{n} + \\tfrac{9}{2n^2} + O\\!\\left(\\tfrac{1}{n^3}\\right)"}</Tex>.
            </p>
            <p>
              If <Tex>{"\\beta \\ne 3"}</Tex>, the term is <Tex>{"\\sim \\tfrac{\\beta-3}{n}"}</Tex> —
              eventually of constant sign and harmonic-sized ⇒ divergent. If{" "}
              <Tex>{"\\beta = 3"}</Tex>, the term is <Tex>{"\\sim \\tfrac{9}{2n^2}"}</Tex> ⇒
              convergent. Answer: <strong>β = 3 only</strong> (matches the slides' printed solution).
              The sibling exercise <Tex>{"\\sum \\tfrac{\\log(n+1)-\\log n}{n^{\\alpha}}"}</Tex> works
              the same way: the numerator is <Tex>{"\\sim \\tfrac1n"}</Tex>, so the term is{" "}
              <Tex>{"\\sim \\tfrac{1}{n^{1+\\alpha}}"}</Tex> ⇒ convergent iff{" "}
              <Tex>{"\\alpha > 0"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Classifying a sign-changing series",
        steps: [
          {
            label: "Absolute test",
            content: (
              <>
                Study <Tex>{"\\sum |a_n|"}</Tex> with lesson-2 tools. Converges ⇒{" "}
                <strong>absolutely convergent</strong> (hence convergent): stop here.
              </>
            ),
          },
          {
            label: "Leibniz",
            content: (
              <>
                If <Tex>{"\\sum|a_n|"}</Tex> diverges and the signs alternate: check{" "}
                <Tex>{"a_n \\ge 0"}</Tex>, decreasing (differentiate <Tex>{"f(x)"}</Tex> if unclear),{" "}
                <Tex>{"\\to 0"}</Tex>. All hold ⇒ <strong>convergent, not absolutely</strong>.
              </>
            ),
          },
          {
            label: "Last resort",
            content: (
              <>
                If Leibniz fails, check <Tex>{"a_n \\to 0"}</Tex>: if the terms do not vanish, the
                series is <strong>not convergent</strong> (divergent or oscillating).
              </>
            ),
          },
          {
            label: "Error bound",
            content: (
              <>
                If asked for an approximation, quote (7.7): the error is at most the first omitted
                term.
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp4",
          difficulty: "medium",
          prompt: (
            <>
              The series <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n}"}</Tex>:
            </>
          ),
          options: [
            { id: "A", content: <>Diverges, because the harmonic series diverges.</> },
            { id: "B", content: <>Converges absolutely.</> },
            { id: "C", content: <>Converges conditionally (its sum is <Tex>{"\\ln 2"}</Tex>).</> },
            { id: "D", content: <>Converges to 0 by symmetry of the signs.</> },
          ],
          correct: "C",
          explanation: (
            <>
              Leibniz applies (<Tex>{"1/n \\downarrow 0"}</Tex>) so it converges, while the absolute
              series <Tex>{"\\sum 1/n"}</Tex> diverges — conditional convergence, answer C. A confuses
              absolute divergence with divergence (the classic trap). B is exactly what fails. D is
              fantasy — the partial sums visibly hover near 0.69, not 0.
            </>
          ),
          theory: <>Alternating + terms ↓ 0 ⇒ converges; if Σ|aₙ| diverges, the convergence is conditional.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            One loose end: we asserted the sum <Tex>{"\\log 2"}</Tex> without proof. The honest proof
            needs a machine that turns functions into series and back — <strong>power series</strong>,
            the next lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 4 — Power series (deck 8, part 1): convergence set,
   * radius, term-wise calculus, coefficients as derivatives
   * ================================================================ */
  {
    id: "power-series",
    title: "Power series: convergence set, radius & term-wise calculus",
    lecture: MODULE,
    summary:
      "Series whose terms are functions aₙ(x−x₀)ⁿ: the convergence set is an interval — radius first, endpoints by hand — and inside it you may differentiate and integrate term by term.",
    minutes: 25,
    objectives: [
      "Define a power series (center, coefficients) and its convergence set",
      "Compute the radius of convergence with the ratio or root criterion",
      "Determine the full convergence set by testing both endpoints separately",
      "Differentiate and integrate power series term by term, and read coefficients as derivatives: aₙ = S⁽ⁿ⁾(x₀)/n!",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            So far the terms were numbers. Now let them be <em>functions</em>: given{" "}
            <Tex>{"f_n : I \\subseteq \\mathbb{R} \\to \\mathbb{R}"}</Tex> (for instance{" "}
            <Tex>{"f_n(x) = x^n"}</Tex>), what does <Tex>{"\\sum_{n=0}^{\\infty} f_n(x)"}</Tex> mean?
            The slides' idea: <strong>use numerical series</strong>. The series of functions{" "}
            <em>converges at</em> <Tex>{"x_0"}</Tex> if the numerical series{" "}
            <Tex>{"\\sum f_n(x_0)"}</Tex> converges — so for each fixed <Tex>{"x"}</Tex> you are back
            in lessons 1–3. The main issue becomes: find the <strong>convergence set</strong>{" "}
            <Tex>{"A"}</Tex>, the set of all points where the series converges.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Power series, center, coefficients",
        content: (
          <>
            A <strong>power series</strong> is a series of functions of the form{" "}
            <Tex>{"\\sum_{n=0}^{\\infty} a_n (x-x_0)^n"}</Tex>, where <Tex>{"x_0"}</Tex> is the{" "}
            <strong>center</strong> and the numbers <Tex>{"a_n"}</Tex> are the{" "}
            <strong>coefficients</strong>. Any power series can be translated to center 0 by{" "}
            <Tex>{"t = x - x_0"}</Tex>, so we usually state theorems for{" "}
            <Tex>{"\\sum a_n x^n"}</Tex>.
          </>
        ),
      },
      {
        kind: "example",
        title: "The prototype — the geometric series as a function",
        content: (
          <>
            <p>
              <Tex>{"\\sum_{n=0}^{\\infty} x^n"}</Tex> (center 0, all coefficients 1) is, at each
              fixed <Tex>{"x"}</Tex>, a geometric series — so lesson 1 already classified it:
              sum <Tex>{"\\tfrac{1}{1-x}"}</Tex> if <Tex>{"|x| < 1"}</Tex>, divergent to{" "}
              <Tex>{"+\\infty"}</Tex> if <Tex>{"x \\ge 1"}</Tex>, oscillating if{" "}
              <Tex>{"x \\le -1"}</Tex>. Convergence set:{" "}
              <Tex>{"A = \\{x \\in \\mathbb{R} : |x| < 1\\} = (-1,1)"}</Tex>, and on it the{" "}
              <em>sum of the series</em> is the function <Tex>{"\\tfrac{1}{1-x}"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "definition",
        term: "Radius of convergence",
        content: (
          <>
            The <strong>radius of convergence</strong> of <Tex>{"\\sum a_n x^n"}</Tex> is{" "}
            <Tex>{"R := \\sup\\{r \\ge 0 : \\textstyle\\sum a_n r^n \\text{ is convergent}\\} \\in [0,\\infty]"}</Tex>.
            Behind it sits a lemma: if the series converges at some <Tex>{"x = r"}</Tex>, it converges{" "}
            <em>absolutely</em> at every <Tex>{"x \\in (-r, r)"}</Tex> — so the good set can only be
            an interval, and the game is to find the biggest <Tex>{"R"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The structure theorem for the convergence set",
        content: (
          <>
            Let <Tex>{"R"}</Tex> be the radius of <Tex>{"\\sum a_n x^n"}</Tex>. Then:
            <br />• <Tex>{"R = 0"}</Tex>: the series converges at <Tex>{"x=0"}</Tex> only,{" "}
            <Tex>{"A = \\{0\\}"}</Tex>;
            <br />• <Tex>{"0 < R < \\infty"}</Tex>: absolutely convergent in{" "}
            <Tex>{"(-R,R)"}</Tex>, NOT convergent outside <Tex>{"[-R,R]"}</Tex> — so <Tex>{"A"}</Tex>{" "}
            is one of <Tex>{"(-R,R),\\ (-R,R],\\ [-R,R),\\ [-R,R]"}</Tex>;
            <br />• <Tex>{"R = \\infty"}</Tex>: absolutely convergent on all of{" "}
            <Tex>{"\\mathbb{R}"}</Tex>.
            <br />
            For center <Tex>{"x_0"}</Tex>, shift everything: the candidates are intervals from{" "}
            <Tex>{"x_0 - R"}</Tex> to <Tex>{"x_0 + R"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "R = \\frac{1}{\\displaystyle\\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}} \\qquad \\text{or} \\qquad R = \\frac{1}{\\displaystyle\\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|}",
        tag: "8.1",
        caption: (
          <>
            Root criterion #2 and ratio criterion #2 (the slides' names), valid when the limit exists;
            conventions: limit 0 ⇒ <Tex>{"R=+\\infty"}</Tex>, limit <Tex>{"+\\infty"}</Tex> ⇒{" "}
            <Tex>{"R=0"}</Tex>. Note they run on the <em>coefficients</em>, not on the whole term.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Endpoints are checked BY HAND — always",
        content: (
          <>
            At <Tex>{"x = x_0 \\pm R"}</Tex> the structure theorem is silent — that is why four
            interval types are possible. The slides' procedure: <strong>(A)</strong> compute{" "}
            <Tex>{"R"}</Tex>; <strong>(B)</strong> if <Tex>{"0 < R < \\infty"}</Tex>, substitute each
            endpoint and study the resulting <em>numerical</em> series with lessons 2–3. The same
            series can diverge at one endpoint and converge at the other — and exam graders check
            both, every time.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked examples — convergence sets (from the slides)",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n}"}</Tex>: ratio on
              coefficients <Tex>{"\\tfrac{n}{n+1} \\to 1"}</Tex> ⇒ <Tex>{"R = 1"}</Tex>. At{" "}
              <Tex>{"x=1"}</Tex>: harmonic ⇒ divergent. At <Tex>{"x=-1"}</Tex>: alternating harmonic ⇒
              convergent (Leibniz). Convergence set <Tex>{"A = [-1, 1)"}</Tex>, absolutely convergent
              only in <Tex>{"(-1,1)"}</Tex>.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\dfrac{x^n}{n^{\\alpha}}"}</Tex> with{" "}
              <Tex>{"\\alpha > 1"}</Tex>: again <Tex>{"R=1"}</Tex>, but now both endpoint series
              converge absolutely (compare (7.4)) ⇒ <Tex>{"A = [-1,1]"}</Tex>. And{" "}
              <Tex>{"\\sum \\dfrac{x^n}{n!}"}</Tex>: ratio{" "}
              <Tex>{"\\tfrac{1}{n+1} \\to 0"}</Tex> ⇒ <Tex>{"R = \\infty"}</Tex>,{" "}
              <Tex>{"A = \\mathbb{R}"}</Tex>.
            </p>
            <p>
              <strong>(c — centered)</strong>{" "}
              <Tex>{"\\sum_{n=0}^{\\infty} \\dfrac{n^2}{2^n} (x-2)^n"}</Tex>: root criterion{" "}
              <Tex>{"\\sqrt[n]{n^2/2^n} = \\tfrac{(\\sqrt[n]{n})^2}{2} \\to \\tfrac12"}</Tex> ⇒{" "}
              <Tex>{"R = 2"}</Tex>, candidates between <Tex>{"0"}</Tex> and <Tex>{"4"}</Tex>. At{" "}
              <Tex>{"x=4"}</Tex>: <Tex>{"\\sum n^2"}</Tex>; at <Tex>{"x=0"}</Tex>:{" "}
              <Tex>{"\\sum (-1)^n n^2"}</Tex> — terms do not vanish either way ⇒ both excluded.{" "}
              <Tex>{"A = (0, 4)"}</Tex>.
            </p>
            <p>
              <strong>(d — geometric shortcut)</strong>{" "}
              <Tex>{"\\sum_{n=0}^{\\infty} 3^n (x+1)^n"}</Tex> is geometric with ratio{" "}
              <Tex>{"q = 3(x+1)"}</Tex>: convergent iff <Tex>{"|3(x+1)| < 1"}</Tex> ⇒{" "}
              <Tex>{"A = \\left(-\\tfrac43, -\\tfrac23\\right)"}</Tex>. (Heads-up: the slide prints
              the right endpoint as <Tex>{"\\tfrac23"}</Tex> — a dropped minus sign; the center is{" "}
              <Tex>{"-1"}</Tex> with <Tex>{"R = \\tfrac13"}</Tex>, so both endpoints are negative.)
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Sum of two power series",
        content: (
          <>
            If <Tex>{"\\sum a_n x^n"}</Tex> and <Tex>{"\\sum b_n x^n"}</Tex> have radii{" "}
            <Tex>{"R_a \\ne R_b"}</Tex>, then <Tex>{"\\sum (a_n + b_n)x^n"}</Tex> has radius exactly{" "}
            <Tex>{"\\min(R_a, R_b)"}</Tex> (if <Tex>{"R_a = R_b"}</Tex> it can be larger —
            cancellation). Slide exercise: <Tex>{"\\sum (1 + 2^n)x^n"}</Tex> splits into radii{" "}
            <Tex>{"1"}</Tex> and <Tex>{"\\tfrac12"}</Tex> ⇒ <Tex>{"R = \\tfrac12"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Calculus inside the convergence set" },
      {
        kind: "formula",
        tex: "S(x) = \\sum_{n=0}^{\\infty} a_n x^n \\;\\Rightarrow\\; S'(x) = \\sum_{n=1}^{\\infty} n\\,a_n x^{n-1}, \\qquad \\int_0^x S(t)\\,dt = \\sum_{n=0}^{\\infty} \\frac{a_n}{n+1}\\, x^{n+1}",
        tag: "8.2",
        caption: (
          <>
            Derivative and integral of a power series (two slide theorems): both are legal at every{" "}
            <Tex>{"x \\in (-R, R)"}</Tex>, and — in red on the slides — the radius of convergence{" "}
            <strong>does not change</strong>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Same radius — but endpoints can change",
        content: (
          <>
            The radius survives differentiation, endpoint convergence need not:{" "}
            <Tex>{"\\log(1+x)"}</Tex>'s series converges at <Tex>{"x=1"}</Tex>, but its derivative
            series <Tex>{"\\sum (-1)^n x^n"}</Tex> (which is <Tex>{"\\tfrac{1}{1+x}"}</Tex>) diverges
            there. After differentiating or integrating, re-check any endpoint you intend to use.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — log(1+x) and arctan x from the geometric series",
        content: (
          <>
            <p>
              <strong>(a)</strong> Start from <Tex>{"\\sum_{n=0}^{\\infty} (-t)^n = \\dfrac{1}{1+t}"}</Tex>{" "}
              (<Tex>{"|t| < 1"}</Tex>) and integrate term by term with (8.2):
            </p>
            <p>
              <Tex>{"\\log(1+x) = \\sum_{n=0}^{\\infty} \\dfrac{(-1)^n}{n+1}\\, x^{n+1} = x - \\dfrac{x^2}{2} + \\dfrac{x^3}{3} - \\cdots, \\qquad \\forall x \\in (-1, 1]."}</Tex>
            </p>
            <p>
              <strong>(b)</strong> Same machine with <Tex>{"t \\mapsto x^2"}</Tex>:{" "}
              <Tex>{"\\sum (-1)^n x^{2n} = \\dfrac{1}{1+x^2}"}</Tex>, integrate:
            </p>
            <p>
              <Tex>{"\\arctan x = \\sum_{n=0}^{\\infty} \\dfrac{(-1)^n}{2n+1}\\, x^{2n+1} = x - \\dfrac{x^3}{3} + \\dfrac{x^5}{5} - \\cdots, \\qquad \\forall x \\in [-1, 1]."}</Tex>
            </p>
            <p>
              No derivatives of <Tex>{"\\log"}</Tex> or <Tex>{"\\arctan"}</Tex> computed. The endpoint
              memberships come from Leibniz — and at <Tex>{"x = 1"}</Tex> they yield the famous sums{" "}
              <Tex>{"\\log 2 = 1 - \\tfrac12 + \\tfrac13 - \\cdots"}</Tex> (promised last lesson) and{" "}
              <Tex>{"\\tfrac{\\pi}{4} = 1 - \\tfrac13 + \\tfrac15 - \\cdots"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — summing a series with a derivative",
        content: (
          <>
            <p>
              The same machine runs in reverse: to <em>sum</em>{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} n x^n"}</Tex>, differentiate the geometric series{" "}
              <Tex>{"\\sum_{n=0}^{\\infty} x^n = \\tfrac{1}{1-x}"}</Tex> term by term:
            </p>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty} n x^{n-1} = \\dfrac{1}{(1-x)^2} \\;\\Rightarrow\\; \\sum_{n=1}^{\\infty} n x^n = \\dfrac{x}{(1-x)^2} \\qquad (|x| < 1)."}</Tex>
            </p>
            <p>
              At <Tex>{"x = \\tfrac12"}</Tex>:{" "}
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n}{2^n} = \\dfrac{1/2}{(1/2)^2} = 2"}</Tex>. A series
              that looks hopeless by hand falls in three lines.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "The coefficients are derivatives" },
      {
        kind: "prose",
        content: (
          <p>
            Differentiating (8.2) again and again shows that the sum{" "}
            <Tex>{"S(x) = \\sum a_n (x-x_0)^n"}</Tex> is <Tex>{"C^{\\infty}"}</Tex> on{" "}
            <Tex>{"(x_0-R,\\ x_0+R)"}</Tex>, and evaluating the <Tex>{"n"}</Tex>-th derivative at the
            center forces{" "}
            <Tex>{"a_n = \\dfrac{S^{(n)}(x_0)}{n!}"}</Tex>. Read backwards, this is a devastating exam
            trick: to get a high derivative at the center, do <em>not</em> differentiate — just read
            the coefficient off the series.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — high derivatives for free (from the slides)",
        content: (
          <>
            <p>
              Let <Tex>{"S(x) = \\sum_{n=1}^{\\infty} \\dfrac{(-1)^n}{n}\\, x^{6n}"}</Tex>. Compute{" "}
              <Tex>{"S^{(11)}(0)"}</Tex> and <Tex>{"S^{(24)}(0)"}</Tex>.
            </p>
            <p>
              The series contains only powers <Tex>{"x^6, x^{12}, x^{18}, x^{24}, \\dots"}</Tex> Since
              11 is not a multiple of 6, the coefficient of <Tex>{"x^{11}"}</Tex> is 0 ⇒{" "}
              <Tex>{"S^{(11)}(0) = 0"}</Tex>. For 24, take <Tex>{"n = 4"}</Tex>:{" "}
              <Tex>{"a_{24} = \\tfrac{(-1)^4}{4} = \\tfrac14"}</Tex>, so{" "}
              <Tex>{"S^{(24)}(0) = 24!\\, a_{24} = \\tfrac{24!}{4} = 6\\cdot 23!"}</Tex> — exactly the
              slides' printed answer. (Bonus from the same slide:{" "}
              <Tex>{"S(x) = -\\log(1+x^6)"}</Tex> on <Tex>{"[-1,1]"}</Tex>, by substituting{" "}
              <Tex>{"t = x^6"}</Tex> into the <Tex>{"\\log(1+t)"}</Tex> series.)
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Convergence set — the exam routine",
        steps: [
          {
            label: "Radius",
            content: (
              <>
                Apply (8.1) to the coefficients (or the ratio/root criterion to{" "}
                <Tex>{"|a_n (x-x_0)^n|"}</Tex>) to get <Tex>{"R"}</Tex>. Geometric-looking series:
                solve <Tex>{"|q(x)| < 1"}</Tex> directly.
              </>
            ),
          },
          {
            label: "Open interval",
            content: (
              <>
                Write down absolute convergence on <Tex>{"(x_0 - R,\\ x_0 + R)"}</Tex>, no convergence
                outside the closed interval.
              </>
            ),
          },
          {
            label: "Both endpoints",
            content: (
              <>
                Substitute <Tex>{"x = x_0 + R"}</Tex> and <Tex>{"x = x_0 - R"}</Tex> separately; study
                each numerical series ((7.4), Leibniz…).
              </>
            ),
          },
          {
            label: "Assemble",
            content: (
              <>
                Report <Tex>{"A"}</Tex> with the correct bracket at each end, stating the type of
                convergence at any included endpoint.
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp5",
          difficulty: "easy",
          prompt: (
            <>
              A power series centred at 0 has radius <Tex>{"R = 3"}</Tex>. What do you know about its
              behaviour at <Tex>{"x = 3"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <>It converges absolutely there.</> },
            { id: "B", content: <>Nothing — the endpoint must be tested separately as a numerical series.</> },
            { id: "C", content: <>It diverges there.</> },
            { id: "D", content: <>It converges there if and only if it converges at <Tex>{"x = -3"}</Tex>.</> },
          ],
          correct: "B",
          explanation: (
            <>
              The radius theorem guarantees absolute convergence strictly inside and divergence
              strictly outside — at <Tex>{"|x| = R"}</Tex> it says nothing, so B. A and C both claim
              more than is known. D is false: <Tex>{"\\sum x^n/n"}</Tex> converges at −1 and diverges
              at +1 with the same <Tex>{"R=1"}</Tex>.
            </>
          ),
          theory: <>Inside: absolute convergence. Outside: divergence. Endpoints: individual manual checks.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            We now know everything about series of the form <Tex>{"\\sum a_n (x-x_0)^n"}</Tex>. The
            final lesson asks the reverse question — given a <em>function</em>, which power series
            represents it? — and answers it with Taylor series and analytic functions.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 5 — Taylor series & analytic functions (deck 8, part 2)
   * ================================================================ */
  {
    id: "taylor-series",
    title: "Taylor series & analytic functions",
    lecture: MODULE,
    summary:
      "Every C^∞ function has a Taylor series — but it may not converge, and may not converge to f. Analytic functions are the ones where it works, and a small catalogue of them solves most exam questions.",
    minutes: 22,
    objectives: [
      "Write the Taylor series of a C^∞ function at any center",
      "Explain why C^∞ is not enough: the e^{-1/x} counterexample and the definition of analytic",
      "Use the analyticity criteria and recall the catalogue of standard expansions",
      "Expand functions at arbitrary centers, and use series for non-elementary integrals and ODEs",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Lesson 4 ended with a rigidity result: if <Tex>{"f"}</Tex> is the sum of a power series
            centred at <Tex>{"x_0"}</Tex>, its coefficients <em>must</em> be{" "}
            <Tex>{"a_n = f^{(n)}(x_0)/n!"}</Tex>. So for any smooth function there is exactly one
            candidate series — write it down and ask whether it delivers.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Taylor series",
        content: (
          <>
            Let <Tex>{"f \\in C^{\\infty}(I)"}</Tex> and <Tex>{"x_0 \\in I"}</Tex>. The power series{" "}
            <Tex>{"\\sum_{n=0}^{\\infty} \\dfrac{f^{(n)}(x_0)}{n!} (x-x_0)^n"}</Tex> is the{" "}
            <strong>Taylor series of f centered at x₀</strong> (centered at 0 it is often called the
            Maclaurin series). It is the infinite continuation of the Taylor polynomials from
            Analysis I.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            The slides immediately ask the two honest questions. <strong>(1)</strong> Does the Taylor
            series of a <Tex>{"C^{\\infty}"}</Tex> function converge in some interval — is{" "}
            <Tex>{"R > 0"}</Tex>? Answer: <strong>NO</strong>, not in general.{" "}
            <strong>(2)</strong> If <Tex>{"R > 0"}</Tex>, is <Tex>{"f"}</Tex> the sum of the series?
            Also not guaranteed — and the counterexample is famous:
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The e^{−1/x} counterexample: C^∞ is not enough",
        content: (
          <>
            Let <Tex>{"f(x) = e^{-1/x}"}</Tex> for <Tex>{"x > 0"}</Tex> and <Tex>{"f(x) = 0"}</Tex>{" "}
            for <Tex>{"x \\le 0"}</Tex>. One can show <Tex>{"f \\in C^{\\infty}(\\mathbb{R})"}</Tex>{" "}
            with <Tex>{"f^{(n)}(0) = 0"}</Tex> for <em>every</em> <Tex>{"n"}</Tex> — the exponential
            crushes every polynomial rate. Its Taylor series at 0 is therefore{" "}
            <Tex>{"0 + 0\\cdot x + 0\\cdot x^2 + \\cdots = 0"}</Tex>: it converges beautifully
            (everywhere!) but its sum is the zero function, <strong>not</strong> <Tex>{"f"}</Tex>.
            Writing down a Taylor series is free; equality with <Tex>{"f"}</Tex> is a theorem you must
            earn.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Analytic function",
        content: (
          <>
            <Tex>{"f \\in C^{\\infty}(I)"}</Tex> is <strong>analytic at x₀</strong> if there exists{" "}
            <Tex>{"r > 0"}</Tex> such that{" "}
            <Tex>{"f(x) = \\sum_{n=0}^{\\infty} \\dfrac{f^{(n)}(x_0)}{n!}(x-x_0)^n"}</Tex> for all{" "}
            <Tex>{"x \\in (x_0 - r,\\ x_0 + r)"}</Tex> — the Taylor series converges <em>and</em>{" "}
            coincides with <Tex>{"f"}</Tex> near <Tex>{"x_0"}</Tex>. The slides draw it as nested
            blobs: analytic functions are a strict subset of <Tex>{"C^{\\infty}"}</Tex> functions
            (with <Tex>{"e^{-1/x}"}</Tex> living in the gap).
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Analyticity criteria (how to earn the equality)",
        content: (
          <>
            Theorem: if there exists <Tex>{"C > 0"}</Tex> with{" "}
            <Tex>{"|f^{(n)}(x)| \\le C^n"}</Tex> for all <Tex>{"x \\in I"}</Tex> and all{" "}
            <Tex>{"n"}</Tex>, then <Tex>{"f"}</Tex> is analytic in <Tex>{"I"}</Tex>. In particular,
            uniformly bounded derivatives (<Tex>{"|f^{(n)}(x)| \\le C"}</Tex>) suffice — that settles{" "}
            <Tex>{"\\sin"}</Tex> and <Tex>{"\\cos"}</Tex> instantly, and a small variation settles{" "}
            <Tex>{"e^x"}</Tex>, <Tex>{"\\sinh x"}</Tex>, <Tex>{"\\cosh x"}</Tex> on every bounded
            interval.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <TaylorTable />,
        caption: (
          <>
            The catalogue to memorize. The first five are the slides' analytic all-stars (valid on all
            of <Tex>{"\\mathbb{R}"}</Tex>, note how <Tex>{"\\sinh/\\cosh"}</Tex> are{" "}
            <Tex>{"\\sin/\\cos"}</Tex> without the sign flips); the geometric, log and arctan rows
            were built in lesson 4; the binomial row <Tex>{"(1+x)^{\\alpha}"}</Tex> is a
            beyond-the-deck bonus. Watch the validity column — <Tex>{"\\log(1+x)"}</Tex> scrapes in at{" "}
            <Tex>{"x=1"}</Tex> only.
          </>
        ),
      },
      { kind: "heading", text: "Expanding at an arbitrary center" },
      {
        kind: "steps",
        title: "Taylor expansion without computing derivatives",
        steps: [
          {
            label: "Shift",
            content: (
              <>
                Set <Tex>{"t = x - x_0"}</Tex> and rewrite the function in terms of <Tex>{"t"}</Tex>.
              </>
            ),
          },
          {
            label: "Massage",
            content: (
              <>
                Use algebra — partial fractions, log laws, factoring constants — until every piece has
                a catalogue shape like <Tex>{"\\tfrac{1}{1-u}"}</Tex> or <Tex>{"\\log(1+u)"}</Tex>{" "}
                with <Tex>{"u = ct"}</Tex>.
              </>
            ),
          },
          {
            label: "Substitute",
            content: <>Plug into the catalogue series and collect powers of <Tex>{"t"}</Tex>.</>,
          },
          {
            label: "Convergence set",
            content: (
              <>
                Each substitution has its own validity (<Tex>{"|ct| < 1"}</Tex>…): intersect them, then
                check surviving endpoints by hand as in lesson 4.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — a rational function at x₀ = −1 (from the slides)",
        content: (
          <>
            <p>
              Expand <Tex>{"f(x) = \\dfrac{1}{x^2 - 5x + 6}"}</Tex> at <Tex>{"x_0 = -1"}</Tex>.
              Factor and split:{" "}
              <Tex>{"\\dfrac{1}{(x-2)(x-3)} = \\dfrac{1}{x-3} - \\dfrac{1}{x-2}"}</Tex>. With{" "}
              <Tex>{"t = x+1"}</Tex>:
            </p>
            <p>
              <Tex>{"\\dfrac{1}{x-3} = \\dfrac{1}{t-4} = -\\dfrac{1}{4}\\cdot\\dfrac{1}{1-t/4} = -\\sum_{n=0}^{\\infty} \\dfrac{t^n}{4^{n+1}} \\quad (|t|<4),"}</Tex>
            </p>
            <p>
              <Tex>{"-\\dfrac{1}{x-2} = \\dfrac{1}{3-t} = \\dfrac{1}{3}\\cdot\\dfrac{1}{1-t/3} = \\sum_{n=0}^{\\infty} \\dfrac{t^n}{3^{n+1}} \\quad (|t|<3)."}</Tex>
            </p>
            <p>
              Adding:{" "}
              <Tex>{"f(x) = \\sum_{n=0}^{\\infty} \\left(3^{-n-1} - 4^{-n-1}\\right)(x+1)^n"}</Tex>,
              valid where both pieces converge: <Tex>{"|t| < \\min(3,4) = 3"}</Tex>, i.e.{" "}
              <Tex>{"A = (-4, 2)"}</Tex> — the slides' printed solution. (At{" "}
              <Tex>{"|t| = 3"}</Tex> the terms behave like <Tex>{"3^{-n-1} \\cdot 3^n = \\tfrac13"}</Tex>:
              no vanishing, endpoints out.)
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — a logarithm at x₀ = 0 (from the slides)",
        content: (
          <>
            <p>
              Expand <Tex>{"f(x) = \\log\\dfrac{2+4x}{3+3x}"}</Tex> at <Tex>{"x_0 = 0"}</Tex>. Split
              the log and factor out constants:
            </p>
            <p>
              <Tex>{"f(x) = \\log\\tfrac23 + \\log(1+2x) - \\log(1+x)."}</Tex>
            </p>
            <p>
              Substitute into the <Tex>{"\\log(1+u)"}</Tex> row twice (<Tex>{"u=2x"}</Tex>, valid for{" "}
              <Tex>{"2x \\in (-1,1]"}</Tex>; <Tex>{"u=x"}</Tex>, valid for <Tex>{"x \\in (-1,1]"}</Tex>):
            </p>
            <p>
              <Tex>{"f(x) = \\log\\tfrac23 + \\sum_{n=0}^{\\infty} \\dfrac{(-1)^n \\left(2^{n+1} - 1\\right)}{n+1}\\, x^{n+1}."}</Tex>
            </p>
            <p>
              Convergence set: the <Tex>{"2x"}</Tex> piece is the binding one,{" "}
              <Tex>{"R = \\tfrac12"}</Tex>; at <Tex>{"x = \\tfrac12"}</Tex> both endpoint series
              converge (alternating), at <Tex>{"x = -\\tfrac12"}</Tex> the terms behave like{" "}
              <Tex>{"-\\tfrac1n"}</Tex> ⇒ divergent. So{" "}
              <Tex>{"A = \\left(-\\tfrac12, \\tfrac12\\right]"}</Tex> — matching the slides. (Their
              third exercise, <Tex>{"\\log\\tfrac{\\sqrt{x}}{4-x}"}</Tex> at <Tex>{"x_0=1"}</Tex>,
              runs the same way and lands on <Tex>{"A = (0, 2]"}</Tex>.)
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Why all this?" },
      {
        kind: "example",
        title: "Worked example — integrating the unintegrable (from the slides)",
        content: (
          <>
            <p>
              <Tex>{"f(x) = e^{x^2}"}</Tex> has a primitive{" "}
              <Tex>{"F(x) = \\int_0^x e^{t^2}dt"}</Tex>, but <Tex>{"F"}</Tex> cannot be written with
              elementary functions. Power series do not care: substitute <Tex>{"x^2"}</Tex> into the{" "}
              <Tex>{"e^x"}</Tex> row and integrate term by term with (8.2):
            </p>
            <p>
              <Tex>{"e^{t^2} = \\sum_{n=0}^{\\infty} \\dfrac{t^{2n}}{n!} \\;\\Rightarrow\\; F(x) = \\sum_{n=0}^{\\infty} \\dfrac{x^{2n+1}}{(2n+1)\\,n!}, \\qquad \\forall x \\in \\mathbb{R}."}</Tex>
            </p>
            <p>
              <Tex>{"F"}</Tex> <em>is</em> a series of elementary functions — and the series converges
              fast enough to compute <Tex>{"F(1) \\approx 1.4627"}</Tex> with a handful of terms.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — Taylor series solve ODEs (from the slides)",
        content: (
          <>
            <p>
              Seek a power-series solution <Tex>{"y(x) = \\sum_{n=0}^{\\infty} a_n x^n"}</Tex> of the
              Cauchy problem <Tex>{"y' = y"}</Tex>, <Tex>{"y(0) = 1"}</Tex>. Differentiate term by
              term and match coefficients of <Tex>{"x^n"}</Tex>:
            </p>
            <p>
              <Tex>{"\\sum_{n=0}^{\\infty} (n+1)a_{n+1} x^n = \\sum_{n=0}^{\\infty} a_n x^n \\;\\Rightarrow\\; a_{n+1} = \\frac{a_n}{n+1},"}</Tex>
            </p>
            <p>
              and <Tex>{"y(0)=1"}</Tex> gives <Tex>{"a_0 = 1"}</Tex>. Induction:{" "}
              <Tex>{"a_n = \\tfrac{1}{n!}"}</Tex> — the solution is exactly{" "}
              <Tex>{"y(x) = \\sum \\tfrac{x^n}{n!} = e^x"}</Tex>. The same coefficient-matching game
              solves ODEs whose solutions have no closed form at all.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp6",
          difficulty: "medium",
          prompt: (
            <>
              <Tex>{"f \\in C^{\\infty}(\\mathbb{R})"}</Tex>, and you write its Taylor series at{" "}
              <Tex>{"x_0 = 0"}</Tex>. What is guaranteed?
            </>
          ),
          options: [
            { id: "A", content: <>The series converges to <Tex>{"f(x)"}</Tex> in some neighbourhood of 0.</> },
            { id: "B", content: <>The series has positive radius of convergence, though its sum may differ from <Tex>{"f"}</Tex>.</> },
            {
              id: "C",
              content: (
                <>
                  Nothing — it may fail to converge, or converge to a different function. Equality near
                  0 is exactly the definition of "<Tex>{"f"}</Tex> analytic at 0".
                </>
              ),
            },
            { id: "D", content: <>The series converges for every <Tex>{"x"}</Tex>, since <Tex>{"f"}</Tex> is smooth.</> },
          ],
          correct: "C",
          explanation: (
            <>
              Both failures really happen, so C. There are <Tex>{"C^{\\infty}"}</Tex> functions whose
              Taylor series has <Tex>{"R = 0"}</Tex> (kills B and D), and{" "}
              <Tex>{"e^{-1/x}"}</Tex> (extended by 0) has a Taylor series that converges everywhere —
              to the zero function, not to <Tex>{"f"}</Tex> (kills A). Convergence <em>to f</em> near
              the center is precisely analyticity, checked e.g. via the bound{" "}
              <Tex>{"|f^{(n)}(x)| \\le C^n"}</Tex>.
            </>
          ),
          theory: <>C^∞ gives you a Taylor series on paper; only analyticity makes it equal to f near the center.</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ser-cp7",
          difficulty: "hard",
          prompt: (
            <>
              From the slides: <Tex>{"f(x) = 2 - x + \\sum_{k=1}^{\\infty} \\dfrac{(-1)^k}{k}\\, x^{6k}"}</Tex>.
              What is <Tex>{"f^{(24)}(0)"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"0"}</Tex> },
            { id: "B", content: <Tex>{"24!"}</Tex> },
            { id: "C", content: <Tex>{"\\tfrac{23!}{4}"}</Tex> },
            { id: "D", content: <Tex>{"6 \\cdot 23!"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              Use <Tex>{"f^{(24)}(0) = 24!\\,a_{24}"}</Tex>. The polynomial part <Tex>{"2-x"}</Tex>{" "}
              contributes nothing at degree 24; the series hits <Tex>{"x^{24}"}</Tex> at{" "}
              <Tex>{"k=4"}</Tex> with <Tex>{"a_{24} = \\tfrac{(-1)^4}{4} = \\tfrac14"}</Tex>. So{" "}
              <Tex>{"f^{(24)}(0) = \\tfrac{24!}{4} = \\tfrac{24\\cdot 23!}{4} = 6\\cdot 23!"}</Tex> —
              answer D, the slides' printed value. A would be right for exponents that never appear
              (e.g. <Tex>{"f^{(11)}(0) = 0"}</Tex>); B forgets <Tex>{"a_{24}"}</Tex>; C divides the
              wrong factorial.
            </>
          ),
          theory: <>aₙ = f⁽ⁿ⁾(x₀)/n! read backwards: f⁽ⁿ⁾(x₀) = n!·aₙ. Missing power ⇒ derivative is 0.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            That closes the series toolkit: three behaviours and exact sums for geometric and
            telescoping series; convergence criteria for positive terms; absolute convergence and
            Leibniz for arbitrary signs; a radius-plus-endpoints routine for power series; and Taylor
            series with analyticity as the licence to swap functions for series. These expansions
            return one more time in the <strong>Fourier series</strong> module — same idea, but the
            building blocks become sines and cosines.
          </p>
        ),
      },
    ],
  },
];

/* ==================================================================== *
 * PRACTICE — 20 questions, 6 easy / 9 medium / 5 hard, letters 5×A/B/C/D
 * ==================================================================== */
export const practice: Question[] = [
  {
    id: "ma2-ser-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        Compute <Tex>{"\\sum_{n=0}^{\\infty} \\left(\\tfrac13\\right)^{\\!n}"}</Tex>.
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac12"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac23"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac32"}</Tex> },
      { id: "D", content: <>It diverges.</> },
    ],
    correct: "C",
    explanation: (
      <>
        Geometric with <Tex>{"q=\\tfrac13"}</Tex> starting at <Tex>{"n=0"}</Tex>:{" "}
        <Tex>{"\\tfrac{1}{1-1/3} = \\tfrac{1}{2/3} = \\tfrac32"}</Tex> — answer C. A is the sum{" "}
        <em>from n = 1</em> (<Tex>{"\\tfrac{q}{1-q}=\\tfrac12"}</Tex>), the index trap. B is{" "}
        <Tex>{"1-q"}</Tex>, not the sum. D is wrong since <Tex>{"|q|"}</Tex> is below 1.
      </>
    ),
    theory: <>Σ qⁿ from n=0 is 1/(1−q) when |q| is below 1; from n=1 it is q/(1−q).</>,
  },
  {
    id: "ma2-ser-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        You verify that <Tex>{"a_n \\to 0"}</Tex>. What can you conclude about{" "}
        <Tex>{"\\sum a_n"}</Tex>?
      </>
    ),
    options: [
      { id: "A", content: <>It converges.</> },
      { id: "B", content: <>Nothing yet — the condition is necessary, not sufficient.</> },
      { id: "C", content: <>It diverges.</> },
      { id: "D", content: <>It converges, and its sum is 0.</> },
    ],
    correct: "B",
    explanation: (
      <>
        Terms tending to 0 is required for convergence but proves nothing by itself: the harmonic
        series has <Tex>{"1/n \\to 0"}</Tex> yet diverges — answer B. A is the classic converse error;
        C claims the opposite with equally no basis; D confuses the limit of the <em>terms</em> with
        the value of the <em>sum</em>.
      </>
    ),
    theory: <>aₙ → 0 is a one-way door: its failure kills a series, its success decides nothing.</>,
  },
  {
    id: "ma2-ser-q3",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        The series <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n}{n+1}"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <>Converges, since the terms are bounded.</> },
      { id: "B", content: <>Converges to 1.</> },
      { id: "C", content: <>Cannot be decided with the standard tests.</> },
      { id: "D", content: <>Diverges, because the terms tend to 1, not 0.</> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\tfrac{n}{n+1} \\to 1 \\ne 0"}</Tex>, so the necessary condition fails and the series
        diverges — answer D, one line of work. A is false: bounded terms guarantee nothing (each term
        near 1 keeps adding ≈1 forever). B confuses the limit of the terms with the sum. C is wrong —
        this is the <em>easiest</em> possible decision.
      </>
    ),
    theory: <>Always check aₙ → 0 first: if it fails, “diverges by the necessary condition” finishes the job.</>,
  },
  {
    id: "ma2-ser-q4",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        The p-series <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{1}{n^p}"}</Tex> converges exactly when:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"p > 1"}</Tex> },
      { id: "B", content: <Tex>{"p \\ge 1"}</Tex> },
      { id: "C", content: <Tex>{"p > 0"}</Tex> },
      { id: "D", content: <Tex>{"p \\ge 2"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        By the integral test, <Tex>{"\\int_1^\\infty x^{-p}dx"}</Tex> is finite exactly for{" "}
        <Tex>{"p > 1"}</Tex> — answer A. B fails at <Tex>{"p=1"}</Tex>: the harmonic series diverges. C
        would include <Tex>{"p = \\tfrac12"}</Tex>, whose terms shrink far too slowly. D is too
        strict — e.g. <Tex>{"p = \\tfrac32"}</Tex> already converges.
      </>
    ),
    theory: <>Reference scale: Σ1/n^p converges iff p is above 1; the boundary case p = 1 diverges.</>,
  },
  {
    id: "ma2-ser-q5",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        Using partial fractions, the sum <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{1}{n(n+1)}"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"1"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac12"}</Tex> },
      { id: "C", content: <Tex>{"2"}</Tex> },
      { id: "D", content: <>It diverges like the harmonic series.</> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\tfrac{1}{n(n+1)} = \\tfrac1n - \\tfrac1{n+1}"}</Tex> telescopes:{" "}
        <Tex>{"S_N = 1 - \\tfrac{1}{N+1} \\to 1"}</Tex> — answer A. B and C are plausible-looking
        miscollapses of the telescope. D is wrong: the terms behave like <Tex>{"1/n^2"}</Tex>, not{" "}
        <Tex>{"1/n"}</Tex>, and here we even get the exact sum.
      </>
    ),
    theory: <>If aₙ = bₙ − bₙ₊₁ then S_N = b₁ − b_{"{N+1}"}: the sum is b₁ minus the tail limit.</>,
  },
  {
    id: "ma2-ser-q6",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        The power series <Tex>{"\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}"}</Tex> is the Maclaurin
        expansion of:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\sin x"}</Tex> },
      { id: "B", content: <Tex>{"e^x"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{1}{1-x}"}</Tex> },
      { id: "D", content: <Tex>{"\\ln(1+x)"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        All powers present, all signs positive, factorials in the denominator — that is{" "}
        <Tex>{"e^x"}</Tex> (every derivative at 0 equals 1), answer B. <Tex>{"\\sin x"}</Tex> (A) has
        only odd powers with alternating signs; <Tex>{"\\tfrac{1}{1-x}"}</Tex> (C) has no factorials at
        all; <Tex>{"\\ln(1+x)"}</Tex> (D) has denominators <Tex>{"n"}</Tex>, not <Tex>{"n!"}</Tex>, and
        alternating signs.
      </>
    ),
    theory: <>Fingerprints: n! ⇒ exp family; odd/even powers with alternating signs ⇒ sin/cos; 1/n ⇒ log.</>,
  },
  {
    id: "ma2-ser-q7",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The series <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n+1}{n^3+2}"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <>Converges — the terms behave like <Tex>{"1/n^2"}</Tex>.</> },
      { id: "B", content: <>Diverges — the terms behave like <Tex>{"1/n"}</Tex>.</> },
      { id: "C", content: <>Diverges — the terms do not tend to 0.</> },
      { id: "D", content: <>Converges — the ratio test gives <Tex>{"L"}</Tex> below 1.</> },
    ],
    correct: "A",
    explanation: (
      <>
        Keep leading powers: <Tex>{"\\tfrac{n+1}{n^3+2} \\sim \\tfrac{n}{n^3} = \\tfrac{1}{n^2}"}</Tex>;
        asymptotic comparison with the convergent <Tex>{"\\sum 1/n^2"}</Tex> gives convergence — answer
        A. B mis-subtracts the degrees (3 − 1 = 2). C is false, the terms clearly vanish. D fails
        because for polynomial-type terms the ratio test returns <Tex>{"L=1"}</Tex>: inconclusive.
      </>
    ),
    theory: <>Rational terms: compare with 1/n^(deg denominator − deg numerator); ratio/root are useless there.</>,
  },
  {
    id: "ma2-ser-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Apply the ratio test to <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{3^n}{n!}"}</Tex>. The limit{" "}
        <Tex>{"L"}</Tex> and the verdict are:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"L = 3"}</Tex> — diverges.</> },
      { id: "B", content: <><Tex>{"L = 1"}</Tex> — inconclusive.</> },
      { id: "C", content: <><Tex>{"L = \\tfrac13"}</Tex> — converges.</> },
      { id: "D", content: <><Tex>{"L = 0"}</Tex> — converges.</> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\dfrac{a_{n+1}}{a_n} = \\dfrac{3^{n+1}}{(n+1)!}\\cdot\\dfrac{n!}{3^n} = \\dfrac{3}{n+1} \\to 0"}</Tex>,
        and 0 is below 1 ⇒ converges — answer D. A forgets the factorial entirely (it beats{" "}
        <Tex>{"3^n"}</Tex>); C inverts the surviving factor; B would need the ratio to stall at 1,
        which it visibly does not.
      </>
    ),
    theory: <>Ratio test on cⁿ/n!: the ratio is c/(n+1) → 0, so Σcⁿ/n! converges for every c (it sums to eᶜ).</>,
  },
  {
    id: "ma2-ser-q9",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Apply the root test to <Tex>{"\\sum_{n=1}^{\\infty} \\left(\\dfrac{n}{2n+1}\\right)^{\\!n}"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"L = 2"}</Tex> — diverges.</> },
      { id: "B", content: <><Tex>{"L = \\tfrac12"}</Tex> — converges.</> },
      { id: "C", content: <><Tex>{"L = 1"}</Tex> — inconclusive.</> },
      { id: "D", content: <><Tex>{"L = \\tfrac12"}</Tex> — diverges.</> },
    ],
    correct: "B",
    explanation: (
      <>
        The <Tex>{"n"}</Tex>-th root peels the outer power:{" "}
        <Tex>{"\\sqrt[n]{a_n} = \\dfrac{n}{2n+1} \\to \\dfrac12"}</Tex>, below 1 ⇒ converges — answer
        B. A inverts the fraction; C is what you would (wrongly) guess without computing; D pairs the
        right limit with the wrong verdict — L below 1 means <em>converges</em>.
      </>
    ),
    theory: <>Whole (…)ⁿ term ⇒ root test: L = lim of the base; L below 1 converges, above 1 diverges.</>,
  },
  {
    id: "ma2-ser-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The series <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{(-1)^n}{\\sqrt{n}}"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <>Converges absolutely.</> },
      { id: "B", content: <>Diverges, because <Tex>{"\\sum 1/\\sqrt{n}"}</Tex> diverges.</> },
      { id: "C", content: <>Converges conditionally.</> },
      { id: "D", content: <>Diverges, because the terms do not tend to 0.</> },
    ],
    correct: "C",
    explanation: (
      <>
        Leibniz: <Tex>{"1/\\sqrt{n}"}</Tex> is positive, decreasing, → 0 ⇒ the series converges. The
        absolute series is the p-series with <Tex>{"p=\\tfrac12"}</Tex>, divergent ⇒ not absolute. So:
        conditionally convergent — answer C. A is exactly what fails; B commits the
        absolute-divergence-equals-divergence error; D is false since{" "}
        <Tex>{"1/\\sqrt{n} \\to 0"}</Tex>.
      </>
    ),
    theory: <>Alternating p-series Σ(−1)ⁿ/n^p: converges for p above 0, absolutely only for p above 1.</>,
  },
  {
    id: "ma2-ser-q11",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        You approximate <Tex>{"S = \\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n^2}"}</Tex> by the partial
        sum <Tex>{"S_4"}</Tex>. The Leibniz bound guarantees the error is at most:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac{1}{16}"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac15"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{1}{36}"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{1}{25}"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        The bound is the <em>first omitted term</em>: <Tex>{"|S - S_4| \\le a_5 = \\tfrac{1}{5^2} = \\tfrac{1}{25}"}</Tex> —
        answer D. A is <Tex>{"a_4"}</Tex>, the last term <em>used</em> (the off-by-one trap); B forgets
        the square; C is <Tex>{"a_6"}</Tex>, one term too far.
      </>
    ),
    theory: <>Leibniz remainder: |S − S_N| ≤ a_{"{N+1}"} — always the first term you dropped.</>,
  },
  {
    id: "ma2-ser-q12",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Which statement is TRUE?</>,
    options: [
      { id: "A", content: <>If <Tex>{"\\sum |a_n|"}</Tex> converges, then <Tex>{"\\sum a_n"}</Tex> converges.</> },
      { id: "B", content: <>If <Tex>{"\\sum a_n"}</Tex> converges, then <Tex>{"\\sum |a_n|"}</Tex> converges.</> },
      { id: "C", content: <>Conditional convergence implies absolute convergence.</> },
      { id: "D", content: <>If <Tex>{"a_n \\to 0"}</Tex>, then <Tex>{"\\sum a_n"}</Tex> converges absolutely.</> },
    ],
    correct: "A",
    explanation: (
      <>
        Absolute convergence always implies convergence — answer A. B is the false converse: the
        alternating harmonic series converges while <Tex>{"\\sum 1/n"}</Tex> diverges. C inverts the
        definitions — conditional convergence <em>means</em> absolute convergence fails. D is doubly
        wrong: even plain convergence does not follow from <Tex>{"a_n\\to0"}</Tex> (harmonic series).
      </>
    ),
    theory: <>The implication runs one way only: Σ|aₙ| convergent ⇒ Σaₙ convergent. Never backwards.</>,
  },
  {
    id: "ma2-ser-q13",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The radius of convergence of <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n^2}{2^n}\\, x^n"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"R = \\tfrac12"}</Tex> },
      { id: "B", content: <Tex>{"R = 2"}</Tex> },
      { id: "C", content: <Tex>{"R = 1"}</Tex> },
      { id: "D", content: <Tex>{"R = +\\infty"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"\\left|\\dfrac{a_{n+1}}{a_n}\\right| = \\dfrac{(n+1)^2}{2^{n+1}}\\cdot\\dfrac{2^n}{n^2} = \\dfrac12\\left(\\dfrac{n+1}{n}\\right)^{\\!2} \\to \\dfrac12"}</Tex>,
        so <Tex>{"R = 1/L = 2"}</Tex> — answer B. A forgets to take the reciprocal (the most common
        slip); C ignores the <Tex>{"2^n"}</Tex>; D would need factorials in the denominator, and there
        are none.
      </>
    ),
    theory: <>1/R = lim|aₙ₊₁/aₙ| on the coefficients — then invert. Polynomial factors like n² never change R.</>,
  },
  {
    id: "ma2-ser-q14",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The full interval of convergence of <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n^2}"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"(-1, 1)"}</Tex> },
      { id: "B", content: <Tex>{"[-1, 1)"}</Tex> },
      { id: "C", content: <Tex>{"[-1, 1]"}</Tex> },
      { id: "D", content: <Tex>{"(-1, 1]"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Ratio on coefficients: <Tex>{"\\tfrac{n^2}{(n+1)^2} \\to 1"}</Tex> so <Tex>{"R=1"}</Tex>. At{" "}
        <Tex>{"x=1"}</Tex>: <Tex>{"\\sum 1/n^2"}</Tex> converges (p = 2). At <Tex>{"x=-1"}</Tex>:{" "}
        <Tex>{"\\sum (-1)^n/n^2"}</Tex> converges absolutely. Both endpoints in ⇒ closed interval{" "}
        <Tex>{"[-1,1]"}</Tex> — answer C. A skips the endpoint checks; B and D each wrongly exclude an
        endpoint that actually converges.
      </>
    ),
    theory: <>R gives the open interval; the two endpoint series decide the brackets, one by one.</>,
  },
  {
    id: "ma2-ser-q15",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Which is the Maclaurin series of <Tex>{"\\ln(1+x)"}</Tex>?
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\sum_{n=1}^{\\infty} (-1)^{n+1}\\dfrac{x^n}{n}"}</Tex> },
      { id: "B", content: <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n}"}</Tex> },
      { id: "C", content: <Tex>{"\\sum_{n=1}^{\\infty} (-1)^{n}\\dfrac{x^n}{n}"}</Tex> },
      { id: "D", content: <Tex>{"\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\ln(1+x) = x - \\tfrac{x^2}{2} + \\tfrac{x^3}{3} - \\cdots"}</Tex>: the first term{" "}
        <Tex>{"+x"}</Tex> forces the sign factor <Tex>{"(-1)^{n+1}"}</Tex> — answer A. B has all plus
        signs: that is <Tex>{"-\\ln(1-x)"}</Tex>. C starts with <Tex>{"-x"}</Tex>: it is{" "}
        <Tex>{"-\\ln(1+x)"}</Tex>. D has factorials — that is <Tex>{"e^x"}</Tex>.
      </>
    ),
    theory: <>Check the first term to fix signs: ln(1+x) starts +x, so odd n carries the plus sign.</>,
  },
  {
    id: "ma2-ser-q16",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The full interval of convergence of <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n}"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"[-1, 1]"}</Tex> },
      { id: "B", content: <Tex>{"(-1, 1)"}</Tex> },
      { id: "C", content: <Tex>{"(-1, 1]"}</Tex> },
      { id: "D", content: <Tex>{"[-1, 1)"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"R=1"}</Tex> (ratio <Tex>{"\\tfrac{n}{n+1}\\to1"}</Tex>). At <Tex>{"x=1"}</Tex>: the
        harmonic series — diverges, so 1 is excluded. At <Tex>{"x=-1"}</Tex>:{" "}
        <Tex>{"\\sum(-1)^n/n"}</Tex> — converges by Leibniz, so −1 is included. Interval{" "}
        <Tex>{"[-1,1)"}</Tex> — answer D. A includes the divergent endpoint; B throws away the
        convergent one; C has the asymmetry backwards — the <em>minus</em> side is the alternating
        (convergent) one.
      </>
    ),
    theory: <>Endpoints of Σxⁿ/n: +R gives the harmonic series, −R the alternating one — they disagree.</>,
  },
  {
    id: "ma2-ser-q17",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Using <Tex>{"\\sum_{n=1}^{\\infty} n x^n = \\dfrac{x}{(1-x)^2}"}</Tex> for <Tex>{"|x| < 1"}</Tex>,
        the sum <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n}{2^n}"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"1"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac32"}</Tex> },
      { id: "C", content: <Tex>{"2"}</Tex> },
      { id: "D", content: <Tex>{"4"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Set <Tex>{"x=\\tfrac12"}</Tex> (inside <Tex>{"R=1"}</Tex>, so legal):{" "}
        <Tex>{"\\dfrac{1/2}{(1-1/2)^2} = \\dfrac{1/2}{1/4} = 2"}</Tex> — answer C. A is the plain
        geometric sum <Tex>{"\\sum (1/2)^n"}</Tex> without the factor n; B is an arithmetic slip{" "}
        (<Tex>{"\\tfrac{1/2}{1/3}"}</Tex>-style); D squares wrongly, using <Tex>{"(1-x)^2 = \\tfrac18"}</Tex>.
      </>
    ),
    theory: <>Σn xⁿ = x/(1−x)² comes from differentiating the geometric series — evaluate only inside |x| below 1.</>,
  },
  {
    id: "ma2-ser-q18",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        For which values of <Tex>{"p"}</Tex> does{" "}
        <Tex>{"\\sum_{n=2}^{\\infty} \\dfrac{1}{n\\, (\\ln n)^p}"}</Tex> converge?
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"p \\ge 1"}</Tex> },
      { id: "B", content: <Tex>{"p > 1"}</Tex> },
      { id: "C", content: <Tex>{"p > 0"}</Tex> },
      { id: "D", content: <>No value of p — it always diverges.</> },
    ],
    correct: "B",
    explanation: (
      <>
        Integral test with <Tex>{"u = \\ln x,\\ du = dx/x"}</Tex>:{" "}
        <Tex>{"\\int_2^{\\infty} \\tfrac{dx}{x(\\ln x)^p} = \\int_{\\ln 2}^{\\infty} u^{-p}\\,du"}</Tex>,
        finite exactly when <Tex>{"p > 1"}</Tex> — answer B. A fails at <Tex>{"p=1"}</Tex>, where the
        antiderivative <Tex>{"\\ln(\\ln x)"}</Tex> still diverges (slowly!). C fails for e.g.{" "}
        <Tex>{"p=\\tfrac12"}</Tex>. D is wrong: <Tex>{"p=2"}</Tex> converges. Note that comparison with
        any pure p-series is inconclusive here — this family sits exactly between{" "}
        <Tex>{"\\sum \\tfrac1n"}</Tex> and every <Tex>{"\\sum \\tfrac{1}{n^{1+\\varepsilon}}"}</Tex>.
      </>
    ),
    theory: <>Log-scale series Σ1/(n lnᵖn): integral test, u = ln x, converges iff p is above 1.</>,
  },
  {
    id: "ma2-ser-q19",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Apply the root test to <Tex>{"\\sum_{n=1}^{\\infty} \\left(1+\\dfrac1n\\right)^{\\!-n^2}"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"L = e"}</Tex> — diverges.</> },
      { id: "B", content: <><Tex>{"L = 1"}</Tex> — inconclusive.</> },
      { id: "C", content: <><Tex>{"L = \\tfrac1e"}</Tex> — converges.</> },
      { id: "D", content: <>Converges, simply because the terms tend to 0.</> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"\\sqrt[n]{a_n} = \\left(1+\\tfrac1n\\right)^{\\!-n} = \\dfrac{1}{(1+1/n)^n} \\to \\dfrac1e \\approx 0.37"}</Tex>,
        below 1 ⇒ converges — answer C. A inverts the limit; B misses that the exponent{" "}
        <Tex>{"n^2"}</Tex> leaves a factor <Tex>{"n"}</Tex> after the root, producing the{" "}
        <Tex>{"e"}</Tex>-limit rather than 1; D is invalid reasoning — terms tending to 0 never proves
        convergence on its own.
      </>
    ),
    theory: <>Exponent n² under a root test leaves (…)ⁿ — expect the limit (1+1/n)ⁿ → e to appear.</>,
  },
  {
    id: "ma2-ser-q20",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The series <Tex>{"\\sum_{n=1}^{\\infty} (-1)^n \\dfrac{n}{n^2+1}"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <>Converges absolutely.</> },
      { id: "B", content: <>Diverges — the terms do not tend to 0.</> },
      { id: "C", content: <>Diverges — because <Tex>{"\\sum \\dfrac{n}{n^2+1}"}</Tex> diverges.</> },
      { id: "D", content: <>Converges conditionally.</> },
    ],
    correct: "D",
    explanation: (
      <>
        Absolute series: <Tex>{"\\tfrac{n}{n^2+1} \\sim \\tfrac1n"}</Tex> ⇒ diverges, so no absolute
        convergence (kills A). Leibniz: the terms are positive, tend to 0, and decrease for{" "}
        <Tex>{"n \\ge 1"}</Tex> (the derivative of <Tex>{"\\tfrac{x}{x^2+1}"}</Tex> is{" "}
        <Tex>{"\\tfrac{1-x^2}{(x^2+1)^2} \\le 0"}</Tex> from <Tex>{"x=1"}</Tex> on) ⇒ the alternating
        series converges. Conditionally convergent — answer D. B is false:{" "}
        <Tex>{"\\tfrac{n}{n^2+1}\\to0"}</Tex>. C repeats the absolute-divergence trap — that only rules
        out <em>absolute</em> convergence.
      </>
    ),
    theory: <>Classify in order: Σ|aₙ| (here ~ Σ1/n, diverges) → Leibniz (verify decreasing via derivative) → conditional.</>,
  },
];

/* ==================================================================== *
 * EXAM PROBLEMS
 * ==================================================================== */
export const exam: ExamProblem[] = [
  {
    id: "ma2-ser-e1",
    title: "Convergence with a parameter α",
    meta: "Series · ~10 pts · written-exam style",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Determine for which values of the real parameter <Tex>{"\\alpha"}</Tex> the series{" "}
        <Tex>{"\\sum_{n=1}^{\\infty} \\left(\\sqrt{n+1} - \\sqrt{n}\\right)^{\\alpha}"}</Tex> converges.
      </>
    ),
    given: (
      <>
        <Tex>{"a_n = (\\sqrt{n+1}-\\sqrt{n})^{\\alpha}"}</Tex> — note the base is positive, so{" "}
        <Tex>{"a_n > 0"}</Tex> for every real <Tex>{"\\alpha"}</Tex>: a positive-term series.
      </>
    ),
    steps: [
      {
        title: "Rewrite the base (rationalize)",
        content: (
          <>
            Multiply and divide by the conjugate:{" "}
            <Tex>{"\\sqrt{n+1}-\\sqrt{n} = \\dfrac{(n+1)-n}{\\sqrt{n+1}+\\sqrt{n}} = \\dfrac{1}{\\sqrt{n+1}+\\sqrt{n}}"}</Tex>.
            The mysterious difference is really a reciprocal — and it tends to 0.
          </>
        ),
      },
      {
        title: "Dispose of α ≤ 0 with the necessary condition",
        content: (
          <>
            The base tends to <Tex>{"0^+"}</Tex>. If <Tex>{"\\alpha = 0"}</Tex>, then{" "}
            <Tex>{"a_n \\equiv 1"}</Tex>; if <Tex>{"\\alpha < 0"}</Tex>, then{" "}
            <Tex>{"a_n = (\\sqrt{n+1}+\\sqrt{n})^{|\\alpha|} \\to +\\infty"}</Tex>. Either way{" "}
            <Tex>{"a_n \\not\\to 0"}</Tex>: the series <strong>diverges for all</strong>{" "}
            <Tex>{"\\alpha \\le 0"}</Tex>.
          </>
        ),
      },
      {
        title: "Find the asymptotic size for α > 0",
        content: (
          <>
            Since <Tex>{"\\sqrt{n+1} \\sim \\sqrt{n}"}</Tex>, we have{" "}
            <Tex>{"\\sqrt{n+1}+\\sqrt{n} \\sim 2\\sqrt{n}"}</Tex>, hence{" "}
            <Tex>{"a_n \\sim \\dfrac{1}{(2\\sqrt{n})^{\\alpha}} = \\dfrac{2^{-\\alpha}}{n^{\\alpha/2}}"}</Tex>.
            The constant <Tex>{"2^{-\\alpha}"}</Tex> is irrelevant to convergence.
          </>
        ),
      },
      {
        title: "Asymptotic comparison with the p-series",
        content: (
          <>
            The series behaves exactly like <Tex>{"\\sum n^{-\\alpha/2}"}</Tex>, which converges iff{" "}
            <Tex>{"\\tfrac{\\alpha}{2} > 1"}</Tex>, i.e. <Tex>{"\\alpha > 2"}</Tex>. Borderline check:
            at <Tex>{"\\alpha = 2"}</Tex>, <Tex>{"a_n \\sim \\tfrac{1}{4n}"}</Tex> — harmonic behaviour,
            divergent. So the boundary is excluded.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        The series converges <strong>if and only if</strong> <Tex>{"\\alpha > 2"}</Tex> (and the
        convergence is absolute, the terms being positive).
      </>
    ),
    tips: (
      <>
        Rationalizing <Tex>{"\\sqrt{n+1}-\\sqrt{n}"}</Tex> is the expected first move — attempting
        ratio or root tests directly leads nowhere (both give <Tex>{"L=1"}</Tex>). Marks are routinely
        lost by ignoring <Tex>{"\\alpha \\le 0"}</Tex> and by failing to discuss the borderline{" "}
        <Tex>{"\\alpha = 2"}</Tex> explicitly.
      </>
    ),
  },
  {
    id: "ma2-ser-e2",
    title: "Radius and interval of convergence",
    meta: "Power series · ~9 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Find the radius of convergence and the <em>full</em> interval of convergence of{" "}
        <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n\\,2^n}"}</Tex>, classifying the behaviour at each
        endpoint.
      </>
    ),
    given: (
      <>
        Coefficients <Tex>{"a_n = \\dfrac{1}{n\\,2^n}"}</Tex>, centre <Tex>{"x_0 = 0"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "Radius via the ratio test",
        content: (
          <>
            <Tex>{"\\left|\\dfrac{a_{n+1}}{a_n}\\right| = \\dfrac{n\\,2^n}{(n+1)\\,2^{n+1}} = \\dfrac12\\cdot\\dfrac{n}{n+1} \\;\\to\\; \\dfrac12"}</Tex>,
            so <Tex>{"R = 1/(1/2) = 2"}</Tex>: absolute convergence for <Tex>{"|x| < 2"}</Tex>,
            divergence for <Tex>{"|x| > 2"}</Tex>.
          </>
        ),
      },
      {
        title: "Endpoint x = 2",
        content: (
          <>
            Substitute: <Tex>{"\\sum \\dfrac{2^n}{n\\,2^n} = \\sum \\dfrac{1}{n}"}</Tex> — the harmonic
            series. <strong>Diverges</strong>; the endpoint <Tex>{"x=2"}</Tex> is excluded.
          </>
        ),
      },
      {
        title: "Endpoint x = −2",
        content: (
          <>
            Substitute: <Tex>{"\\sum \\dfrac{(-2)^n}{n\\,2^n} = \\sum \\dfrac{(-1)^n}{n}"}</Tex> — the
            alternating harmonic series. Leibniz (<Tex>{"\\tfrac1n \\downarrow 0"}</Tex>) ⇒{" "}
            <strong>converges</strong>; not absolutely (the absolute series is harmonic) ⇒ the
            convergence at <Tex>{"x=-2"}</Tex> is <strong>conditional</strong>.
          </>
        ),
      },
      {
        title: "Assemble the interval",
        content: (
          <>
            Interval of convergence: <Tex>{"[-2, 2)"}</Tex>. Absolute convergence on{" "}
            <Tex>{"(-2,2)"}</Tex>, conditional at <Tex>{"x=-2"}</Tex>, divergence at <Tex>{"x=2"}</Tex>{" "}
            and beyond. (Remark: on this interval the sum is{" "}
            <Tex>{"-\\ln\\!\\left(1-\\tfrac{x}{2}\\right)"}</Tex>, from the <Tex>{"\\ln"}</Tex>{" "}
            expansion with <Tex>{"t = x/2"}</Tex>.)
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"R = 2"}</Tex>; interval of convergence <Tex>{"[-2, 2)"}</Tex> — conditional convergence
        at <Tex>{"x = -2"}</Tex>, divergence at <Tex>{"x = 2"}</Tex>.
      </>
    ),
    tips: (
      <>
        The endpoints are where the marks live: the ratio test is structurally silent at{" "}
        <Tex>{"|x| = R"}</Tex>, so a bare “<Tex>{"R=2"}</Tex>” earns half credit at best. Check both
        endpoints, name the series you obtain (harmonic / alternating harmonic), and state the{" "}
        <em>type</em> of convergence at any endpoint you include.
      </>
    ),
  },
  {
    id: "ma2-ser-e3",
    title: "Sum a series exactly via a power series",
    meta: "Power series · ~8 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Compute exactly: <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n}{3^n}"}</Tex>.
      </>
    ),
    given: (
      <>
        Geometric series: <Tex>{"\\sum_{n=0}^{\\infty} x^n = \\dfrac{1}{1-x}"}</Tex> for{" "}
        <Tex>{"|x| < 1"}</Tex>; term-by-term differentiation is valid inside the interval of
        convergence.
      </>
    ),
    steps: [
      {
        title: "Recognize a power series in disguise",
        content: (
          <>
            <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n}{3^n} = \\sum_{n=1}^{\\infty} n\\left(\\tfrac13\\right)^{\\!n}"}</Tex>{" "}
            — this is <Tex>{"\\sum n x^n"}</Tex> evaluated at <Tex>{"x = \\tfrac13"}</Tex>. So first sum
            the <em>function</em>, then substitute.
          </>
        ),
      },
      {
        title: "Differentiate the geometric series term by term",
        content: (
          <>
            For <Tex>{"|x| < 1"}</Tex>:{" "}
            <Tex>{"\\dfrac{d}{dx}\\sum_{n=0}^{\\infty} x^n = \\sum_{n=1}^{\\infty} n x^{n-1} = \\dfrac{d}{dx}\\left(\\dfrac{1}{1-x}\\right) = \\dfrac{1}{(1-x)^2}"}</Tex>.
            The differentiated series keeps the same radius <Tex>{"R=1"}</Tex>.
          </>
        ),
      },
      {
        title: "Multiply by x",
        content: (
          <>
            <Tex>{"\\sum_{n=1}^{\\infty} n x^n = x\\sum_{n=1}^{\\infty} n x^{n-1} = \\dfrac{x}{(1-x)^2}"}</Tex>{" "}
            for <Tex>{"|x| < 1"}</Tex>.
          </>
        ),
      },
      {
        title: "Evaluate at x = 1/3",
        content: (
          <>
            Since <Tex>{"\\tfrac13"}</Tex> is inside the interval of convergence, substitution is
            legitimate:{" "}
            <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n}{3^n} = \\dfrac{1/3}{(1-1/3)^2} = \\dfrac{1/3}{4/9} = \\dfrac34"}</Tex>.
            Sanity check: <Tex>{"\\tfrac13 + \\tfrac29 + \\tfrac{3}{27} + \\tfrac{4}{81} \\approx 0.716"}</Tex>,
            heading for <Tex>{"0.75"}</Tex>. ✓
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"\\displaystyle\\sum_{n=1}^{\\infty} \\frac{n}{3^n} = \\frac{3}{4}"}</Tex>
      </>
    ),
    tips: (
      <>
        Two lines earn the method marks: “differentiate the geometric series term by term, valid for{" "}
        <Tex>{"|x| < 1"}</Tex>” and “<Tex>{"x=\\tfrac13"}</Tex> lies inside the interval, so evaluation
        is allowed”. Omitting the justification of term-by-term differentiation — or evaluating a
        formula at a point outside its interval — is where this problem sheds points.
      </>
    ),
  },
];
