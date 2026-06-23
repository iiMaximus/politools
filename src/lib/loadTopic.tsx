import type { ReactNode } from "react";
import type { ExamProblem, Lesson, LessonBlock, Question } from "../types";

/* Generic converter: authored topic JSON (string content + simKey) → typed
 * Lesson / Question / ExamProblem. Strings are rendered by RichText downstream.
 * `sims` maps a block's simKey to a renderer (course-specific registry). */

export type SimRegistry = Record<string, () => ReactNode>;

function MissingSim({ k }: { k?: string }) {
  return <div className="text-sm text-[var(--color-faint)]">Simulation “{k}” not available.</div>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;

function mapQuestion(q: Raw, id: string, topic: string): Question {
  return {
    id,
    topic,
    difficulty: q.difficulty ?? "medium",
    prompt: q.prompt ?? "",
    options: (q.options ?? []).map((o: Raw) => ({ id: o.id, content: o.content })),
    correct: q.correct,
    explanation: q.explanation ?? "",
    theory: q.theory,
    source: q.source,
    tags: q.tags,
  };
}

function mapBlock(b: Raw, slug: string, i: number, topic: string, sims: SimRegistry): LessonBlock {
  switch (b.kind) {
    case "heading":
      return { kind: "heading", text: b.text ?? "" };
    case "definition":
      return { kind: "definition", term: b.term ?? "", content: b.text ?? "" };
    case "formula":
      return { kind: "formula", tex: b.tex ?? "", caption: b.caption, tag: b.tag };
    case "callout":
      return { kind: "callout", tone: b.tone ?? "info", title: b.title, content: b.text ?? "" };
    case "steps":
      return {
        kind: "steps",
        title: b.title,
        steps: (b.steps ?? []).map((s: Raw) => ({ label: s.label, content: s.text ?? s.content ?? "" })),
      };
    case "example":
      return { kind: "example", title: b.title, content: b.text ?? "" };
    case "sim":
      return {
        kind: "sim",
        title: b.title ?? "Interactive model",
        caption: b.caption,
        render: sims[b.simKey] ?? (() => <MissingSim k={b.simKey} />),
      };
    case "checkpoint":
      return { kind: "checkpoint", question: mapQuestion(b.question ?? {}, `${slug}-cp${i}`, topic) };
    case "prose":
    default:
      return { kind: "prose", content: b.text ?? "" };
  }
}

export interface TopicMeta {
  /** lecture the lesson is grouped under (optional) */
  lecture?: string;
  /** group label applied to this topic's questions/exams */
  tutorial: string;
  fallbackTitle: string;
}

export interface LoadedTopic {
  lesson: Lesson;
  practice: Question[];
  exam: ExamProblem[];
}

export function loadTopic(raw: Raw, slug: string, meta: TopicMeta, sims: SimRegistry = {}): LoadedTopic {
  const title = raw.title ?? meta.fallbackTitle;
  const lesson: Lesson = {
    id: slug,
    title,
    lecture: meta.lecture,
    summary: raw.summary ?? "",
    minutes: raw.minutes ?? 20,
    objectives: raw.objectives ?? [],
    blocks: (raw.blocks ?? []).map((b: Raw, i: number) => mapBlock(b, slug, i, meta.tutorial, sims)),
  };
  const practice: Question[] = (raw.practice ?? []).map((q: Raw, i: number) =>
    mapQuestion(q, `${slug}-q${i + 1}`, meta.tutorial)
  );
  const exam: ExamProblem[] = (raw.exam ?? []).map((e: Raw, i: number) => ({
    id: `${slug}-e${i + 1}`,
    title: e.title ?? "Problem",
    meta: e.meta ?? "",
    difficulty: e.difficulty ?? "medium",
    topic: meta.tutorial,
    statement: e.statement ?? "",
    given: e.given,
    steps: (e.steps ?? []).map((s: Raw) => ({ title: s.title ?? "", content: s.content ?? "" })),
    finalAnswer: e.finalAnswer ?? "",
    tips: e.tips,
  }));
  return { lesson, practice, exam };
}
