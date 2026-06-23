import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Straight rectangular fin, insulated (adiabatic) tip.
 * Per unit width: w = 1 m, thickness tk (slider, mm).
 *   P ≈ 2w = 2 m,  A_c = w·tk
 *   m = sqrt(h·P / (k·A_c))
 *   θ(x)/θ_b = cosh(m(L−x)) / cosh(mL),   θ = T − T_inf
 *   η_f = tanh(mL) / (mL)
 *   q_f = sqrt(h·P·k·A_c) · θ_b · tanh(mL)   [per unit width → W/m]
 * ------------------------------------------------------------------ */

const W_FIN = 1; // width, m (per unit width)

function solve(opts: {
  Tb: number;
  Tinf: number;
  Lcm: number;
  tkmm: number;
  h: number;
  k: number;
}) {
  const { Tb, Tinf, Lcm, tkmm, h, k } = opts;
  const L = Lcm / 100; // m
  const tk = tkmm / 1000; // m
  const P = 2 * W_FIN; // perimeter, m
  const Ac = W_FIN * tk; // cross-section, m²
  const m = Math.sqrt((h * P) / (k * Ac)); // 1/m
  const mL = m * L;
  const thetaB = Tb - Tinf; // K
  const eta = mL === 0 ? 1 : Math.tanh(mL) / mL;
  const qf = Math.sqrt(h * P * k * Ac) * thetaB * Math.tanh(mL); // W/m
  const Ttip = Tinf + thetaB / Math.cosh(mL);
  // temperature along the fin
  const N = 60;
  const profile: { x: number; T: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (L * i) / N;
    const T = Tinf + thetaB * (Math.cosh(m * (L - x)) / Math.cosh(mL));
    profile.push({ x, T });
  }
  return { L, m, mL, eta, qf, Ttip, thetaB, profile };
}

const PW = 460;
const PH = 300;
const PAD = { l: 50, r: 16, t: 18, b: 38 };

