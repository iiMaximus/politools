import { useEffect, useMemo, useState } from "react";
import { Page, TopBar } from "../components/Layout";
import { useCloud } from "../components/CloudProvider";
import { Icon } from "../components/Icon";
import { cn } from "../lib/cn";
import { currentWeekStartKey, type StudyProfile } from "../lib/cloud-sync";
import { rankFromXp } from "../lib/game";

type BoardView = "week" | "lifetime";

export function LeaderboardPage() {
  const {
    configured,
    profile,
    profiles,
    status,
    error,
    lastSyncedAt,
    pendingChanges,
    online,
    deviceLabel,
    refreshProfiles,
    syncNow,
    clearError,
    setPickerOpen,
  } = useCloud();
  const [view, setView] = useState<BoardView>("week");

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  const rows = useMemo(() => rankProfiles(profiles, view), [profiles, view]);
  const weeklyXp = profiles.reduce((sum, item) => sum + item.weekly_xp, 0);
  const activeCrew = profiles.filter(
    (item) => item.weekly_activity > 0 || item.weekly_xp > 0
  ).length;
  const weeklyMastery = profiles.reduce((sum, item) => sum + item.weekly_mastery, 0);

  return (
    <>
      <TopBar crumbs={[{ label: "Leaderboard" }]} />
      <Page className="max-w-4xl pt-5 sm:pt-8">
        <section className="mc-panel arcade-dark relative overflow-hidden p-5 text-white sm:p-7">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 85% 15%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 38%)",
            }}
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="pixel-font text-base uppercase leading-none tracking-[0.2em] text-[var(--accent)]">
                Study crew · {weekLabel()}
              </div>
              <h1 className="pixel-font mt-2 text-4xl uppercase leading-none tracking-wide sm:text-5xl">
                Leaderboard
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                The current week comes first, so a new Monday is a clean race. Everyone stays
                visible, ties share a place, and lifetime progress never disappears.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="arcade-button arcade-focus-ring px-4"
            >
              <Icon name={profile ? "Settings2" : "Users"} size={16} />
              {profile ? "My profile" : "Choose profile"}
            </button>
          </div>

          <div className="mc-slot relative mt-5 inline-flex p-1">
            <ViewButton active={view === "week"} onClick={() => setView("week")}>
              This week
            </ViewButton>
            <ViewButton active={view === "lifetime"} onClick={() => setView("lifetime")}>
              Lifetime
            </ViewButton>
          </div>
        </section>

        {!configured ? (
          <Notice
            icon="ShieldAlert"
            title="Cloud connection pending"
            text="The leaderboard will appear after the Supabase publishable key is added."
          />
        ) : status === "loading" && profiles.length === 0 ? (
          <Notice icon="RotateCcw" title="Loading the crew…" text="Fetching the latest scores." />
        ) : error && profiles.length === 0 ? (
          <Notice icon="AlertTriangle" title="Leaderboard unavailable" text={error} />
        ) : profiles.length === 0 ? (
          <Notice
            icon="Users"
            title="No players yet"
            text="Create the first profile. Your current local progress becomes its starting score."
          />
        ) : (
          <>
            {error && (
              <section className="mc-panel arcade-dark mt-5 flex flex-wrap items-center gap-3 !border-[var(--bad)] bg-[var(--bad-bg)] px-4 py-3 text-sm text-[var(--bad)]">
                <Icon name="AlertTriangle" size={17} />
                <span className="min-w-0 flex-1">{error}</span>
                {profile && online && (
                  <button type="button" className="arcade-focus-ring pixel-font text-lg uppercase leading-none" onClick={() => void syncNow(true)}>
                    ▶ Retry sync
                  </button>
                )}
                <button type="button" className="arcade-focus-ring pixel-font text-lg uppercase leading-none" onClick={clearError}>
                  Dismiss ×
                </button>
              </section>
            )}

            <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Weekly crew summary">
              <CrewStat label="Crew XP" value={weeklyXp.toLocaleString()} icon="Zap" />
              <CrewStat label="Active" value={`${activeCrew}/${profiles.length}`} icon="Users" />
              <CrewStat label="Mastery +" value={weeklyMastery.toLocaleString()} icon="Sparkles" />
            </section>

            <section className="mc-panel arcade-dark relative mt-5 overflow-hidden text-white">
              <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.02]" />
              <div
                className={cn(
                  "pixel-font relative hidden gap-3 border-b-2 border-black bg-[#181818] px-4 py-3 text-base uppercase leading-none tracking-[0.1em] text-white/45 sm:grid",
                  view === "week"
                    ? "grid-cols-[3.5rem_minmax(0,1fr)_6rem_6rem_6rem_7rem]"
                    : "grid-cols-[3.5rem_minmax(0,1fr)_7rem_7rem_7rem_6rem]"
                )}
              >
                <span>Rank</span>
                <span>Player</span>
                {view === "week" ? (
                  <>
                    <span className="text-right">Week XP</span>
                    <span className="text-right">Activity</span>
                    <span className="text-right">Mastery +</span>
                    <span className="text-right">Lifetime</span>
                  </>
                ) : (
                  <>
                    <span className="text-right">XP</span>
                    <span className="text-right">Answers</span>
                    <span className="text-right">Mastered</span>
                    <span className="text-right">Streak</span>
                  </>
                )}
              </div>
              <div className="relative divide-y-2 divide-black/65">
                {rows.map(({ item, place }) => (
                  <PlayerRow
                    key={item.id}
                    item={item}
                    place={place}
                    active={item.id === profile?.id}
                    view={view}
                  />
                ))}
              </div>
            </section>

            {view === "week" && weeklyXp === 0 && (
              <div className="mc-slot pixel-font mt-3 px-3 py-2 text-center text-base uppercase leading-none text-white/45">
                Insert study session to start the weekly race
              </div>
            )}
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-faint)]">
          <span>
            {profile
              ? `${deviceLabel} · ${syncSummary(status, pendingChanges, lastSyncedAt)}`
              : "Scores refresh automatically. Choose a profile to join in."}
          </span>
          <button
            type="button"
            onClick={() => void refreshProfiles()}
            className="mc-slot arcade-focus-ring pixel-font inline-flex items-center gap-1.5 px-2.5 py-1.5 text-base uppercase leading-none text-[var(--accent)] transition hover:brightness-125"
          >
            <Icon name="RotateCcw" size={13} /> Refresh standings
          </button>
        </div>
      </Page>
    </>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "arcade-focus-ring pixel-font min-w-28 rounded-sm border-2 px-4 py-2 text-base uppercase leading-none transition",
        active
          ? "border-black bg-[var(--accent)] text-black shadow-[inset_1px_1px_0_rgba(255,255,255,.35),0_2px_0_#000]"
          : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function CrewStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <article className="mc-panel arcade-dark flex min-w-0 flex-col items-center p-2.5 text-center text-white sm:p-4">
      <span className="mc-slot grid h-8 w-8 place-items-center text-[var(--accent)] sm:h-9 sm:w-9">
        <Icon name={icon} size={16} />
      </span>
      <div className="pixel-font mt-1.5 max-w-full truncate text-2xl leading-none sm:text-3xl">{value}</div>
      <div className="pixel-font mt-0.5 max-w-full truncate text-sm uppercase leading-none text-white/40 sm:text-base">
        {label}
      </div>
    </article>
  );
}

