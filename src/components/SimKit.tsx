import type { ReactNode } from "react";

/** Labeled range slider with a live value readout. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  format,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-muted)]">{label}</span>
        <span className="font-mono text-sm font-semibold text-[var(--color-ink)]">
          {format ? format(value) : value}
          {unit && <span className="ml-0.5 text-xs text-[var(--color-faint)]">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
        style={{ accentColor: "var(--accent)" }}
      />
    </label>
  );
}

/** A big numeric/text readout tile. */
export function Readout({
  label,
  value,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: "default" | "accent" | "good" | "bad";
}) {
  const colors: Record<string, string> = {
    default: "var(--color-ink)",
    accent: "var(--accent)",
    good: "var(--good)",
    bad: "var(--bad)",
  };
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">{label}</div>
      <div className="font-mono text-lg font-bold leading-tight" style={{ color: colors[tone] }}>
        {value}
      </div>
    </div>
  );
}

export function SimControls({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function ReadoutRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>;
}

export function SimButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost !py-2 !text-sm"
      style={active ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
    >
      {children}
    </button>
  );
}
