import { useMemo, useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Caesar / shift cipher explorer.
 *  - Type any text, choose a shift 0..25, see the live output.
 *  - SVG bar chart of the 26 letter frequencies of the output.
 *  - "Auto-crack": scores every shift against English letter
 *    frequencies with a chi-square statistic and reports the best one.
 * ------------------------------------------------------------------ */

const A = 65; // 'A'

// English letter frequencies (%), index 0 = 'A' ... 25 = 'Z'. Sums to ~100.
const ENGLISH: number[] = [
  8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41,
  6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07,
];

/** Shift every alphabetic character by `k`, preserving case and non-letters. */
function shiftText(text: string, k: number): string {
  const s = ((k % 26) + 26) % 26;
  let out = "";
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) out += String.fromCharCode(((c - A + s) % 26) + A);
    else if (c >= 97 && c <= 122) out += String.fromCharCode(((c - 97 + s) % 26) + 97);
    else out += ch;
  }
  return out;
}

/** Count A..Z (case-insensitive) occurrences. Returns length-26 array. */
function letterCounts(text: string): number[] {
  const counts = new Array<number>(26).fill(0);
  for (const ch of text.toUpperCase()) {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) counts[c - A]++;
  }
  return counts;
}

/** Chi-square distance between the observed text (after un-shifting by k) and English. */
function chiSquareForShift(counts: number[], total: number, k: number): number {
  if (total === 0) return Infinity;
  let chi = 0;
  for (let i = 0; i < 26; i++) {
    // un-shift: a plaintext letter i was enciphered to (i+k); so the count of
    // ciphertext letter (i+k) is the candidate count for plaintext letter i.
    const observed = counts[(i + k) % 26];
    const expected = (ENGLISH[i] / 100) * total;
    const diff = observed - expected;
    chi += (diff * diff) / (expected || 1e-9);
  }
  return chi;
}

const CW = 460;
const CH = 200;
const PAD = { l: 28, r: 10, t: 12, b: 22 };
const plotW = CW - PAD.l - PAD.r;
const plotH = CH - PAD.t - PAD.b;

export function CaesarCipherSim() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [shift, setShift] = useState(3);
  const [decrypt, setDecrypt] = useState(false);

  // In encrypt mode we shift by +k; in decrypt mode by -k.
  const k = decrypt ? -shift : shift;
  const output = useMemo(() => shiftText(text, k), [text, k]);

  const counts = useMemo(() => letterCounts(output), [output]);
  const total = counts.reduce((a, b) => a + b, 0);
  const maxFreq = Math.max(1, ...counts) / Math.max(1, total);

  // Auto-crack: assume the visible OUTPUT is ciphertext, find the shift that,
  // when used to decrypt, best matches English.
  const crack = useMemo(() => {
    const c = letterCounts(output);
    const tot = c.reduce((a, b) => a + b, 0);
    let best = 0;
    let bestChi = Infinity;
    for (let key = 0; key < 26; key++) {
      const chi = chiSquareForShift(c, tot, key);
      if (chi < bestChi) {
        bestChi = chi;
        best = key;
      }
    }
    return { key: best, chi: bestChi, total: tot };
  }, [output]);

  const guess = shiftText(output, -crack.key);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <SimButton active={!decrypt} onClick={() => setDecrypt(false)}>
            Encrypt
          </SimButton>
          <SimButton active={decrypt} onClick={() => setDecrypt(true)}>
            Decrypt
          </SimButton>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
            {decrypt ? "Ciphertext in" : "Plaintext in"}
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-2.5 font-mono text-sm text-[var(--color-ink)]"
            spellCheck={false}
          />
        </label>

        <div className="mt-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
            {decrypt ? "Recovered text" : "Ciphertext out"}
          </div>
          <div className="break-words font-mono text-sm font-semibold text-[var(--accent)]">
            {output || " "}
          </div>
        </div>

        {/* frequency bar chart of the output */}
        <svg viewBox={`0 0 ${CW} ${CH}`} className="mt-3 w-full rounded-xl bg-[var(--color-bg)]">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD.l}
              x2={CW - PAD.r}
              y1={PAD.t + plotH * (1 - f)}
              y2={PAD.t + plotH * (1 - f)}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
          ))}
          {counts.map((c, i) => {
            const frac = total === 0 ? 0 : c / total;
            const bw = plotW / 26;
            const bh = (frac / maxFreq) * plotH;
            const x = PAD.l + i * bw;
            const y = PAD.t + plotH - bh;
            return (
              <g key={i}>
                <rect
                  x={x + 1}
                  y={y}
                  width={bw - 2}
                  height={Math.max(0, bh)}
                  fill="var(--accent)"
                  opacity={0.85}
                  rx={1}
                />
                <text
                  x={x + bw / 2}
                  y={CH - 8}
                  textAnchor="middle"
                  fontSize={8}
                  fill="var(--color-faint)"
                >
                  {String.fromCharCode(A + i)}
                </text>
              </g>
            );
          })}
          <text
            x={PAD.l}
            y={PAD.t - 2}
            fontSize={9}
            fill="var(--color-muted)"
          >
            Letter frequency of output
          </text>
        </svg>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-64">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label={decrypt ? "Try key (shift)" : "Shift key k"}
              value={shift}
              min={0}
              max={25}
              step={1}
              onChange={setShift}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <ReadoutRow>
            <Readout label="Letters" value={total} />
            <Readout label="Key space" value="25" />
          </ReadoutRow>
          <Readout
            label="Auto-crack key"
            value={total === 0 ? "—" : `+${crack.key}`}
            tone="accent"
          />
          <Readout
            label="Fit (χ², lower=better)"
            value={total === 0 ? "—" : crack.chi.toFixed(1)}
            tone={crack.chi < 50 ? "good" : "bad"}
          />
        </div>

        <div className="mt-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
            Best English guess
          </div>
          <div className="break-words font-mono text-xs text-[var(--color-ink)]">
            {total === 0 ? "—" : guess}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          The cracker tries all 26 shifts and keeps the one whose letter
          frequencies look most like English. No key needed — that is the whole
          weakness of a 25-key cipher.
        </p>
      </div>
    </div>
  );
}
