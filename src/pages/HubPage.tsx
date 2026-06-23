import { Link } from "react-router-dom";
import { allCourses } from "../courses/registry";
import { TopBar, Page } from "../components/Layout";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Kicker, Meter } from "../components/ui";
import { ProgressRing } from "../components/ProgressRing";
import { useCourseProgress } from "../lib/progress";
import { aggregate, summarize, summarizeFromStorage } from "../lib/summary";
import type { Course } from "../types";

const PLANNED = [
  { title: "Fluid Mechanics", icon: "Droplets", year: "Y3", accent: "#36c5d6" },
  { title: "Industrial Plants", icon: "Factory", year: "Y3", accent: "#c98bff" },
  { title: "Manufacturing Processes", icon: "Cog", year: "Y3", accent: "#ff9f6b" },
  { title: "Safety Engineering", icon: "HardHat", year: "Y3", accent: "#e0a91f" },
];

const LEGACY = [
  { title: "TMM — Metallic Materials", href: "../index.html", note: "Classic flashcard site (already built)" },
  { title: "Cybersecurity flashcards", href: "../Cyber/index.html", note: "Classic flashcard site" },
];

export function HubPage() {
  const courses = allCourses();
  const summaries = courses.map(summarizeFromStorage);
  const overall = aggregate(summaries);
  const resume = courses.find((_course, i) => summaries[i].started && summaries[i].pct < 1);

  return (
    <>
      <TopBar />
      <Page className="pt-6">
        {/* Global progress dashboard */}
        <section className="surface p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <ProgressRing
                value={overall.pct}
                size={88}
                stroke={9}
                label={`${Math.round(overall.pct * 100)}%`}
                sub="overall"
              />
              <div>
                <Kicker>Your progress</Kicker>
                <div className="mt-0.5 text-xl font-bold">
                  {overall.coursesStarted}/{courses.length} courses started
                </div>
                <div className="text-sm text-[var(--color-faint)]">{overall.xp} XP earned in total</div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              <DashTile icon="BookOpen" label="Lessons" value={`${overall.lessonsDone}/${overall.lessonsTotal}`} />
              <DashTile icon="Trophy" label="Cards mastered" value={`${overall.mastered}/${overall.practiceTotal}`} />
              <DashTile icon="FileCheck" label="Exam problems" value={`${overall.examSolved}/${overall.examTotal}`} />
              <DashTile
                icon="RotateCcw"
                label="Reviews due"
                value={overall.due}
                tone={overall.due ? "warn" : "default"}
              />
            </div>
          </div>

          {resume && (
            <Link
              to={`/c/${resume.meta.id}`}
              className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] px-4 py-3 transition hover:brightness-[1.02]"
            >
              <Icon name="PlayCircle" size={20} style={{ color: "var(--accent)" }} />
              <span className="text-sm">
                <span className="text-[var(--color-faint)]">Jump back into </span>
                <span className="font-semibold">{resume.meta.title}</span>
              </span>
              <Icon name="ArrowRight" size={16} className="ml-auto text-[var(--color-muted)]" />
            </Link>
          )}
        </section>

        {/* Courses */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <Kicker>Your courses</Kicker>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Pick a subject</h2>
            </div>
            <span className="text-sm text-[var(--color-faint)]">{courses.length} available</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.meta.id} course={c} />
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mt-14">
          <Kicker>On the roadmap</Kicker>
          <h2 className="mt-1 mb-5 text-2xl font-bold tracking-tight">Coming next</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANNED.map((p) => (
              <CourseTheme key={p.title} accent={p.accent} accent2={p.accent}>
                <div className="surface flex items-center gap-3 p-4 opacity-75">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: "var(--accent)" }}>
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
          Polito Tools · built to be the only study source you need. Sample content — swap in real
          slides &amp; past exams to complete each course.
        </footer>
      </Page>
    </>
  );
}

function DashTile({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warn";
}) {
  const color = tone === "warn" ? "var(--warn)" : "var(--color-muted)";
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
        <Icon name={icon} size={12} style={{ color }} />
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold" style={tone === "warn" ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const { meta } = course;
  const progress = useCourseProgress(meta.id);
  const s = summarize(course, progress);

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <Link to={`/c/${meta.id}`} className="card-hover surface group flex h-full flex-col p-5">
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}>
            <Icon name={meta.icon} size={24} />
          </span>
          <div className="text-right">
            <div className="text-lg font-bold leading-none" style={{ color: "var(--accent)" }}>
              {Math.round(s.pct * 100)}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">complete</div>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight">{meta.title}</h3>
        <p className="mt-1 flex-1 text-sm text-[var(--color-muted)]">{meta.tagline}</p>

        <div className="mt-4">
          <Meter value={s.pct} />
        </div>

        {/* per-subject breakdown */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini icon="BookOpen" value={`${s.lessonsDone}/${s.lessonsTotal}`} label="lessons" />
          <Mini icon="Dumbbell" value={`${s.mastered}/${s.practiceTotal}`} label="mastered" />
          <Mini icon="FileText" value={`${s.examSolved}/${s.examTotal}`} label="exams" />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-faint)]">
          <span>Year {meta.year} · Sem {meta.semester}</span>
          <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
            {s.started ? "Continue" : "Start"}
            <Icon name="ArrowRight" size={14} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </CourseTheme>
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

