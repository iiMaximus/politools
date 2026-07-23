import type { Course } from "../types";
import { bestRecentMock, gradeFromScore, readiness, type GameState } from "./game";
import { mistakeIsOpen, type CourseProgress } from "./progress";
import { topicStats } from "./stats";

export interface ReadinessRisk {
  topic: string;
  accuracy: number | null;
  mastered: number;
  total: number;
  due: number;
  cost: number;
}

export interface ReadinessAction {
  label: string;
  detail: string;
  to: string;
  icon: string;
}

export interface ExamReadinessReport {
  score: number;
  gradeLabel: string;
  gradeRange: string;
  confidence: "low" | "medium" | "high";
  evidenceLabel: string;
  risks: ReadinessRisk[];
  actions: ReadinessAction[];
  attempted: number;
  totalQuestions: number;
  recentMockGrade: string | null;
}

function gradeLabel(score: number): string {
  const grade = gradeFromScore(score);
  return grade < 18 ? "<18" : grade >= 31 ? "30L" : String(grade);
}

/** A compact, auditable forecast: the range widens when the learner has
 * supplied little evidence and narrows after broad practice plus a mock. */
export function examReadinessReport(
  course: Course,
  progress: CourseProgress,
  game: GameState
): ExamReadinessReport {
  const base = readiness(course, progress, game);
  const attempted = course.practice.filter((q) => (progress.cards[q.id]?.attempts ?? 0) > 0).length;
  const completedLessons = course.lessons.filter((l) => progress.lessons[l.id]?.completed).length;
  const solvedExams = course.exam.filter((problem) => progress.exams[problem.id]?.solved).length;
  const recentMock = bestRecentMock(course.meta.id, 21, game);
  const breadth = course.practice.length ? attempted / course.practice.length : 0;

  const confidence: ExamReadinessReport["confidence"] =
    recentMock && breadth >= 0.4 ? "high" : attempted >= 10 || completedLessons >= 3 ? "medium" : "low";
  const margin = confidence === "high" ? 6 : confidence === "medium" ? 11 : 18;
  const low = Math.max(0, base.score - margin);
  const high = Math.min(100, base.score + margin);
  const gradeRange = `${gradeLabel(low)}–${gradeLabel(high)}`;

  const stats = topicStats(course, progress);
  const risks = stats
    .map((topic) => ({
      topic: topic.topic,
      accuracy: topic.accuracy,
      mastered: topic.mastered,
      total: topic.total,
      due: topic.due,
      cost: topic.weakness * Math.log2(topic.total + 1),
    }))
    .filter((topic) => topic.total > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3);

  const mistakeCount = course.practice.filter((q) => {
    const card = progress.cards[q.id];
    return mistakeIsOpen(card);
  }).length;
  const firstUnread = course.lessons.find((lesson) => !progress.lessons[lesson.id]?.completed);
  const weakest = risks[0];
  const actions: ReadinessAction[] = [];

  if (mistakeCount > 0) {
    actions.push({
      label: `Repair ${mistakeCount} active mistake${mistakeCount === 1 ? "" : "s"}`,
      detail: "Retry the exact questions and misconception patterns costing you marks.",
      to: `/mistakes?course=${encodeURIComponent(course.meta.id)}`,
      icon: "RotateCcw",
    });
  }
  if (firstUnread) {
    actions.push({
      label: `Finish: ${firstUnread.title}`,
      detail: "Close the next theory gap before adding unfamiliar questions.",
      to: `/c/${course.meta.id}/learn/${firstUnread.id}`,
      icon: "BookOpen",
    });
  }
  if (weakest) {
    actions.push({
      label: `Drill: ${weakest.topic}`,
      detail: weakest.accuracy === null
        ? `${weakest.total} questions are still untouched.`
        : `${Math.round(weakest.accuracy * 100)}% accuracy · ${weakest.mastered}/${weakest.total} stable.`,
      to: `/c/${course.meta.id}/practice?topic=${encodeURIComponent(weakest.topic)}`,
      icon: "Crosshair",
    });
  }
  if (!recentMock || actions.length < 3) {
    actions.push({
      label: recentMock ? "Retest under exam time" : "Establish a timed baseline",
      detail: "A mock is the strongest signal and will narrow the forecast range.",
      to: `/c/${course.meta.id}/mock`,
      icon: "Timer",
    });
  }

  const evidence = [
    `${attempted}/${course.practice.length} questions`,
    `${completedLessons}/${course.lessons.length} lessons`,
    `${solvedExams}/${course.exam.length} exam problems`,
    recentMock ? "recent mock" : "no recent mock",
  ];

  return {
    score: base.score,
    gradeLabel: base.gradeLabel,
    gradeRange,
    confidence,
    evidenceLabel: evidence.join(" · "),
    risks,
    actions: actions.slice(0, 3),
    attempted,
    totalQuestions: course.practice.length,
    recentMockGrade: recentMock ? (recentMock.grade >= 31 ? "30L" : recentMock.grade < 18 ? "<18" : String(recentMock.grade)) : null,
  };
}
