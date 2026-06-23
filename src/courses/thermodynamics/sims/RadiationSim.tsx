import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Blackbody radiation explorer.
 *  - Planck:  E_bλ = C1 / (λ^5 (exp(C2/(λT)) − 1))   [W/(m²·µm)]
 *             C1 = 3.742e8 W·µm^4/m²,  C2 = 1.439e4 µm·K  (λ in µm)
 *  - Wien:    λ_max = 2898 / T  [µm]
 *  - Total:   E_b = σ T^4  [W/m²],  σ = 5.67e-8 W/(m²·K^4)
 *  - Net exchange (two infinite parallel gray plates):
 *             q = σ(T1^4 − T2^4) / ((1−ε1)/ε1 + 1 + (1−ε2)/ε2)
 * ------------------------------------------------------------------ */
const C1 = 3.742e8; // W·µm^4/m²
const C2 = 1.439e4; // µm·K
const SIGMA = 5.67e-8; // W/(m²·K^4)

const LAM_MIN = 0.1; // µm
const LAM_MAX = 10; // µm

/** Planck spectral emissive power, W/(m²·µm). */
function planck(lam: number, T: number): number {
  return C1 / (Math.pow(lam, 5) * (Math.exp(C2 / (lam * T)) - 1));
}

// plot geometry
const W = 460;
const H = 300;
const PAD = { l: 58, r: 16, t: 16, b: 40 };
const xOf = (lam: number) =>
  PAD.l + ((lam - LAM_MIN) / (LAM_MAX - LAM_MIN)) * (W - PAD.l - PAD.r);
const yOf = (e: number, eMax: number) =>
  H - PAD.b - (eMax > 0 ? e / eMax : 0) * (H - PAD.t - PAD.b);

/** Build the Planck curve points and find the data peak for y-scaling. */
function spectrum(T: number, n = 240) {
  const pts: { lam: number; e: number }[] = [];
  let peak = 0;
  for (let i = 0; i <= n; i++) {
    const lam = LAM_MIN + ((LAM_MAX - LAM_MIN) * i) / n;
    const e = planck(lam, T);
    if (e > peak) peak = e;
    pts.push({ lam, e });
  }
  return { pts, peak };
}

type Mode = "planck" | "exchange";

