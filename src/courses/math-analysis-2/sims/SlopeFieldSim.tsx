import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Slope-field explorer for first-order ODEs  y' = f(x, y).
 *
 * The idea: the ODE prescribes, at every point (x, y) of the plane, the
 * slope f(x, y) that a solution curve passing through that point must
 * have. Drawing a short tick with that slope on a grid gives the
 * "slope field"; solving a Cauchy problem means dropping a point at
 * (x0, y0) and riding the field in both directions.
 *
 * The overlaid curve is integrated with classic Runge–Kutta 4
 * (step 0.01, forward and backward from the initial condition). Each
 * preset also carries its exact closed-form solution, so the readout
 * can compare RK4 against the truth — real numerics, verifiable live.
 *
 *   y' = y        →  y = y0·e^(x−x0)
 *   y' = −2xy     →  y = y0·e^(x0²−x²)          (Gaussian bells)
 *   y' = x − y    →  y = (y0−x0+1)·e^(x0−x) + x − 1
 *   y' = y(1−y)   →  y = y0 / (y0 + (1−y0)·e^(−(x−x0)))   (logistic)
 * ------------------------------------------------------------------ */

const W = 420;
const H = 336;
const XMIN = -3;
const XMAX = 3;
const YMIN = -2.4;
const YMAX = 2.4; // 70 px per unit on both axes → slopes draw true

const xPix = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * W;
const yPix = (y: number) => ((YMAX - y) / (YMAX - YMIN)) * H;
const clampPix = (p: number) => Math.max(-30, Math.min(H + 30, p));

type PresetId = "growth" | "gaussian" | "mix" | "logistic";

interface Preset {
  id: PresetId;
  label: string;
  f: (x: number, y: number) => number;
  /** exact solution through (x0, y0); NaN once it has blown up */
  exact: (x0: number, y0: number, x: number) => number;
  blurb: string;
}

const PRESETS: Preset[] = [
  {
    id: "growth",
    label: "y′ = y",
    f: (_x, y) => y,
    exact: (x0, y0, x) => y0 * Math.exp(x - x0),
    blurb:
      "Pure exponentials y = y₀·e^(x−x₀): the slope equals the height, so curves steepen as they climb. y₀ = 0 sits exactly on the equilibrium y ≡ 0.",
  },
  {
    id: "gaussian",
    label: "y′ = −2xy",
    f: (x, y) => -2 * x * y,
    exact: (x0, y0, x) => y0 * Math.exp(x0 * x0 - x * x),
    blurb:
      "Separable in one line: every solution is a Gaussian bell y = C·e^(−x²). Note the horizontal ticks on both axes (x = 0 or y = 0 makes the slope vanish).",
  },
  {
    id: "mix",
    label: "y′ = x − y",
    f: (x, y) => x - y,
    exact: (x0, y0, x) => (y0 - x0 + 1) * Math.exp(x0 - x) + x - 1,
    blurb:
      "A linear equation: y = C·e^(−x) + (x − 1). The transient C·e^(−x) dies out and every curve, wherever it starts, funnels onto the line y = x − 1.",
  },
  {
    id: "logistic",
    label: "y′ = y(1 − y)",
    f: (_x, y) => y * (1 - y),
    exact: (x0, y0, x) => {
      const den = y0 + (1 - y0) * Math.exp(-(x - x0));
      return den > 0 ? y0 / den : NaN;
    },
    blurb:
      "Logistic growth: two equilibria y ≡ 0 and y ≡ 1, with S-curves rising toward 1 in between. Start above 1 and read off values to the left to catch a finite-time blow-up.",
  },
];

const HSTEP = 0.01;
const YCAP = 1e4;

/** Classic RK4 from (x0, y0) to the window edge in direction dir. */
function integrate(
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  dir: 1 | -1
): { x: number; y: number }[] {
  const pts = [{ x: x0, y: y0 }];
  const xEnd = dir === 1 ? XMAX : XMIN;
  const n = Math.round(Math.abs(xEnd - x0) / HSTEP);
  const h = HSTEP * dir;
  let x = x0;
  let y = y0;
  for (let i = 0; i < n; i++) {
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h / 2) * k1);
    const k3 = f(x + h / 2, y + (h / 2) * k2);
    const k4 = f(x + h, y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x += h;
    if (!Number.isFinite(y) || Math.abs(y) > YCAP) break; // blow-up: stop the curve
    pts.push({ x, y });
  }
  return pts;
}

/** Value of the integrated solution at xm, or null if it blew up first. */
function sampleAt(
  fwd: { x: number; y: number }[],
  bwd: { x: number; y: number }[],
  x0: number,
  xm: number
): number | null {
  const arr = xm >= x0 ? fwd : bwd;
  const idx = Math.round(Math.abs(xm - x0) / HSTEP);
  return idx < arr.length ? arr[idx].y : null;
}

