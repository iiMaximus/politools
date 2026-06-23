import { useEffect, useRef, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Free vibration of a 1-DOF mass-spring-damper:  m x'' + c x' + k x = 0
 * Initial conditions:  x(0) = x0,  x'(0) = 0.
 *
 *   wn   = sqrt(k/m)                        natural angular frequency
 *   zeta = c / (2 sqrt(k m))                damping ratio
 *   wd   = wn sqrt(1 - zeta^2)              damped frequency (zeta < 1)
 *
 * Closed-form free responses (x'(0) = 0):
 *   under-damped (zeta<1):  x = x0 e^{-zeta wn t}[cos(wd t) + (zeta wn / wd) sin(wd t)]
 *   critical (zeta=1):      x = x0 e^{-wn t}(1 + wn t)
 *   over-damped (zeta>1):   x = x0 e^{-zeta wn t}[cosh(wq t) + (zeta wn / wq) sinh(wq t)]
 *                           with wq = wn sqrt(zeta^2 - 1)
 * ------------------------------------------------------------------ */

const T_WINDOW = 8; // seconds shown on the plot

function response(m: number, k: number, c: number, x0: number, t: number): number {
  const wn = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  if (zeta < 1 - 1e-9) {
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    const e = Math.exp(-zeta * wn * t);
    return x0 * e * (Math.cos(wd * t) + ((zeta * wn) / wd) * Math.sin(wd * t));
  } else if (zeta > 1 + 1e-9) {
    const wq = wn * Math.sqrt(zeta * zeta - 1);
    const e = Math.exp(-zeta * wn * t);
    return x0 * e * (Math.cosh(wq * t) + ((zeta * wn) / wq) * Math.sinh(wq * t));
  }
  // critical
  const e = Math.exp(-wn * t);
  return x0 * e * (1 + wn * t);
}

const W = 460;
const H = 280;
const PAD = { l: 40, r: 14, t: 14, b: 30 };
const X0 = 1; // unit initial displacement (normalized)
const YSPAN = 1.15; // plot covers x in [-YSPAN, +YSPAN] * x0

const xOf = (t: number) => PAD.l + (t / T_WINDOW) * (W - PAD.l - PAD.r);
const yOf = (x: number) => (H - PAD.b + PAD.t) / 2 - (x / YSPAN) * ((H - PAD.t - PAD.b) / 2);

export function MassSpringSim() {
  const [m, setM] = useState(2); // kg
  const [k, setK] = useState(50); // N/m
  const [c, setC] = useState(6); // N·s/m

  const wn = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const regime =
    zeta < 1 - 1e-6 ? "Under-damped" : zeta > 1 + 1e-6 ? "Over-damped" : "Critically damped";
  const cCrit = 2 * Math.sqrt(k * m);
  const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;

  // ---- sampled response curve -------------------------------------------
  const N = 240;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (T_WINDOW * i) / N;
    pts.push(`${xOf(t).toFixed(1)},${yOf(response(m, k, c, X0, t)).toFixed(1)}`);
  }
  const curve = pts.join(" ");

  // ---- decay envelope (under-damped only): A = x0/sqrt(1-zeta^2) e^{-zeta wn t}
  let envUp = "";
  let envLo = "";
  if (zeta < 1 - 1e-6) {
    const up: string[] = [];
    const lo: string[] = [];
    const amp = X0 / Math.sqrt(1 - zeta * zeta);
    for (let i = 0; i <= N; i++) {
      const t = (T_WINDOW * i) / N;
      const a = amp * Math.exp(-zeta * wn * t);
      up.push(`${xOf(t).toFixed(1)},${yOf(a).toFixed(1)}`);
      lo.push(`${xOf(t).toFixed(1)},${yOf(-a).toFixed(1)}`);
    }
    envUp = up.join(" ");
    envLo = lo.join(" ");
  }

  // ---- animated bob (looping over the time window) -----------------------
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  useEffect(() => {
    start.current = null;
    const tick = (now: number) => {
      if (start.current === null) start.current = now;
      const elapsed = ((now - start.current) / 1000) % T_WINDOW;
      setT(elapsed);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const xNow = response(m, k, c, X0, t);
  // bob geometry: rest at center, displaced vertically (downwards positive)
  const bobRestY = 64;
  const bobY = bobRestY + xNow * 40;
  const anchorY = 12;
  const bobX = 30;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <div className="flex gap-4">
          {/* animated spring-mass */}
          <svg viewBox="0 0 60 140" className="h-[280px] w-16 shrink-0 rounded-xl bg-[var(--color-bg)]">
            <line x1={6} y1={anchorY} x2={54} y2={anchorY} stroke="var(--color-line)" strokeWidth={2} />
            {/* zig-zag spring from anchor to bob */}
            <polyline
              points={(() => {
                const segs = 8;
                const top = anchorY;
                const bot = bobY - 12;
                const out: string[] = [`${bobX},${top}`];
                for (let i = 1; i < segs; i++) {
                  const yy = top + ((bot - top) * i) / segs;
                  out.push(`${bobX + (i % 2 === 0 ? 9 : -9)},${yy.toFixed(1)}`);
                }
                out.push(`${bobX},${bot.toFixed(1)}`);
                return out.join(" ");
              })()}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.6}
            />
            <rect
              x={bobX - 11}
              y={bobY - 11}
              width={22}
              height={22}
              rx={4}
              fill="var(--accent)"
              opacity={0.85}
            />
            {/* rest-position marker */}
            <line
              x1={6}
              y1={bobRestY}
              x2={54}
              y2={bobRestY}
              stroke="var(--color-faint)"
              strokeWidth={0.8}
              strokeDasharray="3 3"
            />
          </svg>

          {/* response plot */}
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
            {/* zero axis */}
            <line x1={PAD.l} y1={yOf(0)} x2={W - PAD.r} y2={yOf(0)} stroke="var(--color-line)" strokeWidth={1} />
            {/* time gridlines */}
            {[0, 2, 4, 6, 8].map((tt) => (
              <g key={`t${tt}`}>
                <line x1={xOf(tt)} y1={PAD.t} x2={xOf(tt)} y2={H - PAD.b} stroke="var(--color-line)" strokeWidth={0.6} />
                <text x={xOf(tt)} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
                  {tt}
                </text>
              </g>
            ))}
            <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
              time t (s)
            </text>
            <text x={11} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--color-muted)" transform={`rotate(-90 11 ${H / 2})`}>
              x(t)
            </text>

            {/* envelope (under-damped) */}
            {envUp && <polyline points={envUp} fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.55} />}
            {envLo && <polyline points={envLo} fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.55} />}

            {/* response curve */}
            <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" />

            {/* moving marker tied to the animation */}
            <circle cx={xOf(t)} cy={yOf(xNow)} r={4} fill="#fff" stroke="var(--accent)" strokeWidth={2} />
          </svg>
        </div>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider label="Mass m" value={m} min={0.5} max={6} step={0.1} unit="kg" onChange={setM} format={(v) => v.toFixed(1)} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="Stiffness k" value={k} min={10} max={200} step={1} unit="N/m" onChange={setK} />
          </div>
          <div className="sm:col-span-2">
            <Slider label="Damping c" value={c} min={0} max={120} step={0.5} unit="N·s/m" onChange={setC} format={(v) => v.toFixed(1)} />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <Readout label="Regime" value={regime} tone={regime === "Critically damped" ? "accent" : regime === "Over-damped" ? "bad" : "good"} />
          <ReadoutRow>
            <Readout label="ωₙ" value={`${wn.toFixed(2)} rad/s`} tone="accent" />
            <Readout label="ζ" value={zeta.toFixed(3)} tone={zeta < 1 ? "good" : "bad"} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="ω_d" value={zeta < 1 ? `${wd.toFixed(2)} rad/s` : "—"} />
            <Readout label="c_crit" value={`${cCrit.toFixed(1)}`} />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Drag c up: as ζ crosses 1 (c = c_crit = 2√(km)) the oscillation disappears and the curve
          returns to rest without overshooting. ω_d &lt; ωₙ always, and equals ωₙ only when ζ = 0.
        </p>
      </div>
    </div>
  );
}
