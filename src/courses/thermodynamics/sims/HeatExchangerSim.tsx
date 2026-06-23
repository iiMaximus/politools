import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Heat-exchanger ε–NTU explorer.
 * Fixed inlet temps, C_min on the HOT side (so the hot fluid sees the
 * full temperature drop ΔT_h = ε · (T_hi − T_ci)).
 *   ε = q / q_max,  q_max = C_min (T_hi − T_ci)
 *   T_ho = T_hi − ε ΔT_in
 *   T_co = T_ci + ε C_R ΔT_in           (energy balance: C_h ΔT_h = C_c ΔT_c)
 * ------------------------------------------------------------------ */
const T_HI = 80; // °C, hot inlet
const T_CI = 20; // °C, cold inlet

type Flow = "parallel" | "counter";

function effectiveness(flow: Flow, ntu: number, cr: number): number {
  if (flow === "parallel") {
    return (1 - Math.exp(-ntu * (1 + cr))) / (1 + cr);
  }
  // counter-flow
  if (cr >= 0.999) return ntu / (1 + ntu);
  const e = Math.exp(-ntu * (1 - cr));
  return (1 - e) / (1 - cr * e);
}

const W = 460;
const H = 300;
const PAD = { l: 46, r: 16, t: 18, b: 38 };
const xOf = (f: number) => PAD.l + f * (W - PAD.l - PAD.r); // f in [0,1] along length
const Tmin = 10;
const Tmax = 90;
const yOf = (t: number) => H - PAD.b - ((t - Tmin) / (Tmax - Tmin)) * (H - PAD.t - PAD.b);

/* Temperature profiles along the exchanger length (x = 0..1).
 * The local heat-transfer rate decays exponentially with the
 * accumulated NTU, giving the standard analytic profiles. */
function profiles(flow: Flow, ntu: number, cr: number, eps: number) {
  const dT = T_HI - T_CI;
  const Tho = T_HI - eps * dT;
  const Tco = T_CI + eps * cr * dT;

  const steps = 60;
  const hot: [number, number][] = [];
  const cold: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const x = i / steps; // fraction of length / total NTU
    let th: number;
    let tc: number;
    if (flow === "parallel") {
      // both inlets at x=0; local ΔT decays as exp(-NTU(1+C_R) x)
      const frac = (1 - Math.exp(-ntu * (1 + cr) * x)) / (1 - Math.exp(-ntu * (1 + cr)) || 1);
      th = T_HI - (T_HI - Tho) * frac;
      tc = T_CI + (Tco - T_CI) * frac;
    } else {
      // counter-flow: hot enters at x=0, cold enters at x=1.
      let frac: number;
      if (cr >= 0.999) {
        frac = x; // ΔT is constant → linear profiles
      } else {
        const denom = 1 - cr * Math.exp(-ntu * (1 - cr)) || 1;
        frac = (1 - Math.exp(-ntu * (1 - cr) * x)) / denom;
      }
      th = T_HI - (T_HI - Tho) * frac;
      // cold flows opposite: its outlet (Tco) is at x=0, inlet (T_ci) at x=1
      tc = T_CI + (Tco - T_CI) * (1 - x);
    }
    hot.push([x, th]);
    cold.push([x, tc]);
  }
  return { hot, cold, Tho, Tco };
}

const poly = (pts: [number, number][]) =>
  pts.map(([x, t]) => `${xOf(x).toFixed(1)},${yOf(t).toFixed(1)}`).join(" ");

