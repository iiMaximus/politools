import { isValidElement, type ReactNode } from "react";
import { courseExists, useCourses } from "../courses/registry";
import { isNumeric, type Course, type Lesson, type LessonBlock, type Question } from "../types";

/* ================================================================== *
 *  UNIVERSAL CONTENT INDEX
 *  Course entry files are discovered by Vite, then validated against
 *  the registry. The values returned by import.meta.glob stay lazy;
 *  `useCourses` remains the single loading/cache path for course data.
 * ================================================================== */

const COURSE_ENTRY_FILES = import.meta.glob("../courses/*/index.tsx");

export const REGISTERED_CONTENT_COURSE_IDS = Object.keys(COURSE_ENTRY_FILES)
  .map((path) => path.match(/\/courses\/([^/]+)\/index\.tsx$/)?.[1])
  .filter((id): id is string => !!id && courseExists(id))
  .sort();

export function useContentCourses(): { courses: Course[]; ready: boolean } {
  return useCourses(REGISTERED_CONTENT_COURSE_IDS);
}

export type ContentKind = "course" | "lesson" | "concept" | "formula" | "question" | "exam";

export interface ContentSearchItem {
  key: string;
  kind: ContentKind;
  courseId: string;
  courseTitle: string;
  courseShort: string;
  accent: string;
  title: string;
  text: string;
  topic?: string;
  source?: string;
  tags: string[];
  href: string;
}

export interface SearchOptions {
  courseId?: string;
  kind?: ContentKind;
  limit?: number;
}

export interface SearchResult {
  item: ContentSearchItem;
  score: number;
}

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function appendNodeText(node: ReactNode, out: string[], depth: number): void {
  if (depth > 10 || node === null || node === undefined || typeof node === "boolean") return;
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) appendNodeText(child, out, depth + 1);
    return;
  }
  if (isValidElement<{ children?: ReactNode; tex?: string; alt?: string }>(node)) {
    if (typeof node.props.tex === "string") out.push(node.props.tex);
    if (typeof node.props.alt === "string") out.push(node.props.alt);
    appendNodeText(node.props.children, out, depth + 1);
  }
}

/** Best-effort plain-text projection of authored React content for search and QA. */
export function contentText(node: ReactNode): string {
  const out: string[] = [];
  appendNodeText(node, out, 0);
  return compact(out.join(" "));
}

export function normalizeContentText(value: string): string {
  return compact(
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .toLowerCase()
  );
}

function questionText(question: Question): string {
  const optionText = isNumeric(question)
    ? `${question.answer} ${question.unit ?? ""}`
    : question.options.map((option) => contentText(option.content)).join(" ");
  return compact(
    [
      contentText(question.prompt),
      optionText,
      contentText(question.explanation),
      contentText(question.theory),
    ].join(" ")
  );
}

function blockRecord(
  course: Course,
  lesson: Lesson,
  block: LessonBlock,
  index: number
): ContentSearchItem | undefined {
  const base = {
    key: `${course.meta.id}:lesson:${lesson.id}:block:${index}`,
    courseId: course.meta.id,
    courseTitle: course.meta.title,
    courseShort: course.meta.short,
    accent: course.meta.accent,
    topic: lesson.lecture ?? lesson.title,
    tags: [lesson.title, lesson.lecture ?? ""].filter(Boolean),
    href: `/c/${course.meta.id}/learn/${lesson.id}`,
  };

  switch (block.kind) {
    case "heading":
      return { ...base, kind: "concept", title: block.text, text: block.text };
    case "definition":
      return {
        ...base,
        kind: "concept",
        title: block.term,
        text: `${block.term} ${contentText(block.content)}`,
      };
    case "formula":
      return {
        ...base,
        kind: "formula",
        title: block.tag ? `Formula ${block.tag}` : `${lesson.title} formula`,
        text: `${block.tex} ${contentText(block.caption)}`,
        tags: [...base.tags, block.tag ?? ""].filter(Boolean),
      };
    case "callout":
      return {
        ...base,
        kind: "concept",
        title: block.title ?? `${lesson.title} ${block.tone}`,
        text: `${block.title ?? ""} ${contentText(block.content)}`,
        tags: [...base.tags, block.tone],
      };
    case "example":
      return {
        ...base,
        kind: "concept",
        title: block.title ?? `${lesson.title} example`,
        text: contentText(block.content),
        tags: [...base.tags, "example"],
      };
    case "steps":
      return {
        ...base,
        kind: "concept",
        title: block.title ?? `${lesson.title} method`,
        text: block.steps
          .map((step) => `${step.label ?? ""} ${contentText(step.content)}`)
          .join(" "),
        tags: [...base.tags, "method", "steps"],
      };
    case "prose":
      return {
        ...base,
        kind: "concept",
        title: `${lesson.title} notes`,
        text: contentText(block.content),
      };
    case "figure":
    case "sim": {
      const caption = contentText(block.caption);
      if (!caption && block.kind === "figure") return undefined;
      return {
        ...base,
        kind: "concept",
        title: block.kind === "sim" ? block.title : `${lesson.title} figure`,
        text: caption,
        tags: [...base.tags, block.kind],
      };
    }
    case "checkpoint":
      return undefined;
  }
}

