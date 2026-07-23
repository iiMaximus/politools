/* Verify meaningful mastery invariants (src/lib/mastery.ts).
 *
 *   node scripts/verify-adaptive.mjs
 *
 * The mastery engine is bundled in isolation so these checks stay deterministic
 * and do not require React or browser storage. They defend the learning rules
 * that matter most: same-session repetition is not durable mastery, later recall
 * is, a new error demotes immediately, and badly overdue knowledge decays. */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts", `.adaptive.${process.pid}.mjs`);

execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  ["src/lib/mastery.ts", "--bundle", "--format=esm", "--platform=node", `--outfile=${tmp}`],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
);

const { masteryBreakdown, masteryScore, hasMastery, MASTERY_THRESHOLD } = await import(
  pathToFileURL(tmp).href
);

const DAY = 86_400_000;
const NOW = 1_700_000_000_000;
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

function card(overrides = {}) {
  return {
    attempts: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    mastered: false,
    lastSeen: 0,
    intervalDays: 0,
    lapses: 0,
    history: [],
    ...overrides,
  };
}

const rapid = card({
  attempts: 2,
  correct: 2,
  streak: 2,
  lastSeen: NOW,
  due: NOW + DAY,
  intervalDays: 1,
  history: [
    { at: NOW - 5 * 60_000, correct: true, difficulty: "hard" },
    { at: NOW, correct: true, difficulty: "hard" },
  ],
});
check("unseen card starts at zero", masteryScore(undefined, "hard", NOW) === 0);
check(
  "same-session repetition cannot claim mastery",
  masteryScore(rapid, "hard", NOW) < MASTERY_THRESHOLD && !hasMastery(rapid, "hard", NOW)
);

const spaced = card({
  attempts: 2,
  correct: 2,
  streak: 2,
  lastSeen: NOW,
  due: NOW + 3 * DAY,
  intervalDays: 3,
  history: [
    { at: NOW - DAY, correct: true, difficulty: "hard" },
    {
      at: NOW,
      correct: true,
      difficulty: "hard",
      wasDue: true,
      intervalBeforeDays: 1,
    },
  ],
});
check("later successful recall can establish mastery", hasMastery(spaced, "hard", NOW));
check("spaced recall is exposed as an inspectable signal", masteryBreakdown(spaced, "hard", NOW).hasSpacedRecall);

const lapsed = card({
  ...spaced,
  attempts: 3,
  correct: 2,
  wrong: 1,
  streak: 0,
  due: NOW + 10 * 60_000,
  history: [
    ...spaced.history,
    { at: NOW, correct: false, difficulty: "hard", selectedAnswer: "B", correctAnswer: "A" },
  ],
});
check("the newest wrong answer demotes immediately", masteryScore(lapsed, "hard", NOW) <= 0.35);
check("a lapsed card is not mastered", !hasMastery(lapsed, "hard", NOW));

const overdue = card({ ...spaced, due: NOW - 30 * DAY, lastSeen: NOW - 33 * DAY });
check("badly overdue recall decays", masteryScore(overdue, "hard", NOW) < masteryScore(spaced, "hard", NOW));
check("badly overdue recall can leave mastered state", !hasMastery(overdue, "hard", NOW));

const hardEvidence = masteryBreakdown(spaced, "hard", NOW).evidence;
const easyEvidence = masteryBreakdown(spaced, "easy", NOW).evidence;
check("difficulty changes the evidence requirement", hardEvidence > easyEvidence);

const timed = card({
  ...spaced,
  history: spaced.history.map((event) => ({ ...event, responseMs: 6_000 })),
});
check(
  "response time is optional rather than a mastery gate",
  masteryScore(timed, "hard", NOW) === masteryScore(spaced, "hard", NOW)
);

const legacyFresh = card({
  attempts: 3,
  correct: 3,
  streak: 2,
  mastered: true,
  lastSeen: NOW,
  due: NOW + DAY,
  intervalDays: 1,
  history: [],
});
check("fresh legacy mastery is preserved during migration", hasMastery(legacyFresh, "medium", NOW));

rmSync(tmp, { force: true });

if (fail) {
  console.error(`verify-adaptive: ${fail} FAILED, ${pass} passed`);
  failures.forEach((name) => console.error(`  ✗ ${name}`));
  process.exit(1);
}
console.log(`verify-adaptive: all ${pass} checks passed`);
