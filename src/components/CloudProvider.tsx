import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyLocalSnapshot,
  cloudConfigured,
  collectLocalSnapshot,
  createStudyProfile,
  getStudyProfile,
  listStudyProfiles,
  mergeSnapshots,
  readSelectedProfileId,
  readSyncHash,
  saveStudyProfile,
  snapshotHash,
  updateStudyProfile,
  writeSyncMeta,
  type StudyProfile,
} from "../lib/cloud-sync";

export type CloudStatus =
  | "disabled"
  | "local"
  | "loading"
  | "syncing"
  | "synced"
  | "error";

interface CloudContextValue {
  configured: boolean;
  ready: boolean;
  profile: StudyProfile | null;
  profiles: StudyProfile[];
  status: CloudStatus;
  error: string | null;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  refreshProfiles: () => Promise<void>;
  chooseProfile: (profileId: string) => Promise<void>;
  addProfile: (displayName: string, avatar: string) => Promise<void>;
  editProfile: (displayName: string, avatar: string) => Promise<void>;
  syncNow: (force?: boolean) => Promise<void>;
}

const CloudContext = createContext<CloudContextValue | null>(null);

function message(error: unknown) {
  return error instanceof Error ? error.message : "Cloud sync failed. Local progress is still safe.";
}

export function CloudProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!cloudConfigured);
  const [profile, setProfile] = useState<StudyProfile | null>(null);
  const [profiles, setProfiles] = useState<StudyProfile[]>([]);
  const [status, setStatus] = useState<CloudStatus>(cloudConfigured ? "loading" : "disabled");
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const profileRef = useRef<StudyProfile | null>(null);
  const lastHashRef = useRef<string | null>(readSyncHash());
  const uploadRef = useRef<Promise<void> | null>(null);
  const pullRef = useRef<Promise<void> | null>(null);
  const remoteUpdatedAtRef = useRef(0);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const refreshProfiles = useCallback(async () => {
    if (!cloudConfigured) return;
    try {
      const next = await listStudyProfiles();
      setProfiles(next);
      setError(null);
    } catch (cause) {
      setError(message(cause));
      setStatus("error");
    }
  }, []);

  const upload = useCallback(async (force = false) => {
    const selected = profileRef.current;
    if (!cloudConfigured || !selected) return;
    if (uploadRef.current) return uploadRef.current;
    const task = (async () => {
      const snapshot = collectLocalSnapshot();
      const hash = snapshotHash(snapshot);
      if (!force && hash === lastHashRef.current) return;
      setStatus("syncing");
      try {
        const next = await saveStudyProfile(selected.id, snapshot);
        lastHashRef.current = hash;
        remoteUpdatedAtRef.current = Date.parse(next.updated_at) || Date.now();
        writeSyncMeta(selected.id, hash);
        setProfile(next);
        setProfiles((current) => {
          const found = current.some((item) => item.id === next.id);
          const merged = found
            ? current.map((item) => (item.id === next.id ? next : item))
            : [...current, next];
          return merged.sort(
            (left, right) =>
              right.total_xp - left.total_xp ||
              right.current_streak - left.current_streak
          );
        });
        setStatus("synced");
        setError(null);
      } catch (cause) {
        setError(message(cause));
        setStatus("error");
      }
    })();
    uploadRef.current = task;
    try {
      await task;
    } finally {
      uploadRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!cloudConfigured) return;
    let cancelled = false;
    const initialize = async () => {
      setStatus("loading");
      try {
        const available = await listStudyProfiles();
        if (cancelled) return;
        setProfiles(available);
        const selectedId = readSelectedProfileId();
        if (!selectedId) {
          setStatus("local");
          setReady(true);
          return;
        }
        const remote = await getStudyProfile(selectedId);
        if (cancelled) return;
        if (!remote) {
          writeSyncMeta(null);
          setStatus("local");
          setReady(true);
          return;
        }

        const local = collectLocalSnapshot();
        const localHash = snapshotHash(local);
        const previouslySynced = readSyncHash();
        const next =
          previouslySynced && localHash === previouslySynced
            ? remote.progress
            : mergeSnapshots(local, remote.progress);
        const nextHash = snapshotHash(next);
        applyLocalSnapshot(next);
        writeSyncMeta(remote.id, nextHash);
        lastHashRef.current = nextHash;
        const summary: StudyProfile = remote;
        remoteUpdatedAtRef.current = Date.parse(remote.updated_at) || 0;
        setProfile(summary);
        profileRef.current = summary;
        setStatus("synced");
        setReady(true);
        if (nextHash !== snapshotHash(remote.progress)) {
          await upload(true);
        }
      } catch (cause) {
        if (cancelled) return;
        setError(message(cause));
        setStatus("error");
        setReady(true);
      }
    };
    void initialize();
    return () => {
      cancelled = true;
    };
  }, [upload]);

  const pullLatest = useCallback(async () => {
    const selected = profileRef.current;
    if (!cloudConfigured || !selected || pullRef.current) return pullRef.current ?? undefined;
    const task = (async () => {
      try {
        if (uploadRef.current) await uploadRef.current;
        const remote = await getStudyProfile(selected.id);
        if (!remote) return;
        const remoteUpdated = Date.parse(remote.updated_at) || 0;
        if (remoteUpdated <= remoteUpdatedAtRef.current) return;
        const local = collectLocalSnapshot();
        const localHash = snapshotHash(local);
        const next =
          localHash === lastHashRef.current
            ? remote.progress
            : mergeSnapshots(local, remote.progress);
        const nextHash = snapshotHash(next);
        applyLocalSnapshot(next);
        writeSyncMeta(remote.id, nextHash);
        lastHashRef.current = nextHash;
        remoteUpdatedAtRef.current = remoteUpdated;
        if (nextHash !== snapshotHash(remote.progress)) {
          const saved = await saveStudyProfile(remote.id, next);
          remoteUpdatedAtRef.current = Date.parse(saved.updated_at) || Date.now();
        }
        window.location.reload();
      } catch (cause) {
        setError(message(cause));
        setStatus("error");
      }
    })();
    pullRef.current = task;
    try {
      await task;
    } finally {
      pullRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!cloudConfigured || !profile || !ready) return;
    const timer = window.setInterval(() => void upload(false), 2500);
    const flush = () => void upload(false);
    const reactToVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else void pullLatest();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("focus", pullLatest);
    document.addEventListener("visibilitychange", reactToVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("focus", pullLatest);
      document.removeEventListener("visibilitychange", reactToVisibility);
      flush();
    };
  }, [profile, ready, pullLatest, upload]);

  useEffect(() => {
    if (!cloudConfigured) return;
    const timer = window.setInterval(() => {
      void refreshProfiles();
      if (document.visibilityState === "visible") void pullLatest();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [pullLatest, refreshProfiles]);

  const chooseProfile = useCallback(
    async (profileId: string) => {
      setError(null);
      setStatus("loading");
      try {
        const previousId = profileRef.current?.id ?? readSelectedProfileId();
        if (previousId && previousId !== profileId) await upload(true);
        const remote = await getStudyProfile(profileId);
        if (!remote) throw new Error("That profile no longer exists.");
        const next = previousId
          ? remote.progress
          : mergeSnapshots(collectLocalSnapshot(), remote.progress);
        applyLocalSnapshot(next);
        const hash = snapshotHash(next);
        writeSyncMeta(remote.id, hash);
        lastHashRef.current = hash;
        if (!previousId && hash !== snapshotHash(remote.progress)) {
          await saveStudyProfile(remote.id, next);
        }
        window.location.reload();
      } catch (cause) {
        setError(message(cause));
        setStatus("error");
      }
    },
    [upload]
  );

  const addProfile = useCallback(async (displayName: string, avatar: string) => {
    setError(null);
    setStatus("loading");
    try {
      const replacingCurrent = Boolean(profileRef.current);
      if (replacingCurrent) await upload(true);
      const snapshot = replacingCurrent
        ? { version: 1 as const, stores: {}, generatedAt: Date.now() }
        : collectLocalSnapshot();
      const created = await createStudyProfile(displayName, avatar, snapshot);
      if (replacingCurrent) applyLocalSnapshot(snapshot);
      const hash = snapshotHash(snapshot);
      writeSyncMeta(created.id, hash);
      lastHashRef.current = hash;
      window.location.reload();
    } catch (cause) {
      setError(message(cause));
      setStatus("error");
      throw cause;
    }
  }, [upload]);

  const editProfile = useCallback(async (displayName: string, avatar: string) => {
    const selected = profileRef.current;
    if (!selected) return;
    setError(null);
    try {
      const next = await updateStudyProfile(selected.id, displayName, avatar);
      setProfile(next);
      setProfiles((current) =>
        current.map((item) => (item.id === next.id ? next : item))
      );
      setStatus("synced");
    } catch (cause) {
      setError(message(cause));
      setStatus("error");
      throw cause;
    }
  }, []);

  const value = useMemo<CloudContextValue>(
    () => ({
      configured: cloudConfigured,
      ready,
      profile,
      profiles,
      status,
      error,
      pickerOpen,
      setPickerOpen,
      refreshProfiles,
      chooseProfile,
      addProfile,
      editProfile,
      syncNow: upload,
    }),
    [
      ready,
      profile,
      profiles,
      status,
      error,
      pickerOpen,
      refreshProfiles,
      chooseProfile,
      addProfile,
      editProfile,
      upload,
    ]
  );

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)] text-sm font-semibold text-[var(--color-faint)]">
        Loading your study profile…
      </div>
    );
  }

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloud() {
  const value = useContext(CloudContext);
  if (!value) throw new Error("useCloud must be used inside CloudProvider.");
  return value;
}
