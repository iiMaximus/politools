import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Ideal Rankine cycle — qualitative T–s explorer.
 * The vapor dome and 4 states are drawn schematically from the sliders.
 * Efficiency uses a clearly-labelled proxy (NOT steam-table exact):
 *   η ≈ 1 − T_cond / T_mean,in,   T in kelvin,
 *   T_mean,in ≈ T_boiler + ΔT_sup/2  (mean temperature of heat addition)
 * ------------------------------------------------------------------ */

const W = 480;
const H = 320;
const PAD = { l: 46, r: 18, t: 18, b: 38 };

// Axis ranges (schematic units).
const Tmin = 0; // °C, plot floor
const Tmax = 600; // °C
const Smin = 0; // arbitrary entropy units
const Smax = 10;

const xOf = (s: number) => PAD.l + ((s - Smin) / (Smax - Smin)) * (W - PAD.l - PAD.r);
const yOf = (t: number) => H - PAD.b - ((t - Tmin) / (Tmax - Tmin)) * (H - PAD.t - PAD.b);

// Critical-point apex of the schematic vapor dome.
const S_CRIT = 5; // entropy of the dome apex
const T_CRIT = 374; // °C (water critical temperature, schematic apex height)

// Saturation entropy of the liquid line (left branch) at temperature T.
// Schematic bell: branches meet at the apex (S_CRIT, T_CRIT).
function sLiquid(t: number): number {
  const f = Math.max(0, Math.min(1, t / T_CRIT));
  return S_CRIT - (S_CRIT - 0.4) * Math.sqrt(1 - f);
}
// Saturation entropy of the vapor line (right branch) at temperature T.
function sVapor(t: number): number {
  const f = Math.max(0, Math.min(1, t / T_CRIT));
  return S_CRIT + (9.4 - S_CRIT) * Math.sqrt(1 - f);
}

function domePath(): string {
  const pts: [number, number][] = [];
  const steps = 60;
  // up the liquid branch
  for (let i = 0; i <= steps; i++) {
    const t = (T_CRIT * i) / steps;
    pts.push([sLiquid(t), t]);
  }
  // down the vapor branch
  for (let i = steps; i >= 0; i--) {
    const t = (T_CRIT * i) / steps;
    pts.push([sVapor(t), t]);
  }
  return pts.map(([s, t]) => `${xOf(s).toFixed(1)},${yOf(t).toFixed(1)}`).join(" ");
}

