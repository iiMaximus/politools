import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Air-standard gas power cycles (cold-air-standard, constant k).
 *   Otto    : η = 1 − r^(1−k)
 *   Diesel  : η = 1 − (1/k)·r^(1−k)·(r_c^k − 1)/(r_c − 1)
 *   Brayton : η = 1 − r_p^(−(k−1)/k)
 * p–v diagrams are schematic (normalised) but respond correctly to
 * the compression / pressure / cut-off ratios.
 * ------------------------------------------------------------------ */

type Cycle = "otto" | "diesel" | "brayton";
const CYCLES: { id: Cycle; label: string }[] = [
  { id: "otto", label: "Otto" },
  { id: "diesel", label: "Diesel" },
  { id: "brayton", label: "Brayton" },
];

function efficiency(cycle: Cycle, r: number, rp: number, rc: number, k: number): number {
  if (cycle === "otto") return 1 - Math.pow(r, 1 - k);
  if (cycle === "brayton") return 1 - Math.pow(rp, -(k - 1) / k);
  // diesel
  return 1 - (1 / k) * Math.pow(r, 1 - k) * (Math.pow(rc, k) - 1) / (rc - 1);
}

const W = 460;
const H = 300;
const PAD = { l: 46, r: 16, t: 16, b: 36 };

// Reference state 1 in arbitrary (normalised) p–v units.
const V1 = 1; // largest volume (BDC)
const P1 = 1;

type Pt = { v: number; p: number };

/** Build the ordered list of state points (closed loop) for the cycle. */
function buildStates(cycle: Cycle, r: number, rp: number, rc: number, k: number): Pt[] {
  if (cycle === "otto") {
    // 1→2 isentropic compression, 2→3 isochoric heat-in, 3→4 isentropic exp, 4→1 isochoric heat-out
    const V2 = V1 / r;
    const P2 = P1 * Math.pow(r, k); // isentropic
    const heat = 2.2; // pressure rise factor at constant volume (schematic)
    const P3 = P2 * heat;
    const V3 = V2;
    const V4 = V1;
    const P4 = P3 * Math.pow(V3 / V4, k); // isentropic expansion to V1
    return [
      { v: V1, p: P1 },
      { v: V2, p: P2 },
      { v: V3, p: P3 },
      { v: V4, p: P4 },
    ];
  }
  if (cycle === "diesel") {
    // 1→2 isentropic compression, 2→3 isobaric heat-in (cut-off rc), 3→4 isentropic exp, 4→1 isochoric heat-out
    const V2 = V1 / r;
    const P2 = P1 * Math.pow(r, k);
    const V3 = V2 * rc; // constant pressure
    const P3 = P2;
    const V4 = V1;
    const P4 = P3 * Math.pow(V3 / V4, k);
    return [
      { v: V1, p: P1 },
      { v: V2, p: P2 },
      { v: V3, p: P3 },
      { v: V4, p: P4 },
    ];
  }
  // brayton: 1→2 isentropic compression, 2→3 isobaric heat-in, 3→4 isentropic exp, 4→1 isobaric heat-out
  const P2 = P1 * rp;
  const V2 = V1 * Math.pow(P1 / P2, 1 / k); // isentropic
  const expand = 2.4; // volume expansion at constant high pressure (schematic)
  const V3 = V2 * expand;
  const P3 = P2;
  const P4 = P1;
  const V4 = V3 * Math.pow(P3 / P4, 1 / k); // isentropic expansion to P1
  return [
    { v: V1, p: P1 },
    { v: V2, p: P2 },
    { v: V3, p: P3 },
    { v: V4, p: P4 },
  ];
}

/** Sample one leg between two states following the given process. */
function leg(a: Pt, b: Pt, kind: "isentropic" | "isochoric" | "isobaric", k: number): Pt[] {
  if (kind === "isochoric" || kind === "isobaric") return [a, b];
  const steps = 28;
  const out: Pt[] = [];
  // p·v^k = const
  const c = a.p * Math.pow(a.v, k);
  for (let i = 0; i <= steps; i++) {
    const v = a.v + ((b.v - a.v) * i) / steps;
    out.push({ v, p: c / Math.pow(v, k) });
  }
  return out;
}

function cyclePath(cycle: Cycle, s: Pt[], k: number): Pt[] {
  const [s1, s2, s3, s4] = s;
  if (cycle === "otto") {
    return [
      ...leg(s1, s2, "isentropic", k),
      ...leg(s2, s3, "isochoric", k),
      ...leg(s3, s4, "isentropic", k),
      ...leg(s4, s1, "isochoric", k),
    ];
  }
  if (cycle === "diesel") {
    return [
      ...leg(s1, s2, "isentropic", k),
      ...leg(s2, s3, "isobaric", k),
      ...leg(s3, s4, "isentropic", k),
      ...leg(s4, s1, "isochoric", k),
    ];
  }
  return [
    ...leg(s1, s2, "isentropic", k),
    ...leg(s2, s3, "isobaric", k),
    ...leg(s3, s4, "isentropic", k),
    ...leg(s4, s1, "isobaric", k),
  ];
}

