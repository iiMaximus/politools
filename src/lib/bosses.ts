import type { Question } from "../types";

/* ================================================================== *
 *  BOSS CONFIGS — every course gets a final boss. The 3-D look is a
 *  procedural variant; names/taunts give each exam a personality.
 * ================================================================== */

export type BossVariant = "entropy" | "wraith" | "sigma" | "generic";

export interface BossConfig {
  variant: BossVariant;
  name: string;
  epithet: string;
  intro: string;
  taunts: string[];
  hurts: string[];
  /** three.js hex colors */
  colors: { primary: number; secondary: number; glow: number };
}

const GENERIC: BossConfig = {
  variant: "generic",
  name: "The Examiner",
  epithet: "Keeper of the Register",
  intro: "It has seen ten thousand students. It remembers every wrong answer.",
  taunts: [
    "Is that your final answer? Tragic.",
    "I have failed better students than you.",
    "The retake session welcomes you already.",
  ],
  hurts: ["Hmpf. Lucky.", "A fair point…", "Where did you learn THAT?"],
  colors: { primary: 0x3f7fe6, secondary: 0x6a6af0, glow: 0x6aa6ff },
};

const BOSSES: Record<string, BossConfig> = {
  thermodynamics: {
    variant: "entropy",
    name: "Lord Entropy",
    epithet: "Devourer of Useful Work",
    intro:
      "Every closed system bows to him eventually. Every answer you miss feeds his disorder.",
    taunts: [
      "Your knowledge tends to maximum disorder!",
      "ΔS > 0 — as always, in your favor… not.",
      "That answer was… irreversible.",
      "No process is perfect. Especially yours.",
    ],
    hurts: [
      "My useful work… decreasing!",
      "You dare reverse me?!",
      "Impossible! A perpetuum mobile of correct answers!",
    ],
    colors: { primary: 0xff5e2b, secondary: 0xffb454, glow: 0xff7a1a },
  },
  "math-analysis-2": {
    variant: "wraith",
    name: "The Limit Wraith",
    epithet: "Guardian of ε and δ",
    intro:
      "It approaches from every path at once. Only answers that hold in ALL directions can wound it.",
    taunts: [
      "Your limit… does not exist.",
      "You checked two paths and felt safe. Adorable.",
      "Diverges. Like your grade.",
      "ε was given. You failed to find δ.",
    ],
    hurts: [
      "Uniformly bounded?! No!",
      "You… converge…",
      "My domain! Simply connected no more!",
    ],
    colors: { primary: 0x8b7bff, secondary: 0xb18cff, glow: 0x9d7bff },
  },
  "linear-algebra": {
    variant: "generic",
    name: "The Determinant",
    epithet: "Judge of Singularity",
    intro:
      "It reduces every argument to a single number. If that number is zero, you do not exist.",
    taunts: [
      "Your answer space… trivial.",
      "Rank-deficient. As I suspected.",
      "You are not invertible, student.",
      "det(you) = 0.",
    ],
    hurts: [
      "My kernel… it grows?!",
      "Full rank?! Impossible!",
      "You… diagonalized ME?!",
    ],
    colors: { primary: 0x2f7dd1, secondary: 0x24b39b, glow: 0x3fa8e6 },
  },
  statistics: {
    variant: "sigma",
    name: "Σ-Prime",
    epithet: "The Uncertain One",
    intro:
      "Nothing about it is exact. It exists only within a confidence interval — strike where k = 2.",
    taunts: [
      "I am 95% confident you are wrong.",
      "Your error bars… they grow.",
      "That was outside your coverage interval.",
      "Type A? Type B? You are type: confused.",
    ],
    hurts: [
      "My variance! Shrinking!",
      "Statistically… significant…!",
      "Your estimate… unbiased?!",
    ],
    colors: { primary: 0x1f9d8f, secondary: 0x37c2a8, glow: 0x2fd4b8 },
  },
};

export function bossFor(courseId: string): BossConfig {
  return BOSSES[courseId] ?? GENERIC;
}

/* --------------------------- question time ------------------------- */

const TIME_BASE: Record<Question["difficulty"], number> = { easy: 12, medium: 18, hard: 28 };
const READ_CHARS_PER_SEC = 14;

/** Thinking time for one question: a difficulty base, plus reading time
 *  for the actual prompt+options length, plus surcharges for math and
 *  figures. A one-line easy card gets ~15 s; a loaded hard integral with
 *  four long options gets up to 90 s. */
export function timeFor(q: Question): number {
  const parts: unknown[] = [q.prompt];
  if (q.type !== "numeric") parts.push(...q.options.map((o) => o.content));
  const text = parts.join(" ");
  const mathBits = (text.match(/\$[^$]+\$/g) ?? []).length;
  const plain = text.replace(/\$[^$]+\$/g, " ").replace(/\s+/g, " ");
  const t =
    TIME_BASE[q.difficulty] +
    plain.length / READ_CHARS_PER_SEC +
    mathBits * 6 +
    (q.visual ? 8 : 0) +
    (q.type === "numeric" ? 10 : 0); // working out + typing a number takes longer
  return Math.round(Math.max(15, Math.min(90, t)));
}
