import { Link } from "react-router-dom";
import { useCourses } from "../courses/registry";
import { TopBar, Page } from "../components/Layout";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Kicker } from "../components/ui";
import { Heatmap } from "../components/game/Heatmap";
import { StreakBadge, RankBadge, BeerCounter } from "../components/game/HudBits";
import { ReadinessDial } from "../components/game/ReadinessDial";
import { readProgress, useCourseProgress } from "../lib/progress";
import { aggregate, summarizeFromStorage } from "../lib/summary";
import { readiness, streakInfo, useGame } from "../lib/game";
import { reviewForecast, topicStats, weakestTopics } from "../lib/stats";
import type { Course } from "../types";

/* ================================================================== *
 *  STATS — the "brain" view: streak + rank, activity heatmap, review
 *  forecast, weakest topics and mock-exam history per focus course.
 * ================================================================== */

export function StatsPage() {
  const game = useGame();
  const focusIds = game.settings.focusCourses.filter(
    (id) => !game.settings.passedCourses.includes(id)
  );
  const { courses } = useCourses(focusIds);

  const totalXp =
    aggregate(courses.map((c) => summarizeFromStorage(c))).xp + game.bonusXp;
  const streak = streakInfo(game);

  return (
    <>
      <TopBar crumbs={[{ label: "Stats" }]} />
      <Page className="max-w-4xl">
        <section className="grid gap-3 sm:grid-cols-3">
          <StreakBadge streak={streak} />
          <RankBadge totalXp={totalXp} />
          <BeerCounter beers={game.beers} />
        </section>

        <section className="surface mt-4 p-5">
          <Kicker>Activity</Kicker>
          <div className="mt-3">
            <Heatmap state={game} />
          </div>
        </section>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4">
          {courses.map((c) => (
            <CourseStats key={c.meta.id} course={c} />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="surface mt-4 p-8 text-center text-sm text-[var(--color-muted)]">
            Pick your focus courses on the hub and the brain scan appears here.
          </div>
        )}
      </Page>
    </>
  );
}

function CourseStats({ course }: { course: Course }) {
  const progress = useCourseProgress(course.meta.id);
  const game = useGame();
  const r = readiness(course, progress, game);
  const stats = topicStats(course, progress);
  const weakest = weakestTopics(stats, 2);
  const forecast = reviewForecast(course.practice, readProgress(course.meta.id));
  const forecastMax = Math.max(1, ...forecast);
  const mocks = (game.mockExams[course.meta.id] ?? []).slice(-6);

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <section className="surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{course.meta.title}</h2>
            <div className="text-xs text-[var(--color-faint)]">
              {r.daysLeft !== null && `${r.daysLeft} days to exam · `}
              forecast grade <strong style={{ color: "var(--accent)" }}>{r.gradeLabel}</strong>
            </div>
          </div>
          <div className="shrink-0"><ReadinessDial r={r} size={64} /></div>
        </div>

        {/* 7-day review forecast */}
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
            Review forecast
          </div>
          <div className="flex items-end gap-1.5">
            {forecast.map((n, d) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--color-muted)]">{n || ""}</span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${6 + (n / forecastMax) * 40}px`,
                    background:
                      d === 0
                        ? "var(--warn)"
                        : "color-mix(in oklab, var(--accent) 60%, transparent)",
                    opacity: n ? 1 : 0.25,
                  }}
                />
                <span className="text-[10px] text-[var(--color-faint)]">
                  {d === 0 ? "now" : `+${d}d`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* weakest topics */}
        {weakest.length > 0 && (
          <div className="mt-4 grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
              Weakest topics
            </div>
            {weakest.map((t) => (
              <Link
                key={t.topic}
                to={`/c/${course.meta.id}/practice?topic=${encodeURIComponent(t.topic)}`}
                className="card-hover flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5"
              >
                <Icon name="Crosshair" size={16} style={{ color: "var(--bad)" }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t.topic}</span>
                <span className="shrink-0 text-xs text-[var(--color-faint)]">
                  {t.accuracy !== null ? `${Math.round(t.accuracy * 100)}% acc · ` : "untouched · "}
                  {t.mastered}/{t.total} locked
                  {t.due ? ` · ${t.due} due` : ""}
                </span>
                <Icon name="ArrowRight" size={14} className="shrink-0 text-[var(--color-faint)]" />
              </Link>
            ))}
          </div>
        )}

        {/* mock history */}
        {mocks.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-faint)]">
              Mock exams
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {mocks.map((m) => (
                <span
                  key={m.at}
                  className="rounded-lg px-2.5 py-1 font-mono text-sm font-bold"
                  style={{
                    background: m.grade >= 18 ? "var(--good-bg)" : "var(--bad-bg)",
                    color: m.grade >= 18 ? "var(--good)" : "var(--bad)",
                  }}
                  title={new Date(m.at).toLocaleDateString()}
                >
                  {m.grade >= 31 ? "30L" : m.grade < 18 ? "<18" : m.grade}
                </span>
              ))}
              <Link to={`/c/${course.meta.id}/mock`} className="btn btn-ghost !px-3 !py-1.5 !text-xs">
                <Icon name="Timer" size={13} /> New mock
              </Link>
            </div>
          </div>
        )}
      </section>
    </CourseTheme>
  );
}
