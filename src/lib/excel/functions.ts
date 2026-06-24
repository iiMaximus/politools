/* ================================================================== *
 *  Excel function table for the ESMM course.
 *  Each entry computes a CellValue from evaluated arguments (scalars or
 *  ranges). Only the functions actually used by the course's lab files
 *  are implemented (+ a few legacy aliases seen in those files).
 * ================================================================== */

import { type Arg, type CellValue, ExcelError } from "./types";
import {
  normPdf, normCdf, normInv,
  studentPdf, studentCdf, studentInv,
  chisqPdf, chisqCdf, chisqInv,
  fPdf, fCdf, fInv,
  binomPmf, binomCdf, binomInv,
  hypgeomPmf, hypgeomCdf,
  poissonPmf, poissonCdf,
} from "./stats";

/* ---------------------------- coercion ---------------------------- */

function num(a: Arg): number {
  if (a.kind === "scalar") return scalarToNum(a.value);
  // a 1x1 range coerces to its single value
  const flat = a.values.flat();
  if (flat.length === 1) return scalarToNum(flat[0]);
  throw new ExcelError("#VALUE!");
}

function scalarToNum(v: CellValue): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v === null || v === "") return 0;
  const n = Number(String(v).replace(",", "."));
  if (Number.isNaN(n)) throw new ExcelError("#VALUE!");
  return n;
}

function truthy(a: Arg): boolean {
  if (a.kind !== "scalar") throw new ExcelError("#VALUE!");
  const v = a.value;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.toUpperCase() === "TRUE" || v === "1";
  return false;
}

/** All numeric values across the args (ranges flattened, text/blanks skipped). */
function nums(args: Arg[]): number[] {
  const out: number[] = [];
  for (const a of args) {
    if (a.kind === "scalar") {
      if (typeof a.value === "number") out.push(a.value);
      else if (typeof a.value === "boolean") out.push(a.value ? 1 : 0);
      else if (typeof a.value === "string" && a.value.trim() !== "") {
        const n = Number(a.value.replace(",", "."));
        if (!Number.isNaN(n)) out.push(n);
      }
    } else {
      for (const row of a.values) for (const v of row) if (typeof v === "number") out.push(v);
    }
  }
  return out;
}

/* --------------------------- aggregates --------------------------- */

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const mean = (xs: number[]) => sum(xs) / xs.length;

function sampleVar(xs: number[]): number {
  const n = xs.length;
  if (n < 2) throw new ExcelError("#DIV/0!");
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) * (x - m), 0) / (n - 1);
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function mode(xs: number[]): number {
  const counts = new Map<number, number>();
  let best = NaN;
  let bestC = 0;
  for (const x of xs) {
    const c = (counts.get(x) ?? 0) + 1;
    counts.set(x, c);
    if (c > bestC) { bestC = c; best = x; }
  }
  if (bestC < 2) throw new ExcelError("#N/A");
  return best;
}

/** Excel QUARTILE.INC / PERCENTILE.INC interpolation. */
function quartile(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b);
  if (q === 0) return s[0];
  if (q === 4) return s[s.length - 1];
  const pos = (q / 4) * (s.length - 1);
  const lo = Math.floor(pos);
  const frac = pos - lo;
  return s[lo] + frac * (s[lo + 1] - s[lo]);
}

/* -------------------------- the table ----------------------------- */

export type ExcelFn = (args: Arg[]) => CellValue;

function need(args: Arg[], min: number, max = min) {
  if (args.length < min || args.length > max) throw new ExcelError("#N/A");
}