function PlayerRow({
  item,
  place,
  active,
  view,
}: {
  item: StudyProfile;
  place: number | null;
  active: boolean;
  view: BoardView;
}) {
  const accountRank = rankFromXp(item.total_xp);
  return (
    <article
      className={cn(
        "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_6rem_6rem_6rem_7rem] sm:px-4",
        view === "lifetime" && "sm:grid-cols-[3.5rem_minmax(0,1fr)_7rem_7rem_7rem_6rem]",
        active && "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] shadow-[inset_4px_0_0_var(--accent)]"
      )}
    >
      <span
        className="mc-slot pixel-font grid h-9 w-9 place-items-center text-xl leading-none"
        style={{ color: placeColor(place), textShadow: "1px 1px 0 #000" }}
      >
        {place ? `#${place}` : "—"}
      </span>
      <span className="flex min-w-0 items-center gap-3">
        <span className="mc-slot grid h-10 w-10 shrink-0 place-items-center text-xl">
          {item.avatar}
        </span>
        <span className="min-w-0">
          <span className="pixel-font block truncate text-xl uppercase leading-none">
            {place === 1 && <span className="mr-1 text-sm">👑</span>}
            {item.display_name}
            {active && <span className="ml-1.5 text-[10px] text-[var(--accent)]">YOU</span>}
          </span>
          <span className="block truncate text-xs text-white/45">
            Lv {accountRank.level} · {accountRank.rank}
            {view === "week" && ` · ${item.total_xp.toLocaleString()} lifetime XP`}
            {view === "lifetime" && ` · ${item.weekly_xp.toLocaleString()} XP this week`}
          </span>
          <span className="mt-1 flex gap-2 text-[10px] font-bold text-white/45 sm:hidden">
            {view === "week" ? (
              <>
                <span>{item.weekly_activity} actions</span>
                <span>+{item.weekly_mastery} mastered</span>
              </>
            ) : (
              <>
                <span>{item.answers.toLocaleString()} answers</span>
                <span>{item.mastered_cards.toLocaleString()} mastered</span>
              </>
            )}
          </span>
        </span>
      </span>
      <span className="pixel-font text-right text-2xl leading-none text-[var(--accent)] sm:text-white">
        {(view === "week" ? item.weekly_xp : item.total_xp).toLocaleString()}
        <span className="ml-1 text-[10px] font-sans text-white/35 sm:hidden">XP</span>
      </span>
      {view === "week" ? (
        <>
          <span className="hidden text-right text-sm font-bold sm:block">{item.weekly_activity}</span>
          <span className="hidden text-right text-sm font-bold sm:block">+{item.weekly_mastery}</span>
          <span className="hidden text-right font-mono text-sm font-bold text-white/55 sm:block">
            {item.total_xp.toLocaleString()}
          </span>
        </>
      ) : (
        <>
          <span className="hidden text-right text-sm font-bold sm:block">{item.answers.toLocaleString()}</span>
          <span className="hidden text-right text-sm font-bold sm:block">
            {item.mastered_cards.toLocaleString()}
          </span>
          <span className="hidden text-right text-sm font-bold sm:block">🔥 {item.current_streak}</span>
        </>
      )}
    </article>
  );
}

