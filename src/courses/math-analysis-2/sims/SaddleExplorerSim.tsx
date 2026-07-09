import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Quadratic-form explorer:   z = a·x² + 2b·xy + c·y²
 *
 * This is exactly the model surface that the second-order Taylor
 * expansion builds at a critical point. Its Hessian is CONSTANT:
 *
 *     H = [ 2a  2b ]        det H = 4(ac − b²),   tr H = 2(a + c)
 *         [ 2b  2c ]
 *
 * Eigenvalues of H:  λ₁,₂ = (a + c) ± √((a − c)² + 4b²).
 *
 * Verdict at the origin (the only critical point):
 *   det H > 0, 2a > 0  →  minimum      (positive definite)
 *   det H > 0, 2a < 0  →  maximum      (negative definite)
 *   det H < 0          →  saddle       (indefinite)
 *   det H = 0          →  degenerate   (test is silent)
 *
 * Contours are computed for real with marching squares on a 60×60
 * grid over [−1.5, 1.5]². For a saddle the dashed zero set z = 0 is
 * the pair of lines separating the up-hill and down-hill sectors.
 * ------------------------------------------------------------------ */

const W = 360; // svg is W × W
const R = 1.5; // math window [-R, R]²
const N = 60; // marching-squares cells per side
const EPS = 1e-9;

/* Marching squares: returns an SVG path ("M x y L x y ...") tracing the
 * level set {q = level}. vals holds (N+1)² samples, index i + j*(N+1),
 * where grid (i, j) is the math point (-R + 2R·i/N, -R + 2R·j/N). */
function contourPath(vals: number[], level: number): string {
  const n1 = N + 1;
  let d = "";
  // fractional grid coords → svg pixels (y flipped)
  const P = (gi: number, gj: number) =>
    `${((gi / N) * W).toFixed(1)} ${(W - (gj / N) * W).toFixed(1)}`;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const v00 = vals[i + j * n1] - level;
      const v10 = vals[i + 1 + j * n1] - level;
      const v01 = vals[i + (j + 1) * n1] - level;
      const v11 = vals[i + 1 + (j + 1) * n1] - level;
      let code = 0;
      if (v00 > 0) code |= 1;
      if (v10 > 0) code |= 2;
      if (v11 > 0) code |= 4;
      if (v01 > 0) code |= 8;
      if (code === 0 || code === 15) continue;
      // linear-interpolated crossing points on the four cell edges
      const eB: [number, number] = [i + v00 / (v00 - v10), j];
      const eR: [number, number] = [i + 1, j + v10 / (v10 - v11)];
      const eT: [number, number] = [i + v01 / (v01 - v11), j + 1];
      const eL: [number, number] = [i, j + v00 / (v00 - v01)];
      const seg = (p: [number, number], q: [number, number]) => {
        d += `M${P(p[0], p[1])} L${P(q[0], q[1])} `;
      };
      switch (code) {
        case 1:
        case 14:
          seg(eL, eB);
          break;
        case 2:
        case 13:
          seg(eB, eR);
          break;
        case 3:
        case 12:
          seg(eL, eR);
          break;
        case 4:
        case 11:
          seg(eR, eT);
          break;
        case 6:
        case 9:
          seg(eB, eT);
          break;
        case 7:
        case 8:
          seg(eL, eT);
          break;
        case 5: {
          // ambiguous: disambiguate with the cell-center value
          if ((v00 + v10 + v01 + v11) / 4 > 0) {
            seg(eL, eT);
            seg(eB, eR);
          } else {
            seg(eL, eB);
            seg(eR, eT);
          }
          break;
        }
        case 10: {
          if ((v00 + v10 + v01 + v11) / 4 > 0) {
            seg(eL, eB);
            seg(eR, eT);
          } else {
            seg(eL, eT);
            seg(eB, eR);
          }
          break;
        }
      }
    }
  }
  return d;
}

const PRESETS: { label: string; a: number; b: number; c: number }[] = [
  { label: "Bowl (min)", a: 1, b: 0, c: 1 },
  { label: "Dome (max)", a: -1, b: 0, c: -1 },
  { label: "Saddle 2xy", a: 0, b: 1, c: 0 },
  { label: "Valley (x+y)²", a: 1, b: 1, c: 1 },
];

