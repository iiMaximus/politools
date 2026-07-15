import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { rt, rtInline } from "../components/RichText";
import { cn } from "../lib/cn";
import { shuffle } from "../lib/adaptive";
import { checkNumeric } from "../lib/answer";
import { gradeFromScore, logMockExam, readGame } from "../lib/game";
import { recordAnswer } from "../lib/progress";
import { sfx } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";
import { isNumeric, type Course, type Question } from "../types";
import { NotFound } from "./NotFound";

/* ================================================================== *
 *  MOCK EXAM — the timed, auto-graded simulator. One countdown for the
 *  whole paper, no per-question feedback, flag-for-review, a numbered
 *  palette, auto-submit at 0:00. Answers can be changed until submit.
 *  Grading uses the shared 17..31 law (gradeFromScore); results feed
 *  the SRS (every answer recorded) and readiness (logMockExam).
 * ================================================================== */

const LENGTHS = [15, 25, 35];
const SEC_PER_QUESTION = 120;

interface MockSnapshot {
  ids: string[];
  answers: Record<string, string>;
  flagged: string[];
  deadline: number;
  startedAt: number;
}

const KEY = (courseId: string) => `polito:mock:${courseId}`;

function readSnapshot(courseId: string): MockSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY(courseId));
    return raw ? (JSON.parse(raw) as MockSnapshot) : null;
  } catch {
    return null;
  }
}

function writeSnapshot(courseId: string, s: MockSnapshot) {
  try {
    localStorage.setItem(KEY(courseId), JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function clearSnapshot(courseId: string) {
  try {
    localStorage.removeItem(KEY(courseId));
  } catch {
    /* ignore */
  }
}

/** stratified draw: proportional per topic, slightly biased to medium/hard */
function buildMockDeck(course: Course, count: number): Question[] {
  // topic focus (course page) narrows the paper to the topics that matter
  const focusT = readGame().settings.focusTopics?.[course.meta.id];
  const focused = focusT?.length
    ? course.practice.filter((q) => q.topic && focusT.includes(q.topic))
    : course.practice;
  const pool = focused.length >= 10 ? focused : course.practice;
  const byTopic = new Map<string, Question[]>();
  for (const q of pool) {
    const key = q.topic ?? "General";
    const list = byTopic.get(key) ?? [];
    list.push(q);
    byTopic.set(key, list);
  }
  const total = pool.length;
  const bias = (q: Question) =>
    Math.random() + (q.difficulty === "hard" ? 0.3 : q.difficulty === "medium" ? 0.2 : 0);
  const picked: Question[] = [];
  for (const [, qs] of byTopic) {
    const share = Math.max(1, Math.round((qs.length / total) * count));
    const scored = qs.map((q) => ({ q, s: bias(q) }));
    scored.sort((a, b) => b.s - a.s);
    picked.push(...scored.slice(0, share).map((x) => x.q));
  }
  const deck = shuffle(picked).slice(0, count);
  if (deck.length < count) {
    const have = new Set(deck.map((q) => q.id));
    deck.push(...shuffle(pool.filter((q) => !have.has(q.id))).slice(0, count - deck.length));
  }
  return deck;
}

function isAnswerCorrect(q: Question, value: string | undefined): boolean {
  if (!value) return false;
  return isNumeric(q) ? checkNumeric(value, q) : value === q.correct;
}

type Phase = "setup" | "exam" | "review";

export function MockExamPage() {
  const { courseId = "" } = useParams();
  const { course, loading } = useCourse(courseId);

  if (loading)
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-bg)] text-sm text-[var(--color-faint)]">
        Preparing the exam hall…
      </div>
    );
  if (!course) return <NotFound />;
  return <MockExam key={courseId} course={course} courseId={courseId} />;
}

