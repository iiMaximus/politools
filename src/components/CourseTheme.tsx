import type { CSSProperties, ReactNode } from "react";

/** Re-themes everything inside it to a course's accent colors. */
export function CourseTheme({
  accent,
  accent2,
  children,
  className,
}: {
  accent: string;
  accent2: string;
  children: ReactNode;
  className?: string;
}) {
  const style = {
    "--accent": accent,
    "--accent-2": accent2,
    "--accent-soft": `color-mix(in oklab, ${accent} 16%, transparent)`,
    "--accent-line": `color-mix(in oklab, ${accent} 38%, transparent)`,
  } as CSSProperties;
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
