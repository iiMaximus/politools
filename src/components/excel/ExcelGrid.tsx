import { useEffect, useMemo, useRef, useState } from "react";
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

/** Is a raw string a label (non-numeric text, not a formula)? */
function isLabel(raw: string): boolean {
  if (raw.startsWith("=")) return false;
  if (raw.trim() === "") return false;
  return Number.isNaN(Number(raw.replace(",", ".")));
}

export function ExcelGrid({ sheet, given, user, onEdit, rows, cols, answerCells, status }: Props) {
  const [selected, setSelected] = useState<string>("A1");
  const [editing, setEditing] = useState(false);
  const [inline, setInline] = useState(false); // edit started inside the cell (vs the formula bar)
  const [buffer, setBuffer] = useState("");
  const cellRefs = useRef(new Map<string, HTMLDivElement | null>());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const rawOf = (addr: string) => user[addr] ?? given[addr] ?? "";
  const isLocked = (addr: string) => addr in given;

  // keep buffer synced to selection when not actively editing
  useEffect(() => {
    if (!editing) setBuffer(rawOf(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // autofocus the in-cell editor only when the edit was started in the cell,
  // so typing in the formula bar doesn't yank focus away from it.
  useEffect(() => {
    if (editing && inline) inputRef.current?.focus();
  }, [editing, inline]);

  const focusCell = (addr: string) => {
    setSelected(addr);
    setEditing(false);
    setInline(false);
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
    if (next) move(selected, next.dr, next.dc);
    else cellRefs.current.get(selected)?.focus();
  };

  const startEdit = (initial?: string) => {
    if (isLocked(selected)) return;
    setBuffer(initial ?? rawOf(selected));
    setEditing(true);
    setInline(true);
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

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); commit({ dr: 1, dc: 0 }); }
    else if (e.key === "Tab") { e.preventDefault(); commit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
    else if (e.key === "Escape") { e.preventDefault(); setEditing(false); setInline(false); setBuffer(rawOf(selected)); cellRefs.current.get(selected)?.focus(); }
  };

  const colLetters = useMemo(() => Array.from({ length: cols }, (_, i) => indexToCol(i)), [cols]);
  const selRaw = rawOf(selected);

  return (
    <div className="select-none text-[13px]">
      {/* formula bar */}
      <div className="mb-2 flex items-stretch gap-2">
        <div className="flex w-14 shrink-0 items-center justify-center rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] font-mono text-xs font-semibold text-[var(--color-muted)]">
          {selected}
        </div>
        <div className="flex flex-1 items-center rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2">
          <span className="mr-2 font-serif text-[var(--color-faint)]">ƒx</span>
          <input
            value={editing ? buffer : selRaw}
            spellCheck={false}
            placeholder={isLocked(selected) ? "" : "type a value or =formula"}
            readOnly={isLocked(selected)}
            onChange={(e) => { setBuffer(e.target.value); setEditing(true); setInline(false); }}
            onKeyDown={onInputKeyDown}
            className="w-full bg-transparent py-1.5 font-mono text-[var(--color-ink)] outline-none placeholder:text-[var(--color-faint)]"
          />
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
                    return (
                      <td key={addr} className="border-b border-r border-[var(--color-line)] p-0">
                        <div
                          ref={(el) => { cellRefs.current.set(addr, el); }}
                          tabIndex={0}
                          onClick={() => { setSelected(addr); setEditing(false); setInline(false); }}
                          onDoubleClick={() => { setSelected(addr); startEdit(); }}
                          onFocus={() => setSelected(addr)}
                          onKeyDown={(e) => onCellKeyDown(e, addr)}
                          className={cn(
                            "relative flex h-7 min-w-[68px] items-center px-1.5 outline-none",
                            label ? "justify-start whitespace-nowrap text-[var(--color-muted)]" : "justify-end",
                            locked && !label && "bg-[var(--color-surface-2)] text-[var(--color-ink)]",
                            !locked && "cursor-cell bg-[var(--color-surface)]",
                            isAns && !st && "bg-[var(--accent-soft)] ring-1 ring-inset ring-[var(--accent-line)]",
                            st === "ok" && "bg-[var(--good-bg)] text-[var(--good)]",
                            st === "bad" && "bg-[var(--bad-bg)] text-[var(--bad)]",
                            sel && "z-[1] ring-2 ring-inset ring-[var(--accent)]",
                          )}
                        >
                          {editing && sel && inline ? (
                            <input
                              ref={inputRef}
                              value={buffer}
                              spellCheck={false}
                              onChange={(e) => setBuffer(e.target.value)}
                              onKeyDown={onInputKeyDown}
                              onBlur={() => commit()}
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
