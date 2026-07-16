import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page, PageLoader } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { Icon } from "../components/Icon";
import { Kicker, Meter, Pill, SectionHeading } from "../components/ui";
import { rt, rtInline } from "../components/RichText";
import { dueCount } from "../lib/adaptive";
import { setExamState, useCourseProgress } from "../lib/progress";
import type { ExamProblem } from "../types";
import { NotFound } from "./NotFound";

export function ExamPage() {
  const { courseId = "" } = useParams();
  const [params] = useSearchParams();
  const topic = params.get("topic");
  const { course, loading } = useCourse(courseId);
  const progress = useCourseProgress(courseId);
  if (loading) return <PageLoader />;
  if (!course) return <NotFound />;

  // group exam problems by tutorial (their topic label)
  const groups: { topic: string; items: ExamProblem[] }[] = [];
  {
    const idx = new Map<string, { topic: string; items: ExamProblem[] }>();
    for (const e of course.exam) {
      const key = e.topic ?? "Problems";
      let g = idx.get(key);
      if (!g) {
        g = { topic: key, items: [] };
        idx.set(key, g);
        groups.push(g);
      }
      g.items.push(e);
    }
  }
  const solvedCount = (list: ExamProblem[]) => list.filter((e) => progress.exams[e.id]?.solved).length;
  const showPicker = !topic && groups.length > 1;
  const problems = topic ? course.exam.filter((e) => e.topic === topic) : course.exam;

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <TopBar
        crumbs={[
          { label: course.meta.short, to: `/c/${courseId}` },
          { label: topic ?? "Exam problems", to: topic ? `/c/${courseId}/exams` : undefined },
        ]}
      >
        <Link to={topic ? `/c/${courseId}/exams` : `/c/${courseId}`} className="btn btn-ghost !py-2 !text-sm">
          <Icon name="X" size={16} /> {topic ? "All tutorials" : "Exit"}
        </Link>
      </TopBar>

      <Page className="max-w-3xl">
        <div className="mb-4">
          <CourseNav courseId={courseId} due={dueCount(course.practice, progress)} />
        </div>

        {showPicker ? (
          <>
            {/* the timed simulator is the closest thing to the real thing */}
            <Link
              to={`/c/${courseId}/mock`}
              className="card-hover surface mb-5 flex items-center gap-3 p-4"
              style={{ borderColor: "var(--accent-line)" }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
              >
                <Icon name="Timer" size={22} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">Take a timed mock exam</span>
                <span className="block text-xs text-[var(--color-faint)]">
                  Exam conditions · auto-graded 18–30L · feeds your review queue
                </span>
              </span>
              <Icon name="ArrowRight" size={16} className="ml-auto shrink-0 text-[var(--color-faint)]" />
            </Link>

            <SectionHeading kicker="Exam problems" title="Pick a tutorial">
              <Pill tone="accent">
                {solvedCount(course.exam)}/{course.exam.length} solved
              </Pill>
            </SectionHeading>
            <p className="mb-6 text-[var(--color-muted)]">
              Each set mirrors a course tutorial. Try a problem on paper first, then reveal the full
              worked method — not just the final number.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {groups.map((g) => {
                const s = solvedCount(g.items);
                return (
                  <Link
                    key={g.topic}
                    to={`/c/${courseId}/exams?topic=${encodeURIComponent(g.topic)}`}
                    className="card-hover surface flex items-center gap-3 p-4"
                  >
                    <Icon name="FileText" size={18} style={{ color: "var(--accent)" }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{g.topic}</div>
                      <div className="mt-1.5">
                        <Meter value={g.items.length ? s / g.items.length : 0} />
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[var(--color-faint)]">
                      {s}/{g.items.length}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <SectionHeading kicker={topic ?? "Exam-style problems"} title="Solve, then check the full method">
              <Pill tone="accent">
                {solvedCount(problems)}/{problems.length} solved
              </Pill>
            </SectionHeading>
            <div className="space-y-5">
              {problems.map((e, i) => (
                <ProblemCard
                  key={e.id}
                  n={i + 1}
                  problem={e}
                  revealed={!!progress.exams[e.id]?.revealed}
                  solved={!!progress.exams[e.id]?.solved}
                  onReveal={() => setExamState(courseId, e.id, { revealed: true })}
                  onToggleSolved={(v) => setExamState(courseId, e.id, { solved: v })}
                />
              ))}
            </div>
          </>
        )}
      </Page>
    </CourseTheme>
  );
}

function ProblemCard({
  n,
  problem,
  revealed,
  solved,
  onReveal,
  onToggleSolved,
}: {
  n: number;
  problem: ExamProblem;
  revealed: boolean;
  solved: boolean;
  onReveal: () => void;
  onToggleSolved: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(revealed);

  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-[var(--color-line)] p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-sm font-bold text-[#06080f]"
            style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
          >
            {n}
          </span>
          <h3 className="text-lg font-bold">{rtInline(problem.title)}</h3>
          <Pill tone="neutral" className="ml-auto">
            {problem.difficulty}
          </Pill>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-faint)]">
          {problem.meta.includes("written-test") && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 font-bold"
              style={{ background: "#f5b94226", color: "#c8901a" }}
              title="Styled after the professor's recurring written-test set — expect this on the real exam"
            >
              <Icon name="Star" size={11} /> recurring on real exams
            </span>
          )}
          <span>{problem.meta}</span>
        </div>
        <div className="prose-lesson !text-[1rem]">{rt(problem.statement)}</div>

        {problem.given && (
          <div className="mt-4 rounded-xl bg-[var(--color-bg)] p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)]">Given</div>
            <div className="prose-lesson !text-[0.95rem]">{rt(problem.given)}</div>
          </div>
        )}
      </div>

      {!open ? (
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => {
              setOpen(true);
              onReveal();
            }}
            className="btn btn-primary"
          >
            <Icon name="Eye" size={16} /> Reveal worked solution
          </button>
          <span className="text-sm text-[var(--color-faint)]">Try it on paper first.</span>
        </div>
      ) : (
        <div className="p-5">
          <Kicker>Worked solution</Kicker>
          <ol className="mt-3 space-y-4">
            {problem.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--accent-line)] text-sm font-bold text-[var(--accent)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{rt(s.title)}</div>
                  <div className="prose-lesson mt-1 !text-[0.96rem]">{rt(s.content)}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--good)]">Final answer</div>
            <div className="prose-lesson !text-[1rem]">{rt(problem.finalAnswer)}</div>
          </div>

          {problem.tips && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--warn)]">
                <Icon name="AlertTriangle" size={13} /> Examiner notes
              </div>
              <div className="prose-lesson !text-[0.95rem]">{rt(problem.tips)}</div>
            </div>
          )}

          <label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={solved}
              onChange={(e) => onToggleSolved(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
              style={{ accentColor: "var(--accent)" }}
            />
            I solved this correctly on my own
          </label>
        </div>
      )}
    </div>
  );
}
