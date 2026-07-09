import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "../courses/registry";
import { CourseTheme } from "../components/CourseTheme";
import { TopBar, Page } from "../components/Layout";
import { CourseNav } from "../components/CourseNav";
import { Icon } from "../components/Icon";
import { Kicker } from "../components/ui";
import { useCourseProgress } from "../lib/progress";
import { dueCount } from "../lib/adaptive";
import { bestBossGrade, useGame } from "../lib/game";
import { bossFor } from "../lib/bosses";
import { cn } from "../lib/cn";
import type { Course, Lesson } from "../types";
import type { CourseProgress } from "../lib/progress";
import { NotFound } from "./NotFound";

/* ================================================================== *
 *  SKILL PATH — a Duolingo-style course map. Lessons and per-lecture
 *  quiz gates unlock in order; the exam boss waits at the end. Built
 *  entirely from the course data + real progress, so it works for
 *  every course automatically.
 * ================================================================== */

interface PathNode {
  id: string;
  kind: "lesson" | "gate" | "boss";
  title: string;
  sub?: string;
  to: string;
  done: boolean;
  header?: string;
}

const GATE_MASTERY = 0.5;

function buildPath(course: Course, progress: CourseProgress, bossDone: boolean): PathNode[] {
  const { lessons, practice } = course;
  const nodes: PathNode[] = [];

  // distinct practice topics in first-appearance order
  const topics: string[] = [];
  for (const q of practice) {
    if (q.topic && !topics.includes(q.topic)) topics.push(q.topic);
  }

  const gateDone = (topic: string | null) => {
    const pool = topic ? practice.filter((q) => q.topic === topic) : practice;
    if (!pool.length) return true;
    const mastered = pool.filter((q) => progress.cards[q.id]?.mastered).length;
    return mastered / pool.length >= GATE_MASTERY;
  };

  const gateSub = (topic: string | null) => {
    const pool = topic ? practice.filter((q) => q.topic === topic) : practice;
    const mastered = pool.filter((q) => progress.cards[q.id]?.mastered).length;
    const need = Math.ceil(pool.length * GATE_MASTERY);
    return `lock in ${Math.min(mastered, need)}/${need} cards`;
  };

  // group lessons by lecture (preserving order)
  const groups: { lecture: string; items: Lesson[] }[] = [];
  {
    const idx = new Map<string, { lecture: string; items: Lesson[] }>();
    for (const l of lessons) {
      const key = l.lecture ?? "Lessons";
      let g = idx.get(key);
      if (!g) {
        g = { lecture: key, items: [] };
        idx.set(key, g);
        groups.push(g);
      }
      g.items.push(l);
    }
  }

  // strategy: one topic per lesson (topic-file courses like thermo/ESMM),
  // else one gate per lecture when lecture names double as practice topics
  // (the MA2 modules), else a single generic gate at the end.
  const perLessonTopics = topics.length === lessons.length ? topics : null;
  let lessonIndex = 0;
  let usedLectureGates = false;

  for (const g of groups) {
    g.items.forEach((l, k) => {
      nodes.push({
        id: `lesson:${l.id}`,
        kind: "lesson",
        title: l.title,
        sub: `${l.minutes} min lesson`,
        to: `/c/${course.meta.id}/learn/${l.id}`,
        done: !!progress.lessons[l.id]?.completed,
        header: k === 0 && groups.length > 1 ? g.lecture : undefined,
      });
      if (perLessonTopics) {
        const topic = perLessonTopics[lessonIndex];
        const pool = practice.filter((q) => q.topic === topic);
        if (pool.length > 0) {
          nodes.push({
            id: `gate:${topic}`,
            kind: "gate",
            title: topic,
            sub: gateSub(topic),
            to: `/c/${course.meta.id}/practice?topic=${encodeURIComponent(topic)}`,
            done: gateDone(topic),
          });
        }
      }
      lessonIndex += 1;
    });
    if (!perLessonTopics && practice.some((q) => q.topic === g.lecture)) {
      usedLectureGates = true;
      nodes.push({
        id: `gate:${g.lecture}`,
        kind: "gate",
        title: `${g.lecture} — checkpoint`,
        sub: gateSub(g.lecture),
        to: `/c/${course.meta.id}/practice?topic=${encodeURIComponent(g.lecture)}`,
        done: gateDone(g.lecture),
      });
    }
  }

  if (!perLessonTopics && !usedLectureGates && practice.length > 0) {
    nodes.push({
      id: "gate:all",
      kind: "gate",
      title: "Grand checkpoint",
      sub: gateSub(null),
      to: `/c/${course.meta.id}/practice`,
      done: gateDone(null),
    });
  }

  const boss = bossFor(course.meta.id);
  nodes.push({
    id: "boss",
    kind: "boss",
    title: boss.name,
    sub: bossDone ? "defeated — rematch for a better grade" : "the final exam awaits",
    to: `/c/${course.meta.id}/boss`,
    done: bossDone,
  });

  return nodes;
}

