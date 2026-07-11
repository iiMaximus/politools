import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { rt, rtInline } from "../components/RichText";
import { cn } from "../lib/cn";
import { buildSession, shuffle } from "../lib/adaptive";
import { readProgress, recordAnswer } from "../lib/progress";
import { bestBossGrade, logBossResult, logMiniBossResult, miniBossGrade } from "../lib/game";
import { bossFor } from "../lib/bosses";
import { courseSections, sectionQuestions } from "../lib/path";
import { sfx } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";
import type { ArenaSignal } from "../components/game/BossArena";
import type { Difficulty, Question } from "../types";
import { NotFound } from "./NotFound";

const BossArena = lazy(() => import("../components/game/BossArena"));

/* ================================================================== *
 *  BOSS FIGHT v2 — a full-screen arena. The whole viewport is the
 *  three.js scene; the HUD and question float over it as glass panels.
 *  `?mini=<section>` fights that section's guardian: smaller boss,
 *  scoped deck, 2 hearts. Timers scale with question difficulty so a
 *  hard integral gets a real amount of thinking time.
 * ================================================================== */

const TIME_FOR: Record<Difficulty, number> = { easy: 25, medium: 40, hard: 60 };
/** below this HP fraction the boss ENRAGES: timers shrink, your hits harden */
const ENRAGE_AT = 0.3;
const ENRAGE_TIME_FACTOR = 0.7;
const ENRAGE_LINES = [
  "ENOUGH. No more games, student.",
  "You dare wound me?! FEEL THE PRESSURE.",
  "The clock bends to MY will now!",
];

type Phase = "intro" | "fight" | "victory" | "defeat";

export default function BossPage() {
  const { courseId = "" } = useParams();
  const [params] = useSearchParams();
  const mini = params.get("mini");
  const course = getCourse(courseId);
  if (!course) return <NotFound />;
  return <BossFight key={`${courseId}|${mini ?? ""}`} courseId={courseId} miniSection={mini} />;
}

