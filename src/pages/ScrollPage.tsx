import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { TopBar, Page } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { rt, rtInline } from "../components/RichText";
import { Pill } from "../components/ui";
import { getCourse } from "../courses/registry";
import { recordAnswer, useCourseProgress } from "../lib/progress";
import { dueCount } from "../lib/adaptive";
import { TexBlock } from "../lib/math";
import { cn } from "../lib/cn";
import type { Lesson, LessonBlock, Question } from "../types";
import { NotFound } from "./NotFound";

type FeedItem =
  | { id: string; kind: "lesson"; lesson: Lesson; index: number }
  | { id: string; kind: "map"; lesson: Lesson; title: string; text: string }
  | { id: string; kind: "steps"; lesson: Lesson; title: string; steps: { label?: string; content: ReactNode }[] }
  | { id: string; kind: "formula"; lesson: Lesson; title: string; tex: string; caption?: ReactNode }
  | { id: string; kind: "callout"; lesson: Lesson; tone: string; title: string; text: ReactNode }
  | { id: string; kind: "example"; lesson: Lesson; title?: string; text: ReactNode }
  | { id: string; kind: "question"; lesson: Lesson; question: Question }
  | { id: string; kind: "finish"; totalLessons: number };

const MAX_FORMULAS_PER_LESSON = 3;
const MAX_CALLOUTS_PER_LESSON = 2;
const MAX_EXAMPLES_PER_LESSON = 1;
const MAX_QUESTIONS_PER_LESSON = 2;

