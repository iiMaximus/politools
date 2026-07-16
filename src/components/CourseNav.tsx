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
    // phones: a 4-up grid so every tab is visible (no hidden scroll); ≥sm: the roomy strip
    <div className="grid grid-cols-4 gap-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 sm:flex sm:gap-1.5">
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          className={cn(
            "flex items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1 py-2.5 text-xs font-semibold transition sm:shrink-0 sm:justify-start sm:gap-2 sm:px-4 sm:text-sm",
            t.match ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          )}
          style={t.match ? { background: "linear-gradient(180deg, var(--accent), var(--accent-2))" } : undefined}
        >
          <Icon name={t.icon} size={15} className="hidden min-[400px]:block sm:hidden" />
          <Icon name={t.icon} size={16} className="hidden sm:block" />
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
