import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { PathLimitSim } from "../sims/PathLimitSim";

export const MODULE = "Limits & continuity";

/* ========== Model-graph gallery table (deck pp. 4–7: the four surfaces) ========== */
function ModelSurfacesTable() {
  const rows = [
    ["f(x,y) = x² + y²", "paraboloid (a bowl)", "height = squared distance from O — steepens as you walk out"],
    ["f(x,y) = x² − y²", "saddle (the Pringle)", "up along the x-axis, down along the y-axis"],
    ["f(x,y) = √(x²+y²)", "cone", "height = distance from O — constant slope, sharp tip"],
    ["f(x,y) = √(1−x²−y²)", "upper unit hemisphere", "z ≥ 0 part of x²+y²+z² = 1, only over the closed disk"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Function</th>
            <th className="border-b border-[var(--color-line)] p-2">Graph in R³</th>
            <th className="border-b border-[var(--color-line)] p-2">How to see it</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs text-[var(--color-ink)]">{r[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs font-semibold">{r[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ========== Level-set contour figure for f = x² + y² (deck p. 16) ========== */
function LevelSetFigure() {
  const cx = 180;
  const cy = 110;
  const scale = 40; // radius in px of the c = 1 circle; radius(c) = scale·√c
  const cs = [1, 2, 3, 4];
  return (
    <svg
      viewBox="0 0 360 220"
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label="Concentric level-set circles of x squared plus y squared"
    >
      {/* axes */}
      <line x1={20} y1={cy} x2={340} y2={cy} stroke="var(--color-line)" strokeWidth={1} />
      <line x1={cx} y1={12} x2={cx} y2={208} stroke="var(--color-line)" strokeWidth={1} />
      {/* level circles at radius √c */}
      {cs.map((c) => (
        <circle
          key={c}
          cx={cx}
          cy={cy}
          r={scale * Math.sqrt(c)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={c === 1 || c === 4 ? 2 : 1.2}
          opacity={0.45 + 0.12 * c}
        />
      ))}
      {/* the degenerate c = 0 level set: just the origin */}
      <circle cx={cx} cy={cy} r={3} fill="var(--color-ink)" />
      <text x={cx + 6} y={cy + 15} fontSize={10} fill="var(--color-muted)">
        S₀ = {"{O}"}
      </text>
      <text x={cx + scale + 4} y={cy - 6} fontSize={10} fill="var(--color-muted)">
        c = 1
      </text>
      <text x={cx + scale * 2 + 4} y={cy - 6} fontSize={10} fill="var(--color-muted)">
        c = 4
      </text>
    </svg>
  );
}

/* ========== Interior vs boundary point figure (deck p. 27) ========== */
function InteriorBoundaryFigure() {
  // region D drawn as an ellipse so boundary points are exact
  const ex = 170;
  const ey = 115;
  const rx = 120;
  const ry = 75;
  // boundary point Q on the ellipse at parameter t = 0.6
  const qx = ex + rx * Math.cos(0.6);
  const qy = ey + ry * Math.sin(0.6);
  return (
    <svg
      viewBox="0 0 360 230"
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label="Interior point P with a ball inside D and boundary point Q whose balls meet both sides"
    >
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
      <text x={ex - rx + 14} y={ey - ry + 28} fontSize={13} fontWeight={700} fill="var(--accent)">
        D
      </text>
      <text x={ex - 88} y={ey + ry + 20} fontSize={11} fill="var(--color-muted)">
        ∂D = the set of all boundary points
      </text>
      {/* interior point P: a whole ball fits inside D */}
      <circle cx={140} cy={95} r={30} fill="none" stroke="var(--good)" strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={140} cy={95} r={3.5} fill="var(--good)" />
      <text x={148} y={90} fontSize={12} fontWeight={700} fill="var(--good)">
        P
      </text>
      <text x={86} y={56} fontSize={10} fill="var(--color-muted)">
        B_r(P) ⊂ D
      </text>
      {/* boundary point Q: every ball meets D and its complement */}
      <circle cx={qx} cy={qy} r={16} fill="none" stroke="var(--bad)" strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={qx} cy={qy} r={28} fill="none" stroke="var(--bad)" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.6} />
      <circle cx={qx} cy={qy} r={3.5} fill="var(--bad)" />
      <text x={qx + 8} y={qy - 8} fontSize={12} fontWeight={700} fill="var(--bad)">
        Q
      </text>
      <text x={qx - 34} y={qy + 44} fontSize={10} fill="var(--color-muted)">
        every B_r(Q) pokes out
      </text>
    </svg>
  );
}

/* ========== Path-test comparison table for the limits lesson ========== */
function PathTable() {
  const rows = [
    ["f = xy/(x²+y²)", "0", "m/(1+m²)", "→ 0", "no — each line has its own value"],
    ["f = 2x²y/(x²+y²)", "0", "→ 0", "→ 0", "yes — limit 0 (proved from the definition)"],
    ["f = x²y/(x⁴+y²)", "0", "→ 0", "1/2", "no — the parabola disagrees with every line"],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Function</th>
            <th className="border-b border-[var(--color-line)] p-2">α(t) = (t, 0)</th>
            <th className="border-b border-[var(--color-line)] p-2">Lines y = m·x</th>
            <th className="border-b border-[var(--color-line)] p-2">β(t) = (t, t²)</th>
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

export const lessons: Lesson[] = [
  /* ================================================================
   * LESSON 1 — Scalar functions & their domains (deck pp. 2–14)
   * ================================================================ */
  {
    id: "scalar-functions-domains",
    title: "Scalar functions of several variables & domains",
    lecture: MODULE,
    summary:
      "f : D ⊆ R² → R eats a point and returns one number. Job one, always: find the domain D and picture the graph.",
    minutes: 16,
    objectives: [
      "Recognize a scalar function of several variables and its domain D",
      "Find the natural domain of formulas with roots, quotients and logarithms",
      "Describe graphs as surfaces in R³ (and hypersurfaces beyond)",
      "Match the four model graphs: paraboloid, saddle, cone, hemisphere",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            The deck opens with the MA1 recap: a function <Tex>{"f: A \\to B"}</Tex> is a{" "}
            <em>law</em> that associates to <strong>every</strong> input <Tex>{"a \\in A"}</Tex>{" "}
            <strong>exactly one</strong> output <Tex>{"b \\in B"}</Tex>. Nothing about that changes
            now — what changes is the input. It is no longer one number but a <strong>point</strong>:
            a pair <Tex>{"(x,y)"}</Tex> or a triple <Tex>{"(x,y,z)"}</Tex> of real numbers. The
            output stays a single real number — a <em>scalar</em> — which is why these are called
            scalar functions of several variables.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Scalar function of several variables",
        content: (
          <>
            In this chapter we study functions of the form{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R}^2 \\to \\mathbb{R},\\ (x,y) \\mapsto f(x,y)"}</Tex>{" "}
            and{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R}^3 \\to \\mathbb{R},\\ (x,y,z) \\mapsto f(x,y,z)"}</Tex>,
            where the set <Tex>{"D"}</Tex> is the <strong>domain</strong> of <Tex>{"f"}</Tex>.
            Input: a pair/triple of real numbers. Output: a real number. We will often write{" "}
            <Tex>{"f = f(p)"}</Tex>, where <Tex>{"p = (x,y) \\in \\mathbb{R}^2"}</Tex> or{" "}
            <Tex>{"p = (x,y,z) \\in \\mathbb{R}^3"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Finding the domain" },
      {
        kind: "prose",
        content: (
          <p>
            When only a formula is given — every “find the domain of <Tex>{"f"}</Tex>” exercise in
            the deck — the domain is understood to be the <strong>largest</strong> set of points
            where the formula makes sense. Three suspects restrict it, and each treats its boundary
            differently.
          </p>
        ),
      },
      {
        kind: "steps",
        title: "Domain checklist",
        steps: [
          {
            label: "Even roots",
            content: (
              <>
                Argument <Tex>{"\\ge 0"}</Tex> — the boundary <strong>is allowed</strong> (the root
                of 0 is 0).
              </>
            ),
          },
          {
            label: "Quotients",
            content: (
              <>
                Denominator <Tex>{"\\ne 0"}</Tex> — you delete only the curve/surface where it
                vanishes, not a whole region.
              </>
            ),
          },
          {
            label: "Logarithms",
            content: (
              <>
                Argument <Tex>{"> 0"}</Tex>, <strong>strictly</strong> — the boundary is{" "}
                <strong>excluded</strong>.
              </>
            ),
          },
          {
            label: "Combine",
            content: <>Intersect all the conditions, then describe the resulting set geometrically.</>,
          },
        ],
      },
      {
        kind: "example",
        title: "Worked domains from the deck",
        content: (
          <>
            <p>
              <Tex>{"f(x,y)=\\sqrt{1-x^2-y^2}"}</Tex>: need <Tex>{"1-x^2-y^2 \\ge 0"}</Tex>, i.e.{" "}
              <Tex>{"x^2+y^2 \\le 1"}</Tex> — the <strong>closed unit disk</strong>, boundary circle
              included.
            </p>
            <p>
              <Tex>{"f(x,y)=\\sqrt{y-x+1}"}</Tex>: need <Tex>{"y \\ge x-1"}</Tex> — the closed
              half-plane on and above the line <Tex>{"y = x-1"}</Tex>.
            </p>
            <p>
              <Tex>{"f(x,y,z)=\\dfrac{xyz}{x-1}"}</Tex>: only <Tex>{"x \\ne 1"}</Tex> — all of{" "}
              <Tex>{"\\mathbb{R}^3"}</Tex> minus the plane <Tex>{"x=1"}</Tex>.
            </p>
            <p>
              <Tex>{"f(x,y,z)=\\log(4-x^2-y^2-z^2)"}</Tex>: need <Tex>{"x^2+y^2+z^2 < 4"}</Tex> —
              the <strong>open ball of radius 2</strong> centered at the origin, boundary sphere
              excluded.
            </p>
            <p>
              <Tex>{"f(x,y)=\\dfrac{1}{9x^2+4y^2-36}"}</Tex>: need <Tex>{"9x^2+4y^2 \\ne 36"}</Tex>{" "}
              — the plane minus the <em>ellipse</em>{" "}
              <Tex>{"\\tfrac{x^2}{4}+\\tfrac{y^2}{9}=1"}</Tex> (only the curve is removed; both the
              inside and the outside survive).
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Strict or not — that is the mark",
        content: (
          <>
            <Tex>{"\\sqrt{\\;\\cdot\\;}"}</Tex> keeps its boundary (<Tex>{"\\ge"}</Tex>);{" "}
            <Tex>{"\\log"}</Tex> loses it (<Tex>{">"}</Tex>); a denominator removes only the set
            where it vanishes. Writing <Tex>{"x^2+y^2+z^2 \\le 4"}</Tex> for the domain of{" "}
            <Tex>{"\\log(4-x^2-y^2-z^2)"}</Tex> is the classic dropped mark: on the sphere the
            argument is 0 and <Tex>{"\\log 0"}</Tex> does not exist. Whether the boundary is in or
            out is exactly the open/closed language two lessons from now.
          </>
        ),
      },
      { kind: "heading", text: "Graphs: curve → surface → hypersurface" },
      {
        kind: "prose",
        content: (
          <p>
            The deck's remarks: the graph of{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R} \\to \\mathbb{R}"}</Tex> is a <strong>curve</strong>{" "}
            in <Tex>{"\\mathbb{R}^2"}</Tex>; the graph of{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R}^2 \\to \\mathbb{R}"}</Tex> is a{" "}
            <strong>surface</strong> in <Tex>{"\\mathbb{R}^3"}</Tex> — often not easy to visualize;
            the graph of <Tex>{"f: D \\subseteq \\mathbb{R}^n \\to \\mathbb{R}"}</Tex> is called a{" "}
            <strong>hypersurface</strong> in <Tex>{"\\mathbb{R}^{n+1}"}</Tex> — very hard to
            visualize (the professor adds: “someone says impossible”). Four model surfaces come back
            all semester — learn them by heart.
          </p>
        ),
      },
      {
        kind: "figure",
        render: () => <ModelSurfacesTable />,
        caption:
          "The deck's four model graphs. Every later topic (level sets, limits, partial derivatives) is first tested on these.",
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-lim-cp2",
          difficulty: "easy",
          prompt: (
            <>
              The domain of <Tex>{"f(x,y,z)=\\log(4-x^2-y^2-z^2)"}</Tex> is:
            </>
          ),
          options: [
            { id: "A", content: <>the closed ball <Tex>{"x^2+y^2+z^2 \\le 4"}</Tex></> },
            { id: "B", content: <>the open ball of radius 4 centered at the origin</> },
            { id: "C", content: <>the open ball of radius 2 centered at the origin</> },
            { id: "D", content: <>all points outside the sphere <Tex>{"x^2+y^2+z^2 = 4"}</Tex></> },
          ],
          correct: "C",
          explanation: (
            <>
              A logarithm needs a <strong>strictly</strong> positive argument:{" "}
              <Tex>{"4-x^2-y^2-z^2 > 0 \\iff x^2+y^2+z^2 < 4"}</Tex>, an open ball of radius{" "}
              <Tex>{"\\sqrt{4}=2"}</Tex> — so C. A fails on the boundary sphere, where the argument
              is 0 and <Tex>{"\\log 0"}</Tex> is undefined; B confuses the radius with its square; D
              describes where the argument is <em>negative</em>.
            </>
          ),
          theory: (
            <>Roots allow the boundary (argument ≥ 0), logs exclude it (argument &gt; 0); the radius is the square root of the constant.</>
          ),
        },
      },
    ],
  },

  /* ================================================================
   * LESSON 2 — Level sets, distance & radial functions (deck pp. 15–25)
   * ================================================================ */
  {
    id: "level-sets-radial",
    title: "Level sets, distance & radial functions",
    lecture: MODULE,
    summary:
      "Can't draw a surface on paper? Slice it: S_c = f⁻¹(c). Distance and the norm then single out the radial functions, whose level sets are circles.",
    minutes: 15,
    objectives: [
      "Compute the c-level set S_c = f⁻¹(c) of a function",
      "Read the geometry of a graph from the spacing of its level sets",
      "Use the distance d(P,Q) and the norm ‖P‖ = d(P,O)",
      "Spot radial functions f(P) = g(‖P‖) and their circular level sets",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Graphs of two-variable functions live in <Tex>{"\\mathbb{R}^3"}</Tex> and are “often not
            easy to visualize”. The workaround is the one used by every hiking map and weather
            chart: cut the graph at a constant height <Tex>{"c"}</Tex> and draw the resulting slice
            down in the plane. The deck calls these slices <strong>level sets</strong>.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "c-level set",
        content: (
          <>
            Let <Tex>{"f: D \\subseteq \\mathbb{R}^2 \\to \\mathbb{R}"}</Tex> and{" "}
            <Tex>{"c \\in \\mathbb{R}"}</Tex>. The set{" "}
            <Tex>{"S_c := \\{(x,y) \\in D : f(x,y) = c\\}"}</Tex> is called the{" "}
            <strong><Tex>{"c"}</Tex>-level set</strong> of <Tex>{"f"}</Tex> (similar definition if{" "}
            <Tex>{"D \\subseteq \\mathbb{R}^3"}</Tex>). Equivalently{" "}
            <Tex>{"S_c = f^{-1}(c)"}</Tex>, the <em>preimage</em> of <Tex>{"c"}</Tex>: in simple
            terms, <Tex>{"S_c"}</Tex> is the set of the points in <Tex>{"D"}</Tex> for which{" "}
            <Tex>{"f"}</Tex> attains the value <Tex>{"c"}</Tex>. It carries a lot of information
            about the geometry of the graph.
          </>
        ),
      },
      {
        kind: "example",
        title: "Level sets of f(x,y) = x² + y²",
        content: (
          <>
            <p>
              Solve <Tex>{"x^2+y^2 = c"}</Tex>. For <Tex>{"c > 0"}</Tex>: a circle of radius{" "}
              <Tex>{"\\sqrt{c}"}</Tex> centered at the origin. For <Tex>{"c = 0"}</Tex>: just the
              origin. For <Tex>{"c < 0"}</Tex>: the <strong>empty set</strong> — the bowl never dips
              below 0.
            </p>
            <p>
              Radius <Tex>{"\\sqrt{c}"}</Tex>, not <Tex>{"c"}</Tex>: equal jumps in height give
              circles of radius <Tex>{"\\sqrt{1}, \\sqrt{2}, \\sqrt{3}, \\dots"}</Tex> that crowd
              together — the paraboloid steepens as you walk outward.
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <LevelSetFigure />,
        caption: (
          <>
            Level sets of <Tex>{"x^2+y^2"}</Tex> for <Tex>{"c = 1,2,3,4"}</Tex>: circles of radius{" "}
            <Tex>{"\\sqrt{c}"}</Tex>. Crowding contours = steep graph, exactly like a topographic
            map.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            More deck examples: <Tex>{"\\sqrt{x^2+y^2}"}</Tex> gives circles of radius exactly{" "}
            <Tex>{"c"}</Tex> — evenly spaced, because a cone has constant slope.{" "}
            <Tex>{"x^2-y^2"}</Tex> gives hyperbolas, and the special level <Tex>{"S_0"}</Tex> is the
            pair of lines <Tex>{"y = \\pm x"}</Tex> crossing at the saddle. In{" "}
            <Tex>{"\\mathbb{R}^3"}</Tex>, <Tex>{"e^{x^2+y^2+z^2}"}</Tex> has level sets{" "}
            <Tex>{"x^2+y^2+z^2 = \\log c"}</Tex>: spheres of radius{" "}
            <Tex>{"\\sqrt{\\log c}"}</Tex> for <Tex>{"c > 1"}</Tex>, the origin alone for{" "}
            <Tex>{"c = 1"}</Tex>, empty for <Tex>{"c < 1"}</Tex>.
          </p>
        ),
      },
      { kind: "heading", text: "Distance and the norm" },
      {
        kind: "definition",
        term: "Distance in R² and R³",
        content: (
          <>
            For <Tex>{"P=(x_0,y_0)"}</Tex> and <Tex>{"Q=(x_1,y_1)"}</Tex> in{" "}
            <Tex>{"\\mathbb{R}^2"}</Tex>, the distance between <Tex>{"P"}</Tex> and{" "}
            <Tex>{"Q"}</Tex> is defined as{" "}
            <Tex>{"d(P,Q) := \\sqrt{(x_0-x_1)^2+(y_0-y_1)^2}"}</Tex> — very natural, and it works
            thanks to Pythagoras' theorem. If <Tex>{"Q = O = (0,0)"}</Tex> we set{" "}
            <Tex>{"d(P,O) =: \\|P\\|"}</Tex>, the <strong>norm</strong> of <Tex>{"P"}</Tex>, also
            denoted <Tex>{"|P|"}</Tex>. In <Tex>{"\\mathbb{R}^3"}</Tex> it works the same way with a
            third term <Tex>{"(z_0-z_1)^2"}</Tex> under the root.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "d(P,Q) = \\|P-Q\\|",
        tag: "2.1",
        caption: (
          <>
            The deck's “show this!” identity: distance is the norm of the difference — the bridge
            between geometry (distance) and algebra (vector subtraction).
          </>
        ),
      },
      { kind: "heading", text: "Radial functions" },
      {
        kind: "definition",
        term: "Radial function",
        content: (
          <>
            <Tex>{"f: \\mathbb{R}^2"}</Tex> (or <Tex>{"\\mathbb{R}^3"}</Tex>){" "}
            <Tex>{"\\to \\mathbb{R}"}</Tex> is said to be <strong>radial</strong> if the value of{" "}
            <Tex>{"f"}</Tex> at any point <Tex>{"P"}</Tex> depends <strong>only</strong> on the
            distance of <Tex>{"P"}</Tex> from the origin <Tex>{"O"}</Tex>: for all{" "}
            <Tex>{"P_1, P_2"}</Tex> with <Tex>{"|P_1| = |P_2|"}</Tex> we get{" "}
            <Tex>{"f(P_1) = f(P_2)"}</Tex>. In other terms:{" "}
            <Tex>{"f \\text{ is radial} \\iff \\exists\\, g: [0,\\infty) \\to \\mathbb{R} : f(P) = g(|P|)"}</Tex>.
          </>
        ),
      },
      {
        kind: "example",
        title: "Reading off the radial profile g",
        content: (
          <>
            <p>
              <Tex>{"f(x,y) = \\sin(x^2+y^2)"}</Tex> is radial with{" "}
              <Tex>{"g(t) = \\sin(t^2)"}</Tex> — <strong>not</strong> <Tex>{"\\sin t"}</Tex>! The
              distance from <Tex>{"(0,0)"}</Tex> is <Tex>{"t = \\sqrt{x^2+y^2}"}</Tex>, so{" "}
              <Tex>{"f = \\sin\\big((\\sqrt{x^2+y^2})^2\\big) = g(\\sqrt{x^2+y^2})"}</Tex>.
            </p>
            <p>
              <Tex>{"f(x,y) = \\dfrac{1}{1+x^2+y^2}"}</Tex> is radial with{" "}
              <Tex>{"g(t) = \\dfrac{1}{1+t^2}"}</Tex> — the graph is the profile of{" "}
              <Tex>{"g"}</Tex> spun around the <Tex>{"z"}</Tex>-axis.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Radial ⇒ circular contours",
        content: (
          <>
            By definition, the level sets of a radial function{" "}
            <Tex>{"f: \\mathbb{R}^2 \\to \\mathbb{R}"}</Tex> are <strong>circles centered at the
            origin</strong> <Tex>{"(0,0)"}</Tex>. You can recognize radiality straight off a contour
            plot — and conversely, seeing <Tex>{"x^2+y^2"}</Tex> as a block screams “substitute{" "}
            <Tex>{"t = x^2+y^2"}</Tex>” (which is how the exam problem on{" "}
            <Tex>{"\\sin(x^2+y^2)/(x^2+y^2)"}</Tex> collapses to one variable).
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-lim-cp3",
          difficulty: "easy",
          prompt: (
            <>
              For <Tex>{"f(x,y) = x^2+y^2"}</Tex>, the level set <Tex>{"S_4"}</Tex> (that is,{" "}
              <Tex>{"c = 4"}</Tex>) is:
            </>
          ),
          options: [
            { id: "A", content: <>the circle <Tex>{"x^2+y^2=4"}</Tex>, of radius 2</> },
            { id: "B", content: <>the circle of radius 4</> },
            { id: "C", content: <>the closed disk <Tex>{"x^2+y^2 \\le 4"}</Tex></> },
            { id: "D", content: <>the single point <Tex>{"(2,2)"}</Tex></> },
          ],
          correct: "A",
          explanation: (
            <>
              <Tex>{"S_c = f^{-1}(c)"}</Tex> is where <Tex>{"f"}</Tex> <em>equals</em> 4:{" "}
              <Tex>{"x^2+y^2=4"}</Tex>, a circle of radius <Tex>{"\\sqrt{4}=2"}</Tex> — A. B
              confuses the height <Tex>{"c"}</Tex> with the radius <Tex>{"\\sqrt{c}"}</Tex>; C is a{" "}
              <em>sublevel</em> set (<Tex>{"f \\le 4"}</Tex>), not the level set; D fails since{" "}
              <Tex>{"f(2,2)=8 \\ne 4"}</Tex>.
            </>
          ),
          theory: <>Level set = preimage of one value; for the paraboloid the c-level is the circle of radius √c.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "“Level curve” is a habit, not a guarantee",
        content: (
          <>
            <Tex>{"S_c"}</Tex> can degenerate: a single point (<Tex>{"c=0"}</Tex> for the bowl), the
            empty set (<Tex>{"c<0"}</Tex>), or a pair of crossing lines (<Tex>{"c=0"}</Tex> for the
            saddle <Tex>{"x^2-y^2"}</Tex>). Always solve <Tex>{"f = c"}</Tex> honestly and say{" "}
            <em>which</em> set comes out — writing “circle of radius <Tex>{"c"}</Tex>” when the
            radius is <Tex>{"\\sqrt{c}"}</Tex> is a favourite lost mark.
          </>
        ),
      },
    ],
  },

  /* ================================================================
   * LESSON 3 — Neighborhoods, open & closed sets (deck pp. 26–29)
   * ================================================================ */
  {
    id: "open-closed-sets",
    title: "Neighborhoods, open & closed sets",
    lecture: MODULE,
    summary:
      "B_r(P₀) makes “near P₀” precise; interior vs boundary points then sort every set into open, closed — or neither.",
    minutes: 13,
    objectives: [
      "Use neighborhoods B_r(P₀) to say “near P₀” precisely",
      "Classify points of a set as interior or boundary points",
      "Decide whether a set is open, closed, or neither",
      "Explain why limits are taken at points of D ∪ ∂D",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            The limit definition needs a precise way to say “all points close enough to{" "}
            <Tex>{"P_0"}</Tex>”. On the real line that was an interval; in the plane the deck
            replaces it with a disk built from the norm of the previous lesson.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Neighborhood (open ball)",
        content: (
          <>
            Let <Tex>{"P_0 \\in \\mathbb{R}^2"}</Tex> (or <Tex>{"\\mathbb{R}^3"}</Tex>) and{" "}
            <Tex>{"r > 0"}</Tex>. The <strong>neighborhood of <Tex>{"P_0"}</Tex> with radius{" "}
            <Tex>{"r"}</Tex></strong> is defined as{" "}
            <Tex>{"B_r(P_0) := \\{P \\in \\mathbb{R}^2 : \\|P_0 - P\\| < r\\}"}</Tex> — that is, the
            (open) ball centered at <Tex>{"P_0"}</Tex> with radius <Tex>{"r"}</Tex>: a disk in the
            plane, a solid ball in space. The strict <Tex>{"<"}</Tex> means the boundary
            circle/sphere is <strong>not part of the neighborhood</strong>.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Interior point, boundary point, ∂D",
        content: (
          <>
            Let <Tex>{"D \\subseteq \\mathbb{R}^2"}</Tex> (or <Tex>{"\\mathbb{R}^3"}</Tex>). We say{" "}
            <Tex>{"P"}</Tex> is an <strong>interior</strong> point for <Tex>{"D"}</Tex> if there is{" "}
            <Tex>{"r > 0"}</Tex> such that <Tex>{"B_r(P) \\subset D"}</Tex> — some whole ball around{" "}
            <Tex>{"P"}</Tex> fits inside <Tex>{"D"}</Tex>. We say <Tex>{"P"}</Tex> is a{" "}
            <strong>boundary</strong> point for <Tex>{"D"}</Tex> if for <em>every</em>{" "}
            <Tex>{"r > 0"}</Tex>, <Tex>{"B_r(P) \\cap D \\ne \\varnothing"}</Tex> and{" "}
            <Tex>{"B_r(P) \\cap D^c \\ne \\varnothing"}</Tex> — every ball around <Tex>{"P"}</Tex>,
            however small, meets both <Tex>{"D"}</Tex> and its complement.{" "}
            <Tex>{"\\partial D"}</Tex> denotes the set of all boundary points of <Tex>{"D"}</Tex>.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <InteriorBoundaryFigure />,
        caption: (
          <>
            The deck's picture: around <Tex>{"P"}</Tex> a whole ball stays inside <Tex>{"D"}</Tex>{" "}
            (interior point); around <Tex>{"Q"}</Tex> every ball, no matter how small, straddles the
            edge (boundary point).
          </>
        ),
      },
      {
        kind: "definition",
        term: "Open set, closed set",
        content: (
          <>
            <Tex>{"D"}</Tex> is <strong>open</strong> if every <Tex>{"P \\in D"}</Tex> is an
            interior point. <Tex>{"D"}</Tex> is <strong>closed</strong> if the complement{" "}
            <Tex>{"D^c"}</Tex> is open.
          </>
        ),
      },
      {
        kind: "example",
        title: "The deck's three squares",
        content: (
          <>
            <p>
              <Tex>{"D = \\{(x,y): |x| < 1,\\ |y| < 1\\}"}</Tex>: <strong>open</strong> — every
              point has clearance to all four sides, so a small enough disk fits inside.
            </p>
            <p>
              <Tex>{"D = \\{(x,y): |x| \\le 1,\\ |y| \\le 1\\}"}</Tex>: <strong>closed</strong> —
              any point strictly outside the square has positive distance to it, so the complement
              is open.
            </p>
            <p>
              <Tex>{"D = \\{(x,y): |x| \\le 1,\\ |y| < 1\\}"}</Tex>: <strong>neither</strong>. The
              point <Tex>{"(1,0) \\in D"}</Tex> is a boundary point, so <Tex>{"D"}</Tex> is not
              open. And <Tex>{"(0,1) \\notin D"}</Tex> has points of <Tex>{"D"}</Tex> arbitrarily
              close below it, so <Tex>{"D^c"}</Tex> is not open either — <Tex>{"D"}</Tex> is not
              closed.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "“Not open” does NOT mean “closed”",
        content: (
          <>
            Open and closed are not opposites: a set with mixed strict/non-strict inequalities is
            typically <strong>neither</strong>. Always run the two tests separately — “is every
            point interior?” for open, “is the complement open?” for closed. (Deck exercises to
            try: <Tex>{"\\{(x-1)^2 \\le y < x+2\\}"}</Tex>, <Tex>{"\\{|x|+|y| \\le 1\\}"}</Tex>,{" "}
            <Tex>{"\\{xy > 1,\\ x-2 < y < 2x+1\\}"}</Tex>.)
          </>
        ),
      },
      {
        kind: "steps",
        title: "Classify any set",
        steps: [
          {
            label: "All inequalities strict?",
            content: (
              <>
                Candidate <strong>open</strong>: check every point keeps positive distance from the
                excluded boundary.
              </>
            ),
          },
          {
            label: "All inequalities non-strict (or =)?",
            content: <>Candidate <strong>closed</strong>: check the complement is open.</>,
          },
          {
            label: "Mixed?",
            content: (
              <>
                Suspect <strong>neither</strong>: exhibit a boundary point inside <Tex>{"D"}</Tex>{" "}
                (kills open) and a point of <Tex>{"D^c"}</Tex> that <Tex>{"D"}</Tex> approaches
                (kills closed).
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-lim-cp4",
          difficulty: "medium",
          prompt: (
            <>
              The set <Tex>{"D = \\{(x,y) \\in \\mathbb{R}^2 : |x| \\le 1,\\ |y| < 1\\}"}</Tex> is:
            </>
          ),
          options: [
            { id: "A", content: <>open</> },
            { id: "B", content: <>closed</> },
            { id: "C", content: <>both open and closed</> },
            { id: "D", content: <>neither open nor closed</> },
          ],
          correct: "D",
          explanation: (
            <>
              The vertical edges are included: <Tex>{"(1,0) \\in D"}</Tex>, yet every disk around it
              pokes into <Tex>{"x > 1"}</Tex> — not an interior point, so not open (kills A). The
              horizontal edges are excluded: <Tex>{"(0,1) \\in D^c"}</Tex>, yet every disk around it
              contains points <Tex>{"(0, 1-\\epsilon) \\in D"}</Tex> — so <Tex>{"D^c"}</Tex> is not
              open and <Tex>{"D"}</Tex> is not closed (kills B and C). Answer D.
            </>
          ),
          theory: <>Mixed strict/non-strict inequalities usually give sets that are neither open nor closed.</>,
        },
      },
      {
        kind: "prose",
        content: (
          <p>
            Why the deck sets this up now: the limit definition on the very next page takes{" "}
            <Tex>{"D"}</Tex> <strong>open</strong> and allows{" "}
            <Tex>{"P_0 \\in D \\cup \\partial D"}</Tex> — you may take a limit at a boundary point
            of the domain, where <Tex>{"f"}</Tex> itself need not be defined. That is precisely the
            situation at the punched-out origin of{" "}
            <Tex>{"D = \\mathbb{R}^2 \\smallsetminus \\{(0,0)\\}"}</Tex>, where every interesting
            limit of this module lives.
          </p>
        ),
      },
    ],
  },

  /* ================================================================
   * LESSON 4 — Limits & continuity (deck pp. 30–40)
   * ================================================================ */
  {
    id: "multivariable-limits",
    title: "Limits & continuity in two variables",
    lecture: MODULE,
    summary:
      "A 2-variable limit exists only if every way of approaching the point gives the same value — and that single demand changes everything.",
    minutes: 22,
    objectives: [
      "State the professor's ε–δ definition of lim f = ℓ with the norm and D ∪ ∂D",
      "Prove a limit exists straight from the definition (and with polar coordinates)",
      "Disprove a limit by exhibiting two curves α, β with different values",
      "Study the continuity of piecewise-defined functions at the glue point",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            In MA1 there were only <strong>two</strong> ways to approach a point — from the left and
            from the right — and a limit existed when those two agreed. In the plane there are{" "}
            <strong>infinitely many</strong> directions, plus curved routes that spiral in. The
            definition of a 2-variable limit quietly demands that <em>all</em> of them produce the
            same value. That single change is the source of almost every surprise in this chapter.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Limit (the professor's definition)",
        content: (
          <>
            Let <Tex>{"D \\subseteq \\mathbb{R}^2"}</Tex> be <strong>open</strong>,{" "}
            <Tex>{"P_0 = (x_0,y_0) \\in D \\cup \\partial D"}</Tex>,{" "}
            <Tex>{"\\ell \\in \\mathbb{R}"}</Tex> and{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R}^2 \\to \\mathbb{R}"}</Tex>. We say that{" "}
            <Tex>{"\\lim_{(x,y)\\to(x_0,y_0)} f(x,y) = \\ell"}</Tex> if the condition below holds.
            Read it as: whenever <Tex>{"P"}</Tex> is <Tex>{"\\delta"}</Tex>-close to{" "}
            <Tex>{"P_0"}</Tex> in <Tex>{"\\mathbb{R}^2"}</Tex> (a punctured ball{" "}
            <Tex>{"B_\\delta(P_0)"}</Tex> with <Tex>{"P \\ne P_0"}</Tex>), the value{" "}
            <Tex>{"f(P)"}</Tex> is <Tex>{"\\varepsilon"}</Tex>-close to <Tex>{"\\ell"}</Tex> in{" "}
            <Tex>{"\\mathbb{R}"}</Tex>. Same definition if{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R}^3 \\to \\mathbb{R}"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\forall\\,\\varepsilon>0,\\ \\exists\\,\\delta>0:\\ \\forall\\, P=(x,y)\\in D \\ \\text{ with } 0<\\|P-P_0\\|<\\delta \\;\\Longrightarrow\\; |f(P)-\\ell|<\\varepsilon",
        tag: "4.1",
        caption: (
          <>
            The punctured ball <Tex>{"0 < \\|P-P_0\\| < \\delta"}</Tex> surrounds{" "}
            <Tex>{"P_0"}</Tex> from <strong>every</strong> direction at once — no direction is
            privileged.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Everything from MA1 survives",
        content: (
          <>
            All properties of limits you studied in MA1 remain true for limits of functions of
            several variables — algebra of limits, squeeze, comparison. In particular: if the limit
            exists, then it is <strong>UNIQUE</strong>. The deck prints that word in capitals
            because it is about to become the main weapon.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The uniqueness weapon",
        content: (
          <>
            If the limit exists and equals <Tex>{"\\ell"}</Tex>, then <Tex>{"f"}</Tex> must tend to
            that same <Tex>{"\\ell"}</Tex> along <em>every</em> curve approaching{" "}
            <Tex>{"P_0"}</Tex>. Contrapositive (the deck's hint, almost verbatim): show that the
            limit depends on two different paths — if so, the limit is <strong>not unique</strong>{" "}
            and thus it does <strong>not exist</strong>. Two curves <Tex>{"\\alpha(t)"}</Tex>,{" "}
            <Tex>{"\\beta(t)"}</Tex> with different values are a complete proof of non-existence.
          </>
        ),
      },
      { kind: "heading", text: "Proving a limit with the definition" },
      {
        kind: "prose",
        content: (
          <p>
            The deck's first worked example: let{" "}
            <Tex>{"D := \\mathbb{R}^2 \\smallsetminus \\{(0,0)\\}"}</Tex> and{" "}
            <Tex>{"f(x,y) := \\dfrac{2x^2y}{x^2+y^2}"}</Tex>. Show that{" "}
            <Tex>{"\\lim_{(x,y)\\to(0,0)} f(x,y) = 0"}</Tex>. Note <Tex>{"(0,0) \\notin D"}</Tex> —
            it is a boundary point of <Tex>{"D"}</Tex>, exactly what{" "}
            <Tex>{"P_0 \\in D \\cup \\partial D"}</Tex> allows. Per the deck's hint, we check: for
            every <Tex>{"\\varepsilon > 0"}</Tex> there is <Tex>{"\\delta > 0"}</Tex> such that{" "}
            <Tex>{"\\sqrt{x^2+y^2} < \\delta"}</Tex> forces{" "}
            <Tex>{"\\left|\\tfrac{2x^2y}{x^2+y^2}\\right| < \\varepsilon"}</Tex>.
          </p>
        ),
      },
      {
        kind: "steps",
        title: "The δ = ε/2 proof",
        steps: [
          {
            label: "Bound the fraction",
            content: (
              <>
                Since <Tex>{"x^2 \\le x^2+y^2"}</Tex>, we have{" "}
                <Tex>{"\\dfrac{x^2}{x^2+y^2} \\le 1"}</Tex>, so{" "}
                <Tex>{"|f(x,y)| = 2\\,\\dfrac{x^2}{x^2+y^2}\\,|y| \\le 2|y|"}</Tex>.
              </>
            ),
          },
          {
            label: "Compare with the distance",
            content: (
              <>
                <Tex>{"|y| \\le \\sqrt{x^2+y^2} = \\|P\\|"}</Tex>, hence{" "}
                <Tex>{"|f(P) - 0| \\le 2\\|P\\|"}</Tex>.
              </>
            ),
          },
          {
            label: "Choose δ",
            content: (
              <>
                Given <Tex>{"\\varepsilon"}</Tex>, take <Tex>{"\\delta = \\varepsilon/2"}</Tex>: if{" "}
                <Tex>{"0 < \\|P\\| < \\delta"}</Tex> then{" "}
                <Tex>{"|f(P)| \\le 2\\|P\\| < 2\\delta = \\varepsilon"}</Tex>. Definition satisfied
                — the limit is <Tex>{"0"}</Tex>.
              </>
            ),
          },
        ],
      },
      {
        kind: "callout",
        tone: "info",
        title: "The polar-coordinate test (same bound in polar clothes)",
        content: (
          <>
            Put <Tex>{"x = r\\cos\\theta,\\ y = r\\sin\\theta"}</Tex> so that{" "}
            <Tex>{"\\|P\\| = r"}</Tex> and <Tex>{"(x,y)\\to(0,0)"}</Tex> becomes simply{" "}
            <Tex>{"r\\to 0^+"}</Tex>. If you can bound <Tex>{"|f - \\ell| \\le h(r)"}</Tex> with{" "}
            <Tex>{"h(r)\\to 0"}</Tex>{" "}
            <strong>independently of <Tex>{"\\theta"}</Tex></strong>, the limit is{" "}
            <Tex>{"\\ell"}</Tex>. If the expression still depends on <Tex>{"\\theta"}</Tex> after
            the <Tex>{"r"}</Tex>-powers cancel, suspect non-existence.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{2x^2y}{x^2+y^2} = \\frac{2(r\\cos\\theta)^2(r\\sin\\theta)}{r^2} = 2r\\,\\cos^2\\theta\\,\\sin\\theta, \\qquad \\left|\\,2r\\cos^2\\theta\\sin\\theta\\,\\right| \\le 2r \\xrightarrow{\\;r\\to0\\;} 0",
        tag: "4.2",
        caption: (
          <>
            The <Tex>{"\\theta"}</Tex>-part is bounded by 1, so <Tex>{"|f| \\le 2r \\to 0"}</Tex>{" "}
            uniformly in <Tex>{"\\theta"}</Tex> — the same <Tex>{"2\\|P\\|"}</Tex> bound as the
            definition proof.
          </>
        ),
      },
      { kind: "heading", text: "The canonical counterexample" },
      {
        kind: "prose",
        content: (
          <p>
            Second deck example: <Tex>{"f(x,y) := \\dfrac{xy}{x^2+y^2}"}</Tex> on{" "}
            <Tex>{"D = \\mathbb{R}^2 \\smallsetminus \\{(0,0)\\}"}</Tex> — show the limit at the
            origin does <strong>not</strong> exist. Pick the curves{" "}
            <Tex>{"\\alpha(t) = (t, 0)"}</Tex> and <Tex>{"\\beta(t) = (t, t)"}</Tex>. Along{" "}
            <Tex>{"\\alpha"}</Tex>: <Tex>{"f(t,0) = 0 \\to 0"}</Tex>. Along <Tex>{"\\beta"}</Tex>:{" "}
            <Tex>{"f(t,t) = \\tfrac{t^2}{2t^2} = \\tfrac12 \\to \\tfrac12"}</Tex>. Two different
            values — the limit is not unique, so it does not exist. More generally, approach along
            any line <Tex>{"y = mx"}</Tex> and substitute:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "f(x, mx) = \\frac{x\\,(mx)}{x^2 + (mx)^2} = \\frac{m x^2}{x^2(1+m^2)} = \\frac{m}{1+m^2}",
        tag: "4.3",
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
            Along the <Tex>{"x"}</Tex>-axis (<Tex>{"m = 0"}</Tex>) the value is <Tex>{"0"}</Tex>;
            along <Tex>{"y = x"}</Tex> (<Tex>{"m = 1"}</Tex>) it is <Tex>{"\\tfrac12"}</Tex>; along{" "}
            <Tex>{"y = -x"}</Tex> it is <Tex>{"-\\tfrac12"}</Tex>. Drag the slope in the model below
            and watch the value the path rides over change continuously.
          </p>
        ),
      },
      {
        kind: "sim",
        title: "Path-limit explorer — f(x,y) = xy/(x²+y²)",
        render: () => <PathLimitSim />,
        caption: (
          <>
            The straight-line readout is exactly <Tex>{"m/(1+m^2)"}</Tex> from (4.3). Switch to the
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
            <Tex>{"0"}</Tex> for the function above — and yet the limit does not exist. Matching
            values on a few curves is necessary, never sufficient. To{" "}
            <strong>prove existence</strong> you must bound the function over <em>all</em>{" "}
            directions at once (definition or polar). To <strong>disprove</strong>, one disagreeing
            pair is enough. The next example pushes this to the extreme: <em>every straight line</em>{" "}
            agrees, and the limit still fails.
          </>
        ),
      },
      { kind: "heading", text: "When every line lies" },
      {
        kind: "example",
        title: "Deck example — f(x,y) = x²y/(x⁴+y²)",
        content: (
          <>
            <p>
              Show that <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{x^2y}{x^4+y^2}"}</Tex> does not
              exist. The deck's hint: as above, pick <Tex>{"\\alpha(t) = (t,0)"}</Tex> and{" "}
              <Tex>{"\\beta(t) = (t, t^2)"}</Tex>.
            </p>
            <p>
              Along <Tex>{"\\alpha"}</Tex>: <Tex>{"f(t,0) = 0 \\to 0"}</Tex>. In fact along{" "}
              <em>every</em> line <Tex>{"y = mx"}</Tex> with <Tex>{"m \\ne 0"}</Tex>:{" "}
              <Tex>{"f(t, mt) = \\dfrac{m t^3}{t^4 + m^2 t^2} = \\dfrac{m t}{t^2 + m^2} \\to 0"}</Tex>.
            </p>
            <p>
              But along the parabola <Tex>{"\\beta(t) = (t, t^2)"}</Tex>:{" "}
              <Tex>{"f(t, t^2) = \\dfrac{t^2 \\cdot t^2}{t^4 + t^4} = \\tfrac12"}</Tex>.
            </p>
            <p>
              <Tex>{"0 \\ne \\tfrac12"}</Tex>: not unique, so the limit{" "}
              <strong>does not exist</strong> — even though every straight line said 0. The curve
              was chosen by matching the powers in the denominator: <Tex>{"x^4"}</Tex> and{" "}
              <Tex>{"y^2"}</Tex> balance exactly when <Tex>{"y \\sim x^2"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <PathTable />,
        caption:
          "The deck's three limit examples probed side by side. Same curves, three different verdicts — only a bound valid in every direction settles the 'yes' case.",
      },
      { kind: "heading", text: "Continuity" },
      {
        kind: "definition",
        term: "Continuous at a point / in D",
        content: (
          <>
            Let <Tex>{"D \\subseteq \\mathbb{R}^2"}</Tex> be open,{" "}
            <Tex>{"P_0 = (x_0,y_0) \\in D"}</Tex> and{" "}
            <Tex>{"f: D \\subseteq \\mathbb{R}^2 \\to \\mathbb{R}"}</Tex>. We say that{" "}
            <Tex>{"f"}</Tex> is <strong>continuous at <Tex>{"P_0"}</Tex></strong> if{" "}
            <Tex>{"\\lim_{(x,y)\\to(x_0,y_0)} f(x,y) = f(x_0,y_0)"}</Tex> — the limit exists{" "}
            <em>and</em> equals the value. We say <Tex>{"f"}</Tex> is{" "}
            <strong>continuous in <Tex>{"D"}</Tex></strong> if it is continuous at every point{" "}
            <Tex>{"P_0 \\in D"}</Tex>. Analogous definition for{" "}
            <Tex>{"D \\subseteq \\mathbb{R}^3"}</Tex>, and all the properties about continuity
            studied in MA1 remain true: sums, products, quotients (with non-vanishing denominator)
            and compositions of continuous functions are continuous.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Consequence: polynomials, rational functions and elementary compositions are continuous
            everywhere they are defined — no work needed. The only interesting points are the{" "}
            <strong>glue points</strong> of piecewise definitions, where you must actually compare a
            limit with an assigned value. The deck closes the chapter with two such tests.
          </p>
        ),
      },
      {
        kind: "example",
        title: "The deck's two glue tests at the origin",
        content: (
          <>
            <p>
              <strong>Test 1.</strong> <Tex>{"f(x,y) = \\dfrac{2x^2y}{x^2+y^2}"}</Tex> for{" "}
              <Tex>{"(x,y) \\ne (0,0)"}</Tex>, and <Tex>{"f(0,0) = 0"}</Tex>. Away from the origin{" "}
              <Tex>{"f"}</Tex> is a quotient of polynomials with non-vanishing denominator —
              continuous by the MA1 rules. At the origin we proved{" "}
              <Tex>{"\\lim f = 0 = f(0,0)"}</Tex>. Verdict: <strong>continuous in all of{" "}
              <Tex>{"\\mathbb{R}^2"}</Tex></strong>.
            </p>
            <p>
              <strong>Test 2.</strong> <Tex>{"f(x,y) = \\dfrac{xy}{x^2+y^2}"}</Tex> for{" "}
              <Tex>{"(x,y) \\ne (0,0)"}</Tex>, and <Tex>{"f(0,0) = 0"}</Tex>. At the origin the
              limit does not exist (curves <Tex>{"\\alpha, \\beta"}</Tex> above), so <em>no</em>{" "}
              choice of <Tex>{"f(0,0)"}</Tex> could ever work. Verdict: the largest set where{" "}
              <Tex>{"f"}</Tex> is continuous is{" "}
              <Tex>{"\\mathbb{R}^2 \\smallsetminus \\{(0,0)\\}"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "A method that never fails",
        steps: [
          {
            label: "Away from the bad point",
            content: (
              <>
                Use the MA1 algebra of continuity: quotients/compositions of continuous functions
                are continuous wherever defined. Only glue points need real work.
              </>
            ),
          },
          {
            label: "Probe curves at the bad point",
            content: (
              <>
                Try <Tex>{"\\alpha(t)=(t,0)"}</Tex>, <Tex>{"\\beta(t)=(t,t)"}</Tex>, lines{" "}
                <Tex>{"y=mx"}</Tex>, and a power-matched curve like <Tex>{"(t,t^2)"}</Tex>. Two
                disagreeing values ⇒ the limit is not unique ⇒ write “does not exist”.
              </>
            ),
          },
          {
            label: "All probes agree on ℓ?",
            content: (
              <>
                That is only a candidate. Prove it: bound{" "}
                <Tex>{"|f-\\ell| \\le h(\\|P\\|)"}</Tex> straight from the definition, or switch to
                polar and show <Tex>{"|f-\\ell| \\le h(r) \\to 0"}</Tex> with no{" "}
                <Tex>{"\\theta"}</Tex> left.
              </>
            ),
          },
          {
            label: "Check continuity",
            content: (
              <>
                Compare the limit with the assigned value <Tex>{"f(P_0)"}</Tex>; equal ⇒ continuous
                at <Tex>{"P_0"}</Tex>.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "One more — does it exist?",
        content: (
          <>
            <p>
              Decide whether{" "}
              <Tex>{"\\lim_{(x,y)\\to(0,0)} \\dfrac{x^2 - y^2}{x^2 + y^2}"}</Tex> exists.
            </p>
            <p>
              Along <Tex>{"\\alpha(t) = (t,0)"}</Tex>:{" "}
              <Tex>{"\\dfrac{t^2}{t^2}=1\\to 1"}</Tex>.
            </p>
            <p>
              Along <Tex>{"\\beta(t) = (0,t)"}</Tex>:{" "}
              <Tex>{"\\dfrac{-t^2}{t^2}=-1\\to -1"}</Tex>.
            </p>
            <p>
              Two curves give <Tex>{"1"}</Tex> and <Tex>{"-1"}</Tex>: not unique, so the limit{" "}
              <strong>does not exist</strong>. (In polar form it is <Tex>{"\\cos 2\\theta"}</Tex> —
              pure angle dependence, the tell-tale sign.)
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
            When the lines <Tex>{"y=mx"}</Tex> all give the same value but you still smell trouble,
            try a <em>curved</em> path matched to the powers — exactly the deck's{" "}
            <Tex>{"\\beta(t) = (t, t^2)"}</Tex> for <Tex>{"\\dfrac{x^2 y}{x^4+y^2}"}</Tex>, which
            gives <Tex>{"\\tfrac12"}</Tex> while every line gives 0. Match the curve to the
            denominator's degrees.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            That is the whole logic of multivariable limits: <strong>one disagreement kills</strong>{" "}
            (the limit would not be unique), while existence demands a bound holding in every
            direction. Next we use these continuous functions to build{" "}
            <strong>partial derivatives</strong> and the gradient.
          </p>
        ),
      },
    ],
  },
];

export const practice: Question[] = [
  {
    id: "ma2-q1",
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
];

export const exam: ExamProblem[] = [
  {
    id: "ma2-e1",
    title: "Disprove a limit with two paths",
    meta: "Limits · ~8 pts · Summer session style",
    difficulty: "medium",
    topic: MODULE,
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
    topic: MODULE,
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
    topic: MODULE,
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
];
