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
 *  MOCK EXAM — the timed, auto-graded simulator.
 *  For the focus courses it replicates the REAL paper (from past
 *  exams in the course material): question mix, duration, points and
 *  penalty rules. One countdown, no feedback until submit, flag-for-
 *  review, auto-submit at 0:00, answers editable until the end, and a
 *  slot-machine grade reveal at the finish. Results feed the SRS.
 * ================================================================== */

const SEC_PER_QUESTION = 120;
const LENGTHS = [15, 25, 35];

/* ------------------------- exam blueprints ------------------------- *
 * Sources: real papers in course_material —
 *  MA2: "Appello 1" paper = 7 MCQ + 1 open problem worth 9 pts (open
 *       problem simulated here as 3 numeric parts, 3 pts each).
 *  LAG: June/July 2025 papers = 8 MCQ + 1 open exercise, 60 min
 *       (exercise simulated as 4 hard "exercise part" questions).
 *  Thermo: quiz sheet rule "correct 1 pt · blank 0 · wrong −0.25" +
 *       written-test numeric problems (the recurring 2025 set).      */

interface ExamBlueprint {
  detail: string;
  durationMin: number;
  quizCount: number;
  quizPoints: number;
  /** subtracted per wrong quiz answer (blanks score 0) */
  quizPenalty: number;
  problemCount: number;
  problemPoints: number;
  /** prefer numeric questions for the problem section */
  problemNumeric: boolean;
  /** what the real quizzes look like: computational exercises vs theory MCQs */
  quizStyle: "exercise" | "theory";
  /** how the real paper names its open problem */
  problemLabel: string;
  maxPoints: number;
  note: string;
}

const BLUEPRINTS: Record<string, ExamBlueprint> = {
  "math-analysis-2": {
    detail: "7 quiz + the open problem as 3 numeric parts · 9 pts, like Appello 1",
    durationMin: 120,
    quizCount: 7,
    quizPoints: 3,
    quizPenalty: 0,
    problemCount: 3,
    problemPoints: 3,
    problemNumeric: true,
    quizStyle: "exercise", // the real MA2 quizzes are computed results, not recall
    problemLabel: "Exercise 8 (9 points)",
    maxPoints: 30,
    note: "Mirrors the real paper: 7 single-answer quizzes, then the 9-point open problem (here: numeric parts).",
  },
  "linear-algebra": {
    detail: "8 quiz + 4 exercise parts · 60 min, like the June/July 2025 papers",
    durationMin: 60,
    quizCount: 8,
    quizPoints: 2.5,
    quizPenalty: 0,
    problemCount: 4,
    problemPoints: 2.5,
    problemNumeric: false, // LAG bank is MCQ — hard cards stand in for the exercise
    quizStyle: "exercise", // real LAG quizzes ask for computed results too
    problemLabel: "Exercise (open)",
    maxPoints: 30,
    note: "Mirrors the real 60-minute paper: 8 quizzes plus the open exercise (here: 4 hard exercise-style parts).",
  },
  thermodynamics: {
    detail: "10 quiz (wrong = −0.25!) + 4 written-test problems · 90 min",
    durationMin: 90,
    quizCount: 10,
    quizPoints: 1,
    quizPenalty: 0.25,
    problemCount: 4,
    problemPoints: 5,
    problemNumeric: true,
    quizStyle: "theory", // the real thermo quiz pools are concept MCQs
    problemLabel: "Written-test problems",
    maxPoints: 30,
    note: "Quiz rules straight from the real sheet: correct 1 pt, blank 0, wrong −0.25. Leave a quiz blank if you'd only guess.",
  },
};

interface DeckItem {
  q: Question;
  section: "quiz" | "problem";
  points: number;
  penalty: number;
}

