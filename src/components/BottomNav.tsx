import { Link, useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import { cn } from "../lib/cn";

/* ================================================================== *
 *  BOTTOM TAB BAR — one-handed phone navigation (hidden on ≥sm where
 *  the top bar does the job). App-level destinations only; the
 *  in-course CourseNav strip stays unchanged. Immersive surfaces
 *  (scroll reels, boss arena, mock exams) hide it.
 * ================================================================== */

export function BottomNav() {
  const { pathname } = useLocation();
  const inCourse = pathname.match(/^\/c\/([^/]+)/)?.[1];
  const immersive = /\/(scroll|boss|mock)(\/|$)|\/learn\//.test(pathname);
  if (immersive) return null;

  const tabs = [
    { id: "home", label: "Home", icon: "House", to: "/", active: pathname === "/" },
    { id: "mix", label: "Mix", icon: "Shuffle", to: "/mix", active: pathname === "/mix" },
    ...(inCourse
      ? [
          {
            id: "course",
            label: "Course",
            icon: "BookOpen",
            to: `/c/${inCourse}`,
            active: true,
          },
        ]
      : []),
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-surface)]/90 backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => (
          <Link
            key={t.id}
            to={t.to}
            className={cn(
              "flex min-w-[4.5rem] flex-col items-center gap-0.5 py-2 text-[10px] font-bold",
              t.active ? "text-[var(--accent)]" : "text-[var(--color-faint)]"
            )}
          >
            <Icon name={t.icon} size={20} />
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
