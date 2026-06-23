interface Props {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
}

export function ProgressRing({ value, size = 64, stroke = 7, label, sub }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      {(label || sub) && (
        <div className="absolute text-center leading-none">
          {label && <div className="text-sm font-bold">{label}</div>}
          {sub && <div className="text-[10px] text-[var(--color-faint)] mt-0.5">{sub}</div>}
        </div>
      )}
    </div>
  );
}
