import { Link, useParams } from "react-router-dom";
import { getCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { Icon } from "../components/Icon";
import { Kicker, Meter, Pill } from "../components/ui";
import { ProgressRing } from "../components/ProgressRing";
import { rtInline } from "../components/RichText";
import { levelFromXp } from "../lib/adaptive";
import { useCourseProgress } from "../lib/progress";
import { summarize } from "../lib/summary";
import { NotFound } from "./NotFound";

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}

export function CoursePage() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  const progress = useCourseProgress(courseId);
  if (!course) return <NotFound />;

  const { meta, lessons } = course;
  const s = summarize(course, progress);
  const { level, into, perLevel } = levelFromXp(progress.xp);
  const days = daysUntil(meta.examDate);
  const firstUnread = lessons.find((l) => !progress.lessons[l.id]?.completed) ?? lessons[0];

  // group lessons by lecture (preserving order)
  const lectureGroups: { lecture: string; items: typeof lessons }[] = [];
  {
    const idx = new Map<string, { lecture: string; items: typeof lessons }>();
    for (const l of lessons) {
      const key = l.lecture ?? "Lessons";
      let g = idx.get(key);
      if (!g) {
        g = { lecture: key, items: [] };
        idx.set(key, g);
        lectureGroups.push(g);
      }
      g.items.push(l);
    }
  }
  const grouped = lectureGroups.length > 1 || lectureGroups[0]?.lecture !== "Lessons";

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <TopBar crumbs={[{ label: meta.short }]}>
        {days !== null && (
          <Pill tone={days <= 7 ? "warn" : "neutral"}>
            <Icon name="CalendarClock" size={13} /> {days === 0 ? "Exam today" : `${days} days to exam`}
          </Pill>
        )}
      </TopBar>

      <Page>
        {/* Hero */}
        <section className="surface relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ background: "var(--accent)", opacity: 0.16 }} />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-3">
              <CourseIconTile icon={meta.icon} soft={usesSoftCourseIcon(meta.id)} />
              <div>
                <Kicker>
                  Year {meta.year} · Sem {meta.semester}
                  {meta.credits ? ` · ${meta.credits} CFU` : ""}
                </Kicker>
                <h1 className="text-3xl font-extrabold tracking-tight">{meta.title}</h1>
              </div>
            </div>
            <p className="mt-3 text-lg text-[var(--color-muted)]">{meta.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {meta.syllabus.map((x) => (
                <span key={x} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-2.5 py-1 text-xs text-[var(--color-muted)]">
                  {x}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Nav */}
        <div className="mt-4">
          <CourseNav courseId={courseId} due={s.due} />
        </div>

        {/* Progress panel */}
        <section className="surface mt-4 p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <ProgressRing value={s.pct} size={88} stroke={9} label={`${Math.round(s.pct * 100)}%`} sub="complete" />
              <div>
                <Kicker>Your progress</Kicker>
                <div className="mt-0.5 text-xl font-bold">Level {level}</div>
                <div className="text-sm text-[var(--color-faint)]">{perLevel - into} XP to L{level + 1}</div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <BreakdownRow icon="BookOpen" label="Lessons read" done={s.lessonsDone} total={s.lessonsTotal} />
              <BreakdownRow icon="Trophy" label="Questions locked-in" done={s.mastered} total={s.practiceTotal} due={s.due} />
              <BreakdownRow icon="FileCheck" label="Exam problems solved" done={s.examSolved} total={s.examTotal} />
            </div>
          </div>
        </section>

        {/* Continue */}
        {firstUnread && (
          <Link to={`/c/${courseId}/learn/${firstUnread.id}`} className="card-hover surface mt-4 flex items-center gap-4 p-5">
            <Icon name="PlayCircle" size={26} style={{ color: "var(--accent)" }} />
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wider text-[var(--color-faint)]">
                {s.lessonsDone === 0 ? "Start here" : "Continue learning"}
              </div>
              <div className="truncate font-semibold">{rtInline(firstUnread.title)}</div>
            </div>
            <span className="btn btn-primary hidden sm:inline-flex">Open <Icon name="ArrowRight" size={16} /></span>
          </Link>
        )}

        {/* Lessons (Learn), grouped by lecture */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="GraduationCap" size={20} style={{ color: "var(--accent)" }} />
            <h2 className="text-xl font-bold tracking-tight">Lessons</h2>
            <span className="text-sm text-[var(--color-faint)]">· learn the theory, lecture by lecture</span>
          </div>
          <div className="space-y-6">
            {lectureGroups.map((g, gi) => (
              <div key={g.lecture}>
                {grouped && (
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-bold text-white"
                      style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
                    >
                      {gi + 1}
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">{g.lecture}</h3>
                  </div>
                )}
                <div className="space-y-2.5">
                  {g.items.map((l) => {
                    const done = progress.lessons[l.id]?.completed;
                    return (
                      <Link key={l.id} to={`/c/${courseId}/learn/${l.id}`} className="card-hover surface flex items-center gap-4 p-4">
                        <span
                          className={
                            done
                              ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[var(--good)]"
                              : "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-faint)]"
                          }
                        >
                          <Icon name={done ? "Check" : "BookOpen"} size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold">{rtInline(l.title)}</div>
                          <div className="truncate text-sm text-[var(--color-muted)]">{rtInline(l.summary)}</div>
                        </div>
                        <span className="hidden shrink-0 text-xs text-[var(--color-faint)] sm:block">{l.minutes} min</span>
                        <Icon name="ChevronRight" size={18} className="text-[var(--color-faint)]" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Drill & test */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="Target" size={20} style={{ color: "var(--accent)" }} />
            <h2 className="text-xl font-bold tracking-tight">Drill &amp; test</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ActionCard
              to={`/c/${courseId}/scroll`}
              icon="Sparkles"
              title="Scroll mode"
              desc="Short concept cards, formula recall, and quick checks for low-energy studying."
              footer="Bed-friendly review"
            />
            <ActionCard
              to={`/c/${courseId}/practice`}
              icon="Dumbbell"
              title="Practice questions"
              desc="Adaptive A/B/C/D theory questions with full explanations."
              footer={`${s.practiceTotal} questions${s.due ? ` · ${s.due} due` : ""}`}
            />
            <ActionCard
              to={`/c/${courseId}/exams`}
              icon="FileText"
              title="Exam problems"
              desc="Real exam-style problems with step-by-step solutions."
              footer={`${s.examSolved}/${s.examTotal} solved`}
            />
          </div>
        </section>
      </Page>
    </CourseTheme>
  );
}

function CourseIconTile({ icon, soft }: { icon: string; soft?: boolean }) {
  if (!soft) {
    return (
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white"
        style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
      >
        <Icon name={icon} size={24} />
      </span>
    );
  }

  return (
    <span
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)]"
      style={{ color: "var(--accent)" }}
    >
      <Icon name={icon} size={24} />
    </span>
  );
}

function usesSoftCourseIcon(courseId: string): boolean {
  return courseId === "linear-algebra" || courseId === "fundamentals-electronic-systems" || courseId === "electronic-systems";
}

function BreakdownRow({
  icon,
  label,
  done,
  total,
  due,
}: {
  icon: string;
  label: string;
  done: number;
  total: number;
  due?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
          <Icon name={icon} size={15} style={{ color: "var(--accent)" }} />
          {label}
          {due ? (
            <span className="rounded-full bg-[var(--warn-bg)] px-1.5 text-[11px] font-bold text-[var(--warn)]">
              {due} due
            </span>
          ) : null}
        </span>
        <span className="font-mono font-bold">
          {done}/{total}
        </span>
      </div>
      <Meter value={total ? done / total : 0} />
    </div>
  );
}

function ActionCard({
  to,
  icon,
  title,
  desc,
  footer,
}: {
  to: string;
  icon: string;
  title: string;
  desc: string;
  footer: string;
}) {
  return (
    <Link to={to} className="card-hover surface group flex flex-col p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}>
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-[var(--color-muted)]">{desc}</p>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[var(--accent)]">
        {footer}
        <Icon name="ArrowRight" size={16} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
