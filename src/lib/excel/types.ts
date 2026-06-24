/* Engine-internal value model (distinct from the lab-exercise types in
 * components/excel). A cell holds one of these; a function argument is
 * either a scalar or a rectangular range of cells. */

export type CellValue = number | string | boolean | null;

export type Arg =
  | { kind: "scalar"; value: CellValue }
  | { kind: "range"; values: CellValue[][] };

/** Thrown by functions/evaluation; surfaced as an Excel-style #ERR. */
export class ExcelError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "ExcelError";
  }
}
