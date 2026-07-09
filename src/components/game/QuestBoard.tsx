import { Icon } from "../Icon";
import {
  questProgress,
  type GameState,
  type QuestInstance,
} from "../../lib/game";

/* ================================================================== *
 *  QUEST BOARD — today's three auto-generated quests with live
 *  progress. Quests self-complete (game.ts evaluates on every log)
 *  and pay bonus XP.
 * ================================================================== */

export function QuestBoard({ quests, state }: { quests: QuestInstance[]; state: GameState }) {
  if (!quests.length) return null;
  return (
    <div className="grid gap-2.5">
      {quests.map((q) => (
        <QuestRow key={q.id} q={q} state={state} />
      ))}
    </div>
  );
}

function QuestRow({ q, state }: { q: QuestInstance; state: GameState }) {
  const value = q.completedAt ? q.target : questProgress(q, state);
  const done = !!q.completedAt || value >= q.target;
  const pct = q.target ? Math.round((value / q.target) * 100) : 0;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition"
      style={{
        borderColor: done ? "color-mix(in oklab, var(--good) 45%, transparent)" : "var(--color-line)",
        background: done ? "var(--good-bg)" : "var(--color-surface)",
      }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{
          background: done ? "var(--good)" : "var(--accent-soft)",
          color: done ? "#fff" : "var(--accent)",
        }}
      >
        <Icon name={done ? "Check" : q.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold" style={done ? { color: "var(--good)" } : undefined}>
          {q.label}
        </div>
        {!done && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono text-xs font-bold text-[var(--color-muted)]">
          {value}/{q.target}
        </div>
        <div className="text-[10px] font-semibold" style={{ color: done ? "var(--good)" : "var(--color-faint)" }}>
          +{q.rewardXp} XP
        </div>
      </div>
    </div>
  );
}
