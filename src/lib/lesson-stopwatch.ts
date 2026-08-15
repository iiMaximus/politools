/* ================================================================== *
 *  LESSON STOPWATCH — a tiny persistent clock shared by all lessons.
 *  Store elapsed time plus an absolute start timestamp so background
 *  tabs and page reloads cannot make the clock drift or lose time.
 * ================================================================== */

interface StopwatchState {
  elapsedMs: number;
  startedAt: number | null;
}

const KEY = "polito:lesson-stopwatch:v1";
const EMPTY: StopwatchState = { elapsedMs: 0, startedAt: null };

export function readLessonStopwatch(): StopwatchState {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<StopwatchState> | null;
    if (!parsed) return { ...EMPTY };
    return {
      elapsedMs: Math.max(0, Number(parsed.elapsedMs) || 0),
      startedAt: Number.isFinite(parsed.startedAt) ? Number(parsed.startedAt) : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeLessonStopwatch(state: StopwatchState): StopwatchState {
  const next = {
    elapsedMs: Math.max(0, state.elapsedMs),
    startedAt: state.startedAt,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — the live component can still keep ticking */
  }
  return next;
}

export function pauseLessonStopwatch(now = Date.now()): StopwatchState {
  const state = readLessonStopwatch();
  if (state.startedAt === null) return state;
  return writeLessonStopwatch({
    elapsedMs: state.elapsedMs + Math.max(0, now - state.startedAt),
    startedAt: null,
  });
}

export function elapsedLessonTime(state: StopwatchState, now = Date.now()): number {
  return state.elapsedMs + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt));
}

export function formatStopwatch(milliseconds: number): string {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
