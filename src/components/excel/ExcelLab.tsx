import { useEffect, useMemo, useState } from "react";
import { Sheet, parseAddr, formatNumber, valuesMatch } from "../../lib/excel";
import type { LabExercise } from "./types";
import { ExcelGrid, type CellStatus } from "./ExcelGrid";
import { Icon } from "../Icon";
import { cn } from "../../lib/cn";

function dims(ex: LabExercise): { rows: number; cols: number } {
  let maxRow = 12;
  let maxCol = 6;
  const scan = (addr: string) => {
    const p = parseAddr(addr);
    if (!p) return;
    maxRow = Math.max(maxRow, p.row + 1);
    maxCol = Math.max(maxCol, p.col + 2);
  };
  Object.keys(ex.given).forEach(scan);
  ex.checks.forEach((c) => scan(c.cell));
  return { rows: ex.rows ?? maxRow, cols: ex.cols ?? maxCol };
}

export function ExcelLab({ ex }: { ex: LabExercise }) {
  const storeKey = `esmm-lab-${ex.id}`;
  const [user, setUser] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { rows, cols } = useMemo(() => dims(ex), [ex]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storeKey);
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey]);

  const onEdit = (addr: string, value: string) => {
    setChecked(false);
    setUser((u) => {
      const next = { ...u };
      if (value === "") delete next[addr];
      else next[addr] = value;
      try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const reset = () => {
    setUser({});
    setChecked(false);
    setRevealed(false);
    try { localStorage.removeItem(storeKey); } catch { /* ignore */ }
  };

  const sheet = useMemo(() => new Sheet({ ...ex.given, ...user }), [ex.given, user]);

  const results = ex.checks.map((c) => {
    const val = sheet.get(c.cell);
    return { check: c, val, ok: valuesMatch(val, c.expected, c.tol), filled: (user[c.cell] ?? "") !== "" };
  });
  const allOk = results.every((r) => r.ok);
  const anyFilled = results.some((r) => r.filled);

  const status: Record<string, CellStatus> = {};
  if (checked) for (const r of results) status[r.check.cell] = r.ok ? "ok" : "bad";

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
      <div className="prose-lesson mb-3 !text-[0.95rem] !text-[var(--color-ink)]">{ex.prompt}</div>
      {ex.hint && (
        <div className="mb-3 flex gap-2 rounded-lg border border-[var(--info)]/30 bg-[var(--info-bg)] px-3 py-2 text-[0.85rem] text-[var(--color-muted)]">
          <Icon name="Info" size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 2 }} />
          <div>{ex.hint}</div>
        </div>
      )}

      <ExcelGrid
        sheet={sheet}
        given={ex.given}
        user={user}
        onEdit={onEdit}
        rows={rows}
        cols={cols}
        answerCells={new Set(ex.checks.map((c) => c.cell))}
        status={status}
      />

      {/* answer checklist */}
      <div className="mt-3 grid gap-1.5">
        {results.map((r, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-[0.88rem]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              {checked ? (
                <Icon name={r.ok ? "CircleCheck" : "CircleX"} size={17} style={{ color: r.ok ? "var(--good)" : "var(--bad)" }} />
              ) : (
                <span className="font-mono text-xs text-[var(--color-faint)]">{r.check.cell}</span>
              )}
            </span>
            <span className="flex-1 text-[var(--color-ink)]">{r.check.label}</span>
            <span className="font-mono text-[var(--color-muted)]">
              {r.filled ? formatNumber(r.val) : "—"}
            </span>
            {(revealed || (checked && !r.ok)) && (
              <span className="font-mono text-xs text-[var(--accent)]">
                = {typeof r.check.expected === "number" ? formatNumber(r.check.expected) : r.check.expected}
                {r.check.unit ? ` ${r.check.unit}` : ""}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setChecked(true)} disabled={!anyFilled} className={cn("btn btn-primary text-sm", !anyFilled && "opacity-50")}>
          Check answers
        </button>
        <button onClick={() => setRevealed((v) => !v)} className="btn btn-ghost text-sm">
          {revealed ? "Hide solution" : "Reveal solution"}
        </button>
        <button onClick={reset} className="btn btn-ghost text-sm">
          <Icon name="RotateCcw" size={14} /> Reset
        </button>
        {checked && allOk && (
          <span className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-[var(--good)]">
            <Icon name="PartyPopper" size={16} /> All correct
          </span>
        )}
      </div>

      {/* revealed formulas + method */}
      {revealed && (
        <div className="mt-3 rounded-xl border border-[var(--accent-line)] bg-[var(--color-surface)] p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">How to compute it</div>
          <div className="grid gap-2">
            {ex.checks.map((c, i) => (
              <div key={i} className="text-[0.85rem]">
                <span className="text-[var(--color-muted)]">{c.label}: </span>
                {c.hintFormula && (
                  <code className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-[0.82rem] text-[var(--color-ink)]">{c.hintFormula}</code>
                )}
                {c.teach && <div className="mt-0.5 text-[var(--color-muted)]">{c.teach}</div>}
              </div>
            ))}
          </div>
          {ex.method && <div className="prose-lesson mt-3 border-t border-[var(--color-line)] pt-3 !text-[0.88rem]">{ex.method}</div>}
        </div>
      )}
    </div>
  );
}
