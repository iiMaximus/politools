import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAllCourses } from "../courses/registry";
import { COURSE_GROUPS, getCourseGroupCourses, type CourseGroup } from "../courses/groups";
import { TopBar, Page } from "../components/Layout";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Kicker, Meter } from "../components/ui";
import { Heatmap } from "../components/game/Heatmap";
import { QuestBoard } from "../components/game/QuestBoard";
import { ReadinessDial } from "../components/game/ReadinessDial";
import { GameSettingsModal } from "../components/game/GameSettings";
import { useCourseProgress, readProgress } from "../lib/progress";
import { aggregate, summarize, summarizeFromStorage, type CourseSummary } from "../lib/summary";
import { dueCount } from "../lib/adaptive";
import {
  ACHIEVEMENTS,
  SHOP,
  availableBeers,
  bestBossGrade,
  buyShopItem,
  ensureQuests,
  rankFromXp,
  readiness,
  reconcileFreezes,
  rustyCount,
  streakInfo,
  syncRank,
  useGame,
  type GameState,
  type QuestInstance,
} from "../lib/game";
import { bossFor } from "../lib/bosses";
import type { Course } from "../types";

const PLANNED = [
  { title: "Fluid Mechanics", icon: "Droplets", year: "Y3", accent: "#36c5d6" },
  { title: "Industrial Plants", icon: "Factory", year: "Y3", accent: "#c98bff" },
  { title: "Manufacturing Processes", icon: "Cog", year: "Y3", accent: "#ff9f6b" },
  { title: "Safety Engineering", icon: "HardHat", year: "Y3", accent: "#e0a91f" },
];

const LEGACY = [
  { title: "TMM — Metallic Materials", href: "../index.html", note: "Classic flashcard site (already built)" },
];

type HubEntry =
  | { kind: "course"; course: Course }
  | { kind: "group"; group: CourseGroup; courses: Course[] };

