import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loadCourses } from "../courses/registry";
import { TopBar, Page } from "../components/Layout";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Pill } from "../components/ui";
import { QuestionCard } from "./PracticePage";
import { buildSession, isDue, shuffle } from "../lib/adaptive";
import { readProgress, recordAnswer } from "../lib/progress";
import { addBonusXp, logMixSession, readGame, useGame } from "../lib/game";
import { sfx } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";
import { isNumeric, type Course, type McqQuestion } from "../types";

/* ================================================================== *
 *  DAILY MIX — the one-button session. Interleaves due reviews,
 *  rusty cards and fresh material across all focus courses into a
 *  ~20-card deck with a combo meter and bonus XP for hot streaks.
 * ================================================================== */

const DECK_SIZE = 20;
const COMBO_BONUS_FROM = 3;

interface Entry {
  course: Course;
  q: McqQuestion;
  kind: "due" | "rusty" | "fresh";
}

async function buildMixDeck(): Promise<Entry[]> {
  const game = readGame();
  const focus = game.settings.focusCourses.filter((id) => !game.settings.passedCourses.includes(id));
  const courses = await loadCourses(focus); // only the focus chunks
  if (!courses.length) return [];

  const perCourse: Entry[][] = courses.map((course) => {
    const progress = readProgress(course.meta.id);
    const due: Entry[] = [];
    const rusty: Entry[] = [];
    const fresh: Entry[] = [];
    const mcq = course.practice.filter((qq): qq is McqQuestion => !isNumeric(qq));
    // topic focus (set on the course page) narrows the mix to what matters
    const focusT = game.settings.focusTopics?.[course.meta.id];
    const pool = focusT?.length ? mcq.filter((qq) => qq.topic && focusT.includes(qq.topic)) : mcq;
    for (const q of buildSession(pool, progress) as McqQuestion[]) {
      const card = progress.cards[q.id];
      // SRS: overdue unmastered = review, overdue mastered = polish the rust
      if (isDue(card)) {
        if (card?.mastered) rusty.push({ course, q, kind: "rusty" });
        else due.push({ course, q, kind: "due" });
      } else fresh.push({ course, q, kind: "fresh" });
    }
    return [...shuffle(due), ...shuffle(rusty), ...fresh];
  });

  // round-robin so no course hogs the mix
  const deck: Entry[] = [];
  let i = 0;
  while (deck.length < DECK_SIZE && perCourse.some((list) => i < list.length)) {
    for (const list of perCourse) {
      if (deck.length >= DECK_SIZE) break;
      if (i < list.length) deck.push(list[i]);
    }
    i += 1;
  }
  return deck;
}

