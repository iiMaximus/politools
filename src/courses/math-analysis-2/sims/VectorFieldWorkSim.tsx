import { useEffect, useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Vector-field work explorer.
 *
 * Pick a field F and a path γ; the sim draws F as an arrow grid, the
 * path with its orientation, and NUMERICALLY integrates the work
 *
 *     W = ∫_γ F · dr  ≈  Σ F(midpoint of chord) · Δr        (midpoint rule)
 *
 * with N = 1600 parameter steps. Nothing is faked: the readout is the
 * actual running sum. Exact values for reference:
 *
 *   F = (y, x)   conservative, φ = xy:
 *     circle 0 · segment (−1,0)→(1,1): φ(1,1)−φ(−1,0) = 1 · square 0
 *   F = (−y, x)  NOT conservative (∂Q/∂x − ∂P/∂y = 2):
 *     circle 2π · segment −1 (F·r' ≡ −1) · square 2·Area = 8
 *   F = (x, y)   conservative, φ = (x²+y²)/2:
 *     circle 0 · segment 1 − 1/2 = 1/2 · square 0
 *
 * The midpoint rule telescopes EXACTLY for these potentials, so the
 * conservative fields really display 0.0000 on the closed loops.
 * ------------------------------------------------------------------ */

const W = 380; // svg width
const H = 380; // svg height
const RANGE = 1.6; // window is [-RANGE, RANGE]²
const N = 1600; // integration steps (divisible by 4 → square corners land on nodes)

const xPix = (x: number) => ((x + RANGE) / (2 * RANGE)) * W;
const yPix = (y: number) => ((RANGE - y) / (2 * RANGE)) * H; // math y is up

/* ----------------------------- fields ----------------------------- */

type FieldId = "yx" | "rot" | "radial";

interface FieldDef {
  id: FieldId;
  label: string;
  F: (x: number, y: number) => [number, number];
  /** ∂Q/∂x − ∂P/∂y, shown as the cross-partials verdict */
  curlLabel: string;
  conservative: boolean;
  potential?: string;
}

const FIELDS: FieldDef[] = [
  {
    id: "yx",
    label: "F = (y, x)",
    F: (x, y) => [y, x],
    curlLabel: "1 − 1 = 0",
    conservative: true,
    potential: "φ = x·y",
  },
  {
    id: "rot",
    label: "F = (−y, x)",
    F: (x, y) => [-y, x],
    curlLabel: "1 − (−1) = 2",
    conservative: false,
  },
  {
    id: "radial",
    label: "F = (x, y)",
    F: (x, y) => [x, y],
    curlLabel: "0 − 0 = 0",
    conservative: true,
    potential: "φ = (x²+y²)/2",
  },
];

/* ------------------------------ paths ----------------------------- */

type PathId = "circle" | "segment" | "square";

interface PathDef {
  id: PathId;
  label: string;
  closed: boolean;
  /** parametrization on t ∈ [0, 1] */
  r: (t: number) => [number, number];
}

const PATHS: PathDef[] = [
  {
    id: "circle",
    label: "Unit circle (CCW)",
    closed: true,
    r: (t) => [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t)],
  },
  {
    id: "segment",
    label: "Segment (−1,0) → (1,1)",
    closed: false,
    r: (t) => [-1 + 2 * t, t],
  },
  {
    id: "square",
    label: "Square loop (CCW)",
    closed: true,
    r: (t) => {
      if (t >= 1) return [-1, -1]; // exactly back to the start corner
      const u = 4 * t;
      const k = Math.floor(u);
      const s = u - k;
      if (k === 0) return [-1 + 2 * s, -1];
      if (k === 1) return [1, -1 + 2 * s];
      if (k === 2) return [1 - 2 * s, 1];
      return [-1, 1 - 2 * s];
    },
  },
];

/** exact work values (hand-computed, see header comment) for the readout */
const EXACT: Record<FieldId, Record<PathId, string>> = {
  yx: { circle: "0", segment: "1", square: "0" },
  rot: { circle: "2π ≈ 6.2832", segment: "−1", square: "8" },
  radial: { circle: "0", segment: "1/2", square: "0" },
};

/* --------------------------- the component ------------------------ */

export function VectorFieldWorkSim() {
  const [fieldId, setFieldId] = useState<FieldId>("rot");
  const [pathId, setPathId] = useState<PathId>("circle");
  const [s, setS] = useState(1); // fraction of the path traversed
  const [playing, setPlaying] = useState(false);

  const field = FIELDS.find((f) => f.id === fieldId)!;
  const path = PATHS.find((p) => p.id === pathId)!;

  /* cumulative work along the path — real numerics, midpoint rule */
  const cum = useMemo(() => {
    const arr = new Float64Array(N + 1);
    let w = 0;
    let [px, py] = path.r(0);
    for (let i = 1; i <= N; i++) {
      const [qx, qy] = path.r(i / N);
      const [fx, fy] = field.F((px + qx) / 2, (py + qy) / 2);
      w += fx * (qx - px) + fy * (qy - py);
      arr[i] = w;
      px = qx;
      py = qy;
    }
    return arr;
  }, [field, path]);

  const total = cum[N];
  const idx = Math.min(N - 1, Math.floor(s * N));
  const frac = s * N - idx;
  const partial = cum[idx] + (cum[idx + 1] - cum[idx]) * frac;

  /* animation: advance s with rAF, cancel on cleanup */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setS((prev) => {
        const next = prev + dt * 0.2; // full path in 5 s
        return next >= 1 ? next - 1 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* arrow grid: 9×9 samples of F, lengths normalized to the grid max */
  const arrows = useMemo(() => {
    const G = 9;
    const pts: { x1: number; y1: number; x2: number; y2: number; tip: string }[] = [];
    let maxMag = 0;
    const samples: { x: number; y: number; fx: number; fy: number; mag: number }[] = [];
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const x = -1.4 + (2.8 * i) / (G - 1);
        const y = -1.4 + (2.8 * j) / (G - 1);
        const [fx, fy] = field.F(x, y);
        const mag = Math.hypot(fx, fy);
        maxMag = Math.max(maxMag, mag);
        samples.push({ x, y, fx, fy, mag });
      }
    }
    for (const p of samples) {
      if (p.mag < 1e-9 * maxMag) continue; // skip zero vectors
      const len = 0.13 * (0.35 + 0.65 * (p.mag / maxMag)); // math-units half-length
      const ux = p.fx / p.mag;
      const uy = p.fy / p.mag;
      const x1 = xPix(p.x - ux * len);
      const y1 = yPix(p.y - uy * len);
      const x2 = xPix(p.x + ux * len);
      const y2 = yPix(p.y + uy * len);
      // arrowhead: two short barbs at the tip
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const hb = 4.5;
      const a1 = ang + Math.PI - 0.5;
      const a2 = ang + Math.PI + 0.5;
      const tip =
        `M ${(x2 + hb * Math.cos(a1)).toFixed(1)} ${(y2 + hb * Math.sin(a1)).toFixed(1)} ` +
        `L ${x2.toFixed(1)} ${y2.toFixed(1)} ` +
        `L ${(x2 + hb * Math.cos(a2)).toFixed(1)} ${(y2 + hb * Math.sin(a2)).toFixed(1)}`;
      pts.push({ x1, y1, x2, y2, tip });
    }
    return pts;
  }, [field]);

  /* path polylines: full trace (soft) + traversed part (bold) */
  const SAMPLES = 160;
  const fullPts: string[] = [];
  const donePts: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const [x, y] = path.r(t);
    const pt = `${xPix(x).toFixed(1)},${yPix(y).toFixed(1)}`;
    fullPts.push(pt);
    if (t <= s) donePts.push(pt);
  }
  {
    const [x, y] = path.r(s);
    donePts.push(`${xPix(x).toFixed(1)},${yPix(y).toFixed(1)}`);
  }
  const [dotX, dotY] = path.r(s);
  const [startX, startY] = path.r(0);

  /* orientation arrowheads along the path */
  const orient = (path.closed ? [0.125, 0.45, 0.8] : [0.5]).map((t) => {
    const [ax, ay] = path.r(Math.max(0, t - 0.005));
    const [bx, by] = path.r(Math.min(1, t + 0.005));
    const ang = Math.atan2(yPix(by) - yPix(ay), xPix(bx) - xPix(ax));
    const cx = xPix(bx);
    const cy = yPix(by);
    const hb = 7;
    const a1 = ang + Math.PI - 0.45;
    const a2 = ang + Math.PI + 0.45;
    return `M ${(cx + hb * Math.cos(a1)).toFixed(1)} ${(cy + hb * Math.sin(a1)).toFixed(1)} L ${cx.toFixed(1)} ${cy.toFixed(1)} L ${(cx + hb * Math.cos(a2)).toFixed(1)} ${(cy + hb * Math.sin(a2)).toFixed(1)}`;
  });

  const closedAndConservative = path.closed && field.conservative;
  const wTone = path.closed ? (Math.abs(total) < 1e-6 ? "good" : "bad") : "accent";
  /** clamp numerical dust so conservative loops read 0.0000, not -0.0000 */
  const fmtW = (v: number) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* field + path selectors */}
        <div className="mb-2 flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <SimButton key={f.id} active={fieldId === f.id} onClick={() => setFieldId(f.id)}>
              {f.label}
            </SimButton>
          ))}
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {PATHS.map((p) => (
            <SimButton key={p.id} active={pathId === p.id} onClick={() => setPathId(p.id)}>
              {p.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          {/* axes */}
          <line x1={xPix(-RANGE)} y1={yPix(0)} x2={xPix(RANGE)} y2={yPix(0)} stroke="var(--color-line)" strokeWidth={1} />
          <line x1={xPix(0)} y1={yPix(-RANGE)} x2={xPix(0)} y2={yPix(RANGE)} stroke="var(--color-line)" strokeWidth={1} />

          {/* the field as an arrow grid */}
          {arrows.map((a, i) => (
            <g key={i} stroke="var(--color-faint)" strokeWidth={1.3} opacity={0.75} fill="none">
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
              <path d={a.tip} />
            </g>
          ))}

          {/* full path (soft) + traversed portion (bold) */}
          <polyline points={fullPts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth={1.5} opacity={0.35} />
          <polyline points={donePts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />

          {/* orientation arrowheads */}
          {orient.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
          ))}

          {/* start marker + moving point */}
          <circle cx={xPix(startX)} cy={yPix(startY)} r={4} fill="var(--color-bg)" stroke="var(--accent)" strokeWidth={2} />
          <circle cx={xPix(dotX)} cy={yPix(dotY)} r={6} fill="var(--accent)" stroke="var(--color-bg)" strokeWidth={2} />

          {!path.closed && (
            <>
              <text x={xPix(-1) - 4} y={yPix(0) + 16} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--color-muted)">
                A(−1,0)
              </text>
              <text x={xPix(1) + 6} y={yPix(1) - 6} fontSize={11} fontWeight={700} fill="var(--color-muted)">
                B(1,1)
              </text>
            </>
          )}
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          The work is integrated numerically with {N} parameter steps (midpoint rule): the readout is
          the actual running sum of F·Δr, not a formula. Drag the progress slider — or press play —
          and watch W(s) accumulate as the point moves with the orientation.
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Path progress s"
              value={s}
              min={0}
              max={1}
              step={0.001}
              onChange={(v) => {
                setPlaying(false);
                setS(v);
              }}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
          <div className="sm:col-span-2">
            <SimButton onClick={() => setPlaying((p) => !p)} active={playing}>
              {playing ? "Pause" : "Animate along the path"}
            </SimButton>
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="Work so far W(s)" value={fmtW(partial)} tone="accent" />
            <Readout label="Total work W" value={fmtW(total)} tone={wTone} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="Exact value" value={EXACT[fieldId][pathId]} />
            <Readout label="∂Q/∂x − ∂P/∂y" value={field.curlLabel} />
          </ReadoutRow>
          <Readout
            label="Field verdict"
            value={field.conservative ? `Conservative — ${field.potential}` : "NOT conservative"}
            tone={field.conservative ? "good" : "bad"}
          />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          {closedAndConservative ? (
            <>
              A conservative field on a <strong>closed loop</strong>: the work climbs, then gives it
              all back — the total is <strong>0</strong> (here exactly, because W depends only on the
              endpoints and they coincide).
            </>
          ) : path.closed ? (
            <>
              This loop encloses nonzero curl, so the field does <strong>net work</strong> around it —
              W ≠ 0 on a closed path is the definitive proof that <strong>no potential exists</strong>.
            </>
          ) : (
            <>
              On an open path the work is generally nonzero for any field. For the conservative
              presets it equals <strong>φ(B) − φ(A)</strong> — check it against the exact value.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