export function HubPage() {
  const game = useGame();
  const [showSettings, setShowSettings] = useState(false);
  // course chunks stream in progressively; the hub renders as they arrive
  const { courses } = useAllCourses();

  useEffect(() => {
    reconcileFreezes();
  }, []);

  const focusCourses = game.settings.focusCourses
    .map((id) => courses.find((c) => c.meta.id === id))
    .filter((c): c is Course => !!c && !game.settings.passedCourses.includes(c.meta.id));
  // all non-passed focus chunks loaded → safe to generate quests/dues
  const focusReady =
    focusCourses.length ===
    game.settings.focusCourses.filter((id) => !game.settings.passedCourses.includes(id)).length;

  const passedCourses = courses.filter((c) => game.settings.passedCourses.includes(c.meta.id));

  const otherEntries = buildHubEntries(
    courses.filter(
      (c) =>
        !game.settings.focusCourses.includes(c.meta.id) &&
        !game.settings.passedCourses.includes(c.meta.id)
    )
  );

  // quests need live due/rust numbers for the focus courses
  const [quests, setQuests] = useState<QuestInstance[]>(game.quests.items);
  useEffect(() => {
    if (!focusReady) return; // don't generate quests from a partial course list
    const ctx = {
      courses: focusCourses.map((c) => {
        const p = readProgress(c.meta.id);
        return {
          id: c.meta.id,
          title: c.meta.short,
          due: dueCount(c.practice, p),
          rusty: rustyCount(c.practice, p),
          hasLessonsLeft: c.lessons.some((l) => !p.lessons[l.id]?.completed),
        };
      }),
    };
    setQuests(ensureQuests(ctx));
    // regenerate when the day's quest set is stale; game changes re-run via useGame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.quests.date, game.settings.focusCourses.join(","), focusReady]);

  const liveQuests = game.quests.items.length ? game.quests.items : quests;

  const totalDue = useMemo(
    () =>
      focusCourses.reduce((sum, c) => sum + dueCount(c.practice, readProgress(c.meta.id)), 0),
    // recompute on any game tick (answers mutate game state too) or as chunks load
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, game.settings.focusCourses.join(","), courses.length]
  );

  const allSummaries = courses.map((c) => summarizeFromStorage(c));
  const overall = aggregate(allSummaries);
  const totalXp = overall.xp + game.bonusXp;

  // record peak XP + fire the rank-up toast when a level boundary is crossed
  useEffect(() => {
    syncRank(totalXp);
  }, [totalXp]);

  return (
    <>
      <TopBar>
        <button
          onClick={() => setShowSettings(true)}
          className="btn btn-ghost !py-2 !text-sm"
          title="Season setup: exam dates, focus courses"
        >
          <Icon name="Settings2" size={16} />
        </button>
      </TopBar>
      <Page className="pt-6">
        {/* ============ player HUD ============ */}
        <PlayerHud totalXp={totalXp} game={game} />

        <section className="mt-4 grid gap-4 lg:grid-cols-5">
          {/* Daily Mix CTA + heatmap */}
          <div className="surface flex flex-col p-5 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Kicker>Today</Kicker>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight">
                  {totalDue > 0 ? (
                    <>
                      <span style={{ color: "var(--warn)" }}>{totalDue}</span> reviews waiting
                    </>
                  ) : (
                    "All clear — build something new"
                  )}
                </h2>
              </div>
              <Link
                to="/mix"
                className="btn btn-primary !px-5"
                title="~20 cards interleaved across your focus courses"
              >
                <Icon name="Shuffle" size={18} />
                {totalDue > 0 ? `Clear ${Math.min(totalDue, 20)} now` : "Daily Mix"}
              </Link>
            </div>
            <div className="mt-4 flex-1">
              <Heatmap state={game} />
            </div>
          </div>

          {/* quest board */}
          <div className="surface p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <Kicker>Daily quests</Kicker>
              <span className="text-xs text-[var(--color-faint)]">
                {liveQuests.filter((q) => q.completedAt).length}/{liveQuests.length} done
              </span>
            </div>
            <QuestBoard quests={liveQuests} state={game} />
          </div>
        </section>

        {/* ============ this season ============ */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <Kicker>This season</Kicker>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Your battles</h2>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Edit season
            </button>
          </div>
          {focusCourses.length === 0 ? (
            <div className="surface p-6 text-center text-sm text-[var(--color-muted)]">
              No focus courses — open{" "}
              <button className="font-semibold text-[var(--accent)]" onClick={() => setShowSettings(true)}>
                season setup
              </button>{" "}
              and pick what you're fighting this session.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {focusCourses.map((c) => (
                <FocusCard key={c.meta.id} course={c} />
              ))}
            </div>
          )}
        </section>

        {/* ============ other courses ============ */}
        {otherEntries.length > 0 && (
          <section className="mt-12">
            <Kicker>World map</Kicker>
            <h2 className="mt-1 mb-5 text-2xl font-bold tracking-tight">Other lands</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherEntries.map((entry) =>
                entry.kind === "course" ? (
                  <CourseCard key={entry.course.meta.id} course={entry.course} />
                ) : (
                  <GroupCard key={entry.group.id} group={entry.group} courses={entry.courses} />
                )
              )}
            </div>
          </section>
        )}

        {/* ============ trophy shelf ============ */}
        {passedCourses.length > 0 && (
          <section className="mt-12">
            <Kicker>Trophy shelf</Kicker>
            <h2 className="mt-1 mb-5 text-2xl font-bold tracking-tight">Conquered</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {passedCourses.map((c) => (
                <CourseTheme key={c.meta.id} accent={c.meta.accent} accent2={c.meta.accent2}>
                  <Link to={`/c/${c.meta.id}`} className="card-hover surface flex items-center gap-3 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5b942] text-[#4a2c00]">
                      <Icon name="Trophy" size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c.meta.title}</div>
                      <div className="text-xs text-[var(--color-faint)]">Passed · in the bag 🎉</div>
                    </div>
                  </Link>
                </CourseTheme>
              ))}
            </div>
          </section>
        )}

        {/* ============ achievements ============ */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <Kicker>Achievements</Kicker>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Hall of fame</h2>
            </div>
            <span className="text-sm text-[var(--color-faint)]">
              {Object.keys(game.achievements).length}/{ACHIEVEMENTS.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = !!game.achievements[a.id];
              return (
                <div
                  key={a.id}
                  className="surface flex flex-col items-center p-3.5 text-center"
                  style={unlocked ? { borderColor: "var(--accent-line)" } : { opacity: 0.55 }}
                  title={a.desc}
                >
                  <span
                    className="mb-2 grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                      background: unlocked
                        ? "linear-gradient(180deg,var(--accent),var(--accent-2))"
                        : "var(--color-bg)",
                      color: unlocked ? "#fff" : "var(--color-faint)",
                    }}
                  >
                    <Icon name={unlocked ? a.icon : "Lock"} size={18} />
                  </span>
                  <div className="text-xs font-bold leading-tight">{a.title}</div>
                  <div className="mt-1 text-[10px] leading-snug text-[var(--color-faint)]">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ beer shop ============ */}
        <BeerShop game={game} />

        {/* ============ roadmap & legacy ============ */}
        <section className="mt-12">
          <Kicker>On the roadmap</Kicker>
          <h2 className="mt-1 mb-5 text-2xl font-bold tracking-tight">Coming next</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANNED.map((p) => (
              <CourseTheme key={p.title} accent={p.accent} accent2={p.accent}>
                <div className="surface flex items-center gap-3 p-4 opacity-75">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    <Icon name={p.icon} size={20} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="text-xs text-[var(--color-faint)]">{p.year} · planned</div>
                  </div>
                </div>
              </CourseTheme>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {LEGACY.map((l) => (
              <a key={l.title} href={l.href} className="card-hover surface flex items-center gap-3 p-4">
                <Icon name="ExternalLink" size={18} className="text-[var(--color-faint)]" />
                <div>
                  <div className="text-sm font-semibold">{l.title}</div>
                  <div className="text-xs text-[var(--color-faint)]">{l.note}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-14 border-t border-[var(--color-line)] py-8 text-center text-sm text-[var(--color-faint)]">
          Polito Tools · study like it's a game, pass like it's inevitable.
        </footer>
      </Page>

      {showSettings && (
        <GameSettingsModal
          courses={courses}
          settings={game.settings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

/* ------------------------- focus course card ----------------------- */

function FocusCard({ course }: { course: Course }) {
  const { meta } = course;
  const progress = useCourseProgress(meta.id);
  const game = useGame();
  const s = summarize(course, progress);
  const r = readiness(course, progress, game);

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <div className="surface flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-white"
              style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
            >
              <Icon name={meta.icon} size={24} />
            </span>
            <div>
              <h3 className="text-lg font-bold leading-tight tracking-tight">{meta.short}</h3>
              {r.daysLeft !== null && (
                <div
                  className="mt-0.5 text-xs font-semibold"
                  style={{ color: r.daysLeft <= 14 ? "var(--warn)" : "var(--color-faint)" }}
                >
                  <Icon name="CalendarClock" size={11} className="mr-1 inline" />
                  {r.daysLeft > 0
                    ? `exam in ${r.daysLeft} day${r.daysLeft === 1 ? "" : "s"}`
                    : r.daysLeft === 0
                    ? "exam TODAY"
                    : "exam date passed — update it"}
                </div>
              )}
            </div>
          </div>
          <ReadinessDial r={r} />
        </div>

        <div className="mt-4">
          <Meter value={s.pct} />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="text-[var(--color-faint)]">
              {s.lessonsDone}/{s.lessonsTotal} lessons · {s.mastered}/{s.practiceTotal} locked-in
            </span>
            {r.due > 0 && (
              <span className="rounded-full bg-[var(--warn-bg)] px-2 py-0.5 text-[var(--warn)]">
                {r.due} due
              </span>
            )}
            {r.rusty > 0 && (
              <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[var(--color-muted)]">
                <Icon name="Sparkles" size={10} className="mr-0.5 inline" />
                {r.rusty} rusty
              </span>
            )}
          </div>
          <BossLine courseId={meta.id} game={game} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link to={`/c/${meta.id}/path`} className="btn btn-primary !px-2 !text-xs">
            <Icon name="Map" size={14} /> Path
          </Link>
          <Link to={`/c/${meta.id}/practice`} className="btn btn-ghost !px-2 !text-xs">
            <Icon name="Dumbbell" size={14} /> Drill
          </Link>
          <Link to={`/c/${meta.id}/boss`} className="btn btn-ghost !px-2 !text-xs" title="Fight the exam boss">
            <Icon name="Swords" size={14} /> Boss
          </Link>
        </div>
      </div>
    </CourseTheme>
  );
}

/* ----------------------- library cards (compact) ------------------- */

function buildHubEntries(courses: Course[]): HubEntry[] {
  const entries: HubEntry[] = [];
  const addedGroups = new Set<string>();
  for (const course of courses) {
    const group = COURSE_GROUPS.find((g) => g.courseIds.includes(course.meta.id));
    if (!group) {
      entries.push({ kind: "course", course });
      continue;
    }
    if (!addedGroups.has(group.id)) {
      entries.push({ kind: "group", group, courses: getCourseGroupCourses(group) });
      addedGroups.add(group.id);
    }
  }
  return entries;
}

function CourseCard({ course }: { course: Course }) {
  const { meta } = course;
  const progress = useCourseProgress(meta.id);
  const s = summarize(course, progress);
  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <Link to={`/c/${meta.id}`} className="card-hover surface group flex h-full flex-col p-5">
        <CardBody
          icon={meta.icon}
          title={meta.title}
          tagline={meta.tagline}
          s={s}
          footer={`Year ${meta.year} · Sem ${meta.semester}${
            meta.status !== "complete" ? ` · ⚠ ${meta.status === "sample" ? "sample content" : "in progress"}` : ""
          }`}
          cta={s.started ? "Continue" : "Start"}
        />
      </Link>
    </CourseTheme>
  );
}

function GroupCard({ group, courses }: { group: CourseGroup; courses: Course[] }) {
  const overall = aggregate(courses.map((c) => summarizeFromStorage(c)));
  const s: CourseSummary = {
    id: group.id,
    lessonsDone: overall.lessonsDone,
    lessonsTotal: overall.lessonsTotal,
    mastered: overall.mastered,
    practiceTotal: overall.practiceTotal,
    due: overall.due,
    examSolved: overall.examSolved,
    examTotal: overall.examTotal,
    xp: overall.xp,
    level: 0,
    pct: overall.pct,
    started: overall.coursesStarted > 0,
  };
  return (
    <CourseTheme accent={group.accent} accent2={group.accent2}>
      <Link to={`/g/${group.id}`} className="card-hover surface group flex h-full flex-col p-5">
        <CardBody
          icon={group.icon}
          title={group.title}
          tagline={group.tagline}
          s={s}
          footer={`Year ${group.year} · Sem ${group.semester}`}
          cta="Choose"
        />
      </Link>
    </CourseTheme>
  );
}

function CardBody({
  icon,
  title,
  tagline,
  s,
  footer,
  cta,
}: {
  icon: string;
  title: string;
  tagline: string;
  s: CourseSummary;
  footer: string;
  cta: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)]"
          style={{ color: "var(--accent)" }}
        >
          <Icon name={icon} size={22} />
        </span>
        <div className="text-right">
          <div className="text-lg font-bold leading-none" style={{ color: "var(--accent)" }}>
            {Math.round(s.pct * 100)}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">complete</div>
        </div>
      </div>
      <h3 className="mt-3 text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-[var(--color-muted)]">{tagline}</p>
      <div className="mt-3">
        <Meter value={s.pct} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-faint)]">
        <span>{footer}</span>
        <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
          {cta}
          <Icon name="ArrowRight" size={14} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </>
  );
}


/* --------------------------- player HUD ---------------------------- */

function PlayerHud({ totalXp, game }: { totalXp: number; game: GameState }) {
  const rank = rankFromXp(totalXp);
  const streak = streakInfo(game);
  const beers = availableBeers(game);
  return (
    <section className="surface relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full blur-3xl"
        style={{ background: "var(--accent, #6a8bff)", opacity: 0.13 }}
      />
      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-4">
        {/* level gem */}
        <div className="relative h-16 w-16 shrink-0" title={`Level ${rank.level} · ${rank.rank}`}>
          <div
            className="absolute inset-1 rotate-45 rounded-xl"
            style={{
              background: "linear-gradient(135deg,#ffd45e,#e8a412)",
              boxShadow: "0 8px 20px -8px rgba(232,164,18,0.7)",
            }}
          />
          <div className="absolute inset-[9px] grid rotate-45 place-items-center rounded-lg bg-[var(--color-surface)]">
            <span className="-rotate-45 text-xl font-black leading-none">{rank.level}</span>
          </div>
        </div>

        {/* name + XP bar */}
        <div className="min-w-[12rem] flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-black tracking-tight">STUDENT</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#e8a412" }}>
              {rank.rank}
            </span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[var(--color-bg)] ring-1 ring-inset ring-[var(--color-line)]">
            <div className="xp-bar h-full rounded-full" style={{ width: `${Math.max(3, rank.pct)}%` }} />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] font-bold text-[var(--color-faint)]">
            <span>{totalXp.toLocaleString()} XP</span>
            <span>
              {rank.needed - rank.into} XP → LV {rank.level + 1}
            </span>
          </div>
        </div>

        {/* status chips */}
        <div className="flex shrink-0 gap-2">
          <HudStat
            icon="Flame"
            value={streak.current}
            label={streak.atRisk ? "at risk!" : "streak"}
            color="#ff7a1a"
            pulse={streak.atRisk && streak.current > 0}
          />
          <HudStat icon="Snowflake" value={game.freezeTokens} label="freezes" color="#6aa6ff" />
          <HudStat icon="Beer" value={beers} label="beers" color="#f5b942" />
        </div>
      </div>
    </section>
  );
}

function HudStat({
  icon,
  value,
  label,
  color,
  pulse,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={cnPulse(pulse)}
      style={{ borderColor: "var(--color-line)" }}
    >
      <Icon name={icon} size={18} style={{ color }} />
      <span className="text-lg font-black leading-none">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-faint)]">{label}</span>
    </div>
  );
}