export function SlopeFieldSim() {
  const [presetId, setPresetId] = useState<PresetId>("gaussian");
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1.5);
  const [xm, setXm] = useState(1.5);

  const preset = PRESETS.find((p) => p.id === presetId)!;

  // slope ticks — recomputed only when the ODE changes
  const ticks = useMemo(() => {
    const GX = 15;
    const GY = 12;
    const L = 7; // half-length of a tick in px
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < GX; i++) {
      for (let j = 0; j < GY; j++) {
        const x = XMIN + ((XMAX - XMIN) * (i + 0.5)) / GX;
        const y = YMIN + ((YMAX - YMIN) * (j + 0.5)) / GY;
        const s = preset.f(x, y);
        const norm = Math.hypot(1, s);
        const ux = L / norm;
        const uy = (L * s) / norm;
        const px = xPix(x);
        const py = yPix(y);
        out.push({ x1: px - ux, y1: py + uy, x2: px + ux, y2: py - uy });
      }
    }
    return out;
  }, [preset]);

  const fwd = useMemo(() => integrate(preset.f, x0, y0, 1), [preset, x0, y0]);
  const bwd = useMemo(() => integrate(preset.f, x0, y0, -1), [preset, x0, y0]);

  const curve = useMemo(() => {
    const pts = [...bwd].reverse().concat(fwd);
    return pts
      .map((p) => `${xPix(p.x).toFixed(1)},${clampPix(yPix(p.y)).toFixed(1)}`)
      .join(" ");
  }, [fwd, bwd]);

  const yRk4 = sampleAt(fwd, bwd, x0, xm);
  const yExact = preset.exact(x0, y0, xm);
  const exactOk = Number.isFinite(yExact);
  const err = yRk4 !== null && exactOk ? Math.abs(yRk4 - yExact) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* preset selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <SimButton key={p.id} active={presetId === p.id} onClick={() => setPresetId(p.id)}>
              {p.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          {/* axes */}
          <line x1={xPix(XMIN)} y1={yPix(0)} x2={xPix(XMAX)} y2={yPix(0)} stroke="var(--color-line)" strokeWidth={1} />
          <line x1={xPix(0)} y1={yPix(YMIN)} x2={xPix(0)} y2={yPix(YMAX)} stroke="var(--color-line)" strokeWidth={1} />
          <text x={xPix(XMAX) - 6} y={yPix(0) - 6} textAnchor="end" fontSize={10} fill="var(--color-faint)">
            x
          </text>
          <text x={xPix(0) + 6} y={yPix(YMAX) + 12} fontSize={10} fill="var(--color-faint)">
            y
          </text>

          {/* slope field */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="var(--color-faint)"
              strokeWidth={1.3}
              opacity={0.65}
              strokeLinecap="round"
            />
          ))}

          {/* marked x where we read the solution */}
          <line
            x1={xPix(xm)}
            y1={0}
            x2={xPix(xm)}
            y2={H}
            stroke="var(--accent-2)"
            strokeWidth={1.2}
            strokeDasharray="4 4"
            opacity={0.9}
          />

          {/* integrated solution through (x0, y0) */}
          <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />

          {/* initial condition */}
          <circle cx={xPix(x0)} cy={yPix(y0)} r={5} fill="var(--accent)" stroke="var(--color-bg)" strokeWidth={2} />

          {/* readout point on the curve at the marked x */}
          {yRk4 !== null && Math.abs(yRk4) <= YMAX && (
            <circle cx={xPix(xm)} cy={yPix(yRk4)} r={4} fill="var(--accent-2)" stroke="var(--color-bg)" strokeWidth={1.5} />
          )}
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">{preset.blurb}</p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider label="Initial x₀" value={x0} min={XMIN} max={XMAX} step={0.1} onChange={setX0} format={(v) => v.toFixed(1)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="Initial y₀ = y(x₀)" value={y0} min={YMIN} max={YMAX} step={0.1} onChange={setY0} format={(v) => v.toFixed(1)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="Read the solution at x★" value={xm} min={XMIN} max={XMAX} step={0.1} onChange={setXm} format={(v) => v.toFixed(1)} />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="slope y′(x₀, y₀)" value={preset.f(x0, y0).toFixed(2)} />
            <Readout
              label="RK4 y(x★)"
              value={yRk4 === null ? "blow-up" : yRk4.toFixed(4)}
              tone={yRk4 === null ? "bad" : "accent"}
            />
            <Readout label="exact y(x★)" value={exactOk ? yExact.toFixed(4) : "blow-up"} tone={exactOk ? "default" : "bad"} />
            <Readout
              label="|RK4 − exact|"
              value={err === null ? "—" : err.toExponential(1)}
              tone={err !== null && err < 1e-5 ? "good" : "default"}
            />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          The curve is not drawn from a formula — it is RK4 with step 0.01 riding the ticks from
          (x₀, y₀) both ways. The last readout compares it with the closed-form solution: the tiny
          error is the numerics being honest. Where solution curves would touch, uniqueness fails —
          with these right-hand sides they never do.
        </p>
      </div>
    </div>
  );
}
