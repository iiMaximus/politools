import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { indexToCol, makeAddr, parseAddr, formatNumber, type Sheet } from "../../lib/excel";
import { cn } from "../../lib/cn";

export type CellStatus = "ok" | "bad" | undefined;

interface Props {
  sheet: Sheet;
  given: Record<string, string>;
  user: Record<string, string>;
  onEdit: (addr: string, value: string) => void;
  rows: number;
  cols: number;
  answerCells: Set<string>;
  status: Record<string, CellStatus>;
}

type CellRange = { anchor: string; focus: string };

interface FunctionHelp {
  name: string;
  args: string[];
  description: string;
}

const FUNCTION_HELP: FunctionHelp[] = [
  { name: "AVERAGE", args: ["number1", "[number2]", "..."], description: "Arithmetic mean of values or ranges." },
  { name: "SUM", args: ["number1", "[number2]", "..."], description: "Adds values or ranges." },
  { name: "COUNT", args: ["value1", "[value2]", "..."], description: "Counts numeric cells." },
  { name: "MIN", args: ["number1", "[number2]", "..."], description: "Smallest numeric value." },
  { name: "MAX", args: ["number1", "[number2]", "..."], description: "Largest numeric value." },
  { name: "MEDIAN", args: ["number1", "[number2]", "..."], description: "Middle value of the sorted data." },
  { name: "MODE", args: ["number1", "[number2]", "..."], description: "Most frequent value." },
  { name: "MODE.SNGL", args: ["number1", "[number2]", "..."], description: "Most frequent value." },
  { name: "VAR.S", args: ["number1", "[number2]", "..."], description: "Sample variance with n-1 divisor." },
  { name: "STDEV.S", args: ["number1", "[number2]", "..."], description: "Sample standard deviation with n-1 divisor." },
  { name: "VAR.P", args: ["number1", "[number2]", "..."], description: "Population variance with n divisor." },
  { name: "STDEV.P", args: ["number1", "[number2]", "..."], description: "Population standard deviation with n divisor." },
  { name: "QUARTILE", args: ["array", "quart"], description: "Quartile 0, 1, 2, 3, or 4." },
  { name: "QUARTILE.INC", args: ["array", "quart"], description: "Inclusive quartile." },
  { name: "NORM.DIST", args: ["x", "mean", "standard_dev", "cumulative"], description: "Normal density or cumulative probability." },
  { name: "NORM.S.DIST", args: ["z", "cumulative"], description: "Standard normal density or CDF." },
  { name: "NORM.INV", args: ["probability", "mean", "standard_dev"], description: "Inverse normal CDF." },
  { name: "NORM.S.INV", args: ["probability"], description: "Inverse standard normal CDF." },
  { name: "T.INV", args: ["probability", "deg_freedom"], description: "Inverse Student t CDF." },
  { name: "T.INV.2T", args: ["probability", "deg_freedom"], description: "Two-tailed Student t critical value." },
  { name: "T.DIST", args: ["x", "deg_freedom", "cumulative"], description: "Student t density or CDF." },
  { name: "T.DIST.RT", args: ["x", "deg_freedom"], description: "Right-tail Student t probability." },
  { name: "T.DIST.2T", args: ["x", "deg_freedom"], description: "Two-tailed Student t probability." },
  { name: "CHISQ.DIST", args: ["x", "deg_freedom", "cumulative"], description: "Chi-square density or cumulative probability." },
  { name: "CHISQ.DIST.RT", args: ["x", "deg_freedom"], description: "Right-tail chi-square probability." },
  { name: "CHISQ.INV", args: ["probability", "deg_freedom"], description: "Inverse chi-square CDF." },
  { name: "CHISQ.INV.RT", args: ["probability", "deg_freedom"], description: "Inverse right-tail chi-square." },
  { name: "F.DIST", args: ["x", "deg_freedom1", "deg_freedom2", "cumulative"], description: "Fisher F density or CDF." },
  { name: "F.DIST.RT", args: ["x", "deg_freedom1", "deg_freedom2"], description: "Right-tail Fisher F probability." },
  { name: "F.INV", args: ["probability", "deg_freedom1", "deg_freedom2"], description: "Inverse Fisher F CDF." },
  { name: "F.INV.RT", args: ["probability", "deg_freedom1", "deg_freedom2"], description: "Inverse right-tail Fisher F." },
  { name: "BINOM.DIST", args: ["number_s", "trials", "probability_s", "cumulative"], description: "Binomial probability." },
  { name: "HYPGEOM.DIST", args: ["sample_s", "number_sample", "population_s", "number_pop", "cumulative"], description: "Hypergeometric probability." },
  { name: "POISSON.DIST", args: ["x", "mean", "cumulative"], description: "Poisson probability." },
  { name: "SQRT", args: ["number"], description: "Square root." },
  { name: "POWER", args: ["number", "power"], description: "Raises a number to a power." },
  { name: "LN", args: ["number"], description: "Natural logarithm." },
  { name: "ABS", args: ["number"], description: "Absolute value." },
  { name: "ROUND", args: ["number", "num_digits"], description: "Rounds to a fixed number of digits." },
  { name: "ROUNDDOWN", args: ["number", "num_digits"], description: "Rounds toward zero to a fixed number of digits." },
  { name: "INT", args: ["number"], description: "Rounds down to an integer." },
  { name: "IF", args: ["logical_test", "value_if_true", "[value_if_false]"], description: "Returns one value if true and another if false." },
  { name: "AND", args: ["logical1", "[logical2]", "..."], description: "TRUE only if all arguments are true." },
  { name: "OR", args: ["logical1", "[logical2]", "..."], description: "TRUE if any argument is true." },
];

