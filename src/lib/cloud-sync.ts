import type { SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_PROJECT_URL = "https://feksqmbbnsyxhxnoeizr.supabase.co";
// Supabase publishable keys are designed to ship in browser clients. Keep the
// env override for alternate deployments, while making the production site
// work without a Render-only environment-variable handoff.
const SUPABASE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_7-6DnidCKE7ibwqFldL68A_OX1ex8XB"
).trim();

export const cloudConfigured = SUPABASE_PUBLISHABLE_KEY.length > 20;
let clientPromise: Promise<SupabaseClient> | null = null;

export interface CloudSnapshot {
  version: 1;
  stores: Record<string, string>;
  generatedAt: number;
}

export interface StudyProfile {
  id: string;
  display_name: string;
  avatar: string;
  week_started_on: string;
  weekly_xp: number;
  weekly_activity: number;
  weekly_mastery: number;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  answers: number;
  mastered_cards: number;
  lessons_completed: number;
  client_updated_at: number;
  created_at: string;
  updated_at: string;
}

export interface FullStudyProfile extends StudyProfile {
  progress: CloudSnapshot;
}

export type LeaderboardStats = Pick<
  StudyProfile,
  | "total_xp"
  | "current_streak"
  | "best_streak"
  | "answers"
  | "mastered_cards"
  | "lessons_completed"
>;

export const PROFILE_ICONS = ["🎓", "🚀", "⚙️", "🔥", "🧠", "🏆", "🐸", "🦾"] as const;

const CLOUD_META_PREFIX = "polito:cloud:";
export const PROFILE_ID_KEY = CLOUD_META_PREFIX + "profile-id";
const SYNC_HASH_KEY = CLOUD_META_PREFIX + "hash";
const LAST_SYNCED_AT_KEY = CLOUD_META_PREFIX + "last-synced-at";
const DEVICE_LABEL_KEY = CLOUD_META_PREFIX + "device-label";

const STUDY_PROFILE_COLUMNS =
  "id,display_name,avatar,week_started_on,weekly_xp,weekly_activity,weekly_mastery,total_xp,current_streak,best_streak,answers,mastered_cards,lessons_completed,client_updated_at,created_at,updated_at";
const LEGACY_PROFILE_COLUMNS =
  "id,display_name,avatar,total_xp,current_streak,best_streak,answers,mastered_cards,lessons_completed,client_updated_at,created_at,updated_at";

const WARSAW_TIME_ZONE = "Europe/Warsaw";

function datePartsInWarsaw(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WARSAW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    weekday: value("weekday"),
  };
}

function warsawDateKey(date = new Date()) {
  const { year, month, day } = datePartsInWarsaw(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function currentWeekStartKey(date = new Date()) {
  const { year, month, day, weekday } = datePartsInWarsaw(date);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() - (weekdayIndex === 0 ? 6 : weekdayIndex - 1));
  return [
    monday.getUTCFullYear(),
    String(monday.getUTCMonth() + 1).padStart(2, "0"),
    String(monday.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function normalizeStudyProfile(
  profile: StudyProfile,
  weekKey = currentWeekStartKey(),
  snapshot?: CloudSnapshot
) {
  const hasWeeklyColumns =
    typeof profile.weekly_xp === "number" &&
    typeof profile.weekly_activity === "number" &&
    typeof profile.weekly_mastery === "number";
  if (hasWeeklyColumns && profile.week_started_on === weekKey) return profile;
  const fallback = snapshot ? calculateWeeklyStats(snapshot) : {
    weekly_xp: 0,
    weekly_activity: 0,
    weekly_mastery: 0,
  };
  return {
    ...profile,
    week_started_on: weekKey,
    ...fallback,
  };
}

export function sortStudyProfiles(profiles: StudyProfile[], weekKey = currentWeekStartKey()) {
  return profiles
    .map((profile) => normalizeStudyProfile(profile, weekKey))
    .sort(
      (left, right) =>
        right.weekly_xp - left.weekly_xp ||
        right.weekly_activity - left.weekly_activity ||
        right.weekly_mastery - left.weekly_mastery ||
        right.total_xp - left.total_xp ||
        left.display_name.localeCompare(right.display_name)
    );
}

function isSyncedKey(key: string) {
  return (
    !key.startsWith(CLOUD_META_PREFIX) &&
    (key.startsWith("polito:") || key.startsWith("esmm-lab-"))
  );
}

export function collectLocalSnapshot(): CloudSnapshot {
  const stores: Record<string, string> = {};
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => Boolean(key && isSyncedKey(key)))
      .sort();
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) stores[key] = value;
    }
  } catch {
    /* private mode / unavailable storage */
  }
  return { version: 1, stores, generatedAt: Date.now() };
}