export function HeatExchangerSim() {
  const [flow, setFlow] = useState<Flow>("counter");
  const [ntu, setNtu] = useState(2);
  const [cr, setCr] = useState(0.6);

  const eps = useMemo(() => effectiveness(flow, ntu, cr), [flow, ntu, cr]);
  const { hot, cold, Tho, Tco } = useMemo(
    () => profiles(flow, ntu, cr, eps),
    [flow, ntu, cr, eps]
  );

  const epsCounter = effectiveness("counter", ntu, cr);
  const epsParallel = effectiveness("parallel", ntu, cr);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <SimButton active={flow === "parallel"} onClick={() => setFlow("parallel")}>
            Parallel-flow
          </SimButton>
          <SimButton active={flow === "counter"} onClick={() => setFlow("counter")}>
            Counter-flow
          </SimButton>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* horizontal grid + T labels */}
          {[10, 30, 50, 70, 90].map((t) => (
            <g key={`h${t}`}>
              <line
                x1={PAD.l}
                y1={yOf(t)}
                x2={W - PAD.r}
                y2={yOf(t)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text x={PAD.l - 6} y={yOf(t) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                {t}
              </text>
            </g>
          ))}

          {/* axis labels */}
          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Position along exchanger (hot inlet → hot outlet)
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-muted)"
            transform={`rotate(-90 12 ${H / 2})`}
          >
            Temperature (°C)
          </text>

          {/* hot profile */}
          <polyline
            points={poly(hot)}
            fill="none"
            stroke="var(--bad)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* cold profile */}
          <polyline
            points={poly(cold)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* inlet / outlet markers */}
          <circle cx={xOf(0)} cy={yOf(T_HI)} r={4} fill="var(--bad)" />
          <text x={xOf(0) + 6} y={yOf(T_HI) - 6} fontSize={9} fill="var(--color-ink)">
            hot in
          </text>
          <circle cx={xOf(1)} cy={yOf(Tho)} r={4} fill="var(--bad)" />
          <circle cx={xOf(flow === "counter" ? 1 : 0)} cy={yOf(T_CI)} r={4} fill="var(--accent)" />
          <text
            x={xOf(flow === "counter" ? 1 : 0) + (flow === "counter" ? -6 : 6)}
            y={yOf(T_CI) + 14}
            textAnchor={flow === "counter" ? "end" : "start"}
            fontSize={9}
            fill="var(--color-ink)"
          >
            cold in
          </text>

          {/* legend */}
          <g>
            <line x1={W - 120} y1={PAD.t + 4} x2={W - 104} y2={PAD.t + 4} stroke="var(--bad)" strokeWidth={2.5} />
            <text x={W - 100} y={PAD.t + 7} fontSize={9} fill="var(--color-muted)">
              hot
            </text>
            <line x1={W - 70} y1={PAD.t + 4} x2={W - 54} y2={PAD.t + 4} stroke="var(--accent)" strokeWidth={2.5} />
            <text x={W - 50} y={PAD.t + 7} fontSize={9} fill="var(--color-muted)">
              cold
            </text>
          </g>
        </svg>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="NTU = UA / Cₘᵢₙ"
              value={ntu}
              min={0}
              max={6}
              step={0.1}
              onChange={setNtu}
              format={(v) => v.toFixed(1)}
            />
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Capacity ratio Cᵣ = Cₘᵢₙ / Cₘₐₓ"
              value={cr}
              min={0}
              max={1}
              step={0.05}
              onChange={setCr}
              format={(v) => v.toFixed(2)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="ε" value={eps.toFixed(3)} tone="accent" />
            <Readout label="q / qₘₐₓ" value={eps.toFixed(3)} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="Hot out" value={`${Tho.toFixed(1)} °C`} tone="bad" />
            <Readout label="Cold out" value={`${Tco.toFixed(1)} °C`} tone="good" />
          </ReadoutRow>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-muted)]">
          Same NTU &amp; Cᵣ:&nbsp;
          <span className="font-mono font-semibold text-[var(--color-ink)]">
            ε counter {epsCounter.toFixed(3)}
          </span>{" "}
          ≥{" "}
          <span className="font-mono font-semibold text-[var(--color-ink)]">
            ε parallel {epsParallel.toFixed(3)}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Inlets fixed at hot in = {T_HI} °C, cold in = {T_CI} °C with Cₘᵢₙ on the hot side.
          Counter-flow reaches higher effectiveness than parallel-flow at the same NTU, and as
          NTU → ∞ counter-flow approaches ε = 1 while parallel-flow saturates at 1/(1+Cᵣ).
        </p>
      </div>
    </div>
  );
}
