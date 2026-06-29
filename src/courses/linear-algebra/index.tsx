import type { Course } from "../../types";
import { Tex } from "../../lib/math";
import cards from "./linear-algebra-cards.json";
import examProblems from "./linear-algebra-exam.json";

const practice = cards as unknown as Course["practice"];
const exam = examProblems as unknown as Course["exam"];

function SprintMapFigure() {
  const boxes = [
    { x: 24, y: 28, title: "MATLAB", body: "commands + code patterns" },
    { x: 256, y: 28, title: "MCQ", body: "rank, conics, maps, forms" },
    { x: 488, y: 28, title: "Open", body: "basis, image, eigen, proofs" },
  ];

  return (
    <svg viewBox="0 0 720 170" role="img" aria-label="Linear algebra sprint flow" className="w-full">
      <defs>
        <marker id="lag-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--accent)" />
        </marker>
      </defs>
      {boxes.map((box) => (
        <g key={box.title}>
          <rect
            x={box.x}
            y={box.y}
            width="184"
            height="96"
            rx="12"
            fill="var(--accent-soft)"
            stroke="var(--accent-line)"
          />
          <text x={box.x + 18} y={box.y + 38} fill="var(--color-ink)" fontSize="22" fontWeight="700">
            {box.title}
          </text>
          <text x={box.x + 18} y={box.y + 68} fill="var(--color-muted)" fontSize="15">
            {box.body}
          </text>
        </g>
      ))}
      <path d="M208 76 H248" stroke="var(--accent)" strokeWidth="4" markerEnd="url(#lag-arrow)" />
      <path d="M440 76 H480" stroke="var(--accent)" strokeWidth="4" markerEnd="url(#lag-arrow)" />
      <text x="31" y="150" fill="var(--color-faint)" fontSize="14">
        Repeat: answer, read the explanation, redo missed cards until locked in.
      </text>
    </svg>
  );
}