export function RankineSim() {
  const [tBoiler, setTBoiler] = useState(300); // °C, saturation temp of boiler
  const [dTsup, setDTsup] = useState(120); // °C of superheat above boiler temp
  const [tCond, setTCond] = useState(40); // °C, condenser temp

  const states = useMemo(() => {
    // Keep boiler comfortably below the apex so it sits under the dome.
    const tB = Math.min(tBoiler, T_CRIT - 10);
    const tC = Math.min(tCond, tB - 20);
    const tSup = tB + dTsup;

    // State 1: saturated liquid leaving condenser (left dome, at T_cond).
    const s1 = sLiquid(tC);
    // State 2: after pump — essentially same s, tiny T rise (near-vertical).
    const s2 = s1;
    const t2 = tC + 6;
    // State 3: turbine inlet — superheated vapor at the vapor-side entropy,
    // pushed right by superheat (entropy grows with superheat).
    const sVapAtB = sVapor(tB);
    const s3 = sVapAtB + (dTsup / 100) * 0.9;
    const t3 = tSup;
    // State 4: after isentropic turbine — vertical drop to condenser T.
    const s4 = s3;
    const t4 = tC;
    return { tB, tC, tSup, s1, s2, t2, s3, t3, s4, t4 };
  }, [tBoiler, dTsup, tCond]);

  // ---- Efficiency proxy (ideal trend, NOT steam-table exact) ----
  const tCondK = states.tC + 273.15;
  const tMeanInK = states.tB + dTsup / 2 + 273.15;
  const etaProxy = Math.max(0, 1 - tCondK / tMeanInK);

  // ---- Cycle path: 1→2 (pump) → 2→3 (boiler, hug dome then superheat) → 3→4 (turbine) → 4→1 (condenser) ----
  const { s1, s2, t2, s3, t3, s4, t4, tB, tC } = states;

  // boiler path 2→3: heat liquid up the liquid line, across the dome at tB, then up into superheat to state 3.
  const boilerPts: [number, number][] = [];
  {
    const steps = 16;
    // 2 → start of boiling: climb liquid saturation line from t2 to tB
    for (let i = 0; i <= steps; i++) {
      const t = t2 + ((tB - t2) * i) / steps;
      boilerPts.push([sLiquid(t), t]);
    }
    // boiling: horizontal across dome at tB (liquid → vapor saturation)
    boilerPts.push([sVapor(tB), tB]);
    // superheat: vapor line out to state 3
    for (let i = 1; i <= steps; i++) {
      const t = tB + ((t3 - tB) * i) / steps;
      const frac = (t - tB) / Math.max(1, t3 - tB);
      const s = sVapor(tB) + (s3 - sVapor(tB)) * frac;
      boilerPts.push([s, t]);
    }
  }

  const toXY = (pts: [number, number][]) =>
    pts.map(([s, t]) => `${xOf(s).toFixed(1)},${yOf(t).toFixed(1)}`).join(" ");

  const cyclePts: [number, number][] = [
    [s1, tC], // 1
    [s2, t2], // 2 (pump)
    ...boilerPts, // 2→3 boiler
    [s4, t4], // 4 (turbine drop)
    [s1, tC], // 4→1 condenser (close)
  ];

  const statePoint = (s: number, t: number, n: string, fill: boolean, dx = 8, dy = -8) => (
    <g key={n}>
      <circle cx={xOf(s)} cy={yOf(t)} r={5} fill={fill ? "var(--accent)" : "var(--color-bg)"} stroke="var(--accent)" strokeWidth={2} />
      <text x={xOf(s) + dx} y={yOf(t) + dy} fontSize={11} fontWeight="700" fill="var(--color-ink)">
        {n}
      </text>
    </g>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* gridlines + T axis labels */}
          {[0, 100, 200, 300, 400, 500, 600].map((t) => (
            <g key={`h${t}`}>
              <line x1={PAD.l} y1={yOf(t)} x2={W - PAD.r} y2={yOf(t)} stroke="var(--color-line)" strokeWidth={1} />
              <text x={PAD.l - 6} y={yOf(t) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                {t}
              </text>
            </g>
          ))}

          {/* axis titles */}
          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Entropy s (kJ/kg·K, schematic)
          </text>
          <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--color-muted)" transform={`rotate(-90 12 ${H / 2})`}>
            Temperature T (°C)
          </text>

          {/* vapor dome */}
          <polyline points={domePath()} fill="var(--color-faint)" opacity={0.12} stroke="var(--color-muted)" strokeWidth={1.5} />
          <text x={xOf(S_CRIT)} y={yOf(T_CRIT) - 6} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
            critical pt
          </text>
          <text x={xOf(sLiquid(120)) - 4} y={yOf(120)} textAnchor="end" fontSize={9} fill="var(--color-faint)">
            sat. liquid
          </text>
          <text x={xOf(sVapor(120)) + 4} y={yOf(120)} textAnchor="start" fontSize={9} fill="var(--color-faint)">
            sat. vapor
          </text>

          {/* shaded net-work area = inside the cycle loop */}
          <polygon points={toXY(cyclePts)} fill="var(--accent)" opacity={0.14} />

          {/* cycle path */}
          <polyline points={toXY(cyclePts)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* state points */}
          {statePoint(s1, tC, "1", false, 8, 12)}
          {statePoint(s2, t2, "2", true, -14, -2)}
          {statePoint(s3, t3, "3", true, 8, -6)}
          {statePoint(s4, t4, "4", true, 8, 14)}
        </svg>

        {/* process legend */}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-faint)] sm:grid-cols-4">
          <span>1→2 pump</span>
          <span>2→3 boiler</span>
          <span>3→4 turbine</span>
          <span>4→1 condenser</span>
        </div>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider label="Boiler temp T boiler" value={tBoiler} min={120} max={360} step={5} unit="°C" onChange={setTBoiler} format={(v) => v.toFixed(0)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="Superheat ΔT sup" value={dTsup} min={0} max={250} step={5} unit="°C" onChange={setDTsup} format={(v) => v.toFixed(0)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="Condenser temp T cond" value={tCond} min={20} max={120} step={2} unit="°C" onChange={setTCond} format={(v) => v.toFixed(0)} />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="Turbine in T₃" value={`${Math.round(states.tSup)} °C`} tone="accent" />
            <Readout label="Mean T in" value={`${Math.round(tMeanInK - 273.15)} °C`} />
          </ReadoutRow>
          <Readout label="η — ideal trend (approx)" value={`${(etaProxy * 100).toFixed(0)} %`} tone="good" />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Proxy: η ≈ 1 − T cond / T mean,in (T in K), with T mean,in ≈ T boiler + ΔT sup/2. Efficiency
          rises with boiler T/pressure and superheat, and falls as condenser pressure/temperature rises.
          Exact values need steam tables — this view is qualitative.
        </p>
      </div>
    </div>
  );
}
