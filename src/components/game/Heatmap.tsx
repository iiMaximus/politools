import { useMemo } from "react";
import { dayKey, dayQualifies, type GameState } from "../../lib/game";

/* ================================================================== *
 *  ACTIVITY HEATMAP — GitHub-style year strip built from the game
 *  activity log. Pure SVG, sized by weeks so it scales on mobile.
 * ================================================================== */

const WEEKS = 24;
const CELL = 11;
const GAP = 3;

function intensity(answers: number, qualifies: boolean): number {
  if (answers <= 0) return 0;
  if (!qualifies) return 1;
  if (answers < 15) return 2;
  if (answers < 40) return 3;
  return 4;
}

// theme-adaptive intensity ramp: accent mixed into the page background
const LEVELS = [
  "var(--color-bg)",
  "color-mix(in oklab, var(--accent) 22%, var(--color-bg))",
  "color-mix(in oklab, var(--accent) 45%, var(--color-bg))",
  "color-mix(in oklab, var(--accent) 70%, var(--color-bg))",
  "var(--accent)",
];

export function Heatmap({ state }: { state: GameState }) {
  const { cells, monthLabels } = useMemo(() => {
    const today = new Date();
    // grid ends on today's column; rows are Mon..Sun
    const dow = (today.getDay() + 6) % 7; // 0 = Monday
    const cells: { key: string; week: number; row: number; level: number }[] = [];
    const monthLabels: { week: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      for (let r = 0; r < 7; r++) {
        const daysAgo = (WEEKS - 1 - w) * 7 + (dow - r);
        if (daysAgo < 0) continue;
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
        const key = dayKey(d);
        if (r === 0 && d.getMonth() !== lastMonth) {
          lastMonth = d.getMonth();
          monthLabels.push({ week: w, label: d.toLocaleString("en", { month: "short" }) });
        }
        cells.push({ key, week: w, row: r, level: -1 });
      }
    }
    return { cells, monthLabels };
  }, []);

  const width = WEEKS * (CELL + GAP);
  const height = 7 * (CELL + GAP) + 14;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxWidth: width * 1.2 }}
      role="img"
      aria-label="Study activity heatmap"
    >
      {monthLabels.map((m) => (
        <text
          key={`${m.week}-${m.label}`}
          x={m.week * (CELL + GAP)}
          y={9}
          fontSize={8}
          fill="var(--color-faint)"
        >
          {m.label}
        </text>
      ))}
      {cells.map((c) => {
        const a = state.activity[c.key];
        const frozen = state.frozenDays.includes(c.key);
        const level = intensity(a?.answers ?? 0, dayQualifies(a));
        return (
          <rect
            key={c.key}
            x={c.week * (CELL + GAP)}
            y={14 + c.row * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={2.5}
            fill={frozen ? "var(--info-bg)" : LEVELS[level]}
            stroke={frozen ? "var(--info)" : c.key === dayKey() ? "var(--accent)" : "var(--color-line)"}
            strokeWidth={c.key === dayKey() || frozen ? 1.2 : 0.5}
          >
            <title>
              {c.key}
              {frozen ? " · streak freeze" : ` · ${a?.answers ?? 0} answers`}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}
