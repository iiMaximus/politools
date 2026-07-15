import { Link, useParams } from "react-router-dom";
import { useCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page, PageLoader } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { Icon } from "../components/Icon";
import { Kicker, Meter, Pill } from "../components/ui";
import { ProgressRing } from "../components/ProgressRing";
import { rtInline } from "../components/RichText";
import { levelFromXp } from "../lib/adaptive";
import { useCourseProgress } from "../lib/progress";
import { updateSettings, useGame } from "../lib/game";
import { topicStats, weakestTopics } from "../lib/stats";
import { summarize } from "../lib/summary";
import { NotFound } from "./NotFound";

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}

export function CoursePage() {
  const { courseId = "" } = useParams();
  const { course, loading } = useCourse(courseId);
  const progress = useCourseProgress(courseId);
  const game = useGame();
  if (loading) return <PageLoader />;
  if (!course) return <NotFound />;

  const stats = topicStats(course, progress).filter((t) => t.total >= 3);
  const weakest = weakestTopics(stats, 1)[0];
  const focusTopics = new Set(game.settings.focusTopics?.[courseId] ?? []);

  function toggleFocusTopic(topic: string) {
    const next = new Set(focusTopics);
    if (next.has(topic)) next.delete(topic);
    else next.add(topic);
    updateSettings({
      focusTopics: { ...(game.settings.focusTopics ?? {}), [courseId]: [...next] },
    });
  }

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

        {/* Topics heat table */}
        {stats.length > 1 && (
          <section className="surface mt-4 p-5">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Kicker>Topics</Kicker>
              {focusTopics.size > 0 && (
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                  focus: {focusTopics.size} topic{focusTopics.size > 1 ? "s" : ""} — Mix & mocks narrow to these
                </span>
              )}
            </div>

            {weakest && weakest.weakness > 0.35 && (
              <Link
                to={`/c/${courseId}/practice?topic=${encodeURIComponent(weakest.topic)}`}
                className="card-hover mt-2 flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-3"
              >
                <Icon name="Crosshair" size={18} style={{ color: "var(--bad)" }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">Drill: {weakest.topic}</span>
                  <span className="block text-xs text-[var(--color-faint)]">
                    {weakest.accuracy !== null
                      ? `${Math.round(weakest.accuracy * 100)}% accuracy`
                      : "not started"}
                    {weakest.due ? ` · ${weakest.due} due` : ""} — your weakest topic right now
                  </span>
                </span>
                <Icon name="ArrowRight" size={16} className="shrink-0 text-[var(--color-faint)]" />
              </Link>
            )}

            <div className="mt-3 grid gap-1.5">
              {stats.map((t) => {
                const mastery = t.total ? t.mastered / t.total : 0;
                return (
                  <div key={t.topic} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleFocusTopic(t.topic)}
                      title={focusTopics.has(t.topic) ? "Remove from focus" : "Focus this topic (narrows Mix & mocks)"}
                      className="shrink-0"
                    >
                      <Icon
                        name="Star"
                        size={15}
                        style={{
                          color: focusTopics.has(t.topic) ? "#f5b942" : "var(--color-line)",
                          fill: focusTopics.has(t.topic) ? "#f5b942" : "none",
                        }}
                      />
                    </button>
                    <Link
                      to={`/c/${courseId}/practice?topic=${encodeURIComponent(t.topic)}`}
                      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-0.5 hover:bg-[var(--color-bg)]"
                    >
                      <span className="w-36 shrink-0 truncate text-sm sm:w-56">{t.topic}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${mastery * 100}%`,
                            background:
                              mastery >= 0.8
                                ? "linear-gradient(90deg,#ffd45e,#e8a412)"
                                : "linear-gradient(90deg,var(--accent),var(--accent-2))",
                          }}
                        />
                      </span>
                      <span className="hidden w-14 shrink-0 text-right font-mono text-[11px] text-[var(--color-faint)] sm:block">
                        {t.mastered}/{t.total}
                      </span>
                      <span className="w-12 shrink-0 text-right text-[11px] font-bold" style={{ color: t.accuracy === null ? "var(--color-faint)" : t.accuracy >= 0.75 ? "var(--good)" : t.accuracy >= 0.5 ? "var(--warn)" : "var(--bad)" }}>
                        {t.accuracy === null ? "—" : `${Math.round(t.accuracy * 100)}%`}
                      </span>
                      {t.due > 0 && (
                        <span className="shrink-0 rounded-full bg-[var(--warn-bg)] px-1.5 text-[10px] font-bold text-[var(--warn)]">
                          {t.due}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              to={`/c/${courseId}/boss`}
              icon="Swords"
              title="Boss fight"
              desc="Face the exam as a 3-D boss. Correct answers deal damage; wins are graded 18–30L."
              footer="Full-screen arena"
            />
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