function BossFight({ courseId, miniSection }: { courseId: string; miniSection: string | null }) {
  const course = getCourse(courseId)!;
  const boss = bossFor(courseId);
  const isMini = miniSection !== null;

  const cfg = isMini
    ? { hp: 60, hearts: 2, deck: 10, name: `Guardian of ${miniSection}`, epithet: `${boss.name}'s lieutenant · mini-boss` }
    : { hp: 100, hearts: 3, deck: 20, name: boss.name, epithet: boss.epithet };

  const best = isMini ? null : bestBossGrade(courseId);
  const bestMini = isMini ? miniBossGrade(courseId, miniSection!) : null;

  const [phase, setPhase] = useState<Phase>("intro");
  const [hp, setHp] = useState(cfg.hp);
  const [hearts, setHearts] = useState(cfg.hearts);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [lastHit, setLastHit] = useState<{ dmg: number; crit: boolean } | null>(null);
  const [taunt, setTaunt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [signal, setSignal] = useState<ArenaSignal>({ kind: null, nonce: 0 });
  const loggedRef = useRef(false);

  const deck = useMemo<Question[]>(() => {
    const progress = readProgress(courseId);
    let pool = course.practice;
    if (isMini) {
      const section = courseSections(course).find((s) => s.title === miniSection);
      const scoped = section ? sectionQuestions(course, section) : [];
      if (scoped.length >= 4) pool = scoped;
    }
    return buildSession(pool, progress).slice(0, cfg.deck);
    // deck frozen per fight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, miniSection]);

  const q = deck[i];
  const enraged = hp > 0 && hp / cfg.hp <= ENRAGE_AT;
  const qTime = q
    ? Math.round(TIME_FOR[q.difficulty] * (enraged ? ENRAGE_TIME_FACTOR : 1))
    : 30;
  const options = useMemo(() => (q ? shuffle(q.options) : []), [q?.id]);

  const send = (kind: ArenaSignal["kind"]) => setSignal((s) => ({ kind, nonce: s.nonce + 1 }));

  /* lock page scroll while in the arena */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* -------- per-question timer (difficulty-scaled) -------- */
  useEffect(() => {
    if (phase !== "fight" || picked !== null || !q) return;
    setTimeLeft(qTime);
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = qTime - (Date.now() - started) / 1000;
      if (left <= 0) {
        window.clearInterval(id);
        answer(null);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i, picked === null]);

  const accuracy = asked ? correct / asked : 0;
  const grade = useMemo(() => {
    if (phase !== "victory") return 17;
    const heartBonus = isMini ? hearts * 1.5 : hearts;
    const g = Math.min(30, 18 + Math.round(accuracy * 9 + heartBonus));
    return g === 30 && accuracy === 1 && hearts === cfg.hearts ? 31 : g;
  }, [phase, accuracy, hearts, cfg.hearts, isMini]);

  useEffect(() => {
    if ((phase !== "victory" && phase !== "defeat") || loggedRef.current) return;
    loggedRef.current = true;
    if (isMini) {
      logMiniBossResult(courseId, miniSection!, phase === "victory", grade);
    } else {
      logBossResult(courseId, {
        at: Date.now(),
        won: phase === "victory",
        grade,
        heartsLeft: hearts,
        accuracy,
      });
    }
    if (phase === "victory") {
      sfx.victory();
      fireConfetti({ count: isMini ? 140 : 240, originY: 0.35 });
      // the path celebrates this kill when you return to it
      try {
        sessionStorage.setItem(
          "polito:conquest",
          JSON.stringify({ courseId, section: isMini ? miniSection : null })
        );
      } catch {
        /* ignore */
      }
    } else {
      sfx.defeat();
    }
  }, [phase, courseId, grade, hearts, accuracy, isMini, miniSection]);

  function answer(optionId: string | null) {
    if (picked !== null || !q || phase !== "fight") return;
    setPicked(optionId ?? "⏱");
    setAsked((n) => n + 1);
    const isCorrect = optionId === q.correct;
    recordAnswer(courseId, q.id, isCorrect);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setCorrect((n) => n + 1);
      const speed = timeLeft / qTime;
      const crit = newCombo >= 3 && speed > 0.5;
      let dmg = 8 + Math.round(speed * 6) + Math.min(newCombo - 1, 4);
      if (crit) dmg = Math.round(dmg * 1.5);
      if (enraged) dmg = Math.round(dmg * 1.2); // enraged bosses bleed harder
      setLastHit({ dmg, crit });
      sfx.hit(crit);
      const newHp = Math.max(0, hp - dmg);
      setHp(newHp);
      const crossedEnrage = newHp > 0 && newHp / cfg.hp <= ENRAGE_AT && hp / cfg.hp > ENRAGE_AT;
      if (crossedEnrage) {
        setTaunt(ENRAGE_LINES[Math.floor(Math.random() * ENRAGE_LINES.length)]);
        send("enrage");
      } else {
        setTaunt(boss.hurts[Math.floor(Math.random() * boss.hurts.length)]);
        send(crit ? "crit" : "hit");
      }
      if (newHp <= 0) {
        window.setTimeout(() => {
          send("defeat");
          window.setTimeout(() => setPhase("victory"), 1400);
        }, 500);
      }
    } else {
      setCombo(0);
      setLastHit(null);
      setTaunt(boss.taunts[Math.floor(Math.random() * boss.taunts.length)]);
      sfx.hurt();
      send("attack");
      const left = hearts - 1;
      setHearts(left);
      if (left <= 0) window.setTimeout(() => setPhase("defeat"), 900);
    }
  }

  function next() {
    if (hp <= 0 || hearts <= 0) return;
    setPicked(null);
    setLastHit(null);
    setTaunt(null);
    if (i + 1 >= deck.length) setPhase("defeat");
    else setI((n) => n + 1);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "intro" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setPhase("fight");
        return;
      }
      if (phase !== "fight") return;
      if (picked === null) {
        const idx = ["1", "2", "3", "4"].indexOf(e.key);
        if (idx >= 0 && options[idx]) {
          e.preventDefault();
          answer(options[idx].id);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, picked, options, hp, hearts, i]);

  const backTo = `/c/${courseId}/path`;
  const timerFrac = timeLeft / qTime;

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#070a16] text-white">
      {/* the arena IS the page */}
      <div className="absolute inset-0">
        <Suspense fallback={<ArenaLoading />}>
          <BossArena
            variant={boss.variant}
            colors={boss.colors}
            hp={hp / cfg.hp}
            signal={signal}
            mini={isMini}
          />
        </Suspense>
      </div>
      {/* cinematic vignettes */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* ======== INTRO ======== */}
      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-end overflow-y-auto pb-10 pt-24">
          <div className="pointer-events-none absolute inset-x-0 top-16 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-white/50">
              {isMini ? `Mini-boss · ${course.meta.short}` : `Final boss · ${course.meta.title}`}
            </div>
            <h1
              className="mt-2 px-4 text-4xl font-black tracking-tight sm:text-6xl"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}
            >
              {cfg.name}
            </h1>
            <div className="mt-1 text-sm font-medium italic text-white/60">{cfg.epithet}</div>
          </div>

          <div className="relative z-10 mx-4 max-w-lg rounded-3xl bg-black/35 p-4 text-center backdrop-blur-sm">
            <p className="text-sm text-white/75" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
              {boss.intro}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/80">
              <RuleChip icon="Swords" text="correct = damage · speed & combos hit harder" />
              <RuleChip icon="Heart" text={`${cfg.hearts} hearts — miss or timeout costs one`} />
              <RuleChip
                icon="Clock"
                text="25s easy · 40s medium · 60s hard"
              />
              <RuleChip icon="Flame" text="below 30% HP it ENRAGES — less time, bigger hits" />
              <RuleChip
                icon={isMini ? "Ghost" : "Beer"}
                text={isMini ? "win = path node conquered · +25 XP" : "win = graded 18–30L · +1 beer"}
              />
            </div>
            {(best || bestMini) && (
              <div className="mt-3 text-xs text-white/50">
                Personal best:{" "}
                <strong className="text-[#ffd45e]">
                  {best ? (best.grade === 31 ? "30 e lode" : best.grade) : bestMini === 31 ? "30L" : bestMini}
                </strong>
              </div>
            )}
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link to={backTo} className="btn btn-ghost !border-white/20 !bg-white/10 !text-white">
                <Icon name="ArrowLeft" size={16} /> Retreat
              </Link>
              <button onClick={() => setPhase("fight")} className="btn btn-primary !px-10 !py-3 !text-base">
                <Icon name="Swords" size={18} /> Fight
              </button>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-white/35">
              press Enter to begin
            </div>
          </div>
        </div>
      )}

      {/* ======== FIGHT HUD ======== */}
      {phase === "fight" && q && (
        <>
          {/* top HUD */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-3 p-3 sm:p-4">
            <Link
              to={backTo}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/80 backdrop-blur transition hover:bg-white/20"
            >
              <Icon name="DoorOpen" size={14} /> Flee
            </Link>
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-white/85">
                <span className="flex min-w-0 items-center gap-2 truncate">
                  {cfg.name}
                  <span className="hidden font-normal text-white/45 sm:inline">· {cfg.epithet}</span>
                  {enraged && (
                    <span className="animate-pulse rounded-full bg-[#ff2d55] px-2 py-0.5 text-[9px] font-black tracking-widest text-white">
                      ENRAGED
                    </span>
                  )}
                </span>
                <span className="ml-2 font-mono">{hp}/{cfg.hp}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/25">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(hp / cfg.hp) * 100}%`,
                    background:
                      hp / cfg.hp > 0.4 ? "linear-gradient(90deg,#ff5e57,#ff9f43)" : "#ff2d55",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex gap-1">
                {Array.from({ length: cfg.hearts }, (_, k) => (
                  <Icon
                    key={k}
                    name="Heart"
                    size={22}
                    className={k < hearts ? "text-[#ff2d55]" : "text-white/15"}
                    style={k < hearts ? { fill: "#ff2d55" } : undefined}
                  />
                ))}
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white/70">
                {i + 1}/{deck.length}
              </span>
            </div>
          </div>

          {/* damage pop + taunt */}
          {lastHit && (
            <div
              key={`${asked}-dmg`}
              className={cn(
                "absolute left-1/2 top-[26%] z-10 -translate-x-1/2 font-mono text-5xl font-black",
                lastHit.crit ? "text-amber-300" : "text-white"
              )}
              style={{ textShadow: "0 4px 18px rgba(0,0,0,0.8)", animation: "bossDmg 0.9s ease-out forwards" }}
            >
              −{lastHit.dmg}
              {lastHit.crit && <span className="ml-2 text-lg font-extrabold">CRIT!</span>}
            </div>
          )}
          {taunt && (
            <div className="pointer-events-none absolute inset-x-0 top-[38%] z-10 text-center">
              <span className="inline-block max-w-md rounded-2xl bg-black/60 px-5 py-2 text-sm font-medium italic text-white/90 backdrop-blur">
                “{taunt}”
              </span>
            </div>
          )}

          {/* question panel */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center p-3 sm:p-5">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f20]/85 shadow-2xl backdrop-blur-xl">
              {/* timer bar */}
              {picked === null && (
                <div className="h-1.5 w-full bg-white/10">
                  <div
                    className="h-full transition-[width] duration-100 ease-linear"
                    style={{
                      width: `${timerFrac * 100}%`,
                      background: timerFrac > 0.35 ? "linear-gradient(90deg,#5fe0a8,#ffd45e)" : "#ff2d55",
                    }}
                  />
                </div>
              )}
              <div className="max-h-[46vh] overflow-y-auto p-4 sm:p-5">
                <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5",
                      q.difficulty === "hard"
                        ? "bg-rose-500/25 text-rose-200"
                        : q.difficulty === "medium"
                        ? "bg-amber-500/25 text-amber-200"
                        : "bg-emerald-500/25 text-emerald-200"
                    )}
                  >
                    {q.difficulty} · {TIME_FOR[q.difficulty]}s
                  </span>
                  {picked === null && (
                    <span className={cn("ml-auto font-mono text-sm", timeLeft < 8 ? "text-[#ff2d55]" : "text-white/60")}>
                      {Math.ceil(timeLeft)}s
                    </span>
                  )}
                  {combo >= 2 && (
                    <span className="font-black text-[#ffb454]">
                      <Icon name="Flame" size={12} className="mr-0.5 inline" />×{combo}
                    </span>
                  )}
                </div>

                <div className="mb-4 text-[1.02rem] font-medium leading-relaxed text-white/95 [&_.katex]:text-white">
                  {rt(q.prompt)}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {options.map((o, idx) => {
                    const answered = picked !== null;
                    const isCorrect = o.id === q.correct;
                    const show = answered && (o.id === picked || isCorrect);
                    return (
                      <button
                        key={o.id}
                        disabled={answered}
                        onClick={() => answer(o.id)}
                        className={cn(
                          "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm text-white/90 transition [&_.katex]:text-white",
                          !answered && "border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10",
                          show && isCorrect && "border-emerald-400/70 bg-emerald-400/15",
                          show && !isCorrect && o.id === picked && "border-rose-400/70 bg-rose-400/15",
                          answered && !show && "border-white/10 opacity-40"
                        )}
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-white/10 font-mono text-[10px] font-bold text-white/60">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{rtInline(o.content)}</span>
                      </button>
                    );
                  })}
                </div>

                {picked !== null && (
                  <div className="mt-4 space-y-3">
                    {picked !== q.correct && (
                      <div className="rounded-xl bg-white/8 p-3 text-sm text-white/80 [&_.katex]:text-white">
                        <span className="font-bold text-rose-300">Correct: {q.correct}. </span>
                        {rtInline(q.explanation)}
                      </div>
                    )}
                    {hp > 0 && hearts > 0 && (
                      <button onClick={next} className="btn btn-primary w-full">
                        {picked === q.correct ? "Press the attack" : "Recover"} <Icon name="ArrowRight" size={16} />
                        <span className="ml-1 text-[10px] opacity-70">(Enter)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======== RESULT ======== */}
      {(phase === "victory" || phase === "defeat") && (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b0f20]/90 p-8 text-center shadow-2xl backdrop-blur-xl">
            <Icon
              name={phase === "victory" ? "Trophy" : "Skull"}
              size={48}
              className="mx-auto mb-3"
              style={{ color: phase === "victory" ? "#ffd45e" : "rgba(255,255,255,0.35)" }}
            />
            <h1 className="text-3xl font-black">
              {phase === "victory" ? (isMini ? "Guardian down!" : `${boss.name} defeated!`) : "You were defeated…"}
            </h1>
            {phase === "victory" ? (
              <>
                <div className="mt-3 text-6xl font-black text-[#5fe0a8]">
                  {grade === 31 ? "30 e lode" : grade}
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {Math.round(accuracy * 100)}% accuracy · {hearts} heart{hearts === 1 ? "" : "s"} left ·{" "}
                  {isMini ? (
                    <span className="font-bold text-[#9d7bff]">path node conquered · +25 XP</span>
                  ) : (
                    <span className="font-bold text-[#ffd45e]">+1 🍺 · +60 XP</span>
                  )}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/60">
                {Math.round(accuracy * 100)}% accuracy — review your mistakes and come back stronger.
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                <Icon name="Swords" size={16} /> Rematch
              </button>
              <Link
                to={`/c/${courseId}/practice?mode=due`}
                className="btn btn-ghost !border-white/20 !bg-white/10 !text-white"
              >
                <Icon name="RotateCcw" size={16} /> Review mistakes
              </Link>
              <Link to={backTo} className="btn btn-ghost !border-white/20 !bg-white/10 !text-white">
                <Icon name="Map" size={16} /> Path
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes bossDmg { 0% { opacity: 0; transform: translate(-50%, 14px) scale(0.7); } 20% { opacity: 1; transform: translate(-50%, 0) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -46px) scale(1); } }`}</style>
    </div>
    </CourseTheme>
  );
}

function RuleChip({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
      <Icon name={icon} size={13} className="shrink-0 opacity-80" />
      {text}
    </span>
  );
}

function ArenaLoading() {
  return (
    <div className="grid h-full w-full place-items-center text-sm text-white/50">
      Summoning the boss…
    </div>
  );
}
