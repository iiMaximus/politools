import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PROFILE_ICONS } from "../lib/cloud-sync";
import { cn } from "../lib/cn";
import { useCloud } from "./CloudProvider";
import { Icon } from "./Icon";

export function CloudAccountButton() {
  const { configured, profile, status, pendingChanges, deviceLabel, setPickerOpen } = useCloud();
  if (!configured) return null;
  const syncing = status === "loading" || status === "syncing";
  return (
    <>
      <Link
        to="/leaderboard"
        className="mc-slot arcade-focus-ring mc-panel-interactive hidden h-10 w-10 place-items-center text-white/60 hover:text-[var(--accent)] sm:grid"
        title="Leaderboard"
        aria-label="Leaderboard"
      >
        <Icon name="Trophy" size={17} />
      </Link>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mc-slot arcade-focus-ring mc-panel-interactive flex h-10 items-center gap-2 px-2.5 text-white"
        title={
          profile
            ? `${deviceLabel}: ${syncStatusLabel(status, pendingChanges)}`
            : "Choose a profile to sync progress"
        }
      >
        <span className="text-lg leading-none">{profile?.avatar ?? "☁️"}</span>
        <span className="pixel-font hidden max-w-28 truncate text-lg uppercase leading-none sm:block">
          {profile?.display_name ?? "Choose profile"}
        </span>
        <span
          className={cn(
            "h-2 w-2 rounded-[1px] shadow-[1px_1px_0_#111]",
            syncing && "animate-pulse bg-[var(--warn)]",
            status === "synced" && "bg-[var(--good)]",
            status === "error" && "bg-[var(--bad)]",
            (status === "pending" || status === "offline") && "bg-[var(--warn)]",
            status === "local" && "bg-[var(--color-faint)]"
          )}
        />
        <span className="sr-only">{syncStatusLabel(status, pendingChanges)}</span>
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
    lastSyncedAt,
    pendingChanges,
    online,
    deviceLabel,
    refreshProfiles,
    chooseProfile,
    addProfile,
    editProfile,
    syncNow,
    clearError,
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
        <div className="retro-divider mt-4" />

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
                    <span className="mc-slot grid h-12 w-12 place-items-center text-2xl">
                      {item.avatar}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="pixel-font block truncate text-xl uppercase leading-none">
                        P{index + 1} · {item.display_name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-white/45">
                        {item.weekly_xp.toLocaleString()} XP this week · {item.total_xp.toLocaleString()} lifetime
                      </span>
                    </span>
                    <span className="pixel-font text-base uppercase leading-none text-[var(--accent)]">
                      {active ? "Active" : "Select ▶"}
                    </span>
                  </button>
                );
              })}
            </div>

            {profiles.length === 0 && status !== "loading" && (
              <div className="mc-slot pixel-font mt-5 p-6 text-center text-lg leading-snug text-white/50">
                No profiles yet. Create the first one and your current local progress becomes its starting point.
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={startNew} className="arcade-button flex-1 px-3">
                <Icon name="Users" size={16} /> New profile
              </button>
              {profile && (
                <button type="button" onClick={startEdit} className="arcade-button arcade-button-secondary flex-1 px-3">
                  <Icon name="PencilRuler" size={16} /> Edit name/icon
                </button>
              )}
            </div>

            {profile ? (
              <div className="mc-slot relative mt-3 overflow-hidden p-3 text-xs text-white/55">
                <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.025]" />
                <div className="pixel-font relative mb-2 text-base uppercase leading-none tracking-[0.16em] text-white/40">
                  Sync terminal
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="relative min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Icon name="CircuitBoard" size={13} className="text-[var(--accent)]" />
                      <span className="truncate">{deviceLabel}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Icon name="Clock" size={12} /> Last synced: {formatSyncTime(lastSyncedAt)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "pixel-font relative shrink-0 border-2 border-black bg-[#181818] px-2 py-1 text-base uppercase leading-none shadow-[inset_1px_1px_0_#444]",
                      status === "error"
                        ? "border-[var(--bad)]/40 text-[var(--bad)]"
                        : status === "offline" || status === "pending"
                          ? "border-[var(--warn)]/40 text-[var(--warn)]"
                          : "border-[var(--good)]/35 text-[var(--good)]"
                    )}
                  >
                    {syncStatusLabel(status, pendingChanges)}
                  </span>
                </div>
                <p className="relative mt-2 leading-relaxed text-white/45">
                  {!online
                    ? "Offline changes stay safely on this device and retry when connection returns."
                    : pendingChanges
                      ? "New progress is waiting to upload."
                      : "This device and your shared profile agree."}
                </p>
                <div className="retro-divider relative mt-3" />
                <div className="relative mt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={busy || status === "syncing" || !online}
                    onClick={() => void run(() => syncNow(true))}
                    className="arcade-focus-ring pixel-font text-lg uppercase leading-none text-[var(--accent)] disabled:opacity-45"
                  >
                    {status === "error" ? "▶ Retry sync" : status === "syncing" ? "Syncing…" : "▶ Sync now"}
                  </button>
                  <Link
                    to="/leaderboard"
                    onClick={() => setPickerOpen(false)}
                    className="arcade-focus-ring pixel-font text-right text-lg uppercase leading-none text-[var(--accent)]"
                  >
                    Trophy board ▶
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mc-slot mt-3 flex items-center justify-between gap-3 px-3 py-2 text-xs text-white/45">
                <span>Local only until you choose a profile</span>
                <Link
                  to="/leaderboard"
                  onClick={() => setPickerOpen(false)}
                  className="pixel-font text-lg uppercase leading-none text-[var(--accent)]"
                >
                  Leaderboard
                </Link>
              </div>
            )}
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
          <div className="mc-slot mt-4 !border-[var(--bad)] bg-[var(--bad-bg)] px-3 py-3 text-sm text-[var(--bad)]">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={17} />
              <span className="flex-1">{localError || error}</span>
            </div>
            <div className="pixel-font mt-2 flex gap-4 pl-6 text-base uppercase leading-none">
              {profile && online && (
                <button type="button" disabled={busy} onClick={() => void run(() => syncNow(true))}>
                  Retry now
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearError();
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function syncStatusLabel(status: string, pending: boolean) {
  if (status === "loading") return "Checking cloud";
  if (status === "syncing") return "Syncing";
  if (status === "error") return "Sync needs attention";
  if (status === "offline") return pending ? "Offline · queued" : "Offline";
  if (status === "pending" || pending) return "Changes pending";
  if (status === "synced") return "Up to date";
  return "Local only";
}

function formatSyncTime(timestamp: number | null) {
  if (!timestamp) return "Not yet";
  const date = new Date(timestamp);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat(undefined, {
    ...(sameDay ? {} : { month: "short", day: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
