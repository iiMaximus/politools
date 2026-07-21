import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { VectorFieldWorkSim } from "../sims/VectorFieldWorkSim";

export const MODULE = "Curves, line integrals & vector fields";

/* ============ Table of classic parametrizations (lesson 1) ========== */
function ParamTable() {
  const rows: [string, string, string, string][] = [
    ["Segment A → B", "A + t(B − A), t ∈ [0, 1]", "B − A", "|B − A|"],
    ["Circle R, center (x₀, y₀)", "(x₀ + R cos t, y₀ + R sin t), t ∈ [0, 2π]", "(−R sin t, R cos t)", "R"],
    ["Ellipse a, b", "(a cos t, b sin t), t ∈ [0, 2π]", "(−a sin t, b cos t)", "√(a²sin²t + b²cos²t)"],
    ["Helix, radius R, pitch c", "(R cos t, R sin t, c·t)", "(−R sin t, R cos t, c)", "√(R² + c²)"],
    ["Cartesian curve y = f(x)", "(t, f(t)), t ∈ [a, b]", "(1, f′(t))", "√(1 + f′(t)²)"],
    ["Archimedean spiral", "(t cos t, t sin t)", "(cos t − t sin t, sin t + t cos t)", "√(1 + t²)"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Curve</th>
            <th className="border-b border-[var(--color-line)] p-2">γ(t)</th>
            <th className="border-b border-[var(--color-line)] p-2">γ′(t)</th>
            <th className="border-b border-[var(--color-line)] p-2">‖γ′(t)‖</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="border-b border-[var(--color-line)] p-2 text-xs font-semibold text-[var(--color-ink)]">{r[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[2]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== Simply connected vs holed domain — the Poincaré picture ===== */
function DomainFigure() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <svg viewBox="0 0 220 170" className="w-full rounded-xl bg-[var(--color-bg)]">
          <path
            d="M 30 90 C 25 45, 80 20, 120 30 C 175 42, 205 75, 190 115 C 175 150, 100 160, 60 140 C 35 127, 33 110, 30 90 Z"
            fill="var(--accent-soft)"
            stroke="var(--accent)"
            strokeWidth={2}
          />
          <circle cx={112} cy={88} r={34} fill="none" stroke="var(--color-muted)" strokeWidth={1.8} strokeDasharray="5 4" />
          <circle cx={112} cy={88} r={14} fill="none" stroke="var(--color-muted)" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
          <circle cx={112} cy={88} r={2.5} fill="var(--color-muted)" />
          <text x={112} y={158} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-muted)">
            simply connected: every loop shrinks
          </text>
        </svg>
      </div>
      <div>
        <svg viewBox="0 0 220 170" className="w-full rounded-xl bg-[var(--color-bg)]">
          <path
            d="M 30 90 C 25 45, 80 20, 120 30 C 175 42, 205 75, 190 115 C 175 150, 100 160, 60 140 C 35 127, 33 110, 30 90 Z M 92 88 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0 Z"
            fill="var(--accent-soft)"
            stroke="var(--accent)"
            strokeWidth={2}
            fillRule="evenodd"
          />
          <text x={114} y={92} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--bad)">
            hole
          </text>
          <circle cx={114} cy={88} r={38} fill="none" stroke="var(--bad)" strokeWidth={1.8} strokeDasharray="5 4" />
          <text x={112} y={158} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-muted)">
            hole inside: the red loop cannot shrink
          </text>
        </svg>
      </div>
    </div>
  );
}

