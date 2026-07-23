import { Link } from "react-router-dom";
import { useCourses } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Page, TopBar } from "../components/Layout";
import { ReadinessDial } from "../components/game/ReadinessDial";
import { Kicker } from "../components/ui";
import { examReadinessReport } from "../lib/exam-readiness";
import { readiness, useGame } from "../lib/game";
import { useCourseProgress } from "../lib/progress";
import type { Course } from "../types";

export function ReadinessPage() {
  const game = useGame();
  const courseIds = game.settings.focusCourses.filter((id) => !game.settings.passedCourses.includes(id));
  const { courses, ready } = useCourses(courseIds);

  return (
    <>
      <TopBar crumbs={[{ label: "Exam readiness" }]} />
      <Page className="max-w-5xl pt-5 sm:pt-8">
        <div className="mb-5">
          <Kicker>Evidence, not vibes</Kicker>
          <h1 className="pixel-font mt-1 text-4xl uppercase leading-none tracking-wide">Exam radar</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Forecasts combine stable recall, lesson coverage, real exam work and recent timed mocks.
            The range stays wide until there is enough evidence to trust it.
          </p>
        </div>

        <div className="grid gap-4">
          {courses.map((course) => <CourseReadiness key={course.meta.id} course={course} />)}
        </div>

        {!ready && (
          <div className="surface p-6 text-center text-sm text-[var(--color-faint)]">Loading your exam evidence…</div>
        )}
        {ready && courses.length === 0 && (
          <div className="surface p-8 text-center text-sm text-[var(--color-muted)]">
            Pick focus courses on the home screen to build an exam forecast.
          </div>
        )}
      </Page>
    </>
  );
}

function CourseReadiness({ course }: { course: Course }) {
  const progress = useCourseProgress(course.meta.id);
  const game = useGame();
  const report = examReadinessReport(course, progress, game);
  const dial = readiness(course, progress, game);

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <section className="mc-panel arcade-dark relative overflow-hidden p-5 text-white sm:p-6">
        <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <div className="flex items-start gap-4">
              <ReadinessDial r={dial} size={76} />
              <div className="min-w-0">
                <Link to={`/c/${course.meta.id}`} className="pixel-font text-2xl uppercase leading-none hover:text-[var(--accent)]">
                  {course.meta.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/45">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-bold text-[var(--accent)]">
                    likely grade {report.gradeRange}
                  </span>
                  <span>{report.confidence} confidence</span>
                  {report.recentMockGrade && <span>latest evidence: mock {report.recentMockGrade}</span>}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/40">{report.evidenceLabel}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {report.actions.map((action, index) => (
                <Link
                  key={`${action.to}:${index}`}
                  to={action.to}
                  className="mc-slot card-hover p-3"
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Icon name={action.icon} size={15} style={{ color: "var(--accent)" }} />
                    <span className="line-clamp-2">{action.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-white/40">{action.detail}</p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="mc-slot p-4">
            <div className="pixel-font text-xl uppercase leading-none text-white/65">Marks at risk</div>
            <div className="mt-3 space-y-3">
              {report.risks.map((risk, index) => (
                <Link
                  key={risk.topic}
                  to={`/c/${course.meta.id}/practice?topic=${encodeURIComponent(risk.topic)}`}
                  className="block"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="pixel-font w-4 shrink-0 text-base text-[var(--bad)]">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{risk.topic}</span>
                    <span className="shrink-0 text-white/40">
                      {risk.accuracy === null ? "unseen" : `${Math.round(risk.accuracy * 100)}%`}
                    </span>
                  </div>
                  <div className="ml-6 mt-1 h-1.5 overflow-hidden rounded-full bg-[#171717]">
                    <span
                      className="block h-full rounded-full bg-[var(--bad)]"
                      style={{ width: `${Math.max(8, Math.min(100, risk.cost * 28))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </CourseTheme>
  );
}