export function FinSim() {
  const [Tb, setTb] = useState(120);
  const [Tinf, setTinf] = useState(25);
  const [Lcm, setLcm] = useState(8);
  const [tkmm, setTkmm] = useState(3);
  const [h, setH] = useState(40);
  const [k, setK] = useState(200);

  const sol = useMemo(() => solve({ Tb, Tinf, Lcm, tkmm, h, k }), [Tb, Tinf, Lcm, tkmm, h, k]);

  // plot scaling: x in cm (0..Lcm), T in °C
  const Tlo = Math.min(Tinf, sol.Ttip) - 5;
  const Thi = Tb + 5;
  const xOf = (xcm: number) => PAD.l + (xcm / Lcm) * (PW - PAD.l - PAD.r);
  const yOf = (T: number) => PH - PAD.b - ((T - Tlo) / (Thi - Tlo)) * (PH - PAD.t - PAD.b);

  const poly = sol.profile
    .map((p) => `${xOf(p.x * 100).toFixed(1)},${yOf(p.T).toFixed(1)}`)
    .join(" ");

  // y grid ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const span = Thi - Tlo;
    const step = span / 4;
    for (let i = 0; i <= 4; i++) ticks.push(Tlo + step * i);
    return ticks;
  }, [Tlo, Thi]);

  // ambient reference line
  const yAmb = yOf(Tinf);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg viewBox={`0 0 ${PW} ${PH}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* horizontal grid + T labels */}
          {yTicks.map((T, i) => (
            <g key={`h${i}`}>
              <line
                x1={PAD.l}
                y1={yOf(T)}
                x2={PW - PAD.r}
                y2={yOf(T)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text x={PAD.l - 6} y={yOf(T) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                {Math.round(T)}
              </text>
            </g>
          ))}

          {/* x ticks (cm) */}
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const xcm = Lcm * f;
            return (
              <text
                key={`x${i}`}
                x={xOf(xcm)}
                y={PH - PAD.b + 14}
                textAnchor="middle"
                fontSize={9}
                fill="var(--color-faint)"
              >
                {xcm.toFixed(1)}
              </text>
            );
          })}

          {/* axis labels */}
          <text x={PW / 2} y={PH - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Distance from base x (cm)
          </text>
          <text
            x={13}
            y={PH / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-muted)"
            transform={`rotate(-90 13 ${PH / 2})`}
          >
            Temperature T (°C)
          </text>

          {/* ambient line */}
          <line
            x1={PAD.l}
            y1={yAmb}
            x2={PW - PAD.r}
            y2={yAmb}
            stroke="var(--color-muted)"
            strokeWidth={1}
            strokeDasharray="5 4"
          />
          <text x={PW - PAD.r} y={yAmb - 4} textAnchor="end" fontSize={9} fill="var(--color-muted)">
            T∞ = {Math.round(Tinf)} °C
          </text>

          {/* temperature profile */}
          <polyline points={poly} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />

          {/* base point */}
          <circle cx={xOf(0)} cy={yOf(Tb)} r={5} fill="#fff" stroke="var(--accent)" strokeWidth={2} />
          <text x={xOf(0) + 8} y={yOf(Tb) - 6} fontSize={10} fill="var(--color-ink)" fontWeight="700">
            base
          </text>

          {/* tip point */}
          <circle cx={xOf(Lcm)} cy={yOf(sol.Ttip)} r={5} fill="var(--accent-2)" />
          <text x={xOf(Lcm) - 6} y={yOf(sol.Ttip) - 8} textAnchor="end" fontSize={10} fill="var(--color-ink)" fontWeight="700">
            tip
          </text>
        </svg>

        {/* fin schematic, color = temperature */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-[var(--color-faint)]">Fin</span>
          <div className="relative h-7 flex-1 overflow-hidden rounded-md border border-[var(--color-line)]">
            {sol.profile.map((p, i) => {
              if (i === sol.profile.length - 1) return null;
              const frac = (p.T - Tinf) / (sol.thetaB || 1); // 0..1 hot→cool
              const lerp = Math.max(0, Math.min(1, frac));
              return (
                <div
                  key={i}
                  className="absolute inset-y-0"
                  style={{
                    left: `${(i / sol.profile.length) * 100}%`,
                    width: `${(1 / sol.profile.length) * 100 + 0.6}%`,
                    background: `color-mix(in srgb, var(--accent) ${(lerp * 100).toFixed(0)}%, var(--color-surface))`,
                  }}
                />
              );
            })}
            <span className="absolute inset-y-0 left-1 grid place-items-center text-[10px] font-mono text-[#06080f]">
              hot base
            </span>
          </div>
        </div>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <Slider label="Base T (base)" value={Tb} min={40} max={300} step={5} unit="°C" onChange={setTb} />
          <Slider label="Ambient T∞" value={Tinf} min={0} max={80} step={5} unit="°C" onChange={setTinf} />
          <Slider label="Length L" value={Lcm} min={1} max={20} step={0.5} unit="cm" onChange={setLcm} format={(v) => v.toFixed(1)} />
          <Slider label="Thickness t" value={tkmm} min={0.5} max={10} step={0.5} unit="mm" onChange={setTkmm} format={(v) => v.toFixed(1)} />
          <Slider label="h (conv.)" value={h} min={5} max={200} step={5} unit="W/m²K" onChange={setH} />
          <Slider label="k (cond.)" value={k} min={10} max={400} step={5} unit="W/mK" onChange={setK} />
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="m" value={`${sol.m.toFixed(1)} 1/m`} />
            <Readout label="mL" value={sol.mL.toFixed(2)} tone="accent" />
          </ReadoutRow>
          <ReadoutRow>
            <Readout
              label="η (fin)"
              value={`${(sol.eta * 100).toFixed(1)} %`}
              tone={sol.eta >= 0.6 ? "good" : sol.eta >= 0.4 ? "default" : "bad"}
            />
            <Readout label="T tip" value={`${sol.Ttip.toFixed(1)} °C`} />
          </ReadoutRow>
          <Readout label="q (fin, per metre width)" value={`${sol.qf.toFixed(1)} W/m`} tone="accent" />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Insulated tip: θ/θ(base) = cosh(m(L−x))/cosh(mL). Long, thin, low-k fins (large mL) waste
          material — η (fin) = tanh(mL)/(mL) drops, yet total q (fin) keeps rising with length.
        </p>
      </div>
    </div>
  );
}
