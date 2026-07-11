import { Link, useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import { cn } from "../lib/cn";

/** Persistent tab strip for moving between a course's main study modes. */
export function CourseNav({ courseId, due }: { courseId: string; due?: number }) {
  const { pathname } = useLocation();
  const base = `/c/${courseId}`;
  // Keep this strip tight: Scroll lives on the Learn page's "Drill & test"
  // cards and the Boss is reached from the path / hub / Learn page.
  const tabs = [
    { id: "path", label: "Path", icon: "Map", to: `${base}/path`, match: pathname.includes("/path") },
    { id: "overview", label: "Learn", icon: "GraduationCap", to: base, match: pathname === base || pathname.includes("/learn/") || pathname.includes("/scroll") },
    { id: "practice", label: "Practice", icon: "Dumbbell", to: `${base}/practice`, match: pathname.includes("/practice") },
    { id: "exams", label: "Exams", icon: "FileText", to: `${base}/exams`, match: pathname.includes("/exams") },
  ];
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5">
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          className={cn(
            "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition",
            t.match ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          )}
          style={t.match ? { background: "linear-gradient(180deg, var(--accent), var(--accent-2))" } : undefined}
        >
          <Icon name={t.icon} size={16} />
          {t.label}
          {t.id === "practice" && due ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--warn-bg)] px-1 text-[11px] font-bold text-[var(--warn)]">
              {due}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
