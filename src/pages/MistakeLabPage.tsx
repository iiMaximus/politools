import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { loadCourses } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Page, PageLoader, TopBar } from "../components/Layout";
import { rt } from "../components/RichText";
import { Meter, Pill } from "../components/ui";
import { learningSignal } from "../lib/adaptive";
import { checkNumeric } from "../lib/answer";
import { readGame, useGame } from "../lib/game";
import { masteryLabel } from "../lib/mastery";
import {
  markMistakeReviewed,
  mistakeIsOpen,
  readProgress,
  recordAnswer,
  type CardState,
} from "../lib/progress";
import { nextReviewLabel } from "../lib/srs";
import { isNumeric, type Course, type Question } from "../types";
import { QuestionCard } from "./PracticePage";

/* ================================================================== *
 *  MISTAKE LAB
 *  Persistent error inbox across focus courses. Each item exposes the
 *  misconception trail (selected vs expected when the answering surface
 *  supplied it), theory review, an immediate retry and its next SRS date.
 *  Export is route-ready; App.tsx integration is intentionally left to the
 *  root agent that owns routing/navigation.
 * ================================================================== */

interface MistakeItem {
  key: string;
  course: Course;
  q: Question;
  card: CardState;
}

type Filter = "open" | "resolved" | "all";

function answerLabel(q: Question): string {
  return isNumeric(q) ? `${q.answer}${q.unit ? ` ${q.unit}` : ""}` : q.correct;
}

function dateLabel(at: number): string {
  if (!at) return "Earlier progress";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(at);
}

