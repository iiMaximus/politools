import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  tone = "accent",
  className,
}: {
  children: ReactNode;
  tone?: "accent" | "neutral" | "good" | "warn";
  className?: string;
}) {
  const tones: Record<string, string> = {
    accent: "accent-chip",
    neutral: "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-line)]",
    good: "bg-[var(--good-bg)] text-[var(--good)] border border-[var(--color-line)]",
    warn: "bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--color-line)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Meter({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg)]", className)}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${v * 100}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div className="surface px-4 py-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-[var(--color-faint)]">{label}</div>
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}
