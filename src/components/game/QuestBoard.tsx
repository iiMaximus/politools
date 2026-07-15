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

export function QuestBoard({
  quests,
  state,
  retro,
}: {
  quests: QuestInstance[];
  state: GameState;
  /** dark RPG quest-log styling (hub arcade mode) */
  retro?: boolean;
}) {
  if (!quests.length) return null;
  return (
    <div className="grid gap-2.5">
      {quests.map((q) => (
        <QuestRow key={q.id} q={q} state={state} retro={retro} />
      ))}
    </div>
  );
}

function QuestRow({ q, state, retro }: { q: QuestInstance; state: GameState; retro?: boolean }) {
  const value = q.completedAt ? q.target : questProgress(q, state);
  const done = !!q.completedAt || value >= q.target;
  const pct = q.target ? Math.round((value / q.target) * 100) : 0;

  if (retro) {
    return (
      <div className="mc-slot flex items-center gap-3 px-3 py-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded"
          style={{ background: "#1a1a1a", color: done ? "#7fdc39" : "#ffff55" }}
        >
          <Icon name={done ? "Check" : q.icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="pixel-font truncate text-lg leading-tight"
            style={{ color: done ? "#7fdc39" : "#fff" }}
          >
            {q.label}
          </div>
          {!done && (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm" style={{ background: "#141414" }}>
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(180deg,#a0e81f,#7fdc39 45%,#3f8f1f)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          )}
        </div>
        <div className="pixel-font shrink-0 text-right leading-tight">
          <div className="text-lg text-white/80">
            {value}/{q.target}
          </div>
          <div className="text-sm" style={{ color: done ? "#7fdc39" : "#888" }}>
            +{q.rewardXp} XP
          </div>
        </div>
      </div>
    );
  }

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
