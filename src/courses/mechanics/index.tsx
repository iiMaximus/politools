import type { Course } from "../../types";
import { Tex } from "../../lib/math";
import { MassSpringSim } from "./sims/MassSpringSim";

/* ====================== Three-regime summary table ================= */
function RegimeTable() {
  const rows = [
    ["Under-damped", "ζ < 1", "Decaying oscillation", "wd = wn√(1−ζ²)"],
    ["Critically damped", "ζ = 1", "Fastest no-overshoot return", "c = 2√(km)"],
    ["Over-damped", "ζ > 1", "Slow sluggish return", "two real roots"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Regime</th>
            <th className="border-b border-[var(--color-line)] p-2">Condition</th>
            <th className="border-b border-[var(--color-line)] p-2">Behaviour</th>
            <th className="border-b border-[var(--color-line)] p-2">Key relation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="border-b border-[var(--color-line)] p-2 font-semibold text-[var(--color-ink)]">{r[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r[2]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mechanics: Course = {
  meta: {
    id: "mechanics",
    title: "Applied Mechanics & Vibrations",
    short: "Mechanics",
    tagline: "How machines move and shake — from Newton-Euler to resonance.",
    description:
      "Model real mechanical systems: free-body diagrams, the equation of motion, and the vibration of a 1-DOF mass-spring-damper through under-, critical- and over-damping to resonance.",
    accent: "#46c98b",
    accent2: "#5fe0a8",
    icon: "Activity",
    year: 3,
    semester: 1,
    credits: 9,
    examDate: "2026-07-15",
    syllabus: [
      "Free-body diagrams",
      "Newton-Euler",
      "1-DOF vibration",
      "Damping ratio",
      "Forced response",
      "Resonance",
    ],
    status: "sample",
  },

  lessons: [
    {
      id: "free-vibration",
      title: "Free vibration of a 1-DOF system",
      summary:
        "Derive the equation of motion of a mass-spring-damper and read its behaviour from two numbers: ωₙ and ζ.",
      minutes: 20,
      objectives: [
        "Derive m x'' + c x' + k x = 0 from a free-body diagram",
        "Compute the natural frequency ωₙ and the damping ratio ζ",
        "Classify a system as under-, critically- or over-damped",
        "Use the damped frequency ω_d and the logarithmic decrement δ",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <p>
              Nearly every machine that moves also <strong>vibrates</strong>: a rotor on its
              bearings, a vehicle suspension, a measuring instrument settling after a tap. The
              simplest model that captures the essential physics is a single mass on a spring with a
              dashpot — the <strong>1-DOF (one degree-of-freedom) mass-spring-damper</strong>.
              Master this one system and you can read the behaviour of a surprising fraction of real
              structures.
            </p>
          ),
        },
        {
          kind: "definition",
          term: "Degree of freedom (DOF)",
          content: (
            <>
              the number of independent coordinates needed to fully specify the configuration of a
              system. Here a single coordinate <Tex>{"x(t)"}</Tex> — the displacement of the mass
              from its static equilibrium — describes everything.
            </>
          ),
        },
        { kind: "heading", text: "From free-body diagram to the equation of motion" },
        {
          kind: "prose",
          content: (
            <p>
              Isolate the mass <Tex>{"m"}</Tex> and draw the forces acting along the motion axis.
              Measuring <Tex>{"x"}</Tex> from the <em>static equilibrium</em> position cancels the
              weight against the initial spring stretch, so only two restoring effects remain: the
              spring force <Tex>{"-k x"}</Tex> (proportional to displacement) and the viscous damping
              force <Tex>{"-c\\dot{x}"}</Tex> (proportional to velocity).
            </p>
          ),
        },
        {
          kind: "prose",
          content: (
            <p>
              Newton's second law <Tex>{"\\sum F = m\\ddot{x}"}</Tex> gives{" "}
              <Tex>{"-k x - c\\dot{x} = m\\ddot{x}"}</Tex>. Moving everything to one side yields the
              governing equation of free vibration.
            </p>
          ),
        },
        {
          kind: "formula",
          tex: "m\\ddot{x} + c\\dot{x} + k x = 0",
          tag: "2.1",
          caption: (
            <>
              The free (un-forced) equation of motion of a 1-DOF system. <Tex>{"m"}</Tex> = mass,{" "}
              <Tex>{"c"}</Tex> = viscous damping, <Tex>{"k"}</Tex> = stiffness.
            </>
          ),
        },
        {
          kind: "callout",
          tone: "key",
          title: "Two numbers tell the whole story",
          content: (
            <>
              Divide (2.1) by <Tex>{"m"}</Tex> and it becomes{" "}
              <Tex>{"\\ddot{x} + 2\\zeta\\omega_n\\dot{x} + \\omega_n^2 x = 0"}</Tex>. Every 1-DOF
              free vibration is fixed by just the <strong>natural frequency</strong>{" "}
              <Tex>{"\\omega_n"}</Tex> and the <strong>damping ratio</strong> <Tex>{"\\zeta"}</Tex>.
            </>
          ),
        },
        {
          kind: "formula",
          tex: "\\omega_n = \\sqrt{\\frac{k}{m}}, \\qquad \\zeta = \\frac{c}{2\\sqrt{k m}} = \\frac{c}{c_{\\text{cr}}}",
          tag: "2.2",
          caption: (
            <>
              Natural angular frequency and (dimensionless) damping ratio. The critical damping is{" "}
              <Tex>{"c_{\\text{cr}} = 2\\sqrt{km} = 2m\\omega_n"}</Tex>.
            </>
          ),
        },
        { kind: "heading", text: "The three damping regimes" },
        {
          kind: "prose",
          content: (
            <p>
              Substituting the trial solution <Tex>{"x = e^{s t}"}</Tex> gives the characteristic
              equation <Tex>{"s^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0"}</Tex>, whose roots are{" "}
              <Tex>{"s = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2 - 1}"}</Tex>. The sign of{" "}
              <Tex>{"\\zeta^2 - 1"}</Tex> — i.e. whether <Tex>{"\\zeta"}</Tex> is below, equal to, or
              above 1 — decides the character of the motion.
            </p>
          ),
        },
        {
          kind: "formula",
          tex: "\\omega_d = \\omega_n\\sqrt{1 - \\zeta^2} \\quad (\\zeta < 1)",
          tag: "2.3",
          caption: (
            <>
              The <strong>damped natural frequency</strong>: the actual rate of oscillation, always{" "}
              <em>lower</em> than <Tex>{"\\omega_n"}</Tex>.
            </>
          ),
        },
        {
          kind: "callout",
          tone: "info",
          title: "Reading the regimes",
          content: (
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Under-damped</strong> (<Tex>{"\\zeta < 1"}</Tex>): complex roots → decaying
                oscillation at <Tex>{"\\omega_d"}</Tex>.
              </li>
              <li>
                <strong>Critically damped</strong> (<Tex>{"\\zeta = 1"}</Tex>): repeated real root →
                fastest return to rest with <em>no</em> overshoot.
              </li>
              <li>
                <strong>Over-damped</strong> (<Tex>{"\\zeta > 1"}</Tex>): two real roots → slow,
                sluggish, non-oscillatory return.
              </li>
            </ul>
          ),
        },
        {
          kind: "prose",
          content: (
            <p>
              Play with the model below. Watch the response curve and the animated bob change
              qualitatively as you drag the damping <Tex>{"c"}</Tex> through the critical value{" "}
              <Tex>{"c_{\\text{cr}} = 2\\sqrt{km}"}</Tex>. Doubling the mass lowers{" "}
              <Tex>{"\\omega_n"}</Tex> by <Tex>{"\\sqrt{2}"}</Tex>; doubling the stiffness raises it by
              the same factor.
            </p>
          ),
        },
        {
          kind: "sim",
          title: "Mass-spring-damper free response",
          render: () => <MassSpringSim />,
          caption: (
            <>
              The dashed lines are the decay envelope <Tex>{"\\pm A\\,e^{-\\zeta\\omega_n t}"}</Tex>{" "}
              (under-damped only). Notice the oscillation vanishes the instant <Tex>{"\\zeta"}</Tex>{" "}
              reaches 1.
            </>
          ),
        },
        {
          kind: "figure",
          render: () => <RegimeTable />,
          caption: "The three regimes at a glance — classify first, then pick the right formula.",
        },
        { kind: "heading", text: "Logarithmic decrement" },
        {
          kind: "prose",
          content: (
            <p>
              For an under-damped system you can extract <Tex>{"\\zeta"}</Tex> straight from a
              measured response. The ratio of two successive peaks (one period apart) is constant; its
              natural logarithm is the <strong>logarithmic decrement</strong> <Tex>{"\\delta"}</Tex>.
            </p>
          ),
        },
        {
          kind: "formula",
          tex: "\\delta = \\ln\\frac{x_i}{x_{i+1}} = \\frac{2\\pi\\zeta}{\\sqrt{1-\\zeta^2}} \\;\\Rightarrow\\; \\zeta = \\frac{\\delta}{\\sqrt{4\\pi^2 + \\delta^2}}",
          tag: "2.4",
          caption: "Identify the damping ratio experimentally from two consecutive peaks.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Light-damping shortcut",
          content: (
            <>
              When <Tex>{"\\zeta \\ll 1"}</Tex> the square root is ≈ 1, so{" "}
              <Tex>{"\\delta \\approx 2\\pi\\zeta"}</Tex> and <Tex>{"\\zeta \\approx \\delta / 2\\pi"}</Tex>.
              For sharper accuracy use <Tex>{"n"}</Tex> cycles apart:{" "}
              <Tex>{"\\delta = \\tfrac{1}{n}\\ln(x_0/x_n)"}</Tex>.
            </>
          ),
        },
        {
          kind: "steps",
          title: "A method that never fails",
          steps: [
            { label: "Draw the FBD", content: <>Isolate the mass; identify spring <Tex>{"-kx"}</Tex> and damper <Tex>{"-c\\dot{x}"}</Tex> forces.</> },
            { label: "Write the EOM", content: <>Apply <Tex>{"\\sum F = m\\ddot{x}"}</Tex> to get <Tex>{"m\\ddot{x}+c\\dot{x}+kx=0"}</Tex>.</> },
            { label: "Compute ωₙ and ζ", content: <>Use <Tex>{"\\omega_n=\\sqrt{k/m}"}</Tex> and <Tex>{"\\zeta = c/(2\\sqrt{km})"}</Tex>.</> },
            { label: "Classify", content: <>Compare <Tex>{"\\zeta"}</Tex> with 1 to pick the regime.</> },
            { label: "Get ω_d / δ", content: <>If <Tex>{"\\zeta<1"}</Tex>, find <Tex>{"\\omega_d=\\omega_n\\sqrt{1-\\zeta^2}"}</Tex> and, if asked, <Tex>{"\\delta"}</Tex>.</> },
          ],
        },
        {
          kind: "example",
          title: "Worked example — classify and characterize",
          content: (
            <>
              <p>
                A machine part is modelled as <Tex>{"m = 2\\,\\text{kg}"}</Tex>,{" "}
                <Tex>{"k = 50\\,\\text{N/m}"}</Tex>, <Tex>{"c = 6\\,\\text{N·s/m}"}</Tex>. Find{" "}
                <Tex>{"\\omega_n"}</Tex>, <Tex>{"\\zeta"}</Tex>, the regime and <Tex>{"\\omega_d"}</Tex>.
              </p>
              <p>
                Natural frequency:{" "}
                <Tex>{"\\omega_n = \\sqrt{k/m} = \\sqrt{50/2} = 5\\,\\text{rad/s}"}</Tex>.
              </p>
              <p>
                Damping ratio:{" "}
                <Tex>{"\\zeta = \\dfrac{c}{2\\sqrt{km}} = \\dfrac{6}{2\\sqrt{50\\cdot 2}} = \\dfrac{6}{20} = 0.30"}</Tex>{" "}
                — since <Tex>{"\\zeta < 1"}</Tex> the system is <strong>under-damped</strong>.
              </p>
              <p>
                Damped frequency:{" "}
                <Tex>{"\\omega_d = \\omega_n\\sqrt{1-\\zeta^2} = 5\\sqrt{1-0.09} \\approx 4.77\\,\\text{rad/s}"}</Tex>.
              </p>
              <p>
                It oscillates with a period <Tex>{"T_d = 2\\pi/\\omega_d \\approx 1.32\\,\\text{s}"}</Tex>,
                the amplitude decaying as <Tex>{"e^{-\\zeta\\omega_n t} = e^{-1.5\\,t}"}</Tex>.
              </p>
            </>
          ),
        },
        {
          kind: "checkpoint",
          question: {
            id: "mech-cp-1",
            difficulty: "medium",
            prompt: <>If you double the mass of an under-damped 1-DOF system (keeping k and c fixed), what happens to ζ?</>,
            options: [
              { id: "A", content: "It doubles." },
              { id: "B", content: "It is divided by √2." },
              { id: "C", content: "It stays the same." },
              { id: "D", content: "It is divided by 2." },
            ],
            correct: "B",
            explanation: (
              <>
                <Tex>{"\\zeta = c/(2\\sqrt{km})"}</Tex>. Doubling <Tex>{"m"}</Tex> multiplies the
                denominator by <Tex>{"\\sqrt{2}"}</Tex>, so <Tex>{"\\zeta"}</Tex> is divided by{" "}
                <Tex>{"\\sqrt{2}"}</Tex> (the system becomes <em>less</em> damped). It does not simply
                halve (that would need <Tex>{"\\zeta \\propto 1/m"}</Tex>), nor is it unchanged.
              </>
            ),
            theory: <><Tex>{"\\zeta \\propto 1/\\sqrt{m}"}</Tex> and <Tex>{"\\propto 1/\\sqrt{k}"}</Tex> at fixed c.</>,
          },
        },
        {
          kind: "callout",
          tone: "trap",
          title: "Common slips",
          content: (
            <ul className="ml-4 list-disc space-y-1">
              <li>Confusing <Tex>{"\\omega_d"}</Tex> with <Tex>{"\\omega_n"}</Tex>: oscillation happens at <Tex>{"\\omega_d < \\omega_n"}</Tex>, never at <Tex>{"\\omega_n"}</Tex> unless <Tex>{"\\zeta = 0"}</Tex>.</li>
              <li>Using <Tex>{"\\omega_d"}</Tex> when <Tex>{"\\zeta \\ge 1"}</Tex> — there is no oscillation, so <Tex>{"\\omega_d"}</Tex> is undefined.</li>
              <li>Forgetting the factor 2: <Tex>{"c_{\\text{cr}} = 2\\sqrt{km}"}</Tex>, not <Tex>{"\\sqrt{km}"}</Tex>.</li>
            </ul>
          ),
        },
        {
          kind: "prose",
          content: (
            <p>
              With the free response in hand, the next step is to push the system with a harmonic
              force — that opens the door to the <strong>frequency response</strong> and the spike at{" "}
              <strong>resonance</strong>, where a lightly-damped system amplifies excitation near{" "}
              <Tex>{"\\omega_n"}</Tex>.
            </p>
          ),
        },
      ],
    },
  ],

  practice: [
    {
      id: "me-q1",
      topic: "Natural frequency",
      difficulty: "easy",
      prompt: <>The natural angular frequency of an undamped 1-DOF mass-spring system is:</>,
      options: [
        { id: "A", content: <Tex>{"\\omega_n = k/m"}</Tex> },
        { id: "B", content: <Tex>{"\\omega_n = \\sqrt{k/m}"}</Tex> },
        { id: "C", content: <Tex>{"\\omega_n = \\sqrt{m/k}"}</Tex> },
        { id: "D", content: <Tex>{"\\omega_n = m/k"}</Tex> },
      ],
      correct: "B",
      explanation: (
        <>
          From <Tex>{"\\ddot{x} + (k/m)x = 0"}</Tex> the coefficient of <Tex>{"x"}</Tex> is{" "}
          <Tex>{"\\omega_n^2 = k/m"}</Tex>, so <Tex>{"\\omega_n = \\sqrt{k/m}"}</Tex>.{" "}
          <Tex>{"\\sqrt{m/k}"}</Tex> is the period factor, and <Tex>{"k/m"}</Tex> has the wrong units.
        </>
      ),
      theory: <>Stiffer springs raise frequency; heavier masses lower it.</>,
    },
    {
      id: "me-q2",
      topic: "Damping ratio",
      difficulty: "easy",
      prompt: <>The damping ratio ζ is defined as:</>,
      options: [
        { id: "A", content: <Tex>{"\\zeta = \\dfrac{c}{2\\sqrt{km}}"}</Tex> },
        { id: "B", content: <Tex>{"\\zeta = \\dfrac{c}{\\sqrt{km}}"}</Tex> },
        { id: "C", content: <Tex>{"\\zeta = 2c\\sqrt{km}"}</Tex> },
        { id: "D", content: <Tex>{"\\zeta = \\dfrac{2\\sqrt{km}}{c}"}</Tex> },
      ],
      correct: "A",
      explanation: (
        <>
          <Tex>{"\\zeta = c/c_{\\text{cr}}"}</Tex> with critical damping{" "}
          <Tex>{"c_{\\text{cr}} = 2\\sqrt{km}"}</Tex>, giving <Tex>{"\\zeta = c/(2\\sqrt{km})"}</Tex>.
          Option D is its reciprocal; B drops the factor 2.
        </>
      ),
      theory: <>ζ is dimensionless and equals the fraction of critical damping.</>,
    },
    {
      id: "me-q3",
      topic: "Regimes",
      difficulty: "easy",
      prompt: <>A system with ζ = 1 is:</>,
      options: [
        { id: "A", content: "Under-damped (oscillates)" },
        { id: "B", content: "Over-damped" },
        { id: "C", content: "Critically damped" },
        { id: "D", content: "Undamped" },
      ],
      correct: "C",
      explanation: (
        <>
          <Tex>{"\\zeta = 1"}</Tex> is exactly the boundary: the characteristic equation has a
          repeated real root, giving the fastest return to rest <em>without</em> overshoot — the
          definition of critically damped. Undamped is <Tex>{"\\zeta = 0"}</Tex>.
        </>
      ),
      theory: <>ζ&lt;1 oscillates, ζ=1 critical, ζ&gt;1 over-damped.</>,
    },
    {
      id: "me-q4",
      topic: "Damped frequency",
      difficulty: "medium",
      prompt: <>How does the damped natural frequency ω_d compare with ωₙ for ζ = 0.6?</>,
      options: [
        { id: "A", content: <><Tex>{"\\omega_d > \\omega_n"}</Tex></> },
        { id: "B", content: <><Tex>{"\\omega_d = \\omega_n"}</Tex></> },
        { id: "C", content: <><Tex>{"\\omega_d = 0.8\\,\\omega_n"}</Tex></> },
        { id: "D", content: <><Tex>{"\\omega_d = 0.6\\,\\omega_n"}</Tex></> },
      ],
      correct: "C",
      explanation: (
        <>
          <Tex>{"\\omega_d = \\omega_n\\sqrt{1-\\zeta^2} = \\omega_n\\sqrt{1-0.36} = 0.8\\,\\omega_n"}</Tex>.
          It is always <em>smaller</em> than <Tex>{"\\omega_n"}</Tex> (so A, B are wrong), and the
          factor is <Tex>{"\\sqrt{1-\\zeta^2}"}</Tex>, not <Tex>{"\\zeta"}</Tex> itself (so D is wrong).
        </>
      ),
      theory: <>Damping slows the oscillation: <Tex>{"\\omega_d = \\omega_n\\sqrt{1-\\zeta^2}"}</Tex>.</>,
    },
    {
      id: "me-q5",
      topic: "Critical damping",
      difficulty: "medium",
      prompt: <>For m = 4 kg and k = 100 N/m, the critical damping coefficient c_cr is:</>,
      options: [
        { id: "A", content: "20 N·s/m" },
        { id: "B", content: "40 N·s/m" },
        { id: "C", content: "10 N·s/m" },
        { id: "D", content: "400 N·s/m" },
      ],
      correct: "B",
      explanation: (
        <>
          <Tex>{"c_{\\text{cr}} = 2\\sqrt{km} = 2\\sqrt{100\\cdot 4} = 2\\cdot 20 = 40\\,\\text{N·s/m}"}</Tex>.
          Option A forgets the factor 2; D squares instead of taking the root.
        </>
      ),
      theory: <><Tex>{"c_{\\text{cr}} = 2\\sqrt{km} = 2m\\omega_n"}</Tex>.</>,
    },
    {
      id: "me-q6",
      topic: "Log decrement",
      difficulty: "medium",
      prompt: <>The logarithmic decrement δ is related to the damping ratio (light damping) by:</>,
      options: [
        { id: "A", content: <Tex>{"\\delta \\approx \\zeta/2\\pi"}</Tex> },
        { id: "B", content: <Tex>{"\\delta \\approx 2\\pi\\zeta"}</Tex> },
        { id: "C", content: <Tex>{"\\delta \\approx \\pi\\zeta^2"}</Tex> },
        { id: "D", content: <Tex>{"\\delta \\approx \\zeta^2"}</Tex> },
      ],
      correct: "B",
      explanation: (
        <>
          Exactly <Tex>{"\\delta = 2\\pi\\zeta/\\sqrt{1-\\zeta^2}"}</Tex>; for{" "}
          <Tex>{"\\zeta \\ll 1"}</Tex> the root ≈ 1, so <Tex>{"\\delta \\approx 2\\pi\\zeta"}</Tex>.
          Option A is the inverted relation.
        </>
      ),
      theory: <>Measure peak ratio → <Tex>{"\\delta = \\ln(x_i/x_{i+1})"}</Tex> → ζ.</>,
    },
    {
      id: "me-q7",
      topic: "Effect of stiffness",
      difficulty: "medium",
      prompt: <>If the stiffness k is doubled (m fixed), the natural frequency ωₙ:</>,
      options: [
        { id: "A", content: "Doubles" },
        { id: "B", content: "Halves" },
        { id: "C", content: <>Increases by a factor <Tex>{"\\sqrt{2}"}</Tex></> },
        { id: "D", content: "Is unchanged" },
      ],
      correct: "C",
      explanation: (
        <>
          <Tex>{"\\omega_n = \\sqrt{k/m}"}</Tex>, so <Tex>{"\\omega_n \\propto \\sqrt{k}"}</Tex>.
          Doubling <Tex>{"k"}</Tex> multiplies <Tex>{"\\omega_n"}</Tex> by{" "}
          <Tex>{"\\sqrt{2} \\approx 1.41"}</Tex>, not 2. (To double <Tex>{"\\omega_n"}</Tex> you would
          need to quadruple <Tex>{"k"}</Tex>.)
        </>
      ),
      theory: <><Tex>{"\\omega_n \\propto \\sqrt{k}"}</Tex>, <Tex>{"\\propto 1/\\sqrt{m}"}</Tex>.</>,
    },
    {
      id: "me-q8",
      topic: "Equation of motion",
      difficulty: "easy",
      prompt: <>The free equation of motion of a 1-DOF mass-spring-damper is:</>,
      options: [
        { id: "A", content: <Tex>{"m\\ddot{x} - c\\dot{x} + kx = 0"}</Tex> },
        { id: "B", content: <Tex>{"m\\ddot{x} + c\\dot{x} + kx = 0"}</Tex> },
        { id: "C", content: <Tex>{"m\\dot{x} + c x + k = 0"}</Tex> },
        { id: "D", content: <Tex>{"m\\ddot{x} + kx = c"}</Tex> },
      ],
      correct: "B",
      explanation: (
        <>
          Newton's law with restoring spring <Tex>{"-kx"}</Tex> and viscous damping{" "}
          <Tex>{"-c\\dot{x}"}</Tex> gives <Tex>{"m\\ddot{x} = -c\\dot{x} - kx"}</Tex>, i.e.{" "}
          <Tex>{"m\\ddot{x}+c\\dot{x}+kx=0"}</Tex>. Damping <em>opposes</em> velocity, so its sign is
          positive on the left (A has it wrong); C drops an order of derivative.
        </>
      ),
      theory: <>Free = right-hand side zero; forced = harmonic forcing on the right.</>,
    },
  ],

  exam: [
    {
      id: "me-e1",
      title: "Characterize a 1-DOF system",
      meta: "Free vibration · ~10 pts · Summer session style",
      difficulty: "medium",
      topic: "Damping regimes",
      statement: (
        <>
          A 1-DOF system has <Tex>{"m = 3\\,\\text{kg}"}</Tex>, <Tex>{"k = 300\\,\\text{N/m}"}</Tex>{" "}
          and <Tex>{"c = 12\\,\\text{N·s/m}"}</Tex>. Find <Tex>{"\\omega_n"}</Tex>,{" "}
          <Tex>{"\\zeta"}</Tex> and <Tex>{"\\omega_d"}</Tex>, and classify the system.
        </>
      ),
      given: <><Tex>{"m=3,\\ k=300,\\ c=12"}</Tex></>,
      steps: [
        {
          title: "Natural frequency",
          content: <><Tex>{"\\omega_n = \\sqrt{k/m} = \\sqrt{300/3} = \\sqrt{100} = 10\\,\\text{rad/s}"}</Tex>.</>,
        },
        {
          title: "Damping ratio",
          content: (
            <>
              <Tex>{"c_{\\text{cr}} = 2\\sqrt{km} = 2\\sqrt{300\\cdot 3} = 2\\cdot 30 = 60\\,\\text{N·s/m}"}</Tex>,
              so <Tex>{"\\zeta = c/c_{\\text{cr}} = 12/60 = 0.20"}</Tex>. Since{" "}
              <Tex>{"\\zeta<1"}</Tex>, the system is <strong>under-damped</strong>.
            </>
          ),
        },
        {
          title: "Damped frequency",
          content: <><Tex>{"\\omega_d = \\omega_n\\sqrt{1-\\zeta^2} = 10\\sqrt{1-0.04} \\approx 9.80\\,\\text{rad/s}"}</Tex>.</>,
        },
      ],
      finalAnswer: (
        <>
          <Tex>{"\\omega_n = 10\\,\\text{rad/s}, \\ \\zeta = 0.20, \\ \\omega_d \\approx 9.80\\,\\text{rad/s}"}</Tex>{" "}
          — under-damped.
        </>
      ),
      tips: <>Compute <Tex>{"c_{\\text{cr}}"}</Tex> first; then ζ is just <Tex>{"c/c_{\\text{cr}}"}</Tex>, which avoids the factor-2 slip.</>,
    },
    {
      id: "me-e2",
      title: "Damping for critical behaviour",
      meta: "Free vibration · ~8 pts",
      difficulty: "easy",
      topic: "Critical damping",
      statement: (
        <>
          For a suspension modelled as <Tex>{"m = 250\\,\\text{kg}"}</Tex> and{" "}
          <Tex>{"k = 40\\,000\\,\\text{N/m}"}</Tex>, find the damping coefficient <Tex>{"c"}</Tex>{" "}
          that makes the system critically damped, and the corresponding <Tex>{"\\omega_n"}</Tex>.
        </>
      ),
      given: <><Tex>{"m=250\\,\\text{kg},\\ k=40000\\,\\text{N/m},\\ \\zeta=1"}</Tex></>,
      steps: [
        {
          title: "Natural frequency",
          content: <><Tex>{"\\omega_n = \\sqrt{k/m} = \\sqrt{40000/250} = \\sqrt{160} \\approx 12.65\\,\\text{rad/s}"}</Tex>.</>,
        },
        {
          title: "Critical damping condition",
          content: <>Critical means <Tex>{"\\zeta = 1"}</Tex>, i.e. <Tex>{"c = c_{\\text{cr}} = 2\\sqrt{km} = 2m\\omega_n"}</Tex>.</>,
        },
        {
          title: "Evaluate",
          content: <><Tex>{"c = 2\\sqrt{40000\\cdot 250} = 2\\sqrt{10^7} \\approx 2\\cdot 3162 = 6325\\,\\text{N·s/m}"}</Tex>.</>,
        },
      ],
      finalAnswer: <><Tex>{"c \\approx 6.32\\times 10^{3}\\,\\text{N·s/m}"}</Tex>, with <Tex>{"\\omega_n \\approx 12.65\\,\\text{rad/s}"}</Tex>.</>,
      tips: <>A real car uses <Tex>{"\\zeta \\approx 0.2\\text{–}0.4"}</Tex> (under-damped) for comfort; pure critical damping feels harsh.</>,
    },
    {
      id: "me-e3",
      title: "Damping ratio from two peaks",
      meta: "Free vibration · ~12 pts",
      difficulty: "hard",
      topic: "Logarithmic decrement",
      statement: (
        <>
          A measured free response shows two successive peaks of{" "}
          <Tex>{"x_1 = 8.0\\,\\text{mm}"}</Tex> and <Tex>{"x_2 = 5.0\\,\\text{mm}"}</Tex>, one period
          apart at <Tex>{"T_d = 0.50\\,\\text{s}"}</Tex>. Find the logarithmic decrement{" "}
          <Tex>{"\\delta"}</Tex>, the damping ratio <Tex>{"\\zeta"}</Tex> and the natural frequency{" "}
          <Tex>{"\\omega_n"}</Tex>.
        </>
      ),
      given: <><Tex>{"x_1=8.0,\\ x_2=5.0\\,\\text{mm},\\ T_d=0.50\\,\\text{s}"}</Tex></>,
      steps: [
        {
          title: "Logarithmic decrement",
          content: <><Tex>{"\\delta = \\ln(x_1/x_2) = \\ln(8.0/5.0) = \\ln 1.6 \\approx 0.470"}</Tex>.</>,
        },
        {
          title: "Damping ratio",
          content: (
            <>
              <Tex>{"\\zeta = \\dfrac{\\delta}{\\sqrt{4\\pi^2 + \\delta^2}} = \\dfrac{0.470}{\\sqrt{39.48 + 0.221}} \\approx \\dfrac{0.470}{6.30} \\approx 0.0746"}</Tex>.
            </>
          ),
        },
        {
          title: "Natural frequency",
          content: (
            <>
              <Tex>{"\\omega_d = 2\\pi/T_d = 2\\pi/0.50 \\approx 12.57\\,\\text{rad/s}"}</Tex>, then{" "}
              <Tex>{"\\omega_n = \\omega_d/\\sqrt{1-\\zeta^2} = 12.57/\\sqrt{1-0.00557} \\approx 12.60\\,\\text{rad/s}"}</Tex>.
            </>
          ),
        },
      ],
      finalAnswer: <><Tex>{"\\delta \\approx 0.47,\\ \\zeta \\approx 0.075,\\ \\omega_n \\approx 12.6\\,\\text{rad/s}"}</Tex>.</>,
      tips: <>With such light damping the shortcut <Tex>{"\\zeta \\approx \\delta/2\\pi = 0.0748"}</Tex> matches the exact value, and <Tex>{"\\omega_n \\approx \\omega_d"}</Tex>.</>,
    },
  ],
};

export default mechanics;