export function GasCycleSim() {
  const [cycle, setCycle] = useState<Cycle>("otto");
  const [r, setR] = useState(9);
  const [rp, setRp] = useState(10);
  const [rc, setRc] = useState(2);
  const [k, setK] = useState(1.4);

  const eta = efficiency(cycle, r, rp, rc, k);

  const { poly, span } = useMemo(() => {
    const states = buildStates(cycle, r, rp, rc, k);
    const pts = cyclePath(cycle, states, k);
    const vmax = Math.max(...pts.map((q) => q.v)) * 1.06;
    const pmax = Math.max(...pts.map((q) => q.p)) * 1.06;
    return { poly: pts, span: { vmax, pmax } };
  }, [cycle, r, rp, rc, k]);

  const xOf = (v: number) => PAD.l + (v / span.vmax) * (W - PAD.l - PAD.r);
  const yOf = (p: number) => H - PAD.b - (p / span.pmax) * (H - PAD.t - PAD.b);

  const polyStr = poly.map((q) => `${xOf(q.v).toFixed(1)},${yOf(q.p).toFixed(1)}`).join(" ");

  const states = buildStates(cycle, r, rp, rc, k);
  const ratioLabel =
    cycle === "brayton"
      ? `rₚ = ${rp.toFixed(1)}`
      : `r = ${r.toFixed(1)}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* cycle selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {CYCLES.map((c) => (
            <SimButton key={c.id} active={cycle === c.id} onClick={() => setCycle(c.id)}>
              {c.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* grid */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = PAD.t + ((H - PAD.t - PAD.b) / 4) * i;
            return (
              <line
                key={`h${i}`}
                x1={PAD.l}
                y1={y}
                x2={W - PAD.r}
                y2={y}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
            );
          })}
          {/* axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="var(--color-line)" strokeWidth={1} />
          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
            Specific volume v →
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-muted)"
            transform={`rotate(-90 12 ${H / 2})`}
          >
            Pressure p →
          </text>

          {/* enclosed area = net work */}
          <polygon points={polyStr} fill="var(--accent)" opacity={0.14} />
          {/* cycle path */}
          <polyline
            points={polyStr}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* state points */}
          {states.map((q, i) => (
            <g key={`s${i}`}>
              <circle
                cx={xOf(q.v)}
                cy={yOf(q.p)}
                r={4.5}
                fill={i === 0 ? "#fff" : "var(--accent)"}
                stroke="var(--accent)"
                strokeWidth={2}
              />
              <text
                x={xOf(q.v) + 7}
                y={yOf(q.p) - 6}
                fontSize={11}
                fontWeight="700"
                fill="var(--color-ink)"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>

        <p className="mt-2 text-center text-xs text-[var(--color-faint)]">
          Shaded loop area = net work per cycle ({ratioLabel}, k = {k.toFixed(2)})
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          {cycle === "brayton" ? (
            <div className="sm:col-span-2">
              <Slider
                label="Pressure ratio rₚ"
                value={rp}
                min={2}
                max={20}
                step={0.5}
                onChange={setRp}
                format={(v) => v.toFixed(1)}
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Slider
                label="Compression ratio r"
                value={r}
                min={2}
                max={20}
                step={0.5}
                onChange={setR}
                format={(v) => v.toFixed(1)}
              />
            </div>
          )}

          {cycle === "diesel" && (
            <div className="sm:col-span-2">
              <Slider
                label="Cut-off ratio"
                value={rc}
                min={1.1}
                max={3}
                step={0.05}
                onChange={setRc}
                format={(v) => v.toFixed(2)}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <Slider
              label="Heat-capacity ratio k"
              value={k}
              min={1.3}
              max={1.4}
              step={0.01}
              onChange={setK}
              format={(v) => v.toFixed(2)}
            />
          </div>
        </SimControls>

        <div className="mt-4">
          <Readout label="Thermal efficiency η" value={`${(eta * 100).toFixed(1)} %`} tone="accent" />
        </div>

        <div className="mt-2">
          <ReadoutRow>
            <Readout label="1 − η (waste)" value={`${((1 - eta) * 100).toFixed(1)} %`} tone="bad" />
            <Readout label="Cycle" value={CYCLES.find((c) => c.id === cycle)!.label} />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          {cycle === "brayton"
            ? "η rises with pressure ratio rₚ (and with k). Brayton drives gas turbines & jets."
            : cycle === "diesel"
            ? "η rises with compression ratio r; a larger cut-off ratio lowers η. For equal r the Diesel cycle is less efficient than Otto, but Diesels run at far higher r."
            : "η rises with compression ratio r (and with k). Real engines are knock-limited to r ≈ 8–12."}
        </p>
      </div>
    </div>
  );
}
