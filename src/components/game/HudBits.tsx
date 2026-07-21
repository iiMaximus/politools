import { Icon } from "../Icon";
import { rankFromXp, type StreakInfo } from "../../lib/game";

/* ================================================================== *
 *  HUD BITS — small stat chips for the hub header: streak flame,
 *  account rank, beer counter.
 * ================================================================== */

export function StreakBadge({ streak }: { streak: StreakInfo }) {
  const lit = streak.current > 0 && !streak.atRisk;
  return (
    <div className="mc-panel arcade-dark flex items-center gap-3 px-4 py-3 text-white" title={`Best streak: ${streak.best} days`}>
      <span
        className="mc-slot grid h-10 w-10 place-items-center"
        style={{
          background: lit ? "linear-gradient(180deg,#ff9f43,#ff5e57)" : "var(--color-bg)",
          color: lit ? "#fff" : "var(--color-faint)",
        }}
      >
        <Icon name="Flame" size={22} />
      </span>
      <div className="leading-tight">
        <div className="pixel-font text-3xl leading-none">
          {streak.current}
          <span className="ml-1 text-base text-white/45">day{streak.current === 1 ? "" : "s"}</span>
        </div>
        <div className="pixel-font text-base uppercase leading-none text-white/45">
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
    <div className="mc-panel arcade-dark flex items-center gap-3 px-4 py-3 text-white" title={`${r.into}/${r.needed} XP to next level`}>
      <span
        className="mc-slot grid h-10 w-10 place-items-center text-white"
        style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
      >
        <Icon name="GraduationCap" size={22} />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="pixel-font truncate text-xl leading-none">
          Lv {r.level} · {r.rank}
        </div>
        <div className="mt-1.5 h-2 w-24 overflow-hidden rounded-sm border border-black bg-[#111]">
          <div
            className="h-full"
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
      className="mc-panel arcade-dark flex items-center gap-3 px-4 py-3 text-white"
      title="One beer earned per boss defeated. Redeem responsibly."
    >
      <span className="mc-slot grid h-10 w-10 place-items-center bg-[#f5b942] text-[#4a2c00]">
        <Icon name="Beer" size={22} />
      </span>
      <div className="leading-tight">
        <div className="pixel-font text-3xl leading-none">{beers}</div>
        <div className="pixel-font text-base uppercase leading-none text-white/45">
          beer{beers === 1 ? "" : "s"} earned
        </div>
      </div>
    </div>
  );
}
