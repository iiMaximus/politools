import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Vapor-compression refrigeration / heat-pump explorer (qualitative).
 *
 * Carnot (ideal, reversible) limits, with T in kelvin:
 *   refrigerator  β = T_evap / (T_cond − T_evap)
 *   heat pump     γ = T_cond / (T_cond − T_evap) = β + 1
 * Real cycles fall short of these because of irreversibilities
 * (compressor inefficiency, throttling, finite-ΔT heat exchange).
 *
 * Smaller temperature lift (T_cond − T_evap) ⇒ larger COP.
 * ------------------------------------------------------------------ */

const KELVIN = 273.15;

// Loop schematic geometry
const W = 460;
const H = 300;

export function RefrigerationSim() {
  const [tEvap, setTEvap] = useState(-10); // °C, cold side
  const [tCond, setTCond] = useState(40); // °C, hot side

  // Enforce T_cond > T_evap with a small guaranteed lift.
  const MIN_LIFT = 2;
  const tCondEff = Math.max(tCond, tEvap + MIN_LIFT);

  const r = useMemo(() => {
    const Te = tEvap + KELVIN; // K
    const Tc = tCondEff + KELVIN; // K
    const lift = Tc - Te; // K, always ≥ MIN_LIFT
    const beta = Te / lift; // COP refrigerator (Carnot)
    const gamma = Tc / lift; // COP heat pump (Carnot)
    return { Te, Tc, lift, beta, gamma };
  }, [tEvap, tCondEff]);

  // Map COP magnitude to a qualitative bar (β can run large at tiny lift).
  const betaBar = Math.min(1, r.beta / 12);
  const liftTone = r.lift <= 25 ? "good" : r.lift <= 55 ? "warn" : "bad";
  const liftColor =
    liftTone === "good" ? "var(--good)" : liftTone === "warn" ? "var(--warn)" : "var(--bad)";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* hot reservoir band (top) */}
          <rect x={16} y={14} width={W - 32} height={26} rx={6} fill="var(--bad)" opacity={0.14} />
          <text x={W / 2} y={31} textAnchor="middle" fontSize={11} fill="var(--bad)" fontWeight={700}>
            Hot space (warm side) — {Math.round(tCondEff)} °C
          </text>

          {/* cold reservoir band (bottom) */}
          <rect x={16} y={H - 40} width={W - 32} height={26} rx={6} fill="var(--accent)" opacity={0.14} />
          <text x={W / 2} y={H - 23} textAnchor="middle" fontSize={11} fill="var(--accent)" fontWeight={700}>
            Cold space (refrigerated) — {Math.round(tEvap)} °C
          </text>

          {/* ---- four components, clockwise loop ---- */}
          {/* condenser (top), evaporator (bottom), compressor (right), valve (left) */}
          {(() => {
            const bx = 150;
            const bw = 160;
            const comp = { x: 330, y: 130, w: 64, h: 60 };
            const valve = { x: 66, y: 130, w: 64, h: 60 };
            const cond = { x: bx, y: 64, w: bw, h: 40 };
            const evap = { x: bx, y: 196, w: bw, h: 40 };
            const box = (
              x: number,
              y: number,
              w: number,
              h: number,
              label: string,
              sub: string,
              stroke: string,
            ) => (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={8}
                  fill="var(--color-surface)"
                  stroke={stroke}
                  strokeWidth={2}
                />
                <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" fontSize={11} fill="var(--color-ink)" fontWeight={700}>
                  {label}
                </text>
                <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize={9} fill="var(--color-muted)">
                  {sub}
                </text>
              </g>
            );

            // refrigerant loop path (rounded rectangle skeleton between components)
            const cy = 150;
            const loop = `M ${cond.x + cond.w} ${cond.y + cond.h / 2}
              H ${comp.x + comp.w / 2} V ${cy}
              V ${evap.y + evap.h / 2} H ${evap.x + evap.w}`;
            const loop2 = `M ${evap.x} ${evap.y + evap.h / 2}
              H ${valve.x + valve.w / 2} V ${cy}
              V ${cond.y + cond.h / 2} H ${cond.x}`;

            return (
              <g>
                {/* refrigerant piping */}
                <path d={loop} fill="none" stroke="var(--color-line)" strokeWidth={3} />
                <path d={loop2} fill="none" stroke="var(--color-line)" strokeWidth={3} />

                {/* flow direction arrows on the loop */}
                <polygon points={`${comp.x + comp.w / 2},${cy + 6} ${comp.x + comp.w / 2 - 5},${cy + 16} ${comp.x + comp.w / 2 + 5},${cy + 16}`} fill="var(--color-muted)" />
                <polygon points={`${valve.x + valve.w / 2},${cy - 6} ${valve.x + valve.w / 2 - 5},${cy - 16} ${valve.x + valve.w / 2 + 5},${cy - 16}`} fill="var(--color-muted)" />

                {box(cond.x, cond.y, cond.w, cond.h, "Condenser", "rejects heat", "var(--bad)")}
                {box(evap.x, evap.y, evap.w, evap.h, "Evaporator", "absorbs heat", "var(--accent)")}
                {box(comp.x, comp.y, comp.w, comp.h, "Comp.", "+W", "var(--accent-2)")}
                {box(valve.x, valve.y, valve.w, valve.h, "Valve", "throttle", "var(--color-muted)")}

                {/* Q_out: condenser -> hot space */}
                <line x1={cond.x + cond.w / 2} y1={cond.y} x2={cond.x + cond.w / 2} y2={42} stroke="var(--bad)" strokeWidth={2.5} markerEnd="url(#arrHot)" />
                <text x={cond.x + cond.w / 2 + 8} y={54} fontSize={10} fill="var(--bad)" fontWeight={700}>
                  Q out
                </text>

                {/* Q_in: cold space -> evaporator */}
                <line x1={evap.x + evap.w / 2} y1={H - 42} x2={evap.x + evap.w / 2} y2={evap.y + evap.h} stroke="var(--accent)" strokeWidth={2.5} markerEnd="url(#arrCold)" />
                <text x={evap.x + evap.w / 2 + 8} y={H - 50} fontSize={10} fill="var(--accent)" fontWeight={700}>
                  Q in
                </text>

                {/* W: work input into compressor */}
                <line x1={comp.x + comp.w + 18} y1={comp.y + comp.h / 2} x2={comp.x + comp.w} y2={comp.y + comp.h / 2} stroke="var(--accent-2)" strokeWidth={2.5} markerEnd="url(#arrW)" />
                <text x={comp.x + comp.w + 22} y={comp.y + comp.h / 2 + 4} fontSize={10} fill="var(--accent-2)" fontWeight={700}>
                  W
                </text>
              </g>
            );
          })()}

          <defs>
            <marker id="arrHot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--bad)" />
            </marker>
            <marker id="arrCold" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
            <marker id="arrW" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-2)" />
            </marker>
          </defs>
        </svg>

        {/* COP magnitude bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between text-xs text-[var(--color-faint)]">
            <span>Refrigerator COP (β)</span>
            <span className="font-mono">temperature lift {Math.round(r.lift)} K</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-surface)] border border-[var(--color-line)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${betaBar * 100}%`, background: "var(--accent)", transition: "width .2s" }}
            />
          </div>
        </div>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label="Evaporator T evap (cold)"
              value={tEvap}
              min={-40}
              max={20}
              step={1}
              unit="°C"
              onChange={(v) => setTEvap(v)}
              format={(v) => v.toFixed(0)}
            />
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Condenser T cond (hot)"
              value={tCond}
              min={-10}
              max={80}
              step={1}
              unit="°C"
              onChange={(v) => setTCond(v)}
              format={(v) => v.toFixed(0)}
            />
          </div>
        </SimControls>

        {tCond < tEvap + MIN_LIFT && (
          <p className="mt-2 text-xs font-medium" style={{ color: "var(--warn)" }}>
            T cond must exceed T evap — clamped to {Math.round(tCondEff)} °C.
          </p>
        )}

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="T evap" value={`${Math.round(r.Te)} K`} tone="accent" />
            <Readout label="T cond" value={`${Math.round(r.Tc)} K`} tone="bad" />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="β (fridge)" value={r.beta.toFixed(2)} tone="good" />
            <Readout label="γ (heat pump)" value={r.gamma.toFixed(2)} tone="good" />
          </ReadoutRow>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
              Temperature lift
            </div>
            <div className="font-mono text-lg font-bold leading-tight" style={{ color: liftColor }}>
              {Math.round(r.lift)} K
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Carnot limits: β = T evap/(T cond−T evap), γ = T cond/(T cond−T evap) = β + 1 (T in K).
          Smaller lift ⇒ higher COP. Real cycles score lower because of irreversibilities
          (compressor losses, throttling, finite-ΔT heat exchange).
        </p>
      </div>
    </div>
  );
}