function addQuestion(
  items: ContentSearchItem[],
  course: Course,
  question: Question,
  origin: "practice" | "checkpoint"
): void {
  const title = compact(contentText(question.prompt)).slice(0, 150) || `Question ${question.id}`;
  const topic = question.topic;
  items.push({
    key: `${course.meta.id}:${origin}:question:${question.id}`,
    kind: "question",
    courseId: course.meta.id,
    courseTitle: course.meta.title,
    courseShort: course.meta.short,
    accent: course.meta.accent,
    title,
    text: questionText(question),
    topic,
    source: question.source,
    tags: question.tags ?? [],
    href: topic
      ? `/c/${course.meta.id}/practice?topic=${encodeURIComponent(topic)}`
      : `/c/${course.meta.id}/practice`,
  });
}

export function buildContentIndex(courses: Course[]): ContentSearchItem[] {
  const items: ContentSearchItem[] = [];

  for (const course of courses) {
    items.push({
      key: `${course.meta.id}:course`,
      kind: "course",
      courseId: course.meta.id,
      courseTitle: course.meta.title,
      courseShort: course.meta.short,
      accent: course.meta.accent,
      title: course.meta.title,
      text: compact(
        `${course.meta.tagline} ${course.meta.description} ${course.meta.syllabus.join(" ")}`
      ),
      tags: [course.meta.status, `year ${course.meta.year}`, `semester ${course.meta.semester}`],
      href: `/c/${course.meta.id}`,
    });

    const practiceIds = new Set(course.practice.map((question) => question.id));
    for (const lesson of course.lessons) {
      items.push({
        key: `${course.meta.id}:lesson:${lesson.id}`,
        kind: "lesson",
        courseId: course.meta.id,
        courseTitle: course.meta.title,
        courseShort: course.meta.short,
        accent: course.meta.accent,
        title: lesson.title,
        text: compact(`${lesson.summary} ${lesson.objectives.join(" ")}`),
        topic: lesson.lecture,
        tags: [lesson.lecture ?? "", `${lesson.minutes} minutes`].filter(Boolean),
        href: `/c/${course.meta.id}/learn/${lesson.id}`,
      });

      lesson.blocks.forEach((block, index) => {
        const record = blockRecord(course, lesson, block, index);
        if (record && (record.text || record.title)) items.push(record);
        if (block.kind === "checkpoint" && !practiceIds.has(block.question.id)) {
          addQuestion(items, course, block.question, "checkpoint");
        }
      });
    }

    for (const question of course.practice) addQuestion(items, course, question, "practice");

    for (const problem of course.exam) {
      items.push({
        key: `${course.meta.id}:exam:${problem.id}`,
        kind: "exam",
        courseId: course.meta.id,
        courseTitle: course.meta.title,
        courseShort: course.meta.short,
        accent: course.meta.accent,
        title: problem.title,
        text: compact(
          [
            problem.meta,
            contentText(problem.statement),
            contentText(problem.given),
            ...problem.steps.map((step) => `${step.title} ${contentText(step.content)}`),
            contentText(problem.finalAnswer),
            contentText(problem.tips),
          ].join(" ")
        ),
        topic: problem.topic,
        tags: [problem.difficulty, problem.meta],
        href: `/c/${course.meta.id}/exams`,
      });
    }
  }

  return items;
}

function scoreItem(item: ContentSearchItem, normalizedQuery: string, tokens: string[]): number {
  const title = normalizeContentText(item.title);
  const course = normalizeContentText(`${item.courseTitle} ${item.courseShort}`);
  const topic = normalizeContentText(item.topic ?? "");
  const source = normalizeContentText(item.source ?? "");
  const tags = normalizeContentText(item.tags.join(" "));
  const text = normalizeContentText(item.text);
  const haystack = `${title} ${course} ${topic} ${source} ${tags} ${text}`;
  if (!tokens.every((token) => haystack.includes(token))) return 0;

  let score = 1;
  if (title === normalizedQuery) score += 180;
  else if (title.startsWith(normalizedQuery)) score += 100;
  else if (title.includes(normalizedQuery)) score += 65;
  if (topic.includes(normalizedQuery)) score += 40;
  if (source.includes(normalizedQuery)) score += 35;
  if (course.includes(normalizedQuery)) score += 25;
  if (tags.includes(normalizedQuery)) score += 20;
  for (const token of tokens) {
    if (title.includes(token)) score += 16;
    if (topic.includes(token)) score += 9;
    if (source.includes(token)) score += 7;
    if (text.includes(token)) score += 2;
  }
  return score;
}

