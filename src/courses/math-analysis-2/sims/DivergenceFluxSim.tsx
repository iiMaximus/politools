import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Divergence–flux explorer (the divergence theorem in 2-D).
 *
 * A planar vector field F is drawn as an arrow grid; a circle of
 * adjustable radius R sits at the origin. Two quantities are computed
 * NUMERICALLY and displayed side by side:
 *
 *   flux     = ∮_C F·n ds          (midpoint rule, 720 boundary samples)
 *   divInt   = ∬_D div F dA        (div by central differences,
 *                                   midpoint rule on a polar grid)
 *
 * The 2-D divergence theorem says these are EQUAL — and the readouts
 * confirm it live for every preset field and every radius. Colored
 * ticks on the circle show the local integrand F·n: outward green
 * (outflow), inward red (inflow).
 * ------------------------------------------------------------------ */

const W = 360; // svg width
const H = 360; // svg height
const RANGE = 2; // window is [-RANGE, RANGE] in both x and y
const SCALE = W / (2 * RANGE); // pixels per math unit

const xPix = (x: number) => ((x + RANGE) / (2 * RANGE)) * W;
const yPix = (y: number) => ((RANGE - y) / (2 * RANGE)) * H; // y up

type Vec = [number, number];
type Field = (x: number, y: number) => Vec;

type FieldId = "source" | "rotation" | "shear" | "sink";

const FIELDS: { id: FieldId; label: string; formula: string; divText: string; F: Field }[] = [
  { id: "source", label: "Source", formula: "F = (x, y)", divText: "div F = 2", F: (x, y) => [x, y] },
  { id: "rotation", label: "Rotation", formula: "F = (−y, x)", divText: "div F = 0", F: (x, y) => [-y, x] },
  { id: "shear", label: "Shear", formula: "F = (y, 0)", divText: "div F = 0", F: (_x, y) => [y, 0] },
  { id: "sink", label: "Sink", formula: "F = (−x, −y)", divText: "div F = −2", F: (x, y) => [-x, -y] },
];

/* ------------------------------ numerics --------------------------- */

/** div F at a point, by central differences (h = 1e-3). */
function divAt(F: Field, x: number, y: number): number {
  const h = 1e-3;
  const dPdx = (F(x + h, y)[0] - F(x - h, y)[0]) / (2 * h);
  const dQdy = (F(x, y + h)[1] - F(x, y - h)[1]) / (2 * h);
  return dPdx + dQdy;
}

/** Outward flux ∮ F·n ds through the circle of radius R (midpoint rule). */
function fluxThroughCircle(F: Field, R: number): number {
  const N = 720;
  const dt = (2 * Math.PI) / N;
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) * dt;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const [fx, fy] = F(R * c, R * s);
    // outward unit normal on the circle is (cos t, sin t); ds = R dt
    sum += (fx * c + fy * s) * R * dt;
  }
  return sum;
}

/** ∬ div F dA over the disk of radius R (midpoint rule on a polar grid). */
function divIntegralOverDisk(F: Field, R: number): number {
  const NR = 48;
  const NT = 72;
  const dr = R / NR;
  const dt = (2 * Math.PI) / NT;
  let sum = 0;
  for (let i = 0; i < NR; i++) {
    const r = (i + 0.5) * dr;
    for (let j = 0; j < NT; j++) {
      const t = (j + 0.5) * dt;
      sum += divAt(F, r * Math.cos(t), r * Math.sin(t)) * r * dr * dt; // dA = r dr dθ
    }
  }
  return sum;
}

/* ------------------------------ drawing ---------------------------- */

/** One field arrow centered at math point (x, y). */
function Arrow({ x, y, fx, fy }: { x: number; y: number; fx: number; fy: number }) {
  const mag = Math.hypot(fx, fy);
  if (mag < 1e-9) {
    return <circle cx={xPix(x)} cy={yPix(y)} r={1.5} fill="var(--color-faint)" />;
  }
  const len = Math.min(0.44, 0.19 * mag) * SCALE; // pixels
  // unit direction in PIXEL coordinates (svg y points down)
  const dx = fx / mag;
  const dy = -fy / mag;
  const cx = xPix(x);
  const cy = yPix(y);
  const x1 = cx - (dx * len) / 2;
  const y1 = cy - (dy * len) / 2;
  const x2 = cx + (dx * len) / 2;
  const y2 = cy + (dy * len) / 2;
  // arrowhead: small triangle at the tip
  const hx = x2 - dx * 5.5;
  const hy = y2 - dy * 5.5;
  const px = -dy * 2.4;
  const py = dx * 2.4;
  return (
    <g stroke="var(--color-faint)" fill="var(--color-faint)" opacity={0.85}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.4} />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} stroke="none" />
    </g>
  );
}

