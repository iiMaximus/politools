import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  // bumped on every "Check" so the success flourish (row pop, icon spring,
  // confetti) replays each time — even on a re-check without edits.
  const [checkSeq, setCheckSeq] = useState(0);
  const [burst, setBurst] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const reduce = useReducedMotion();
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
    setBurst(0);
    try { localStorage.removeItem(storeKey); } catch { /* ignore */ }
  };

  const sheet = useMemo(() => new Sheet({ ...ex.given, ...user }), [ex.given, user]);

  const results = ex.checks.map((c) => {
    const val = sheet.get(c.cell);
    return { check: c, val, ok: valuesMatch(val, c.expected, c.tol), filled: (user[c.cell] ?? "") !== "" };
  });
  const allOk = results.every((r) => r.ok);
  const anyFilled = results.some((r) => r.filled);

  const runCheck = () => {
    setChecked(true);
    setCheckSeq((s) => s + 1);
    if (allOk) setBurst((b) => b + 1);
  };

  const status: Record<string, CellStatus> = {};
  if (checked) for (const r of results) status[r.check.cell] = r.ok ? "ok" : "bad";

  return (
    <div className="relative rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
      <CorrectBurst trigger={burst} />
      <div className="prose-lesson mb-3 !text-[0.95rem] !text-[var(--color-ink)]">{ex.prompt}</div>
      {ex.hint && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            aria-expanded={showHint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[0.82rem] font-semibold text-[var(--color-muted)] transition hover:border-[color-mix(in_oklab,var(--info)_45%,var(--color-line))] hover:text-[var(--color-ink)]"
          >
            <Icon name="Lightbulb" size={14} style={{ color: "var(--info)" }} />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
          <AnimatePresence initial={false}>
            {showHint && (
              <motion.div
                key="hint"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex gap-2 rounded-lg border border-[var(--info)]/30 bg-[var(--info-bg)] px-3 py-2 text-[0.85rem] text-[var(--color-muted)]">
                  <Icon name="Info" size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 2 }} />
                  <div>{ex.hint}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
        {results.map((r, i) => {
          const correct = checked && r.ok;
          return (
            <motion.div
              key={`${i}-${checkSeq}`}
              initial={false}
              animate={correct && !reduce ? { scale: [1, 1.035, 1] } : undefined}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[0.88rem] transition-colors",
                correct
                  ? "border-[color-mix(in_oklab,var(--good)_45%,var(--color-line))] bg-[var(--good-bg)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface)]"
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {checked ? (
                  <motion.span
                    initial={reduce ? false : { scale: 0, rotate: r.ok ? -45 : 0 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 17 }}
                    className="flex items-center justify-center"
                  >
                    <Icon name={r.ok ? "CircleCheck" : "CircleX"} size={17} style={{ color: r.ok ? "var(--good)" : "var(--bad)" }} />
                  </motion.span>
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
            </motion.div>
          );
        })}
      </div>

      {/* controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={runCheck} disabled={!anyFilled} className={cn("btn btn-primary text-sm", !anyFilled && "opacity-50")}>
          Check answers
        </button>
        <button onClick={() => setRevealed((v) => !v)} className="btn btn-ghost text-sm">
          {revealed ? "Hide solution" : "Reveal solution"}
        </button>
        <button onClick={reset} className="btn btn-ghost text-sm">
          <Icon name="RotateCcw" size={14} /> Reset
        </button>
        {checked && allOk && (
          <motion.span
            key={checkSeq}
            initial={reduce ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 460, damping: 15 }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--good)_45%,transparent)] bg-[var(--good-bg)] px-3 py-1 text-sm font-bold text-[var(--good)]"
          >
            <motion.span
              animate={reduce ? undefined : { rotate: [0, -14, 12, -8, 0] }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="inline-flex"
            >
              <Icon name="PartyPopper" size={16} />
            </motion.span>
            All correct!
          </motion.span>
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

interface BurstPiece {
  id: number;
  x: number;
  y: number;
  rot: number;
  dur: number;
  delay: number;
  color: string;
}

const BURST_COLORS = ["var(--good)", "var(--accent)", "var(--accent-2)", "#f59e0b"];

/** A short, one-shot confetti burst that replays whenever `trigger` increments. */
function CorrectBurst({ trigger }: { trigger: number }) {
  const reduce = useReducedMotion();
  const [pieces, setPieces] = useState<BurstPiece[]>([]);

  useEffect(() => {
    if (!trigger || reduce) return;
    const next: BurstPiece[] = Array.from({ length: 22 }, (_, i) => ({
      id: trigger * 1000 + i,
      x: (Math.random() - 0.5) * 300,
      y: -50 + Math.random() * 170,
      rot: (Math.random() - 0.5) * 540,
      dur: 0.8 + Math.random() * 0.5,
      delay: Math.random() * 0.08,
      color: BURST_COLORS[i % BURST_COLORS.length],
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1500);
    return () => clearTimeout(t);
  }, [trigger, reduce]);

  if (!pieces.length) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl">
      <div className="absolute left-1/2 top-10">
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5, rotate: p.rot }}
            transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
            className="absolute block h-2 w-1.5 rounded-[1px]"
            style={{ background: p.color }}
          />
        ))}
      </div>
    </div>
  );
}
