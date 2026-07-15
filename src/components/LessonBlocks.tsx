import { useMemo, useState } from "react";
import { isNumeric, type LessonBlock, type McqQuestion, type NumericQuestion, type Question } from "../types";
import { TexBlock } from "../lib/math";
import { shuffle } from "../lib/adaptive";
import { checkNumeric } from "../lib/answer";
import { recordAnswer } from "../lib/progress";
import { rt, rtInline } from "./RichText";
import { Icon } from "./Icon";
import { cn } from "../lib/cn";

/* ------------------------------ Callout --------------------------- */
const CALLOUTS = {
  key: { icon: "KeyRound", color: "var(--accent)", bg: "var(--accent-soft)", border: "var(--accent-line)", label: "Key idea" },
  info: { icon: "Info", color: "var(--info)", bg: "var(--info-bg)", border: "color-mix(in oklab, var(--info) 32%, transparent)", label: "Note" },
  tip: { icon: "Lightbulb", color: "var(--good)", bg: "var(--good-bg)", border: "color-mix(in oklab, var(--good) 32%, transparent)", label: "Tip" },
  trap: { icon: "AlertTriangle", color: "var(--warn)", bg: "var(--warn-bg)", border: "color-mix(in oklab, var(--warn) 34%, transparent)", label: "Exam trap" },
  warn: { icon: "OctagonAlert", color: "var(--bad)", bg: "var(--bad-bg)", border: "color-mix(in oklab, var(--bad) 34%, transparent)", label: "Watch out" },
} as const;

function Callout({ tone, title, content }: { tone: keyof typeof CALLOUTS; title?: string; content: React.ReactNode }) {
  const c = CALLOUTS[tone];
  return (
    <div className="my-5 flex gap-3 rounded-xl border p-4" style={{ background: c.bg, borderColor: c.border }}>
      <Icon name={c.icon} size={20} style={{ color: c.color }} className="mt-0.5 shrink-0" />
      <div className="prose-lesson !text-[0.98rem]">
        <div className="mb-1 font-bold" style={{ color: c.color }}>
          {title ?? c.label}
        </div>
        <div>{rt(content)}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Formula ---------------------------- */
function Formula({ tex, caption, tag }: { tex: string; caption?: React.ReactNode; tag?: string }) {
  return (
    <figure className="my-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-5">
      <div className="flex items-center justify-center gap-3">
        <div className="min-w-0 flex-1 text-center">
          <TexBlock>{tex}</TexBlock>
        </div>
        {tag && <span className="shrink-0 text-sm text-[var(--color-faint)]">({tag})</span>}
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-[var(--color-muted)]">{rt(caption)}</figcaption>}
    </figure>
  );
}

/* --------------------------- Definition --------------------------- */
function Definition({ term, content }: { term: string; content: React.ReactNode }) {
  return (
    <div className="my-5 rounded-xl border-l-4 bg-[var(--color-surface)] p-4" style={{ borderColor: "var(--accent)" }}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Definition</div>
      <div className="prose-lesson">
        <strong className="text-[var(--color-ink)]">{term}</strong> <span>— {rt(content)}</span>
      </div>
    </div>
  );
}

/* --------------------------- Sim frame ---------------------------- */
function SimFrame({ title, render, caption }: { title: string; render: () => React.ReactNode; caption?: React.ReactNode }) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-[var(--accent-line)] surface">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2.5">
        <Icon name="MousePointerClick" size={15} style={{ color: "var(--accent)" }} />
        <span className="text-sm font-semibold">{title}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-[var(--color-faint)]">Interactive</span>
      </div>
      <div className="p-4">{render()}</div>
      {caption && (
        <figcaption className="border-t border-[var(--color-line)] px-4 py-2.5 text-sm text-[var(--color-muted)]">
          {rt(caption)}
        </figcaption>
      )}
    </figure>
  );
}

/* ----------------------------- Figure ----------------------------- */
function Figure({ render, caption }: { render: () => React.ReactNode; caption?: React.ReactNode }) {
  return (
    <figure className="my-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
      <div className="grid place-items-center">{render()}</div>
      {caption && <figcaption className="mt-3 text-center text-sm text-[var(--color-muted)]">{caption}</figcaption>}
    </figure>
  );
}

/* ----------------------------- Example ---------------------------- */
function Example({ title, content }: { title?: string; content: React.ReactNode }) {
  return (
    <div className="my-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-2.5">
        <Icon name="PencilRuler" size={16} style={{ color: "var(--accent)" }} />
        <span className="text-sm font-bold">{title ?? "Worked example"}</span>
      </div>
      <div className="prose-lesson p-4">{rt(content)}</div>
    </div>
  );
}

