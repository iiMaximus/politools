import { useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Path-limit explorer for  f(x,y) = xy / (x^2 + y^2)  near the origin.
 *
 * The whole point: the limit at (0,0) does NOT exist, because the value
 * you reach depends on the direction of approach. Along the line y = m x
 *
 *     f(x, m x) = (x · m x) / (x^2 + m^2 x^2) = m / (1 + m^2)
 *
 * which is CONSTANT in x but varies with the slope m. Different m ⇒
 * different limiting value ⇒ no single limit.
 *
 * We draw an SVG heatmap of f on a small window around the origin and
 * overlay the chosen approach path, with a live readout of the value f
 * tends to along that path.
 * ------------------------------------------------------------------ */

const W = 360; // svg width
const H = 360; // svg height
const RANGE = 1; // window is [-RANGE, RANGE] in both x and y
const N = 24; // grid cells per axis (24 x 24 heatmap)

// map math coords (in [-RANGE, RANGE]) to svg pixels
const xPix = (x: number) => ((x + RANGE) / (2 * RANGE)) * W;
const yPix = (y: number) => ((RANGE - y) / (2 * RANGE)) * H; // y up

// f(x,y) = xy / (x^2 + y^2); defined for (x,y) != (0,0). Range is [-0.5, 0.5].
function f(x: number, y: number): number {
  const d = x * x + y * y;
  if (d === 0) return 0;
  return (x * y) / d;
}

// diverging color: blue (negative) → near-white (0) → orange (positive).
// v is in [-0.5, 0.5]; normalize to t in [-1, 1].
function color(v: number): string {
  const t = Math.max(-1, Math.min(1, v / 0.5));
  if (t >= 0) {
    // 0 → light, 1 → orange (accent family)
    const r = Math.round(245 + t * (255 - 245));
    const g = Math.round(245 + t * (140 - 245));
    const b = Math.round(245 + t * (90 - 245));
    return `rgb(${r},${g},${b})`;
  }
  // 0 → light, -1 → violet/blue
  const a = -t;
  const r = Math.round(245 + a * (110 - 245));
  const g = Math.round(245 + a * (110 - 245));
  const b = Math.round(245 + a * (255 - 245));
  return `rgb(${r},${g},${b})`;
}

type PathKind = "line" | "parabola" | "xaxis";
const PATHS: { id: PathKind; label: string }[] = [
  { id: "line", label: "Line y = m·x" },
  { id: "parabola", label: "Parabola y = x²" },
  { id: "xaxis", label: "x-axis (y = 0)" },
];

// Build the SVG polyline for the chosen approach path across the window.
function pathPoints(kind: PathKind, m: number): string {
  const pts: [number, number][] = [];
  if (kind === "xaxis") {
    pts.push([-RANGE, 0], [RANGE, 0]);
  } else if (kind === "line") {
    // y = m x; clamp to the window
    for (let i = 0; i <= 60; i++) {
      const x = -RANGE + (2 * RANGE * i) / 60;
      pts.push([x, m * x]);
    }
  } else {
    // parabola y = x^2
    for (let i = 0; i <= 60; i++) {
      const x = -RANGE + (2 * RANGE * i) / 60;
      pts.push([x, x * x]);
    }
  }
  return pts
    .map(([x, y]) => `${xPix(x).toFixed(1)},${yPix(y).toFixed(1)}`)
    .join(" ");
}

// The value f tends to as we approach (0,0) along the chosen path.
function limitAlong(kind: PathKind, m: number): { value: number; label: string } {
  if (kind === "line") {
    // f(x, m x) = m / (1 + m^2), constant ⇒ that IS the limit along this line
    return { value: m / (1 + m * m), label: "m / (1 + m²)" };
  }
  if (kind === "parabola") {
    // f(x, x^2) = (x · x^2)/(x^2 + x^4) = x^3 / (x^2(1 + x^2)) = x/(1+x^2) → 0
    return { value: 0, label: "→ 0  (x/(1+x²))" };
  }
  // x-axis: f(x,0) = 0 for all x ≠ 0 ⇒ limit 0
  return { value: 0, label: "→ 0  (f ≡ 0 on axis)" };
}

export function PathLimitSim() {
  const [kind, setKind] = useState<PathKind>("line");
  const [m, setM] = useState(1);

  const { value, label } = limitAlong(kind, m);

  // pre-build the heatmap cells once per render (cheap: 576 rects)
  const cellW = W / N;
  const cellH = H / N;
  const cells: { x: number; y: number; fill: string }[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      // cell-center math coordinates
      const cx = -RANGE + (2 * RANGE * (i + 0.5)) / N;
      const cy = RANGE - (2 * RANGE * (j + 0.5)) / N;
      cells.push({ x: i * cellW, y: j * cellH, fill: color(f(cx, cy)) });
    }
  }

  const poly = pathPoints(kind, m);

  // reference value along y = x (m = 1) is 0.5 — the visible "extreme"
  const showsSlope = kind === "line";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* path selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {PATHS.map((p) => (
            <SimButton key={p.id} active={kind === p.id} onClick={() => setKind(p.id)}>
              {p.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* heatmap */}
          {cells.map((c, idx) => (
            <rect
              key={idx}
              x={c.x}
              y={c.y}
              width={cellW + 0.5}
              height={cellH + 0.5}
              fill={c.fill}
            />
          ))}

          {/* coordinate axes through the origin */}
          <line x1={xPix(-RANGE)} y1={yPix(0)} x2={xPix(RANGE)} y2={yPix(0)} stroke="var(--color-line)" strokeWidth={1} />
          <line x1={xPix(0)} y1={yPix(-RANGE)} x2={xPix(0)} y2={yPix(RANGE)} stroke="var(--color-line)" strokeWidth={1} />

          {/* approach path */}
          <polyline points={poly} fill="none" stroke="#111" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />

          {/* arrowheads converging on origin (both sides of the path) */}
          <circle cx={xPix(0)} cy={yPix(0)} r={5} fill="#fff" stroke="#111" strokeWidth={2} />
          <text x={xPix(0) + 8} y={yPix(0) - 8} fontSize={11} fontWeight={700} fill="#111">
            (0,0)
          </text>

          {/* corner legend */}
          <text x={8} y={16} fontSize={10} fill="#333">f &lt; 0 (violet)</text>
          <text x={W - 8} y={16} textAnchor="end" fontSize={10} fill="#333">f &gt; 0 (orange)</text>
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          Spin the line slope m: the color the path rides over near the origin keeps changing, so the
          value f settles on changes too. That is the limit failing to exist.
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Line slope m"
              value={m}
              min={-4}
              max={4}
              step={0.1}
              onChange={setM}
              format={(v) => v.toFixed(1)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <Readout label="Path formula" value={label} />
          <ReadoutRow>
            <Readout
              label="Limit along path"
              value={value.toFixed(3)}
              tone={value === 0 ? "good" : "accent"}
            />
            <Readout
              label={showsSlope ? "At m = 1" : "Reference"}
              value={(0.5).toFixed(3)}
            />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          {kind === "line" ? (
            <>
              Along y = m·x the value is the constant <strong>m/(1+m²)</strong>: 0 for m = 0, peaks at{" "}
              <strong>0.5</strong> for m = 1, −0.5 for m = −1. Different directions, different values ⇒{" "}
              <strong>the limit does not exist</strong>.
            </>
          ) : (
            <>
              Along this curve the value tends to <strong>0</strong>. One path giving 0 is not enough —
              the straight lines already disagree, so the 2-D limit still does not exist.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