export function MixPage() {
  useGame(); // re-render on game-state changes (quests completing, etc.)
  const [deck, setDeck] = useState<Entry[] | null>(null); // null = chunks loading
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [byCourse, setByCourse] = useState<Record<string, { correct: number; total: number }>>({});
  const loggedRef = useRef(false);
  const startedRef = useRef(Date.now());

  // build the deck once the focus course chunks are in
  useEffect(() => {
    let on = true;
    void buildMixDeck().then((d) => {
      if (on) {
        setDeck(d);
        startedRef.current = Date.now();
      }
    });
    return () => {
      on = false;
    };
  }, []);

  const done = !!deck && deck.length > 0 && i >= deck.length;
  const entry = deck?.[i];

  const dueInDeck = useMemo(() => deck?.filter((e) => e.kind === "due").length ?? 0, [deck]);
  const rustyInDeck = useMemo(() => deck?.filter((e) => e.kind === "rusty").length ?? 0, [deck]);

  // Log the session exactly once at the end (feeds quests/achievements).
  useEffect(() => {
    if (!done || !deck || loggedRef.current) return;
    loggedRef.current = true;
    const perfect = correctCount === deck.length;
    logMixSession(perfect, deck.length, (Date.now() - startedRef.current) / 1000);
    if (correctCount / deck.length >= 0.8) {
      sfx.victory();
      fireConfetti({ count: perfect ? 200 : 120 });
    }
  }, [done, correctCount, deck]);

  function anotherMix() {
    loggedRef.current = false;
    setDeck(null);
    setI(0);
    setPicked(null);
    setCorrectCount(0);
    setCombo(0);
    setBestCombo(0);
    setBonus(0);
    setByCourse({});
    void buildMixDeck().then((d) => {
      setDeck(d);
      startedRef.current = Date.now();
    });
  }

  function answer(optionId: string) {
    if (picked || !entry) return;
    setPicked(optionId);
    const correct = optionId === entry.q.correct;
    recordAnswer(entry.course.meta.id, entry.q.id, correct);
    setByCourse((prev) => {
      const s = prev[entry.course.meta.id] ?? { correct: 0, total: 0 };
      return {
        ...prev,
        [entry.course.meta.id]: { correct: s.correct + (correct ? 1 : 0), total: s.total + 1 },
      };
    });
    if (correct) {
      const next = combo + 1;
      setCombo(next);
      setBestCombo((b) => Math.max(b, next));
      setCorrectCount((n) => n + 1);
      sfx.correct(next);
      if (next >= COMBO_BONUS_FROM) {
        addBonusXp(2);
        setBonus((b) => b + 2);
      }
    } else {
      setCombo(0);
      sfx.wrong();
    }
  }

  if (deck === null) {
    return (
      <>
        <TopBar crumbs={[{ label: "Daily Mix" }]} />
        <Page className="max-w-2xl">
          <div className="grid min-h-[40vh] place-items-center">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-faint)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--accent)]" />
              Shuffling your mix…
            </div>
          </div>
        </Page>
      </>
    );
  }

  if (!deck.length) {
    return (
      <>
        <TopBar crumbs={[{ label: "Daily Mix" }]} />
        <Page className="max-w-2xl">
          <div className="surface p-8 text-center">
            <Icon name="Shuffle" size={36} className="mx-auto mb-3 text-[var(--accent)]" />
            <h1 className="text-xl font-bold">No focus courses selected</h1>
            <p className="mt-1 text-[var(--color-muted)]">
              Pick your season's courses in the hub settings and the Daily Mix will build itself.
            </p>
            <Link to="/" className="btn btn-primary mt-4 inline-flex">
              Back to hub
            </Link>
          </div>
        </Page>
      </>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / deck.length) * 100);
    return (
      <>
        <TopBar crumbs={[{ label: "Daily Mix" }]} />
        <Page className="max-w-2xl">
          <div className="surface p-8 text-center">
            <Icon
              name={pct >= 80 ? "PartyPopper" : "Flag"}
              size={40}
              className="mx-auto mb-3 text-[var(--accent)]"
            />
            <h1 className="text-2xl font-extrabold">Mix complete!</h1>
            <p className="mt-1 text-[var(--color-muted)]">
              {correctCount}/{deck.length} correct · {pct}% · best combo ×{bestCombo}
              {bonus > 0 && <> · +{bonus} combo XP</>}
            </p>
            <div className="mx-auto mt-6 grid max-w-sm gap-2 text-left">
              {Object.entries(byCourse).map(([id, s]) => {
                const course = deck.find((e) => e.course.meta.id === id)?.course;
                if (!course) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-line)] px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{course.meta.short}</span>
                    <span className="font-mono text-xs text-[var(--color-muted)]">
                      {s.correct}/{s.total}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to="/" className="btn btn-primary">
                <Icon name="House" size={16} /> Back to hub
              </Link>
              <button onClick={anotherMix} className="btn btn-ghost">
                <Icon name="RotateCcw" size={16} /> Another mix
              </button>
            </div>
          </div>
        </Page>
      </>
    );
  }

  if (!entry) return null;

  return (
    <CourseTheme accent={entry.course.meta.accent} accent2={entry.course.meta.accent2}>
      <TopBar crumbs={[{ label: "Daily Mix" }]}>
        <Link to="/" className="btn btn-ghost !py-2 !text-sm">
          <Icon name="X" size={16} /> Exit
        </Link>
      </TopBar>
      <Page className="max-w-3xl">
        {/* progress + combo strip */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="surface flex items-center gap-2 px-3 py-2 text-sm font-bold">
            <Icon name="ListChecks" size={15} className="text-[var(--color-faint)]" />
            {i + 1}/{deck.length}
          </div>
          <ComboMeter combo={combo} />
          <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-faint)]">
            {dueInDeck > 0 && <Pill tone="warn">{dueInDeck} due</Pill>}
            {rustyInDeck > 0 && <Pill tone="neutral">{rustyInDeck} rusty</Pill>}
          </div>
        </div>

        {/* deck progress bar */}
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(i / deck.length) * 100}%`,
              background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div className="mb-3 flex items-center gap-2">
          <Pill tone="accent">
            <Icon name={entry.course.meta.icon} size={12} /> {entry.course.meta.short}
          </Pill>
          {entry.kind === "due" && <Pill tone="warn">review</Pill>}
          {entry.kind === "rusty" && (
            <Pill tone="neutral">
              <Icon name="Sparkles" size={12} /> polish the rust
            </Pill>
          )}
        </div>

        <QuestionCard
          key={entry.q.id}
          q={entry.q}
          picked={picked}
          onPick={answer}
          onNext={() => {
            setPicked(null);
            setI((n) => n + 1);
          }}
        />
        <p className="mt-3 text-center text-xs text-[var(--color-faint)]">
          Keys: 1–4 answer · Enter next
        </p>
      </Page>
    </CourseTheme>
  );
}

function ComboMeter({ combo }: { combo: number }) {
  const hot = combo >= COMBO_BONUS_FROM;
  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2"
      style={{
        borderColor: hot ? "#ff9f43" : "var(--color-line)",
        background: hot ? "rgba(255,159,67,0.12)" : "var(--color-surface)",
      }}
    >
      <Icon
        name="Flame"
        size={16}
        style={{ color: hot ? "#ff7a1a" : "var(--color-faint)" }}
      />
      <span className="text-sm font-extrabold" style={{ color: hot ? "#ff7a1a" : "var(--color-muted)" }}>
        ×{combo}
      </span>
      {hot && <span className="text-[10px] font-bold uppercase tracking-wide text-[#ff7a1a]">+2 XP/hit</span>}
    </div>
  );
}
