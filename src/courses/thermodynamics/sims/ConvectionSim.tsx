import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Forced convection over a flat plate (parallel flow) explorer.
 * Re_L = v·L/ν
 * Laminar (Re_L < 5e5):   Nu = 0.664·Re_L^0.5·Pr^(1/3)
 * Turbulent (mixed bL):   Nu = (0.037·Re_L^0.8 − 871)·Pr^(1/3)
 * h = Nu·k/L ,  q″ = h·(T_s − T_∞)
 * Boundary layer:  laminar  δ(x) = 5x/√Re_x   (Re_x = v·x/ν)
 *                  turbulent δ(x) = 0.37x/Re_x^0.2
 * ------------------------------------------------------------------ */

const RE_CRIT = 5e5;

type FluidId = "air" | "water";
const FLUIDS: { id: FluidId; label: string; nu: number; k: number; Pr: number }[] = [
  { id: "air", label: "Air (20 °C)", nu: 1.5e-5, k: 0.026, Pr: 0.71 },
  { id: "water", label: "Water (20 °C)", nu: 1.0e-6, k: 0.6, Pr: 7.0 },
];

const W = 460;
const H = 260;
const PAD = { l: 30, r: 16, t: 24, b: 34 };
const plateY = H - PAD.b;
const x0 = PAD.l;
const x1 = W - PAD.r;
const plotW = x1 - x0;

function compute(v: number, L: number, fluid: { nu: number; k: number; Pr: number }, dT: number) {
  const Re = (v * L) / fluid.nu;
  const turbulent = Re > RE_CRIT;
  let Nu: number;
  if (turbulent) {
    Nu = (0.037 * Math.pow(Re, 0.8) - 871) * Math.pow(fluid.Pr, 1 / 3);
  } else {
    Nu = 0.664 * Math.pow(Re, 0.5) * Math.pow(fluid.Pr, 1 / 3);
  }
  Nu = Math.max(Nu, 0);
  const h = (Nu * fluid.k) / L; // W/m²K
  const q = h * dT; // W/m²
  return { Re, Nu, h, q, turbulent };
}

/** Boundary-layer thickness δ(x) in metres at position x (m) along the plate. */
function delta(x: number, v: number, nu: number): number {
  if (x <= 0) return 0;
  const Rex = (v * x) / nu;
  if (Rex <= 0) return 0;
  if (Rex > RE_CRIT) return 0.37 * x * Math.pow(Rex, -0.2);
  return (5 * x) / Math.sqrt(Rex);
}

