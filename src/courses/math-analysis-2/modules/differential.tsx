import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { GradientExplorerSim } from "../sims/GradientExplorerSim";

export const MODULE = "Differential calculus";

/* ================================================================== *
 *  Figures (pure SVG, theme-token colors, exact geometry)
 * ================================================================== */

/** Two slice curves of a surface with true tangent lines.
 *  Panel 1: z = 0.25(x−1)² + 1, tangent at a = 3 (slope 1).
 *  Panel 2: z = 0.5(y−1)² + 0.8, tangent at b = 2.8 (slope 1.8).
 *  The tangent segments are computed from the actual derivatives, so
 *  they genuinely touch the curves. */
function SliceFigure() {
  const Z = (z: number) => 225 - z * 48;
  const X1 = (x: number) => 30 + x * 55;
  const X2 = (y: number) => 320 + y * 55;
  const pts = (g: (t: number) => number, t0: number, t1: number, X: (t: number) => number) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = t0 + ((t1 - t0) * i) / 40;
      return `${X(t).toFixed(1)},${Z(g(t)).toFixed(1)}`;
    }).join(" ");

  const g1 = (x: number) => 0.25 * (x - 1) * (x - 1) + 1; // slope at x=3 is 1
  const g2 = (y: number) => 0.5 * (y - 1) * (y - 1) + 0.8; // slope at y=2.8 is 1.8

  return (
    <svg viewBox="0 0 560 260" className="w-full">
      {/* ---------- panel 1: slice y = b ---------- */}
      <text x={30} y={16} fontSize={12} fontWeight={700} fill="var(--color-ink)">
        slice y = b:&nbsp; z = f(x, b)
      </text>
      <line x1={30} y1={25} x2={30} y2={225} stroke="var(--color-line)" strokeWidth={1} />
      <line x1={30} y1={225} x2={252} y2={225} stroke="var(--color-line)" strokeWidth={1} />
      <text x={256} y={229} fontSize={11} fill="var(--color-faint)">x</text>
      <text x={22} y={34} fontSize={11} fill="var(--color-faint)">z</text>
      <polyline points={pts(g1, 0, 3.8, X1)} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
      {/* tangent at a=3: z = 2 + (x−3), drawn from x=1.8 to x=3.8 */}
      <line x1={X1(1.8)} y1={Z(0.8)} x2={X1(3.8)} y2={Z(2.8)} stroke="var(--info)" strokeWidth={2} />
      <line x1={X1(3)} y1={Z(2)} x2={X1(3)} y2={225} stroke="var(--color-faint)" strokeWidth={1} strokeDasharray="3 3" />
      <text x={X1(3)} y={239} fontSize={11} textAnchor="middle" fill="var(--color-muted)">a</text>
      <circle cx={X1(3)} cy={Z(2)} r={4.5} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={2} />
      <text x={X1(1.7)} y={Z(0.85) + 14} fontSize={11} fill="var(--info)" fontWeight={600}>
        slope = ∂f/∂x (a,b)
      </text>

      {/* ---------- panel 2: slice x = a ---------- */}
      <text x={320} y={16} fontSize={12} fontWeight={700} fill="var(--color-ink)">
        slice x = a:&nbsp; z = f(a, y)
      </text>
      <line x1={320} y1={25} x2={320} y2={225} stroke="var(--color-line)" strokeWidth={1} />
      <line x1={320} y1={225} x2={520} y2={225} stroke="var(--color-line)" strokeWidth={1} />
      <text x={524} y={229} fontSize={11} fill="var(--color-faint)">y</text>
      <text x={312} y={34} fontSize={11} fill="var(--color-faint)">z</text>
      <polyline points={pts(g2, 0, 3.4, X2)} fill="none" stroke="var(--accent-2)" strokeWidth={2.5} />
      {/* tangent at b=2.8: z = 2.42 + 1.8(y−2.8), drawn from y=2.0 to y=3.4 */}
      <line x1={X2(2)} y1={Z(0.98)} x2={X2(3.4)} y2={Z(3.5)} stroke="var(--info)" strokeWidth={2} />
      <line x1={X2(2.8)} y1={Z(2.42)} x2={X2(2.8)} y2={225} stroke="var(--color-faint)" strokeWidth={1} strokeDasharray="3 3" />
      <text x={X2(2.8)} y={239} fontSize={11} textAnchor="middle" fill="var(--color-muted)">b</text>
      <circle cx={X2(2.8)} cy={Z(2.42)} r={4.5} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={2} />
      <text x={X2(1.15)} y={Z(0.9) + 14} fontSize={11} fill="var(--info)" fontWeight={600}>
        slope = ∂f/∂y (a,b)
      </text>
    </svg>
  );
}

/** Implication map: C¹ ⇒ differentiable ⇒ continuous / directional derivatives. */
function ImplicationMap() {
  const box = (x: number, y: number, w: number, h: number, accent = false) => (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={10}
      fill={accent ? "var(--accent-soft)" : "var(--color-surface)"}
      stroke={accent ? "var(--accent-line)" : "var(--color-line)"}
      strokeWidth={1.5}
    />
  );
  return (
    <svg viewBox="0 0 640 255" className="w-full">
      <defs>
        <marker id="dif-imp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--color-muted)" />
        </marker>
      </defs>

      {box(10, 85, 180, 80)}
      <text x={100} y={116} fontSize={13} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">f ∈ C¹ near P</text>
      <text x={100} y={134} fontSize={10.5} textAnchor="middle" fill="var(--color-muted)">partials exist nearby and</text>
      <text x={100} y={148} fontSize={10.5} textAnchor="middle" fill="var(--color-muted)">are continuous at P</text>

      {box(248, 85, 160, 80, true)}
      <text x={328} y={116} fontSize={13} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">f differentiable</text>
      <text x={328} y={133} fontSize={13} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">at P</text>
      <text x={328} y={150} fontSize={10.5} textAnchor="middle" fill="var(--color-muted)">tangent plane exists</text>

      {box(465, 20, 165, 62)}
      <text x={547} y={47} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">f continuous at P</text>
      <text x={547} y={65} fontSize={10} textAnchor="middle" fill="var(--bad)">converse false: √(x²+y²)</text>

      {box(465, 158, 165, 72)}
      <text x={547} y={184} fontSize={12} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">all Dᵥf exist and</text>
      <text x={547} y={201} fontSize={12} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">Dᵥf = ∇f · v</text>
      <text x={547} y={219} fontSize={9.5} textAnchor="middle" fill="var(--bad)">converse false: x³y/(x⁶+y²)</text>

      <line x1={192} y1={125} x2={244} y2={125} stroke="var(--color-muted)" strokeWidth={2} markerEnd="url(#dif-imp-arrow)" />
      <text x={218} y={144} fontSize={10} textAnchor="middle" fill="var(--bad)">not ⇐</text>
      <text x={218} y={157} fontSize={9.5} textAnchor="middle" fill="var(--bad)">r²·sin(1/r²)</text>

      <line x1={410} y1={100} x2={461} y2={60} stroke="var(--color-muted)" strokeWidth={2} markerEnd="url(#dif-imp-arrow)" />
      <line x1={410} y1={150} x2={461} y2={188} stroke="var(--color-muted)" strokeWidth={2} markerEnd="url(#dif-imp-arrow)" />

      <text x={10} y={210} fontSize={10.5} fill="var(--bad)">Partials existing at P alone imply NEITHER continuity</text>
      <text x={10} y={224} fontSize={10.5} fill="var(--bad)">nor differentiability — e.g. xy/(x²+y²) at the origin.</text>
    </svg>
  );
}

/** Chain-rule dependency tree for z = f(x, y), x = x(s,t), y = y(s,t). */
function ChainTree() {
  const node = (cx: number, cy: number, label: string, accent = false) => (
    <g>
      <rect
        x={cx - 21}
        y={cy - 15}
        width={42}
        height={30}
        rx={8}
        fill={accent ? "var(--accent-soft)" : "var(--color-surface)"}
        stroke={accent ? "var(--accent-line)" : "var(--color-line)"}
        strokeWidth={1.5}
      />
      <text x={cx} y={cy + 5} fontSize={14} fontWeight={700} textAnchor="middle" fill="var(--color-ink)">
        {label}
      </text>
    </g>
  );
  const edge = (x1: number, y1: number, x2: number, y2: number, hot: boolean) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={hot ? "var(--accent)" : "var(--color-line)"}
      strokeWidth={hot ? 2.5 : 1.5}
      strokeDasharray={hot ? undefined : "4 4"}
    />
  );
  return (
    <svg viewBox="0 0 440 235" className="w-full">
      {/* edges (accent = the two paths used for ∂z/∂s) */}
      {edge(205, 50, 142, 100, true)}
      {edge(235, 50, 298, 100, true)}
      {edge(118, 130, 85, 180, true)}
      {edge(142, 130, 158, 180, false)}
      {edge(298, 130, 265, 180, true)}
      {edge(322, 130, 338, 180, false)}

      {/* edge labels */}
      <text x={148} y={73} fontSize={11} textAnchor="end" fill="var(--accent)" fontWeight={600}>∂z/∂x</text>
      <text x={292} y={73} fontSize={11} fill="var(--accent)" fontWeight={600}>∂z/∂y</text>
      <text x={88} y={160} fontSize={11} textAnchor="end" fill="var(--accent)" fontWeight={600}>∂x/∂s</text>
      <text x={158} y={160} fontSize={11} fill="var(--color-faint)">∂x/∂t</text>
      <text x={268} y={160} fontSize={11} textAnchor="end" fill="var(--accent)" fontWeight={600}>∂y/∂s</text>
      <text x={338} y={160} fontSize={11} fill="var(--color-faint)">∂y/∂t</text>

      {/* nodes */}
      {node(220, 35, "z", true)}
      {node(130, 115, "x")}
      {node(310, 115, "y")}
      {node(75, 195, "s", true)}
      {node(165, 195, "t")}
      {node(255, 195, "s", true)}
      {node(345, 195, "t")}
    </svg>
  );
}

/* ================================================================== *
 *  LESSONS
 * ================================================================== */

