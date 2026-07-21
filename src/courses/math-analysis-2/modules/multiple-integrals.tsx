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
   * LESSON 1 — Double integrals, normal domains, reduction formulas
   *  (deck: 4_MultipleIntegrals pp. 1–17)
   * ============================================================== */
  {
    id: "double-integrals-fubini",
    title: "Double integrals & normal domains",
    lecture: MODULE,
    summary:
      "A double integral is a volume built from parallelepipeds — and the professor's main strategy is to reduce it to 2 standard integrals over x-normal or y-normal domains.",
    minutes: 28,
    objectives: [
      "State the professor's definition of ∬_D f dxdy via squares of edge 1/n and parallelepipeds",
      "Use the four properties: linearity, additivity, monotonicity, area",
      "Recognize x-normal and y-normal domains and apply the reduction theorems",
      "Split regions with additivity and swap the integration order when one order is impossible",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            In one variable, <Tex>{"\\int_a^b f"}</Tex> computes the <strong>area</strong> between the
            x-axis and the graph of <Tex>{"f"}</Tex>, obtained by approximation via areas of rectangles.
            For <Tex>{"f: D\\subseteq\\mathbb{R}^2\\to\\mathbb{R}"}</Tex> we want the{" "}
            <strong>volume</strong> between the xy-plane and the graph of <Tex>{"f"}</Tex> — and the idea
            is the same: approximate this volume using <strong>parallelepipeds</strong>. The whole chapter
            is then one engineering problem: how to turn that limit into integrals you can actually
            compute.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Double integral (the professor's construction)",
        content: (
          <>
            Let <Tex>{"D\\subseteq\\mathbb{R}^2"}</Tex> be open and bounded and{" "}
            <Tex>{"f:D\\to\\mathbb{R}"}</Tex>. Pave the plane with squares{" "}
            <Tex>{"Q_{ij}^n"}</Tex> of edge <Tex>{"\\tfrac1n"}</Tex> (so{" "}
            <Tex>{"\\text{Area}(Q_{ij}^n)=\\tfrac1{n^2}"}</Tex>), let <Tex>{"q_{ij}^n"}</Tex> be the{" "}
            <strong>barycenter</strong> of <Tex>{"Q_{ij}^n"}</Tex>, and over each square raise the
            parallelepiped <Tex>{"P_{ij}^n"}</Tex> of volume{" "}
            <Tex>{"\\tfrac1{n^2}\\,f(q_{ij}^n)"}</Tex>. If the limit of the total volume exists in{" "}
            <Tex>{"\\mathbb{R}"}</Tex>, it is the <strong>double integral of f over D</strong>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_D f(x,y)\\,dx\\,dy \\;=\\; \\lim_{n\\to\\infty}\\ \\frac{1}{n^2}\\sum_{i,j} f\\big(q_{ij}^n\\big)",
        tag: "4.1",
        caption: (
          <>
            Volume of one parallelepiped = base <Tex>{"\\tfrac1{n^2}"}</Tex> × height{" "}
            <Tex>{"f(q_{ij}^n)"}</Tex>; sum over <Tex>{"ij"}</Tex> and let the grid shrink. If{" "}
            <Tex>{"D"}</Tex> is “good enough” and <Tex>{"f\\in C(\\bar D)"}</Tex>, the limit exists.
            Briefly we write <Tex>{"\\iint_D f"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Properties of double integrals (the theorem you use constantly)",
        content: (
          <>
            For <Tex>{"f,g\\in C(\\bar D)"}</Tex>: <strong>Linearity</strong> —{" "}
            <Tex>{"\\iint_D (af+bg) = a\\iint_D f + b\\iint_D g"}</Tex>. <strong>Additivity</strong> — if{" "}
            <Tex>{"D=D_1\\cup D_2"}</Tex> with <Tex>{"\\text{Area}(D_1\\cap D_2)=0"}</Tex> (they overlap
            at most on a curve), then <Tex>{"\\iint_D f = \\iint_{D_1} f + \\iint_{D_2} f"}</Tex>.{" "}
            <strong>Monotonicity</strong> — <Tex>{"f\\ge 0"}</Tex> in <Tex>{"D"}</Tex> implies{" "}
            <Tex>{"\\iint_D f\\ge 0"}</Tex>. <strong>Area</strong> —{" "}
            <Tex>{"\\iint_D 1 = \\text{Area}(D)"}</Tex>. In particular for <Tex>{"f\\ge0"}</Tex> the
            integral is the volume under the graph; where <Tex>{"f<0"}</Tex> it counts negatively, like
            signed area in 1D.
          </>
        ),
      },
      { kind: "heading", text: "The main strategy: normal domains" },
      {
        kind: "prose",
        content: (
          <p>
            The definition is not how you compute. The professor's <strong>main strategy</strong>: reduce
            a double integral to <strong>2 standard integrals</strong>. That works on domains whose
            description is “one free variable in an interval, the other trapped between two graphs” — the{" "}
            <em>normal domains</em>.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "x-normal domain",
        content: (
          <>
            <Tex>{"D\\subseteq\\mathbb{R}^2"}</Tex> is <strong>x-normal</strong> if{" "}
            <Tex>{"D=\\{(x,y):\\ a\\le x\\le b\\ \\text{and}\\ \\alpha(x)\\le y\\le\\beta(x)\\}"}</Tex>{" "}
            for some functions <Tex>{"\\alpha,\\beta:[a,b]\\to\\mathbb{R}"}</Tex>. Graphically:{" "}
            <Tex>{"D"}</Tex> is x-normal <Tex>{"\\iff"}</Tex> <strong>every vertical line intersects D in
            a single segment</strong> (possibly empty). Rectangles <Tex>{"[a,b]\\times[c,d]"}</Tex> are
            x-normal (<Tex>{"\\alpha(x)=c"}</Tex>, <Tex>{"\\beta(x)=d"}</Tex>); annuli like{" "}
            <Tex>{"1\\le\\sqrt{x^2+y^2}\\le 2"}</Tex> are <strong>not</strong> x-normal.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_D f \\;=\\; \\int_a^b\\!\\left(\\int_{\\alpha(x)}^{\\beta(x)} f(x,y)\\,dy\\right)\\!dx \\qquad\\text{for } D \\text{ x-normal},\\ f\\in C(\\bar D)",
        tag: "4.2",
        caption: (
          <>
            Double integrals for x-normal domains. <strong>Step 1:</strong> fix{" "}
            <Tex>{"x\\in(a,b)"}</Tex> and integrate in <Tex>{"y\\in(\\alpha(x),\\beta(x))"}</Tex>.{" "}
            <strong>Step 2:</strong> integrate the result in <Tex>{"x\\in(a,b)"}</Tex>.
          </>
        ),
      },
      {
        kind: "definition",
        term: "y-normal domain",
        content: (
          <>
            Symmetrically, <Tex>{"D"}</Tex> is <strong>y-normal</strong> if{" "}
            <Tex>{"D=\\{(x,y):\\ c\\le y\\le d\\ \\text{and}\\ \\gamma(y)\\le x\\le\\delta(y)\\}"}</Tex>{" "}
            for some <Tex>{"\\gamma,\\delta:[c,d]\\to\\mathbb{R}"}</Tex> — every <em>horizontal</em> line
            meets <Tex>{"D"}</Tex> in a single segment, and{" "}
            <Tex>{"\\iint_D f = \\int_c^d\\big(\\int_{\\gamma(y)}^{\\delta(y)} f(x,y)\\,dx\\big)dy"}</Tex>.
            (Equivalently: <Tex>{"D"}</Tex> is y-normal <Tex>{"\\iff"}</Tex> its 90° rotation is
            x-normal.) Many domains are both — then you choose the order.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Other books, other names — the exam uses these",
        content: (
          <>
            Textbooks also say type I / type II or y-simple / x-simple; the professor says{" "}
            <strong>x-normal / y-normal</strong>, and so should you. Two hard rules survive every naming:
            the <em>inner</em> limits may depend on the outer variable; the <em>outer</em> limits must be
            plain numbers. An outer limit containing <Tex>{"x"}</Tex> or <Tex>{"y"}</Tex> is always
            wrong.
          </>
        ),
      },
      {
        kind: "example",
        title: "Warm-up — a rectangle, both orders",
        content: (
          <>
            <p>
              Compute <Tex>{"\\iint_R (x+y)\\,dx\\,dy"}</Tex> on <Tex>{"R=[0,1]\\times[0,2]"}</Tex>.
              Rectangles are x-normal and y-normal, so both reductions apply.
            </p>
            <p>
              <strong>As x-normal</strong> (inner dy):{" "}
              <Tex>{"\\int_0^1\\!\\int_0^2 (x+y)\\,dy\\,dx = \\int_0^1\\Big[xy+\\tfrac{y^2}{2}\\Big]_0^2 dx = \\int_0^1 (2x+2)\\,dx = 1+2 = 3"}</Tex>.
            </p>
            <p>
              <strong>As y-normal</strong> (inner dx):{" "}
              <Tex>{"\\int_0^2\\!\\int_0^1 (x+y)\\,dx\\,dy = \\int_0^2\\Big[\\tfrac{x^2}{2}+xy\\Big]_0^1 dy = \\int_0^2\\big(\\tfrac12+y\\big)dy = 1+2 = 3"}</Tex>.
            </p>
            <p>Same number, as the two reduction theorems guarantee.</p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — the triangle, ∬ x²y = 1/60 both ways",
        content: (
          <>
            <p>
              Let <Tex>{"D"}</Tex> be the triangle with vertices <Tex>{"(0,0)"}</Tex>,{" "}
              <Tex>{"(1,0)"}</Tex>, <Tex>{"(0,1)"}</Tex> (hypotenuse <Tex>{"x+y=1"}</Tex>). Show{" "}
              <Tex>{"\\iint_D x^2y\\,dx\\,dy=\\tfrac1{60}"}</Tex>.
            </p>
            <p>
              <strong>x-normal</strong> (<Tex>{"0\\le x\\le1,\\ 0\\le y\\le 1-x"}</Tex>):{" "}
              <Tex>{"\\int_0^1 x^2\\Big[\\tfrac{y^2}{2}\\Big]_0^{1-x} dx = \\tfrac12\\int_0^1 x^2(1-x)^2\\,dx = \\tfrac12\\Big(\\tfrac13-\\tfrac24+\\tfrac15\\Big) = \\tfrac12\\cdot\\tfrac1{30} = \\tfrac1{60}"}</Tex>.
            </p>
            <p>
              <strong>y-normal</strong> (<Tex>{"0\\le y\\le1,\\ 0\\le x\\le 1-y"}</Tex>):{" "}
              <Tex>{"\\int_0^1 y\\Big[\\tfrac{x^3}{3}\\Big]_0^{1-y} dy = \\tfrac13\\int_0^1 y(1-y)^3\\,dy = \\tfrac13\\cdot\\tfrac1{20} = \\tfrac1{60}"}</Tex>.
            </p>
            <p>
              Both descriptions are legal because every vertical <em>and</em> every horizontal line cuts
              the triangle in one segment.
            </p>
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
            label: "Test the normal direction",
            content: (
              <>
                Does every <em>vertical</em> line meet <Tex>{"D"}</Tex> in a single segment? Then{" "}
                <Tex>{"D"}</Tex> is x-normal: inner dy. Every <em>horizontal</em> line? y-normal: inner
                dx. Neither? Split <Tex>{"D"}</Tex> with additivity.
              </>
            ),
          },
          {
            label: "Slide the segment for the inner limits",
            content: (
              <>
                The curve where the segment enters is <Tex>{"\\alpha"}</Tex> (inner lower limit), where it
                exits is <Tex>{"\\beta"}</Tex> — functions of the outer variable.
              </>
            ),
          },
          {
            label: "Extreme positions for the outer limits",
            content: (
              <>
                The first and last positions of the segment give the outer limits — constants.
                Sanity-check: outer limits contain no variables.
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
            <Tex>{"y=x^2"}</Tex> must be rewritten as <Tex>{"x=\\sqrt{y}"}</Tex> when the segment turns
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
              <Tex>{"\\iint_D x\\,dx\\,dy"}</Tex>.
            </p>
            <p>
              <strong>As x-normal</strong> (<Tex>{"x^2\\le y\\le 2x"}</Tex>,{" "}
              <Tex>{"0\\le x\\le 2"}</Tex>):{" "}
              <Tex>{"\\int_0^2 x\\,(2x-x^2)\\,dx = \\int_0^2 (2x^2 - x^3)\\,dx = \\tfrac{16}{3}-4 = \\tfrac43"}</Tex>.
            </p>
            <p>
              <strong>As y-normal</strong> (<Tex>{"\\tfrac{y}{2}\\le x\\le\\sqrt{y}"}</Tex>,{" "}
              <Tex>{"0\\le y\\le 4"}</Tex>):{" "}
              <Tex>{"\\int_0^4\\Big[\\tfrac{x^2}{2}\\Big]_{y/2}^{\\sqrt{y}} dy = \\int_0^4\\Big(\\tfrac{y}{2}-\\tfrac{y^2}{8}\\Big)dy = 4-\\tfrac{8}{3} = \\tfrac43"}</Tex>.
            </p>
            <p>
              Both orders give <Tex>{"\\tfrac43"}</Tex> — but notice how every limit changed. Changing the
              order is a <em>re-description of the region</em>, never a shuffle of symbols.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — symmetry kills half the work",
        content: (
          <>
            <p>
              (Slides, Ex 1) Compute <Tex>{"\\iint_D (3y+e^x)\\,dx\\,dy"}</Tex> where <Tex>{"D"}</Tex> is
              enclosed by <Tex>{"y=x^2-1"}</Tex> and <Tex>{"y=1-x^2"}</Tex>. The parabolas meet at{" "}
              <Tex>{"x=\\pm1"}</Tex>, and <Tex>{"D"}</Tex> is x-normal with{" "}
              <Tex>{"\\alpha(x)=x^2-1,\\ \\beta(x)=1-x^2"}</Tex>.
            </p>
            <p>
              Key observation: <Tex>{"\\beta=-\\alpha"}</Tex>, so the inner integral of the odd part{" "}
              <Tex>{"3y"}</Tex> vanishes: <Tex>{"\\big[\\tfrac{3y^2}{2}\\big]_{-(1-x^2)}^{1-x^2}=0"}</Tex>.
              Only <Tex>{"e^x"}</Tex> survives, picking up the segment length:
            </p>
            <p>
              <Tex>{"\\iint_D (3y+e^x)\\,dx\\,dy = \\int_{-1}^1 e^x\\,2(1-x^2)\\,dx = 2\\Big[-e^x(x-1)^2\\Big]_{-1}^{1} = 2\\cdot\\tfrac{4}{e} = \\tfrac{8}{e}"}</Tex>,
            </p>
            <p>
              using integration by parts twice (<Tex>{"\\int e^x(1-x^2)dx = -e^x(x-1)^2"}</Tex> — check by
              differentiating). Matches the slide's answer <Tex>{"8/e"}</Tex>. Odd integrand + symmetric
              inner limits = instant zero: scan for this before grinding.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Area as a double integral",
        content: (
          <>
            (Slides, Ex 2) The area property turns region measuring into a reduction exercise:{" "}
            <Tex>{"D=\\{0\\le x\\le 2,\\ e^{-x}\\le y\\le 2-\\tfrac{x^2}{4}\\}"}</Tex> has{" "}
            <Tex>{"\\text{Area}(D)=\\int_0^2\\big(2-\\tfrac{x^2}{4}-e^{-x}\\big)dx = \\big[2x-\\tfrac{x^3}{12}+e^{-x}\\big]_0^2 = \\tfrac73+e^{-2}"}</Tex>.
            Upper curve minus lower curve, integrated — the 1D area-between-curves formula is just{" "}
            <Tex>{"\\iint_D 1"}</Tex> reduced.
          </>
        ),
      },
      { kind: "heading", text: "Additivity in action: splitting the region" },
      {
        kind: "example",
        title: "Deck example — split at the kink (Sol: 272/27)",
        content: (
          <>
            <p>
              (Slides, Ex 4) Compute <Tex>{"\\iint_D (1+x)\\,dx\\,dy"}</Tex> where{" "}
              <Tex>{"D=\\{y\\ge|x|,\\ y\\le\\tfrac{x}{2}+2\\}"}</Tex>. The lower boundary{" "}
              <Tex>{"y=|x|"}</Tex> has a kink at <Tex>{"x=0"}</Tex>, so use <strong>additivity</strong>:
              split there. The line meets <Tex>{"y=-x"}</Tex> at <Tex>{"x=-\\tfrac43"}</Tex> and{" "}
              <Tex>{"y=x"}</Tex> at <Tex>{"x=4"}</Tex>.
            </p>
            <p>
              <Tex>{"D_1"}</Tex> (<Tex>{"-\\tfrac43\\le x\\le 0"}</Tex>,{" "}
              <Tex>{"-x\\le y\\le \\tfrac{x}{2}+2"}</Tex>):{" "}
              <Tex>{"\\int_{-4/3}^{0}(1+x)\\big(\\tfrac{3x}{2}+2\\big)dx = \\tfrac{20}{27}"}</Tex>.
            </p>
            <p>
              <Tex>{"D_2"}</Tex> (<Tex>{"0\\le x\\le 4"}</Tex>,{" "}
              <Tex>{"x\\le y\\le \\tfrac{x}{2}+2"}</Tex>):{" "}
              <Tex>{"\\int_0^4 (1+x)\\big(2-\\tfrac{x}{2}\\big)dx = \\tfrac{28}{3} = \\tfrac{252}{27}"}</Tex>.
            </p>
            <p>
              Total: <Tex>{"\\tfrac{20}{27}+\\tfrac{252}{27} = \\tfrac{272}{27}"}</Tex> — the slide's
              answer. The two pieces overlap only on a segment (area 0), so additivity applies. The same
              trick handles the square <Tex>{"|x|+|y|\\le1"}</Tex>:{" "}
              <Tex>{"\\iint e^{x+y}\\,dx\\,dy = e-\\tfrac1e"}</Tex> (Slides, Ex 6).
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Swapping the order of integration" },
      {
        kind: "prose",
        content: (
          <p>
            Why would you ever re-describe a both-ways-normal domain? Because sometimes the inner
            antiderivative <em>does not exist in elementary terms</em> in the given order, and the other
            order makes it trivial. Integrands like <Tex>{"e^{x^2}"}</Tex>, <Tex>{"e^{-y^2}"}</Tex>,{" "}
            <Tex>{"\\sin(y^2)"}</Tex> — or the deck's <Tex>{"e^{-5y^2+8y}"}</Tex> with its hint
            “integrate in x first!” — are the tell: you <strong>must</strong> swap.
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
            label: "Re-describe it as normal the other way",
            content: (
              <>
                As y-normal: for each <Tex>{"y\\in[0,1]"}</Tex>, <Tex>{"x"}</Tex> runs from{" "}
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
              The region is <Tex>{"0\\le x\\le y\\le 1"}</Tex>. Re-describing it as y-normal:{" "}
              <Tex>{"I=\\int_0^1\\!\\int_0^y e^{y^2}\\,dx\\,dy"}</Tex>. The inner integrand is constant in{" "}
              <Tex>{"x"}</Tex>, so it just picks up the segment length <Tex>{"y"}</Tex>:
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
        kind: "example",
        title: "Deck example — “integrate in x first!” (Sol: e^{16/5} − e³)",
        content: (
          <>
            <p>
              (Slides, Ex 5) Compute <Tex>{"\\iint_D e^{-5y^2+8y}\\,dx\\,dy"}</Tex> where{" "}
              <Tex>{"D=\\{8\\le x\\le 10,\\ \\tfrac{x}{10}\\le y\\le 1\\}"}</Tex>. As written (x-normal,
              inner dy) it is impossible: <Tex>{"e^{-5y^2+8y}"}</Tex> has no elementary antiderivative in{" "}
              <Tex>{"y"}</Tex>.
            </p>
            <p>
              Re-describe as y-normal: <Tex>{"y\\ge\\tfrac{x}{10}"}</Tex> means{" "}
              <Tex>{"x\\le 10y"}</Tex>, so <Tex>{"\\tfrac45\\le y\\le 1"}</Tex> and{" "}
              <Tex>{"8\\le x\\le 10y"}</Tex>. The inner dx integral picks up the segment length{" "}
              <Tex>{"10y-8"}</Tex>:
            </p>
            <p>
              <Tex>{"\\iint_D = \\int_{4/5}^{1} (10y-8)\\,e^{-5y^2+8y}\\,dy = \\Big[-e^{-5y^2+8y}\\Big]_{4/5}^{1} = e^{16/5}-e^{3}"}</Tex>,
            </p>
            <p>
              because <Tex>{"\\tfrac{d}{dy}(-5y^2+8y) = -(10y-8)"}</Tex> — the swap manufactures the
              exact derivative of the exponent. Slide answer confirmed:{" "}
              <Tex>{"e^{16/5}-e^3\\approx 4.44"}</Tex>.
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
            legal route is limits → inequalities → sketch → re-describe as normal the other way. Examiners
            specifically choose regions where the blind swap gives a different (wrong) region.
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
              The region is <Tex>{"0\\le y\\le x\\le 2"}</Tex> — the triangle below <Tex>{"y=x"}</Tex>.
              Described as y-normal, at height <Tex>{"y"}</Tex> the segment runs from the line{" "}
              <Tex>{"x=y"}</Tex> to <Tex>{"x=2"}</Tex>, and <Tex>{"y"}</Tex> spans <Tex>{"[0,2]"}</Tex> —
              that is C. A is the blind symbol swap (it describes the <em>other</em> triangle); B has an
              outer limit containing <Tex>{"x"}</Tex>, which is meaningless; D has the inner limits
              reversed, which flips the sign.
            </>
          ),
          theory: <>Swap = inequalities → sketch → re-describe as normal the other way. Outer limits must be constants.</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp5",
          difficulty: "easy",
          source: "Slides 4_MultipleIntegrals — normal domains",
          prompt: <>Which of these domains is NOT x-normal?</>,
          options: [
            { id: "A", content: <>The disk <Tex>{"x^2+y^2\\le 1"}</Tex></> },
            { id: "B", content: <>The annulus <Tex>{"1\\le x^2+y^2\\le 4"}</Tex></> },
            { id: "C", content: <>The rectangle <Tex>{"[0,1]\\times[2,3]"}</Tex></> },
            { id: "D", content: <>The region between <Tex>{"y=x^2"}</Tex> and <Tex>{"y=2x"}</Tex></> },
          ],
          correct: "B",
          explanation: (
            <>
              The vertical line <Tex>{"x=0"}</Tex> cuts the annulus in <em>two</em> segments (
              <Tex>{"1\\le y\\le 2"}</Tex> and <Tex>{"-2\\le y\\le -1"}</Tex>), violating the
              single-segment criterion — the deck's standard non-example, answer B. The disk (A) gives one
              segment <Tex>{"-\\sqrt{1-x^2}\\le y\\le\\sqrt{1-x^2}"}</Tex>; the rectangle (C) has{" "}
              <Tex>{"\\alpha=2,\\ \\beta=3"}</Tex>; the parabola–line region (D) is{" "}
              <Tex>{"x^2\\le y\\le 2x"}</Tex> — all single segments, all x-normal.
            </>
          ),
          theory: (
            <>
              x-normal ⟺ every vertical line meets D in a single segment (possibly empty). Non-normal
              regions are handled by additivity — or by a change of variables.
            </>
          ),
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            You can now integrate over any region you can sketch — as long as its boundaries are graphs of
            functions. Annuli and disks resist: for them the fix is not additivity but a{" "}
            <strong>change of variables</strong>, the deck's next chapter and our next lesson.
          </p>
        ),
      },
    ],
  },

  /* ============================================================== *
   * LESSON 2 — Change of variables: polar, translated, elliptic
   *  (deck: 4_MultipleIntegrals pp. 18–25)
   * ============================================================== */
  {
    id: "double-integrals-polar",
    title: "Change of variables: polar, translated & elliptic coordinates",
    lecture: MODULE,
    summary:
      "One theorem — ∬f dxdy = ∬ f(Φ)·|det DΦ| dudv — and three workhorse maps: polar (Jacobian r), translated polar (r), elliptic (abr). Plus the Gaussian integral.",
    minutes: 26,
    objectives: [
      "State the change-of-variables theorem and what makes Φ an admissible change of variables",
      "Compute Jacobians: polar r, translated polar r, elliptic abr",
      "Convert and evaluate integrals over disks, annuli, off-center disks and ellipses",
      "Reproduce the deck's proof that ∫ℝ e^(−t²) dt = √π",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Integrate over the quarter disk <Tex>{"x^2+y^2\\le 1"}</Tex>, <Tex>{"x,y>0"}</Tex> with
            Cartesian segments and you get limits like <Tex>{"0\\le y\\le\\sqrt{1-x^2}"}</Tex> — square
            roots that poison every later step. Recall the 1D substitution rule:{" "}
            <Tex>{"\\int_a^b f(x)\\,dx = \\int_{a'}^{b'} f(\\varphi(t))\\,\\varphi'(t)\\,dt"}</Tex> with{" "}
            <Tex>{"x=\\varphi(t)"}</Tex> bijective and <Tex>{"C^1"}</Tex>. The deck's question: how do we
            change variables in <em>double</em> integrals? Answer: with a map{" "}
            <Tex>{"\\Phi: D'\\to D"}</Tex>, <Tex>{"(u,v)\\mapsto(x,y)"}</Tex>, whose local area
            stretch replaces <Tex>{"\\varphi'"}</Tex>.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Admissible change of variables",
        content: (
          <>
            <Tex>{"\\Phi: D'\\to D"}</Tex> is an <strong>admissible change of variables</strong> if: (1){" "}
            <Tex>{"\\Phi"}</Tex> is a bijection; (2) <Tex>{"\\Phi"}</Tex> is <Tex>{"C^1"}</Tex>; (3){" "}
            <Tex>{"\\det D\\Phi\\ne 0"}</Tex> in <Tex>{"D'"}</Tex>. Here <Tex>{"D\\Phi"}</Tex> is the{" "}
            <strong>Jacobian matrix</strong> of <Tex>{"\\Phi"}</Tex>, and <Tex>{"\\det D\\Phi"}</Tex> is
            called the <strong>Jacobian</strong> of <Tex>{"\\Phi"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_D f(x,y)\\,dx\\,dy \\;=\\; \\iint_{D'} f\\big(\\Phi(u,v)\\big)\\,\\big|\\det D\\Phi(u,v)\\big|\\,du\\,dv",
        tag: "5.1",
        caption: (
          <>
            Change of variables in double integrals (<Tex>{"f\\in C(\\bar D)"}</Tex>,{" "}
            <Tex>{"\\Phi"}</Tex> admissible). <Tex>{"|\\det D\\Phi|"}</Tex> is the local area
            magnification — the 2D analogue of <Tex>{"\\varphi'(t)"}</Tex>, with an absolute value
            because areas are positive.
          </>
        ),
      },
      { kind: "heading", text: "Polar coordinates" },
      {
        kind: "definition",
        term: "Polar coordinates",
        content: (
          <>
            <Tex>{"\\Phi(r,\\theta):\\ x=r\\cos\\theta,\\quad y=r\\sin\\theta"}</Tex>, where{" "}
            <Tex>{"r"}</Tex> is the distance from the origin and <Tex>{"\\theta"}</Tex> the angle between{" "}
            <Tex>{"\\vec{OP}"}</Tex> and the positive x-axis. Key identity:{" "}
            <Tex>{"x^2+y^2=r^2"}</Tex> (note: <Tex>{"r^2"}</Tex>, not <Tex>{"r"}</Tex>). The deck's
            showcase: the quarter disk <Tex>{"\\{x,y>0,\\ x^2+y^2<1\\}"}</Tex> is the image of the{" "}
            <strong>rectangle</strong> <Tex>{"D'=\\{0<r<1,\\ 0<\\theta<\\tfrac{\\pi}{2}\\}"}</Tex> —
            curved regions become normal ones.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "D\\Phi = \\begin{pmatrix}\\cos\\theta & -r\\sin\\theta\\\\[2pt] \\sin\\theta & r\\cos\\theta\\end{pmatrix},\\qquad \\det D\\Phi = r\\cos^2\\theta + r\\sin^2\\theta = r",
        tag: "5.2",
        caption: (
          <>
            The Jacobian of polar coordinates is <Tex>{"r"}</Tex>, so{" "}
            <Tex>{"\\iint_D f\\,dx\\,dy = \\iint_{D'} f(r\\cos\\theta,\\,r\\sin\\theta)\\;r\\,dr\\,d\\theta"}</Tex>.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <PolarCellFigure />,
        caption: (
          <>
            Geometric meaning: a “polar rectangle” with sides <Tex>{"\\Delta r"}</Tex> (radial) and{" "}
            <Tex>{"r\\,\\Delta\\theta"}</Tex> (an arc) has area{" "}
            <Tex>{"\\Delta A \\approx r\\,\\Delta r\\,\\Delta\\theta"}</Tex> — cells far from the origin
            are genuinely bigger, and <Tex>{"\\det D\\Phi=r"}</Tex> records exactly that.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The forgotten r — the single most common lost mark",
        content: (
          <>
            Writing <Tex>{"dx\\,dy = dr\\,d\\theta"}</Tex> silently replaces every cell by a
            unit-magnification one and ruins the value (the disk of radius <Tex>{"R"}</Tex> would get
            “area” <Tex>{"2\\pi R"}</Tex> instead of <Tex>{"\\pi R^2"}</Tex>). Second favorite:{" "}
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
              Area of <Tex>{"D=\\{1\\le x^2+y^2\\le 4\\}"}</Tex> — the region that defeated normal
              domains in Lesson 1. In polar it is the rectangle <Tex>{"1\\le r\\le 2"}</Tex>,{" "}
              <Tex>{"0\\le\\theta\\le 2\\pi"}</Tex>:
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
      {
        kind: "example",
        title: "Deck examples — quarter disk and half disk",
        content: (
          <>
            <p>
              (Slides) <Tex>{"\\iint_D x\\,dx\\,dy"}</Tex> on the quarter disk{" "}
              <Tex>{"\\{x,y\\ge0,\\ x^2+y^2\\le1\\}"}</Tex>: with <Tex>{"x=r\\cos\\theta"}</Tex> and
              constant limits everything separates —{" "}
              <Tex>{"\\Big(\\int_0^{\\pi/2}\\cos\\theta\\,d\\theta\\Big)\\Big(\\int_0^1 r\\cdot r\\,dr\\Big) = 1\\cdot\\tfrac13 = \\tfrac13"}</Tex>.
            </p>
            <p>
              (Slides) <Tex>{"\\iint_D e^{-(x^2+y^2)}\\,dx\\,dy"}</Tex> on the half disk{" "}
              <Tex>{"\\{x\\ge0,\\ x^2+y^2\\le4\\}"}</Tex>: here{" "}
              <Tex>{"\\theta\\in[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</Tex> (width <Tex>{"\\pi"}</Tex>)
              and{" "}
              <Tex>{"\\int_0^2 e^{-r^2} r\\,dr = \\big[-\\tfrac12 e^{-r^2}\\big]_0^2 = \\tfrac{1-e^{-4}}{2}"}</Tex>,
              so the integral is <Tex>{"\\tfrac{1-e^{-4}}{2}\\,\\pi"}</Tex> — the slide's answer. The
              Jacobian <Tex>{"r"}</Tex> is exactly what the substitution <Tex>{"u=r^2"}</Tex> needs.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "The Gaussian integral — the deck's showcase" },
      {
        kind: "prose",
        content: (
          <p>
            The deck poses it as an exercise: show that{" "}
            <Tex>{"\\int_{\\mathbb{R}} e^{-t^2}\\,dt = \\sqrt{\\pi}"}</Tex>, with the hint: compute{" "}
            <Tex>{"\\iint_{\\mathbb{R}^2} e^{-(x^2+y^2)}\\,dx\\,dy"}</Tex> and use polar coordinates.{" "}
            <Tex>{"e^{-t^2}"}</Tex> has no elementary antiderivative, so 1D methods are hopeless — but
            squaring the integral turns it into a double integral over the plane, where the Jacobian{" "}
            <Tex>{"r"}</Tex> makes <Tex>{"u=r^2"}</Tex> work.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — ∬ e^(−x²−y²) dxdy over the plane",
        content: (
          <>
            <p>
              <Tex>{"\\iint_{\\mathbb{R}^2} e^{-x^2-y^2}\\,dx\\,dy = \\int_0^{2\\pi}\\!\\!\\int_0^{\\infty} e^{-r^2}\\,r\\,dr\\,d\\theta"}</Tex>.
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
        tex: "\\iint_{\\mathbb{R}^2} e^{-x^2-y^2}\\,dx\\,dy = \\pi \\qquad\\Longrightarrow\\qquad \\int_{\\mathbb{R}} e^{-t^2}\\,dt = \\sqrt{\\pi}",
        tag: "5.3",
        caption: (
          <>
            Impossible in 1D, two lines in polar. Know this derivation cold — it is a favorite oral-exam
            question.
          </>
        ),
      },
      { kind: "heading", text: "Translated polar coordinates" },
      {
        kind: "definition",
        term: "Translated polar coordinates",
        content: (
          <>
            Polar coordinates <strong>centered at</strong> <Tex>{"(x_0,y_0)"}</Tex>:{" "}
            <Tex>{"x = x_0 + r\\cos\\theta,\\quad y = y_0 + r\\sin\\theta"}</Tex>. The translation adds
            constants, which differentiate to nothing: <Tex>{"\\det D\\Phi(r,\\theta) = r"}</Tex>, exactly
            as before, and{" "}
            <Tex>{"\\iint_D f\\,dx\\,dy = \\iint_{D'} f(x_0+r\\cos\\theta,\\ y_0+r\\sin\\theta)\\;r\\,dr\\,d\\theta"}</Tex>.
            Reach for them when the disk is <em>not</em> centered at the origin.
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — off-center half disk (Sol: 18)",
        content: (
          <>
            <p>
              (Slides) Compute <Tex>{"\\iint_D y\\,dx\\,dy"}</Tex> where{" "}
              <Tex>{"D=\\{y\\ge0,\\ (x-3)^2+y^2\\le 9\\}"}</Tex> — the upper half of the disk of radius 3
              centered at <Tex>{"(3,0)"}</Tex>.
            </p>
            <p>
              Translated polar at <Tex>{"(3,0)"}</Tex>: <Tex>{"x=3+r\\cos\\theta"}</Tex>,{" "}
              <Tex>{"y=r\\sin\\theta"}</Tex>, with <Tex>{"0\\le r\\le 3"}</Tex>,{" "}
              <Tex>{"0\\le\\theta\\le\\pi"}</Tex> (upper half). The integrand <Tex>{"y"}</Tex> becomes{" "}
              <Tex>{"r\\sin\\theta"}</Tex>, and with the Jacobian:
            </p>
            <p>
              <Tex>{"\\iint_D y\\,dx\\,dy = \\Big(\\int_0^3 r^2\\,dr\\Big)\\Big(\\int_0^{\\pi}\\sin\\theta\\,d\\theta\\Big) = 9\\cdot 2 = 18"}</Tex>.
            </p>
            <p>
              Same-region alternative: from the origin, the boundary circle is{" "}
              <Tex>{"r=6\\cos\\theta"}</Tex> (substitute <Tex>{"x^2+y^2=r^2"}</Tex> into{" "}
              <Tex>{"x^2+y^2=6x"}</Tex>) — doable, but the limits turn θ-dependent. Translating the center
              first keeps them constant. Choose the map that makes <Tex>{"D'"}</Tex> a rectangle.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Change-of-variables setup method",
        steps: [
          {
            label: "Spot the signal",
            content: (
              <>
                Circles/annuli/sectors or <Tex>{"x^2+y^2"}</Tex> ⇒ polar. Circle centered at{" "}
                <Tex>{"(x_0,y_0)"}</Tex> ⇒ translated polar. Ellipse ⇒ elliptic. The goal is always:
                make <Tex>{"D'"}</Tex> a rectangle in the new variables.
              </>
            ),
          },
          {
            label: "Find the θ-window",
            content: (
              <>
                Which angles does the region span? Full disk: <Tex>{"[0,2\\pi]"}</Tex>; upper half:{" "}
                <Tex>{"[0,\\pi]"}</Tex>; right half: <Tex>{"[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</Tex>;
                first quadrant: <Tex>{"[0,\\tfrac{\\pi}{2}]"}</Tex>.
              </>
            ),
          },
          {
            label: "Find the r-limits",
            content: (
              <>
                For each <Tex>{"\\theta"}</Tex>, the ray from the (possibly translated) center enters at{" "}
                <Tex>{"r_1(\\theta)"}</Tex> and exits at <Tex>{"r_2(\\theta)"}</Tex> — constants if the
                center is chosen well.
              </>
            ),
          },
          {
            label: "Substitute and pay the Jacobian",
            content: (
              <>
                Replace <Tex>{"x,y"}</Tex> by the map, multiply by{" "}
                <Tex>{"|\\det D\\Phi|"}</Tex> (<Tex>{"r"}</Tex> for polar/translated,{" "}
                <Tex>{"abr"}</Tex> for elliptic), then integrate inside-out.
              </>
            ),
          },
        ],
      },
      { kind: "heading", text: "Elliptic coordinates" },
      {
        kind: "definition",
        term: "Translated elliptic coordinates",
        content: (
          <>
            For <Tex>{"a,b>0"}</Tex>:{" "}
            <Tex>{"x = x_0 + a\\,r\\cos\\theta,\\quad y = y_0 + b\\,r\\sin\\theta"}</Tex>. Check:{" "}
            <Tex>{"\\tfrac{(x-x_0)^2}{a^2}+\\tfrac{(y-y_0)^2}{b^2} = r^2"}</Tex>, so{" "}
            <Tex>{"r=1"}</Tex> traces the ellipse with semi-axes <Tex>{"a,b"}</Tex> centered at{" "}
            <Tex>{"(x_0,y_0)"}</Tex>, and the full ellipse interior is the rectangle{" "}
            <Tex>{"0\\le r\\le 1,\\ 0\\le\\theta\\le 2\\pi"}</Tex>. The Jacobian picks up both axis
            scalings: <Tex>{"\\det D\\Phi = ab\\,r"}</Tex>.
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — half of the ellipsoid's volume (Sol: 2πab/3)",
        content: (
          <>
            <p>
              (Slides) Compute{" "}
              <Tex>{"\\iint_D \\sqrt{1-\\tfrac{x^2}{a^2}-\\tfrac{y^2}{b^2}}\\;dx\\,dy"}</Tex> where{" "}
              <Tex>{"D=\\{\\tfrac{x^2}{a^2}+\\tfrac{y^2}{b^2}\\le 1\\}"}</Tex>. Elliptic coordinates turn
              the integrand into <Tex>{"\\sqrt{1-r^2}"}</Tex> over the rectangle{" "}
              <Tex>{"[0,1]\\times[0,2\\pi]"}</Tex>:
            </p>
            <p>
              <Tex>{"\\int_0^{2\\pi}\\!\\!\\int_0^1 \\sqrt{1-r^2}\\;ab\\,r\\,dr\\,d\\theta = 2\\pi ab\\Big[-\\tfrac13(1-r^2)^{3/2}\\Big]_0^1 = \\tfrac{2\\pi}{3}ab"}</Tex>.
            </p>
            <p>
              Sanity check: this is the volume of the upper half of the ellipsoid with semi-axes{" "}
              <Tex>{"a,b,1"}</Tex>, and indeed{" "}
              <Tex>{"\\tfrac12\\cdot\\tfrac43\\pi ab\\cdot 1 = \\tfrac{2\\pi}{3}ab"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — translated elliptic (Sol: 32 + 15π)",
        content: (
          <>
            <p>
              (Slides) Compute <Tex>{"\\iint_D y^2\\,dx\\,dy"}</Tex> where{" "}
              <Tex>{"D=\\{4(x-3)^2+9(y-2)^2\\le 36,\\ y\\ge 2\\}"}</Tex>. Divide by 36:{" "}
              <Tex>{"\\tfrac{(x-3)^2}{9}+\\tfrac{(y-2)^2}{4}\\le 1"}</Tex> — ellipse centered at{" "}
              <Tex>{"(3,2)"}</Tex> with <Tex>{"a=3,\\ b=2"}</Tex>; keep the upper half.
            </p>
            <p>
              Map: <Tex>{"x=3+3r\\cos\\theta,\\ y=2+2r\\sin\\theta"}</Tex>, Jacobian{" "}
              <Tex>{"abr=6r"}</Tex>, window <Tex>{"0\\le r\\le1,\\ 0\\le\\theta\\le\\pi"}</Tex> (
              <Tex>{"y\\ge2\\iff\\sin\\theta\\ge0"}</Tex>). Expand{" "}
              <Tex>{"y^2=(2+2r\\sin\\theta)^2 = 4+8r\\sin\\theta+4r^2\\sin^2\\theta"}</Tex>:
            </p>
            <p>
              <Tex>{"6\\Big[4\\cdot\\pi\\cdot\\tfrac12 \\;+\\; 8\\cdot 2\\cdot\\tfrac13 \\;+\\; 4\\cdot\\tfrac{\\pi}{2}\\cdot\\tfrac14\\Big] = 12\\pi + 32 + 3\\pi = 32+15\\pi"}</Tex>,
            </p>
            <p>
              using <Tex>{"\\int_0^1 r\\,dr=\\tfrac12"}</Tex>, <Tex>{"\\int_0^1 r^2 dr=\\tfrac13"}</Tex>,{" "}
              <Tex>{"\\int_0^1 r^3 dr=\\tfrac14"}</Tex>,{" "}
              <Tex>{"\\int_0^{\\pi}\\sin\\theta\\,d\\theta=2"}</Tex>,{" "}
              <Tex>{"\\int_0^{\\pi}\\sin^2\\theta\\,d\\theta=\\tfrac{\\pi}{2}"}</Tex>. Slide answer{" "}
              <Tex>{"32+15\\pi"}</Tex> confirmed. Don't forget: the <em>constant</em> term of the expanded
              integrand also gets multiplied by the Jacobian.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Separate whenever the limits are constants",
        content: (
          <>
            Over a disk, annulus, sector or ellipse the new limits are constants, so{" "}
            <Tex>{"\\iint g(r)\\,h(\\theta)\\,r\\,dr\\,d\\theta"}</Tex> splits into{" "}
            <Tex>{"\\big(\\int g(r)\\,r\\,dr\\big)\\big(\\int h(\\theta)\\,d\\theta\\big)"}</Tex> — two
            independent 1D integrals. Every deck example above was computed this way. Massive time-saver
            on the exam.
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
              Evaluate <Tex>{"\\iint_D \\sqrt{x^2+y^2}\\,dx\\,dy"}</Tex> where{" "}
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
          theory: <>Convert the integrand AND multiply by |det DΦ| = r, then integrate inside-out.</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp6",
          difficulty: "medium",
          source: "Slides 4_MultipleIntegrals — elliptic coordinates",
          prompt: (
            <>
              With the elliptic change of variables <Tex>{"x=2r\\cos\\theta,\\ y=3r\\sin\\theta"}</Tex>,
              the integral <Tex>{"\\iint_D f(x,y)\\,dx\\,dy"}</Tex> becomes{" "}
              <Tex>{"\\iint_{D'} f(2r\\cos\\theta,\\,3r\\sin\\theta)\\cdot J\\;dr\\,d\\theta"}</Tex> with{" "}
              <Tex>{"J="}</Tex>
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"r"}</Tex> },
            { id: "B", content: <Tex>{"6r^2"}</Tex> },
            { id: "C", content: <Tex>{"5r"}</Tex> },
            { id: "D", content: <Tex>{"6r"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"D\\Phi=\\begin{pmatrix}2\\cos\\theta & -2r\\sin\\theta\\\\ 3\\sin\\theta & 3r\\cos\\theta\\end{pmatrix}"}</Tex>,
              so{" "}
              <Tex>{"\\det D\\Phi = 6r\\cos^2\\theta+6r\\sin^2\\theta = 6r"}</Tex> — answer D, the general
              pattern <Tex>{"abr"}</Tex> with <Tex>{"a=2,\\ b=3"}</Tex>. A forgets the axis scalings
              entirely (plain polar); B has the wrong power of <Tex>{"r"}</Tex> (that would scale like a
              volume); C adds <Tex>{"a+b"}</Tex> instead of multiplying <Tex>{"ab"}</Tex>.
            </>
          ),
          theory: <>Elliptic coordinates x = a·r·cosθ, y = b·r·sinθ have Jacobian abr; translated versions keep it.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            One theorem, three maps, one habit: convert the region, convert the integrand, pay the
            Jacobian. In three dimensions the same theorem hands us <strong>cylindrical</strong> and{" "}
            <strong>spherical</strong> coordinates — next lesson.
          </p>
        ),
      },
    ],
  },

  /* ============================================================== *
   * LESSON 3 — Triple integrals: segments, layers, cylindrical, spherical
   *  (deck: 4_MultipleIntegrals pp. 26–40)
   * ============================================================== */
  {
    id: "triple-integrals",
    title: "Triple integrals: segments, layers, cylindrical & spherical",
    lecture: MODULE,
    summary:
      "Two reduction routes — vertical segments (xy-normal domains) and layers — plus the 3D changes of variables: cylindrical (Jacobian r) and spherical (r² sin φ).",
    minutes: 30,
    objectives: [
      "Define ∫_Ω f over a solid Ω ⊂ ℝ³ and use Vol(Ω) = ∫_Ω 1 dxdydz",
      "Reduce triple integrals by vertical segments (xy-normal domains) and by layers",
      "Apply cylindrical coordinates (Jacobian r) and spherical coordinates (Jacobian r² sin φ)",
      "Compute the deck's volumes and integrals over balls, cones and paraboloids",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A double integral of <Tex>{"1"}</Tex> measures area. The deck's next question: given a{" "}
            <strong>solid</strong> <Tex>{"\\Omega\\subset\\mathbb{R}^3"}</Tex>, can we compute its
            volume? Yes: <Tex>{"\\text{Vol}(\\Omega) = \\iiint_{\\Omega} 1\\,dx\\,dy\\,dz"}</Tex> — a{" "}
            <strong>triple integral</strong>. The construction copies the 2D one with
            higher-dimensional parallelepipeds, and we often write <Tex>{"\\int_\\Omega f"}</Tex> for{" "}
            <Tex>{"\\iiint_\\Omega f(x,y,z)\\,dx\\,dy\\,dz"}</Tex>.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Triple integral",
        content: (
          <>
            For <Tex>{"\\Omega\\subset\\mathbb{R}^3"}</Tex> open, bounded with{" "}
            <Tex>{"\\text{Vol}(\\Omega)>0"}</Tex> and <Tex>{"f:\\Omega\\to\\mathbb{R}"}</Tex>,{" "}
            <Tex>{"\\iiint_\\Omega f\\,dx\\,dy\\,dz"}</Tex> is defined by approximation with
            parallelepipeds, exactly like the 2D case. All the properties carry over:{" "}
            <strong>linearity</strong>, <strong>additivity</strong> (when{" "}
            <Tex>{"\\text{Vol}(\\Omega_1\\cap\\Omega_2)=0"}</Tex>), <strong>monotonicity</strong>, and{" "}
            <Tex>{"\\int_\\Omega 1 = \\text{Vol}(\\Omega)"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Route 1 — integration on vertical segments" },
      {
        kind: "definition",
        term: "xy-normal domain",
        content: (
          <>
            The deck's idea: reduce a triple integral to <strong>1 standard + 1 double</strong> integral.{" "}
            <Tex>{"\\Omega\\subset\\mathbb{R}^3"}</Tex> is <strong>xy-normal</strong> if{" "}
            <Tex>{"\\Omega=\\{(x,y,z):\\ (x,y)\\in D\\ \\text{and}\\ \\alpha(x,y)\\le z\\le\\beta(x,y)\\}"}</Tex>{" "}
            for some <Tex>{"D\\subset\\mathbb{R}^2"}</Tex> and <Tex>{"\\alpha,\\beta:D\\to\\mathbb{R}"}</Tex>{" "}
            — a bottom surface and a top surface over a plane region. Parallelepipeds{" "}
            <Tex>{"[a_1,b_1]\\times[a_2,b_2]\\times[a_3,b_3]"}</Tex> are xy-normal; the spherical shell{" "}
            <Tex>{"1\\le x^2+y^2+z^2\\le 4"}</Tex> (a “higher-dimensional annulus”) is <strong>not</strong>.
            Analogous definitions: xz-normal and yz-normal domains.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iiint_\\Omega f \\;=\\; \\iint_D\\!\\left(\\int_{\\alpha(x,y)}^{\\beta(x,y)} f(x,y,z)\\,dz\\right)dx\\,dy",
        tag: "6.1",
        caption: (
          <>
            Triple integrals for xy-normal domains — <strong>integration on vertical segments</strong>.{" "}
            <Tex>{"D"}</Tex> is the <em>shadow</em> (projection) of <Tex>{"\\Omega"}</Tex> on the
            xy-plane; each segment runs from the bottom surface <Tex>{"\\alpha"}</Tex> to the top surface{" "}
            <Tex>{"\\beta"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Route 2 — integration by layers" },
      {
        kind: "formula",
        tex: "\\iiint_\\Omega f \\;=\\; \\int_c^d\\!\\left(\\iint_{D_z} f(x,y,z)\\,dx\\,dy\\right)dz \\qquad \\Omega=\\{c\\le z\\le d,\\ (x,y)\\in D_z\\}",
        tag: "6.2",
        caption: (
          <>
            <strong>Integration by layers</strong>: <Tex>{"D_{\\bar z}"}</Tex> is the projection of the
            slice <Tex>{"\\Omega\\cap\\{z=\\bar z\\}"}</Tex> on the xy-plane. Step 1: fix{" "}
            <Tex>{"z"}</Tex> and integrate in <Tex>{"(x,y)"}</Tex>. Step 2: integrate in{" "}
            <Tex>{"z"}</Tex>. For <Tex>{"f=1"}</Tex> it becomes{" "}
            <Tex>{"V=\\int_c^d \\text{Area}(D_z)\\,dz"}</Tex> — stack the slice areas.
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — ∫ z² over the unit ball, both routes (Sol: 4π/15)",
        content: (
          <>
            <p>
              (Slides) <Tex>{"\\Omega=\\{x^2+y^2+z^2\\le1\\}"}</Tex>, compute{" "}
              <Tex>{"\\int_\\Omega z^2\\,dx\\,dy\\,dz"}</Tex> by segments and by layers.
            </p>
            <p>
              <strong>By layers</strong> (the slick way): the slice at height <Tex>{"z"}</Tex> is the disk{" "}
              <Tex>{"D_z=\\{x^2+y^2\\le 1-z^2\\}"}</Tex> of area <Tex>{"\\pi(1-z^2)"}</Tex>, and{" "}
              <Tex>{"z^2"}</Tex> is constant on it:{" "}
              <Tex>{"\\int_{-1}^{1} z^2\\,\\pi(1-z^2)\\,dz = \\pi\\Big[\\tfrac{z^3}{3}-\\tfrac{z^5}{5}\\Big]_{-1}^{1} = \\pi\\Big(\\tfrac23-\\tfrac25\\Big) = \\tfrac{4\\pi}{15}"}</Tex>.
            </p>
            <p>
              <strong>By vertical segments</strong>: shadow <Tex>{"D=\\{x^2+y^2\\le1\\}"}</Tex>, segment{" "}
              <Tex>{"|z|\\le\\sqrt{1-x^2-y^2}"}</Tex>, inner{" "}
              <Tex>{"\\int z^2 dz = \\tfrac23(1-x^2-y^2)^{3/2}"}</Tex>; then polar on the shadow:{" "}
              <Tex>{"\\tfrac23\\cdot 2\\pi\\int_0^1 (1-r^2)^{3/2} r\\,dr = \\tfrac{4\\pi}{3}\\cdot\\tfrac15 = \\tfrac{4\\pi}{15}"}</Tex>.
            </p>
            <p>
              Same value, very different effort. When the integrand depends only on <Tex>{"z"}</Tex> and
              slices are disks, <strong>layers win</strong>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — the sphere's volume by layers",
        content: (
          <>
            <p>
              The ball <Tex>{"x^2+y^2+z^2\\le R^2"}</Tex> sliced at height <Tex>{"z"}</Tex> gives the disk{" "}
              <Tex>{"x^2+y^2\\le R^2-z^2"}</Tex> of area <Tex>{"\\pi(R^2-z^2)"}</Tex>. Stack the layers:
            </p>
            <p>
              <Tex>{"V=\\int_{-R}^{R}\\pi(R^2-z^2)\\,dz = \\pi\\Big[R^2z-\\tfrac{z^3}{3}\\Big]_{-R}^{R} = \\tfrac43\\pi R^3"}</Tex>.
            </p>
            <p>The school formula, derived in two lines — because the slices were disks.</p>
          </>
        ),
      },
      { kind: "heading", text: "Change of variables in 3D — cylindrical coordinates" },
      {
        kind: "prose",
        content: (
          <p>
            The change-of-variables theorem is identical in 3D: for an admissible{" "}
            <Tex>{"\\Phi:\\Omega'\\to\\Omega"}</Tex>,{" "}
            <Tex>{"\\int_\\Omega f\\,dx\\,dy\\,dz = \\int_{\\Omega'} f(\\Phi(u,v,w))\\,|\\det D\\Phi|\\,du\\,dv\\,dw"}</Tex>.{" "}
            <strong>Cylindrical coordinates</strong> are polar in the xy-plane with <Tex>{"z"}</Tex> kept:{" "}
            <Tex>{"x=r\\cos\\theta,\\ y=r\\sin\\theta,\\ z=z"}</Tex>. For each fixed{" "}
            <Tex>{"r>0"}</Tex> the map traces a cylinder with axis the z-axis — hence the name. Use them
            whenever the solid is symmetric about the z-axis: cylinders, cones, paraboloids.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\det D\\Phi(r,\\theta,z) = r \\qquad\\Rightarrow\\qquad \\int_\\Omega f\\,dx\\,dy\\,dz = \\int_{\\Omega'} f(r\\cos\\theta,\\,r\\sin\\theta,\\,z)\\;r\\,dr\\,d\\theta\\,dz",
        tag: "6.3",
        caption: <>Cylindrical coordinates — polar's Jacobian <Tex>{"r"}</Tex> survives unchanged.</>,
      },
      {
        kind: "example",
        title: "Worked example — paraboloid cap",
        content: (
          <>
            <p>
              Volume of the solid under <Tex>{"z=4-x^2-y^2"}</Tex> and above <Tex>{"z=0"}</Tex>. The
              surface meets the plane where <Tex>{"x^2+y^2=4"}</Tex>, so the shadow is the disk{" "}
              <Tex>{"r\\le 2"}</Tex> and the paraboloid reads <Tex>{"z=4-r^2"}</Tex>. Vertical segments +
              cylindrical:
            </p>
            <p>
              <Tex>{"V=\\int_0^{2\\pi}\\!\\!\\int_0^2 (4-r^2)\\,r\\,dr\\,d\\theta = 2\\pi\\Big[2r^2-\\tfrac{r^4}{4}\\Big]_0^2 = 2\\pi(8-4) = 8\\pi"}</Tex>.
            </p>
            <p>
              Segment height <Tex>{"(\\beta-\\alpha)"}</Tex> over a polar shadow — the standard pattern
              for every “under the surface” volume.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — ∫ y²z between two cones (Sol: π/10)",
        content: (
          <>
            <p>
              (Slides) Compute <Tex>{"\\int_\\Omega y^2 z"}</Tex> where{" "}
              <Tex>{"\\Omega=\\{\\sqrt{x^2+y^2}\\le z\\le 2-\\sqrt{x^2+y^2}\\}"}</Tex> — between an
              upward cone and a downward cone. The surfaces meet where <Tex>{"r=2-r"}</Tex>, i.e.{" "}
              <Tex>{"r=1"}</Tex>: the shadow is <Tex>{"r\\le1"}</Tex>.
            </p>
            <p>
              Cylindrical, with <Tex>{"y^2=r^2\\sin^2\\theta"}</Tex> and the segment{" "}
              <Tex>{"r\\le z\\le 2-r"}</Tex>:{" "}
              <Tex>{"\\int_r^{2-r} z\\,dz = \\tfrac{(2-r)^2-r^2}{2} = 2-2r"}</Tex>, so
            </p>
            <p>
              <Tex>{"\\int_\\Omega y^2z = \\Big(\\int_0^{2\\pi}\\sin^2\\theta\\,d\\theta\\Big)\\int_0^1 r^3(2-2r)\\,dr = \\pi\\Big(\\tfrac12-\\tfrac25\\Big) = \\tfrac{\\pi}{10}"}</Tex>.
            </p>
            <p>
              (One <Tex>{"r"}</Tex> is the Jacobian, <Tex>{"r^2"}</Tex> comes from{" "}
              <Tex>{"y^2"}</Tex> — track them separately.) Slide answer <Tex>{"\\pi/10"}</Tex> confirmed.
              The deck also defines <em>translated</em> cylindrical coordinates (center{" "}
              <Tex>{"(x_0,y_0,z_0)"}</Tex>) and cylindrical coordinates about the y-axis — same game,
              swapped components.
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
        term: "Spherical coordinates (r, θ, φ)",
        content: (
          <>
            <Tex>{"x=r\\sin\\varphi\\cos\\theta,\\quad y=r\\sin\\varphi\\sin\\theta,\\quad z=r\\cos\\varphi"}</Tex>,
            with <Tex>{"r>0"}</Tex> the distance from the origin,{" "}
            <Tex>{"\\theta\\in[0,2\\pi)"}</Tex> the usual horizontal angle, and{" "}
            <Tex>{"\\varphi\\in[0,\\pi]"}</Tex> the angle measured <em>down from the positive z-axis</em>.
            A sphere is <Tex>{"r=\\text{const}"}</Tex>; a cone through the origin is{" "}
            <Tex>{"\\varphi=\\text{const}"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\big|\\det D\\Phi(r,\\theta,\\varphi)\\big| = r^2\\sin\\varphi \\qquad\\Rightarrow\\qquad \\int_\\Omega f = \\int_{\\Omega'} f(r\\sin\\varphi\\cos\\theta,\\ r\\sin\\varphi\\sin\\theta,\\ r\\cos\\varphi)\\;r^2\\sin\\varphi\\;dr\\,d\\theta\\,d\\varphi",
        tag: "6.4",
        caption: (
          <>
            The spherical cell is a near-box with sides <Tex>{"dr"}</Tex>,{" "}
            <Tex>{"r\\,d\\varphi"}</Tex> and <Tex>{"r\\sin\\varphi\\,d\\theta"}</Tex> — multiply them to
            get the Jacobian.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "warn",
        title: "Convention check",
        content: (
          <>
            The professor writes the spherical radius as <Tex>{"r"}</Tex>; many textbooks use{" "}
            <Tex>{"\\rho"}</Tex> and some swap the letters <Tex>{"\\varphi"}</Tex> and{" "}
            <Tex>{"\\theta"}</Tex>. What never changes: the angle from the z-axis lives in{" "}
            <Tex>{"[0,\\pi]"}</Tex>, the horizontal angle in <Tex>{"[0,2\\pi]"}</Tex>, and the{" "}
            <Tex>{"\\sin"}</Tex> in the Jacobian is of the <em>z-axis angle</em>. State your convention on
            the exam and stay consistent.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — volume of the ball, by spherical",
        content: (
          <>
            <p>
              The ball of radius <Tex>{"R"}</Tex> has constant limits in all three variables, so
              everything separates:
            </p>
            <p>
              <Tex>{"V=\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi}\\!\\!\\int_0^R r^2\\sin\\varphi\\,dr\\,d\\varphi\\,d\\theta = 2\\pi\\cdot\\Big[-\\cos\\varphi\\Big]_0^{\\pi}\\cdot\\tfrac{R^3}{3} = 2\\pi\\cdot 2\\cdot\\tfrac{R^3}{3} = \\tfrac43\\pi R^3"}</Tex>.
            </p>
            <p>
              Note <Tex>{"\\int_0^{\\pi}\\sin\\varphi\\,d\\varphi = 2"}</Tex> — memorize this little
              value, it appears in nearly every spherical computation.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck examples — half-ball and cone (Sol: 2π/15 and π/4)",
        content: (
          <>
            <p>
              (Slides) <Tex>{"\\int_\\Omega z^2"}</Tex> on the half-ball{" "}
              <Tex>{"\\{z\\ge0,\\ x^2+y^2+z^2\\le1\\}"}</Tex>. <strong>Spherical</strong> (
              <Tex>{"\\varphi\\le\\tfrac{\\pi}{2}"}</Tex>):{" "}
              <Tex>{"2\\pi\\int_0^{\\pi/2}\\cos^2\\varphi\\sin\\varphi\\,d\\varphi\\int_0^1 r^4\\,dr = 2\\pi\\cdot\\tfrac13\\cdot\\tfrac15 = \\tfrac{2\\pi}{15}"}</Tex>{" "}
              (with <Tex>{"z^2=r^2\\cos^2\\varphi"}</Tex>). <strong>Cylindrical</strong>:{" "}
              <Tex>{"2\\pi\\int_0^1 r\\,\\tfrac{(1-r^2)^{3/2}}{3}\\,dr = \\tfrac{2\\pi}{3}\\cdot\\tfrac15 = \\tfrac{2\\pi}{15}"}</Tex>.
              Same answer — half of the full ball's <Tex>{"\\tfrac{4\\pi}{15}"}</Tex>, as symmetry
              demands.
            </p>
            <p>
              (Slides) <Tex>{"\\int_\\Omega z"}</Tex> on the cone{" "}
              <Tex>{"\\{\\sqrt{x^2+y^2}\\le z\\le 1\\}"}</Tex>, three ways. <strong>Layers</strong>: the
              slice at height <Tex>{"z"}</Tex> is the disk <Tex>{"r\\le z"}</Tex>, so{" "}
              <Tex>{"\\int_0^1 z\\cdot\\pi z^2\\,dz = \\tfrac{\\pi}{4}"}</Tex>.{" "}
              <strong>Vertical segments / cylindrical</strong>:{" "}
              <Tex>{"2\\pi\\int_0^1 r\\,\\tfrac{1-r^2}{2}\\,dr = \\pi\\big(\\tfrac12-\\tfrac14\\big) = \\tfrac{\\pi}{4}"}</Tex>.
              Layers needed one line — always ask which route fits before computing.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — a ball octant with the θ-window doing the work",
        content: (
          <>
            <p>
              (Slides) Compute <Tex>{"\\int_\\Omega (3x+4y)\\,dx\\,dy\\,dz"}</Tex> on the first-octant
              piece of the unit ball, <Tex>{"\\{x^2+y^2+z^2\\le1,\\ x,y,z\\ge0\\}"}</Tex>. Spherical:{" "}
              <Tex>{"r\\in[0,1],\\ \\varphi\\in[0,\\tfrac{\\pi}{2}],\\ \\theta\\in[0,\\tfrac{\\pi}{2}]"}</Tex>,
              and <Tex>{"3x+4y = r\\sin\\varphi\\,(3\\cos\\theta+4\\sin\\theta)"}</Tex>. Everything
              separates:
            </p>
            <p>
              <Tex>{"\\int_0^1 r^3 dr\\cdot\\int_0^{\\pi/2}\\sin^2\\varphi\\,d\\varphi\\cdot\\int_0^{\\pi/2}(3\\cos\\theta+4\\sin\\theta)\\,d\\theta = \\tfrac14\\cdot\\tfrac{\\pi}{4}\\cdot\\big[3\\sin\\theta-4\\cos\\theta\\big]_0^{\\pi/2} = \\tfrac14\\cdot\\tfrac{\\pi}{4}\\cdot 7 = \\tfrac{7\\pi}{16}"}</Tex>.
            </p>
            <p>
              This matches the slide's stated answer <Tex>{"\\tfrac{7\\pi}{16}"}</Tex>. <strong>Heads
              up:</strong> the slide's region is printed with “<Tex>{"x\\le 0"}</Tex>”; with that region
              the θ-window is <Tex>{"[\\tfrac{\\pi}{2},\\pi]"}</Tex>, the angular factor becomes{" "}
              <Tex>{"\\big[3\\sin\\theta-4\\cos\\theta\\big]_{\\pi/2}^{\\pi} = 4-3 = 1"}</Tex>, and the
              value is <Tex>{"\\tfrac{\\pi}{16}"}</Tex> — so the printed answer belongs to{" "}
              <Tex>{"x\\ge0"}</Tex>. Whole exercise, either way, lives in the θ-window: get it from the
              sign constraints on <Tex>{"x"}</Tex> and <Tex>{"y"}</Tex>, never by default.
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
                Planes and boxes ⇒ Cartesian (vertical segments or layers directly). Cylinders{" "}
                <Tex>{"x^2+y^2=a^2"}</Tex>, cones <Tex>{"z=k\\sqrt{x^2+y^2}"}</Tex>, paraboloids ⇒
                cylindrical. Spheres centered at the origin ⇒ spherical.
              </>
            ),
          },
          {
            label: "Rewrite each surface",
            content: (
              <>
                Cylindrical: sphere <Tex>{"z^2=R^2-r^2"}</Tex>, cone <Tex>{"z=kr"}</Tex>, paraboloid{" "}
                <Tex>{"z=a-r^2"}</Tex>. Spherical: sphere <Tex>{"r=R"}</Tex>, cone{" "}
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
            label: "Pay the Jacobian and integrate inside-out",
            content: (
              <>
                <Tex>{"r"}</Tex> for cylindrical, <Tex>{"r^2\\sin\\varphi"}</Tex> for spherical. If all
                limits are constants, separate the three integrals.
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
              vertical segments run from <Tex>{"z=r"}</Tex> to <Tex>{"z=2"}</Tex>:{" "}
              <Tex>{"V=\\int_0^{2\\pi}\\!\\int_0^2 (2-r)\\,r\\,dr\\,d\\theta = 2\\pi\\big(4-\\tfrac83\\big) = \\tfrac{8\\pi}{3}"}</Tex>{" "}
              — answer D (it is a cone of radius 2 and height 2, and{" "}
              <Tex>{"\\tfrac13\\pi R^2 h = \\tfrac{8\\pi}{3}"}</Tex> checks). A (<Tex>{"4\\pi"}</Tex>)
              forgets the Jacobian <Tex>{"r"}</Tex>; B integrates <Tex>{"r\\cdot r"}</Tex>, i.e. swaps top
              and bottom and measures the region between the cone and the cylinder wall; C (
              <Tex>{"8\\pi"}</Tex>) is the full cylinder with the cone never subtracted.
            </>
          ),
          theory: <>Segment height = top surface − bottom surface, times the Jacobian r, over the shadow.</>,
        },
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-int-cp7",
          difficulty: "medium",
          source: "Slides 4_MultipleIntegrals — integration by layers",
          prompt: (
            <>
              Using integration by layers, <Tex>{"\\int_\\Omega z\\,dx\\,dy\\,dz"}</Tex> over the cone{" "}
              <Tex>{"\\Omega=\\{\\sqrt{x^2+y^2}\\le z\\le 1\\}"}</Tex> reduces to which single integral?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"\\int_0^1 \\pi z^3\\,dz"}</Tex> },
            { id: "B", content: <Tex>{"\\int_0^1 \\pi z^2\\,dz"}</Tex> },
            { id: "C", content: <Tex>{"\\int_0^1 2\\pi z^3\\,dz"}</Tex> },
            { id: "D", content: <Tex>{"\\int_0^1 \\pi z^4\\,dz"}</Tex> },
          ],
          correct: "A",
          explanation: (
            <>
              The slice at height <Tex>{"z"}</Tex> is <Tex>{"D_z=\\{x^2+y^2\\le z^2\\}"}</Tex>, a disk of
              area <Tex>{"\\pi z^2"}</Tex>; the integrand <Tex>{"z"}</Tex> is constant on it, so{" "}
              <Tex>{"\\iint_{D_z} z\\,dx\\,dy = z\\cdot\\pi z^2 = \\pi z^3"}</Tex> — answer A, giving{" "}
              <Tex>{"\\tfrac{\\pi}{4}"}</Tex> total. B is the volume computation (integrand 1), dropping
              the factor <Tex>{"z"}</Tex>; C doubles for no reason (the <Tex>{"2\\pi"}</Tex> of polar is
              already inside <Tex>{"\\pi z^2"}</Tex>); D multiplies by <Tex>{"z^2"}</Tex> instead of{" "}
              <Tex>{"z"}</Tex>.
            </>
          ),
          theory: <>Layers: fix z, integrate over the slice D_z (constant-in-z factors come out), then integrate in z.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Jacobian traps in 3D",
        content: (
          <>
            Writing <Tex>{"r^2\\,dr\\,d\\theta\\,d\\varphi"}</Tex> (missing{" "}
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
            quantities the deck closes with: <strong>mass and the baricenter</strong>.
          </p>
        ),
      },
    ],
  },

  /* ============================================================== *
   * LESSON 4 — Applications: volume, mass, baricenter
   *  (deck: 4_MultipleIntegrals pp. 41–43)
   * ============================================================== */
  {
    id: "integral-applications",
    title: "Applications: volume, mass & the baricenter",
    lecture: MODULE,
    summary:
      "The deck's closing chapter: integrate 1 for volume, a density f for mass, and x·f/m for the baricenter (center of mass) — of plates and solids.",
    minutes: 18,
    objectives: [
      "Compute areas and volumes as integrals of the constant 1",
      "Compute the mass of a plate or solid with density f",
      "Locate the baricenter (center of mass) G = (x̄, ȳ, z̄)",
      "Exploit symmetry to skip integrals entirely",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Every application in this module is the same machine with a different integrand. Integrate{" "}
            <Tex>{"1"}</Tex> and you measure the region itself (area in 2D, volume in 3D). Integrate a{" "}
            <strong>density</strong> <Tex>{"f:\\Omega\\to(0,\\infty)"}</Tex> — mass per unit volume, the
            deck's Formula 1 wheel with its dense hub — and you get <strong>mass</strong>. Weight the
            position by the density and you get the <strong>baricenter</strong>, the point where the solid
            balances.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\text{Vol}(\\Omega)=\\iiint_\\Omega 1\\,dx\\,dy\\,dz,\\qquad m(\\Omega)=\\iiint_\\Omega f(x,y,z)\\,dx\\,dy\\,dz",
        tag: "7.1",
        caption: (
          <>
            Volume and mass of a solid with density <Tex>{"f"}</Tex>. RMK: if <Tex>{"f=1"}</Tex>, then{" "}
            <Tex>{"\\text{Vol}(\\Omega)=m(\\Omega)"}</Tex>. (Many books write the density as{" "}
            <Tex>{"\\delta"}</Tex> or <Tex>{"\\mu"}</Tex> — the professor uses <Tex>{"f"}</Tex>.)
          </>
        ),
      },
      {
        kind: "definition",
        term: "Baricenter (center of mass)",
        content: (
          <>
            The <strong>center of mass</strong> <Tex>{"G=(\\bar x,\\bar y,\\bar z)"}</Tex> of a solid{" "}
            <Tex>{"\\Omega"}</Tex> with density <Tex>{"f"}</Tex> is given by{" "}
            <Tex>{"\\bar x = \\tfrac{1}{m(\\Omega)}\\int_\\Omega x\\,f(x,y,z)\\,dx\\,dy\\,dz"}</Tex>, and
            analogously for <Tex>{"\\bar y,\\ \\bar z"}</Tex> — mass-weighted average position. Analogous
            definitions with double integrals if the body is a plate <Tex>{"D\\subset\\mathbb{R}^2"}</Tex>.
            With constant density the <Tex>{"f"}</Tex> cancels and <Tex>{"G"}</Tex> (then often called the{" "}
            <em>centroid</em>) is purely geometric: integrals of <Tex>{"x,y"}</Tex> divided by the area.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\bar x = \\frac{1}{m}\\iint_D x\\,f\\,dx\\,dy,\\qquad \\bar y = \\frac{1}{m}\\iint_D y\\,f\\,dx\\,dy \\qquad\\text{(plate } D\\subset\\mathbb{R}^2\\text{)}",
        tag: "7.2",
        caption: <>Moment over mass — each coordinate separately.</>,
      },
      {
        kind: "callout",
        tone: "key",
        title: "Symmetry first — integrate second",
        content: (
          <>
            If the region <em>and</em> the density are symmetric about a line, the baricenter lies on that
            line — no integral needed for that coordinate. The baricenter of a disk, square or annulus
            with constant density is its center, instantly. Always harvest symmetry before computing; it
            can halve the exam problem.
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — mass and baricenter of a parabolic plate",
        content: (
          <>
            <p>
              (Slides) Let <Tex>{"D=\\{x,y\\ge0,\\ x\\le 1-y^2\\}"}</Tex> be a plate with density{" "}
              <Tex>{"f(x,y)=y"}</Tex>. Compute the mass and the baricenter. <Tex>{"D"}</Tex> is y-normal:{" "}
              <Tex>{"0\\le y\\le 1"}</Tex>, <Tex>{"0\\le x\\le 1-y^2"}</Tex>.
            </p>
            <p>
              <strong>Mass:</strong>{" "}
              <Tex>{"m(D)=\\int_0^1\\!\\!\\int_0^{1-y^2} y\\,dx\\,dy = \\int_0^1 y(1-y^2)\\,dy = \\tfrac12-\\tfrac14 = \\tfrac14"}</Tex>.
            </p>
            <p>
              <strong>x̄:</strong>{" "}
              <Tex>{"\\bar x = 4\\int_0^1 y\\Big[\\tfrac{x^2}{2}\\Big]_0^{1-y^2} dy = 2\\int_0^1 y(1-y^2)^2\\,dy = 2\\cdot\\tfrac16 = \\tfrac13"}</Tex>{" "}
              (substitute <Tex>{"u=1-y^2"}</Tex>).
            </p>
            <p>
              <strong>ȳ:</strong>{" "}
              <Tex>{"\\bar y = 4\\int_0^1\\!\\!\\int_0^{1-y^2} y^2\\,dx\\,dy = 4\\int_0^1 y^2(1-y^2)\\,dy = 4\\Big(\\tfrac13-\\tfrac15\\Big) = \\tfrac{8}{15}"}</Tex>.
            </p>
            <p>
              Baricenter <Tex>{"G=(\\tfrac13,\\tfrac{8}{15})"}</Tex> — the slide's answer. Sanity check:{" "}
              <Tex>{"\\bar y=\\tfrac{8}{15}>\\tfrac12\\cdot\\tfrac34"}</Tex>-ish because the density{" "}
              <Tex>{"f=y"}</Tex> drags mass upward; both coordinates land inside the plate.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Deck example — half disk with constant density (Sol: (8/3π, 0))",
        content: (
          <>
            <p>
              (Slides) <Tex>{"D=\\{x\\ge0,\\ -\\sqrt{4-x^2}\\le y\\le\\sqrt{4-x^2}\\}"}</Tex> — the right
              half of the disk of radius 2 — with <em>constant</em> density{" "}
              <Tex>{"f(x,y)=k>0"}</Tex>. Compute the baricenter.
            </p>
            <p>
              <strong>Symmetry:</strong> region and density are symmetric in <Tex>{"y\\mapsto-y"}</Tex>,
              so <Tex>{"\\bar y=0"}</Tex> — for free. <strong>Mass:</strong>{" "}
              <Tex>{"m=k\\cdot\\text{Area} = k\\cdot\\tfrac{\\pi\\cdot 2^2}{2} = 2\\pi k"}</Tex>.
            </p>
            <p>
              <strong>x̄ in polar</strong> (<Tex>{"\\theta\\in[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</Tex>,{" "}
              <Tex>{"r\\in[0,2]"}</Tex>):{" "}
              <Tex>{"\\bar x = \\tfrac{1}{2\\pi k}\\,k\\int_{-\\pi/2}^{\\pi/2}\\!\\!\\int_0^2 r\\cos\\theta\\cdot r\\,dr\\,d\\theta = \\tfrac{1}{2\\pi}\\cdot\\tfrac83\\cdot 2 = \\tfrac{8}{3\\pi}"}</Tex>.
            </p>
            <p>
              Baricenter <Tex>{"\\big(\\tfrac{8}{3\\pi},\\,0\\big)\\approx(0.85,\\,0)"}</Tex> — the
              slide's answer. Note <Tex>{"k"}</Tex> cancelled: for constant density the baricenter is pure
              geometry (the general half-disk rule <Tex>{"\\tfrac{4R}{3\\pi}"}</Tex> with{" "}
              <Tex>{"R=2"}</Tex>).
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Centroid of a triangle — integral vs geometry" },
      {
        kind: "example",
        title: "Centroid of the triangle (0,0), (2,0), (2,2)",
        content: (
          <>
            <p>
              The triangle is <Tex>{"0\\le y\\le x,\\ 0\\le x\\le 2"}</Tex> (the sim's third preset), with
              area <Tex>{"A=\\tfrac12\\cdot 2\\cdot 2 = 2"}</Tex>. Constant density, so the baricenter is
              geometric.
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
        title: "Mass of a quarter disk with density f = x² + y²",
        content: (
          <>
            <p>
              Quarter disk <Tex>{"x^2+y^2\\le 4"}</Tex>, <Tex>{"x,y\\ge 0"}</Tex>, density growing with
              the distance squared. Polar is mandatory: <Tex>{"f = r^2"}</Tex>, region{" "}
              <Tex>{"0\\le r\\le 2,\\ 0\\le\\theta\\le\\tfrac{\\pi}{2}"}</Tex>.
            </p>
            <p>
              <Tex>{"m=\\int_0^{\\pi/2}\\!\\!\\int_0^2 r^2\\cdot r\\,dr\\,d\\theta = \\tfrac{\\pi}{2}\\Big[\\tfrac{r^4}{4}\\Big]_0^2 = \\tfrac{\\pi}{2}\\cdot 4 = 2\\pi"}</Tex>.
            </p>
            <p>
              Because the plate is heavier far from the origin, its baricenter sits farther out than the
              geometric centroid — density drags mass toward where <Tex>{"f"}</Tex> is large.
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
                Area/volume ⇒ integrand 1. Mass ⇒ integrand <Tex>{"f"}</Tex> (the density). Baricenter ⇒
                integrands <Tex>{"x\\,f,\\ y\\,f,\\ z\\,f"}</Tex>, each divided by <Tex>{"m"}</Tex>.
              </>
            ),
          },
          {
            label: "Pick coordinates from the region",
            content: (
              <>
                Circular pieces ⇒ polar/cylindrical/spherical with the right Jacobian; straight-edged
                pieces ⇒ Cartesian normal domains.
              </>
            ),
          },
          {
            label: "Compute the mass, then the moments",
            content: (
              <>
                First <Tex>{"m"}</Tex> (or the area), then <Tex>{"\\iint x\\,f"}</Tex> and{" "}
                <Tex>{"\\iint y\\,f"}</Tex>; divide each by <Tex>{"m"}</Tex>.
              </>
            ),
          },
          {
            label: "Sanity-check the point",
            content: (
              <>
                The baricenter must lie inside the convex hull of the region, on any symmetry line,
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
              For a plate <Tex>{"D"}</Tex> with density <Tex>{"f(x,y)"}</Tex> and mass{" "}
              <Tex>{"m"}</Tex>, the coordinate <Tex>{"\\bar x"}</Tex> of the baricenter is:
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"\\dfrac{1}{\\text{Area}(D)}\\displaystyle\\iint_D x\\,dx\\,dy"}</Tex> },
            { id: "B", content: <Tex>{"\\dfrac{1}{m}\\displaystyle\\iint_D x\\,f(x,y)\\,dx\\,dy"}</Tex> },
            { id: "C", content: <Tex>{"\\dfrac{1}{m}\\displaystyle\\iint_D f(x,y)\\,dx\\,dy"}</Tex> },
            { id: "D", content: <Tex>{"\\displaystyle\\iint_D x\\,f(x,y)\\,dx\\,dy"}</Tex> },
          ],
          correct: "B",
          explanation: (
            <>
              The baricenter is the mass-weighted average of <Tex>{"x"}</Tex>: moment divided by mass —
              answer B, the professor's formula{" "}
              <Tex>{"\\bar x = \\tfrac{1}{m(\\Omega)}\\int_\\Omega x\\,f"}</Tex>. A is the{" "}
              <em>centroid</em>, correct only when <Tex>{"f"}</Tex> is constant; C equals{" "}
              <Tex>{"m/m=1"}</Tex>, not a coordinate at all; D is the bare moment, which still has to be
              divided by <Tex>{"m"}</Tex>.
            </>
          ),
          theory: <>Baricenter = moment / mass; the centroid is the special case f = const.</>,
        },
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Free answers worth memorizing",
        content: (
          <>
            Triangle: baricenter = average of the three vertices. Half disk of radius <Tex>{"R"}</Tex>:{" "}
            <Tex>{"\\tfrac{4R}{3\\pi}"}</Tex> from the center along the symmetry axis (the deck's{" "}
            <Tex>{"\\tfrac{8}{3\\pi}"}</Tex> for <Tex>{"R=2"}</Tex>). Quarter disk of radius{" "}
            <Tex>{"R"}</Tex>: <Tex>{"\\big(\\tfrac{4R}{3\\pi},\\tfrac{4R}{3\\pi}\\big)"}</Tex>. These make
            superb sanity checks — and occasionally the whole answer.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            That closes the integration module: you can describe a region or solid, reduce over normal
            domains or layers, change variables with the right Jacobian, and turn the integral into
            geometry or physics. Next these skills feed into <strong>line integrals and vector
            fields</strong>, where Green's theorem converts circulation into exactly the double integrals
            you now master.
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
