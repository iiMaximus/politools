import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { VectorFieldWorkSim } from "../sims/VectorFieldWorkSim";

export const MODULE = "Curves, line integrals & vector fields";

/* ============ Table of classic parametrizations (lesson 1) ========== */
function ParamTable() {
  const rows: [string, string, string, string][] = [
    ["Circle, radius R", "(R cos t, R sin t), t ∈ [0, 2π]", "(−R sin t, R cos t)", "R"],
    ["Ellipse a, b", "(a cos t, b sin t), t ∈ [0, 2π]", "(−a sin t, b cos t)", "√(a²sin²t + b²cos²t)"],
    ["Helix, radius R, pitch c", "(R cos t, R sin t, c·t)", "(−R sin t, R cos t, c)", "√(R² + c²)"],
    ["Graph y = f(x)", "(t, f(t)), t ∈ [a, b]", "(1, f′(t))", "√(1 + f′(t)²)"],
    ["Segment A → B", "A + t(B − A), t ∈ [0, 1]", "B − A", "|B − A|"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Curve</th>
            <th className="border-b border-[var(--color-line)] p-2">r(t)</th>
            <th className="border-b border-[var(--color-line)] p-2">r′(t)</th>
            <th className="border-b border-[var(--color-line)] p-2">|r′(t)|</th>
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
   * LESSON 1 — Parametric curves, tangent vectors, arc length
   * ================================================================ */
  {
    id: "parametric-curves",
    title: "Parametric curves, tangent vectors & arc length",
    lecture: MODULE,
    summary:
      "A curve is a journey, not just a road: parametrize it, differentiate for the tangent, and integrate the speed for the length.",
    minutes: 20,
    objectives: [
      "Parametrize the standard curves: segments, circles, ellipses, helices, graphs",
      "Compute the tangent vector r′(t) and check that a curve is regular",
      "Compute arc length with L = ∫ |r′(t)| dt",
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
        term: "Parametric curve",
        content: (
          <>
            A parametric curve is a continuous map{" "}
            <Tex>{"\\mathbf{r}:[a,b]\\to\\mathbb{R}^2\\ (\\text{or } \\mathbb{R}^3)"}</Tex>,{" "}
            <Tex>{"\\mathbf{r}(t)=(x(t),\\,y(t),\\,z(t))"}</Tex>. The image set is called the{" "}
            <strong>support</strong> (or trace); the map itself is the <strong>parametrization</strong>. One
            support admits infinitely many parametrizations.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Differentiating the position componentwise gives the <strong>velocity</strong>: a vector that
            points along the instantaneous direction of travel, with magnitude equal to the speed. This
            vector is the workhorse of the whole module — every integral below contains{" "}
            <Tex>{"\\mathbf{r}'(t)"}</Tex> in some form.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Tangent vector & regular curve",
        content: (
          <>
            The tangent (velocity) vector is <Tex>{"\\mathbf{r}'(t)=(x'(t),\\,y'(t),\\,z'(t))"}</Tex>. The
            curve is <strong>regular</strong> if <Tex>{"\\mathbf{r}'"}</Tex> is continuous and{" "}
            <Tex>{"\\mathbf{r}'(t)\\neq\\mathbf{0}"}</Tex> for every <Tex>{"t"}</Tex>: the traveller never
            stops, so the curve has a well-defined tangent direction at each point.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\mathbf{r}'(t)=(x'(t),\\,y'(t),\\,z'(t)),\\qquad |\\mathbf{r}'(t)|=\\sqrt{x'(t)^2+y'(t)^2+z'(t)^2}",
        tag: "5.1",
        caption: (
          <>
            Direction of travel and <strong>speed</strong>. In 2D just drop the <Tex>{"z"}</Tex>-component.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <ParamTable />,
        caption:
          "The five parametrizations you will use in 95% of exercises. Memorize the circle and the helix rows — their constant speeds make exam integrals collapse.",
      },
      { kind: "heading", text: "Arc length" },
      {
        kind: "prose",
        content: (
          <p>
            Chop <Tex>{"[a,b]"}</Tex> into tiny steps <Tex>{"dt"}</Tex>. In each step the traveller covers a
            tiny chord of length <Tex>{"\\approx |\\mathbf{r}'(t)|\\,dt"}</Tex> — speed times time. Summing
            the chords and refining gives the arc length as the <strong>integral of the speed</strong>.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "L(\\gamma)=\\int_a^b |\\mathbf{r}'(t)|\\,dt",
        tag: "5.2",
        caption: (
          <>
            Length = total distance = <Tex>{"\\int(\\text{speed})\\,dt"}</Tex>. The result does not depend on
            which regular parametrization you pick, as long as the curve is traversed <strong>once</strong>.
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
            they cancel exactly. Length is a property of the <em>road</em>, not the <em>drive</em>. The same
            cancellation will make scalar line integrals parametrization-free in the next lesson.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — circle and helix",
        content: (
          <>
            <p>
              <strong>Circle of radius R:</strong> <Tex>{"\\mathbf{r}(t)=(R\\cos t, R\\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,2\\pi]"}</Tex>. Then <Tex>{"\\mathbf{r}'=(-R\\sin t, R\\cos t)"}</Tex> and{" "}
              <Tex>{"|\\mathbf{r}'|=\\sqrt{R^2\\sin^2 t+R^2\\cos^2 t}=R"}</Tex>, so{" "}
              <Tex>{"L=\\int_0^{2\\pi} R\\,dt = 2\\pi R"}</Tex> — the familiar circumference.
            </p>
            <p>
              <strong>Helix:</strong> <Tex>{"\\mathbf{r}(t)=(\\cos t, \\sin t, 2t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,2\\pi]"}</Tex>. Then <Tex>{"\\mathbf{r}'=(-\\sin t, \\cos t, 2)"}</Tex> and{" "}
              <Tex>{"|\\mathbf{r}'|=\\sqrt{\\sin^2 t+\\cos^2 t+4}=\\sqrt5"}</Tex>, constant again, so{" "}
              <Tex>{"L=2\\pi\\sqrt5"}</Tex>. Constant speed is the helix's gift: the integral needs no work
              at all.
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
                Write <Tex>{"\\mathbf{r}(t)"}</Tex> with an explicit interval <Tex>{"[a,b]"}</Tex>, checking
                the curve is covered exactly once.
              </>
            ),
          },
          {
            label: "Differentiate",
            content: <>Compute <Tex>{"\\mathbf{r}'(t)"}</Tex> componentwise.</>,
          },
          {
            label: "Take the speed",
            content: (
              <>
                Form <Tex>{"|\\mathbf{r}'(t)|"}</Tex> — square each component, sum, <strong>then</strong> take
                the square root. Simplify with <Tex>{"\\sin^2+\\cos^2=1"}</Tex> whenever it appears.
              </>
            ),
          },
          {
            label: "Integrate",
            content: <>Evaluate <Tex>{"\\int_a^b |\\mathbf{r}'(t)|\\,dt"}</Tex>.</>,
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
              Compute the length of the helix <Tex>{"\\mathbf{r}(t)=(\\cos t,\\ \\sin t,\\ \\sqrt3\\,t)"}</Tex>{" "}
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
              <Tex>{"\\mathbf{r}'=(-\\sin t, \\cos t, \\sqrt3)"}</Tex>, so{" "}
              <Tex>{"|\\mathbf{r}'|=\\sqrt{1+3}=2"}</Tex> and <Tex>{"L=\\int_0^\\pi 2\\,dt=2\\pi"}</Tex> — C.
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
            <strong>(2) Double cover:</strong> <Tex>{"(\\cos 2t, \\sin 2t)"}</Tex> on{" "}
            <Tex>{"[0,2\\pi]"}</Tex> runs the unit circle <em>twice</em>: the formula honestly returns{" "}
            <Tex>{"4\\pi"}</Tex>, the distance travelled, not the length of the support. Check the range
            before integrating. And never confuse length with the chord{" "}
            <Tex>{"|\\mathbf{r}(b)-\\mathbf{r}(a)|"}</Tex>.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            With <Tex>{"\\mathbf{r}'"}</Tex> and the speed in hand, we can integrate <em>anything</em> along
            a curve — a density to get a wire's mass, or a force to get work. That is the next lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — Line integrals: scalar (ds) and vector (dr)
   * ================================================================ */
  {
    id: "line-integrals",
    title: "Line integrals: mass of a wire & work of a force",
    lecture: MODULE,
    summary:
      "Two integrals live on a curve: ∫ f ds ignores direction and weighs the wire; ∫ F·dr is signed work and flips with orientation.",
    minutes: 24,
    objectives: [
      "Compute ∫ f ds and interpret it as the mass of a wire",
      "Compute the work ∫ F·dr through a parametrization",
      "Predict the sign of the work from field–path alignment",
      "State which integral depends on orientation and which does not",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Two very different questions can be asked along the same curve. <em>How much metal is in this
            bent wire?</em> — that needs the <strong>scalar</strong> line integral, which weighs a density
            against arc length. <em>How much work does this force do on a particle sliding along the
            path?</em> — that needs the <strong>vector</strong> line integral, which dots the field with the
            direction of travel. Keeping the two recipes separate is half the battle in this module.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Line integral of a scalar field (ds)",
        content: (
          <>
            For <Tex>{"f"}</Tex> continuous on the support of a regular curve <Tex>{"\\gamma"}</Tex>:{" "}
            <Tex>{"\\int_\\gamma f\\,ds"}</Tex> integrates <Tex>{"f"}</Tex> against arc length{" "}
            <Tex>{"ds=|\\mathbf{r}'(t)|\\,dt"}</Tex>. With <Tex>{"f\\equiv 1"}</Tex> it returns the length;
            with <Tex>{"f=\\rho"}</Tex> (linear density) it returns the <strong>mass of the wire</strong>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\int_\\gamma f\\,ds = \\int_a^b f(\\mathbf{r}(t))\\,|\\mathbf{r}'(t)|\\,dt",
        tag: "5.3",
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
        title: "ds is blind to parametrization AND orientation",
        content: (
          <>
            <Tex>{"ds=|\\mathbf{r}'|\\,dt"}</Tex> is always positive, so running the curve backwards, or
            twice as fast, changes nothing: the same reparametrization cancellation as for arc length. A
            wire's mass cannot depend on which end you start weighing from — the mathematics agrees.
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
              (heavier at the top). Parametrize: <Tex>{"\\mathbf{r}(t)=(\\cos t, \\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,\\pi]"}</Tex>, so <Tex>{"|\\mathbf{r}'|=1"}</Tex> and <Tex>{"ds=dt"}</Tex>.
            </p>
            <p>
              <Tex>{"m=\\int_\\gamma y\\,ds=\\int_0^{\\pi} \\sin t\\,dt = [-\\cos t]_0^{\\pi} = 1-(-1) = 2"}</Tex>.
              Sanity check: the density is at most 1 and the wire has length <Tex>{"\\pi\\approx 3.14"}</Tex>,
              so a mass of 2 (below <Tex>{"\\pi"}</Tex>, above 0) is plausible.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Vector fields and work" },
      {
        kind: "prose",
        content: (
          <p>
            A <strong>vector field</strong> <Tex>{"\\mathbf{F}(x,y)=(P(x,y),\\,Q(x,y))"}</Tex> attaches an
            arrow to every point of the plane — think of wind, or a force acting on a particle. When the
            particle takes a tiny step <Tex>{"d\\mathbf{r}"}</Tex>, the field does work{" "}
            <Tex>{"\\mathbf{F}\\cdot d\\mathbf{r}"}</Tex>: positive if the arrow helps the motion, negative
            if it fights it, zero if it is perpendicular. Total work is the integral of these contributions.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Line integral of a vector field (work)",
        content: (
          <>
            For a continuous field <Tex>{"\\mathbf{F}"}</Tex> and an <strong>oriented</strong> regular curve{" "}
            <Tex>{"\\gamma"}</Tex>, the work is{" "}
            <Tex>{"W=\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex>, computed by dotting the field with
            the velocity of any parametrization that respects the orientation.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t))\\cdot\\mathbf{r}'(t)\\,dt = \\int_\\gamma P\\,dx + Q\\,dy",
        tag: "5.4",
        caption: (
          <>
            The differential-form notation on the right means the same thing:{" "}
            <Tex>{"dx = x'(t)\\,dt"}</Tex>, <Tex>{"dy = y'(t)\\,dt"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Orientation flips the sign",
        content: (
          <>
            Reversing the direction of travel replaces <Tex>{"\\mathbf{r}'"}</Tex> by{" "}
            <Tex>{"-\\mathbf{r}'"}</Tex>, so{" "}
            <Tex>{"\\int_{-\\gamma}\\mathbf{F}\\cdot d\\mathbf{r} = -\\int_{\\gamma}\\mathbf{F}\\cdot d\\mathbf{r}"}</Tex>.
            Work is <em>signed</em>; mass is not. An exam statement must tell you the orientation — if it
            doesn't, say which one you chose.
          </>
        ),
      },
      {
        kind: "sim",
        title: "Work explorer — fields, paths and the running integral",
        render: () => <VectorFieldWorkSim />,
        caption: (
          <>
            The readout is a genuine numerical integral of <Tex>{"\\mathbf{F}\\cdot d\\mathbf{r}"}</Tex>{" "}
            (1600 steps). Try <Tex>{"\\mathbf{F}=(y,x)"}</Tex> on the circle: the work accumulates and then
            returns exactly to 0 — a preview of conservative fields. Then switch to{" "}
            <Tex>{"\\mathbf{F}=(-y,x)"}</Tex>: the arrows circulate <em>with</em> the loop and the work
            climbs monotonically to <Tex>{"2\\pi"}</Tex>.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — work around the unit circle",
        content: (
          <>
            <p>
              Compute <Tex>{"W=\\oint_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex> for{" "}
              <Tex>{"\\mathbf{F}=(-y,\\,x)"}</Tex> with <Tex>{"\\gamma"}</Tex> the unit circle,
              counterclockwise. Parametrize <Tex>{"\\mathbf{r}(t)=(\\cos t, \\sin t)"}</Tex>,{" "}
              <Tex>{"t\\in[0,2\\pi]"}</Tex>.
            </p>
            <p>
              Substitute: <Tex>{"\\mathbf{F}(\\mathbf{r}(t))=(-\\sin t,\\ \\cos t)"}</Tex> and{" "}
              <Tex>{"\\mathbf{r}'(t)=(-\\sin t,\\ \\cos t)"}</Tex> — the field is everywhere{" "}
              <em>tangent</em> to the loop. The dot product is{" "}
              <Tex>{"\\sin^2 t + \\cos^2 t = 1"}</Tex>, so <Tex>{"W=\\int_0^{2\\pi} 1\\,dt = 2\\pi"}</Tex>.
            </p>
            <p>
              Nonzero work around a <strong>closed</strong> loop — remember this number; it is about to
              become the star witness against the cross-partials test.
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
            content: <>Choose <Tex>{"\\mathbf{r}(t)"}</Tex>, <Tex>{"t\\in[a,b]"}</Tex>, running the stated direction.</>,
          },
          {
            label: "Substitute into F",
            content: <>Replace every <Tex>{"x,y"}</Tex> in the field by <Tex>{"x(t),y(t)"}</Tex>.</>,
          },
          {
            label: "Dot with r′(t)",
            content: (
              <>
                Form the scalar <Tex>{"\\mathbf{F}(\\mathbf{r}(t))\\cdot\\mathbf{r}'(t)"}</Tex> — no{" "}
                <Tex>{"|\\mathbf{r}'|"}</Tex> anywhere.
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
              Parametrize <Tex>{"\\mathbf{r}(t)=(3t,4t)"}</Tex>, <Tex>{"t\\in[0,1]"}</Tex>:{" "}
              <Tex>{"\\mathbf{F}\\cdot\\mathbf{r}' = (3t)(3)+(4t)(4)=25t"}</Tex>, so{" "}
              <Tex>{"W=\\int_0^1 25t\\,dt = 12.5"}</Tex> — A. B forgets to integrate (it is the integrand's
              value at <Tex>{"t=1"}</Tex>); C is the segment's <em>length</em>, a ds-thinking slip; D
              misapplies "conservative ⇒ zero", which holds only on <em>closed</em> loops.
            </>
          ),
          theory: <>Open path + conservative field: work = potential difference, here <Tex>{"\\tfrac{x^2+y^2}{2}"}</Tex> giving <Tex>{"\\tfrac{25}{2}"}</Tex>.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "ds versus dr — do not mix the recipes",
        content: (
          <>
            In a work integral the velocity enters through the <strong>dot product</strong>, never as the
            factor <Tex>{"|\\mathbf{r}'|"}</Tex>; in a mass integral there is a speed factor and{" "}
            <strong>no</strong> dot product. Writing{" "}
            <Tex>{"\\int \\mathbf{F}\\cdot\\mathbf{r}'\\,|\\mathbf{r}'|\\,dt"}</Tex> (both at once) is the
            single most common mechanical error in this chapter.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            In the sim, one field returned to zero on every closed loop and another did not. Fields of the
            first kind — <strong>conservative</strong> fields — make work integrals almost free to compute.
            They are the subject of the next lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — Conservative fields, potentials, the vortex
   * ================================================================ */
  {
    id: "conservative-fields",
    title: "Conservative fields, potentials & the vortex counterexample",
    lecture: MODULE,
    summary:
      "When F = ∇φ, work is just φ(B) − φ(A). Learn the cross-partials test, build potentials — and see exactly where the test lies to you.",
    minutes: 24,
    objectives: [
      "Use the fundamental theorem for line integrals: ∫ ∇φ·dr = φ(B) − φ(A)",
      "Run the cross-partials (irrotational) test ∂P/∂y = ∂Q/∂x",
      "Construct a potential by partial integration",
      "Explain why the test needs a simply connected domain, via the vortex field",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Lifting a suitcase to the third floor costs the same work whether you take the stairs or the
            elevator: gravity only bills you for the <em>change in height</em>. Fields with this
            path-independence are called <strong>conservative</strong>, and "height" generalizes to a scalar
            function called the potential. When a field is conservative, every work integral collapses to
            two function evaluations — no parametrization needed.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Conservative field & potential",
        content: (
          <>
            <Tex>{"\\mathbf{F}"}</Tex> is <strong>conservative</strong> on an open set{" "}
            <Tex>{"D"}</Tex> if there exists a scalar function <Tex>{"\\varphi"}</Tex> (a{" "}
            <strong>potential</strong>) with <Tex>{"\\nabla\\varphi=\\mathbf{F}"}</Tex> on{" "}
            <Tex>{"D"}</Tex>, i.e. <Tex>{"\\varphi_x = P"}</Tex> and <Tex>{"\\varphi_y = Q"}</Tex>. On a
            connected domain the potential is unique up to an additive constant.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\int_\\gamma \\nabla\\varphi\\cdot d\\mathbf{r} = \\varphi(B) - \\varphi(A)",
        tag: "5.5",
        caption: (
          <>
            The <strong>fundamental theorem for line integrals</strong>: only the endpoints{" "}
            <Tex>{"A"}</Tex> (start) and <Tex>{"B"}</Tex> (end) matter, not the route.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Three faces of the same property",
        content: (
          <>
            For a continuous field on an open <em>connected</em> domain, these are equivalent:{" "}
            <strong>(i)</strong> <Tex>{"\\mathbf{F}=\\nabla\\varphi"}</Tex> for some potential;{" "}
            <strong>(ii)</strong> the work between two points is the same along every path;{" "}
            <strong>(iii)</strong> <Tex>{"\\oint_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}=0"}</Tex> around{" "}
            <em>every</em> closed loop. One nonzero closed-loop integral therefore <strong>disproves</strong>{" "}
            conservativity instantly.
          </>
        ),
      },
      { kind: "heading", text: "The cross-partials test" },
      {
        kind: "prose",
        content: (
          <p>
            Checking definition (i) directly means <em>finding</em> a potential — but how do you know whether
            it is worth trying? If <Tex>{"\\mathbf{F}=\\nabla\\varphi"}</Tex> with <Tex>{"\\varphi"}</Tex>{" "}
            twice continuously differentiable, then Schwarz's theorem forces{" "}
            <Tex>{"P_y=\\varphi_{xy}=\\varphi_{yx}=Q_x"}</Tex>. Equality of the cross partials is therefore a{" "}
            <strong>necessary</strong> condition — a cheap screening test. A field passing it is called{" "}
            <strong>irrotational</strong> (in 3D this is <Tex>{"\\nabla\\times\\mathbf{F}=\\mathbf{0}"}</Tex>).
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}",
        tag: "5.6",
        caption: (
          <>
            Fails ⇒ <strong>not</strong> conservative, case closed. Holds ⇒ conservative{" "}
            <em>only if</em> the domain is simply connected (see below).
          </>
        ),
      },
      {
        kind: "steps",
        title: "Constructing the potential (partial-integration method)",
        steps: [
          {
            label: "Screen",
            content: <>Check <Tex>{"P_y=Q_x"}</Tex>. If they differ, stop: no potential exists.</>,
          },
          {
            label: "Integrate P in x",
            content: (
              <>
                <Tex>{"\\varphi(x,y)=\\int P\\,dx + g(y)"}</Tex> — the "constant" of integration may depend
                on <Tex>{"y"}</Tex>.
              </>
            ),
          },
          {
            label: "Match Q",
            content: (
              <>
                Differentiate in <Tex>{"y"}</Tex> and set <Tex>{"\\varphi_y=Q"}</Tex>; solve for{" "}
                <Tex>{"g'(y)"}</Tex>. If any <Tex>{"x"}</Tex> survives in <Tex>{"g'(y)"}</Tex>, you made an
                error (or the field is not conservative) — this is a built-in alarm.
              </>
            ),
          },
          {
            label: "Finish & verify",
            content: (
              <>
                Integrate <Tex>{"g'"}</Tex>, assemble <Tex>{"\\varphi"}</Tex>, and{" "}
                <strong>check</strong> <Tex>{"\\nabla\\varphi=\\mathbf{F}"}</Tex> — ten seconds that save
                the whole exercise.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — build φ and cash in",
        content: (
          <>
            <p>
              <Tex>{"\\mathbf{F}=(y^2,\\ 2xy+1)"}</Tex>. Screen:{" "}
              <Tex>{"P_y=2y"}</Tex>, <Tex>{"Q_x=2y"}</Tex> — equal on all of{" "}
              <Tex>{"\\mathbb{R}^2"}</Tex> (simply connected), so a potential exists.
            </p>
            <p>
              Integrate in x: <Tex>{"\\varphi=\\int y^2\\,dx = xy^2+g(y)"}</Tex>. Match:{" "}
              <Tex>{"\\varphi_y = 2xy+g'(y) \\stackrel{!}{=} 2xy+1 \\Rightarrow g'(y)=1 \\Rightarrow g(y)=y"}</Tex>.
              So <Tex>{"\\varphi = xy^2+y"}</Tex> (check: <Tex>{"\\nabla\\varphi=(y^2,\\,2xy+1)"}</Tex> ✓).
            </p>
            <p>
              Work from <Tex>{"(0,0)"}</Tex> to <Tex>{"(1,2)"}</Tex> along <em>any</em> curve:{" "}
              <Tex>{"W=\\varphi(1,2)-\\varphi(0,0) = (1\\cdot4+2)-0 = 6"}</Tex>.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Irrotational but NOT conservative — the vortex" },
      {
        kind: "prose",
        content: (
          <p>
            Now the most examined subtlety of the chapter. Consider the <strong>vortex field</strong> on the
            punctured plane <Tex>{"\\mathbb{R}^2\\setminus\\{(0,0)\\}"}</Tex>:{" "}
            <Tex>{"\\mathbf{F}=\\left(\\dfrac{-y}{x^2+y^2},\\ \\dfrac{x}{x^2+y^2}\\right)"}</Tex>. A direct
            (if tedious) computation gives both cross partials equal — the field passes the test at{" "}
            <em>every</em> point of its domain. Yet on the unit circle <Tex>{"x^2+y^2=1"}</Tex> the field
            reduces to <Tex>{"(-\\sin t, \\cos t)"}</Tex>, exactly the tangent field from last lesson's
            example, whose loop integral we computed by hand:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{\\partial P}{\\partial y} = \\frac{y^2-x^2}{(x^2+y^2)^2} = \\frac{\\partial Q}{\\partial x}, \\qquad\\text{yet}\\qquad \\oint_{x^2+y^2=1} \\mathbf{F}\\cdot d\\mathbf{r} = 2\\pi \\neq 0",
        tag: "5.7",
        caption: (
          <>
            Passes the test everywhere, fails the closed-loop criterion — so it is{" "}
            <strong>not conservative</strong> on the punctured plane.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <DomainFigure />,
        caption: (
          <>
            Poincaré's lemma needs room to shrink loops. Left: no holes, every loop contracts, irrotational
            ⇒ conservative. Right: the loop around the hole cannot contract — the test says nothing about
            it, and the vortex exploits exactly this.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Simply connected domain",
        content: (
          <>
            An open connected set <Tex>{"D"}</Tex> is <strong>simply connected</strong> if every closed loop
            in <Tex>{"D"}</Tex> can be continuously shrunk to a point without leaving <Tex>{"D"}</Tex> —
            informally, "no holes". <strong>Poincaré's lemma:</strong> on a simply connected domain,
            irrotational (<Tex>{"P_y=Q_x"}</Tex>) does imply conservative.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The examiner's favourite trick",
        content: (
          <>
            "<Tex>{"P_y=Q_x"}</Tex>, therefore conservative" earns zero marks unless you add{" "}
            <em>"and the domain is simply connected"</em>. The vortex is the standard counterexample: its
            domain has a hole at the origin. Subtle bonus: restricted to the half-plane{" "}
            <Tex>{"x>0"}</Tex> (simply connected!) the <em>same</em> field IS conservative, with potential{" "}
            <Tex>{"\\varphi=\\arctan(y/x)"}</Tex> — the polar angle. Conservativity depends on the{" "}
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
              <Tex>{"\\int_\\gamma \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex> along any curve from{" "}
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
              <Tex>{"P_y=2x=Q_x"}</Tex> on all of <Tex>{"\\mathbb{R}^2"}</Tex> (simply connected), and{" "}
              <Tex>{"\\varphi=x^2y"}</Tex> works. Then{" "}
              <Tex>{"W=\\varphi(2,3)-\\varphi(1,0)=12-0=12"}</Tex> — D. A confuses "conservative" with "zero
              work" (true only for closed loops); B subtracts the endpoints in the wrong order; C uses the
              wrong potential <Tex>{"xy^2"}</Tex> (from integrating <Tex>{"P"}</Tex> in <Tex>{"y"}</Tex>{" "}
              by mistake), giving <Tex>{"2\\cdot 9=18"}</Tex>.
            </>
          ),
          theory: <>Conservative field: work = φ(end) − φ(start), any path. Zero only when the endpoints coincide.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            So closed loops detect everything: zero work on all of them means conservative, and the vortex
            showed that a loop <em>around a hole</em> can carry nonzero work even when the curl vanishes.
            The precise bookkeeping between a loop integral and the curl inside it is{" "}
            <strong>Green's theorem</strong> — the finale of this module.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 4 — Green's theorem
   * ================================================================ */
  {
    id: "greens-theorem",
    title: "Green's theorem: loops, curl & area",
    lecture: MODULE,
    summary:
      "The loop integral around a region equals the double integral of the curl inside it — trade four ugly edges for one easy area integral.",
    minutes: 19,
    objectives: [
      "State Green's theorem with the correct orientation and hypotheses",
      "Convert a loop integral into a double integral (and know when you may)",
      "Compute enclosed areas with A = ½∮(x dy − y dx)",
      "Recognize when Green does not apply: holes, open curves, wrong orientation",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            The fundamental theorem of calculus says the boundary values of <Tex>{"F"}</Tex> know the
            integral of <Tex>{"F'"}</Tex> inside. Green's theorem is its two-dimensional sibling: the
            circulation of a field around the <strong>boundary</strong> of a region equals the total{" "}
            <strong>curl</strong> collected <em>inside</em> the region. Practically, it lets you swap a
            painful multi-piece loop integral for one double integral — or the reverse, whichever is easier.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\oint_{\\partial D^+} P\\,dx + Q\\,dy \\;=\\; \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dA",
        tag: "5.8",
        caption: (
          <>
            <Tex>{"\\partial D^+"}</Tex> is the boundary with <strong>positive orientation</strong>:
            counterclockwise, i.e. walking along it you keep the region on your <strong>left</strong>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Check the hypotheses before you fire",
        content: (
          <>
            (1) <Tex>{"\\gamma"}</Tex> must be a <strong>closed</strong>, simple curve — Green says nothing
            about open arcs. (2) Orientation must be counterclockwise; clockwise flips the sign. (3){" "}
            <Tex>{"P,Q"}</Tex> must be <Tex>{"C^1"}</Tex> on <strong>all of</strong> <Tex>{"D"}</Tex>,
            interior included. The vortex field fails (3) at the origin — that is precisely why its loop
            integral is <Tex>{"2\\pi"}</Tex> while the curl is 0 everywhere else. A singularity inside the
            loop silently invalidates the naive application.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — trade the loop for a double integral",
        content: (
          <>
            <p>
              Compute <Tex>{"\\oint_C y^2\\,dx + 3xy\\,dy"}</Tex>, where <Tex>{"C"}</Tex> is the
              counterclockwise boundary of the upper half-disk{" "}
              <Tex>{"D=\\{x^2+y^2\\le 1,\\ y\\ge 0\\}"}</Tex>. Directly this needs two pieces (diameter +
              semicircle); with Green it is two lines.
            </p>
            <p>
              Curl: <Tex>{"Q_x-P_y = 3y-2y = y"}</Tex>. In polar coordinates:{" "}
              <Tex>{"\\iint_D y\\,dA = \\int_0^{\\pi}\\!\\!\\int_0^1 (r\\sin\\theta)\\,r\\,dr\\,d\\theta = \\Big(\\int_0^1 r^2 dr\\Big)\\Big(\\int_0^\\pi \\sin\\theta\\,d\\theta\\Big) = \\tfrac13\\cdot 2 = \\tfrac23"}</Tex>.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Area from the boundary" },
      {
        kind: "prose",
        content: (
          <p>
            Read (5.8) backwards: to measure the <strong>area</strong> of <Tex>{"D"}</Tex>, pick any field
            whose curl is identically 1 — then the loop integral computes the area. Three standard choices
            exist, and the symmetric one is the exam favourite:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "A(D) = \\oint_{\\partial D^+} x\\,dy = -\\oint_{\\partial D^+} y\\,dx = \\frac12 \\oint_{\\partial D^+} (x\\,dy - y\\,dx)",
        tag: "5.9",
        caption: (
          <>
            All three fields — <Tex>{"(0,x)"}</Tex>, <Tex>{"(-y,0)"}</Tex>,{" "}
            <Tex>{"\\tfrac12(-y,x)"}</Tex> — have curl 1, so each loop integral equals the enclosed area.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — area of the ellipse",
        content: (
          <>
            <p>
              The ellipse <Tex>{"\\mathbf{r}(t)=(a\\cos t,\\ b\\sin t)"}</Tex>, <Tex>{"t\\in[0,2\\pi]"}</Tex>{" "}
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
        kind: "steps",
        title: "Applying Green safely",
        steps: [
          {
            label: "Verify the setting",
            content: <>Closed simple curve, counterclockwise, field <Tex>{"C^1"}</Tex> on the whole enclosed region (no singularities inside).</>,
          },
          {
            label: "Compute the curl",
            content: <>Identify <Tex>{"P"}</Tex> (with <Tex>{"dx"}</Tex>) and <Tex>{"Q"}</Tex> (with <Tex>{"dy"}</Tex>); form <Tex>{"Q_x - P_y"}</Tex>.</>,
          },
          {
            label: "Integrate over D",
            content: <>Set up <Tex>{"\\iint_D (Q_x-P_y)\\,dA"}</Tex> — polar coordinates for disks and rings, straight iterated integrals for rectangles and triangles.</>,
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
              <Tex>{"Q_x-P_y = 1-(-1) = 2"}</Tex>, so the integral is{" "}
              <Tex>{"2\\cdot\\text{Area} = 2\\cdot 3 = 6"}</Tex> — B. A is the bare area (missing the factor
              2); C wrongly assumes the field is conservative (the cross partials are <Tex>{"-1"}</Tex> and{" "}
              <Tex>{"1"}</Tex>, not equal); D is the rectangle's <em>perimeter</em>, a different quantity
              entirely.
            </>
          ),
          theory: <>For F = (−y, x), the loop integral is always 2 × (enclosed area) on a CCW loop.</>,
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
            Green's theorem is the planar member of a family: lift it to surfaces in space and it becomes{" "}
            <strong>Stokes' theorem</strong>; rewrite it for normal components and it becomes the{" "}
            <strong>divergence theorem</strong>. Both are waiting in the surfaces &amp; flux module.
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
