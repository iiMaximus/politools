import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Composite plane wall, area A = 1 m², steady 1-D conduction with
 * convection on both faces (series thermal resistances).
 *   R_conv,in  = 1/h_in              [m²K/W]
 *   R_cond,i   = L_i / k_i           [m²K/W]
 *   R_conv,out = 1/h_out             [m²K/W]
 *   R_tot = Σ R ,  q = (T_in − T_out)/R_tot  [W/m²] ,  U = 1/R_tot
 * Node temperatures: step T_next = T − q·R across each resistance.
 * ------------------------------------------------------------------ */

const W = 480;
const H = 300;
const PAD = { l: 44, r: 16, t: 18, b: 40 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

type State = {
  Tin: number;
  Tout: number;
  hin: number;
  hout: number;
  L1: number; // cm
  L2: number; // cm
  k1: number;
  k2: number;
};

function compute(s: State) {
  const Rci = 1 / s.hin;
  const R1 = s.L1 / 100 / s.k1;
  const R2 = s.L2 / 100 / s.k2;
  const Rco = 1 / s.hout;
  const Rtot = Rci + R1 + R2 + Rco;
  const q = (s.Tin - s.Tout) / Rtot; // W/m²
  const U = 1 / Rtot;

  // Temperatures stepping from inside fluid outward.
  const Ts1 = s.Tin - q * Rci; // inner wall surface
  const Tmid = Ts1 - q * R1; // interface between layers
  const Ts2 = Tmid - q * R2; // outer wall surface
  // (Ts2 - q*Rco) ≈ Tout, by construction.

  return { Rci, R1, R2, Rco, Rtot, q, U, Ts1, Tmid, Ts2 };
}

export function ConductionWallSim() {
  const [s, setS] = useState<State>({
    Tin: 20,
    Tout: -5,
    hin: 8,
    hout: 25,
    L1: 12,
    L2: 6,
    k1: 0.9,
    k2: 0.04,
  });
  const set = <K extends keyof State>(key: K) => (v: number) =>
    setS((p) => ({ ...p, [key]: v }));

  const r = useMemo(() => compute(s), [s]);

  // ---- temperature axis (auto range with a little margin) ----
  const temps = [s.Tin, s.Tout, r.Ts1, r.Tmid, r.Ts2];
  const tHi = Math.max(...temps);
  const tLo = Math.min(...temps);
  const span = Math.max(tHi - tLo, 1);
  const Ttop = tHi + span * 0.12;
  const Tbot = tLo - span * 0.12;
  const yOf = (t: number) =>
    PAD.t + ((Ttop - t) / (Ttop - Tbot)) * PLOT_H;

  // ---- horizontal layout: thin convection films on each side, solids ∝ L ----
  const Lsum = s.L1 + s.L2;
  const film = PLOT_W * 0.1; // fixed pixel width for each convection film region
  const solidW = PLOT_W - 2 * film;
  const x0 = PAD.l; // inside fluid edge
  const xs1 = x0 + film; // inner wall surface
  const xMid = xs1 + (solidW * s.L1) / Lsum; // layer interface
  const xs2 = xs1 + solidW; // outer wall surface
  const x1 = xs2 + film; // outside fluid edge

  // temperature profile polyline through all nodes
  const profile = [
    [x0, s.Tin],
    [xs1, r.Ts1],
    [xMid, r.Tmid],
    [xs2, r.Ts2],
    [x1, s.Tout],
  ] as const;
  const poly = profile.map(([x, t]) => `${x.toFixed(1)},${yOf(t).toFixed(1)}`).join(" ");

  // y grid ticks
  const ticks = useMemo(() => {
    const out: number[] = [];
    const rough = (Ttop - Tbot) / 4;
    const stepNice = [1, 2, 5, 10, 20, 50].find((d) => d >= rough) ?? 50;
    const start = Math.ceil(Tbot / stepNice) * stepNice;
    for (let t = start; t <= Ttop; t += stepNice) out.push(t);
    return out;
  }, [Ttop, Tbot]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* y grid + temp labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.l}
                y1={yOf(t)}
                x2={W - PAD.r}
                y2={yOf(t)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 6}
                y={yOf(t) + 3}
                textAnchor="end"
                fontSize={9}
                fill="var(--color-faint)"
              >
                {Math.round(t)}
              </text>
            </g>
          ))}

          {/* fluid film regions (light tint) */}
          <rect x={x0} y={PAD.t} width={film} height={PLOT_H} fill="var(--accent)" opacity={0.06} />
          <rect x={xs2} y={PAD.t} width={film} height={PLOT_H} fill="var(--accent-2)" opacity={0.06} />

          {/* solid layers ∝ thickness */}
          <rect
            x={xs1}
            y={PAD.t}
            width={xMid - xs1}
            height={PLOT_H}
            fill="var(--color-surface)"
            stroke="var(--color-line)"
            strokeWidth={1}
          />
          <rect
            x={xMid}
            y={PAD.t}
            width={xs2 - xMid}
            height={PLOT_H}
            fill="var(--color-faint)"
            opacity={0.18}
            stroke="var(--color-line)"
            strokeWidth={1}
          />

          {/* surface / interface guide lines */}
          {[xs1, xMid, xs2].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={PAD.t}
              x2={x}
              y2={H - PAD.b}
              stroke="var(--color-line)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {/* layer labels */}
          <text x={(xs1 + xMid) / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--color-muted)">
            layer 1
          </text>
          <text x={(xMid + xs2) / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--color-muted)">
            layer 2
          </text>
          <text x={x0 + film / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
            in
          </text>
          <text x={xs2 + film / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
            out
          </text>

          {/* temperature profile */}
          <polyline
            points={poly}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {profile.map(([x, t], i) => (
            <circle
              key={i}
              cx={x}
              cy={yOf(t)}
              r={i === 0 || i === profile.length - 1 ? 4 : 4.5}
              fill={i === 0 || i === profile.length - 1 ? "var(--color-bg)" : "var(--accent)"}
              stroke="var(--accent)"
              strokeWidth={2}
            />
          ))}

          {/* axis titles */}
          <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            position through wall (width ∝ thickness)
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
        </svg>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <Slider label="T inside fluid" value={s.Tin} min={-10} max={40} step={1} unit="°C" onChange={set("Tin")} />
          <Slider label="T outside fluid" value={s.Tout} min={-30} max={30} step={1} unit="°C" onChange={set("Tout")} />
          <Slider label="h inside" value={s.hin} min={2} max={30} step={0.5} unit="W/m²K" onChange={set("hin")} format={(v) => v.toFixed(1)} />
          <Slider label="h outside" value={s.hout} min={5} max={60} step={1} unit="W/m²K" onChange={set("hout")} />
          <Slider label="L₁ thickness" value={s.L1} min={1} max={30} step={0.5} unit="cm" onChange={set("L1")} format={(v) => v.toFixed(1)} />
          <Slider label="L₂ thickness" value={s.L2} min={1} max={30} step={0.5} unit="cm" onChange={set("L2")} format={(v) => v.toFixed(1)} />
          <Slider label="k₁ conductivity" value={s.k1} min={0.02} max={2.5} step={0.01} unit="W/mK" onChange={set("k1")} format={(v) => v.toFixed(2)} />
          <Slider label="k₂ conductivity" value={s.k2} min={0.02} max={2.5} step={0.01} unit="W/mK" onChange={set("k2")} format={(v) => v.toFixed(2)} />
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="q (heat flux)" value={`${r.q.toFixed(1)} W/m²`} tone="accent" />
            <Readout label="U" value={`${r.U.toFixed(2)} W/m²K`} tone="accent" />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="T inner surf" value={`${r.Ts1.toFixed(1)} °C`} />
            <Readout label="T interface" value={`${r.Tmid.toFixed(1)} °C`} />
          </ReadoutRow>
          <Readout label="T outer surf" value={`${r.Ts2.toFixed(1)} °C`} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Rₜₒₜ = 1/hᵢₙ + L₁/k₁ + L₂/k₂ + 1/hₒᵤₜ = {r.Rtot.toFixed(3)} m²K/W. The same q flows through every
          layer, so the steepest temperature drop is across the largest resistance.
        </p>
      </div>
    </div>
  );
}