export function PathPage() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  const progress = useCourseProgress(courseId);
  useGame();
  const bossDone = bestBossGrade(courseId) !== null;

  const nodes = useMemo(
    () => (course ? buildPath(course, progress, bossDone) : []),
    [course, progress, bossDone]
  );

  if (!course) return <NotFound />;
  const { meta } = course;
  const due = dueCount(course.practice, progress);

  // sequential unlock; the boss also unlocks once 80% of the road is done
  const doneCount = nodes.filter((n) => n.done).length;
  const firstNotDone = nodes.findIndex((n) => !n.done);
  const unlockedUpTo = firstNotDone === -1 ? nodes.length - 1 : firstNotDone;
  const isUnlocked = (i: number) =>
    i <= unlockedUpTo ||
    (nodes[i].kind === "boss" && doneCount / Math.max(1, nodes.length - 1) >= 0.8);

  const AMP = 26; // serpentine amplitude, in % of width
  const STEP = 108; // vertical distance between nodes, px
  const x = (i: number) => 50 + AMP * Math.sin(i * 1.05);
  const y = (i: number) => 60 + i * STEP;
  const height = y(nodes.length - 1) + 90;

  // svg path through the nodes (smooth quadratics through midpoints)
  let d = `M ${x(0)} ${y(0)}`;
  for (let i = 1; i < nodes.length; i++) {
    const mx = (x(i - 1) + x(i)) / 2;
    const my = (y(i - 1) + y(i)) / 2;
    d += ` Q ${x(i - 1)} ${my - STEP / 4}, ${mx} ${my} T ${x(i)} ${y(i)}`;
  }

  return (
    <CourseTheme accent={meta.accent} accent2={meta.accent2}>
      <TopBar crumbs={[{ label: meta.short, to: `/c/${courseId}` }, { label: "Path" }]} />
      <Page className="max-w-3xl">
        <div className="mb-4">
          <CourseNav courseId={courseId} due={due} />
        </div>

        <div className="mb-2 flex items-end justify-between">
          <div>
            <Kicker>Skill path</Kicker>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{meta.title}</h1>
          </div>
          <span className="text-sm font-semibold text-[var(--color-muted)]">
            {doneCount}/{nodes.length} conquered
          </span>
        </div>
        <p className="mb-6 text-sm text-[var(--color-muted)]">
          Follow the road: read the lesson, pass its checkpoint, repeat — the boss guards the end.
          Checkpoints open when the previous step is done.
        </p>

        <div className="relative" style={{ height }}>
          {/* the road */}
          <svg
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d={d}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="0.1 9"
            />
          </svg>

          {nodes.map((n, i) => {
            const unlocked = isUnlocked(i);
            const isCurrent = i === unlockedUpTo && !n.done;
            return (
              <div key={n.id}>
                {n.header && (
                  <div
                    className="absolute left-0 right-0 -translate-y-1/2 text-center"
                    style={{ top: y(i) - STEP / 2 - 4 }}
                  >
                    <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-faint)]">
                      {n.header}
                    </span>
                  </div>
                )}
                <PathNodeDot
                  node={n}
                  unlocked={unlocked}
                  current={isCurrent}
                  style={{ left: `${x(i)}%`, top: y(i) }}
                  labelSide={x(i) > 50 ? "left" : "right"}
                />
              </div>
            );
          })}
        </div>
      </Page>

      <style>{`@keyframes pathPulse { 0%,100% { box-shadow: 0 0 0 0 var(--accent-soft), 0 0 0 6px var(--accent-soft); } 50% { box-shadow: 0 0 0 6px var(--accent-soft), 0 0 0 14px transparent; } }`}</style>
    </CourseTheme>
  );
}

function PathNodeDot({
  node,
  unlocked,
  current,
  style,
  labelSide,
}: {
  node: PathNode;
  unlocked: boolean;
  current: boolean;
  style: React.CSSProperties;
  labelSide: "left" | "right";
}) {
  const size = node.kind === "boss" ? 76 : node.kind === "gate" ? 60 : 56;
  const icon =
    node.kind === "boss" ? (node.done ? "Trophy" : "Swords") : node.kind === "gate" ? "ShieldCheck" : "BookOpen";

  const dot = (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-4 transition",
        current && "animate-[pathPulse_2s_ease-in-out_infinite]"
      )}
      style={{
        width: size,
        height: size,
        borderColor: node.done
          ? "var(--accent)"
          : unlocked
          ? "var(--accent-line)"
          : "var(--color-line)",
        background: node.done
          ? "linear-gradient(180deg,var(--accent),var(--accent-2))"
          : unlocked
          ? "var(--color-surface)"
          : "var(--color-bg)",
        color: node.done ? "#fff" : unlocked ? "var(--accent)" : "var(--color-faint)",
      }}
    >
      <Icon name={node.done && node.kind !== "boss" ? "Check" : unlocked ? icon : "Lock"} size={size * 0.42} />
    </span>
  );

  const label = (
    <span
      className={cn(
        "max-w-[160px] text-xs leading-snug sm:max-w-[220px]",
        labelSide === "left" ? "text-right" : "text-left"
      )}
    >
      <span className={cn("block font-bold", !unlocked && "text-[var(--color-faint)]")}>{node.title}</span>
      {node.sub && <span className="block text-[10px] text-[var(--color-faint)]">{node.sub}</span>}
    </span>
  );

  const content = (
    <div className={cn("flex items-center gap-3", labelSide === "left" && "flex-row-reverse")}>
      {dot}
      {label}
    </div>
  );

  const positioning: React.CSSProperties = {
    ...style,
    position: "absolute",
    transform: "translate(-50%, -50%)",
  };

  if (!unlocked) {
    return (
      <div style={positioning} title="Complete the previous step to unlock">
        {content}
      </div>
    );
  }
  return (
    <Link to={node.to} style={positioning} className="group">
      {content}
    </Link>
  );
}