export function normalizeSnapshot(value: unknown): CloudSnapshot {
  if (!value || typeof value !== "object") {
    return { version: 1, stores: {}, generatedAt: 0 };
  }
  const candidate = value as Partial<CloudSnapshot>;
  const stores: Record<string, string> = {};
  if (candidate.stores && typeof candidate.stores === "object") {
    for (const [key, raw] of Object.entries(candidate.stores)) {
      if (isSyncedKey(key) && typeof raw === "string") stores[key] = raw;
    }
  }
  return {
    version: 1,
    stores,
    generatedAt:
      typeof candidate.generatedAt === "number" && Number.isFinite(candidate.generatedAt)
        ? candidate.generatedAt
        : 0,
  };
}

export function applyLocalSnapshot(snapshot: CloudSnapshot, removeMissing = true) {
  try {
    if (removeMissing) {
      const existing = Array.from(
        { length: localStorage.length },
        (_, index) => localStorage.key(index)
      ).filter((key): key is string => Boolean(key && isSyncedKey(key)));
      for (const key of existing) {
        if (!(key in snapshot.stores)) localStorage.removeItem(key);
      }
    }
    for (const [key, value] of Object.entries(snapshot.stores)) {
      localStorage.setItem(key, value);
    }
  } catch {
    /* storage quota/unavailable */
  }
}

export function snapshotHash(snapshot: CloudSnapshot): string {
  const source = Object.entries(snapshot.stores)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => key + "\u0000" + value)
    .join("\u0001");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return source.length + ":" + (hash >>> 0).toString(36);
}

export function readSelectedProfileId() {
  try {
    return localStorage.getItem(PROFILE_ID_KEY);
  } catch {
    return null;
  }
}

export function writeSyncMeta(profileId: string | null, hash?: string) {
  try {
    if (profileId) localStorage.setItem(PROFILE_ID_KEY, profileId);
    else localStorage.removeItem(PROFILE_ID_KEY);
    if (hash) localStorage.setItem(SYNC_HASH_KEY, hash);
    else if (!profileId) localStorage.removeItem(SYNC_HASH_KEY);
  } catch {
    /* ignore */
  }
}

export function readSyncHash() {
  try {
    return localStorage.getItem(SYNC_HASH_KEY);
  } catch {
    return null;
  }
}

