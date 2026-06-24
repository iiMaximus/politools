import type { ReactNode } from "react";
import { ExcelLab } from "../../components/excel/ExcelLab";
import type { LabExercise, LabCheck } from "../../components/excel/types";
import { rt, rtInline } from "../../components/RichText";

import lab1prob from "./labs/lab1-prob.json";
import lab1stats from "./labs/lab1-stats.json";
import lab2 from "./labs/lab2-data.json";
import lab3 from "./labs/lab3-uncertainty.json";
import examCaps from "./labs/exam-caps.json";

/* JSON-authored exercise (strings only) — hydrated to a LabExercise with
 * RichText nodes. Numbers in `given`/`expected` are accepted and coerced. */
export interface RawLabCheck {
  cell: string;
  label: string;
  expected: number | string;
  tol?: number;
  hintFormula?: string;
  teach?: string;
  unit?: string;
}
export interface RawLab {
  id: string;
  title: string;
  prompt: string;
  hint?: string;
  given: Record<string, string | number>;
  checks: RawLabCheck[];
  rows?: number;
  cols?: number;
  method?: string;
}

function hydrate(d: RawLab): LabExercise {
  const checks: LabCheck[] = d.checks.map((c) => ({
    cell: c.cell,
    label: rtInline(c.label),
    expected: c.expected,
    tol: c.tol,
    hintFormula: c.hintFormula,
    teach: c.teach ? rt(c.teach) : undefined,
    unit: c.unit,
  }));
  return {
    id: d.id,
    title: d.title,
    prompt: rt(d.prompt) as ReactNode,
    hint: d.hint ? rt(d.hint) : undefined,
    given: Object.fromEntries(Object.entries(d.given).map(([k, v]) => [k, String(v)])),
    checks,
    rows: d.rows,
    cols: d.cols,
    method: d.method ? rt(d.method) : undefined,
  };
}

export const ALL_LABS: RawLab[] = [
  ...(lab1prob as unknown as RawLab[]),
  ...(lab1stats as unknown as RawLab[]),
  ...(lab2 as unknown as RawLab[]),
  ...(lab3 as unknown as RawLab[]),
  ...(examCaps as unknown as RawLab[]),
];

/** simKey "lab:<id>" -> a rendered <ExcelLab>. */
export const LAB_SIMS: Record<string, () => ReactNode> = Object.fromEntries(
  ALL_LABS.map((d) => [`lab:${d.id}`, () => <ExcelLab ex={hydrate(d)} />]),
);
