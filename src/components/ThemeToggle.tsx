import { Icon } from "./Icon";
import { useTheme } from "../lib/theme";

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle color theme"
      className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] transition hover:border-[var(--accent-line)] hover:text-[var(--color-ink)]"
    >
      <Icon name={theme === "dark" ? "Sun" : "Moon"} size={17} />
    </button>
  );
}