function cnPulse(pulse?: boolean) {
  return (
    "flex w-[4.2rem] flex-col items-center gap-0.5 rounded-2xl border bg-[var(--color-bg)] px-2 py-2.5" +
    (pulse ? " animate-pulse" : "")
  );
}

/* ---------------------------- boss line ---------------------------- */

function BossLine({ courseId, game }: { courseId: string; game: GameState }) {
  const boss = bossFor(courseId);
  const best = bestBossGrade(courseId, game);
  return (
    <Link
      to={`/c/${courseId}/boss`}
      className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-muted)] transition hover:border-[var(--accent-line)]"
    >
      <Icon name="Swords" size={12} style={{ color: "var(--accent)" }} />
      <span className="truncate">Boss: {boss.name}</span>
      <span className="ml-auto shrink-0 font-bold" style={{ color: best ? "#e8a412" : "var(--color-faint)" }}>
        {best ? `best ${best.grade === 31 ? "30L" : best.grade}` : "undefeated"}
      </span>
    </Link>
  );
}

/* --------------------------- La Birreria --------------------------- */

function BeerShop({ game }: { game: GameState }) {
  const beers = availableBeers(game);
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <Kicker>La Birreria</Kicker>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Spend your beers</h2>
        </div>
        <span className="text-sm font-black" style={{ color: "#e8a412" }}>
          🍺 ×{beers}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {SHOP.map((item) => {
          const owned = item.kind === "cosmetic" && game.unlocks.includes(item.id);
          const pending = item.kind === "boss-heart" ? game.unlocks.filter((u) => u === "boss-heart").length : 0;
          const afford = beers >= item.cost;
          return (
            <div key={item.id} className="surface flex flex-col p-5">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: "#f5b94222", color: "#e8a412" }}
              >
                <Icon name={item.icon} size={22} />
              </span>
              <h3 className="mt-3 font-bold">{item.title}</h3>
              <p className="mt-1 flex-1 text-sm text-[var(--color-muted)]">{item.desc}</p>
              {pending > 0 && (
                <span className="mt-2 w-fit rounded-full bg-[var(--good-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--good)]">
                  ×{pending} ready for your next fight
                </span>
              )}
              <button
                onClick={() => buyShopItem(item.id)}
                disabled={owned || !afford}
                className="btn btn-primary mt-4 disabled:opacity-40"
              >
                {owned ? "Owned ✓" : `Buy · ${item.cost} 🍺`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
