import { useState } from "react";
import { Slider, Readout, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Partial-sums visualizer.
 *
 * A series Σ aₙ converges exactly when the sequence of partial sums
 * S_N = a₁ + … + a_N has a finite limit. This sim computes S₁…S_N for
 * four preset series and plots them, with the limit line drawn where
 * a limit exists:
 *
 *   geometric Σ (1/2)ⁿ (n ≥ 1)      → 1        (S_N = 1 − (1/2)^N exactly)
 *   harmonic  Σ 1/n                 → diverges (S_N ≈ ln N + γ)
 *   p-series  Σ 1/n²                → π²/6     (Basel problem)
 *   alt. harm Σ (−1)ⁿ⁺¹/n           → ln 2     (Leibniz, |R_N| ≤ 1/(N+1))
 *
 * All values are computed live by actually summing the terms.
 * ------------------------------------------------------------------ */

const W = 420;
const H = 250;
const PAD = { l: 46, r: 14, t: 18, b: 30 } as const;
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;

const GAMMA = 0.5772156649015329; // Euler–Mascheroni constant

type PresetId = "geo" | "harm" | "basel" | "altharm";

interface Preset {
  id: PresetId;
  label: string;
  series: string;
  term: (n: number) => number;
  limit: number | null; // null ⇒ the series diverges
  limitText: string;
  note: string;
}

const PRESETS: Preset[] = [
  {
    id: "geo",
    label: "Geometric Σ(1/2)ⁿ",
    series: "Σ (1/2)ⁿ,  n ≥ 1",
    term: (n) => Math.pow(0.5, n),
    limit: 1,
    limitText: "1",
    note: "Here S_N = 1 − (1/2)^N exactly, so the gap to the limit halves with every extra term — geometric convergence is as fast as it gets.",
  },
  {
    id: "harm",
    label: "Harmonic Σ1/n",
    series: "Σ 1/n,  n ≥ 1",
    term: (n) => 1 / n,
    limit: null,
    limitText: "∞ — diverges",
    note: "The terms tend to 0, yet S_N ≈ ln N + γ climbs forever — it first passes 10 around N ≈ 12,367. Terms → 0 is necessary, never sufficient.",
  },
  {
    id: "basel",
    label: "p-series Σ1/n²",
    series: "Σ 1/n²,  n ≥ 1",
    term: (n) => 1 / (n * n),
    limit: (Math.PI * Math.PI) / 6,
    limitText: "π²/6 ≈ 1.644934",
    note: "Converges because p = 2 is above 1 — to Euler's famous π²/6 — but slowly: the tail left after N terms is roughly 1/N.",
  },
  {
    id: "altharm",
    label: "Alternating Σ(−1)ⁿ⁺¹/n",
    series: "Σ (−1)ⁿ⁺¹/n,  n ≥ 1",
    term: (n) => (n % 2 === 1 ? 1 : -1) / n,
    limit: Math.LN2,
    limitText: "ln 2 ≈ 0.693147",
    note: "The sums zigzag across ln 2, trapping it between consecutive S_N. After N terms the error is below 1/(N+1) — the Leibniz bound.",
  },
];

function fmtGap(g: number): string {
  if (Math.abs(g) < 1e-12) return "≈ 0";
  return Math.abs(g) >= 0.001 ? g.toFixed(4) : g.toExponential(1);
}

export function PartialSumsSim() {
  const [presetId, setPresetId] = useState<PresetId>("geo");
  const [N, setN] = useState(20);

  const preset = PRESETS.find((p) => p.id === presetId)!;

  // real numerics: actually accumulate the partial sums S_1 … S_N
  const sums: number[] = [];
  let acc = 0;
  for (let n = 1; n <= N; n++) {
    acc += preset.term(n);
    sums.push(acc);
  }
  const sN = sums[N - 1];

  // vertical scale: always include 0 and the limit (if any)
  const yMax = Math.max(...sums, preset.limit ?? 0) * 1.12;
  const xPix = (n: number) => PAD.l + (n / N) * PW;
  const yPix = (v: number) => PAD.t + (1 - v / yMax) * PH;

  const dotR = N > 40 ? 2.2 : 3.2;
  const poly = sums.map((v, i) => `${xPix(i + 1).toFixed(1)},${yPix(v).toFixed(1)}`).join(" ");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* preset selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <SimButton key={p.id} active={presetId === p.id} onClick={() => setPresetId(p.id)}>
              {p.label}
            </SimButton>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
          {/* axes */}
          <line
            x1={PAD.l}
            y1={yPix(0)}
            x2={W - PAD.r}
            y2={yPix(0)}
            stroke="var(--color-line)"
            strokeWidth={1}
          />
          <line
            x1={PAD.l}
            y1={PAD.t}
            x2={PAD.l}
            y2={yPix(0)}
            stroke="var(--color-line)"
            strokeWidth={1}
          />
          <text x={PAD.l - 6} y={yPix(0) + 3} textAnchor="end" fontSize={10} fill="var(--color-faint)">
            0
          </text>
          <text x={PAD.l - 6} y={PAD.t + 8} textAnchor="end" fontSize={10} fill="var(--color-faint)">
            {yMax.toFixed(2)}
          </text>
          <text x={xPix(1)} y={H - 10} textAnchor="middle" fontSize={10} fill="var(--color-faint)">
            n = 1
          </text>
          <text x={xPix(N)} y={H - 10} textAnchor="middle" fontSize={10} fill="var(--color-faint)">
            n = {N}
          </text>

          {/* limit line (only when the series converges) */}
          {preset.limit !== null && (
            <>
              <line
                x1={PAD.l}
                y1={yPix(preset.limit)}
                x2={W - PAD.r}
                y2={yPix(preset.limit)}
                stroke="var(--good)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
              <text
                x={W - PAD.r}
                y={yPix(preset.limit) - 5}
                textAnchor="end"
                fontSize={10}
                fontWeight={700}
                fill="var(--good)"
              >
                S = {preset.limitText}
              </text>
            </>
          )}

          {/* partial sums: faint connecting line + dots */}
          {N > 1 && (
            <polyline points={poly} fill="none" stroke="var(--accent)" strokeWidth={1.2} opacity={0.35} />
          )}
          {sums.map((v, i) => (
            <circle key={i} cx={xPix(i + 1)} cy={yPix(v)} r={dotR} fill="var(--accent)" />
          ))}
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          Each dot is a partial sum S_n. A series converges exactly when these dots level off at a
          finite height — compare how the four presets behave as you push N up.
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <Slider label="Number of terms N" value={N} min={1} max={80} step={1} onChange={setN} />

        <div className="mt-4 space-y-2">
          <Readout label="Series" value={preset.series} />
          <div className="grid grid-cols-2 gap-2">
            <Readout label={`Partial sum S(${N})`} value={sN.toFixed(6)} tone="accent" />
            <Readout
              label="Limit S"
              value={preset.limitText}
              tone={preset.limit !== null ? "good" : "bad"}
            />
          </div>
          {preset.limit !== null ? (
            <Readout label="Remaining gap S − S(N)" value={fmtGap(preset.limit - sN)} />
          ) : (
            <Readout label={`ln N + γ (N = ${N})`} value={(Math.log(N) + GAMMA).toFixed(4)} />
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">{preset.note}</p>
      </div>
    </div>
  );
}
