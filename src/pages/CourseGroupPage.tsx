import { Link, useParams } from "react-router-dom";
import { getCourseGroup } from "../courses/groups";
import { useCourses } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Kicker, Meter } from "../components/ui";
import { useCourseProgress } from "../lib/progress";
import { aggregate, summarize, summarizeFromStorage } from "../lib/summary";
import type { Course } from "../types";
import { NotFound } from "./NotFound";

export function CourseGroupPage() {
  const { groupId = "" } = useParams();
  const group = getCourseGroup(groupId);
  const { courses } = useCourses(group?.courseIds ?? []);
  if (!group) return <NotFound />;

  const overall = aggregate(courses.map(summarizeFromStorage));

  return (
    <CourseTheme accent={group.accent} accent2={group.accent2}>
      <TopBar crumbs={[{ label: "Courses", to: "/" }, { label: group.short }]} />
      <Page>
        <section className="surface p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <CourseIconTile icon={group.icon} />
                <div>
                  <Kicker>
                    Year {group.year} · Sem {group.semester}
                  </Kicker>
                  <h1 className="text-3xl font-extrabold tracking-tight">{group.title}</h1>
                </div>
              </div>
              <p className="mt-3 text-lg text-[var(--color-muted)]">{group.description}</p>
            </div>

            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-right">
              <div className="text-2xl font-extrabold" style={{ color: "var(--accent)" }}>
                {Math.round(overall.pct * 100)}%
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">combined progress</div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <CourseChoiceCard key={course.meta.id} course={course} />
          ))}
        </section>
      </Page>
    </CourseTheme>
  );
}

function CourseChoiceCard({ course }: { course: Course }) {
  const { meta } = course;
  const progress = useCourseProgress(meta.id);
  const summary = summarize(course, progress);

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <Link to={`/c/${meta.id}`} className="card-hover surface group flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CourseIconTile icon={meta.icon} />
            <div>
              <Kicker>
                Year {meta.year} · Sem {meta.semester}
              </Kicker>
              <h2 className="text-xl font-bold tracking-tight">{meta.title}</h2>
            </div>
          </div>
          <Icon name="ArrowRight" size={18} className="shrink-0 text-[var(--color-faint)] transition group-hover:translate-x-1" />
        </div>

        <p className="mt-4 flex-1 text-sm text-[var(--color-muted)]">{meta.tagline}</p>

        <div className="mt-4">
          <Meter value={summary.pct} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini icon="BookOpen" value={`${summary.lessonsDone}/${summary.lessonsTotal}`} label="lessons" />
          <Mini icon="Dumbbell" value={`${summary.mastered}/${summary.practiceTotal}`} label="locked-in" />
          <Mini icon="FileText" value={`${summary.examSolved}/${summary.examTotal}`} label="exams" />
        </div>

        <div className="mt-4 text-sm font-semibold text-[var(--accent)]">
          {summary.started ? "Continue" : "Start"}
        </div>
      </Link>
    </CourseTheme>
  );
}

function CourseIconTile({ icon }: { icon: string }) {
  return (
    <span
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)]"
      style={{ color: "var(--accent)" }}
    >
      <Icon name={icon} size={24} />
    </span>
  );
}

function Mini({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] py-1.5">
      <div className="flex items-center justify-center gap-1 text-sm font-bold">
        <Icon name={icon} size={12} className="text-[var(--color-faint)]" />
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-[var(--color-faint)]">{label}</div>
    </div>
  );
}
