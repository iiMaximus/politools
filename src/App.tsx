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
import { PathPage } from "./pages/PathPage";
import { NotFound } from "./pages/NotFound";
import { GameToasts } from "./components/game/Toasts";

// Boss fights pull in three.js — keep it out of the main bundle.
const BossPage = lazy(() => import("./pages/BossPage"));

export function App() {
  return (
    <>
      <GameToasts />
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/mix" element={<MixPage />} />
        <Route path="/g/:groupId" element={<CourseGroupPage />} />
        <Route path="/c/:courseId" element={<CoursePage />} />
        <Route path="/c/:courseId/path" element={<PathPage />} />
        <Route path="/c/:courseId/learn/:lessonId" element={<LessonPage />} />
        <Route path="/c/:courseId/scroll" element={<ScrollPage />} />
        <Route path="/c/:courseId/practice" element={<PracticePage />} />
        <Route path="/c/:courseId/exams" element={<ExamPage />} />
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
    </>
  );
}
