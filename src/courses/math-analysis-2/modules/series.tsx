import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { PartialSumsSim } from "../sims/PartialSumsSim";

export const MODULE = "Series & power series";

/* ================= Test-picker table for the tests lesson ========== */
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
            <td className={TD}>converges (p = 2)</td>
          </tr>
          <tr>
            <td className={TD}>
              factorials, <Tex>{"c^n"}</Tex>
            </td>
            <td className={TD + " font-semibold"}>ratio test</td>
            <td className={TDM}>
              <Tex>{"\\sum \\tfrac{3^n}{n!},\\ L = 0"}</Tex>
            </td>
            <td className={TD}>converges</td>
          </tr>
          <tr>
            <td className={TD}>
              a whole <Tex>{"(\\cdots)^n"}</Tex> power
            </td>
            <td className={TD + " font-semibold"}>root test</td>
            <td className={TDM}>
              <Tex>{"\\sum \\left(\\tfrac{n}{2n+1}\\right)^{\\!n},\\ L = \\tfrac12"}</Tex>
            </td>
            <td className={TD}>converges</td>
          </tr>
          <tr>
            <td className={TD}>
              <Tex>{"f(n)"}</Tex> with f positive, decreasing
            </td>
            <td className={TD + " font-semibold"}>integral test</td>
            <td className={TDM}>
              <Tex>{"\\sum \\tfrac{1}{n \\ln^2 n}"}</Tex>
            </td>
            <td className={TD}>converges</td>
          </tr>
          <tr>
            <td className={TD}>sin, cos, ln, exp of small arguments</td>
            <td className={TD + " font-semibold"}>equivalents first</td>
            <td className={TDM}>
              <Tex>{"\\sin\\tfrac{1}{n} \\sim \\tfrac{1}{n}"}</Tex>
            </td>
            <td className={TD}>diverges (p = 1)</td>
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
        ln 2 ≈ 0.6931
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

