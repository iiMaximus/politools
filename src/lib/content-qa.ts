import { contentText, normalizeContentText } from "./content-index";
import { isNumeric, type Course, type Lesson, type Question } from "../types";

export type QaSeverity = "error" | "warning" | "info";

export type QaCode =
  | "duplicate-id"
  | "missing-source"
  | "broken-topic"
  | "missing-topic"
  | "option-count"
  | "duplicate-option"
  | "invalid-correct-option"
  | "empty-option"
  | "thin-explanation"
  | "missing-theory"
  | "coverage-gap"
  | "syllabus-gap"
  | "incomplete-exam";

export interface QaIssue {
  key: string;
  code: QaCode;
  severity: QaSeverity;
  courseId: string;
  courseTitle: string;
  entityType: "course" | "lesson" | "question" | "exam";
  entityId: string;
  title: string;
  detail: string;
  href: string;
}

export interface QaSummary {
  courses: number;
  lessons: number;
  questions: number;
  exams: number;
  errors: number;
  warnings: number;
  info: number;
  citedQuestions: number;
}

export interface QaReport {
  issues: QaIssue[];
  summary: QaSummary;
}

const GENERIC_TOPIC_WORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "into",
  "module",
  "lecture",
  "tutorial",
  "practice",
  "exam",
  "fundamentals",
]);

function topicTokens(value: string): string[] {
  return normalizeContentText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !GENERIC_TOPIC_WORDS.has(token));
}

function relatedTopics(a: string, b: string): boolean {
  const left = normalizeContentText(a);
  const right = normalizeContentText(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;
  const leftTokens = topicTokens(left);
  const rightTokens = new Set(topicTokens(right));
  const overlap = leftTokens.filter((token) => rightTokens.has(token)).length;
  return overlap >= Math.min(2, Math.max(1, Math.min(leftTokens.length, rightTokens.size)));
}

function lessonLabels(lesson: Lesson): string[] {
  return [lesson.title, lesson.lecture, lesson.summary, ...lesson.objectives].filter(
    (value): value is string => !!value
  );
}

function questionLabel(question: Question): string {
  return contentText(question.prompt).slice(0, 110) || `Question ${question.id}`;
}

function addIssue(
  issues: QaIssue[],
  course: Course,
  issue: Omit<QaIssue, "key" | "courseId" | "courseTitle">
): void {
  issues.push({
    ...issue,
    key: `${course.meta.id}:${issue.code}:${issue.entityType}:${issue.entityId}:${issues.length}`,
    courseId: course.meta.id,
    courseTitle: course.meta.title,
  });
}

function reportDuplicateIds(
  issues: QaIssue[],
  course: Course,
  entityType: "lesson" | "question" | "exam",
  ids: string[],
  href: (id: string) => string
): void {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const [id, count] of counts) {
    if (count < 2) continue;
    addIssue(issues, course, {
      code: "duplicate-id",
      severity: "error",
      entityType,
      entityId: id,
      title: `Duplicate ${entityType} ID: ${id}`,
      detail: `${count} ${entityType} records share this ID inside ${course.meta.short}. Progress and deep links cannot distinguish them.`,
      href: href(id),
    });
  }
}

function auditQuestion(issues: QaIssue[], course: Course, question: Question): void {
  const topic = question.topic;
  const href = `/c/${course.meta.id}/practice${
    topic ? `?topic=${encodeURIComponent(topic)}` : ""
  }`;
  const label = questionLabel(question);

  if (!question.source?.trim()) {
    addIssue(issues, course, {
      code: "missing-source",
      severity: "warning",
      entityType: "question",
      entityId: question.id,
      title: "Question has no source",
      detail: `${label} is not traceable to an exam, written test, tutorial, lecture, or authored reference.`,
      href,
    });
  }

  if (!topic?.trim()) {
    addIssue(issues, course, {
      code: "missing-topic",
      severity: "warning",
      entityType: "question",
      entityId: question.id,
      title: "Question has no topic",
      detail: `${label} cannot be reached through lecture-scoped practice.`,
      href,
    });
  } else {
    const declared = [
      ...course.meta.syllabus,
      ...course.lessons.flatMap(lessonLabels),
    ];
    if (!declared.some((candidate) => relatedTopics(topic, candidate))) {
      addIssue(issues, course, {
        code: "broken-topic",
        severity: "warning",
        entityType: "question",
        entityId: question.id,
        title: `Unmapped topic: ${topic}`,
        detail: "The topic does not match a syllabus item, lesson title, lecture group, summary, or objective.",
        href,
      });
    }
  }

  const explanation = contentText(question.explanation);
  if (explanation.length < 60) {
    addIssue(issues, course, {
      code: "thin-explanation",
      severity: explanation.length === 0 ? "error" : "warning",
      entityType: "question",
      entityId: question.id,
      title: explanation.length === 0 ? "Missing explanation" : "Explanation is too thin",
      detail: explanation.length === 0
        ? "The learner receives no feedback after answering."
        : `Only ${explanation.length} searchable characters explain the answer; distractors or reasoning may be incomplete.`,
      href,
    });
  }

  if (contentText(question.theory).length < 20) {
    addIssue(issues, course, {
      code: "missing-theory",
      severity: "info",
      entityType: "question",
      entityId: question.id,
      title: "No reusable theory note",
      detail: "The answer may be explained, but the card has little generalized theory for solving variants.",
      href,
    });
  }

  if (isNumeric(question)) return;

  if (question.options.length !== 4) {
    addIssue(issues, course, {
      code: "option-count",
      severity: "error",
      entityType: "question",
      entityId: question.id,
      title: `${question.options.length} options instead of 4`,
      detail: "Exam-style MCQs must expose four plausible answer choices.",
      href,
    });
  }

  const optionIds = new Set<string>();
  const optionBodies = new Set<string>();
  for (const option of question.options) {
    const body = normalizeContentText(contentText(option.content));
    if (!body) {
      addIssue(issues, course, {
        code: "empty-option",
        severity: "error",
        entityType: "question",
        entityId: question.id,
        title: `Empty option ${option.id}`,
        detail: "A visible distractor is missing.",
        href,
      });
    }
    if (optionIds.has(option.id) || (body && optionBodies.has(body))) {
      addIssue(issues, course, {
        code: "duplicate-option",
        severity: "error",
        entityType: "question",
        entityId: question.id,
        title: `Duplicate option ${option.id}`,
        detail: "Option IDs and answer text must be unique within a question.",
        href,
      });
    }
    optionIds.add(option.id);
    if (body) optionBodies.add(body);
  }

  if (!optionIds.has(question.correct)) {
    addIssue(issues, course, {
      code: "invalid-correct-option",
      severity: "error",
      entityType: "question",
      entityId: question.id,
      title: `Correct option ${question.correct} does not exist`,
      detail: "The configured answer must match one of the option IDs.",
      href,
    });
  }
}