export function readLastSyncedAt() {
  try {
    const value = Number(localStorage.getItem(LAST_SYNCED_AT_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeLastSyncedAt(value: number) {
  try {
    localStorage.setItem(LAST_SYNCED_AT_KEY, String(value));
  } catch {
    /* ignore */
  }
}

function browserName(userAgent: string) {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/CriOS|Chrome\//.test(userAgent)) return "Chrome";
  if (/FxiOS|Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Browser";
}

export function readDeviceLabel() {
  try {
    const saved = localStorage.getItem(DEVICE_LABEL_KEY)?.trim();
    if (saved) return saved;
  } catch {
    /* storage unavailable */
  }

  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const device = /iPhone/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent)
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Macintosh|Mac OS X/.test(userAgent)
          ? "Mac"
          : /Windows/.test(userAgent)
            ? "Windows PC"
            : /Linux/.test(userAgent)
              ? "Linux device"
              : "This device";
  const label = device + " · " + browserName(userAgent);
  try {
    localStorage.setItem(DEVICE_LABEL_KEY, label);
  } catch {
    /* storage unavailable */
  }
  return label;
}

function parseRecord(raw: string | undefined): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function mergeProgress(localRaw: string, cloudRaw: string): string {
  const local = parseRecord(localRaw);
  const cloud = parseRecord(cloudRaw);
  if (!local) return cloudRaw;
  if (!cloud) return localRaw;

  const localCards = asObject(local.cards);
  const cloudCards = asObject(cloud.cards);
  const cards: Record<string, unknown> = {};
  for (const id of new Set([...Object.keys(cloudCards), ...Object.keys(localCards)])) {
    const left = asObject(localCards[id]);
    const right = asObject(cloudCards[id]);
    if (!Object.keys(left).length || !Object.keys(right).length) {
      cards[id] = Object.keys(left).length ? left : right;
      continue;
    }
    const latest = asNumber(left.lastSeen) >= asNumber(right.lastSeen) ? left : right;
    cards[id] = {
      ...latest,
      attempts: Math.max(asNumber(left.attempts), asNumber(right.attempts)),
      correct: Math.max(asNumber(left.correct), asNumber(right.correct)),
      wrong: Math.max(asNumber(left.wrong), asNumber(right.wrong)),
      // A newer failed retrieval must be allowed to demote stale mastery from
      // another device; the latest evidence wins this state flag.
      mastered: Boolean(latest.mastered),
      lastSeen: Math.max(asNumber(left.lastSeen), asNumber(right.lastSeen)),
    };
  }

  const localLessons = asObject(local.lessons);
  const cloudLessons = asObject(cloud.lessons);
  const lessons: Record<string, unknown> = {};
  for (const id of new Set([...Object.keys(cloudLessons), ...Object.keys(localLessons)])) {
    const left = asObject(localLessons[id]);
    const right = asObject(cloudLessons[id]);
    const latest =
      asNumber(left.lastViewed) >= asNumber(right.lastViewed) ? left : right;
    lessons[id] = {
      ...latest,
      completed: Boolean(left.completed || right.completed),
      lastViewed: Math.max(asNumber(left.lastViewed), asNumber(right.lastViewed)),
    };
  }

  const localExams = asObject(local.exams);
  const cloudExams = asObject(cloud.exams);
  const exams: Record<string, unknown> = {};
  for (const id of new Set([...Object.keys(cloudExams), ...Object.keys(localExams)])) {
    const left = asObject(localExams[id]);
    const right = asObject(cloudExams[id]);
    exams[id] = {
      ...right,
      ...left,
      revealed: Boolean(left.revealed || right.revealed),
      solved: Boolean(left.solved || right.solved),
    };
  }

  return JSON.stringify({
    ...cloud,
    ...local,
    xp: Math.max(asNumber(local.xp), asNumber(cloud.xp)),
    cards,
    lessons,
    exams,
  });
}

function mergeByTimestamp(localRaw: string, cloudRaw: string): string {
  const local = parseRecord(localRaw);
  const cloud = parseRecord(cloudRaw);
  if (!local) return cloudRaw;
  if (!cloud) return localRaw;
  return asNumber(local.updated) >= asNumber(cloud.updated) ? localRaw : cloudRaw;
}

function mergeScroll(localRaw: string, cloudRaw: string): string {
  const local = parseRecord(localRaw);
  const cloud = parseRecord(cloudRaw);
  if (!local) return cloudRaw;
  if (!cloud) return localRaw;
  if (local.version !== 2 || cloud.version !== 2) return mergeByTimestamp(localRaw, cloudRaw);

  const localSessions = asObject(local.sessions);
  const cloudSessions = asObject(cloud.sessions);
  const sessions: Record<string, unknown> = {};
  for (const mode of ["story", "drill", "formula"]) {
    const left = asObject(localSessions[mode]);
    const right = asObject(cloudSessions[mode]);
    if (!Object.keys(left).length && !Object.keys(right).length) continue;
    sessions[mode] =
      asNumber(left.updated) >= asNumber(right.updated) ? left : right;
  }
  const latestMode =
    Object.entries(sessions).sort(
      ([, left], [, right]) =>
        asNumber(asObject(right).updated) - asNumber(asObject(left).updated)
    )[0]?.[0] ?? "story";
  return JSON.stringify({ version: 2, lastMode: latestMode, sessions });
}

function uniqueBy(items: unknown[], key: (item: unknown) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function mergeGame(localRaw: string, cloudRaw: string): string {
  const local = parseRecord(localRaw);
  const cloud = parseRecord(cloudRaw);
  if (!local) return cloudRaw;
  if (!cloud) return localRaw;
  const score = (state: Record<string, unknown>) => {
    const totals = asObject(state.totals);
    return (
      asNumber(totals.answers) +
      asNumber(totals.lessons) * 5 +
      asNumber(totals.bossWins) * 20 +
      asNumber(state.bonusXp) / 10
    );
  };
  const base = score(local) >= score(cloud) ? local : cloud;

  const activity: Record<string, unknown> = { ...asObject(cloud.activity) };
  for (const [day, value] of Object.entries(asObject(local.activity))) {
    const oldDay = asObject(activity[day]);
    const newDay = asObject(value);
    activity[day] =
      asNumber(newDay.answers) + asNumber(newDay.lessons) >=
      asNumber(oldDay.answers) + asNumber(oldDay.lessons)
        ? newDay
        : oldDay;
  }

  const totals: Record<string, number> = {};
  for (const key of new Set([
    ...Object.keys(asObject(local.totals)),
    ...Object.keys(asObject(cloud.totals)),
  ])) {
    totals[key] = Math.max(
      asNumber(asObject(local.totals)[key]),
      asNumber(asObject(cloud.totals)[key])
    );
  }

  const achievements = {
    ...asObject(cloud.achievements),
    ...asObject(local.achievements),
  };
  const boss: Record<string, unknown> = {};
  for (const courseId of new Set([
    ...Object.keys(asObject(local.boss)),
    ...Object.keys(asObject(cloud.boss)),
  ])) {
    boss[courseId] = uniqueBy(
      [
        ...asArray(asObject(cloud.boss)[courseId]),
        ...asArray(asObject(local.boss)[courseId]),
      ],
      (item) => {
        const row = asObject(item);
        return (
          asNumber(row.at) + ":" + asNumber(row.grade) + ":" + String(Boolean(row.won))
        );
      }
    );
  }

  const mockExams: Record<string, unknown> = {};
  for (const courseId of new Set([
    ...Object.keys(asObject(local.mockExams)),
    ...Object.keys(asObject(cloud.mockExams)),
  ])) {
    mockExams[courseId] = uniqueBy(
      [
        ...asArray(asObject(cloud.mockExams)[courseId]),
        ...asArray(asObject(local.mockExams)[courseId]),
      ],
      (item) => String(asNumber(asObject(item).at))
    );
  }

  const frozenDays = [
    ...new Set(
      [...asArray(cloud.frozenDays), ...asArray(local.frozenDays)].filter(
        (day): day is string => typeof day === "string"
      )
    ),
  ];
  const unlocks = [
    ...new Set(
      [...asArray(cloud.unlocks), ...asArray(local.unlocks)].filter(
        (id): id is string => typeof id === "string"
      )
    ),
  ];

  return JSON.stringify({
    ...base,
    activity,
    frozenDays,
    freezeTokens: Math.max(asNumber(local.freezeTokens), asNumber(cloud.freezeTokens)),
    lastFreezeStreak: Math.max(
      asNumber(local.lastFreezeStreak),
      asNumber(cloud.lastFreezeStreak)
    ),
    bonusXp: Math.max(asNumber(local.bonusXp), asNumber(cloud.bonusXp)),
    beers: Math.max(asNumber(local.beers), asNumber(cloud.beers)),
    spentBeers: Math.max(asNumber(local.spentBeers), asNumber(cloud.spentBeers)),
    totals,
    achievements,
    boss,
    mockExams,
    unlocks,
    peakXp: Math.max(asNumber(local.peakXp), asNumber(cloud.peakXp)),
  });
}

function mergePlan(localRaw: string, cloudRaw: string): string {
  const local = parseRecord(localRaw);
  const cloud = parseRecord(cloudRaw);
  if (!local) return cloudRaw;
  if (!cloud) return localRaw;
  if (local.examIso !== cloud.examIso) return localRaw;
  return asNumber(local.start) <= asNumber(cloud.start) ? localRaw : cloudRaw;
}

function mergeFilledRecord(localRaw: string, cloudRaw: string): string {
  const local = parseRecord(localRaw);
  const cloud = parseRecord(cloudRaw);
  if (!local) return cloudRaw;
  if (!cloud) return localRaw;
  return Object.keys(local).length >= Object.keys(cloud).length ? localRaw : cloudRaw;
}

export function mergeSnapshots(
  localValue: CloudSnapshot,
  cloudValue: CloudSnapshot
): CloudSnapshot {
  const local = normalizeSnapshot(localValue);
  const cloud = normalizeSnapshot(cloudValue);
  const stores: Record<string, string> = {};
  const keys = new Set([...Object.keys(cloud.stores), ...Object.keys(local.stores)]);
  for (const key of keys) {
    const localRaw = local.stores[key];
    const cloudRaw = cloud.stores[key];
    if (localRaw === undefined) stores[key] = cloudRaw;
    else if (cloudRaw === undefined || localRaw === cloudRaw) stores[key] = localRaw;
    else if (key.startsWith("polito:progress:")) {
      stores[key] = mergeProgress(localRaw, cloudRaw);
    } else if (key === "polito:game:v1") {
      stores[key] = mergeGame(localRaw, cloudRaw);
    } else if (key.startsWith("polito:scroll:")) {
      stores[key] = mergeScroll(localRaw, cloudRaw);
    } else if (key.startsWith("polito:session:") || key.startsWith("polito:mock:")) {
      stores[key] = mergeByTimestamp(localRaw, cloudRaw);
    } else if (key.startsWith("polito:plan:")) {
      stores[key] = mergePlan(localRaw, cloudRaw);
    } else if (key.startsWith("esmm-lab-")) {
      stores[key] = mergeFilledRecord(localRaw, cloudRaw);
    } else {
      stores[key] = localRaw;
    }
  }
  return { version: 1, stores, generatedAt: Date.now() };
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function shiftDate(key: string, delta: number) {
  const [year, month, day] = key.split("-").map(Number);
  return dateKey(new Date(year, month - 1, day + delta));
}

function qualifies(value: unknown) {
  const day = asObject(value);
  return (
    asNumber(day.answers) >= 5 ||
    asNumber(day.lessons) >= 1 ||
    asNumber(day.mixSessions) >= 1
  );
}

function calculateStreaks(game: Record<string, unknown>) {
  const activity = asObject(game.activity);
  const frozen = new Set(
    asArray(game.frozenDays).filter((day): day is string => typeof day === "string")
  );
  const today = dateKey();
  let current = 0;
  let cursor = qualifies(activity[today]) ? today : shiftDate(today, -1);
  while (qualifies(activity[cursor]) || frozen.has(cursor)) {
    current += 1;
    cursor = shiftDate(cursor, -1);
  }

  const all = new Set([
    ...Object.keys(activity).filter((day) => qualifies(activity[day])),
    ...frozen,
  ]);
  let best = current;
  for (const start of all) {
    if (all.has(shiftDate(start, -1))) continue;
    let length = 0;
    let day = start;
    while (all.has(day)) {
      length += 1;
      day = shiftDate(day, 1);
    }
    best = Math.max(best, length);
  }
  return { current, best };
}

function safeInteger(value: number) {
  return Math.max(0, Math.min(2_147_483_647, Math.round(value)));
}

export function calculateLeaderboardStats(snapshot: CloudSnapshot): LeaderboardStats {
  let totalXp = 0;
  let answers = 0;
  let masteredCards = 0;
  let lessonsCompleted = 0;
  for (const [key, raw] of Object.entries(snapshot.stores)) {
    if (!key.startsWith("polito:progress:")) continue;
    const progress = parseRecord(raw);
    if (!progress) continue;
    totalXp += asNumber(progress.xp);
    for (const card of Object.values(asObject(progress.cards))) {
      const state = asObject(card);
      answers += asNumber(state.attempts);
      if (state.mastered) masteredCards += 1;
    }
    lessonsCompleted += Object.values(asObject(progress.lessons)).filter(
      (lesson) => asObject(lesson).completed
    ).length;
  }
  const game = parseRecord(snapshot.stores["polito:game:v1"]) ?? {};
  totalXp += asNumber(game.bonusXp);
  const streak = calculateStreaks(game);
  return {
    total_xp: safeInteger(totalXp),
    current_streak: safeInteger(streak.current),
    best_streak: safeInteger(streak.best),
    answers: safeInteger(answers),
    mastered_cards: safeInteger(masteredCards),
    lessons_completed: safeInteger(lessonsCompleted),
  };
}

/** Client fallback for the small trusted crew. It keeps the weekly board live
 * even before the additive SQL migration is installed; once columns exist,
 * the server-maintained counters remain authoritative. */
export function calculateWeeklyStats(snapshot: CloudSnapshot, now = new Date()) {
  const weekKey = currentWeekStartKey(now);
  const todayKey = warsawDateKey(now);
  const game = parseRecord(snapshot.stores["polito:game:v1"]) ?? {};
  const activity = asObject(game.activity);
  let weeklyXp = 0;
  let weeklyActivity = 0;
  for (const [day, raw] of Object.entries(activity)) {
    if (day < weekKey || day > todayKey) continue;
    const value = asObject(raw);
    weeklyXp += asNumber(value.xp);
    weeklyActivity += asNumber(value.answers) + asNumber(value.lessons);
  }

  const [year, month, day] = weekKey.split("-").map(Number);
  const weekAt = new Date(year, month - 1, day).getTime();
  let weeklyMastery = 0;
  for (const [key, raw] of Object.entries(snapshot.stores)) {
    if (!key.startsWith("polito:progress:")) continue;
    const progress = parseRecord(raw);
    if (!progress) continue;
    for (const card of Object.values(asObject(progress.cards))) {
      const state = asObject(card);
      // Older snapshots predate masteredAt, so lastSeen remains a one-time
      // compatibility fallback until the card next records evidence.
      const masteredAt = asNumber(state.masteredAt) || asNumber(state.lastSeen);
      if (state.mastered && masteredAt >= weekAt) weeklyMastery += 1;
    }
  }
  return {
    weekly_xp: safeInteger(weeklyXp),
    weekly_activity: safeInteger(weeklyActivity),
    weekly_mastery: safeInteger(weeklyMastery),
  };
}

function profileFromRow(value: unknown): StudyProfile {
  const row = asObject(value);
  const snapshot = normalizeSnapshot(row.progress);
  return normalizeStudyProfile(row as unknown as StudyProfile, currentWeekStartKey(), snapshot);
}

async function requireClient() {
  if (!cloudConfigured) throw new Error("Cloud sync is not configured yet.");
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    );
  }
  return clientPromise;
}

export async function listStudyProfiles(): Promise<StudyProfile[]> {
  const client = await requireClient();
  const { data, error } = await client
    .from("study_profiles")
    .select(STUDY_PROFILE_COLUMNS)
    .order("updated_at", { ascending: true });
  if (!error) return sortStudyProfiles((data ?? []).map(profileFromRow));

  // Four users make this temporary compatibility read cheap. It also means a
  // deploy never breaks profiles while the additive weekly migration is pending.
  const fallback = await client
    .from("study_profiles")
    .select(`${LEGACY_PROFILE_COLUMNS},progress`)
    .order("updated_at", { ascending: true });
  if (fallback.error) throw error;
  return sortStudyProfiles((fallback.data ?? []).map(profileFromRow));
}

export async function getStudyProfile(profileId: string): Promise<FullStudyProfile | null> {
  const client = await requireClient();
  const { data, error } = await client
    .from("study_profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...profileFromRow(data),
    progress: normalizeSnapshot(data.progress),
  } as FullStudyProfile;
}

export async function createStudyProfile(
  displayName: string,
  avatar: string,
  snapshot: CloudSnapshot
): Promise<FullStudyProfile> {
  const client = await requireClient();
  const name = displayName.trim();
  if (name.length < 2 || name.length > 24) {
    throw new Error("Name must be between 2 and 24 characters.");
  }
  const avatarValue = PROFILE_ICONS.includes(avatar as (typeof PROFILE_ICONS)[number])
    ? avatar
    : "🎓";
  const baseInsert = {
    display_name: name,
    avatar: avatarValue,
    progress: snapshot,
    client_updated_at: snapshot.generatedAt,
    ...calculateLeaderboardStats(snapshot),
  };
  const primary = await client
    .from("study_profiles")
    .insert({
      ...baseInsert,
      week_started_on: currentWeekStartKey(),
      ...calculateWeeklyStats(snapshot),
    })
    .select("*")
    .single();
  let resultData: unknown = primary.data;
  let resultError = primary.error;
  if (resultError) {
    const fallback = await client
      .from("study_profiles")
      .insert(baseInsert)
      .select("*")
      .single();
    resultData = fallback.data;
    resultError = fallback.error;
  }
  if (resultError) {
    if (resultError.code === "23505") {
      throw new Error("That name already exists. Choose it from the list.");
    }
    throw resultError;
  }
  return {
    ...profileFromRow(resultData),
    progress: normalizeSnapshot(asObject(resultData).progress),
  } as FullStudyProfile;
}

export async function saveStudyProfile(
  profileId: string,
  snapshot: CloudSnapshot
): Promise<StudyProfile> {
  const client = await requireClient();
  const primary = await client
    .from("study_profiles")
    .update({
      progress: snapshot,
      client_updated_at: snapshot.generatedAt,
      ...calculateLeaderboardStats(snapshot),
    })
    .eq("id", profileId)
    .select(STUDY_PROFILE_COLUMNS)
    .single();
  let resultData: unknown = primary.data;
  let resultError = primary.error;
  if (resultError) {
    const fallback = await client
      .from("study_profiles")
      .update({
        progress: snapshot,
        client_updated_at: snapshot.generatedAt,
        ...calculateLeaderboardStats(snapshot),
      })
      .eq("id", profileId)
      .select(`${LEGACY_PROFILE_COLUMNS},progress`)
      .single();
    resultData = fallback.data;
    resultError = fallback.error;
  }
  if (resultError) throw resultError;
  return profileFromRow(resultData);
}

export async function updateStudyProfile(
  profileId: string,
  displayName: string,
  avatar: string
) {
  const client = await requireClient();
  const name = displayName.trim();
  if (name.length < 2 || name.length > 24) {
    throw new Error("Name must be between 2 and 24 characters.");
  }
  const primary = await client
    .from("study_profiles")
    .update({
      display_name: name,
      avatar: PROFILE_ICONS.includes(avatar as (typeof PROFILE_ICONS)[number]) ? avatar : "🎓",
    })
    .eq("id", profileId)
    .select(STUDY_PROFILE_COLUMNS)
    .single();
  let resultData: unknown = primary.data;
  let resultError = primary.error;
  if (resultError) {
    const fallback = await client
      .from("study_profiles")
      .update({
        display_name: name,
        avatar: PROFILE_ICONS.includes(avatar as (typeof PROFILE_ICONS)[number]) ? avatar : "🎓",
      })
      .eq("id", profileId)
      .select(`${LEGACY_PROFILE_COLUMNS},progress`)
      .single();
    resultData = fallback.data;
    resultError = fallback.error;
  }
  if (resultError) throw resultError;
  return profileFromRow(resultData);
}
