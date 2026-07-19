import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { SlopeFieldSim } from "../sims/SlopeFieldSim";

// the real course (9 decks, APPELLO papers) does not examine ODEs — kept as extra material
export const MODULE = "Ordinary differential equations (extra)";

/* ============ Similarity-method guess table for lesson 4 ============ */
function GuessTable() {
  const rows = [
    ["k·e^(γx)", "A·e^(γx)", "γ is a root of multiplicity m → multiply by x^m"],
    ["polynomial of degree n", "Aₙxⁿ + … + A₁x + A₀ (keep ALL terms)", "0 is a root → multiply by x (x² if double)"],
    ["k₁·cos ωx + k₂·sin ωx", "A·cos ωx + B·sin ωx (always both)", "±iω are roots → multiply by x"],
    ["Pₙ(x)·e^(γx)", "Qₙ(x)·e^(γx), Qₙ a full degree-n polynomial", "γ is a root → multiply by x^m"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Right-hand side b(x)</th>
            <th className="border-b border-[var(--color-line)] p-2">First guess</th>
            <th className="border-b border-[var(--color-line)] p-2">Resonance fix</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs text-[var(--color-ink)]">{r[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs font-semibold">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====== The three damping regimes, same mass released from y = 1 ====== *
 * All three curves satisfy y(0) = 1, y'(0) = 0 for a genuine ODE:
 *   underdamped :  y'' + 0.4 y' + 4 y = 0  → e^(−0.2t)(cos βt + (0.2/β) sin βt), β = √3.96
 *   critical    :  y'' + 2 y'   + y   = 0  → (1 + t)·e^(−t)
 *   overdamped  :  y'' + 4 y'   + 3 y = 0  → (3e^(−t) − e^(−3t))/2
 * ---------------------------------------------------------------------- */
function DampingFigure() {
  const W = 440;
  const H = 220;
  const TMAX = 8;
  const YLO = -0.9;
  const YHI = 1.15;
  const px = (t: number) => (t / TMAX) * W;
  const py = (y: number) => ((YHI - y) / (YHI - YLO)) * H;
  const beta = Math.sqrt(4 - 0.04);
  const curves: { label: string; color: string; fn: (t: number) => number }[] = [
    {
      label: "underdamped (oscillates)",
      color: "var(--accent)",
      fn: (t) => Math.exp(-0.2 * t) * (Math.cos(beta * t) + (0.2 / beta) * Math.sin(beta * t)),
    },
    {
      label: "critically damped (fastest)",
      color: "var(--good)",
      fn: (t) => (1 + t) * Math.exp(-t),
    },
    {
      label: "overdamped (creeps back)",
      color: "var(--warn)",
      fn: (t) => (3 * Math.exp(-t) - Math.exp(-3 * t)) / 2,
    },
  ];
  const poly = (fn: (t: number) => number) =>
    Array.from({ length: 161 }, (_, i) => {
      const t = (TMAX * i) / 160;
      return `${px(t).toFixed(1)},${py(fn(t)).toFixed(1)}`;
    }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
      {/* equilibrium line y = 0 and start level y = 1 */}
      <line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke="var(--color-line)" strokeWidth={1} />
      <line x1={0} y1={py(1)} x2={W} y2={py(1)} stroke="var(--color-line)" strokeWidth={1} strokeDasharray="3 4" />
      <text x={4} y={py(1) - 4} fontSize={10} fill="var(--color-faint)">
        y(0) = 1
      </text>
      <text x={W - 4} y={py(0) - 4} textAnchor="end" fontSize={10} fill="var(--color-faint)">
        equilibrium
      </text>
      {curves.map((c) => (
        <polyline key={c.label} points={poly(c.fn)} fill="none" stroke={c.color} strokeWidth={2.2} strokeLinecap="round" />
      ))}
      {/* legend */}
      {curves.map((c, i) => (
        <g key={c.label} transform={`translate(${W - 205}, ${14 + i * 15})`}>
          <line x1={0} y1={-3} x2={18} y2={-3} stroke={c.color} strokeWidth={2.5} />
          <text x={24} y={0} fontSize={10} fill="var(--color-muted)">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export const lessons: Lesson[] = [
  /* ================================================================ *
   * LESSON 1 — first-order ODEs, slope fields, separable, Cauchy
   * ================================================================ */
  {
    id: "ode-first-order-separable",
    title: "First-order ODEs, separable equations & the Cauchy problem",
    lecture: MODULE,
    summary:
      "An ODE prescribes a slope at every point; solving it means riding that field. Separation of variables is the first exact method — if you remember the solutions it loses.",
    minutes: 22,
    objectives: [
      "Recognize an ODE, its order, and what counts as a solution",
      "Read a slope field and sketch solution curves without solving anything",
      "Solve separable equations — and recover the constant solutions the method loses",
      "Set up a Cauchy problem and state when it has exactly one solution (Cauchy–Lipschitz)",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Physics rarely hands you a function — it hands you a law about its{" "}
            <strong>rate of change</strong>. Newton's <Tex>{"F = ma"}</Tex> is{" "}
            <Tex>{"m\\,y'' = F"}</Tex>; radioactive decay says <Tex>{"y' = -ky"}</Tex>; a cooling
            coffee obeys <Tex>{"y' = -k(y - T_{\\text{room}})"}</Tex>. An equation that ties an
            unknown function to its derivatives is an <strong>ordinary differential equation</strong>,
            and this module is about actually solving the ones the exam asks for.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "ODE, order, solution",
        content: (
          <>
            An <strong>ordinary differential equation</strong> relates a function{" "}
            <Tex>{"y(x)"}</Tex> of <em>one</em> variable to its derivatives, e.g.{" "}
            <Tex>{"F(x, y, y', \\dots, y^{(n)}) = 0"}</Tex>. Its <strong>order</strong> is the highest
            derivative that appears. A <strong>solution</strong> on an interval is a function that
            turns the equation into an identity there. The <strong>general solution</strong> of an
            order-<Tex>{"n"}</Tex> equation is a family with <Tex>{"n"}</Tex> free constants.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Cauchy problem (initial value problem)",
        content: (
          <>
            A first-order <strong>Cauchy problem</strong> pairs the equation with a starting point:{" "}
            <Tex>{"y' = f(x, y),\\quad y(x_0) = y_0"}</Tex>. The initial condition selects{" "}
            <em>one</em> curve out of the general solution's one-parameter family — it is how you pin
            down the constant <Tex>{"C"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Slope fields: seeing the ODE before solving it" },
      {
        kind: "prose",
        content: (
          <p>
            Rewrite a first-order equation as <Tex>{"y' = f(x,y)"}</Tex> and read it geometrically: at
            every point <Tex>{"(x,y)"}</Tex> of the plane, the ODE dictates the slope{" "}
            <Tex>{"f(x,y)"}</Tex> a solution passing through must have. Drawing a short tick with that
            slope on a grid gives the <strong>slope field</strong>. A solution is any curve that is{" "}
            <em>tangent to the ticks everywhere</em> — you can sketch the whole family without a
            single integral, and a Cauchy problem is just "start at <Tex>{"(x_0, y_0)"}</Tex> and ride
            the field".
          </p>
        ),
      },
      {
        kind: "sim",
        title: "Slope-field explorer — four classic first-order ODEs",
        render: () => <SlopeFieldSim />,
        caption: (
          <>
            Drag <Tex>{"x_0, y_0"}</Tex> and watch the solution thread the ticks. The{" "}
            <Tex>{"y' = -2xy"}</Tex> preset is exactly the equation we solve by hand below (Gaussian
            bells); the logistic preset shows the constant solutions <Tex>{"y \\equiv 0"}</Tex> and{" "}
            <Tex>{"y \\equiv 1"}</Tex> that separation of variables tends to lose.
          </>
        ),
      },
      { kind: "heading", text: "Separable equations" },
      {
        kind: "prose",
        content: (
          <p>
            The equation is <strong>separable</strong> when the right-hand side factors as an{" "}
            <Tex>{"x"}</Tex>-part times a <Tex>{"y"}</Tex>-part: <Tex>{"y' = g(x)\\,h(y)"}</Tex>. Then
            you can herd all the <Tex>{"y"}</Tex>'s to the left and all the <Tex>{"x"}</Tex>'s to the
            right and integrate each side in its own variable.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "y' = g(x)\\,h(y) \\;\\Longrightarrow\\; \\int \\frac{dy}{h(y)} = \\int g(x)\\,dx + C",
        tag: "8.1",
        caption: (
          <>
            Legal only where <Tex>{"h(y) \\ne 0"}</Tex> — the division is exactly where solutions get
            lost.
          </>
        ),
      },
      {
        kind: "steps",
        title: "The separable method",
        steps: [
          {
            label: "Spot the equilibria first",
            content: (
              <>
                Solve <Tex>{"h(y) = 0"}</Tex>. Every root <Tex>{"\\bar y"}</Tex> gives a constant
                solution <Tex>{"y \\equiv \\bar y"}</Tex> (check: both sides are 0). Write them down{" "}
                <em>before</em> dividing.
              </>
            ),
          },
          {
            label: "Separate and integrate",
            content: (
              <>
                Divide by <Tex>{"h(y)"}</Tex>, multiply by <Tex>{"dx"}</Tex>:{" "}
                <Tex>{"\\int dy/h(y) = \\int g(x)\\,dx + C"}</Tex>. One constant on one side is enough.
              </>
            ),
          },
          {
            label: "Solve for y",
            content: (
              <>
                Untangle <Tex>{"y"}</Tex>. Absorb clutter like <Tex>{"\\pm e^{C}"}</Tex> into a single
                renamed constant <Tex>{"C"}</Tex>.
              </>
            ),
          },
          {
            label: "Reinstate lost solutions",
            content: (
              <>
                Check whether some value of <Tex>{"C"}</Tex> (often <Tex>{"C = 0"}</Tex>) recovers the
                equilibria from step 1; if not, list them separately.
              </>
            ),
          },
          {
            label: "Apply the initial condition",
            content: (
              <>
                Plug <Tex>{"(x_0, y_0)"}</Tex> into the family and solve for <Tex>{"C"}</Tex>.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — a Gaussian from a Cauchy problem",
        content: (
          <>
            <p>
              Solve <Tex>{"y' = -2xy"}</Tex>, <Tex>{"y(0) = 3"}</Tex>.
            </p>
            <p>
              <strong>Equilibria:</strong> <Tex>{"h(y) = y = 0"}</Tex> gives <Tex>{"y \\equiv 0"}</Tex>{" "}
              — not our curve (we start at 3), but note it.
            </p>
            <p>
              <strong>Separate:</strong>{" "}
              <Tex>{"\\int \\frac{dy}{y} = \\int -2x\\,dx \\;\\Rightarrow\\; \\ln|y| = -x^2 + c"}</Tex>
              , so <Tex>{"|y| = e^{c}e^{-x^2}"}</Tex> and, absorbing the sign,{" "}
              <Tex>{"y = C e^{-x^2}"}</Tex>. The value <Tex>{"C = 0"}</Tex> even recovers the lost{" "}
              <Tex>{"y \\equiv 0"}</Tex>, so the family is complete for all real <Tex>{"C"}</Tex>.
            </p>
            <p>
              <strong>Initial condition:</strong> <Tex>{"y(0) = C = 3"}</Tex>, hence{" "}
              <Tex>{"y = 3e^{-x^2}"}</Tex>.
            </p>
            <p>
              <strong>Verify</strong> (always):{" "}
              <Tex>{"y' = 3e^{-x^2}\\cdot(-2x) = -2x\\,y"}</Tex> ✓ and <Tex>{"y(0) = 3"}</Tex> ✓. This
              is the bell curve you saw in the simulation.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Lost solutions — the classic point-loser",
        content: (
          <>
            Dividing by <Tex>{"h(y)"}</Tex> silently assumes <Tex>{"h(y) \\ne 0"}</Tex>, so every
            equilibrium <Tex>{"y \\equiv \\bar y"}</Tex> with <Tex>{"h(\\bar y) = 0"}</Tex> vanishes
            from your algebra. For <Tex>{"y' = y(1-y)"}</Tex> the constants <Tex>{"y \\equiv 0"}</Tex>{" "}
            and <Tex>{"y \\equiv 1"}</Tex> are perfectly good solutions the method never shows you.
            Exams love the Cauchy problem <Tex>{"y(0) = 0"}</Tex> whose answer is just the lost
            constant — if you divided blindly, you will chase logarithms into a wall.
          </>
        ),
      },
      { kind: "heading", text: "Existence & uniqueness: the Cauchy–Lipschitz theorem" },
      {
        kind: "prose",
        content: (
          <p>
            Before solving anything you can ask two honest questions: does a solution{" "}
            <em>exist</em>, and is it the <em>only</em> one? For{" "}
            <Tex>{"y' = f(x,y),\\ y(x_0) = y_0"}</Tex>: if <Tex>{"f"}</Tex> is continuous near{" "}
            <Tex>{"(x_0, y_0)"}</Tex>, a local solution exists (Peano). If moreover <Tex>{"f"}</Tex>{" "}
            is <strong>Lipschitz in y</strong> —{" "}
            <Tex>{"|f(x,y_1) - f(x,y_2)| \\le L\\,|y_1 - y_2|"}</Tex> near the point, which is
            guaranteed whenever <Tex>{"\\partial f/\\partial y"}</Tex> is continuous — the solution is{" "}
            <strong>unique</strong> (Cauchy–Lipschitz, also called Picard–Lindelöf).
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "What uniqueness buys you geometrically",
        content: (
          <>
            Where the theorem applies, through each point passes <strong>exactly one</strong> solution
            curve — so solution curves can <strong>never cross or touch</strong>. That is why the
            logistic S-curve climbs toward <Tex>{"y \\equiv 1"}</Tex> forever without reaching it: the
            equilibrium is itself a solution, and touching it would put two solutions through one
            point.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            The hypothesis has teeth. Take <Tex>{"y' = 3y^{2/3}"}</Tex> (cube root, then squared) with{" "}
            <Tex>{"y(0) = 0"}</Tex>. Both <Tex>{"y \\equiv 0"}</Tex> and <Tex>{"y = x^3"}</Tex> solve
            it — check the second: <Tex>{"y' = 3x^2"}</Tex> and{" "}
            <Tex>{"3\\,(x^3)^{2/3} = 3x^2"}</Tex> ✓. Two solutions through one point! The culprit:{" "}
            <Tex>{"\\partial f/\\partial y = 2y^{-1/3}"}</Tex> blows up at <Tex>{"y = 0"}</Tex>, so
            Lipschitz fails exactly at the initial value, and uniqueness dies with it.
          </p>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ode-cp1",
          difficulty: "medium",
          prompt: (
            <>
              In the slope-field explorer, select <Tex>{"y' = y(1-y)"}</Tex> (logistic) and start at{" "}
              <Tex>{"y_0 = 0.1"}</Tex>. What does the theory predict?
            </>
          ),
          options: [
            {
              id: "A",
              content: <>Only <Tex>{"y \\equiv 0"}</Tex> is a constant solution, and the curve decays to it.</>,
            },
            {
              id: "B",
              content: <><Tex>{"y \\equiv 0"}</Tex> and <Tex>{"y \\equiv 1"}</Tex> are constant solutions, and the curve blows up in finite time.</>,
            },
            {
              id: "C",
              content: (
                <>
                  <Tex>{"y \\equiv 0"}</Tex> and <Tex>{"y \\equiv 1"}</Tex> are constant solutions; the
                  curve rises in an S-shape toward <Tex>{"y = 1"}</Tex> without ever touching it.
                </>
              ),
            },
            {
              id: "D",
              content: <>There are no constant solutions, since the right-hand side depends on <Tex>{"y"}</Tex>.</>,
            },
          ],
          correct: "C",
          explanation: (
            <>
              <Tex>{"h(y) = y(1-y)"}</Tex> vanishes at <Tex>{"y = 0"}</Tex> and <Tex>{"y = 1"}</Tex>:
              two equilibria (so A and D undercount). Between them <Tex>{"y' \\gt 0"}</Tex>, so the
              solution rises; by uniqueness it cannot touch the solution <Tex>{"y \\equiv 1"}</Tex>,
              so it saturates instead of blowing up — C, not B. Blow-up happens only for starts
              outside <Tex>{"[0,1]"}</Tex>.
            </>
          ),
          theory: <>Equilibria = roots of h(y); uniqueness makes them uncrossable barriers.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            Separable equations are the warm-up. The equation the exam <em>always</em> features —
            because engineering is full of it — is the <strong>linear</strong> one, and it has a
            beautiful closed-form recipe: the integrating factor. That is the next lesson.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — linear first order, integrating factor
   * ================================================================ */
  {
    id: "ode-first-order-linear",
    title: "Linear first-order equations: the integrating factor",
    lecture: MODULE,
    summary:
      "Multiply by e^∫a and the whole left side collapses into one derivative. One trick, every linear first-order equation solved.",
    minutes: 19,
    objectives: [
      "Put a linear equation in normal form y′ + a(x)y = b(x) before anything else",
      "Build the integrating factor μ = e^∫a and collapse the left side into (μy)′",
      "Solve Cauchy problems for linear equations start to finish, and verify",
      "See the structure: general solution = homogeneous family + one particular solution",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A first-order equation is <strong>linear</strong> when <Tex>{"y"}</Tex> and{" "}
            <Tex>{"y'"}</Tex> appear to the first power and are not multiplied together. Its{" "}
            <strong>normal form</strong> is <Tex>{"y' + a(x)\\,y = b(x)"}</Tex>. If the exam hands you{" "}
            <Tex>{"x\\,y' + 2y = x^3"}</Tex>, your first move is to divide by <Tex>{"x"}</Tex>:{" "}
            <Tex>{"y' + \\tfrac{2}{x}y = x^2"}</Tex>. Everything below assumes normal form — skipping
            that step is the most common way to get <Tex>{"a(x)"}</Tex> wrong.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Homogeneous vs complete",
        content: (
          <>
            The equation is <strong>homogeneous</strong> when <Tex>{"b(x) = 0"}</Tex>:{" "}
            <Tex>{"y' + a(x)y = 0"}</Tex> is separable and gives the family{" "}
            <Tex>{"y_h = C\\,e^{-A(x)}"}</Tex> where <Tex>{"A' = a"}</Tex>. With{" "}
            <Tex>{"b \\ne 0"}</Tex> it is <strong>complete</strong> (non-homogeneous), and we need one
            more idea.
          </>
        ),
      },
      { kind: "heading", text: "The integrating-factor trick" },
      {
        kind: "prose",
        content: (
          <p>
            The left side <Tex>{"y' + a\\,y"}</Tex> is <em>almost</em> the derivative of a product —
            it just needs help. Multiply the whole equation by{" "}
            <Tex>{"\\mu(x) = e^{\\int a(x)\\,dx}"}</Tex>. Since <Tex>{"\\mu' = a\\,\\mu"}</Tex>, the
            left side becomes <Tex>{"\\mu y' + \\mu' y"}</Tex>, which is <em>exactly</em>{" "}
            <Tex>{"(\\mu y)'"}</Tex> by the product rule. One multiplication turns the ODE into a
            plain integration.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\mu(x) = e^{\\int a(x)\\,dx} \\;\\Longrightarrow\\; (\\mu\\,y)' = \\mu\\,b(x)",
        tag: "8.2",
        caption: <>Any one antiderivative of <Tex>{"a"}</Tex> works — no constant needed inside <Tex>{"\\mu"}</Tex>.</>,
      },
      {
        kind: "formula",
        tex: "y(x) = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)\\,b(x)\\,dx + C\\right)",
        tag: "8.3",
        caption: (
          <>
            The constant enters <em>inside</em> the bracket: it exits as{" "}
            <Tex>{"C/\\mu = C\\,e^{-\\int a}"}</Tex>, the homogeneous family — never as a bare{" "}
            <Tex>{"+C"}</Tex> tacked on the end.
          </>
        ),
      },
      {
        kind: "steps",
        title: "Integrating-factor method",
        steps: [
          {
            label: "Normal form",
            content: (
              <>
                Divide by the coefficient of <Tex>{"y'"}</Tex> so the equation reads{" "}
                <Tex>{"y' + a(x)y = b(x)"}</Tex>. Note where you divided by zero — that splits the
                domain.
              </>
            ),
          },
          {
            label: "Integrating factor",
            content: (
              <>
                <Tex>{"\\mu = e^{\\int a(x)dx}"}</Tex>. Watch the sign: for{" "}
                <Tex>{"y' - 3y = \\dots"}</Tex>, <Tex>{"a = -3"}</Tex> and{" "}
                <Tex>{"\\mu = e^{-3x}"}</Tex>.
              </>
            ),
          },
          {
            label: "Collapse and integrate",
            content: (
              <>
                Rewrite as <Tex>{"(\\mu y)' = \\mu b"}</Tex>, integrate both sides,{" "}
                <strong>add C now</strong>.
              </>
            ),
          },
          {
            label: "Divide and fit",
            content: (
              <>
                Divide by <Tex>{"\\mu"}</Tex>, then impose <Tex>{"y(x_0) = y_0"}</Tex> to find{" "}
                <Tex>{"C"}</Tex>. Finish by substituting back into the ODE — 30 seconds that catch
                90% of slips.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — a full Cauchy problem",
        content: (
          <>
            <p>
              Solve <Tex>{"y' + 2y = e^{x}"}</Tex>, <Tex>{"y(0) = 1"}</Tex>.
            </p>
            <p>
              <strong>Normal form:</strong> already there, <Tex>{"a = 2"}</Tex>,{" "}
              <Tex>{"b = e^{x}"}</Tex>. <strong>Factor:</strong> <Tex>{"\\mu = e^{2x}"}</Tex>.
            </p>
            <p>
              <strong>Collapse:</strong>{" "}
              <Tex>{"(e^{2x}y)' = e^{2x}e^{x} = e^{3x} \\Rightarrow e^{2x}y = \\tfrac{1}{3}e^{3x} + C"}</Tex>
              , so <Tex>{"y = \\tfrac{1}{3}e^{x} + C e^{-2x}"}</Tex>.
            </p>
            <p>
              <strong>Fit:</strong> <Tex>{"y(0) = \\tfrac13 + C = 1 \\Rightarrow C = \\tfrac23"}</Tex>
              , hence <Tex>{"y = \\tfrac13 e^{x} + \\tfrac23 e^{-2x}"}</Tex>.
            </p>
            <p>
              <strong>Verify:</strong>{" "}
              <Tex>{"y' = \\tfrac13 e^{x} - \\tfrac43 e^{-2x}"}</Tex>, so{" "}
              <Tex>{"y' + 2y = \\tfrac13 e^{x} - \\tfrac43 e^{-2x} + \\tfrac23 e^{x} + \\tfrac43 e^{-2x} = e^{x}"}</Tex>{" "}
              ✓ and <Tex>{"y(0) = \\tfrac13 + \\tfrac23 = 1"}</Tex> ✓.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The structure worth memorizing",
        content: (
          <>
            Formula (8.3) says every solution is{" "}
            <Tex>{"y = \\underbrace{C e^{-\\int a}}_{\\text{homogeneous family}} + \\underbrace{y_p}_{\\text{one particular solution}}"}</Tex>
            . In the example: <Tex>{"\\tfrac23 e^{-2x}"}</Tex> is the (fitted) homogeneous part and{" "}
            <Tex>{"\\tfrac13 e^{x}"}</Tex> the particular one. <em>Every linear equation</em> — first
            or second order — has this shape: <Tex>{"y = y_h + y_p"}</Tex>. Lesson 4 is built entirely
            on it.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Three ways students lose these points",
        content: (
          <>
            (1) <strong>Skipping normal form:</strong> in <Tex>{"x y' + 2y = x^3"}</Tex> the
            coefficient is <Tex>{"a = 2/x"}</Tex>, giving <Tex>{"\\mu = x^2"}</Tex> — not{" "}
            <Tex>{"e^{2x}"}</Tex>. (2) <strong>Sign slips:</strong> <Tex>{"y' - 3y"}</Tex> has{" "}
            <Tex>{"\\mu = e^{-3x}"}</Tex>; the factor must <em>cancel</em> the coefficient's sign, not
            copy it. (3) <strong>Adding C too late:</strong> the constant appears when you integrate{" "}
            <Tex>{"(\\mu y)' "}</Tex>, so it always rides <Tex>{"e^{-\\int a}"}</Tex>. Writing{" "}
            <Tex>{"y = \\tfrac13 e^x + C"}</Tex> fails the ODE for every <Tex>{"C \\ne 0"}</Tex>.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ode-cp2",
          difficulty: "easy",
          prompt: <>The integrating factor for <Tex>{"y' - 3y = e^{x}"}</Tex> is:</>,
          options: [
            { id: "A", content: <Tex>{"e^{3x}"}</Tex> },
            { id: "B", content: <Tex>{"e^{-3x}"}</Tex> },
            { id: "C", content: <Tex>{"e^{x}"}</Tex> },
            { id: "D", content: <Tex>{"x^{-3}"}</Tex> },
          ],
          correct: "B",
          explanation: (
            <>
              In normal form <Tex>{"a(x) = -3"}</Tex>, so{" "}
              <Tex>{"\\mu = e^{\\int -3\\,dx} = e^{-3x}"}</Tex> — B. Then{" "}
              <Tex>{"(e^{-3x}y)' = e^{-2x}"}</Tex> integrates to{" "}
              <Tex>{"y = -\\tfrac12 e^{x} + Ce^{3x}"}</Tex>. A copies the sign instead of cancelling
              it (check: <Tex>{"(e^{3x}y)' = e^{3x}y' + 3e^{3x}y"}</Tex>, the wrong combination); C
              uses <Tex>{"b"}</Tex> instead of <Tex>{"a"}</Tex>; D belongs to coefficients of the form{" "}
              <Tex>{"a = k/x"}</Tex>.
            </>
          ),
          theory: <>μ = e^∫a with a read from the NORMAL form — sign included.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            You now own every first-order linear equation. Second-order equations with constant
            coefficients — the ones vibrating machines obey — are next, and they reduce to solving a
            quadratic.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — second-order homogeneous, characteristic equation
   * ================================================================ */
  {
    id: "ode-second-order-homogeneous",
    title: "Second-order linear ODEs: the characteristic equation",
    lecture: MODULE,
    summary:
      "Guess e^{λx}, get a quadratic. Its discriminant sorts every constant-coefficient equation — and every damped oscillator — into exactly three behaviours.",
    minutes: 21,
    objectives: [
      "Translate ay″ + by′ + cy = 0 into its characteristic equation aλ² + bλ + c = 0",
      "Write the general solution in each of the three discriminant cases",
      "Fit the two constants to initial conditions y(0), y′(0)",
      "Classify a mass–spring–damper as under-, critically or over-damped",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            The single most important ODE for a mechanical engineer is{" "}
            <Tex>{"m\\,y'' + c\\,y' + k\\,y = F(t)"}</Tex>: mass times acceleration, plus viscous
            damping proportional to velocity, plus a spring force proportional to displacement, equals
            the external force. Suspensions, machine mounts, accelerometer internals — same equation.
            This lesson solves the <strong>free</strong> case <Tex>{"F = 0"}</Tex>; the forced case is
            lesson 4.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Linear, homogeneous, constant coefficients",
        content: (
          <>
            We study <Tex>{"a\\,y'' + b\\,y' + c\\,y = 0"}</Tex> with constants{" "}
            <Tex>{"a \\ne 0, b, c"}</Tex>. Because the equation is linear and homogeneous, solutions
            form a <strong>2-dimensional space</strong>: find two independent solutions{" "}
            <Tex>{"y_1, y_2"}</Tex> and <em>every</em> solution is{" "}
            <Tex>{"c_1 y_1 + c_2 y_2"}</Tex>. Two constants — matching the two initial conditions{" "}
            <Tex>{"y(x_0)"}</Tex> and <Tex>{"y'(x_0)"}</Tex> a second-order Cauchy problem carries.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Which function reproduces itself under differentiation? The exponential. Try{" "}
            <Tex>{"y = e^{\\lambda x}"}</Tex>: then <Tex>{"y' = \\lambda e^{\\lambda x}"}</Tex>,{" "}
            <Tex>{"y'' = \\lambda^2 e^{\\lambda x}"}</Tex>, and the ODE becomes{" "}
            <Tex>{"(a\\lambda^2 + b\\lambda + c)\\,e^{\\lambda x} = 0"}</Tex>. Since{" "}
            <Tex>{"e^{\\lambda x}"}</Tex> is never zero, everything hinges on a quadratic:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "a\\lambda^2 + b\\lambda + c = 0, \\qquad \\Delta = b^2 - 4ac",
        tag: "8.4",
        caption: <>The characteristic equation. The discriminant decides the shape of every solution.</>,
      },
      { kind: "heading", text: "The three cases" },
      {
        kind: "steps",
        title: "General solution by discriminant",
        steps: [
          {
            label: "Δ > 0 — two distinct real roots λ₁, λ₂",
            content: (
              <>
                <Tex>{"y = c_1 e^{\\lambda_1 x} + c_2 e^{\\lambda_2 x}"}</Tex>. Two independent
                exponentials; no oscillation.
              </>
            ),
          },
          {
            label: "Δ = 0 — one double root λ",
            content: (
              <>
                <Tex>{"y = (c_1 + c_2 x)\\,e^{\\lambda x}"}</Tex>. The second solution is{" "}
                <Tex>{"x e^{\\lambda x}"}</Tex> — the <Tex>{"x"}</Tex> factor is mandatory, otherwise
                you have one solution written twice and only one usable constant.
              </>
            ),
          },
          {
            label: "Δ < 0 — complex pair λ = α ± iβ",
            content: (
              <>
                <Tex>{"y = e^{\\alpha x}\\left(c_1 \\cos\\beta x + c_2 \\sin\\beta x\\right)"}</Tex>.
                Real part <Tex>{"\\alpha"}</Tex> = envelope <Tex>{"e^{\\alpha x}"}</Tex>; imaginary
                part <Tex>{"\\beta"}</Tex> = oscillation frequency. Only <Tex>{"\\beta"}</Tex>, never
                the full root, goes inside cos and sin.
              </>
            ),
          },
        ],
      },
      {
        kind: "figure",
        render: () => <DampingFigure />,
        caption: (
          <>
            The same "mass released from rest at <Tex>{"y = 1"}</Tex>" in the three regimes.
            Underdamped (<Tex>{"\\Delta \\lt 0"}</Tex>) rings and decays; critically damped (
            <Tex>{"\\Delta = 0"}</Tex>) returns fastest with no overshoot; overdamped (
            <Tex>{"\\Delta \\gt 0"}</Tex>) creeps back slowly — <em>more</em> damping is not faster.
          </>
        ),
      },
      { kind: "heading", text: "Spotlight: under-, critical and over-damping" },
      {
        kind: "prose",
        content: (
          <p>
            For the free oscillator <Tex>{"m y'' + c y' + k y = 0"}</Tex> the discriminant is{" "}
            <Tex>{"\\Delta = c^2 - 4mk"}</Tex>, and the three algebra cases <em>are</em> the three
            physical regimes: <strong>underdamped</strong> <Tex>{"c^2 \\lt 4mk"}</Tex> (complex roots
            — decaying oscillation), <strong>critically damped</strong> <Tex>{"c^2 = 4mk"}</Tex>{" "}
            (double root <Tex>{"\\lambda = -c/2m"}</Tex> — fastest non-oscillating return), and{" "}
            <strong>overdamped</strong> <Tex>{"c^2 \\gt 4mk"}</Tex> (two real negative roots — slow
            creep). With no damping at all (<Tex>{"c = 0"}</Tex>) the roots are{" "}
            <Tex>{"\\pm i\\omega_0"}</Tex> with{" "}
            <Tex>{"\\omega_0 = \\sqrt{k/m}"}</Tex>, the <strong>natural frequency</strong> — remember
            it, resonance in lesson 4 happens exactly there.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Why engineers tune close to critical",
        content: (
          <>
            A car suspension that is underdamped bounces repeatedly after a bump; overdamped, it
            responds sluggishly and takes long to settle. Designers aim near — usually slightly below
            — critical damping: settle fast, overshoot little. "Critical" is a design target, not just
            an algebra case.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — underdamped Cauchy problem",
        content: (
          <>
            <p>
              Solve <Tex>{"y'' + 2y' + 5y = 0"}</Tex>, <Tex>{"y(0) = 1"}</Tex>,{" "}
              <Tex>{"y'(0) = 0"}</Tex>.
            </p>
            <p>
              <strong>Characteristic:</strong> <Tex>{"\\lambda^2 + 2\\lambda + 5 = 0"}</Tex>, so{" "}
              <Tex>{"\\lambda = \\dfrac{-2 \\pm \\sqrt{4 - 20}}{2} = -1 \\pm 2i"}</Tex>:{" "}
              <Tex>{"\\alpha = -1"}</Tex>, <Tex>{"\\beta = 2"}</Tex>.
            </p>
            <p>
              <strong>General solution:</strong>{" "}
              <Tex>{"y = e^{-x}(c_1 \\cos 2x + c_2 \\sin 2x)"}</Tex>.
            </p>
            <p>
              <strong>Fit:</strong> <Tex>{"y(0) = c_1 = 1"}</Tex>. Differentiate:{" "}
              <Tex>{"y' = -e^{-x}(c_1\\cos 2x + c_2 \\sin 2x) + e^{-x}(-2c_1 \\sin 2x + 2c_2\\cos 2x)"}</Tex>
              , so <Tex>{"y'(0) = -c_1 + 2c_2 = 0 \\Rightarrow c_2 = \\tfrac12"}</Tex>.
            </p>
            <p>
              <strong>Answer:</strong>{" "}
              <Tex>{"y = e^{-x}\\left(\\cos 2x + \\tfrac12 \\sin 2x\\right)"}</Tex>. As a check,
              differentiating twice gives <Tex>{"y' = -\\tfrac52 e^{-x}\\sin 2x"}</Tex> and{" "}
              <Tex>{"y'' = \\tfrac52 e^{-x}(\\sin 2x - 2\\cos 2x)"}</Tex>, and indeed{" "}
              <Tex>{"y'' + 2y' + 5y = 0"}</Tex> ✓. A decaying wiggle — underdamped, as{" "}
              <Tex>{"\\Delta = 4 - 20 \\lt 0"}</Tex> promised.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The three classic slips",
        content: (
          <>
            (1) <strong>Double root without the x:</strong> writing{" "}
            <Tex>{"c_1 e^{\\lambda x} + c_2 e^{\\lambda x}"}</Tex> is one constant pretending to be
            two — you cannot fit two initial conditions. It must be{" "}
            <Tex>{"(c_1 + c_2 x)e^{\\lambda x}"}</Tex>. (2) <strong>Complex case:</strong>{" "}
            <Tex>{"\\beta"}</Tex> is the <em>imaginary part only</em>: for{" "}
            <Tex>{"\\lambda = -1 \\pm 2i"}</Tex> the answer oscillates as <Tex>{"\\cos 2x"}</Tex>, not{" "}
            <Tex>{"\\cos x"}</Tex> and not <Tex>{"e^{-2x}"}</Tex>-anything. (3){" "}
            <strong>Dropping the sine:</strong> keep both <Tex>{"\\cos"}</Tex> and{" "}
            <Tex>{"\\sin"}</Tex> with separate constants — the sine is what absorbs{" "}
            <Tex>{"y'(0)"}</Tex>.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ode-cp3",
          difficulty: "medium",
          prompt: <>The general solution of <Tex>{"y'' + 6y' + 9y = 0"}</Tex> is:</>,
          options: [
            { id: "A", content: <Tex>{"y = (c_1 + c_2 x)e^{-3x}"}</Tex> },
            { id: "B", content: <Tex>{"y = c_1 e^{-3x} + c_2 e^{3x}"}</Tex> },
            { id: "C", content: <Tex>{"y = e^{-3x}(c_1 \\cos 3x + c_2 \\sin 3x)"}</Tex> },
            { id: "D", content: <Tex>{"y = c_1 e^{-3x}"}</Tex> },
          ],
          correct: "A",
          explanation: (
            <>
              <Tex>{"\\lambda^2 + 6\\lambda + 9 = (\\lambda + 3)^2"}</Tex>: a double root{" "}
              <Tex>{"\\lambda = -3"}</Tex>, so the basis is <Tex>{"e^{-3x}, x e^{-3x}"}</Tex> — A. B
              invents a second root <Tex>{"+3"}</Tex> (the factorization is a perfect square, not a
              difference); C treats <Tex>{"\\Delta = 0"}</Tex> as if it were negative — there is no
              oscillation; D has only one constant, too few for a second-order equation.
            </>
          ),
          theory: <>Δ = 0 ⇒ double root ⇒ multiply the second copy by x: (c₁ + c₂x)e^{"{λx}"}.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            Free vibration solved. Now push the system: shake the mass with an external force{" "}
            <Tex>{"F(t)"}</Tex> and the equation grows a right-hand side. The method of undetermined
            coefficients — and its famous failure mode, resonance — completes the module.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 4 — non-homogeneous, undetermined coefficients, resonance
   * ================================================================ */
  {
    id: "ode-undetermined-coefficients",
    title: "Non-homogeneous equations: undetermined coefficients & resonance",
    lecture: MODULE,
    summary:
      "Guess a solution shaped like the forcing, tune its coefficients — and when the forcing hits a natural mode, repair the guess with a factor of x. That failure is resonance.",
    minutes: 23,
    objectives: [
      "Split the general solution as y = yₕ + yₚ and use superposition on the right-hand side",
      "Choose the correct similarity guess for polynomial, exponential and sine/cosine forcing",
      "Detect resonance and repair the guess with the ×x (or ×x²) factor",
      "Explain what resonance means physically for a forced spring",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Now the complete equation: <Tex>{"a y'' + b y' + c y = b(x)"}</Tex> with a nonzero
            forcing. Linearity does the heavy lifting: if <Tex>{"y_p"}</Tex> is <em>any one</em>{" "}
            solution and <Tex>{"y"}</Tex> is any other, their difference solves the homogeneous
            equation. So the whole solution set is "homogeneous family, shifted by one particular
            solution" — the same skeleton you met with the integrating factor.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "y_{\\text{gen}} = y_h + y_p = c_1 y_1 + c_2 y_2 + y_p",
        tag: "8.5",
        caption: (
          <>
            Superposition bonus: if <Tex>{"b(x) = b_1(x) + b_2(x)"}</Tex>, find a particular solution
            for each piece separately and add them.
          </>
        ),
      },
      { kind: "heading", text: "The similarity method (undetermined coefficients)" },
      {
        kind: "prose",
        content: (
          <p>
            For the right-hand sides that actually appear in exams — polynomials, exponentials, sines
            and cosines, and their products — the particular solution has <em>the same shape as the
            forcing</em>. So guess that shape with unknown coefficients, substitute, and match. The
            table is the whole method:
          </p>
        ),
      },
      {
        kind: "figure",
        render: () => <GuessTable />,
        caption: (
          <>
            "Root" always refers to the characteristic equation of the <em>homogeneous</em> part.
            That is why you must solve the homogeneous equation first — the guess depends on its
            roots.
          </>
        ),
      },
      {
        kind: "steps",
        title: "Undetermined-coefficients recipe",
        steps: [
          {
            label: "Homogeneous first",
            content: (
              <>
                Solve <Tex>{"a\\lambda^2 + b\\lambda + c = 0"}</Tex> and write{" "}
                <Tex>{"y_h"}</Tex>. You cannot detect resonance without the roots.
              </>
            ),
          },
          {
            label: "Build the guess",
            content: (
              <>
                Read the table row matching <Tex>{"b(x)"}</Tex>. Keep full generality: a degree-2
                polynomial forcing needs <Tex>{"Ax^2 + Bx + C"}</Tex>, a sine forcing needs{" "}
                <Tex>{"A\\cos + B\\sin"}</Tex>.
              </>
            ),
          },
          {
            label: "Resonance check",
            content: (
              <>
                Does the guess (or part of it) already solve the homogeneous equation? If the
                associated root has multiplicity <Tex>{"m"}</Tex>, multiply the guess by{" "}
                <Tex>{"x^m"}</Tex>.
              </>
            ),
          },
          {
            label: "Substitute and match",
            content: (
              <>
                Plug the guess into the ODE, group by <Tex>{"e^{\\gamma x}"}</Tex>,{" "}
                <Tex>{"\\cos"}</Tex>/<Tex>{"\\sin"}</Tex>, powers of <Tex>{"x"}</Tex>; equate
                coefficients; solve the small linear system.
              </>
            ),
          },
          {
            label: "Assemble, then fit",
            content: (
              <>
                <Tex>{"y = y_h + y_p"}</Tex>. Only <em>now</em> impose initial conditions — fitting{" "}
                <Tex>{"c_1, c_2"}</Tex> before adding <Tex>{"y_p"}</Tex> is a guaranteed wrong answer.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — exponential forcing, no resonance",
        content: (
          <>
            <p>
              Find the general solution of <Tex>{"y'' - 3y' + 2y = e^{3x}"}</Tex>.
            </p>
            <p>
              <strong>Homogeneous:</strong>{" "}
              <Tex>{"\\lambda^2 - 3\\lambda + 2 = (\\lambda - 1)(\\lambda - 2)"}</Tex>, so{" "}
              <Tex>{"y_h = c_1 e^{x} + c_2 e^{2x}"}</Tex>.
            </p>
            <p>
              <strong>Guess:</strong> forcing <Tex>{"e^{3x}"}</Tex>, and <Tex>{"3"}</Tex> is{" "}
              <em>not</em> a root — no resonance, take <Tex>{"y_p = A e^{3x}"}</Tex>.
            </p>
            <p>
              <strong>Substitute:</strong>{" "}
              <Tex>{"y_p'' - 3y_p' + 2y_p = (9A - 9A + 2A)e^{3x} = 2A e^{3x}"}</Tex>. Matching{" "}
              <Tex>{"e^{3x}"}</Tex> gives <Tex>{"A = \\tfrac12"}</Tex>.
            </p>
            <p>
              <strong>Answer:</strong>{" "}
              <Tex>{"y = c_1 e^{x} + c_2 e^{2x} + \\tfrac12 e^{3x}"}</Tex>. Check the particular part:{" "}
              <Tex>{"\\tfrac92 e^{3x} - \\tfrac92 e^{3x} + e^{3x} = e^{3x}"}</Tex> ✓.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Resonance: when the guess collides with the homogeneous" },
      {
        kind: "prose",
        content: (
          <p>
            Try the same recipe on <Tex>{"y'' - y = e^{x}"}</Tex>. Roots <Tex>{"\\pm 1"}</Tex>, so{" "}
            <Tex>{"e^{x}"}</Tex> <em>is already a homogeneous solution</em>. Substituting{" "}
            <Tex>{"y_p = Ae^{x}"}</Tex> gives <Tex>{"Ae^{x} - Ae^{x} = 0"}</Tex> — zero, for every{" "}
            <Tex>{"A"}</Tex>. The operator annihilates the guess; no coefficient can produce a nonzero
            right-hand side. The repair: multiply by <Tex>{"x"}</Tex>.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — simple resonance",
        content: (
          <>
            <p>
              Solve <Tex>{"y'' - y = e^{x}"}</Tex>.
            </p>
            <p>
              <strong>Repaired guess:</strong> <Tex>{"y_p = A x e^{x}"}</Tex> (root{" "}
              <Tex>{"\\gamma = 1"}</Tex> has multiplicity 1). Then{" "}
              <Tex>{"y_p' = A(1 + x)e^{x}"}</Tex>, <Tex>{"y_p'' = A(2 + x)e^{x}"}</Tex>.
            </p>
            <p>
              <strong>Substitute:</strong>{" "}
              <Tex>{"y_p'' - y_p = A(2 + x)e^{x} - A x e^{x} = 2A e^{x}"}</Tex>, so{" "}
              <Tex>{"A = \\tfrac12"}</Tex> and <Tex>{"y_p = \\tfrac{x}{2} e^{x}"}</Tex>.
            </p>
            <p>
              <strong>General solution:</strong>{" "}
              <Tex>{"y = c_1 e^{x} + c_2 e^{-x} + \\tfrac{x}{2}e^{x}"}</Tex>. Note the shape: the
              response rides the resonant mode with an amplitude that <em>grows linearly in</em>{" "}
              <Tex>{"x"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            The mechanical version is the exam's favourite. Force an undamped spring exactly at its
            natural frequency <Tex>{"\\omega_0 = \\sqrt{k/m}"}</Tex> and the naive guess{" "}
            <Tex>{"A\\cos\\omega_0 t + B\\sin\\omega_0 t"}</Tex> is annihilated — it <em>is</em> the
            free vibration. The repaired solution carries a factor <Tex>{"t"}</Tex>:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "y'' + \\omega_0^2\\,y = \\cos(\\omega_0 t) \\;\\Longrightarrow\\; y_p = \\frac{t}{2\\omega_0}\\,\\sin(\\omega_0 t)",
        tag: "8.6",
        caption: (
          <>
            Amplitude <Tex>{"t/2\\omega_0"}</Tex> grows without bound — the mathematical signature of
            resonance. (Verify: differentiate twice and the <Tex>{"t"}</Tex>-terms cancel, leaving
            exactly <Tex>{"\\cos\\omega_0 t"}</Tex>.)
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "What resonance means at the workbench",
        content: (
          <>
            Any rotating machine sweeps its forcing frequency through start-up. If it dwells at the
            structure's natural frequency, the response amplitude ramps up linearly — until real-world
            damping caps it or something yields. That is why shafts have "critical speeds" you
            accelerate through quickly, and why soldiers break step on footbridges. In the model the
            growth is unbounded because we set <Tex>{"c = 0"}</Tex>; with damping the peak is finite
            but can still be destructive.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Resonance-related point-losers",
        content: (
          <>
            (1) <strong>Guessing before solving the homogeneous:</strong> you literally cannot see the
            collision coming. (2) <strong>Wrong power of x:</strong> multiplicity 1 →{" "}
            <Tex>{"x"}</Tex>; double root → <Tex>{"x^2"}</Tex> (for{" "}
            <Tex>{"y'' - 4y' + 4y = e^{2x}"}</Tex> the guess is <Tex>{"Ax^2e^{2x}"}</Tex>, because
            both <Tex>{"e^{2x}"}</Tex> and <Tex>{"xe^{2x}"}</Tex> are homogeneous solutions). (3){" "}
            <strong>Half an ansatz:</strong> for trig forcing keep both{" "}
            <Tex>{"\\cos"}</Tex> and <Tex>{"\\sin"}</Tex> — in (8.6) the forcing is a cosine but the
            response is a pure <em>sine</em>; a cosine-only guess finds nothing.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-ode-cp4",
          difficulty: "medium",
          prompt: (
            <>
              For <Tex>{"y'' + y = \\sin x"}</Tex>, which particular-solution guess is correct?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"A \\sin x"}</Tex> },
            { id: "B", content: <Tex>{"A\\cos x + B\\sin x"}</Tex> },
            { id: "C", content: <Tex>{"A\\,x\\sin x"}</Tex> },
            { id: "D", content: <Tex>{"x\\,(A\\cos x + B\\sin x)"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              The roots of <Tex>{"\\lambda^2 + 1"}</Tex> are <Tex>{"\\pm i"}</Tex>, so{" "}
              <Tex>{"\\cos x, \\sin x"}</Tex> already solve the homogeneous equation — resonance,
              multiply by <Tex>{"x"}</Tex>, and keep both terms: D. A and B get annihilated by the
              operator (they are homogeneous solutions or missing pieces of them); C is resonant but
              incomplete — the true solution is <Tex>{"y_p = -\\tfrac{x}{2}\\cos x"}</Tex>, which a
              sine-only ansatz can never produce.
            </>
          ),
          theory: <>Trig forcing at a root ±iω ⇒ guess x(A cos ωx + B sin ωx), both terms, always.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            That completes the module: separable and linear first-order equations, the characteristic
            equation with its three regimes, and forced equations with the similarity method and its
            resonance repair. Do the practice set, then close with the three exam problems — each one
            mirrors a standard exam question.
          </p>
        ),
      },
    ],
  },
];

export const practice: Question[] = [
  /* -------------------- classification & structure ------------------- */
  {
    id: "ma2-ode-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The equation <Tex>{"y'' + 3y' + 2y = \\sin x"}</Tex> is:</>,
    options: [
      { id: "A", content: <>first-order linear</> },
      { id: "B", content: <>second-order, linear, constant coefficients, non-homogeneous</> },
      { id: "C", content: <>second-order nonlinear</> },
      { id: "D", content: <>second-order linear homogeneous</> },
    ],
    correct: "B",
    explanation: (
      <>
        Highest derivative <Tex>{"y''"}</Tex> ⇒ second order (A is out); <Tex>{"y, y', y''"}</Tex>{" "}
        appear to the first power with constant multipliers ⇒ linear with constant coefficients (not
        C); the right-hand side <Tex>{"\\sin x"}</Tex> is nonzero ⇒ non-homogeneous (not D). Hence B.
        Note the forcing term involves only <Tex>{"x"}</Tex>, so it does not break linearity.
      </>
    ),
    theory: <>Order = highest derivative; linear = y and derivatives enter linearly; homogeneous = zero right-hand side.</>,
  },
  {
    id: "ma2-ode-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The general solution of a linear non-homogeneous ODE is always:</>,
    options: [
      { id: "A", content: <>one particular solution <Tex>{"y_p"}</Tex> on its own</> },
      { id: "B", content: <>the homogeneous general solution <Tex>{"y_h"}</Tex> on its own</> },
      { id: "C", content: <>the product <Tex>{"y_h \\cdot y_p"}</Tex></> },
      { id: "D", content: <>the sum <Tex>{"y_h + y_p"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        If <Tex>{"y"}</Tex> and <Tex>{"y_p"}</Tex> both solve the complete equation, linearity makes{" "}
        <Tex>{"y - y_p"}</Tex> solve the homogeneous one, so <Tex>{"y = y_h + y_p"}</Tex> — D. A
        misses the whole family (no free constants to fit initial conditions); B solves the wrong
        equation (zero right-hand side); C has no basis — substituting a product into a linear
        equation does not split that way.
      </>
    ),
    theory: <>Linear structure: solution set = homogeneous space shifted by any one particular solution.</>,
  },
  {
    id: "ma2-ode-q3",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        To separate variables in <Tex>{"y' = y(y-2)"}</Tex> you divide by <Tex>{"y(y-2)"}</Tex>. Which
        solutions risk being lost?
      </>
    ),
    options: [
      { id: "A", content: <>the constant solutions <Tex>{"y \\equiv 0"}</Tex> and <Tex>{"y \\equiv 2"}</Tex></> },
      { id: "B", content: <>only <Tex>{"y \\equiv 0"}</Tex></> },
      { id: "C", content: <>none — separation of variables is always safe</> },
      { id: "D", content: <>the constant solutions <Tex>{"y \\equiv 0"}</Tex> and <Tex>{"y \\equiv -2"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        Division is illegal where <Tex>{"y(y-2) = 0"}</Tex>, i.e. at <Tex>{"y = 0"}</Tex> and{" "}
        <Tex>{"y = 2"}</Tex>; both are genuine solutions (each makes both sides 0) that the separated
        algebra never shows — A. B forgets the second factor; C is exactly the trap the method sets;
        D flips the sign — the root of <Tex>{"y - 2"}</Tex> is <Tex>{"+2"}</Tex>.
      </>
    ),
    theory: <>Lost solutions = roots of the factor you divide by; check them before dividing.</>,
  },
  {
    id: "ma2-ode-q4",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Solve the Cauchy problem <Tex>{"y' = -2xy"}</Tex>, <Tex>{"y(0) = 3"}</Tex>.</>,
    options: [
      { id: "A", content: <Tex>{"y = 3e^{-x}"}</Tex> },
      { id: "B", content: <Tex>{"y = 3 - x^2"}</Tex> },
      { id: "C", content: <Tex>{"y = 3e^{-x^2}"}</Tex> },
      { id: "D", content: <Tex>{"y = e^{-x^2} + 2"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Separate: <Tex>{"\\int dy/y = \\int -2x\\,dx"}</Tex> gives{" "}
        <Tex>{"\\ln|y| = -x^2 + c"}</Tex>, so <Tex>{"y = Ce^{-x^2}"}</Tex> and{" "}
        <Tex>{"y(0)=3"}</Tex> forces <Tex>{"C = 3"}</Tex> — C. Verify:{" "}
        <Tex>{"y' = -2x \\cdot 3e^{-x^2} = -2xy"}</Tex> ✓. A forgets the <Tex>{"x"}</Tex> in the
        integral of <Tex>{"-2x"}</Tex> (it solves <Tex>{"y' = -y"}</Tex>); B integrates as if the
        equation were <Tex>{"y' = -2x"}</Tex>, ignoring the <Tex>{"y"}</Tex>; D meets the initial
        condition but fails the ODE — constants cannot be <em>added</em> to a solution of{" "}
        <Tex>{"y' = -2xy"}</Tex>, the family is multiplicative.
      </>
    ),
    theory: <>Separable Cauchy problem: integrate both sides, solve for y, then fit C — and always substitute back.</>,
  },
  {
    id: "ma2-ode-q5",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        For <Tex>{"x \\gt 0"}</Tex>, the integrating factor of{" "}
        <Tex>{"y' + \\tfrac{2}{x}\\,y = 5x^3"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"e^{2x}"}</Tex> },
      { id: "B", content: <Tex>{"x^2"}</Tex> },
      { id: "C", content: <Tex>{"2\\ln x"}</Tex> },
      { id: "D", content: <Tex>{"e^{2/x}"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"\\mu = e^{\\int 2/x\\,dx} = e^{2\\ln x} = x^2"}</Tex> — B. Then{" "}
        <Tex>{"(x^2 y)' = 5x^5"}</Tex> and everything integrates cleanly. A integrates the constant 2
        instead of <Tex>{"2/x"}</Tex>; C stops after the integral and forgets to exponentiate; D
        exponentiates <Tex>{"a(x)"}</Tex> itself without integrating first.
      </>
    ),
    theory: <>μ = e^∫a: integrate a(x) first, then exponentiate — e^(k ln x) simplifies to xᵏ.</>,
  },
  {
    id: "ma2-ode-q6",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Solve the Cauchy problem <Tex>{"y' + y = e^{-x}"}</Tex>, <Tex>{"y(0) = 0"}</Tex>.</>,
    options: [
      { id: "A", content: <Tex>{"y = x e^{-x}"}</Tex> },
      { id: "B", content: <Tex>{"y = e^{-x} - 1"}</Tex> },
      { id: "C", content: <Tex>{"y = x e^{x}"}</Tex> },
      { id: "D", content: <Tex>{"y = (x+1)e^{-x} - 1"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\mu = e^{x}"}</Tex>, so <Tex>{"(e^{x}y)' = e^{x}e^{-x} = 1"}</Tex>, giving{" "}
        <Tex>{"e^{x}y = x + C"}</Tex> and <Tex>{"y = (x + C)e^{-x}"}</Tex>; the initial condition
        forces <Tex>{"C = 0"}</Tex> — A. Verify:{" "}
        <Tex>{"y' + y = (e^{-x} - xe^{-x}) + xe^{-x} = e^{-x}"}</Tex> ✓. B satisfies{" "}
        <Tex>{"y(0)=0"}</Tex> but plugs back to <Tex>{"-1"}</Tex>, not <Tex>{"e^{-x}"}</Tex>; C has
        the wrong exponential sign and grows instead of decaying; D also passes the initial condition
        but substitution gives <Tex>{"e^{-x} - 1"}</Tex> — checking the ODE, not just the initial
        value, is what separates these.
      </>
    ),
    theory: <>When b(x) is the homogeneous solution itself, the particular solution picks up a factor x — first-order resonance.</>,
  },
  {
    id: "ma2-ode-q7",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        The Cauchy–Lipschitz theorem guarantees that <Tex>{"y' = f(x,y)"}</Tex>,{" "}
        <Tex>{"y(x_0) = y_0"}</Tex> has exactly one local solution when:
      </>
    ),
    options: [
      { id: "A", content: <>f is continuous near the point (nothing more)</> },
      { id: "B", content: <>f is bounded near the point</> },
      {
        id: "C",
        content: (
          <>
            f is continuous and Lipschitz in <Tex>{"y"}</Tex> near the point (e.g.{" "}
            <Tex>{"\\partial f/\\partial y"}</Tex> continuous)
          </>
        ),
      },
      { id: "D", content: <>f is differentiable in <Tex>{"x"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        Existence needs continuity, but <em>uniqueness</em> needs the Lipschitz condition in the{" "}
        <Tex>{"y"}</Tex>-variable — C. A alone is Peano's theorem: existence, possibly many solutions
        (see <Tex>{"y' = 3y^{2/3}"}</Tex>); B is weaker than continuity in the relevant sense and
        controls nothing about how f varies with y; D regulates the wrong variable — it is the
        dependence on <Tex>{"y"}</Tex> that separates or merges solution curves.
      </>
    ),
    theory: <>Continuity ⇒ existence (Peano); + Lipschitz in y ⇒ uniqueness (Cauchy–Lipschitz/Picard).</>,
  },
  {
    id: "ma2-ode-q8",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The Cauchy problem <Tex>{"y' = 3y^{2/3}"}</Tex>, <Tex>{"y(0) = 0"}</Tex> (with{" "}
        <Tex>{"y^{2/3} = (\\sqrt[3]{y})^2"}</Tex>) has:
      </>
    ),
    options: [
      { id: "A", content: <>exactly one solution, <Tex>{"y \\equiv 0"}</Tex></> },
      { id: "B", content: <>exactly one solution, <Tex>{"y = x^3"}</Tex></> },
      { id: "C", content: <>no solutions at all</> },
      {
        id: "D",
        content: <>more than one solution — both <Tex>{"y \\equiv 0"}</Tex> and <Tex>{"y = x^3"}</Tex> work</>,
      },
    ],
    correct: "D",
    explanation: (
      <>
        Check both: <Tex>{"y \\equiv 0"}</Tex> gives <Tex>{"0 = 0"}</Tex> ✓; and{" "}
        <Tex>{"y = x^3"}</Tex> gives <Tex>{"y' = 3x^2"}</Tex> while{" "}
        <Tex>{"3(x^3)^{2/3} = 3x^2"}</Tex> ✓ — two distinct solutions through the same point, so D,
        and A, B are each only half the story. C is impossible since we exhibited solutions.
        Uniqueness fails because <Tex>{"\\partial f/\\partial y = 2y^{-1/3} \\to \\infty"}</Tex> at{" "}
        <Tex>{"y = 0"}</Tex>: the Lipschitz hypothesis breaks precisely at the initial value.
      </>
    ),
    theory: <>Where Lipschitz fails, solution curves may merge/split: the classic y′ = 3y^(2/3) counterexample.</>,
  },
  /* --------------------- characteristic equation --------------------- */
  {
    id: "ma2-ode-q9",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The general solution of <Tex>{"y'' - 5y' + 6y = 0"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"y = c_1 e^{2x} + c_2 e^{3x}"}</Tex> },
      { id: "B", content: <Tex>{"y = c_1 e^{-2x} + c_2 e^{-3x}"}</Tex> },
      { id: "C", content: <Tex>{"y = (c_1 + c_2 x) e^{2x}"}</Tex> },
      { id: "D", content: <Tex>{"y = e^{2x}(c_1 \\cos 3x + c_2 \\sin 3x)"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\lambda^2 - 5\\lambda + 6 = (\\lambda - 2)(\\lambda - 3)"}</Tex>: distinct real roots{" "}
        <Tex>{"2, 3"}</Tex>, so A. B flips the signs — that factorization would need{" "}
        <Tex>{"\\lambda^2 + 5\\lambda + 6"}</Tex>; C is the double-root form, but{" "}
        <Tex>{"\\Delta = 25 - 24 = 1 \\ne 0"}</Tex>; D is the complex-pair form, which needs{" "}
        <Tex>{"\\Delta \\lt 0"}</Tex>.
      </>
    ),
    theory: <>Factor the characteristic quadratic; distinct real roots ⇒ two plain exponentials.</>,
  },
  {
    id: "ma2-ode-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The general solution of <Tex>{"y'' + 4y' + 4y = 0"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"y = c_1 e^{-2x} + c_2 e^{2x}"}</Tex> },
      { id: "B", content: <Tex>{"y = (c_1 + c_2 x)e^{-2x}"}</Tex> },
      { id: "C", content: <Tex>{"y = c_1 e^{-2x} + c_2 e^{-2x}"}</Tex> },
      { id: "D", content: <Tex>{"y = e^{-2x}(c_1 \\cos 2x + c_2 \\sin 2x)"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"\\lambda^2 + 4\\lambda + 4 = (\\lambda + 2)^2"}</Tex>: a double root{" "}
        <Tex>{"-2"}</Tex>, so the second independent solution is <Tex>{"xe^{-2x}"}</Tex> — B. A
        invents roots <Tex>{"\\pm 2"}</Tex> (that is <Tex>{"\\lambda^2 - 4"}</Tex>); C looks like two
        constants but collapses to <Tex>{"(c_1 + c_2)e^{-2x}"}</Tex> — one constant, unable to match
        two initial conditions; D pretends <Tex>{"\\Delta \\lt 0"}</Tex>, but{" "}
        <Tex>{"\\Delta = 16 - 16 = 0"}</Tex>: no oscillation.
      </>
    ),
    theory: <>Δ = 0 ⇒ basis e^(λx), x·e^(λx). The x factor is what keeps the two constants independent.</>,
  },
  {
    id: "ma2-ode-q11",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The general solution of <Tex>{"y'' + 2y' + 5y = 0"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"y = e^{-2x}(c_1 \\cos x + c_2 \\sin x)"}</Tex> },
      { id: "B", content: <Tex>{"y = c_1 e^{-x} + c_2 e^{2x}"}</Tex> },
      { id: "C", content: <Tex>{"y = e^{x}(c_1 \\cos 2x + c_2 \\sin 2x)"}</Tex> },
      { id: "D", content: <Tex>{"y = e^{-x}(c_1 \\cos 2x + c_2 \\sin 2x)"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\lambda = \\dfrac{-2 \\pm \\sqrt{4 - 20}}{2} = -1 \\pm 2i"}</Tex>: real part{" "}
        <Tex>{"\\alpha = -1"}</Tex> feeds the envelope, imaginary part <Tex>{"\\beta = 2"}</Tex> feeds
        cos/sin — D. A swaps α and β; B misreads the complex pair as two real roots{" "}
        <Tex>{"-1"}</Tex> and <Tex>{"2"}</Tex>; C drops the minus sign on α, turning a decaying
        vibration into a growing one.
      </>
    ),
    theory: <>λ = α ± iβ ⇒ y = e^(αx)(c₁cos βx + c₂sin βx): α = envelope, β = frequency.</>,
  },
  {
    id: "ma2-ode-q12",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Solve <Tex>{"y'' + 9y = 0"}</Tex> with <Tex>{"y(0) = 2"}</Tex>, <Tex>{"y'(0) = 3"}</Tex>.
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"y = 2\\cos 3x + 3\\sin 3x"}</Tex> },
      { id: "B", content: <Tex>{"y = 3\\cos 3x + 2\\sin 3x"}</Tex> },
      { id: "C", content: <Tex>{"y = 2\\cos 3x + \\sin 3x"}</Tex> },
      { id: "D", content: <Tex>{"y = 2\\cos 9x + \\tfrac13 \\sin 9x"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Roots <Tex>{"\\pm 3i"}</Tex> give <Tex>{"y = c_1 \\cos 3x + c_2 \\sin 3x"}</Tex>. Then{" "}
        <Tex>{"y(0) = c_1 = 2"}</Tex> and{" "}
        <Tex>{"y' = -3c_1 \\sin 3x + 3c_2\\cos 3x \\Rightarrow y'(0) = 3c_2 = 3"}</Tex>, so{" "}
        <Tex>{"c_2 = 1"}</Tex> — C. Verify: <Tex>{"y'' = -9y"}</Tex> ✓. A forgets the chain-rule
        factor 3 when fitting <Tex>{"y'(0)"}</Tex>; B swaps the two constants; D uses frequency 9
        instead of <Tex>{"\\sqrt{9} = 3"}</Tex>.
      </>
    ),
    theory: <>y″ + ω²y = 0 ⇒ frequency √ of the coefficient; fitting y′(0) always brings a factor ω.</>,
  },
  /* ------------------- undetermined coefficients --------------------- */
  {
    id: "ma2-ode-q13",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>A particular solution of <Tex>{"y'' - 3y' + 2y = e^{3x}"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"y_p = e^{3x}"}</Tex> },
      { id: "B", content: <Tex>{"y_p = \\tfrac12 e^{3x}"}</Tex> },
      { id: "C", content: <Tex>{"y_p = \\tfrac12 x e^{3x}"}</Tex> },
      { id: "D", content: <Tex>{"y_p = -\\tfrac12 e^{3x}"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Roots are <Tex>{"1, 2"}</Tex>, so <Tex>{"3"}</Tex> is not resonant and{" "}
        <Tex>{"y_p = Ae^{3x}"}</Tex>. Substituting:{" "}
        <Tex>{"(9 - 9 + 2)A\\,e^{3x} = 2Ae^{3x} = e^{3x}"}</Tex>, so <Tex>{"A = \\tfrac12"}</Tex> —
        B. A forgets to solve for the coefficient (plugging it back gives <Tex>{"2e^{3x}"}</Tex>); C
        adds an x-factor that only resonance justifies; D has the sign wrong — the operator gives{" "}
        <Tex>{"+2A"}</Tex>, not <Tex>{"-2A"}</Tex>.
      </>
    ),
    theory: <>Non-resonant e^(γx): plug Ae^(γx) and divide by the characteristic value a·γ² + b·γ + c.</>,
  },
  {
    id: "ma2-ode-q14",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        For <Tex>{"y'' - 4y' + 4y = e^{2x}"}</Tex>, the correct form of the particular-solution guess
        is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"A e^{2x}"}</Tex> },
      { id: "B", content: <Tex>{"A x e^{2x}"}</Tex> },
      { id: "C", content: <Tex>{"A x^2 e^{2x}"}</Tex> },
      { id: "D", content: <Tex>{"A x^2 e^{-2x}"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"\\lambda^2 - 4\\lambda + 4 = (\\lambda - 2)^2"}</Tex>: <Tex>{"2"}</Tex> is a{" "}
        <em>double</em> root, so both <Tex>{"e^{2x}"}</Tex> (A) and <Tex>{"xe^{2x}"}</Tex> (B) already
        solve the homogeneous equation — the operator annihilates them and no coefficient can match
        the forcing. Multiplicity 2 demands <Tex>{"x^2"}</Tex>: C. (Substituting gives{" "}
        <Tex>{"2Ae^{2x} = e^{2x}"}</Tex>, so <Tex>{"A = \\tfrac12"}</Tex>.) D fixes the power but
        breaks the exponent — the root is <Tex>{"+2"}</Tex>, not <Tex>{"-2"}</Tex>.
      </>
    ),
    theory: <>Resonance factor = x^m with m the multiplicity of the root the forcing hits.</>,
  },
  {
    id: "ma2-ode-q15",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For <Tex>{"y'' + y' + y = \\sin 2x"}</Tex>, the correct particular-solution guess is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"A\\cos 2x + B\\sin 2x"}</Tex> },
      { id: "B", content: <Tex>{"A\\sin 2x"}</Tex> },
      { id: "C", content: <Tex>{"x(A\\cos 2x + B\\sin 2x)"}</Tex> },
      { id: "D", content: <Tex>{"A\\cos x + B\\sin x"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        The roots of <Tex>{"\\lambda^2 + \\lambda + 1"}</Tex> are{" "}
        <Tex>{"-\\tfrac12 \\pm i\\tfrac{\\sqrt3}{2}"}</Tex>, not <Tex>{"\\pm 2i"}</Tex>, so there is
        no resonance and the plain two-term guess works — A. B fails because the{" "}
        <Tex>{"y'"}</Tex> term turns sines into cosines: a sine-only guess cannot balance the cosine
        it generates; C adds a resonance factor nothing justifies; D guesses at frequency 1 while the
        forcing oscillates at frequency 2 — the frequency must match the forcing.
      </>
    ),
    theory: <>Trig forcing: always guess both cos ωx and sin ωx at the forcing frequency ω.</>,
  },
  {
    id: "ma2-ode-q16",
    topic: MODULE,
    difficulty: "hard",
    prompt: <>A particular solution of <Tex>{"y'' + 4y = \\cos 2x"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"y_p = \\tfrac14 \\cos 2x"}</Tex> },
      { id: "B", content: <Tex>{"y_p = -\\tfrac{x}{4}\\cos 2x"}</Tex> },
      { id: "C", content: <Tex>{"y_p = \\tfrac{x}{4}\\cos 2x"}</Tex> },
      { id: "D", content: <Tex>{"y_p = \\tfrac{x}{4}\\sin 2x"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        Roots <Tex>{"\\pm 2i"}</Tex>: the forcing frequency is the natural frequency — resonance, so
        guess <Tex>{"x(A\\cos 2x + B\\sin 2x)"}</Tex>. Substituting leaves{" "}
        <Tex>{"-4A\\sin 2x + 4B\\cos 2x = \\cos 2x"}</Tex>, so <Tex>{"A = 0, B = \\tfrac14"}</Tex> —
        D. Verify: for <Tex>{"y = \\tfrac{x}{4}\\sin 2x"}</Tex>,{" "}
        <Tex>{"y'' = \\cos 2x - x\\sin 2x"}</Tex> and{" "}
        <Tex>{"y'' + 4y = \\cos 2x"}</Tex> ✓. A is annihilated by the operator (plug it in: you get
        0); B actually solves <Tex>{"y'' + 4y = \\sin 2x"}</Tex> — the wrong forcing; C plugs back to{" "}
        <Tex>{"-\\sin 2x"}</Tex>. Cosine forcing, sine response: resonance shifts the phase by 90°.
      </>
    ),
    theory: <>y″ + ω²y = cos ωx ⇒ y_p = (x/2ω)·sin ωx: linear growth and a 90° phase shift.</>,
  },
  /* --------------------------- mechanics ----------------------------- */
  {
    id: "ma2-ode-q17",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        A mass–spring–damper <Tex>{"m y'' + c y' + k y = 0"}</Tex> has <Tex>{"m = 1"}</Tex> kg,{" "}
        <Tex>{"c = 4"}</Tex> N·s/m, <Tex>{"k = 4"}</Tex> N/m. Its free motion is:
      </>
    ),
    options: [
      { id: "A", content: <>critically damped — it returns as fast as possible without oscillating</> },
      { id: "B", content: <>underdamped — it oscillates with decaying amplitude</> },
      { id: "C", content: <>overdamped — it creeps back with two distinct decay rates</> },
      { id: "D", content: <>undamped — it oscillates forever at <Tex>{"\\omega_0 = 2"}</Tex> rad/s</> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\Delta = c^2 - 4mk = 16 - 16 = 0"}</Tex>: double root{" "}
        <Tex>{"\\lambda = -c/2m = -2"}</Tex>, motion <Tex>{"(c_1 + c_2 t)e^{-2t}"}</Tex> — critically
        damped, A. B would need <Tex>{"c^2 \\lt 4mk"}</Tex> (complex roots) and C needs{" "}
        <Tex>{"c^2 \\gt 4mk"}</Tex> (two real roots); D requires <Tex>{"c = 0"}</Tex> — the natural
        frequency 2 rad/s is right, but only for the undamped system.
      </>
    ),
    theory: <>Damping regimes = sign of c² − 4mk: below ⇒ ring, equal ⇒ critical, above ⇒ creep.</>,
  },
  {
    id: "ma2-ode-q18",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        For <Tex>{"y'' + y = x + \\cos x"}</Tex>, the correct particular-solution ansatz is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"ax + b + c\\cos x + d\\sin x"}</Tex> },
      { id: "B", content: <Tex>{"ax + b + x(c\\cos x + d\\sin x)"}</Tex> },
      { id: "C", content: <Tex>{"x(ax + b) + x(c\\cos x + d\\sin x)"}</Tex> },
      { id: "D", content: <Tex>{"ax + c\\,x\\cos x"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Split by superposition. Piece <Tex>{"x"}</Tex>: polynomial forcing checks against the root{" "}
        <Tex>{"0"}</Tex>, which is <em>not</em> a root of <Tex>{"\\lambda^2 + 1"}</Tex> — plain{" "}
        <Tex>{"ax + b"}</Tex>. Piece <Tex>{"\\cos x"}</Tex>: <Tex>{"\\pm i"}</Tex> <em>are</em> roots
        — resonant, needs <Tex>{"x(c\\cos x + d\\sin x)"}</Tex>. Together: B. A misses the resonance
        on the trig part (it would be annihilated); C wrongly multiplies the polynomial by{" "}
        <Tex>{"x"}</Tex> too — the polynomial part is not resonant; D drops the constant{" "}
        <Tex>{"b"}</Tex> and the sine term, both needed for the match.
      </>
    ),
    theory: <>Apply the resonance test term by term: polynomials probe the root 0, trig probes ±iω, exponentials probe γ.</>,
  },
];

export const exam: ExamProblem[] = [
  {
    id: "ma2-ode-e1",
    title: "Cauchy problem for a first-order linear ODE",
    meta: "ODEs · ~9 pts · integrating factor",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        For <Tex>{"x \\gt 0"}</Tex>, solve the Cauchy problem{" "}
        <Tex>{"y' + \\dfrac{2}{x}\\,y = 4x, \\qquad y(1) = 3,"}</Tex> and verify that your solution
        satisfies both the equation and the initial condition.
      </>
    ),
    given: <><Tex>{"a(x) = 2/x,\\quad b(x) = 4x,\\quad x \\gt 0"}</Tex></>,
    steps: [
      {
        title: "Integrating factor",
        content: (
          <>
            <Tex>{"\\mu = e^{\\int 2/x\\,dx} = e^{2\\ln x} = x^2"}</Tex> (any one antiderivative;{" "}
            <Tex>{"x \\gt 0"}</Tex> lets us drop the absolute value).
          </>
        ),
      },
      {
        title: "Collapse the left side and integrate",
        content: (
          <>
            Multiplying by <Tex>{"x^2"}</Tex>:{" "}
            <Tex>{"x^2 y' + 2x\\,y = (x^2 y)' = 4x^3"}</Tex>. Integrate:{" "}
            <Tex>{"x^2 y = x^4 + C"}</Tex> — the constant enters <em>here</em>, before dividing.
          </>
        ),
      },
      {
        title: "General solution and initial condition",
        content: (
          <>
            <Tex>{"y = x^2 + \\dfrac{C}{x^2}"}</Tex>. Impose{" "}
            <Tex>{"y(1) = 1 + C = 3 \\Rightarrow C = 2"}</Tex>.
          </>
        ),
      },
      {
        title: "Verify (this is where the marks are)",
        content: (
          <>
            <Tex>{"y = x^2 + 2x^{-2} \\Rightarrow y' = 2x - 4x^{-3}"}</Tex>. Then{" "}
            <Tex>{"y' + \\tfrac2x y = 2x - 4x^{-3} + 2x + 4x^{-3} = 4x"}</Tex> ✓ and{" "}
            <Tex>{"y(1) = 1 + 2 = 3"}</Tex> ✓.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"y(x) = x^2 + \\dfrac{2}{x^2}"}</Tex> on <Tex>{"x \\gt 0"}</Tex>.
      </>
    ),
    tips: (
      <>
        If the equation arrives as <Tex>{"x y' + 2y = 4x^2"}</Tex>, normalize first — the coefficient
        that feeds <Tex>{"\\mu"}</Tex> is <Tex>{"2/x"}</Tex>, not 2. Most lost points: adding{" "}
        <Tex>{"+C"}</Tex> <em>after</em> dividing by <Tex>{"\\mu"}</Tex> (the constant must ride{" "}
        <Tex>{"1/x^2"}</Tex>), and forgetting to state the domain <Tex>{"x \\gt 0"}</Tex> on which
        the coefficient is continuous.
      </>
    ),
  },
  {
    id: "ma2-ode-e2",
    title: "Complete second-order equation with initial conditions",
    meta: "ODEs · ~11 pts · undetermined coefficients",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Solve <Tex>{"y'' - 3y' + 2y = e^{3x}"}</Tex> with <Tex>{"y(0) = 0"}</Tex>,{" "}
        <Tex>{"y'(0) = 0"}</Tex>. Verify the particular solution by substitution.
      </>
    ),
    given: <><Tex>{"\\text{characteristic: } \\lambda^2 - 3\\lambda + 2 = 0"}</Tex></>,
    steps: [
      {
        title: "Homogeneous solution",
        content: (
          <>
            <Tex>{"\\lambda^2 - 3\\lambda + 2 = (\\lambda - 1)(\\lambda - 2) = 0"}</Tex>: roots{" "}
            <Tex>{"1, 2"}</Tex>, so <Tex>{"y_h = c_1 e^{x} + c_2 e^{2x}"}</Tex>.
          </>
        ),
      },
      {
        title: "Particular solution (no resonance)",
        content: (
          <>
            <Tex>{"\\gamma = 3"}</Tex> is not a root, so try <Tex>{"y_p = Ae^{3x}"}</Tex>:{" "}
            <Tex>{"9A - 3\\cdot 3A + 2A = 2A"}</Tex>, and matching{" "}
            <Tex>{"2Ae^{3x} = e^{3x}"}</Tex> gives <Tex>{"A = \\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "Verify y_p by substitution",
        content: (
          <>
            <Tex>{"y_p = \\tfrac12 e^{3x}: \\; y_p'' = \\tfrac92 e^{3x},\\; -3y_p' = -\\tfrac92 e^{3x},\\; 2y_p = e^{3x}"}</Tex>
            . Sum: <Tex>{"e^{3x}"}</Tex> ✓.
          </>
        ),
      },
      {
        title: "General solution, then fit BOTH constants to the full y",
        content: (
          <>
            <Tex>{"y = c_1 e^{x} + c_2 e^{2x} + \\tfrac12 e^{3x}"}</Tex>. Conditions:{" "}
            <Tex>{"y(0) = c_1 + c_2 + \\tfrac12 = 0"}</Tex> and{" "}
            <Tex>{"y'(0) = c_1 + 2c_2 + \\tfrac32 = 0"}</Tex>. Subtracting:{" "}
            <Tex>{"c_2 + 1 = 0 \\Rightarrow c_2 = -1"}</Tex>, then <Tex>{"c_1 = \\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "Final check of the initial conditions",
        content: (
          <>
            <Tex>{"y(0) = \\tfrac12 - 1 + \\tfrac12 = 0"}</Tex> ✓;{" "}
            <Tex>{"y' = \\tfrac12 e^{x} - 2e^{2x} + \\tfrac32 e^{3x} \\Rightarrow y'(0) = \\tfrac12 - 2 + \\tfrac32 = 0"}</Tex>{" "}
            ✓.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"y(x) = \\tfrac12 e^{x} - e^{2x} + \\tfrac12 e^{3x}"}</Tex>
      </>
    ),
    tips: (
      <>
        Always solve the homogeneous part first — it is your resonance detector. The classic
        mark-loser here is fitting <Tex>{"c_1, c_2"}</Tex> using <Tex>{"y_h"}</Tex> alone and adding{" "}
        <Tex>{"y_p"}</Tex> afterwards: the constants must be fitted to the <em>complete</em>{" "}
        solution. Also common: <Tex>{"A = 1"}</Tex> instead of <Tex>{"\\tfrac12"}</Tex> from skipping
        the division by the characteristic value <Tex>{"2"}</Tex>.
      </>
    ),
  },
  {
    id: "ma2-ode-e3",
    title: "Forced oscillator at resonance",
    meta: "ODEs · ~10 pts · resonance classic",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Find the general solution of <Tex>{"y'' + 4y = \\cos 2x"}</Tex>, verify the particular
        solution by substitution, and explain the physical meaning of its form.
      </>
    ),
    given: <><Tex>{"\\omega_0 = 2:\\ \\text{forcing frequency} = \\text{natural frequency}"}</Tex></>,
    steps: [
      {
        title: "Homogeneous solution",
        content: (
          <>
            <Tex>{"\\lambda^2 + 4 = 0 \\Rightarrow \\lambda = \\pm 2i"}</Tex>, so{" "}
            <Tex>{"y_h = c_1 \\cos 2x + c_2 \\sin 2x"}</Tex> — free vibration at{" "}
            <Tex>{"\\omega_0 = 2"}</Tex>.
          </>
        ),
      },
      {
        title: "Show the naive guess dies",
        content: (
          <>
            Try <Tex>{"A\\cos 2x + B\\sin 2x"}</Tex>: its second derivative is{" "}
            <Tex>{"-4(A\\cos 2x + B\\sin 2x)"}</Tex>, so <Tex>{"y'' + 4y = 0"}</Tex> identically. The
            forcing solves the homogeneous equation — resonance. Multiply the guess by{" "}
            <Tex>{"x"}</Tex>.
          </>
        ),
      },
      {
        title: "Resonant ansatz and matching",
        content: (
          <>
            <Tex>{"y_p = x(A\\cos 2x + B\\sin 2x)"}</Tex>. Differentiating twice, the terms carrying{" "}
            <Tex>{"x"}</Tex> reproduce <Tex>{"-4y_p"}</Tex> and cancel, leaving{" "}
            <Tex>{"y_p'' + 4y_p = -4A\\sin 2x + 4B\\cos 2x"}</Tex>. Matching{" "}
            <Tex>{"\\cos 2x"}</Tex>: <Tex>{"A = 0"}</Tex>, <Tex>{"B = \\tfrac14"}</Tex>.
          </>
        ),
      },
      {
        title: "Verify by substitution",
        content: (
          <>
            <Tex>{"y_p = \\tfrac{x}{4}\\sin 2x:\\ y_p' = \\tfrac14 \\sin 2x + \\tfrac{x}{2}\\cos 2x"}</Tex>
            , <Tex>{"y_p'' = \\cos 2x - x\\sin 2x"}</Tex>, hence{" "}
            <Tex>{"y_p'' + 4y_p = \\cos 2x - x\\sin 2x + x\\sin 2x = \\cos 2x"}</Tex> ✓.
          </>
        ),
      },
      {
        title: "Interpret",
        content: (
          <>
            The response oscillates at the natural frequency with amplitude{" "}
            <Tex>{"x/4"}</Tex> growing linearly and a 90° phase lag (cosine in, sine out). An undamped
            structure forced at <Tex>{"\\omega_0"}</Tex> accumulates energy every cycle without
            bound.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"y(x) = c_1 \\cos 2x + c_2 \\sin 2x + \\dfrac{x}{4}\\sin 2x"}</Tex>
      </>
    ),
    tips: (
      <>
        The <Tex>{"x\\,(\\dots)"}</Tex> factor is where the marks live: examiners specifically check
        that you (i) noticed <Tex>{"\\pm 2i"}</Tex> are characteristic roots, (ii) kept{" "}
        <em>both</em> <Tex>{"A"}</Tex> and <Tex>{"B"}</Tex> in the ansatz even though the answer turns
        out pure sine, and (iii) did not "simplify" the growing amplitude away — linear growth{" "}
        <em>is</em> the answer's message.
      </>
    ),
  },
];
