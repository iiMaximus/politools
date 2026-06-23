import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { LecturePicker } from "../components/LecturePicker";
import { Icon } from "../components/Icon";
import { Kicker, Meter, Pill } from "../components/ui";
import { rt, rtInline } from "../components/RichText";
import { cn } from "../lib/cn";
import {
  buildSession,
  dueCount,
  isDue,
  levelFromXp,
  masteredCount,
  shuffle,
} from "../lib/adaptive";
import { recordAnswer, useCourseProgress } from "../lib/progress";
import type { Question } from "../types";
import { NotFound } from "./NotFound";

export function PracticePage() {
  const { courseId = "" } = useParams();
  const [params] = useSearchParams();
  const mode = params.get("mode");
  const dueOnly = mode === "due";
  const topic = params.get("topic");
  // No lecture/mode chosen yet → show the lecture-first menu (like the classic site).
  const showMenu = !topic && !mode;
  const course = getCourse(courseId);
  const progress = useCourseProgress(courseId);

  // Build the ordered queue once per mount.
  const queue = useMemo(() => {
    if (!course) return [];
    let pool = course.practice;
    if (topic) pool = pool.filter((q) => q.topic === topic);
    if (dueOnly) pool = pool.filter((q) => isDue(progress.cards[q.id]));
    return buildSession(pool, progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, dueOnly, topic]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  if (!course) return <NotFound />;

  const total = course.practice.length;
  const mastered = masteredCount(course.practice, progress);
  const due = dueCount(course.practice, progress);
  const { level, pct } = levelFromXp(progress.xp);

  // Lecture-first menu (default landing for Practice)
  if (showMenu) {
    return (
      <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
        <TopBar crumbs={[{ label: course.meta.short, to: `/c/${courseId}` }, { label: "Practice" }]} />
        <Page className="max-w-3xl">
          <div className="mb-4">
            <CourseNav courseId={courseId} due={due} />
          </div>
          <div className="mb-5">
            <Kicker>Practice</Kicker>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Choose a set</h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Pick a tutorial / lecture below, or mix everything. Cards lock in after two correct in a
              row and come back to you when you miss them.
            </p>
          </div>
          <LecturePicker courseId={courseId} course={course} progress={progress} />
        </Page>
      </CourseTheme>
    );
  }

  const done = i >= queue.length;
  const q: Question | undefined = queue[i];

  function answer(optionId: string) {
    if (picked || !q) return;
    setPicked(optionId);
    const correct = optionId === q.correct;
    if (correct) setSessionCorrect((n) => n + 1);
    else setSessionWrong((n) => n + 1);
    recordAnswer(courseId, q.id, correct);
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <TopBar
        crumbs={[
          { label: course.meta.short, to: `/c/${courseId}` },
          { label: topic ?? (dueOnly ? "Review mistakes" : "Practice") },
        ]}
      >
        <Link to={`/c/${courseId}/practice`} className="btn btn-ghost !py-2 !text-sm">
          <Icon name="X" size={16} /> Exit
        </Link>
      </TopBar>

      <Page className="max-w-3xl">
        <div className="mb-4">
          <CourseNav courseId={courseId} due={due} />
        </div>

        {/* Status bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon="ListChecks" label="Question" value={`${Math.min(i + (done ? 0 : 1), queue.length)}/${queue.length}`} />
          <Stat icon="Check" label="Correct" value={sessionCorrect} tone="good" />
          <Stat icon="RotateCcw" label="Due" value={due} tone={due ? "warn" : "default"} />
          <Stat icon="Trophy" label="Mastered" value={`${mastered}/${total}`} />
        </div>

        <div className="surface mb-6 p-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold">Level {level}</span>
            <span className="text-[var(--color-faint)]">{progress.xp} XP</span>
          </div>
          <Meter value={pct / 100} />
        </div>

        {done ? (
          <SessionEnd
            courseId={courseId}
            correct={sessionCorrect}
            wrong={sessionWrong}
            onRestart={() => {
              setI(0);
              setPicked(null);
              setSessionCorrect(0);
              setSessionWrong(0);
            }}
          />
        ) : q ? (
          <QuestionCard key={q.id} q={q} picked={picked} onPick={answer} onNext={next} />
        ) : (
          <div className="surface p-8 text-center">
            <Icon name="PartyPopper" size={36} className="mx-auto mb-3 text-[var(--accent)]" />
            <h2 className="text-xl font-bold">Nothing due right now</h2>
            <p className="mt-1 text-[var(--color-muted)]">
              You have no review cards waiting. Try the full practice set instead.
            </p>
            <Link to={`/c/${courseId}/practice`} className="btn btn-primary mt-4 inline-flex">
              Practice everything
            </Link>
          </div>
        )}
      </Page>
    </CourseTheme>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  tone?: "default" | "good" | "warn";
}) {
  const color = tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : "var(--color-muted)";
  return (
    <div className="surface px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-faint)]">
        <Icon name={icon} size={12} style={{ color }} />
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold" style={{ color: tone === "default" ? undefined : color }}>
        {value}
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  picked,
  onPick,
  onNext,
}: {
  q: Question;
  picked: string | null;
  onPick: (id: string) => void;
  onNext: () => void;
}) {
  // Shuffle option display order, but keep the original letters in feedback.
  const options = useMemo(() => shuffle(q.options), [q.id]);
  const answered = picked !== null;
  const correct = picked === q.correct;

  return (
    <div className="surface p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Pill tone="neutral">{q.difficulty}</Pill>
        {q.topic && <Pill tone="accent">{q.topic}</Pill>}
      </div>

      <div className="prose-lesson mb-5 !text-[1.08rem] font-medium !text-[var(--color-ink)]">{rt(q.prompt)}</div>

      <div className="grid gap-2.5">
        {options.map((o) => {
          const isCorrect = o.id === q.correct;
          const show = answered && (o.id === picked || isCorrect);
          return (
            <button
              key={o.id}
              disabled={answered}
              onClick={() => onPick(o.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                !answered && "border-[var(--color-line)] hover:border-[var(--accent-line)] hover:bg-[var(--color-surface-2)]",
                show && isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                show && !isCorrect && o.id === picked && "border-rose-500/50 bg-rose-500/10",
                answered && !show && "border-[var(--color-line)] opacity-45"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-xs font-bold",
                  show && isCorrect
                    ? "bg-emerald-500 text-[#06080f]"
                    : show && !isCorrect && o.id === picked
                    ? "bg-rose-500 text-[#06080f]"
                    : "bg-[var(--color-bg)] text-[var(--color-faint)]"
                )}
              >
                {o.id}
              </span>
              <span className="flex-1 pt-0.5">{rtInline(o.content)}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-5 space-y-4">
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold"
            style={{
              background: correct ? "var(--good-bg)" : "var(--bad-bg)",
              color: correct ? "var(--good)" : "var(--bad)",
            }}
          >
            <Icon name={correct ? "CircleCheck" : "CircleX"} size={18} />
            {correct ? "Correct" : `Correct answer: ${q.correct}`}
          </div>

          <div className="rounded-xl bg-[var(--color-bg)] p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Why</div>
            <div className="prose-lesson !text-[0.96rem]">{rt(q.explanation)}</div>
          </div>

          {q.theory && (
            <div className="rounded-xl bg-[var(--color-bg)] p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                Relevant theory
              </div>
              <div className="prose-lesson !text-[0.96rem]">{rt(q.theory)}</div>
            </div>
          )}

          {q.source && <div className="text-xs text-[var(--color-faint)]">Source: {q.source}</div>}

          <button onClick={onNext} className="btn btn-primary w-full">
            Next <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function SessionEnd({
  courseId,
  correct,
  wrong,
  onRestart,
}: {
  courseId: string;
  correct: number;
  wrong: number;
  onRestart: () => void;
}) {
  const total = correct + wrong;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="surface p-8 text-center">
      <Icon name="Flag" size={36} className="mx-auto mb-3 text-[var(--accent)]" />
      <h2 className="text-2xl font-bold">Session complete</h2>
      <p className="mt-1 text-[var(--color-muted)]">
        {correct}/{total} correct · {pct}% this round
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={onRestart} className="btn btn-primary">
          <Icon name="RotateCcw" size={16} /> Go again
        </button>
        <Link to={`/c/${courseId}/practice`} className="btn btn-ghost">
          <Icon name="ListTree" size={16} /> Choose lecture
        </Link>
        <Link to={`/c/${courseId}/practice?mode=due`} className="btn btn-ghost">
          Review mistakes
        </Link>
      </div>
    </div>
  );
}