export function searchContent(
  index: ContentSearchItem[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const normalizedQuery = normalizeContentText(query);
  const tokens = normalizedQuery.split(" ").filter((token) => token.length > 1);
  if (tokens.length === 0) return [];

  return index
    .filter((item) => (!options.courseId || item.courseId === options.courseId))
    .filter((item) => (!options.kind || item.kind === options.kind))
    .map((item) => ({ item, score: scoreItem(item, normalizedQuery, tokens) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, options.limit ?? 80);
}

export type SourceKind = "past-exam" | "written-test" | "tutorial" | "lecture" | "book" | "other" | "uncited";
export type SourceCoverageStatus = "mapped" | "practice-only" | "uncited";

export interface SourceLink {
  label: string;
  href: string;
}

export interface SourceCoverageGroup {
  key: string;
  courseId: string;
  courseTitle: string;
  courseShort: string;
  accent: string;
  label: string;
  kind: SourceKind;
  status: SourceCoverageStatus;
  questionCount: number;
  topics: string[];
  sources: string[];
  practiceLinks: SourceLink[];
  lessonLinks: SourceLink[];
}

function classifySource(source: string | undefined, tags: string[]): SourceKind {
  if (!source) return "uncited";
  const value = normalizeContentText(`${source} ${tags.join(" ")}`);
  if (/past exam|exam archive|june 20|july 20|september 20|february 20/.test(value)) return "past-exam";
  if (/written test|wt ?[0-9]|test 20/.test(value)) return "written-test";
  if (/tutorial|exercise sheet|problem sheet/.test(value)) return "tutorial";
  if (/slide|lecture|dispensa/.test(value)) return "lecture";
  if (/book|textbook|chapter/.test(value)) return "book";
  return "other";
}

function sourceFamily(source: string | undefined, kind: SourceKind): string {
  if (!source) return "Uncited authored material";
  const clean = compact(source)
    .replace(/\s*[·|]\s*(?:ex(?:ercise)?|q(?:uestion)?|p(?:age)?|problem)\b.*$/i, "")
    .replace(/\s*[,;]\s*(?:ex(?:ercise)?|q(?:uestion)?|p(?:age)?|problem)\b.*$/i, "")
    .trim();
  if (clean) return clean;
  const fallbacks: Record<SourceKind, string> = {
    "past-exam": "Past exams",
    "written-test": "Written tests",
    tutorial: "Tutorials and exercise sheets",
    lecture: "Lecture material",
    book: "Books and notes",
    other: "Other cited material",
    uncited: "Uncited authored material",
  };
  return fallbacks[kind];
}

function topicMatchesLesson(topic: string, lesson: Lesson): boolean {
  const needle = normalizeContentText(topic);
  if (!needle) return false;
  const candidates = [lesson.title, lesson.lecture, lesson.summary, ...lesson.objectives]
    .filter((value): value is string => !!value)
    .map(normalizeContentText);
  return candidates.some(
    (candidate) => candidate === needle || candidate.includes(needle) || needle.includes(candidate)
  );
}

export function buildSourceCoverage(courses: Course[]): SourceCoverageGroup[] {
  const groups = new Map<string, SourceCoverageGroup>();

  for (const course of courses) {
    for (const question of course.practice) {
      const tags = question.tags ?? [];
      const kind = classifySource(question.source, tags);
      const label = sourceFamily(question.source, kind);
      const key = `${course.meta.id}:${kind}:${normalizeContentText(label)}`;
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          courseId: course.meta.id,
          courseTitle: course.meta.title,
          courseShort: course.meta.short,
          accent: course.meta.accent,
          label,
          kind,
          status: kind === "uncited" ? "uncited" : "practice-only",
          questionCount: 0,
          topics: [],
          sources: [],
          practiceLinks: [],
          lessonLinks: [],
        };
        groups.set(key, group);
      }
      group.questionCount += 1;
      if (question.source && !group.sources.includes(question.source)) group.sources.push(question.source);
      if (question.topic && !group.topics.includes(question.topic)) group.topics.push(question.topic);
    }
  }

  for (const group of groups.values()) {
    const course = courses.find((candidate) => candidate.meta.id === group.courseId);
    if (!course) continue;
    group.topics.sort();
    group.sources.sort();
    group.practiceLinks = group.topics.map((topic) => ({
      label: topic,
      href: `/c/${course.meta.id}/practice?topic=${encodeURIComponent(topic)}`,
    }));
    const matched = course.lessons.filter((lesson) =>
      group.topics.some((topic) => topicMatchesLesson(topic, lesson))
    );
    group.lessonLinks = matched.map((lesson) => ({
      label: lesson.title,
      href: `/c/${course.meta.id}/learn/${lesson.id}`,
    }));
    if (group.kind !== "uncited" && group.lessonLinks.length > 0) group.status = "mapped";
  }

  return [...groups.values()].sort(
    (a, b) => a.courseTitle.localeCompare(b.courseTitle) || a.label.localeCompare(b.label)
  );
}
