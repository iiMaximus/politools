import type { ReactNode } from "react";

/** One answer the student must produce in a designated cell. */
export interface LabCheck {
  /** target cell address, e.g. "C2" */
  cell: string;
  /** what this value represents, shown in the checklist */
  label: ReactNode;
  /** expected result — number (tolerance-compared) or exact string */
  expected: number | string;
  /** absolute/relative tolerance for numeric answers (default 1e-3) */
  tol?: number;
  /** the canonical Excel formula, revealed on demand */
  hintFormula?: string;
  /** short teaching note shown when revealed */
  teach?: ReactNode;
  /** unit suffix shown next to the expected value (e.g. "mm", "%") */
  unit?: string;
}

/** A single interactive spreadsheet exercise. */
export interface LabExercise {
  id: string;
  title: ReactNode;
  /** the question text / scenario shown above the grid */
  prompt: ReactNode;
  /**
   * Pre-filled, locked cells: address -> raw content (a literal like "43",
   * a label like "Sample average:", or even a given formula "=A1/B1").
   * These are the "given" data and labels; they cannot be edited.
   */
  given: Record<string, string>;
  /** the cells the student must fill and that get validated */
  checks: LabCheck[];
  /** number of columns to render (default: enough for given+checks, min 6) */
  cols?: number;
  /** number of rows to render (default: enough for given+checks, min 12) */
  rows?: number;
  /** optional fully-worked method, revealed after solving */
  method?: ReactNode;
  /** optional hint shown before the grid */
  hint?: ReactNode;
}
