import { useState } from "react";
import { Icon } from "../Icon";
import { updateSettings, type GameSettings as Settings } from "../../lib/game";
import type { Course } from "../../types";

/* ================================================================== *
 *  GAME SETTINGS — exam dates, focus courses, passed-course archive
 *  and sound. Rendered as a modal from the hub.
 * ================================================================== */

export function GameSettingsModal({
  courses,
  settings,
  onClose,
}: {
  courses: Course[];
  settings: Settings;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<Settings>(settings);

  function save() {
    updateSettings(local);
    onClose();
  }

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Season setup"
    >
      <div
        className="mc-panel arcade-dark relative max-h-[85vh] w-full max-w-lg overflow-y-auto p-5 text-white sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.025]" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="pixel-font text-3xl uppercase leading-none">Season setup</h2>
          <button
            type="button"
            onClick={onClose}
            className="mc-slot arcade-focus-ring grid h-9 w-9 place-items-center text-white/55 hover:text-white"
            aria-label="Close season setup"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)]">
          Courses this season
        </div>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          Focused courses drive the Daily Mix, quests and readiness. Passed courses move to the
          trophy shelf.
        </p>
        <div className="mb-5 grid gap-2">
          {courses.map((c) => {
            const focused = local.focusCourses.includes(c.meta.id);
            const passed = local.passedCourses.includes(c.meta.id);
            return (
              <div
                key={c.meta.id}
                className="mc-slot flex flex-wrap items-center gap-2 px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.meta.title}</span>
                <button
                  onClick={() =>
                    setLocal((s) => ({
                      ...s,
                      focusCourses: toggle(s.focusCourses, c.meta.id),
                      passedCourses: s.passedCourses.filter((x) => x !== c.meta.id),
                    }))
                  }
                  className="arcade-button arcade-button-secondary !min-h-0 !px-2.5 !py-1 !text-base"
                  style={
                    focused && !passed
                      ? { background: "var(--accent-soft)", borderColor: "var(--accent-line)", color: "var(--accent)" }
                      : undefined
                  }
                >
                  <Icon name="Crosshair" size={12} /> Focus
                </button>
                <button
                  onClick={() =>
                    setLocal((s) => ({
                      ...s,
                      passedCourses: toggle(s.passedCourses, c.meta.id),
                      focusCourses: s.focusCourses.filter((x) => x !== c.meta.id),
                    }))
                  }
                  className="arcade-button arcade-button-secondary !min-h-0 !px-2.5 !py-1 !text-base"
                  style={
                    passed
                      ? { background: "var(--good-bg)", borderColor: "var(--good)", color: "var(--good)" }
                      : undefined
                  }
                >
                  <Icon name="Trophy" size={12} /> Passed
                </button>
                {focused && !passed && (
                  <label className="flex w-full items-center gap-2 pt-1 text-xs text-[var(--color-muted)]">
                    <Icon name="CalendarClock" size={13} className="shrink-0" />
                    Exam date
                    <input
                      type="date"
                      value={(local.examDates[c.meta.id] ?? c.meta.examDate ?? "").slice(0, 10)}
                      onChange={(e) =>
                        setLocal((s) => ({
                          ...s,
                          examDates: { ...s.examDates, [c.meta.id]: e.target.value },
                        }))
                      }
                      className="mc-slot arcade-focus-ring px-2 py-1 text-xs text-white outline-none"
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <label className="mc-slot mb-5 flex items-center justify-between px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Icon name={local.sound ? "Volume2" : "VolumeX"} size={16} />
            Sound effects
          </span>
          <input
            type="checkbox"
            checked={local.sound}
            onChange={(e) => setLocal((s) => ({ ...s, sound: e.target.checked }))}
            className="h-4 w-4 accent-[var(--accent)]"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="arcade-button arcade-button-secondary px-4">
            Cancel
          </button>
          <button type="button" onClick={save} className="arcade-button px-4">
            <Icon name="Check" size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
