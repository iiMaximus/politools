import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Kicker, Pill } from "../components/ui";
import { Block } from "../components/LessonBlocks";
import { rtInline } from "../components/RichText";
import { markLesson, useCourseProgress } from "../lib/progress";
import { NotFound } from "./NotFound";

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

export function LessonPage() {
  const { courseId = "", lessonId = "" } = useParams();
  const course = getCourse(courseId);
  const progress = useCourseProgress(courseId);
  const scroll = useScrollProgress();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (!course) return <NotFound />;
  const idx = course.lessons.findIndex((l) => l.id === lessonId);
  const lesson = course.lessons[idx];
  if (!lesson) return <NotFound />;

  const next = course.lessons[idx + 1];
  const completed = progress.lessons[lesson.id]?.completed;

  const toc = useMemo(
    () =>
      lesson.blocks
        .map((b, i) => (b.kind === "heading" ? { text: b.text, id: b.id ?? `h-${i}` } : null))
        .filter(Boolean) as { text: string; id: string }[],
    [lesson]
  );

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      {/* reading progress */}
      <div className="fixed inset-x-0 top-0 z-50 h-1">
        <div
          className="h-full"
          style={{ width: `${scroll * 100}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))" }}
        />
      </div>

      <TopBar
        crumbs={[
          { label: course.meta.short, to: `/c/${courseId}` },
          { label: "Learn", to: `/c/${courseId}` },
          { label: lesson.title },
        ]}
      >
        <Link to={`/c/${courseId}/practice`} className="btn btn-ghost !py-2 !text-sm">
          <Icon name="Dumbbell" size={15} /> Practice
        </Link>
      </TopBar>

      <Page>
        <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
          <article className="min-w-0">
            <Kicker>Lesson {idx + 1}</Kicker>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{rtInline(lesson.title)}</h1>
            <p className="mt-2 text-lg text-[var(--color-muted)]">{rtInline(lesson.summary)}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Pill tone="neutral">
                <Icon name="Clock" size={13} /> {lesson.minutes} min
              </Pill>
              {completed && (
                <Pill tone="good">
                  <Icon name="Check" size={13} /> Completed
                </Pill>
              )}
            </div>

            {/* objectives */}
            <div className="surface mt-6 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Icon name="Target" size={16} style={{ color: "var(--accent)" }} />
                By the end you can
              </div>
              <ul className="grid gap-1.5">
                {lesson.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                    <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                    <span>{rtInline(o)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* body */}
            <div className="mt-8">
              {lesson.blocks.map((b, i) => (
                <Block key={i} block={b.kind === "heading" ? { ...b, id: b.id ?? `h-${i}` } : b} />
              ))}
            </div>

            {/* footer */}
            <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-line)] pt-6 sm:flex-row sm:items-center">
              <button
                onClick={() => markLesson(courseId, lesson.id, !completed)}
                className={completed ? "btn btn-ghost" : "btn btn-primary"}
              >
                <Icon name={completed ? "RotateCcw" : "CheckCheck"} size={16} />
                {completed ? "Mark as not done" : "Mark lesson complete"}
              </button>
              {next ? (
                <Link to={`/c/${courseId}/learn/${next.id}`} className="btn btn-ghost sm:ml-auto">
                  Next: {next.title} <Icon name="ArrowRight" size={16} />
                </Link>
              ) : (
                <Link to={`/c/${courseId}/practice`} className="btn btn-ghost sm:ml-auto">
                  Practice this course <Icon name="ArrowRight" size={16} />
                </Link>
              )}
            </div>
          </article>

          {/* TOC */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                  On this page
                </div>
                <nav className="space-y-1 border-l border-[var(--color-line)]">
                  {toc.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="block border-l-2 border-transparent py-1 pl-3 text-sm text-[var(--color-muted)] transition hover:border-[var(--accent)] hover:text-[var(--color-ink)]"
                    >
                      {rtInline(t.text)}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </Page>
    </CourseTheme>
  );
}