interface MockSnapshot {
  ids: string[];
  sections: ("quiz" | "problem")[];
  official: boolean;
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

function topicFocusPool(course: Course): Question[] {
  const focusT = readGame().settings.focusTopics?.[course.meta.id];
  const focused = focusT?.length
    ? course.practice.filter((q) => q.topic && focusT.includes(q.topic))
    : course.practice;
  return focused.length >= 10 ? focused : course.practice;
}

/** stratified draw: proportional per topic, slightly biased to medium/hard */
function stratified(pool: Question[], count: number): Question[] {
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

/** generic (custom-length) paper: uniform 1-pt questions */
function buildGenericDeck(course: Course, count: number): DeckItem[] {
  return stratified(topicFocusPool(course), Math.min(count, course.practice.length)).map((q) => ({
    q,
    section: "quiz",
    points: 1,
    penalty: 0,
  }));
}

/** does this MCQ look like the real paper's quizzes — a computed result
 *  (numeric options / "compute…", "closest to…") vs a recall question? */
function isExerciseStyle(q: Question): boolean {
  if (isNumeric(q)) return true;
  const prompt = typeof q.prompt === "string" ? q.prompt : "";
  const computey =
    /(compute|closest to|evaluate|equal(s| to)?|the value|find|determine|calculate|result is|is worth|how (much|many))/i.test(
      prompt
    );
  const numericOptions =
    q.options.filter((o) => typeof o.content === "string" && /^\s*\$?\s*[-\d(]/.test(o.content)).length >= 3;
  return computey || numericOptions;
}

function examGroup(q: Question): string | undefined {
  return q.tags?.find((tag) => tag.startsWith("exam-group:"));
}

/** the official paper for this course, per its blueprint */
function buildOfficialDeck(course: Course, bp: ExamBlueprint): DeckItem[] {
  // A focus-topic setting is useful for drills, but an official simulation
  // must still sample the whole syllabus or it no longer mirrors the paper.
  // "(extra)" topics (e.g. MA2 ODEs) are not on the real syllabus — keep them
  // out of official papers
  const pool = course.practice.filter(
    (q) => !/\(extra\)/.test(q.topic ?? "") && !(q.tags ?? []).includes("supplement")
  );
  const mcq = pool.filter((q) => !isNumeric(q));
  const numeric = pool.filter(isNumeric);

  // REAL past-exam questions first, then match the paper's quiz TYPE
  // (computational exercises for MA2/LAG, concept MCQs for thermo)
  const isReal = (q: Question) =>
    (q.tags ?? []).includes("past-exam") ||
    /exam|appello|simulation|book1/i.test(q.source ?? "");
  const real = mcq.filter(isReal);
  const styled = mcq.filter(
    (q) => !isReal(q) && (bp.quizStyle === "exercise" ? isExerciseStyle(q) : !isExerciseStyle(q))
  );
  const quizPicks = [
    ...stratified(real, Math.min(real.length, bp.quizCount)),
    ...stratified(styled.length ? styled : mcq.filter((q) => !isReal(q)), bp.quizCount),
  ].slice(0, bp.quizCount);
  const quiz = quizPicks.map<DeckItem>((q) => ({
    q,
    section: "quiz",
    points: bp.quizPoints,
    penalty: bp.quizPenalty,
  }));

  let problemPool: Question[];
  const groupedProblems = new Map<string, Question[]>();
  for (const q of numeric) {
    const group = examGroup(q);
    if (!group) continue;
    const items = groupedProblems.get(group) ?? [];
    items.push(q);
    groupedProblems.set(group, items);
  }
  const completeGroups = [...groupedProblems.values()].filter((items) => items.length >= bp.problemCount);
  const wt = numeric.filter((q) => (q.tags ?? []).includes("wt25"));
  if (bp.problemNumeric && completeGroups.length) {
    // Keep the open problem coherent: all parts come from one real paper.
    problemPool = shuffle(completeGroups)[0].slice(0, bp.problemCount);
  } else if (bp.problemNumeric && wt.length >= bp.problemCount) {
    // the professor's recurring written-test set IS the problem section
    problemPool = shuffle(wt).slice(0, bp.problemCount);
  } else if (bp.problemNumeric && numeric.length >= bp.problemCount) {
    problemPool = shuffle(numeric).slice(0, bp.problemCount);
  } else {
    // exercise parts stood in by hard cards not already in the quiz
    const used = new Set(quiz.map((it) => it.q.id));
    const hard = mcq.filter((q) => !used.has(q.id));
    hard.sort((a, b) => (b.difficulty === "hard" ? 1 : 0) - (a.difficulty === "hard" ? 1 : 0));
    problemPool = shuffle(hard.slice(0, bp.problemCount * 3)).slice(0, bp.problemCount);
  }
  const problems = problemPool.map<DeckItem>((q) => ({
    q,
    section: "problem",
    points: bp.problemPoints,
    penalty: 0,
  }));

  return [...quiz, ...problems]; // quiz first, then the problem block — like the paper
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
  const blueprint = BLUEPRINTS[courseId];

  const resumable = useMemo(() => {
    const snap = readSnapshot(courseId);
    if (!snap || snap.deadline <= Date.now()) return null;
    const byId = new Map(course.practice.map((q) => [q.id, q]));
    return snap.ids.every((id) => byId.has(id)) ? snap : null;
  }, [course, courseId]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [official, setOfficial] = useState(false);
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [i, setI] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [revealed, setRevealed] = useState(false);
  const submittedRef = useRef(false);

  const item = deck[i];
  const q = item?.q;
  const remaining = Math.max(0, deadline - now);
  const maxPoints = official && blueprint ? blueprint.maxPoints : deck.length;

  function start(mode: "official" | number, resume?: MockSnapshot) {
    const byId = new Map(course.practice.map((qq) => [qq.id, qq]));
    if (resume) {
      const bp = resume.official ? blueprint : undefined;
      setDeck(
        resume.ids.map((id, k) => {
          const section = resume.sections[k] ?? "quiz";
          return {
            q: byId.get(id)!,
            section,
            points: bp ? (section === "quiz" ? bp.quizPoints : bp.problemPoints) : 1,
            penalty: bp && section === "quiz" ? bp.quizPenalty : 0,
          };
        })
      );
      setOfficial(resume.official);
      setAnswers(resume.answers);
      setFlagged(new Set(resume.flagged));
      setDeadline(resume.deadline);
      setStartedAt(resume.startedAt);
    } else {
      const startTs = Date.now();
      let fresh: DeckItem[];
      if (mode === "official" && blueprint) {
        fresh = buildOfficialDeck(course, blueprint);
        setDeadline(startTs + blueprint.durationMin * 60_000);
        setOfficial(true);
      } else {
        const count = typeof mode === "number" ? Math.min(mode, course.practice.length) : 15;
        fresh = buildGenericDeck(course, count);
        setDeadline(startTs + fresh.length * SEC_PER_QUESTION * 1000);
        setOfficial(false);
      }
      setDeck(fresh);
      setAnswers({});
      setFlagged(new Set());
      setStartedAt(startTs);
    }
    setI(0);
    setRevealed(false);
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
      ids: deck.map((it) => it.q.id),
      sections: deck.map((it) => it.section),
      official,
      answers,
      flagged: [...flagged],
      deadline,
      startedAt,
    });
  }, [phase, deck, official, answers, flagged, deadline, startedAt, courseId]);

  // auto-submit at 0:00
  useEffect(() => {
    if (phase === "exam" && deadline > 0 && remaining === 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining, deadline]);

  const results = useMemo(() => {
    if (phase !== "review") return null;
    const byTopic: Record<string, { correct: number; total: number }> = {};
    let correct = 0;
    let points = 0;
    for (const it of deck) {
      const topic = it.q.topic ?? "General";
      const t = (byTopic[topic] ??= { correct: 0, total: 0 });
      t.total += 1;
      const given = answers[it.q.id];
      if (isAnswerCorrect(it.q, given)) {
        t.correct += 1;
        correct += 1;
        points += it.points;
      } else if (given) {
        points -= it.penalty; // the real sheet's negative marking
      }
    }
    points = Math.max(0, points);
    const pct = maxPoints ? points / maxPoints : 0;
    const flawless = correct === deck.length && deck.length > 0;
    // official papers grade in points out of 30 — exactly like the exam
    const grade =
      official && blueprint
        ? flawless && points >= blueprint.maxPoints
          ? 31
          : Math.min(30, Math.round(points))
        : gradeFromScore(pct * 100);
    return { correct, points, pct, grade, byTopic };
  }, [phase, deck, answers, official, blueprint, maxPoints]);

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // every question feeds the SRS — unanswered counts as wrong (it's an exam)
    const byTopic: Record<string, { correct: number; total: number }> = {};
    let correct = 0;
    let points = 0;
    for (const it of deck) {
      const ok = isAnswerCorrect(it.q, answers[it.q.id]);
      recordAnswer(courseId, it.q.id, ok);
      const t = (byTopic[it.q.topic ?? "General"] ??= { correct: 0, total: 0 });
      t.total += 1;
      if (ok) {
        t.correct += 1;
        correct += 1;
        points += it.points;
      } else if (answers[it.q.id]) {
        points -= it.penalty;
      }
    }
    points = Math.max(0, points);
    const pct = maxPoints ? points / maxPoints : 0;
    const flawless = correct === deck.length && deck.length > 0;
    const grade =
      official && blueprint
        ? flawless && points >= blueprint.maxPoints
          ? 31
          : Math.min(30, Math.round(points))
        : gradeFromScore(pct * 100);
    logMockExam(courseId, {
      at: Date.now(),
      grade,
      pct,
      byTopic,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      questionCount: deck.length,
    });
    clearSnapshot(courseId);
    setRevealed(false);
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
              One timer, no feedback until the end, auto-graded like the real thing. Wrong and blank
              answers feed your review queue.
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

            {blueprint && (
              <button
                onClick={() => start("official")}
                className="card-hover mt-6 flex items-start gap-3 rounded-2xl border-2 p-4 text-left"
                style={{ borderColor: "var(--accent)", background: "var(--accent-soft)" }}
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                  style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
                >
                  <Icon name="FileCheck" size={22} />
                </span>
                <span className="min-w-0">
                  <span className="pixel-font block text-xl uppercase leading-none">
                    Official format
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{blueprint.detail}</span>
                  <span className="mt-1 block text-xs text-[var(--color-muted)]">{blueprint.note}</span>
                </span>
              </button>
            )}

            {courseId === "thermodynamics" && (
              <Link
                to={`/c/${courseId}/exams`}
                className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-xs font-semibold text-[var(--color-muted)]"
              >
                <Icon name="Star" size={14} style={{ color: "#f5b942" }} />
                The ⭐ written-test problems on the Exams tab are the recurring set — drill them before
                sitting this.
                <Icon name="ArrowRight" size={13} className="ml-auto shrink-0" />
              </Link>
            )}

            <div className="mt-5 text-xs font-bold uppercase tracking-wider text-[var(--color-faint)]">
              Custom length
            </div>
            <div className="mt-2 grid gap-3">
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
    if (!revealed) {
      return (
        <GradeReveal
          grade={results.grade}
          official={official}
          points={results.points}
          maxPoints={maxPoints}
          onDone={() => setRevealed(true)}
        />
      );
    }
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
                {course.meta.short} · {official ? "official format" : "mock"} result
              </div>
              <div
                className="mt-3 text-6xl font-black"
                style={{ color: results.grade >= 18 ? "var(--good)" : "var(--bad)" }}
              >
                {results.grade >= 31 ? "30 e lode" : results.grade < 18 ? "<18" : results.grade}
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {official
                  ? `${results.points.toFixed(2).replace(/\.?0+$/, "")}/${maxPoints} points · `
                  : ""}
                {results.correct}/{deck.length} correct
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
              <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
                {Object.entries(results.byTopic).map(([topic, t]) => {
                  const p = t.correct / t.total;
                  return (
                    <div key={topic} className="flex items-center gap-3 text-sm">
                      <span className="w-36 shrink-0 truncate sm:w-56">{topic}</span>
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
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
              {deck.map((it, idx) => {
                const given = answers[it.q.id];
                const ok = isAnswerCorrect(it.q, given);
                return (
                  <div key={it.q.id} className="surface p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold">
                      <span
                        className="grid h-6 w-6 place-items-center rounded-full text-[11px] text-white"
                        style={{ background: ok ? "var(--good)" : "var(--bad)" }}
                      >
                        {idx + 1}
                      </span>
                      {official && (
                        <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[10px] uppercase text-[var(--color-faint)]">
                          {it.section} · {ok ? `+${it.points}` : given && it.penalty ? `−${it.penalty}` : "0"} pts
                        </span>
                      )}
                      <span className="truncate text-[var(--color-faint)]">{it.q.topic}</span>
                    </div>
                    <div className="prose-lesson mb-2 !text-[0.98rem] font-medium !text-[var(--color-ink)]">
                      {rt(it.q.prompt)}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold" style={{ color: ok ? "var(--good)" : "var(--bad)" }}>
                        {given ? `Your answer: ${given}` : "Not answered"}
                      </span>
                      {!ok && (
                        <span className="ml-2 font-semibold text-[var(--color-muted)]">
                          → correct:{" "}
                          {isNumeric(it.q) ? `${it.q.answer}${it.q.unit ? ` ${it.q.unit}` : ""}` : it.q.correct}
                        </span>
                      )}
                    </div>
                    <div className="prose-lesson mt-2 rounded-xl bg-[var(--color-bg)] p-3 !text-[0.9rem]">
                      {rt(it.q.explanation)}
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
  if (!q || !item) return null;
  const numeric = isNumeric(q);
  const chosen = answers[q.id];
  const problemStart = deck.findIndex((it) => it.section === "problem");

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
          {official && (
            <span className="pixel-font hidden text-base uppercase leading-none text-[var(--color-faint)] sm:block">
              Official format
            </span>
          )}
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
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-[var(--color-line)] px-4 py-2">
          {deck.map((it, idx) => (
            <span key={it.q.id} className="flex shrink-0 items-center">
              {official && idx === problemStart && (
                <span className="pixel-font mx-1.5 shrink-0 text-sm uppercase leading-none text-[var(--color-faint)]">
                  · problem ·
                </span>
              )}
              <button
                onClick={() => setI(idx)}
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition",
                  idx === i && "ring-2 ring-[var(--accent)]",
                  answers[it.q.id]
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-muted)]",
                  flagged.has(it.q.id) && "ring-2 ring-[var(--warn)]"
                )}
              >
                {idx + 1}
              </button>
            </span>
          ))}
        </div>

        {/* question */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[var(--color-faint)]">
              {official ? (
                <>
                  {item.section === "quiz"
                    ? `Quiz ${i + 1}/${blueprint?.quizCount ?? deck.length}`
                    : `${blueprint?.problemLabel ?? "Problem"} — part ${String.fromCharCode(
                        97 + Math.max(0, i - (blueprint?.quizCount ?? 0))
                      )})`}
                  <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5">
                    {item.points} pt{item.points !== 1 ? "s" : ""}
                    {item.penalty > 0 && <span style={{ color: "var(--bad)" }}> · wrong −{item.penalty}</span>}
                  </span>
                </>
              ) : (
                <>
                  Question {i + 1}/{deck.length}
                  <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5">{q.difficulty}</span>
                </>
              )}
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
              <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
                {q.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() =>
                      setAnswers((prev) => {
                        // real papers let you erase: tap the chosen answer to blank it
                        const next = { ...prev };
                        if (next[q.id] === o.id) delete next[q.id];
                        else next[q.id] = o.id;
                        return next;
                      })
                    }
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

            {official && item.penalty > 0 && !chosen && (
              <p className="mt-3 text-xs font-semibold text-[var(--color-faint)]">
                Blank scores 0 — only answer if you're better than a coin flip.
              </p>
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

/* ------------------------- grade reveal ---------------------------- *
 * Slot-machine anticipation: numbers roll, drums in your chest, then
 * the real grade slams in — confetti for a pass, silence for the rest. */

function GradeReveal({
  grade,
  official,
  points,
  maxPoints,
  onDone,
}: {
  grade: number;
  official: boolean;
  points: number;
  maxPoints: number;
  onDone: () => void;
}) {
  const [shown, setShown] = useState<number>(18);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(grade);
      setLanded(true);
      const t = window.setTimeout(onDone, 900);
      return () => window.clearTimeout(t);
    }
    const start = Date.now();
    const spin = window.setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed > 2300) {
        window.clearInterval(spin);
        setShown(grade);
        setLanded(true);
        if (grade >= 18) {
          sfx.victory();
          fireConfetti({ count: grade >= 28 ? 240 : 140, originY: 0.4 });
        } else {
          sfx.defeat();
        }
        window.setTimeout(onDone, 1600);
      } else {
        setShown(15 + Math.floor(Math.random() * 16));
      }
    }, 90);
    return () => {
      window.clearInterval(spin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0b0f20]">
      <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="relative text-center">
        <div className="pixel-font text-2xl uppercase tracking-[0.3em] text-white/50">
          {landed ? "Your grade" : "Grading…"}
        </div>
        <div
          className="pixel-font mt-4 text-[7rem] leading-none sm:text-[10rem]"
          style={{
            color: !landed ? "#ffd45e" : grade >= 18 ? "#7fdc39" : "#ff5555",
            textShadow: landed ? "0 0 40px currentColor" : "3px 3px 0 #000",
            transform: landed ? "scale(1.06)" : undefined,
            transition: "transform 0.25s cubic-bezier(0.2, 1.6, 0.4, 1)",
          }}
        >
          {landed && grade >= 31 ? "30L" : landed && grade < 18 ? "<18" : shown}
        </div>
        {landed && official && (
          <div className="pixel-font mt-3 text-xl text-white/60">
            {points.toFixed(2).replace(/\.?0+$/, "")}/{maxPoints} points
          </div>
        )}
      </div>
    </div>
  );
}
