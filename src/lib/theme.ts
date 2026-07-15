import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "polito:theme";
const subs = new Set<() => void>();

export function getTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  // no explicit choice → follow the system
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

export function setTheme(t: Theme) {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
  applyTheme(t);
  subs.forEach((fn) => fn());
}

/** Call once before render to avoid a flash of the wrong theme. */
export function initTheme() {
  applyTheme(getTheme());
  // track system changes while the user hasn't pinned a choice
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const stored = localStorage.getItem(KEY);
      if (stored !== "light" && stored !== "dark") {
        applyTheme(getTheme());
        subs.forEach((fn) => fn());
      }
    });
  } catch {
    /* older browsers */
  }
}

export function useTheme(): [Theme, () => void] {
  const [theme, setT] = useState<Theme>(getTheme());
  useEffect(() => {
    const fn = () => setT(getTheme());
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  }, []);
  return [theme, () => setTheme(theme === "dark" ? "light" : "dark")];
}