const HELP_BY_NAME = new Map(FUNCTION_HELP.map((fn) => [fn.name, fn]));
const COMMON_FUNCTIONS = [
  "AVERAGE",
  "STDEV.S",
  "VAR.S",
  "SUM",
  "COUNT",
  "NORM.DIST",
  "CHISQ.DIST",
  "CHISQ.DIST.RT",
  "T.INV.2T",
  "F.DIST.RT",
];

/** Is a raw string a label (non-numeric text, not a formula)? */
function isLabel(raw: string): boolean {
  if (raw.startsWith("=")) return false;
  if (raw.trim() === "") return false;
  return Number.isNaN(Number(raw.replace(",", ".")));
}

function normalizeFunctionName(name: string): string {
  return name.toUpperCase().replace(/^_XLFN\./, "");
}

function isFormula(raw: string): boolean {
  return raw.trimStart().startsWith("=");
}

function rangeBounds(range: CellRange) {
  const a = parseAddr(range.anchor);
  const b = parseAddr(range.focus);
  if (!a || !b) return null;
  return {
    c0: Math.min(a.col, b.col),
    c1: Math.max(a.col, b.col),
    r0: Math.min(a.row, b.row),
    r1: Math.max(a.row, b.row),
  };
}

function rangeToText(range: CellRange): string {
  const bounds = rangeBounds(range);
  if (!bounds) return range.focus;
  const start = makeAddr(bounds.c0, bounds.r0);
  const end = makeAddr(bounds.c1, bounds.r1);
  return start === end ? start : `${start}:${end}`;
}

function cellInRange(addr: string, range: CellRange | null): boolean {
  if (!range) return false;
  const bounds = rangeBounds(range);
  const p = parseAddr(addr);
  if (!bounds || !p) return false;
  return p.col >= bounds.c0 && p.col <= bounds.c1 && p.row >= bounds.r0 && p.row <= bounds.r1;
}

function sameCellRange(range: CellRange | null): boolean {
  return !range || range.anchor === range.focus;
}

type FunctionPrefix = { text: string; start: number; end: number };
type ActiveCall = { help: FunctionHelp; argIndex: number };
type FormulaAssist = { prefix: FunctionPrefix | null; suggestions: FunctionHelp[]; activeCall: ActiveCall | null };

