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
    { id: "stats", label: "Stats", icon: "Activity", to: "/stats", active: pathname === "/stats" },
    {
      id: "leaderboard",
      label: "Ranks",
      icon: "Trophy",
      to: "/leaderboard",
      active: pathname === "/leaderboard",
    },
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
      className="arcade-dark fixed inset-x-0 bottom-0 z-40 border-t-2 border-black bg-[#212121]/95 shadow-[0_-2px_0_#505050] backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => (
          <Link
            key={t.id}
            to={t.to}
            className={cn(
              "arcade-focus-ring pixel-font my-1 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-sm border-2 border-transparent py-1.5 text-sm uppercase leading-none",
              t.active
                ? "border-black bg-[#373737] text-[var(--accent)] shadow-[inset_1px_1px_0_#505050,inset_-1px_-1px_0_#242424]"
                : "text-white/45"
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
