/* Public API for the in-browser Excel engine. */

export { Sheet, colToIndex, indexToCol, parseAddr, makeAddr } from "./engine";
export type { CellValue } from "./types";
export { FUNCTIONS } from "./functions";

import { Sheet } from "./engine";
import type { CellValue } from "./types";

/** Build a sheet from a {address: rawInput} map. */
export function createSheet(raw?: Record<string, string>): Sheet {
  return new Sheet(raw);
}

/** Evaluate a single formula string against an (optional) backing sheet. */
export function evaluateFormula(formula: string, raw?: Record<string, string>): CellValue {
  const s = new Sheet(raw);
  const body = formula.startsWith("=") ? formula.slice(1) : formula;
  return s.evalFormulaPublic(body);
}

/**
 * Format a value for display in the grid, like Excel's General format:
 * trims floating noise, uses scientific notation for very large/small.
 */
export function formatNumber(v: CellValue, maxDigits = 10): string {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "string") return v;
  if (!Number.isFinite(v)) return String(v);
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs !== 0 && (abs < 1e-9 || abs >= 1e11)) {
    return v.toExponential(5).replace(/\.?0+e/, "e");
  }
  // round to a sensible number of significant digits, strip trailing zeros
  const rounded = Number(v.toPrecision(maxDigits));
  return String(rounded);
}

/**
 * Compare a student's computed value against an expected answer.
 * Numbers use relative-or-absolute tolerance; strings compare case- and
 * separator-insensitively (the exam accepts "," or "." decimals).
 */
export function valuesMatch(got: CellValue, expected: number | string, tol = 1e-3): boolean {
  if (typeof expected === "number") {
    const g = typeof got === "number" ? got : Number(String(got).replace(",", "."));
    if (!Number.isFinite(g)) return false;
    const denom = Math.max(1, Math.abs(expected));
    return Math.abs(g - expected) <= tol * denom;
  }
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(",", ".");
  const gs = typeof got === "number" ? String(got) : got === null ? "" : String(got);
  return norm(gs) === norm(expected);
}
