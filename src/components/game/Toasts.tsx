import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../Icon";
import { onGameEvent, type GameEvent } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { fireConfetti } from "../../lib/confetti";

/* ================================================================== *
 *  GAME TOASTS — global overlay that announces achievements, quest
 *  completions, freeze-token events and beers. Mounted once in App.
 * ================================================================== */

interface Toast {
  id: number;
  icon: string;
  title: string;
  sub?: string;
  tone: "accent" | "good" | "info" | "beer" | "mc";
}

let nextId = 1;

function toToast(e: GameEvent): Toast | null {
  switch (e.type) {
    case "achievement":
      // rendered as a Minecraft advancement popup (MinecraftToast)
      return { id: nextId++, icon: e.icon, title: "Achievement Get!", sub: e.title, tone: "mc" };
    case "quest":
      return { id: nextId++, icon: "ScrollText", title: "Quest complete", sub: `${e.label} · +${e.rewardXp} XP`, tone: "good" };
    case "rank-up":
      return { id: nextId++, icon: "GraduationCap", title: `Rank up: ${e.rank}`, sub: `Level ${e.level}`, tone: "accent" };
    case "freeze-used":
      return { id: nextId++, icon: "Snowflake", title: "Streak freeze used", sub: "Your flame survived yesterday", tone: "info" };
    case "freeze-earned":
      return { id: nextId++, icon: "Snowflake", title: "Freeze token earned", sub: "7-day streak bonus", tone: "info" };
    case "purchase":
      return { id: nextId++, icon: e.icon, title: "Purchased!", sub: `${e.title} · salute 🍻`, tone: "beer" };
    case "beer":
      return { id: nextId++, icon: "Beer", title: "🍺 Beer earned!", sub: "Boss defeated — redeem responsibly", tone: "beer" };
    default:
      return null;
  }
}

/** The classic Minecraft advancement popup: dark beveled panel, item-slot
 *  icon frame, yellow "Achievement Get!" over the white achievement name.
 *  Deliberately theme-independent — it looks like the game, not the app. */
function MinecraftToast({ icon, name }: { icon: string; name: string }) {
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5"
      style={{
        background: "#212121",
        border: "2px solid #000",
        borderRadius: 6,
        boxShadow: "inset 2px 2px 0 #555, inset -2px -2px 0 #2b2b2b, 0 8px 22px rgba(0,0,0,0.55)",
        fontFamily: '"VT323", "JetBrains Mono", monospace',
      }}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center"
        style={{
          background: "#3a3a3a",
          border: "2px solid #1a1a1a",
          boxShadow: "inset 2px 2px 0 #4f4f4f, inset -2px -2px 0 #262626",
          color: "#ffff55",
        }}
      >
        <Icon name={icon} size={24} />
      </span>
      <div className="min-w-0">
        <div style={{ color: "#ffff55", fontSize: 21, lineHeight: 1 }}>Achievement Get!</div>
        <div className="truncate" style={{ color: "#fff", fontSize: 19, lineHeight: 1.2 }}>
          {name}
        </div>
      </div>
    </div>
  );
}

export function GameToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      onGameEvent((e) => {
        const t = toToast(e);
        if (!t) return;
        if (e.type === "achievement") {
          sfx.achievement();
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            fireConfetti({ count: 90, originY: 0.25 });
          }
        }
        setToasts((prev) => [...prev.slice(-3), t]);
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== t.id));
        }, 4200);
      }),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[95] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) =>
          t.tone === "mc" ? (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="pointer-events-auto w-full max-w-sm"
            >
              <MinecraftToast icon={t.icon} name={t.sub ?? ""} />
            </motion.div>
          ) : (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              className="surface pointer-events-auto flex w-full max-w-sm items-center gap-3 px-4 py-3 shadow-lg"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
                style={{
                  background:
                    t.tone === "good"
                      ? "var(--good)"
                      : t.tone === "info"
                      ? "var(--info)"
                      : t.tone === "beer"
                      ? "#f5b942"
                      : "linear-gradient(180deg,var(--accent),var(--accent-2))",
                  color: t.tone === "beer" ? "#4a2c00" : undefined,
                }}
              >
                <Icon name={t.icon} size={20} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold">{t.title}</div>
                {t.sub && <div className="truncate text-xs text-[var(--color-muted)]">{t.sub}</div>}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
