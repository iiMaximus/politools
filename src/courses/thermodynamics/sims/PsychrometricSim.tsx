import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Moist-air (psychrometric) explorer at p = 101.325 kPa.
 * Magnus saturation pressure, humidity ratio, enthalpy, dew point.
 * ------------------------------------------------------------------ */
const P = 101.325; // kPa total

const pSat = (t: number) => 0.61094 * Math.exp((17.625 * t) / (t + 243.04)); // kPa
const omega = (pv: number) => (0.622 * pv) / (P - pv); // kg/kg dry air
// inverse Magnus: t such that pSat(t) = pv
const dewPoint = (pv: number) => {
  if (pv <= 0) return Number.NEGATIVE_INFINITY;
  const ln = Math.log(pv / 0.61094);
  return (243.04 * ln) / (17.625 - ln);
};

const W = 480;
const H = 320;
const PAD = { l: 50, r: 16, t: 14, b: 38 };
const Tmax = 45; // °C
const Wmax = 30; // g/kg
const xOf = (t: number) => PAD.l + (t / Tmax) * (W - PAD.l - PAD.r);
const yOf = (wg: number) => H - PAD.b - (wg / Wmax) * (H - PAD.t - PAD.b);

const RH_CURVES = [20, 40, 60, 80, 100];

// build an RH curve as a polyline (ω in g/kg vs t in °C)
function rhCurve(phi: number): string {
  const pts: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (Tmax * i) / steps;
    const pv = (phi / 100) * pSat(t);
    const wg = omega(pv) * 1000; // g/kg
    if (wg > Wmax * 1.05) break; // off the top of the chart
    pts.push(`${xOf(t).toFixed(1)},${yOf(wg).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function PsychrometricSim() {
  const [t, setT] = useState(25);
  const [phi, setPhi] = useState(50);

  const state = useMemo(() => {
    const ps = pSat(t);
    const pv = (phi / 100) * ps;
    const w = omega(pv); // kg/kg
    const h = 1.006 * t + w * (2500 + 1.875 * t); // kJ/kg dry air
    const tdp = dewPoint(pv);
    return { ps, pv, w, h, tdp };
  }, [t, phi]);

  const wg = state.w * 1000; // g/kg
  const cx = xOf(t);
  const cy = yOf(Math.min(wg, Wmax));

  const curves = useMemo(() => RH_CURVES.map((phiC) => ({ phi: phiC, pts: rhCurve(phiC) })), []);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* horizontal grid (ω) */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const wv = (Wmax / 6) * i;
            return (
              <g key={`h${i}`}>
                <line
                  x1={PAD.l}
                  y1={yOf(wv)}
                  x2={W - PAD.r}
                  y2={yOf(wv)}
                  stroke="var(--color-line)"
                  strokeWidth={1}
                />
                <text x={PAD.l - 6} y={yOf(wv) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                  {Math.round(wv)}
                </text>
              </g>
            );
          })}
          {/* vertical grid (t) */}
          {[0, 9, 18, 27, 36, 45].map((tv) => (
            <g key={`v${tv}`}>
              <line
                x1={xOf(tv)}
                y1={PAD.t}
                x2={xOf(tv)}
                y2={H - PAD.b}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text x={xOf(tv)} y={H - PAD.b + 13} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
                {tv}
              </text>
            </g>
          ))}

          {/* axis labels */}
          <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Dry-bulb temperature t (°C)
          </text>
          <text
            x={13}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-muted)"
            transform={`rotate(-90 13 ${H / 2})`}
          >
            Humidity ratio ω (g/kg dry air)
          </text>

          {/* RH curves */}
          {curves.map((c) => {
            const sat = c.phi === 100;
            return (
              <g key={c.phi}>
                <polyline
                  points={c.pts}
                  fill="none"
                  stroke={sat ? "var(--accent-2)" : "var(--color-muted)"}
                  strokeWidth={sat ? 2.2 : 1.2}
                  opacity={sat ? 0.95 : 0.55}
                />
                <text
                  fontSize={9}
                  fill={sat ? "var(--accent-2)" : "var(--color-faint)"}
                  x={xOf(Tmax) - 2}
                  y={yOf(Math.min(omega((c.phi / 100) * pSat(Tmax)) * 1000, Wmax)) - 3}
                  textAnchor="end"
                >
                  {c.phi}%
                </text>
              </g>
            );
          })}

          {/* current state point */}
          <line x1={cx} y1={H - PAD.b} x2={cx} y2={cy} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={PAD.l} y1={cy} x2={cx} y2={cy} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={6} fill="var(--accent)" stroke="#fff" strokeWidth={1.5} />
        </svg>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Dry-bulb temperature t"
              value={t}
              min={0}
              max={45}
              step={0.5}
              unit="°C"
              onChange={setT}
              format={(v) => v.toFixed(1)}
            />
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Relative humidity φ"
              value={phi}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={setPhi}
              format={(v) => v.toFixed(0)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="ω" value={`${wg.toFixed(1)} g/kg`} tone="accent" />
            <Readout label="h" value={`${state.h.toFixed(1)} kJ/kg`} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="Dew point" value={`${state.tdp.toFixed(1)} °C`} />
            <Readout label="pᵥ" value={`${state.pv.toFixed(2)} kPa`} />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          φ = pᵥ / pₛₐₜ(t). The 100% curve is saturation; cooling the air at fixed ω until it hits
          that curve gives the dew point. Enthalpy h is per kg of dry air.
        </p>
      </div>
    </div>
  );
}