function getFunctionPrefix(formula: string, caret: number): FunctionPrefix | null {
  if (!isFormula(formula)) return null;
  const safeCaret = Math.max(1, Math.min(caret, formula.length));
  const before = formula.slice(0, safeCaret);
  if (before === "=") return { text: "", start: 1, end: 1 };
  const match = /([A-Za-z][A-Za-z0-9_.]*)$/.exec(before);
  if (!match) return null;

  const text = match[1];
  if (/\d/.test(text)) return null;
  const start = safeCaret - text.length;
  const prev = before[start - 1] ?? "";
  const next = formula[safeCaret] ?? "";
  if (start > 1 && /[A-Za-z0-9_.$]/.test(prev)) return null;
  if (next === "(") return null;
  return { text: normalizeFunctionName(text), start, end: safeCaret };
}

function getActiveCall(formula: string, caret: number): ActiveCall | null {
  if (!isFormula(formula)) return null;
  const stack: { name?: string; argIndex: number }[] = [];
  const end = Math.max(1, Math.min(caret, formula.length));
  let i = 1;

  while (i < end) {
    const ch = formula[i];
    if (/[A-Za-z_]/.test(ch)) {
      const start = i;
      i++;
      while (i < end && /[A-Za-z0-9_.]/.test(formula[i])) i++;
      let afterName = i;
      while (afterName < end && /\s/.test(formula[afterName])) afterName++;
      if (formula[afterName] === "(") {
        stack.push({ name: normalizeFunctionName(formula.slice(start, i)), argIndex: 0 });
        i = afterName + 1;
      }
      continue;
    }
    if (ch === "(") stack.push({ argIndex: 0 });
    else if (ch === ")") stack.pop();
    else if ((ch === "," || ch === ";") && stack.length > 0) stack[stack.length - 1].argIndex += 1;
    i++;
  }

  for (let s = stack.length - 1; s >= 0; s--) {
    const name = stack[s].name;
    const help = name ? HELP_BY_NAME.get(name) : undefined;
    if (help) return { help, argIndex: stack[s].argIndex };
  }
  return null;
}

function getFormulaAssist(formula: string, caret: number): FormulaAssist {
  const prefix = getFunctionPrefix(formula, caret);
  const activeCall = getActiveCall(formula, caret);
  const suggestions = prefix
    ? (prefix.text
        ? FUNCTION_HELP.filter((fn) => fn.name.startsWith(prefix.text))
        : COMMON_FUNCTIONS.map((name) => HELP_BY_NAME.get(name)).filter(Boolean) as FunctionHelp[])
      .slice(0, 10)
    : [];
  return { prefix, suggestions, activeCall };
}

