import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { Icon } from "../components/Icon";
import { rt, rtInline } from "../components/RichText";
import { cn } from "../lib/cn";
import { buildSession, shuffle } from "../lib/adaptive";
import { readProgress, recordAnswer } from "../lib/progress";
import { bestBossGrade, logBossResult } from "../lib/game";
import { bossFor } from "../lib/bosses";
import { sfx } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";
import type { ArenaSignal } from "../components/game/BossArena";
import type { Question } from "../types";
import { NotFound } from "./NotFound";

const BossArena = lazy(() => import("../components/game/BossArena"));

/* ================================================================== *
 *  BOSS FIGHT — the course exam as a 3-D boss battle.
 *  Correct answers deal damage (speed + combo bonuses, crits); wrong
 *  answers or timeouts cost a heart. Answers still feed the real
 *  adaptive progress, so farming the boss IS studying.
 * ================================================================== */

const BOSS_HP = 100;
const HEARTS = 3;
const DECK = 20;
const SECONDS = 25;

type Phase = "intro" | "fight" | "victory" | "defeat";

export default function BossPage() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  if (!course) return <NotFound />;
  return <BossFight key={courseId} courseId={courseId} />;
}

function BossFight({ courseId }: { courseId: string }) {
  const course = getCourse(courseId)!;
  const boss = bossFor(courseId);
  const best = bestBossGrade(courseId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [hp, setHp] = useState(BOSS_HP);
  const [hearts, setHearts] = useState(HEARTS);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [lastHit, setLastHit] = useState<{ dmg: number; crit: boolean } | null>(null);
  const [taunt, setTaunt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [signal, setSignal] = useState<ArenaSignal>({ kind: null, nonce: 0 });
  const loggedRef = useRef(false);

  const deck = useMemo<Question[]>(() => {
    const progress = readProgress(courseId);
    return buildSession(course.practice, progress).slice(0, DECK);
    // deck frozen per fight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const q = deck[i];
  const options = useMemo(() => (q ? shuffle(q.options) : []), [q?.id]);

  const send = (kind: ArenaSignal["kind"]) => setSignal((s) => ({ kind, nonce: s.nonce + 1 }));

  /* -------- timer -------- */
  useEffect(() => {
    if (phase !== "fight" || picked !== null) return;
    setTimeLeft(SECONDS);
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = SECONDS - (Date.now() - started) / 1000;
      if (left <= 0) {
        window.clearInterval(id);
        answer(null); // timeout = miss
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i, picked === null]);

  /* -------- end-of-fight logging -------- */
  const accuracy = asked ? correct / asked : 0;
  const grade = useMemo(() => {
    if (phase === "victory") {
      const g = Math.min(30, 18 + Math.round(accuracy * 9) + hearts);
      return g === 30 && accuracy === 1 && hearts === HEARTS ? 31 : g;
    }
    return 17;
  }, [phase, accuracy, hearts]);

  useEffect(() => {
    if ((phase !== "victory" && phase !== "defeat") || loggedRef.current) return;
    loggedRef.current = true;
    logBossResult(courseId, {
      at: Date.now(),
      won: phase === "victory",
      grade,
      heartsLeft: hearts,
      accuracy,
    });
    if (phase === "victory") {
      sfx.victory();
      fireConfetti({ count: 220, originY: 0.35 });
    } else {
      sfx.defeat();
    }
  }, [phase, courseId, grade, hearts, accuracy]);

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
      const speed = timeLeft / SECONDS;
      const crit = newCombo >= 3 && speed > 0.55;
      let dmg = 8 + Math.round(speed * 6) + Math.min(newCombo - 1, 4);
      if (crit) dmg = Math.round(dmg * 1.5);
      setLastHit({ dmg, crit });
      setTaunt(boss.hurts[Math.floor(Math.random() * boss.hurts.length)]);
      sfx.hit(crit);
      send(crit ? "crit" : "hit");
      const newHp = Math.max(0, hp - dmg);
      setHp(newHp);
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
      if (left <= 0) {
        window.setTimeout(() => setPhase("defeat"), 900);
      }
    }
  }

  function next() {
    if (hp <= 0 || hearts <= 0) return; // ending animation in progress
    setPicked(null);
    setLastHit(null);
    setTaunt(null);
    if (i + 1 >= deck.length) {
      // out of questions with the boss still standing → it wins
      setPhase("defeat");
    } else {
      setI((n) => n + 1);
    }
  }

  /* -------- keyboard -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  const { meta } = course;

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <TopBar crumbs={[{ label: meta.short, to: `/c/${courseId}` }, { label: "Boss fight" }]}>
        <Link to={`/c/${courseId}`} className="btn btn-ghost !py-2 !text-sm">
          <Icon name="DoorOpen" size={16} /> Flee
        </Link>
      </TopBar>

      <Page className="max-w-4xl">
        {phase === "intro" && (
          <div className="surface overflow-hidden">
            <div className="relative h-72 bg-gradient-to-b from-[#0b1024] to-[#131b38] sm:h-80">
              <Suspense fallback={<ArenaLoading />}>
                <BossArena variant={boss.variant} colors={boss.colors} hp={1} signal={signal} />
              </Suspense>
            </div>
            <div className="p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Final boss · {meta.title}
              </div>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{boss.name}</h1>
              <div className="text-sm font-medium text-[var(--color-muted)]">{boss.epithet}</div>
              <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-muted)]">{boss.intro}</p>

              <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2 text-xs text-[var(--color-muted)]">
                <div className="rounded-xl border border-[var(--color-line)] p-2.5">
                  <Icon name="Swords" size={16} className="mx-auto mb-1 text-[var(--accent)]" />
                  Correct answers deal damage — faster &amp; combos hit harder
                </div>
                <div className="rounded-xl border border-[var(--color-line)] p-2.5">
                  <Icon name="Heart" size={16} className="mx-auto mb-1 text-[var(--bad)]" />
                  {HEARTS} hearts — a miss or timeout costs one
                </div>
                <div className="rounded-xl border border-[var(--color-line)] p-2.5">
                  <Icon name="Beer" size={16} className="mx-auto mb-1 text-[#f5b942]" />
                  Win = graded 18–30L, +1 beer earned
                </div>
              </div>

              {best && (
                <div className="mt-4 text-xs text-[var(--color-faint)]">
                  Personal best: <strong>{best.grade === 31 ? "30 e lode" : best.grade}</strong>
                </div>
              )}

              <button onClick={() => setPhase("fight")} className="btn btn-primary mt-5 px-8">
                <Icon name="Swords" size={18} /> Begin the fight
              </button>
            </div>
          </div>
        )}

        {phase === "fight" && q && (
          <>
            {/* arena */}
            <div className="surface overflow-hidden">
              <div className="relative h-64 bg-gradient-to-b from-[#0b1024] to-[#131b38] sm:h-72">
                <Suspense fallback={<ArenaLoading />}>
                  <BossArena variant={boss.variant} colors={boss.colors} hp={hp / BOSS_HP} signal={signal} />
                </Suspense>

                {/* HP bar */}
                <div className="absolute inset-x-0 top-0 p-3">
                  <div className="mx-auto max-w-lg">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-white/90">
                      <span>
                        {boss.name} <span className="font-normal text-white/50">· {boss.epithet}</span>
                      </span>
                      <span className="font-mono">{hp}/{BOSS_HP}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/20">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(hp / BOSS_HP) * 100}%`,
                          background: hp > 40 ? "linear-gradient(90deg,#ff5e57,#ff9f43)" : "#ff2d55",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* damage pop / taunt */}
                {lastHit && (
                  <div
                    key={`${asked}-dmg`}
                    className={cn(
                      "absolute left-1/2 top-16 -translate-x-1/2 font-mono text-3xl font-black",
                      lastHit.crit ? "text-amber-300" : "text-white"
                    )}
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)", animation: "bossDmg 0.9s ease-out forwards" }}
                  >
                    −{lastHit.dmg}
                    {lastHit.crit && <span className="ml-1 text-sm font-extrabold">CRIT!</span>}
                  </div>
                )}
                {taunt && (
                  <div className="absolute inset-x-0 bottom-2 text-center">
                    <span className="inline-block max-w-md rounded-full bg-black/55 px-4 py-1.5 text-xs font-medium italic text-white/85 backdrop-blur">
                      “{taunt}”
                    </span>
                  </div>
                )}

                {/* hearts + timer */}
                <div className="absolute right-3 top-12 flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: HEARTS }, (_, k) => (
                      <Icon
                        key={k}
                        name="Heart"
                        size={20}
                        className={k < hearts ? "text-[#ff2d55]" : "text-white/20"}
                        style={k < hearts ? { fill: "#ff2d55" } : undefined}
                      />
                    ))}
                  </div>
                  {picked === null && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 font-mono text-xs font-bold backdrop-blur",
                        timeLeft < 6 ? "bg-red-500/80 text-white" : "bg-black/50 text-white/85"
                      )}
                    >
                      {Math.ceil(timeLeft)}s
                    </span>
                  )}
                </div>
              </div>

              {/* question */}
              <div className="p-4 sm:p-6">
                <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-faint)]">
                  <span>
                    Strike {i + 1}/{deck.length}
                  </span>
                  {combo >= 2 && (
                    <span className="font-bold text-[#ff7a1a]">
                      <Icon name="Flame" size={12} className="mr-0.5 inline" />
                      combo ×{combo}
                    </span>
                  )}
                </div>
                <div className="prose-lesson mb-4 !text-[1.05rem] font-medium !text-[var(--color-ink)]">
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
                          "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition",
                          !answered &&
                            "border-[var(--color-line)] hover:border-[var(--accent-line)] hover:bg-[var(--color-surface-2)]",
                          show && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                          show && !isCorrect && o.id === picked && "border-rose-500/60 bg-rose-500/10",
                          answered && !show && "border-[var(--color-line)] opacity-40"
                        )}
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-[var(--color-bg)] font-mono text-[10px] font-bold text-[var(--color-faint)]">
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
                      <div className="rounded-xl bg-[var(--color-bg)] p-3 text-sm">
                        <span className="font-bold text-[var(--bad)]">Correct: {q.correct}. </span>
                        <span className="prose-lesson !text-sm">{rtInline(q.explanation)}</span>
                      </div>
                    )}
                    {hp > 0 && hearts > 0 && (
                      <button onClick={next} className="btn btn-primary w-full">
                        {picked === q.correct ? "Press the attack" : "Recover"}{" "}
                        <Icon name="ArrowRight" size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-[var(--color-faint)]">
              Keys: 1–4 answer · Enter next
            </p>
          </>
        )}

        {(phase === "victory" || phase === "defeat") && (
          <div className="surface p-8 text-center">
            <Icon
              name={phase === "victory" ? "Trophy" : "Skull"}
              size={44}
              className="mx-auto mb-3"
              style={{ color: phase === "victory" ? "#f5b942" : "var(--color-faint)" }}
            />
            <h1 className="text-3xl font-extrabold">
              {phase === "victory" ? `${boss.name} defeated!` : "You were defeated…"}
            </h1>
            {phase === "victory" ? (
              <>
                <div className="mt-3 text-5xl font-black" style={{ color: "var(--good)" }}>
                  {grade === 31 ? "30 e lode" : grade}
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {Math.round(accuracy * 100)}% accuracy · {hearts} heart{hearts === 1 ? "" : "s"} left ·{" "}
                  <span className="font-bold text-[#c98708]">+1 🍺</span> · +60 XP
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {Math.round(accuracy * 100)}% accuracy — review your mistakes and come back. The boss
                remembers nothing; your progress remembers everything.
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                <Icon name="Swords" size={16} /> Rematch
              </button>
              <Link to={`/c/${courseId}/practice?mode=due`} className="btn btn-ghost">
                <Icon name="RotateCcw" size={16} /> Review mistakes
              </Link>
              <Link to="/" className="btn btn-ghost">
                <Icon name="House" size={16} /> Hub
              </Link>
            </div>
          </div>
        )}
      </Page>

      {/* damage-pop keyframes (scoped, tiny) */}
      <style>{`@keyframes bossDmg { 0% { opacity: 0; transform: translate(-50%, 10px) scale(0.7); } 20% { opacity: 1; transform: translate(-50%, 0) scale(1.15); } 100% { opacity: 0; transform: translate(-50%, -34px) scale(1); } }`}</style>
    </CourseTheme>
  );
}

function ArenaLoading() {
  return (
    <div className="grid h-full w-full place-items-center text-sm text-white/60">
      Summoning the boss…
    </div>
  );
}
