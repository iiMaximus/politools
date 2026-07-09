import type { Readiness } from "../../lib/game";

/* ================================================================== *
 *  READINESS DIAL — compact SVG arc gauge with the projected grade
 *  in the middle. "Would I pass if the exam were today?"
 * ================================================================== */

function arcColor(score: number): string {
  if (score >= 70) return "var(--good)";
  if (score >= 40) return "var(--warn)";
  return "var(--bad)";
}

export function ReadinessDial({ r, size = 74 }: { r: Readiness; size?: number }) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  // 270° arc, open at the bottom
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75;
  const filled = (r.score / 100) * arcFraction * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg)"
          strokeWidth={stroke}
          strokeDasharray={`${arcFraction * circumference} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arcColor(r.score)}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-lg font-extrabold" style={{ color: arcColor(r.score) }}>
            {r.gradeLabel}
          </div>
          <div className="mt-0.5 text-[8px] uppercase tracking-wider text-[var(--color-faint)]">
            forecast
          </div>
        </div>
      </div>
    </div>
  );
}
