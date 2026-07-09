import type { ReactNode } from "react";
import type { ExamProblem, Lesson, Question } from "../../../types";
import { Tex } from "../../../lib/math";
import { DivergenceFluxSim } from "../sims/DivergenceFluxSim";

export const MODULE = "Surfaces, flux & the big theorems";

/* ================= Figure: parameter domain → curved patch ================= */
function PatchFigure() {
  // fake 3-D projection of a curved sheet: (u,v) ∈ [0,1]² → screen pixels
  const P = (u: number, v: number): [number, number] => [
    295 + 190 * u + 55 * v - 25 * u * v,
    200 - 30 * u - 105 * v + 22 * Math.sin(Math.PI * u) * (1 - 0.35 * v),
  ];
  const uLine = (v: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const [x, y] = P(i / 20, v);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const vLine = (u: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const [x, y] = P(u, i / 20);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  // point of interest and (approximate) tangent directions on screen
  const [qx, qy] = P(0.55, 0.45);
  const [uax, uay] = P(0.75, 0.45);
  const [ubx, uby] = P(0.35, 0.45);
  const [vax, vay] = P(0.55, 0.65);
  const [vbx, vby] = P(0.55, 0.25);
  const norm = (dx: number, dy: number, L: number): [number, number] => {
    const m = Math.hypot(dx, dy);
    return [(dx / m) * L, (dy / m) * L];
  };
  const [rux, ruy] = norm(uax - ubx, uay - uby, 52);
  const [rvx, rvy] = norm(vax - vbx, vay - vby, 52);
  const head = (x: number, y: number, dx: number, dy: number) => {
    const m = Math.hypot(dx, dy);
    const ux = dx / m;
    const uy = dy / m;
    return `${x},${y} ${x - ux * 8 - uy * 3.2},${y - uy * 8 + ux * 3.2} ${x - ux * 8 + uy * 3.2},${y - uy * 8 - ux * 3.2}`;
  };
  return (
    <svg viewBox="0 0 560 250" className="w-full">
      {/* parameter domain */}
      <rect x={30} y={60} width={140} height={140} fill="var(--color-bg)" stroke="var(--color-muted)" strokeWidth={1.5} rx={2} />
      {[0.25, 0.5, 0.75].map((t) => (
        <g key={t} stroke="var(--color-line)" strokeWidth={1}>
          <line x1={30 + 140 * t} y1={60} x2={30 + 140 * t} y2={200} />
          <line x1={30} y1={60 + 140 * t} x2={170} y2={60 + 140 * t} />
        </g>
      ))}
      <circle cx={30 + 140 * 0.55} cy={200 - 140 * 0.45} r={4} fill="var(--accent)" />
      <text x={30 + 140 * 0.55 + 7} y={200 - 140 * 0.45 - 6} fontSize={11} fill="var(--color-muted)">(u₀, v₀)</text>
      <text x={100} y={222} textAnchor="middle" fontSize={11} fill="var(--color-muted)">parameter domain D (flat)</text>
      <text x={176} y={204} fontSize={11} fill="var(--color-faint)">u</text>
      <text x={22} y={56} fontSize={11} fill="var(--color-faint)">v</text>

      {/* mapping arrow */}
      <line x1={190} y1={130} x2={258} y2={130} stroke="var(--color-muted)" strokeWidth={1.8} />
      <polygon points={head(264, 130, 1, 0)} fill="var(--color-muted)" />
      <text x={226} y={118} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-ink)">r(u, v)</text>

      {/* curved patch: coordinate curves */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t} fill="none" stroke={t === 0 || t === 1 ? "var(--color-muted)" : "var(--color-line)"} strokeWidth={t === 0 || t === 1 ? 1.5 : 1}>
          <polyline points={uLine(t)} />
          <polyline points={vLine(t)} />
        </g>
      ))}

      {/* tangent vectors and normal at the point */}
      <line x1={qx} y1={qy} x2={qx + rux} y2={qy + ruy} stroke="var(--accent)" strokeWidth={2.2} />
      <polygon points={head(qx + rux, qy + ruy, rux, ruy)} fill="var(--accent)" />
      <text x={qx + rux + 6} y={qy + ruy + 4} fontSize={12} fontWeight={600} fill="var(--accent)">rᵤ</text>
      <line x1={qx} y1={qy} x2={qx + rvx} y2={qy + rvy} stroke="var(--accent)" strokeWidth={2.2} />
      <polygon points={head(qx + rvx, qy + rvy, rvx, rvy)} fill="var(--accent)" />
      <text x={qx + rvx + 6} y={qy + rvy} fontSize={12} fontWeight={600} fill="var(--accent)">rᵥ</text>
      <line x1={qx} y1={qy} x2={qx - 14} y2={qy - 62} stroke="var(--color-ink)" strokeWidth={2.2} />
      <polygon points={head(qx - 14, qy - 62, -14, -62)} fill="var(--color-ink)" />
      <text x={qx - 8} y={qy - 66} fontSize={12} fontWeight={700} fill="var(--color-ink)">N = rᵤ × rᵥ</text>
      <circle cx={qx} cy={qy} r={4} fill="var(--accent)" />
      <text x={430} y={232} textAnchor="middle" fontSize={11} fill="var(--color-muted)">the surface S = r(D), with coordinate curves</text>
    </svg>
  );
}

/* ============ Figure: why dS = √(1+fx²+fy²) dA for a graph ============ */
function TiltFigure() {
  return (
    <svg viewBox="0 0 420 200" className="w-full">
      {/* shadow dA on the floor */}
      <line x1={80} y1={160} x2={280} y2={160} stroke="var(--color-muted)" strokeWidth={3.5} strokeLinecap="round" />
      <text x={180} y={180} textAnchor="middle" fontSize={12} fill="var(--color-muted)">shadow dA (in the xy-plane)</text>
      {/* tilted tile dS */}
      <line x1={80} y1={120} x2={280} y2={60} stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
      <text x={110} y={92} fontSize={12} fontWeight={600} fill="var(--accent)">tile dS on the surface</text>
      {/* projectors */}
      <line x1={80} y1={120} x2={80} y2={160} stroke="var(--color-line)" strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={280} y1={60} x2={280} y2={160} stroke="var(--color-line)" strokeWidth={1.2} strokeDasharray="4 4" />
      {/* vertical k and tilted normal n at tile midpoint */}
      <line x1={180} y1={90} x2={180} y2={40} stroke="var(--color-faint)" strokeWidth={1.8} />
      <polygon points="180,34 176.5,44 183.5,44" fill="var(--color-faint)" />
      <text x={186} y={42} fontSize={12} fill="var(--color-faint)">k</text>
      <line x1={180} y1={90} x2={167} y2={47} stroke="var(--color-ink)" strokeWidth={2} />
      <polygon points="165,41 164.5,52 171.5,50" fill="var(--color-ink)" />
      <text x={148} y={48} fontSize={12} fontWeight={600} fill="var(--color-ink)">n</text>
      <text x={188} y={62} fontSize={12} fill="var(--color-ink)">γ</text>
      <path d="M 180 55 A 34 34 0 0 0 171 60" fill="none" stroke="var(--color-ink)" strokeWidth={1.2} />
    </svg>
  );
}

