import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import {
  elapsedLessonTime,
  formatStopwatch,
  readLessonStopwatch,
  writeLessonStopwatch,
} from "../lib/lesson-stopwatch";

export function LessonStopwatch({ focusMode = false }: { focusMode?: boolean }) {
  const [clock, setClock] = useState(readLessonStopwatch);
  const [now, setNow] = useState(Date.now);
  const running = clock.startedAt !== null;

  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(tick);
  }, [running]);

  const start = useCallback(() => {
    const next = writeLessonStopwatch({ ...readLessonStopwatch(), startedAt: Date.now() });
    setNow(Date.now());
    setClock(next);
  }, []);

  const pause = useCallback(() => {
    const current = readLessonStopwatch();
    const stoppedAt = Date.now();
    const next = writeLessonStopwatch({
      elapsedMs: elapsedLessonTime(current, stoppedAt),
      startedAt: null,
    });
    setNow(stoppedAt);
    setClock(next);
  }, []);

  const reset = useCallback(() => {
    const next = writeLessonStopwatch({ elapsedMs: 0, startedAt: null });
    setNow(Date.now());
    setClock(next);
  }, []);

  const elapsed = elapsedLessonTime(clock, now);

  return (
    <div
      className={`sticky z-30 mb-3 ${focusMode ? "top-3" : "top-[4.25rem]"}`}
      data-testid="lesson-stopwatch"
    >
      <div className="mc-panel arcade-dark flex items-center gap-2 px-3 py-2 text-white shadow-lg sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="mc-slot grid h-8 w-8 shrink-0 place-items-center"
            style={{ color: running ? "#7fdc39" : "#ffd45e" }}
          >
            <Icon name={running ? "Timer" : "Clock"} size={16} />
          </span>
          <div className="hidden min-w-0 sm:block">
            <div className="pixel-font text-lg uppercase leading-none text-white/85">Focus stopwatch</div>
            <div className="mt-0.5 text-[10px] text-white/40">{running ? "Tracking this study session" : "Ready when you are"}</div>
          </div>
        </div>

        <output
          className="pixel-font ml-auto min-w-[6.6rem] tabular-nums text-2xl leading-none tracking-wider text-[#ffd45e] sm:ml-2 sm:text-3xl"
          aria-label={`Elapsed study time ${formatStopwatch(elapsed)}`}
          aria-live="off"
        >
          {formatStopwatch(elapsed)}
        </output>

        <button
          type="button"
          onClick={running ? pause : start}
          className="arcade-button !min-h-9 !px-2.5 !py-1 !text-base sm:!px-3"
          aria-label={running ? "Stop stopwatch" : "Start stopwatch"}
        >
          <Icon name={running ? "Pause" : "Play"} size={14} />
          <span className="hidden sm:inline">{running ? "Stop" : "Start"}</span>
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={elapsed < 1000 && !running}
          className="arcade-button arcade-button-secondary !min-h-9 !px-2.5 !py-1 !text-base disabled:cursor-not-allowed disabled:opacity-35 sm:!px-3"
          aria-label="Reset stopwatch"
        >
          <Icon name="RotateCcw" size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