export function ExcelGrid({ sheet, given, user, onEdit, rows, cols, answerCells, status }: Props) {
  const [selected, setSelected] = useState<string>("A1");
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [draggingRange, setDraggingRange] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inline, setInline] = useState(false); // edit started inside the cell (vs the formula bar)
  const [buffer, setBuffer] = useState("");
  const [caret, setCaret] = useState(0);
  const [formulaRefRange, setFormulaRefRange] = useState<CellRange | null>(null);

  const cellRefs = useRef(new Map<string, HTMLDivElement | null>());
  const formulaInputRef = useRef<HTMLInputElement | null>(null);
  const cellInputRef = useRef<HTMLInputElement | null>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const pickingFormulaRef = useRef(false);
  const draggingRangeRef = useRef(false);
  const selectedRangeRef = useRef<CellRange | null>(null);
  const formulaRefEdit = useRef<{ start: number; end: number; anchor: string } | null>(null);

  const rawOf = useCallback((addr: string) => user[addr] ?? given[addr] ?? "", [given, user]);
  const isLocked = useCallback((addr: string) => addr in given, [given]);

  const getEditorInput = useCallback(
    () => activeInputRef.current ?? (inline ? cellInputRef.current : formulaInputRef.current),
    [inline],
  );

  const setEditorCaret = useCallback(
    (pos: number) => {
      setCaret(pos);
      requestAnimationFrame(() => {
        const input = getEditorInput();
        input?.focus();
        input?.setSelectionRange(pos, pos);
      });
    },
    [getEditorInput],
  );

  const updateCaretFromInput = (input: HTMLInputElement) => {
    setCaret(input.selectionStart ?? input.value.length);
  };

  // keep buffer synced to selection when not actively editing
  useEffect(() => {
    if (!editing) {
      const raw = rawOf(selected);
      setBuffer(raw);
      setCaret(raw.length);
    }
  }, [editing, rawOf, selected]);

  // autofocus the in-cell editor only when the edit was started in the cell,
  // so typing in the formula bar doesn't yank focus away from it.
  useEffect(() => {
    if (editing && inline) {
      activeInputRef.current = cellInputRef.current;
      cellInputRef.current?.focus();
    }
  }, [editing, inline]);

  const focusCell = (addr: string) => {
    setSelected(addr);
    setSelectedRange(null);
    selectedRangeRef.current = null;
    draggingRangeRef.current = false;
    setEditing(false);
    setInline(false);
    setFormulaRefRange(null);
    formulaRefEdit.current = null;
    requestAnimationFrame(() => cellRefs.current.get(addr)?.focus());
  };

  const move = (addr: string, dr: number, dc: number) => {
    const p = parseAddr(addr);
    if (!p) return;
    const r = Math.min(rows, Math.max(1, p.row + dr));
    const c = Math.min(cols - 1, Math.max(0, p.col + dc));
    focusCell(makeAddr(c, r));
  };

  const commit = (next?: { dr: number; dc: number }) => {
    if (!editing) return; // guard against a second (blur-after-move) call
    if (!isLocked(selected)) onEdit(selected, buffer);
    setEditing(false);
    setInline(false);
    setFormulaRefRange(null);
    draggingRangeRef.current = false;
    formulaRefEdit.current = null;
    if (next) move(selected, next.dr, next.dc);
    else cellRefs.current.get(selected)?.focus();
  };

  const cancelEdit = () => {
    setEditing(false);
    setInline(false);
    setFormulaRefRange(null);
    draggingRangeRef.current = false;
    formulaRefEdit.current = null;
    setBuffer(rawOf(selected));
    cellRefs.current.get(selected)?.focus();
  };

  const startEdit = (initial?: string) => {
    if (isLocked(selected)) return;
    const next = initial ?? rawOf(selected);
    setSelectedRange(null);
    selectedRangeRef.current = null;
    setFormulaRefRange(null);
    formulaRefEdit.current = null;
    setBuffer(next);
    setCaret(next.length);
    setEditing(true);
    setInline(true);
  };

  const replaceFormulaReference = useCallback(
    (range: CellRange) => {
      const edit = formulaRefEdit.current;
      if (!edit) return;
      const text = rangeToText(range);
      setBuffer((prev) => {
        const next = `${prev.slice(0, edit.start)}${text}${prev.slice(edit.end)}`;
        return next;
      });
      const end = edit.start + text.length;
      formulaRefEdit.current = { ...edit, end };
      setEditorCaret(end);
    },
    [setEditorCaret],
  );

  const updateDragTarget = useCallback(
    (clientX: number, clientY: number) => {
      const target = document.elementFromPoint(clientX, clientY);
      const cell = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-cell]") : null;
      const addr = cell?.dataset.cell;
      if (!addr) return;

      if (pickingFormulaRef.current) {
        const edit = formulaRefEdit.current;
        if (!edit) return;
        const range = { anchor: edit.anchor, focus: addr };
        setFormulaRefRange(range);
        replaceFormulaReference(range);
        return;
      }

      if (draggingRangeRef.current && selectedRangeRef.current) {
        const range = { ...selectedRangeRef.current, focus: addr };
        selectedRangeRef.current = range;
        setSelectedRange(range);
      }
    },
    [replaceFormulaReference],
  );

  useEffect(() => {
    const endDrag = () => {
      if (pickingFormulaRef.current) {
        pickingFormulaRef.current = false;
        setEditorCaret(caret);
      }
      draggingRangeRef.current = false;
      setDraggingRange(false);
    };
    const onPointerMove = (event: PointerEvent) => updateDragTarget(event.clientX, event.clientY);
    const onMouseMove = (event: MouseEvent) => updateDragTarget(event.clientX, event.clientY);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("mouseup", endDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("mouseup", endDrag);
    };
  }, [caret, setEditorCaret, updateDragTarget]);

  const beginFormulaReference = (addr: string) => {
    const input = getEditorInput();
    const start = input?.selectionStart ?? caret ?? buffer.length;
    const end = input?.selectionEnd ?? start;
    formulaRefEdit.current = { start, end, anchor: addr };
    const range = { anchor: addr, focus: addr };
    setFormulaRefRange(range);
    replaceFormulaReference(range);
  };

  const applyFunctionSuggestion = (fn: FunctionHelp, prefixOverride?: FunctionPrefix | null) => {
    const input = getEditorInput();
    const pos = input?.selectionStart ?? caret ?? buffer.length;
    const prefix = prefixOverride ?? getFormulaAssist(buffer, pos).prefix;
    const start = prefix?.start ?? pos;
    const end = prefix?.end ?? pos;
    const insertion = `${fn.name}()`;
    const next = `${buffer.slice(0, start)}${insertion}${buffer.slice(end)}`;
    const nextCaret = start + fn.name.length + 1;
    setBuffer(next);
    setCaret(nextCaret);
    setEditing(true);
    setFormulaRefRange(null);
    formulaRefEdit.current = null;
    requestAnimationFrame(() => {
      const target = getEditorInput();
      target?.focus();
      target?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLInputElement>, nextInline: boolean) => {
    activeInputRef.current = e.currentTarget;
    setBuffer(e.target.value);
    setEditing(true);
    setInline(nextInline);
    setSelectedRange(null);
    selectedRangeRef.current = null;
    setFormulaRefRange(null);
    formulaRefEdit.current = null;
    updateCaretFromInput(e.currentTarget);
  };

  const onCellKeyDown = (e: React.KeyboardEvent, addr: string) => {
    if (editing) return;
    if (e.key === "ArrowUp") { e.preventDefault(); move(addr, -1, 0); }
    else if (e.key === "ArrowDown" || e.key === "Enter") { e.preventDefault(); move(addr, 1, 0); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); move(addr, 0, -1); }
    else if (e.key === "ArrowRight" || e.key === "Tab") { e.preventDefault(); move(addr, 0, e.shiftKey ? -1 : 1); }
    else if (e.key === "F2") { e.preventDefault(); startEdit(); }
    else if ((e.key === "Delete" || e.key === "Backspace") && !isLocked(addr)) { e.preventDefault(); onEdit(addr, ""); }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !isLocked(addr)) { startEdit(e.key); e.preventDefault(); }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    activeInputRef.current = e.currentTarget;
    const pos = e.currentTarget.selectionStart ?? buffer.length;
    const assist = getFormulaAssist(buffer, pos);
    if ((e.key === "Tab" || e.key === "Enter") && assist.suggestions.length > 0 && assist.prefix) {
      e.preventDefault();
      applyFunctionSuggestion(assist.suggestions[0], assist.prefix);
      return;
    }
    if (e.key === "Enter") { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
    else if (e.key === "Tab") { e.preventDefault(); commit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
    else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  };

  const onEditorBlur = () => {
    if (pickingFormulaRef.current) return;
    commit();
  };

  const handleCellPointerDown = (e: React.PointerEvent, addr: string) => {
    if (editing && isFormula(buffer) && !isLocked(selected)) {
      e.preventDefault();
      pickingFormulaRef.current = true;
      beginFormulaReference(addr);
      return;
    }

    setSelected(addr);
    setSelectedRange({ anchor: addr, focus: addr });
    selectedRangeRef.current = { anchor: addr, focus: addr };
    draggingRangeRef.current = true;
    setDraggingRange(true);
    setEditing(false);
    setInline(false);
    setFormulaRefRange(null);
    formulaRefEdit.current = null;
    requestAnimationFrame(() => cellRefs.current.get(addr)?.focus());
  };

  const handleCellPointerEnter = (addr: string) => {
    if (pickingFormulaRef.current) {
      const edit = formulaRefEdit.current;
      if (!edit) return;
      const range = { anchor: edit.anchor, focus: addr };
      setFormulaRefRange(range);
      replaceFormulaReference(range);
      return;
    }
    if (draggingRange && selectedRange) {
      const range = { ...selectedRange, focus: addr };
      selectedRangeRef.current = range;
      setSelectedRange(range);
    }
  };

  const colLetters = useMemo(() => Array.from({ length: cols }, (_, i) => indexToCol(i)), [cols]);
  const selRaw = rawOf(selected);
  const addressLabel = !editing && selectedRange && !sameCellRange(selectedRange) ? rangeToText(selectedRange) : selected;
  const formulaAssist = useMemo(() => getFormulaAssist(buffer, caret), [buffer, caret]);
  const showAssist = editing && isFormula(buffer) && (formulaAssist.suggestions.length > 0 || formulaAssist.activeCall);

  return (
    <div className="select-none text-[13px]">
      {/* formula bar */}
      <div className="mb-2 flex items-stretch gap-2">
        <div className="flex w-20 shrink-0 items-center justify-center rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] font-mono text-xs font-semibold text-[var(--color-muted)]">
          {addressLabel}
        </div>
        <div className="relative flex flex-1 items-center rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2">
          <span className="mr-2 font-serif text-[var(--color-faint)]">ƒx</span>
          <input
            ref={formulaInputRef}
            value={editing ? buffer : selRaw}
            spellCheck={false}
            placeholder={isLocked(selected) ? "" : "type a value or =formula"}
            readOnly={isLocked(selected)}
            onFocus={(e) => { activeInputRef.current = e.currentTarget; updateCaretFromInput(e.currentTarget); }}
            onClick={(e) => updateCaretFromInput(e.currentTarget)}
            onSelect={(e) => updateCaretFromInput(e.currentTarget)}
            onKeyUp={(e) => updateCaretFromInput(e.currentTarget)}
            onChange={(e) => handleEditorChange(e, false)}
            onKeyDown={onInputKeyDown}
            onBlur={onEditorBlur}
            className="w-full bg-transparent py-1.5 font-mono text-[var(--color-ink)] outline-none placeholder:text-[var(--color-faint)]"
          />
          {showAssist && (
            <FormulaAssistPanel
              assist={formulaAssist}
              onPick={(fn) => applyFunctionSuggestion(fn)}
            />
          )}
        </div>
      </div>

      {/* grid */}
      <div className="overflow-auto rounded-lg border border-[var(--color-line)]">
        <table className="border-collapse font-mono">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 h-7 w-10 border-b border-r border-[var(--color-line)] bg-[var(--color-surface-2)]" />
              {colLetters.map((c) => (
                <th
                  key={c}
                  className={cn(
                    "h-7 min-w-[68px] border-b border-r border-[var(--color-line)] px-2 text-center text-[11px] font-semibold",
                    indexToCol(parseAddr(selected)?.col ?? -1) === c
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-muted)]",
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, ri) => {
              const r = ri + 1;
              return (
                <tr key={r}>
                  <th className="sticky left-0 z-10 h-7 w-10 border-b border-r border-[var(--color-line)] bg-[var(--color-surface-2)] text-center text-[11px] font-semibold text-[var(--color-muted)]">
                    {r}
                  </th>
                  {colLetters.map((_, ci) => {
                    const addr = makeAddr(ci, r);
                    const locked = isLocked(addr);
                    const raw = rawOf(addr);
                    const isAns = answerCells.has(addr);
                    const st = status[addr];
                    const sel = selected === addr;
                    const label = locked && isLabel(raw);
                    const computed = sheet.get(addr);
                    const display = editing && sel ? buffer : label ? raw : formatNumber(computed);
                    const empty = raw === "" && display === "";
                    const inNormalRange = !editing && !sel && cellInRange(addr, selectedRange);
                    const inFormulaRange = cellInRange(addr, formulaRefRange);
                    return (
                      <td key={addr} className="border-b border-r border-[var(--color-line)] p-0">
                        <div
                          data-cell={addr}
                          ref={(el) => { cellRefs.current.set(addr, el); }}
                          tabIndex={0}
                          onPointerDown={(e) => handleCellPointerDown(e, addr)}
                          onPointerEnter={() => handleCellPointerEnter(addr)}
                          onDoubleClick={() => { setSelected(addr); startEdit(); }}
                          onFocus={() => { if (!editing) setSelected(addr); }}
                          onKeyDown={(e) => onCellKeyDown(e, addr)}
                          className={cn(
                            "relative flex h-7 min-w-[68px] items-center px-1.5 outline-none",
                            label ? "justify-start whitespace-nowrap text-[var(--color-muted)]" : "justify-end",
                            locked && !label && "bg-[var(--color-surface-2)] text-[var(--color-ink)]",
                            !locked && "cursor-cell bg-[var(--color-surface)]",
                            isAns && !st && "bg-[var(--accent-soft)] ring-1 ring-inset ring-[var(--accent-line)]",
                            st === "ok" && "excel-cell-correct bg-[var(--good-bg)] text-[var(--good)]",
                            st === "bad" && "bg-[var(--bad-bg)] text-[var(--bad)]",
                            inNormalRange && "shadow-[inset_0_0_0_1px_var(--accent-line)]",
                            inFormulaRange && "shadow-[inset_0_0_0_2px_var(--info)]",
                            sel && "z-[1] ring-2 ring-inset ring-[var(--accent)]",
                          )}
                        >
                          {editing && sel && inline ? (
                            <input
                              ref={cellInputRef}
                              value={buffer}
                              spellCheck={false}
                              onFocus={(e) => { activeInputRef.current = e.currentTarget; updateCaretFromInput(e.currentTarget); }}
                              onClick={(e) => updateCaretFromInput(e.currentTarget)}
                              onSelect={(e) => updateCaretFromInput(e.currentTarget)}
                              onKeyUp={(e) => updateCaretFromInput(e.currentTarget)}
                              onChange={(e) => handleEditorChange(e, true)}
                              onKeyDown={onInputKeyDown}
                              onBlur={onEditorBlur}
                              className="absolute inset-0 z-10 w-full bg-[var(--color-surface)] px-1.5 text-left text-[var(--color-ink)] outline-none ring-2 ring-inset ring-[var(--accent)]"
                            />
                          ) : (
                            <span className={cn("truncate", isAns && empty && "text-[var(--accent)]")}>
                              {isAns && empty ? "?" : display}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormulaAssistPanel({
  assist,
  onPick,
}: {
  assist: FormulaAssist;
  onPick: (fn: FunctionHelp) => void;
}) {
  return (
    <div className="absolute left-0 top-[calc(100%+0.35rem)] z-30 w-full max-w-xl overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl">
      {assist.suggestions.length > 0 && (
        <div className="max-h-56 overflow-auto py-1">
          {assist.suggestions.map((fn) => (
            <button
              key={fn.name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(fn)}
              className="grid w-full grid-cols-[9rem_1fr] gap-3 px-3 py-2 text-left transition hover:bg-[var(--accent-soft)]"
            >
              <span className="font-mono text-xs font-bold text-[var(--accent)]">{fn.name}</span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-xs text-[var(--color-ink)]">
                  {fn.name}({fn.args.join("; ")})
                </span>
                <span className="block truncate text-xs text-[var(--color-muted)]">{fn.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {assist.activeCall && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2">
          <div className="font-mono text-xs text-[var(--color-ink)]">
            <span className="font-bold text-[var(--accent)]">{assist.activeCall.help.name}</span>
            <span>(</span>
            {assist.activeCall.help.args.map((arg, i) => (
              <span key={`${arg}-${i}`}>
                {i > 0 && <span>; </span>}
                <span
                  className={cn(
                    "rounded px-1 py-0.5",
                    i === assist.activeCall!.argIndex && "bg-[var(--accent-soft)] text-[var(--accent)]",
                  )}
                >
                  {arg}
                </span>
              </span>
            ))}
            <span>)</span>
          </div>
          <div className="mt-1 text-xs text-[var(--color-muted)]">{assist.activeCall.help.description}</div>
        </div>
      )}
    </div>
  );
}