export function SaddleExplorerSim() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0.5);
  const [c, setC] = useState(-1);

  // ---- Hessian data (H = [[2a,2b],[2b,2c]]) — all derived, never faked
  const detA = a * c - b * b;
  const detH = 4 * detA;
  const trH = 2 * (a + c);
  const disc = Math.sqrt((a - c) * (a - c) + 4 * b * b);
  const l1 = a + c + disc; // eigenvalues of H
  const l2 = a + c - disc;

  let verdict: string;
  let verdictColor: string;
  let detail: string;
  if (Math.abs(detA) < EPS) {
    verdict = "Degenerate";
    verdictColor = "var(--warn)";
    detail =
      "det H = 0: one eigenvalue vanishes, the surface is flat along one direction (dashed line). The second-order test is silent — higher-order terms decide.";
  } else if (detA > 0 && a > 0) {
    verdict = "Minimum";
    verdictColor = "var(--good)";
    detail =
      "det H > 0 and z_xx = 2a > 0: positive definite. Contours are nested ellipses and z grows in every direction — a bowl.";
  } else if (detA > 0) {
    verdict = "Maximum";
    verdictColor = "var(--bad)";
    detail =
      "det H > 0 and z_xx = 2a < 0: negative definite. Same ellipses, but z drops in every direction — a dome.";
  } else {
    verdict = "Saddle";
    verdictColor = "var(--warn)";
    detail =
      "det H < 0: eigenvalues of opposite sign. The dashed zero set splits the plane into sectors where z > 0 and z < 0 — up in some directions, down in others.";
  }

  // ---- contours via marching squares (memoized per coefficient triple)
  const { posD, negD, zeroD } = useMemo(() => {
    const n1 = N + 1;
    const vals = new Array<number>(n1 * n1);
    let maxAbs = 0;
    for (let j = 0; j < n1; j++) {
      const y = -R + (2 * R * j) / N;
      for (let i = 0; i < n1; i++) {
        const x = -R + (2 * R * i) / N;
        const q = a * x * x + 2 * b * x * y + c * y * y;
        vals[i + j * n1] = q;
        const aq = Math.abs(q);
        if (aq > maxAbs) maxAbs = aq;
      }
    }
    let pos = "";
    let neg = "";
    let zero = "";
    if (maxAbs > EPS) {
      for (const fr of [0.12, 0.32, 0.6, 0.92]) {
        pos += contourPath(vals, fr * maxAbs);
        neg += contourPath(vals, -fr * maxAbs);
      }
      // the zero set is a curve only when the form is not definite
      if (a * c - b * b < EPS) zero = contourPath(vals, 0);
    }
    return { posD: pos, negD: neg, zeroD: zero };
  }, [a, b, c]);

  const sgn = (v: number) => (v < 0 ? "− " : "+ ");
  const formStr = `z = ${a.toFixed(1)}x² ${sgn(2 * b)}${Math.abs(2 * b).toFixed(1)}xy ${sgn(c)}${Math.abs(c).toFixed(1)}y²`;
  const mid = W / 2;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* presets */}
        <div className="mb-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <SimButton
              key={p.label}
              active={a === p.a && b === p.b && c === p.c}
              onClick={() => {
                setA(p.a);
                setB(p.b);
                setC(p.c);
              }}
            >
              {p.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${W}`} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          {/* axes */}
          <line x1={0} y1={mid} x2={W} y2={mid} stroke="var(--color-line)" strokeWidth={1} />
          <line x1={mid} y1={0} x2={mid} y2={W} stroke="var(--color-line)" strokeWidth={1} />

          {/* contours: accent = z > 0, info = z < 0, dashed = zero set */}
          <path d={posD} fill="none" stroke="var(--accent)" strokeWidth={1.6} />
          <path d={negD} fill="none" stroke="var(--info)" strokeWidth={1.6} />
          <path d={zeroD} fill="none" stroke="var(--color-muted)" strokeWidth={1.6} strokeDasharray="6 4" />

          {/* the critical point */}
          <circle cx={mid} cy={mid} r={4.5} fill="var(--color-bg)" stroke={verdictColor} strokeWidth={2.5} />
          <text x={mid + 9} y={mid - 8} fontSize={11} fontWeight={700} fill="var(--color-ink)">
            (0,0)
          </text>

          {/* legend */}
          <text x={8} y={16} fontSize={10} fill="var(--accent)">
            {"z > 0"}
          </text>
          <text x={W - 8} y={16} textAnchor="end" fontSize={10} fill="var(--info)">
            {"z < 0"}
          </text>
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          Level curves of the model surface, recomputed live (marching squares). Ellipses mean a
          definite form (bowl or dome); hyperbolas mean a saddle; parallel lines mean a degenerate
          valley or ridge.
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider label="a (coefficient of x²)" value={a} min={-2} max={2} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="b (xy coefficient is 2b)" value={b} min={-2} max={2} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="c (coefficient of y²)" value={c} min={-2} max={2} step={0.1} onChange={setC} format={(v) => v.toFixed(1)} />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <Readout label="Surface" value={formStr} />
          <ReadoutRow>
            <Readout
              label="det H = 4(ac−b²)"
              value={detH.toFixed(2)}
              tone={detA > EPS ? "good" : detA < -EPS ? "bad" : "default"}
            />
            <Readout label="tr H = 2(a+c)" value={trH.toFixed(2)} />
            <Readout label="λ₁ of H" value={l1.toFixed(2)} />
            <Readout label="λ₂ of H" value={l2.toFixed(2)} />
          </ReadoutRow>
          <div
            className="rounded-xl border bg-[var(--color-bg)] px-3 py-2.5"
            style={{ borderColor: verdictColor }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
              Verdict at (0,0)
            </div>
            <div className="font-mono text-lg font-bold leading-tight" style={{ color: verdictColor }}>
              {verdict}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">{detail}</p>
      </div>
    </div>
  );
}
