import type { Course } from "../../types";
import { Tex } from "../../lib/math";
import { PathLimitSim } from "./sims/PathLimitSim";

/* ============== Path-test comparison table for the lesson ========== */
function PathTable() {
  const rows = [
    ["f = xy/(x²+y²)", "0", "0", "m/(1+m²)", "no — depends on m"],
    ["f = x²y/(x²+y²)", "0", "0", "0", "yes — limit is 0"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Function</th>
            <th className="border-b border-[var(--color-line)] p-2">Along x-axis</th>
            <th className="border-b border-[var(--color-line)] p-2">Along y-axis</th>
            <th className="border-b border-[var(--color-line)] p-2">Along y = m·x</th>
            <th className="border-b border-[var(--color-line)] p-2">Limit exists?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs text-[var(--color-ink)]">{r[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[2]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[3]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs font-semibold">{r[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mathAnalysis2: Course = {
  meta: {
    id: "math-analysis-2",
    title: "Mathematical Analysis II",
    short: "Analysis II",
    tagline: "Calculus in many variables — limits, gradients and integrals.",
    description:
      "From multivariable limits and partial derivatives to the gradient, tangent planes and double integrals — the analysis toolkit every later course leans on.",
    accent: "#8b7bff",
    accent2: "#b18cff",
    icon: "Sigma",
    year: 2,
    semester: 1,
    credits: 10,
    examDate: "2026-06-30",
    syllabus: [
      "Multivariable limits",
      "Partial derivatives",
      "Gradient & tangent plane",
      "Double integrals",
      "Series",
      "ODEs",
    ],
    status: "sample",
  },

  lessons: [
    {
      id: "multivariable-limits",
      title: "Limits & continuity in two variables",
      summary:
        "A 2-variable limit exists only if every path to the point gives the same value — and that single demand changes everything.",
      minutes: 20,
      objectives: [
        "State precisely what “limit at a point” means in two variables",
        "Disprove a limit by finding two paths that disagree",
        "Prove a limit exists with polar coordinates or the squeeze theorem",
        "Decide whether a function is continuous at a point",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <p>
              In one variable there are only <strong>two</strong> ways to approach a point — from the
              left and from the right — and a limit exists when those two agree. In the plane there are{" "}
              <strong>infinitely many</strong> directions, plus curved routes that spiral in. The
              definition of a 2-variable limit quietly demands that <em>all</em> of them produce the
              same value. That single change is the source of almost every surprise in this chapter.
            </p>
          ),
        },
        {
          kind: "definition",
          term: "Limit in two variables",
          content: (
            <>
              We say <Tex>{"\\lim_{(x,y)\\to(a,b)} f(x,y) = L"}</Tex> if for every{" "}
              <Tex>{"\\varepsilon > 0"}</Tex> there is a <Tex>{"\\delta > 0"}</Tex> such that{" "}
              <Tex>{"0 < \\sqrt{(x-a)^2+(y-b)^2} < \\delta"}</Tex> forces{" "}
              <Tex>{"|f(x,y)-L| < \\varepsilon"}</Tex>. Note the disk: the point is approached from{" "}
              <strong>every</strong> direction at once.
            </>
          ),
        },
        {
          kind: "callout",
          tone: "key",
          title: "The path principle",
          content: (
            <>
              If the limit exists and equals <Tex>{"L"}</Tex>, then the value of <Tex>{"f"}</Tex> along{" "}
              <em>every</em> path approaching the point must tend to the same <Tex>{"L"}</Tex>.
              Contrapositive (your main weapon): if <strong>two</strong> paths give{" "}
              <strong>different</strong> values, the limit <strong>does not exist</strong>.
            </>
          ),
        },
        { kind: "heading", text: "The canonical counterexample" },
        {
          kind: "prose",
          content: (
            <p>
              Consider <Tex>{"f(x,y)=\\dfrac{xy}{x^2+y^2}"}</Tex> near the origin. Approach along the
              line <Tex>{"y = m x"}</Tex> and substitute:
            </p>
          ),
        },
        {
          kind: "formula",
          tex: "f(x, mx) = \\frac{x\\,(mx)}{x^2 + (mx)^2} = \\frac{m x^2}{x^2(1+m^2)} = \\frac{m}{1+m^2}",
          tag: "1.1",
          caption: (
            <>
              The <Tex>{"x"}</Tex> cancels entirely: along each line the function is a{" "}
              <strong>constant</strong> that depends on the slope <Tex>{"m"}</Tex>.
            </>
          ),
        },
        {
          kind: "prose",
          content: (
            <p>
              Along the <Tex>{"x"}</Tex>-axis (<Tex>{"m = 0"}</Tex>) the value is <Tex>{"0"}</Tex>; along{" "}
              <Tex>{"y = x"}</Tex> (<Tex>{"m = 1"}</Tex>) it is <Tex>{"\\tfrac12"}</Tex>; along{" "}
              <Tex>{"y = -x"}</Tex> it is <Tex>{"-\\tfrac12"}</Tex>. Two paths, two different values, so
              the limit cannot exist. Drag the slope in the model below and watch the value the path
              rides over change continuously.
            </p>
          ),
        },
        {
          kind: "sim",
          title: "Path-limit explorer — f(x,y) = xy/(x²+y²)",
          render: () => <PathLimitSim />,
          caption: (
            <>
              The straight-line readout is exactly <Tex>{"m/(1+m^2)"}</Tex> from (1.1). Switch to the
              parabola <Tex>{"y=x^2"}</Tex> or the axis to see paths that <em>do</em> give 0 — yet the
              limit still fails, because the lines already disagree.
            </>
          ),
        },
        {
          kind: "callout",
          tone: "trap",
          title: "Two paths agreeing proves NOTHING",
          content: (
            <>
              Approaching along the <Tex>{"x"}</Tex>-axis and the <Tex>{"y"}</Tex>-axis both gave{" "}
              <Tex>{"0"}</Tex> for the function above — and yet the limit does not exist. Matching values
              on a few paths is necessary, never sufficient. To <strong>prove existence</strong> you must
              bound the function over <em>all</em> directions at once (polar coordinates or squeeze). To{" "}
              <strong>disprove</strong>, one disagreeing pair is enough.
            </>
          ),
        },
        { kind: "heading", text: "A function that DOES have a limit" },
        {
          kind: "prose",
          content: (
            <p>
              Now look at <Tex>{"g(x,y)=\\dfrac{x^2 y}{x^2+y^2}"}</Tex>. Along <Tex>{"y=mx"}</Tex> we get{" "}
              <Tex>{"\\dfrac{m x^3}{x^2(1+m^2)} = \\dfrac{m x}{1+m^2}\\to 0"}</Tex>. Every line gives 0 —
              but, by the trap above, that is not a proof. We close the case with polar coordinates.
            </p>
          ),
        },
        {
          kind: "callout",
          tone: "info",
          title: "The polar-coordinate test",
          content: (
            <>
              Put <Tex>{"x = r\\cos\\theta,\\ y = r\\sin\\theta"}</Tex> so that{" "}
              <Tex>{"(x,y)\\to(0,0)"}</Tex> becomes simply <Tex>{"r\\to 0^+"}</Tex>. If you can bound{" "}
              <Tex>{"|f - L| \\le h(r)"}</Tex> with <Tex>{"h(r)\\to 0"}</Tex>{" "}
              <strong>independently of <Tex>{"\\theta"}</Tex></strong>, the limit is <Tex>{"L"}</Tex>. If
              the expression still depends on <Tex>{"\\theta"}</Tex> after the <Tex>{"r"}</Tex>-powers
              cancel, suspect non-existence.
            </>
          ),
        },
        {
          kind: "formula",
          tex: "g = \\frac{(r\\cos\\theta)^2(r\\sin\\theta)}{r^2} = r\\,\\cos^2\\theta\\,\\sin\\theta, \\qquad |g| \\le r \\xrightarrow{r\\to0} 0",
          tag: "1.2",
          caption: (
            <>
              The <Tex>{"\\theta"}</Tex>-part is bounded by 1, so <Tex>{"|g|\\le r\\to 0"}</Tex> uniformly:
              the limit is <Tex>{"0"}</Tex>, for real this time.
            </>
          ),
        },
        {
          kind: "figure",
          render: () => <PathTable />,
          caption:
            "The same probes side by side. Identical along the axes — but the slope test separates the two functions.",
        },
        { kind: "heading", text: "Continuity" },
        {
          kind: "definition",
          term: "Continuous at a point",
          content: (
            <>
              <Tex>{"f"}</Tex> is continuous at <Tex>{"(a,b)"}</Tex> if <Tex>{"f(a,b)"}</Tex> is defined,
              the limit <Tex>{"\\lim_{(x,y)\\to(a,b)} f"}</Tex> exists, and the two are equal:{" "}
              <Tex>{"\\lim_{(x,y)\\to(a,b)} f(x,y) = f(a,b)"}</Tex>.
            </>
          ),
        },
        {
          kind: "prose",
          content: (
            <p>
              So <Tex>{"f=xy/(x^2+y^2)"}</Tex> cannot be made continuous at the origin by{" "}
              <em>any</em> choice of <Tex>{"f(0,0)"}</Tex> — the limit simply does not exist. But{" "}
              <Tex>{"g=x^2y/(x^2+y^2)"}</Tex> has limit 0 there, so defining{" "}
              <Tex>{"g(0,0)=0"}</Tex> makes it continuous. Existence of the limit is the gatekeeper for
              continuity.
            </p>
          ),
        },
        {
          kind: "steps",
          title: "A method that never fails",
          steps: [
            { label: "Probe the easy paths", content: <>Try the axes and a few lines <Tex>{"y=mx"}</Tex>. If any two disagree, you are done — write “limit does not exist”.</> },
            { label: "Suspect existence?", content: <>If every probe gives the same candidate <Tex>{"L"}</Tex>, switch to polar coordinates <Tex>{"x=r\\cos\\theta,\\ y=r\\sin\\theta"}</Tex>.</> },
            { label: "Bound by r alone", content: <>Show <Tex>{"|f-L|\\le h(r)"}</Tex> with <Tex>{"h(r)\\to0"}</Tex> and no <Tex>{"\\theta"}</Tex> left. That proves the limit is <Tex>{"L"}</Tex>.</> },
            { label: "Check continuity", content: <>Compare the limit with the assigned value <Tex>{"f(a,b)"}</Tex>; equal ⇒ continuous.</> },
          ],
        },
        {
          kind: "example",
          title: "Worked example — does it exist?",
          content: (
            <>
              <p>
                Decide whether <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{x^2 - y^2}{x^2 + y^2}"}</Tex> exists.
              </p>
              <p>
                Along the <Tex>{"x"}</Tex>-axis (<Tex>{"y=0"}</Tex>):{" "}
                <Tex>{"\\dfrac{x^2}{x^2}=1\\to 1"}</Tex>.
              </p>
              <p>
                Along the <Tex>{"y"}</Tex>-axis (<Tex>{"x=0"}</Tex>):{" "}
                <Tex>{"\\dfrac{-y^2}{y^2}=-1\\to -1"}</Tex>.
              </p>
              <p>
                Two paths give <Tex>{"1"}</Tex> and <Tex>{"-1"}</Tex>. They disagree, so the limit{" "}
                <strong>does not exist</strong>. (In polar form it is <Tex>{"\\cos 2\\theta"}</Tex> — pure
                angle dependence, the tell-tale sign.)
              </p>
            </>
          ),
        },
        {
          kind: "checkpoint",
          question: {
            id: "ma2-cp-1",
            difficulty: "medium",
            prompt: (
              <>
                You approach <Tex>{"(0,0)"}</Tex> along three different lines and get the same value{" "}
                <Tex>{"L"}</Tex> each time. What can you conclude?
              </>
            ),
            options: [
              { id: "A", content: <>The limit exists and equals <Tex>{"L"}</Tex>.</> },
              { id: "B", content: <>Nothing conclusive yet — you must still rule out all other paths (e.g. via polar coordinates).</> },
              { id: "C", content: <>The limit does not exist.</> },
              { id: "D", content: <>The function is continuous at the origin.</> },
            ],
            correct: "B",
            explanation: (
              <>
                Agreement on finitely many paths is <em>necessary</em> but never <em>sufficient</em>:{" "}
                <Tex>{"xy/(x^2+y^2)"}</Tex> agrees (= 0) on both axes yet has no limit. To prove
                existence you need a bound valid for all directions, so the answer is <strong>B</strong>.
                A claims too much; C and D have no basis from line probes alone.
              </>
            ),
            theory: <>Lines agreeing ⇒ candidate value only. Existence needs a uniform-in-θ polar bound.</>,
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Smart path choices",
          content: (
            <>
              When the lines <Tex>{"y=mx"}</Tex> all give the same value but you still smell trouble, try{" "}
              a <em>curved</em> path matched to the powers — e.g. <Tex>{"y=x^2"}</Tex> for{" "}
              <Tex>{"\\dfrac{x^2 y}{x^4+y^2}"}</Tex>, which gives <Tex>{"\\tfrac12"}</Tex> while every line
              gives 0. Match the curve to the denominator's degrees.
            </>
          ),
        },
        {
          kind: "prose",
          content: (
            <p>
              That is the whole logic of multivariable limits: <strong>one disagreement kills</strong>,{" "}
              while existence demands a bound holding in every direction. Next we use these continuous
              functions to build <strong>partial derivatives</strong> and the gradient.
            </p>
          ),
        },
      ],
    },
  ],

  practice: [
    {
      id: "ma2-q1",
      topic: "Definition",
      difficulty: "easy",
      prompt: <>For <Tex>{"\\lim_{(x,y)\\to(a,b)} f = L"}</Tex> to hold, the value of f must tend to L:</>,
      options: [
        { id: "A", content: "Along the x- and y-axes only" },
        { id: "B", content: "Along every straight line through the point" },
        { id: "C", content: "Along every possible path approaching the point" },
        { id: "D", content: "Along at least one path" },
      ],
      correct: "C",
      explanation: (
        <>
          The ε–δ definition uses a full disk around the point, so approach is from <em>all</em>
          directions and curves at once — hence C. A and B cover only special families (and even all
          lines is not enough); D is far too weak.
        </>
      ),
      theory: <>The 2-D limit is direction-free: every path must share the same value.</>,
    },
    {
      id: "ma2-q2",
      topic: "Counterexample",
      difficulty: "medium",
      prompt: <>Along the line <Tex>{"y = m x"}</Tex>, the function <Tex>{"\\dfrac{xy}{x^2+y^2}"}</Tex> equals:</>,
      options: [
        { id: "A", content: <Tex>{"\\dfrac{m}{1+m^2}"}</Tex> },
        { id: "B", content: <Tex>{"\\dfrac{1}{1+m^2}"}</Tex> },
        { id: "C", content: <Tex>{"m"}</Tex> },
        { id: "D", content: <Tex>{"0"}</Tex> },
      ],
      correct: "A",
      explanation: (
        <>
          Substituting <Tex>{"y=mx"}</Tex>: <Tex>{"\\dfrac{x\\cdot mx}{x^2+m^2x^2}=\\dfrac{m}{1+m^2}"}</Tex> after
          cancelling <Tex>{"x^2"}</Tex> — answer A. B drops the numerator's m; C ignores the
          denominator; D is only the special case <Tex>{"m=0"}</Tex>.
        </>
      ),
      theory: <>Substitute the path and simplify; degree-matched terms cancel to a constant in x.</>,
    },
    {
      id: "ma2-q3",
      topic: "Path test",
      difficulty: "medium",
      prompt: <>The fastest way to show a 2-variable limit does NOT exist is to:</>,
      options: [
        { id: "A", content: "Convert to polar and bound by r" },
        { id: "B", content: "Find two paths giving different limiting values" },
        { id: "C", content: "Show the partial derivatives differ" },
        { id: "D", content: "Evaluate the function at the point" },
      ],
      correct: "B",
      explanation: (
        <>
          One disagreeing pair of paths immediately contradicts the path principle — B. Polar bounding
          (A) is for <em>proving</em> existence, not disproving; partial derivatives (C) are unrelated
          to limit existence; the point value (D) need not even be defined.
        </>
      ),
      theory: <>Disprove with two clashing paths; prove with a direction-independent bound.</>,
    },
    {
      id: "ma2-q4",
      topic: "Polar test",
      difficulty: "medium",
      prompt: (
        <>
          In polar coordinates a limit at the origin is L provided <Tex>{"|f - L|"}</Tex> can be bounded
          by a function of:
        </>
      ),
      options: [
        { id: "A", content: <><Tex>{"\\theta"}</Tex> alone</> },
        { id: "B", content: <>both <Tex>{"r"}</Tex> and <Tex>{"\\theta"}</Tex></> },
        { id: "C", content: <><Tex>{"r"}</Tex> alone, tending to 0 as <Tex>{"r\\to0"}</Tex></> },
        { id: "D", content: <>a constant</> },
      ],
      correct: "C",
      explanation: (
        <>
          The bound must vanish as <Tex>{"r\\to0"}</Tex> <em>independently of the angle</em>, i.e. a
          function of r alone — C. A residual <Tex>{"\\theta"}</Tex>-dependence (A, B) signals possible
          non-existence; a nonzero constant bound (D) proves nothing.
        </>
      ),
      theory: <>Uniform-in-θ control by h(r)→0 is what upgrades “candidate” to “limit”.</>,
    },
    {
      id: "ma2-q5",
      topic: "Counterexample",
      difficulty: "easy",
      prompt: <>Does <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{xy}{x^2+y^2}"}</Tex> exist?</>,
      options: [
        { id: "A", content: <>Yes, it equals 0</> },
        { id: "B", content: <>Yes, it equals <Tex>{"\\tfrac12"}</Tex></> },
        { id: "C", content: <>No, lines of different slope give different values</> },
        { id: "D", content: <>Yes, it equals 1</> },
      ],
      correct: "C",
      explanation: (
        <>
          Along <Tex>{"y=mx"}</Tex> the value is <Tex>{"m/(1+m^2)"}</Tex>: 0 for m = 0 but{" "}
          <Tex>{"\\tfrac12"}</Tex> for m = 1. Different paths, different values ⇒ no limit, so C. A is the
          axis-only value (a trap), B and D are single-path values mistaken for the whole limit.
        </>
      ),
      theory: <>Slope-dependent value along lines ⇒ limit does not exist.</>,
    },
    {
      id: "ma2-q6",
      topic: "Existence",
      difficulty: "medium",
      prompt: <>Why does <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{x^2 y}{x^2+y^2} = 0"}</Tex> genuinely hold?</>,
      options: [
        { id: "A", content: <>Because both axes give 0</> },
        { id: "B", content: <>Because in polar form it is <Tex>{"r\\cos^2\\theta\\sin\\theta"}</Tex>, bounded by <Tex>{"r\\to0"}</Tex></> },
        { id: "C", content: <>Because the numerator is bigger than the denominator</> },
        { id: "D", content: <>Because the function is a polynomial</> },
      ],
      correct: "B",
      explanation: (
        <>
          Polar substitution gives <Tex>{"r\\cos^2\\theta\\sin\\theta"}</Tex> with{" "}
          <Tex>{"|\\,\\cdot\\,|\\le r\\to 0"}</Tex> uniformly in θ — a real proof, so B. A is only
          necessary (the trap); C is false (denominator dominates near 0); D is false (it is a rational,
          undefined at the origin).
        </>
      ),
      theory: <>A polar bound h(r)→0 free of θ proves existence.</>,
    },
    {
      id: "ma2-q7",
      topic: "Continuity",
      difficulty: "easy",
      prompt: <>A function f is continuous at <Tex>{"(a,b)"}</Tex> exactly when:</>,
      options: [
        { id: "A", content: <><Tex>{"f(a,b)"}</Tex> is defined</> },
        { id: "B", content: <>the limit at <Tex>{"(a,b)"}</Tex> exists</> },
        { id: "C", content: <><Tex>{"f(a,b)"}</Tex> is defined, the limit exists, and they are equal</> },
        { id: "D", content: <>the partial derivatives exist</> },
      ],
      correct: "C",
      explanation: (
        <>
          Continuity needs all three pieces together — C. A or B alone is not enough; remarkably even D
          (existence of partials) does not imply continuity in two variables.
        </>
      ),
      theory: <>Continuity = defined value + existing limit + the two coinciding.</>,
    },
    {
      id: "ma2-q8",
      topic: "Curved paths",
      difficulty: "hard",
      prompt: (
        <>
          For <Tex>{"\\dfrac{x^2 y}{x^4 + y^2}"}</Tex> every line <Tex>{"y=mx"}</Tex> gives 0. Approaching
          along <Tex>{"y = x^2"}</Tex> gives:
        </>
      ),
      options: [
        { id: "A", content: <Tex>{"0"}</Tex> },
        { id: "B", content: <Tex>{"\\tfrac12"}</Tex> },
        { id: "C", content: <Tex>{"1"}</Tex> },
        { id: "D", content: <Tex>{"\\infty"}</Tex> },
      ],
      correct: "B",
      explanation: (
        <>
          Put <Tex>{"y=x^2"}</Tex>: <Tex>{"\\dfrac{x^2\\cdot x^2}{x^4+x^4}=\\dfrac{x^4}{2x^4}=\\tfrac12"}</Tex>{" "}
          — answer B. Since the lines give 0 and this curve gives <Tex>{"\\tfrac12"}</Tex>, the limit does
          not exist. A is the line value (the trap); C and D come from arithmetic slips.
        </>
      ),
      theory: <>Match the curve degree to the denominator (here y ~ x²) to expose hidden non-existence.</>,
    },
  ],

  exam: [
    {
      id: "ma2-e1",
      title: "Disprove a limit with two paths",
      meta: "Limits · ~8 pts · Summer session style",
      difficulty: "medium",
      topic: "Non-existence",
      statement: (
        <>
          Show that <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{x^2 - y^2}{x^2 + y^2}"}</Tex> does not exist.
        </>
      ),
      given: <><Tex>{"f(x,y)=\\dfrac{x^2-y^2}{x^2+y^2},\\quad (x,y)\\ne(0,0)"}</Tex></>,
      steps: [
        {
          title: "Approach along the x-axis",
          content: <>Set <Tex>{"y=0"}</Tex>: <Tex>{"f(x,0)=\\dfrac{x^2}{x^2}=1\\to 1"}</Tex> as <Tex>{"x\\to0"}</Tex>.</>,
        },
        {
          title: "Approach along the y-axis",
          content: <>Set <Tex>{"x=0"}</Tex>: <Tex>{"f(0,y)=\\dfrac{-y^2}{y^2}=-1\\to -1"}</Tex> as <Tex>{"y\\to0"}</Tex>.</>,
        },
        {
          title: "Compare",
          content: <>The two limiting values <Tex>{"1"}</Tex> and <Tex>{"-1"}</Tex> differ, contradicting the path principle.</>,
        },
      ],
      finalAnswer: <>The limit <strong>does not exist</strong> (two paths give 1 and −1). In polar form <Tex>{"f=\\cos 2\\theta"}</Tex>, pure angle dependence confirms it.</>,
      tips: <>Pick the simplest disagreeing pair — the axes — before trying anything fancy. One clash is a complete proof.</>,
    },
    {
      id: "ma2-e2",
      title: "Prove a limit with polar coordinates",
      meta: "Limits · ~10 pts",
      difficulty: "hard",
      topic: "Existence / polar test",
      statement: (
        <>
          Evaluate <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{x^3 + y^3}{x^2 + y^2}"}</Tex>, justifying
          existence rigorously.
        </>
      ),
      given: <><Tex>{"x=r\\cos\\theta,\\ y=r\\sin\\theta,\\ (x,y)\\to(0,0)\\iff r\\to0^+"}</Tex></>,
      steps: [
        {
          title: "Switch to polar coordinates",
          content: (
            <>
              <Tex>{"\\dfrac{x^3+y^3}{x^2+y^2}=\\dfrac{r^3(\\cos^3\\theta+\\sin^3\\theta)}{r^2}=r\\,(\\cos^3\\theta+\\sin^3\\theta)"}</Tex>.
            </>
          ),
        },
        {
          title: "Bound the angular part",
          content: (
            <>
              <Tex>{"|\\cos^3\\theta+\\sin^3\\theta|\\le |\\cos\\theta|^3+|\\sin\\theta|^3 \\le 2"}</Tex>, so{" "}
              <Tex>{"\\left|\\dfrac{x^3+y^3}{x^2+y^2}\\right|\\le 2r"}</Tex>.
            </>
          ),
        },
        {
          title: "Squeeze as r → 0",
          content: <>Since <Tex>{"2r\\to0"}</Tex> independently of <Tex>{"\\theta"}</Tex>, the expression is squeezed to 0.</>,
        },
      ],
      finalAnswer: <>The limit exists and equals <Tex>{"0"}</Tex> (bounded by <Tex>{"2r\\to0"}</Tex> uniformly in θ).</>,
      tips: <>One factor of r survives after cancellation and the angular part is bounded — that is the signature of a clean polar proof. If no r survived, the limit would likely not exist.</>,
    },
    {
      id: "ma2-e3",
      title: "Make a function continuous at the origin",
      meta: "Continuity · ~7 pts",
      difficulty: "medium",
      topic: "Continuity",
      statement: (
        <>
          The function <Tex>{"g(x,y)=\\dfrac{\\sin(x^2+y^2)}{x^2+y^2}"}</Tex> is undefined at the origin.
          Can a value <Tex>{"g(0,0)"}</Tex> be chosen to make g continuous there? If so, give it.
        </>
      ),
      given: <><Tex>{"\\lim_{t\\to0}\\dfrac{\\sin t}{t}=1,\\quad t=x^2+y^2"}</Tex></>,
      steps: [
        {
          title: "Reduce to one variable",
          content: <>Let <Tex>{"t=x^2+y^2"}</Tex>. As <Tex>{"(x,y)\\to(0,0)"}</Tex>, <Tex>{"t\\to0^+"}</Tex>, and <Tex>{"g=\\dfrac{\\sin t}{t}"}</Tex>.</>,
        },
        {
          title: "Use the standard limit",
          content: <><Tex>{"\\lim_{t\\to0^+}\\dfrac{\\sin t}{t}=1"}</Tex>, and this holds along <em>every</em> path because g depends on <Tex>{"(x,y)"}</Tex> only through t.</>,
        },
        {
          title: "Define the value",
          content: <>The 2-D limit exists and equals 1, so setting <Tex>{"g(0,0)=1"}</Tex> matches the limit.</>,
        },
      ],
      finalAnswer: <>Yes: with <Tex>{"g(0,0)=1"}</Tex> the function is continuous at the origin (the limit there is 1).</>,
      tips: <>Whenever a function depends on <Tex>{"(x,y)"}</Tex> only through <Tex>{"r^2=x^2+y^2"}</Tex>, the 2-D limit collapses to a single-variable limit in t — no path worries.</>,
    },
  ],
};

export default mathAnalysis2;