function rankProfiles(profiles: StudyProfile[], view: BoardView) {
  const sorted = [...profiles].sort((left, right) => {
    if (view === "week") {
      return (
        right.weekly_xp - left.weekly_xp ||
        right.weekly_activity - left.weekly_activity ||
        right.weekly_mastery - left.weekly_mastery ||
        right.total_xp - left.total_xp
      );
    }
    return (
      right.total_xp - left.total_xp ||
      right.mastered_cards - left.mastered_cards ||
      right.answers - left.answers
    );
  });
  let previousScore: number | null = null;
  let previousPlace = 0;
  return sorted.map((item, index) => {
    const score = view === "week" ? item.weekly_xp : item.total_xp;
    const place = score <= 0 ? null : score === previousScore ? previousPlace : index + 1;
    if (place !== null) {
      previousScore = score;
      previousPlace = place;
    }
    return { item, place };
  });
}

function placeColor(place: number | null) {
  if (place === 1) return "#ffff55";
  if (place === 2) return "#d8e0ef";
  if (place === 3) return "#e0a06b";
  return "rgba(255,255,255,.45)";
}

function weekLabel() {
  const start = new Date(currentWeekStartKey() + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const format = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${format.format(start)}–${format.format(end)}`;
}

function syncSummary(status: string, pending: boolean, lastSyncedAt: number | null) {
  if (status === "offline") return pending ? "offline, changes queued" : "offline";
  if (status === "error") return "sync needs attention";
  if (status === "syncing") return "syncing now";
  if (status === "pending" || pending) return "changes waiting to sync";
  if (!lastSyncedAt) return "not synced yet";
  return `last synced ${new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(lastSyncedAt)}`;
}

function Notice({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <section className="mc-panel arcade-dark relative mt-5 grid place-items-center overflow-hidden px-5 py-12 text-center text-white">
      <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.025]" />
      <span className="mc-slot relative grid h-14 w-14 place-items-center text-[var(--accent)]">
        <Icon name={icon} size={26} />
      </span>
      <h2 className="pixel-font relative mt-4 text-2xl uppercase leading-none">{title}</h2>
      <p className="relative mt-2 max-w-md text-sm text-white/55">{text}</p>
    </section>
  );
}