/* ================= Figure: the three big theorems, side by side ============ */
function TheoremTable() {
  const rows: { name: string; eq: ReactNode; edge: string; use: string }[] = [
    {
      name: "Green (plane)",
      eq: <Tex>{"\\oint_{\\partial D} \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_D \\Big(\\tfrac{\\partial Q}{\\partial x} - \\tfrac{\\partial P}{\\partial y}\\Big)\\, dA"}</Tex>,
      edge: "closed plane curve ↔ plane region",
      use: "circulation / area in the plane",
    },
    {
      name: "Gauss (divergence)",
      eq: <Tex>{"\\oiint_{\\partial V} \\mathbf{F}\\cdot\\mathbf{n}\\, dS = \\iiint_V \\operatorname{div}\\mathbf{F}\\, dV"}</Tex>,
      edge: "closed surface ↔ solid inside",
      use: "flux through a closed surface",
    },
    {
      name: "Stokes",
      eq: <Tex>{"\\oint_{\\partial S} \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S \\operatorname{curl}\\mathbf{F}\\cdot\\mathbf{n}\\, dS"}</Tex>,
      edge: "closed space curve ↔ any capping surface",
      use: "circulation of a 3-D loop, or curl flux",
    },
  ];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--color-faint)]">
            <th className="border-b border-[var(--color-line)] p-2">Theorem</th>
            <th className="border-b border-[var(--color-line)] p-2">Statement</th>
            <th className="border-b border-[var(--color-line)] p-2">Boundary pairing</th>
            <th className="border-b border-[var(--color-line)] p-2">Reach for it when</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="border-b border-[var(--color-line)] p-2 text-xs font-semibold text-[var(--color-ink)]">{r.name}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r.eq}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r.edge}</td>
              <td className="border-b border-[var(--color-line)] p-2 text-xs">{r.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================ LESSONS ================================ */

export const lessons: Lesson[] = [
  /* ------------------- 1. Parametric surfaces & the normal ------------------ */
  {
    id: "srf-parametric-surfaces",
    title: "Parametric surfaces & the normal vector",
    lecture: MODULE,
    summary:
      "Two parameters sweep out a surface; the cross product of the tangent vectors hands you the normal — the single object every surface integral is built on.",
    minutes: 20,
    objectives: [
      "Parametrize graphs, spheres, cylinders and paraboloids fluently",
      "Compute the tangent vectors r_u, r_v and the normal N = r_u × r_v",
      "Write the graph normal (−f_x, −f_y, 1) instantly and know which way it points",
      "Check regularity and read orientation off the sign of N",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            A curve needs <strong>one</strong> parameter: <Tex>{"\\mathbf{r}(t)"}</Tex> traces it as{" "}
            <Tex>{"t"}</Tex> runs over an interval. A surface is a two-dimensional object, so it needs{" "}
            <strong>two</strong> parameters: a map <Tex>{"\\mathbf{r}(u,v)"}</Tex> takes a flat region{" "}
            <Tex>{"D"}</Tex> of the <Tex>{"(u,v)"}</Tex>-plane and bends it into space. Everything in
            this module — area, surface integrals, flux, Gauss, Stokes — is computed by pulling the
            problem back to <Tex>{"D"}</Tex> through this map.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Parametric surface",
        content: (
          <>
            A parametric surface is a map{" "}
            <Tex>{"\\mathbf{r}(u,v) = (x(u,v),\\ y(u,v),\\ z(u,v))"}</Tex> defined for{" "}
            <Tex>{"(u,v) \\in D \\subset \\mathbb{R}^2"}</Tex>. Freezing <Tex>{"v"}</Tex> and moving{" "}
            <Tex>{"u"}</Tex> traces a <em>coordinate curve</em> on the surface (and vice versa), so the
            surface carries a curvilinear grid — like meridians and parallels on a globe.
          </>
        ),
      },
      { kind: "heading", text: "Tangent vectors and the normal" },
      {
        kind: "prose",
        content: (
          <p>
            Differentiate along each grid direction: <Tex>{"\\mathbf{r}_u = \\partial\\mathbf{r}/\\partial u"}</Tex>{" "}
            and <Tex>{"\\mathbf{r}_v = \\partial\\mathbf{r}/\\partial v"}</Tex> are two vectors{" "}
            <strong>tangent</strong> to the surface at each point. They span the tangent plane, so
            their cross product is perpendicular to it — that is the normal vector.
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\mathbf{N} = \\mathbf{r}_u \\times \\mathbf{r}_v = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ x_u & y_u & z_u \\\\ x_v & y_v & z_v \\end{vmatrix}",
        tag: "6.1",
        caption: (
          <>
            The normal to the surface. Its <strong>length</strong> <Tex>{"|\\mathbf{N}|"}</Tex> measures
            how much the map stretches area; its <strong>direction</strong> fixes the orientation.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <PatchFigure />,
        caption: (
          <>
            The map <Tex>{"\\mathbf{r}"}</Tex> bends the flat domain into a curved sheet. At each point
            the partial derivatives <Tex>{"\\mathbf{r}_u,\\ \\mathbf{r}_v"}</Tex> are tangent to the grid
            curves, and <Tex>{"\\mathbf{N}=\\mathbf{r}_u\\times\\mathbf{r}_v"}</Tex> sticks out of the surface.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Regular means N ≠ 0",
        content: (
          <>
            The parametrization is <strong>regular</strong> where{" "}
            <Tex>{"\\mathbf{r}_u \\times \\mathbf{r}_v \\ne \\mathbf{0}"}</Tex>: the two tangents are
            genuinely independent and a tangent plane exists. Also note{" "}
            <Tex>{"\\mathbf{r}_v \\times \\mathbf{r}_u = -\\,\\mathbf{r}_u \\times \\mathbf{r}_v"}</Tex>{" "}
            — swapping the order flips the normal, i.e. flips the orientation. Harmless for area,
            fatal for flux.
          </>
        ),
      },
      { kind: "heading", text: "The catalogue you must know cold" },
      {
        kind: "prose",
        content: (
          <p>
            <strong>Graph.</strong> Any surface given as <Tex>{"z = f(x,y)"}</Tex> parametrizes itself:{" "}
            <Tex>{"\\mathbf{r}(x,y) = (x,\\ y,\\ f(x,y))"}</Tex> with <Tex>{"(x,y)"}</Tex> in the shadow
            region. Then <Tex>{"\\mathbf{r}_x = (1,0,f_x)"}</Tex>, <Tex>{"\\mathbf{r}_y = (0,1,f_y)"}</Tex>, and
            the cross product collapses to a formula worth memorizing:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\mathbf{N} = (-f_x,\\ -f_y,\\ 1), \\qquad |\\mathbf{N}| = \\sqrt{1 + f_x^2 + f_y^2}",
        tag: "6.2",
        caption: (
          <>
            The graph normal. The third component is <Tex>{"+1"}</Tex>, so this normal always points{" "}
            <strong>upward</strong> — remember that when an exercise demands the downward one.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            <strong>Sphere</strong> of radius <Tex>{"R"}</Tex>, with colatitude{" "}
            <Tex>{"\\varphi \\in [0,\\pi]"}</Tex> (angle from the north pole) and longitude{" "}
            <Tex>{"\\theta \\in [0,2\\pi]"}</Tex>:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "\\mathbf{r}(\\varphi,\\theta) = (R\\sin\\varphi\\cos\\theta,\\ R\\sin\\varphi\\sin\\theta,\\ R\\cos\\varphi), \\qquad \\mathbf{r}_\\varphi \\times \\mathbf{r}_\\theta = R\\sin\\varphi\\,\\mathbf{r}, \\qquad |\\mathbf{r}_\\varphi \\times \\mathbf{r}_\\theta| = R^2\\sin\\varphi",
        tag: "6.3",
        caption: (
          <>
            The normal is a positive multiple of the position vector <Tex>{"\\mathbf{r}"}</Tex>, so this
            order of parameters points <strong>outward</strong>. The factor <Tex>{"R^2\\sin\\varphi"}</Tex>{" "}
            is exactly the spherical-coordinates area weight.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            <strong>Cylinder</strong> <Tex>{"x^2+y^2=R^2"}</Tex>:{" "}
            <Tex>{"\\mathbf{r}(\\theta,z) = (R\\cos\\theta,\\ R\\sin\\theta,\\ z)"}</Tex>, giving{" "}
            <Tex>{"\\mathbf{r}_\\theta\\times\\mathbf{r}_z = (R\\cos\\theta,\\ R\\sin\\theta,\\ 0)"}</Tex> — the
            outward radial direction, with length <Tex>{"R"}</Tex>, so <Tex>{"dS = R\\,d\\theta\\,dz"}</Tex>.{" "}
            <strong>Paraboloid</strong> <Tex>{"z = x^2+y^2"}</Tex>: it is a graph, so use (6.2) with{" "}
            <Tex>{"f_x = 2x,\\ f_y = 2y"}</Tex>.
          </p>
        ),
      },
      {
        kind: "steps",
        title: "Finding the normal — the routine",
        steps: [
          {
            label: "Parametrize",
            content: (
              <>
                Pick the natural chart: graph <Tex>{"(x,y,f(x,y))"}</Tex>, sphere{" "}
                <Tex>{"(\\varphi,\\theta)"}</Tex>, cylinder <Tex>{"(\\theta,z)"}</Tex>. Write the domain{" "}
                <Tex>{"D"}</Tex> of the parameters explicitly.
              </>
            ),
          },
          {
            label: "Differentiate",
            content: (
              <>
                Compute <Tex>{"\\mathbf{r}_u"}</Tex> and <Tex>{"\\mathbf{r}_v"}</Tex> — each is a vector of
                three partial derivatives.
              </>
            ),
          },
          {
            label: "Cross",
            content: (
              <>
                Expand the determinant (6.1). Simplify with{" "}
                <Tex>{"\\cos^2 + \\sin^2 = 1"}</Tex> where possible.
              </>
            ),
          },
          {
            label: "Check direction & regularity",
            content: (
              <>
                Is <Tex>{"\\mathbf{N} \\ne \\mathbf{0}"}</Tex> on the domain? Does it point the way the
                problem wants (outward / upward)? If not, use <Tex>{"-\\mathbf{N}"}</Tex>.
              </>
            ),
          },
        ],
      },
      {
        kind: "example",
        title: "Worked example — the helicoid",
        content: (
          <>
            <p>
              Take <Tex>{"\\mathbf{r}(u,v) = (u\\cos v,\\ u\\sin v,\\ v)"}</Tex> (a spiral ramp). The
              tangents are <Tex>{"\\mathbf{r}_u = (\\cos v,\\ \\sin v,\\ 0)"}</Tex> and{" "}
              <Tex>{"\\mathbf{r}_v = (-u\\sin v,\\ u\\cos v,\\ 1)"}</Tex>.
            </p>
            <p>
              The determinant (6.1) gives, component by component:{" "}
              <Tex>{"N_1 = \\sin v \\cdot 1 - 0 \\cdot u\\cos v = \\sin v"}</Tex>,{" "}
              <Tex>{"N_2 = -(\\cos v \\cdot 1 - 0) = -\\cos v"}</Tex>,{" "}
              <Tex>{"N_3 = u\\cos^2 v + u\\sin^2 v = u"}</Tex>.
            </p>
            <p>
              So <Tex>{"\\mathbf{N} = (\\sin v,\\ -\\cos v,\\ u)"}</Tex> and{" "}
              <Tex>{"|\\mathbf{N}| = \\sqrt{1+u^2}"}</Tex>. The parametrization is regular everywhere —
              even at <Tex>{"u=0"}</Tex>, where <Tex>{"|\\mathbf{N}|=1"}</Tex>.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-srf-cp1",
          difficulty: "easy",
          prompt: (
            <>
              What is the <strong>upward</strong> normal to the graph <Tex>{"z = x^2 - y^2"}</Tex> at
              the point <Tex>{"(1,\\ 1,\\ 0)"}</Tex>?
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"(2,\\ -2,\\ 1)"}</Tex> },
            { id: "B", content: <Tex>{"(2,\\ 2,\\ 1)"}</Tex> },
            { id: "C", content: <Tex>{"(-2,\\ 2,\\ 1)"}</Tex> },
            { id: "D", content: <Tex>{"(-2,\\ -2,\\ 1)"}</Tex> },
          ],
          correct: "C",
          explanation: (
            <>
              Here <Tex>{"f_x = 2x = 2"}</Tex> and <Tex>{"f_y = -2y = -2"}</Tex>, so{" "}
              <Tex>{"\\mathbf{N} = (-f_x, -f_y, 1) = (-2,\\ 2,\\ 1)"}</Tex> — answer <strong>C</strong>. A
              is <Tex>{"(f_x, f_y, 1)"}</Tex> with the minus signs forgotten; B and D also mis-handle
              the sign of <Tex>{"f_y = -2y"}</Tex>, which is negative at <Tex>{"y=1"}</Tex>.
            </>
          ),
          theory: <>Graph normal: <Tex>{"(-f_x, -f_y, 1)"}</Tex> — minus the gradient, then a 1.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The two classic normal-vector errors",
        content: (
          <>
            (1) Forgetting the minus signs in <Tex>{"(-f_x,-f_y,1)"}</Tex> — check by testing a plane
            you know, e.g. <Tex>{"z = x"}</Tex> tilts toward <Tex>{"-x"}</Tex>-normal{" "}
            <Tex>{"(-1,0,1)"}</Tex>. (2) Computing <Tex>{"\\mathbf{r}_v\\times\\mathbf{r}_u"}</Tex> instead of{" "}
            <Tex>{"\\mathbf{r}_u\\times\\mathbf{r}_v"}</Tex> and silently flipping the orientation. Area
            integrals forgive this; flux integrals change sign.
          </>
        ),
      },
    ],
  },

  /* ---------------- 2. Surface area & scalar surface integrals -------------- */
  {
    id: "srf-surface-integrals",
    title: "Surface area & scalar surface integrals",
    lecture: MODULE,
    summary:
      "dS = |r_u × r_v| du dv converts curved area into a flat double integral — with √(1+f_x²+f_y²) as the graph special case.",
    minutes: 18,
    objectives: [
      "Explain where dS = |r_u × r_v| du dv comes from",
      "Compute areas of spheres, cones and graph pieces",
      "Evaluate scalar surface integrals ∬ g dS via a parametrization",
      "Avoid the double-Jacobian trap when polar coordinates enter",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            How much paint does a curved roof need? Chop the parameter domain into tiny rectangles of
            area <Tex>{"du\\,dv"}</Tex>. The map <Tex>{"\\mathbf{r}"}</Tex> sends each one to a tiny
            parallelogram on the surface spanned by <Tex>{"\\mathbf{r}_u\\,du"}</Tex> and{" "}
            <Tex>{"\\mathbf{r}_v\\,dv"}</Tex> — and the area of a parallelogram spanned by two vectors is
            the length of their cross product. That single sentence is the whole theory:
          </p>
        ),
      },
      {
        kind: "formula",
        tex: "dS = |\\mathbf{r}_u \\times \\mathbf{r}_v|\\, du\\, dv, \\qquad \\text{Area}(S) = \\iint_D |\\mathbf{r}_u \\times \\mathbf{r}_v|\\, du\\, dv",
        tag: "6.4",
        caption: <>Curved area = flat double integral of the stretching factor <Tex>{"|\\mathbf{N}|"}</Tex>.</>,
      },
      {
        kind: "definition",
        term: "Surface integral of a scalar field",
        content: (
          <>
            For a function <Tex>{"g(x,y,z)"}</Tex> defined on the surface (density, temperature, …),{" "}
            <Tex>{"\\iint_S g\\, dS = \\iint_D g(\\mathbf{r}(u,v))\\,|\\mathbf{r}_u\\times\\mathbf{r}_v|\\, du\\, dv"}</Tex>.
            Taking <Tex>{"g \\equiv 1"}</Tex> recovers the area. No orientation is involved —{" "}
            <Tex>{"dS"}</Tex> is always positive.
          </>
        ),
      },
      { kind: "heading", text: "The graph case — a tilt factor" },
      {
        kind: "formula",
        tex: "z = f(x,y): \\qquad dS = \\sqrt{1 + f_x^2 + f_y^2}\\;dx\\,dy",
        tag: "6.5",
        caption: (
          <>
            Immediate from (6.2): <Tex>{"|(-f_x,-f_y,1)| = \\sqrt{1+f_x^2+f_y^2}"}</Tex>. Flat graph{" "}
            (<Tex>{"f_x=f_y=0"}</Tex>) gives factor 1; steep graph gives a large factor.
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <TiltFigure />,
        caption: (
          <>
            A tilted tile is bigger than its shadow: <Tex>{"dA = \\cos\\gamma\\; dS"}</Tex>, where{" "}
            <Tex>{"\\gamma"}</Tex> is the angle between the normal <Tex>{"\\mathbf{n}"}</Tex> and the
            vertical <Tex>{"\\mathbf{k}"}</Tex>. For a graph{" "}
            <Tex>{"\\cos\\gamma = 1/\\sqrt{1+f_x^2+f_y^2}"}</Tex>, so dividing the shadow by{" "}
            <Tex>{"\\cos\\gamma"}</Tex> gives exactly (6.5).
          </>
        ),
      },
      {
        kind: "example",
        title: "Warm-up — the sphere's area, honestly",
        content: (
          <>
            <p>
              With (6.3), <Tex>{"dS = R^2\\sin\\varphi\\, d\\varphi\\, d\\theta"}</Tex>, so{" "}
              <Tex>{"\\text{Area} = \\int_0^{2\\pi}\\!\\!\\int_0^{\\pi} R^2 \\sin\\varphi\\, d\\varphi\\, d\\theta = R^2 \\cdot 2\\pi \\cdot \\big[-\\cos\\varphi\\big]_0^{\\pi} = R^2\\cdot 2\\pi\\cdot 2 = 4\\pi R^2"}</Tex>.
            </p>
            <p>
              The <Tex>{"\\sin\\varphi"}</Tex> is doing real work: parallels near the poles are tiny
              circles, and the weight shrinks their contribution accordingly.
            </p>
          </>
        ),
      },
      {
        kind: "example",
        title: "Graph example — area of a cone",
        content: (
          <>
            <p>
              Find the area of the cone <Tex>{"z = \\sqrt{x^2+y^2}"}</Tex> for{" "}
              <Tex>{"z \\le 1"}</Tex>. Here{" "}
              <Tex>{"f_x = \\dfrac{x}{\\sqrt{x^2+y^2}},\\ f_y = \\dfrac{y}{\\sqrt{x^2+y^2}}"}</Tex>, so{" "}
              <Tex>{"f_x^2 + f_y^2 = \\dfrac{x^2+y^2}{x^2+y^2} = 1"}</Tex> and{" "}
              <Tex>{"dS = \\sqrt{2}\\, dA"}</Tex> — the tilt factor is constant.
            </p>
            <p>
              The shadow is the unit disk (<Tex>{"z\\le 1 \\iff x^2+y^2 \\le 1"}</Tex>), so{" "}
              <Tex>{"\\text{Area} = \\sqrt{2}\\cdot \\pi = \\pi\\sqrt{2}"}</Tex>. Sanity check: the
              classical formula <Tex>{"\\pi r \\ell"}</Tex> with slant height{" "}
              <Tex>{"\\ell = \\sqrt{2}"}</Tex> agrees.
            </p>
          </>
        ),
      },
      {
        kind: "steps",
        title: "Every scalar surface integral, in four moves",
        steps: [
          { label: "Parametrize S", content: <>Choose the chart and write the parameter domain <Tex>{"D"}</Tex> precisely — this is where the condition like <Tex>{"z\\le 1"}</Tex> becomes a bound on the parameters.</> },
          { label: "Compute the stretch", content: <>Find <Tex>{"|\\mathbf{r}_u\\times\\mathbf{r}_v|"}</Tex> — or quote <Tex>{"R^2\\sin\\varphi"}</Tex>, <Tex>{"R"}</Tex> (cylinder), <Tex>{"\\sqrt{1+f_x^2+f_y^2}"}</Tex> (graph).</> },
          { label: "Substitute", content: <>Express the integrand <Tex>{"g"}</Tex> in the parameters: on a sphere <Tex>{"z = R\\cos\\varphi"}</Tex>, on a graph <Tex>{"z = f(x,y)"}</Tex>.</> },
          { label: "Integrate over D", content: <>Now it is an ordinary double integral — use polar coordinates on <Tex>{"D"}</Tex> if the shadow is round (and add the polar <Tex>{"r"}</Tex>!).</> },
        ],
      },
      {
        kind: "example",
        title: "Scalar integral — ∬ z dS over a hemisphere",
        content: (
          <>
            <p>
              Let <Tex>{"S"}</Tex> be the upper hemisphere of radius <Tex>{"R"}</Tex>. With{" "}
              <Tex>{"z = R\\cos\\varphi"}</Tex> and <Tex>{"dS = R^2\\sin\\varphi\\,d\\varphi\\,d\\theta"}</Tex>,{" "}
              <Tex>{"\\varphi \\in [0, \\pi/2]"}</Tex>:
            </p>
            <p>
              <Tex>{"\\iint_S z\\, dS = \\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/2} R\\cos\\varphi \\cdot R^2 \\sin\\varphi \\, d\\varphi\\, d\\theta = 2\\pi R^3 \\Big[\\tfrac{\\sin^2\\varphi}{2}\\Big]_0^{\\pi/2} = \\pi R^3"}</Tex>.
            </p>
            <p>
              Keep this value — it returns as a cross-check in the flux lesson.
            </p>
          </>
        ),
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-srf-cp2",
          difficulty: "easy",
          prompt: (
            <>
              Using <Tex>{"dS = R\\, d\\theta\\, dz"}</Tex>, the lateral area of the cylinder{" "}
              <Tex>{"x^2+y^2=1"}</Tex>, <Tex>{"0 \\le z \\le 2"}</Tex> is:
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"2\\pi"}</Tex> },
            { id: "B", content: <Tex>{"4\\pi"}</Tex> },
            { id: "C", content: <Tex>{"8\\pi"}</Tex> },
            { id: "D", content: <Tex>{"\\pi"}</Tex> },
          ],
          correct: "B",
          explanation: (
            <>
              <Tex>{"\\int_0^{2\\pi}\\!\\!\\int_0^{2} 1 \\cdot dz\\, d\\theta = 2\\pi \\cdot 2 = 4\\pi"}</Tex>{" "}
              (here <Tex>{"R=1"}</Tex>) — answer <strong>B</strong>, matching the classical{" "}
              <Tex>{"2\\pi R h"}</Tex>. A forgets the height factor 2; C doubles it (a{" "}
              <Tex>{"2\\pi R h"}</Tex> with <Tex>{"R=2"}</Tex> confusion); D is the area of neither the
              side nor a cap.
            </>
          ),
          theory: <>Cylinder stretch factor is <Tex>{"R"}</Tex>: lateral area = <Tex>{"2\\pi R h"}</Tex>.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "One Jacobian, not two — but don't drop the polar r",
        content: (
          <>
            <Tex>{"|\\mathbf{r}_u\\times\\mathbf{r}_v|"}</Tex> already <em>is</em> the area factor: on the
            sphere write <Tex>{"R^2\\sin\\varphi\\,d\\varphi\\,d\\theta"}</Tex> and nothing else. But if
            the shadow integral of a <strong>graph</strong> is then evaluated in polar coordinates,
            the polar Jacobian <Tex>{"r"}</Tex> is a genuinely separate, second step:{" "}
            <Tex>{"\\iint \\sqrt{1+f_x^2+f_y^2}\\,dx\\,dy = \\iint \\sqrt{\\cdots}\\; r\\, dr\\, d\\theta"}</Tex>.
            Forgetting that <Tex>{"r"}</Tex> is the single most common lost mark in surface-area
            problems.
          </>
        ),
      },
    ],
  },

  /* ---------------- 3. Flux integrals & the divergence theorem -------------- */
  {
    id: "srf-flux-divergence",
    title: "Flux integrals & the divergence theorem",
    lecture: MODULE,
    summary:
      "Flux counts how much field crosses a surface; Gauss trades that whole computation for one triple integral of div F.",
    minutes: 25,
    objectives: [
      "Set up ∬ F·n dS through a parametrization, with the correct orientation",
      "State the divergence theorem and check its hypotheses",
      "Compute closed-surface fluxes via div F (and verify one directly)",
      "Handle open surfaces by closing them with a disk and subtracting",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            Think of <Tex>{"\\mathbf{F}"}</Tex> as the velocity field of a fluid. Through a small tile of
            area <Tex>{"dS"}</Tex> with unit normal <Tex>{"\\mathbf{n}"}</Tex>, the volume crossing per unit
            time is <Tex>{"\\mathbf{F}\\cdot\\mathbf{n}\\,dS"}</Tex> — only the component <em>along the
            normal</em> carries anything across; the tangential part just slides along the surface.
            Summing over the surface gives the <strong>flux</strong>. Unlike area, flux is{" "}
            <strong>signed</strong>: it needs a chosen side.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Flux of a vector field",
        content: (
          <>
            For an oriented surface <Tex>{"S"}</Tex> with unit normal <Tex>{"\\mathbf{n}"}</Tex>, the flux
            of <Tex>{"\\mathbf{F}"}</Tex> is <Tex>{"\\Phi = \\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\, dS"}</Tex>.
            Reversing the orientation (<Tex>{"\\mathbf{n}\\to-\\mathbf{n}"}</Tex>) changes the sign of{" "}
            <Tex>{"\\Phi"}</Tex>.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\, dS = \\iint_D \\mathbf{F}(\\mathbf{r}(u,v)) \\cdot (\\mathbf{r}_u \\times \\mathbf{r}_v)\\, du\\, dv",
        tag: "6.6",
        caption: (
          <>
            The <Tex>{"|\\mathbf{N}|"}</Tex> in <Tex>{"dS"}</Tex> cancels the normalization of{" "}
            <Tex>{"\\mathbf{n} = \\mathbf{N}/|\\mathbf{N}|"}</Tex> — so in practice you never normalize: dot{" "}
            <Tex>{"\\mathbf{F}"}</Tex> straight into <Tex>{"\\mathbf{r}_u\\times\\mathbf{r}_v"}</Tex>.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "info",
        title: "Orientation conventions",
        content: (
          <>
            For <strong>closed</strong> surfaces (sphere, boundary of a solid) the default is the{" "}
            <strong>outward</strong> normal. For graphs the formula (6.2) gives the{" "}
            <strong>upward</strong> normal. Always check whether your parametrization's{" "}
            <Tex>{"\\mathbf{r}_u\\times\\mathbf{r}_v"}</Tex> agrees with the requested direction — if not,
            flip the final sign.
          </>
        ),
      },
      { kind: "heading", text: "Divergence: the local flux meter" },
      {
        kind: "definition",
        term: "Divergence",
        content: (
          <>
            <Tex>{"\\operatorname{div}\\mathbf{F} = \\nabla\\cdot\\mathbf{F} = \\dfrac{\\partial F_1}{\\partial x} + \\dfrac{\\partial F_2}{\\partial y} + \\dfrac{\\partial F_3}{\\partial z}"}</Tex>{" "}
            — a scalar measuring the net outflow generated per unit volume at each point: positive =
            source, negative = sink, zero = incompressible.
          </>
        ),
      },
      {
        kind: "sim",
        title: "Flux meter — the divergence theorem, live (2-D)",
        render: () => <DivergenceFluxSim />,
        caption: (
          <>
            Two independent computations, one number: the outward flux{" "}
            <Tex>{"\\oint \\mathbf{F}\\cdot\\mathbf{n}\\, ds"}</Tex> through the circle always equals{" "}
            <Tex>{"\\iint \\operatorname{div}\\mathbf{F}\\, dA"}</Tex> inside it. The rotation and shear
            fields cross the circle everywhere, yet their net flux is exactly zero — divergence, not
            field strength, is what flux measures.
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\oiint_{\\partial V} \\mathbf{F}\\cdot\\mathbf{n}\\, dS = \\iiint_V \\operatorname{div}\\mathbf{F}\\, dV \\qquad (\\mathbf{n}\\ \\text{outward},\\ \\mathbf{F}\\in C^1\\ \\text{on all of}\\ V)",
        tag: "6.7",
        caption: (
          <>
            <strong>The divergence (Gauss) theorem.</strong> Total outflow through the closed boundary
            = total source strength inside. It converts a two-sided surface computation into one
            triple integral.
          </>
        ),
      },
      {
        kind: "example",
        title: "The classic — F = (x, y, z) through a sphere, both ways",
        content: (
          <>
            <p>
              <strong>Via Gauss:</strong> <Tex>{"\\operatorname{div}\\mathbf{F} = 1+1+1 = 3"}</Tex>, so the
              flux out of the sphere of radius <Tex>{"R"}</Tex> is{" "}
              <Tex>{"3\\cdot\\text{Vol} = 3\\cdot\\tfrac{4}{3}\\pi R^3 = 4\\pi R^3"}</Tex>.
            </p>
            <p>
              <strong>Directly:</strong> on the sphere the outward unit normal is{" "}
              <Tex>{"\\mathbf{n} = (x,y,z)/R"}</Tex>, so{" "}
              <Tex>{"\\mathbf{F}\\cdot\\mathbf{n} = \\dfrac{x^2+y^2+z^2}{R} = R"}</Tex> — constant! Flux ={" "}
              <Tex>{"R \\cdot 4\\pi R^2 = 4\\pi R^3"}</Tex>. Same answer, and the direct route only
              worked because <Tex>{"\\mathbf{F}\\cdot\\mathbf{n}"}</Tex> happened to be constant. Gauss is
              the general-purpose tool.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Open surfaces: close, apply Gauss, subtract" },
      {
        kind: "steps",
        title: "The closing trick — flux through a hemisphere (no lid)",
        steps: [
          {
            label: "Close the surface",
            content: (
              <>
                Want the flux of <Tex>{"\\mathbf{F}=(x,y,z)"}</Tex> through the open upper hemisphere{" "}
                <Tex>{"S"}</Tex> of radius <Tex>{"R"}</Tex> (outward). Add the disk{" "}
                <Tex>{"S_{disk}:\\ z=0,\\ x^2+y^2\\le R^2"}</Tex> with normal{" "}
                <Tex>{"-\\mathbf{k}"}</Tex> (outward for the half-ball). Now{" "}
                <Tex>{"S \\cup S_{disk}"}</Tex> encloses the solid half-ball <Tex>{"V"}</Tex>.
              </>
            ),
          },
          {
            label: "Gauss on the closed surface",
            content: (
              <>
                <Tex>{"\\Phi_{closed} = \\iiint_V 3\\, dV = 3 \\cdot \\tfrac{2}{3}\\pi R^3 = 2\\pi R^3"}</Tex>.
              </>
            ),
          },
          {
            label: "Flux through the added piece",
            content: (
              <>
                On the disk <Tex>{"z = 0"}</Tex>, so{" "}
                <Tex>{"\\mathbf{F}\\cdot(-\\mathbf{k}) = -z = 0"}</Tex>: the disk contributes nothing here
                (it won't always — see the practice set).
              </>
            ),
          },
          {
            label: "Subtract",
            content: (
              <>
                <Tex>{"\\Phi_{S} = \\Phi_{closed} - \\Phi_{disk} = 2\\pi R^3 - 0 = 2\\pi R^3"}</Tex>. Direct
                check: <Tex>{"\\mathbf{F}\\cdot\\mathbf{n} = R"}</Tex> on the hemisphere, times its area{" "}
                <Tex>{"2\\pi R^2"}</Tex> — again <Tex>{"2\\pi R^3"}</Tex>. ✓
              </>
            ),
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-srf-cp3",
          difficulty: "easy",
          prompt: (
            <>
              The flux of <Tex>{"\\mathbf{F}=(x,y,z)"}</Tex> out of the <strong>unit</strong> sphere is:
            </>
          ),
          options: [
            { id: "A", content: <Tex>{"\\tfrac{4}{3}\\pi"}</Tex> },
            { id: "B", content: <Tex>{"3"}</Tex> },
            { id: "C", content: <Tex>{"12\\pi"}</Tex> },
            { id: "D", content: <Tex>{"4\\pi"}</Tex> },
          ],
          correct: "D",
          explanation: (
            <>
              <Tex>{"\\operatorname{div}\\mathbf{F}=3"}</Tex>, so flux ={" "}
              <Tex>{"3\\cdot\\tfrac{4}{3}\\pi(1)^3 = 4\\pi"}</Tex> — answer <strong>D</strong>. A is the
              bare volume (forgot the factor 3); B is the divergence itself, not its integral; C
              multiplies 3 by the <em>area</em> <Tex>{"4\\pi"}</Tex> instead of the volume.
            </>
          ),
          theory: <>Constant divergence c ⇒ closed-surface flux = c · Volume.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "Gauss has fine print",
        content: (
          <>
            The theorem needs (1) a <strong>closed</strong> surface, (2) the <strong>outward</strong>{" "}
            normal, and (3) <Tex>{"\\mathbf{F}"}</Tex> of class <Tex>{"C^1"}</Tex> on the{" "}
            <strong>whole solid</strong> inside. Point (3) bites: for{" "}
            <Tex>{"\\mathbf{F} = \\mathbf{r}/|\\mathbf{r}|^3"}</Tex> the origin is a singularity, and
            applying Gauss to a ball centered there gives the nonsense{" "}
            <Tex>{"0 = 4\\pi"}</Tex>. Also: divergence is integrated over the <em>solid</em>, where{" "}
            <Tex>{"x^2+y^2+z^2"}</Tex> varies — never evaluate it "on the surface".
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            Gauss pairs a closed <strong>surface</strong> with the solid inside. The last theorem of
            the trio pairs a closed <strong>curve</strong> with any surface it bounds — that is
            Stokes, next.
          </p>
        ),
      },
    ],
  },

  /* ------------------------ 4. Stokes' theorem & curl ----------------------- */
  {
    id: "srf-stokes",
    title: "Stokes' theorem & the curl",
    lecture: MODULE,
    summary:
      "Circulation around a loop equals the flux of curl F through any surface the loop bounds — orientation matched by the right-hand rule.",
    minutes: 22,
    objectives: [
      "Compute curl F from the determinant formula",
      "State Stokes' theorem and match orientations with the right-hand rule",
      "Trade a circulation for a curl-flux (and back) to simplify computations",
      "Choose the right theorem — Green, Gauss or Stokes — at a glance",
    ],
    blocks: [
      {
        kind: "prose",
        content: (
          <p>
            The divergence measures how much a field <em>spreads</em>; the <strong>curl</strong>{" "}
            measures how much it <em>swirls</em>. A tiny paddle wheel placed in the field spins
            fastest when its axis lines up with <Tex>{"\\operatorname{curl}\\mathbf{F}"}</Tex>, and the
            spin rate is proportional to its magnitude. Stokes' theorem then says: the total swirl
            captured by a surface equals the circulation pushed around its rim.
          </p>
        ),
      },
      {
        kind: "definition",
        term: "Curl",
        content: (
          <>
            <Tex>{"\\operatorname{curl}\\mathbf{F} = \\nabla\\times\\mathbf{F}"}</Tex> — a{" "}
            <strong>vector</strong> field, computed from the symbolic determinant below. If{" "}
            <Tex>{"\\operatorname{curl}\\mathbf{F} = \\mathbf{0}"}</Tex> the field is irrotational (and, on
            simply connected domains, conservative).
          </>
        ),
      },
      {
        kind: "formula",
        tex: "\\nabla\\times\\mathbf{F} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ \\partial_x & \\partial_y & \\partial_z \\\\ F_1 & F_2 & F_3 \\end{vmatrix} = \\Big( \\tfrac{\\partial F_3}{\\partial y} - \\tfrac{\\partial F_2}{\\partial z},\\ \\tfrac{\\partial F_1}{\\partial z} - \\tfrac{\\partial F_3}{\\partial x},\\ \\tfrac{\\partial F_2}{\\partial x} - \\tfrac{\\partial F_1}{\\partial y} \\Big)",
        tag: "6.8",
        caption: <>Expand along the top row; each component pairs the two "other" variables.</>,
      },
      {
        kind: "example",
        title: "Quick curl computation",
        content: (
          <>
            <p>
              For <Tex>{"\\mathbf{F} = (y,\\ z,\\ x)"}</Tex>: first component{" "}
              <Tex>{"\\partial_y x - \\partial_z z = 0 - 1 = -1"}</Tex>; second{" "}
              <Tex>{"\\partial_z y - \\partial_x x = 0 - 1 = -1"}</Tex>; third{" "}
              <Tex>{"\\partial_x z - \\partial_y y = 0 - 1 = -1"}</Tex>. So{" "}
              <Tex>{"\\operatorname{curl}\\mathbf{F} = (-1,-1,-1)"}</Tex>: a uniform swirl about the
              direction <Tex>{"(1,1,1)"}</Tex>, with negative sign.
            </p>
          </>
        ),
      },
      { kind: "heading", text: "Stokes' theorem" },
      {
        kind: "formula",
        tex: "\\oint_{\\partial S} \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S \\operatorname{curl}\\mathbf{F}\\cdot\\mathbf{n}\\, dS",
        tag: "6.9",
        caption: (
          <>
            <strong>Stokes.</strong> Circulation around the boundary curve = flux of the curl through
            the surface — <em>any</em> surface with that boundary, as long as orientations match.
          </>
        ),
      },
      {
        kind: "callout",
        tone: "key",
        title: "Orientation: the right-hand rule",
        content: (
          <>
            Curl the fingers of your right hand in the direction the curve is traversed; your thumb
            gives the normal <Tex>{"\\mathbf{n}"}</Tex> the surface must use. Standard case: a curve run{" "}
            <strong>counterclockwise seen from above</strong> pairs with the <strong>upward</strong>{" "}
            normal. Traverse the curve the other way, or flip the normal, and the equation picks up a
            minus sign.
          </>
        ),
      },
      {
        kind: "example",
        title: "Both sides of Stokes, by hand",
        content: (
          <>
            <p>
              Take <Tex>{"\\mathbf{F} = (-y,\\ x,\\ z)"}</Tex> and let <Tex>{"C"}</Tex> be the unit circle{" "}
              <Tex>{"x^2+y^2=1"}</Tex> in the plane <Tex>{"z=0"}</Tex>, counterclockwise from above.
            </p>
            <p>
              <strong>Circulation:</strong> <Tex>{"\\mathbf{r}(t)=(\\cos t, \\sin t, 0)"}</Tex>,{" "}
              <Tex>{"\\mathbf{r}'(t)=(-\\sin t, \\cos t, 0)"}</Tex>, so{" "}
              <Tex>{"\\mathbf{F}\\cdot\\mathbf{r}' = \\sin^2 t + \\cos^2 t = 1"}</Tex> and{" "}
              <Tex>{"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = 2\\pi"}</Tex>.
            </p>
            <p>
              <strong>Curl flux:</strong> by (6.8),{" "}
              <Tex>{"\\operatorname{curl}\\mathbf{F} = (0,\\ 0,\\ 2)"}</Tex>. Cap <Tex>{"C"}</Tex> with the
              flat unit disk, <Tex>{"\\mathbf{n} = \\mathbf{k}"}</Tex>:{" "}
              <Tex>{"\\iint_S 2\\, dS = 2\\pi"}</Tex>. ✓
            </p>
            <p>
              Cap it with the upper unit <em>hemisphere</em> instead:{" "}
              <Tex>{"\\iint 2\\, n_z\\, dS = 2 \\times (\\text{projected area}) = 2\\pi"}</Tex> again —
              the surface truly doesn't matter, only its rim does.
            </p>
          </>
        ),
      },
      {
        kind: "figure",
        render: () => <TheoremTable />,
        caption:
          "The three big theorems are one idea at three dimensions: a boundary integral equals a derivative integrated over the inside. Green is Stokes for flat surfaces.",
      },
      {
        kind: "steps",
        title: "Choosing the theorem in an exam",
        steps: [
          {
            label: "Closed surface, want flux of F?",
            content: <>Gauss: <Tex>{"\\Phi = \\iiint \\operatorname{div}\\mathbf{F}\\, dV"}</Tex>. If the surface is open, close it with a disk and subtract the disk's flux.</>,
          },
          {
            label: "Closed curve in 3-D, want circulation?",
            content: <>Stokes: compute <Tex>{"\\operatorname{curl}\\mathbf{F}"}</Tex>, pick the <em>simplest</em> capping surface (usually a flat disk), match orientation by the right-hand rule.</>,
          },
          {
            label: "Closed curve in the plane?",
            content: <>Green (= flat Stokes): <Tex>{"\\oint P\\,dx + Q\\,dy = \\iint (Q_x - P_y)\\, dA"}</Tex>.</>,
          },
          {
            label: "Curl is messy but the curve is easy?",
            content: <>Use the theorems <em>backwards</em>: a hard curl-flux can be traded for a direct line integral around the rim. The equality runs both ways.</>,
          },
        ],
      },
      {
        kind: "checkpoint",
        question: {
          id: "ma2-srf-cp4",
          difficulty: "easy",
          prompt: (
            <>
              In Stokes' theorem, a surface oriented with the <strong>upward</strong> normal must have
              its boundary traversed:
            </>
          ),
          options: [
            { id: "A", content: "Counterclockwise when viewed from above (right-hand rule)" },
            { id: "B", content: "Clockwise when viewed from above" },
            { id: "C", content: "In either direction — the sign is unaffected" },
            { id: "D", content: "In the direction that makes F·dr positive" },
          ],
          correct: "A",
          explanation: (
            <>
              Right hand: fingers along the curve, thumb along <Tex>{"\\mathbf{n}"}</Tex>. Thumb up ⇒
              fingers curl counterclockwise seen from above — <strong>A</strong>. B pairs with the{" "}
              <em>downward</em> normal; C is false, reversing the curve flips the sign of the
              circulation; D confuses orientation (a geometric convention) with the sign of the
              answer (which the field decides).
            </>
          ),
          theory: <>Upward normal ↔ counterclockwise-from-above boundary; mismatches cost a minus sign.</>,
        },
      },
      {
        kind: "callout",
        tone: "trap",
        title: "The two Stokes traps",
        content: (
          <>
            (1) <strong>Orientation mismatch:</strong> a clockwise-viewed-from-above curve with an
            upward normal silently flips the sign — always state the pairing before computing. (2){" "}
            <strong>Overcomplicating the cap:</strong> if the boundary is a circle, cap it with the
            flat disk, not the paraboloid the problem happened to mention — on a horizontal disk only
            the <Tex>{"\\mathbf{k}"}</Tex>-component of the curl survives the dot product.
          </>
        ),
      },
      {
        kind: "prose",
        content: (
          <p>
            You now hold the complete toolkit: parametrize a surface, weigh it with{" "}
            <Tex>{"|\\mathbf{r}_u\\times\\mathbf{r}_v|"}</Tex>, push flux through it, and — whenever a
            boundary is in sight — swap a hard integral for an easy one with Gauss or Stokes. The
            practice set drills exactly these trades.
          </p>
        ),
      },
    ],
  },
];

/* =============================== PRACTICE ================================ */

export const practice: Question[] = [
  {
    id: "ma2-srf-q1",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>For a graph <Tex>{"z = f(x,y)"}</Tex>, the surface area element is <Tex>{"dS ="}</Tex>:</>,
    options: [
      { id: "A", content: <Tex>{"\\sqrt{1 + f_x + f_y}\\; dx\\, dy"}</Tex> },
      { id: "B", content: <Tex>{"\\sqrt{1 + f_x^2 + f_y^2}\\; dx\\, dy"}</Tex> },
      { id: "C", content: <Tex>{"(1 + f_x^2 + f_y^2)\\; dx\\, dy"}</Tex> },
      { id: "D", content: <Tex>{"\\sqrt{f_x^2 + f_y^2}\\; dx\\, dy"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"dS = |(-f_x,-f_y,1)|\\,dx\\,dy = \\sqrt{1+f_x^2+f_y^2}\\,dx\\,dy"}</Tex> — answer{" "}
        <strong>B</strong>. A uses the derivatives unsquared (dimensionally wrong); C forgets the
        square root; D drops the 1, which would give a flat graph zero area instead of its true
        shadow area.
      </>
    ),
    theory: <>Graph area factor = length of the normal <Tex>{"(-f_x,-f_y,1)"}</Tex>.</>,
  },
  {
    id: "ma2-srf-q2",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The <strong>upward-pointing</strong> normal vector to the graph <Tex>{"z=f(x,y)"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"(-f_x,\\ -f_y,\\ 1)"}</Tex> },
      { id: "B", content: <Tex>{"(f_x,\\ f_y,\\ 1)"}</Tex> },
      { id: "C", content: <Tex>{"(f_x,\\ f_y,\\ -1)"}</Tex> },
      { id: "D", content: <Tex>{"(-f_x,\\ -f_y,\\ -1)"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        Cross <Tex>{"\\mathbf{r}_x=(1,0,f_x)"}</Tex> with <Tex>{"\\mathbf{r}_y=(0,1,f_y)"}</Tex>:{" "}
        <Tex>{"(-f_x,-f_y,1)"}</Tex>, third component positive ⇒ upward — <strong>A</strong>. B forgets
        the minus signs (it is not even perpendicular to the surface in general); C is the{" "}
        <em>downward</em> normal <Tex>{"-(-f_x,-f_y,1)"}</Tex>; D mixes the sign errors of B and C and
        points downward too.
      </>
    ),
    theory: <>Memorize: minus the gradient, then a 1 — <Tex>{"(-\\nabla f, 1)"}</Tex>, always upward.</>,
  },
  {
    id: "ma2-srf-q3",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For the helicoid <Tex>{"\\mathbf{r}(u,v) = (u\\cos v,\\ u\\sin v,\\ v)"}</Tex>, the normal{" "}
        <Tex>{"\\mathbf{r}_u \\times \\mathbf{r}_v"}</Tex> equals:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"(-\\sin v,\\ \\cos v,\\ u)"}</Tex> },
      { id: "B", content: <Tex>{"(\\cos v,\\ \\sin v,\\ 0)"}</Tex> },
      { id: "C", content: <Tex>{"(\\sin v,\\ -\\cos v,\\ u)"}</Tex> },
      { id: "D", content: <Tex>{"(\\sin v,\\ -\\cos v,\\ 1)"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"\\mathbf{r}_u = (\\cos v, \\sin v, 0)"}</Tex>,{" "}
        <Tex>{"\\mathbf{r}_v = (-u\\sin v, u\\cos v, 1)"}</Tex>. The determinant gives{" "}
        <Tex>{"(\\sin v\\cdot 1 - 0,\\ -(\\cos v\\cdot 1 - 0),\\ u\\cos^2 v + u\\sin^2 v) = (\\sin v, -\\cos v, u)"}</Tex>{" "}
        — <strong>C</strong>. A is the sign-flipped <Tex>{"\\mathbf{r}_v\\times\\mathbf{r}_u"}</Tex>; B is
        just the tangent <Tex>{"\\mathbf{r}_u"}</Tex>, not a normal; D forgets that the third component
        is <Tex>{"u"}</Tex>, from <Tex>{"u(\\cos^2 v + \\sin^2 v)"}</Tex>.
      </>
    ),
    theory: <>Cross the tangents in the stated order; simplify with <Tex>{"\\cos^2+\\sin^2=1"}</Tex>.</>,
  },
  {
    id: "ma2-srf-q4",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        For the standard sphere parametrization (radius <Tex>{"R"}</Tex>, colatitude{" "}
        <Tex>{"\\varphi"}</Tex>), <Tex>{"|\\mathbf{r}_\\varphi \\times \\mathbf{r}_\\theta| ="}</Tex>:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"R\\sin\\varphi"}</Tex> },
      { id: "B", content: <Tex>{"R^2"}</Tex> },
      { id: "C", content: <Tex>{"R^2\\cos\\varphi"}</Tex> },
      { id: "D", content: <Tex>{"R^2\\sin\\varphi"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        The cross product is <Tex>{"R\\sin\\varphi\\,\\mathbf{r}"}</Tex> with{" "}
        <Tex>{"|\\mathbf{r}|=R"}</Tex>, so the length is <Tex>{"R^2\\sin\\varphi"}</Tex> —{" "}
        <strong>D</strong>. A is only <Tex>{"|\\mathbf{r}_\\theta|"}</Tex>, the parallel-circle speed; B
        ignores the latitude weight (poles would count like the equator, giving area{" "}
        <Tex>{"2\\pi^2R^2"}</Tex>, wrong); C uses cosine — it would vanish at the equator, where the
        area element is actually largest.
      </>
    ),
    theory: <>Sphere area element: <Tex>{"dS = R^2\\sin\\varphi\\, d\\varphi\\, d\\theta"}</Tex>; integrating it gives <Tex>{"4\\pi R^2"}</Tex>.</>,
  },
  {
    id: "ma2-srf-q5",
    topic: MODULE,
    difficulty: "easy",
    prompt: (
      <>
        The area of the piece of plane <Tex>{"z = 2x + 2y"}</Tex> lying above the unit disk{" "}
        <Tex>{"x^2+y^2\\le 1"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\pi"}</Tex> },
      { id: "B", content: <Tex>{"3\\pi"}</Tex> },
      { id: "C", content: <Tex>{"9\\pi"}</Tex> },
      { id: "D", content: <Tex>{"\\sqrt{5}\\,\\pi"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        <Tex>{"f_x = 2,\\ f_y = 2"}</Tex> so the tilt factor is{" "}
        <Tex>{"\\sqrt{1+4+4} = 3"}</Tex>, constant: Area <Tex>{"= 3 \\times \\pi(1)^2 = 3\\pi"}</Tex> —{" "}
        <strong>B</strong>. A is the flat shadow area with no tilt factor; C uses the factor squared
        (9); D comes from forgetting to square the slopes, <Tex>{"\\sqrt{1+2+2}=\\sqrt5"}</Tex>.
      </>
    ),
    theory: <>For planes the tilt factor is constant: Area = <Tex>{"\\sqrt{1+f_x^2+f_y^2}"}</Tex> × shadow area.</>,
  },
  {
    id: "ma2-srf-q6",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The value of <Tex>{"\\iint_S z^2\\, dS"}</Tex> over the <strong>unit sphere</strong> is:</>,
    options: [
      { id: "A", content: <Tex>{"\\tfrac{4\\pi}{3}"}</Tex> },
      { id: "B", content: <Tex>{"4\\pi"}</Tex> },
      { id: "C", content: <Tex>{"\\tfrac{2\\pi}{3}"}</Tex> },
      { id: "D", content: <Tex>{"0"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        Direct: <Tex>{"z=\\cos\\varphi,\\ dS=\\sin\\varphi\\,d\\varphi\\,d\\theta"}</Tex>, so{" "}
        <Tex>{"\\int_0^{2\\pi}\\!\\int_0^\\pi \\cos^2\\varphi\\sin\\varphi\\, d\\varphi\\, d\\theta = 2\\pi\\cdot\\tfrac{2}{3} = \\tfrac{4\\pi}{3}"}</Tex>{" "}
        — <strong>A</strong>. Slicker: by symmetry{" "}
        <Tex>{"\\iint x^2 = \\iint y^2 = \\iint z^2 = \\tfrac13\\iint(x^2+y^2+z^2)\\,dS = \\tfrac13\\cdot 1\\cdot 4\\pi"}</Tex>.
        B is the bare area <Tex>{"4\\pi"}</Tex> (integrand forgotten); C is the hemisphere value; D
        confuses <Tex>{"z^2"}</Tex> (even, positive) with <Tex>{"z"}</Tex>, whose integral over the full
        sphere <em>is</em> 0.
      </>
    ),
    theory: <>On a sphere use symmetry: <Tex>{"x^2, y^2, z^2"}</Tex> each contribute a third of <Tex>{"\\rho^2 \\cdot \\text{Area}"}</Tex>.</>,
  },
  {
    id: "ma2-srf-q7",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Reversing the orientation of a surface (choosing <Tex>{"-\\mathbf{n}"}</Tex> instead of <Tex>{"\\mathbf{n}"}</Tex>) does what to the flux <Tex>{"\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS"}</Tex>?</>,
    options: [
      { id: "A", content: "Nothing — flux is orientation-independent" },
      { id: "B", content: "Doubles it" },
      { id: "C", content: "Flips its sign" },
      { id: "D", content: "Makes it zero" },
    ],
    correct: "C",
    explanation: (
      <>
        The integrand becomes <Tex>{"\\mathbf{F}\\cdot(-\\mathbf{n}) = -\\mathbf{F}\\cdot\\mathbf{n}"}</Tex>{" "}
        pointwise, so the integral changes sign — <strong>C</strong>. A describes <em>scalar</em>{" "}
        integrals like area, where no normal appears; B has no mechanism; D would require the flux to
        have been zero already.
      </>
    ),
    theory: <>Flux is signed: same surface, opposite side ⇒ opposite sign. Scalar dS-integrals are not.</>,
  },
  {
    id: "ma2-srf-q8",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The outward flux of <Tex>{"\\mathbf{F} = (x,\\ y,\\ z)"}</Tex> through the sphere of radius <Tex>{"R"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"\\tfrac{4}{3}\\pi R^3"}</Tex> },
      { id: "B", content: <Tex>{"4\\pi R^2"}</Tex> },
      { id: "C", content: <Tex>{"3"}</Tex> },
      { id: "D", content: <Tex>{"4\\pi R^3"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        Gauss: <Tex>{"\\operatorname{div}\\mathbf{F}=3"}</Tex>, flux{" "}
        <Tex>{"= 3\\cdot\\tfrac43\\pi R^3 = 4\\pi R^3"}</Tex> — <strong>D</strong>. Direct check:{" "}
        <Tex>{"\\mathbf{F}\\cdot\\mathbf{n} = R"}</Tex> on the sphere, times area{" "}
        <Tex>{"4\\pi R^2"}</Tex>. A is the volume alone (factor 3 dropped); B is the area alone (the{" "}
        <Tex>{"\\mathbf{F}\\cdot\\mathbf{n}=R"}</Tex> factor dropped); C is the divergence, not the flux.
      </>
    ),
    theory: <>For the position field, flux out of any closed surface = 3 × enclosed volume.</>,
  },
  {
    id: "ma2-srf-q9",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>The divergence theorem converts:</>,
    options: [
      { id: "A", content: <>the flux of F through a <strong>closed</strong> surface into the triple integral of div F over the enclosed solid</> },
      { id: "B", content: <>a line integral around a curve into a surface integral of curl F</> },
      { id: "C", content: <>a double integral into two iterated single integrals</> },
      { id: "D", content: <>the flux of F into the circulation of F</> },
    ],
    correct: "A",
    explanation: (
      <>
        Gauss pairs a closed surface with the solid it bounds:{" "}
        <Tex>{"\\oiint \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iiint \\operatorname{div}\\mathbf{F}\\,dV"}</Tex> —{" "}
        <strong>A</strong>. B is Stokes' theorem; C is Fubini's theorem; D relates two quantities no
        single theorem connects directly.
      </>
    ),
    theory: <>Boundary integral of F = interior integral of its derivative — Gauss's version pairs surface ↔ volume.</>,
  },
  {
    id: "ma2-srf-q10",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The divergence of <Tex>{"\\mathbf{F} = (x^2 y,\\ y^2 z,\\ z^2 x)"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"x^2 + y^2 + z^2"}</Tex> },
      { id: "B", content: <Tex>{"2xy + 2yz + 2zx"}</Tex> },
      { id: "C", content: <Tex>{"2x + 2y + 2z"}</Tex> },
      { id: "D", content: <Tex>{"0"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        Differentiate each component by <em>its own</em> variable:{" "}
        <Tex>{"\\partial_x(x^2y) = 2xy"}</Tex>, <Tex>{"\\partial_y(y^2z) = 2yz"}</Tex>,{" "}
        <Tex>{"\\partial_z(z^2x) = 2zx"}</Tex>; sum = <strong>B</strong>. A differentiates each component
        with respect to the <em>wrong</em> variable (<Tex>{"\\partial_y(x^2y)=x^2"}</Tex>, etc.); C
        treats the components as if they were <Tex>{"x^2, y^2, z^2"}</Tex>; D confuses divergence with
        the curl of a gradient.
      </>
    ),
    theory: <>div = <Tex>{"\\partial_x F_1 + \\partial_y F_2 + \\partial_z F_3"}</Tex> — first component to x, second to y, third to z.</>,
  },
  {
    id: "ma2-srf-q11",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        The outward flux of <Tex>{"\\mathbf{F} = (x y^2,\\ y z^2,\\ z x^2)"}</Tex> through the unit
        sphere is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\tfrac{4\\pi}{3}"}</Tex> },
      { id: "B", content: <Tex>{"\\tfrac{12\\pi}{5}"}</Tex> },
      { id: "C", content: <Tex>{"4\\pi"}</Tex> },
      { id: "D", content: <Tex>{"\\tfrac{4\\pi}{5}"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\operatorname{div}\\mathbf{F} = y^2 + z^2 + x^2 = \\rho^2"}</Tex>. Gauss + spherical
        coordinates:{" "}
        <Tex>{"\\iiint \\rho^2\\, dV = \\int_0^{2\\pi}\\!\\int_0^{\\pi}\\!\\int_0^1 \\rho^2\\cdot\\rho^2\\sin\\varphi\\, d\\rho\\, d\\varphi\\, d\\theta = 2\\pi\\cdot 2\\cdot\\tfrac15 = \\tfrac{4\\pi}{5}"}</Tex>{" "}
        — <strong>D</strong>. A pretends div = 1 (giving the volume); B sneaks in a factor 3 as if div
        were <Tex>{"3\\rho^2"}</Tex>; C evaluates <Tex>{"\\rho^2 = 1"}</Tex> <em>on the surface</em> and
        multiplies by the area — but the divergence must be integrated over the solid, where{" "}
        <Tex>{"\\rho"}</Tex> runs from 0 to 1.
      </>
    ),
    theory: <>Non-constant divergence ⇒ genuinely integrate over the solid; <Tex>{"dV = \\rho^2\\sin\\varphi\\, d\\rho\\, d\\varphi\\, d\\theta"}</Tex>.</>,
  },
  {
    id: "ma2-srf-q12",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        Find the flux of <Tex>{"\\mathbf{F} = (x,\\ y,\\ z+1)"}</Tex> through the <strong>open</strong>{" "}
        upper hemisphere <Tex>{"x^2+y^2+z^2=R^2,\\ z\\ge 0"}</Tex>, oriented outward (away from the
        origin).
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"2\\pi R^3"}</Tex> },
      { id: "B", content: <Tex>{"2\\pi R^3 - \\pi R^2"}</Tex> },
      { id: "C", content: <Tex>{"2\\pi R^3 + \\pi R^2"}</Tex> },
      { id: "D", content: <Tex>{"4\\pi R^3 + \\pi R^2"}</Tex> },
    ],
    correct: "C",
    explanation: (
      <>
        Close with the disk <Tex>{"z=0"}</Tex> (normal <Tex>{"-\\mathbf{k}"}</Tex>).{" "}
        <Tex>{"\\operatorname{div}\\mathbf{F}=3"}</Tex>, so the closed flux is{" "}
        <Tex>{"3\\cdot\\tfrac23\\pi R^3 = 2\\pi R^3"}</Tex>. On the disk{" "}
        <Tex>{"\\mathbf{F}\\cdot(-\\mathbf{k}) = -(z+1) = -1"}</Tex>, giving disk flux{" "}
        <Tex>{"-\\pi R^2"}</Tex>. Hemisphere = closed − disk ={" "}
        <Tex>{"2\\pi R^3 + \\pi R^2"}</Tex> — <strong>C</strong>. Direct check:{" "}
        <Tex>{"\\mathbf{F}\\cdot\\mathbf{n} = R + z/R"}</Tex> and{" "}
        <Tex>{"\\iint z\\, dS = \\pi R^3"}</Tex>, so flux{" "}
        <Tex>{"= 2\\pi R^3 + \\pi R^2"}</Tex>. ✓ A ignores the disk entirely; B subtracts the disk flux
        with the wrong sign; D uses the full ball's volume instead of the half-ball.
      </>
    ),
    theory: <>Open surface: flux = (Gauss on the closed-up surface) − (flux through the added lid, outward-oriented).</>,
  },
  {
    id: "ma2-srf-q13",
    topic: MODULE,
    difficulty: "medium",
    prompt: <>The curl of <Tex>{"\\mathbf{F} = (yz,\\ xz,\\ xy)"}</Tex> is:</>,
    options: [
      { id: "A", content: <Tex>{"(x,\\ y,\\ z)"}</Tex> },
      { id: "B", content: <Tex>{"(0,\\ 0,\\ 0)"}</Tex> },
      { id: "C", content: <Tex>{"(2x,\\ 2y,\\ 2z)"}</Tex> },
      { id: "D", content: <Tex>{"(y - z,\\ z - x,\\ x - y)"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        First component: <Tex>{"\\partial_y(xy) - \\partial_z(xz) = x - x = 0"}</Tex>, and the other two
        vanish the same way — <strong>B</strong>. No surprise:{" "}
        <Tex>{"\\mathbf{F} = \\nabla(xyz)"}</Tex> is a gradient, and{" "}
        <Tex>{"\\operatorname{curl}\\nabla\\phi = \\mathbf{0}"}</Tex> always. A, C and D all come from
        pairing the wrong partial derivatives in the determinant (6.8).
      </>
    ),
    theory: <>Spot gradients: if <Tex>{"\\mathbf{F} = \\nabla\\phi"}</Tex>, its curl is zero and every circulation vanishes.</>,
  },
  {
    id: "ma2-srf-q14",
    topic: MODULE,
    difficulty: "easy",
    prompt: <>Stokes' theorem states that:</>,
    options: [
      { id: "A", content: <>the flux of F through a closed surface equals <Tex>{"\\iiint \\operatorname{div}\\mathbf{F}\\, dV"}</Tex></> },
      { id: "B", content: <>the flux of F through S equals the circulation of <Tex>{"\\operatorname{curl}\\mathbf{F}"}</Tex> around <Tex>{"\\partial S"}</Tex></> },
      { id: "C", content: <>the work of F along any curve equals a potential difference</> },
      { id: "D", content: <>the circulation of F around <Tex>{"\\partial S"}</Tex> equals the flux of <Tex>{"\\operatorname{curl}\\mathbf{F}"}</Tex> through S</> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\oint_{\\partial S}\\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S \\operatorname{curl}\\mathbf{F}\\cdot\\mathbf{n}\\, dS"}</Tex>{" "}
        — <strong>D</strong>. A is Gauss's theorem; B swaps the roles of F and its curl (the{" "}
        <em>curl</em> gets the surface, the <em>field</em> gets the curve); C is the fundamental
        theorem for conservative fields, which needs curl F = 0.
      </>
    ),
    theory: <>Stokes: field on the rim, curl on the cap — with right-hand-rule orientations.</>,
  },
  {
    id: "ma2-srf-q15",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        Using Stokes, the circulation of <Tex>{"\\mathbf{F} = (-y,\\ x,\\ 0)"}</Tex> counterclockwise
        (from above) around <Tex>{"x^2+y^2=9,\\ z=0"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"18\\pi"}</Tex> },
      { id: "B", content: <Tex>{"6\\pi"}</Tex> },
      { id: "C", content: <Tex>{"9\\pi"}</Tex> },
      { id: "D", content: <Tex>{"2\\pi"}</Tex> },
    ],
    correct: "A",
    explanation: (
      <>
        <Tex>{"\\operatorname{curl}\\mathbf{F} = (0,0,2)"}</Tex>; through the flat disk of radius 3 with{" "}
        <Tex>{"\\mathbf{n}=\\mathbf{k}"}</Tex>: <Tex>{"2\\times 9\\pi = 18\\pi"}</Tex> — <strong>A</strong>.
        Direct check: <Tex>{"\\mathbf{F}\\cdot\\mathbf{r}' = 9"}</Tex> on the circle, times{" "}
        <Tex>{"2\\pi"}</Tex>. B uses the radius instead of the area (<Tex>{"2\\cdot\\pi\\cdot3"}</Tex>); C
        forgets the curl factor 2; D is the unit-circle answer, ignoring the radius entirely.
      </>
    ),
    theory: <>For constant curl and a flat cap: circulation = (curl · n) × area of the cap.</>,
  },
  {
    id: "ma2-srf-q16",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        <Tex>{"\\operatorname{div}\\mathbf{F} = 0"}</Tex> everywhere in space. <Tex>{"S_1"}</Tex> is the
        paraboloid piece <Tex>{"z = x^2+y^2,\\ z \\le 1"}</Tex> and <Tex>{"S_2"}</Tex> the disk{" "}
        <Tex>{"z=1,\\ x^2+y^2\\le 1"}</Tex>, <strong>both oriented upward</strong>. The fluxes of{" "}
        <Tex>{"\\mathbf{F}"}</Tex> through them satisfy:
      </>
    ),
    options: [
      { id: "A", content: "They are equal only if additionally curl F = 0" },
      { id: "B", content: "They are opposite: Φ₁ = −Φ₂" },
      { id: "C", content: "They are equal: Φ₁ = Φ₂" },
      { id: "D", content: "No relation can be deduced without knowing F" },
    ],
    correct: "C",
    explanation: (
      <>
        <Tex>{"S_1"}</Tex> and <Tex>{"S_2"}</Tex> share the boundary circle and together bound the solid
        between them. Apply Gauss to that solid: total <em>outward</em> flux ={" "}
        <Tex>{"\\iiint 0\\, dV = 0"}</Tex>. Outward means upward on the lid <Tex>{"S_2"}</Tex> and{" "}
        <em>downward</em> on the bowl <Tex>{"S_1"}</Tex>, so{" "}
        <Tex>{"\\Phi_2 - \\Phi_1 = 0"}</Tex>, i.e. <Tex>{"\\Phi_1 = \\Phi_2"}</Tex> — <strong>C</strong>.
        This is why divergence-free fluxes can be computed on the easiest capping surface. A imports
        an irrelevant hypothesis (curl controls circulations, not fluxes); B mistakes the orientation
        bookkeeping — the minus sign is already spent converting "outward" to "upward"; D ignores
        that div F = 0 is exactly the information needed.
      </>
    ),
    theory: <>div F = 0 ⇒ flux depends only on the boundary curve: any two same-boundary, same-orientation surfaces give equal flux.</>,
  },
  {
    id: "ma2-srf-q17",
    topic: MODULE,
    difficulty: "hard",
    prompt: (
      <>
        <Tex>{"\\mathbf{F} = (-y,\\ x,\\ z)"}</Tex>. The circulation around the circle{" "}
        <Tex>{"x^2+y^2=4,\\ z=0"}</Tex> traversed <strong>clockwise when viewed from above</strong>{" "}
        is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"8\\pi"}</Tex> },
      { id: "B", content: <Tex>{"0"}</Tex> },
      { id: "C", content: <Tex>{"-4\\pi"}</Tex> },
      { id: "D", content: <Tex>{"-8\\pi"}</Tex> },
    ],
    correct: "D",
    explanation: (
      <>
        <Tex>{"\\operatorname{curl}\\mathbf{F} = (0,0,2)"}</Tex>; counterclockwise-from-above the
        circulation would be <Tex>{"2\\times 4\\pi = 8\\pi"}</Tex>. Clockwise is the opposite
        orientation, so the answer flips sign: <Tex>{"-8\\pi"}</Tex> — <strong>D</strong>. A ignores the
        stated direction (the exam's favorite trap); B would need curl F = 0, but this field swirls;
        C halves the magnitude for no reason — the area of the disk is <Tex>{"4\\pi"}</Tex>, not{" "}
        <Tex>{"2\\pi"}</Tex>.
      </>
    ),
    theory: <>Clockwise-from-above pairs with the downward normal: same magnitude, opposite sign.</>,
  },
  {
    id: "ma2-srf-q18",
    topic: MODULE,
    difficulty: "medium",
    prompt: (
      <>
        In the plane (as in the simulation), the outward flux of <Tex>{"\\mathbf{F} = (x,\\ y)"}</Tex>{" "}
        through the circle of radius <Tex>{"R"}</Tex> is:
      </>
    ),
    options: [
      { id: "A", content: <Tex>{"\\pi R^2"}</Tex> },
      { id: "B", content: <Tex>{"2\\pi R^2"}</Tex> },
      { id: "C", content: <Tex>{"4\\pi R"}</Tex> },
      { id: "D", content: <Tex>{"0"}</Tex> },
    ],
    correct: "B",
    explanation: (
      <>
        2-D divergence theorem: <Tex>{"\\operatorname{div}\\mathbf{F} = 1+1 = 2"}</Tex>, so flux ={" "}
        <Tex>{"2\\times\\pi R^2 = 2\\pi R^2"}</Tex> — <strong>B</strong>. Direct check: on the circle{" "}
        <Tex>{"\\mathbf{F}\\cdot\\mathbf{n} = R"}</Tex>, times circumference <Tex>{"2\\pi R"}</Tex>. A
        forgets that div = 2, not 1; C reasons with the perimeter instead of the area; D is the
        answer for the rotation field <Tex>{"(-y,x)"}</Tex>, which only slides along the circle.
      </>
    ),
    theory: <>Flux through a closed curve = ∬ div F dA — it scales with enclosed area, like R².</>,
  },
];

/* ================================= EXAM ================================== */

export const exam: ExamProblem[] = [
  {
    id: "ma2-srf-e1",
    title: "Closed-surface flux via the divergence theorem",
    meta: "Gauss · ~10 pts · Winter session style",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Compute the outward flux of{" "}
        <Tex>{"\\mathbf{F}(x,y,z) = (x^3 + y,\\ y^3 + z,\\ z^3 + x)"}</Tex> through the unit sphere{" "}
        <Tex>{"x^2+y^2+z^2 = 1"}</Tex>.
      </>
    ),
    given: (
      <>
        <Tex>{"S = \\{x^2+y^2+z^2=1\\}"}</Tex> with outward normal; spherical volume element{" "}
        <Tex>{"dV = \\rho^2\\sin\\varphi\\, d\\rho\\, d\\varphi\\, d\\theta"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "Check that Gauss applies",
        content: (
          <>
            <Tex>{"S"}</Tex> is closed (it bounds the unit ball <Tex>{"V"}</Tex>) and{" "}
            <Tex>{"\\mathbf{F}"}</Tex> is a polynomial, hence <Tex>{"C^1"}</Tex> everywhere. So{" "}
            <Tex>{"\\Phi = \\iiint_V \\operatorname{div}\\mathbf{F}\\, dV"}</Tex>. A direct parametrization
            of <Tex>{"\\mathbf{F}\\cdot\\mathbf{n}"}</Tex> would be a page of trigonometry — this is a
            Gauss problem.
          </>
        ),
      },
      {
        title: "Compute the divergence",
        content: (
          <>
            <Tex>{"\\partial_x(x^3+y) = 3x^2"}</Tex>, <Tex>{"\\partial_y(y^3+z) = 3y^2"}</Tex>,{" "}
            <Tex>{"\\partial_z(z^3+x) = 3z^2"}</Tex>. The cross terms <Tex>{"y, z, x"}</Tex> die (each is
            differentiated with respect to a different variable), leaving{" "}
            <Tex>{"\\operatorname{div}\\mathbf{F} = 3(x^2+y^2+z^2) = 3\\rho^2"}</Tex>.
          </>
        ),
      },
      {
        title: "Set up in spherical coordinates",
        content: (
          <>
            The divergence is radial, so spherical coordinates factor completely:{" "}
            <Tex>{"\\Phi = \\iiint_V 3\\rho^2\\, dV = 3\\int_0^{2\\pi}\\! d\\theta \\int_0^{\\pi}\\! \\sin\\varphi\\, d\\varphi \\int_0^{1} \\rho^2\\cdot\\rho^2\\, d\\rho"}</Tex>.
            Note the integrand becomes <Tex>{"\\rho^4"}</Tex>: <Tex>{"\\rho^2"}</Tex> from the divergence
            and <Tex>{"\\rho^2"}</Tex> from the volume element.
          </>
        ),
      },
      {
        title: "Evaluate the three factors",
        content: (
          <>
            <Tex>{"\\int_0^{2\\pi} d\\theta = 2\\pi"}</Tex>;{" "}
            <Tex>{"\\int_0^{\\pi}\\sin\\varphi\\, d\\varphi = [-\\cos\\varphi]_0^{\\pi} = 2"}</Tex>;{" "}
            <Tex>{"\\int_0^1 \\rho^4 d\\rho = \\tfrac15"}</Tex>. Hence{" "}
            <Tex>{"\\Phi = 3 \\cdot 2\\pi \\cdot 2 \\cdot \\tfrac15 = \\tfrac{12\\pi}{5}"}</Tex>.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"\\Phi = \\dfrac{12\\pi}{5} \\approx 7.54"}</Tex>
      </>
    ),
    tips: (
      <>
        The classic lost mark: evaluating <Tex>{"3\\rho^2"}</Tex> on the surface (<Tex>{"\\rho=1"}</Tex>{" "}
        ⇒ "div = 3") and answering <Tex>{"3\\cdot\\tfrac43\\pi = 4\\pi"}</Tex>. The divergence lives on
        the <em>solid</em>, where <Tex>{"\\rho"}</Tex> varies. Second trap: forgetting the{" "}
        <Tex>{"\\rho^2\\sin\\varphi"}</Tex> in <Tex>{"dV"}</Tex>.
      </>
    ),
  },
  {
    id: "ma2-srf-e2",
    title: "Circulation two ways — Stokes' theorem verified",
    meta: "Stokes · ~10 pts · Summer session style",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Let <Tex>{"\\mathbf{F}(x,y,z) = (-y,\\ x,\\ xz)"}</Tex> and let <Tex>{"C"}</Tex> be the circle{" "}
        <Tex>{"x^2+y^2 = 4"}</Tex> in the plane <Tex>{"z = 1"}</Tex>, traversed counterclockwise when
        viewed from above. Compute <Tex>{"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r}"}</Tex> with Stokes'
        theorem, then verify by direct parametrization.
      </>
    ),
    given: (
      <>
        Curve parametrization: <Tex>{"\\mathbf{r}(t) = (2\\cos t,\\ 2\\sin t,\\ 1),\\ t \\in [0, 2\\pi]"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "Compute the curl",
        content: (
          <>
            By the determinant formula:{" "}
            <Tex>{"\\operatorname{curl}\\mathbf{F} = \\big(\\partial_y(xz) - \\partial_z(x),\\ \\partial_z(-y) - \\partial_x(xz),\\ \\partial_x(x) - \\partial_y(-y)\\big) = (0,\\ -z,\\ 2)"}</Tex>.
          </>
        ),
      },
      {
        title: "Choose the cap and match orientation",
        content: (
          <>
            The simplest surface bounded by <Tex>{"C"}</Tex> is the flat disk{" "}
            <Tex>{"x^2+y^2\\le 4,\\ z=1"}</Tex>. Counterclockwise-from-above pairs with the{" "}
            <strong>upward</strong> normal <Tex>{"\\mathbf{n}=\\mathbf{k}"}</Tex> (right-hand rule).
          </>
        ),
      },
      {
        title: "Flux of the curl through the disk",
        content: (
          <>
            <Tex>{"\\operatorname{curl}\\mathbf{F}\\cdot\\mathbf{k} = 2"}</Tex> — the awkward{" "}
            <Tex>{"-z"}</Tex> component is annihilated by the flat horizontal cap. So{" "}
            <Tex>{"\\iint_S \\operatorname{curl}\\mathbf{F}\\cdot\\mathbf{n}\\, dS = 2\\times\\text{area} = 2\\cdot 4\\pi = 8\\pi"}</Tex>.
          </>
        ),
      },
      {
        title: "Verify directly on the curve",
        content: (
          <>
            <Tex>{"\\mathbf{r}'(t) = (-2\\sin t,\\ 2\\cos t,\\ 0)"}</Tex> and on the curve{" "}
            <Tex>{"\\mathbf{F} = (-2\\sin t,\\ 2\\cos t,\\ 2\\cos t)"}</Tex>. Then{" "}
            <Tex>{"\\mathbf{F}\\cdot\\mathbf{r}' = 4\\sin^2 t + 4\\cos^2 t + 0 = 4"}</Tex>, so{" "}
            <Tex>{"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = \\int_0^{2\\pi} 4\\, dt = 8\\pi"}</Tex>. The two
            routes agree. ✓
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = 8\\pi"}</Tex> (both by Stokes and directly)
      </>
    ),
    tips: (
      <>
        On a flat horizontal cap only the <Tex>{"\\mathbf{k}"}</Tex>-component of the curl survives —
        compute the full curl anyway, then let the dot product kill the rest. State the
        orientation pairing <em>before</em> integrating: examiners deduct for a correct magnitude
        with an unjustified sign.
      </>
    ),
  },
  {
    id: "ma2-srf-e3",
    title: "Area of a paraboloid cap",
    meta: "Surface area · ~8 pts",
    difficulty: "medium",
    topic: MODULE,
    statement: (
      <>
        Compute the area of the piece of paraboloid <Tex>{"z = x^2 + y^2"}</Tex> with{" "}
        <Tex>{"z \\le 1"}</Tex>.
      </>
    ),
    given: (
      <>
        Graph area element: <Tex>{"dS = \\sqrt{1+f_x^2+f_y^2}\\; dx\\, dy"}</Tex>.
      </>
    ),
    steps: [
      {
        title: "Identify the shadow region",
        content: (
          <>
            <Tex>{"z \\le 1"}</Tex> means <Tex>{"x^2+y^2 \\le 1"}</Tex>: the shadow{" "}
            <Tex>{"D"}</Tex> is the unit disk. With <Tex>{"f_x = 2x,\\ f_y = 2y"}</Tex>:{" "}
            <Tex>{"dS = \\sqrt{1+4x^2+4y^2}\\, dA"}</Tex>.
          </>
        ),
      },
      {
        title: "Pass to polar coordinates",
        content: (
          <>
            The disk and the integrand are radial, so{" "}
            <Tex>{"\\text{Area} = \\int_0^{2\\pi}\\!\\!\\int_0^1 \\sqrt{1+4r^2}\\; r\\, dr\\, d\\theta"}</Tex>{" "}
            — note the <strong>extra factor <Tex>{"r"}</Tex></strong> from the polar area element,
            on top of the surface factor.
          </>
        ),
      },
      {
        title: "Substitute u = 1 + 4r²",
        content: (
          <>
            <Tex>{"du = 8r\\, dr"}</Tex>, limits <Tex>{"r=0 \\to u=1"}</Tex>, <Tex>{"r=1 \\to u=5"}</Tex>:{" "}
            <Tex>{"\\int_0^1 r\\sqrt{1+4r^2}\\, dr = \\tfrac18\\int_1^5 \\sqrt{u}\\, du = \\tfrac18\\cdot\\tfrac23\\big[u^{3/2}\\big]_1^5 = \\tfrac{1}{12}(5\\sqrt5 - 1)"}</Tex>.
          </>
        ),
      },
      {
        title: "Multiply by the angular factor",
        content: (
          <>
            <Tex>{"\\text{Area} = 2\\pi \\cdot \\tfrac{1}{12}(5\\sqrt5 - 1) = \\tfrac{\\pi}{6}(5\\sqrt5 - 1) \\approx 5.33"}</Tex>.
            Sanity check: it exceeds the shadow's area <Tex>{"\\pi \\approx 3.14"}</Tex>, as any tilted
            surface must.
          </>
        ),
      },
    ],
    finalAnswer: (
      <>
        <Tex>{"\\text{Area} = \\dfrac{\\pi}{6}\\big(5\\sqrt{5} - 1\\big) \\approx 5.33"}</Tex>
      </>
    ),
    tips: (
      <>
        Two separate Jacobians appear: the surface factor <Tex>{"\\sqrt{1+4r^2}"}</Tex> and the polar{" "}
        <Tex>{"r"}</Tex>. Dropping the <Tex>{"r"}</Tex> makes the substitution impossible and is the
        most common zero on this problem. Always end with the sanity check: curved area must be
        larger than its shadow.
      </>
    ),
  },
];