export function RadiationSim() {
  const [mode, setMode] = useState<Mode>("planck");
  const [T, setT] = useState(1200);

  // exchange mode state
  const [T1, setT1] = useState(800);
  const [T2, setT2] = useState(400);
  const [e1, setE1] = useState(0.8);
  const [e2, setE2] = useState(0.6);

  const { pts, peak } = useMemo(() => spectrum(T), [T]);
  const lamMax = 2898 / T; // µm, Wien
  const ePeak = planck(lamMax, T); // peak value, W/(m²·µm)
  const Eb = SIGMA * Math.pow(T, 4); // total, W/m²

  // round the y-axis top to a "nice" number above the peak
  const eMax = useMemo(() => {
    if (peak <= 0) return 1;
    const exp = Math.floor(Math.log10(peak));
    const base = Math.pow(10, exp);
    const m = peak / base;
    const niceM = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
    return niceM * base;
  }, [peak]);

  const curve = pts.map((p) => `${xOf(p.lam).toFixed(1)},${yOf(p.e, eMax).toFixed(1)}`).join(" ");
  const area = `${xOf(LAM_MIN)},${yOf(0, eMax)} ${curve} ${xOf(LAM_MAX)},${yOf(0, eMax)}`;

  // net exchange between two gray parallel plates
  const denom = (1 - e1) / e1 + 1 + (1 - e2) / e2;
  const qNet = (SIGMA * (Math.pow(T1, 4) - Math.pow(T2, 4))) / denom;

  const xTicks = [0.1, 2, 4, 6, 8, 10];
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * eMax);
  const fmtE = (v: number) => {
    if (v === 0) return "0";
    const exp = Math.floor(Math.log10(eMax));
    return (v / Math.pow(10, exp)).toFixed(exp >= 4 ? 1 : 2);
  };
  const yExp = Math.floor(Math.log10(eMax));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* mode selector */}
        <div className="mb-3 flex flex-wrap gap-2">
          <SimButton active={mode === "planck"} onClick={() => setMode("planck")}>
            Planck spectrum
          </SimButton>
          <SimButton active={mode === "exchange"} onClick={() => setMode("exchange")}>
            Net exchange (2 plates)
          </SimButton>
        </div>

        {mode === "planck" ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
            {/* y grid + ticks */}
            {yTicks.map((e, i) => (
              <g key={`y${i}`}>
                <line
                  x1={PAD.l}
                  y1={yOf(e, eMax)}
                  x2={W - PAD.r}
                  y2={yOf(e, eMax)}
                  stroke="var(--color-line)"
                  strokeWidth={1}
                />
                <text x={PAD.l - 6} y={yOf(e, eMax) + 3} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                  {fmtE(e)}
                </text>
              </g>
            ))}
            {/* x ticks */}
            {xTicks.map((lam, i) => (
              <text key={`x${i}`} x={xOf(lam)} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
                {lam}
              </text>
            ))}

            {/* axis labels */}
            <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
              Wavelength λ (µm)
            </text>
            <text
              x={12}
              y={H / 2}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-muted)"
              transform={`rotate(-90 12 ${H / 2})`}
            >
              Spectral Eλ (×10^{yExp} W/m²/µm)
            </text>

            {/* area under curve */}
            <polygon points={area} fill="var(--accent)" opacity={0.16} />
            {/* Planck curve */}
            <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />

            {/* Wien peak marker */}
            {lamMax >= LAM_MIN && lamMax <= LAM_MAX && (
              <g>
                <line
                  x1={xOf(lamMax)}
                  y1={yOf(ePeak, eMax)}
                  x2={xOf(lamMax)}
                  y2={H - PAD.b}
                  stroke="var(--accent-2)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <circle cx={xOf(lamMax)} cy={yOf(ePeak, eMax)} r={4.5} fill="var(--accent-2)" />
                <text
                  x={xOf(lamMax) + 6}
                  y={yOf(ePeak, eMax) + 12}
                  fontSize={10}
                  fill="var(--color-ink)"
                  fontWeight="700"
                >
                  λₘₐₓ
                </text>
              </g>
            )}
          </svg>
        ) : (
          // two-plate exchange diagram
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]">
            {(() => {
              const hot = T1 >= T2;
              const flowColor = "var(--accent)";
              const xL = 120;
              const xR = W - 120;
              const yTop = 50;
              const yBot = H - 50;
              const arrowDir = hot ? 1 : -1; // +1: left→right
              return (
                <g>
                  {/* plate 1 */}
                  <rect x={xL - 14} y={yTop} width={14} height={yBot - yTop} fill="var(--bad)" opacity={0.85} rx={2} />
                  <text x={xL - 7} y={yTop - 8} textAnchor="middle" fontSize={10} fill="var(--color-ink)" fontWeight="700">
                    Plate 1
                  </text>
                  <text x={xL - 7} y={yBot + 16} textAnchor="middle" fontSize={9} fill="var(--color-muted)">
                    T₁={T1}K ε₁={e1.toFixed(2)}
                  </text>

                  {/* plate 2 */}
                  <rect x={xR} y={yTop} width={14} height={yBot - yTop} fill="var(--accent-2)" opacity={0.85} rx={2} />
                  <text x={xR + 7} y={yTop - 8} textAnchor="middle" fontSize={10} fill="var(--color-ink)" fontWeight="700">
                    Plate 2
                  </text>
                  <text x={xR + 7} y={yBot + 16} textAnchor="middle" fontSize={9} fill="var(--color-muted)">
                    T₂={T2}K ε₂={e2.toFixed(2)}
                  </text>

                  {/* net flux arrows */}
                  {[0.3, 0.5, 0.7].map((f, i) => {
                    const y = yTop + (yBot - yTop) * f;
                    const ax1 = arrowDir > 0 ? xL + 8 : xR - 8;
                    const ax2 = arrowDir > 0 ? xR - 22 : xL + 22;
                    return (
                      <g key={i}>
                        <line x1={ax1} y1={y} x2={ax2} y2={y} stroke={flowColor} strokeWidth={2.5} />
                        <polygon
                          points={`${ax2},${y - 5} ${ax2 + arrowDir * 12},${y} ${ax2},${y + 5}`}
                          fill={flowColor}
                        />
                      </g>
                    );
                  })}

                  <text x={W / 2} y={yTop - 18} textAnchor="middle" fontSize={11} fill="var(--accent)" fontWeight="700">
                    q = {Math.abs(qNet) >= 1000 ? (qNet / 1000).toFixed(2) + " kW/m²" : qNet.toFixed(1) + " W/m²"}
                  </text>
                  <text x={W / 2} y={yBot + 38} textAnchor="middle" fontSize={9} fill="var(--color-faint)">
                    net radiation, plate 1 → plate 2
                  </text>
                </g>
              );
            })()}
          </svg>
        )}
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        {mode === "planck" ? (
          <>
            <SimControls>
              <div className="sm:col-span-2">
                <Slider
                  label="Temperature T"
                  value={T}
                  min={300}
                  max={2000}
                  step={10}
                  unit="K"
                  onChange={setT}
                  format={(v) => v.toFixed(0)}
                />
              </div>
            </SimControls>

            <div className="mt-4 space-y-2">
              <ReadoutRow>
                <Readout label="λₘₐₓ (Wien)" value={`${lamMax.toFixed(2)} µm`} tone="accent" />
                <Readout label="E = σT⁴" value={fmtBig(Eb, "W/m²")} tone="good" />
              </ReadoutRow>
              <Readout label="Peak Eλ" value={fmtBig(ePeak, "W/m²/µm")} />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
              Raise T: the curve grows (E ∝ T⁴) and λₘₐₓ shifts to shorter wavelengths
              (λₘₐₓ·T = 2898 µm·K). The y-axis rescales as T changes.
            </p>
          </>
        ) : (
          <>
            <SimControls>
              <Slider label="T₁" value={T1} min={300} max={2000} step={10} unit="K" onChange={setT1} format={(v) => v.toFixed(0)} />
              <Slider label="T₂" value={T2} min={300} max={2000} step={10} unit="K" onChange={setT2} format={(v) => v.toFixed(0)} />
              <Slider label="ε₁" value={e1} min={0.05} max={1} step={0.05} onChange={setE1} format={(v) => v.toFixed(2)} />
              <Slider label="ε₂" value={e2} min={0.05} max={1} step={0.05} onChange={setE2} format={(v) => v.toFixed(2)} />
            </SimControls>

            <div className="mt-4 space-y-2">
              <Readout
                label="Net flux q (1→2)"
                value={fmtBig(qNet, "W/m²")}
                tone={qNet >= 0 ? "good" : "bad"}
              />
              <ReadoutRow>
                <Readout label="σT₁⁴" value={fmtBig(SIGMA * Math.pow(T1, 4), "W/m²")} />
                <Readout label="σT₂⁴" value={fmtBig(SIGMA * Math.pow(T2, 4), "W/m²")} />
              </ReadoutRow>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
              Infinite parallel gray plates: q = σ(T₁⁴−T₂⁴) / [(1−ε₁)/ε₁ + 1 + (1−ε₂)/ε₂].
              Lower emissivities add surface resistance and cut the net exchange.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** Compact W/m² formatting with k/M prefixes. */
function fmtBig(v: number, unit: string): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(2)} M${unit}`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(2)} k${unit}`;
  if (a >= 1) return `${v.toFixed(1)} ${unit}`;
  return `${v.toFixed(3)} ${unit}`;
}
