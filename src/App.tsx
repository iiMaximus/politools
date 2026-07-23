import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { HubPage } from "./pages/HubPage";
import { CoursePage } from "./pages/CoursePage";
import { LessonPage } from "./pages/LessonPage";
import { PracticePage } from "./pages/PracticePage";
import { ExamPage } from "./pages/ExamPage";
import { ScrollPage } from "./pages/ScrollPage";
import { CourseGroupPage } from "./pages/CourseGroupPage";
import { MixPage } from "./pages/MixPage";
import { MockExamPage } from "./pages/MockExamPage";
import { PathPage } from "./pages/PathPage";
import { NotFound } from "./pages/NotFound";
import { StatsPage } from "./pages/StatsPage";
import { GameToasts } from "./components/game/Toasts";
import { BottomNav } from "./components/BottomNav";
import { CloudProfileModal } from "./components/CloudAccount";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ReadinessPage } from "./pages/ReadinessPage";
import { SearchPage } from "./pages/SearchPage";
import { SourceCoveragePage } from "./pages/SourceCoveragePage";
import { ContentQaPage } from "./pages/ContentQaPage";
import { MistakeLabPage } from "./pages/MistakeLabPage";

// Boss fights pull in three.js — keep it out of the main bundle.
const BossPage = lazy(() => import("./pages/BossPage"));

export function App() {
  return (
    <>
      <GameToasts />
      <CloudProfileModal />
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/mix" element={<MixPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/readiness" element={<ReadinessPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/sources" element={<SourceCoveragePage />} />
        <Route path="/content-qa" element={<ContentQaPage />} />
        <Route path="/mistakes" element={<MistakeLabPage />} />
        <Route path="/mistakes/:courseId" element={<MistakeLabPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/g/:groupId" element={<CourseGroupPage />} />
        <Route path="/c/:courseId" element={<CoursePage />} />
        <Route path="/c/:courseId/path" element={<PathPage />} />
        <Route path="/c/:courseId/learn/:lessonId" element={<LessonPage />} />
        <Route path="/c/:courseId/scroll" element={<ScrollPage />} />
        <Route path="/c/:courseId/practice" element={<PracticePage />} />
        <Route path="/c/:courseId/exams" element={<ExamPage />} />
        <Route path="/c/:courseId/mock" element={<MockExamPage />} />
        <Route
          path="/c/:courseId/boss"
          element={
            <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-[var(--color-faint)]">Summoning the boss…</div>}>
              <BossPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}
