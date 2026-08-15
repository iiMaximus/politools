import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page, PageLoader } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Block } from "../components/LessonBlocks";
import { rt, rtInline } from "../components/RichText";
import { markLesson, useCourseProgress } from "../lib/progress";
import { pickFacts, type FunFact } from "../lib/funfacts";
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

function placeFactDrops(blocks: { kind: string }[], count: number): number[] {
  if (!count || blocks.length < 2) return [];
  const eligible = blocks
    .map((block, index) => (block.kind === "heading" || index === blocks.length - 1 ? -1 : index))
    .filter((index) => index >= 0);
  const picked: number[] = [];

  for (let slot = 0; slot < count; slot++) {
    // Keep the extra drops spread through the actual teaching material rather
    // than stacking them beside headings or at the very end of a lesson.
    const target = Math.round(((slot + 1) / (count + 1)) * (blocks.length - 1));
    const nearest = eligible
      .filter((index) => !picked.includes(index))
      .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
    if (nearest !== undefined) picked.push(nearest);
  }

  return picked.sort((a, b) => a - b);
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
  // Memory hooks: one early reward, then topic-specific drops at evenly
  // spaced, meaningful points in the lesson.
  const facts = pickFacts(courseId, lesson);
  const factDropIndices = placeFactDrops(lesson.blocks, Math.max(0, facts.length - 1));

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

      <Page className={focusMode ? "!max-w-5xl py-8 sm:py-10" : "!max-w-[84rem]"}>
        <div className={cn("grid gap-6 xl:gap-8", !focusMode && "lg:grid-cols-[minmax(0,1fr)_244px]")}>
          <article className="min-w-0 w-full">
            {!focusMode && (
              <section className="mc-panel arcade-dark relative overflow-hidden p-5 text-white sm:p-6">
                <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.045]" />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="pixel-font text-base uppercase tracking-[0.25em] text-white/45">
                      Stage {String(idx + 1).padStart(2, "0")}/{String(course.lessons.length).padStart(2, "0")}
                    </span>
                    <span className="mc-slot pixel-font inline-flex items-center gap-1.5 px-2.5 py-1.5 text-lg uppercase leading-none text-white/75">
                      <Icon name="Clock" size={13} /> {lesson.minutes} min
                    </span>
                  </div>
                  <h1 className="pixel-font mt-3 text-4xl uppercase leading-[0.9] tracking-wide sm:text-5xl">
                    {rtInline(lesson.title)}
                  </h1>
                  <p className="mt-3 text-base leading-relaxed text-white/60">{rtInline(lesson.summary)}</p>

                  <div className="retro-divider my-5" />
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div>
                      <div className="pixel-font mb-2 flex items-center gap-2 text-xl uppercase leading-none text-[#ffd45e]">
                        <Icon name="Target" size={16} /> Mission objectives
                      </div>
                      <ul className="grid gap-2">
                        {lesson.objectives.map((objective, objectiveIndex) => (
                          <li key={objectiveIndex} className="flex items-start gap-2 text-sm text-white/65">
                            <span className="pixel-font mt-0.5 text-lg leading-none text-[#7fdc39]">▸</span>
                            <span>{rtInline(objective)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mc-slot flex min-w-32 flex-row items-center gap-3 px-3 py-2 sm:flex-col sm:justify-center sm:text-center">
                      <Icon name={completed ? "CheckCheck" : "ScrollText"} size={22} style={{ color: completed ? "#7fdc39" : "#ffd45e" }} />
                      <div>
                        <div className="pixel-font text-lg uppercase leading-none text-white">
                          {completed ? "Stage clear" : "Possible drop"}
                        </div>
                        <div className="mt-1 text-[10px] text-white/40">
                          {completed ? "Field note secured" : "+1 field note"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* collapsible TOC for phones (the sidebar only exists on lg+) */}
            {!focusMode && toc.length > 1 && (
              <details className="mc-panel arcade-dark mt-4 px-4 py-3 text-white lg:hidden">
                <summary className="pixel-font cursor-pointer select-none text-xl uppercase leading-none text-white/70">
                  Stage map · {toc.length} checkpoints
                </summary>
                <nav className="mt-3 space-y-1 border-l border-white/15">
                  {toc.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => scrollToSection(t.id)}
                      className="block w-full py-1 pl-3 text-left text-sm text-white/55"
                    >
                      {rtInline(t.text)}
                    </button>
                  ))}
                </nav>
              </details>
            )}

            {facts[0] && !focusMode && <FunFactCard fact={facts[0]} />}

            {/* body */}
            <div className={cn("lesson-paper", focusMode ? "mt-0" : "mt-5")}>
              {lesson.blocks.map((b, i) => (
                <Fragment key={i}>
                  <Block
                    block={b.kind === "heading" ? { ...b, id: b.id ?? `h-${i}` } : b}
                    courseId={courseId}
                  />
                  {factDropIndices.includes(i) && (
                    <FunFactCard fact={facts[factDropIndices.indexOf(i) + 1]} />
                  )}
                </Fragment>
              ))}
            </div>

            {/* footer */}
            {!focusMode && (
              <div className="mc-panel arcade-dark relative mt-6 overflow-hidden p-4 text-white sm:p-5">
                <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.04]" />
                <div className="relative">
                  <div className="min-w-0 flex-1">
                    <div className="pixel-font text-base uppercase tracking-[0.22em] text-white/40">
                      {completed ? "Stage cleared" : "End checkpoint"}
                    </div>
                    <div className="pixel-font mt-1 text-2xl uppercase leading-none text-[#ffd45e]">
                      {completed ? "Field note secured" : "Claim your lesson drop"}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => markLesson(courseId, lesson.id, !completed)}
                      className={completed ? "arcade-button arcade-button-secondary w-full px-3 sm:w-auto" : "arcade-button w-full px-3 sm:w-auto"}
                    >
                      <Icon name={completed ? "RotateCcw" : "CheckCheck"} size={16} />
                      {completed ? "Replay stage" : "Stage clear"}
                    </button>
                    {next ? (
                      <Link to={`/c/${courseId}/learn/${next.id}`} className="arcade-button arcade-button-secondary w-full px-3 sm:w-auto">
                        Next stage <Icon name="ArrowRight" size={16} />
                      </Link>
                    ) : (
                      <Link to={`/c/${courseId}/practice`} className="arcade-button arcade-button-secondary w-full px-3 sm:w-auto">
                        Practice course <Icon name="ArrowRight" size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* TOC */}
          {!focusMode && toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="mc-panel arcade-dark sticky top-24 p-3 text-white">
                <div className="pixel-font mb-3 text-xl uppercase leading-none text-white/55">
                  Stage map
                </div>
                <nav className="space-y-1 border-l border-white/15">
                  {toc.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => scrollToSection(t.id)}
                      aria-current={activeToc === t.id ? "location" : undefined}
                      className={cn(
                        "block w-full border-l-2 py-1 pl-3 text-left text-sm transition",
                        activeToc === t.id
                          ? "border-[var(--accent)] font-semibold text-white"
                          : "border-transparent text-white/45 hover:border-[var(--accent)] hover:text-white"
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

/* ------------------------- fun fact card -------------------------- */

const FACT_META = {
  fact: { label: "FUN FACT", icon: "Sparkles" },
  analogy: { label: "ANALOGY", icon: "Lightbulb" },
  mnemonic: { label: "MNEMONIC", icon: "KeyRound" },
} as const;

function FunFactCard({ fact }: { fact: FunFact }) {
  const meta = FACT_META[fact.kind];
  return (
    <aside
      className="mc-panel arcade-dark relative my-6 overflow-hidden p-4 text-white"
    >
      <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div
        className="pixel-font relative mb-1.5 flex items-center gap-1.5 text-xl uppercase leading-none text-[#ffd45e]"
      >
        <Icon name={meta.icon} size={15} /> Item drop · {meta.label}
      </div>
      <div className="prose-lesson relative !text-[0.95rem]">{rt(fact.text)}</div>
    </aside>
  );
}
