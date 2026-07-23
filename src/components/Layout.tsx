import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "../lib/cn";
import { CloudAccountButton } from "./CloudAccount";

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Polito Tools home">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl text-[#06080f]"
        style={{ background: "linear-gradient(180deg, var(--accent), var(--accent-2))" }}
      >
        <Icon name="GraduationCap" size={20} />
      </span>
      {!compact && (
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-extrabold tracking-tight">Polito Tools</span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-faint)]">
            Mechanical Eng · PoliTo
          </span>
        </span>
      )}
    </Link>
  );
}

export function TopBar({
  children,
  crumbs,
}: {
  children?: ReactNode;
  crumbs?: { label: string; to?: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] glass pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Brand />
        {crumbs && crumbs.length > 0 && (
          <nav className="hidden items-center gap-1.5 text-sm text-[var(--color-faint)] md:flex">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon name="ChevronRight" size={14} className="opacity-50" />
                {c.to ? (
                  <Link to={c.to} className="transition hover:text-[var(--color-ink)]">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-muted)]">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {children}
          <Link to="/search" className="btn btn-ghost !h-10 !px-3" aria-label="Search all study content">
            <Icon name="Compass" size={17} />
            <span className="hidden lg:inline">Search</span>
          </Link>
          <CloudAccountButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen">
      {/* bottom padding clears the mobile tab bar */}
      <main
        className={cn(
          "mx-auto max-w-6xl px-4 py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-10",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}

/** Course-chunk loading state (code-split registry). */
export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-faint)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--accent)]" />
        Loading course…
      </div>
    </div>
  );
}

export function Tabs({
  items,
  active,
}: {
  items: { id: string; label: string; icon: string; to: string }[];
  active: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-1.5">
      {items.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            active === t.id
              ? "text-[#06080f]"
              : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          )}
          style={
            active === t.id
              ? { background: "linear-gradient(180deg, var(--accent), var(--accent-2))" }
              : undefined
          }
        >
          <Icon name={t.icon} size={16} />
          {t.label}
        </Link>
      ))}
    </div>
  );
}
