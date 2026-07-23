import { Link, useParams } from "react-router-dom";
import { getCourseGroup } from "../courses/groups";
import { useCourses } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Kicker } from "../components/ui";
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
        <section className="mc-panel arcade-dark relative overflow-hidden p-6 text-white sm:p-8">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.05]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <CourseIconTile icon={group.icon} />
                <div>
                  <Kicker className="!text-white/45">
                    Year {group.year} · Sem {group.semester}
                  </Kicker>
                  <h1 className="pixel-font text-4xl uppercase leading-none tracking-wide">{group.title}</h1>
                </div>
              </div>
              <p className="mt-3 text-lg text-white/60">{group.description}</p>
            </div>

            <div className="mc-slot px-4 py-3 text-right">
              <div className="pixel-font text-4xl leading-none" style={{ color: "var(--accent)" }}>
                {Math.round(overall.pct * 100)}%
              </div>
              <div className="pixel-font text-sm uppercase leading-none text-white/40">combined progress</div>
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
      <Link to={`/c/${meta.id}`} className="mc-panel arcade-dark card-hover group relative flex h-full flex-col overflow-hidden p-5 text-white">
        <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CourseIconTile icon={meta.icon} />
            <div>
              <Kicker className="!text-white/45">
                Year {meta.year} · Sem {meta.semester}
              </Kicker>
              <h2 className="pixel-font text-2xl uppercase leading-none">{meta.title}</h2>
            </div>
          </div>
          <Icon name="ArrowRight" size={18} className="shrink-0 text-white/40 transition group-hover:translate-x-1" />
        </div>

        <p className="relative mt-4 flex-1 text-sm text-white/55">{meta.tagline}</p>

        <div className="relative mt-4 h-3 overflow-hidden rounded-sm border-2 border-black bg-[#3a0d0d]">
          <div
            className="h-full"
            style={{ width: `${Math.max(summary.pct > 0 ? 2 : 0, summary.pct * 100)}%`, background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
          />
        </div>

        <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini icon="BookOpen" value={`${summary.lessonsDone}/${summary.lessonsTotal}`} label="lessons" />
          <Mini icon="Dumbbell" value={`${summary.mastered}/${summary.practiceTotal}`} label="locked-in" />
          <Mini icon="FileText" value={`${summary.examSolved}/${summary.examTotal}`} label="exams" />
        </div>

        <div className="pixel-font relative mt-4 text-xl uppercase leading-none" style={{ color: "#ffff55" }}>
          {summary.started ? "Continue ▶" : "Start ▶"}
        </div>
      </Link>
    </CourseTheme>
  );
}

function CourseIconTile({ icon }: { icon: string }) {
  return (
    <span
      className="mc-slot grid h-12 w-12 shrink-0 place-items-center"
      style={{ color: "var(--accent)" }}
    >
      <Icon name={icon} size={24} />
    </span>
  );
}

function Mini({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="mc-slot py-1.5 text-white">
      <div className="flex items-center justify-center gap-1 text-sm font-bold">
        <Icon name={icon} size={12} className="text-white/45" />
        {value}
      </div>
      <div className="pixel-font text-xs uppercase leading-none text-white/40">{label}</div>
    </div>
  );
}
