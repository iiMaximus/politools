import type { Course } from "../types";
import type { GameState } from "./game";
import { bestRecentMock, miniBossGrade } from "./game";
import { questionIsMastered } from "./adaptive";
import { courseSections, sectionQuestions } from "./path";
import type { CourseProgress } from "./progress";

export type LadderState = "done" | "now" | "next";

export interface LadderStep {
  id: "learn" | "worked" | "guided" | "independent" | "timed";
  label: string;
  detail: string;
  icon: string;
  to: string;
  done: boolean;
  state: LadderState;
}

export interface StudyLadder {
  sectionTitle: string;
  steps: LadderStep[];
  completed: number;
  total: number;
}

/**
 * Turn the content already present in a course into a visible teaching
 * sequence. This does not pretend every course has bespoke guided exercises:
 * checkpoints count as guided attempts, while a missing checkpoint is called
 * out honestly and the learner is sent to the section practice bank.
 */
export function studyLadder(
  course: Course,
  progress: CourseProgress,
  game: GameState
): StudyLadder | null {
  const sections = courseSections(course).filter((section) => section.lessons.length > 0);
  if (!sections.length) return null;

  const sectionDone = (section: (typeof sections)[number]) => {
    const lessonsDone = section.lessons.every((lesson) => progress.lessons[lesson.id]?.completed);
    const questions = sectionQuestions(course, section);
    const mastered = questions.filter((question) =>
      questionIsMastered(question, progress.cards[question.id])
    ).length;
    return lessonsDone && (questions.length === 0 || mastered >= Math.max(1, Math.ceil(questions.length * 0.5)));
  };

  const section = sections.find((candidate) => !sectionDone(candidate)) ?? sections[sections.length - 1];
  const firstLesson = section.lessons.find((lesson) => !progress.lessons[lesson.id]?.completed) ?? section.lessons[0];
  const learnDone = section.lessons.every((lesson) => progress.lessons[lesson.id]?.completed);

  const workedLessons = section.lessons.filter((lesson) =>
    lesson.blocks.some((block) => block.kind === "example" || block.kind === "steps")
  );
  const firstWorked = workedLessons.find((lesson) => !progress.lessons[lesson.id]?.completed) ?? workedLessons[0];
  const workedDone = workedLessons.length === 0
    ? learnDone
    : workedLessons.every((lesson) => progress.lessons[lesson.id]?.completed);

  const checkpoints = section.lessons.flatMap((lesson) =>
    lesson.blocks.flatMap((block) => (block.kind === "checkpoint" ? [block.question] : []))
  );
  const guidedDone = checkpoints.length === 0
    ? false
    : checkpoints.every((question) => (progress.cards[question.id]?.attempts ?? 0) > 0);

  const practice = sectionQuestions(course, section);
  const attempted = practice.filter((question) => (progress.cards[question.id]?.attempts ?? 0) > 0).length;
  const mastered = practice.filter((question) =>
    questionIsMastered(question, progress.cards[question.id])
  ).length;
  const independentTarget = practice.length === 0 ? 0 : Math.max(1, Math.ceil(practice.length * 0.5));
  const independentDone = practice.length === 0 ? learnDone : mastered >= independentTarget;
  const practiceTo = section.topics.length === 1
    ? `/c/${course.meta.id}/practice?topic=${encodeURIComponent(section.topics[0])}`
    : `/c/${course.meta.id}/practice`;

  const sectionGrade = sections.length > 1 ? miniBossGrade(course.meta.id, section.title, game) : null;
  const recentMock = bestRecentMock(course.meta.id, 21, game);
  const timedDone = sectionGrade !== null || recentMock !== null;
  const timedTo = sections.length > 1 && section.topics.length
    ? `/c/${course.meta.id}/boss?mini=${encodeURIComponent(section.title)}`
    : `/c/${course.meta.id}/mock`;

  const raw: Omit<LadderStep, "state">[] = [
    {
      id: "learn",
      label: "Understand",
      detail: `${section.lessons.filter((lesson) => progress.lessons[lesson.id]?.completed).length}/${section.lessons.length} lessons read`,
      icon: "BookOpen",
      to: `/c/${course.meta.id}/learn/${firstLesson.id}`,
      done: learnDone,
    },
    {
      id: "worked",
      label: "See it worked",
      detail: workedLessons.length ? `${workedLessons.length} worked example${workedLessons.length === 1 ? "" : "s"}` : "examples are inside the lesson",
      icon: "ListChecks",
      to: `/c/${course.meta.id}/learn/${(firstWorked ?? firstLesson).id}`,
      done: workedDone,
    },
    {
      id: "guided",
      label: "Try with hints",
      detail: checkpoints.length
        ? `${checkpoints.filter((question) => (progress.cards[question.id]?.attempts ?? 0) > 0).length}/${checkpoints.length} checkpoints tried`
        : "use explanations after each answer",
      icon: "Lightbulb",
      to: checkpoints.length ? `/c/${course.meta.id}/learn/${firstLesson.id}` : practiceTo,
      done: guidedDone,
    },
    {
      id: "independent",
      label: "Prove recall",
      detail: practice.length ? `${mastered}/${independentTarget} needed · ${attempted} seen` : "complete the section lessons",
      icon: "Dumbbell",
      to: practiceTo,
      done: independentDone,
    },
    {
      id: "timed",
      label: "Beat the clock",
      detail: sectionGrade !== null
        ? `guardian grade ${sectionGrade >= 31 ? "30L" : sectionGrade}`
        : recentMock
          ? `recent mock ${recentMock.grade >= 31 ? "30L" : recentMock.grade}`
          : sections.length > 1 ? "section guardian" : "timed mock exam",
      icon: "Timer",
      to: timedTo,
      done: timedDone,
    },
  ];

  const now = raw.findIndex((step) => !step.done);
  const steps: LadderStep[] = raw.map((step, index) => ({
    ...step,
    state: step.done ? "done" : index === (now < 0 ? raw.length - 1 : now) ? "now" : "next",
  }));

  return {
    sectionTitle: section.title,
    completed: steps.filter((step) => step.done).length,
    total: steps.length,
    steps,
  };
}