export const FUNCTIONS: Record<string, ExcelFn> = {
  // ---- math / text ----
  SUM: (a) => sum(nums(a)),
  AVERAGE: (a) => { const xs = nums(a); if (!xs.length) throw new ExcelError("#DIV/0!"); return mean(xs); },
  COUNT: (a) => nums(a).length,
  COUNTA: (a) => a.reduce((c, x) => c + (x.kind === "scalar" ? (x.value !== null && x.value !== "" ? 1 : 0) : x.values.flat().filter((v) => v !== null && v !== "").length), 0),
  MIN: (a) => { const xs = nums(a); return xs.length ? Math.min(...xs) : 0; },
  MAX: (a) => { const xs = nums(a); return xs.length ? Math.max(...xs) : 0; },
  MEDIAN: (a) => median(nums(a)),
  MODE: (a) => mode(nums(a)),
  "MODE.SNGL": (a) => mode(nums(a)),
  "VAR.S": (a) => sampleVar(nums(a)),
  VAR: (a) => sampleVar(nums(a)),
  "STDEV.S": (a) => Math.sqrt(sampleVar(nums(a))),
  STDEV: (a) => Math.sqrt(sampleVar(nums(a))),
  "VAR.P": (a) => { const xs = nums(a); const m = mean(xs); return xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length; },
  "STDEV.P": (a) => { const xs = nums(a); const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length); },
  QUARTILE: (a) => { need(a, 2); if (a[0].kind !== "range") throw new ExcelError("#VALUE!"); return quartile(nums([a[0]]), num(a[1])); },
  "QUARTILE.INC": (a) => { need(a, 2); return quartile(nums([a[0]]), num(a[1])); },
  COUNTIF: () => { throw new ExcelError("#N/A"); },
  ABS: (a) => { need(a, 1); return Math.abs(num(a[0])); },
  SQRT: (a) => { need(a, 1); return Math.sqrt(num(a[0])); },
  LN: (a) => { need(a, 1); return Math.log(num(a[0])); },
  LOG: (a) => { need(a, 1, 2); return a.length === 2 ? Math.log(num(a[0])) / Math.log(num(a[1])) : Math.log10(num(a[0])); },
  LOG10: (a) => { need(a, 1); return Math.log10(num(a[0])); },
  EXP: (a) => { need(a, 1); return Math.exp(num(a[0])); },
  POWER: (a) => { need(a, 2); return Math.pow(num(a[0]), num(a[1])); },
  INT: (a) => { need(a, 1); return Math.floor(num(a[0])); },
  ROUND: (a) => { need(a, 2); const f = 10 ** num(a[1]); return Math.round(num(a[0]) * f) / f; },
  ROUNDDOWN: (a) => { need(a, 2); const f = 10 ** num(a[1]); return Math.trunc(num(a[0]) * f) / f; },
  ROUNDUP: (a) => { need(a, 2); const f = 10 ** num(a[1]); const x = num(a[0]) * f; return (x < 0 ? Math.floor(x) : Math.ceil(x)) / f; },
  TRUNC: (a) => { need(a, 1, 2); return Math.trunc(num(a[0])); },
  PI: () => Math.PI,
  SIN: (a) => { need(a, 1); return Math.sin(num(a[0])); },
  COS: (a) => { need(a, 1); return Math.cos(num(a[0])); },
  TAN: (a) => { need(a, 1); return Math.tan(num(a[0])); },
  ATAN: (a) => { need(a, 1); return Math.atan(num(a[0])); },
  RADIANS: (a) => { need(a, 1); return (num(a[0]) * Math.PI) / 180; },
  DEGREES: (a) => { need(a, 1); return (num(a[0]) * 180) / Math.PI; },
  CONCATENATE: (a) => a.map((x) => String(x.kind === "scalar" ? x.value ?? "" : x.values.flat()[0] ?? "")).join(""),

  // ---- normal ----
  "NORM.DIST": (a) => { need(a, 4); const [x, m, s] = [num(a[0]), num(a[1]), num(a[2])]; return truthy(a[3]) ? normCdf((x - m) / s) : normPdf((x - m) / s) / s; },
  NORMDIST: (a) => { need(a, 4); const [x, m, s] = [num(a[0]), num(a[1]), num(a[2])]; return truthy(a[3]) ? normCdf((x - m) / s) : normPdf((x - m) / s) / s; },
  "NORM.S.DIST": (a) => { need(a, 2); return truthy(a[1]) ? normCdf(num(a[0])) : normPdf(num(a[0])); },
  NORMSDIST: (a) => { need(a, 1); return normCdf(num(a[0])); },
  "NORM.INV": (a) => { need(a, 3); return num(a[1]) + num(a[2]) * normInv(num(a[0])); },
  NORMINV: (a) => { need(a, 3); return num(a[1]) + num(a[2]) * normInv(num(a[0])); },
  "NORM.S.INV": (a) => { need(a, 1); return normInv(num(a[0])); },
  NORMSINV: (a) => { need(a, 1); return normInv(num(a[0])); },

  // ---- student t ----
  "T.DIST": (a) => { need(a, 3); return truthy(a[2]) ? studentCdf(num(a[0]), num(a[1])) : studentPdf(num(a[0]), num(a[1])); },
  "T.DIST.2T": (a) => { need(a, 2); return 2 * (1 - studentCdf(Math.abs(num(a[0])), num(a[1]))); },
  "T.DIST.RT": (a) => { need(a, 2); return 1 - studentCdf(num(a[0]), num(a[1])); },
  "T.INV": (a) => { need(a, 2); return studentInv(num(a[0]), num(a[1])); },
  "T.INV.2T": (a) => { need(a, 2); return studentInv(1 - num(a[0]) / 2, num(a[1])); },
  TINV: (a) => { need(a, 2); return studentInv(1 - num(a[0]) / 2, num(a[1])); },
  TDIST: (a) => { need(a, 3); const t = Math.abs(num(a[0])); const df = num(a[1]); const tails = num(a[2]); const rt = 1 - studentCdf(t, df); return tails === 2 ? 2 * rt : rt; },

  // ---- chi-square ----
  "CHISQ.DIST": (a) => { need(a, 3); return truthy(a[2]) ? chisqCdf(num(a[0]), num(a[1])) : chisqPdf(num(a[0]), num(a[1])); },
  "CHISQ.DIST.RT": (a) => { need(a, 2); return 1 - chisqCdf(num(a[0]), num(a[1])); },
  "CHISQ.INV": (a) => { need(a, 2); return chisqInv(num(a[0]), num(a[1])); },
  "CHISQ.INV.RT": (a) => { need(a, 2); return chisqInv(1 - num(a[0]), num(a[1])); },
  CHIDIST: (a) => { need(a, 2); return 1 - chisqCdf(num(a[0]), num(a[1])); },
  CHIINV: (a) => { need(a, 2); return chisqInv(1 - num(a[0]), num(a[1])); },

  // ---- fisher F ----
  "F.DIST": (a) => { need(a, 4); return truthy(a[3]) ? fCdf(num(a[0]), num(a[1]), num(a[2])) : fPdf(num(a[0]), num(a[1]), num(a[2])); },
  "F.DIST.RT": (a) => { need(a, 3); return 1 - fCdf(num(a[0]), num(a[1]), num(a[2])); },
  "F.INV": (a) => { need(a, 3); return fInv(num(a[0]), num(a[1]), num(a[2])); },
  "F.INV.RT": (a) => { need(a, 3); return fInv(1 - num(a[0]), num(a[1]), num(a[2])); },
  FDIST: (a) => { need(a, 3); return 1 - fCdf(num(a[0]), num(a[1]), num(a[2])); },
  FINV: (a) => { need(a, 3); return fInv(1 - num(a[0]), num(a[1]), num(a[2])); },

  // ---- discrete ----
  "BINOM.DIST": (a) => { need(a, 4); const [k, n, p] = [num(a[0]), num(a[1]), num(a[2])]; return truthy(a[3]) ? binomCdf(k, n, p) : binomPmf(k, n, p); },
  BINOMDIST: (a) => { need(a, 4); const [k, n, p] = [num(a[0]), num(a[1]), num(a[2])]; return truthy(a[3]) ? binomCdf(k, n, p) : binomPmf(k, n, p); },
  "BINOM.INV": (a) => { need(a, 3); return binomInv(num(a[0]), num(a[1]), num(a[2])); },
  CRITBINOM: (a) => { need(a, 3); return binomInv(num(a[0]), num(a[1]), num(a[2])); },
  "HYPGEOM.DIST": (a) => { need(a, 5); const [k, n, C, M] = [num(a[0]), num(a[1]), num(a[2]), num(a[3])]; return truthy(a[4]) ? hypgeomCdf(k, n, C, M) : hypgeomPmf(k, n, C, M); },
  HYPGEOMDIST: (a) => { need(a, 4); return hypgeomPmf(num(a[0]), num(a[1]), num(a[2]), num(a[3])); },
  "POISSON.DIST": (a) => { need(a, 3); return truthy(a[2]) ? poissonCdf(num(a[0]), num(a[1])) : poissonPmf(num(a[0]), num(a[1])); },
  POISSON: (a) => { need(a, 3); return truthy(a[2]) ? poissonCdf(num(a[0]), num(a[1])) : poissonPmf(num(a[0]), num(a[1])); },

  // ---- logical ----
  IF: (a) => { need(a, 2, 3); return truthy(a[0]) ? scalarOf(a[1]) : a.length === 3 ? scalarOf(a[2]) : false; },
  AND: (a) => a.every((x) => truthy(x)),
  OR: (a) => a.some((x) => truthy(x)),
  NOT: (a) => { need(a, 1); return !truthy(a[0]); },
  TRUE: () => true,
  FALSE: () => false,
};

function scalarOf(a: Arg): CellValue {
  return a.kind === "scalar" ? a.value : a.values.flat()[0] ?? null;
}
