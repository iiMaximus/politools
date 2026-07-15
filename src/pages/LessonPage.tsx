import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page, PageLoader } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Kicker, Pill } from "../components/ui";
import { Block } from "../components/LessonBlocks";
import { rtInline } from "../components/RichText";
import { markLesson, useCourseProgress } from "../lib/progress";
import { cn } from "../lib/cn";
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
  const { course, loading } = useCourse(courseId);
  const progress = useCourseProgress(courseId);
  const scroll = useScrollProgress();
  const [focusMode, setFocusMode] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string | null>(null);

  const idx = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = idx >= 0 ? course?.lessons[idx] : undefined;

  const toc = useMemo(
    () => {
      if (!lesson) return [];
      return lesson.blocks
        .map((b, i) => (b.kind === "heading" ? { text: b.text, id: b.id ?? `h-${i}` } : null))
        .filter(Boolean) as { text: string; id: string }[];
    },
    [lesson]
  );

  // restore the reading position when returning to a lesson ("continue
  // where you left off"); save it as you scroll
  useEffect(() => {
    setActiveTocId(null);
    if (!lesson) return;
    const key = `polito:lessonpos:${courseId}:${lessonId}`;
    const saved = Number(sessionStorage.getItem(key) ?? "0");
    requestAnimationFrame(() => window.scrollTo(0, saved > 300 ? saved : 0));
    let t = 0;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        try {
          sessionStorage.setItem(key, String(window.scrollY));
        } catch {
          /* ignore */
        }
      }, 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      // flush on unmount — a debounced save must not be lost to navigation
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, !!lesson]);

  useEffect(() => {
    if (!toc.length) return;

    let frame = 0;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const threshold = focusMode ? 80 : 130;
        const current =
          toc.reduce((active, item) => {
            const el = document.getElementById(item.id);
            if (!el) return active;
            return el.getBoundingClientRect().top <= threshold ? item.id : active;
          }, toc[0]?.id ?? null) ?? null;
        setActiveTocId(current);
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [focusMode, toc]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" });
    setActiveTocId(id);
  }, []);

  if (loading) return <PageLoader />;
  if (!course || !lesson) return <NotFound />;

  const next = course.lessons[idx + 1];
  const completed = progress.lessons[lesson.id]?.completed;
  const activeToc = activeTocId ?? toc[0]?.id;

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      {/* reading progress */}
      {!focusMode && (
        <div className="fixed inset-x-0 top-0 z-50 h-1">
          <div
            className="h-full"
            style={{ width: `${scroll * 100}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))" }}
          />
        </div>
      )}

      {focusMode ? (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="btn btn-ghost fixed right-4 top-4 z-50 !h-11 !w-11 !p-0 shadow-sm"
          aria-label="Exit focus mode"
          title="Exit focus mode"
        >
          <Icon name="Minimize2" size={18} />
        </button>
      ) : (
        <TopBar
          crumbs={[
            { label: course.meta.short, to: `/c/${courseId}` },
            { label: "Learn", to: `/c/${courseId}` },
            { label: lesson.title },
          ]}
        >
          <button type="button" onClick={() => setFocusMode(true)} className="btn btn-ghost !py-2 !text-sm">
            <Icon name="Maximize2" size={15} /> <span className="hidden sm:inline">Focus</span>
          </button>
          <Link to={`/c/${courseId}/practice`} className="btn btn-ghost !py-2 !text-sm">
            <Icon name="Dumbbell" size={15} /> <span className="hidden sm:inline">Practice</span>
          </Link>
        </TopBar>
      )}

      <Page className={focusMode ? "!max-w-4xl py-8 sm:py-10" : undefined}>
        <div className={cn("grid gap-8", !focusMode && "lg:grid-cols-[1fr_220px]")}>
          <article className="min-w-0 max-w-[70ch]">
            {!focusMode && (
              <>
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
              </>
            )}

            {/* collapsible TOC for phones (the sidebar only exists on lg+) */}
            {!focusMode && toc.length > 1 && (
              <details className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 lg:hidden">
                <summary className="cursor-pointer select-none text-sm font-bold text-[var(--color-muted)]">
                  On this page · {toc.length} sections
                </summary>
                <nav className="mt-2 space-y-0.5 border-l border-[var(--color-line)]">
                  {toc.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => scrollToSection(t.id)}
                      className="block w-full py-1 pl-3 text-left text-sm text-[var(--color-muted)]"
                    >
                      {rtInline(t.text)}
                    </button>
                  ))}
                </nav>
              </details>
            )}

            {/* body */}
            <div className={focusMode ? "mt-0" : "mt-8"}>
              {lesson.blocks.map((b, i) => (
                <Block
                  key={i}
                  block={b.kind === "heading" ? { ...b, id: b.id ?? `h-${i}` } : b}
                  courseId={courseId}
                />
              ))}
            </div>

            {/* footer */}
            {!focusMode && (
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
            )}
          </article>

          {/* TOC */}
          {!focusMode && toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                  On this page
                </div>
                <nav className="space-y-1 border-l border-[var(--color-line)]">
                  {toc.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => scrollToSection(t.id)}
                      aria-current={activeToc === t.id ? "location" : undefined}
                      className={cn(
                        "block w-full border-l-2 py-1 pl-3 text-left text-sm transition",
                        activeToc === t.id
                          ? "border-[var(--accent)] font-semibold text-[var(--color-ink)]"
                          : "border-transparent text-[var(--color-muted)] hover:border-[var(--accent)] hover:text-[var(--color-ink)]"
                      )}
                    >
                      {rtInline(t.text)}
                    </button>
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
