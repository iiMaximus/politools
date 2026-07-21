import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PROFILE_ICONS } from "../lib/cloud-sync";
import { cn } from "../lib/cn";
import { useCloud } from "./CloudProvider";
import { Icon } from "./Icon";

export function CloudAccountButton() {
  const { configured, profile, status, setPickerOpen } = useCloud();
  if (!configured) return null;
  const syncing = status === "loading" || status === "syncing";
  return (
    <>
      <Link
        to="/leaderboard"
        className="hidden h-10 w-10 place-items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] transition hover:border-[var(--color-faint)] hover:text-[var(--accent)] sm:grid"
        title="Leaderboard"
        aria-label="Leaderboard"
      >
        <Icon name="Trophy" size={17} />
      </Link>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex h-10 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 text-sm font-bold transition hover:border-[var(--color-faint)]"
        title={profile ? "Study profile and cloud sync" : "Choose a profile to sync progress"}
      >
        <span className="text-lg leading-none">{profile?.avatar ?? "☁️"}</span>
        <span className="hidden max-w-28 truncate sm:block">
          {profile?.display_name ?? "Choose profile"}
        </span>
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            syncing && "animate-pulse bg-[var(--warn)]",
            status === "synced" && "bg-[var(--good)]",
            status === "error" && "bg-[var(--bad)]",
            status === "local" && "bg-[var(--color-faint)]"
          )}
        />
      </button>
    </>
  );
}

export function CloudProfileModal() {
  const cloud = useCloud();
  const {
    configured,
    pickerOpen,
    setPickerOpen,
    profile,
    profiles,
    status,
    error,
    refreshProfiles,
    chooseProfile,
    addProfile,
    editProfile,
    syncNow,
  } = cloud;
  const [mode, setMode] = useState<"list" | "new" | "edit">("list");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>("🎓");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    setMode("list");
    setName(profile?.display_name ?? "");
    setAvatar(profile?.avatar ?? "🎓");
    setLocalError(null);
    void refreshProfiles();
  }, [pickerOpen, profile?.id, profile?.display_name, profile?.avatar, refreshProfiles]);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setPickerOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [pickerOpen, busy, setPickerOpen]);

  if (!pickerOpen) return null;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setLocalError(null);
    try {
      await action();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  };

  const startNew = () => {
    setMode("new");
    setName("");
    setAvatar(PROFILE_ICONS[profiles.length % PROFILE_ICONS.length]);
    setLocalError(null);
  };

  const startEdit = () => {
    setMode("edit");
    setName(profile?.display_name ?? "");
    setAvatar(profile?.avatar ?? "🎓");
    setLocalError(null);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-end bg-black/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Study profile"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) setPickerOpen(false);
      }}
    >
      <section className="mc-panel arcade-dark relative max-h-[92dvh] w-full overflow-y-auto !rounded-b-none p-5 text-white shadow-2xl sm:max-w-lg sm:!rounded-lg sm:p-6">
        <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.025]" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="pixel-font text-base uppercase leading-none tracking-[0.18em] text-[var(--accent)]">
              Shared study profile
            </div>
            <h2 className="pixel-font mt-1 text-3xl uppercase leading-none">
              {mode === "new" ? "Create a profile" : mode === "edit" ? "Edit your profile" : "Who are you?"}
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Pick the same profile on your phone and laptop. No account or password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="mc-slot arcade-focus-ring grid h-9 w-9 shrink-0 place-items-center text-white/55 transition hover:text-white"
            aria-label="Close profile picker"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {!configured ? (
          <div className="mc-slot mt-5 p-4 text-sm text-white/60">
            Supabase is not connected in this build yet. Local progress continues to work.
          </div>
        ) : mode === "list" ? (
          <>
            <div className="mt-5 grid gap-2">
              {profiles.map((item, index) => {
                const active = item.id === profile?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busy || active}
                    onClick={() => void run(() => chooseProfile(item.id))}
                    className={cn(
                      "mc-slot arcade-focus-ring flex items-center gap-3 p-3 text-left transition",
                      active
                        ? "!border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_22%,#303030)]"
                        : "hover:brightness-110"
                    )}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-sm bg-[#1a1a1a] text-2xl">
                      {item.avatar}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="pixel-font block truncate text-xl leading-none">
                        {index + 1}. {item.display_name}
                      </span>
                      <span className="mt-1 block text-xs text-white/45">
                        {item.total_xp.toLocaleString()} XP · {item.current_streak} day streak
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[var(--accent)]">
                      {active ? "This device" : "Choose"}
                    </span>
                  </button>
                );
              })}
            </div>

            {profiles.length === 0 && status !== "loading" && (
              <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-faint)] p-6 text-center text-sm text-[var(--color-muted)]">
                No profiles yet. Create the first one and your current local progress becomes its starting point.
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={startNew} className="arcade-button flex-1 px-3">
                <Icon name="UserPlus" size={16} /> New profile
              </button>
              {profile && (
                <button type="button" onClick={startEdit} className="arcade-button arcade-button-secondary flex-1 px-3">
                  <Icon name="Pencil" size={16} /> Edit name/icon
                </button>
              )}
            </div>

            <div className="mc-slot mt-3 flex items-center justify-between gap-3 px-3 py-2 text-xs text-white/45">
              <span>
                {status === "syncing" || status === "loading"
                  ? "Syncing…"
                  : status === "synced"
                    ? "Progress saved"
                    : profile
                      ? "Waiting to sync"
                      : "Local only until you choose"}
              </span>
              <div className="flex items-center gap-2">
                {profile && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void run(() => syncNow(true))}
                    className="font-bold text-[var(--accent)]"
                  >
                    Sync now
                  </button>
                )}
                <Link
                  to="/leaderboard"
                  onClick={() => setPickerOpen(false)}
                  className="font-bold text-[var(--accent)]"
                >
                  Leaderboard
                </Link>
              </div>
            </div>
          </>
        ) : (
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (mode === "new") {
                void run(() => addProfile(name, avatar));
              } else {
                void run(async () => {
                  await editProfile(name, avatar);
                  setMode("list");
                });
              }
            }}
          >
            <label className="pixel-font block text-base uppercase leading-none tracking-wider text-white/45">
              Name
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                placeholder="e.g. Maksym"
                className="mc-slot arcade-focus-ring mt-2 w-full px-3 py-3 font-sans text-base font-bold text-white outline-none placeholder:text-white/25 focus:!border-[var(--accent)]"
              />
            </label>
            <fieldset className="mt-5">
              <legend className="pixel-font text-base uppercase leading-none tracking-wider text-white/45">
                Icon
              </legend>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {PROFILE_ICONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={cn(
                      "mc-slot arcade-focus-ring grid aspect-square place-items-center text-2xl transition",
                      avatar === item
                        ? "!border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_24%,#303030)]"
                        : "hover:brightness-110"
                    )}
                    aria-label={"Use " + item + " as profile icon"}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("list")}
                className="arcade-button arcade-button-secondary flex-1 px-3"
                disabled={busy}
              >
                Back
              </button>
              <button
                type="submit"
                className="arcade-button flex-1 px-3"
                disabled={busy || name.trim().length < 2}
              >
                {busy ? "Saving…" : mode === "new" ? "Create & use" : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {(localError || error) && (
          <div className="mt-4 rounded-xl border border-[var(--bad)]/30 bg-[var(--bad-bg)] px-3 py-2 text-sm text-[var(--bad)]">
            {localError || error}
          </div>
        )}
      </section>
    </div>
  );
}
