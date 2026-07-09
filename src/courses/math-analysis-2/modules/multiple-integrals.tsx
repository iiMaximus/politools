import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { RegionSlicerSim } from "../sims/RegionSlicerSim";

export const MODULE = "Double & triple integrals";

/* ============ Figure: the polar area element ΔA ≈ r·Δr·Δθ =========== */
function PolarCellFigure() {
  const cx = 42;
  const cy = 222;
  const r1 = 118;
  const r2 = 172;
  const t1 = (26 * Math.PI) / 180;
  const t2 = (52 * Math.PI) / 180;
  const P = (r: number, t: number): [number, number] => [cx + r * Math.cos(t), cy - r * Math.sin(t)];
  const arc = (r: number, from: number, to: number) => {
    const pts: string[] = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = from + ((to - from) * i) / n;
      const [x, y] = P(r, t);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts;
  };
  const cell = [...arc(r1, t1, t2), ...arc(r2, t2, t1)].join(" ");
  const mid = (t1 + t2) / 2;
  const [ray1x, ray1y] = P(r2 + 26, t1);
  const [ray2x, ray2y] = P(r2 + 26, t2);
  const [drx, dry] = P((r1 + r2) / 2, t1);
  const [arcx, arcy] = P(r1 - 16, mid);
  const [thx, thy] = P(48, mid);
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 360 240" className="w-full max-w-md">
        {/* x-axis */}
        <line x1={cx - 30} y1={cy} x2={352} y2={cy} stroke="var(--color-line)" strokeWidth={1} />
        {/* the two rays bounding the cell */}
        <line x1={cx} y1={cy} x2={ray1x} y2={ray1y} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={cx} y1={cy} x2={ray2x} y2={ray2y} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" />
        {/* small angle arc near the origin */}
        <polyline points={arc(34, t1, t2).join(" ")} fill="none" stroke="var(--color-muted)" strokeWidth={1} />
        {/* the polar cell */}
        <polygon
          points={cell}
          fill="var(--accent)"
          fillOpacity={0.25}
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* labels */}
        <text x={thx + 8} y={thy} fontSize={11} fill="var(--color-muted)">Δθ</text>
        <text x={drx + 10} y={dry + 4} fontSize={11} fill="var(--color-muted)">Δr</text>
        <text x={arcx} y={arcy + 4} textAnchor="middle" fontSize={11} fill="var(--color-muted)">r·Δθ</text>
        <text x={cx - 8} y={cy + 14} fontSize={10} fill="var(--color-faint)">O</text>
      </svg>
    </div>
  );
}

