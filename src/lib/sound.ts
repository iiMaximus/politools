import { readGame } from "./game";

/* ================================================================== *
 *  SOUND — tiny WebAudio synth, no assets. Every cue is generated:
 *  correct/wrong answer blips, combo ticks that rise in pitch, boss
 *  hits, and a little victory fanfare. Muted via game settings.
 * ================================================================== */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!readGame().settings.sound) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  opts: { t?: number; dur?: number; type?: OscillatorType; gain?: number; glide?: number } = {}
) {
  const ac = audio();
  if (!ac) return;
  const { t = 0, dur = 0.12, type = "sine", gain = 0.08, glide } = opts;
  const start = ac.currentTime + t;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export const sfx = {
  correct(combo = 0) {
    // rises with the combo, capped an octave up
    const base = 520 * Math.pow(1.06, Math.min(combo, 12));
    tone(base, { type: "sine", dur: 0.09, gain: 0.07 });
    tone(base * 1.26, { t: 0.07, type: "sine", dur: 0.12, gain: 0.06 });
  },
  wrong() {
    tone(180, { type: "square", dur: 0.16, gain: 0.045, glide: 120 });
  },
  click() {
    tone(880, { type: "triangle", dur: 0.04, gain: 0.03 });
  },
  hit(crit = false) {
    tone(crit ? 90 : 130, { type: "sawtooth", dur: 0.18, gain: 0.09, glide: 50 });
    if (crit) tone(1400, { t: 0.02, type: "square", dur: 0.08, gain: 0.05, glide: 700 });
  },
  hurt() {
    tone(220, { type: "sawtooth", dur: 0.3, gain: 0.08, glide: 70 });
  },
  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => tone(n, { t: i * 0.12, type: "triangle", dur: 0.22, gain: 0.08 }));
    tone(1318.5, { t: 0.5, type: "triangle", dur: 0.4, gain: 0.07 });
  },
  defeat() {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((n, i) => tone(n, { t: i * 0.16, type: "triangle", dur: 0.24, gain: 0.06 }));
  },
  achievement() {
    tone(784, { type: "sine", dur: 0.1, gain: 0.06 });
    tone(1175, { t: 0.09, type: "sine", dur: 0.16, gain: 0.06 });
    tone(1568, { t: 0.2, type: "sine", dur: 0.24, gain: 0.05 });
  },
};
