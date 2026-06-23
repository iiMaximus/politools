import { useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Ideal-gas process explorer (air, diatomic).
 * Reference state: P1 = 100 kPa, V1 = 24.9 L, T1 = 300 K  (n ≈ 1 mol)
 * Working in kPa & L means 1 kPa·L = 1 J, so energies come out in joules.
 * ------------------------------------------------------------------ */
const P1 = 100; // kPa
const V1 = 24.9; // L
const T1 = 300; // K
const nR = (P1 * V1) / T1; // ≈ 8.3 J/K
const nCv = (5 / 2) * nR; // diatomic
const GAMMA = 1.4;

type Proc = "isochoric" | "isobaric" | "isothermal" | "adiabatic";
const PROCS: { id: Proc; label: string }[] = [
  { id: "isobaric", label: "Isobaric" },
  { id: "isochoric", label: "Isochoric" },
  { id: "isothermal", label: "Isothermal" },
  { id: "adiabatic", label: "Adiabatic" },
];

const W = 460;
const H = 300;
const PAD = { l: 46, r: 16, t: 16, b: 36 };
const Vmax = 70;
const Pmax = 270;
const xOf = (v: number) => PAD.l + (v / Vmax) * (W - PAD.l - PAD.r);
const yOf = (p: number) => H - PAD.b - (p / Pmax) * (H - PAD.t - PAD.b);

function solve(proc: Proc, r: number) {
  let V2 = V1;
  let P2 = P1;
  if (proc === "isochoric") {
    P2 = r * P1;
    V2 = V1;
  } else {
    V2 = r * V1;
    if (proc === "isobaric") P2 = P1;
    if (proc === "isothermal") P2 = P1 / r;
    if (proc === "adiabatic") P2 = P1 * Math.pow(1 / r, GAMMA);
  }
  const T2 = (P2 * V2) / nR;
  let Wgas = 0;
  if (proc === "isobaric") Wgas = P1 * (V2 - V1);
  else if (proc === "isothermal") Wgas = nR * T1 * Math.log(V2 / V1);
  else if (proc === "adiabatic") Wgas = (P1 * V1 - P2 * V2) / (GAMMA - 1);
  // isochoric: Wgas = 0
  const dU = nCv * (T2 - T1);
  const Q = dU + Wgas;
  return { V2, P2, T2, Wgas, dU, Q };
}

function pathPoints(proc: Proc, V2: number, P2: number): string {
  const pts: [number, number][] = [];
  if (proc === "isochoric") {
    pts.push([V1, P1], [V1, P2]);
  } else if (proc === "isobaric") {
    pts.push([V1, P1], [V2, P1]);
  } else {
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const v = V1 + ((V2 - V1) * i) / steps;
      const p = proc === "isothermal" ? (P1 * V1) / v : P1 * Math.pow(V1 / v, GAMMA);
      pts.push([v, p]);
    }
  }
  return pts.map(([v, p]) => `${xOf(v).toFixed(1)},${yOf(p).toFixed(1)}`).join(" ");
}

export function PistonProcessSim() {
  const [proc, setProc] = useState<Proc>("isobaric");
  const [r, setR] = useState(1.6);
  const { V2, P2, T2, Wgas, dU, Q } = solve(proc, r);

  const ratioLabel = proc === "isochoric" ? "Pressure ratio P₂/P₁" : "Volume ratio V₂/V₁";
  const poly = pathPoints(proc, V2, P2);

  // shaded work area (area under the path down to P = 0)
  const areaPath =
    proc === "isochoric"
      ? ""
      : `${xOf(V1)},${yOf(0)} ${poly} ${xOf(V2)},${yOf(0)}`;

  const pistonW = (v: number) => 18 + (v / Vmax) * 150;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* process selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {PROCS.map((p) => (
            <SimButton key={p.id} active={proc === p.id} onClick={() => setProc(p.id)}>
              {p.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* grid */}
          {[0, 1, 2, 3, 4].map((i) => {
            const p = (Pmax / 4) * i;
            return (
              <g key={`h${i}`}>
                <line x1={PAD.l} y1={yOf(p)} x2={W - PAD.r} y2={yOf(p)} stroke="var(--color-line)" strokeWidth={1} />
                <text x={PAD.l - 6} y={yOf(p) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                  {Math.round(p)}
                </text>
              </g>
            );
          })}
          {/* axes labels */}
          <text x={(W) / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Volume V (L)
          </text>
          <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--color-muted)" transform={`rotate(-90 12 ${H / 2})`}>
            Pressure P (kPa)
          </text>

          {/* work area */}
          {areaPath && <polygon points={areaPath} fill="var(--accent)" opacity={0.16} />}

          {/* path */}
          <polyline points={poly} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />

          {/* state points */}
          <circle cx={xOf(V1)} cy={yOf(P1)} r={5} fill="#fff" stroke="var(--accent)" strokeWidth={2} />
          <text x={xOf(V1) + 8} y={yOf(P1) - 8} fontSize={11} fill="var(--color-ink)" fontWeight="700">
            1
          </text>
          <circle cx={xOf(V2)} cy={yOf(P2)} r={5} fill="var(--accent)" />
          <text x={xOf(V2) + 8} y={yOf(P2) - 8} fontSize={11} fill="var(--color-ink)" fontWeight="700">
            2
          </text>
        </svg>

        {/* mini piston */}
        <div className="mt-3 flex items-center gap-4">
          <span className="text-xs text-[var(--color-faint)]">Cylinder</span>
          <div className="relative h-9 flex-1 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div
              className="absolute inset-y-0 left-0 rounded-l-md"
              style={{ width: `${(V2 / Vmax) * 100}%`, background: "var(--accent-soft)", transition: "width .25s" }}
            />
            <div
              className="absolute inset-y-0 w-2 bg-[var(--accent)]"
              style={{ left: `calc(${(V2 / Vmax) * 100}% - 4px)`, transition: "left .25s" }}
              title="piston"
            />
            <span className="absolute inset-0 grid place-items-center text-[10px] font-mono text-[var(--color-muted)]">
              gas
            </span>
          </div>
          <span aria-hidden className="text-[var(--color-faint)]" style={{ width: pistonW(0) }} />
        </div>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label={ratioLabel}
              value={r}
              min={0.4}
              max={2.5}
              step={0.05}
              onChange={setR}
              format={(v) => v.toFixed(2)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="T₂" value={`${Math.round(T2)} K`} />
            <Readout label="P₂" value={`${Math.round(P2)} kPa`} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout label="W by gas" value={`${Math.round(Wgas)} J`} tone={Wgas >= 0 ? "good" : "bad"} />
            <Readout label="ΔU" value={`${Math.round(dU)} J`} tone="accent" />
          </ReadoutRow>
          <Readout label="Q (heat in)" value={`${Math.round(Q)} J`} tone={Q >= 0 ? "good" : "bad"} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Check it: ΔU = Q − W always holds. Isothermal → ΔU = 0. Adiabatic → Q = 0. Isochoric → W = 0.
        </p>
      </div>
    </div>
  );
}