function fmt(n: number): string {
  const a = Math.abs(n);
  if (a === 0) return "0";
  if (a >= 1e5 || a < 1e-2) return n.toExponential(2);
  if (a >= 100) return Math.round(n).toString();
  if (a >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

export function ConvectionSim() {
  const [v, setV] = useState(5);
  const [L, setL] = useState(0.5);
  const [dT, setDT] = useState(40);
  const [fluidId, setFluidId] = useState<FluidId>("air");

  const fluid = FLUIDS.find((f) => f.id === fluidId)!;
  const { Re, Nu, h, q, turbulent } = useMemo(() => compute(v, L, fluid, dT), [v, L, fluid, dT]);

  // Boundary-layer curve drawn over the plate, scaled so the displayed
  // edge-of-BL height never overruns the plot box.
  const curve = useMemo(() => {
    const N = 60;
    const xPos = (i: number) => (L * i) / N; // physical position (m)
    // find max δ across the plate to set a vertical scale
    let dMax = 0;
    for (let i = 0; i <= N; i++) dMax = Math.max(dMax, delta(xPos(i), v, fluid.nu));
    const available = plateY - PAD.t; // px of vertical room above plate
    const scale = dMax > 0 ? available / dMax : 0;
    const top: string[] = [];
    for (let i = 0; i <= N; i++) {
      const px = x0 + (plotW * i) / N;
      const py = plateY - delta(xPos(i), v, fluid.nu) * scale;
      top.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return top.join(" ");
  }, [v, L, fluid.nu]);

  // x position (px) where transition to turbulence occurs, if within the plate
  const xTransPx = useMemo(() => {
    if (Re <= RE_CRIT) return null;
    const xTrans = (RE_CRIT * fluid.nu) / v; // m
    if (xTrans >= L) return null;
    return x0 + (xTrans / L) * plotW;
  }, [Re, fluid.nu, v, L]);

  const fillPoints = `${x0},${plateY} ${curve} ${x1},${plateY}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* fluid selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {FLUIDS.map((f) => (
            <SimButton key={f.id} active={fluidId === f.id} onClick={() => setFluidId(f.id)}>
              {f.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* free-stream arrows */}
          {[0.18, 0.42, 0.66].map((f, i) => {
            const y = PAD.t + f * (plateY - PAD.t);
            return (
              <g key={i}>
                <line
                  x1={6}
                  y1={y}
                  x2={x0 + 30}
                  y2={y}
                  stroke="var(--color-faint)"
                  strokeWidth={1.5}
                  markerEnd="url(#arrow)"
                />
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-faint)" />
            </marker>
          </defs>
          <text x={8} y={PAD.t - 10} fontSize={10} fill="var(--color-muted)">
            v∞ = {v.toFixed(1)} m/s, T∞
          </text>

          {/* boundary layer fill + edge */}
          <polygon points={fillPoints} fill="var(--accent)" opacity={0.14} />
          <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth={2} />
          <text x={x0 + 6} y={PAD.t + 4} fontSize={10} fill="var(--accent)" fontWeight={700}>
            δ(x) boundary layer
          </text>

          {/* transition marker */}
          {xTransPx != null && (
            <g>
              <line
                x1={xTransPx}
                y1={PAD.t}
                x2={xTransPx}
                y2={plateY}
                stroke="var(--warn)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={xTransPx + 4}
                y={PAD.t + 16}
                fontSize={9}
                fill="var(--warn)"
                fontWeight={700}
              >
                transition
              </text>
              <text x={x0 + 4} y={plateY - 6} fontSize={9} fill="var(--color-muted)">
                laminar
              </text>
              <text x={xTransPx + 4} y={plateY - 6} fontSize={9} fill="var(--color-muted)">
                turbulent
              </text>
            </g>
          )}

          {/* the plate */}
          <rect x={x0} y={plateY} width={plotW} height={8} fill="var(--color-ink)" rx={1} />
          <line x1={x0} y1={plateY} x2={x1} y2={plateY} stroke="var(--color-ink)" strokeWidth={2} />
          {/* leading / trailing edge */}
          <text x={x0} y={plateY + 22} fontSize={9} textAnchor="start" fill="var(--color-faint)">
            x = 0
          </text>
          <text x={x1} y={plateY + 22} fontSize={9} textAnchor="end" fill="var(--color-faint)">
            x = L = {L < 1 ? `${(L * 100).toFixed(0)} cm` : `${L.toFixed(2)} m`}
          </text>
          <text
            x={(x0 + x1) / 2}
            y={plateY + 22}
            fontSize={9}
            textAnchor="middle"
            fill="var(--color-muted)"
          >
            Ts = T∞ + ΔT
          </text>
        </svg>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Free-stream velocity v"
              value={v}
              min={0.1}
              max={20}
              step={0.1}
              unit="m/s"
              onChange={setV}
              format={(x) => x.toFixed(1)}
            />
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Plate length L"
              value={L}
              min={0.05}
              max={3}
              step={0.05}
              unit="m"
              onChange={setL}
              format={(x) => x.toFixed(2)}
            />
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Wall–fluid ΔT (Ts − T∞)"
              value={dT}
              min={1}
              max={100}
              step={1}
              unit="K"
              onChange={setDT}
              format={(x) => x.toFixed(0)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="Reₗ" value={fmt(Re)} tone={turbulent ? "bad" : "good"} />
            <Readout label="Nu (mean)" value={fmt(Nu)} tone="accent" />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="h (W/m²K)" value={fmt(h)} />
            <Readout label="q″ (W/m²)" value={fmt(q)} tone="accent" />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          {turbulent ? (
            <>
              Reₗ &gt; 5×10⁵ → flow is turbulent over part of the plate. Using the mixed
              boundary-layer mean: Nu = (0.037·Reₗ⁰ᐧ⁸ − 871)·Pr¹ᐟ³.
            </>
          ) : (
            <>
              Laminar regime (Reₗ &lt; 5×10⁵). Mean Nusselt: Nu = 0.664·Reₗ⁰ᐧ⁵·Pr¹ᐟ³; then h =
              Nu·k/L and q″ = h·ΔT.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
