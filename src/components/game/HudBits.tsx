import { Icon } from "../Icon";
import { rankFromXp, type StreakInfo } from "../../lib/game";

/* ================================================================== *
 *  HUD BITS — small stat chips for the hub header: streak flame,
 *  account rank, beer counter.
 * ================================================================== */

export function StreakBadge({ streak }: { streak: StreakInfo }) {
  const lit = streak.current > 0 && !streak.atRisk;
  return (
    <div className="surface flex items-center gap-3 px-4 py-3" title={`Best streak: ${streak.best} days`}>
      <span
        className="grid h-10 w-10 place-items-center rounded-xl"
        style={{
          background: lit ? "linear-gradient(180deg,#ff9f43,#ff5e57)" : "var(--color-bg)",
          color: lit ? "#fff" : "var(--color-faint)",
        }}
      >
        <Icon name="Flame" size={22} />
      </span>
      <div className="leading-tight">
        <div className="text-xl font-extrabold">
          {streak.current}
          <span className="ml-1 text-xs font-semibold text-[var(--color-faint)]">day{streak.current === 1 ? "" : "s"}</span>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
          {streak.atRisk ? "study today to keep it!" : "streak"}
          {streak.freezeTokens > 0 && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[var(--info)]">
              <Icon name="Snowflake" size={10} />
              ×{streak.freezeTokens}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function RankBadge({ totalXp }: { totalXp: number }) {
  const r = rankFromXp(totalXp);
  return (
    <div className="surface flex items-center gap-3 px-4 py-3" title={`${r.into}/${r.needed} XP to next level`}>
      <span
        className="grid h-10 w-10 place-items-center rounded-xl text-white"
        style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
      >
        <Icon name="GraduationCap" size={22} />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-extrabold">
          Lv {r.level} · {r.rank}
        </div>
        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-bg)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${r.pct}%`,
              background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function BeerCounter({ beers }: { beers: number }) {
  return (
    <div
      className="surface flex items-center gap-3 px-4 py-3"
      title="One beer earned per boss defeated. Redeem responsibly."
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5b942] text-[#4a2c00]">
        <Icon name="Beer" size={22} />
      </span>
      <div className="leading-tight">
        <div className="text-xl font-extrabold">{beers}</div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
          beer{beers === 1 ? "" : "s"} earned
        </div>
      </div>
    </div>
  );
}