export function MistakeLabPage({ courseId: forcedCourseId }: { courseId?: string } = {}) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const game = useGame();
  // Integration contract: dashboards link to `/mistakes?course=<id>`. A prop or
  // `/mistakes/:courseId` route may still take precedence for embedded/alternate routes.
  const courseId = forcedCourseId ?? params.courseId ?? searchParams.get("course") ?? undefined;
  const ids = useMemo(
    () =>
      courseId
        ? [courseId]
        : game.settings.focusCourses.filter(
            (id) => !game.settings.passedCourses.includes(id)
          ),
    [courseId, game.settings.focusCourses, game.settings.passedCourses]
  );
  const idsKey = ids.join("|");
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState<Filter>("open");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const startedRef = useRef(Date.now());

  useEffect(() => {
    let live = true;
    setCourses(null);
    void loadCourses(ids).then((loaded) => {
      if (live) setCourses(loaded);
    });
    return () => {
      live = false;
    };
    // idsKey is the stable primitive dependency for the requested chunks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const items = useMemo(() => {
    if (!courses) return [];
    const result: MistakeItem[] = [];
    for (const course of courses) {
      const progress = readProgress(course.meta.id);
      for (const q of course.practice) {
        const card = progress.cards[q.id];
        if (!card?.mistake) continue;
        result.push({ key: `${course.meta.id}:${q.id}`, course, q, card });
      }
    }
    return result.sort((a, b) => {
      const openDelta = Number(mistakeIsOpen(b.card)) - Number(mistakeIsOpen(a.card));
      return openDelta || (b.card.mistake?.lastWrongAt ?? 0) - (a.card.mistake?.lastWrongAt ?? 0);
    });
  }, [courses, version]);

  const openCount = items.filter((item) => mistakeIsOpen(item.card)).length;
  const learningCount = items.filter(
    (item) => mistakeIsOpen(item.card) && (item.card.mistake?.correctSince ?? 0) > 0
  ).length;
  const resolvedCount = items.length - openCount;
  const visible = items.filter((item) => {
    if (filter === "all") return true;
    return filter === "open" ? mistakeIsOpen(item.card) : !mistakeIsOpen(item.card);
  });
  const active = items.find((item) => item.key === selectedKey) ?? null;

  function choose(item: MistakeItem) {
    setSelectedKey(item.key);
    setPicked(null);
    setReviewOpen(false);
    startedRef.current = Date.now();
  }

  function openReview(item: MistakeItem) {
    markMistakeReviewed(item.course.meta.id, item.q.id);
    setReviewOpen(true);
    setVersion((n) => n + 1);
  }

  function answer(value: string) {
    if (!active || picked !== null) return;
    const correct = isNumeric(active.q)
      ? checkNumeric(value, active.q)
      : value === active.q.correct;
    setPicked(value);
    recordAnswer(active.course.meta.id, active.q.id, correct, {
      difficulty: active.q.difficulty,
      selectedAnswer: value,
      correctAnswer: answerLabel(active.q),
      responseMs: Date.now() - startedRef.current,
      mode: "mistake-lab",
    });
    setVersion((n) => n + 1);
  }

  if (courses === null) return <PageLoader />;

  return (
    <>
      <TopBar crumbs={[{ label: "Mistake Lab" }]}>
        <Link to="/" className="btn btn-ghost !py-2 !text-sm">
          <Icon name="X" size={16} /> Exit
        </Link>
      </TopBar>
      <Page className="max-w-6xl">
        <section className="mc-panel arcade-dark relative mb-5 overflow-hidden p-5 text-white sm:p-6">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="pixel-font text-base uppercase leading-none tracking-[0.18em] text-[var(--accent)]">
                Diagnose · review · retry
              </div>
              <h1 className="pixel-font mt-2 text-4xl uppercase leading-none tracking-wide sm:text-5xl">
                Mistake Lab
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/55">
                Every wrong answer stays here with its history until later recall proves it is stable.
                A correct retry starts recovery; spaced recall closes the case.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SummaryChip value={openCount} label="open" tone="warn" />
              <SummaryChip value={learningCount} label="recovering" tone="accent" />
              <SummaryChip value={resolvedCount} label="resolved" tone="good" />
            </div>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["open", "resolved", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={
                filter === value
                  ? "arcade-button px-4"
                  : "mc-slot arcade-focus-ring pixel-font px-4 py-2 text-lg uppercase leading-none text-white/70 transition hover:text-white"
              }
            >
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {!visible.length ? (
          <div className="mc-panel arcade-dark relative overflow-hidden p-8 text-center text-white">
            <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
            <span className="mc-slot relative mx-auto mb-3 grid h-14 w-14 place-items-center text-[var(--accent)]">
              <Icon name="FlaskConical" size={30} />
            </span>
            <h2 className="pixel-font relative text-3xl uppercase leading-none">
              {items.length ? "No mistakes in this view" : "No mistake history yet"}
            </h2>
            <p className="relative mx-auto mt-2 max-w-lg text-sm text-white/55">
              Wrong answers from practice, Daily Mix and this lab appear automatically. Legacy open
              mistakes are migrated the first time their course is loaded.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-2">
              {visible.map((item) => (
                <MistakeRow
                  key={item.key}
                  item={item}
                  active={item.key === selectedKey}
                  onChoose={() => choose(item)}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-4">
              {active ? (
                <CourseTheme accent={active.course.meta.accent} accent2={active.course.meta.accent2}>
                  <section className="mc-panel arcade-dark relative overflow-hidden p-3 text-white sm:p-4">
                    <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.03]" />
                    <div className="relative mb-3 flex flex-wrap items-center gap-2">
                      <Pill tone="accent">{active.course.meta.short}</Pill>
                      <Pill tone={mistakeIsOpen(active.card) ? "warn" : "good"}>
                        {mistakeIsOpen(active.card) ? "open case" : "resolved"}
                      </Pill>
                      <button
                        type="button"
                        onClick={() => openReview(active)}
                        className="mc-slot arcade-focus-ring pixel-font ml-auto flex items-center gap-1.5 px-3 py-2 text-base uppercase leading-none text-white/70 transition hover:text-white"
                      >
                        <Icon name="BookOpen" size={14} /> Review theory first
                      </button>
                    </div>

                    {reviewOpen && (
                      <div className="mc-slot relative mb-4 p-4">
                        <div className="pixel-font mb-1 text-lg uppercase leading-none tracking-wider text-[var(--accent)]">
                          Concept review
                        </div>
                        <div className="prose-lesson text-sm text-white/75">
                          {active.q.theory
                            ? rt(active.q.theory)
                            : "Use the explanation after your next attempt to identify the exact failed step."}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <QuestionCard
                        key={`${active.key}:${version}`}
                        q={active.q}
                        picked={picked}
                        retro
                        nextReview={
                          picked === null
                            ? null
                            : nextReviewLabel(readProgress(active.course.meta.id).cards[active.q.id]?.due)
                        }
                        onPick={answer}
                        onNext={() => {
                          setSelectedKey(null);
                          setPicked(null);
                          setReviewOpen(false);
                        }}
                      />

                      <MistakeHistory item={active} />
                    </div>
                  </section>
                </CourseTheme>
              ) : (
                <div className="mc-panel arcade-dark relative overflow-hidden p-8 text-center text-white">
                  <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
                  <span className="mc-slot relative mx-auto mb-3 grid h-14 w-14 place-items-center text-[var(--accent)]">
                    <Icon name="MousePointerClick" size={30} />
                  </span>
                  <h2 className="pixel-font relative text-2xl uppercase leading-none">Pick a case to inspect</h2>
                  <p className="relative mt-2 text-sm text-white/55">
                    Review the misconception trail, then retry the original question.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Page>
    </>
  );
}

function SummaryChip({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "accent" | "good" | "warn";
}) {
  return (
    <div className="mc-slot min-w-20 px-3 py-2 text-center">
      <div
        className="pixel-font text-3xl leading-none"
        style={{ color: tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : "var(--accent)" }}
      >
        {value}
      </div>
      <div className="pixel-font text-sm uppercase leading-none tracking-wider text-white/45">{label}</div>
    </div>
  );
}

function MistakeRow({ item, active, onChoose }: { item: MistakeItem; active: boolean; onChoose: () => void }) {
  const signal = learningSignal(item.q, item.card);
  const mistake = item.card.mistake!;
  const status = mistakeIsOpen(item.card)
    ? mistake.correctSince > 0
      ? "recovering"
      : "needs retry"
    : "resolved";
  return (
    <button
      type="button"
      onClick={onChoose}
      className="mc-panel mc-panel-interactive arcade-dark arcade-focus-ring relative w-full overflow-hidden p-4 text-left text-white"
      style={active ? { borderColor: item.course.meta.accent } : undefined}
    >
      <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.03]" />
      <div className="relative mb-2 flex items-center gap-2">
        <span className="pixel-font text-lg uppercase leading-none" style={{ color: item.course.meta.accent }}>
          {item.course.meta.short}
        </span>
        <Pill tone={status === "resolved" ? "good" : "warn"}>{status}</Pill>
        <span className="ml-auto text-xs text-white/40">{mistake.count} miss{mistake.count === 1 ? "" : "es"}</span>
      </div>
      <div className="relative line-clamp-2 text-sm font-semibold text-white/85">{rt(item.q.prompt)}</div>
      <div className="relative mt-3 flex items-center gap-3">
        <div className="flex-1">
          <Meter value={signal.mastery} />
        </div>
        <span className="pixel-font text-sm uppercase leading-none tracking-wider text-white/45">
          {masteryLabel(signal.mastery)} {Math.round(signal.mastery * 100)}%
        </span>
      </div>
      <div className="relative mt-2 text-xs text-white/35">Last error {dateLabel(mistake.lastWrongAt)}</div>
    </button>
  );
}

function MistakeHistory({ item }: { item: MistakeItem }) {
  const mistake = item.card.mistake!;
  const events = [...mistake.events].reverse().slice(0, 5);
  return (
    <div className="mc-slot mt-4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="History" size={16} className="text-[var(--accent)]" />
        <h3 className="pixel-font text-xl uppercase leading-none">Error history</h3>
        <span className="ml-auto text-xs text-white/40">{mistake.count} total</span>
      </div>
      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={`${event.at}:${i}`} className="rounded-sm border border-black/60 bg-[#202020] px-3 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{dateLabel(event.at)}</span>
              {event.mode && <Pill tone="neutral">{event.mode}</Pill>}
              {event.responseMs != null && (
                <span className="text-white/40">{Math.round(event.responseMs / 1000)}s</span>
              )}
            </div>
            <div className="mt-1 text-white/60">
              {event.selectedAnswer
                ? <>Selected <strong>{event.selectedAnswer}</strong>; expected <strong>{event.correctAnswer ?? answerLabel(item.q)}</strong>.</>
                : "The older answering surface recorded the error but not the selected distractor."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Integration hook: root should register <MistakeLabPage /> at `/mistakes`.
 * Use `/mistakes?course=<id>` to scope the inbox from a course dashboard.
 */
export const MISTAKE_LAB_ROUTE = "/mistakes";

/** Small helper for non-React callers that need the current global inbox count. */
export async function loadOpenMistakeCount(): Promise<number> {
  const game = readGame();
  const ids = game.settings.focusCourses.filter((id) => !game.settings.passedCourses.includes(id));
  const courses = await loadCourses(ids);
  return courses.reduce((sum, course) => {
    const progress = readProgress(course.meta.id);
    return sum + course.practice.filter((q) => mistakeIsOpen(progress.cards[q.id])).length;
  }, 0);
}
