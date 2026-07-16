import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page, PageLoader } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { Icon } from "../components/Icon";
import { useCourseProgress } from "../lib/progress";
import { dueCount } from "../lib/adaptive";
import { bestBossGrade, miniBossGrade, useGame } from "../lib/game";
import { bossFor } from "../lib/bosses";
import { courseSections, topicMastery, GATE_MASTERY } from "../lib/path";
import { fireConfetti } from "../lib/confetti";
import { cn } from "../lib/cn";
import type { Course } from "../types";
import type { CourseProgress } from "../lib/progress";
import type { GameState } from "../lib/game";
import { NotFound } from "./NotFound";

/* ================================================================== *
 *  SKILL PATH v2 — a Duolingo-style adventure map. Each section:
 *  lessons → checkpoint gate → MINI-BOSS, and the final exam boss at
 *  the end of the road. Nodes are chunky pressable buttons on a road
 *  whose conquered segments fill with the course accent.
 * ================================================================== */

interface PathNode {
  id: string;
  kind: "lesson" | "gate" | "miniboss" | "boss";
  title: string;
  sub?: string;
  to: string;
  done: boolean;
  /** section banner rendered before this node */
  banner?: { title: string; done: number; total: number };
  badge?: string;
  /** gold state: gate ≥80% section mastery, mini-boss ≥28, boss 30/30L */
  legendary?: boolean;
  /** gate extras for the popover's checkpoint quiz + progress meter */
  topics?: string[];
  gate?: { mastered: number; need: number; total: number };
  /** minutes for lessons — shown in the popover */
  minutes?: number;
}

function buildPath(course: Course, progress: CourseProgress, game: GameState): PathNode[] {
  const sections = courseSections(course);
  const multi = sections.length > 1;
  const nodes: PathNode[] = [];

  const gateState = (topics: string[]) => {
    const { mastered, total } = topicMastery(course, topics, progress);
    const need = Math.max(1, Math.ceil(total * GATE_MASTERY));
    return {
      done: total > 0 && mastered >= need,
      mastered,
      need,
      total,
      legendary: total > 0 && mastered / total >= 0.8,
    };
  };

  for (const s of sections) {
    const sectionNodes: PathNode[] = [];
    for (const l of s.lessons) {
      sectionNodes.push({
        id: `lesson:${l.id}`,
        kind: "lesson",
        title: l.title,
        sub: `${l.minutes} min`,
        to: `/c/${course.meta.id}/learn/${l.id}`,
        done: !!progress.lessons[l.id]?.completed,
        minutes: l.minutes,
      });
    }
    if (s.topics.length) {
      const g = gateState(s.topics);
      sectionNodes.push({
        id: `gate:${s.title}`,
        kind: "gate",
        title: "Checkpoint",
        sub: g.legendary ? "gold — 80%+ locked in" : g.done ? "cleared" : `lock in ${Math.min(g.mastered, g.need)}/${g.need} cards`,
        to:
          s.topics.length === 1
            ? `/c/${course.meta.id}/practice?topic=${encodeURIComponent(s.topics[0])}`
            : `/c/${course.meta.id}/practice`,
        done: g.done,
        legendary: g.done && g.legendary,
        topics: s.topics,
        gate: { mastered: g.mastered, need: g.need, total: g.total },
      });
      if (multi) {
        const grade = miniBossGrade(course.meta.id, s.title, game);
        sectionNodes.push({
          id: `mini:${s.title}`,
          kind: "miniboss",
          title: `${s.title} guardian`,
          sub: grade ? `defeated · best ${grade === 31 ? "30L" : grade}` : "mini-boss fight",
          to: `/c/${course.meta.id}/boss?mini=${encodeURIComponent(s.title)}`,
          done: grade !== null,
          legendary: grade !== null && grade >= 28,
          badge: grade ? String(grade === 31 ? "30L" : grade) : undefined,
        });
      }
    }
    if (sectionNodes.length) {
      const done = sectionNodes.filter((n) => n.done).length;
      sectionNodes[0].banner = { title: s.title, done, total: sectionNodes.length };
      nodes.push(...sectionNodes);
    }
  }

  // generic gate when nothing produced topic gates
  if (!nodes.some((n) => n.kind === "gate") && course.practice.length) {
    const g = gateState([]);
    nodes.push({
      id: "gate:all",
      kind: "gate",
      title: "Grand checkpoint",
      sub: g.done ? "cleared" : `lock in ${Math.min(g.mastered, g.need)}/${g.need} cards`,
      to: `/c/${course.meta.id}/practice`,
      done: g.done,
      legendary: g.done && g.legendary,
      topics: [],
      gate: { mastered: g.mastered, need: g.need, total: g.total },
    });
  }

  const boss = bossFor(course.meta.id);
  const bossBest = bestBossGrade(course.meta.id, game);
  nodes.push({
    id: "boss",
    kind: "boss",
    title: boss.name,
    sub: bossBest
      ? `defeated · best ${bossBest.grade === 31 ? "30 e lode" : bossBest.grade} — rematch?`
      : "THE FINAL EXAM",
    to: `/c/${course.meta.id}/boss`,
    done: bossBest !== null,
    legendary: bossBest !== null && bossBest.grade >= 30,
  });

  return nodes;
}