export function DivergenceFluxSim() {
  const [fieldId, setFieldId] = useState<FieldId>("source");
  const [R, setR] = useState(1.2);

  const field = FIELDS.find((f) => f.id === fieldId)!;
  const F = field.F;

  const { flux, divInt } = useMemo(
    () => ({ flux: fluxThroughCircle(F, R), divInt: divIntegralOverDisk(F, R) }),
    [F, R]
  );
  const area = Math.PI * R * R;
  const avgDiv = divInt / area;
  const mismatch = Math.abs(flux - divInt);

  // arrow grid (8 x 8, cell centers)
  const arrows = useMemo(() => {
    const pts: { x: number; y: number; fx: number; fy: number }[] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = -1.75 + 0.5 * i;
        const y = -1.75 + 0.5 * j;
        const [fx, fy] = F(x, y);
        pts.push({ x, y, fx, fy });
      }
    }
    return pts;
  }, [F]);

  // boundary ticks: local integrand F·n at 24 sample points on the circle
  const ticks = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; sign: 1 | -1 }[] = [];
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * 2 * Math.PI;
      const c = Math.cos(t);
      const s = Math.sin(t);
      const [fx, fy] = F(R * c, R * s);
      const dot = fx * c + fy * s; // F·n (outward normal)
      if (Math.abs(dot) < 1e-6) continue;
      const len = Math.min(0.38, 0.16 * Math.abs(dot)); // math units
      const dir = dot > 0 ? 1 : -1; // outward or inward tick
      out.push({
        x1: xPix(R * c),
        y1: yPix(R * s),
        x2: xPix((R + dir * len) * c),
        y2: yPix((R + dir * len) * s),
        sign: dot > 0 ? 1 : -1,
      });
    }
    return out;
  }, [F, R]);

  const verdict =
    flux > 0.05
      ? { label: "Net source — flux out", color: "var(--good)", bg: "var(--good-bg)" }
      : flux < -0.05
        ? { label: "Net sink — flux in", color: "var(--bad)", bg: "var(--bad-bg)" }
        : { label: "Incompressible — zero net flux", color: "var(--info)", bg: "var(--info-bg)" };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* field selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <SimButton key={f.id} active={fieldId === f.id} onClick={() => setFieldId(f.id)}>
              {f.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          {/* coordinate axes */}
          <line x1={xPix(-RANGE)} y1={yPix(0)} x2={xPix(RANGE)} y2={yPix(0)} stroke="var(--color-line)" strokeWidth={1} />
          <line x1={xPix(0)} y1={yPix(-RANGE)} x2={xPix(0)} y2={yPix(RANGE)} stroke="var(--color-line)" strokeWidth={1} />

          {/* the field */}
          {arrows.map((a, i) => (
            <Arrow key={i} {...a} />
          ))}

          {/* the circle C of radius R */}
          <circle
            cx={xPix(0)}
            cy={yPix(0)}
            r={R * SCALE}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
          />

          {/* local integrand F·n: green ticks = outflow, red = inflow */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.sign > 0 ? "var(--good)" : "var(--bad)"}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          ))}

          {/* legend */}
          <text x={8} y={16} fontSize={10} fill="var(--color-muted)">
            green tick = outflow (F·n &gt; 0)
          </text>
          <text x={8} y={30} fontSize={10} fill="var(--color-muted)">
            red tick = inflow
          </text>
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          Ticks show the boundary integrand F·n at 24 sample points. For the shear field the inflow
          and outflow ticks are symmetric — they cancel exactly, and the net flux is 0 even though
          the field is far from zero on the circle.
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Circle radius R"
              value={R}
              min={0.4}
              max={1.8}
              step={0.05}
              onChange={setR}
              format={(v) => v.toFixed(2)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <Readout label="Field" value={`${field.formula}   ·   ${field.divText}`} />
          <ReadoutRow>
            <Readout label="Flux ∮ F·n ds" value={flux.toFixed(3)} tone={Math.abs(flux) < 0.05 ? "default" : flux > 0 ? "good" : "bad"} />
            <Readout label="∬ div F dA" value={divInt.toFixed(3)} tone="accent" />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="Average div inside" value={avgDiv.toFixed(3)} />
            <Readout label="|flux − ∬ div|" value={mismatch.toExponential(1)} tone={mismatch < 0.01 ? "good" : "bad"} />
          </ReadoutRow>
          <div
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ color: verdict.color, background: verdict.bg }}
          >
            {verdict.label}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Both numbers are computed independently — the flux by sampling F·n at 720 boundary points,
          the divergence integral by central differences on a polar grid inside the disk. They agree
          for every field and every radius: that is the divergence theorem. Note flux grows like R²
          (with the area), not like the circumference.
        </p>
      </div>
    </div>
  );
}