/* =================== Maclaurin catalogue for lesson 4 =============== */
function MaclaurinTable() {
  const rows: [string, string, string][] = [
    ["e^x", "\\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\cdots", "\\text{all } x"],
    ["\\sin x", "\\sum_{n=0}^{\\infty} (-1)^n \\frac{x^{2n+1}}{(2n+1)!} = x - \\frac{x^3}{3!} + \\cdots", "\\text{all } x"],
    ["\\cos x", "\\sum_{n=0}^{\\infty} (-1)^n \\frac{x^{2n}}{(2n)!} = 1 - \\frac{x^2}{2!} + \\cdots", "\\text{all } x"],
    ["\\frac{1}{1-x}", "\\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + \\cdots", "|x| < 1"],
    ["\\ln(1+x)", "\\sum_{n=1}^{\\infty} (-1)^{n+1} \\frac{x^n}{n} = x - \\frac{x^2}{2} + \\cdots", "-1 < x \\le 1"],
    ["(1+x)^{\\alpha}", "\\sum_{n=0}^{\\infty} \\binom{\\alpha}{n} x^n = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!}x^2 + \\cdots", "|x| < 1"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Function</th>
            <th className="border-b border-[var(--color-line)] p-2">Maclaurin series</th>
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
   * LESSON 1 — Numerical series: partial sums & geometric series
   * ================================================================ */
  {
    id: "numerical-series",
    title: "Numerical series: partial sums, geometric & telescoping",
    lecture: MODULE,
    summary:
      "An infinite sum is a limit of partial sums — and that definition already sums geometric and telescoping series exactly, and exposes the harmonic surprise.",
    minutes: 20,
    objectives: [
      "Define convergence of a series through its partial sums",
      "Sum any geometric series exactly (and know when it diverges)",
      "Collapse and sum a telescoping series",
      "Apply the necessary condition aₙ → 0 — and explain why the harmonic series defeats its converse",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            You cannot literally add infinitely many numbers — no process ever finishes. What you{" "}
            <em>can</em> do is add the first <Tex>{"N"}</Tex> of them, watch the running total as{" "}
            <Tex>{"N"}</Tex> grows, and ask whether it settles. An infinite series is therefore not a
            new kind of addition: it is a <strong>limit of a sequence</strong>, the sequence of
            partial sums. Every theorem in this module is secretly a statement about that sequence.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Series, partial sums, convergence",
        content: (
          <>
            Given a sequence <Tex>{"(a_n)"}</Tex>, its <strong>partial sums</strong> are{" "}
            <Tex>{"S_N = a_1 + a_2 + \\cdots + a_N"}</Tex>. The series{" "}
            <Tex>{"\\sum_{n=1}^{\\infty} a_n"}</Tex> <strong>converges</strong> with sum{" "}
            <Tex>{"S"}</Tex> if <Tex>{"\\lim_{N\\to\\infty} S_N = S"}</Tex> (finite). If{" "}
            <Tex>{"S_N \\to \\pm\\infty"}</Tex> or has no limit at all, the series{" "}
            <strong>diverges</strong>.
          </>
        ),
      },
      { kind: "heading", text: "Geometric series — the one you can always sum" },
      {
        kind: "prose",
        content: (
          <p>
            Take <Tex>{"a_n = q^n"}</Tex>. The trick that unlocks everything: multiply the partial sum
            by <Tex>{"q"}</Tex> and subtract. In{" "}
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
        tex: "\\sum_{n=0}^{\\infty} q^n = \\frac{1}{1-q} \\quad \\text{for } |q| < 1, \\qquad\\quad \\sum_{n=1}^{\\infty} q^n = \\frac{q}{1-q}",
        tag: "7.2",
        caption: (
          <>
            For <Tex>{"|q| < 1"}</Tex> the term <Tex>{"q^{N+1}\\to 0"}</Tex> and the sum is finite. For{" "}
            <Tex>{"|q| \\ge 1"}</Tex> the terms do not shrink and the series diverges.
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
        kind: "example",
        title: "Worked example — a geometric series in disguise",
        content: (
          <>
            <p>
              Compute <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{2^{2n}}{5^n}"}</Tex>.
            </p>
            <p>
              Rewrite the term: <Tex>{"\\dfrac{2^{2n}}{5^n} = \\dfrac{4^n}{5^n} = \\left(\\dfrac{4}{5}\\right)^{\\!n}"}</Tex>.
              This is geometric with <Tex>{"q = \\tfrac45"}</Tex>, and <Tex>{"|q| < 1"}</Tex>, starting
              at <Tex>{"n=1"}</Tex>:
            </p>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty} \\left(\\tfrac45\\right)^{\\!n} = \\dfrac{4/5}{1-4/5} = \\dfrac{4/5}{1/5} = 4."}</Tex>
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
            <Tex>{"\\pi^2/6"}</Tex>, and the alternating harmonic zigzags onto <Tex>{"\\ln 2"}</Tex>.
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
            dies with <Tex>{"\\lim b_{N+1}"}</Tex>.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the classic telescope",
        content: (
          <>
            <p>
              Compute <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{1}{n(n+1)}"}</Tex>. Partial fractions give{" "}
              <Tex>{"\\dfrac{1}{n(n+1)} = \\dfrac{1}{n} - \\dfrac{1}{n+1}"}</Tex>, so
            </p>
            <p>
              <Tex>{"S_N = \\left(1 - \\tfrac12\\right) + \\left(\\tfrac12 - \\tfrac13\\right) + \\cdots + \\left(\\tfrac{1}{N} - \\tfrac{1}{N+1}\\right) = 1 - \\tfrac{1}{N+1}."}</Tex>
            </p>
            <p>
              As <Tex>{"N\\to\\infty"}</Tex>, <Tex>{"S_N \\to 1"}</Tex>: the series converges and its
              sum is exactly <Tex>{"1"}</Tex>.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "The necessary condition — and its famous failure" },
      {
        kind: "callout",
        tone: "key",
        title: "Necessary condition (divergence test)",
        content: (
          <>
            If <Tex>{"\\sum a_n"}</Tex> converges, then <Tex>{"a_n \\to 0"}</Tex> (because{" "}
            <Tex>{"a_n = S_n - S_{n-1} \\to S - S = 0"}</Tex>). Contrapositive — your fastest weapon:
            if <Tex>{"a_n \\not\\to 0"}</Tex>, the series <strong>diverges</strong>, no further test
            needed. But the converse is <strong>false</strong>: <Tex>{"a_n \\to 0"}</Tex> alone proves
            nothing.
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
            <Tex>{"\\sum 1/n"}</Tex> diverges — glacially (about <Tex>{"\\ln N"}</Tex>), but surely.
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
                Does <Tex>{"a_n \\to 0"}</Tex>? If not, write “diverges by the necessary condition” and
                stop.
              </>
            ),
          },
          {
            label: "Exact forms",
            content: (
              <>
                Is it geometric (sum with (7.2), minding the start index) or telescoping (collapse{" "}
                <Tex>{"S_N"}</Tex>)? Then you get the exact sum, not just a verdict.
              </>
            ),
          },
          {
            label: "Otherwise, classify",
            content: (
              <>
                Positive terms → the tests of the next lesson. Alternating signs → Leibniz. Mixed signs
                → study absolute convergence.
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
            Geometric and telescoping series are the only ones you will routinely sum{" "}
            <em>exactly</em> (power series will add a few more later). For everything else the exam
            question is binary — converge or diverge? — and answering it is the job of the{" "}
            <strong>convergence tests</strong>.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — Positive-term series: the tests
   * ================================================================ */
  {
    id: "positive-series-tests",
    title: "Positive-term series: comparison, ratio, root, integral",
    lecture: MODULE,
    summary:
      "For positive terms the partial sums only go up — so a handful of tests, anchored on the p-series, decides every convergence question.",
    minutes: 25,
    objectives: [
      "State and use the p-series criterion (converges exactly for p above 1)",
      "Decide convergence by comparison and — the workhorse — asymptotic comparison with equivalents",
      "Run the ratio and root tests and know when each is the right tool",
      "Recognize when a test is inconclusive (L = 1) and switch strategy",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            When every <Tex>{"a_n \\ge 0"}</Tex>, the partial sums can only increase. A monotone
            sequence has exactly two fates: it is bounded and converges, or it blows up to{" "}
            <Tex>{"+\\infty"}</Tex>. No oscillation, no third option. Every test in this lesson is a
            way of deciding <em>which</em> fate — usually by comparing your series against one whose
            fate is known.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Why positive terms are easy",
        content: (
          <>
            For <Tex>{"a_n \\ge 0"}</Tex>: <Tex>{"\\sum a_n"}</Tex> converges{" "}
            <Tex>{"\\iff"}</Tex> the partial sums are bounded above. This is why bounding a series by
            another one settles the question — and why all comparison-type tests exist.
          </>
        ),
      },
      { kind: "heading", text: "The measuring stick: p-series" },
      {
        kind: "formula",
        tex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^p} \\;\\; \\begin{cases} \\text{converges} & p > 1 \\\\[2pt] \\text{diverges} & p \\le 1 \\end{cases}",
        tag: "7.4",
        caption: (
          <>
            The reference family. <Tex>{"p=1"}</Tex> is the harmonic series (diverges);{" "}
            <Tex>{"p=2"}</Tex> converges to <Tex>{"\\pi^2/6"}</Tex>. The boundary is strict: even{" "}
            <Tex>{"p = 1.001"}</Tex> converges.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Where (7.4) comes from: the integral test",
        content: (
          <>
            If <Tex>{"f"}</Tex> is positive, decreasing and continuous on <Tex>{"[1,\\infty)"}</Tex>{" "}
            with <Tex>{"a_n = f(n)"}</Tex>, then <Tex>{"\\sum a_n"}</Tex> and{" "}
            <Tex>{"\\int_1^{\\infty} f(x)\\,dx"}</Tex> converge or diverge <strong>together</strong>{" "}
            (the sum is squeezed between two integrals). For <Tex>{"f(x)=x^{-p}"}</Tex> the integral is
            finite exactly when <Tex>{"p > 1"}</Tex> — that is (7.4). The test also handles logarithmic
            series like <Tex>{"\\sum \\tfrac{1}{n\\ln n}"}</Tex> (substitute <Tex>{"u=\\ln x"}</Tex>:
            diverges) that no comparison with a pure p-series can resolve.
          </>
        ),
      },
      { kind: "heading", text: "Comparison & asymptotic comparison" },
      {
        kind: "definition",
        term: "Comparison test",
        content: (
          <>
            Suppose <Tex>{"0 \\le a_n \\le b_n"}</Tex> (eventually). If <Tex>{"\\sum b_n"}</Tex>{" "}
            converges, so does <Tex>{"\\sum a_n"}</Tex>; if <Tex>{"\\sum a_n"}</Tex> diverges, so does{" "}
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
        term: "Asymptotic comparison (the workhorse)",
        content: (
          <>
            Let <Tex>{"a_n, b_n > 0"}</Tex>. If <Tex>{"\\dfrac{a_n}{b_n} \\to c"}</Tex> with{" "}
            <Tex>{"0 < c < +\\infty"}</Tex> — in particular whenever <Tex>{"a_n \\sim b_n"}</Tex> — then{" "}
            <Tex>{"\\sum a_n"}</Tex> and <Tex>{"\\sum b_n"}</Tex> have the <strong>same</strong>{" "}
            behaviour. In practice: replace <Tex>{"a_n"}</Tex> by its equivalent as{" "}
            <Tex>{"n\\to\\infty"}</Tex> (keep leading powers, use the Analysis I equivalents for sin,
            ln, exp) and read the verdict off the p-series (7.4).
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — equivalents in action",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum \\sin\\dfrac{1}{n}"}</Tex>: since{" "}
              <Tex>{"\\sin t \\sim t"}</Tex> as <Tex>{"t\\to0"}</Tex>, we get{" "}
              <Tex>{"\\sin\\tfrac1n \\sim \\tfrac1n"}</Tex>. Same behaviour as the harmonic series ⇒{" "}
              <strong>diverges</strong>.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\left(1 - \\cos\\dfrac{1}{n}\\right)"}</Tex>: since{" "}
              <Tex>{"1-\\cos t \\sim \\tfrac{t^2}{2}"}</Tex>, the terms behave like{" "}
              <Tex>{"\\tfrac{1}{2n^2}"}</Tex>. Same behaviour as <Tex>{"\\sum 1/n^2"}</Tex> ⇒{" "}
              <strong>converges</strong>.
            </p>
            <p>
              Note how the necessary condition could not separate these: both terms tend to 0. The{" "}
              <em>speed</em> at which they vanish is what decides.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Ratio & root tests" },
      {
        kind: "formula",
        tex: "\\text{Ratio: } L = \\lim_{n\\to\\infty} \\frac{a_{n+1}}{a_n} \\qquad \\begin{cases} L < 1 & \\text{converges} \\\\ L > 1 \\ (\\text{or } \\infty) & \\text{diverges} \\\\ L = 1 & \\text{no conclusion} \\end{cases}",
        tag: "7.5",
        caption: <>Built for factorials and powers: the ratio kills <Tex>{"n!"}</Tex> and <Tex>{"c^n"}</Tex> cleanly.</>,
      },
      {
        kind: "formula",
        tex: "\\text{Root: } L = \\lim_{n\\to\\infty} \\sqrt[n]{a_n} \\qquad \\text{same verdicts as (7.5)}",
        tag: "7.6",
        caption: (
          <>
            Built for terms that are a whole <Tex>{"n"}</Tex>-th power. Useful limit:{" "}
            <Tex>{"\\sqrt[n]{n} \\to 1"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "L = 1: the tests go silent",
        content: (
          <>
            Both <Tex>{"\\sum \\tfrac1n"}</Tex> (diverges) and <Tex>{"\\sum \\tfrac1{n^2}"}</Tex>{" "}
            (converges) give <Tex>{"L=1"}</Tex> in the ratio <em>and</em> root tests. Any series whose
            term is a ratio of powers of <Tex>{"n"}</Tex> will land on <Tex>{"L=1"}</Tex> — using
            ratio/root there is wasted ink. That territory belongs to asymptotic comparison.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — ratio test on a classic",
        content: (
          <>
            <p>
              Study <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n!}{n^n}"}</Tex>. Compute the ratio:
            </p>
            <p>
              <Tex>{"\\dfrac{a_{n+1}}{a_n} = \\dfrac{(n+1)!}{(n+1)^{n+1}} \\cdot \\dfrac{n^n}{n!} = \\dfrac{(n+1)\\,n^n}{(n+1)^{n+1}} = \\left(\\dfrac{n}{n+1}\\right)^{\\!n} = \\dfrac{1}{(1+1/n)^n} \\;\\to\\; \\dfrac{1}{e}."}</Tex>
            </p>
            <p>
              Since <Tex>{"L = 1/e \\approx 0.37"}</Tex> is below 1, the series{" "}
              <strong>converges</strong>. (Bonus fact worth memorizing: against factorials and{" "}
              <Tex>{"n^n"}</Tex>, the ratio test almost always produces <Tex>{"e"}</Tex> somewhere.)
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <TestTable />,
        caption: "Test selection at a glance: read the shape of the term, pick the tool built for it.",
      },
      {
        kind: "steps",
        title: "Choosing the right test",
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
                Powers/roots of <Tex>{"n"}</Tex> → asymptotic comparison with a p-series. Factorials or{" "}
                <Tex>{"c^n"}</Tex> → ratio. A whole <Tex>{"(\\cdots)^n"}</Tex> → root. Decreasing{" "}
                <Tex>{"f(n)"}</Tex> with an easy antiderivative (logs!) → integral test.
              </>
            ),
          },
          {
            label: "Simplify first",
            content: (
              <>
                Replace sin/cos/ln/exp of small arguments by their equivalents before comparing —{" "}
                <Tex>{"\\sin\\tfrac1n \\sim \\tfrac1n"}</Tex>, <Tex>{"\\ln(1+\\tfrac1n) \\sim \\tfrac1n"}</Tex>,{" "}
                <Tex>{"1-\\cos\\tfrac1n \\sim \\tfrac1{2n^2}"}</Tex>.
              </>
            ),
          },
          {
            label: "If L = 1, change tool",
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
              and <Tex>{"\\sum 1/n^2"}</Tex> converges (p = 2) — answer A. B is false: the ratio test
              gives <Tex>{"L=1"}</Tex> here (polynomial terms), no verdict. C mis-cancels the degrees
              (3 − 1 = 2, not 1). D is false — the terms clearly vanish.
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
              The ratio test applied to <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{n!}{100^n}"}</Tex> gives:
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"L = 0"}</Tex> — converges.</> },
            { id: "B", content: <><Tex>{"L = 1"}</Tex> — inconclusive.</> },
            { id: "C", content: <><Tex>{"L = \\tfrac{1}{100}"}</Tex> — converges.</> },
            { id: "D", content: <><Tex>{"L = +\\infty"}</Tex> — diverges.</> },
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
          theory: <>Growth ladder: n! beats cⁿ beats n^p beats ln n. The ratio test formalizes it.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            These tests assume positive terms. The moment signs start alternating, cancellation enters
            the game and a series can converge <em>because of</em> its signs — that is the next
            lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — Alternating series & absolute convergence
   * ================================================================ */
  {
    id: "alternating-series",
    title: "Alternating series, Leibniz & absolute convergence",
    lecture: MODULE,
    summary:
      "Alternating signs create cancellation: Leibniz turns 'decreasing to zero' into convergence, with a built-in error bound — and the harmonic series converges once you alternate it.",
    minutes: 18,
    objectives: [
      "Apply the Leibniz criterion to alternating series",
      "Bound the truncation error by the first omitted term",
      "Distinguish absolute from conditional convergence and classify a series",
      "Explain why the alternating harmonic series converges to ln 2 while the harmonic diverges",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Everything so far pushed the partial sums one way — up. An <strong>alternating</strong>{" "}
            series <Tex>{"\\sum (-1)^{n+1} a_n"}</Tex> (with <Tex>{"a_n > 0"}</Tex>) pushes them up,
            then down, then up… If the push sizes <Tex>{"a_n"}</Tex> shrink to zero{" "}
            <em>monotonically</em>, each swing overshoots the target by less than the one before, and
            the sums are squeezed onto a limit. That intuition is a theorem:
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Leibniz criterion (alternating series test)",
        content: (
          <>
            If <Tex>{"(a_n)"}</Tex> is <strong>positive</strong>, <strong>decreasing</strong> (at least
            eventually) and <Tex>{"a_n \\to 0"}</Tex>, then{" "}
            <Tex>{"\\sum_{n=1}^{\\infty} (-1)^{n+1} a_n"}</Tex> converges. Moreover the sum{" "}
            <Tex>{"S"}</Tex> always lies between any two consecutive partial sums. All three
            hypotheses matter — “decreasing” is the one students forget to check.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "|S - S_N| \\;\\le\\; a_{N+1}",
        tag: "7.7",
        caption: (
          <>
            The Leibniz error bound: truncating after <Tex>{"N"}</Tex> terms costs at most the{" "}
            <strong>first omitted term</strong>. Free precision control — examiners love asking for it.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <LeibnizZigzag />,
        caption: (
          <>
            Partial sums of <Tex>{"\\sum (-1)^{n+1}/n"}</Tex> (computed, not sketched): each swing
            crosses <Tex>{"\\ln 2"}</Tex> and shrinks, so consecutive sums bracket the limit.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the alternating harmonic series",
        content: (
          <>
            <p>
              <Tex>{"\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n+1}}{n} = 1 - \\tfrac12 + \\tfrac13 - \\tfrac14 + \\cdots"}</Tex>
            </p>
            <p>
              Check Leibniz: <Tex>{"a_n = \\tfrac1n"}</Tex> is positive, decreasing, and tends to 0 —
              all boxes ticked, so it <strong>converges</strong> (its sum is <Tex>{"\\ln 2"}</Tex>, as
              we will prove with power series in the next lesson). How many terms guarantee an error of
              at most <Tex>{"10^{-2}"}</Tex>? By (7.7) we need{" "}
              <Tex>{"a_{N+1} = \\tfrac{1}{N+1} \\le 10^{-2}"}</Tex>, i.e. <Tex>{"N \\ge 99"}</Tex>.
              Slow — but perfectly controlled.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Absolute vs conditional convergence" },
      {
        kind: "definition",
        term: "Absolute & conditional convergence",
        content: (
          <>
            <Tex>{"\\sum a_n"}</Tex> converges <strong>absolutely</strong> if{" "}
            <Tex>{"\\sum |a_n|"}</Tex> converges. Theorem: absolute convergence{" "}
            <strong>implies</strong> convergence. A series that converges while{" "}
            <Tex>{"\\sum |a_n|"}</Tex> diverges is called <strong>conditionally convergent</strong> —
            it converges only thanks to sign cancellation.
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
            Leibniz to salvage conditional convergence.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — classify two cousins",
        content: (
          <>
            <p>
              <strong>(a)</strong> <Tex>{"\\sum \\dfrac{(-1)^{n+1}}{n^2}"}</Tex>: the absolute series is{" "}
              <Tex>{"\\sum \\tfrac1{n^2}"}</Tex>, convergent (p = 2). Verdict:{" "}
              <strong>absolutely convergent</strong> — no need to even mention Leibniz.
            </p>
            <p>
              <strong>(b)</strong> <Tex>{"\\sum \\dfrac{(-1)^{n+1}}{n}"}</Tex>: the absolute series is
              the harmonic series, divergent. But Leibniz applies (<Tex>{"\\tfrac1n \\downarrow 0"}</Tex>),
              so the series converges. Verdict: <strong>conditionally convergent</strong>.
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
        title: "Why “conditional” deserves respect (Riemann)",
        content: (
          <>
            A conditionally convergent series is fragile: Riemann proved its terms can be{" "}
            <strong>rearranged</strong> to converge to <em>any</em> value you like, or to diverge.
            Absolutely convergent series, by contrast, keep the same sum under any rearrangement. The
            distinction is not pedantry — it is structural.
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
                <strong>absolutely convergent</strong>: stop here.
              </>
            ),
          },
          {
            label: "Leibniz",
            content: (
              <>
                If <Tex>{"\\sum|a_n|"}</Tex> diverges and the signs alternate: check{" "}
                <Tex>{"a_n"}</Tex> positive, decreasing (differentiate <Tex>{"f(x)"}</Tex> if unclear),{" "}
                <Tex>{"\\to 0"}</Tex>. All hold ⇒ <strong>conditionally convergent</strong>.
              </>
            ),
          },
          {
            label: "Last resort",
            content: (
              <>
                If Leibniz fails, check <Tex>{"a_n \\to 0"}</Tex>: if the terms do not vanish, the
                series <strong>diverges</strong> outright.
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
            One loose end: we asserted the sum <Tex>{"\\ln 2"}</Tex> without proof. The honest proof
            needs a machine that turns functions into series and back — <strong>power series</strong>,
            the final lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 4 — Power series & Taylor expansions
   * ================================================================ */
  {
    id: "power-series",
    title: "Power series, radius of convergence & Taylor expansions",
    lecture: MODULE,
    summary:
      "Polynomials of infinite degree: where they converge (a radius, plus two endpoints to check by hand), how to differentiate and integrate them, and the six Maclaurin series that generate all the others.",
    minutes: 24,
    objectives: [
      "Compute the radius of convergence with the ratio or root test",
      "Determine the full interval of convergence by testing both endpoints separately",
      "Differentiate and integrate power series term by term",
      "Recall the standard Maclaurin series and combine them to expand or sum new series",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A <strong>power series</strong> is a polynomial that forgot to stop:{" "}
            <Tex>{"\\sum_{n=0}^{\\infty} a_n (x-x_0)^n"}</Tex>. For each fixed <Tex>{"x"}</Tex> it is a
            numerical series, so the first question is: for <em>which</em> <Tex>{"x"}</Tex> does it
            converge? The answer has a beautiful rigidity — the set of good <Tex>{"x"}</Tex> is always
            an interval centred at <Tex>{"x_0"}</Tex>.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Radius of convergence",
        content: (
          <>
            For every power series there is an <Tex>{"R \\in [0, +\\infty]"}</Tex> such that the series
            converges <strong>absolutely</strong> for <Tex>{"|x-x_0| < R"}</Tex> and diverges for{" "}
            <Tex>{"|x-x_0| > R"}</Tex>. At the two endpoints <Tex>{"x = x_0 \\pm R"}</Tex>{" "}
            <em>anything</em> can happen — the theorem is silent there, and each endpoint must be
            examined as a numerical series in its own right.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{1}{R} = \\lim_{n\\to\\infty} \\left| \\frac{a_{n+1}}{a_n} \\right| \\quad \\text{or} \\quad \\frac{1}{R} = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}",
        tag: "7.8",
        caption: (
          <>
            When the limit exists (conventions: limit 0 ⇒ <Tex>{"R=+\\infty"}</Tex>; limit{" "}
            <Tex>{"+\\infty"}</Tex> ⇒ <Tex>{"R=0"}</Tex>). Equivalently, run the ratio test on{" "}
            <Tex>{"|a_n x^n|"}</Tex> and demand the limit be below 1.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Endpoints are checked BY HAND — always",
        content: (
          <>
            At <Tex>{"|x - x_0| = R"}</Tex> the ratio/root test gives exactly <Tex>{"L=1"}</Tex>:
            silence. Substitute each endpoint into the series and study the resulting{" "}
            <em>numerical</em> series with lessons 2–3. The same series can diverge at one endpoint and
            converge at the other — and exam graders check both, every time.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — interval of convergence of Σ xⁿ/n",
        content: (
          <>
            <p>
              Coefficients <Tex>{"a_n = \\tfrac1n"}</Tex>:{" "}
              <Tex>{"\\left|\\tfrac{a_{n+1}}{a_n}\\right| = \\tfrac{n}{n+1} \\to 1"}</Tex>, so{" "}
              <Tex>{"R = 1"}</Tex>.
            </p>
            <p>
              Endpoint <Tex>{"x = 1"}</Tex>: <Tex>{"\\sum \\tfrac1n"}</Tex>, the harmonic series —{" "}
              <strong>diverges</strong>.
            </p>
            <p>
              Endpoint <Tex>{"x = -1"}</Tex>: <Tex>{"\\sum \\tfrac{(-1)^n}{n}"}</Tex>, alternating
              harmonic — <strong>converges</strong> (conditionally, by Leibniz).
            </p>
            <p>
              Interval of convergence: <Tex>{"[-1, 1)"}</Tex> — closed at the left, open at the right.
              Asymmetric endpoints are completely normal.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Calculus inside the interval" },
      {
        kind: "formula",
        tex: "f(x) = \\sum_{n=0}^{\\infty} a_n x^n \\;\\Rightarrow\\; f'(x) = \\sum_{n=1}^{\\infty} n\\,a_n x^{n-1}, \\qquad \\int_0^x f(t)\\,dt = \\sum_{n=0}^{\\infty} \\frac{a_n}{n+1} x^{n+1}",
        tag: "7.9",
        caption: (
          <>
            Term-by-term differentiation and integration are legal on the whole open interval{" "}
            <Tex>{"|x| < R"}</Tex>, and both new series keep the <strong>same radius</strong>{" "}
            <Tex>{"R"}</Tex>.
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
            <Tex>{"\\ln(1+x)"}</Tex>'s series converges at <Tex>{"x=1"}</Tex>, but its derivative series{" "}
            <Tex>{"\\sum (-1)^n x^n"}</Tex> (which is <Tex>{"\\tfrac{1}{1+x}"}</Tex>) diverges there.
            After differentiating or integrating, re-check any endpoint you intend to use.
          </>
        ),
      },
      { kind: "heading", text: "Taylor & Maclaurin series" },
      {
        kind: "prose",
        content: (
          <p>
            If <Tex>{"f(x) = \\sum a_n (x-x_0)^n"}</Tex> on an interval, then differentiating term by
            term <Tex>{"n"}</Tex> times and evaluating at <Tex>{"x_0"}</Tex> forces{" "}
            <Tex>{"a_n = \\tfrac{f^{(n)}(x_0)}{n!}"}</Tex> — the coefficients are the Taylor
            coefficients you met in the Taylor-polynomial module, continued to infinity. A{" "}
            <strong>Maclaurin series</strong> is simply a Taylor series centred at{" "}
            <Tex>{"x_0 = 0"}</Tex>. Six expansions cover almost every exam question:
          </p>
        ),
      },
      {
        kind: "figure",
        render: () => <MaclaurinTable />,
        caption: (
          <>
            The catalogue to memorize. Note the validity columns: the first three hold on all of{" "}
            <Tex>{"\\mathbb{R}"}</Tex> (<Tex>{"R=+\\infty"}</Tex>), the last three only for{" "}
            <Tex>{"|x| < 1"}</Tex> — with <Tex>{"\\ln(1+x)"}</Tex> scraping in at <Tex>{"x=1"}</Tex>,
            which is exactly the statement <Tex>{"\\ln 2 = 1 - \\tfrac12 + \\tfrac13 - \\cdots"}</Tex>{" "}
            promised last lesson.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — building new series from old",
        content: (
          <>
            <p>
              Expand <Tex>{"\\arctan x"}</Tex>. Start from the geometric series with{" "}
              <Tex>{"x \\mapsto -t^2"}</Tex>:{" "}
              <Tex>{"\\dfrac{1}{1+t^2} = \\sum_{n=0}^{\\infty} (-1)^n t^{2n}"}</Tex> for{" "}
              <Tex>{"|t| < 1"}</Tex>. Integrate term by term from 0 to x, using (7.9):
            </p>
            <p>
              <Tex>{"\\arctan x = \\sum_{n=0}^{\\infty} (-1)^n \\dfrac{x^{2n+1}}{2n+1} = x - \\dfrac{x^3}{3} + \\dfrac{x^5}{5} - \\cdots"}</Tex>
            </p>
            <p>
              Substitution and term-by-term calculus built a brand-new expansion in two lines — no
              derivatives of <Tex>{"\\arctan"}</Tex> computed. (At <Tex>{"x=1"}</Tex> it converges by
              Leibniz and yields <Tex>{"\\tfrac{\\pi}{4} = 1 - \\tfrac13 + \\tfrac15 - \\cdots"}</Tex>.)
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
      {
        kind: "steps",
        title: "Interval of convergence — the exam routine",
        steps: [
          {
            label: "Radius",
            content: (
              <>
                Apply (7.8) to the coefficients (or the ratio test to <Tex>{"|a_n x^n|"}</Tex>) to get{" "}
                <Tex>{"R"}</Tex>.
              </>
            ),
          },
          {
            label: "Open interval",
            content: (
              <>
                Write down absolute convergence on <Tex>{"(x_0 - R,\\ x_0 + R)"}</Tex>, divergence
                outside the closed interval.
              </>
            ),
          },
          {
            label: "Both endpoints",
            content: (
              <>
                Substitute <Tex>{"x = x_0 + R"}</Tex> and <Tex>{"x = x_0 - R"}</Tex> separately; study
                each numerical series (p-series, Leibniz…).
              </>
            ),
          },
          {
            label: "Assemble",
            content: (
              <>
                Report the interval with the correct bracket at each end, stating the type of
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
            That closes the series toolkit: exact sums for geometric, telescoping and
            power-series-derived sums; convergence tests for everything else; Leibniz for alternating
            signs; and a radius-plus-endpoints routine for power series. Next stop:{" "}
            <strong>ordinary differential equations</strong>, where these expansions come back as
            solution methods.
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