function CommandTable() {
  const rows = [
    ["Vectors", "`[a:h:b]`, `linspace`, `x(r)`, `x(end:-1:1)`", "Build and slice arrays without loops."],
    ["Matrices", "`A(r,c)`, `diag`, `zeros`, `ones`, `eye`, `rand`", "Assemble exam matrices and submatrices."],
    ["Plots", "`plot`, `loglog`, `semilogy`, `hold on`", "Read error behavior on linear/log scales."],
    ["Systems", "`A\\b`, `lu`, `chol`, `qr`, `cond`, `rank`", "Solve, time, and judge stability."],
    ["Eigen/SVD", "`eig`, `eigs`, `svd`, `norm`, `pinv`", "Diagnose power methods and least squares."],
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Area</th>
            <th className="border-b border-[var(--color-line)] p-2">Commands</th>
            <th className="border-b border-[var(--color-line)] p-2">What the exam tests</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([area, commands, use]) => (
            <tr key={area}>
              <td className="border-b border-[var(--color-line)] p-2 font-semibold">{area}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{commands}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-[var(--color-muted)]">{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MethodTable() {
  const rows = [
    ["LU", "`P*A=L*U`", "general square systems", "pivoting and factor reuse"],
    ["Cholesky", "`A=R'*R`", "symmetric positive definite systems", "do not use on merely positive-entry matrices"],
    ["QR", "`A=Q*R`", "least squares and comparisons with LU", "slower than LU for square systems, stable for LS"],
    ["SVD", "`A=U*S*V'`", "rank, conditioning, minimum-norm ideas", "singular values, not eigenvalues of A"],
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Method</th>
            <th className="border-b border-[var(--color-line)] p-2">Form</th>
            <th className="border-b border-[var(--color-line)] p-2">Use when</th>
            <th className="border-b border-[var(--color-line)] p-2">Trap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([method, form, use, trap]) => (
            <tr key={method}>
              <td className="border-b border-[var(--color-line)] p-2 font-semibold">{method}</td>
              <td className="border-b border-[var(--color-line)] p-2 font-mono text-xs">{form}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-[var(--color-muted)]">{use}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-[var(--color-muted)]">{trap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const linearAlgebra: Course = {
  meta: {
    id: "linear-algebra",
    title: "Linear Algebra & Geometry",
    short: "LAG",
    tagline: "A three-day sprint for MATLAB, MCQs and written algebra traps.",
    description:
      "A practice-first Linear Algebra and Geometry course built from the new Algebra/LAG materials. The focus is the immediate exam: MATLAB commands and numerical linear algebra routines, written multiple-choice questions with teaching explanations, and open problems for basis, image, kernel, eigenvalue and least-squares drills.",
    accent: "#2f7dd1",
    accent2: "#24b39b",
    icon: "SquareFunction",
    year: 1,
    semester: 2,
    credits: 10,
    examDate: "2026-07-02",
    syllabus: [
      "MATLAB syntax and plotting",
      "Floating point and cancellation",
      "LU, Cholesky and QR",
      "Least squares",
      "Power and inverse power methods",
      "Eigenvalues and SVD",
      "Written MCQs: maps, rank, conics, quadratic forms",
    ],
    status: "in-progress",
  },

  lessons: [
    {
      id: "lag-sprint-map",
      lecture: "Exam sprint",
      title: "Three-day sprint map",
      summary: "How this course is organized for a near-term LAG exam.",
      minutes: 8,
      objectives: [
        "Separate MATLAB, MCQ and open-question practice.",
        "Know what to drill first when time is short.",
        "Use explanations as compact theory notes.",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <>
              This Linear Algebra course is intentionally sprint-shaped. The exam pressure is not
              to read everything beautifully; it is to become fast at the repeated moves: MATLAB
              indexing and factorizations, written MCQs about rank and geometry, and open questions
              where you compute kernels, images, bases and eigenspaces.
            </>
          ),
        },
        {
          kind: "figure",
          render: () => <SprintMapFigure />,
          caption: "The site mirrors the exam split: MATLAB first, written MCQ repetition second, open problems third.",
        },
        {
          kind: "steps",
          title: "Use this order",
          steps: [
            {
              label: "1",
              content: "Start with the MATLAB sprint topic until command syntax feels automatic.",
            },
            {
              label: "2",
              content: "Drill Written MCQs. Read the explanation even when you guessed correctly.",
            },
            {
              label: "3",
              content: "Move to Exam problems and reproduce the solution on paper or in MATLAB.",
            },
            {
              label: "4",
              content: "Use Due Review for every missed card until it is locked in.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "trap",
          title: "The three big traps",
          content: (
            <>
              Do not confuse display format with accuracy; do not use `inv(A)` when the task wants
              a linear-system solve; and do not call a quadratic form definite just because it is a
              sum of squares. Check whether nonzero vectors make it vanish.
            </>
          ),
        },
        { kind: "checkpoint", question: practice[20] },
      ],
    },
    {
      id: "lag-matlab-toolkit",
      lecture: "MATLAB part",
      title: "MATLAB command toolkit",
      summary: "The commands and syntax patterns that keep reappearing in the lab-style part.",
      minutes: 18,
      objectives: [
        "Read vector and matrix indexing expressions.",
        "Pick the right plotting and formatting command.",
        "Recognize when to use backslash, LU, Cholesky, QR or SVD.",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <>
              The MATLAB part is less about inventing new mathematics and more about translating
              the course methods into correct commands. If the syntax is automatic, the theory has
              room to breathe.
            </>
          ),
        },
        {
          kind: "figure",
          render: () => <CommandTable />,
          caption: "High-yield commands from the MATLAB handbook and Cascavita sessions.",
        },
        {
          kind: "definition",
          term: "Indexed assignment",
          content: (
            <>
              `x(r)=z` changes only the entries selected by the index vector `r`. For matrices,
              `A(rows,columns)` uses the first index for rows and the second for columns. `:` means
              all indices in that dimension.
            </>
          ),
        },
        {
          kind: "callout",
          tone: "key",
          title: "Element-wise operators",
          content: (
            <>
              Use `.*`, `./` and `.^` when the operation must happen component by component. This
              is why plotted functions use expressions such as `x.*sin(1./x)` and `x.^2`.
            </>
          ),
        },
        {
          kind: "formula",
          tex: "A x \\approx b \\quad \\Longrightarrow \\quad x = A \\backslash b",
          caption: (
            <>
              In MATLAB, backslash is the default solve command. It selects a suitable numerical
              method instead of explicitly forming <Tex>{"A^{-1}"}</Tex>.
            </>
          ),
        },
        { kind: "checkpoint", question: practice[12] },
      ],
    },
    {
      id: "lag-numerical-methods",
      lecture: "MATLAB part",
      title: "Numerical linear algebra patterns",
      summary: "Floating-point error, factorization choice, conditioning and eigenvalue iterations.",
      minutes: 22,
      objectives: [
        "Explain cancellation and reformulation.",
        "Choose LU, Cholesky, QR or SVD from the matrix structure.",
        "Diagnose power-method and inverse-power-method behavior.",
      ],
      blocks: [
        {
          kind: "heading",
          text: "Finite arithmetic",
        },
        {
          kind: "definition",
          term: "Normalized floating point",
          content: (
            <>
              A real number is represented as <Tex>{"(-1)^s p N^q"}</Tex>. It is normalized when{" "}
              <Tex>{"N^{-1} \\le p < 1"}</Tex>. The mantissa `p` carries significant digits; the
              exponent `q` carries scale.
            </>
          ),
        },
        {
          kind: "callout",
          tone: "trap",
          title: "Smaller step is not always better",
          content: (
            <>
              In finite differences, reducing `h` lowers truncation error at first, but eventually
              cancellation and rounding dominate. That is why the derivative exercise reformulates
              `sin(x+h)-sin(x)` before dividing by `h`.
            </>
          ),
        },
        {
          kind: "heading",
          text: "Factorizations",
        },
        {
          kind: "figure",
          render: () => <MethodTable />,
          caption: "The fastest way to answer many MATLAB questions is to identify the matrix structure first.",
        },
        {
          kind: "callout",
          tone: "key",
          title: "Power method diagnosis",
          content: (
            <>
              The power method wants a unique dominant eigenvalue. Convergence speed is governed
              by <Tex>{"|\\lambda_2|/|\\lambda_1|"}</Tex>. Shifted inverse power instead targets the
              eigenvalue closest to the shift `p`, unless `A-pI` is singular or the nearest
              eigenvalue is not unique.
            </>
          ),
        },
        { kind: "checkpoint", question: practice[37] },
      ],
    },
    {
      id: "lag-written-mcq-tactics",
      lecture: "Written exam",
      title: "Written MCQ tactics",
      summary: "Recurring traps in the professor-style multiple-choice part.",
      minutes: 20,
      objectives: [
        "Solve rank, kernel and image MCQs quickly.",
        "Classify conics and quadratic forms without overthinking.",
        "Avoid common false implications about definiteness and diagonalization.",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <>
              The written MCQs are short, but they are not shallow. Most wrong options change one
              quantifier or one condition: all values versus some values, positive definite versus
              semidefinite, algebraic multiplicity versus geometric multiplicity.
            </>
          ),
        },
        {
          kind: "steps",
          title: "Fast routine for linear-map MCQs",
          steps: [
            {
              label: "Matrix",
              content: "Write the matrix from the images of basis vectors or from the stated formula.",
            },
            {
              label: "Rank",
              content: "Use rank-nullity for kernel/image questions before doing unnecessary algebra.",
            },
            {
              label: "Eigenspaces",
              content: "For repeated eigenvalues, compare eigenspace dimension with algebraic multiplicity.",
            },
          ],
        },
        {
          kind: "steps",
          title: "Fast routine for geometry MCQs",
          steps: [
            {
              label: "Conics",
              content: "Check whether the equation factors or the complete conic determinant is zero.",
            },
            {
              label: "Lines",
              content: "Direction vectors decide parallel/orthogonal; intersection decides skew/coplanar.",
            },
            {
              label: "Forms",
              content: "A sum of squares is nonnegative, but only positive definite if the common zero set is only the zero vector.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "trap",
          title: "Semidefinite is not definite",
          content: (
            <>
              If a nonzero vector makes a quadratic form equal to zero, positive definite is false
              even if the expression is visibly a sum of squares.
            </>
          ),
        },
        { kind: "checkpoint", question: practice[38] },
      ],
    },
  ],

  practice,
  exam,
};

export default linearAlgebra;
