import { useState, useMemo } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Carnot cycle explorer on a T–s diagram.
 * The reversible Carnot cycle is a rectangle in T–s coordinates:
 *   top isotherm at T_H (heat in Q_in), bottom isotherm at T_C
 *   (heat out Q_out), connected by two vertical isentropes.
 * With T in kelvin:
 *   η      = 1 − T_C/T_H            (power cycle)
 *   β (COP)= T_C/(T_H − T_C)        (refrigerator)
 *   γ (COP)= T_H/(T_H − T_C)        (heat pump)
 * ------------------------------------------------------------------ */

const C2K = (c: number) => c + 273.15;

const W = 460;
const H = 300;
const PAD = { l: 46, r: 16, t: 22, b: 38 };
const Tmax = 1100; // K, axis ceiling
const sMin = 0.4; // arbitrary entropy window (kJ/kg·K) for the rectangle
const sMax = 2.2;

const xOf = (s: number) => PAD.l + ((s - sMin) / (sMax - sMin)) * (W - PAD.l - PAD.r);
const yOf = (T: number) => H - PAD.b - (T / Tmax) * (H - PAD.t - PAD.b);

export function CarnotSim() {
  const [tHc, setTHc] = useState(450); // °C
  const [tCc, setTCc] = useState(25); // °C

  const { TH, TC, eta, beta, gamma } = useMemo(() => {
    let TH = C2K(tHc);
    let TC = C2K(tCc);
    // enforce T_H > T_C with a small floor so denominators stay finite
    if (TC >= TH) TC = TH - 1;
    return {
      TH,
      TC,
      eta: 1 - TC / TH,
      beta: TC / (TH - TC),
      gamma: TH / (TH - TC),
    };
  }, [tHc, tCc]);

  // rectangle corners on the T–s plane (the two isentropes span [sMin, sMax])
  const xL = xOf(sMin);
  const xR = xOf(sMax);
  const yH = yOf(TH);
  const yC = yOf(TC);

  // gridlines for the temperature axis
  const Tgrid = [0, 200, 400, 600, 800, 1000];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* temperature gridlines */}
          {Tgrid.map((T) => (
            <g key={`g${T}`}>
              <line
                x1={PAD.l}
                y1={yOf(T)}
                x2={W - PAD.r}
                y2={yOf(T)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text x={PAD.l - 6} y={yOf(T) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                {T}
              </text>
            </g>
          ))}

          {/* axis labels */}
          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Entropy s (kJ/kg·K)
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-muted)"
            transform={`rotate(-90 12 ${H / 2})`}
          >
            Temperature T (K)
          </text>

          {/* Q_in band along the top isotherm (area under T_H down to T_C) */}
          <rect
            x={xL}
            y={yH}
            width={xR - xL}
            height={yC - yH}
            fill="var(--accent-2)"
            opacity={0.14}
          />
          {/* net work = enclosed rectangle (same region, emphasised) */}
          <rect
            x={xL}
            y={yH}
            width={xR - xL}
            height={yC - yH}
            fill="var(--accent)"
            opacity={0.18}
          />

          {/* the four process lines of the Carnot rectangle */}
          {/* top isotherm: heat addition at T_H (1→2) */}
          <line x1={xL} y1={yH} x2={xR} y2={yH} stroke="var(--accent-2)" strokeWidth={3} strokeLinecap="round" />
          {/* bottom isotherm: heat rejection at T_C (3→4) */}
          <line x1={xR} y1={yC} x2={xL} y2={yC} stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
          {/* right isentrope: expansion (2→3) */}
          <line x1={xR} y1={yH} x2={xR} y2={yC} stroke="var(--color-ink)" strokeWidth={2} strokeDasharray="4 3" />
          {/* left isentrope: compression (4→1) */}
          <line x1={xL} y1={yC} x2={xL} y2={yH} stroke="var(--color-ink)" strokeWidth={2} strokeDasharray="4 3" />

          {/* labels for the isotherms */}
          <text x={(xL + xR) / 2} y={yH - 6} textAnchor="middle" fontSize={10} fontWeight="700" fill="var(--accent-2)">
            Qᵢₙ  @ T hot = {Math.round(TH)} K
          </text>
          <text x={(xL + xR) / 2} y={yC + 14} textAnchor="middle" fontSize={10} fontWeight="700" fill="var(--accent)">
            Q out @ T cold = {Math.round(TC)} K
          </text>
          <text x={(xL + xR) / 2} y={(yH + yC) / 2 + 3} textAnchor="middle" fontSize={11} fontWeight="700" fill="var(--color-ink)">
            W net
          </text>

          {/* corner state points */}
          {[
            [xL, yH, "1"],
            [xR, yH, "2"],
            [xR, yC, "3"],
            [xL, yC, "4"],
          ].map(([cx, cy, n]) => (
            <g key={`p${n}`}>
              <circle cx={cx as number} cy={cy as number} r={4} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={1.5} />
            </g>
          ))}
        </svg>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Hot reservoir T hot"
              value={tHc}
              min={50}
              max={800}
              step={5}
              unit="°C"
              onChange={setTHc}
              format={(v) => v.toFixed(0)}
            />
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Cold reservoir T cold"
              value={tCc}
              min={-40}
              max={500}
              step={5}
              unit="°C"
              onChange={setTCc}
              format={(v) => v.toFixed(0)}
            />
          </div>
        </SimControls>

        <div className="mt-4">
          <Readout label="Carnot efficiency η = 1 − T cold/T hot" value={`${(eta * 100).toFixed(1)} %`} tone="accent" />
        </div>

        <div className="mt-2 space-y-2">
          <ReadoutRow>
            <Readout label="η" value={eta.toFixed(3)} tone="good" />
            <Readout label="T cold/T hot" value={(TC / TH).toFixed(3)} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="Fridge COP β" value={beta.toFixed(2)} tone="accent" />
            <Readout label="Heat-pump COP γ" value={gamma.toFixed(2)} tone="accent" />
          </ReadoutRow>
        </div>

        {tCc >= tHc && (
          <p className="mt-3 text-xs font-semibold text-[var(--bad)]">
            T cold must stay below T hot — clamped so the cycle stays valid.
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          The rectangle area is the net work W net = (T hot − T cold)·Δs; the full band under the top
          isotherm is Qᵢₙ = T hot·Δs. Efficiency η rises as the ratio T cold/T hot falls — raise T hot or
          lower T cold and watch η grow (γ = β + 1 always holds).
        </p>
      </div>
    </div>
  );
}