function MockExam({ course, courseId }: { course: Course; courseId: string }) {
  const navigate = useNavigate();
  const resumable = useMemo(() => {
    const snap = readSnapshot(courseId);
    if (!snap || snap.deadline <= Date.now()) return null;
    const byId = new Map(course.practice.map((q) => [q.id, q]));
    return snap.ids.every((id) => byId.has(id)) ? snap : null;
  }, [course, courseId]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [deck, setDeck] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [i, setI] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const submittedRef = useRef(false);

  const q = deck[i];
  const remaining = Math.max(0, deadline - now);

  function start(count: number, resume?: MockSnapshot) {
    const byId = new Map(course.practice.map((qq) => [qq.id, qq]));
    if (resume) {
      setDeck(resume.ids.map((id) => byId.get(id)!));
      setAnswers(resume.answers);
      setFlagged(new Set(resume.flagged));
      setDeadline(resume.deadline);
      setStartedAt(resume.startedAt);
    } else {
      const fresh = buildMockDeck(course, Math.min(count, course.practice.length));
      const startTs = Date.now();
      setDeck(fresh);
      setAnswers({});
      setFlagged(new Set());
      setStartedAt(startTs);
      setDeadline(startTs + fresh.length * SEC_PER_QUESTION * 1000);
    }
    setI(0);
    submittedRef.current = false;
    setPhase("exam");
  }

  // countdown from the deadline timestamp — correct even when backgrounded
  useEffect(() => {
    if (phase !== "exam") return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [phase]);

  // snapshot so an accidental close resumes
  useEffect(() => {
    if (phase !== "exam" || !deck.length) return;
    writeSnapshot(courseId, {
      ids: deck.map((qq) => qq.id),
      answers,
      flagged: [...flagged],
      deadline,
      startedAt,
    });
  }, [phase, deck, answers, flagged, deadline, startedAt, courseId]);

  // auto-submit at 0:00
  useEffect(() => {
    if (phase === "exam" && deadline > 0 && remaining === 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining, deadline]);

  const results = useMemo(() => {
    if (phase !== "review") return null;
    const byTopic: Record<string, { correct: number; total: number }> = {};
    let correct = 0;
    for (const qq of deck) {
      const topic = qq.topic ?? "General";
      const t = (byTopic[topic] ??= { correct: 0, total: 0 });
      t.total += 1;
      if (isAnswerCorrect(qq, answers[qq.id])) {
        t.correct += 1;
        correct += 1;
      }
    }
    const pct = deck.length ? correct / deck.length : 0;
    return { correct, pct, grade: gradeFromScore(pct * 100), byTopic };
  }, [phase, deck, answers]);

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // every question feeds the SRS — unanswered counts as wrong (it's an exam)
    let correct = 0;
    const byTopic: Record<string, { correct: number; total: number }> = {};
    for (const qq of deck) {
      const ok = isAnswerCorrect(qq, answers[qq.id]);
      recordAnswer(courseId, qq.id, ok);
      const t = (byTopic[qq.topic ?? "General"] ??= { correct: 0, total: 0 });
      t.total += 1;
      if (ok) {
        t.correct += 1;
        correct += 1;
      }
    }
    const pct = deck.length ? correct / deck.length : 0;
    const grade = gradeFromScore(pct * 100);
    logMockExam(courseId, {
      at: Date.now(),
      grade,
      pct,
      byTopic,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      questionCount: deck.length,
    });
    clearSnapshot(courseId);
    if (grade >= 24) {
      sfx.victory();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        fireConfetti({ count: grade >= 28 ? 220 : 120 });
      }
    }
    setPhase("review");
  }

  const mmss = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  /* ============================ SETUP ============================ */
  if (phase === "setup") {
    return (
      <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-bg)]">
          <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center p-6">
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-faint)]">
              {course.meta.short} · mock exam
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Exam conditions. No mercy.</h1>
            <p className="mt-2 text-[var(--color-muted)]">
              One timer for the whole paper, no feedback until the end, auto-graded 18–30L. Wrong and
              blank answers feed your review queue.
            </p>

            {resumable && (
              <button
                onClick={() => start(0, resumable)}
                className="card-hover surface mt-6 flex items-center gap-3 p-4 text-left"
                style={{ borderColor: "var(--accent-line)" }}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-white"
                  style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
                >
                  <Icon name="Play" size={20} />
                </span>
                <span>
                  <span className="block font-semibold">Resume the exam in progress</span>
                  <span className="block text-xs text-[var(--color-faint)]">
                    {Object.keys(resumable.answers).length}/{resumable.ids.length} answered ·{" "}
                    {mmss(resumable.deadline - Date.now())} left
                  </span>
                </span>
              </button>
            )}

            <div className="mt-6 grid gap-3">
              {LENGTHS.filter((n) => course.practice.length >= Math.min(n, 10)).map((n) => {
                const count = Math.min(n, course.practice.length);
                return (
                  <button
                    key={n}
                    onClick={() => start(count)}
                    className="card-hover surface flex items-center justify-between p-4 text-left"
                  >
                    <span>
                      <span className="block font-bold">{count} questions</span>
                      <span className="block text-xs text-[var(--color-faint)]">
                        {mmss(count * SEC_PER_QUESTION * 1000)} · all topics, weighted to medium/hard
                      </span>
                    </span>
                    <Icon name="ArrowRight" size={18} className="text-[var(--color-faint)]" />
                  </button>
                );
              })}
            </div>

            <Link to={`/c/${courseId}/exams`} className="btn btn-ghost mt-6 self-start">
              <Icon name="ArrowLeft" size={16} /> Back to worked exams
            </Link>
          </div>
        </div>
      </CourseTheme>
    );
  }

  /* ============================ REVIEW ============================ */
  if (phase === "review" && results) {
    const weakest = Object.entries(results.byTopic)
      .filter(([, t]) => t.total >= 2)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
      .slice(0, 2);
    return (
      <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-bg)]">
          <div className="mx-auto max-w-2xl p-5 pb-16">
            <div className="surface p-6 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-faint)]">
                {course.meta.short} · mock result
              </div>
              <div
                className="mt-3 text-6xl font-black"
                style={{ color: results.grade >= 18 ? "var(--good)" : "var(--bad)" }}
              >
                {results.grade >= 31 ? "30 e lode" : results.grade < 18 ? "<18" : results.grade}
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {results.correct}/{deck.length} correct · {Math.round(results.pct * 100)}%
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button onClick={() => setPhase("setup")} className="btn btn-primary">
                  <Icon name="RotateCcw" size={16} /> Another mock
                </button>
                <button onClick={() => navigate(`/c/${courseId}`)} className="btn btn-ghost">
                  <Icon name="ArrowLeft" size={16} /> Course
                </button>
              </div>
            </div>

            {/* per-topic breakdown */}
            <div className="surface mt-4 p-5">
              <div className="mb-3 text-sm font-bold">By topic</div>
              <div className="grid gap-2">
                {Object.entries(results.byTopic).map(([topic, t]) => {
                  const p = t.correct / t.total;
                  return (
                    <div key={topic} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 truncate sm:w-56">{topic}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p * 100}%`,
                            background: p >= 0.75 ? "var(--good)" : p >= 0.5 ? "var(--warn)" : "var(--bad)",
                          }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right font-mono text-xs">
                        {t.correct}/{t.total}
                      </span>
                    </div>
                  );
                })}
              </div>
              {weakest.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {weakest.map(([topic]) => (
                    <Link
                      key={topic}
                      to={`/c/${courseId}/practice?topic=${encodeURIComponent(topic)}`}
                      className="btn btn-ghost !py-2 !text-xs"
                    >
                      <Icon name="Dumbbell" size={14} /> Drill {topic}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* full paper with explanations */}
            <div className="mt-4 grid gap-3">
              {deck.map((qq, idx) => {
                const given = answers[qq.id];
                const ok = isAnswerCorrect(qq, given);
                return (
                  <div key={qq.id} className="surface p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold">
                      <span
                        className="grid h-6 w-6 place-items-center rounded-full text-[11px] text-white"
                        style={{ background: ok ? "var(--good)" : "var(--bad)" }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-[var(--color-faint)]">{qq.topic}</span>
                    </div>
                    <div className="prose-lesson mb-2 !text-[0.98rem] font-medium !text-[var(--color-ink)]">
                      {rt(qq.prompt)}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold" style={{ color: ok ? "var(--good)" : "var(--bad)" }}>
                        {given ? `Your answer: ${given}` : "Not answered"}
                      </span>
                      {!ok && (
                        <span className="ml-2 font-semibold text-[var(--color-muted)]">
                          → correct:{" "}
                          {isNumeric(qq) ? `${qq.answer}${qq.unit ? ` ${qq.unit}` : ""}` : qq.correct}
                        </span>
                      )}
                    </div>
                    <div className="prose-lesson mt-2 rounded-xl bg-[var(--color-bg)] p-3 !text-[0.9rem]">
                      {rt(qq.explanation)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CourseTheme>
    );
  }

  /* ============================ EXAM ============================ */
  if (!q) return null;
  const numeric = isNumeric(q);
  const chosen = answers[q.id];

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]">
        {/* header: timer + submit */}
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-2.5">
          <button
            onClick={() => navigate(`/c/${courseId}/exams`)}
            className="btn btn-ghost !px-3 !py-1.5 !text-xs"
            title="Leave — the exam stays resumable until the timer runs out"
          >
            <Icon name="DoorOpen" size={14} />
          </button>
          <span
            className={cn(
              "ml-auto font-mono text-lg font-bold",
              remaining < 60_000 ? "animate-pulse text-[var(--bad)]" : "text-[var(--color-ink)]"
            )}
          >
            {mmss(remaining)}
          </span>
          <button onClick={submit} className="btn btn-primary !px-4 !py-1.5 !text-xs">
            Submit
          </button>
        </div>

        {/* palette */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-[var(--color-line)] px-4 py-2">
          {deck.map((qq, idx) => (
            <button
              key={qq.id}
              onClick={() => setI(idx)}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition",
                idx === i && "ring-2 ring-[var(--accent)]",
                answers[qq.id]
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)]",
                flagged.has(qq.id) && "ring-2 ring-[var(--warn)]"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* question */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[var(--color-faint)]">
              Question {i + 1}/{deck.length}
              <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5">{q.difficulty}</span>
              <button
                onClick={() =>
                  setFlagged((prev) => {
                    const next = new Set(prev);
                    if (next.has(q.id)) next.delete(q.id);
                    else next.add(q.id);
                    return next;
                  })
                }
                className={cn(
                  "ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                  flagged.has(q.id)
                    ? "bg-[var(--warn-bg)] text-[var(--warn)]"
                    : "bg-[var(--color-surface)] text-[var(--color-faint)]"
                )}
              >
                <Icon name="Flag" size={12} /> {flagged.has(q.id) ? "Flagged" : "Flag"}
              </button>
            </div>

            <div className="prose-lesson mb-4 !text-[1.05rem] font-medium !text-[var(--color-ink)]">
              {rt(q.prompt)}
            </div>

            {q.visual?.type === "image" && (
              <figure className="mb-4 rounded-xl border border-[var(--color-line)] bg-white p-3">
                <img src={q.visual.src} alt={q.visual.alt} className="mx-auto max-h-[300px] w-full max-w-xl object-contain" />
              </figure>
            )}

            {numeric ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  inputMode="decimal"
                  enterKeyHint="next"
                  value={chosen ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder={q.placeholder ?? "your result"}
                  className="w-44 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 font-mono outline-none focus:border-[var(--accent)]"
                />
                {q.unit && <span className="font-semibold text-[var(--color-muted)]">{q.unit}</span>}
              </div>
            ) : (
              <div className="grid gap-2.5">
                {q.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.id }))}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                      chosen === o.id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--color-line)] hover:border-[var(--accent-line)]"
                    )}
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--color-bg)] font-mono text-xs font-bold text-[var(--color-faint)]">
                      {o.id}
                    </span>
                    <span className="flex-1 pt-0.5">{rtInline(o.content)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer nav */}
        <div
          className="flex items-center justify-between border-t border-[var(--color-line)] px-4 py-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} className="btn btn-ghost disabled:opacity-40">
            <Icon name="ArrowLeft" size={16} /> Prev
          </button>
          <span className="text-xs text-[var(--color-faint)]">
            {Object.keys(answers).length}/{deck.length} answered
          </span>
          {i < deck.length - 1 ? (
            <button onClick={() => setI((n) => Math.min(deck.length - 1, n + 1))} className="btn btn-primary">
              Next <Icon name="ArrowRight" size={16} />
            </button>
          ) : (
            <button onClick={submit} className="btn btn-primary">
              Finish <Icon name="Check" size={16} />
            </button>
          )}
        </div>
      </div>
    </CourseTheme>
  );
}
