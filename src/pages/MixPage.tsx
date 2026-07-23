import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loadCourses } from "../courses/registry";
import { TopBar, Page } from "../components/Layout";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { Pill } from "../components/ui";
import { QuestionCard } from "./PracticePage";
import {
  buildSession,
  isDue,
  questionIsMastered,
  questionIsReached,
  questionMastery,
  reachedTopics,
  shuffle,
} from "../lib/adaptive";
import { mistakeIsOpen, readProgress, recordAnswer } from "../lib/progress";
import { addBonusXp, consumeUnlock, logMixSession, readGame, useGame } from "../lib/game";
import { sfx } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";
import { isNumeric, type Course, type McqQuestion } from "../types";

/* ================================================================== *
 *  DAILY MIX — retrieval across reached material. Due cards, open
 *  mistakes and weak learned topics lead; unseen topics are excluded
 *  unless the learner explicitly enables Discovery.
 * ================================================================== */

const DECK_SIZE = 20;
const COMBO_BONUS_FROM = 3;
const DISCOVERY_KEY = "polito:mix:discovery";

interface Entry {
  course: Course;
  q: McqQuestion;
  kind: "due" | "rusty" | "mistake" | "weak" | "review" | "learned" | "discovery";
}

function readDiscovery(): boolean {
  try {
    return localStorage.getItem(DISCOVERY_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDiscovery(enabled: boolean) {
  try {
    localStorage.setItem(DISCOVERY_KEY, enabled ? "1" : "0");
  } catch {
    /* private mode / unavailable */
  }
}

export async function buildMixDeck(discovery = false): Promise<Entry[]> {
  const game = readGame();
  const focus = game.settings.focusCourses.filter((id) => !game.settings.passedCourses.includes(id));
  const courses = await loadCourses(focus); // only the focus chunks
  if (!courses.length) return [];

  const perCourse: Entry[][] = courses.map((course) => {
    const progress = readProgress(course.meta.id);
    const reached = reachedTopics(course, progress);
    const dueMistakes: Entry[] = [];
    const due: Entry[] = [];
    const rusty: Entry[] = [];
    const mistakes: Entry[] = [];
    const weak: Entry[] = [];
    const review: Entry[] = [];
    const learned: Entry[] = [];
    const discoveries: Entry[] = [];
    const mcq = course.practice.filter((qq): qq is McqQuestion => !isNumeric(qq));
    // topic focus (set on the course page) narrows the mix to what matters
    const focusT = game.settings.focusTopics?.[course.meta.id];
    const focused = focusT?.length ? mcq.filter((qq) => qq.topic && focusT.includes(qq.topic)) : mcq;
    // Default Mix is retrieval, not roulette: never jump ahead of lessons/attempted topics.
    const pool = discovery
      ? focused
      : focused.filter((q) => questionIsReached(q, course, progress, reached));
    for (const q of buildSession(pool, progress) as McqQuestion[]) {
      const card = progress.cards[q.id];
      const mistake = mistakeIsOpen(card);
      if (isDue(card)) {
        if (mistake) dueMistakes.push({ course, q, kind: "mistake" });
        else if (questionIsMastered(q, card)) rusty.push({ course, q, kind: "rusty" });
        else due.push({ course, q, kind: "due" });
      } else if (mistake) {
        mistakes.push({ course, q, kind: "mistake" });
      } else if (!card || card.attempts === 0) {
        if (questionIsReached(q, course, progress, reached)) learned.push({ course, q, kind: "learned" });
        else discoveries.push({ course, q, kind: "discovery" });
      } else if (questionMastery(q, card) < 0.75) {
        weak.push({ course, q, kind: "weak" });
      } else {
        review.push({ course, q, kind: "review" });
      }
    }
    return [
      ...shuffle(dueMistakes),
      ...shuffle(due),
      ...shuffle(rusty),
      ...shuffle(mistakes),
      ...shuffle(weak),
      ...shuffle(review),
      ...shuffle(learned),
      ...shuffle(discoveries),
    ];
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
  const gameState = useGame(); // re-render on game-state changes (quests completing, etc.)
  const [deck, setDeck] = useState<Entry[] | null>(null); // null = chunks loading
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [discovery, setDiscovery] = useState(readDiscovery);
  const [byCourse, setByCourse] = useState<Record<string, { correct: number; total: number }>>({});
  const loggedRef = useRef(false);
  const startedRef = useRef(Date.now());
  const questionStartedRef = useRef(Date.now());
  const activeFocusCount = gameState.settings.focusCourses.filter(
    (id) => !gameState.settings.passedCourses.includes(id)
  ).length;

  // a purchased Double-XP Mix (La Birreria) applies to this session
  const doubleRef = useRef(false);
  const [doubleXp, setDoubleXp] = useState(false);
  useEffect(() => {
    if (doubleRef.current) return;
    doubleRef.current = true;
    if (consumeUnlock("double-mix")) setDoubleXp(true);
  }, []);

  // build the deck once the focus course chunks are in
  useEffect(() => {
    let on = true;
    void buildMixDeck(discovery).then((d) => {
      if (on) {
        setDeck(d);
        startedRef.current = Date.now();
        questionStartedRef.current = Date.now();
      }
    });
    return () => {
      on = false;
    };
  }, [discovery]);

  const done = !!deck && deck.length > 0 && i >= deck.length;
  const entry = deck?.[i];

  const dueInDeck = useMemo(() => deck?.filter((e) => e.kind === "due").length ?? 0, [deck]);
  const rustyInDeck = useMemo(() => deck?.filter((e) => e.kind === "rusty").length ?? 0, [deck]);
  const mistakesInDeck = useMemo(() => deck?.filter((e) => e.kind === "mistake").length ?? 0, [deck]);
  const discoveryInDeck = useMemo(() => deck?.filter((e) => e.kind === "discovery").length ?? 0, [deck]);

  // Log the session exactly once at the end (feeds quests/achievements).
  useEffect(() => {
    if (!done || !deck || loggedRef.current) return;
    loggedRef.current = true;
    const perfect = correctCount === deck.length;
    if (doubleXp) addBonusXp(20); // Double-XP Mix finish bonus
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
    void buildMixDeck(discovery).then((d) => {
      setDeck(d);
      startedRef.current = Date.now();
      questionStartedRef.current = Date.now();
    });
  }

  function toggleDiscovery() {
    const next = !discovery;
    writeDiscovery(next);
    loggedRef.current = false;
    setDeck(null);
    setI(0);
    setPicked(null);
    setCorrectCount(0);
    setCombo(0);
    setBestCombo(0);
    setBonus(0);
    setByCourse({});
    setDiscovery(next);
  }

  function answer(optionId: string) {
    if (picked || !entry) return;
    setPicked(optionId);
    const correct = optionId === entry.q.correct;
    recordAnswer(entry.course.meta.id, entry.q.id, correct, {
      difficulty: entry.q.difficulty,
      selectedAnswer: optionId,
      correctAnswer: entry.q.correct,
      responseMs: Date.now() - questionStartedRef.current,
      mode: "daily-mix",
    });
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
        const amount = doubleXp ? 4 : 2;
        addBonusXp(amount);
        setBonus((b) => b + amount);
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
    const noFocus = activeFocusCount === 0;
    return (
      <>
        <TopBar crumbs={[{ label: "Daily Mix" }]} />
        <Page className="max-w-2xl">
          <div className="mc-panel arcade-dark p-8 text-center text-white">
            <span className="mc-slot mx-auto mb-3 grid h-14 w-14 place-items-center text-[var(--accent)]">
              <Icon name="Shuffle" size={28} />
            </span>
            <h1 className="pixel-font text-3xl uppercase leading-none">
              {noFocus ? "No focus courses selected" : "Nothing reached yet"}
            </h1>
            <p className="mt-2 text-white/55">
              {noFocus
                ? "Pick your season's courses in the hub settings and the Daily Mix will build itself."
                : "Daily Mix now stays inside lessons and topics you have reached. Finish a lesson, answer a practice card, or explicitly enable Discovery."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link to="/" className="arcade-button px-4">
                Back to hub
              </Link>
              {!noFocus && (
                <button onClick={toggleDiscovery} className="arcade-button arcade-button-secondary px-4">
                  <Icon name="Sparkles" size={16} /> Include discovery cards
                </button>
              )}
            </div>
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
          <div className="mc-panel arcade-dark relative overflow-hidden p-8 text-center text-white">
            <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
            <span className="mc-slot relative mx-auto mb-3 grid h-14 w-14 place-items-center text-[var(--accent)]">
              <Icon name={pct >= 80 ? "PartyPopper" : "Flag"} size={28} />
            </span>
            <h1
              className="pixel-font relative text-4xl uppercase leading-none tracking-wide"
              style={{ color: pct >= 80 ? "#7fdc39" : "#fff" }}
            >
              {pct >= 80 ? "Stage clear!" : "Mix complete"}
            </h1>
            <p className="relative mt-2 text-white/55">
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
                    className="mc-slot flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{course.meta.short}</span>
                    <span className="font-mono text-xs text-white/50">
                      {s.correct}/{s.total}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to="/" className="arcade-button px-4">
                <Icon name="House" size={16} /> Back to hub
              </Link>
              <button onClick={anotherMix} className="arcade-button arcade-button-secondary px-4">
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
        <section className="mc-panel arcade-dark relative mb-5 overflow-hidden p-3 text-white sm:p-4">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
          {/* progress + combo strip */}
          <div className="relative flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="mc-slot pixel-font flex items-center gap-2 px-3 py-2 text-lg leading-none">
              <Icon name="ListChecks" size={15} className="text-white/45" />
              {i + 1}/{deck.length}
            </div>
            <ComboMeter combo={combo} />
            {doubleXp && (
              <span className="pixel-font rounded-lg bg-[#f5b942] px-2 py-1 text-base leading-none text-[#4a2c00]">
                2× XP
              </span>
            )}
            <div className="flex w-full flex-wrap items-center gap-2 text-xs text-white/50 sm:ml-auto sm:w-auto sm:justify-end">
              {dueInDeck > 0 && <Pill tone="warn">{dueInDeck} due</Pill>}
              {rustyInDeck > 0 && <Pill tone="neutral">{rustyInDeck} rusty</Pill>}
              {mistakesInDeck > 0 && <Pill tone="warn">{mistakesInDeck} mistakes</Pill>}
              {discoveryInDeck > 0 && <Pill tone="accent">{discoveryInDeck} discovery</Pill>}
              <button
                type="button"
                onClick={toggleDiscovery}
                className="mc-slot arcade-focus-ring pixel-font px-2.5 py-1.5 text-base uppercase leading-none text-white/70 transition hover:text-white"
                title="Discovery is the only mode allowed to introduce topics you have not reached"
              >
                Discovery {discovery ? "on" : "off"}
              </button>
            </div>
          </div>

          {/* deck progress bar */}
          <div className="relative my-3 h-2 w-full overflow-hidden rounded-sm border border-black bg-[#111]">
            <div
              className="h-full"
              style={{
                width: `${(i / deck.length) * 100}%`,
                background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <Pill tone="accent">
              <Icon name={entry.course.meta.icon} size={12} /> {entry.course.meta.short}
            </Pill>
            {entry.kind === "due" && <Pill tone="warn">review</Pill>}
            {entry.kind === "mistake" && <Pill tone="warn">mistake retry</Pill>}
            {entry.kind === "weak" && <Pill tone="warn">weak recall</Pill>}
            {entry.kind === "learned" && <Pill tone="neutral">reached topic</Pill>}
            {entry.kind === "discovery" && <Pill tone="accent">discovery</Pill>}
            {entry.kind === "rusty" && (
              <Pill tone="neutral">
                <Icon name="Sparkles" size={12} /> polish the rust
              </Pill>
            )}
          </div>
        </section>

        <QuestionCard
          key={entry.q.id}
          q={entry.q}
          picked={picked}
          retro
          onPick={answer}
          onNext={() => {
            setPicked(null);
            setI((n) => n + 1);
            questionStartedRef.current = Date.now();
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
      className="mc-slot arcade-dark flex items-center gap-2 px-3 py-2"
      style={{
        borderColor: hot ? "#ff9f43" : "var(--color-line)",
        background: hot ? "rgba(255,159,67,0.18)" : undefined,
      }}
    >
      <Icon
        name="Flame"
        size={16}
        style={{ color: hot ? "#ff7a1a" : "var(--color-faint)" }}
      />
      <span className="pixel-font text-xl leading-none" style={{ color: hot ? "#ff9f43" : "rgba(255,255,255,0.65)" }}>
        ×{combo}
      </span>
      {hot && <span className="text-[10px] font-bold uppercase tracking-wide text-[#ff7a1a]">+2 XP/hit</span>}
    </div>
  );
}