export const lessons: Lesson[] = [
  /* ================================================================ *
   * LESSON 1 — Parametric curves (deck 1_Curves)
   * trace · simple/closed · C^k · tangent · regular · length
   * ================================================================ */
  {
    id: "parametric-curves",
    title: "Parametric curves: trace, regularity & arc length",
    lecture: MODULE,
    summary:
      "A curve is a journey, not just a road: the professor's exact vocabulary (trace, simple, closed, regular) and the length formula L(γ) = ∫ ‖γ′‖ dt.",
    minutes: 22,
    objectives: [
      "Parametrize the standard curves: segments, circles, ellipses, spirals, helices, Cartesian graphs",
      "Classify a curve as simple / closed / regular / piecewise regular — the professor's exact definitions",
      "Compute the tangent vector γ′(t) and the length L(γ) = ∫ ‖γ′(t)‖ dt",
      "Dodge the square-root and double-cover traps",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Everything in this module — length, mass, work, circulation — is built on one idea: describe a
            curve as a <strong>journey</strong>. Instead of an equation the points satisfy, we record the
            traveller's position at each instant <Tex>{"t"}</Tex>. The same road can be driven in many ways
            (fast, slow, backwards), and part of the craft is knowing which quantities depend on the drive
            and which only on the road.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Parametric curve & parametrization",
        content: (
          <>
            A parametric curve is a function{" "}
            <Tex>{"\\gamma: I\\subseteq\\mathbb{R}\\to\\mathbb{R}^2\\ (\\text{or }\\mathbb{R}^3)"}</Tex>,{" "}
            <Tex>{"t\\mapsto\\gamma(t)=(x(t),\\,y(t))"}</Tex> or <Tex>{"(x(t),\\,y(t),\\,z(t))"}</Tex>, where{" "}
            <Tex>{"I"}</Tex> is an interval. The map <Tex>{"\\gamma"}</Tex> is called the{" "}
            <strong>parametrization</strong>. (Many textbooks write <Tex>{"\\mathbf{r}(t)"}</Tex> for the same
            object — the drills use both letters.)
          </>
        ),
      },
      {
        kind: "definition",
        term: "Trace",
        content: (
          <>
            The image set <Tex>{"\\gamma([a,b])\\subset\\mathbb{R}^2"}</Tex> (or{" "}
            <Tex>{"\\mathbb{R}^3"}</Tex>) is called the <strong>trace</strong> of <Tex>{"\\gamma"}</Tex> —
            the road itself, stripped of the timetable. One trace admits infinitely many parametrizations:
            e.g. <Tex>{"\\gamma(t)=(x_0+R\\cos t,\\ y_0+R\\sin t)"}</Tex>, <Tex>{"t\\in[0,2\\pi]"}</Tex>,
            has as trace the circle of radius <Tex>{"R"}</Tex> centered at <Tex>{"(x_0,y_0)"}</Tex>.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            The lecture's opening gallery is worth knowing cold. <strong>Lines:</strong>{" "}
            <Tex>{"\\gamma(t)=(x_0+v_1 t,\\ y_0+v_2 t)"}</Tex> is a <em>segment</em> on{" "}
            <Tex>{"[a,b]"}</Tex>, a <em>half-line</em> on <Tex>{"[a,\\infty)"}</Tex>, a full <em>line</em> on{" "}
            <Tex>{"\\mathbb{R}"}</Tex> — same formula, different interval. <strong>Cartesian curves:</strong>{" "}
            <Tex>{"\\gamma(t)=(t,\\,f(t))"}</Tex> — giving <Tex>{"\\gamma"}</Tex> is the same as giving the
            function <Tex>{"f"}</Tex>, so every graph <Tex>{"y=f(x)"}</Tex> is a curve.{" "}
            <strong>Spirals:</strong> <Tex>{"(t\\cos t,\\ t\\sin t)"}</Tex> (Archimedean) and{" "}
            <Tex>{"(e^t\\cos t,\\ e^t\\sin t)"}</Tex> (logarithmic). <strong>Helices:</strong>{" "}
            <Tex>{"(\\cos t,\\ \\sin t,\\ t)"}</Tex>, a circle that climbs.
          </p>
        ),
      },
      {
        kind: "figure",
        render: () => <ParamTable />,
        caption:
          "The parametrizations you will use in 95% of exercises. Memorize the circle and the helix rows — their constant speeds make exam integrals collapse.",
      },
      { kind: "heading", text: "Simple, closed, C^k" },
      {
        kind: "definition",
        term: "Simple curve & closed curve",
        content: (
          <>
            Let <Tex>{"\\gamma\\in C^0(I;\\mathbb{R}^3)"}</Tex> (same in <Tex>{"\\mathbb{R}^2"}</Tex>).{" "}
            <Tex>{"\\gamma"}</Tex> is <strong>simple</strong> if for all{" "}
            <Tex>{"t_1,t_2\\in[a,b)"}</Tex>, <Tex>{"t_1\\neq t_2\\Rightarrow\\gamma(t_1)\\neq\\gamma(t_2)"}</Tex>{" "}
            — injective on <Tex>{"[a,b)"}</Tex>, so the trace has <strong>no self-intersections</strong>.{" "}
            <Tex>{"\\gamma"}</Tex> is <strong>closed</strong> if <Tex>{"\\gamma(a)=\\gamma(b)"}</Tex>. The
            ellipse <Tex>{"(2\\cos t,\\,3\\sin t)"}</Tex> on <Tex>{"[0,2\\pi]"}</Tex> is closed and simple;
            the figure-eight <Tex>{"(\\sin t,\\,\\sin 2t)"}</Tex> on <Tex>{"[0,2\\pi]"}</Tex> is closed but{" "}
            <strong>not</strong> simple (it crosses itself at the origin).
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Smoothness is inherited componentwise: <Tex>{"\\gamma\\in C^k(I;\\mathbb{R}^3)"}</Tex> means all
            components <Tex>{"t\\mapsto x(t),y(t),z(t)"}</Tex> are of class <Tex>{"C^k"}</Tex> on{" "}
            <Tex>{"I"}</Tex>. For <Tex>{"\\gamma\\in C^1"}</Tex>, differentiating the position componentwise
            gives the <strong>velocity</strong> — the workhorse of the whole module: every integral below
            contains <Tex>{"\\gamma'(t)"}</Tex> in some form.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Tangent vector",
        content: (
          <>
            For <Tex>{"\\gamma\\in C^1(I;\\mathbb{R}^3)"}</Tex> and <Tex>{"t\\in I"}</Tex>, the{" "}
            <strong>tangent vector</strong> to <Tex>{"\\gamma"}</Tex> at <Tex>{"\\gamma(t)"}</Tex> is{" "}
            <Tex>{"\\gamma'(t)=(x'(t),\\,y'(t),\\,z'(t))"}</Tex>: it points along the instantaneous direction
            of travel, with magnitude equal to the speed.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\gamma'(t)=(x'(t),\\,y'(t),\\,z'(t)),\\qquad \\|\\gamma'(t)\\|=\\sqrt{x'(t)^2+y'(t)^2+z'(t)^2}",
        tag: "1.1",
        caption: (
          <>
            Direction of travel and <strong>speed</strong>. In 2D just drop the <Tex>{"z"}</Tex>-component.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Regular & piecewise regular curve",
        content: (
          <>
            <Tex>{"\\gamma"}</Tex> is <strong>regular</strong> if{" "}
            <Tex>{"\\gamma\\in C^1(I;\\mathbb{R}^3)"}</Tex> and{" "}
            <Tex>{"\\gamma'(t)\\neq(0,0,0)"}</Tex> for <strong>every</strong> <Tex>{"t\\in I"}</Tex>: the
            traveller never stops, so a tangent direction exists at each point.{" "}
            <Tex>{"\\gamma"}</Tex> is <strong>piecewise regular</strong> if <Tex>{"I=[a,b]"}</Tex> splits as{" "}
            <Tex>{"a<t_1<\\dots<t_n<b"}</Tex> with <Tex>{"\\gamma"}</Tex> regular on each open piece{" "}
            <Tex>{"(a,t_1),(t_1,t_2),\\dots,(t_n,b)"}</Tex> — a chain of smooth arcs with corners allowed at
            the joints. Example from the deck: <Tex>{"\\gamma(t)=(t,t)"}</Tex> for <Tex>{"t<0"}</Tex>,{" "}
            <Tex>{"(t,\\sqrt{t})"}</Tex> for <Tex>{"t\\ge 0"}</Tex> is piecewise regular but not regular (no{" "}
            <Tex>{"C^1"}</Tex> junction at <Tex>{"t=0"}</Tex>).
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp5",
          difficulty: "medium",
          prompt: (
            <>
              Let <Tex>{"a,b>0"}</Tex> and <Tex>{"\\gamma(t)=(a\\cos t,\\ b\\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,4\\pi]"}</Tex>. Which classification is correct?
            </>
          ),
          options: [
            { id: "A", content: <>simple and closed</> },
            { id: "B", content: <>closed and regular, but not simple</> },
            { id: "C", content: <>not regular: <Tex>{"\\gamma'"}</Tex> vanishes at <Tex>{"t=2\\pi"}</Tex></> },
            { id: "D", content: <>simple, but not closed</> },
          ],
          correct: "B",
          explanation: (
            <>
              <Tex>{"\\gamma(0)=(a,0)=\\gamma(4\\pi)"}</Tex>: closed.{" "}
              <Tex>{"\\gamma'(t)=(-a\\sin t,\\ b\\cos t)"}</Tex> never vanishes (when{" "}
              <Tex>{"\\sin t=0"}</Tex>, <Tex>{"\\cos t=\\pm1"}</Tex>), so regular — C is false. But the
              interval runs the ellipse <em>twice</em>: <Tex>{"\\gamma(t)=\\gamma(t+2\\pi)"}</Tex>, so
              injectivity on <Tex>{"[0,4\\pi)"}</Tex> fails and the curve is not simple — B. A and D both
              claim simplicity; D also denies closedness.
            </>
          ),
          theory: (
            <>
              The interval matters as much as the formula: on <Tex>{"[0,2\\pi]"}</Tex> the same{" "}
              <Tex>{"\\gamma"}</Tex> is a simple closed ellipse; on <Tex>{"[0,4\\pi]"}</Tex> it is a closed,
              non-simple double cover.
            </>
          ),
        },
      },
      { kind: "heading", text: "Length of a curve" },
      {
        kind: "prose",
        content: (
          <p>
            The deck derives the length by <strong>approximation</strong>: mark instants{" "}
            <Tex>{"a<t_1<\\dots<t_n<b"}</Tex> and replace the curve by the polygonal chain through the marked
            points. Each chord has length{" "}
            <Tex>{"\\|\\gamma(t_{i+1})-\\gamma(t_i)\\|\\approx\\|\\gamma'(t_i)\\|\\,(t_{i+1}-t_i)"}</Tex> —
            speed times time. Refining the partition, the sum becomes the <strong>integral of the speed</strong>.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "L(\\gamma)=\\int_a^b \\|\\gamma'(t)\\|\\,dt=\\int_a^b\\sqrt{x'(t)^2+y'(t)^2+z'(t)^2}\\,dt",
        tag: "1.2",
        caption: (
          <>
            Defined for <strong>piecewise regular</strong> <Tex>{"\\gamma"}</Tex> (sum the pieces). The
            result does not depend on which regular parametrization you pick, as long as the trace is
            traversed <strong>once</strong>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Why the parametrization doesn't matter",
        content: (
          <>
            Reparametrize with <Tex>{"t=t(u)"}</Tex> (increasing). The chain rule multiplies the speed by{" "}
            <Tex>{"t'(u)"}</Tex> while the substitution rule divides <Tex>{"dt"}</Tex> by the same factor —
            they cancel exactly. Length is a property of the <em>trace</em>, not the <em>drive</em>. The same
            cancellation will make type-1 line integrals parametrization-free in the next lesson.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — circle and helix (from the deck)",
        content: (
          <>
            <p>
              <strong>Circle of radius R:</strong> <Tex>{"\\gamma(t)=(R\\cos t,\\ R\\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,2\\pi]"}</Tex>. Then <Tex>{"\\gamma'=(-R\\sin t,\\ R\\cos t)"}</Tex> and{" "}
              <Tex>{"\\|\\gamma'\\|=\\sqrt{R^2\\sin^2 t+R^2\\cos^2 t}=R"}</Tex>, so{" "}
              <Tex>{"L=\\int_0^{2\\pi} R\\,dt = 2\\pi R"}</Tex> — the familiar circumference.
            </p>
            <p>
              <strong>Helix:</strong> <Tex>{"\\gamma(t)=(\\cos t,\\ \\sin t,\\ t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,1]"}</Tex>. Then <Tex>{"\\gamma'=(-\\sin t,\\ \\cos t,\\ 1)"}</Tex> and{" "}
              <Tex>{"\\|\\gamma'\\|=\\sqrt{\\sin^2 t+\\cos^2 t+1}=\\sqrt2"}</Tex>, constant, so{" "}
              <Tex>{"L=\\sqrt2"}</Tex>. Constant speed is the helix's gift: the integral needs no work at
              all.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — when the square root cooperates",
        content: (
          <>
            <p>
              Deck exercise: length of <Tex>{"\\gamma(t)=(\\log(t^2-1),\\ t)"}</Tex>,{" "}
              <Tex>{"t\\in[2,3]"}</Tex>. Speed:{" "}
              <Tex>{"x'=\\tfrac{2t}{t^2-1}"}</Tex>, <Tex>{"y'=1"}</Tex>, so
            </p>
            <p>
              <Tex>{"\\|\\gamma'\\|=\\sqrt{\\tfrac{4t^2}{(t^2-1)^2}+1}=\\tfrac{\\sqrt{4t^2+(t^2-1)^2}}{t^2-1}=\\tfrac{\\sqrt{(t^2+1)^2}}{t^2-1}=\\tfrac{t^2+1}{t^2-1}"}</Tex>{" "}
              — the radicand is a <strong>perfect square</strong>. This is the exam's favourite design:
              always try to complete the square under the root before panicking.
            </p>
            <p>
              Then <Tex>{"\\tfrac{t^2+1}{t^2-1}=1+\\tfrac{2}{t^2-1}=1+\\tfrac{1}{t-1}-\\tfrac{1}{t+1}"}</Tex>{" "}
              (partial fractions), so{" "}
              <Tex>{"L=\\Big[t+\\log\\tfrac{t-1}{t+1}\\Big]_2^3 = 1+\\log\\tfrac{1/2}{1/3} = 1+\\log\\tfrac32"}</Tex>{" "}
              <Tex>{"\\approx 1.41"}</Tex> — exactly the deck's answer.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Arc-length recipe",
        steps: [
          {
            label: "Parametrize",
            content: (
              <>
                Write <Tex>{"\\gamma(t)"}</Tex> with an explicit interval <Tex>{"[a,b]"}</Tex>, checking the
                trace is covered exactly once.
              </>
            ),
          },
          {
            label: "Differentiate",
            content: <>Compute <Tex>{"\\gamma'(t)"}</Tex> componentwise.</>,
          },
          {
            label: "Take the speed",
            content: (
              <>
                Form <Tex>{"\\|\\gamma'(t)\\|"}</Tex> — square each component, sum, <strong>then</strong>{" "}
                take the square root. Simplify with <Tex>{"\\sin^2+\\cos^2=1"}</Tex> or a perfect square
                whenever they appear.
              </>
            ),
          },
          {
            label: "Integrate",
            content: <>Evaluate <Tex>{"\\int_a^b \\|\\gamma'(t)\\|\\,dt"}</Tex>.</>,
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp1",
          difficulty: "medium",
          prompt: (
            <>
              Compute the length of the helix <Tex>{"\\gamma(t)=(\\cos t,\\ \\sin t,\\ \\sqrt3\\,t)"}</Tex>{" "}
              for <Tex>{"t\\in[0,\\pi]"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"\\pi"}</Tex> },
            { id: "B", content: <Tex>{"\\sqrt3\\,\\pi"}</Tex> },
            { id: "C", content: <Tex>{"2\\pi"}</Tex> },
            { id: "D", content: <Tex>{"4\\pi"}</Tex> },
          ],
          correct: "C",
          explanation: (
            <>
              <Tex>{"\\gamma'=(-\\sin t,\\ \\cos t,\\ \\sqrt3)"}</Tex>, so{" "}
              <Tex>{"\\|\\gamma'\\|=\\sqrt{1+3}=2"}</Tex> and <Tex>{"L=\\int_0^\\pi 2\\,dt=2\\pi"}</Tex> — C.
              A uses only the circular part's speed 1; B uses only the vertical speed{" "}
              <Tex>{"\\sqrt3"}</Tex>; D forgets the square root and integrates the speed <em>squared</em>{" "}
              <Tex>{"1+3=4"}</Tex>.
            </>
          ),
          theory: <>Helix speed is the constant <Tex>{"\\sqrt{R^2+c^2}"}</Tex>; length = speed × parameter range.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The two classic arc-length blunders",
        content: (
          <>
            <strong>(1) Losing the square root:</strong> integrating <Tex>{"x'^2+y'^2"}</Tex> instead of{" "}
            <Tex>{"\\sqrt{x'^2+y'^2}"}</Tex> — always write the speed out before integrating.{" "}
            <strong>(2) Double cover:</strong> <Tex>{"(\\cos 2t,\\ \\sin 2t)"}</Tex> on{" "}
            <Tex>{"[0,2\\pi]"}</Tex> runs the unit circle <em>twice</em>: the formula honestly returns{" "}
            <Tex>{"4\\pi"}</Tex>, the distance travelled, not the length of the trace. Check the range
            before integrating. And never confuse length with the chord{" "}
            <Tex>{"\\|\\gamma(b)-\\gamma(a)\\|"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Curiosity from the deck: a curve of infinite length",
        content: (
          <>
            The Cartesian curve <Tex>{"\\gamma(t)=(t,\\,f(t))"}</Tex> on <Tex>{"[0,1]"}</Tex> with{" "}
            <Tex>{"f(t)=t\\sin(1/t)"}</Tex> (and <Tex>{"f(0)=0"}</Tex>) is continuous, yet{" "}
            <Tex>{"L(\\gamma)=\\infty"}</Tex>: the oscillations near 0 pile up unbounded length. This is why
            the length definition insists on <strong>piecewise regular</strong> curves — continuity alone
            guarantees nothing.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            With <Tex>{"\\gamma'"}</Tex> and the speed in hand, we can integrate <em>anything</em> along a
            curve — a density to get a wire's mass, or a force field to get work. That is the next lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — Line integrals of type 1 and type 2 (deck 5, part 1;
   * vector-field definitions from deck 2)
   * ================================================================ */
  {
    id: "line-integrals",
    title: "Line integrals of type 1 & 2: mass of a wire, work of a field",
    lecture: MODULE,
    summary:
      "Type 1 (∫ f ds) ignores orientation and weighs the wire; type 2 (∫ F·dl) is signed work and flips with orientation. Keep the two recipes separate.",
    minutes: 26,
    objectives: [
      "Compute line integrals of type 1, ∫ f ds, and interpret them as mass or fence area",
      "State what a vector field is and recognize the classic examples",
      "Compute line integrals of type 2 (work), ∫ F·dl, through a parametrization",
      "State which integral depends on orientation and which does not",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Two very different questions can be asked along the same curve. <em>How much metal is in this
            bent wire?</em> — that needs the <strong>line integral of type 1</strong>, which weighs a scalar
            density against arc length. <em>How much work does this force do on a particle sliding along the
            path?</em> — that needs the <strong>line integral of type 2</strong>, which dots a vector field
            with the direction of travel. The deck's two headline applications for type 1: the area of the
            "fence" between the graph of <Tex>{"f"}</Tex> and the <Tex>{"xy"}</Tex>-plane built over the
            curve, and the <strong>mass of a wire</strong> with density <Tex>{"f"}</Tex>.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Line integral of type 1 (∫ f ds)",
        content: (
          <>
            Let <Tex>{"f:\\mathbb{R}^2\\to\\mathbb{R}"}</Tex> be continuous and{" "}
            <Tex>{"\\gamma:[a,b]\\to\\mathbb{R}^2"}</Tex> be regular (same definition for{" "}
            <Tex>{"f:\\mathbb{R}^3\\to\\mathbb{R}"}</Tex> and curves in space). The{" "}
            <strong>line integral of type 1</strong> (first kind) of <Tex>{"f"}</Tex> along{" "}
            <Tex>{"\\gamma"}</Tex> is{" "}
            <Tex>{"\\int_\\gamma f\\,ds:=\\int_a^b f(\\gamma(t))\\,\\|\\gamma'(t)\\|\\,dt"}</Tex>. With{" "}
            <Tex>{"f\\equiv 1"}</Tex> it returns <Tex>{"L(\\gamma)"}</Tex>; with a density it returns the
            wire's mass. For piecewise regular <Tex>{"\\gamma=\\gamma_1\\cup\\dots\\cup\\gamma_n"}</Tex>, sum
            the pieces.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\int_\\gamma f\\,ds = \\int_a^b f(\\gamma(t))\\,\\|\\gamma'(t)\\|\\,dt",
        tag: "5.1",
        caption: (
          <>
            Substitute the parametrization into <Tex>{"f"}</Tex>, multiply by the <strong>speed</strong>,
            integrate in <Tex>{"t"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Type 1 is blind to parametrization AND orientation",
        content: (
          <>
            <Tex>{"ds=\\|\\gamma'\\|\\,dt"}</Tex> is always positive, so running the curve backwards (the
            deck's decreasing reparametrization <Tex>{"\\tilde\\gamma=\\gamma\\circ\\varphi"}</Tex> with{" "}
            <Tex>{"\\varphi'<0"}</Tex>), or twice as fast, changes nothing. A wire's mass cannot depend on
            which end you start weighing from — the mathematics agrees.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — mass of a half-circle wire",
        content: (
          <>
            <p>
              A wire occupies the upper half of the unit circle with density <Tex>{"\\rho(x,y)=y"}</Tex>{" "}
              (heavier at the top). Parametrize: <Tex>{"\\gamma(t)=(\\cos t,\\ \\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,\\pi]"}</Tex>, so <Tex>{"\\|\\gamma'\\|=1"}</Tex> and <Tex>{"ds=dt"}</Tex>.
            </p>
            <p>
              <Tex>{"m=\\int_\\gamma y\\,ds=\\int_0^{\\pi} \\sin t\\,dt = [-\\cos t]_0^{\\pi} = 1-(-1) = 2"}</Tex>.
              Sanity check: the density is at most 1 and the wire has length <Tex>{"\\pi\\approx 3.14"}</Tex>,
              so a mass of 2 (below <Tex>{"\\pi"}</Tex>, above 0) is plausible.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — a 3D fence and a perfect square",
        content: (
          <>
            <p>
              Deck exercise: <Tex>{"\\gamma(t)=(3t,\\ 3t^2,\\ 2t^3)"}</Tex>, <Tex>{"t\\in[1,2]"}</Tex>,{" "}
              <Tex>{"f(x,y,z)=\\tfrac{x^2y}{z}"}</Tex>. On the curve,{" "}
              <Tex>{"f(\\gamma(t))=\\tfrac{9t^2\\cdot 3t^2}{2t^3}=\\tfrac{27}{2}\\,t"}</Tex>.
            </p>
            <p>
              Speed: <Tex>{"\\gamma'=(3,\\ 6t,\\ 6t^2)"}</Tex>, so{" "}
              <Tex>{"\\|\\gamma'\\|=\\sqrt{9+36t^2+36t^4}=\\sqrt{9(1+2t^2)^2}=3(1+2t^2)"}</Tex> — again a
              perfect square under the root, planted on purpose.
            </p>
            <p>
              <Tex>{"\\int_\\gamma f\\,ds=\\tfrac{81}{2}\\int_1^2 (t+2t^3)\\,dt=\\tfrac{81}{2}\\Big[\\tfrac{t^2}{2}+\\tfrac{t^4}{2}\\Big]_1^2=\\tfrac{81}{2}\\,(10-1)=\\tfrac{729}{2}"}</Tex>{" "}
              — the deck's answer, verified.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — piecewise boundaries",
        content: (
          <>
            <p>
              <Tex>{"\\int_\\gamma x^2y\\,ds"}</Tex>, <Tex>{"\\gamma"}</Tex> = boundary of the upper half-disk
              of radius 2, run exactly once. Two pieces: on the diameter <Tex>{"y=0"}</Tex> the integrand
              vanishes — <strong>free lunch</strong>; on the semicircle{" "}
              <Tex>{"(2\\cos t,\\ 2\\sin t)"}</Tex>, <Tex>{"t\\in[0,\\pi]"}</Tex>, <Tex>{"ds=2\\,dt"}</Tex>{" "}
              and{" "}
              <Tex>{"\\int_0^\\pi 8\\cos^2 t\\sin t\\cdot 2\\,dt=16\\Big[-\\tfrac{\\cos^3 t}{3}\\Big]_0^\\pi=\\tfrac{32}{3}"}</Tex>.
            </p>
            <p>
              Same craft on the circular sector{" "}
              <Tex>{"D=\\{x^2+y^2\\le 2,\\ x,y\\ge 0,\\ y\\ge x\\}"}</Tex> with{" "}
              <Tex>{"f=xy"}</Tex>: the <Tex>{"y"}</Tex>-axis edge gives 0, the segment on{" "}
              <Tex>{"y=x"}</Tex> gives <Tex>{"\\int_0^1 t^2\\sqrt2\\,dt=\\tfrac{\\sqrt2}{3}"}</Tex>, the arc
              gives <Tex>{"\\int_{\\pi/4}^{\\pi/2}\\sin 2\\theta\\cdot\\sqrt2\\,d\\theta=\\tfrac{\\sqrt2}{2}"}</Tex>;
              total <Tex>{"\\tfrac{5\\sqrt2}{6}"}</Tex> — both deck answers, verified.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp6",
          difficulty: "easy",
          prompt: (
            <>
              Compute the line integral of type 1 <Tex>{"\\int_\\gamma (x+y)\\,ds"}</Tex>, where{" "}
              <Tex>{"\\gamma(t)=(t,\\,t)"}</Tex>, <Tex>{"t\\in[0,1]"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"1"}</Tex> },
            { id: "B", content: <Tex>{"2"}</Tex> },
            { id: "C", content: <Tex>{"2\\sqrt2"}</Tex> },
            { id: "D", content: <Tex>{"\\sqrt2"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"\\|\\gamma'\\|=\\sqrt{1+1}=\\sqrt2"}</Tex> and <Tex>{"f(\\gamma(t))=2t"}</Tex>, so{" "}
              <Tex>{"\\int_0^1 2t\\cdot\\sqrt2\\,dt=\\sqrt2"}</Tex> — D. A forgets the speed factor{" "}
              <Tex>{"\\sqrt2"}</Tex> entirely; B uses the speed <em>squared</em>{" "}
              <Tex>{"\\|\\gamma'\\|^2=2"}</Tex>; C evaluates the integrand <Tex>{"2\\sqrt2\\,t"}</Tex> at{" "}
              <Tex>{"t=1"}</Tex> instead of integrating.
            </>
          ),
          theory: (
            <>
              Type-1 recipe: substitute, multiply by <Tex>{"\\|\\gamma'\\|"}</Tex>, integrate. On the diagonal
              segment <Tex>{"(t,t)"}</Tex> the speed is <Tex>{"\\sqrt2"}</Tex>, never 1.
            </>
          ),
        },
      },
      { kind: "heading", text: "Vector fields" },
      {
        kind: "definition",
        term: "Vector field",
        content: (
          <>
            A <strong>vector field</strong> is a function{" "}
            <Tex>{"\\mathbf{F}: D\\subseteq\\mathbb{R}^n\\to\\mathbb{R}^m"}</Tex> (<Tex>{"n,m\\ge 2"}</Tex>).
            Writing <Tex>{"\\mathbf{F}=(F_1,F_2)"}</Tex> (or <Tex>{"(F_1,F_2,F_3)"}</Tex>), the{" "}
            <Tex>{"F_i"}</Tex> are the <strong>components</strong>; the domain is the intersection of the
            component domains, and <Tex>{"\\mathbf{F}"}</Tex> is continuous iff every component is. This
            module uses fields <Tex>{"\\mathbb{R}^2\\to\\mathbb{R}^2"}</Tex> and{" "}
            <Tex>{"\\mathbb{R}^3\\to\\mathbb{R}^3"}</Tex>, interpreted as <strong>force fields</strong>{" "}
            (fields <Tex>{"\\mathbb{R}^2\\to\\mathbb{R}^3"}</Tex> reappear later as surfaces).
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            A field attaches an arrow to every point — think wind, or a force. The deck's gallery: the
            radial field <Tex>{"\\tfrac12(x,y)"}</Tex> (arrows point away from the origin), the rotation
            field <Tex>{"(-y,\\,x)"}</Tex> (arrows circulate counterclockwise), and physics' favourites, the{" "}
            <strong>gravitational field</strong>{" "}
            <Tex>{"\\mathbf{F}(P)=-Gm\\,\\tfrac{P}{\\|P\\|^3}"}</Tex> and the electric field{" "}
            <Tex>{"\\mathbf{E}(P)=\\tfrac{q}{4\\pi\\varepsilon_0}\\,\\tfrac{P}{\\|P\\|^3}"}</Tex>, both with
            domain <Tex>{"\\mathbb{R}^3\\setminus\\{0\\}"}</Tex> and continuous there. When a particle takes
            a tiny step <Tex>{"d\\boldsymbol{\\ell}"}</Tex> along a curve, the field does work{" "}
            <Tex>{"\\mathbf{F}\\cdot d\\boldsymbol{\\ell}"}</Tex>: positive if the arrow helps the motion,
            negative if it fights it, zero if perpendicular.
          </p>
        ),
      },
      { kind: "heading", text: "Line integrals of type 2 — work and circulation" },
      {
        kind: "definition",
        term: "Line integral of type 2 (∫ F·dl)",
        content: (
          <>
            Let <Tex>{"\\mathbf{F}:\\mathbb{R}^2\\to\\mathbb{R}^2"}</Tex> be continuous and{" "}
            <Tex>{"\\gamma:[a,b]\\to\\mathbb{R}^2"}</Tex> regular, with <strong>unit tangent vector</strong>{" "}
            <Tex>{"\\tau(t)=\\gamma'(t)/\\|\\gamma'(t)\\|"}</Tex>. The{" "}
            <strong>line integral of type 2</strong> (second kind) of <Tex>{"\\mathbf{F}"}</Tex> along{" "}
            <Tex>{"\\gamma"}</Tex> — the <strong>work</strong> of <Tex>{"\\mathbf{F}"}</Tex> on{" "}
            <Tex>{"\\gamma"}</Tex> — is{" "}
            <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\boldsymbol{\\ell} := \\int_\\gamma \\mathbf{F}\\cdot\\tau\\;ds"}</Tex>:
            a type-1 integral of the <em>tangential component</em>. If <Tex>{"\\gamma"}</Tex> is closed we
            write <Tex>{"\\oint_\\gamma"}</Tex> and call it the <strong>circulation</strong> of{" "}
            <Tex>{"\\mathbf{F}"}</Tex> along <Tex>{"\\gamma"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\int_\\gamma \\mathbf{F}\\cdot d\\boldsymbol{\\ell} = \\int_a^b \\mathbf{F}(\\gamma(t))\\cdot\\gamma'(t)\\,dt",
        tag: "5.2",
        caption: (
          <>
            The norms cancel: <Tex>{"\\mathbf{F}\\cdot\\tau\\,\\|\\gamma'\\| = \\mathbf{F}\\cdot\\gamma'"}</Tex>.
            In differential-form notation this is{" "}
            <Tex>{"\\int_\\gamma F_1\\,dx + F_2\\,dy"}</Tex> with <Tex>{"dx=x'(t)\\,dt"}</Tex>,{" "}
            <Tex>{"dy=y'(t)\\,dt"}</Tex> (many books write <Tex>{"P=F_1"}</Tex>, <Tex>{"Q=F_2"}</Tex>).
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Orientation flips the sign",
        content: (
          <>
            Reversing the direction of travel replaces <Tex>{"\\gamma'"}</Tex> by{" "}
            <Tex>{"-\\gamma'"}</Tex>, so{" "}
            <Tex>{"\\int_{\\tilde\\gamma}\\mathbf{F}\\cdot d\\boldsymbol{\\ell} = -\\int_{\\gamma}\\mathbf{F}\\cdot d\\boldsymbol{\\ell}"}</Tex>{" "}
            (the deck's exercise with <Tex>{"\\tilde\\gamma=\\gamma\\circ\\varphi"}</Tex>,{" "}
            <Tex>{"\\varphi'<0"}</Tex>). Work is <em>signed</em>; mass is not. An exam statement must tell
            you the orientation — if it doesn't, say which one you chose. Piecewise regular curves: sum the
            pieces, each run in the right direction.
          </>
        ),
      },
      {
        kind: "sim",
        title: "Work explorer — fields, paths and the running integral",
        render: () => <VectorFieldWorkSim />,
        caption: (
          <>
            The readout is a genuine numerical integral of{" "}
            <Tex>{"\\mathbf{F}\\cdot d\\boldsymbol{\\ell}"}</Tex> (1600 steps). Try{" "}
            <Tex>{"\\mathbf{F}=(y,x)"}</Tex> on the circle: the work accumulates and then returns exactly to
            0 — a preview of conservative fields. Then switch to <Tex>{"\\mathbf{F}=(-y,x)"}</Tex>: the
            arrows circulate <em>with</em> the loop and the circulation climbs monotonically to{" "}
            <Tex>{"2\\pi"}</Tex>.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — circulation around the unit circle",
        content: (
          <>
            <p>
              Compute <Tex>{"\\oint_\\gamma \\mathbf{F}\\cdot d\\boldsymbol{\\ell}"}</Tex> for{" "}
              <Tex>{"\\mathbf{F}=(-y,\\,x)"}</Tex> with <Tex>{"\\gamma"}</Tex> the unit circle,
              counterclockwise. Parametrize <Tex>{"\\gamma(t)=(\\cos t,\\ \\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,2\\pi]"}</Tex>.
            </p>
            <p>
              Substitute: <Tex>{"\\mathbf{F}(\\gamma(t))=(-\\sin t,\\ \\cos t)"}</Tex> and{" "}
              <Tex>{"\\gamma'(t)=(-\\sin t,\\ \\cos t)"}</Tex> — the field is everywhere <em>tangent</em> to
              the loop. The dot product is <Tex>{"\\sin^2 t + \\cos^2 t = 1"}</Tex>, so{" "}
              <Tex>{"\\oint = \\int_0^{2\\pi} 1\\,dt = 2\\pi"}</Tex>.
            </p>
            <p>
              Nonzero circulation around a <strong>closed</strong> loop — remember this number; two lessons
              from now it becomes the star witness in the conservative-fields story.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck examples — three work integrals, verified",
        content: (
          <>
            <p>
              <strong>(1) In space:</strong> <Tex>{"\\mathbf{F}=(e^x,\\ x+y,\\ y+z)"}</Tex> on{" "}
              <Tex>{"\\gamma(t)=(t,\\ t^2,\\ t^3)"}</Tex>, <Tex>{"t\\in[0,1]"}</Tex>. Dot with{" "}
              <Tex>{"\\gamma'=(1,\\ 2t,\\ 3t^2)"}</Tex>:{" "}
              <Tex>{"e^t+2t^2+2t^3+3t^4+3t^5"}</Tex>, and integrating,{" "}
              <Tex>{"(e-1)+\\tfrac23+\\tfrac12+\\tfrac35+\\tfrac12 = e+\\tfrac{19}{15}"}</Tex>.
            </p>
            <p>
              <strong>(2) Piecewise with symmetry:</strong> <Tex>{"\\mathbf{F}=(xy,\\ y)"}</Tex> along the
              boundary of <Tex>{"\\{\\tfrac{x^2}{9}+\\tfrac{y^2}{4}\\le 1,\\ x\\ge 0\\}"}</Tex>, once
              counterclockwise. On the half-ellipse arc <Tex>{"(3\\cos t,\\ 2\\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[-\\tfrac\\pi2,\\tfrac\\pi2]"}</Tex>, the integrand is{" "}
              <Tex>{"-18\\sin^2 t\\cos t + 4\\sin t\\cos t"}</Tex>; the second term is odd and dies, the
              first gives <Tex>{"-18\\cdot\\tfrac23=-12"}</Tex>. On the vertical diameter{" "}
              <Tex>{"x=0"}</Tex>: <Tex>{"\\int_2^{-2} y\\,dy=0"}</Tex>. Total <Tex>{"-12"}</Tex>.
            </p>
            <p>
              <strong>(3) A suspicious zero:</strong> <Tex>{"\\mathbf{F}=(x+1,\\ y)"}</Tex> around{" "}
              <Tex>{"\\gamma(t)=(2\\cos t,\\ 2\\sin t)"}</Tex>, <Tex>{"t\\in[-\\pi,\\pi]"}</Tex>: the
              integrand collapses to <Tex>{"-2\\sin t"}</Tex>, whose integral over a full period is{" "}
              <Tex>{"0"}</Tex>. Foreshadowing: this field is a gradient, and gradients always give zero
              circulation — next lessons.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Any work integral, in four moves",
        steps: [
          {
            label: "Parametrize with orientation",
            content: <>Choose <Tex>{"\\gamma(t)"}</Tex>, <Tex>{"t\\in[a,b]"}</Tex>, running the stated direction.</>,
          },
          {
            label: "Substitute into F",
            content: <>Replace every <Tex>{"x,y"}</Tex> in the field by <Tex>{"x(t),y(t)"}</Tex>.</>,
          },
          {
            label: "Dot with γ′(t)",
            content: (
              <>
                Form the scalar <Tex>{"\\mathbf{F}(\\gamma(t))\\cdot\\gamma'(t)"}</Tex> — no{" "}
                <Tex>{"\\|\\gamma'\\|"}</Tex> anywhere.
              </>
            ),
          },
          { label: "Integrate in t", content: <>A single-variable integral finishes the job.</> },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp2",
          difficulty: "medium",
          prompt: (
            <>
              Compute the work of <Tex>{"\\mathbf{F}=(x,\\,y)"}</Tex> along the straight segment from{" "}
              <Tex>{"(0,0)"}</Tex> to <Tex>{"(3,4)"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"12.5"}</Tex> },
            { id: "B", content: <Tex>{"25"}</Tex> },
            { id: "C", content: <Tex>{"5"}</Tex> },
            { id: "D", content: <Tex>{"0"}</Tex> },
          ],
          correct: "A",
          explanation: (
            <>
              Parametrize <Tex>{"\\gamma(t)=(3t,4t)"}</Tex>, <Tex>{"t\\in[0,1]"}</Tex>:{" "}
              <Tex>{"\\mathbf{F}\\cdot\\gamma' = (3t)(3)+(4t)(4)=25t"}</Tex>, so{" "}
              <Tex>{"W=\\int_0^1 25t\\,dt = 12.5"}</Tex> — A. B forgets to integrate (it is the integrand's
              value at <Tex>{"t=1"}</Tex>); C is the segment's <em>length</em>, a type-1 slip; D misapplies
              "conservative ⇒ zero", which holds only on <em>closed</em> loops.
            </>
          ),
          theory: <>Open path + conservative field: work = potential difference, here <Tex>{"\\tfrac{x^2+y^2}{2}"}</Tex> giving <Tex>{"\\tfrac{25}{2}"}</Tex>.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Type 1 versus type 2 — do not mix the recipes",
        content: (
          <>
            In a work integral the velocity enters through the <strong>dot product</strong>, never as the
            factor <Tex>{"\\|\\gamma'\\|"}</Tex>; in a mass integral there is a speed factor and{" "}
            <strong>no</strong> dot product. Writing{" "}
            <Tex>{"\\int \\mathbf{F}\\cdot\\gamma'\\,\\|\\gamma'\\|\\,dt"}</Tex> (both at once) is the single
            most common mechanical error in this chapter.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            For closed loops there is a spectacular shortcut: the circulation around the boundary of a region
            equals a double integral <em>inside</em> the region. That bookkeeping theorem — Green's theorem —
            is next.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — Green's theorem (deck 5, part 2 — the deck places it
   * BEFORE conservative fields)
   * ================================================================ */
  {
    id: "greens-theorem",
    title: "Green's theorem: loops, curl & area",
    lecture: MODULE,
    summary:
      "The circulation around a Jordan region's positively oriented boundary equals the double integral of curl F inside — trade four ugly edges for one easy area integral.",
    minutes: 22,
    objectives: [
      "Define Jordan curves, Jordan regions and the positively oriented boundary",
      "State Green's theorem with the correct orientation and hypotheses",
      "Convert a circulation into a double integral of curl F (and know when you may)",
      "Compute enclosed areas from the boundary, holes included",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            The fundamental theorem of calculus says the boundary values of <Tex>{"F"}</Tex> know the
            integral of <Tex>{"F'"}</Tex> inside. Green's theorem is its two-dimensional sibling: the
            circulation of a field around the <strong>boundary</strong> of a region equals the total{" "}
            <strong>curl</strong> collected <em>inside</em>. The deck's picture: a fluid with velocity field{" "}
            <Tex>{"\\mathbf{F}"}</Tex>, a boat sailing the closed curve — the circulation{" "}
            <Tex>{"\\oint\\mathbf{F}\\cdot d\\boldsymbol{\\ell}"}</Tex> tells whether the flow is overall
            helpful or burdensome.
          </p>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Why should the inside know? The deck's heuristic: <strong>cut</strong> <Tex>{"D"}</Tex> into tiny
            squares of side <Tex>{"1/n"}</Tex>. Circulations add: on every edge shared by two squares the two
            traversals run in opposite directions and <strong>cancel</strong>, so the sum of all the little
            circulations equals the big one. Each little circulation is{" "}
            <Tex>{"\\approx \\operatorname{curl}\\mathbf{F}(P_{ij})\\cdot\\operatorname{Area}"}</Tex>, and as{" "}
            <Tex>{"n\\to\\infty"}</Tex> the sum becomes{" "}
            <Tex>{"\\iint_D \\operatorname{curl}\\mathbf{F}\\,dx\\,dy"}</Tex>. Cut again &amp; again — that is
            the whole proof idea.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Jordan curve & Jordan region",
        content: (
          <>
            A <strong>simple and closed</strong> curve in <Tex>{"\\mathbb{R}^2"}</Tex> is called a{" "}
            <strong>Jordan curve</strong>. An open set <Tex>{"D\\subseteq\\mathbb{R}^2"}</Tex> whose boundary{" "}
            <Tex>{"\\partial D"}</Tex> is the union of finitely many <em>disjoint</em> Jordan curves is a{" "}
            <strong>Jordan region</strong> — this allows holes (an annulus is a Jordan region with two
            boundary curves), but not self-crossing boundaries like a figure-eight.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Positively oriented boundary",
        content: (
          <>
            <Tex>{"\\partial D"}</Tex> is <strong>positively oriented</strong> if a traveller walking along
            it sees the region <Tex>{"D"}</Tex> always on her/his <strong>left</strong>. For a region without
            holes that means counterclockwise; for a region with holes the outer curve runs counterclockwise
            and each hole's curve runs <em>clockwise</em> — the one rule covers both.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\oint_{\\partial D} \\mathbf{F}\\cdot d\\boldsymbol{\\ell} \\;=\\; \\iint_D \\operatorname{curl}\\mathbf{F}\\,dx\\,dy \\;=\\; \\iint_D \\left( \\frac{\\partial F_2}{\\partial x} - \\frac{\\partial F_1}{\\partial y} \\right) dx\\,dy",
        tag: "5.3",
        caption: (
          <>
            <strong>Green's theorem</strong>: <Tex>{"D"}</Tex> a Jordan region, <Tex>{"\\partial D"}</Tex>{" "}
            positively oriented and piecewise regular, <Tex>{"\\mathbf{F}\\in C^1(D;\\mathbb{R}^2)"}</Tex>.
            In <Tex>{"P,Q"}</Tex> notation the integrand is <Tex>{"Q_x - P_y"}</Tex>. Negatively oriented
            boundary ⇒ flip the sign.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Check the hypotheses before you fire",
        content: (
          <>
            (1) <Tex>{"\\partial D"}</Tex> must be <strong>closed</strong> (Jordan curves) — Green says
            nothing about open arcs. (2) Orientation must be positive; clockwise flips the sign — the deck
            states this as its own remark because examiners love it. (3) <Tex>{"\\mathbf{F}"}</Tex> must be{" "}
            <Tex>{"C^1"}</Tex> on <strong>all of</strong> <Tex>{"D"}</Tex>, interior included: a single
            singular point inside the loop silently invalidates the naive application — next lesson's vortex
            field lives on exactly this loophole.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — trade the loop for a double integral",
        content: (
          <>
            <p>
              Compute <Tex>{"\\oint_C y^2\\,dx + 3xy\\,dy"}</Tex> (so{" "}
              <Tex>{"\\mathbf{F}=(y^2,\\ 3xy)"}</Tex>), where <Tex>{"C"}</Tex> is the counterclockwise
              boundary of the upper half-disk <Tex>{"D=\\{x^2+y^2\\le 1,\\ y\\ge 0\\}"}</Tex>. Directly this
              needs two pieces (diameter + semicircle); with Green it is two lines.
            </p>
            <p>
              <Tex>{"\\operatorname{curl}\\mathbf{F} = \\partial_x(3xy)-\\partial_y(y^2) = 3y-2y = y"}</Tex>.
              In polar coordinates:{" "}
              <Tex>{"\\iint_D y\\,dA = \\int_0^{\\pi}\\!\\!\\int_0^1 (r\\sin\\theta)\\,r\\,dr\\,d\\theta = \\Big(\\int_0^1 r^2 dr\\Big)\\Big(\\int_0^\\pi \\sin\\theta\\,d\\theta\\Big) = \\tfrac13\\cdot 2 = \\tfrac23"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck examples — constant curl and a clockwise trap",
        content: (
          <>
            <p>
              <strong>(1)</strong> <Tex>{"\\mathbf{F}=(x^2+y,\\ e^{y^2}-x)"}</Tex> around the boundary of the
              quarter-disk <Tex>{"\\{x,y\\ge 0,\\ x^2+y^2\\le 1\\}"}</Tex>, counterclockwise.{" "}
              <Tex>{"\\operatorname{curl}\\mathbf{F}=-1-1=-2"}</Tex>, so the work is{" "}
              <Tex>{"-2\\cdot\\operatorname{Area} = -2\\cdot\\tfrac{\\pi}{4} = -\\tfrac{\\pi}{2}"}</Tex>.
              Note <Tex>{"e^{y^2}"}</Tex> has no elementary primitive — the curl killed it without a fight.
            </p>
            <p>
              <strong>(2)</strong> <Tex>{"\\mathbf{F}=(x+y,\\ 3x)"}</Tex> around the boundary of{" "}
              <Tex>{"D=\\{x,y\\ge 0,\\ (2x+1)(2y+1)\\le 4\\}"}</Tex>, run <strong>clockwise</strong>.{" "}
              <Tex>{"\\operatorname{curl}\\mathbf{F}=3-1=2"}</Tex>, and the orientation is negative, so{" "}
              <Tex>{"W=-2\\operatorname{Area}(D)"}</Tex>. The hyperbola-shaped region:{" "}
              <Tex>{"\\operatorname{Area}=\\int_0^{3/2}\\tfrac12\\Big(\\tfrac{4}{2x+1}-1\\Big)dx = \\Big[\\log(2x+1)-\\tfrac{x}{2}\\Big]_0^{3/2} = 2\\log 2-\\tfrac34"}</Tex>,
              hence <Tex>{"W = \\tfrac32-4\\log 2 \\approx -1.27"}</Tex> — the deck's answer, verified.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Curl destroys one-variable monsters",
        content: (
          <>
            Terms of the form <Tex>{"g(x)"}</Tex> in <Tex>{"F_1"}</Tex> or <Tex>{"h(y)"}</Tex> in{" "}
            <Tex>{"F_2"}</Tex> have zero contribution to{" "}
            <Tex>{"\\operatorname{curl}\\mathbf{F}=\\partial_x F_2-\\partial_y F_1"}</Tex>. The deck's
            example: <Tex>{"\\mathbf{F}=(e^{x^2}-y,\\ \\tfrac{x^4}{4}+e^{y^2})"}</Tex> on the quarter-ellipse{" "}
            <Tex>{"\\{x,y\\ge0,\\ 9x^2+y^2\\le 9\\}"}</Tex> has{" "}
            <Tex>{"\\operatorname{curl}\\mathbf{F}=x^3+1"}</Tex>, giving{" "}
            <Tex>{"\\tfrac25+\\tfrac{3\\pi}{4}"}</Tex> (verified). If a work integral shows you{" "}
            <Tex>{"e^{x^8\\sin x}"}</Tex>, it is an invitation to use Green, not to integrate it.
          </>
        ),
      },
      { kind: "heading", text: "Area from the boundary" },
      {
        kind: "prose",
        content: (
          <p>
            Read (5.3) backwards: pick any field with{" "}
            <Tex>{"\\operatorname{curl}\\mathbf{F}\\equiv 1"}</Tex> — the deck's hint suggests{" "}
            <Tex>{"\\mathbf{F}=(0,x)"}</Tex> or <Tex>{"\\mathbf{F}=(-y,0)"}</Tex> — and the circulation
            computes the <strong>area</strong> of <Tex>{"D"}</Tex>. The symmetric average of the two is the
            exam favourite:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\operatorname{Area}(D) = \\oint_{\\partial D} x\\,dy = -\\oint_{\\partial D} y\\,dx = \\frac12 \\oint_{\\partial D} (x\\,dy - y\\,dx)",
        tag: "5.4",
        caption: (
          <>
            All three fields — <Tex>{"(0,x)"}</Tex>, <Tex>{"(-y,0)"}</Tex>,{" "}
            <Tex>{"\\tfrac12(-y,x)"}</Tex> — have curl 1; the boundary must be positively oriented.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — area of the ellipse",
        content: (
          <>
            <p>
              The ellipse <Tex>{"\\gamma(t)=(a\\cos t,\\ b\\sin t)"}</Tex>, <Tex>{"t\\in[0,2\\pi]"}</Tex>{" "}
              (counterclockwise). Compute the two ingredients:{" "}
              <Tex>{"x\\,dy = a\\cos t\\cdot b\\cos t\\,dt"}</Tex> and{" "}
              <Tex>{"y\\,dx = b\\sin t\\cdot(-a\\sin t)\\,dt"}</Tex>, so{" "}
              <Tex>{"x\\,dy - y\\,dx = ab(\\cos^2 t+\\sin^2 t)\\,dt = ab\\,dt"}</Tex>.
            </p>
            <p>
              Therefore <Tex>{"A = \\tfrac12\\int_0^{2\\pi} ab\\,dt = \\pi ab"}</Tex> — the classic result,
              in one line, with no square roots in sight. (Set <Tex>{"a=b=R"}</Tex> to recover{" "}
              <Tex>{"\\pi R^2"}</Tex>.)
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — area of a region with a hole",
        content: (
          <>
            <p>
              Let <Tex>{"D"}</Tex> be enclosed by <Tex>{"\\gamma_1(t)=(4\\cos t,\\ 2\\sin t)"}</Tex> (outer
              ellipse) and <Tex>{"-\\gamma_2"}</Tex> with <Tex>{"\\gamma_2(t)=(\\cos t,\\ \\sin t)"}</Tex>{" "}
              (unit-circle hole, run clockwise so <Tex>{"D"}</Tex> stays on the left). With{" "}
              <Tex>{"\\mathbf{F}=(0,x)"}</Tex>:{" "}
              <Tex>{"\\oint_{\\gamma_1} x\\,dy = \\int_0^{2\\pi} 8\\cos^2 t\\,dt = 8\\pi"}</Tex>, and the
              hole, traversed clockwise, contributes <Tex>{"-\\pi"}</Tex>.
            </p>
            <p>
              <Tex>{"\\operatorname{Area}(D) = 8\\pi - \\pi = 7\\pi"}</Tex> — outer ellipse area{" "}
              <Tex>{"\\pi\\cdot4\\cdot2"}</Tex> minus the unit disk, exactly as geometry demands. Holes are
              not a problem <em>if</em> every boundary curve carries its positive orientation.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Applying Green safely",
        steps: [
          {
            label: "Verify the setting",
            content: <>Jordan region, boundary positively oriented and piecewise regular, field <Tex>{"C^1"}</Tex> on the whole of <Tex>{"D"}</Tex> (no singularities inside).</>,
          },
          {
            label: "Compute curl F",
            content: <>Identify <Tex>{"F_1"}</Tex> (with <Tex>{"dx"}</Tex>) and <Tex>{"F_2"}</Tex> (with <Tex>{"dy"}</Tex>); form <Tex>{"\\partial_x F_2 - \\partial_y F_1"}</Tex>.</>,
          },
          {
            label: "Integrate over D",
            content: <>Set up <Tex>{"\\iint_D \\operatorname{curl}\\mathbf{F}\\,dA"}</Tex> — polar coordinates for disks and rings, straight iterated integrals for rectangles and triangles.</>,
          },
          {
            label: "Fix the sign",
            content: <>Clockwise boundary? Multiply the result by <Tex>{"-1"}</Tex>. State that you did.</>,
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp4",
          difficulty: "medium",
          prompt: (
            <>
              Compute <Tex>{"\\oint_C -y\\,dx + x\\,dy"}</Tex>, where <Tex>{"C"}</Tex> is the
              counterclockwise boundary of the rectangle <Tex>{"[0,3]\\times[0,1]"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"3"}</Tex> },
            { id: "B", content: <Tex>{"6"}</Tex> },
            { id: "C", content: <Tex>{"0"}</Tex> },
            { id: "D", content: <Tex>{"8"}</Tex> },
          ],
          correct: "B",
          explanation: (
            <>
              <Tex>{"\\operatorname{curl}\\mathbf{F} = 1-(-1) = 2"}</Tex>, so the circulation is{" "}
              <Tex>{"2\\cdot\\text{Area} = 2\\cdot 3 = 6"}</Tex> — B. A is the bare area (missing the factor
              2); C wrongly assumes the circulation vanishes (the curl is 2, not 0); D is the rectangle's{" "}
              <em>perimeter</em>, a different quantity entirely.
            </>
          ),
          theory: <>For F = (−y, x), the circulation is always 2 × (enclosed area) on a positively oriented loop.</>,
        },
      },
      {
        kind: "callout",
        tone: "tip",
        title: "∮ −y dx + x dy = 2 × Area — memorize it",
        content: (
          <>
            The rotation field <Tex>{"\\mathbf{F}=(-y,x)"}</Tex> has constant curl 2, so its circulation
            around <em>any</em> counterclockwise loop is twice the enclosed area. Check it in the lesson-2
            sim: the square loop (area 4) reads <Tex>{"W=8"}</Tex>, the unit circle (area{" "}
            <Tex>{"\\pi"}</Tex>) reads <Tex>{"2\\pi\\approx 6.283"}</Tex>. It is also a two-second sanity
            check for any Green computation you finish.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Green's theorem raises a sharp question: if{" "}
            <Tex>{"\\operatorname{curl}\\mathbf{F}\\equiv 0"}</Tex>, is every circulation zero — is the work
            always path-independent? The answer ("yes, <em>if</em> the domain has no holes") is the next
            lesson, and it is the most examined subtlety of the module.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 4 — Conservative fields (deck 5, part 3)
   * potentials U · FTC · equivalences · irrotational · vortex · simply connected
   * ================================================================ */
  {
    id: "conservative-fields",
    title: "Conservative fields, potentials & the vortex counterexample",
    lecture: MODULE,
    summary:
      "When F = ∇U, work is just U(end) − U(start). Learn the irrotational test, build potentials — and see exactly where the test lies to you.",
    minutes: 26,
    objectives: [
      "Define conservative fields and potentials U on arc-connected domains",
      "Use the fundamental theorem: ∫ F·dl = U(γ(b)) − U(γ(a)), and the three equivalent properties",
      "Construct potentials by partial integration, including normalizations and 3D fields",
      "Explain why irrotational ⇒ conservative needs a simply connected domain, via the vortex field",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Lifting a suitcase to the third floor costs the same work whether you take the stairs or the
            elevator: gravity only bills you for the <em>change in height</em>. The deck frames this as a
            question from MA1: every continuous <Tex>{"f:I\\to\\mathbb{R}"}</Tex> has a primitive{" "}
            <Tex>{"u"}</Tex> with <Tex>{"u'=f"}</Tex>, and then{" "}
            <Tex>{"\\int_a^b f = u(b)-u(a)"}</Tex>. <strong>Conservative fields generalize primitive
            maps</strong>: fields admitting a "primitive" make work integrals collapse to two function
            evaluations. Unlike MA1, though, not every continuous field qualifies.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Arc-connected set",
        content: (
          <>
            <Tex>{"D\\subseteq\\mathbb{R}^2"}</Tex> is <strong>arc-connected</strong> if for all{" "}
            <Tex>{"P,Q\\in D"}</Tex> there exists a continuous path joining <Tex>{"P"}</Tex> and{" "}
            <Tex>{"Q"}</Tex> contained in <Tex>{"D"}</Tex> (same definition for volumes{" "}
            <Tex>{"\\Omega\\subseteq\\mathbb{R}^3"}</Tex>). One piece — no islands.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Conservative field & potential",
        content: (
          <>
            Let <Tex>{"D\\subseteq\\mathbb{R}^2"}</Tex> be arc-connected and{" "}
            <Tex>{"\\mathbf{F}:D\\to\\mathbb{R}^2"}</Tex> continuous. <Tex>{"\\mathbf{F}"}</Tex> is{" "}
            <strong>conservative</strong> in <Tex>{"D"}</Tex> if there exists{" "}
            <Tex>{"U:D\\to\\mathbb{R}"}</Tex>, <Tex>{"U\\in C^1(D)"}</Tex>, with{" "}
            <Tex>{"\\nabla U=\\mathbf{F}"}</Tex> in <Tex>{"D"}</Tex> — i.e.{" "}
            <Tex>{"U_x=F_1"}</Tex>, <Tex>{"U_y=F_2"}</Tex>. Such a <Tex>{"U"}</Tex> is called a{" "}
            <strong>potential</strong> of <Tex>{"\\mathbf{F}"}</Tex> (other books write{" "}
            <Tex>{"\\varphi"}</Tex>); on an arc-connected domain it is unique up to an additive constant.
            Analogous definition for fields <Tex>{"\\Omega\\subseteq\\mathbb{R}^3\\to\\mathbb{R}^3"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Physics pays the bills",
        content: (
          <>
            The deck's flagship examples: the gravitational field{" "}
            <Tex>{"\\mathbf{F}(P)=-Gm\\,\\tfrac{P}{\\|P\\|^3}"}</Tex> (potential{" "}
            <Tex>{"U=\\tfrac{Gm}{\\|P\\|}"}</Tex>) and the electric field{" "}
            <Tex>{"\\mathbf{E}(P)=\\tfrac{q}{4\\pi\\varepsilon_0}\\tfrac{P}{\\|P\\|^3}"}</Tex> are
            conservative — more generally every <strong>central radial</strong> field{" "}
            <Tex>{"\\mathbf{F}(P)=f(P)\\tfrac{P}{\\|P\\|}"}</Tex> with radial <Tex>{"f"}</Tex> is. But
            continuity is not enough: <Tex>{"\\mathbf{F}=(-y,x)"}</Tex> is <strong>not</strong> conservative
            in <Tex>{"\\mathbb{R}^2"}</Tex> — lesson 2 computed circulation <Tex>{"2\\pi\\neq 0"}</Tex>{" "}
            around the unit circle, and the next callout explains why that settles it.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\int_\\gamma \\mathbf{F}\\cdot d\\boldsymbol{\\ell} = U(\\gamma(b)) - U(\\gamma(a))",
        tag: "5.5",
        caption: (
          <>
            The <strong>fundamental theorem for conservative vector fields</strong> (<Tex>{"D"}</Tex>{" "}
            arc-connected, <Tex>{"\\gamma:[a,b]\\to D"}</Tex> regular, <Tex>{"\\mathbf{F}"}</Tex>{" "}
            conservative with potential <Tex>{"U"}</Tex>): the work depends only on the potential at the{" "}
            <strong>endpoints</strong> of <Tex>{"\\gamma"}</Tex>, not on the route.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Three faces of the same property",
        content: (
          <>
            For a continuous field on an arc-connected <Tex>{"D"}</Tex>, these are equivalent:{" "}
            <strong>(1)</strong> <Tex>{"\\mathbf{F}"}</Tex> is conservative in <Tex>{"D"}</Tex>;{" "}
            <strong>(2)</strong> any two regular curves in <Tex>{"D"}</Tex> with the same start and end
            points carry the same work (path-independence); <strong>(3)</strong>{" "}
            <Tex>{"\\oint_\\gamma \\mathbf{F}\\cdot d\\boldsymbol{\\ell}=0"}</Tex> for <em>every</em> closed
            regular curve in <Tex>{"D"}</Tex>. One nonzero circulation therefore <strong>disproves</strong>{" "}
            conservativity instantly — that is how <Tex>{"(-y,x)"}</Tex> was convicted above.
          </>
        ),
      },
      { kind: "heading", text: "Computing potentials" },
      {
        kind: "steps",
        title: "Constructing the potential (partial-integration method)",
        steps: [
          {
            label: "Screen first",
            content: <>Check the irrotational condition (below): if <Tex>{"\\partial_x F_2\\neq\\partial_y F_1"}</Tex>, stop — no potential exists.</>,
          },
          {
            label: "Integrate one component",
            content: (
              <>
                <Tex>{"U(x,y)=\\int F_1\\,dx + g(y)"}</Tex> — the "constant" of integration may depend on{" "}
                <Tex>{"y"}</Tex>. Tip from the tutorials: start from the <em>simpler</em> component.
              </>
            ),
          },
          {
            label: "Match the other",
            content: (
              <>
                Differentiate in <Tex>{"y"}</Tex> and set <Tex>{"U_y=F_2"}</Tex>; solve for{" "}
                <Tex>{"g'(y)"}</Tex>. If any <Tex>{"x"}</Tex> survives in <Tex>{"g'(y)"}</Tex>, you made an
                error (or the field is not conservative) — a built-in alarm.
              </>
            ),
          },
          {
            label: "Finish & verify",
            content: (
              <>
                Integrate <Tex>{"g'"}</Tex>, assemble <Tex>{"U"}</Tex>, and <strong>check</strong>{" "}
                <Tex>{"\\nabla U=\\mathbf{F}"}</Tex> — ten seconds that save the whole exercise. In 3D the
                constant becomes <Tex>{"g(y,z)"}</Tex>, then <Tex>{"h(z)"}</Tex>: same game, one variable at
                a time.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — build U and cash in",
        content: (
          <>
            <p>
              <Tex>{"\\mathbf{F}=(y^2,\\ 2xy+1)"}</Tex>. Screen:{" "}
              <Tex>{"\\partial_y F_1=2y=\\partial_x F_2"}</Tex> — equal on all of{" "}
              <Tex>{"\\mathbb{R}^2"}</Tex> (simply connected, see below), so a potential exists.
            </p>
            <p>
              Integrate in x: <Tex>{"U=\\int y^2\\,dx = xy^2+g(y)"}</Tex>. Match:{" "}
              <Tex>{"U_y = 2xy+g'(y) \\stackrel{!}{=} 2xy+1 \\Rightarrow g'(y)=1 \\Rightarrow g(y)=y"}</Tex>.
              So <Tex>{"U = xy^2+y"}</Tex> (check: <Tex>{"\\nabla U=(y^2,\\,2xy+1)"}</Tex> ✓).
            </p>
            <p>
              Work from <Tex>{"(0,0)"}</Tex> to <Tex>{"(1,2)"}</Tex> along <em>any</em> curve:{" "}
              <Tex>{"W=U(1,2)-U(0,0) = (1\\cdot4+2)-0 = 6"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — normalizing the constant",
        content: (
          <>
            <p>
              Deck exercise: <Tex>{"\\mathbf{F}=(2xy,\\ x^2-1)"}</Tex> is conservative in{" "}
              <Tex>{"\\mathbb{R}^2"}</Tex>; find the potential with <Tex>{"U(0,1)=2"}</Tex>. The family is{" "}
              <Tex>{"U=x^2y-y+c"}</Tex>; imposing <Tex>{"U(0,1)=-1+c=2"}</Tex> gives{" "}
              <Tex>{"c=3"}</Tex>, so <Tex>{"U = x^2y-y+3"}</Tex> — the deck's answer, verified. Its sibling{" "}
              <Tex>{"\\mathbf{F}=(2x\\sin y,\\ 3y^2+x^2\\cos y)"}</Tex> has all potentials{" "}
              <Tex>{"U=x^2\\sin y+y^3+c"}</Tex>, <Tex>{"c\\in\\mathbb{R}"}</Tex> — when asked for{" "}
              <em>all</em> potentials, the "+c" is part of the answer.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — a 3D field with tunable constants",
        content: (
          <>
            <p>
              <Tex>{"\\mathbf{F}(x,y,z)=(e^y+\\alpha y,\\ xe^y+e^z+2x+\\beta yz,\\ ye^z+3y^2)"}</Tex>.{" "}
              <strong>(1)</strong> For which <Tex>{"\\alpha,\\beta"}</Tex> is it conservative in{" "}
              <Tex>{"\\mathbb{R}^3"}</Tex>? Match the mixed partials:{" "}
              <Tex>{"\\partial_y F_1=e^y+\\alpha"}</Tex> vs <Tex>{"\\partial_x F_2=e^y+2"}</Tex> forces{" "}
              <Tex>{"\\alpha=2"}</Tex>; <Tex>{"\\partial_z F_2=e^z+\\beta y"}</Tex> vs{" "}
              <Tex>{"\\partial_y F_3=e^z+6y"}</Tex> forces <Tex>{"\\beta=6"}</Tex>;{" "}
              <Tex>{"\\partial_z F_1=0=\\partial_x F_3"}</Tex> ✓. <Tex>{"\\mathbb{R}^3"}</Tex> is simply
              connected, so irrotational suffices.
            </p>
            <p>
              <strong>(2)</strong> Potentials: integrating <Tex>{"F_1"}</Tex> in <Tex>{"x"}</Tex> and
              matching twice, <Tex>{"U = xe^y+2xy+ye^z+3y^2z+c"}</Tex>. Requiring{" "}
              <Tex>{"U(1,0,2)=10"}</Tex>: <Tex>{"1+c=10"}</Tex>, so <Tex>{"c=9"}</Tex>.
            </p>
            <p>
              <strong>(3)</strong> Work along{" "}
              <Tex>{"\\gamma(t)=(t,\\ \\sin(\\tfrac{\\pi}{2}t),\\ \\sqrt{t})"}</Tex>,{" "}
              <Tex>{"t\\in[0,1]"}</Tex>: the messy curve is a decoy — only{" "}
              <Tex>{"\\gamma(0)=(0,0,0)"}</Tex> and <Tex>{"\\gamma(1)=(1,1,1)"}</Tex> matter:{" "}
              <Tex>{"W=U(1,1,1)-U(0,0,0)=(e+2+e+3)-0 = 2e+5\\approx 10.44"}</Tex> — the deck's answer,
              verified (the constant <Tex>{"c"}</Tex> cancels).
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp7",
          difficulty: "medium",
          prompt: (
            <>
              <Tex>{"\\mathbf{F}=(2xy,\\ x^2-1)"}</Tex> is conservative on <Tex>{"\\mathbb{R}^2"}</Tex>. If{" "}
              <Tex>{"U"}</Tex> is the potential with <Tex>{"U(0,1)=2"}</Tex>, then <Tex>{"U(1,2)"}</Tex>{" "}
              equals:
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"3"}</Tex> },
            { id: "B", content: <Tex>{"0"}</Tex> },
            { id: "C", content: <Tex>{"5"}</Tex> },
            { id: "D", content: <Tex>{"2"}</Tex> },
          ],
          correct: "A",
          explanation: (
            <>
              Partial integration gives <Tex>{"U=x^2y-y+c"}</Tex>; the condition{" "}
              <Tex>{"U(0,1)=-1+c=2"}</Tex> fixes <Tex>{"c=3"}</Tex>, so{" "}
              <Tex>{"U(1,2)=2-2+3=3"}</Tex> — A. B drops the constant (bare <Tex>{"x^2y-y"}</Tex> gives 0);
              C adds <Tex>{"c=3"}</Tex> to the given value 2 instead of evaluating; D assumes{" "}
              <Tex>{"c"}</Tex> equals the prescribed value 2.
            </>
          ),
          theory: (
            <>
              A normalization like <Tex>{"U(P_0)=k"}</Tex> picks one potential out of the family{" "}
              <Tex>{"U+c"}</Tex>: fix <Tex>{"c"}</Tex> first, then evaluate.
            </>
          ),
        },
      },
      { kind: "heading", text: "Irrotational fields — the cheap screening test" },
      {
        kind: "prose",
        content: (
          <p>
            Is there an easy way to show a field is conservative? The deck answers: "YES, but be{" "}
            <strong>CAREFUL of the DOMAIN</strong>". The tool is the <strong>curl</strong>. In 2D it is the
            scalar <Tex>{"\\operatorname{curl}\\mathbf{F}:=\\partial_x F_2-\\partial_y F_1"}</Tex> — Green's
            integrand. In 3D it is the vector <Tex>{"\\nabla\\times\\mathbf{F}"}</Tex>:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\operatorname{curl}\\mathbf{F} = \\begin{vmatrix} \\vec\\imath & \\vec\\jmath & \\vec k \\\\ \\partial_x & \\partial_y & \\partial_z \\\\ F_1 & F_2 & F_3 \\end{vmatrix} = \\Big( \\tfrac{\\partial F_3}{\\partial y}-\\tfrac{\\partial F_2}{\\partial z},\\ \\tfrac{\\partial F_1}{\\partial z}-\\tfrac{\\partial F_3}{\\partial x},\\ \\tfrac{\\partial F_2}{\\partial x}-\\tfrac{\\partial F_1}{\\partial y} \\Big)",
        tag: "5.6",
        caption: (
          <>
            The 2D scalar curl is the third component with <Tex>{"F_3=0"}</Tex>. A{" "}
            <Tex>{"C^1"}</Tex> field with <Tex>{"\\operatorname{curl}\\mathbf{F}=\\mathbf{0}"}</Tex> in{" "}
            <Tex>{"D"}</Tex> is called <strong>irrotational</strong> in <Tex>{"D"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "FACT 1 and FACT 2 (the deck's own emphasis)",
        content: (
          <>
            <strong>FACT 1:</strong> conservative in <Tex>{"D"}</Tex> ⇒ irrotational in <Tex>{"D"}</Tex> —
            by Schwarz's lemma, <Tex>{"\\partial_y F_1 = U_{xy} = U_{yx} = \\partial_x F_2"}</Tex>. It is a{" "}
            <em>necessary</em> condition, a cheap screening test.{" "}
            <strong>FACT 2:</strong> the opposite implication does <strong>NOT</strong> hold — the deck's
            counterexample is the vortex field, next.
          </>
        ),
      },
      { kind: "heading", text: "Irrotational but NOT conservative — the vortex" },
      {
        kind: "prose",
        content: (
          <p>
            Consider the <strong>vortex field</strong> on the punctured plane{" "}
            <Tex>{"\\mathbb{R}^2\\setminus\\{(0,0)\\}"}</Tex>:{" "}
            <Tex>{"\\mathbf{F}=\\left(\\dfrac{-y}{x^2+y^2},\\ \\dfrac{x}{x^2+y^2}\\right)"}</Tex>. A direct
            (if tedious) computation gives both cross partials equal — irrotational at <em>every</em> point
            of its domain. Yet on the unit circle <Tex>{"x^2+y^2=1"}</Tex> the field reduces to{" "}
            <Tex>{"(-\\sin t,\\ \\cos t)"}</Tex>, exactly the tangent field from lesson 2, whose circulation
            we computed by hand:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{\\partial F_1}{\\partial y} = \\frac{y^2-x^2}{(x^2+y^2)^2} = \\frac{\\partial F_2}{\\partial x}, \\qquad\\text{yet}\\qquad \\oint_{x^2+y^2=1} \\mathbf{F}\\cdot d\\boldsymbol{\\ell} = 2\\pi \\neq 0",
        tag: "5.7",
        caption: (
          <>
            Passes the irrotational test everywhere, fails the closed-loop criterion — so it is{" "}
            <strong>not conservative</strong> on the punctured plane. And Green cannot save you: the theorem
            needs <Tex>{"\\mathbf{F}\\in C^1"}</Tex> on the <em>whole</em> disk, but the origin — inside the
            loop — is a singularity.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <DomainFigure />,
        caption: (
          <>
            Left: no holes, every loop contracts — irrotational ⇒ conservative. Right: the loop around the
            hole cannot contract — the test says nothing about it, and the vortex exploits exactly this.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Simply connected domain",
        content: (
          <>
            An open arc-connected <Tex>{"D\\subseteq\\mathbb{R}^2"}</Tex> is <strong>simply connected</strong>{" "}
            if every closed curve in <Tex>{"D"}</Tex> can be continuously deformed to a single point without
            exiting <Tex>{"D"}</Tex> — roughly, arc-connected with <strong>no holes</strong>.{" "}
            <strong>Theorem:</strong> if <Tex>{"D"}</Tex> is simply connected and{" "}
            <Tex>{"\\mathbf{F}\\in C^1(D)"}</Tex>, then conservative <Tex>{"\\Leftrightarrow"}</Tex>{" "}
            irrotational. Same statement in <Tex>{"\\mathbb{R}^3"}</Tex>. Deck examples:{" "}
            <Tex>{"\\mathbb{R}^2\\setminus\\{P\\}"}</Tex> is NOT simply connected;{" "}
            <Tex>{"\\mathbb{R}^3"}</Tex> minus a <em>line</em> is NOT — but <Tex>{"\\mathbb{R}^3"}</Tex>{" "}
            minus a <em>point</em> IS: loops can dodge a point in 3D.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The examiner's favourite trick",
        content: (
          <>
            "<Tex>{"\\operatorname{curl}\\mathbf{F}=0"}</Tex>, therefore conservative" earns zero marks
            unless you add <em>"and the domain is simply connected"</em>. The vortex is the standard
            counterexample: its domain has a hole at the origin. Subtle bonus: restricted to the half-plane{" "}
            <Tex>{"x>0"}</Tex> (simply connected!) the <em>same</em> field IS conservative, with potential{" "}
            <Tex>{"U=\\arctan(y/x)"}</Tex> — the polar angle. Conservativity depends on the{" "}
            <strong>domain</strong>, not just the formula.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-crv-cp3",
          difficulty: "medium",
          prompt: (
            <>
              <Tex>{"\\mathbf{F}=(2xy,\\ x^2)"}</Tex> on <Tex>{"\\mathbb{R}^2"}</Tex>. Compute{" "}
              <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\boldsymbol{\\ell}"}</Tex> along any curve from{" "}
              <Tex>{"(1,0)"}</Tex> to <Tex>{"(2,3)"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"0"}</Tex> },
            { id: "B", content: <Tex>{"-12"}</Tex> },
            { id: "C", content: <Tex>{"18"}</Tex> },
            { id: "D", content: <Tex>{"12"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"\\partial_y F_1=2x=\\partial_x F_2"}</Tex> on all of <Tex>{"\\mathbb{R}^2"}</Tex>{" "}
              (simply connected), and <Tex>{"U=x^2y"}</Tex> works. Then{" "}
              <Tex>{"W=U(2,3)-U(1,0)=12-0=12"}</Tex> — D. A confuses "conservative" with "zero work" (true
              only for closed loops); B subtracts the endpoints in the wrong order; C uses the wrong
              potential <Tex>{"xy^2"}</Tex> (from integrating <Tex>{"F_1"}</Tex> in <Tex>{"y"}</Tex> by
              mistake), giving <Tex>{"2\\cdot 9=18"}</Tex>.
            </>
          ),
          theory: <>Conservative field: work = U(end) − U(start), any path. Zero only when the endpoints coincide.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            The module is complete: parametrize curves, weigh them with type-1 integrals, work them with
            type-2 integrals, shortcut closed loops with Green, and shortcut <em>everything</em> when a
            potential exists. Green's theorem is also the planar member of a family: lift it to surfaces in
            space and it becomes <strong>Stokes' theorem</strong>; rewrite it for normal components and it
            becomes the <strong>divergence theorem</strong> — both waiting in the surfaces &amp; flux module.
          </p>
        ),
      },
    ],
  },
];

/* ==================================================================== *
 * PRACTICE — 18 questions
 * difficulty: 6 easy / 8 medium / 4 hard · correct: 5A / 5B / 4C / 4D
 * ==================================================================== */
export const practice: Question[] = [
  {
    id: "ma2-crv-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        The tangent (velocity) vector of the helix <Tex>{"\\mathbf{r}(t)=(\\cos t,\\ \\sin t,\\ 2t)"}</Tex>{" "}
        is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"(\\sin t,\\ -\\cos t,\\ 2)"}</Tex> },
      { id: "B", content: <Tex>{"(-\\sin t,\\ \\cos t,\\ 2)"}</Tex> },
      { id: "C", content: <Tex>{"(-\\sin t,\\ \\cos t,\\ 2t)"}</Tex> },
      { id: "D", content: <Tex>{"(-\\cos t,\\ -\\sin t,\\ 0)"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Differentiate each component: <Tex>{"(\\cos t)'=-\\sin t"}</Tex>, <Tex>{"(\\sin t)'=\\cos t"}</Tex>,{" "}
        <Tex>{"(2t)'=2"}</Tex> — B. A has both trig signs flipped; C forgot to differentiate the{" "}
        <Tex>{"z"}</Tex>-component (left <Tex>{"2t"}</Tex>); D is the second derivative of the circular part
        with the linear part killed.
      </>
    ),
    theory: <>The tangent vector is the componentwise derivative r′(t) — nothing more.</>,
  },
  {
    id: "ma2-crv-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The arc length of a regular curve <Tex>{"\\mathbf{r}(t)"}</Tex>, <Tex>{"t\\in[a,b]"}</Tex>, is:</>,
    options: [
      { id: "A", content: <Tex>{"\\int_a^b \\mathbf{r}'(t)\\,dt"}</Tex> },
      { id: "B", content: <Tex>{"\\int_a^b |\\mathbf{r}(t)|\\,dt"}</Tex> },
      { id: "C", content: <Tex>{"\\int_a^b |\\mathbf{r}'(t)|\\,dt"}</Tex> },
      { id: "D", content: <Tex>{"|\\mathbf{r}(b)-\\mathbf{r}(a)|"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Length is the integral of the <em>speed</em> <Tex>{"|\\mathbf{r}'(t)|"}</Tex> — C. A integrates the
        velocity vector and returns a displacement <em>vector</em>, not a length; B integrates the distance
        from the origin, which has nothing to do with length; D is the straight-line chord between the
        endpoints, which underestimates every curved path.
      </>
    ),
    theory: <>L = ∫ speed dt: sum of chord lengths |r′| dt, intrinsic to the curve.</>,
  },
  {
    id: "ma2-crv-q3",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The length of the helix <Tex>{"\\mathbf{r}(t)=(3\\cos t,\\ 3\\sin t,\\ 4t)"}</Tex> for{" "}
        <Tex>{"t\\in[0,2\\pi]"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"10\\pi"}</Tex> },
      { id: "B", content: <Tex>{"6\\pi"}</Tex> },
      { id: "C", content: <Tex>{"8\\pi"}</Tex> },
      { id: "D", content: <Tex>{"14\\pi"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\mathbf{r}'=(-3\\sin t, 3\\cos t, 4)"}</Tex>, so{" "}
        <Tex>{"|\\mathbf{r}'|=\\sqrt{9+16}=5"}</Tex> (a 3-4-5 triangle!) and{" "}
        <Tex>{"L=5\\cdot 2\\pi = 10\\pi"}</Tex> — A. B uses only the circular speed 3; C uses only the
        vertical speed 4; D adds the speeds (<Tex>{"3+4=7"}</Tex>) instead of combining them in quadrature{" "}
        <Tex>{"\\sqrt{3^2+4^2}"}</Tex>.
      </>
    ),
    theory: <>Helix speed = √(R² + c²), constant — components combine like a right triangle, not by addition.</>,
  },
  {
    id: "ma2-crv-q4",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>A parametric curve <Tex>{"\\mathbf{r}(t)"}</Tex> is called <strong>regular</strong> when:</>,
    options: [
      { id: "A", content: <><Tex>{"\\mathbf{r}(t)"}</Tex> is continuous</> },
      { id: "B", content: <>it has no self-intersections</> },
      { id: "C", content: <>it is closed: <Tex>{"\\mathbf{r}(a)=\\mathbf{r}(b)"}</Tex></> },
      { id: "D", content: <><Tex>{"\\mathbf{r}'"}</Tex> is continuous and <Tex>{"\\mathbf{r}'(t)\\neq\\mathbf{0}"}</Tex> for every <Tex>{"t"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        Regular = continuously differentiable with never-vanishing velocity, so the tangent direction is
        defined everywhere — D. A is mere continuity (even fractal-like curves qualify); B describes a{" "}
        <em>simple</em> curve; C describes a <em>closed</em> curve. All three are different, independent
        properties.
      </>
    ),
    theory: <>Regular ⇔ the traveller never stops (r′ ≠ 0) ⇔ a tangent line exists at every point.</>,
  },
  {
    id: "ma2-crv-q5",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        If you reverse the orientation of the curve <Tex>{"\\gamma"}</Tex>, the scalar line integral{" "}
        <Tex>{"\\int_\\gamma f\\,ds"}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <>changes sign</> },
      { id: "B", content: <>is unchanged</> },
      { id: "C", content: <>doubles</> },
      { id: "D", content: <>becomes zero</> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"ds=|\\mathbf{r}'|\\,dt"}</Tex> is always positive, so direction is invisible to it: a wire's
        mass is the same from either end — B. A describes the <em>work</em> integral{" "}
        <Tex>{"\\int\\mathbf{F}\\cdot d\\mathbf{r}"}</Tex>, which does flip; C and D have no mechanism at
        all.
      </>
    ),
    theory: <>ds-integrals are orientation-free; dr-integrals are signed and flip under reversal.</>,
  },
  {
    id: "ma2-crv-q6",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Compute <Tex>{"\\int_\\gamma (x^2+y^2)\\,ds"}</Tex>, where <Tex>{"\\gamma"}</Tex> is the full circle
        of radius 2 centered at the origin.
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"4\\pi"}</Tex> },
      { id: "B", content: <Tex>{"8\\pi"}</Tex> },
      { id: "C", content: <Tex>{"16\\pi"}</Tex> },
      { id: "D", content: <Tex>{"32\\pi"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        On the curve <Tex>{"x^2+y^2=4"}</Tex> — the integrand is <em>constant</em>, so the integral is{" "}
        <Tex>{"4\\times(\\text{length}) = 4\\cdot 4\\pi = 16\\pi"}</Tex> — C. A is the bare length{" "}
        <Tex>{"4\\pi"}</Tex> (density forgotten); B uses the radius 2 instead of its square 4; D doubles the
        length by using the diameter as the radius.
      </>
    ),
    theory: <>If f is constant on γ (here f = R²), then ∫ f ds = f × length(γ) — spot this before parametrizing.</>,
  },
  {
    id: "ma2-crv-q7",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        Through a parametrization <Tex>{"\\mathbf{r}(t)"}</Tex>, <Tex>{"t\\in[a,b]"}</Tex>, the work{" "}
        <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\cdot \\mathbf{r}'(t)\\,dt"}</Tex> },
      { id: "B", content: <Tex>{"\\int_a^b |\\mathbf{F}(\\mathbf{r}(t))|\\,|\\mathbf{r}'(t)|\\,dt"}</Tex> },
      { id: "C", content: <Tex>{"\\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\,|\\mathbf{r}'(t)|\\,dt"}</Tex> },
      { id: "D", content: <Tex>{"\\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\times \\mathbf{r}'(t)\\,dt"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        Work dots the field with the velocity — A. B multiplies magnitudes, ignoring the angle between force
        and motion (it would make all work non-negative); C bolts the scalar-integral speed factor onto a
        vector, producing a vector "result"; D uses the cross product, which measures perpendicularity, not
        alignment.
      </>
    ),
    theory: <>Work rewards alignment: F·r′ is |F||r′|cos θ, positive with the motion, negative against it.</>,
  },
  {
    id: "ma2-crv-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The work of <Tex>{"\\mathbf{F}=(y,\\ x)"}</Tex> along the segment from <Tex>{"(0,0)"}</Tex> to{" "}
        <Tex>{"(1,1)"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"0"}</Tex> },
      { id: "B", content: <Tex>{"2"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac12"}</Tex> },
      { id: "D", content: <Tex>{"1"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        With <Tex>{"\\mathbf{r}(t)=(t,t)"}</Tex>: <Tex>{"\\mathbf{F}=(t,t)"}</Tex>,{" "}
        <Tex>{"\\mathbf{r}'=(1,1)"}</Tex>, dot product <Tex>{"2t"}</Tex>, and{" "}
        <Tex>{"\\int_0^1 2t\\,dt=1"}</Tex> — D. (Faster: <Tex>{"\\mathbf{F}=\\nabla(xy)"}</Tex>, so{" "}
        <Tex>{"W=1\\cdot1-0=1"}</Tex>.) A misuses "conservative ⇒ 0", valid only on closed loops; B takes
        the integrand's endpoint value <Tex>{"2t|_{t=1}"}</Tex> without integrating; C keeps only one of the
        two equal dot-product terms.
      </>
    ),
    theory: <>Check for a potential first: F = (y,x) = ∇(xy) turns any work integral into two evaluations.</>,
  },
  {
    id: "ma2-crv-q9",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Reversing a curve's orientation, what happens to <Tex>{"\\int_\\gamma f\\,ds"}</Tex> and <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex> respectively?</>,
    options: [
      { id: "A", content: <>both change sign</> },
      { id: "B", content: <>the ds-integral is unchanged; the work changes sign</> },
      { id: "C", content: <>both are unchanged</> },
      { id: "D", content: <>the ds-integral changes sign; the work is unchanged</> },
    ],
    correct: "B",
    explanation: (
      <>
        Reversal sends <Tex>{"\\mathbf{r}'\\mapsto-\\mathbf{r}'"}</Tex>: the dot product in the work flips
        sign, while <Tex>{"ds=|\\mathbf{r}'|dt"}</Tex> absorbs the sign in the absolute value — B. A and C
        each get one of the two wrong; D is exactly backwards on both.
      </>
    ),
    theory: <>Mass-type integrals are geometric (unsigned); work-type integrals are oriented (signed).</>,
  },
  {
    id: "ma2-crv-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Consider <Tex>{"\\mathbf{F}=(2xy,\\ x^2+3y^2)"}</Tex> on <Tex>{"\\mathbb{R}^2"}</Tex>. Is it
        conservative, and if so what is a potential?
      </>
    ),
    options: [
      { id: "A", content: <>Yes; <Tex>{"\\varphi = x^2y + y^3"}</Tex></> },
      { id: "B", content: <>Yes; <Tex>{"\\varphi = x^2y + 3y^3"}</Tex></> },
      { id: "C", content: <>No; the cross partials differ</> },
      { id: "D", content: <>Yes; <Tex>{"\\varphi = xy^2 + y^3"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"P_y=2x"}</Tex> and <Tex>{"Q_x=2x"}</Tex>: equal on the simply connected{" "}
        <Tex>{"\\mathbb{R}^2"}</Tex>, so conservative — C is wrong. Integrate:{" "}
        <Tex>{"\\varphi=\\int 2xy\\,dx = x^2y+g(y)"}</Tex>;{" "}
        <Tex>{"\\varphi_y = x^2+g'(y)=x^2+3y^2 \\Rightarrow g=y^3"}</Tex>, giving A. B forgets that{" "}
        <Tex>{"3y^2"}</Tex> integrates to <Tex>{"y^3"}</Tex> (keeps the 3); D integrated <Tex>{"P"}</Tex>{" "}
        with respect to <Tex>{"y"}</Tex> instead of <Tex>{"x"}</Tex>. Always verify:{" "}
        <Tex>{"\\nabla(x^2y+y^3)=(2xy,\\ x^2+3y^2)"}</Tex> ✓.
      </>
    ),
    theory: <>Test P_y = Q_x, integrate P in x with g(y), match Q, then verify ∇φ = F.</>,
  },
  {
    id: "ma2-crv-q11",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>A potential of <Tex>{"\\mathbf{F}=(2x+y,\\ x+2y)"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"x^2+y^2"}</Tex> },
      { id: "B", content: <Tex>{"x^2+xy"}</Tex> },
      { id: "C", content: <Tex>{"x^2+xy+y^2"}</Tex> },
      { id: "D", content: <Tex>{"2x^2+xy+2y^2"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Check by differentiating C: <Tex>{"\\varphi_x=2x+y"}</Tex> ✓, <Tex>{"\\varphi_y=x+2y"}</Tex> ✓. A
        loses the cross term (its gradient is <Tex>{"(2x,2y)"}</Tex> — no <Tex>{"y"}</Tex> in the first
        component); B loses <Tex>{"y^2"}</Tex> (its <Tex>{"\\varphi_y=x"}</Tex> misses <Tex>{"2y"}</Tex>);
        D forgot to halve when integrating (<Tex>{"\\int 2x\\,dx = x^2"}</Tex>, not <Tex>{"2x^2"}</Tex>).
        The fastest check on any multiple-choice potential question is to differentiate the candidates.
      </>
    ),
    theory: <>To verify a proposed potential, differentiate it — much faster than constructing one.</>,
  },
  {
    id: "ma2-crv-q12",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The vortex field <Tex>{"\\mathbf{F}=\\left(\\frac{-y}{x^2+y^2},\\ \\frac{x}{x^2+y^2}\\right)"}</Tex>{" "}
        satisfies <Tex>{"P_y=Q_x"}</Tex> at every point of its domain, yet{" "}
        <Tex>{"\\oint\\mathbf{F}\\cdot d\\mathbf{r}=2\\pi"}</Tex> around the unit circle. Why doesn't the
        cross-partials test guarantee it is conservative?
      </>
    ),
    options: [
      { id: "A", content: <>the cross-partials computation is wrong: they are not actually equal</> },
      { id: "B", content: <>the field is not differentiable anywhere, so the test does not apply</> },
      { id: "C", content: <>Green's theorem shows the loop integral should be 0, so the premise is false</> },
      {
        id: "D",
        content: <>its domain <Tex>{"\\mathbb{R}^2\\setminus\\{(0,0)\\}"}</Tex> has a hole — not simply connected — so irrotational does not imply conservative</>,
      },
    ],
    correct: "D",
    explanation: (
      <>
        Poincaré's lemma needs a simply connected domain; the punctured plane is not, and loops encircling
        the origin cannot shrink — D. A is false: both partials equal{" "}
        <Tex>{"\\frac{y^2-x^2}{(x^2+y^2)^2}"}</Tex> (compute them!); B is false: the field is smooth
        everywhere away from the origin; C is false because Green requires the field to be <Tex>{"C^1"}</Tex>{" "}
        on the <em>whole</em> disk, and the singularity at the origin sits inside the loop.
      </>
    ),
    theory: <>Irrotational + simply connected domain ⇒ conservative. Remove "simply connected" and the vortex breaks the implication.</>,
  },
  {
    id: "ma2-crv-q13",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        If <Tex>{"\\mathbf{F}=\\nabla\\varphi"}</Tex> and <Tex>{"\\gamma"}</Tex> runs from{" "}
        <Tex>{"A"}</Tex> to <Tex>{"B"}</Tex>, then <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex>{" "}
        equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\varphi(B)-\\varphi(A)"}</Tex> },
      { id: "B", content: <Tex>{"\\varphi(A)-\\varphi(B)"}</Tex> },
      { id: "C", content: <Tex>{"0"}</Tex> },
      { id: "D", content: <Tex>{"\\int_\\gamma \\varphi\\,ds"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        The fundamental theorem for line integrals: end minus start — A. B has the sign backwards (a very
        expensive slip on exams); C holds only when the curve is closed (<Tex>{"A=B"}</Tex>); D confuses the
        work of the gradient with a scalar integral of <Tex>{"\\varphi"}</Tex> itself, a different object
        entirely.
      </>
    ),
    theory: <>∫∇φ·dr = φ(end) − φ(start): the exact analogue of ∫f′ = f(b) − f(a).</>,
  },
  {
    id: "ma2-crv-q14",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        <Tex>{"\\mathbf{F}=(P,Q)"}</Tex> is <Tex>{"C^1"}</Tex> on an open connected domain{" "}
        <Tex>{"D"}</Tex>. Which condition is <strong>NOT</strong> always equivalent to{" "}
        <Tex>{"\\mathbf{F}"}</Tex> being conservative on <Tex>{"D"}</Tex>?
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\mathbf{F}=\\nabla\\varphi"}</Tex> for some <Tex>{"\\varphi"}</Tex> on <Tex>{"D"}</Tex></> },
      { id: "B", content: <><Tex>{"P_y=Q_x"}</Tex> everywhere on <Tex>{"D"}</Tex></> },
      { id: "C", content: <>the work between any two points of <Tex>{"D"}</Tex> is path-independent</> },
      { id: "D", content: <><Tex>{"\\oint_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}=0"}</Tex> for every closed curve in <Tex>{"D"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        A, C and D are the three equivalent characterizations of conservative on any open connected domain.
        B is only <em>necessary</em>: the vortex field satisfies <Tex>{"P_y=Q_x"}</Tex> on the punctured
        plane but is not conservative there. B upgrades to an equivalence only when <Tex>{"D"}</Tex> is
        simply connected.
      </>
    ),
    theory: <>Potential ⇔ path-independence ⇔ all loops zero. Cross-partials joins the club only on simply connected domains.</>,
  },
  {
    id: "ma2-crv-q15",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Green's theorem states that for a positively oriented (counterclockwise) boundary{" "}
        <Tex>{"\\partial D"}</Tex>, <Tex>{"\\oint_{\\partial D} P\\,dx+Q\\,dy"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\iint_D (P_y - Q_x)\\,dA"}</Tex> },
      { id: "B", content: <Tex>{"\\iint_D (P_x + Q_y)\\,dA"}</Tex> },
      { id: "C", content: <Tex>{"\\iint_D (Q_x - P_y)\\,dA"}</Tex> },
      { id: "D", content: <Tex>{"\\iint_D (P_x - Q_y)\\,dA"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        The integrand is the scalar curl <Tex>{"Q_x-P_y"}</Tex>: Q differentiated in x, minus P
        differentiated in y — C. A is the sign-reversed version (it would hold for the <em>clockwise</em>{" "}
        boundary); B is the divergence, which belongs to the flux form of Green's theorem with the normal
        component <Tex>{"\\mathbf{F}\\cdot\\mathbf{n}"}</Tex>, not this one; D differentiates each component
        with respect to its own variable, a formula that appears in no theorem.
      </>
    ),
    theory: <>Green: circulation (CCW) = ∬ curl; remember "Q gets x, P gets y, Q first".</>,
  },
  {
    id: "ma2-crv-q16",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Using Green's theorem, <Tex>{"\\oint_C (x-y)\\,dx + (x+y)\\,dy"}</Tex> over the unit circle
        traversed counterclockwise equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"0"}</Tex> },
      { id: "B", content: <Tex>{"2\\pi"}</Tex> },
      { id: "C", content: <Tex>{"\\pi"}</Tex> },
      { id: "D", content: <Tex>{"4\\pi"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"Q_x-P_y = 1-(-1) = 2"}</Tex>, so the integral is{" "}
        <Tex>{"\\iint_D 2\\,dA = 2\\cdot\\pi\\cdot 1^2 = 2\\pi"}</Tex> — B. A would need the field to be
        conservative, but the cross partials (<Tex>{"-1"}</Tex> vs <Tex>{"1"}</Tex>) differ; C forgets the
        factor 2 from the curl; D confuses the disk's area <Tex>{"\\pi"}</Tex> with its circumference{" "}
        <Tex>{"2\\pi"}</Tex>.
      </>
    ),
    theory: <>Constant curl c ⇒ loop integral = c × enclosed area. Compute the curl before anything else.</>,
  },
  {
    id: "ma2-crv-q17",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Using <Tex>{"A=\\tfrac12\\oint (x\\,dy - y\\,dx)"}</Tex> on the ellipse{" "}
        <Tex>{"x=a\\cos t,\\ y=b\\sin t"}</Tex>, <Tex>{"t\\in[0,2\\pi]"}</Tex>, the enclosed area is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"2\\pi ab"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac{\\pi}{2}(a^2+b^2)"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{\\pi ab}{2}"}</Tex> },
      { id: "D", content: <Tex>{"\\pi ab"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"x\\,dy - y\\,dx = ab\\cos^2 t\\,dt + ab\\sin^2 t\\,dt = ab\\,dt"}</Tex>, so{" "}
        <Tex>{"A=\\tfrac12\\int_0^{2\\pi} ab\\,dt = \\pi ab"}</Tex> — D. A drops the{" "}
        <Tex>{"\\tfrac12"}</Tex>; C applies the half twice; B mixes up the ellipse with an average of two
        circles (and its gradient check fails dimensionally: area should scale as <Tex>{"a\\cdot b"}</Tex>,
        not <Tex>{"a^2+b^2"}</Tex>).
      </>
    ),
    theory: <>x dy − y dx collapses to ab(cos² + sin²) dt = ab dt on the ellipse — the identity does all the work.</>,
  },
  {
    id: "ma2-crv-q18",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        A wire occupies the upper half of the unit circle and has linear density{" "}
        <Tex>{"\\rho(x,y)=y"}</Tex>. Its mass <Tex>{"\\int_\\gamma \\rho\\,ds"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"2"}</Tex> },
      { id: "B", content: <Tex>{"\\pi"}</Tex> },
      { id: "C", content: <Tex>{"1"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{\\pi}{2}"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        Parametrize <Tex>{"(\\cos t, \\sin t)"}</Tex>, <Tex>{"t\\in[0,\\pi]"}</Tex>, where{" "}
        <Tex>{"ds=dt"}</Tex>:{" "}
        <Tex>{"m=\\int_0^\\pi \\sin t\\,dt = [-\\cos t]_0^\\pi = 2"}</Tex> — A. B is the wire's{" "}
        <em>length</em> (density ignored); C evaluates <Tex>{"-\\cos t"}</Tex> at one endpoint only; D is{" "}
        <Tex>{"\\int_0^\\pi \\sin^2 t\\,dt"}</Tex>, i.e. the density accidentally squared.
      </>
    ),
    theory: <>Mass = ∫ ρ ds; on a unit circle ds = dt, so it reduces to a plain single-variable integral.</>,
  },
];

/* ==================================================================== *
 * EXAM PROBLEMS
 * ==================================================================== */
export const exam: ExamProblem[] = [
  {
    id: "ma2-crv-e1",
    title: "Full study of a conservative field",
    meta: "Vector fields · ~12 pts · Summer session style",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Consider the vector field{" "}
        <Tex>{"\\mathbf{F}(x,y) = \\left(2xy + y^3,\\; x^2 + 3xy^2 + 2y\\right)"}</Tex> on{" "}
        <Tex>{"\\mathbb{R}^2"}</Tex>. (a) Show that <Tex>{"\\mathbf{F}"}</Tex> is conservative. (b) Find a
        potential <Tex>{"\\varphi"}</Tex>. (c) Compute{" "}
        <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex> for any curve <Tex>{"\\gamma"}</Tex>{" "}
        from <Tex>{"A=(0,0)"}</Tex> to <Tex>{"B=(1,2)"}</Tex>.
      </>
    ),
    given: <><Tex>{"P = 2xy+y^3,\\quad Q = x^2+3xy^2+2y,\\quad \\text{domain } \\mathbb{R}^2"}</Tex></>,
    steps: [
      {
        title: "Cross-partials test",
        content: (
          <>
            <Tex>{"P_y = 2x+3y^2"}</Tex> and <Tex>{"Q_x = 2x+3y^2"}</Tex> — equal everywhere. The domain{" "}
            <Tex>{"\\mathbb{R}^2"}</Tex> is <strong>simply connected</strong>, so by Poincaré's lemma the
            field is conservative. (Both halves of the sentence are worth marks: the equality alone is not a
            proof.)
          </>
        ),
      },
      {
        title: "Integrate P with respect to x",
        content: (
          <>
            <Tex>{"\\varphi = \\int (2xy+y^3)\\,dx = x^2y + xy^3 + g(y)"}</Tex>, where the integration
            "constant" <Tex>{"g"}</Tex> may depend on <Tex>{"y"}</Tex>.
          </>
        ),
      },
      {
        title: "Match the y-derivative to Q",
        content: (
          <>
            <Tex>{"\\varphi_y = x^2 + 3xy^2 + g'(y) \\stackrel{!}{=} x^2 + 3xy^2 + 2y"}</Tex>, hence{" "}
            <Tex>{"g'(y)=2y"}</Tex> — no <Tex>{"x"}</Tex> survives, confirming consistency — and{" "}
            <Tex>{"g(y)=y^2"}</Tex>. So <Tex>{"\\varphi = x^2y + xy^3 + y^2\\ (+C)"}</Tex>.
          </>
        ),
      },
      {
        title: "Verify the potential",
        content: (
          <>
            <Tex>{"\\nabla\\varphi = (2xy+y^3,\\ x^2+3xy^2+2y) = \\mathbf{F}"}</Tex> ✓ — always spend the ten
            seconds on this check.
          </>
        ),
      },
      {
        title: "Apply the fundamental theorem",
        content: (
          <>
            <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r} = \\varphi(1,2)-\\varphi(0,0) = (1^2\\cdot 2 + 1\\cdot 2^3 + 2^2) - 0 = 2+8+4 = 14"}</Tex>,
            for <em>every</em> curve from <Tex>{"A"}</Tex> to <Tex>{"B"}</Tex>.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"\\varphi(x,y) = x^2y + xy^3 + y^2 + C"}</Tex>;{" "}
        <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r} = 14"}</Tex> along any path from{" "}
        <Tex>{"(0,0)"}</Tex> to <Tex>{"(1,2)"}</Tex>.
      </>
    ),
    tips: (
      <>
        Marks are routinely lost for (1) omitting "simply connected" in part (a), (2) forgetting{" "}
        <Tex>{"g(y)"}</Tex> when integrating <Tex>{"P"}</Tex>, and (3) sign errors in{" "}
        <Tex>{"\\varphi(B)-\\varphi(A)"}</Tex>. If <Tex>{"g'(y)"}</Tex> ever contains <Tex>{"x"}</Tex>,
        stop and recheck — it means the field was not conservative or you slipped.
      </>
    ),
  },
  {
    id: "ma2-crv-e2",
    title: "Green's theorem, verified both ways",
    meta: "Green's theorem · ~10 pts",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"C"}</Tex> be the counterclockwise boundary of the square{" "}
        <Tex>{"D=[0,2]\\times[0,2]"}</Tex>. Compute{" "}
        <Tex>{"\\oint_C (x^2-y)\\,dx + (x+y^2)\\,dy"}</Tex> twice: (a) with Green's theorem, (b) directly
        edge by edge, and check the results agree.
      </>
    ),
    given: <><Tex>{"P=x^2-y,\\quad Q=x+y^2,\\quad D=[0,2]^2,\\ \\text{area } 4"}</Tex></>,
    steps: [
      {
        title: "(a) Green's theorem",
        content: (
          <>
            <Tex>{"Q_x - P_y = 1 - (-1) = 2"}</Tex>, so{" "}
            <Tex>{"\\oint_C = \\iint_D 2\\,dA = 2\\cdot 4 = 8"}</Tex>. The field is <Tex>{"C^1"}</Tex> on
            the whole plane and the square's boundary is a simple closed CCW curve, so the theorem applies.
          </>
        ),
      },
      {
        title: "(b) Bottom edge (t, 0), t: 0 → 2",
        content: (
          <>
            <Tex>{"dy=0"}</Tex>, <Tex>{"P=t^2-0"}</Tex>:{" "}
            <Tex>{"\\int_0^2 t^2\\,dt = \\tfrac83"}</Tex>.
          </>
        ),
      },
      {
        title: "Right edge (2, t), t: 0 → 2",
        content: (
          <>
            <Tex>{"dx=0"}</Tex>, <Tex>{"Q=2+t^2"}</Tex>:{" "}
            <Tex>{"\\int_0^2 (2+t^2)\\,dt = 4+\\tfrac83 = \\tfrac{20}{3}"}</Tex>.
          </>
        ),
      },
      {
        title: "Top edge (t, 2), t: 2 → 0",
        content: (
          <>
            <Tex>{"dy=0"}</Tex>, <Tex>{"P=t^2-2"}</Tex>, and the parameter runs <em>backwards</em>:{" "}
            <Tex>{"\\int_2^0 (t^2-2)\\,dt = -\\left(\\tfrac83-4\\right) = \\tfrac43"}</Tex>.
          </>
        ),
      },
      {
        title: "Left edge (0, t), t: 2 → 0",
        content: (
          <>
            <Tex>{"dx=0"}</Tex>, <Tex>{"Q=0+t^2"}</Tex>:{" "}
            <Tex>{"\\int_2^0 t^2\\,dt = -\\tfrac83"}</Tex>.
          </>
        ),
      },
      {
        title: "Sum and compare",
        content: (
          <>
            <Tex>{"\\tfrac83 + \\tfrac{20}{3} + \\tfrac43 - \\tfrac83 = \\tfrac{24}{3} = 8"}</Tex> — exactly
            the Green's-theorem value. Both methods agree.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"\\oint_C (x^2-y)\\,dx + (x+y^2)\\,dy = 8"}</Tex> by both computations.
      </>
    ),
    tips: (
      <>
        The direct route's classic mark-losers: forgetting that the top and left edges run{" "}
        <em>backwards</em> in the CCW circuit (their integrals pick up minus signs), and integrating{" "}
        <Tex>{"Q\\,dy"}</Tex> on edges where <Tex>{"dy=0"}</Tex>. Notice how the <Tex>{"x^2"}</Tex> and{" "}
        <Tex>{"y^2"}</Tex> parts cancel around the loop — they are exact and contribute nothing; only the{" "}
        <Tex>{"-y\\,dx + x\\,dy"}</Tex> part (curl 2) survives, giving 2 × area.
      </>
    ),
  },
  {
    id: "ma2-crv-e3",
    title: "Arc length and mass of a helical wire",
    meta: "Curves & scalar line integrals · ~8 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        A wire follows one turn of the helix <Tex>{"\\mathbf{r}(t) = (\\cos t,\\ \\sin t,\\ t)"}</Tex>,{" "}
        <Tex>{"t\\in[0,2\\pi]"}</Tex>, with linear density <Tex>{"\\rho(x,y,z)=z"}</Tex>. Compute (a) the
        length of the wire and (b) its mass <Tex>{"m=\\int_\\gamma \\rho\\,ds"}</Tex>.
      </>
    ),
    given: <><Tex>{"\\mathbf{r}(t)=(\\cos t, \\sin t, t),\\quad t\\in[0,2\\pi],\\quad \\rho=z"}</Tex></>,
    steps: [
      {
        title: "Tangent vector and speed",
        content: (
          <>
            <Tex>{"\\mathbf{r}'(t)=(-\\sin t,\\ \\cos t,\\ 1)"}</Tex>, so{" "}
            <Tex>{"|\\mathbf{r}'(t)| = \\sqrt{\\sin^2 t + \\cos^2 t + 1} = \\sqrt2"}</Tex> — constant, the
            helix's signature convenience. Hence <Tex>{"ds=\\sqrt2\\,dt"}</Tex>.
          </>
        ),
      },
      {
        title: "(a) Arc length",
        content: (
          <>
            <Tex>{"L = \\int_0^{2\\pi} \\sqrt2\\,dt = 2\\sqrt2\\,\\pi \\approx 8.89"}</Tex>. Sanity check: one
            turn of the underlying circle is <Tex>{"2\\pi\\approx 6.28"}</Tex>, and climbing must make it
            longer ✓.
          </>
        ),
      },
      {
        title: "(b) Set up the mass integral",
        content: (
          <>
            On the wire, <Tex>{"\\rho = z = t"}</Tex>, so{" "}
            <Tex>{"m = \\int_0^{2\\pi} t\\cdot\\sqrt2\\,dt"}</Tex>.
          </>
        ),
      },
      {
        title: "Integrate",
        content: (
          <>
            <Tex>{"m = \\sqrt2\\left[\\tfrac{t^2}{2}\\right]_0^{2\\pi} = \\sqrt2\\cdot\\tfrac{4\\pi^2}{2} = 2\\sqrt2\\,\\pi^2 \\approx 27.9"}</Tex>.
            Positive, as a mass must be ✓.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"L = 2\\sqrt2\\,\\pi \\approx 8.89"}</Tex>;{" "}
        <Tex>{"m = 2\\sqrt2\\,\\pi^2 \\approx 27.9"}</Tex>.
      </>
    ),
    tips: (
      <>
        Everything hinges on <Tex>{"ds = |\\mathbf{r}'|\\,dt = \\sqrt2\\,dt"}</Tex>: forgetting the{" "}
        <Tex>{"\\sqrt2"}</Tex> (or writing <Tex>{"\\sqrt{1+1+1}"}</Tex> by miscounting components) is the
        standard slip. Substitute the parametrization into the density <em>before</em> integrating —{" "}
        <Tex>{"\\rho=z"}</Tex> becomes just <Tex>{"t"}</Tex>, and the whole exercise reduces to a
        first-year integral.
      </>
    ),
  },
];