export function PathPage() {
  const { courseId = "" } = useParams();
  const { course, loading } = useCourse(courseId);
  const progress = useCourseProgress(courseId);
  const game = useGame();

  const nodes = useMemo(
    () => (course ? buildPath(course, progress, game) : []),
    [course, progress, game]
  );

  // returning from a won fight → celebrate the fallen guardian on the map
  const [conquest, setConquest] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("polito:conquest");
      if (!raw) return;
      const data = JSON.parse(raw) as { courseId: string; section: string | null };
      if (data.courseId !== courseId) return;
      sessionStorage.removeItem("polito:conquest");
      setConquest(
        data.section ? `Guardian of ${data.section} has fallen!` : `${bossFor(courseId).name} has fallen!`
      );
      fireConfetti({ count: 160, originY: 0.3 });
      const t = window.setTimeout(() => setConquest(null), 5000);
      return () => window.clearTimeout(t);
    } catch {
      /* ignore */
    }
  }, [courseId]);

  // node action popover (tap a node → choose read/quiz/fight)
  const [sel, setSel] = useState<PathNode | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const roadRef = useRef<HTMLDivElement | null>(null);

  const doneCount = nodes.filter((n) => n.done).length;
  const firstNotDone = nodes.findIndex((n) => !n.done);
  const currentIdx = firstNotDone === -1 ? nodes.length - 1 : firstNotDone;
  const isUnlocked = (i: number) =>
    i <= currentIdx ||
    (nodes[i].kind === "boss" && doneCount / Math.max(1, nodes.length - 1) >= 0.8);

  /* geometry: gentle 3-lane weave, banners add extra vertical room */
  const STEP = 128;
  const BANNER_EXTRA = 86;
  const ys: number[] = [];
  {
    let y = 40;
    for (const n of nodes) {
      if (n.banner) y += BANNER_EXTRA;
      ys.push(y + 44);
      y += STEP;
    }
  }
  const x = (i: number) => 50 + 27 * Math.sin(i * 0.95 + 0.4);
  const height = ys[ys.length - 1] + 120;

  // long roads used to open at the very top — jump to where you left off
  useEffect(() => {
    if (currentIdx < 3 || !roadRef.current || !ys.length) return;
    const target = roadRef.current.offsetTop + ys[currentIdx] - window.innerHeight * 0.4;
    window.scrollTo({ top: Math.max(0, target) });
    // once per course visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (loading) return <PageLoader />;
  if (!course) return <NotFound />;
  const { meta } = course;
  const due = dueCount(course.practice, progress);

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <TopBar crumbs={[{ label: meta.short, to: `/c/${courseId}` }, { label: "Path" }]}>
        <span className="pixel-font hidden items-center gap-1 text-lg leading-none text-[var(--accent)] sm:flex">
          <Icon name="Flag" size={15} />
          {doneCount}/{nodes.length}
        </span>
      </TopBar>
      <Page className="max-w-2xl">
        {conquest && (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
            <div
              className="mc-panel pixel-font flex items-center gap-2.5 px-5 py-3 text-xl leading-none text-white shadow-2xl"
              style={{ animation: "conquestDrop 0.5s cubic-bezier(0.2,1.4,0.4,1)" }}
            >
              <Icon name="Trophy" size={18} className="text-[#ffd45e]" />
              <span style={{ color: "#ffd45e" }}>{conquest}</span>
            </div>
          </div>
        )}
        <div className="mb-6">
          <CourseNav courseId={courseId} due={due} />
        </div>

        <div ref={roadRef} className="relative" style={{ height }}>
          {/* road segments */}
          <svg
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {nodes.slice(1).map((n, i) => {
              const x1 = x(i);
              const y1 = ys[i];
              const x2 = x(i + 1);
              const y2 = ys[i + 1];
              const my = (y1 + y2) / 2;
              const conquered = nodes[i].done && n.done;
              const open = nodes[i].done;
              return (
                <path
                  key={n.id}
                  d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
                  fill="none"
                  stroke={conquered ? "var(--accent)" : open ? "var(--accent-line)" : "var(--color-line)"}
                  strokeWidth={conquered ? 10 : 9}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  opacity={conquered ? 0.95 : 0.9}
                />
              );
            })}
          </svg>

          {nodes.map((n, i) => {
            const unlocked = isUnlocked(i);
            const current = i === currentIdx && !n.done;
            return (
              <div key={n.id}>
                {n.banner && (
                  <div
                    className="absolute left-0 right-0"
                    style={{ top: ys[i] - 44 - BANNER_EXTRA }}
                  >
                    <div className="mc-panel flex items-center justify-between px-4 py-3 text-white">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="mc-slot grid h-8 w-8 shrink-0 place-items-center" style={{ color: "var(--accent)" }}>
                          <Icon name="MapPinned" size={16} />
                        </span>
                        <span className="pixel-font truncate text-xl uppercase leading-none">
                          {n.banner.title}
                        </span>
                      </div>
                      <span className="pixel-font shrink-0 text-lg leading-none" style={{ color: "#ffd45e" }}>
                        {n.banner.done}/{n.banner.total}
                      </span>
                    </div>
                  </div>
                )}
                <NodeButton
                  node={n}
                  unlocked={unlocked}
                  current={current}
                  x={x(i)}
                  y={ys[i]}
                  onSelect={() => setSel(n)}
                />
              </div>
            );
          })}
        </div>

        {sel && <NodeSheet node={sel} courseId={courseId} onClose={() => setSel(null)} />}

        <div className="pixel-font mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-base leading-none text-[var(--color-faint)]">
          <span className="flex items-center gap-1.5">
            <Icon name="BookOpen" size={12} /> lesson
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={12} /> checkpoint
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="Ghost" size={12} /> mini-boss
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="Swords" size={12} /> final boss
          </span>
        </div>
      </Page>

      <style>{`
        @keyframes pathStart { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -7px); } }
        @keyframes pathHalo { 0%,100% { box-shadow: 0 0 0 0 var(--accent-soft), 0 0 0 10px var(--accent-soft); } 50% { box-shadow: 0 0 0 10px var(--accent-soft), 0 0 0 22px transparent; } }
        @keyframes miniFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes conquestDrop { 0% { opacity: 0; transform: translateY(-24px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </CourseTheme>
  );
}

/* --------------------------- node button --------------------------- */

const NODE_ICON: Record<PathNode["kind"], string> = {
  lesson: "BookOpen",
  gate: "ShieldCheck",
  miniboss: "Ghost",
  boss: "Swords",
};

function NodeButton({
  node,
  unlocked,
  current,
  x,
  y,
  onSelect,
}: {
  node: PathNode;
  unlocked: boolean;
  current: boolean;
  x: number;
  y: number;
  onSelect: () => void;
}) {
  const size = node.kind === "boss" ? 92 : node.kind === "miniboss" ? 76 : 66;
  // locked nodes keep their kind icon (grayed) — a wall of padlocks reads
  // as noise; gray + no link already says "locked"
  const iconName = node.done
    ? node.kind === "boss" || node.kind === "miniboss"
      ? "Trophy"
      : "Check"
    : NODE_ICON[node.kind];

  const villain = node.kind === "miniboss" || node.kind === "boss";
  const gold = !!node.legendary;
  // pressable 3-D face: solid shadow "edge" below the disc
  const face = gold
    ? "linear-gradient(180deg, #ffd45e, #e8a412)"
    : node.done
    ? "linear-gradient(180deg, var(--accent), var(--accent-2))"
    : unlocked
    ? villain
      ? "linear-gradient(180deg, #2b2f45, #171a2c)"
      : "var(--color-surface)"
    : "var(--color-bg)";
  const edgeColor = gold
    ? "#8a5f00"
    : node.done
    ? "color-mix(in oklab, var(--accent-2) 60%, #000)"
    : unlocked
    ? villain
      ? "#0b0d18"
      : "color-mix(in oklab, var(--color-line) 70%, #000 12%)"
    : "var(--color-line)";
  const iconColor = gold
    ? "#6b4a00"
    : node.done
    ? "#fff"
    : unlocked
    ? villain
      ? "#ff8f8f"
      : "var(--accent)"
    : "var(--color-faint)";

  const disc = (
    <span
      className={cn("relative grid place-items-center rounded-full transition-transform", current && "animate-[pathHalo_2.2s_ease-in-out_infinite]", villain && unlocked && !node.done && "animate-[miniFloat_2.6s_ease-in-out_infinite]")}
      style={{
        width: size,
        height: size,
        background: face,
        border: `3px solid ${node.done ? "transparent" : unlocked ? "var(--accent-line)" : "var(--color-line)"}`,
        boxShadow: `0 6px 0 ${edgeColor}`,
        color: iconColor,
      }}
    >
      <Icon name={iconName} size={size * 0.42} />
      {node.done && (
        <span
          className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full shadow"
          style={{ background: gold ? "#fff3c4" : "#ffd45e", color: "#6b4a00" }}
        >
          <Icon name={gold ? "Crown" : "Star"} size={13} />
        </span>
      )}
      {node.badge && !node.done && (
        <span className="absolute -right-1 -top-1 rounded-full bg-[var(--warn)] px-1.5 text-[10px] font-black text-white">
          {node.badge}
        </span>
      )}
    </span>
  );

  const label = (
    <span className="mt-2 block w-44 text-center leading-tight">
      <span
        className={cn(
          "pixel-font block text-base leading-tight",
          !unlocked && "text-[var(--color-faint)]",
          node.kind === "boss" && unlocked && "text-xl uppercase tracking-wide"
        )}
        style={gold ? { color: "#c8901a" } : node.done ? { color: "var(--accent)" } : undefined}
      >
        {node.title}
      </span>
      {node.sub && (
        <span className="pixel-font block text-sm leading-tight text-[var(--color-faint)]">{node.sub}</span>
      )}
    </span>
  );

  const body = (
    <div className="flex flex-col items-center">
      {current && (
        <span
          className="pixel-font absolute -top-9 left-1/2 z-10 animate-[pathStart_1.4s_ease-in-out_infinite] rounded-xl px-3 py-1 text-lg uppercase leading-none tracking-wider text-white shadow-lg"
          style={{ background: "var(--accent)", border: "2px solid #000" }}
        >
          ▶ Start
          <span
            className="absolute left-1/2 top-full -ml-1.5 border-8 border-transparent"
            style={{ borderTopColor: "var(--accent)", borderBottomWidth: 0 }}
          />
        </span>
      )}
      {disc}
      {label}
    </div>
  );

  const pos: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`,
    top: y,
    transform: "translate(-50%, -44px)",
  };

  if (!unlocked) {
    return (
      <div style={pos} className="select-none" title="Finish the previous step to unlock">
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      style={pos}
      className="group select-none text-inherit [&>div>span:first-of-type]:hover:brightness-105 active:[&_span]:translate-y-0.5"
    >
      {body}
    </button>
  );
}

/* ------------------------ node action sheet ------------------------ */

function NodeSheet({ node, courseId, onClose }: { node: PathNode; courseId: string; onClose: () => void }) {
  const quizTo = node.topics?.length
    ? `/c/${courseId}/practice?mode=checkpoint&topics=${encodeURIComponent(node.topics.join("|"))}`
    : `/c/${courseId}/practice?mode=checkpoint`;

  const actions: { label: string; icon: string; to: string; primary?: boolean }[] =
    node.kind === "lesson"
      ? [{ label: node.done ? "Read again" : "Read lesson", icon: "BookOpen", to: node.to, primary: !node.done }]
      : node.kind === "gate"
      ? [
          { label: node.done ? "Retake checkpoint quiz" : "Take checkpoint quiz (8Q · 75%)", icon: "ShieldCheck", to: quizTo, primary: true },
          { label: "Drill these cards", icon: "Dumbbell", to: node.to },
        ]
      : node.kind === "miniboss"
      ? [{ label: node.done ? "Rematch the guardian" : "Fight the guardian", icon: "Ghost", to: node.to, primary: true }]
      : [{ label: node.done ? "Rematch" : "Challenge the boss", icon: "Swords", to: node.to, primary: true }];

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" style={{ animation: "sheetFade 0.18s ease-out" }} />
      <div
        className="mc-panel absolute inset-x-0 bottom-0 mx-auto max-w-lg !rounded-b-none p-5 text-white shadow-2xl"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          animation: "sheetUp 0.22s cubic-bezier(0.2, 1.1, 0.4, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="flex items-center gap-3">
          <span
            className="mc-slot grid h-11 w-11 shrink-0 place-items-center"
            style={{ color: node.legendary ? "#ffd45e" : "var(--accent)" }}
          >
            <Icon name={NODE_ICON[node.kind]} size={22} />
          </span>
          <div className="min-w-0">
            <div className="pixel-font truncate text-2xl leading-none">{node.title}</div>
            <div className="pixel-font mt-1 text-sm leading-none text-white/50">
              {node.legendary ? "★ LEGENDARY — " : ""}
              {node.sub ?? (node.minutes ? `${node.minutes} min` : "")}
            </div>
          </div>
        </div>

        {node.kind === "gate" && node.gate && node.gate.total > 0 && (
          <div className="mt-4">
            <div className="pixel-font mb-1 flex justify-between text-sm leading-none text-white/50">
              <span>SECTION MASTERY</span>
              <span>
                {node.gate.mastered}/{node.gate.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/50">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (node.gate.mastered / node.gate.total) * 100)}%`,
                  background:
                    node.gate.mastered / node.gate.total >= 0.8
                      ? "linear-gradient(90deg,#ffd45e,#e8a412)"
                      : "linear-gradient(90deg,var(--accent),var(--accent-2))",
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2">
          {actions.map((a) =>
            a.primary ? (
              <Link
                key={a.label}
                to={a.to}
                className="pixel-font flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xl uppercase leading-none text-white transition hover:brightness-110"
                style={{
                  background: "linear-gradient(180deg,var(--accent),var(--accent-2))",
                  border: "2px solid #000",
                  boxShadow: "0 3px 0 #000",
                }}
              >
                <Icon name={a.icon} size={17} /> {a.label}
              </Link>
            ) : (
              <Link
                key={a.label}
                to={a.to}
                className="mc-slot pixel-font flex items-center justify-center gap-2 px-3 py-2.5 text-xl uppercase leading-none text-white/85 transition hover:brightness-125"
              >
                <Icon name={a.icon} size={17} /> {a.label}
              </Link>
            )
          )}
        </div>
      </div>
      <style>{`
        @keyframes sheetUp { 0% { transform: translateY(28px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes sheetFade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          [style*="sheetUp"], [style*="sheetFade"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
