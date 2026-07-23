/* Pure-function checks for trusted-profile progress merging and leaderboard
 * aggregation. The Supabase client stays disabled in this Node bundle. */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts", ".cloud-sync." + process.pid + ".mjs");

execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  [
    "src/lib/cloud-sync.ts",
    "--bundle",
    "--format=esm",
    "--platform=node",
    "--define:import.meta.env={}",
    "--outfile=" + tmp,
  ],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
);

const cloud = await import(pathToFileURL(tmp).href);
let pass = 0;
let fail = 0;
const failures = [];

function check(name, ok) {
  if (ok) pass += 1;
  else {
    fail += 1;
    failures.push(name);
  }
}

const progress = (xp, cards, lessons = {}) =>
  JSON.stringify({ xp, cards, lessons, exams: {} });
const local = {
  version: 1,
  generatedAt: 20,
  stores: {
    "polito:progress:ma2": progress(
      120,
      {
        q1: {
          attempts: 2,
          correct: 2,
          wrong: 0,
          streak: 2,
          mastered: true,
          masteredAt: new Date(2026, 6, 21, 12).getTime(),
          lastSeen: 20,
        },
      },
      { l1: { completed: true, lastViewed: 20 } }
    ),
    "polito:scroll:ma2": JSON.stringify({
      version: 2,
      lastMode: "story",
      sessions: {
        story: { mode: "story", index: 4, order: ["a"], answers: {}, revealed: {}, updated: 20 },
      },
    }),
    "polito:game:v1": JSON.stringify({
      bonusXp: 30,
      activity: {
        "2026-07-20": { answers: 5, correct: 4, xp: 50, lessons: 0, mixSessions: 0 },
      },
      frozenDays: [],
      totals: { answers: 5, lessons: 0, bossWins: 0 },
    }),
  },
};
const remote = {
  version: 1,
  generatedAt: 10,
  stores: {
    "polito:progress:ma2": progress(80, {
      q2: {
        attempts: 1,
        correct: 0,
        wrong: 1,
        streak: 0,
        mastered: false,
        lastSeen: 10,
      },
    }),
    "polito:scroll:ma2": JSON.stringify({
      version: 2,
      lastMode: "drill",
      sessions: {
        drill: { mode: "drill", index: 6, order: ["b"], answers: {}, revealed: {}, updated: 30 },
      },
    }),
  },
};

const merged = cloud.mergeSnapshots(local, remote);
const mergedProgress = JSON.parse(merged.stores["polito:progress:ma2"]);
const mergedScroll = JSON.parse(merged.stores["polito:scroll:ma2"]);
check("merge keeps local card", Boolean(mergedProgress.cards.q1));
check("merge keeps remote card", Boolean(mergedProgress.cards.q2));
check("merge keeps completed lesson", mergedProgress.lessons.l1.completed === true);
check("merge avoids double-counting XP", mergedProgress.xp === 120);
check("scroll keeps story position", mergedScroll.sessions.story.index === 4);
check("scroll keeps drill position", mergedScroll.sessions.drill.index === 6);
check("scroll last mode follows newest session", mergedScroll.lastMode === "drill");

const stats = cloud.calculateLeaderboardStats(merged);
check("leaderboard adds bonus XP", stats.total_xp === 150);
check("leaderboard counts attempts", stats.answers === 3);
check("leaderboard counts mastered cards", stats.mastered_cards === 1);
check("leaderboard counts completed lessons", stats.lessons_completed === 1);
check(
  "snapshot hash ignores generated time",
  cloud.snapshotHash({ ...merged, generatedAt: 1 }) ===
    cloud.snapshotHash({ ...merged, generatedAt: 999 })
);

check(
  "week starts on Monday",
  cloud.currentWeekStartKey(new Date(2026, 6, 22, 12)) === "2026-07-20"
);
check(
  "Sunday belongs to the preceding Monday",
  cloud.currentWeekStartKey(new Date(2026, 6, 19, 12)) === "2026-07-13"
);
check(
  "Warsaw Monday boundary is stable on a device in another timezone",
  cloud.currentWeekStartKey(new Date("2026-07-19T22:30:00Z")) === "2026-07-20"
);
check(
  "Warsaw late Sunday stays in the preceding week",
  cloud.currentWeekStartKey(new Date("2026-07-19T21:30:00Z")) === "2026-07-13"
);
const fallbackWeek = cloud.calculateWeeklyStats(local, new Date(2026, 6, 22, 12));
check("snapshot fallback totals this week's XP", fallbackWeek.weekly_xp === 50);
check("snapshot fallback totals this week's study actions", fallbackWeek.weekly_activity === 5);
check("snapshot fallback counts mastery transitions from this week", fallbackWeek.weekly_mastery === 1);
const oldMastery = structuredClone(local);
oldMastery.stores["polito:progress:ma2"] = progress(120, {
  q1: {
    attempts: 3,
    correct: 3,
    wrong: 0,
    streak: 3,
    mastered: true,
    masteredAt: new Date(2026, 6, 12, 12).getTime(),
    lastSeen: new Date(2026, 6, 21, 12).getTime(),
  },
});
check(
  "reviewing an old mastery does not create a weekly mastery gain",
  cloud.calculateWeeklyStats(oldMastery, new Date(2026, 6, 22, 12)).weekly_mastery === 0
);

const profile = (id, name, week, weeklyXp, weeklyActivity, weeklyMastery, totalXp) => ({
  id,
  display_name: name,
  avatar: "🎓",
  week_started_on: week,
  weekly_xp: weeklyXp,
  weekly_activity: weeklyActivity,
  weekly_mastery: weeklyMastery,
  total_xp: totalXp,
  current_streak: 0,
  best_streak: 0,
  answers: 0,
  mastered_cards: 0,
  lessons_completed: 0,
  client_updated_at: 0,
  created_at: "2026-07-01T00:00:00Z",
  updated_at: "2026-07-01T00:00:00Z",
});
const weekly = cloud.sortStudyProfiles(
  [
    profile("a", "Ada", "2026-07-20", 80, 9, 1, 900),
    profile("b", "Bo", "2026-07-20", 80, 12, 0, 500),
    profile("c", "Cy", "2026-07-13", 999, 99, 99, 2000),
  ],
  "2026-07-20"
);
check("weekly board uses activity as an XP tiebreak", weekly[0].id === "b");
check("stale weekly totals reset to zero", weekly.find((item) => item.id === "c").weekly_xp === 0);
check("weekly scores rank before lifetime XP", weekly[2].id === "c");

rmSync(tmp, { force: true });

if (fail) {
  console.error("verify-cloud-sync: " + fail + " FAILED, " + pass + " passed");
  for (const name of failures) console.error("  ✗ " + name);
  process.exit(1);
}
console.log("verify-cloud-sync: all " + pass + " checks passed");