export function ScrollPage() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  const progress = useCourseProgress(courseId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"story" | "drill" | "formula">("story");

  const feed = useMemo(() => (course ? buildFeed(course.lessons, course.practice, mode) : []), [course, mode]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActive(0);
  }, [courseId, mode]);

  useEffect(() => {
    if (!feed.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const next = Number((best.target as HTMLElement).dataset.feedIndex ?? 0);
        setActive(next);
      },
      { threshold: [0.45, 0.6, 0.75] }
    );
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-feed-index]"));
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [feed.length]);

  if (!course) return <NotFound />;

  const current = feed[active];
  const lessonLabel = current && "lesson" in current ? current.lesson.title : course.meta.short;

  function choose(question: Question, optionId: string) {
    if (answers[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    recordAnswer(courseId, question.id, optionId === question.correct);
  }

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <TopBar crumbs={[{ label: course.meta.short, to: `/c/${courseId}` }, { label: "Scroll" }]}>
        <Link to={`/c/${courseId}/practice`} className="btn btn-ghost !py-2 !text-sm">
          <Icon name="Dumbbell" size={15} /> <span className="hidden sm:inline">Practice</span>
        </Link>
      </TopBar>

      <Page className="max-w-5xl pb-16">
        <div className="mb-4">
          <CourseNav courseId={courseId} due={dueCount(course.practice, progress)} />
        </div>

        <div className="sticky top-[72px] z-20 mb-4 rounded-2xl border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-2 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1 px-2">
              <div className="truncate text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                Scroll mode
              </div>
              <div className="truncate text-sm font-bold">{rtInline(lessonLabel)}</div>
            </div>
            <ModeButton active={mode === "story"} icon="Sparkles" label="Story" onClick={() => setMode("story")} />
            <ModeButton active={mode === "drill"} icon="CircleHelp" label="Drill" onClick={() => setMode("drill")} />
            <ModeButton active={mode === "formula"} icon="Sigma" label="Formula" onClick={() => setMode("formula")} />
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${feed.length ? ((active + 1) / feed.length) * 100 : 0}%`,
                background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
              }}
            />
          </div>
        </div>

        <section className="mx-auto max-w-3xl space-y-5 sm:space-y-7">
          {feed.map((item, index) => (
            <article
              key={item.id}
              data-feed-index={index}
              className="snap-center scroll-mt-28 rounded-[1.35rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-sm sm:min-h-[72svh] sm:p-7"
            >
              <FeedCard
                item={item}
                index={index}
                total={feed.length}
                picked={item.kind === "question" ? answers[item.question.id] : undefined}
                revealed={Boolean(revealed[item.id])}
                onPick={choose}
                onReveal={() => setRevealed((prev) => ({ ...prev, [item.id]: true }))}
              />
            </article>
          ))}
        </section>
      </Page>
    </CourseTheme>
  );
}

function buildFeed(lessons: Lesson[], practice: Question[], mode: "story" | "drill" | "formula"): FeedItem[] {
  const questionsByTopic = new Map<string, Question[]>();
  const topicOrder: string[] = [];
  for (const q of practice) {
    const key = q.topic ?? "";
    if (!questionsByTopic.has(key)) topicOrder.push(key);
    const list = questionsByTopic.get(key) ?? [];
    list.push(q);
    questionsByTopic.set(key, list);
  }

  const items: FeedItem[] = [];
  for (const [lessonIndex, lesson] of lessons.entries()) {
    const blocks = lesson.blocks;
    const mapBlock = blocks.find(
      (block) => block.kind === "callout" && block.title === "Plain-English map"
    ) as Extract<LessonBlock, { kind: "callout" }> | undefined;
    const recipeBlock = blocks.find(
      (block) => block.kind === "steps" && /recipe|route/i.test(block.title ?? "")
    ) as Extract<LessonBlock, { kind: "steps" }> | undefined;
    const formulas = blocks.filter((block) => block.kind === "formula") as Extract<LessonBlock, { kind: "formula" }>[];
    const callouts = blocks.filter(
      (block) => block.kind === "callout" && block.title !== "Plain-English map"
    ) as Extract<LessonBlock, { kind: "callout" }>[];
    const examples = blocks.filter((block) => block.kind === "example") as Extract<LessonBlock, { kind: "example" }>[];
    const checkpoints = blocks
      .filter((block) => block.kind === "checkpoint")
      .map((block) => (block as Extract<LessonBlock, { kind: "checkpoint" }>).question);
    const lessonTopic = topicOrder[lessonIndex] ?? "";
    const topicQuestions = questionsByTopic.get(lessonTopic) ?? [];
    const directQuestions = practice.filter((q) => q.topic === lesson.title || q.topic?.includes(lesson.title));
    const questionLimit = mode === "drill" ? 5 : MAX_QUESTIONS_PER_LESSON;
    const questions = dedupeQuestions([...checkpoints, ...directQuestions, ...topicQuestions]).slice(0, questionLimit);

    items.push({ id: `${lesson.id}:intro`, kind: "lesson", lesson, index: lessonIndex });

    if (mode !== "formula" && mapBlock && typeof mapBlock.content === "string") {
      items.push({ id: `${lesson.id}:map`, kind: "map", lesson, title: mapBlock.title ?? "Plain-English map", text: mapBlock.content });
    }
    if (mode === "story" && recipeBlock) {
      items.push({ id: `${lesson.id}:recipe`, kind: "steps", lesson, title: recipeBlock.title ?? "Exam recipe", steps: recipeBlock.steps });
    }

    if (mode !== "drill") {
      formulas.slice(0, mode === "formula" ? formulas.length : MAX_FORMULAS_PER_LESSON).forEach((formula, i) => {
        items.push({
          id: `${lesson.id}:formula:${i}`,
          kind: "formula",
          lesson,
          title: formula.tag ? `Formula ${formula.tag}` : "Formula to know",
          tex: formula.tex,
          caption: formula.caption,
        });
      });
    }

    if (mode === "story") {
      callouts.slice(0, MAX_CALLOUTS_PER_LESSON).forEach((callout, i) => {
        items.push({
          id: `${lesson.id}:callout:${i}`,
          kind: "callout",
          lesson,
          tone: callout.tone,
          title: callout.title ?? callout.tone,
          text: callout.content,
        });
      });
      examples.slice(0, MAX_EXAMPLES_PER_LESSON).forEach((example, i) => {
        items.push({ id: `${lesson.id}:example:${i}`, kind: "example", lesson, title: example.title, text: example.content });
      });
    }

    if (mode !== "formula") {
      questions.forEach((question, i) => {
        items.push({ id: `${lesson.id}:question:${i}`, kind: "question", lesson, question });
      });
    }
  }
  items.push({ id: "finish", kind: "finish", totalLessons: lessons.length });
  return items;
}

function dedupeQuestions(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition",
        active ? "text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
      )}
      style={active ? { background: "linear-gradient(180deg,var(--accent),var(--accent-2))" } : undefined}
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

function FeedCard({
  item,
  index,
  total,
  picked,
  revealed,
  onPick,
  onReveal,
}: {
  item: FeedItem;
  index: number;
  total: number;
  picked?: string;
  revealed: boolean;
  onPick: (question: Question, optionId: string) => void;
  onReveal: () => void;
}) {
  return (
    <div className="flex min-h-[inherit] flex-col">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Pill tone={item.kind === "question" ? "accent" : item.kind === "formula" ? "warn" : "neutral"}>
          <Icon name={kindIcon(item.kind)} size={13} /> {kindLabel(item.kind)}
        </Pill>
        <span className="font-mono text-xs text-[var(--color-faint)]">
          {index + 1}/{total}
        </span>
      </div>

      {item.kind === "lesson" && <LessonIntro item={item} />}
      {item.kind === "map" && <MapCard item={item} />}
      {item.kind === "steps" && <StepsCard item={item} />}
      {item.kind === "formula" && <FormulaCard item={item} revealed={revealed} onReveal={onReveal} />}
      {item.kind === "callout" && <CalloutCard item={item} />}
      {item.kind === "example" && <ExampleCard item={item} />}
      {item.kind === "question" && <QuestionScrollCard item={item} picked={picked} onPick={onPick} />}
      {item.kind === "finish" && <FinishCard item={item} />}
    </div>
  );
}

function LessonIntro({ item }: { item: Extract<FeedItem, { kind: "lesson" }> }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
        Lesson {item.index + 1}
      </div>
      <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{rtInline(item.lesson.title)}</h1>
      <div className="prose-lesson mt-5 text-lg text-[var(--color-muted)] sm:text-xl">{rt(item.lesson.summary)}</div>
      <div className="mt-6 grid gap-2">
        {item.lesson.objectives.slice(0, 3).map((objective, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-muted)]">
            <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <span>{rtInline(objective)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapCard({ item }: { item: Extract<FeedItem, { kind: "map" }> }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">{rtInline(item.lesson.title)}</div>
      <h2 className="text-3xl font-black tracking-tight">The idea</h2>
      <div className="prose-lesson mt-5 text-xl leading-relaxed">{rt(item.text)}</div>
    </div>
  );
}

function StepsCard({ item }: { item: Extract<FeedItem, { kind: "steps" }> }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title)}</h2>
      <div className="mt-6 grid gap-3">
        {item.steps.slice(0, 5).map((step, i) => (
          <div key={i} className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--accent-soft)]">{i + 1}</span>
              {step.label ? rtInline(step.label) : "Step"}
            </div>
            <div className="prose-lesson !text-[0.98rem] text-[var(--color-muted)]">{rt(step.content)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulaCard({
  item,
  revealed,
  onReveal,
}: {
  item: Extract<FeedItem, { kind: "formula" }>;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--warn)]">Closed book formula</div>
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title)}</h2>
      <div className="mt-4 rounded-2xl bg-[var(--warn-bg)] p-4 text-sm font-semibold text-[var(--warn)]">
        Try to recall it before revealing. In the real exam, there is no formula sheet.
      </div>
      {revealed ? (
        <div className="mt-6 rounded-2xl bg-[var(--color-bg)] p-4">
          <TexBlock>{item.tex}</TexBlock>
          {item.caption && <div className="prose-lesson mt-4 text-sm text-[var(--color-muted)]">{rt(item.caption)}</div>}
        </div>
      ) : (
        <button type="button" onClick={onReveal} className="btn btn-primary mt-6 w-full justify-center">
          <Icon name="Eye" size={16} /> Reveal formula
        </button>
      )}
    </div>
  );
}

function CalloutCard({ item }: { item: Extract<FeedItem, { kind: "callout" }> }) {
  const tone =
    item.tone === "trap" ? "var(--bad)" : item.tone === "warn" ? "var(--warn)" : item.tone === "key" ? "var(--accent)" : "var(--info)";
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: tone }}>
        {item.tone}
      </div>
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title)}</h2>
      <div className="prose-lesson mt-5 text-lg leading-relaxed">{rt(item.text)}</div>
    </div>
  );
}

function ExampleCard({ item }: { item: Extract<FeedItem, { kind: "example" }> }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Worked example</div>
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title ?? "Example")}</h2>
      <div className="prose-lesson mt-5 max-h-[55svh] overflow-y-auto pr-2 text-[1rem] leading-relaxed">{rt(item.text)}</div>
    </div>
  );
}

function QuestionScrollCard({
  item,
  picked,
  onPick,
}: {
  item: Extract<FeedItem, { kind: "question" }>;
  picked?: string;
  onPick: (question: Question, optionId: string) => void;
}) {
  const answered = Boolean(picked);
  const correct = picked === item.question.correct;

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-3 flex flex-wrap gap-2">
        <Pill tone="accent">Quick check</Pill>
        <Pill tone="neutral">{item.question.difficulty}</Pill>
      </div>
      <div className="prose-lesson text-xl font-bold leading-snug">{rt(item.question.prompt)}</div>
      <div className="mt-5 grid gap-2.5">
        {item.question.options.map((option) => {
          const isCorrect = option.id === item.question.correct;
          const show = answered && (option.id === picked || isCorrect);
          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => onPick(item.question, option.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                !answered && "border-[var(--color-line)] hover:border-[var(--accent-line)] hover:bg-[var(--color-bg)]",
                show && isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                show && !isCorrect && "border-rose-500/50 bg-rose-500/10",
                answered && !show && "border-[var(--color-line)] opacity-45"
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--color-bg)] font-mono text-xs font-bold text-[var(--color-faint)]">
                {option.id}
              </span>
              <span>{rtInline(option.content)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 rounded-2xl bg-[var(--color-bg)] p-4">
          <div
            className="mb-2 flex items-center gap-2 font-bold"
            style={{ color: correct ? "var(--good)" : "var(--bad)" }}
          >
            <Icon name={correct ? "CircleCheck" : "CircleX"} size={18} />
            {correct ? "Locked" : `Correct answer: ${item.question.correct}`}
          </div>
          <div className="prose-lesson text-sm text-[var(--color-muted)]">{rt(item.question.explanation)}</div>
          {item.question.theory && (
            <div className="prose-lesson mt-3 border-t border-[var(--color-line)] pt-3 text-sm">
              {rt(item.question.theory)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinishCard({ item }: { item: Extract<FeedItem, { kind: "finish" }> }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span
        className="grid h-16 w-16 place-items-center rounded-2xl text-white"
        style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
      >
        <Icon name="Flag" size={30} />
      </span>
      <h2 className="mt-5 text-3xl font-black tracking-tight">Feed complete</h2>
      <p className="mt-3 max-w-md text-[var(--color-muted)]">
        You skimmed {item.totalLessons} lessons. The formulas still need active recall, but your brain now has the map.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="../practice" relative="path" className="btn btn-primary">
          <Icon name="Dumbbell" size={16} /> Practice
        </Link>
        <Link to="../exams" relative="path" className="btn btn-ghost">
          <Icon name="FileText" size={16} /> Exam problems
        </Link>
      </div>
    </div>
  );
}

function kindIcon(kind: FeedItem["kind"]) {
  switch (kind) {
    case "lesson":
      return "BookOpen";
    case "map":
      return "Map";
    case "steps":
      return "ListChecks";
    case "formula":
      return "Sigma";
    case "callout":
      return "BadgeAlert";
    case "example":
      return "PencilLine";
    case "question":
      return "CircleHelp";
    case "finish":
      return "Flag";
  }
}

function kindLabel(kind: FeedItem["kind"]) {
  switch (kind) {
    case "lesson":
      return "Lesson";
    case "map":
      return "Concept";
    case "steps":
      return "Recipe";
    case "formula":
      return "Recall";
    case "callout":
      return "Trap";
    case "example":
      return "Example";
    case "question":
      return "Question";
    case "finish":
      return "Done";
  }
}