function auditCoverage(issues: QaIssue[], course: Course): void {
  const questions = course.practice;
  for (const lesson of course.lessons) {
    const labels = lessonLabels(lesson);
    const checkpointCount = lesson.blocks.filter((block) => block.kind === "checkpoint").length;
    const practiceCount = questions.filter(
      (question) => question.topic && labels.some((label) => relatedTopics(question.topic!, label))
    ).length;
    if (practiceCount === 0 && checkpointCount === 0) {
      addIssue(issues, course, {
        code: "coverage-gap",
        severity: "warning",
        entityType: "lesson",
        entityId: lesson.id,
        title: `No practice for ${lesson.title}`,
        detail: "No practice topic maps to this lesson and it has no embedded checkpoint.",
        href: `/c/${course.meta.id}/learn/${lesson.id}`,
      });
    }
  }

  for (const syllabusItem of course.meta.syllabus) {
    if (course.lessons.some((lesson) => lessonLabels(lesson).some((label) => relatedTopics(syllabusItem, label)))) {
      continue;
    }
    addIssue(issues, course, {
      code: "syllabus-gap",
      severity: "info",
      entityType: "course",
      entityId: course.meta.id,
      title: `Syllabus item has no lesson: ${syllabusItem}`,
      detail: "The published syllabus cannot be mapped to authored lesson content.",
      href: `/c/${course.meta.id}`,
    });
  }
}

function auditExams(issues: QaIssue[], course: Course): void {
  for (const problem of course.exam) {
    const missing: string[] = [];
    if (contentText(problem.statement).length < 20) missing.push("statement");
    if (problem.steps.length === 0 || problem.steps.some((step) => contentText(step.content).length < 10)) {
      missing.push("worked steps");
    }
    if (contentText(problem.finalAnswer).length === 0) missing.push("final answer");
    if (missing.length === 0) continue;
    addIssue(issues, course, {
      code: "incomplete-exam",
      severity: "error",
      entityType: "exam",
      entityId: problem.id,
      title: `Incomplete exam problem: ${problem.title}`,
      detail: `Missing or too short: ${missing.join(", ")}.`,
      href: `/c/${course.meta.id}/exams`,
    });
  }
}

export function auditContent(courses: Course[]): QaReport {
  const issues: QaIssue[] = [];

  for (const course of courses) {
    reportDuplicateIds(
      issues,
      course,
      "lesson",
      course.lessons.map((lesson) => lesson.id),
      (id) => `/c/${course.meta.id}/learn/${id}`
    );
    reportDuplicateIds(
      issues,
      course,
      "question",
      course.practice.map((question) => question.id),
      () => `/c/${course.meta.id}/practice`
    );
    reportDuplicateIds(
      issues,
      course,
      "exam",
      course.exam.map((problem) => problem.id),
      () => `/c/${course.meta.id}/exams`
    );
    for (const question of course.practice) auditQuestion(issues, course, question);
    auditCoverage(issues, course);
    auditExams(issues, course);
  }

  const severityOrder: Record<QaSeverity, number> = { error: 0, warning: 1, info: 2 };
  issues.sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      a.courseTitle.localeCompare(b.courseTitle) ||
      a.title.localeCompare(b.title)
  );

  return {
    issues,
    summary: {
      courses: courses.length,
      lessons: courses.reduce((total, course) => total + course.lessons.length, 0),
      questions: courses.reduce((total, course) => total + course.practice.length, 0),
      exams: courses.reduce((total, course) => total + course.exam.length, 0),
      errors: issues.filter((issue) => issue.severity === "error").length,
      warnings: issues.filter((issue) => issue.severity === "warning").length,
      info: issues.filter((issue) => issue.severity === "info").length,
      citedQuestions: courses.reduce(
        (total, course) => total + course.practice.filter((question) => !!question.source?.trim()).length,
        0
      ),
    },
  };
}
