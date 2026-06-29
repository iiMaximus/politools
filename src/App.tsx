import { Route, Routes } from "react-router-dom";
import { HubPage } from "./pages/HubPage";
import { CoursePage } from "./pages/CoursePage";
import { LessonPage } from "./pages/LessonPage";
import { PracticePage } from "./pages/PracticePage";
import { ExamPage } from "./pages/ExamPage";
import { ScrollPage } from "./pages/ScrollPage";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HubPage />} />
      <Route path="/c/:courseId" element={<CoursePage />} />
      <Route path="/c/:courseId/learn/:lessonId" element={<LessonPage />} />
      <Route path="/c/:courseId/scroll" element={<ScrollPage />} />
      <Route path="/c/:courseId/practice" element={<PracticePage />} />
      <Route path="/c/:courseId/exams" element={<ExamPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
