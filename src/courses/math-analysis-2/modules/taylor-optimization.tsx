import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { SaddleExplorerSim } from "../sims/SaddleExplorerSim";

export const MODULE = "Taylor & optimization";

/* ========== Hessian-test summary table for the classification lesson ========== */
function ClassifyTable() {
  const rows: { cells: string[]; color: string }[] = [
    { cells: ["det H > 0", "f_xx > 0", "Local minimum", "bowl — H positive definite"], color: "var(--good)" },
    { cells: ["det H > 0", "f_xx < 0", "Local maximum", "dome — H negative definite"], color: "var(--bad)" },
    { cells: ["det H < 0", "(irrelevant)", "Saddle point", "eigenvalues of opposite sign"], color: "var(--warn)" },
    { cells: ["det H = 0", "(irrelevant)", "No conclusion", "degenerate — study f directly"], color: "var(--color-muted)" },
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">det H at P₀</th>
            <th className="border-b border-[var(--color-line)] p-2">f_xx at P₀</th>
            <th className="border-b border-[var(--color-line)] p-2">Verdict</th>
            <th className="border-b border-[var(--color-line)] p-2">Why</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cells[2]}>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs text-[var(--color-ink)]">{r.cells[0]}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{r.cells[1]}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs font-semibold" style={{ color: r.color }}>
                {r.cells[2]}
              </td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r.cells[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ========== Tangency picture for the Lagrange lesson ==========
 * f(x,y) = x + y on the circle x² + y² = 2. The level lines x + y = c
 * slide across the plane; the extreme ones (c = ±2) are exactly TANGENT
 * to the constraint circle, at (1,1) and (−1,−1). At those points
 * ∇f = (1,1) and ∇g = (2x,2y) = (2,2) are parallel. */
function LagrangeFigure() {
  const FW = 340;
  const R2 = 2.2; // math window [-R2, R2]²
  const px = (x: number) => ((x + R2) / (2 * R2)) * FW;
  const py = (y: number) => ((R2 - y) / (2 * R2)) * FW;
  const r = (Math.SQRT2 / (2 * R2)) * FW; // circle radius √2 in pixels
  const levels = [-3, -2, -1, 0, 1, 2, 3];
  return (
    <svg viewBox={`0 0 ${FW} ${FW}`} className="mx-auto w-full max-w-sm rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
      {/* level lines x + y = c (the tangent ones, c = ±2, highlighted) */}
      {levels.map((cv) => (
        <line
          key={cv}
          x1={px(cv + R2)}
          y1={py(-R2)}
          x2={px(cv - R2)}
          y2={py(R2)}
          stroke={Math.abs(cv) === 2 ? "var(--warn)" : "var(--color-line)"}
          strokeWidth={Math.abs(cv) === 2 ? 1.8 : 1}
        />
      ))}
      {/* axes */}
      <line x1={px(-R2)} y1={py(0)} x2={px(R2)} y2={py(0)} stroke="var(--color-line)" strokeWidth={1} />
      <line x1={px(0)} y1={py(-R2)} x2={px(0)} y2={py(R2)} stroke="var(--color-line)" strokeWidth={1} />
      {/* constraint circle g = 0 */}
      <circle cx={px(0)} cy={py(0)} r={r} fill="none" stroke="var(--accent)" strokeWidth={2.2} />
      {/* parallel gradients at the max */}
      <line x1={px(1)} y1={py(1)} x2={px(1.6)} y2={py(1.6)} stroke="var(--good)" strokeWidth={2} />
      <polygon
        points={`${px(1.7)},${py(1.7)} ${px(1.52)},${py(1.62)} ${px(1.62)},${py(1.52)}`}
        fill="var(--good)"
      />
      {/* tangency points */}
      <circle cx={px(1)} cy={py(1)} r={4.5} fill="var(--good)" />
      <circle cx={px(-1)} cy={py(-1)} r={4.5} fill="var(--bad)" />
      {/* labels */}
      <text x={px(1) + 8} y={py(1) + 13} fontSize={11} fontWeight={700} fill="var(--color-ink)">
        (1, 1) max
      </text>
      <text x={px(-1) + 8} y={py(-1) + 14} fontSize={11} fontWeight={700} fill="var(--color-ink)">
        (−1, −1) min
      </text>
      <text x={px(1.06)} y={py(1.78)} fontSize={10} fill="var(--good)">
        ∇f ∥ ∇g
      </text>
      <text x={px(0.12)} y={py(-1.62)} fontSize={10} fill="var(--accent)">
        x² + y² = 2
      </text>
      <text x={px(-2.12)} y={py(2.0)} fontSize={10} fill="var(--color-muted)">
        level lines x + y = c
      </text>
    </svg>
  );
}

export const lessons: Lesson[] = [
  /* ================================================================ *
   * LESSON 1 — Second-order Taylor & quadratic forms
   * ================================================================ */
  {
    id: "taylor-quadratic-forms",
    title: "Second-order Taylor & quadratic forms",
    lecture: MODULE,
    summary:
      "Near any point a C² function is a plane plus a quadratic bowl/dome/saddle — and a 2×2 matrix decides which one.",
    minutes: 24,
    objectives: [
      "Write the second-order Taylor expansion of f(x, y) around a point",
      "Build the Hessian matrix and justify its symmetry (Schwarz)",
      "Classify a quadratic form as definite, semidefinite or indefinite via eigenvalues",
      "Apply the fast 2×2 test: det H together with f_xx",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            In one variable, <Tex>{"f(x_0+h) \\approx f(x_0) + f'(x_0)h + \\tfrac12 f''(x_0)h^2"}</Tex>{" "}
            — and the <em>sign</em> of <Tex>{"f''"}</Tex> tells you whether the graph bends up or down.
            In two variables the same idea survives, but the second derivative becomes a{" "}
            <strong>matrix</strong>, and “the sign of a matrix” is a genuinely new concept: a surface
            can bend up in one direction and down in another at the same point. Making that precise is
            the whole engine behind classifying maxima, minima and saddles.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "f(x_0+h,\\,y_0+k) = f + f_x\\,h + f_y\\,k + \\tfrac12\\big(f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2\\big) + o(h^2+k^2)",
        tag: "3.1",
        caption: (
          <>
            The second-order Taylor formula; every derivative is evaluated at{" "}
            <Tex>{"(x_0, y_0)"}</Tex>. The remainder is <Tex>{"o(h^2+k^2)"}</Tex>: negligible against
            the quadratic terms as <Tex>{"(h,k)\\to(0,0)"}</Tex> (Peano form).
          </>
        ),
      },
      {
        kind: "definition",
        term: "Hessian matrix",
        content: (
          <>
            The Hessian of <Tex>{"f"}</Tex> at a point collects all second partials:{" "}
            <Tex>{"H_f = \\begin{pmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{pmatrix}"}</Tex>.
            For <Tex>{"C^2"}</Tex> functions, <strong>Schwarz's theorem</strong> gives{" "}
            <Tex>{"f_{xy} = f_{yx}"}</Tex>, so <Tex>{"H_f"}</Tex> is <strong>symmetric</strong> — the
            key structural fact everything below relies on.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            In vector form, with <Tex>{"P_0=(x_0,y_0)"}</Tex> and displacement{" "}
            <Tex>{"\\mathbf{v}=(h,k)"}</Tex>:{" "}
            <Tex>{"f(P_0+\\mathbf{v}) = f(P_0) + \\nabla f(P_0)\\cdot\\mathbf{v} + \\tfrac12\\,\\mathbf{v}^{\\mathsf T} H(P_0)\\,\\mathbf{v} + o(\\lVert\\mathbf{v}\\rVert^2)"}</Tex>.
            Constant + plane + quadratic form. When the gradient vanishes (next lesson), the quadratic
            form is the <em>only</em> term left to shape the surface — so we must learn to read its
            sign first.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — Taylor polynomial of e^x·cos y at the origin",
        content: (
          <>
            <p>
              Take <Tex>{"f(x,y)=e^x\\cos y"}</Tex> at <Tex>{"(0,0)"}</Tex>. Compute:{" "}
              <Tex>{"f(0,0)=1"}</Tex>, <Tex>{"f_x = e^x\\cos y = 1"}</Tex>,{" "}
              <Tex>{"f_y = -e^x\\sin y = 0"}</Tex>, <Tex>{"f_{xx} = 1"}</Tex>,{" "}
              <Tex>{"f_{xy} = 0"}</Tex>, <Tex>{"f_{yy} = -1"}</Tex>.
            </p>
            <p>
              So <Tex>{"T_2(x,y) = 1 + x + \\tfrac12 x^2 - \\tfrac12 y^2"}</Tex>.
            </p>
            <p>
              Sanity check by multiplying the 1-D series:{" "}
              <Tex>{"\\big(1+x+\\tfrac{x^2}{2}\\big)\\big(1-\\tfrac{y^2}{2}\\big) = 1 + x + \\tfrac{x^2}{2} - \\tfrac{y^2}{2} + \\dots"}</Tex>{" "}
              — same result, and the cross term <Tex>{"-\\tfrac{xy^2}{2}"}</Tex> is third order, so it
              rightly does not appear in <Tex>{"T_2"}</Tex>.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Quadratic forms and their sign" },
      {
        kind: "definition",
        term: "Quadratic form & its classification",
        content: (
          <>
            A quadratic form is{" "}
            <Tex>{"q(h,k) = \\alpha h^2 + 2\\beta hk + \\gamma k^2 = \\mathbf{v}^{\\mathsf T} A \\mathbf{v}"}</Tex>{" "}
            with the symmetric matrix{" "}
            <Tex>{"A = \\begin{pmatrix} \\alpha & \\beta \\\\ \\beta & \\gamma \\end{pmatrix}"}</Tex>.
            It is <strong>positive definite</strong> if <Tex>{"q(\\mathbf{v})>0"}</Tex> for every{" "}
            <Tex>{"\\mathbf{v}\\ne\\mathbf{0}"}</Tex>, <strong>negative definite</strong> if always
            negative, <strong>indefinite</strong> if it takes both signs, and{" "}
            <strong>semidefinite</strong> (degenerate) if one sign is weak — it vanishes on some
            nonzero vector.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Why eigenvalues? A symmetric matrix can always be diagonalized in an orthonormal basis
            (spectral theorem). In the rotated coordinates <Tex>{"(u,w)"}</Tex> aligned with the
            eigenvectors, the mixed term disappears and the form becomes transparent:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "q(\\mathbf{v}) = \\lambda_1 u^2 + \\lambda_2 w^2",
        tag: "3.2",
        caption: (
          <>
            Both <Tex>{"\\lambda_i > 0"}</Tex>: positive definite (bowl). Both negative: negative
            definite (dome). Opposite signs: indefinite (saddle). One eigenvalue zero: degenerate — a
            valley or ridge, flat along the corresponding eigenvector.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The 2×2 shortcut (leading principal minors)",
        content: (
          <>
            You almost never need the eigenvalues themselves, because{" "}
            <Tex>{"\\det A = \\lambda_1\\lambda_2"}</Tex> and{" "}
            <Tex>{"\\operatorname{tr} A = \\lambda_1+\\lambda_2"}</Tex>. Hence:{" "}
            <Tex>{"\\det A > 0"}</Tex> and <Tex>{"\\alpha > 0"}</Tex> ⇒ positive definite;{" "}
            <Tex>{"\\det A > 0"}</Tex> and <Tex>{"\\alpha < 0"}</Tex> ⇒ negative definite;{" "}
            <Tex>{"\\det A < 0"}</Tex> ⇒ indefinite; <Tex>{"\\det A = 0"}</Tex> ⇒ degenerate. This is
            Sylvester's criterion specialized to 2×2, and it is <em>the</em> exam tool.
          </>
        ),
      },
      {
        kind: "sim",
        title: "Saddle explorer — z = a·x² + 2b·xy + c·y²",
        render: () => <SaddleExplorerSim />,
        caption: (
          <>
            This surface has constant Hessian{" "}
            <Tex>{"H = \\begin{pmatrix} 2a & 2b \\\\ 2b & 2c \\end{pmatrix}"}</Tex>, so{" "}
            <Tex>{"\\det H = 4(ac-b^2)"}</Tex>. Drag <Tex>{"b"}</Tex> slowly from 0: watch the ellipses
            shear, degenerate into parallel lines exactly when <Tex>{"ac = b^2"}</Tex>, then split
            into hyperbolas — the moment <Tex>{"\\det H"}</Tex> changes sign is the moment the minimum
            dies.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-opt-cp1",
          difficulty: "medium",
          prompt: (
            <>
              Classify the quadratic form <Tex>{"q(x,y) = x^2 + 6xy + y^2"}</Tex>.
            </>
          ),
          options: [
            { id: "A", content: <>Positive definite</> },
            { id: "B", content: <>Negative definite</> },
            { id: "C", content: <>Indefinite</> },
            { id: "D", content: <>Positive semidefinite</> },
          ],
          correct: "C",
          explanation: (
            <>
              The matrix is <Tex>{"\\begin{pmatrix} 1 & 3 \\\\ 3 & 1 \\end{pmatrix}"}</Tex> (halve the
              mixed coefficient!), so <Tex>{"\\det A = 1 - 9 = -8 < 0"}</Tex>: indefinite — answer{" "}
              <strong>C</strong>. Indeed the eigenvalues are <Tex>{"4"}</Tex> and <Tex>{"-2"}</Tex>:{" "}
              <Tex>{"q(1,1) = 8 > 0"}</Tex> but <Tex>{"q(1,-1) = -4 < 0"}</Tex>. A is tempting because
              both squares have coefficient +1, but the huge cross term wins along{" "}
              <Tex>{"y=-x"}</Tex>; B fails since <Tex>{"q(1,1)>0"}</Tex>; D requires{" "}
              <Tex>{"\\det A = 0"}</Tex>.
            </>
          ),
          theory: <>Build A with β = (mixed coefficient)/2, then read det A first: negative ⇒ indefinite, no further checks.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Positive diagonal does NOT mean positive definite",
        content: (
          <>
            Students see <Tex>{"\\alpha > 0"}</Tex> and <Tex>{"\\gamma > 0"}</Tex> and declare a
            minimum. False: <Tex>{"q = x^2 + 4xy + y^2"}</Tex> has matrix{" "}
            <Tex>{"\\begin{pmatrix} 1 & 2 \\\\ 2 & 1 \\end{pmatrix}"}</Tex> with{" "}
            <Tex>{"\\det A = 1-4 = -3 < 0"}</Tex>: indefinite. Check:{" "}
            <Tex>{"q(1,0) = 1 > 0"}</Tex> yet <Tex>{"q(1,-1) = 1 - 4 + 1 = -2 < 0"}</Tex>. The mixed
            term can overpower both squares — that is exactly why the determinant must be consulted.
          </>
        ),
      },
      {
        kind: "steps",
        title: "Classifying any 2×2 quadratic form",
        steps: [
          {
            label: "Build the matrix",
            content: (
              <>
                From <Tex>{"q = \\alpha h^2 + 2\\beta hk + \\gamma k^2"}</Tex> write{" "}
                <Tex>{"A=\\begin{pmatrix} \\alpha & \\beta \\\\ \\beta & \\gamma \\end{pmatrix}"}</Tex>.
                The off-diagonal entry is <strong>half</strong> the coefficient of <Tex>{"hk"}</Tex>.
              </>
            ),
          },
          {
            label: "Compute det A",
            content: (
              <>
                <Tex>{"\\det A < 0"}</Tex>: indefinite, stop. <Tex>{"\\det A = 0"}</Tex>: degenerate —
                factor the form (it is a perfect square times a sign) and say which semidefinite type.
              </>
            ),
          },
          {
            label: "If det A is positive, read α",
            content: (
              <>
                <Tex>{"\\alpha > 0"}</Tex> ⇒ positive definite; <Tex>{"\\alpha < 0"}</Tex> ⇒ negative
                definite. (α cannot be 0 here: that would force{" "}
                <Tex>{"\\det A = -\\beta^2 \\le 0"}</Tex>.)
              </>
            ),
          },
          {
            label: "Cross-check with eigenvalues if asked",
            content: (
              <>
                <Tex>{"\\lambda_{1,2} = \\tfrac12\\big(\\operatorname{tr}A \\pm \\sqrt{(\\operatorname{tr}A)^2 - 4\\det A}\\,\\big)"}</Tex>{" "}
                — their signs must agree with your verdict.
              </>
            ),
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Trace as a tiebreaker",
        content: (
          <>
            When <Tex>{"\\det A > 0"}</Tex> the eigenvalues share a sign, and the trace tells you
            which one (it equals their sum). When <Tex>{"\\det A = 0"}</Tex>, the eigenvalues are{" "}
            <Tex>{"0"}</Tex> and <Tex>{"\\operatorname{tr}A"}</Tex> — so the trace's sign decides
            between positive and negative <em>semi</em>definite instantly.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            You can now read the sign of any 2×2 quadratic form in seconds. Next lesson we point this
            weapon at the points where <Tex>{"\\nabla f = \\mathbf{0}"}</Tex>: there formula (3.1)
            loses its linear part, the quadratic form takes command, and “classify the form” becomes
            “classify the critical point”.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 2 — Critical points & the Hessian test
   * ================================================================ */
  {
    id: "critical-points-hessian",
    title: "Critical points & the Hessian test",
    lecture: MODULE,
    summary:
      "Find where the tangent plane is horizontal, then let det H and f_xx sort the candidates into minima, maxima and saddles.",
    minutes: 22,
    objectives: [
      "Find all critical points by solving ∇f = 0",
      "Classify each one with the Hessian test (det H, f_xx)",
      "Handle the degenerate case det H = 0 by studying the sign of f directly",
      "Distinguish local statements from global ones",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Fermat's theorem survives the jump to two variables: if a differentiable <Tex>{"f"}</Tex>{" "}
            has a local extremum at an interior point, <em>both</em> partial derivatives must vanish
            there — the tangent plane is horizontal. Such points are the only interior suspects, but
            (new in 2D) a horizontal tangent plane can also sit on a <strong>saddle</strong>: uphill
            one way, downhill another. Finding suspects is algebra; sorting them is the Hessian's job.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Critical (stationary) point",
        content: (
          <>
            <Tex>{"P_0"}</Tex> is a critical point of a differentiable <Tex>{"f"}</Tex> if{" "}
            <Tex>{"\\nabla f(P_0) = (0,0)"}</Tex>, i.e. <Tex>{"f_x(P_0)=0"}</Tex> <em>and</em>{" "}
            <Tex>{"f_y(P_0)=0"}</Tex> simultaneously. Local maxima and minima of <Tex>{"f"}</Tex> at
            interior points can occur <strong>only</strong> at critical points.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "f(P_0+\\mathbf{v}) - f(P_0) = \\tfrac12\\,\\mathbf{v}^{\\mathsf T} H(P_0)\\,\\mathbf{v} + o(\\lVert\\mathbf{v}\\rVert^2)",
        tag: "3.3",
        caption: (
          <>
            Taylor (3.1) at a critical point: the linear part is gone, so near <Tex>{"P_0"}</Tex> the{" "}
            <strong>sign of the increment</strong> is the sign of the quadratic form — definite ⇒
            extremum, indefinite ⇒ saddle.
          </>
        ),
      },
      {
        kind: "steps",
        title: "The Hessian test, start to finish",
        steps: [
          {
            label: "Solve the system",
            content: (
              <>
                Set <Tex>{"f_x = 0"}</Tex> and <Tex>{"f_y = 0"}</Tex> and solve <em>exactly</em> —
                substitution usually works. Never divide by a quantity that could be zero: split into
                cases instead, or you will lose critical points.
              </>
            ),
          },
          {
            label: "Write H once, with symbols",
            content: (
              <>
                Compute <Tex>{"f_{xx}, f_{xy}, f_{yy}"}</Tex> as functions of <Tex>{"(x,y)"}</Tex>,
                then substitute each critical point into the same symbolic matrix.
              </>
            ),
          },
          {
            label: "Evaluate det H at each point",
            content: (
              <>
                <Tex>{"\\det H = f_{xx}f_{yy} - f_{xy}^2"}</Tex>. Negative ⇒ saddle. Zero ⇒ the test
                is silent (see below). Positive ⇒ extremum, go to the last step.
              </>
            ),
          },
          {
            label: "Read f_xx",
            content: (
              <>
                With <Tex>{"\\det H > 0"}</Tex>: <Tex>{"f_{xx} > 0"}</Tex> ⇒ local minimum,{" "}
                <Tex>{"f_{xx} < 0"}</Tex> ⇒ local maximum. Finish by computing the value{" "}
                <Tex>{"f(P_0)"}</Tex> — examiners want the value, not just the location.
              </>
            ),
          },
        ],
      },
      {
        kind: "figure",
        render: () => <ClassifyTable />,
        caption:
          "The whole test in one table. Note the two ways it can end without an extremum verdict: det H < 0 is a definitive saddle, det H = 0 is silence.",
      },
      {
        kind: "example",
        title: "Worked example — f(x,y) = x³ − 3x + y²",
        content: (
          <>
            <p>
              <strong>Critical points.</strong>{" "}
              <Tex>{"\\nabla f = (3x^2 - 3,\\; 2y) = (0,0)"}</Tex> gives <Tex>{"x = \\pm 1"}</Tex>,{" "}
              <Tex>{"y = 0"}</Tex>: two points, <Tex>{"(1,0)"}</Tex> and <Tex>{"(-1,0)"}</Tex>.
            </p>
            <p>
              <strong>Hessian.</strong>{" "}
              <Tex>{"H = \\begin{pmatrix} 6x & 0 \\\\ 0 & 2 \\end{pmatrix}"}</Tex>.
            </p>
            <p>
              At <Tex>{"(1,0)"}</Tex>: <Tex>{"\\det H = 12 > 0"}</Tex>, <Tex>{"f_{xx} = 6 > 0"}</Tex>{" "}
              ⇒ <strong>local minimum</strong>, value <Tex>{"f(1,0) = 1 - 3 = -2"}</Tex>.
            </p>
            <p>
              At <Tex>{"(-1,0)"}</Tex>: <Tex>{"\\det H = -12 < 0"}</Tex> ⇒ <strong>saddle</strong>.
            </p>
            <p>
              Is the minimum global? No: <Tex>{"f(x,0) = x^3 - 3x \\to -\\infty"}</Tex> as{" "}
              <Tex>{"x \\to -\\infty"}</Tex>. The Hessian test only ever speaks about a small
              neighborhood.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-opt-cp2",
          difficulty: "medium",
          prompt: (
            <>
              At a critical point you compute{" "}
              <Tex>{"H = \\begin{pmatrix} 4 & 2 \\\\ 2 & 1 \\end{pmatrix}"}</Tex>. What does the
              Hessian test conclude?
            </>
          ),
          options: [
            { id: "A", content: <>Local minimum, since <Tex>{"f_{xx} = 4 > 0"}</Tex></> },
            { id: "B", content: <>Saddle point</> },
            { id: "C", content: <>Local maximum</> },
            { id: "D", content: <>Nothing — <Tex>{"\\det H = 0"}</Tex>, the test is inconclusive</> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"\\det H = 4\\cdot 1 - 2^2 = 0"}</Tex>: the form is degenerate (here{" "}
              <Tex>{"q = (2h+k)^2"}</Tex>, zero along the whole line <Tex>{"k=-2h"}</Tex>), so
              second-order information cannot decide — answer <strong>D</strong>. A is the classic
              trap: <Tex>{"f_{xx}>0"}</Tex> only helps when <Tex>{"\\det H > 0"}</Tex>. B needs{" "}
              <Tex>{"\\det H < 0"}</Tex>; C needs <Tex>{"\\det H > 0"}</Tex> with{" "}
              <Tex>{"f_{xx} < 0"}</Tex>.
            </>
          ),
          theory: <>Always compute det H before looking at f_xx; det H = 0 sends you to a direct study of f.</>,
        },
      },
      { kind: "heading", text: "When the test fails: det H = 0" },
      {
        kind: "prose",
        content: (
          <p>
            A zero determinant means the quadratic term vanishes along some direction, and the
            higher-order terms hidden in <Tex>{"o(\\lVert\\mathbf{v}\\rVert^2)"}</Tex> take over
            there. The remedy is always the same: <strong>study the sign of the increment</strong>{" "}
            <Tex>{"f(P) - f(P_0)"}</Tex> directly, restricting to convenient lines and curves through{" "}
            <Tex>{"P_0"}</Tex>. If the increment changes sign in every neighborhood, there is no
            extremum; if you can bound it on one side for <em>all</em> nearby points, there is.
          </p>
        ),
      },
      {
        kind: "example",
        title: "Worked example — same Hessian, opposite fates",
        content: (
          <>
            <p>
              Both <Tex>{"f_1 = x^2 + y^4"}</Tex> and <Tex>{"f_2 = x^2 + y^3"}</Tex> have the single
              critical point <Tex>{"(0,0)"}</Tex> and the same Hessian there:{" "}
              <Tex>{"H = \\begin{pmatrix} 2 & 0 \\\\ 0 & 0 \\end{pmatrix}"}</Tex>,{" "}
              <Tex>{"\\det H = 0"}</Tex>. The test cannot separate them — but a direct look can.
            </p>
            <p>
              <Tex>{"f_1(x,y) = x^2 + y^4 > 0 = f_1(0,0)"}</Tex> for every{" "}
              <Tex>{"(x,y) \\ne (0,0)"}</Tex>: a <strong>strict global minimum</strong>.
            </p>
            <p>
              <Tex>{"f_2"}</Tex> along the <Tex>{"y"}</Tex>-axis is <Tex>{"y^3"}</Tex>, which is
              positive for <Tex>{"y > 0"}</Tex> and negative for <Tex>{"y < 0"}</Tex> arbitrarily
              close to the origin: <strong>neither a minimum nor a maximum</strong>.
            </p>
          </>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "det H = 0 does not mean saddle — and lines are not enough",
        content: (
          <>
            Two distinct mistakes here. First, “degenerate” is <em>not</em> a verdict: it means{" "}
            <em>no information</em>, and the point may still be anything. Second, in the direct study,
            checking straight lines only can lie: Peano's example{" "}
            <Tex>{"f(x,y) = (y-x^2)(y-3x^2)"}</Tex> has a strict local minimum at the origin along{" "}
            <strong>every line</strong> through it, yet along the parabola <Tex>{"y = 2x^2"}</Tex> one
            finds <Tex>{"f = -x^4 < 0"}</Tex> — no local minimum at all. If the geometry of{" "}
            <Tex>{"f"}</Tex> suggests curved level sets, probe with matched curves, exactly like the
            path trick for limits.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Local ≠ global",
        content: (
          <>
            The Hessian test classifies a point <em>locally</em>. Global claims need an extra
            argument: compactness of the domain (next lesson), coercivity (<Tex>{"f\\to+\\infty"}</Tex>{" "}
            far away, so a minimum must exist), or convexity. On the exam, say “local” unless you can
            justify more — claiming a global minimum from det H alone loses marks.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Sanity-check your algebra",
        content: (
          <>
            The system <Tex>{"\\nabla f = 0"}</Tex> is where most exam points die. Two cheap checks:
            substitute every solution back into <em>both</em> equations, and count solutions
            critically — a symmetric <Tex>{"f"}</Tex> (e.g. invariant under swapping{" "}
            <Tex>{"x \\leftrightarrow y"}</Tex>) must have a symmetric set of critical points.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            You can now produce the full local map of any smooth function: suspects from{" "}
            <Tex>{"\\nabla f = 0"}</Tex>, verdicts from <Tex>{"H"}</Tex>, and a direct sign study when
            the determinant goes silent. What the local map cannot answer is “what are the biggest and
            smallest values on <em>this</em> region?” — that is a global question, and it has its own
            method.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 3 — Global extrema on compact sets
   * ================================================================ */
  {
    id: "global-extrema-compact",
    title: "Global extrema on compact sets",
    lecture: MODULE,
    summary:
      "Weierstrass guarantees the max and min exist — your job reduces to building a complete candidate list: interior critical points, boundary, corners.",
    minutes: 20,
    objectives: [
      "State the Weierstrass theorem and verify its hypotheses",
      "Run the candidate-list method for global extrema",
      "Parametrize boundary pieces and reduce them to one-variable problems",
      "Remember corner points and endpoint values",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Last lesson was local surgery. The typical exam question is global: “find the maximum and
            minimum of <Tex>{"f"}</Tex> on this disk / triangle / square”. On such regions a powerful
            theorem does half the work for you — it promises the answers <em>exist</em>, which turns
            the problem into a finite bookkeeping exercise: list every point that could possibly be
            extreme, evaluate <Tex>{"f"}</Tex> there, and pick the biggest and smallest numbers.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Weierstrass (extreme value) theorem",
        content: (
          <>
            If <Tex>{"K \\subset \\mathbb{R}^2"}</Tex> is <strong>compact</strong> — closed{" "}
            <em>and</em> bounded — and <Tex>{"f"}</Tex> is <strong>continuous</strong> on{" "}
            <Tex>{"K"}</Tex>, then <Tex>{"f"}</Tex> attains a global maximum and a global minimum on{" "}
            <Tex>{"K"}</Tex>. Both hypotheses are essential: <Tex>{"f(x)=x"}</Tex> on the open
            interval <Tex>{"(0,1)"}</Tex> attains neither, and on the unbounded set{" "}
            <Tex>{"\\mathbb{R}^2"}</Tex> even nice functions run off to infinity.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Where can the extrema hide?",
        content: (
          <>
            Only two kinds of places: <strong>interior critical points</strong> (Fermat: if the
            extremum is interior, <Tex>{"\\nabla f = 0"}</Tex> there) or points{" "}
            <strong>on the boundary</strong> <Tex>{"\\partial K"}</Tex> (including its corners). There
            is no third option — which is exactly why the candidate list is complete.
          </>
        ),
      },
      {
        kind: "steps",
        title: "The candidate-list method",
        steps: [
          {
            label: "Check the hypotheses",
            content: (
              <>
                Confirm <Tex>{"K"}</Tex> is closed and bounded and <Tex>{"f"}</Tex> continuous — one
                sentence on the exam, but it is what licenses everything after.
              </>
            ),
          },
          {
            label: "Interior candidates",
            content: (
              <>
                Solve <Tex>{"\\nabla f = 0"}</Tex>; keep only solutions strictly inside{" "}
                <Tex>{"K"}</Tex>, and evaluate <Tex>{"f"}</Tex> at each.{" "}
                <strong>Do not classify</strong> them — for a global comparison only the values
                matter.
              </>
            ),
          },
          {
            label: "Boundary candidates",
            content: (
              <>
                Split <Tex>{"\\partial K"}</Tex> into pieces. On each piece either substitute the
                constraint into <Tex>{"f"}</Tex> or parametrize (circle:{" "}
                <Tex>{"(r\\cos t, r\\sin t)"}</Tex>), getting a one-variable function; find its
                critical points <em>within the parameter range</em> and evaluate.
              </>
            ),
          },
          {
            label: "Corners & endpoints, then compare",
            content: (
              <>
                Evaluate <Tex>{"f"}</Tex> at every corner/endpoint of the boundary pieces. The largest
                number in the whole list is the global max, the smallest the global min — state both
                values <em>and</em> where they occur.
              </>
            ),
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "No Hessian needed here",
        content: (
          <>
            A frequent time sink: classifying interior critical points with det H during a global
            problem. Pointless — a value beaten by some boundary value is discarded anyway, whatever
            its local type. Compute values, compare numbers, done.
          </>
        ),
      },
      {
        kind: "example",
        title: "Worked example — disk: f(x,y) = x² + y² − 2x on x² + y² ≤ 4",
        content: (
          <>
            <p>
              <strong>Hypotheses.</strong> The closed disk is compact, <Tex>{"f"}</Tex> is a
              polynomial: Weierstrass applies.
            </p>
            <p>
              <strong>Interior.</strong> <Tex>{"\\nabla f = (2x-2,\\,2y) = 0"}</Tex> at{" "}
              <Tex>{"(1,0)"}</Tex>, which satisfies <Tex>{"1 < 4"}</Tex> (inside).{" "}
              <Tex>{"f(1,0) = 1 - 2 = -1"}</Tex>.
            </p>
            <p>
              <strong>Boundary.</strong> On <Tex>{"x^2+y^2 = 4"}</Tex> substitute the constraint:{" "}
              <Tex>{"f = 4 - 2x"}</Tex> with <Tex>{"x \\in [-2, 2]"}</Tex>. This is linear in{" "}
              <Tex>{"x"}</Tex>: extreme at the endpoints — <Tex>{"f = 8"}</Tex> at{" "}
              <Tex>{"x=-2"}</Tex>, i.e. the point <Tex>{"(-2,0)"}</Tex>, and <Tex>{"f = 0"}</Tex> at{" "}
              <Tex>{"(2,0)"}</Tex>. (Parametrizing instead gives <Tex>{"f = 4 - 4\\cos t"}</Tex> —
              same two extremes, at <Tex>{"t=\\pi"}</Tex> and <Tex>{"t=0"}</Tex>.)
            </p>
            <p>
              <strong>Compare.</strong> Candidates: <Tex>{"-1, 8, 0"}</Tex>. Global minimum{" "}
              <Tex>{"-1"}</Tex> at <Tex>{"(1,0)"}</Tex>; global maximum <Tex>{"8"}</Tex> at{" "}
              <Tex>{"(-2,0)"}</Tex>.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Polygons: edges and corners" },
      {
        kind: "prose",
        content: (
          <p>
            On a square or triangle, treat each edge as a segment: substitute its equation into{" "}
            <Tex>{"f"}</Tex> and optimize the resulting one-variable function on the correct closed
            interval. Then evaluate the vertices separately. Example: <Tex>{"f = xy"}</Tex> on{" "}
            <Tex>{"[0,2]\\times[0,1]"}</Tex>. The only solution of{" "}
            <Tex>{"\\nabla f = (y,x) = 0"}</Tex> is <Tex>{"(0,0)"}</Tex> — a corner, not an interior
            point, so there are no interior candidates at all. On the edges <Tex>{"x=0"}</Tex> and{" "}
            <Tex>{"y=0"}</Tex>, <Tex>{"f \\equiv 0"}</Tex>; on <Tex>{"y=1"}</Tex>,{" "}
            <Tex>{"f = x"}</Tex> climbs to 2; on <Tex>{"x=2"}</Tex>, <Tex>{"f = 2y"}</Tex> climbs to
            2. Global max <Tex>{"2"}</Tex> at the corner <Tex>{"(2,1)"}</Tex>, global min{" "}
            <Tex>{"0"}</Tex> along the two axis edges.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The three classic ways to lose the boundary",
        content: (
          <>
            (1) <strong>Forgetting corners</strong>: an edge study finds only interior-of-edge
            candidates; a vertex extremum has no zero derivative to flag it. (2){" "}
            <strong>Wrong parameter range</strong>: the edge from <Tex>{"(0,0)"}</Tex> to{" "}
            <Tex>{"(0,-3)"}</Tex> means <Tex>{"y \\in [-3,0]"}</Tex>, not <Tex>{"[0,3]"}</Tex>. (3){" "}
            <strong>Discarding a 1-D critical point outside the range</strong> is right — but then
            forgetting that the endpoint values still count is the follow-up error.
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-opt-cp3",
          difficulty: "easy",
          prompt: (
            <>
              For a continuous, differentiable <Tex>{"f"}</Tex> on a compact region <Tex>{"K"}</Tex>,
              where must you search for global extrema?
            </>
          ),
          options: [
            { id: "A", content: <>Interior critical points and the entire boundary, corners included</> },
            { id: "B", content: <>Interior critical points only</> },
            { id: "C", content: <>Only points where <Tex>{"\\det H > 0"}</Tex></> },
            { id: "D", content: <>Only the vertices of the region</> },
          ],
          correct: "A",
          explanation: (
            <>
              An extremum is interior (then Fermat forces <Tex>{"\\nabla f = 0"}</Tex>) or on the
              boundary — no other option, so <strong>A</strong>. B ignores the boundary, where global
              extrema very often live (see the disk example: the maximum was a boundary point). C is
              doubly wrong: det H classifies but does not locate, and it would even discard saddle
              values that never matter anyway. D works only for linear <Tex>{"f"}</Tex> on polygons,
              not in general.
            </>
          ),
          theory: <>Global extrema on compact sets: candidates = interior stationary points ∪ boundary (with corners); compare values.</>,
        },
      },
      {
        kind: "callout",
        tone: "key",
        title: "No compactness, no guarantee",
        content: (
          <>
            On open or unbounded regions Weierstrass says nothing, and the method above does not
            apply as-is. Then you must argue with limits: if <Tex>{"f \\to +\\infty"}</Tex> in every
            direction (coercive), a global minimum still exists at some critical point, but a global
            maximum does not. Always begin by asking: <em>is my region compact?</em>
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            One loose end: the boundary study is itself an optimization <em>with a constraint</em>{" "}
            (“stay on the curve <Tex>{"g = 0"}</Tex>”). We handled it by substitution because our
            constraints were easy to solve. When they are not, there is a beautiful general tool — the
            Lagrange multiplier — and it is the final piece of this module.
          </p>
        ),
      },
    ],
  },

  /* ================================================================ *
   * LESSON 4 — Lagrange multipliers
   * ================================================================ */
  {
    id: "lagrange-multipliers",
    title: "Constrained optimization: Lagrange multipliers",
    lecture: MODULE,
    summary:
      "At a constrained extremum the level curve of f kisses the constraint: ∇f = λ∇g. One system, all candidates.",
    minutes: 21,
    objectives: [
      "Set up and solve the Lagrange system for one constraint",
      "Explain the geometric meaning of ∇f = λ∇g (tangency of level curves)",
      "Run clean case analysis on circle constraints without losing solutions",
      "Decide when direct parametrization beats multipliers",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Imagine hiking along a trail (the constraint curve <Tex>{"g(x,y)=0"}</Tex>) across a
            hillside whose altitude is <Tex>{"f(x,y)"}</Tex>. At the highest point{" "}
            <em>of the trail</em>, you are momentarily walking level — the trail is tangent to a
            contour line of the hill. If it crossed the contour instead, altitude would still be
            increasing in one of the two walking directions, so you would not be at the top. That
            tangency, written with gradients, is the entire method of Lagrange.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Constrained extremum & regular constraint",
        content: (
          <>
            A point <Tex>{"P_0"}</Tex> with <Tex>{"g(P_0)=0"}</Tex> is a constrained maximum
            (minimum) if <Tex>{"f(P_0) \\ge f(P)"}</Tex> (resp. <Tex>{"\\le"}</Tex>) for all nearby{" "}
            <Tex>{"P"}</Tex> <em>on the curve</em> <Tex>{"g=0"}</Tex>. The constraint is{" "}
            <strong>regular</strong> at <Tex>{"P_0"}</Tex> if <Tex>{"\\nabla g(P_0) \\ne (0,0)"}</Tex>{" "}
            — the standing hypothesis of the multiplier theorem.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\begin{cases} \\nabla f(x,y) = \\lambda\\, \\nabla g(x,y) \\\\ g(x,y) = 0 \\end{cases}",
        tag: "3.4",
        caption: (
          <>
            The Lagrange system: three scalar equations (<Tex>{"f_x = \\lambda g_x"}</Tex>,{" "}
            <Tex>{"f_y = \\lambda g_y"}</Tex>, <Tex>{"g=0"}</Tex>) in three unknowns{" "}
            <Tex>{"x, y, \\lambda"}</Tex>. Every constrained extremum at a regular point solves it —
            so its solutions are the complete candidate list.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <LagrangeFigure />,
        caption: (
          <>
            <Tex>{"f = x+y"}</Tex> on the circle <Tex>{"x^2+y^2=2"}</Tex>: interior level lines cross
            the circle, but the extreme ones (<Tex>{"c = \\pm 2"}</Tex>, highlighted) are tangent to
            it. At the tangency points the gradients <Tex>{"\\nabla f"}</Tex> and{" "}
            <Tex>{"\\nabla g"}</Tex> are parallel.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Why parallel gradients? Move along the constraint with velocity <Tex>{"\\mathbf{T}"}</Tex>{" "}
            (tangent to the curve). At a constrained extremum the derivative of <Tex>{"f"}</Tex> along
            the curve vanishes: <Tex>{"\\nabla f \\cdot \\mathbf{T} = 0"}</Tex>, so{" "}
            <Tex>{"\\nabla f"}</Tex> is perpendicular to the curve. But <Tex>{"\\nabla g"}</Tex> is{" "}
            <em>always</em> perpendicular to its own level curve <Tex>{"g=0"}</Tex>. Two vectors
            perpendicular to the same line are parallel: <Tex>{"\\nabla f = \\lambda\\nabla g"}</Tex>.
            The number <Tex>{"\\lambda"}</Tex> is just the proportionality factor — it may perfectly
            well be zero (that happens exactly when a free critical point of <Tex>{"f"}</Tex> sits on
            the constraint).
          </p>
        ),
      },
      {
        kind: "steps",
        title: "Solving a Lagrange problem cleanly",
        steps: [
          {
            label: "Write the system",
            content: (
              <>
                <Tex>{"f_x = \\lambda g_x"}</Tex>, <Tex>{"f_y = \\lambda g_y"}</Tex>,{" "}
                <Tex>{"g = 0"}</Tex>. Check regularity: where is <Tex>{"\\nabla g = 0"}</Tex>? (On a
                circle <Tex>{"x^2+y^2=r^2"}</Tex>: only at the center, which is not on the curve —
                safe.)
              </>
            ),
          },
          {
            label: "Solve by cases, never dividing blindly",
            content: (
              <>
                Eliminating <Tex>{"\\lambda"}</Tex> by dividing the two equations silently assumes the
                denominators are nonzero. Branch instead: “either <Tex>{"x = 0"}</Tex> or{" "}
                <Tex>{"x \\ne 0"}</Tex> and then …”. Lost cases are lost extrema.
              </>
            ),
          },
          {
            label: "Evaluate f at every candidate",
            content: (
              <>
                On a compact constraint (circle, ellipse) Weierstrass guarantees max and min exist, so
                the largest value among candidates <em>is</em> the max, the smallest the min — no
                second-order test needed.
              </>
            ),
          },
          {
            label: "Cross-check if possible",
            content: (
              <>
                A quick parametrization (<Tex>{"x = r\\cos t"}</Tex>, <Tex>{"y = r\\sin t"}</Tex>) of
                the same problem is a powerful verification of both the points and the values.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — extrema of f = x + y on x² + y² = 2",
        content: (
          <>
            <p>
              System: <Tex>{"1 = 2\\lambda x"}</Tex>, <Tex>{"1 = 2\\lambda y"}</Tex>,{" "}
              <Tex>{"x^2 + y^2 = 2"}</Tex>. The first equation forbids <Tex>{"\\lambda = 0"}</Tex>{" "}
              (it would read <Tex>{"1 = 0"}</Tex>), so{" "}
              <Tex>{"x = y = \\tfrac{1}{2\\lambda}"}</Tex>.
            </p>
            <p>
              Constraint: <Tex>{"2x^2 = 2 \\Rightarrow x = \\pm 1"}</Tex>. Candidates:{" "}
              <Tex>{"(1,1)"}</Tex> with <Tex>{"f = 2"}</Tex> and <Tex>{"(-1,-1)"}</Tex> with{" "}
              <Tex>{"f = -2"}</Tex>.
            </p>
            <p>
              The circle is compact, so: global constrained max <Tex>{"2"}</Tex> at{" "}
              <Tex>{"(1,1)"}</Tex>, min <Tex>{"-2"}</Tex> at <Tex>{"(-1,-1)"}</Tex> — exactly the
              tangency picture above. Check by parametrization:{" "}
              <Tex>{"f = \\sqrt2\\cos t + \\sqrt2\\sin t = 2\\sin(t + \\tfrac{\\pi}{4}) \\in [-2, 2]"}</Tex>. ✓
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-opt-cp4",
          difficulty: "medium",
          prompt: (
            <>
              Using the example above, the constrained <em>minimum</em> of <Tex>{"f = x+y"}</Tex> on{" "}
              <Tex>{"x^2+y^2=2"}</Tex> is attained at:
            </>
          ),
          options: [
            { id: "A", content: <><Tex>{"(1,1)"}</Tex>, with <Tex>{"f = 2"}</Tex></> },
            { id: "B", content: <><Tex>{"(-1,-1)"}</Tex>, with <Tex>{"f = -2"}</Tex></> },
            { id: "C", content: <><Tex>{"(-\\sqrt2, 0)"}</Tex>, with <Tex>{"f = -\\sqrt2"}</Tex></> },
            { id: "D", content: <>Nowhere — the minimum does not exist</> },
          ],
          correct: "B",
          explanation: (
            <>
              The Lagrange candidates are <Tex>{"(1,1)"}</Tex> and <Tex>{"(-1,-1)"}</Tex>, with values{" "}
              <Tex>{"2"}</Tex> and <Tex>{"-2"}</Tex>; the smaller is the min — answer{" "}
              <strong>B</strong>. A is the maximum. C lies on the circle but is not a Lagrange point
              (there <Tex>{"\\nabla g = (-2\\sqrt2, 0)"}</Tex> is not parallel to{" "}
              <Tex>{"\\nabla f=(1,1)"}</Tex>) and its value <Tex>{"-\\sqrt2 \\approx -1.41"}</Tex> is
              beaten by <Tex>{"-2"}</Tex>. D contradicts Weierstrass on a compact circle.
            </>
          ),
          theory: <>On a compact constraint, min = smallest value among Lagrange candidates (existence via Weierstrass).</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Where Lagrange solutions get lost",
        content: (
          <>
            Three recurring disasters: (1) dividing the equations by <Tex>{"x"}</Tex>,{" "}
            <Tex>{"y"}</Tex> or <Tex>{"\\lambda"}</Tex> without the “= 0” branch — for{" "}
            <Tex>{"f=xy"}</Tex> on a circle this silently throws away half the candidates; (2)
            treating <Tex>{"\\lambda"}</Tex> as an answer — the exam wants points and values of{" "}
            <Tex>{"f"}</Tex>, λ is scaffolding; (3) labeling candidates max/min by their λ or by gut
            feeling instead of comparing the values of <Tex>{"f"}</Tex>.
          </>
        ),
      },
      { kind: "heading", text: "Lagrange or parametrize?" },
      {
        kind: "prose",
        content: (
          <p>
            Multipliers are not always the fastest route. If the constraint is a{" "}
            <strong>graph or a segment</strong> (<Tex>{"y = \\varphi(x)"}</Tex>, or an edge like{" "}
            <Tex>{"y=0,\\ x\\in[0,3]"}</Tex>), just substitute and do one-variable calculus —
            endpoints included, which Lagrange does not see. If it is a{" "}
            <strong>circle or ellipse</strong>, <Tex>{"(r\\cos t, r\\sin t)"}</Tex> turns the problem
            into a periodic one-variable function; both methods work, pick the cleaner algebra.
            Lagrange becomes irreplaceable when the constraint is{" "}
            <strong>hard to solve explicitly</strong> (say <Tex>{"x^3 + y^3 = 16"}</Tex>) or in three
            or more variables, where parametrizing a surface costs more than the multiplier does.
          </p>
        ),
      },
      {
        kind: "callout",
        tone: "tip",
        title: "The boundary step, automated",
        content: (
          <>
            In a global problem on a compact region (lesson 3), the boundary study <em>is</em> a
            constrained optimization with <Tex>{"g = 0"}</Tex> the boundary curve. Feel free to run
            Lagrange there instead of parametrizing — same candidates, and often less trigonometry.
            Just remember polygon corners still need separate evaluation.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "The module in four sentences",
        content: (
          <>
            Taylor to second order turns any smooth surface into a quadratic form governed by the
            Hessian. At critical points, det H and <Tex>{"f_{xx}"}</Tex> classify: min, max, saddle,
            or silence when det H = 0. On compact regions, Weierstrass plus the candidate list
            (interior + boundary + corners) nails global extrema. On constraints, tangency —{" "}
            <Tex>{"\\nabla f = \\lambda \\nabla g"}</Tex> — generates all candidates, and comparing
            values finishes the job.
          </>
        ),
      },
    ],
  },
];

export const practice: Question[] = [
  {
    id: "ma2-opt-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>A point <Tex>{"P_0"}</Tex> is a critical (stationary) point of a differentiable <Tex>{"f(x,y)"}</Tex> exactly when:</>,
    options: [
      { id: "A", content: <><Tex>{"f(P_0) = 0"}</Tex></> },
      { id: "B", content: <><Tex>{"\\nabla f(P_0) = (0,0)"}</Tex></> },
      { id: "C", content: <><Tex>{"\\det H(P_0) = 0"}</Tex></> },
      { id: "D", content: <><Tex>{"f_{xx}(P_0) = 0"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        Critical means both first-order partials vanish — the tangent plane is horizontal — so{" "}
        <strong>B</strong>. A confuses the <em>value</em> of f with its slope (f can be zero on a
        steep hillside); C describes a <em>degenerate Hessian</em>, a second-order property; D is one
        second derivative and says nothing about stationarity.
      </>
    ),
    theory: <>Interior extrema of differentiable functions occur only where ∇f = 0 (Fermat in 2D).</>,
  },
  {
    id: "ma2-opt-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>At a critical point you find <Tex>{"\\det H < 0"}</Tex>. The point is:</>,
    options: [
      { id: "A", content: <>A local minimum</> },
      { id: "B", content: <>A local maximum</> },
      { id: "C", content: <>A saddle point</> },
      { id: "D", content: <>Unclassifiable without more information</> },
    ],
    correct: "C",
    explanation: (
      <>
        For a 2×2 Hessian, det H is the product of the eigenvalues; a negative product means one
        positive and one negative eigenvalue — the surface climbs along one eigendirection and drops
        along the other: a saddle, answer <strong>C</strong>. A and B both require{" "}
        <Tex>{"\\det H > 0"}</Tex> (plus the sign of <Tex>{"f_{xx}"}</Tex>); D is wrong because a
        negative determinant is fully conclusive — only <Tex>{"\\det H = 0"}</Tex> leaves the test
        silent.
      </>
    ),
    theory: <>det H &lt; 0 ⟺ indefinite Hessian ⟺ saddle. Only det H = 0 is inconclusive.</>,
  },
  {
    id: "ma2-opt-q3",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The Weierstrass theorem guarantees that <Tex>{"f"}</Tex> attains a global maximum and minimum whenever:</>,
    options: [
      { id: "A", content: <><Tex>{"f"}</Tex> is continuous on a closed and bounded set</> },
      { id: "B", content: <><Tex>{"f"}</Tex> is differentiable, on any set</> },
      { id: "C", content: <><Tex>{"f"}</Tex> is continuous on an open set</> },
      { id: "D", content: <><Tex>{"f"}</Tex> has at least one critical point</> },
    ],
    correct: "A",
    explanation: (
      <>
        Continuity + compactness (closed <em>and</em> bounded) is exactly the hypothesis — answer{" "}
        <strong>A</strong>. B fails on unbounded sets: <Tex>{"f(x,y)=x"}</Tex> is smooth on{" "}
        <Tex>{"\\mathbb{R}^2"}</Tex> with no extrema. C fails because open sets let the extremum
        escape to the missing boundary (<Tex>{"f(x)=x"}</Tex> on <Tex>{"(0,1)"}</Tex>). D is neither
        necessary nor sufficient: a critical point can be a saddle, and boundary extrema need no
        critical point at all.
      </>
    ),
    theory: <>Compact domain + continuous function ⇒ global max and min exist (they may sit on the boundary).</>,
  },
  {
    id: "ma2-opt-q4",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The Hessian of a <Tex>{"C^2"}</Tex> function is positive definite at a critical point (⇒ local minimum) exactly when:</>,
    options: [
      { id: "A", content: <><Tex>{"\\det H > 0"}</Tex> alone</> },
      { id: "B", content: <><Tex>{"f_{xx} > 0"}</Tex> and <Tex>{"f_{yy} > 0"}</Tex></> },
      { id: "C", content: <><Tex>{"\\operatorname{tr} H > 0"}</Tex></> },
      { id: "D", content: <><Tex>{"\\det H > 0"}</Tex> and <Tex>{"f_{xx} > 0"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        Sylvester's criterion for 2×2: both leading principal minors positive, i.e.{" "}
        <Tex>{"f_{xx} > 0"}</Tex> and <Tex>{"\\det H > 0"}</Tex> — answer <strong>D</strong>. A alone
        also matches negative definite matrices (e.g. <Tex>{"-I"}</Tex>, det = 1). B is the classic
        trap: <Tex>{"\\begin{pmatrix}1 & 2\\\\ 2 & 1\\end{pmatrix}"}</Tex> has positive diagonal but
        det = −3, an indefinite (saddle) form. C fails too: eigenvalues 3 and −1 give positive trace
        yet a saddle.
      </>
    ),
    theory: <>2×2 Sylvester: (f_xx, det H) both positive ⇒ pos. definite; f_xx negative with det H positive ⇒ neg. definite.</>,
  },
  {
    id: "ma2-opt-q5",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Geometrically, the Lagrange condition <Tex>{"\\nabla f = \\lambda \\nabla g"}</Tex> at a constrained extremum on the curve <Tex>{"g=0"}</Tex> says that:</>,
    options: [
      { id: "A", content: <><Tex>{"f"}</Tex> and <Tex>{"g"}</Tex> take the same value there</> },
      { id: "B", content: <>The level curve of <Tex>{"f"}</Tex> is tangent to the constraint curve — the two gradients are parallel</> },
      { id: "C", content: <>The gradients of <Tex>{"f"}</Tex> and <Tex>{"g"}</Tex> are perpendicular</> },
      { id: "D", content: <>The point is a free critical point of <Tex>{"f"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        At a constrained extremum, f cannot change to first order along the curve, so{" "}
        <Tex>{"\\nabla f"}</Tex> ⟂ curve; <Tex>{"\\nabla g"}</Tex> is always ⟂ to its level curve;
        hence the gradients are parallel and the level curves kiss — answer <strong>B</strong>. A
        confuses values with geometry (f and g measure different things). C is the exact opposite of
        the condition. D describes <Tex>{"\\nabla f = 0"}</Tex>, the special case{" "}
        <Tex>{"\\lambda = 0"}</Tex> — possible but not the general meaning.
      </>
    ),
    theory: <>Lagrange = tangency of level sets: both gradients normal to the constraint at the extremum.</>,
  },
  {
    id: "ma2-opt-q6",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Classify the quadratic form <Tex>{"q(x,y) = 2x^2 + 2xy + 2y^2"}</Tex>.</>,
    options: [
      { id: "A", content: <>Positive definite</> },
      { id: "B", content: <>Indefinite</> },
      { id: "C", content: <>Positive semidefinite (degenerate)</> },
      { id: "D", content: <>Negative definite</> },
    ],
    correct: "A",
    explanation: (
      <>
        The matrix is <Tex>{"\\begin{pmatrix}2 & 1\\\\ 1 & 2\\end{pmatrix}"}</Tex> (the xy coefficient
        2 splits as 2β with β = 1): <Tex>{"\\det A = 4 - 1 = 3 > 0"}</Tex> and the leading entry{" "}
        <Tex>{"2 > 0"}</Tex> ⇒ positive definite — answer <strong>A</strong>. Eigenvalues confirm it:{" "}
        <Tex>{"\\lambda = 1, 3"}</Tex>, both positive. B needs det &lt; 0; C needs det = 0; D needs a
        negative leading entry with positive det.
      </>
    ),
    theory: <>Halve the mixed coefficient to build A, then det + leading entry decide in two steps.</>,
  },
  {
    id: "ma2-opt-q7",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The eigenvalues of the Hessian <Tex>{"H = \\begin{pmatrix} 5 & 2 \\\\ 2 & 2 \\end{pmatrix}"}</Tex> are:</>,
    options: [
      { id: "A", content: <><Tex>{"5"}</Tex> and <Tex>{"2"}</Tex></> },
      { id: "B", content: <><Tex>{"7"}</Tex> and <Tex>{"6"}</Tex></> },
      { id: "C", content: <><Tex>{"6"}</Tex> and <Tex>{"1"}</Tex></> },
      { id: "D", content: <><Tex>{"4"}</Tex> and <Tex>{"3"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        Characteristic polynomial:{" "}
        <Tex>{"\\lambda^2 - (\\operatorname{tr}H)\\lambda + \\det H = \\lambda^2 - 7\\lambda + 6 = (\\lambda-1)(\\lambda-6)"}</Tex>,
        so λ = 6 and 1 — answer <strong>C</strong>: sum 7 = trace ✓, product 6 = det ✓. A reads the
        diagonal, valid only for diagonal matrices. B lists the trace and determinant themselves. D
        has the right sum but product 12 ≠ det. Both eigenvalues positive ⇒ this Hessian would mean a
        local minimum.
      </>
    ),
    theory: <>For 2×2: λ² − (tr)λ + det = 0; always verify sum = trace and product = det.</>,
  },
  {
    id: "ma2-opt-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>For <Tex>{"f(x,y) = x^2 + y^2 - 4x + 6y + 1"}</Tex>, the critical point and its nature are:</>,
    options: [
      { id: "A", content: <><Tex>{"(2,-3)"}</Tex>, a saddle point</> },
      { id: "B", content: <><Tex>{"(-2,3)"}</Tex>, a local minimum</> },
      { id: "C", content: <><Tex>{"(4,-6)"}</Tex>, a local minimum</> },
      { id: "D", content: <><Tex>{"(2,-3)"}</Tex>, a (global) minimum with <Tex>{"f = -12"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\nabla f = (2x-4,\\, 2y+6) = 0"}</Tex> gives <Tex>{"(2,-3)"}</Tex>;{" "}
        <Tex>{"H = 2I"}</Tex> has det 4 &gt; 0 and <Tex>{"f_{xx}=2>0"}</Tex>: minimum, and{" "}
        <Tex>{"f(2,-3) = 4+9-8-18+1 = -12"}</Tex> — answer <strong>D</strong>. It is even global,
        since <Tex>{"f = (x-2)^2 + (y+3)^2 - 12"}</Tex>. A has the right point, wrong type (2I is
        positive definite, not indefinite). B flips the signs when solving. C forgets the factor 2
        (solving x − 4 = 0 instead of 2x − 4 = 0).
      </>
    ),
    theory: <>Quadratics with positive definite Hessian have one global minimum; completing squares confirms the value.</>,
  },
  {
    id: "ma2-opt-q9",
    topic: MODULE,
    difficulty: "medium",
    prompt: <><Tex>{"f(x,y) = x^2 + y^3 - 3y"}</Tex> has critical points <Tex>{"(0,1)"}</Tex> and <Tex>{"(0,-1)"}</Tex>. The point <Tex>{"(0,-1)"}</Tex> is:</>,
    options: [
      { id: "A", content: <>A saddle point</> },
      { id: "B", content: <>A local maximum</> },
      { id: "C", content: <>A local minimum</> },
      { id: "D", content: <>Unclassifiable: <Tex>{"\\det H = 0"}</Tex> there</> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"H = \\begin{pmatrix} 2 & 0 \\\\ 0 & 6y \\end{pmatrix}"}</Tex>; at{" "}
        <Tex>{"(0,-1)"}</Tex> this is <Tex>{"\\mathrm{diag}(2,-6)"}</Tex> with{" "}
        <Tex>{"\\det H = -12 < 0"}</Tex>: saddle — answer <strong>A</strong> (up along x, down along
        y). B would need both diagonal entries negative; C describes the <em>other</em> point{" "}
        <Tex>{"(0,1)"}</Tex>, where <Tex>{"H = \\mathrm{diag}(2,6)"}</Tex> is positive definite; D is
        false since det H = −12 ≠ 0.
      </>
    ),
    theory: <>Diagonal Hessian: entries are the eigenvalues; mixed signs ⇒ saddle immediately.</>,
  },
  {
    id: "ma2-opt-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The second-order Taylor polynomial of <Tex>{"f(x,y) = e^{xy}"}</Tex> at <Tex>{"(0,0)"}</Tex> is:</>,
    options: [
      { id: "A", content: <><Tex>{"1 + xy + \\tfrac12 x^2y^2"}</Tex></> },
      { id: "B", content: <><Tex>{"1 + xy"}</Tex></> },
      { id: "C", content: <><Tex>{"1 + x + y + xy"}</Tex></> },
      { id: "D", content: <><Tex>{"1 + \\tfrac12(x^2 + y^2)"}</Tex></> },
    ],
    correct: "B",
    explanation: (
      <>
        Substitute <Tex>{"t = xy"}</Tex> into <Tex>{"e^t = 1 + t + \\tfrac{t^2}{2} + \\dots"}</Tex>:
        the term <Tex>{"xy"}</Tex> has total degree 2, while <Tex>{"x^2y^2/2"}</Tex> has degree 4 — so{" "}
        <Tex>{"T_2 = 1 + xy"}</Tex>, answer <strong>B</strong>. Derivative check:{" "}
        <Tex>{"f_x = ye^{xy}"}</Tex> and <Tex>{"f_y = xe^{xy}"}</Tex> vanish at 0 (kills C's linear
        terms), <Tex>{"f_{xx} = f_{yy} = 0"}</Tex> (kills D), <Tex>{"f_{xy} = 1"}</Tex>. A wrongly
        keeps a fourth-degree term inside a <em>second</em>-order polynomial.
      </>
    ),
    theory: <>Compose known 1-D series and keep terms of total degree ≤ 2 — often faster than six derivatives.</>,
  },
  {
    id: "ma2-opt-q11",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>Classify the quadratic form <Tex>{"q(x,y) = 4x^2 + 4xy + y^2"}</Tex>.</>,
    options: [
      { id: "A", content: <>Positive definite</> },
      { id: "B", content: <>Indefinite</> },
      { id: "C", content: <>Positive semidefinite (degenerate)</> },
      { id: "D", content: <>Negative semidefinite</> },
    ],
    correct: "C",
    explanation: (
      <>
        Matrix <Tex>{"\\begin{pmatrix}4 & 2\\\\ 2 & 1\\end{pmatrix}"}</Tex>,{" "}
        <Tex>{"\\det A = 4 - 4 = 0"}</Tex>: degenerate. Factoring settles the type:{" "}
        <Tex>{"q = (2x+y)^2 \\ge 0"}</Tex>, but <Tex>{"q = 0"}</Tex> along the whole line{" "}
        <Tex>{"y = -2x"}</Tex> — positive <em>semi</em>definite, answer <strong>C</strong>. Not A:
        definiteness demands strict positivity for every nonzero vector. Not B: indefinite requires
        det &lt; 0 (both signs attained). Not D: q never goes negative.
      </>
    ),
    theory: <>det A = 0 ⇒ the form is ±(perfect square): semidefinite, flat along the kernel line.</>,
  },
  {
    id: "ma2-opt-q12",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The maximum of <Tex>{"f(x,y) = x + 2y"}</Tex> on the circle <Tex>{"x^2 + y^2 = 5"}</Tex> is:</>,
    options: [
      { id: "A", content: <><Tex>{"4"}</Tex>, attained at <Tex>{"(2,1)"}</Tex></> },
      { id: "B", content: <><Tex>{"\\sqrt5"}</Tex>, attained at <Tex>{"(1,2)"}</Tex></> },
      { id: "C", content: <><Tex>{"5"}</Tex>, attained at <Tex>{"(2,1)"}</Tex></> },
      { id: "D", content: <><Tex>{"5"}</Tex>, attained at <Tex>{"(1,2)"}</Tex></> },
    ],
    correct: "D",
    explanation: (
      <>
        Lagrange: <Tex>{"(1,2) = \\lambda(2x,2y)"}</Tex> forces <Tex>{"y = 2x"}</Tex>; the constraint
        gives <Tex>{"5x^2 = 5"}</Tex>, so the candidates are <Tex>{"(1,2)"}</Tex> with{" "}
        <Tex>{"f = 5"}</Tex> and <Tex>{"(-1,-2)"}</Tex> with <Tex>{"f=-5"}</Tex> — answer{" "}
        <strong>D</strong>. A and C use <Tex>{"(2,1)"}</Tex>: it lies on the circle but the gradients
        are not parallel there, and indeed <Tex>{"f(2,1) = 4 < 5"}</Tex> (note C even quotes a value
        inconsistent with its own point). B confuses the maximum with the radius{" "}
        <Tex>{"\\sqrt5"}</Tex>.
      </>
    ),
    theory: <>Linear f on a circle: max = ‖∇f‖·r, attained where the radius vector is parallel to ∇f (Cauchy–Schwarz check).</>,
  },
  {
    id: "ma2-opt-q13",
    topic: MODULE,
    difficulty: "hard",
    prompt: <>On the closed disk <Tex>{"x^2 + y^2 \\le 1"}</Tex>, the global maximum of <Tex>{"f(x,y) = x^2 - y^2"}</Tex> is:</>,
    options: [
      { id: "A", content: <><Tex>{"1"}</Tex>, at <Tex>{"(\\pm 1, 0)"}</Tex></> },
      { id: "B", content: <><Tex>{"0"}</Tex>, at the interior critical point <Tex>{"(0,0)"}</Tex></> },
      { id: "C", content: <><Tex>{"1"}</Tex>, at <Tex>{"(0, \\pm 1)"}</Tex></> },
      { id: "D", content: <>It does not exist: <Tex>{"(0,0)"}</Tex> is a saddle</> },
    ],
    correct: "A",
    explanation: (
      <>
        Interior: <Tex>{"\\nabla f = (2x, -2y) = 0"}</Tex> only at <Tex>{"(0,0)"}</Tex>, value 0 (a
        saddle, but for global comparisons only the value matters). Boundary: substitute{" "}
        <Tex>{"y^2 = 1 - x^2"}</Tex> to get <Tex>{"f = 2x^2 - 1"}</Tex> on <Tex>{"x\\in[-1,1]"}</Tex>:
        max 1 at <Tex>{"x = \\pm1"}</Tex>, i.e. at <Tex>{"(\\pm 1, 0)"}</Tex> — answer{" "}
        <strong>A</strong>. B stops at the interior candidate and misses the boundary entirely. C
        names the <em>minimum</em> points, where <Tex>{"f = -1"}</Tex>. D is wrong because Weierstrass
        guarantees a max on the compact disk regardless of what the interior point is.
      </>
    ),
    theory: <>Global on a disk = interior stationary values vs boundary values; a saddle inside never blocks existence.</>,
  },
  {
    id: "ma2-opt-q14",
    topic: MODULE,
    difficulty: "hard",
    prompt: <>The critical points of <Tex>{"f(x,y) = x^4 + y^4 - 4xy"}</Tex> are:</>,
    options: [
      { id: "A", content: <>Only <Tex>{"(0,0)"}</Tex>, a saddle</> },
      { id: "B", content: <><Tex>{"(0,0)"}</Tex> (saddle) plus <Tex>{"(1,1)"}</Tex> and <Tex>{"(-1,-1)"}</Tex>, both local minima with <Tex>{"f=-2"}</Tex></> },
      { id: "C", content: <><Tex>{"(0,0)"}</Tex> (local max) plus <Tex>{"(1,1)"}</Tex> and <Tex>{"(-1,-1)"}</Tex> (minima)</> },
      { id: "D", content: <><Tex>{"(1,-1)"}</Tex> and <Tex>{"(-1,1)"}</Tex>, both local minima</> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"\\nabla f = (4x^3 - 4y,\\; 4y^3 - 4x) = 0"}</Tex> gives <Tex>{"y = x^3"}</Tex> and{" "}
        <Tex>{"x = y^3"}</Tex>, hence <Tex>{"x = x^9"}</Tex>: <Tex>{"x \\in \\{0, 1, -1\\}"}</Tex> and{" "}
        <Tex>{"y = x"}</Tex>.{" "}
        <Tex>{"H = \\begin{pmatrix} 12x^2 & -4 \\\\ -4 & 12y^2 \\end{pmatrix}"}</Tex>: at the origin
        det = −16 (saddle); at <Tex>{"(\\pm1,\\pm1)"}</Tex> det = 144 − 16 = 128 &gt; 0 with{" "}
        <Tex>{"f_{xx}=12>0"}</Tex> (minima, <Tex>{"f = 1+1-4 = -2"}</Tex>) — answer <strong>B</strong>.
        A loses the roots of <Tex>{"x^9 = x"}</Tex> beyond zero. C misclassifies the origin (det &lt;
        0 is a saddle, not a max). D's points don't even solve the system:{" "}
        <Tex>{"\\nabla f(1,-1) = (8,-8) \\ne 0"}</Tex>.
      </>
    ),
    theory: <>Substitute one gradient equation into the other; the polynomial degree tells how many roots to hunt for. Verify each candidate in both equations.</>,
  },
  {
    id: "ma2-opt-q15",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Both <Tex>{"f_1 = x^2 + y^4"}</Tex> and <Tex>{"f_2 = x^2 + y^3"}</Tex> have the critical point{" "}
        <Tex>{"(0,0)"}</Tex> with the same Hessian <Tex>{"\\mathrm{diag}(2, 0)"}</Tex>. Which
        statement is true?
      </>
    ),
    options: [
      { id: "A", content: <>Both have a local minimum there, since <Tex>{"f_{xx} = 2 > 0"}</Tex></> },
      { id: "B", content: <>The Hessian test proves a minimum for <Tex>{"f_1"}</Tex> but is inconclusive for <Tex>{"f_2"}</Tex></> },
      { id: "C", content: <>The test is inconclusive for both; directly, <Tex>{"f_1"}</Tex> has a strict minimum while <Tex>{"f_2"}</Tex> has no extremum</> },
      { id: "D", content: <>Both are saddle points because <Tex>{"\\det H = 0"}</Tex></> },
    ],
    correct: "C",
    explanation: (
      <>
        With <Tex>{"\\det H = 0"}</Tex> the test says nothing for <em>either</em> function — the
        Hessians are identical, so it cannot possibly separate them (this kills B, which credits the
        test with a verdict it never gives). Direct study: <Tex>{"f_1 = x^2 + y^4 > 0"}</Tex> off the
        origin ⇒ strict (global) minimum; <Tex>{"f_2"}</Tex> restricted to the y-axis is{" "}
        <Tex>{"y^3"}</Tex>, changing sign arbitrarily close to 0 ⇒ neither min nor max. Answer{" "}
        <strong>C</strong>. A misuses <Tex>{"f_{xx}>0"}</Tex>, which only decides when det H &gt; 0. D
        confuses “degenerate” with “saddle” — saddles need det H &lt; 0.
      </>
    ),
    theory: <>When det H = 0, classify by the sign of f(P) − f(P₀) along lines and curves — second order has abdicated.</>,
  },
  {
    id: "ma2-opt-q16",
    topic: MODULE,
    difficulty: "hard",
    prompt: <>Minimize <Tex>{"f(x,y) = x^2 + y^2"}</Tex> subject to <Tex>{"xy = 1"}</Tex>. The result is:</>,
    options: [
      { id: "A", content: <>Minimum <Tex>{"1"}</Tex> at <Tex>{"(1,1)"}</Tex></> },
      { id: "B", content: <>Minimum <Tex>{"\\sqrt2"}</Tex> at <Tex>{"(1,1)"}</Tex> and <Tex>{"(-1,-1)"}</Tex></> },
      { id: "C", content: <>No minimum exists, because the constraint set is unbounded</> },
      { id: "D", content: <>Minimum <Tex>{"2"}</Tex> at <Tex>{"(1,1)"}</Tex> and <Tex>{"(-1,-1)"}</Tex>; no maximum exists</> },
    ],
    correct: "D",
    explanation: (
      <>
        Lagrange: <Tex>{"(2x, 2y) = \\lambda(y, x)"}</Tex> gives{" "}
        <Tex>{"2x^2 = \\lambda xy = 2y^2"}</Tex>, so <Tex>{"y = \\pm x"}</Tex>; the constraint{" "}
        <Tex>{"xy = 1 > 0"}</Tex> keeps only <Tex>{"y = x"}</Tex>, hence <Tex>{"x^2 = 1"}</Tex>:
        points <Tex>{"(1,1)"}</Tex> and <Tex>{"(-1,-1)"}</Tex> with <Tex>{"f = 2"}</Tex>. Along the
        hyperbola <Tex>{"f \\to \\infty"}</Tex>, so 2 is the minimum and there is no maximum — answer{" "}
        <strong>D</strong>. A miscomputes <Tex>{"f(1,1) = 1 + 1"}</Tex>. B reports the{" "}
        <em>distance</em> <Tex>{"\\sqrt2"}</Tex> instead of the squared distance that f measures. C
        over-applies Weierstrass: non-compactness voids the <em>guarantee</em>, not the minimum itself
        — here f grows at infinity, so the smallest candidate wins.
      </>
    ),
    theory: <>On unbounded constraints, check behavior at infinity: coercive f keeps its min, loses its max.</>,
  },
  {
    id: "ma2-opt-q17",
    topic: MODULE,
    difficulty: "hard",
    prompt: <>The coefficient of <Tex>{"xy"}</Tex> in the second-order Taylor polynomial of <Tex>{"f(x,y) = \\ln(1 + x + 2y)"}</Tex> at <Tex>{"(0,0)"}</Tex> is:</>,
    options: [
      { id: "A", content: <><Tex>{"-2"}</Tex></> },
      { id: "B", content: <><Tex>{"-4"}</Tex></> },
      { id: "C", content: <><Tex>{"-1"}</Tex></> },
      { id: "D", content: <><Tex>{"2"}</Tex></> },
    ],
    correct: "A",
    explanation: (
      <>
        Set <Tex>{"t = x + 2y"}</Tex>: <Tex>{"\\ln(1+t) = t - \\tfrac{t^2}{2} + o(t^2)"}</Tex> and{" "}
        <Tex>{"t^2 = x^2 + 4xy + 4y^2"}</Tex>, so <Tex>{"-\\tfrac{t^2}{2}"}</Tex> contributes{" "}
        <Tex>{"-2xy"}</Tex> — answer <strong>A</strong>. Hessian check:{" "}
        <Tex>{"f_{xy} = -2/(1+x+2y)^2 = -2"}</Tex> at the origin, and in{" "}
        <Tex>{"\\tfrac12(f_{xx}x^2 + 2f_{xy}xy + f_{yy}y^2)"}</Tex> the xy coefficient is exactly{" "}
        <Tex>{"f_{xy}"}</Tex>. B forgets the ½ (uses <Tex>{"2f_{xy}"}</Tex>); C expands{" "}
        <Tex>{"(x+2y)^2"}</Tex> with cross term 2xy instead of 4xy; D drops the minus sign of the log
        series.
      </>
    ),
    theory: <>In T₂ the xy coefficient equals f_xy(P₀) — the ½ and the 2 of the mixed term cancel.</>,
  },
  {
    id: "ma2-opt-q18",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        As part of a global-extrema problem you must optimize <Tex>{"f(x,y)"}</Tex> on the segment
        from <Tex>{"(0,0)"}</Tex> to <Tex>{"(3,0)"}</Tex>. The most effective approach is:
      </>
    ),
    options: [
      { id: "A", content: <>Lagrange multipliers with <Tex>{"g(x,y) = y"}</Tex></> },
      { id: "B", content: <>Solve <Tex>{"\\nabla f = 0"}</Tex> restricted to the segment</> },
      { id: "C", content: <>Apply the Hessian test at both endpoints</> },
      { id: "D", content: <>Substitute <Tex>{"y = 0"}</Tex> and study <Tex>{"g(x)=f(x,0)"}</Tex> on <Tex>{"[0,3]"}</Tex>, endpoints included</> },
    ],
    correct: "D",
    explanation: (
      <>
        A segment is the easiest constraint there is: substitution turns the problem into one-variable
        calculus on a closed interval, where endpoint values are checked as a matter of course —
        answer <strong>D</strong>. A “works” for the line but is overkill and still misses the
        endpoints <Tex>{"x=0,3"}</Tex>, which the multiplier condition never flags. B is the{" "}
        <em>unconstrained</em> condition — on a boundary piece the extremum typically has{" "}
        <Tex>{"\\nabla f \\ne 0"}</Tex>. C misuses a tool for interior 2-D critical points on segment
        endpoints, where it means nothing.
      </>
    ),
    theory: <>Graphs and segments: substitute and do 1-D calculus. Save Lagrange for constraints you cannot solve.</>,
  },
];

export const exam: ExamProblem[] = [
  {
    id: "ma2-opt-e1",
    title: "Full critical-point study",
    meta: "Optimization · ~10 pts · classic",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Find all critical points of <Tex>{"f(x,y) = x^3 + y^3 - 3xy"}</Tex> and classify each one
        (local minimum, local maximum, or saddle). Does <Tex>{"f"}</Tex> have global extrema on{" "}
        <Tex>{"\\mathbb{R}^2"}</Tex>?
      </>
    ),
    given: <><Tex>{"f \\in C^\\infty(\\mathbb{R}^2)"}</Tex>, so the Hessian test applies at every critical point.</>,
    steps: [
      {
        title: "Solve ∇f = 0",
        content: (
          <>
            <Tex>{"f_x = 3x^2 - 3y = 0"}</Tex> and <Tex>{"f_y = 3y^2 - 3x = 0"}</Tex>, i.e.{" "}
            <Tex>{"y = x^2"}</Tex> and <Tex>{"x = y^2"}</Tex>. Substituting:{" "}
            <Tex>{"x = x^4 \\Rightarrow x(x^3 - 1) = 0 \\Rightarrow x = 0 \\text{ or } x = 1"}</Tex>{" "}
            (factor — do not divide by x, or you lose the origin). Critical points:{" "}
            <Tex>{"(0,0)"}</Tex> and <Tex>{"(1,1)"}</Tex>.
          </>
        ),
      },
      {
        title: "Build the Hessian",
        content: (
          <>
            <Tex>{"H(x,y) = \\begin{pmatrix} 6x & -3 \\\\ -3 & 6y \\end{pmatrix}"}</Tex>, so{" "}
            <Tex>{"\\det H = 36xy - 9"}</Tex>.
          </>
        ),
      },
      {
        title: "Classify (0,0)",
        content: (
          <>
            <Tex>{"\\det H(0,0) = -9 < 0"}</Tex> ⇒ <strong>saddle point</strong>. (Check by hand:{" "}
            <Tex>{"f(t,t) = 2t^3 - 3t^2 \\approx -3t^2 < 0"}</Tex> near 0, while{" "}
            <Tex>{"f(t,-t) = 3t^2 > 0"}</Tex> — both signs, confirming the saddle.)
          </>
        ),
      },
      {
        title: "Classify (1,1)",
        content: (
          <>
            <Tex>{"\\det H(1,1) = 36 - 9 = 27 > 0"}</Tex> and <Tex>{"f_{xx}(1,1) = 6 > 0"}</Tex> ⇒{" "}
            <strong>local minimum</strong>, with value <Tex>{"f(1,1) = 1 + 1 - 3 = -1"}</Tex>.
          </>
        ),
      },
      {
        title: "Global behavior",
        content: (
          <>
            Along the x-axis <Tex>{"f(x,0) = x^3"}</Tex>, which tends to <Tex>{"-\\infty"}</Tex> and{" "}
            <Tex>{"+\\infty"}</Tex>: f is unbounded in both directions, so there are{" "}
            <strong>no global extrema</strong> — the minimum at <Tex>{"(1,1)"}</Tex> is strictly
            local.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"(0,0)"}</Tex> is a saddle point; <Tex>{"(1,1)"}</Tex> is a local minimum with{" "}
        <Tex>{"f(1,1) = -1"}</Tex>. No global extrema exist on <Tex>{"\\mathbb{R}^2"}</Tex> (f is
        unbounded above and below).
      </>
    ),
    tips: (
      <>
        Marks are most often lost by (1) dividing <Tex>{"x = x^4"}</Tex> by x and losing{" "}
        <Tex>{"(0,0)"}</Tex>, (2) forgetting to state the <em>value</em> at the minimum, and (3)
        upgrading “local” to “global” without an argument — one line about{" "}
        <Tex>{"f(x,0)=x^3"}</Tex> earns that point.
      </>
    ),
  },
  {
    id: "ma2-opt-e2",
    title: "Global extrema on a triangle",
    meta: "Optimization · ~12 pts",
    difficulty: "hard",
    topic: MODULE,
    statement: (
      <>
        Find the global maximum and minimum of <Tex>{"f(x,y) = x^2 + y^2 - xy + x + y"}</Tex> on the
        closed triangle{" "}
        <Tex>{"T = \\{(x,y) : x \\le 0,\\ y \\le 0,\\ x + y \\ge -3\\}"}</Tex>.
      </>
    ),
    given: (
      <>
        T has vertices <Tex>{"(0,0)"}</Tex>, <Tex>{"(-3,0)"}</Tex>, <Tex>{"(0,-3)"}</Tex>; it is
        compact and f is a polynomial, so Weierstrass guarantees both extrema exist.
      </>
    ),
    steps: [
      {
        title: "Interior critical points",
        content: (
          <>
            <Tex>{"\\nabla f = (2x - y + 1,\\ 2y - x + 1) = (0,0)"}</Tex>. Adding the equations:{" "}
            <Tex>{"x + y + 2 = 0"}</Tex>; subtracting: <Tex>{"x = y"}</Tex>. So{" "}
            <Tex>{"x = y = -1"}</Tex>: the point <Tex>{"(-1,-1)"}</Tex>, strictly inside T (both
            coordinates negative, and <Tex>{"x+y = -2 > -3"}</Tex>). Value:{" "}
            <Tex>{"f(-1,-1) = 1 + 1 - 1 - 1 - 1 = -1"}</Tex>.
          </>
        ),
      },
      {
        title: "Edge x = 0, y ∈ [−3, 0]",
        content: (
          <>
            <Tex>{"f(0,y) = y^2 + y"}</Tex>; derivative <Tex>{"2y + 1 = 0"}</Tex> at{" "}
            <Tex>{"y = -\\tfrac12"}</Tex> (inside the range):{" "}
            <Tex>{"f(0,-\\tfrac12) = \\tfrac14 - \\tfrac12 = -\\tfrac14"}</Tex>.
          </>
        ),
      },
      {
        title: "Edge y = 0, x ∈ [−3, 0]",
        content: (
          <>
            By the x ↔ y symmetry of f: minimum <Tex>{"-\\tfrac14"}</Tex> at{" "}
            <Tex>{"(-\\tfrac12, 0)"}</Tex>.
          </>
        ),
      },
      {
        title: "Edge x + y = −3",
        content: (
          <>
            Substitute <Tex>{"y = -3 - x"}</Tex>, <Tex>{"x \\in [-3, 0]"}</Tex>. Watch the signs:{" "}
            <Tex>{"-xy = -x(-3-x) = 3x + x^2"}</Tex> and <Tex>{"x + y = -3"}</Tex>, so{" "}
            <Tex>{"h(x) = x^2 + (9 + 6x + x^2) + (3x + x^2) - 3 = 3x^2 + 9x + 6"}</Tex>.{" "}
            <Tex>{"h'(x) = 6x + 9 = 0"}</Tex> at <Tex>{"x = -\\tfrac32"}</Tex>:{" "}
            <Tex>{"f(-\\tfrac32, -\\tfrac32) = \\tfrac{27}{4} - \\tfrac{27}{2} + 6 = -\\tfrac34"}</Tex>.
          </>
        ),
      },
      {
        title: "Vertices",
        content: (
          <>
            <Tex>{"f(0,0) = 0"}</Tex>; <Tex>{"f(-3,0) = 9 - 3 = 6"}</Tex>;{" "}
            <Tex>{"f(0,-3) = 9 - 3 = 6"}</Tex>.
          </>
        ),
      },
      {
        title: "Compare all candidates",
        content: (
          <>
            Values collected:{" "}
            <Tex>{"-1,\\ -\\tfrac14,\\ -\\tfrac14,\\ -\\tfrac34,\\ 0,\\ 6,\\ 6"}</Tex>. Smallest:{" "}
            <Tex>{"-1"}</Tex> (interior point). Largest: <Tex>{"6"}</Tex> (two vertices).
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        Global minimum <Tex>{"-1"}</Tex> at <Tex>{"(-1,-1)"}</Tex>; global maximum <Tex>{"6"}</Tex>,
        attained at both vertices <Tex>{"(-3,0)"}</Tex> and <Tex>{"(0,-3)"}</Tex>.
      </>
    ),
    tips: (
      <>
        The maximum lives at <em>corners</em> — the single most forgotten candidate type. Note the
        sign discipline on the slanted edge (<Tex>{"-xy"}</Tex> becomes <Tex>{"+3x + x^2"}</Tex>{" "}
        because <Tex>{"y = -3-x"}</Tex> is negative), and that no Hessian is ever needed: global
        problems are decided by comparing values, not by classifying points.
      </>
    ),
  },
  {
    id: "ma2-opt-e3",
    title: "Lagrange multipliers on the unit circle",
    meta: "Constrained optimization · ~10 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Using Lagrange multipliers, find the maximum and minimum of <Tex>{"f(x,y) = xy"}</Tex> on the
        circle <Tex>{"x^2 + y^2 = 1"}</Tex>.
      </>
    ),
    given: (
      <>
        <Tex>{"g(x,y) = x^2 + y^2 - 1"}</Tex>; <Tex>{"\\nabla g = (2x,2y) \\ne (0,0)"}</Tex> on the
        circle, so every constrained extremum satisfies the Lagrange system. The circle is compact ⇒
        max and min exist (Weierstrass).
      </>
    ),
    steps: [
      {
        title: "Write the Lagrange system",
        content: (
          <>
            <Tex>{"y = 2\\lambda x"}</Tex>, <Tex>{"x = 2\\lambda y"}</Tex>,{" "}
            <Tex>{"x^2 + y^2 = 1"}</Tex>.
          </>
        ),
      },
      {
        title: "Case analysis (no blind division)",
        content: (
          <>
            Substituting the first equation into the second:{" "}
            <Tex>{"x = 2\\lambda(2\\lambda x) = 4\\lambda^2 x"}</Tex>. If <Tex>{"x = 0"}</Tex>, the
            first equation forces <Tex>{"y = 0"}</Tex> — impossible on the circle. So{" "}
            <Tex>{"x \\ne 0"}</Tex> and <Tex>{"4\\lambda^2 = 1"}</Tex>:{" "}
            <Tex>{"\\lambda = \\pm\\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "Branch λ = ½",
        content: (
          <>
            <Tex>{"y = x"}</Tex>; the constraint gives <Tex>{"2x^2 = 1"}</Tex>, so{" "}
            <Tex>{"x = \\pm\\tfrac{1}{\\sqrt2}"}</Tex>: points{" "}
            <Tex>{"\\pm\\big(\\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}\\big)"}</Tex>, both with{" "}
            <Tex>{"f = \\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "Branch λ = −½",
        content: (
          <>
            <Tex>{"y = -x"}</Tex>; again <Tex>{"2x^2 = 1"}</Tex>: points{" "}
            <Tex>{"\\pm\\big(\\tfrac{1}{\\sqrt2}, -\\tfrac{1}{\\sqrt2}\\big)"}</Tex>, both with{" "}
            <Tex>{"f = -\\tfrac12"}</Tex>.
          </>
        ),
      },
      {
        title: "Compare values (and cross-check)",
        content: (
          <>
            Four candidates, values <Tex>{"\\pm\\tfrac12"}</Tex>. Since max and min exist, they are{" "}
            <Tex>{"\\tfrac12"}</Tex> and <Tex>{"-\\tfrac12"}</Tex>. Parametric check:{" "}
            <Tex>{"f(\\cos t, \\sin t) = \\cos t \\sin t = \\tfrac12\\sin 2t \\in [-\\tfrac12, \\tfrac12]"}</Tex>. ✓
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        Maximum <Tex>{"\\tfrac12"}</Tex> at{" "}
        <Tex>{"\\big(\\tfrac{1}{\\sqrt2},\\tfrac{1}{\\sqrt2}\\big)"}</Tex> and{" "}
        <Tex>{"\\big(-\\tfrac{1}{\\sqrt2},-\\tfrac{1}{\\sqrt2}\\big)"}</Tex>; minimum{" "}
        <Tex>{"-\\tfrac12"}</Tex> at{" "}
        <Tex>{"\\big(\\tfrac{1}{\\sqrt2},-\\tfrac{1}{\\sqrt2}\\big)"}</Tex> and{" "}
        <Tex>{"\\big(-\\tfrac{1}{\\sqrt2},\\tfrac{1}{\\sqrt2}\\big)"}</Tex>.
      </>
    ),
    tips: (
      <>
        The graded skill here is the <em>case analysis</em>: dividing the two equations by each other
        silently discards <Tex>{"x = 0"}</Tex> or <Tex>{"y = 0"}</Tex> and must be justified. Expect
        four candidate points — a symmetric f on a symmetric constraint rarely gives fewer. λ itself
        is not the answer; report points and values of f.
      </>
    ),
  },
];