/* ------------------------------ Steps ----------------------------- */
function Steps({ title, steps }: { title?: string; steps: { label?: string; content: React.ReactNode }[] }) {
  return (
    <div className="my-6">
      {title && <div className="mb-3 text-sm font-bold text-[var(--color-ink)]">{title}</div>}
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-[#06080f]"
              style={{ background: "linear-gradient(180deg, var(--accent), var(--accent-2))" }}
            >
              {i + 1}
            </span>
            <div className="prose-lesson flex-1 !text-[0.98rem]">
              {s.label && <div className="font-semibold text-[var(--color-ink)]">{s.label}</div>}
              <div>{rt(s.content)}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --------------------------- Checkpoint --------------------------- */
export function InlineCheck({ question, courseId }: { question: Question; courseId?: string }) {
  if (isNumeric(question)) return <InlineNumericCheck question={question} courseId={courseId} />;
  return <InlineMcqCheck question={question} courseId={courseId} />;
}

function InlineNumericCheck({ question, courseId }: { question: NumericQuestion; courseId?: string }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = checked && checkNumeric(value, question);

  function submit() {
    if (checked || !value.trim()) return;
    setChecked(true);
    if (courseId) recordAnswer(courseId, question.id, checkNumeric(value, question));
  }

  return (
    <div className="my-6 rounded-2xl border border-[var(--accent-line)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="CircleHelp" size={16} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Quick check</span>
      </div>
      <div className="prose-lesson mb-3 font-medium !text-[1rem] !text-[var(--color-ink)]">{rt(question.prompt)}</div>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          inputMode="decimal"
          enterKeyHint="done"
          value={value}
          disabled={checked}
          onChange={(e) => setValue(e.target.value)}
          placeholder={question.placeholder ?? "your result"}
          className="w-40 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--accent)]"
        />
        {question.unit && <span className="text-sm font-semibold text-[var(--color-muted)]">{question.unit}</span>}
        {!checked && (
          <button type="submit" className="btn btn-primary !py-2 !text-sm">
            Check
          </button>
        )}
      </form>
      {checked && (
        <div className="prose-lesson mt-3 rounded-xl bg-[var(--color-bg)] p-3 !text-[0.92rem]">
          <span className="font-semibold" style={{ color: correct ? "var(--good)" : "var(--bad)" }}>
            {correct ? "Correct. " : `Expected ${question.answer}${question.unit ? ` ${question.unit}` : ""}. `}
          </span>
          {rt(question.explanation)}
        </div>
      )}
    </div>
  );
}

function InlineMcqCheck({ question, courseId }: { question: McqQuestion; courseId?: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => shuffle(question.options), [question]);
  const answered = picked !== null;

  function pick(optionId: string) {
    if (answered) return;
    setPicked(optionId);
    // checkpoints count: XP, streak and SRS credit like any practice answer
    if (courseId) recordAnswer(courseId, question.id, optionId === question.correct);
  }
  return (
    <div className="my-6 rounded-2xl border border-[var(--accent-line)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="CircleHelp" size={16} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Quick check</span>
      </div>
      <div className="prose-lesson mb-3 font-medium !text-[1rem] !text-[var(--color-ink)]">{rt(question.prompt)}</div>
      <div className="grid gap-2">
        {options.map((o) => {
          const isCorrect = o.id === question.correct;
          const show = answered && (o.id === picked || isCorrect);
          return (
            <button
              key={o.id}
              disabled={answered}
              onClick={() => pick(o.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                !answered && "border-[var(--color-line)] hover:border-[var(--accent-line)]",
                show && isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                show && !isCorrect && o.id === picked && "border-rose-500/50 bg-rose-500/10",
                answered && !show && "border-[var(--color-line)] opacity-50"
              )}
            >
              <span className="font-mono text-xs text-[var(--color-faint)]">{o.id}</span>
              <span className="flex-1">{rtInline(o.content)}</span>
              {show && isCorrect && <Icon name="Check" size={16} style={{ color: "var(--good)" }} />}
              {show && !isCorrect && o.id === picked && <Icon name="X" size={16} style={{ color: "var(--bad)" }} />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="prose-lesson mt-3 rounded-xl bg-[var(--color-bg)] p-3 !text-[0.92rem]">
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            Why:{" "}
          </span>
          {rt(question.explanation)}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Dispatcher --------------------------- */
export function Block({ block, courseId }: { block: LessonBlock; courseId?: string }) {
  switch (block.kind) {
    case "prose":
      return <div className="prose-lesson">{rt(block.content)}</div>;
    case "heading":
      return (
        <h3 id={block.id} className="mt-10 mb-3 scroll-mt-24 text-xl font-bold tracking-tight">
          {rtInline(block.text)}
        </h3>
      );
    case "definition":
      return <Definition term={block.term} content={block.content} />;
    case "formula":
      return <Formula tex={block.tex} caption={block.caption} tag={block.tag} />;
    case "callout":
      return <Callout tone={block.tone} title={block.title} content={block.content} />;
    case "figure":
      return <Figure render={block.render} caption={block.caption} />;
    case "sim":
      return <SimFrame title={block.title} render={block.render} caption={block.caption} />;
    case "example":
      return <Example title={block.title} content={block.content} />;
    case "steps":
      return <Steps title={block.title} steps={block.steps} />;
    case "checkpoint":
      return <InlineCheck question={block.question} courseId={courseId} />;
  }
}
