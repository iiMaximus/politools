import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { Meter } from "./ui";
import { isDue } from "../lib/adaptive";
import type { CourseProgress } from "../lib/progress";
import type { Course } from "../types";

interface LectureRow {
  topic: string;
  module: string;
  total: number;
  mastered: number;
  due: number;
}
interface ModuleGroup {
  module: string;
  lectures: LectureRow[];
  total: number;
  mastered: number;
  due: number;
}

function group(course: Course, progress: CourseProgress): ModuleGroup[] {
  const byTopic = new Map<string, LectureRow>();
  for (const q of course.practice) {
    const topic = q.topic || "General";
    const row =
      byTopic.get(topic) || { topic, module: q.module || "Lectures", total: 0, mastered: 0, due: 0 };
    row.total++;
    if (progress.cards[q.id]?.mastered) row.mastered++;
    if (isDue(progress.cards[q.id])) row.due++;
    if (q.module) row.module = q.module;
    byTopic.set(topic, row);
  }
  const groups: ModuleGroup[] = [];
  const idx = new Map<string, ModuleGroup>();
  for (const row of byTopic.values()) {
    let g = idx.get(row.module);
    if (!g) {
      g = { module: row.module, lectures: [], total: 0, mastered: 0, due: 0 };
      idx.set(row.module, g);
      groups.push(g);
    }
    g.lectures.push(row);
    g.total += row.total;
    g.mastered += row.mastered;
    g.due += row.due;
  }
  return groups;
}

/** Lecture-first practice menu, mirroring the classic site's module → lecture layout. */
export function LecturePicker({ courseId, course, progress }: { courseId: string; course: Course; progress: CourseProgress }) {
  const groups = group(course, progress);
  const totalDue = groups.reduce((a, g) => a + g.due, 0);
  const flat = groups.length === 1 && groups[0].module === "Lectures";

  return (
    <div className="space-y-5">
      {/* quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link to={`/c/${courseId}/practice?mode=all`} className="card-hover surface flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}>
            <Icon name="Shuffle" size={20} />
          </span>
          <div className="min-w-0">
            <div className="font-semibold">Mix everything</div>
            <div className="text-xs text-[var(--color-faint)]">Adaptive across all {course.practice.length} cards</div>
          </div>
          <Icon name="ArrowRight" size={16} className="ml-auto text-[var(--color-faint)]" />
        </Link>
        <Link
          to={`/c/${courseId}/practice?mode=due`}
          className="card-hover surface flex items-center gap-3 p-4"
          style={totalDue ? { borderColor: "var(--warn)" } : undefined}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>
            <Icon name="RotateCcw" size={20} />
          </span>
          <div className="min-w-0">
            <div className="font-semibold">Review mistakes</div>
            <div className="text-xs text-[var(--color-faint)]">{totalDue} card{totalDue === 1 ? "" : "s"} to lock in</div>
          </div>
          <Icon name="ArrowRight" size={16} className="ml-auto text-[var(--color-faint)]" />
        </Link>
      </div>

      {/* by lecture */}
      {groups.map((g) => (
        <div key={g.module}>
          {!flat && (
            <div className="mb-2 flex items-center gap-2 px-1">
              <h3 className="text-sm font-bold tracking-tight">{g.module}</h3>
              <span className="text-xs text-[var(--color-faint)]">
                {g.mastered}/{g.total} mastered
              </span>
              {g.due ? (
                <span className="rounded-full bg-[var(--warn-bg)] px-1.5 text-[11px] font-bold text-[var(--warn)]">{g.due} due</span>
              ) : null}
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {g.lectures.map((l) => (
              <Link
                key={l.topic}
                to={`/c/${courseId}/practice?topic=${encodeURIComponent(l.topic)}`}
                className="card-hover surface flex items-center gap-3 p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{l.topic}</div>
                  <div className="mt-1.5">
                    <Meter value={l.total ? l.mastered / l.total : 0} />
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-[var(--color-faint)]">
                  {l.mastered}/{l.total}
                </span>
                {l.due ? (
                  <span className="shrink-0 rounded-full bg-[var(--warn-bg)] px-1.5 text-[11px] font-bold text-[var(--warn)]">{l.due}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
