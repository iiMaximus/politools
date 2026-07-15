import type { NumericQuestion } from "../types";
import { valuesMatch } from "./excel";

/* ================================================================== *
 *  ANSWER CHECKING for numeric questions. Delegates to the Excel
 *  engine's valuesMatch, which already handles comma decimals (Italian
 *  keyboards type "3,14") and relative tolerance.
 * ================================================================== */

export function checkNumeric(input: string, q: NumericQuestion): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  return valuesMatch(trimmed, q.answer, q.tolerance ?? 1e-2);
}
