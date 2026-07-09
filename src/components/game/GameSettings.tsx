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
    >
      <div
        className="surface max-h-[85vh] w-full max-w-lg overflow-y-auto p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Season setup</h2>
          <button onClick={onClose} className="btn btn-ghost !min-h-0 !px-2 !py-1.5">
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
                className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-line)] px-3 py-2.5"
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
                  className="btn btn-ghost !min-h-0 !px-2.5 !py-1 !text-xs"
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
                  className="btn btn-ghost !min-h-0 !px-2.5 !py-1 !text-xs"
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
                      className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-ink)]"
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <label className="mb-5 flex items-center justify-between rounded-xl border border-[var(--color-line)] px-3 py-2.5">
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
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={save} className="btn btn-primary">
            <Icon name="Check" size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