export const lessons: Lesson[] = [
  /* ------------------------------------------------------------ *
   * Lesson 1 — Partial derivatives
   * ------------------------------------------------------------ */
  {
    id: "partial-derivatives",
    title: "Partial derivatives",
    lecture: MODULE,
    summary:
      "Freeze every variable except one, compute the gradient in R² or R³, and know exactly what coordinate slopes do — and do not — prove.",
    minutes: 24,
    objectives: [
      "Write the partial derivatives as one-dimensional limits",
      "Compute partials and gradients in R² and R³ by freezing every other variable",
      "Read a partial derivative as the slope of a slice curve",
      "Use Schwarz's theorem to equate mixed second-order partials — and know when it applies",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A function <Tex>{"f(x,y)"}</Tex> changes in infinitely many directions, so a single
            &ldquo;derivative number&rdquo; cannot describe it. The first idea of differential
            calculus in several variables is disarmingly simple: <strong>freeze one variable</strong>{" "}
            and differentiate in the other. That reduces everything to the 1-D calculus you already
            own — the limit of a difference quotient along one coordinate direction.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Course map",
        content: (
          <>
            This lesson follows <strong>3_DifferentialCalculus, slides 5–12 and 29–33</strong>.
            Its computed examples are checked against <strong>Exercise Sheet: Curves &amp;
            Functions in several variables, Exercise 7</strong>. The later slides introduce
            higher-order partials after differentiability; they are taught here because Schwarz's
            theorem is the natural completion of the partial-derivative toolkit.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Partial derivatives",
        content: (
          <>
            The partial derivative of <Tex>{"f"}</Tex> with respect to <Tex>{"x"}</Tex> at{" "}
            <Tex>{"(a,b)"}</Tex> is the ordinary derivative of the one-variable function{" "}
            <Tex>{"x \\mapsto f(x,b)"}</Tex> at <Tex>{"x=a"}</Tex>; symmetrically for{" "}
            <Tex>{"y"}</Tex>. Notations: <Tex>{"f_x = \\dfrac{\\partial f}{\\partial x}"}</Tex>,{" "}
            <Tex>{"f_y = \\dfrac{\\partial f}{\\partial y}"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "f_x(a,b) = \\lim_{h\\to 0} \\frac{f(a+h,\\,b)-f(a,b)}{h}, \\qquad f_y(a,b) = \\lim_{k\\to 0} \\frac{f(a,\\,b+k)-f(a,b)}{k}",
        tag: "2.1",
        caption: (
          <>
            Each is a genuine <strong>one-dimensional</strong> limit: only one variable moves, the
            other is pinned at its value.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            In practice you almost never touch the limit: to get <Tex>{"f_x"}</Tex>, treat{" "}
            <Tex>{"y"}</Tex> as a constant and apply the usual rules (power, product, chain). The
            limit definition comes back only where the formula breaks down — typically at the glue
            point of a piecewise function, which is exactly what written exams love to ask.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Tutorial Exercise 7 — quotient rule without losing a sign",
        content: (
          <>
            <p>
              For <Tex>{"f(x,y)=\\dfrac{x+y}{x-y}"}</Tex>, the domain excludes the line
              <Tex>{"x=y"}</Tex>. Freezing <Tex>{"y"}</Tex> and then <Tex>{"x"}</Tex> gives
            </p>
            <p>
              <Tex>{"f_x=\\dfrac{(x-y)-(x+y)}{(x-y)^2}=\\dfrac{-2y}{(x-y)^2}"}</Tex>,{" "}
              <Tex>{"f_y=\\dfrac{(x-y)+(x+y)}{(x-y)^2}=\\dfrac{2x}{(x-y)^2}"}</Tex>.
            </p>
            <p>
              Therefore <Tex>{"\\nabla f(1,-1)=(\\tfrac12,\\tfrac12)"}</Tex>: in the first
              component the formula has a minus sign, but evaluating at <Tex>{"y=-1"}</Tex>
              produces <Tex>{"-2(-1)/4=1/2"}</Tex>. Keeping the symbolic sign and the sign of the
              coordinate separate is the safest way to avoid the tutorial's intended trap.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Tutorial Exercise 7 — a gradient in R³",
        content: (
          <>
            <p>
              Let <Tex>{"f(x,y,z)=x^2(y-z)-\\log x"}</Tex>, so the domain requires
              <Tex>{"x>0"}</Tex>. There is one partial for each coordinate:
            </p>
            <p>
              <Tex>{"f_x=2x(y-z)-\\dfrac1x,\\quad f_y=x^2,\\quad f_z=-x^2"}</Tex>.
              At <Tex>{"P=(2,1,-1)"}</Tex>,
              <Tex>{"\\nabla f(P)=(\\tfrac{15}{2},4,-4)"}</Tex>.
            </p>
            <p>
              Nothing new happens in three variables: freeze two, differentiate in the third, and
              collect the three answers in order.
            </p>
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\nabla f(P)=\\left(\\frac{\\partial f}{\\partial x_1}(P),\\ldots,\\frac{\\partial f}{\\partial x_n}(P)\\right)",
        caption: (
          <>
            The slides define the gradient in <Tex>{"\\mathbb R^2"}</Tex> and
            <Tex>{"\\mathbb R^3"}</Tex>; this is the same definition in
            <Tex>{"\\mathbb R^n"}</Tex>. A scalar field produces a vector field
            <Tex>{"\\nabla f:D\\to\\mathbb R^n"}</Tex> wherever the partials exist.
          </>
        ),
      },
      { kind: "heading", text: "What a partial derivative looks like" },
      {
        kind: "prose",
        content: (
          <p>
            Geometrically, the vertical plane <Tex>{"y=b"}</Tex> cuts the surface{" "}
            <Tex>{"z=f(x,y)"}</Tex> in a curve <Tex>{"z=f(x,b)"}</Tex>; <Tex>{"f_x(a,b)"}</Tex> is the{" "}
            <strong>slope of that slice curve</strong> at <Tex>{"x=a"}</Tex>. Likewise{" "}
            <Tex>{"f_y(a,b)"}</Tex> is the slope of the slice cut by <Tex>{"x=a"}</Tex>. Two slices,
            two slopes — the surface's behaviour in just two of its infinitely many directions.
          </p>
        ),
      },
      {
        kind: "figure",
        render: () => <SliceFigure />,
        caption: (
          <>
            The two coordinate slices through the same surface point. <Tex>{"f_x"}</Tex> and{" "}
            <Tex>{"f_y"}</Tex> are the slopes of the drawn tangent lines — nothing more, nothing
            less.
          </>
        ),
      },
      { kind: "heading", text: "Higher-order partials and Schwarz's theorem" },
      {
        kind: "prose",
        content: (
          <p>
            Differentiating again gives four second-order partials: <Tex>{"f_{xx}"}</Tex>,{" "}
            <Tex>{"f_{yy}"}</Tex> and the <strong>mixed</strong> ones. Convention used here:{" "}
            <Tex>{"f_{xy} = (f_x)_y"}</Tex>, i.e. differentiate in <Tex>{"x"}</Tex> first, then in{" "}
            <Tex>{"y"}</Tex>. You would expect the order to matter — remarkably, for every function
            you will meet in this course, it does not.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{\\partial^2 f}{\\partial y\\,\\partial x} \\;=\\; \\frac{\\partial^2 f}{\\partial x\\,\\partial y}",
        tag: "2.2",
        caption: <>Schwarz (Clairaut): mixed partials coincide when they are continuous.</>,
      },
      {
        kind: "callout",
        tone: "key",
        title: "Schwarz's theorem — precise statement",
        content: (
          <>
            If the mixed partials <Tex>{"f_{xy}"}</Tex> and <Tex>{"f_{yx}"}</Tex> exist in a
            neighbourhood of <Tex>{"P"}</Tex> and are <strong>continuous at</strong> <Tex>{"P"}</Tex>,
            then <Tex>{"f_{xy}(P) = f_{yx}(P)"}</Tex>. Polynomials, exponentials, sines and their
            compositions are <Tex>{"C^\\infty"}</Tex>, so for them the order of differentiation never
            matters.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Equality of mixed partials is a theorem, not a law of nature",
        content: (
          <>
            For <Tex>{"f(x,y) = xy\\,\\dfrac{x^2-y^2}{x^2+y^2}"}</Tex> (with <Tex>{"f(0,0)=0"}</Tex>)
            one computes <Tex>{"f_{xy}(0,0) = -1"}</Tex> but <Tex>{"f_{yx}(0,0) = +1"}</Tex>. No
            contradiction: the mixed partials are <em>not continuous</em> at the origin, so Schwarz's
            hypothesis fails. If an exam question shows unequal mixed partials, the answer is
            &ldquo;the hypotheses of Schwarz's theorem are violated&rdquo; — not &ldquo;the
            computation is wrong&rdquo;.
          </>
        ),
      },
      {
        kind: "example",
        title: "Mixed partials agree for a polynomial",
        content: (
          <>
            <p>
              Take <Tex>{"f = x^3 y^2"}</Tex>. Then <Tex>{"f_x = 3x^2y^2"}</Tex> so{" "}
              <Tex>{"f_{xy} = 6x^2 y"}</Tex>; and <Tex>{"f_y = 2x^3 y"}</Tex> so{" "}
              <Tex>{"f_{yx} = 6x^2 y"}</Tex>. Identical, as Schwarz promises — a free sanity check on
              your algebra: if your two mixed partials of a smooth function differ, you made a slip.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "How to compute any partial derivative",
        steps: [
          {
            label: "Name the moving variable",
            content: <>Decide which variable differentiates; every other symbol is temporarily a constant.</>,
          },
          {
            label: "Apply 1-D rules",
            content: (
              <>
                Use power/product/quotient/chain rules exactly as in Analysis I — e.g.{" "}
                <Tex>{"\\partial_x\\, e^{xy} = y\\,e^{xy}"}</Tex> by the chain rule with inner
                derivative <Tex>{"\\partial_x(xy) = y"}</Tex>.
              </>
            ),
          },
          {
            label: "Piecewise point? Use the limit",
            content: (
              <>
                At a glue point (typically the origin) the rules do not apply: fall back on (2.1)
                with the values the pieces actually take, e.g.{" "}
                <Tex>{"f_x(0,0) = \\lim_{h\\to0} \\frac{f(h,0)-f(0,0)}{h}"}</Tex>.
              </>
            ),
          },
          {
            label: "Check with Schwarz",
            content: <>For smooth functions, verify <Tex>{"f_{xy}=f_{yx}"}</Tex> to catch algebra slips for free.</>,
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-dif-cp1",
          difficulty: "easy",
          prompt: (
            <>
              For <Tex>{"f(x,y) = x^2 y^3"}</Tex>, what is <Tex>{"f_y(2,1)"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"4"}</Tex> },
            { id: "B", content: <Tex>{"16"}</Tex> },
            { id: "C", content: <Tex>{"12"}</Tex> },
            { id: "D", content: <Tex>{"6"}</Tex> },
          ],
          correct: "C",
          explanation: (
            <>
              Freeze <Tex>{"x"}</Tex>: <Tex>{"f_y = 3x^2y^2"}</Tex>, so{" "}
              <Tex>{"f_y(2,1) = 3\\cdot4\\cdot1 = 12"}</Tex> — C. A is{" "}
              <Tex>{"f_x(2,1) = 2xy^3 = 4"}</Tex> (wrong variable); B adds both partials{" "}
              <Tex>{"4+12"}</Tex> as if both variables moved; D forgets to square <Tex>{"x"}</Tex>.
            </>
          ),
          theory: <>To compute a partial, only one variable differentiates — all others are constants.</>,
        },
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Sanity checks that cost nothing",
        content: (
          <>
            Degrees must drop by one in the differentiated variable only (
            <Tex>{"x^3y^2 \\to 3x^2y^2"}</Tex>: the <Tex>{"y"}</Tex>-power is untouched). And if{" "}
            <Tex>{"f"}</Tex> is symmetric in <Tex>{"x, y"}</Tex>, then <Tex>{"f_y"}</Tex> must be{" "}
            <Tex>{"f_x"}</Tex> with the variables swapped.
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------ *
   * Lesson 2 — Differentiability & the tangent plane
   * ------------------------------------------------------------ */
  {
    id: "differentiability-tangent-plane",
    title: "Differentiability & the tangent plane",
    lecture: MODULE,
    summary:
      "Having partials is cheap; being differentiable — approximable by a plane — is the real prize, and it is what exams test at the origin of piecewise functions.",
    minutes: 22,
    objectives: [
      "State differentiability as linear approximation with o(‖h‖) error",
      "Explain why existence of partials does NOT imply differentiability or continuity",
      "Apply the C¹ sufficient condition and the implication chain differentiable ⇒ continuous",
      "Write the tangent plane and use it for linear approximation estimates",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            In one variable, &ldquo;differentiable at <Tex>{"a"}</Tex>&rdquo; means the graph is
            locally indistinguishable from its tangent line. The honest two-variable analogue is{" "}
            <strong>not</strong> &ldquo;both partials exist&rdquo; — it is that the graph is locally
            indistinguishable from a <strong>plane</strong>. This section is the conceptual heart of
            the module, and the favourite topic of the written exam.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Course map",
        content: (
          <>
            This lesson follows <strong>3_DifferentialCalculus, slides 17–24</strong>, including
            the professor's geometric tangent-plane interpretation and the
            <Tex>{"C^1\\Rightarrow"}</Tex> differentiable criterion. The worked tangent planes are
            from <strong>Curves &amp; Functions, Exercise 8</strong>.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Differentiable at a point",
        content: (
          <>
            <Tex>{"f"}</Tex> is differentiable at <Tex>{"(a,b)"}</Tex> if both partials exist there
            and the remainder of the linear approximation is negligible compared with the
            displacement: the error divided by <Tex>{"\\rho = \\sqrt{h^2+k^2}"}</Tex> tends to 0 as{" "}
            <Tex>{"(h,k)\\to(0,0)"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "f(a+h,\\,b+k) = f(a,b) + f_x(a,b)\\,h + f_y(a,b)\\,k + o\\!\\left(\\sqrt{h^2+k^2}\\right)",
        tag: "2.3",
        caption: (
          <>
            Equivalently: <Tex>{"\\dfrac{f(a+h,b+k)-f(a,b)-f_x h - f_y k}{\\sqrt{h^2+k^2}} \\to 0"}</Tex>.
            The division by <Tex>{"\\rho"}</Tex> is the whole point — the error must die{" "}
            <em>faster</em> than the step.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Why is this stronger than having partials? Because the limit in (2.3) is a genuine{" "}
            <strong>two-dimensional</strong> limit: the plane must fit the surface from{" "}
            <em>every</em> direction of approach at once. The partials, by contrast, only inspect the
            two coordinate axes. A function can behave perfectly along the axes and horribly
            everywhere else.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Partials exist ⇏ differentiable (not even continuous!)",
        content: (
          <>
            Take the classic <Tex>{"f(x,y)=\\dfrac{xy}{x^2+y^2}"}</Tex> with <Tex>{"f(0,0)=0"}</Tex>.
            On both axes <Tex>{"f \\equiv 0"}</Tex>, so by (2.1) both partials at the origin exist
            and equal <Tex>{"0"}</Tex>. Yet from the limits module, <Tex>{"f"}</Tex> has{" "}
            <strong>no limit</strong> at the origin (along <Tex>{"y=x"}</Tex> it is constantly{" "}
            <Tex>{"\\tfrac12"}</Tex>) — it is not even continuous there, let alone differentiable.
            Existence of partials is a shockingly weak property.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Differentiable ⇒ continuous",
        content: (
          <>
            Read (2.3) as <Tex>{"(h,k)\\to(0,0)"}</Tex>: every term on the right tends to{" "}
            <Tex>{"f(a,b)"}</Tex> or to 0, so <Tex>{"f(a+h,b+k)\\to f(a,b)"}</Tex>. Contrapositive —
            the exam workhorse: <strong>if f is not continuous at P, it cannot be differentiable at
            P</strong>, no matter what the partials do.
          </>
        ),
      },
      { kind: "heading", text: "The C¹ shortcut" },
      {
        kind: "callout",
        tone: "key",
        title: "Sufficient condition (the everyday tool)",
        content: (
          <>
            If <Tex>{"f_x"}</Tex> and <Tex>{"f_y"}</Tex> exist in a neighbourhood of <Tex>{"P"}</Tex>{" "}
            and are <strong>continuous at</strong> <Tex>{"P"}</Tex> (one says{" "}
            <Tex>{"f \\in C^1"}</Tex>), then <Tex>{"f"}</Tex> is differentiable at <Tex>{"P"}</Tex>.
            This is how you justify differentiability of every formula-built function away from its
            bad points — no limits needed. Note the one-way direction: differentiable functions need{" "}
            <em>not</em> have continuous partials.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <ImplicationMap />,
        caption: (
          <>
            The implication map to memorize. All arrows are one-way; each red note is the standard
            counterexample for the reversed arrow.
          </>
        ),
      },
      { kind: "heading", text: "The tangent plane" },
      {
        kind: "prose",
        content: (
          <p>
            When <Tex>{"f"}</Tex> is differentiable at <Tex>{"(a,b)"}</Tex>, the linear part of (2.3)
            defines the plane that hugs the surface — the <strong>tangent plane</strong>. It is the
            2-D version of the tangent line, and its existence is <em>equivalent</em> to
            differentiability.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "z = f(a,b) + f_x(a,b)\\,(x-a) + f_y(a,b)\\,(y-b)",
        tag: "2.4",
        caption: (
          <>
            A normal vector is <Tex>{"(f_x(a,b),\\, f_y(a,b),\\, -1)"}</Tex> — rewrite (2.4) as{" "}
            <Tex>{"f_x\\,x + f_y\\,y - z = \\text{const}"}</Tex> to see it.
          </>
        ),
      },
      {
        kind: "example",
        title: "Tutorial Exercise 8 — prove C¹ before writing the plane",
        content: (
          <>
            <p>
              Let <Tex>{"f(x,y)=\\log(1+x^2-y^2)"}</Tex> at <Tex>{"P=(1,0)"}</Tex>. Its domain
              <Tex>{"D=\\{1+x^2-y^2>0\\}"}</Tex> is open and contains <Tex>{"P"}</Tex>. On
              <Tex>{"D"}</Tex>,
            </p>
            <p>
              <Tex>{"f_x=\\dfrac{2x}{1+x^2-y^2},\\qquad f_y=\\dfrac{-2y}{1+x^2-y^2}"}</Tex>
              are continuous, hence <Tex>{"f\\in C^1(D)"}</Tex> and is differentiable. Now
              <Tex>{"f(1,0)=\\log2"}</Tex> and <Tex>{"\\nabla f(1,0)=(1,0)"}</Tex>, so
              <Tex>{"z=\\log2+(x-1)=x+\\log2-1"}</Tex>.
            </p>
            <p>
              The first tutorial case, <Tex>{"f=\\sin x\\cos y"}</Tex> at the origin, works the
              same way: it is <Tex>{"C^1"}</Tex>, <Tex>{"\\nabla f(0,0)=(1,0)"}</Tex>, and the
              plane is <Tex>{"z=x"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Linear approximation — estimating without a calculator",
        content: (
          <>
            <p>
              Estimate <Tex>{"1.02 \\cdot (0.97)^2"}</Tex> using <Tex>{"f(x,y)=xy^2"}</Tex> near{" "}
              <Tex>{"(1,1)"}</Tex>: <Tex>{"f(1,1)=1"}</Tex>, <Tex>{"f_x = y^2 = 1"}</Tex>,{" "}
              <Tex>{"f_y = 2xy = 2"}</Tex>, with <Tex>{"\\Delta x = 0.02"}</Tex>,{" "}
              <Tex>{"\\Delta y = -0.03"}</Tex>.
            </p>
            <p>
              <Tex>{"f \\approx 1 + 1\\cdot(0.02) + 2\\cdot(-0.03) = 0.96"}</Tex>. The true value is{" "}
              <Tex>{"0.959718"}</Tex> — the plane is off by <Tex>{"0.0003"}</Tex>. That accuracy is
              exactly the <Tex>{"o(\\rho)"}</Tex> promise of (2.3) at work.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Exam method — differentiability study at a glue point",
        steps: [
          {
            label: "Continuity first",
            content: (
              <>
                Check <Tex>{"\\lim_{(x,y)\\to P} f = f(P)"}</Tex> (polar bound). If it fails, stop:
                not continuous ⇒ <strong>not differentiable</strong>.
              </>
            ),
          },
          {
            label: "Partials by the limit definition",
            content: (
              <>
                Compute <Tex>{"f_x(P), f_y(P)"}</Tex> from (2.1) — formulas do not apply at the glue
                point. If one fails to exist, not differentiable.
              </>
            ),
          },
          {
            label: "Form the remainder quotient",
            content: (
              <>
                Build{" "}
                <Tex>{"\\dfrac{f(a+h,b+k)-f(a,b)-f_x h-f_y k}{\\sqrt{h^2+k^2}}"}</Tex> and simplify.
              </>
            ),
          },
          {
            label: "Test it as a 2-D limit",
            content: (
              <>
                Switch to polar. If it is bounded by <Tex>{"h(r)\\to0"}</Tex>, differentiable; if a{" "}
                <Tex>{"\\theta"}</Tex>-dependence survives, exhibit two angles with different values
                — not differentiable.
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-dif-cp2",
          difficulty: "medium",
          prompt: (
            <>
              Both partial derivatives of <Tex>{"f"}</Tex> exist at <Tex>{"P"}</Tex>. Which
              conclusion is justified?
            </>
          ),
          options: [
            { id: "A", content: <>f is continuous at P</> },
            { id: "B", content: <>f is differentiable at P</> },
            { id: "C", content: <>f has a tangent plane at P</> },
            { id: "D", content: <>None of them — partials only probe the two axis directions</> },
          ],
          correct: "D",
          explanation: (
            <>
              D. The counterexample <Tex>{"xy/(x^2+y^2)"}</Tex> has both partials equal to 0 at the
              origin yet is not even continuous there — killing A, and with it B and C (differentiable
              ⇒ continuous, and tangent plane ⇔ differentiable). Partials are 1-D probes along the
              axes; differentiability is a 2-D property.
            </>
          ),
          theory: <>Partials exist ⇏ continuous ⇏ differentiable; only the C¹ condition upgrades partials to differentiability.</>,
        },
      },
      {
        kind: "callout",
        tone: "tip",
        title: "How to answer 'is f differentiable?' fast",
        content: (
          <>
            Away from glue points: partials are elementary formulas ⇒ continuous ⇒{" "}
            <Tex>{"C^1"}</Tex> ⇒ differentiable — one line. At the glue point: run the four-step
            method above. Never write &ldquo;partials exist, hence differentiable&rdquo; — that
            sentence alone can cost you the whole exercise.
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------ *
   * Lesson 3 — Gradient & directional derivatives
   * ------------------------------------------------------------ */
  {
    id: "gradient-directional-derivatives",
    title: "Gradient & directional derivatives",
    lecture: MODULE,
    summary:
      "One vector, ∇f, encodes the slope in every direction: dot it with a unit vector to get the slope, follow it for steepest ascent, and it is always perpendicular to the level curves.",
    minutes: 22,
    objectives: [
      "Define the directional derivative as a 1-D limit along a unit vector",
      "Compute D_v f = ∇f · v for differentiable functions — and normalize v first",
      "Identify steepest ascent/descent directions and the maximal rate |∇f|",
      "Explain why the gradient is perpendicular to level curves",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Partial derivatives give the slope in two special directions. But a hiker on the surface{" "}
            <Tex>{"z=f(x,y)"}</Tex> can walk in <em>any</em> direction. The{" "}
            <strong>directional derivative</strong> measures the slope along an arbitrary unit vector
            — and for differentiable functions all of these infinitely many slopes are generated by a
            single vector: the gradient.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Course map",
        content: (
          <>
            This lesson follows <strong>3_DifferentialCalculus, slides 13–16 and 25–28</strong>.
            The direct-limit examples come from <strong>Curves &amp; Functions, Exercise 9</strong>;
            the maximum/minimum-direction questions are the exercises on slide 26.
          </>
        ),
      },
      {
        kind: "definition",
        term: "Directional derivative",
        content: (
          <>
            For a <strong>unit</strong> vector <Tex>{"v=(v_1,v_2)"}</Tex>,{" "}
            <Tex>{"D_v f(a,b) = \\lim_{t\\to0} \\dfrac{f(a+tv_1,\\, b+tv_2) - f(a,b)}{t}"}</Tex> — the
            1-D derivative of <Tex>{"f"}</Tex> restricted to the line through <Tex>{"(a,b)"}</Tex> in
            direction <Tex>{"v"}</Tex>. The partials are the special cases{" "}
            <Tex>{"v=(1,0)"}</Tex> and <Tex>{"v=(0,1)"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\nabla f(a,b) = \\big( f_x(a,b),\\; f_y(a,b) \\big)",
        tag: "2.5",
        caption: <>The gradient: both partials packaged as a vector in the xy-plane.</>,
      },
      {
        kind: "formula",
        tex: "D_v f(a,b) = \\nabla f(a,b) \\cdot v = f_x(a,b)\\,v_1 + f_y(a,b)\\,v_2",
        tag: "2.6",
        caption: (
          <>
            <strong>Valid when f is differentiable at the point</strong> — it is the linear
            approximation (2.3) read along the ray <Tex>{"(h,k) = t\\,v"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Two ways students lose marks with (2.6)",
        content: (
          <>
            <strong>1 — Not normalizing.</strong> The formula needs <Tex>{"|v|=1"}</Tex>. For a
            direction like <Tex>{"(3,4)"}</Tex> first divide by its length 5, otherwise your answer
            is 5 times too big. <strong>2 — Using it without differentiability.</strong> For{" "}
            <Tex>{"g(x,y)=x^3y/(x^6+y^2)"}</Tex>, with value 0 at the origin, every directional
            derivative exists and is 0: for <Tex>{"v=(a,b)"}</Tex> with <Tex>{"b\\ne0"}</Tex>, the
            difference quotient is
            <Tex>{"\\dfrac{t a^3b}{t^4a^6+b^2}\\to0"}</Tex>, and for <Tex>{"b=0"}</Tex> the
            numerator vanishes. Thus even <Tex>{"D_vg=\\nabla g(O)\\cdot v"}</Tex> for every
            <Tex>{"v"}</Tex> does <strong>not</strong> prove differentiability: along
            <Tex>{"y=x^3"}</Tex>, <Tex>{"g=1/2"}</Tex>, so <Tex>{"g"}</Tex> is not even continuous.
            Formula (2.6) is a consequence of differentiability, never a test in the reverse
            direction.
          </>
        ),
      },
      { kind: "heading", text: "Steepest ascent, steepest descent" },
      {
        kind: "prose",
        content: (
          <p>
            Write (2.6) with the angle <Tex>{"\\varphi"}</Tex> between <Tex>{"v"}</Tex> and{" "}
            <Tex>{"\\nabla f"}</Tex>: <Tex>{"D_v f = |\\nabla f|\\cos\\varphi"}</Tex>. As{" "}
            <Tex>{"v"}</Tex> rotates, the slope traces a cosine — everything about &ldquo;which way
            is up&rdquo; is in this one identity.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\max_{|v|=1} D_v f = |\\nabla f| \\;\\; (v \\parallel \\nabla f), \\qquad \\min_{|v|=1} D_v f = -|\\nabla f|, \\qquad D_v f = 0 \\iff v \\perp \\nabla f",
        tag: "2.7",
        caption: (
          <>
            Steepest ascent along <Tex>{"\\nabla f/|\\nabla f|"}</Tex>, steepest descent opposite,
            zero change perpendicular.
          </>
        ),
      },
      {
        kind: "sim",
        title: "Gradient explorer — f(x,y) = x² + 2y²",
        render: () => <GradientExplorerSim />,
        caption: (
          <>
            Every number is computed from <Tex>{"\\nabla f = (2x, 4y)"}</Tex> and (2.6). Rotate θ and
            watch <Tex>{"D_v f"}</Tex> trace the cosine of (2.7): maximum when the arrows align,
            zero when v is tangent to the dashed level ellipse — the picture behind &ldquo;gradient
            ⟂ level curves&rdquo;.
          </>
        ),
      },
      { kind: "heading", text: "Gradient ⟂ level curves" },
      {
        kind: "prose",
        content: (
          <p>
            A level curve <Tex>{"f(x,y)=c"}</Tex> is a path along which <Tex>{"f"}</Tex> does not
            change, so the slope along its tangent direction is 0 — by (2.7) that tangent must be
            perpendicular to <Tex>{"\\nabla f"}</Tex>. On a topographic map: contour lines are level
            curves of altitude, and the steepest way up is always at right angles to them. The clean
            proof is one line of chain rule, coming in the next lesson.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Tutorial Exercise 9 — coordinate direction in R³",
        content: (
          <>
            <p>
              For <Tex>{"f(x,y,z)=x^3y-yz+2"}</Tex>,
              <Tex>{"\\nabla f=(3x^2y,\\,x^3-z,\\,-y)"}</Tex>. At
              <Tex>{"P=(1,1,-1)"}</Tex> this is <Tex>{"(3,2,-1)"}</Tex>.
            </p>
            <p>
              The requested direction <Tex>{"v=(0,1,0)"}</Tex> is already unit, so
              <Tex>{"D_vf(P)=(3,2,-1)\\cdot(0,1,0)=2"}</Tex>. Because this is the coordinate
              vector <Tex>{"e_y"}</Tex>, the same answer is simply <Tex>{"f_y(P)=2"}</Tex>.
            </p>
            <p>
              <strong>Source erratum:</strong> the supplied solution sheet prints
              <Tex>{"f_x=2x^2y"}</Tex> on one line; differentiating <Tex>{"x^3y"}</Tex> gives
              <Tex>{"3x^2y"}</Tex>. Its next line uses the corrected value 3 in the gradient, so the
              official final directional derivative 2 remains valid.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Directional-derivative recipe",
        steps: [
          {
            label: "Justify differentiability",
            content: <>Formula-built and smooth near the point ⇒ <Tex>{"C^1"}</Tex> ⇒ (2.6) applies.</>,
          },
          {
            label: "Gradient at the point",
            content: <>Compute both partials, plug in the point: <Tex>{"\\nabla f(a,b)"}</Tex>.</>,
          },
          {
            label: "Normalize the direction",
            content: <>Replace the given direction <Tex>{"w"}</Tex> by <Tex>{"v = w/|w|"}</Tex>.</>,
          },
          {
            label: "Dot product",
            content: <><Tex>{"D_v f = \\nabla f \\cdot v"}</Tex>; for extremes use (2.7) directly, no dotting needed.</>,
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-dif-cp3",
          difficulty: "easy",
          prompt: (
            <>
              For <Tex>{"f = x^2 + 2y^2"}</Tex> at <Tex>{"(1,1)"}</Tex>, what is the directional
              derivative along <Tex>{"v = (0,1)"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"2"}</Tex> },
            { id: "B", content: <Tex>{"4"}</Tex> },
            { id: "C", content: <Tex>{"\\sqrt{20}"}</Tex> },
            { id: "D", content: <Tex>{"6"}</Tex> },
          ],
          correct: "B",
          explanation: (
            <>
              <Tex>{"v=(0,1)"}</Tex> is already unit, and <Tex>{"D_{(0,1)}f = f_y = 4y = 4"}</Tex> — B.
              A is <Tex>{"f_x = 2"}</Tex> (wrong axis); C is <Tex>{"|\\nabla f|"}</Tex>, the{" "}
              <em>maximum</em> over all directions, not this one; D adds the two partials, which
              corresponds to the non-unit direction <Tex>{"(1,1)"}</Tex>.
            </>
          ),
          theory: <>Along a coordinate direction the directional derivative reduces to the matching partial.</>,
        },
      },
      {
        kind: "callout",
        tone: "key",
        title: "The gradient in one breath",
        content: (
          <>
            <Tex>{"\\nabla f"}</Tex> points where <Tex>{"f"}</Tex> grows fastest, its length is that
            fastest rate, it is perpendicular to the level curve through the point, and dotting it
            with any unit vector yields the slope in that direction. Four facts, one vector.
          </>
        ),
      },
    ],
  },

  /* ------------------------------------------------------------ *
   * Lesson 4 — The chain rule
   * ------------------------------------------------------------ */
  {
    id: "chain-rule",
    title: "The chain rule",
    lecture: MODULE,
    summary:
      "Differentiate through compositions: one product per dependency path, then add — from f along a curve to full two-variable substitutions.",
    minutes: 18,
    objectives: [
      "Differentiate t ↦ f(x(t), y(t)) with the curve chain rule",
      "Apply the full chain rule for z = f(x(s,t), y(s,t)) using a dependency tree",
      "Evaluate outer partials at the inner point (the classic mark-loser)",
      "Prove that the gradient is perpendicular to level curves",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Real quantities are compositions: the temperature felt by a drone is{" "}
            <Tex>{"T(x(t), y(t))"}</Tex> — a field evaluated along a trajectory. Differentiating such
            compositions is what the chain rule does, and in several variables it has a beautiful
            bookkeeping: <strong>one term per route</strong> through which the input can influence
            the output.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Bridge theorem",
        content: (
          <>
            The handwritten differential-calculus slides do not isolate the multivariable chain
            rule as a numbered section. They do state
            <Tex>{"D_vf(P)=\\nabla f(P)\\cdot v"}</Tex> on slide 25 and then use derivatives of
            compositions throughout the later curve, surface, and change-of-variable material.
            This lesson makes that prerequisite explicit and proves the level-curve geometry used
            elsewhere in the course.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\frac{dz}{dt} = f_x\\big(x(t),y(t)\\big)\\,x'(t) + f_y\\big(x(t),y(t)\\big)\\,y'(t) \\;=\\; \\nabla f \\cdot r'(t)",
        tag: "2.8",
        caption: (
          <>
            The curve case, <Tex>{"z = f(x(t), y(t))"}</Tex>, valid for <Tex>{"f"}</Tex>{" "}
            differentiable and <Tex>{"r(t)=(x(t),y(t))"}</Tex> differentiable. Note it is exactly a
            gradient dotted with the velocity.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Reading (2.8) physically: the rate of change you experience is the field's slope in your
            direction of motion, times your speed. If <Tex>{"r'(t)"}</Tex> is a unit vector this is
            precisely the directional derivative (2.6) — the two formulas are the same fact.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Verify it on an explicit composition",
        content: (
          <>
            <p>
              <Tex>{"z = x^2 y"}</Tex> with <Tex>{"x=\\cos t,\\ y=\\sin t"}</Tex>. Chain rule:{" "}
              <Tex>{"\\dfrac{dz}{dt} = 2xy\\,(-\\sin t) + x^2\\cos t = -2\\cos t\\sin^2 t + \\cos^3 t"}</Tex>.
            </p>
            <p>
              Direct check: <Tex>{"z(t) = \\cos^2 t \\sin t"}</Tex>, so{" "}
              <Tex>{"z' = -2\\cos t\\sin t\\cdot\\sin t + \\cos^2 t\\cdot\\cos t"}</Tex> — the same.
              The chain rule is not a new derivative, just an organized way to compute the old one.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "The general case" },
      {
        kind: "formula",
        tex: "\\frac{\\partial z}{\\partial s} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial s}, \\qquad \\frac{\\partial z}{\\partial t} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial t}",
        tag: "2.9",
        caption: (
          <>
            For <Tex>{"z=f(x,y)"}</Tex>, <Tex>{"x=x(s,t)"}</Tex>, <Tex>{"y=y(s,t)"}</Tex>: two routes
            from <Tex>{"z"}</Tex> to each bottom variable, two products, one sum.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <ChainTree />,
        caption: (
          <>
            The dependency tree. For <Tex>{"\\partial z/\\partial s"}</Tex>, multiply the labels
            along each highlighted path from z down to s and add the two products — that is (2.9)
            drawn as a picture.
          </>
        ),
      },
      {
        kind: "steps",
        title: "Chain-rule recipe (never drops a term)",
        steps: [
          { label: "Draw the tree", content: <>Top: the output. Middle: intermediate variables. Bottom: the true independent variables.</> },
          { label: "Trace every path", content: <>List each route from the output to the variable you differentiate with respect to.</> },
          { label: "Multiply along, add across", content: <>Each path contributes the product of the partial derivatives along its edges; sum the paths.</> },
          {
            label: "Evaluate at the right point",
            content: <>Outer partials like <Tex>{"f_x"}</Tex> are evaluated at the <em>inner</em> point <Tex>{"(x(s,t),\\,y(s,t))"}</Tex>, never at <Tex>{"(s,t)"}</Tex>.</>,
          },
        ],
      },
      {
        kind: "example",
        title: "Full two-variable case with numbers",
        content: (
          <>
            <p>
              <Tex>{"z = u^2 v"}</Tex> with <Tex>{"u = x + y^2"}</Tex>, <Tex>{"v = 3x"}</Tex>. At{" "}
              <Tex>{"(x,y)=(1,1)"}</Tex>: <Tex>{"u=2"}</Tex>, <Tex>{"v=3"}</Tex>.
            </p>
            <p>
              <Tex>{"\\dfrac{\\partial z}{\\partial x} = 2uv\\cdot 1 + u^2\\cdot 3 = 12 + 12 = 24"}</Tex>,{" "}
              <Tex>{"\\dfrac{\\partial z}{\\partial y} = 2uv\\cdot 2y + u^2\\cdot 0 = 24"}</Tex>.
            </p>
            <p>
              Check by substituting first: <Tex>{"z = 3x(x+y^2)^2"}</Tex>, so{" "}
              <Tex>{"z_x = 3(x+y^2)^2 + 6x(x+y^2) = 12 + 12 = 24"}</Tex> ✓ and{" "}
              <Tex>{"z_y = 3x\\cdot 2(x+y^2)\\cdot 2y = 24"}</Tex> ✓.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Payoff: why ∇f ⟂ level curves" },
      {
        kind: "prose",
        content: (
          <p>
            Let <Tex>{"r(t)"}</Tex> parametrize a level curve, so <Tex>{"f(r(t)) = c"}</Tex> for all{" "}
            <Tex>{"t"}</Tex>. Differentiate both sides with (2.8):{" "}
            <Tex>{"\\nabla f(r(t)) \\cdot r'(t) = 0"}</Tex>. The gradient is orthogonal to the
            curve's tangent vector at every point — the fact you watched in the gradient explorer,
            now proved in one line. This same identity later powers Lagrange multipliers and the
            normal to implicit curves.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Where chain-rule marks evaporate",
        content: (
          <>
            <strong>Dropping a branch:</strong> if <Tex>{"y"}</Tex> also depends on <Tex>{"t"}</Tex>,
            the term <Tex>{"f_y\\,y'"}</Tex> must appear — writing just <Tex>{"f_x\\,x'"}</Tex> is
            the most common error. <strong>Wrong evaluation point:</strong>{" "}
            <Tex>{"f_x"}</Tex> in (2.8) is evaluated at <Tex>{"(x(t), y(t))"}</Tex>, not at{" "}
            <Tex>{"t"}</Tex> and not at a generic <Tex>{"(x,y)"}</Tex>. <strong>Mixing d and ∂:</strong>{" "}
            <Tex>{"dz/dt"}</Tex> is a total derivative (one true variable), while{" "}
            <Tex>{"\\partial z/\\partial s"}</Tex> holds the other bottom variable fixed.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-dif-cp4",
          difficulty: "medium",
          prompt: (
            <>
              <Tex>{"z = xy"}</Tex>, <Tex>{"x = t^2"}</Tex>, <Tex>{"y = t^3"}</Tex>. What is{" "}
              <Tex>{"dz/dt"}</Tex> at <Tex>{"t = 1"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"5"}</Tex> },
            { id: "B", content: <Tex>{"6"}</Tex> },
            { id: "C", content: <Tex>{"2"}</Tex> },
            { id: "D", content: <Tex>{"3"}</Tex> },
          ],
          correct: "A",
          explanation: (
            <>
              <Tex>{"dz/dt = y\\cdot 2t + x\\cdot 3t^2 = 2t^4 + 3t^4 = 5t^4"}</Tex>, which is 5 at{" "}
              <Tex>{"t=1"}</Tex> — A. (Check: <Tex>{"z=t^5"}</Tex>, <Tex>{"z'=5t^4"}</Tex>.) B
              multiplies <Tex>{"x'(1)=2"}</Tex> by <Tex>{"y'(1)=3"}</Tex>; C keeps only the{" "}
              <Tex>{"f_x"}</Tex> branch; D keeps only the <Tex>{"f_y"}</Tex> branch.
            </>
          ),
          theory: <>One product per dependency path, added — never multiplied together, never truncated.</>,
        },
      },
      {
        kind: "callout",
        tone: "key",
        title: "Module summary",
        content: (
          <>
            Partials = axis slopes (cheap). Differentiability = a plane fits with{" "}
            <Tex>{"o(\\rho)"}</Tex> error (the real property; guaranteed by <Tex>{"C^1"}</Tex>).
            Gradient = all slopes in one vector via <Tex>{"D_v f = \\nabla f\\cdot v"}</Tex>, maximal
            along itself, perpendicular to level curves. Chain rule = one product per path, added.
            These four sentences are the skeleton of every exam question in this module.
          </>
        ),
      },
    ],
  },
];

/* ================================================================== *
 *  PRACTICE
 * ================================================================== */

export const practice: Question[] = [
  {
    id: "ma2-dif-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The partial derivative <Tex>{"f_x(a,b)"}</Tex> is defined as:</>,
    options: [
      { id: "A", content: <Tex>{"\\lim_{h\\to0} \\dfrac{f(a+h,\\,b+h)-f(a,b)}{h}"}</Tex> },
      { id: "B", content: <Tex>{"\\lim_{h\\to0} \\dfrac{f(a+h,\\,b)-f(a,b)}{h}"}</Tex> },
      { id: "C", content: <Tex>{"\\lim_{k\\to0} \\dfrac{f(a,\\,b+k)-f(a,b)}{k}"}</Tex> },
      { id: "D", content: <Tex>{"\\lim_{(h,k)\\to(0,0)} \\dfrac{f(a+h,b+k)-f(a,b)}{\\sqrt{h^2+k^2}}"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Only <Tex>{"x"}</Tex> moves while <Tex>{"y"}</Tex> stays pinned at <Tex>{"b"}</Tex> — B. In A
        both variables move together (that is a derivative along the diagonal direction, not a
        partial); C is the definition of <Tex>{"f_y"}</Tex>; D is a two-dimensional quotient related
        to differentiability, not a partial derivative.
      </>
    ),
    theory: <>A partial derivative is a 1-D limit: one coordinate varies, all others are frozen.</>,
  },
  {
    id: "ma2-dif-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        For <Tex>{"f(x,y) = x^3y^2 + 2x"}</Tex>, the value of <Tex>{"f_x(1,2)"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"14"}</Tex> },
      { id: "B", content: <Tex>{"12"}</Tex> },
      { id: "C", content: <Tex>{"4"}</Tex> },
      { id: "D", content: <Tex>{"18"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"f_x = 3x^2y^2 + 2"}</Tex>, so <Tex>{"f_x(1,2) = 3\\cdot1\\cdot4 + 2 = 14"}</Tex> — A.
        B forgets the derivative of the <Tex>{"2x"}</Tex> term; C is{" "}
        <Tex>{"f_y(1,2) = 2x^3y = 4"}</Tex> (wrong variable); D is <Tex>{"f_x + f_y = 14+4"}</Tex>,
        as if both variables were moving.
      </>
    ),
    theory: <>Differentiate term by term in the moving variable; constants in it survive only through their own derivative.</>,
  },
  {
    id: "ma2-dif-q3",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Geometrically, <Tex>{"f_y(a,b)"}</Tex> is:</>,
    options: [
      { id: "A", content: <>the slope of the slice curve <Tex>{"z=f(x,b)"}</Tex> in the x-direction</> },
      { id: "B", content: <>the steepest slope of the surface at the point</> },
      { id: "C", content: <>the slope at <Tex>{"(a,b)"}</Tex> of the curve cut from the surface by the plane <Tex>{"x=a"}</Tex></> },
      { id: "D", content: <>the curvature of the level curve through <Tex>{"(a,b)"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        Fixing <Tex>{"x=a"}</Tex> cuts the surface in the curve <Tex>{"z=f(a,y)"}</Tex>, and{" "}
        <Tex>{"f_y"}</Tex> is its slope — C. A describes <Tex>{"f_x"}</Tex>; B is{" "}
        <Tex>{"|\\nabla f|"}</Tex>, the maximal directional derivative; D confuses first derivatives
        with curvature, a second-order concept.
      </>
    ),
    theory: <>Each partial is the slope of the coordinate slice in its own direction.</>,
  },
  {
    id: "ma2-dif-q4",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Schwarz's (Clairaut's) theorem guarantees <Tex>{"f_{xy}(P) = f_{yx}(P)"}</Tex> provided:</>,
    options: [
      { id: "A", content: <>f is defined at P</> },
      { id: "B", content: <>nothing — mixed partials are equal for every function</> },
      { id: "C", content: <>f is continuous at P</> },
      { id: "D", content: <>the mixed partials exist near P and are continuous at P</> },
    ],
    correct: "D",
    explanation: (
      <>
        The theorem needs continuity of the mixed second partials at the point — D. B is false:{" "}
        <Tex>{"xy(x^2-y^2)/(x^2+y^2)"}</Tex> has mixed partials <Tex>{"-1"}</Tex> and <Tex>{"+1"}</Tex>{" "}
        at the origin. A and C are far too weak — they say nothing about second derivatives.
      </>
    ),
    theory: <>Schwarz swaps the order of differentiation only under continuity of the mixed partials.</>,
  },
  {
    id: "ma2-dif-q5",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Which implication is ALWAYS true for a function of two variables?</>,
    options: [
      { id: "A", content: <>differentiable at P ⇒ continuous at P</> },
      { id: "B", content: <>continuous at P ⇒ differentiable at P</> },
      { id: "C", content: <>both partials exist at P ⇒ continuous at P</> },
      { id: "D", content: <>both partials exist at P ⇒ differentiable at P</> },
    ],
    correct: "A",
    explanation: (
      <>
        A follows directly from the expansion (2.3): the increment tends to 0. B fails for{" "}
        <Tex>{"\\sqrt{x^2+y^2}"}</Tex> at the origin (continuous, no tangent plane — a cone tip). C
        and D both fail for <Tex>{"xy/(x^2+y^2)"}</Tex>: partials exist at the origin yet the
        function is not even continuous there.
      </>
    ),
    theory: <>The only automatic downward arrow is differentiable ⇒ continuous; everything else needs C¹.</>,
  },
  {
    id: "ma2-dif-q6",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>At a point where <Tex>{"\\nabla f \\ne 0"}</Tex>, the gradient vector points:</>,
    options: [
      { id: "A", content: <>along the level curve through the point</> },
      { id: "B", content: <>in the direction in which f increases fastest</> },
      { id: "C", content: <>toward the global maximum of f</> },
      { id: "D", content: <>in the direction of steepest descent</> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"D_v f = |\\nabla f|\\cos\\varphi"}</Tex> is maximal when v aligns with{" "}
        <Tex>{"\\nabla f"}</Tex> — B. A is perpendicular to the truth (the gradient is orthogonal to
        the level curve); C is a myth — the gradient is purely local and knows nothing about distant
        maxima; D describes <Tex>{"-\\nabla f"}</Tex>.
      </>
    ),
    theory: <>Gradient = local compass of fastest increase; its opposite is fastest decrease.</>,
  },
  {
    id: "ma2-dif-q7",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For <Tex>{"f(x,y) = x^2 y + e^{xy}"}</Tex>, the partial derivative <Tex>{"f_y"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"2xy + y\\,e^{xy}"}</Tex> },
      { id: "B", content: <Tex>{"x^2 + e^{xy}"}</Tex> },
      { id: "C", content: <Tex>{"x^2 + xy\\,e^{xy}"}</Tex> },
      { id: "D", content: <Tex>{"x^2 + x\\,e^{xy}"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        With x frozen: <Tex>{"\\partial_y(x^2y) = x^2"}</Tex> and{" "}
        <Tex>{"\\partial_y e^{xy} = x\\,e^{xy}"}</Tex> (chain rule, inner derivative{" "}
        <Tex>{"\\partial_y(xy)=x"}</Tex>) — D. A is <Tex>{"f_x"}</Tex>, the wrong variable; B forgets
        the chain factor x entirely; C uses the wrong inner derivative xy instead of x.
      </>
    ),
    theory: <>For exponentials e^(inner), always multiply by the partial of the inner function.</>,
  },
  {
    id: "ma2-dif-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For <Tex>{"f(x,y)=\\dfrac{xy}{x^2+y^2}"}</Tex> with <Tex>{"f(0,0)=0"}</Tex>, both partials at
        the origin exist and equal 0, yet f has no limit at the origin. This example shows that:
      </>
    ),
    options: [
      { id: "A", content: <>Schwarz's theorem fails for this function</> },
      { id: "B", content: <>the partial derivatives must have been computed incorrectly</> },
      { id: "C", content: <>existence of both partials at a point implies neither continuity nor differentiability there</> },
      { id: "D", content: <>f is differentiable at the origin but not continuous</> },
    ],
    correct: "C",
    explanation: (
      <>
        C — the moral of the whole chapter. The partials only look along the axes, where{" "}
        <Tex>{"f\\equiv0"}</Tex>, so they exist and vanish (B is wrong — the computation is fine);
        meanwhile along <Tex>{"y=x"}</Tex> the function is constantly <Tex>{"\\tfrac12"}</Tex>, so no
        limit. D is impossible because differentiable ⇒ continuous. A is irrelevant: Schwarz concerns
        mixed second partials.
      </>
    ),
    theory: <>Partials are axis-only probes; continuity and differentiability are full 2-D properties.</>,
  },
  {
    id: "ma2-dif-q9",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        The tangent plane to <Tex>{"z = x^2 + 3xy"}</Tex> at <Tex>{"(1,2)"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"z = 7 + 8(x-1) + 3(y-2)"}</Tex> },
      { id: "B", content: <Tex>{"z = 8(x-1) + 3(y-2)"}</Tex> },
      { id: "C", content: <Tex>{"z = 7 + 3(x-1) + 8(y-2)"}</Tex> },
      { id: "D", content: <Tex>{"z = 7 + 8x + 3y"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"f(1,2) = 1+6 = 7"}</Tex>; <Tex>{"f_x = 2x+3y = 8"}</Tex>;{" "}
        <Tex>{"f_y = 3x = 3"}</Tex>. Plug into (2.4): A. B drops the constant term{" "}
        <Tex>{"f(a,b)"}</Tex> — the plane must pass through the surface point; C swaps the two
        partials; D forgets to center the increments at <Tex>{"(1,2)"}</Tex>.
      </>
    ),
    theory: <>Tangent plane = value + each partial times its centered increment; always verify it reproduces f(a,b).</>,
  },
  {
    id: "ma2-dif-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For <Tex>{"f = x^2 + 2y^2"}</Tex> at <Tex>{"(1,1)"}</Tex>, the directional derivative along
        the unit vector <Tex>{"v = (\\tfrac35, \\tfrac45)"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"22"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac{22}{5}"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{6}{5}"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{14}{5}"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"\\nabla f = (2x, 4y) = (2,4)"}</Tex>, so{" "}
        <Tex>{"D_vf = 2\\cdot\\tfrac35 + 4\\cdot\\tfrac45 = \\tfrac{6}{5}+\\tfrac{16}{5} = \\tfrac{22}{5}"}</Tex>{" "}
        — B. A dots with the unnormalized <Tex>{"(3,4)"}</Tex>; C keeps only the x-term; D uses{" "}
        <Tex>{"\\nabla f = (2,2)"}</Tex>, forgetting the factor 4 from differentiating{" "}
        <Tex>{"2y^2"}</Tex>.
      </>
    ),
    theory: <>D_v f = ∇f · v with v unit; each slip (normalization, a partial) lands on a distractor.</>,
  },
  {
    id: "ma2-dif-q11",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        At a point P, <Tex>{"\\nabla f(P) = (3,4)"}</Tex>. The maximum possible value of the
        directional derivative <Tex>{"D_v f(P)"}</Tex> over all unit vectors v is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"7"}</Tex> },
      { id: "B", content: <Tex>{"25"}</Tex> },
      { id: "C", content: <Tex>{"5"}</Tex> },
      { id: "D", content: <Tex>{"1"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        The maximum is <Tex>{"|\\nabla f| = \\sqrt{9+16} = 5"}</Tex>, attained along{" "}
        <Tex>{"v = (\\tfrac35,\\tfrac45)"}</Tex> — C. A adds the components (that is{" "}
        <Tex>{"D_v f"}</Tex> for the non-unit v = (1,1)); B is <Tex>{"|\\nabla f|^2"}</Tex>; D
        confuses the unit length of v with the value of the derivative.
      </>
    ),
    theory: <>max D_v f = |∇f| (Cauchy–Schwarz with equality when v is parallel to ∇f).</>,
  },
  {
    id: "ma2-dif-q12",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        <Tex>{"z = x^2y"}</Tex> with <Tex>{"x = t^2,\\ y = t^3"}</Tex>. Then <Tex>{"dz/dt"}</Tex> at{" "}
        <Tex>{"t=1"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"4"}</Tex> },
      { id: "B", content: <Tex>{"3"}</Tex> },
      { id: "C", content: <Tex>{"12"}</Tex> },
      { id: "D", content: <Tex>{"7"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"dz/dt = 2xy\\cdot 2t + x^2\\cdot 3t^2 = 4t^6 + 3t^6 = 7t^6"}</Tex>, so 7 at t = 1 — D.
        (Check by substitution: <Tex>{"z=t^7"}</Tex>, <Tex>{"z'=7t^6"}</Tex>.) A keeps only the{" "}
        <Tex>{"f_x x'"}</Tex> branch, B only the <Tex>{"f_y y'"}</Tex> branch, C multiplies the two
        branch values 4·3 instead of adding them.
      </>
    ),
    theory: <>Chain rule along a curve: sum of (partial × inner derivative) over both branches.</>,
  },
  {
    id: "ma2-dif-q13",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        P lies on the level curve <Tex>{"f(x,y)=c"}</Tex> and <Tex>{"\\nabla f(P) \\ne 0"}</Tex>.
        Then <Tex>{"\\nabla f(P)"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <>perpendicular to the tangent of the level curve at P</> },
      { id: "B", content: <>tangent to the level curve at P</> },
      { id: "C", content: <>zero, because f is constant along the curve</> },
      { id: "D", content: <>parallel to the position vector of P</> },
    ],
    correct: "A",
    explanation: (
      <>
        Parametrize the curve as <Tex>{"r(t)"}</Tex>; then <Tex>{"f(r(t))=c"}</Tex> and the chain
        rule gives <Tex>{"\\nabla f\\cdot r'=0"}</Tex> — perpendicularity, A. B is exactly backwards;
        C confuses &ldquo;constant along the curve&rdquo; with &ldquo;constant everywhere&rdquo; (the
        gradient measures change across the curve); D has no basis — the origin plays no special
        role.
      </>
    ),
    theory: <>f constant along a path ⇒ ∇f ⊥ the path's velocity: the geometry behind contour maps.</>,
  },
  {
    id: "ma2-dif-q14",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        f is differentiable at <Tex>{"(a,b)"}</Tex> exactly when the remainder{" "}
        <Tex>{"R(h,k) = f(a+h,b+k) - f(a,b) - f_x h - f_y k"}</Tex> satisfies:
      </>
    ),
    options: [
      { id: "A", content: <><Tex>{"R(h,k) \\to 0"}</Tex> as <Tex>{"(h,k)\\to(0,0)"}</Tex></> },
      { id: "B", content: <><Tex>{"R(h,k)/\\sqrt{h^2+k^2} \\to 0"}</Tex> as <Tex>{"(h,k)\\to(0,0)"}</Tex></> },
      { id: "C", content: <><Tex>{"R(h,k)/(h^2+k^2) \\to 0"}</Tex> as <Tex>{"(h,k)\\to(0,0)"}</Tex></> },
      { id: "D", content: <><Tex>{"R(h,k)"}</Tex> stays bounded near <Tex>{"(0,0)"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        Differentiability means the error is <Tex>{"o(\\rho)"}</Tex> with{" "}
        <Tex>{"\\rho=\\sqrt{h^2+k^2}"}</Tex>: R must vanish <em>faster than the step</em> — B. A
        (error merely tending to 0) is just continuity once partials exist — too weak; C demands a
        second-order rate <Tex>{"o(\\rho^2)"}</Tex> that even nice functions need not satisfy; D is
        weaker still than A.
      </>
    ),
    theory: <>Differentiable = linear model with error o(‖step‖); the division by ρ is the entire content.</>,
  },
  {
    id: "ma2-dif-q15",
    topic: MODULE,
    difficulty: "hard",
    prompt: <>Which statement is FALSE?</>,
    options: [
      { id: "A", content: <>if both partials exist near P and are continuous at P, then f is differentiable at P</> },
      { id: "B", content: <>if f is differentiable at P, then both partials exist at P</> },
      { id: "C", content: <>if f is differentiable at P, then its partials are continuous at P</> },
      { id: "D", content: <>if f is differentiable at P, then f is continuous at P</> },
    ],
    correct: "C",
    explanation: (
      <>
        C is false: differentiable does <em>not</em> imply <Tex>{"C^1"}</Tex>. Counterexample:{" "}
        <Tex>{"(x^2+y^2)\\sin\\frac{1}{x^2+y^2}"}</Tex> (value 0 at the origin) is differentiable at
        O — the remainder is bounded by <Tex>{"\\rho^2/\\rho \\to 0"}</Tex> — yet its partials
        oscillate wildly nearby and are discontinuous at O. A is the C¹ sufficient condition
        (true), B holds because the linear map in (2.3) is built from the partials, D is the standard
        implication.
      </>
    ),
    theory: <>C¹ ⇒ differentiable ⇒ (continuous + partials exist); neither arrow reverses.</>,
  },
  {
    id: "ma2-dif-q16",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        For <Tex>{"g(x,y)=\\dfrac{x^2y}{x^2+y^2}"}</Tex>, <Tex>{"g(0,0)=0"}</Tex>, every directional
        derivative at the origin exists: <Tex>{"D_vg(0,0) = \\cos^2\\theta\\sin\\theta"}</Tex> for{" "}
        <Tex>{"v=(\\cos\\theta,\\sin\\theta)"}</Tex>, and <Tex>{"\\nabla g(0,0) = (0,0)"}</Tex>. What
        follows?
      </>
    ),
    options: [
      { id: "A", content: <>g is differentiable at the origin, since all directional derivatives exist</> },
      { id: "B", content: <>the computation must be wrong: <Tex>{"D_vg"}</Tex> always equals <Tex>{"\\nabla g\\cdot v"}</Tex></> },
      { id: "C", content: <>g is discontinuous at the origin</> },
      { id: "D", content: <>g is not differentiable at the origin, because <Tex>{"D_vg \\ne \\nabla g\\cdot v"}</Tex> for some v</> },
    ],
    correct: "D",
    explanation: (
      <>
        If g were differentiable, (2.6) would force <Tex>{"D_vg = \\nabla g\\cdot v = 0"}</Tex> for
        every v; but at <Tex>{"\\theta=\\tfrac{\\pi}{4}"}</Tex>,{" "}
        <Tex>{"\\cos^2\\theta\\sin\\theta = \\tfrac{\\sqrt2}{4} \\ne 0"}</Tex> — contradiction, so D.
        A is the deepest trap in the module: even <em>all</em> directional derivatives existing is
        not sufficient. B is backwards — the identity <em>presupposes</em> differentiability. C is
        false: in polar form <Tex>{"|g| \\le r \\to 0"}</Tex>, so g is continuous.
      </>
    ),
    theory: <>Differentiability forces D_v f to depend linearly on v; any nonlinearity in θ disproves it.</>,
  },
  {
    id: "ma2-dif-q17",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Using the linearization of <Tex>{"f(x,y)=\\sqrt{x^2+y^2}"}</Tex> at <Tex>{"(3,4)"}</Tex>,
        the estimate of <Tex>{"f(3.1,\\,3.9)"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"4.98"}</Tex> },
      { id: "B", content: <Tex>{"5.02"}</Tex> },
      { id: "C", content: <Tex>{"5.14"}</Tex> },
      { id: "D", content: <Tex>{"4.86"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"f(3,4)=5"}</Tex>, <Tex>{"f_x = \\tfrac{x}{f} = \\tfrac35"}</Tex>,{" "}
        <Tex>{"f_y = \\tfrac45"}</Tex>; increments <Tex>{"\\Delta x = +0.1"}</Tex>,{" "}
        <Tex>{"\\Delta y = -0.1"}</Tex>. Estimate{" "}
        <Tex>{"5 + 0.6(0.1) + 0.8(-0.1) = 5 + 0.06 - 0.08 = 4.98"}</Tex> — A (true value ≈ 4.982). B
        flips the sign of the x-contribution; C takes both increments positive; D takes both
        negative.
      </>
    ),
    theory: <>Linear estimate = f(P) + ∇f(P)·(Δx, Δy); the increments carry signs — read them off carefully.</>,
  },
  {
    id: "ma2-dif-q18",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Let <Tex>{"w = f(u,v)"}</Tex> with <Tex>{"u = x^2 - y"}</Tex>, <Tex>{"v = xy"}</Tex>. At the
        point <Tex>{"(x,y) = (1,2)"}</Tex> one has <Tex>{"f_u = 3"}</Tex>, <Tex>{"f_v = -2"}</Tex>{" "}
        (evaluated at the corresponding <Tex>{"(u,v)"}</Tex>). Then{" "}
        <Tex>{"\\partial w/\\partial x"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"6"}</Tex> },
      { id: "B", content: <Tex>{"2"}</Tex> },
      { id: "C", content: <Tex>{"-4"}</Tex> },
      { id: "D", content: <Tex>{"10"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Two paths from w to x:{" "}
        <Tex>{"w_x = f_u\\,u_x + f_v\\,v_x = 3\\cdot 2x + (-2)\\cdot y = 6 - 4 = 2"}</Tex> — B. A
        keeps only the u-branch (6); C keeps only the v-branch (−4); D makes a sign error, adding
        4 instead of subtracting.
      </>
    ),
    theory: <>Full chain rule: one product per intermediate variable, evaluated at the matching inner point, then summed.</>,
  },
  {
    id: "ma2-dif-q19",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For <Tex>{"f = x^2 + 2y^2"}</Tex> at <Tex>{"(1,1)"}</Tex>, the unit vector of steepest{" "}
        <strong>descent</strong> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\left(\\tfrac{1}{\\sqrt5}, \\tfrac{2}{\\sqrt5}\\right)"}</Tex> },
      { id: "B", content: <Tex>{"(-2, -4)"}</Tex> },
      { id: "C", content: <Tex>{"\\left(-\\tfrac{1}{\\sqrt5}, -\\tfrac{2}{\\sqrt5}\\right)"}</Tex> },
      { id: "D", content: <Tex>{"\\left(-\\tfrac{2}{\\sqrt5}, -\\tfrac{1}{\\sqrt5}\\right)"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"\\nabla f = (2,4)"}</Tex>; steepest descent is{" "}
        <Tex>{"-\\nabla f/|\\nabla f| = -(2,4)/(2\\sqrt5)"}</Tex> = C. A is steepest{" "}
        <em>ascent</em>; B points the right way but is not a unit vector (length{" "}
        <Tex>{"2\\sqrt5"}</Tex>), so it is not &ldquo;the unit vector&rdquo; asked for; D swaps the
        components.
      </>
    ),
    theory: <>Steepest descent = −∇f normalized; questions asking for a direction expect a unit vector.</>,
  },
  {
    id: "ma2-dif-q20",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        For <Tex>{"f(x,y)=xy\\,\\dfrac{x^2-y^2}{x^2+y^2}"}</Tex> (with <Tex>{"f(0,0)=0"}</Tex>) one
        finds <Tex>{"(f_x)_y(0,0) = -1"}</Tex> but <Tex>{"(f_y)_x(0,0) = +1"}</Tex>. What does
        Schwarz's theorem say about this?
      </>
    ),
    options: [
      { id: "A", content: <>impossible — mixed partials are always equal, so the computation is wrong</> },
      { id: "B", content: <>f cannot have second-order partials at the origin</> },
      { id: "C", content: <>Schwarz's theorem is violated, so the theorem is false</> },
      { id: "D", content: <>no contradiction: the mixed partials are not continuous at the origin, so the theorem's hypothesis fails</> },
    ],
    correct: "D",
    explanation: (
      <>
        D. Schwarz guarantees equality only when the mixed partials are continuous at the point; here
        they are not, so unequal values are perfectly consistent. A restates the false
        &ldquo;always&rdquo; version; B is wrong — both mixed partials <em>do</em> exist at O (they
        equal −1 and +1); C misreads logic: a theorem cannot be violated when its hypotheses do not
        hold.
      </>
    ),
    theory: <>When a theorem's conclusion fails, check its hypotheses — that IS the exam answer.</>,
  },
];

/* ================================================================== *
 *  EXAM
 * ================================================================== */

export const exam: ExamProblem[] = [
  {
    id: "ma2-dif-e1",
    title: "Full differentiability study at the origin",
    meta: "Differential calculus · ~12 pts · classic written-exam",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"f(x,y) = \\dfrac{x^3}{x^2+y^2}"}</Tex> for <Tex>{"(x,y)\\ne(0,0)"}</Tex> and{" "}
        <Tex>{"f(0,0)=0"}</Tex>. Study, at the origin: (a) continuity; (b) existence and value of the
        partial derivatives; (c) differentiability.
      </>
    ),
    given: (
      <>
        <Tex>{"x = \\rho\\cos\\theta,\\ y = \\rho\\sin\\theta"}</Tex>; differentiability means the
        remainder of (2.3) divided by <Tex>{"\\rho"}</Tex> tends to 0.
      </>
    ),
    steps: [
      {
        title: "Continuity via polar coordinates",
        content: (
          <>
            <Tex>{"f = \\dfrac{\\rho^3\\cos^3\\theta}{\\rho^2} = \\rho\\cos^3\\theta"}</Tex>, so{" "}
            <Tex>{"|f| \\le \\rho \\to 0 = f(0,0)"}</Tex> uniformly in <Tex>{"\\theta"}</Tex>. f is
            continuous at the origin. (If this had failed, we could stop: not continuous ⇒ not
            differentiable.)
          </>
        ),
      },
      {
        title: "Partial derivatives by the limit definition",
        content: (
          <>
            <Tex>{"f_x(0,0) = \\lim_{h\\to0}\\dfrac{f(h,0)-0}{h} = \\lim_{h\\to0}\\dfrac{h^3/h^2}{h} = 1"}</Tex>.{" "}
            <Tex>{"f_y(0,0) = \\lim_{k\\to0}\\dfrac{f(0,k)-0}{k} = \\lim_{k\\to0}\\dfrac{0}{k} = 0"}</Tex>.
            Both exist: <Tex>{"\\nabla f(0,0) = (1,0)"}</Tex>.
          </>
        ),
      },
      {
        title: "Set up the differentiability quotient",
        content: (
          <>
            <Tex>{"\\dfrac{f(h,k) - f(0,0) - 1\\cdot h - 0\\cdot k}{\\sqrt{h^2+k^2}} = \\dfrac{\\frac{h^3}{h^2+k^2} - h}{\\sqrt{h^2+k^2}} = \\dfrac{-hk^2}{(h^2+k^2)^{3/2}}"}</Tex>
            , using <Tex>{"h^3 - h(h^2+k^2) = -hk^2"}</Tex>.
          </>
        ),
      },
      {
        title: "Test the quotient as a 2-D limit",
        content: (
          <>
            In polar form: <Tex>{"\\dfrac{-\\rho^3\\cos\\theta\\sin^2\\theta}{\\rho^3} = -\\cos\\theta\\sin^2\\theta"}</Tex>{" "}
            — no <Tex>{"\\rho"}</Tex> left, pure angle dependence. Along <Tex>{"\\theta=0"}</Tex> it
            is 0, along <Tex>{"\\theta=\\tfrac{\\pi}{4}"}</Tex> it is{" "}
            <Tex>{"-\\tfrac{\\sqrt2}{4}\\ne0"}</Tex>: the limit is not 0 (it does not even exist).
          </>
        ),
      },
      {
        title: "Conclude",
        content: (
          <>
            The remainder is not <Tex>{"o(\\rho)"}</Tex>, so f is <strong>not differentiable</strong>{" "}
            at the origin — despite being continuous there with both partials existing.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        f is continuous at <Tex>{"(0,0)"}</Tex>; <Tex>{"f_x(0,0)=1"}</Tex>,{" "}
        <Tex>{"f_y(0,0)=0"}</Tex>; f is <strong>not differentiable</strong> at the origin (the
        remainder quotient equals <Tex>{"-\\cos\\theta\\sin^2\\theta"}</Tex>, which depends on the
        direction).
      </>
    ),
    tips: (
      <>
        Marks are lost by: using formula-differentiation at the glue point instead of the limit
        definition; claiming &ldquo;partials exist ⇒ differentiable&rdquo;; and forgetting to divide
        the remainder by <Tex>{"\\rho"}</Tex> (without the division, the limit is 0 and you would
        wrongly conclude differentiability). A surviving θ-dependence after the ρ's cancel is the
        standard signature of non-differentiability.
      </>
    ),
  },
  {
    id: "ma2-dif-e2",
    title: "Tangent plane and linear approximation",
    meta: "Differential calculus · ~10 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"f(x,y) = \\sqrt{x^2 + y^3}"}</Tex>. (a) Show f is differentiable at{" "}
        <Tex>{"(1,2)"}</Tex> and find the tangent plane there. (b) Use it to estimate{" "}
        <Tex>{"\\sqrt{(1.03)^2 + (1.98)^3}"}</Tex>.
      </>
    ),
    given: <><Tex>{"f(1,2) = \\sqrt{1+8} = 3"}</Tex></>,
    steps: [
      {
        title: "Differentiability by the C¹ criterion",
        content: (
          <>
            Near <Tex>{"(1,2)"}</Tex> the radicand <Tex>{"x^2+y^3 \\approx 9 > 0"}</Tex>, so{" "}
            <Tex>{"f_x = \\dfrac{x}{\\sqrt{x^2+y^3}}"}</Tex> and{" "}
            <Tex>{"f_y = \\dfrac{3y^2}{2\\sqrt{x^2+y^3}}"}</Tex> exist and are continuous there:{" "}
            <Tex>{"f\\in C^1"}</Tex> ⇒ differentiable, and the tangent plane is legitimate.
          </>
        ),
      },
      {
        title: "Evaluate the gradient",
        content: (
          <>
            <Tex>{"f_x(1,2) = \\tfrac{1}{3}"}</Tex>;{" "}
            <Tex>{"f_y(1,2) = \\dfrac{3\\cdot4}{2\\cdot3} = 2"}</Tex>.
          </>
        ),
      },
      {
        title: "Write the tangent plane",
        content: (
          <>
            <Tex>{"z = 3 + \\tfrac13(x-1) + 2(y-2)"}</Tex>. Sanity check: at <Tex>{"(1,2)"}</Tex> it
            returns 3 = f(1,2). ✓
          </>
        ),
      },
      {
        title: "Linear estimate",
        content: (
          <>
            Increments from the base point: <Tex>{"\\Delta x = 0.03"}</Tex>,{" "}
            <Tex>{"\\Delta y = -0.02"}</Tex>. Then{" "}
            <Tex>{"f \\approx 3 + \\tfrac13(0.03) + 2(-0.02) = 3 + 0.01 - 0.04 = 2.97"}</Tex>.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        Tangent plane: <Tex>{"z = 3 + \\tfrac13(x-1) + 2(y-2)"}</Tex>; the estimate is{" "}
        <Tex>{"\\approx 2.97"}</Tex> (true value 2.9704 — the linearization is accurate to{" "}
        <Tex>{"4\\times10^{-4}"}</Tex>).
      </>
    ),
    tips: (
      <>
        Three examiner traps: justify differentiability <em>before</em> writing the plane (one C¹
        sentence earns the point); the <Tex>{"\\tfrac12"}</Tex> from the square-root chain rule —
        forgetting it gives <Tex>{"f_y = 4"}</Tex> and a wrong plane; and the sign of{" "}
        <Tex>{"\\Delta y = 1.98 - 2 = -0.02"}</Tex>. Plugging (1.03, 1.98) into f directly earns
        nothing — the exercise tests the linear model.
      </>
    ),
  },
  {
    id: "ma2-dif-e3",
    title: "Directional derivative extremes on a temperature field",
    meta: "Differential calculus · ~10 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        The temperature of a plate is <Tex>{"T(x,y) = 20 - x^2 - 2y^2"}</Tex>. At the point{" "}
        <Tex>{"P=(2,1)"}</Tex>: (a) compute <Tex>{"\\nabla T(P)"}</Tex>; (b) find the rate of change
        of T moving from P toward the origin; (c) find the direction of maximal increase of T and
        its value; (d) find the directions in which T does not change instantaneously.
      </>
    ),
    given: <>T is a polynomial, hence <Tex>{"C^1"}</Tex> everywhere — all formulas of the module apply.</>,
    steps: [
      {
        title: "(a) Gradient at P",
        content: (
          <>
            <Tex>{"\\nabla T = (-2x, -4y)"}</Tex>, so <Tex>{"\\nabla T(2,1) = (-4,-4)"}</Tex>, with{" "}
            <Tex>{"|\\nabla T| = 4\\sqrt2"}</Tex>.
          </>
        ),
      },
      {
        title: "(b) Normalize the direction toward the origin, then dot",
        content: (
          <>
            Direction <Tex>{"O - P = (-2,-1)"}</Tex>, length <Tex>{"\\sqrt5"}</Tex>, unit{" "}
            <Tex>{"u = \\left(-\\tfrac{2}{\\sqrt5}, -\\tfrac{1}{\\sqrt5}\\right)"}</Tex>. Then{" "}
            <Tex>{"D_uT = (-4)\\left(-\\tfrac{2}{\\sqrt5}\\right) + (-4)\\left(-\\tfrac{1}{\\sqrt5}\\right) = \\tfrac{12}{\\sqrt5} = \\tfrac{12\\sqrt5}{5} \\approx 5.37"}</Tex>{" "}
            — the plate warms up in that direction.
          </>
        ),
      },
      {
        title: "(c) Maximal increase",
        content: (
          <>
            Along <Tex>{"\\nabla T/|\\nabla T| = \\left(-\\tfrac{1}{\\sqrt2}, -\\tfrac{1}{\\sqrt2}\\right)"}</Tex>,
            with maximal rate <Tex>{"|\\nabla T| = 4\\sqrt2 \\approx 5.66"}</Tex>. Consistency check:
            the answer of (b), 5.37, is indeed below this maximum. ✓
          </>
        ),
      },
      {
        title: "(d) Zero-change directions",
        content: (
          <>
            <Tex>{"D_vT = 0 \\iff v \\perp \\nabla T"}</Tex>: the unit vectors{" "}
            <Tex>{"\\pm\\left(\\tfrac{1}{\\sqrt2}, -\\tfrac{1}{\\sqrt2}\\right)"}</Tex> (check:{" "}
            <Tex>{"(-4)\\tfrac{1}{\\sqrt2} + (-4)\\left(-\\tfrac{1}{\\sqrt2}\\right) = 0"}</Tex>).
            These are tangent to the isotherm (level curve) through P.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        (a) <Tex>{"\\nabla T(P) = (-4,-4)"}</Tex>; (b){" "}
        <Tex>{"\\tfrac{12\\sqrt5}{5} \\approx 5.37"}</Tex>; (c) direction{" "}
        <Tex>{"\\left(-\\tfrac{1}{\\sqrt2},-\\tfrac{1}{\\sqrt2}\\right)"}</Tex>, maximal rate{" "}
        <Tex>{"4\\sqrt2 \\approx 5.66"}</Tex>; (d) <Tex>{"\\pm\\left(\\tfrac{1}{\\sqrt2},-\\tfrac{1}{\\sqrt2}\\right)"}</Tex>.
      </>
    ),
    tips: (
      <>
        The three graded gestures: <strong>normalize</strong> the direction vector before the dot
        product (using <Tex>{"(-2,-1)"}</Tex> raw gives 12, not <Tex>{"12/\\sqrt5"}</Tex>); the
        maximal rate is <Tex>{"|\\nabla T|"}</Tex>, not <Tex>{"|\\nabla T|^2 = 32"}</Tex>; and
        zero-change directions are the <em>two</em> opposite tangents to the level curve — give both
        signs. Any directional derivative larger than <Tex>{"|\\nabla T|"}</Tex> means an arithmetic
        error.
      </>
    ),
  },
];