/* ============ Table: the three 3-D coordinate systems ============== */
function CoordTable() {
  const rows = [
    ["Cartesian (x, y, z)", "dx dy dz", "boxes, planes, tetrahedra"],
    ["Cylindrical (r, θ, z) — x = r·cos θ, y = r·sin θ", "r dz dr dθ", "symmetry about the z-axis: cylinders, cones, paraboloids"],
    ["Spherical (ρ, φ, θ) — z = ρ·cos φ", "ρ² sin φ dρ dφ dθ", "symmetry about a point: spheres, balls, cones from the origin"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">System</th>
            <th className="border-b border-[var(--color-line)] p-2">Volume element dV</th>
            <th className="border-b border-[var(--color-line)] p-2">Reach for it when</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs text-[var(--color-ink)]">{r[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs font-semibold">{r[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============ Figure: centroid of the triangle (0,0)(2,0)(2,2) ===== */
function TriangleCentroidFigure() {
  const X = (x: number) => (x + 0.4) * 100;
  const Y = (y: number) => (2.4 - y) * 100;
  const gx = 4 / 3;
  const gy = 2 / 3;
  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 320 280" className="w-full max-w-sm">
        {/* axes */}
        <line x1={0} y1={Y(0)} x2={320} y2={Y(0)} stroke="var(--color-line)" strokeWidth={1.5} />
        <line x1={X(0)} y1={0} x2={X(0)} y2={280} stroke="var(--color-line)" strokeWidth={1.5} />
        {/* the plate */}
        <polygon
          points={`${X(0)},${Y(0)} ${X(2)},${Y(0)} ${X(2)},${Y(2)}`}
          fill="var(--accent)"
          fillOpacity={0.18}
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* medians (they all pass through the centroid) */}
        <line x1={X(0)} y1={Y(0)} x2={X(2)} y2={Y(1)} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={X(2)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={X(2)} y1={Y(2)} x2={X(1)} y2={Y(0)} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" />
        {/* centroid */}
        <circle cx={X(gx)} cy={Y(gy)} r={5} fill="var(--accent-2)" stroke="var(--color-bg)" strokeWidth={1.5} />
        <text x={X(gx) + 9} y={Y(gy) - 8} fontSize={12} fontWeight={700} fill="var(--color-ink)">
          (4/3, 2/3)
        </text>
        {/* vertices */}
        <text x={X(0) - 6} y={Y(0) + 16} textAnchor="end" fontSize={11} fill="var(--color-muted)">(0,0)</text>
        <text x={X(2) + 4} y={Y(0) + 16} fontSize={11} fill="var(--color-muted)">(2,0)</text>
        <text x={X(2) + 6} y={Y(2) + 4} fontSize={11} fill="var(--color-muted)">(2,2)</text>
      </svg>
    </div>
  );
}

export const lessons: Lesson[] = [
  /* ============================================================== *
   * LESSON 1 — Double integrals, Fubini, normal regions, swapping
   * ============================================================== */
  {
    id: "double-integrals-fubini",
    title: "Double integrals, Fubini & swapping the order",
    lecture: MODULE,
    summary:
      "A double integral is a signed volume, computed one strip at a time — and the exam's favorite move is making you re-slice the region the other way.",
    minutes: 25,
    objectives: [
      "Interpret ∫∫ f dA as a signed volume and compute it on rectangles with Fubini",
      "Recognize normal (simple) regions and read integration limits off a sketch",
      "Write both iterated orders for the same region",
      "Swap the order of integration to unlock otherwise impossible integrals",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            In one variable, <Tex>{"\\int_a^b f\\,dx"}</Tex> is a signed <em>area</em>: slice the interval
            into tiny pieces, multiply each width by a height, add up. In two variables we do exactly the
            same over a plane region <Tex>{"D"}</Tex>: chop <Tex>{"D"}</Tex> into tiny cells of area{" "}
            <Tex>{"\\Delta A"}</Tex>, multiply each by the height of the surface{" "}
            <Tex>{"z = f(x,y)"}</Tex> above it, and add. The result is a signed <em>volume</em>. The whole
            chapter is then one engineering problem: how to organize that sum into two ordinary integrals
            you can actually compute.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Double integral",
        content: (
          <>
            For <Tex>{"f"}</Tex> defined on a bounded region <Tex>{"D\\subset\\mathbb{R}^2"}</Tex>,
            partition <Tex>{"D"}</Tex> into small cells, pick a sample point in each, and form the Riemann
            sum of <Tex>{"f(\\text{sample})\\cdot\\Delta A"}</Tex>. If the sums converge to one number as
            the cells shrink (guaranteed for continuous <Tex>{"f"}</Tex> on a reasonable region), that
            number is <Tex>{"\\iint_D f(x,y)\\,dA"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_D f(x,y)\\,dA \\;=\\; \\lim_{\\text{cells}\\to 0}\\ \\sum_{i,j} f(x_i^*,\\,y_j^*)\\,\\Delta A_{ij}",
        tag: "4.1",
        caption: (
          <>
            Volume of a column = height <Tex>{"f"}</Tex> × base area <Tex>{"\\Delta A"}</Tex>; the
            integral adds them all.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Signed volume — and two integrals you get for free",
        content: (
          <>
            Where <Tex>{"f"}</Tex> is positive the integral counts volume above the xy-plane as positive;
            where <Tex>{"f"}</Tex> is negative it counts as negative — exactly like signed area in 1D. Two
            instant consequences: <Tex>{"\\iint_D 1\\,dA = \\text{Area}(D)"}</Tex>, and if{" "}
            <Tex>{"f\\ge 0"}</Tex>, <Tex>{"\\iint_D f\\,dA"}</Tex> is the volume of the solid under the
            surface <Tex>{"z=f(x,y)"}</Tex> over <Tex>{"D"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Fubini on rectangles" },
      {
        kind: "prose",
        content: (
          <p>
            On a rectangle <Tex>{"[a,b]\\times[c,d]"}</Tex>, Fubini's theorem turns the double integral
            into an <strong>iterated</strong> one: integrate in one variable while treating the other as a
            frozen constant, then integrate the result. Both orders work and give the same number.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_{[a,b]\\times[c,d]} f\\,dA \\;=\\; \\int_a^b\\!\\!\\left(\\int_c^d f(x,y)\\,dy\\right)\\!dx \\;=\\; \\int_c^d\\!\\!\\left(\\int_a^b f(x,y)\\,dx\\right)\\!dy",
        tag: "4.2",
        caption: <>Fubini on a rectangle (f continuous): compute inside-out, either order.</>,
      },
      {
        kind: "example",
        title: "Worked example — a rectangle, both orders",
        content: (
          <>
            <p>
              Compute <Tex>{"\\iint_R (x+y)\\,dA"}</Tex> on <Tex>{"R=[0,1]\\times[0,2]"}</Tex>.
            </p>
            <p>
              <strong>dy first:</strong>{" "}
              <Tex>{"\\int_0^1\\!\\int_0^2 (x+y)\\,dy\\,dx = \\int_0^1\\Big[xy+\\tfrac{y^2}{2}\\Big]_0^2 dx = \\int_0^1 (2x+2)\\,dx = 1+2 = 3"}</Tex>.
            </p>
            <p>
              <strong>dx first:</strong>{" "}
              <Tex>{"\\int_0^2\\!\\int_0^1 (x+y)\\,dx\\,dy = \\int_0^2\\Big[\\tfrac{x^2}{2}+xy\\Big]_0^1 dy = \\int_0^2\\big(\\tfrac12+y\\big)dy = 1+2 = 3"}</Tex>.
            </p>
            <p>Same answer, as Fubini promises. On rectangles the order is pure convenience.</p>
          </>
        ),
      },
      { kind: "heading", text: "Normal (simple) regions" },
      {
        kind: "definition",
        term: "Normal region",
        content: (
          <>
            <Tex>{"D"}</Tex> is <strong>normal with respect to the x-axis</strong> (also called{" "}
            <em>y-simple</em>, or type I) if every vertical line meets it in one segment:{" "}
            <Tex>{"D=\\{a\\le x\\le b,\\ g_1(x)\\le y\\le g_2(x)\\}"}</Tex>. It is{" "}
            <strong>normal with respect to the y-axis</strong> (<em>x-simple</em>, type II) if every
            horizontal line does: <Tex>{"D=\\{c\\le y\\le d,\\ h_1(y)\\le x\\le h_2(y)\\}"}</Tex>. Many
            regions are both — then you may choose the order.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_D f\\,dA \\;=\\; \\int_a^b\\!\\!\\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx \\qquad\\text{for } D=\\{a\\le x\\le b,\\ g_1(x)\\le y\\le g_2(x)\\}",
        tag: "4.3",
        caption: <>Vertical strips: the inner y-limits are the curves; the outer x-limits are numbers.</>,
      },
      {
        kind: "callout",
        tone: "info",
        title: "The naming varies — the picture never does",
        content: (
          <>
            Different books say type I / type II, x-simple / y-simple, or “normal with respect to an
            axis”. Ignore the label and remember the geometry: <strong>vertical strip ⇒ integrate dy
            first</strong>, <strong>horizontal strip ⇒ integrate dx first</strong>. Two hard rules: the{" "}
            <em>inner</em> limits may depend on the outer variable; the <em>outer</em> limits must be
            plain numbers. An outer limit containing <Tex>{"x"}</Tex> or <Tex>{"y"}</Tex> is always wrong.
          </>
        ),
      },
      {
        kind: "steps",
        title: "Reading the limits off a sketch",
        steps: [
          {
            label: "Sketch the region",
            content: (
              <>
                Draw every boundary curve and find the intersection points (solve the curves pairwise). No
                sketch, no marks — this is where setups die.
              </>
            ),
          },
          {
            label: "Choose the strip direction",
            content: (
              <>
                Vertical strip = dy first, horizontal = dx first. Pick the direction in which the strip
                enters through <em>one</em> curve and exits through <em>one</em> curve; otherwise you must
                split the region.
              </>
            ),
          },
          {
            label: "Slide the strip for the inner limits",
            content: (
              <>
                The curve where the strip enters is the inner lower limit, where it exits is the inner
                upper limit — written as functions of the outer variable.
              </>
            ),
          },
          {
            label: "Extreme positions for the outer limits",
            content: (
              <>
                The first and last positions of the strip give the outer limits — constants. Sanity-check:
                outer limits contain no variables.
              </>
            ),
          },
        ],
      },
      {
        kind: "sim",
        title: "Region slicer — same region, two iterated integrals",
        render: () => <RegionSlicerSim />,
        caption: (
          <>
            Slide the slice and toggle the order. The entry (orange) and exit (green) curves are the
            inner limits; the slice's first and last positions are the outer limits. Note how{" "}
            <Tex>{"y=x^2"}</Tex> must be rewritten as <Tex>{"x=\\sqrt{y}"}</Tex> when the strip turns
            horizontal.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — both orders on a curved region",
        content: (
          <>
            <p>
              Let <Tex>{"D"}</Tex> be the region between <Tex>{"y=x^2"}</Tex> and <Tex>{"y=2x"}</Tex>{" "}
              (they intersect at <Tex>{"x=0"}</Tex> and <Tex>{"x=2"}</Tex>). Compute{" "}
              <Tex>{"\\iint_D x\\,dA"}</Tex>.
            </p>
            <p>
              <strong>Vertical strips</strong> (<Tex>{"x^2\\le y\\le 2x"}</Tex>,{" "}
              <Tex>{"0\\le x\\le 2"}</Tex>):{" "}
              <Tex>{"\\int_0^2 x\\,(2x-x^2)\\,dx = \\int_0^2 (2x^2 - x^3)\\,dx = \\tfrac{16}{3}-4 = \\tfrac43"}</Tex>.
            </p>
            <p>
              <strong>Horizontal strips</strong> (<Tex>{"\\tfrac{y}{2}\\le x\\le\\sqrt{y}"}</Tex>,{" "}
              <Tex>{"0\\le y\\le 4"}</Tex>):{" "}
              <Tex>{"\\int_0^4\\Big[\\tfrac{x^2}{2}\\Big]_{y/2}^{\\sqrt{y}} dy = \\int_0^4\\Big(\\tfrac{y}{2}-\\tfrac{y^2}{8}\\Big)dy = 4-\\tfrac{8}{3} = \\tfrac43"}</Tex>.
            </p>
            <p>
              Both orders give <Tex>{"\\tfrac43"}</Tex> — but notice how every limit changed. Swapping is
              a <em>re-description of the region</em>, never a shuffle of symbols.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Swapping the order of integration" },
      {
        kind: "prose",
        content: (
          <p>
            Why would you ever swap? Two reasons. Sometimes one direction needs the region split in two
            while the other doesn't. And sometimes — the classic exam setup — the inner antiderivative{" "}
            <em>does not exist in elementary terms</em> in the given order, but the swapped order makes it
            trivial. Integrands like <Tex>{"e^{x^2}"}</Tex>, <Tex>{"e^{-y^2}"}</Tex>,{" "}
            <Tex>{"\\sin(y^2)"}</Tex> or <Tex>{"\\tfrac{\\sin x}{x}"}</Tex> are the tell: you{" "}
            <strong>must</strong> swap.
          </p>
        ),
      },
      {
        kind: "steps",
        title: "The sketch-first swap method",
        steps: [
          {
            label: "Turn the limits into inequalities",
            content: (
              <>
                From <Tex>{"\\int_0^1\\!\\int_x^1 (\\cdot)\\,dy\\,dx"}</Tex> read:{" "}
                <Tex>{"0\\le x\\le 1"}</Tex> and <Tex>{"x\\le y\\le 1"}</Tex>.
              </>
            ),
          },
          {
            label: "Sketch the region they describe",
            content: (
              <>
                Here: the triangle <Tex>{"0\\le x\\le y\\le 1"}</Tex>, above the line{" "}
                <Tex>{"y=x"}</Tex>, below <Tex>{"y=1"}</Tex>.
              </>
            ),
          },
          {
            label: "Re-slice the other way",
            content: (
              <>
                Horizontal strips: for each <Tex>{"y\\in[0,1]"}</Tex>, <Tex>{"x"}</Tex> runs from{" "}
                <Tex>{"0"}</Tex> to <Tex>{"y"}</Tex>.
              </>
            ),
          },
          {
            label: "Rewrite and evaluate",
            content: (
              <>
                New integral: <Tex>{"\\int_0^1\\!\\int_0^y (\\cdot)\\,dx\\,dy"}</Tex>. Only now touch the
                integrand.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — the impossible order",
        content: (
          <>
            <p>
              Evaluate <Tex>{"I=\\int_0^1\\!\\int_x^1 e^{y^2}\\,dy\\,dx"}</Tex>. The inner integral{" "}
              <Tex>{"\\int e^{y^2}dy"}</Tex> has <strong>no elementary antiderivative</strong> — as
              written, the problem is stuck.
            </p>
            <p>
              The region is <Tex>{"0\\le x\\le y\\le 1"}</Tex>. Swapping to horizontal strips:{" "}
              <Tex>{"I=\\int_0^1\\!\\int_0^y e^{y^2}\\,dx\\,dy"}</Tex>. The inner integrand is constant in{" "}
              <Tex>{"x"}</Tex>, so it just picks up the strip length <Tex>{"y"}</Tex>:
            </p>
            <p>
              <Tex>{"I=\\int_0^1 y\\,e^{y^2}\\,dy = \\Big[\\tfrac12 e^{y^2}\\Big]_0^1 = \\tfrac{e-1}{2}"}</Tex>.
            </p>
            <p>
              The factor <Tex>{"y"}</Tex> produced by the swap is exactly what the substitution{" "}
              <Tex>{"u=y^2"}</Tex> needs. That is not luck — it is how these exam problems are built.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "You cannot swap by shuffling symbols",
        content: (
          <>
            Writing <Tex>{"\\int_0^1\\!\\int_x^1 dy\\,dx = \\int_x^1\\!\\int_0^1 dx\\,dy"}</Tex> is
            instantly wrong: the outer limits now contain <Tex>{"x"}</Tex>, which is meaningless. The only
            legal route is limits → inequalities → sketch → re-slice. Examiners specifically choose
            regions where the blind swap gives a different (wrong) region.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp1",
          difficulty: "medium",
          prompt: (
            <>
              Swap the order of integration in{" "}
              <Tex>{"\\int_0^2\\!\\int_0^x f(x,y)\\,dy\\,dx"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"\\int_0^2\\!\\int_0^y f\\,dx\\,dy"}</Tex> },
            { id: "B", content: <Tex>{"\\int_0^x\\!\\int_0^2 f\\,dx\\,dy"}</Tex> },
            { id: "C", content: <Tex>{"\\int_0^2\\!\\int_y^2 f\\,dx\\,dy"}</Tex> },
            { id: "D", content: <Tex>{"\\int_0^2\\!\\int_2^y f\\,dx\\,dy"}</Tex> },
          ],
          correct: "C",
          explanation: (
            <>
              The region is <Tex>{"0\\le y\\le x\\le 2"}</Tex> — the triangle below <Tex>{"y=x"}</Tex>. A
              horizontal strip at height <Tex>{"y"}</Tex> runs from the line <Tex>{"x=y"}</Tex> to{" "}
              <Tex>{"x=2"}</Tex>, and <Tex>{"y"}</Tex> spans <Tex>{"[0,2]"}</Tex> — that is C. A is the
              blind symbol swap (it describes the <em>other</em> triangle); B has an outer limit
              containing <Tex>{"x"}</Tex>, which is meaningless; D has the inner limits reversed, which
              flips the sign.
            </>
          ),
          theory: <>Swap = inequalities → sketch → re-slice. Outer limits must be constants.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            You can now integrate over any region you can sketch — as long as its boundaries are graphs of
            functions. Next: regions made of circles and angles, where Cartesian strips become ugly and{" "}
            <strong>polar coordinates</strong> take over.
          </p>
        ),
      },
    ],
  },

  /* ============================================================== *
   * LESSON 2 — Polar coordinates
   * ============================================================== */
  {
    id: "double-integrals-polar",
    title: "Double integrals in polar coordinates",
    lecture: MODULE,
    summary:
      "Disks, annuli and anything with x²+y² in it beg for polar coordinates — just never forget the Jacobian r.",
    minutes: 20,
    objectives: [
      "Decide from the region and the integrand when polar coordinates pay off",
      "Explain geometrically where the Jacobian factor r comes from",
      "Convert and evaluate double integrals over disks, annuli and sectors",
      "Reproduce the Gaussian trick: ∫∫ e^(−x²−y²) dA = π",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Integrate over the quarter disk <Tex>{"x^2+y^2\\le 4"}</Tex>, <Tex>{"x,y\\ge0"}</Tex> with
            Cartesian strips and you get limits like <Tex>{"0\\le y\\le\\sqrt{4-x^2}"}</Tex> — square
            roots that poison every later step. The same region in polar coordinates is a plain
            rectangle: <Tex>{"0\\le r\\le 2"}</Tex>, <Tex>{"0\\le\\theta\\le\\tfrac{\\pi}{2}"}</Tex>.
            Whenever the <em>region</em> is built from circles and rays, or the <em>integrand</em>{" "}
            contains <Tex>{"x^2+y^2"}</Tex>, switch coordinates.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Polar coordinates",
        content: (
          <>
            <Tex>{"x=r\\cos\\theta,\\quad y=r\\sin\\theta"}</Tex> with <Tex>{"r\\ge 0"}</Tex> the distance
            from the origin and <Tex>{"\\theta"}</Tex> the angle from the positive x-axis. Key identity:{" "}
            <Tex>{"x^2+y^2=r^2"}</Tex> (note: <Tex>{"r^2"}</Tex>, not <Tex>{"r"}</Tex>).
          </>
        ),
      },
      { kind: "heading", text: "Where the extra r comes from" },
      {
        kind: "figure",
        render: () => <PolarCellFigure />,
        caption: (
          <>
            A “polar rectangle” with sides <Tex>{"\\Delta r"}</Tex> (radial) and{" "}
            <Tex>{"r\\,\\Delta\\theta"}</Tex> (an arc). Its area is{" "}
            <Tex>{"\\Delta A \\approx r\\,\\Delta r\\,\\Delta\\theta"}</Tex> — cells far from the origin
            are genuinely bigger.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Cut the plane along circles and rays. A cell between radii <Tex>{"r"}</Tex> and{" "}
            <Tex>{"r+\\Delta r"}</Tex>, angles <Tex>{"\\theta"}</Tex> and{" "}
            <Tex>{"\\theta+\\Delta\\theta"}</Tex>, is nearly a rectangle with sides{" "}
            <Tex>{"\\Delta r"}</Tex> and <Tex>{"r\\Delta\\theta"}</Tex> (arc length = radius × angle). So{" "}
            <Tex>{"\\Delta A\\approx r\\,\\Delta r\\,\\Delta\\theta"}</Tex>: the same{" "}
            <Tex>{"\\Delta\\theta"}</Tex> sweeps a bigger patch at larger radius. The factor{" "}
            <Tex>{"r"}</Tex> is the <strong>Jacobian</strong> of the change of variables — the local area
            magnification.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_D f(x,y)\\,dA \\;=\\; \\int_{\\alpha}^{\\beta}\\!\\!\\int_{r_1(\\theta)}^{r_2(\\theta)} f(r\\cos\\theta,\\ r\\sin\\theta)\\;r\\,dr\\,d\\theta",
        tag: "5.1",
        caption: <>Substitute, then multiply by the Jacobian: <Tex>{"dA = r\\,dr\\,d\\theta"}</Tex>.</>,
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The forgotten r — the single most common lost mark",
        content: (
          <>
            Writing <Tex>{"dA = dr\\,d\\theta"}</Tex> silently replaces every cell by a unit-magnification
            one and ruins the value (the disk of radius <Tex>{"R"}</Tex> would get “area”{" "}
            <Tex>{"2\\pi R"}</Tex> instead of <Tex>{"\\pi R^2"}</Tex>). Second favorite:{" "}
            <Tex>{"\\sqrt{x^2+y^2} = r"}</Tex> but <Tex>{"x^2+y^2=r^2"}</Tex> — don't mix them up.
          </>
        ),
      },
      {
        kind: "example",
        title: "Warm-up — area of an annulus",
        content: (
          <>
            <p>
              Area of <Tex>{"D=\\{1\\le x^2+y^2\\le 4\\}"}</Tex>: in polar it is the rectangle{" "}
              <Tex>{"1\\le r\\le 2"}</Tex>, <Tex>{"0\\le\\theta\\le 2\\pi"}</Tex>.
            </p>
            <p>
              <Tex>{"\\text{Area}=\\int_0^{2\\pi}\\!\\!\\int_1^2 r\\,dr\\,d\\theta = 2\\pi\\Big[\\tfrac{r^2}{2}\\Big]_1^2 = 2\\pi\\cdot\\tfrac32 = 3\\pi"}</Tex>,
            </p>
            <p>
              matching <Tex>{"\\pi\\cdot 2^2-\\pi\\cdot 1^2=3\\pi"}</Tex>. Constant limits in both
              variables — this is why annuli and disks are polar territory.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "The Gaussian integral — polar's party trick" },
      {
        kind: "prose",
        content: (
          <p>
            The function <Tex>{"e^{-x^2}"}</Tex> has no elementary antiderivative, so{" "}
            <Tex>{"\\int_{-\\infty}^{\\infty}e^{-x^2}dx"}</Tex> looks hopeless in 1D. The famous trick:
            square it, turn the product into a double integral over the whole plane, and go polar — the
            Jacobian <Tex>{"r"}</Tex> is precisely the factor that makes the substitution{" "}
            <Tex>{"u=r^2"}</Tex> work.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — ∫∫ e^(−x²−y²) dA over the plane",
        content: (
          <>
            <p>
              <Tex>{"\\iint_{\\mathbb{R}^2} e^{-x^2-y^2}\\,dA = \\int_0^{2\\pi}\\!\\!\\int_0^{\\infty} e^{-r^2}\\,r\\,dr\\,d\\theta"}</Tex>.
            </p>
            <p>
              Inner integral with <Tex>{"u=r^2,\\ du=2r\\,dr"}</Tex>:{" "}
              <Tex>{"\\int_0^{\\infty} e^{-r^2} r\\,dr = \\Big[-\\tfrac12 e^{-r^2}\\Big]_0^{\\infty} = \\tfrac12"}</Tex>.
            </p>
            <p>
              So the double integral equals <Tex>{"2\\pi\\cdot\\tfrac12 = \\pi"}</Tex>. And since it also
              factors as{" "}
              <Tex>{"\\big(\\int_{-\\infty}^{\\infty}e^{-x^2}dx\\big)\\big(\\int_{-\\infty}^{\\infty}e^{-y^2}dy\\big) = I^2"}</Tex>,
              we get <Tex>{"I=\\sqrt{\\pi}"}</Tex> — the Gaussian integral, cornerstone of probability.
            </p>
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_{\\mathbb{R}^2} e^{-x^2-y^2}\\,dA = \\pi \\qquad\\Longrightarrow\\qquad \\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}",
        tag: "5.2",
        caption: (
          <>
            Impossible in 1D, two lines in polar. Know this derivation cold — it is a favorite oral-exam
            question.
          </>
        ),
      },
      { kind: "heading", text: "When r depends on θ" },
      {
        kind: "prose",
        content: (
          <p>
            Not every circle is centered at the origin. Take <Tex>{"x^2+y^2=2x"}</Tex>: substitute{" "}
            <Tex>{"x^2+y^2=r^2"}</Tex> and <Tex>{"x=r\\cos\\theta"}</Tex> to get{" "}
            <Tex>{"r^2=2r\\cos\\theta"}</Tex>, i.e. <Tex>{"r=2\\cos\\theta"}</Tex> for{" "}
            <Tex>{"\\theta\\in[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</Tex> (this is the circle of radius 1
            centered at <Tex>{"(1,0)"}</Tex>). A ray from the origin now exits the region at a{" "}
            <Tex>{"\\theta"}</Tex>-dependent radius: the inner <Tex>{"r"}</Tex>-limits become functions of{" "}
            <Tex>{"\\theta"}</Tex>, exactly like the curved inner limits of Lesson 1.
          </p>
        ),
      },
      {
        kind: "steps",
        title: "Polar setup method",
        steps: [
          {
            label: "Spot the polar signal",
            content: (
              <>
                Circles, annuli, sectors in the region — or <Tex>{"x^2+y^2"}</Tex> in the integrand.
                Either one is enough.
              </>
            ),
          },
          {
            label: "Find the θ-window",
            content: (
              <>
                Which angles does the region span? Full disk: <Tex>{"[0,2\\pi]"}</Tex>; first quadrant:{" "}
                <Tex>{"[0,\\tfrac{\\pi}{2}]"}</Tex>; circle <Tex>{"r=2\\cos\\theta"}</Tex>:{" "}
                <Tex>{"[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</Tex>.
              </>
            ),
          },
          {
            label: "Shoot a ray for the r-limits",
            content: (
              <>
                For each <Tex>{"\\theta"}</Tex>, the ray enters the region at{" "}
                <Tex>{"r_1(\\theta)"}</Tex> and exits at <Tex>{"r_2(\\theta)"}</Tex> — the polar analogue
                of the sliding strip.
              </>
            ),
          },
          {
            label: "Substitute and add the Jacobian",
            content: (
              <>
                Replace <Tex>{"x,y"}</Tex> by <Tex>{"r\\cos\\theta,\\ r\\sin\\theta"}</Tex> and write{" "}
                <Tex>{"dA=r\\,dr\\,d\\theta"}</Tex>. Then integrate inside-out.
              </>
            ),
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Separate whenever the limits are constants",
        content: (
          <>
            Over a disk, annulus or sector the limits are constants, so{" "}
            <Tex>{"\\iint g(r)\\,h(\\theta)\\,r\\,dr\\,d\\theta"}</Tex> splits into{" "}
            <Tex>{"\\big(\\int g(r)\\,r\\,dr\\big)\\big(\\int h(\\theta)\\,d\\theta\\big)"}</Tex> — two
            independent 1-D integrals. Massive time-saver on the exam.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp2",
          difficulty: "medium",
          prompt: (
            <>
              Evaluate <Tex>{"\\iint_D \\sqrt{x^2+y^2}\\,dA"}</Tex> where{" "}
              <Tex>{"D=\\{x^2+y^2\\le 9\\}"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"18\\pi"}</Tex> },
            { id: "B", content: <Tex>{"9\\pi"}</Tex> },
            { id: "C", content: <Tex>{"54\\pi"}</Tex> },
            { id: "D", content: <Tex>{"\\tfrac{81\\pi}{2}"}</Tex> },
          ],
          correct: "A",
          explanation: (
            <>
              <Tex>{"\\sqrt{x^2+y^2}=r"}</Tex>, so the integral is{" "}
              <Tex>{"\\int_0^{2\\pi}\\!\\int_0^3 r\\cdot r\\,dr\\,d\\theta = 2\\pi\\big[\\tfrac{r^3}{3}\\big]_0^3 = 2\\pi\\cdot 9 = 18\\pi"}</Tex>{" "}
              — answer A. B (<Tex>{"9\\pi"}</Tex>) is what you get if you forget the Jacobian and
              integrate <Tex>{"r\\,dr\\,d\\theta"}</Tex> only; C (<Tex>{"54\\pi"}</Tex>) forgets the{" "}
              <Tex>{"\\tfrac13"}</Tex> when integrating <Tex>{"r^2"}</Tex>; D uses{" "}
              <Tex>{"r^2"}</Tex> as the integrand, i.e. confuses <Tex>{"\\sqrt{x^2+y^2}"}</Tex> with{" "}
              <Tex>{"x^2+y^2"}</Tex>.
            </>
          ),
          theory: <>Convert the integrand AND add the Jacobian: integrand × r, then integrate inside-out.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            Polar coordinates are the 2-D warm-up for what comes next: in three dimensions the same idea
            splits into <strong>cylindrical</strong> coordinates (polar + z) and{" "}
            <strong>spherical</strong> coordinates — each with its own Jacobian.
          </p>
        ),
      },
    ],
  },

  /* ============================================================== *
   * LESSON 3 — Triple integrals, cylindrical & spherical
   * ============================================================== */
  {
    id: "triple-integrals",
    title: "Triple integrals: cylindrical & spherical coordinates",
    lecture: MODULE,
    summary:
      "Set up triple integrals by columns or slices, then let the solid's symmetry pick the coordinate system — and its Jacobian.",
    minutes: 25,
    objectives: [
      "Set up iterated triple integrals by columns (dz first) and by slices (dz last)",
      "Choose Cartesian, cylindrical or spherical coordinates from the solid's symmetry",
      "Use the Jacobians r (cylindrical) and ρ² sin φ (spherical) correctly",
      "Compute volumes of cones, spheres and paraboloid caps",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A triple integral <Tex>{"\\iiint_E f\\,dV"}</Tex> adds the values of <Tex>{"f"}</Tex> over
            tiny boxes filling a solid <Tex>{"E"}</Tex>. With <Tex>{"f=1"}</Tex> it measures{" "}
            <strong>volume</strong>; with <Tex>{"f=\\delta"}</Tex> (a density) it measures{" "}
            <strong>mass</strong>. Nothing conceptually new — the work is all in describing the solid, and
            the payoff of a good description is enormous.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Triple integral",
        content: (
          <>
            Partition the solid <Tex>{"E\\subset\\mathbb{R}^3"}</Tex> into cells of volume{" "}
            <Tex>{"\\Delta V"}</Tex>, sum <Tex>{"f(\\text{sample})\\,\\Delta V"}</Tex>, and take the
            limit: <Tex>{"\\iiint_E f(x,y,z)\\,dV"}</Tex>. Fubini again reduces it to three nested 1-D
            integrals, in any order that describes <Tex>{"E"}</Tex> correctly.
          </>
        ),
      },
      { kind: "heading", text: "Columns vs slices" },
      {
        kind: "formula",
        tex: "\\iiint_E f\\,dV \\;=\\; \\iint_D\\!\\left(\\int_{z_1(x,y)}^{z_2(x,y)} f\\,dz\\right)dA",
        tag: "6.1",
        caption: (
          <>
            <strong>Columns</strong> (dz first): <Tex>{"D"}</Tex> is the <em>shadow</em> of{" "}
            <Tex>{"E"}</Tex> on the xy-plane; each column runs from the bottom surface{" "}
            <Tex>{"z_1"}</Tex> to the top surface <Tex>{"z_2"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "V \\;=\\; \\int_{z_{\\min}}^{z_{\\max}} A(z)\\,dz",
        tag: "6.2",
        caption: (
          <>
            <strong>Slices</strong> (dz last): if every horizontal cross-section has a known area{" "}
            <Tex>{"A(z)"}</Tex>, stack the slices. Best when cross-sections are disks or other standard
            shapes.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the sphere, by slices",
        content: (
          <>
            <p>
              The ball <Tex>{"x^2+y^2+z^2\\le R^2"}</Tex> cut at height <Tex>{"z"}</Tex> gives the disk{" "}
              <Tex>{"x^2+y^2\\le R^2-z^2"}</Tex>, of area <Tex>{"A(z)=\\pi(R^2-z^2)"}</Tex>. Stack:
            </p>
            <p>
              <Tex>{"V=\\int_{-R}^{R}\\pi(R^2-z^2)\\,dz = \\pi\\Big[R^2z-\\tfrac{z^3}{3}\\Big]_{-R}^{R} = \\pi\\Big(\\tfrac{2R^3}{3}+\\tfrac{2R^3}{3}\\Big)=\\tfrac43\\pi R^3"}</Tex>.
            </p>
            <p>The school formula, derived in two lines — because the cross-sections were disks.</p>
          </>
        ),
      },
      { kind: "heading", text: "Cylindrical coordinates" },
      {
        kind: "prose",
        content: (
          <p>
            <strong>Cylindrical</strong> coordinates are polar coordinates in the xy-plane with{" "}
            <Tex>{"z"}</Tex> kept as is: <Tex>{"x=r\\cos\\theta"}</Tex>, <Tex>{"y=r\\sin\\theta"}</Tex>,{" "}
            <Tex>{"z=z"}</Tex>. The volume cell is the polar cell times a height <Tex>{"dz"}</Tex>, so
            the Jacobian is the same <Tex>{"r"}</Tex> as in 2D. Use them whenever the solid is symmetric
            about the z-axis: cylinders, cones, paraboloids.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "dV = r\\,dz\\,dr\\,d\\theta",
        tag: "6.3",
        caption: <>Cylindrical volume element — polar's <Tex>{"r"}</Tex> survives unchanged.</>,
      },
      {
        kind: "example",
        title: "Worked example — paraboloid cap",
        content: (
          <>
            <p>
              Volume of the solid under <Tex>{"z=4-x^2-y^2"}</Tex> and above <Tex>{"z=0"}</Tex>. The
              surface meets the plane where <Tex>{"x^2+y^2=4"}</Tex>, so the shadow is the disk{" "}
              <Tex>{"r\\le 2"}</Tex> and the paraboloid reads <Tex>{"z=4-r^2"}</Tex>:
            </p>
            <p>
              <Tex>{"V=\\int_0^{2\\pi}\\!\\!\\int_0^2 (4-r^2)\\,r\\,dr\\,d\\theta = 2\\pi\\Big[2r^2-\\tfrac{r^4}{4}\\Big]_0^2 = 2\\pi(8-4) = 8\\pi"}</Tex>.
            </p>
            <p>
              Column height <Tex>{"(z_{\\text{top}}-z_{\\text{bottom}})"}</Tex> over a polar shadow — the
              standard pattern for every “under the surface” volume.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the cone formula",
        content: (
          <>
            <p>
              A cone of base radius <Tex>{"R"}</Tex> and height <Tex>{"h"}</Tex> (apex up) has top surface{" "}
              <Tex>{"z=h\\big(1-\\tfrac{r}{R}\\big)"}</Tex> over the disk <Tex>{"r\\le R"}</Tex>:
            </p>
            <p>
              <Tex>{"V=\\int_0^{2\\pi}\\!\\!\\int_0^R h\\Big(1-\\tfrac{r}{R}\\Big)r\\,dr\\,d\\theta = 2\\pi h\\Big[\\tfrac{r^2}{2}-\\tfrac{r^3}{3R}\\Big]_0^R = 2\\pi h\\cdot\\tfrac{R^2}{6} = \\tfrac13\\pi R^2 h"}</Tex>.
            </p>
            <p>Another school formula that is just a two-line cylindrical integral.</p>
          </>
        ),
      },
      { kind: "heading", text: "Spherical coordinates" },
      {
        kind: "definition",
        term: "Spherical coordinates (ρ, φ, θ)",
        content: (
          <>
            <Tex>{"\\rho\\ge 0"}</Tex> is the distance from the origin,{" "}
            <Tex>{"\\varphi\\in[0,\\pi]"}</Tex> the angle measured <em>down from the positive z-axis</em>{" "}
            (colatitude), and <Tex>{"\\theta"}</Tex> the same horizontal angle as always:{" "}
            <Tex>{"x=\\rho\\sin\\varphi\\cos\\theta,\\ y=\\rho\\sin\\varphi\\sin\\theta,\\ z=\\rho\\cos\\varphi"}</Tex>.
            A sphere is <Tex>{"\\rho=\\text{const}"}</Tex>; a cone through the origin is{" "}
            <Tex>{"\\varphi=\\text{const}"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "dV = \\rho^2\\sin\\varphi\\;d\\rho\\,d\\varphi\\,d\\theta",
        tag: "6.4",
        caption: (
          <>
            The spherical cell is a near-box with sides <Tex>{"d\\rho"}</Tex>,{" "}
            <Tex>{"\\rho\\,d\\varphi"}</Tex> and <Tex>{"\\rho\\sin\\varphi\\,d\\theta"}</Tex> — multiply
            them to get the Jacobian.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Convention check",
        content: (
          <>
            Some textbooks swap the letters <Tex>{"\\varphi"}</Tex> and <Tex>{"\\theta"}</Tex>. What never
            changes: the angle from the z-axis lives in <Tex>{"[0,\\pi]"}</Tex>, the horizontal angle in{" "}
            <Tex>{"[0,2\\pi]"}</Tex>, and the <Tex>{"\\sin"}</Tex> in the Jacobian is of the{" "}
            <em>z-axis angle</em>. State your convention on the exam and stay consistent.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — volume of the ball, by spherical",
        content: (
          <>
            <p>
              The ball <Tex>{"\\rho\\le R"}</Tex> has constant limits in all three variables, so
              everything separates:
            </p>
            <p>
              <Tex>{"V=\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi}\\!\\!\\int_0^R \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta = 2\\pi\\cdot\\Big[-\\cos\\varphi\\Big]_0^{\\pi}\\cdot\\tfrac{R^3}{3} = 2\\pi\\cdot 2\\cdot\\tfrac{R^3}{3} = \\tfrac43\\pi R^3"}</Tex>.
            </p>
            <p>
              Note <Tex>{"\\int_0^{\\pi}\\sin\\varphi\\,d\\varphi = 2"}</Tex> — memorize this little
              value, it appears in nearly every spherical computation.
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <CoordTable />,
        caption:
          "The decision table: match the coordinate system to the solid's symmetry and pay the right Jacobian.",
      },
      {
        kind: "steps",
        title: "Choosing the coordinate system",
        steps: [
          {
            label: "Look at the boundary surfaces",
            content: (
              <>
                Planes and boxes ⇒ Cartesian. Cylinders <Tex>{"x^2+y^2=a^2"}</Tex>, cones{" "}
                <Tex>{"z=k\\sqrt{x^2+y^2}"}</Tex>, paraboloids ⇒ cylindrical. Spheres centered at the
                origin ⇒ spherical.
              </>
            ),
          },
          {
            label: "Rewrite each surface",
            content: (
              <>
                Cylindrical: sphere <Tex>{"z^2=R^2-r^2"}</Tex>, cone <Tex>{"z=kr"}</Tex>, paraboloid{" "}
                <Tex>{"z=a-r^2"}</Tex>. Spherical: sphere <Tex>{"\\rho=R"}</Tex>, cone{" "}
                <Tex>{"\\varphi=\\text{const}"}</Tex>.
              </>
            ),
          },
          {
            label: "Describe the solid by inequalities",
            content: (
              <>
                Inner limits may depend on the outer variables, outer limits are numbers — the same
                discipline as in 2D.
              </>
            ),
          },
          {
            label: "Add the Jacobian and integrate inside-out",
            content: (
              <>
                <Tex>{"r"}</Tex> for cylindrical, <Tex>{"\\rho^2\\sin\\varphi"}</Tex> for spherical. If
                all limits are constants, separate the three integrals.
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp3",
          difficulty: "medium",
          prompt: (
            <>
              The solid bounded below by the cone <Tex>{"z=\\sqrt{x^2+y^2}"}</Tex> and above by the plane{" "}
              <Tex>{"z=2"}</Tex> has volume:
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"4\\pi"}</Tex> },
            { id: "B", content: <Tex>{"\\tfrac{16\\pi}{3}"}</Tex> },
            { id: "C", content: <Tex>{"8\\pi"}</Tex> },
            { id: "D", content: <Tex>{"\\tfrac{8\\pi}{3}"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              In cylindrical: the cone is <Tex>{"z=r"}</Tex>, so the shadow is <Tex>{"r\\le 2"}</Tex> and
              columns run from <Tex>{"z=r"}</Tex> to <Tex>{"z=2"}</Tex>:{" "}
              <Tex>{"V=\\int_0^{2\\pi}\\!\\int_0^2 (2-r)\\,r\\,dr\\,d\\theta = 2\\pi\\big(4-\\tfrac83\\big) = \\tfrac{8\\pi}{3}"}</Tex>{" "}
              — answer D (it is a cone of radius 2 and height 2, and{" "}
              <Tex>{"\\tfrac13\\pi R^2 h = \\tfrac{8\\pi}{3}"}</Tex> checks). A (<Tex>{"4\\pi"}</Tex>)
              forgets the Jacobian <Tex>{"r"}</Tex>; B integrates <Tex>{"r\\cdot r"}</Tex>, i.e. swaps top
              and bottom and measures the region between the cone and the cylinder wall; C (
              <Tex>{"8\\pi"}</Tex>) is the full cylinder with the cone never subtracted.
            </>
          ),
          theory: <>Column height = top surface − bottom surface, times the Jacobian r, over the shadow.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Jacobian traps in 3D",
        content: (
          <>
            Writing <Tex>{"dV=\\rho^2\\,d\\rho\\,d\\varphi\\,d\\theta"}</Tex> (missing{" "}
            <Tex>{"\\sin\\varphi"}</Tex>), or <Tex>{"\\sin\\theta"}</Tex> instead of{" "}
            <Tex>{"\\sin\\varphi"}</Tex>, or letting <Tex>{"\\varphi"}</Tex> run to <Tex>{"2\\pi"}</Tex> —
            each silently destroys the computation. Remember: the upper half-space is{" "}
            <Tex>{"\\varphi\\in[0,\\tfrac{\\pi}{2}]"}</Tex>, all of space is{" "}
            <Tex>{"\\varphi\\in[0,\\pi]"}</Tex>, and only <Tex>{"\\theta"}</Tex> makes the full turn.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            You now own volumes. The last lesson of the module turns the same integrals into the physical
            quantities the exam asks about: <strong>mass, centroids and centers of mass</strong>.
          </p>
        ),
      },
    ],
  },

  /* ============================================================== *
   * LESSON 4 — Applications: area, volume, mass, centroid
   * ============================================================== */
  {
    id: "integral-applications",
    title: "Applications: area, volume, mass & centroids",
    lecture: MODULE,
    summary:
      "The same integral with a different integrand: 1 gives area or volume, δ gives mass, x·δ gives the moment that locates the center of mass.",
    minutes: 18,
    objectives: [
      "Compute areas and volumes as integrals of the constant 1",
      "Compute the mass of a plate or solid with variable density",
      "Locate centroids and centers of mass via moments",
      "Exploit symmetry to skip integrals entirely",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Every application in this module is the same machine with a different integrand. Integrate{" "}
            <Tex>{"1"}</Tex> and you measure the region itself (area in 2D, volume in 3D). Integrate a
            density <Tex>{"\\delta"}</Tex> and you get mass. Integrate <Tex>{"x\\,\\delta"}</Tex> and you
            get a <em>moment</em> — the mass-weighted position sum that locates the center of mass.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\text{Area}(D)=\\iint_D 1\\,dA,\\qquad V(E)=\\iiint_E 1\\,dV,\\qquad m=\\iint_D \\delta(x,y)\\,dA",
        tag: "7.1",
        caption: <>The dictionary: integrand 1 measures the region, integrand δ weighs it.</>,
      },
      {
        kind: "definition",
        term: "Center of mass / centroid",
        content: (
          <>
            For a plate <Tex>{"D"}</Tex> with density <Tex>{"\\delta(x,y)"}</Tex> and mass{" "}
            <Tex>{"m"}</Tex>: <Tex>{"\\bar x = \\tfrac{1}{m}\\iint_D x\\,\\delta\\,dA"}</Tex>,{" "}
            <Tex>{"\\bar y = \\tfrac{1}{m}\\iint_D y\\,\\delta\\,dA"}</Tex>. With constant density the{" "}
            <Tex>{"\\delta"}</Tex> cancels and the point <Tex>{"(\\bar x,\\bar y)"}</Tex> — now called the{" "}
            <strong>centroid</strong> — is purely geometric: moments divided by area.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\bar x = \\frac{1}{m}\\iint_D x\\,\\delta\\,dA,\\qquad \\bar y = \\frac{1}{m}\\iint_D y\\,\\delta\\,dA",
        tag: "7.2",
        caption: <>Moment over mass — each coordinate separately.</>,
      },
      {
        kind: "callout",
        tone: "key",
        title: "Symmetry first — integrate second",
        content: (
          <>
            If the region <em>and</em> the density are symmetric about a line, the center of mass lies on
            that line — no integral needed for that coordinate. The centroid of a disk, square or annulus
            is its center, instantly. Always harvest symmetry before computing; it can halve the exam
            problem.
          </>
        ),
      },
      { kind: "heading", text: "Worked example — centroid of a triangle" },
      {
        kind: "example",
        title: "Centroid of the triangle (0,0), (2,0), (2,2)",
        content: (
          <>
            <p>
              The triangle is <Tex>{"0\\le y\\le x,\\ 0\\le x\\le 2"}</Tex> (the sim's third preset), with
              area <Tex>{"A=\\tfrac12\\cdot 2\\cdot 2 = 2"}</Tex>. Uniform density, so centroid = moments
              / area.
            </p>
            <p>
              <Tex>{"\\bar x = \\tfrac12\\int_0^2\\!\\!\\int_0^x x\\,dy\\,dx = \\tfrac12\\int_0^2 x^2\\,dx = \\tfrac12\\cdot\\tfrac83 = \\tfrac43"}</Tex>
            </p>
            <p>
              <Tex>{"\\bar y = \\tfrac12\\int_0^2\\!\\!\\int_0^x y\\,dy\\,dx = \\tfrac12\\int_0^2 \\tfrac{x^2}{2}\\,dx = \\tfrac12\\cdot\\tfrac43 = \\tfrac23"}</Tex>
            </p>
            <p>
              Check: a triangle's centroid is the average of its vertices —{" "}
              <Tex>{"\\big(\\tfrac{0+2+2}{3},\\ \\tfrac{0+0+2}{3}\\big) = \\big(\\tfrac43,\\tfrac23\\big)"}</Tex>.
              It matches, and it sits on the medians as geometry demands.
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <TriangleCentroidFigure />,
        caption: (
          <>
            The centroid <Tex>{"(\\tfrac43,\\tfrac23)"}</Tex> is where the three medians meet — the
            integral and classical geometry agree.
          </>
        ),
      },
      { kind: "heading", text: "Variable density" },
      {
        kind: "example",
        title: "Mass of a quarter disk with density δ = x² + y²",
        content: (
          <>
            <p>
              Quarter disk <Tex>{"x^2+y^2\\le 4"}</Tex>, <Tex>{"x,y\\ge 0"}</Tex>, density growing with
              the distance squared. Polar is mandatory: <Tex>{"\\delta = r^2"}</Tex>, region{" "}
              <Tex>{"0\\le r\\le 2,\\ 0\\le\\theta\\le\\tfrac{\\pi}{2}"}</Tex>.
            </p>
            <p>
              <Tex>{"m=\\int_0^{\\pi/2}\\!\\!\\int_0^2 r^2\\cdot r\\,dr\\,d\\theta = \\tfrac{\\pi}{2}\\Big[\\tfrac{r^4}{4}\\Big]_0^2 = \\tfrac{\\pi}{2}\\cdot 4 = 2\\pi"}</Tex>.
            </p>
            <p>
              Because the plate is heavier far from the origin, its center of mass sits farther out than
              the geometric centroid — density drags mass toward where <Tex>{"\\delta"}</Tex> is large.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "The applications recipe",
        steps: [
          {
            label: "Identify the measure",
            content: (
              <>
                Area/volume ⇒ integrand 1. Mass ⇒ integrand <Tex>{"\\delta"}</Tex>. Center of mass ⇒
                moments <Tex>{"x\\delta,\\ y\\delta"}</Tex>.
              </>
            ),
          },
          {
            label: "Pick coordinates from the region",
            content: (
              <>
                Circular pieces ⇒ polar/cylindrical/spherical with the right Jacobian; straight-edged
                pieces ⇒ Cartesian.
              </>
            ),
          },
          {
            label: "Compute the total, then the moments",
            content: (
              <>
                First <Tex>{"m"}</Tex> (or area), then <Tex>{"\\iint x\\,\\delta\\,dA"}</Tex> and{" "}
                <Tex>{"\\iint y\\,\\delta\\,dA"}</Tex>; divide each by <Tex>{"m"}</Tex>.
              </>
            ),
          },
          {
            label: "Sanity-check the point",
            content: (
              <>
                The center of mass must lie inside the convex hull of the region, on any symmetry line,
                shifted toward the heavy side.
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp4",
          difficulty: "easy",
          prompt: (
            <>
              For a plate <Tex>{"D"}</Tex> with density <Tex>{"\\delta(x,y)"}</Tex> and mass{" "}
              <Tex>{"m"}</Tex>, the coordinate <Tex>{"\\bar x"}</Tex> of the center of mass is:
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"\\dfrac{1}{\\text{Area}(D)}\\displaystyle\\iint_D x\\,dA"}</Tex> },
            { id: "B", content: <Tex>{"\\dfrac{1}{m}\\displaystyle\\iint_D x\\,\\delta(x,y)\\,dA"}</Tex> },
            { id: "C", content: <Tex>{"\\dfrac{1}{m}\\displaystyle\\iint_D \\delta(x,y)\\,dA"}</Tex> },
            { id: "D", content: <Tex>{"\\displaystyle\\iint_D x\\,\\delta(x,y)\\,dA"}</Tex> },
          ],
          correct: "B",
          explanation: (
            <>
              The center of mass is the mass-weighted average of <Tex>{"x"}</Tex>: moment divided by mass
              — answer B. A is the <em>centroid</em>, correct only when <Tex>{"\\delta"}</Tex> is
              constant; C equals <Tex>{"m/m=1"}</Tex>, not a coordinate at all; D is the bare moment,
              which still has to be divided by <Tex>{"m"}</Tex>.
            </>
          ),
          theory: <>Center of mass = moment / mass; the centroid is the special case δ = const.</>,
        },
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Free answers worth memorizing",
        content: (
          <>
            Triangle: centroid = average of the three vertices. Quarter disk of radius{" "}
            <Tex>{"R"}</Tex>: centroid at <Tex>{"\\big(\\tfrac{4R}{3\\pi},\\tfrac{4R}{3\\pi}\\big)"}</Tex>{" "}
            (for the first-quadrant quarter). These make superb sanity checks — and occasionally the whole
            answer.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            That closes the integration module: you can describe a region, slice it in the smartest
            coordinates, and turn the integral into geometry or physics. Next these skills feed into{" "}
            <strong>line integrals and vector fields</strong>, where Green's theorem converts circulation
            into exactly the double integrals you now master.
          </p>
        ),
      },
    ],
  },
];

export const practice: Question[] = [
  {
    id: "ma2-int-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        If <Tex>{"f(x,y)\\ge 0"}</Tex> on <Tex>{"D"}</Tex>, then <Tex>{"\\iint_D f\\,dA"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <>The area of <Tex>{"D"}</Tex></> },
      { id: "B", content: <>The volume of the solid under the surface <Tex>{"z=f(x,y)"}</Tex> over <Tex>{"D"}</Tex></> },
      { id: "C", content: <>The surface area of the graph of <Tex>{"f"}</Tex></> },
      { id: "D", content: <>The average value of <Tex>{"f"}</Tex> on <Tex>{"D"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        Each Riemann term is height <Tex>{"f"}</Tex> × base area <Tex>{"\\Delta A"}</Tex> — a column
        volume; the sum converges to the volume under the graph, so B. A is the special case{" "}
        <Tex>{"f=1"}</Tex> only; C needs the very different integrand{" "}
        <Tex>{"\\sqrt{1+f_x^2+f_y^2}"}</Tex>; D would be the integral <em>divided by</em> the area of{" "}
        <Tex>{"D"}</Tex>.
      </>
    ),
    theory: <>∫∫ f dA = signed volume; the integrand 1 recovers area, dividing by area gives the mean.</>,
  },
  {
    id: "ma2-int-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Compute <Tex>{"\\int_0^1\\!\\int_0^2 xy\\,dy\\,dx"}</Tex>.</>,
    options: [
      { id: "A", content: <Tex>{"1"}</Tex> },
      { id: "B", content: <Tex>{"2"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac12"}</Tex> },
      { id: "D", content: <Tex>{"4"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        Inner: <Tex>{"\\int_0^2 xy\\,dy = x\\big[\\tfrac{y^2}{2}\\big]_0^2 = 2x"}</Tex>; outer:{" "}
        <Tex>{"\\int_0^1 2x\\,dx = 1"}</Tex> — answer A. B comes from dropping the{" "}
        <Tex>{"\\tfrac12"}</Tex> in <Tex>{"y^2/2"}</Tex>; C from stopping the inner integral at{" "}
        <Tex>{"y=1"}</Tex> instead of <Tex>{"2"}</Tex>; D from multiplying the corner value{" "}
        <Tex>{"f(1,2)=2"}</Tex> by the rectangle's area instead of integrating.
      </>
    ),
    theory: <>On rectangles a product integrand separates: ∫x dx · ∫y dy = ½ · 2 = 1.</>,
  },
  {
    id: "ma2-int-q3",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        <Tex>{"T"}</Tex> is the triangle with vertices <Tex>{"(0,0)"}</Tex>, <Tex>{"(1,0)"}</Tex>,{" "}
        <Tex>{"(1,1)"}</Tex>. Which iterated integral equals <Tex>{"\\iint_T x\\,dA"}</Tex>?
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\int_0^1\\!\\int_0^y x\\,dx\\,dy"}</Tex> },
      { id: "B", content: <Tex>{"\\int_0^1\\!\\int_0^1 x\\,dy\\,dx"}</Tex> },
      { id: "C", content: <Tex>{"\\int_0^1\\!\\int_0^x x\\,dy\\,dx"}</Tex> },
      { id: "D", content: <Tex>{"\\int_0^1\\!\\int_x^1 x\\,dy\\,dx"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"T"}</Tex> lies <em>below</em> the diagonal <Tex>{"y=x"}</Tex>: a vertical strip at{" "}
        <Tex>{"x"}</Tex> runs from <Tex>{"y=0"}</Tex> up to <Tex>{"y=x"}</Tex>, giving C (value{" "}
        <Tex>{"\\tfrac13"}</Tex>). A and D both describe the <em>upper</em> triangle with vertices{" "}
        <Tex>{"(0,0),(0,1),(1,1)"}</Tex> — the mirror region; B integrates over the whole unit square.
      </>
    ),
    theory: <>Identify which side of the diagonal the region sits on before writing strip limits.</>,
  },
  {
    id: "ma2-int-q4",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        <Tex>{"D"}</Tex> is the region enclosed by the parabola <Tex>{"y=x^2"}</Tex> and the line{" "}
        <Tex>{"y=4"}</Tex>. Which iterated integral equals <Tex>{"\\iint_D f\\,dA"}</Tex>?
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\int_0^2\\!\\int_{x^2}^4 f\\,dy\\,dx"}</Tex> },
      { id: "B", content: <Tex>{"\\int_{-2}^2\\!\\int_4^{x^2} f\\,dy\\,dx"}</Tex> },
      { id: "C", content: <Tex>{"\\int_{-2}^2\\!\\int_0^4 f\\,dy\\,dx"}</Tex> },
      { id: "D", content: <Tex>{"\\int_{-2}^2\\!\\int_{x^2}^4 f\\,dy\\,dx"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        The curves meet where <Tex>{"x^2=4"}</Tex>, i.e. <Tex>{"x=\\pm 2"}</Tex>; a vertical strip runs
        from the parabola up to the line — answer D. A forgets the left half (<Tex>{"x"}</Tex> starts at{" "}
        <Tex>{"-2"}</Tex>); B has the inner limits upside down (the parabola is the <em>lower</em>{" "}
        boundary); C replaces the parabola by <Tex>{"y=0"}</Tex>, adding points below the parabola that
        are not in <Tex>{"D"}</Tex>.
      </>
    ),
    theory: <>Outer limits from intersections; inner limits = lower curve → upper curve along the strip.</>,
  },
  {
    id: "ma2-int-q5",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Swapping the order in <Tex>{"\\int_0^1\\!\\int_{x^2}^1 f\\,dy\\,dx"}</Tex> gives:</>,
    options: [
      { id: "A", content: <Tex>{"\\int_0^1\\!\\int_0^{\\sqrt{y}} f\\,dx\\,dy"}</Tex> },
      { id: "B", content: <Tex>{"\\int_0^1\\!\\int_0^{y^2} f\\,dx\\,dy"}</Tex> },
      { id: "C", content: <Tex>{"\\int_0^1\\!\\int_{\\sqrt{y}}^1 f\\,dx\\,dy"}</Tex> },
      { id: "D", content: <Tex>{"\\int_{x^2}^1\\!\\int_0^1 f\\,dx\\,dy"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        The region is <Tex>{"0\\le x\\le 1,\\ x^2\\le y\\le 1"}</Tex> — above the parabola. A horizontal
        strip at height <Tex>{"y"}</Tex> runs from <Tex>{"x=0"}</Tex> to the parabola{" "}
        <Tex>{"x=\\sqrt{y}"}</Tex>, with <Tex>{"y\\in[0,1]"}</Tex>: answer A. B inverts the function the
        wrong way (<Tex>{"y=x^2"}</Tex> gives <Tex>{"x=\\sqrt{y}"}</Tex>, not <Tex>{"x=y^2"}</Tex>); C
        describes the complementary region <em>below</em> the parabola; D leaves <Tex>{"x"}</Tex> in an
        outer limit — meaningless.
      </>
    ),
    theory: <>To swap, solve each boundary curve for the new inner variable and re-sketch.</>,
  },
  {
    id: "ma2-int-q6",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Compute <Tex>{"\\int_0^1\\!\\int_0^x 6xy\\,dy\\,dx"}</Tex>.</>,
    options: [
      { id: "A", content: <Tex>{"\\tfrac32"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac34"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac38"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac14"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Inner: <Tex>{"\\int_0^x 6xy\\,dy = 6x\\cdot\\tfrac{x^2}{2} = 3x^3"}</Tex>; outer:{" "}
        <Tex>{"\\int_0^1 3x^3 dx = \\tfrac34"}</Tex> — answer B. A drops the <Tex>{"\\tfrac12"}</Tex> from{" "}
        <Tex>{"y^2/2"}</Tex> (getting <Tex>{"6x^3"}</Tex>); C halves once too often when integrating{" "}
        <Tex>{"x^3"}</Tex> (writing <Tex>{"x^4/8"}</Tex>); D loses the coefficient 3 before the final
        integration.
      </>
    ),
    theory: <>With variable inner limits the inner result is a function of x — integrate it carefully.</>,
  },
  {
    id: "ma2-int-q7",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>In polar coordinates the area element <Tex>{"dA"}</Tex> equals:</>,
    options: [
      { id: "A", content: <Tex>{"dr\\,d\\theta"}</Tex> },
      { id: "B", content: <Tex>{"r^2\\,dr\\,d\\theta"}</Tex> },
      { id: "C", content: <Tex>{"r\\,dr\\,d\\theta"}</Tex> },
      { id: "D", content: <Tex>{"r\\sin\\theta\\,dr\\,d\\theta"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        A polar cell has sides <Tex>{"\\Delta r"}</Tex> and <Tex>{"r\\Delta\\theta"}</Tex>, so{" "}
        <Tex>{"\\Delta A\\approx r\\,\\Delta r\\,\\Delta\\theta"}</Tex> — answer C. A ignores that arcs
        grow with radius (the classic forgotten Jacobian); B borrows the <Tex>{"\\rho^2"}</Tex> of
        spherical coordinates; D smuggles in a <Tex>{"\\sin"}</Tex> factor that belongs to the spherical
        volume element, not to 2-D polar.
      </>
    ),
    theory: <>Jacobians: polar r, cylindrical r, spherical ρ² sin φ — memorize the trio.</>,
  },
  {
    id: "ma2-int-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        <Tex>{"D=\\{1\\le x^2+y^2\\le 4,\\ x\\ge0,\\ y\\ge0\\}"}</Tex>. In polar coordinates,{" "}
        <Tex>{"\\iint_D f(x,y)\\,dA"}</Tex> becomes:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\int_0^{\\pi/2}\\!\\int_1^4 f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta"}</Tex> },
      { id: "B", content: <Tex>{"\\int_0^{2\\pi}\\!\\int_1^2 f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta"}</Tex> },
      { id: "C", content: <Tex>{"\\int_0^{\\pi/2}\\!\\int_1^2 f(r\\cos\\theta, r\\sin\\theta)\\,dr\\,d\\theta"}</Tex> },
      { id: "D", content: <Tex>{"\\int_0^{\\pi/2}\\!\\int_1^2 f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"1\\le x^2+y^2\\le 4"}</Tex> means <Tex>{"1\\le r^2\\le 4"}</Tex>, i.e.{" "}
        <Tex>{"1\\le r\\le 2"}</Tex>; the first quadrant is{" "}
        <Tex>{"\\theta\\in[0,\\tfrac{\\pi}{2}]"}</Tex>; and <Tex>{"dA=r\\,dr\\,d\\theta"}</Tex> — answer
        D. A takes <Tex>{"r"}</Tex> up to 4, forgetting the square root of <Tex>{"r^2\\le4"}</Tex>; B
        sweeps the full circle instead of the quarter; C loses the Jacobian <Tex>{"r"}</Tex>.
      </>
    ),
    theory: <>Radii come from the square root of the x²+y² bounds; the θ-window from the sign constraints.</>,
  },
  {
    id: "ma2-int-q9",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The integral <Tex>{"\\iint_{\\mathbb{R}^2} e^{-(x^2+y^2)}\\,dA"}</Tex> equals:</>,
    options: [
      { id: "A", content: <Tex>{"\\pi"}</Tex> },
      { id: "B", content: <Tex>{"\\sqrt{\\pi}"}</Tex> },
      { id: "C", content: <Tex>{"2\\pi"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{\\pi}{2}"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        In polar:{" "}
        <Tex>{"\\int_0^{2\\pi}\\!\\int_0^{\\infty} e^{-r^2} r\\,dr\\,d\\theta = 2\\pi\\cdot\\big[-\\tfrac12 e^{-r^2}\\big]_0^{\\infty} = 2\\pi\\cdot\\tfrac12 = \\pi"}</Tex>{" "}
        — answer A. B (<Tex>{"\\sqrt{\\pi}"}</Tex>) is the 1-D Gaussian{" "}
        <Tex>{"\\int e^{-x^2}dx"}</Tex>, i.e. the square root of this result; C forgets the{" "}
        <Tex>{"\\tfrac12"}</Tex> from the substitution <Tex>{"u=r^2"}</Tex>; D halves the angular range
        for no reason.
      </>
    ),
    theory: <>e^(−r²)·r integrates exactly because the Jacobian r is the derivative of r²/2.</>,
  },
  {
    id: "ma2-int-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The area enclosed by the curve <Tex>{"r=2\\cos\\theta"}</Tex> (for{" "}
        <Tex>{"\\theta\\in[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</Tex>) is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac{\\pi}{2}"}</Tex> },
      { id: "B", content: <Tex>{"\\pi"}</Tex> },
      { id: "C", content: <Tex>{"2\\pi"}</Tex> },
      { id: "D", content: <Tex>{"4\\pi"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"A=\\int_{-\\pi/2}^{\\pi/2}\\!\\int_0^{2\\cos\\theta} r\\,dr\\,d\\theta = \\int_{-\\pi/2}^{\\pi/2} 2\\cos^2\\theta\\,d\\theta = \\big[\\theta+\\sin\\theta\\cos\\theta\\big]_{-\\pi/2}^{\\pi/2} = \\pi"}</Tex>{" "}
        — answer B. Sanity check: <Tex>{"r=2\\cos\\theta"}</Tex> is the circle{" "}
        <Tex>{"(x-1)^2+y^2=1"}</Tex> of radius 1 and area <Tex>{"\\pi"}</Tex>. A integrates only half the
        angular range; C forgets the <Tex>{"\\tfrac12"}</Tex> in <Tex>{"r^2/2"}</Tex>; D misreads the
        curve as a circle of radius 2.
      </>
    ),
    theory: <>Area in polar: ∫ ½ r(θ)² dθ — off-center circles have θ-dependent radius.</>,
  },
  {
    id: "ma2-int-q11",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Compute <Tex>{"\\iint_D (x^2+y^2)\\,dA"}</Tex> where <Tex>{"D=\\{x^2+y^2\\le 4\\}"}</Tex>.
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac{16\\pi}{3}"}</Tex> },
      { id: "B", content: <Tex>{"4\\pi"}</Tex> },
      { id: "C", content: <Tex>{"8\\pi"}</Tex> },
      { id: "D", content: <Tex>{"32\\pi"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"x^2+y^2=r^2"}</Tex>, so{" "}
        <Tex>{"\\int_0^{2\\pi}\\!\\int_0^2 r^2\\cdot r\\,dr\\,d\\theta = 2\\pi\\big[\\tfrac{r^4}{4}\\big]_0^2 = 2\\pi\\cdot 4 = 8\\pi"}</Tex>{" "}
        — answer C. A comes from forgetting the Jacobian (integrating <Tex>{"r^2\\,dr"}</Tex> gives{" "}
        <Tex>{"\\tfrac83"}</Tex>, hence <Tex>{"\\tfrac{16\\pi}{3}"}</Tex>); B is the plain <em>area</em>{" "}
        of the disk — the integrand was dropped entirely; D forgets the <Tex>{"\\tfrac14"}</Tex> when
        integrating <Tex>{"r^3"}</Tex>.
      </>
    ),
    theory: <>x²+y² → r², times the Jacobian r ⇒ integrate r³; track the powers of r explicitly.</>,
  },
  {
    id: "ma2-int-q12",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        In the column setup{" "}
        <Tex>{"\\iiint_E f\\,dV = \\iint_D\\big(\\int_{z_1(x,y)}^{z_2(x,y)} f\\,dz\\big)dA"}</Tex>, the
        region <Tex>{"D"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <>Any horizontal cross-section of <Tex>{"E"}</Tex></> },
      { id: "B", content: <>The top surface of <Tex>{"E"}</Tex></> },
      { id: "C", content: <>The largest horizontal slice of <Tex>{"E"}</Tex></> },
      { id: "D", content: <>The projection (shadow) of <Tex>{"E"}</Tex> onto the xy-plane</> },
    ],
    correct: "D",
    explanation: (
      <>
        Columns stand on the shadow: every point of <Tex>{"D"}</Tex> carries a vertical segment from{" "}
        <Tex>{"z_1"}</Tex> to <Tex>{"z_2"}</Tex>, so <Tex>{"D"}</Tex> must be the projection of the solid
        onto the plane — answer D. A cross-section (A) generally misses parts of the shadow; the top
        surface (B) is a curved surface in space, not a plane region; the largest slice (C) coincides
        with the shadow only for special solids — a tilted body breaks it.
      </>
    ),
    theory: <>dz-first: integrate along the column, then over the shadow region in the plane.</>,
  },
  {
    id: "ma2-int-q13",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The volume of the solid below <Tex>{"z=4-x^2-y^2"}</Tex> and above the plane <Tex>{"z=0"}</Tex>{" "}
        is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"8\\pi"}</Tex> },
      { id: "B", content: <Tex>{"16\\pi"}</Tex> },
      { id: "C", content: <Tex>{"4\\pi"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{32\\pi}{3}"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        Shadow: <Tex>{"r\\le 2"}</Tex>. In cylindrical:{" "}
        <Tex>{"V=\\int_0^{2\\pi}\\!\\int_0^2 (4-r^2)r\\,dr\\,d\\theta = 2\\pi\\big[2r^2-\\tfrac{r^4}{4}\\big]_0^2 = 2\\pi(8-4)=8\\pi"}</Tex>{" "}
        — answer A. B keeps only the <Tex>{"4r"}</Tex> term and never subtracts the{" "}
        <Tex>{"r^3"}</Tex> part; C drops one of the two terms at the end, halving the result; D is the
        volume of a <em>hemisphere</em> of radius 2 — the paraboloid is not a sphere.
      </>
    ),
    theory: <>Volume under a surface = ∫∫ (top − bottom) over the shadow, in the region's natural coordinates.</>,
  },
  {
    id: "ma2-int-q14",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        In spherical coordinates (<Tex>{"\\varphi"}</Tex> measured from the positive z-axis), the volume
        element <Tex>{"dV"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\rho\\sin\\varphi\\;d\\rho\\,d\\varphi\\,d\\theta"}</Tex> },
      { id: "B", content: <Tex>{"\\rho^2\\sin\\varphi\\;d\\rho\\,d\\varphi\\,d\\theta"}</Tex> },
      { id: "C", content: <Tex>{"\\rho^2\\cos\\varphi\\;d\\rho\\,d\\varphi\\,d\\theta"}</Tex> },
      { id: "D", content: <Tex>{"\\rho^2\\;d\\rho\\,d\\varphi\\,d\\theta"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        The spherical cell is nearly a box with sides <Tex>{"d\\rho"}</Tex>,{" "}
        <Tex>{"\\rho\\,d\\varphi"}</Tex> and <Tex>{"\\rho\\sin\\varphi\\,d\\theta"}</Tex> (the horizontal
        circle at colatitude <Tex>{"\\varphi"}</Tex> has radius <Tex>{"\\rho\\sin\\varphi"}</Tex>);
        multiplying the three gives B. A has only one factor of <Tex>{"\\rho"}</Tex> — that scales like a
        surface, not a volume; C uses <Tex>{"\\cos"}</Tex>, which would vanish at the equator where the
        cells are <em>largest</em>; D forgets that cells shrink near the poles (<Tex>{"\\sin\\varphi"}</Tex>).
      </>
    ),
    theory: <>Build Jacobians by multiplying the three edge lengths of the coordinate cell.</>,
  },
  {
    id: "ma2-int-q15",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Volume of the “ice-cream cone”: inside the sphere <Tex>{"\\rho=2"}</Tex> and inside the cone{" "}
        <Tex>{"\\varphi=\\tfrac{\\pi}{3}"}</Tex> (i.e. <Tex>{"0\\le\\varphi\\le\\tfrac{\\pi}{3}"}</Tex>).
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac{32\\pi}{3}"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac{16\\pi}{3}"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{8\\pi}{3}"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{8\\sqrt{3}\\,\\pi}{3}"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        All limits are constants:{" "}
        <Tex>{"V=\\int_0^{2\\pi}\\!\\int_0^{\\pi/3}\\!\\int_0^2 \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta = 2\\pi\\cdot\\tfrac83\\cdot\\big[-\\cos\\varphi\\big]_0^{\\pi/3} = 2\\pi\\cdot\\tfrac83\\cdot\\tfrac12 = \\tfrac{8\\pi}{3}"}</Tex>{" "}
        — answer C. A is the whole ball (<Tex>{"\\tfrac43\\pi\\cdot 8"}</Tex>), ignoring the cone; B lets{" "}
        <Tex>{"\\varphi"}</Tex> run to <Tex>{"\\tfrac{\\pi}{2}"}</Tex> (the whole upper half-ball); D
        integrates <Tex>{"\\cos\\varphi"}</Tex> instead of <Tex>{"\\sin\\varphi"}</Tex>, producing a
        spurious <Tex>{"\\sqrt{3}"}</Tex>.
      </>
    ),
    theory: <>Sphere + cone through the origin ⇒ spherical; [−cos φ] from 0 to φ₀ gives (1 − cos φ₀).</>,
  },
  {
    id: "ma2-int-q16",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        A plate occupies <Tex>{"D"}</Tex> with density <Tex>{"\\delta(x,y)"}</Tex>. Its total mass is:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"\\delta"}</Tex> times the area of <Tex>{"D"}</Tex></> },
      { id: "B", content: <Tex>{"\\iint_D x\\,\\delta(x,y)\\,dA"}</Tex> },
      { id: "C", content: <Tex>{"\\dfrac{1}{\\text{Area}(D)}\\displaystyle\\iint_D \\delta(x,y)\\,dA"}</Tex> },
      { id: "D", content: <Tex>{"\\iint_D \\delta(x,y)\\,dA"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        Each cell contributes <Tex>{"\\delta\\cdot\\Delta A"}</Tex> of mass; summing gives{" "}
        <Tex>{"m=\\iint_D\\delta\\,dA"}</Tex> — answer D. A works only if <Tex>{"\\delta"}</Tex> is
        constant; B is the moment used for <Tex>{"\\bar x"}</Tex>, not the mass; C is the{" "}
        <em>average</em> density, not the total mass.
      </>
    ),
    theory: <>Mass = density integrated over the region; moments add the position weight x or y.</>,
  },
  {
    id: "ma2-int-q17",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The half disk <Tex>{"x^2+y^2\\le 1,\\ y\\ge 0"}</Tex> has density <Tex>{"\\delta(x,y)=y"}</Tex>.
        Its mass is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac23"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac13"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{\\pi}{3}"}</Tex> },
      { id: "D", content: <Tex>{"1"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        In polar, <Tex>{"y=r\\sin\\theta"}</Tex> over <Tex>{"0\\le r\\le1,\\ 0\\le\\theta\\le\\pi"}</Tex>:{" "}
        <Tex>{"m=\\int_0^{\\pi}\\!\\int_0^1 r\\sin\\theta\\cdot r\\,dr\\,d\\theta = \\Big(\\int_0^{\\pi}\\sin\\theta\\,d\\theta\\Big)\\Big(\\int_0^1 r^2 dr\\Big) = 2\\cdot\\tfrac13 = \\tfrac23"}</Tex>{" "}
        — answer A. B uses <Tex>{"\\int_0^{\\pi}\\sin\\theta\\,d\\theta=1"}</Tex> (it is 2); C drops the{" "}
        <Tex>{"\\sin\\theta"}</Tex> and integrates a bare <Tex>{"\\pi"}</Tex> over the angle; D forgets
        the Jacobian, integrating <Tex>{"r\\sin\\theta\\,dr\\,d\\theta"}</Tex> (which gives 1).
      </>
    ),
    theory: <>δ = y becomes r sin θ, times the Jacobian r ⇒ r² sin θ; constant limits ⇒ separate.</>,
  },
  {
    id: "ma2-int-q18",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The volume of the tetrahedron bounded by the coordinate planes and the plane{" "}
        <Tex>{"x+y+z=1"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac13"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac16"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac12"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac1{24}"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Columns: <Tex>{"z"}</Tex> from 0 to <Tex>{"1-x-y"}</Tex> over the shadow triangle{" "}
        <Tex>{"0\\le y\\le 1-x,\\ 0\\le x\\le1"}</Tex>:{" "}
        <Tex>{"V=\\int_0^1\\!\\int_0^{1-x}(1-x-y)\\,dy\\,dx = \\int_0^1 \\tfrac{(1-x)^2}{2}\\,dx = \\tfrac16"}</Tex>{" "}
        — answer B. A forgets the <Tex>{"\\tfrac12"}</Tex> in <Tex>{"(1-x)^2/2"}</Tex>; C is the area of
        the 2-D shadow (one integration missing); D divides once too often — the simplex pattern is{" "}
        <Tex>{"\\tfrac{1}{n!}"}</Tex>, and in 3D that is <Tex>{"\\tfrac16"}</Tex>, not{" "}
        <Tex>{"\\tfrac1{24}"}</Tex>.
      </>
    ),
    theory: <>Unit simplex volumes follow 1/n!: the inner integrals build (1−x)ⁿ/n! step by step.</>,
  },
];

export const exam: ExamProblem[] = [
  {
    id: "ma2-int-e1",
    title: "Swap the order to unlock the integral",
    meta: "Double integrals · ~10 pts · classic exam task",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Evaluate <Tex>{"I=\\int_0^1\\!\\!\\int_y^1 e^{x^2}\\,dx\\,dy"}</Tex>, justifying every step.
      </>
    ),
    given: (
      <>
        <Tex>{"e^{x^2}"}</Tex> has no elementary antiderivative in <Tex>{"x"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "Recognize that the given order is impossible",
        content: (
          <>
            The inner integral <Tex>{"\\int_y^1 e^{x^2}\\,dx"}</Tex> cannot be written in elementary
            functions — no substitution or parts will ever work. The integrand <Tex>{"e^{x^2}"}</Tex> is
            the signal that the problem <em>requires</em> swapping the order.
          </>
        ),
      },
      {
        title: "Describe the region",
        content: (
          <>
            The limits say <Tex>{"0\\le y\\le 1"}</Tex> and <Tex>{"y\\le x\\le 1"}</Tex>, i.e. the
            triangle <Tex>{"0\\le y\\le x\\le 1"}</Tex>: below the line <Tex>{"y=x"}</Tex>, with vertices{" "}
            <Tex>{"(0,0),(1,0),(1,1)"}</Tex>. Sketch it — this is where the marks are.
          </>
        ),
      },
      {
        title: "Re-slice with vertical strips",
        content: (
          <>
            For each <Tex>{"x\\in[0,1]"}</Tex>, <Tex>{"y"}</Tex> runs from 0 to <Tex>{"x"}</Tex>:{" "}
            <Tex>{"I=\\int_0^1\\!\\!\\int_0^x e^{x^2}\\,dy\\,dx"}</Tex>.
          </>
        ),
      },
      {
        title: "Do the now-trivial inner integral",
        content: (
          <>
            <Tex>{"e^{x^2}"}</Tex> is constant in <Tex>{"y"}</Tex>, so the inner integral is just the
            strip length: <Tex>{"\\int_0^x e^{x^2}\\,dy = x\\,e^{x^2}"}</Tex>.
          </>
        ),
      },
      {
        title: "Finish with the substitution the swap created",
        content: (
          <>
            <Tex>{"I=\\int_0^1 x\\,e^{x^2}\\,dx = \\Big[\\tfrac12 e^{x^2}\\Big]_0^1 = \\tfrac{e-1}{2}"}</Tex>.
            The factor <Tex>{"x"}</Tex> produced by the strip length is exactly what{" "}
            <Tex>{"u=x^2"}</Tex> needs — the problem was engineered for the swap.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"I=\\dfrac{e-1}{2}\\approx 0.859"}</Tex>
      </>
    ),
    tips: (
      <>
        Never “swap” by exchanging the numbers — re-derive the limits from a sketch (the blind swap here
        gives a wrong region). Integrands like <Tex>{"e^{x^2}"}</Tex>, <Tex>{"\\sin(y^2)"}</Tex>,{" "}
        <Tex>{"\\tfrac{\\sin x}{x}"}</Tex> are the examiner's flag that the given order is a dead end;
        state explicitly that the antiderivative is non-elementary to collect the justification marks.
      </>
    ),
  },
  {
    id: "ma2-int-e2",
    title: "Polar coordinates on a quarter annulus",
    meta: "Double integrals · ~10 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"D=\\{(x,y): 1\\le x^2+y^2\\le 4,\\ x\\ge0,\\ y\\ge0\\}"}</Tex>. Compute (a) the area
        of <Tex>{"D"}</Tex> and (b) <Tex>{"\\iint_D xy\\,dA"}</Tex>.
      </>
    ),
    given: (
      <>
        <Tex>{"x=r\\cos\\theta,\\ y=r\\sin\\theta,\\ dA=r\\,dr\\,d\\theta"}</Tex>
      </>
    ),
    steps: [
      {
        title: "Describe D in polar coordinates",
        content: (
          <>
            <Tex>{"1\\le x^2+y^2\\le4"}</Tex> gives <Tex>{"1\\le r\\le 2"}</Tex> (take square roots of
            the <Tex>{"r^2"}</Tex> bounds); the first quadrant gives{" "}
            <Tex>{"0\\le\\theta\\le\\tfrac{\\pi}{2}"}</Tex>. In polar, <Tex>{"D"}</Tex> is a rectangle —
            all limits constant.
          </>
        ),
      },
      {
        title: "(a) Area",
        content: (
          <>
            <Tex>{"\\text{Area}=\\int_0^{\\pi/2}\\!\\!\\int_1^2 r\\,dr\\,d\\theta = \\tfrac{\\pi}{2}\\Big[\\tfrac{r^2}{2}\\Big]_1^2 = \\tfrac{\\pi}{2}\\cdot\\tfrac{3}{2} = \\tfrac{3\\pi}{4}"}</Tex>.
            Check: a quarter of the full annulus area <Tex>{"\\pi(4-1)=3\\pi"}</Tex> — consistent.
          </>
        ),
      },
      {
        title: "(b) Convert the integrand",
        content: (
          <>
            <Tex>{"xy = r^2\\cos\\theta\\sin\\theta"}</Tex>, and with the Jacobian the full integrand is{" "}
            <Tex>{"r^3\\cos\\theta\\sin\\theta"}</Tex>.
          </>
        ),
      },
      {
        title: "Separate the two 1-D integrals",
        content: (
          <>
            Constant limits allow separation:{" "}
            <Tex>{"\\iint_D xy\\,dA = \\Big(\\int_1^2 r^3\\,dr\\Big)\\Big(\\int_0^{\\pi/2}\\cos\\theta\\sin\\theta\\,d\\theta\\Big)"}</Tex>.
            First factor:{" "}
            <Tex>{"\\big[\\tfrac{r^4}{4}\\big]_1^2 = \\tfrac{16-1}{4} = \\tfrac{15}{4}"}</Tex>. Second:{" "}
            <Tex>{"\\big[\\tfrac{\\sin^2\\theta}{2}\\big]_0^{\\pi/2} = \\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "Multiply",
        content: (
          <>
            <Tex>{"\\iint_D xy\\,dA = \\tfrac{15}{4}\\cdot\\tfrac12 = \\tfrac{15}{8}"}</Tex>.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        (a) <Tex>{"\\tfrac{3\\pi}{4}"}</Tex> &nbsp;·&nbsp; (b){" "}
        <Tex>{"\\iint_D xy\\,dA = \\tfrac{15}{8}"}</Tex>
      </>
    ),
    tips: (
      <>
        Squared-radius bounds are a favorite trap: <Tex>{"1\\le x^2+y^2\\le4"}</Tex> means{" "}
        <Tex>{"r\\in[1,2]"}</Tex>, never <Tex>{"[1,4]"}</Tex>. The Jacobian <Tex>{"r"}</Tex> joins the{" "}
        <Tex>{"r^2"}</Tex> from <Tex>{"xy"}</Tex> to make <Tex>{"r^3"}</Tex> — write the conversion in
        two separate steps so you don't lose it. If you prefer,{" "}
        <Tex>{"\\cos\\theta\\sin\\theta = \\tfrac12\\sin 2\\theta"}</Tex> gives the same{" "}
        <Tex>{"\\tfrac12"}</Tex>.
      </>
    ),
  },
  {
    id: "ma2-int-e3",
    title: "Volume inside a sphere, outside a cylinder",
    meta: "Triple integrals · ~12 pts",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Compute the volume of the solid that lies inside the sphere <Tex>{"x^2+y^2+z^2=4"}</Tex> and
        outside the cylinder <Tex>{"x^2+y^2=1"}</Tex>.
      </>
    ),
    given: <>Sphere of radius 2 and infinite cylinder of radius 1, both centered on the z-axis.</>,
    steps: [
      {
        title: "Choose cylindrical coordinates",
        content: (
          <>
            Both surfaces are symmetric about the z-axis: sphere <Tex>{"r^2+z^2=4"}</Tex>, cylinder{" "}
            <Tex>{"r=1"}</Tex>. Cylindrical coordinates with <Tex>{"dV=r\\,dz\\,dr\\,d\\theta"}</Tex> are
            the natural choice (spherical would make the cylinder ugly).
          </>
        ),
      },
      {
        title: "Describe the solid",
        content: (
          <>
            Outside the cylinder: <Tex>{"r\\ge 1"}</Tex>; inside the sphere: <Tex>{"r\\le 2"}</Tex> and{" "}
            <Tex>{"-\\sqrt{4-r^2}\\le z\\le\\sqrt{4-r^2}"}</Tex>. Full turn in <Tex>{"\\theta"}</Tex>.
            So: <Tex>{"1\\le r\\le 2"}</Tex>, <Tex>{"0\\le\\theta\\le 2\\pi"}</Tex>,{" "}
            <Tex>{"|z|\\le\\sqrt{4-r^2}"}</Tex>.
          </>
        ),
      },
      {
        title: "Set up with the column height",
        content: (
          <>
            Each column has height <Tex>{"2\\sqrt{4-r^2}"}</Tex> (top minus bottom, symmetric in{" "}
            <Tex>{"z"}</Tex>):{" "}
            <Tex>{"V=\\int_0^{2\\pi}\\!\\!\\int_1^2 2\\sqrt{4-r^2}\\;r\\,dr\\,d\\theta"}</Tex>.
          </>
        ),
      },
      {
        title: "Substitute u = 4 − r²",
        content: (
          <>
            <Tex>{"du=-2r\\,dr"}</Tex>; when <Tex>{"r=1"}</Tex>, <Tex>{"u=3"}</Tex>; when{" "}
            <Tex>{"r=2"}</Tex>, <Tex>{"u=0"}</Tex>:{" "}
            <Tex>{"\\int_1^2 2r\\sqrt{4-r^2}\\,dr = \\int_0^3 \\sqrt{u}\\,du = \\tfrac23 u^{3/2}\\Big|_0^3 = \\tfrac23\\cdot 3\\sqrt{3} = 2\\sqrt{3}"}</Tex>.
          </>
        ),
      },
      {
        title: "Multiply by the angular factor",
        content: (
          <>
            <Tex>{"V = 2\\pi\\cdot 2\\sqrt{3} = 4\\sqrt{3}\\,\\pi"}</Tex>. Check against the general
            result for this shape, <Tex>{"V=\\tfrac{4\\pi}{3}(R^2-a^2)^{3/2}"}</Tex>:{" "}
            <Tex>{"\\tfrac{4\\pi}{3}\\cdot 3^{3/2} = 4\\sqrt{3}\\,\\pi"}</Tex> — it matches.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"V = 4\\sqrt{3}\\,\\pi \\approx 21.77"}</Tex>
      </>
    ),
    tips: (
      <>
        Marks are lost three ways here: starting <Tex>{"r"}</Tex> at 0 (that ignores “outside the
        cylinder”), forgetting the factor 2 from the symmetric <Tex>{"z"}</Tex>-extent, and dropping the
        Jacobian <Tex>{"r"}</Tex> — which is exactly what makes the <Tex>{"u=4-r^2"}</Tex> substitution
        clean. If your inner integral seems to need a trig substitution, you probably lost the{" "}
        <Tex>{"r"}</Tex>.
      </>
    ),
  },
];
