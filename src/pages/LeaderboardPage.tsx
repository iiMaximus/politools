import { useEffect } from "react";
import { Page, TopBar } from "../components/Layout";
import { useCloud } from "../components/CloudProvider";
import { Icon } from "../components/Icon";
import { cn } from "../lib/cn";
import { rankFromXp } from "../lib/game";
import type { StudyProfile } from "../lib/cloud-sync";

export function LeaderboardPage() {
  const {
    configured,
    profile,
    profiles,
    status,
    error,
    refreshProfiles,
    setPickerOpen,
  } = useCloud();

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

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
                Study crew
              </div>
              <h1 className="pixel-font mt-2 text-4xl uppercase leading-none tracking-wide sm:text-5xl">
                Leaderboard
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                Friendly pressure only. XP comes from real answers, completed lessons, mocks, and
                boss fights synced from each profile.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="arcade-button px-4"
            >
              <Icon name={profile ? "UserRoundCog" : "Users"} size={16} />
              {profile ? "My profile" : "Choose profile"}
            </button>
          </div>
        </section>

        {!configured ? (
          <Notice
            icon="CloudOff"
            title="Cloud connection pending"
            text="The leaderboard will appear after the Supabase publishable key is added."
          />
        ) : status === "loading" && profiles.length === 0 ? (
          <Notice icon="LoaderCircle" title="Loading the crew…" text="Fetching the latest scores." />
        ) : error && profiles.length === 0 ? (
          <Notice icon="TriangleAlert" title="Leaderboard unavailable" text={error} />
        ) : profiles.length === 0 ? (
          <Notice
            icon="Users"
            title="No players yet"
            text="Create the first profile. Your current local progress becomes its starting score."
          />
        ) : (
          <>
            <section className="mt-5 grid gap-3 sm:grid-cols-3">
              {profiles.slice(0, 3).map((item, index) => (
                <PodiumCard
                  key={item.id}
                  item={item}
                  place={index + 1}
                  active={item.id === profile?.id}
                />
              ))}
            </section>

            <section className="mc-panel arcade-dark mt-5 overflow-hidden text-white">
              <div className="pixel-font hidden grid-cols-[3.5rem_minmax(0,1fr)_7rem_7rem_7rem] gap-3 border-b-2 border-black px-4 py-3 text-base uppercase leading-none tracking-[0.1em] text-white/45 sm:grid">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">XP</span>
                <span className="text-right">Streak</span>
                <span className="text-right">Mastered</span>
              </div>
              <div className="divide-y-2 divide-black/65">
                {profiles.map((item, index) => (
                  <PlayerRow
                    key={item.id}
                    item={item}
                    place={index + 1}
                    active={item.id === profile?.id}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--color-faint)]">
          <span>
            {status === "syncing" ? "Saving your latest progress…" : "Scores refresh automatically."}
          </span>
          <button
            type="button"
            onClick={() => void refreshProfiles()}
            className="inline-flex items-center gap-1.5 font-bold text-[var(--accent)]"
          >
            <Icon name="RefreshCw" size={13} /> Refresh
          </button>
        </div>
      </Page>
    </>
  );
}

function PodiumCard({
  item,
  place,
  active,
}: {
  item: StudyProfile;
  place: number;
  active: boolean;
}) {
  const colors = ["#ffd45e", "#b7c3d7", "#d89863"];
  const rank = rankFromXp(item.total_xp);
  return (
    <article
      className={cn(
        "mc-panel arcade-dark relative overflow-hidden p-4 text-white",
        active && "outline outline-2 outline-offset-2 outline-[var(--accent)]",
        place === 1 && "sm:-translate-y-2"
      )}
    >
      <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.03]" />
      <div className="flex items-start justify-between">
        <span className="mc-slot relative grid h-11 w-11 place-items-center text-2xl">
          {item.avatar}
        </span>
        <span
          className="pixel-font text-3xl leading-none"
          style={{ color: colors[place - 1] }}
          aria-label={"Place " + place}
        >
          #{place}
        </span>
      </div>
      <h2 className="pixel-font relative mt-3 truncate text-2xl leading-none">
        {item.display_name}
        {active && <span className="ml-1.5 text-xs text-[var(--accent)]">YOU</span>}
      </h2>
      <div className="relative text-xs text-white/45">
        Lv {rank.level} · {rank.rank}
      </div>
      <div className="pixel-font relative mt-3 text-3xl leading-none text-[#ffd45e]">{item.total_xp.toLocaleString()} XP</div>
      <div className="relative mt-1 text-xs font-bold text-white/55">
        🔥 {item.current_streak} day streak
      </div>
    </article>
  );
}

function PlayerRow({
  item,
  place,
  active,
}: {
  item: StudyProfile;
  place: number;
  active: boolean;
}) {
  const rank = rankFromXp(item.total_xp);
  return (
    <article
      className={cn(
        "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_7rem_7rem_7rem]",
        active && "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]"
      )}
    >
      <span className="pixel-font text-xl text-white/45">#{place}</span>
      <span className="flex min-w-0 items-center gap-3">
        <span className="mc-slot grid h-10 w-10 shrink-0 place-items-center text-xl">
          {item.avatar}
        </span>
        <span className="min-w-0">
          <span className="pixel-font block truncate text-xl leading-none">
            {item.display_name}
            {active && <span className="ml-1.5 text-[10px] text-[var(--accent)]">YOU</span>}
          </span>
          <span className="block truncate text-xs text-white/45">
            Lv {rank.level} · {rank.rank} · {item.answers.toLocaleString()} answers
          </span>
        </span>
      </span>
      <span className="text-right font-mono font-black">{item.total_xp.toLocaleString()}</span>
      <span className="hidden text-right text-sm font-bold sm:block">🔥 {item.current_streak}</span>
      <span className="hidden text-right text-sm font-bold sm:block">
        {item.mastered_cards.toLocaleString()}
      </span>
    </article>
  );
}

function Notice({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <section className="mc-panel arcade-dark mt-5 grid place-items-center px-5 py-12 text-center text-white">
      <span className="mc-slot grid h-14 w-14 place-items-center text-[var(--accent)]">
        <Icon name={icon} size={26} />
      </span>
      <h2 className="pixel-font mt-4 text-2xl uppercase leading-none">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-white/55">{text}</p>
    </section>
  );
}
