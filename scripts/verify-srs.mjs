/* Verify the SRS scheduler (src/lib/srs.ts).
 *
 *   node scripts/verify-srs.mjs
 *
 * Pure-function assertions: interval growth, lapse handling, the
 * legacy-card effectiveDue bridge (old progress must keep its meaning),
 * jitter determinism and label formatting. The TS module is bundled on
 * the fly with esbuild (already a dep), same as verify-excel-engine. */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts", `.srs.${process.pid}.mjs`);

execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  ["src/lib/srs.ts", "--bundle", "--format=esm", "--platform=node", `--outfile=${tmp}`],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
);

const srs = await import(pathToFileURL(tmp).href);
const {
  schedule,
  effectiveDue,
  overdueRatio,
  dueWithin,
  intervalJitter,
  nextReviewLabel,
  DEFAULT_EASE,
  MIN_EASE,
  MAX_EASE,
  MAX_INTERVAL_DAYS,
} = srs;

const DAY = 86_400_000;
const NOW = 1_700_000_000_000; // fixed clock — the scheduler takes `now` explicitly

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

const legacy = (over = {}) => ({
  attempts: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  mastered: false,
  lastSeen: 0,
  ...over,
});

/* ------------------------- schedule: good ------------------------- */

const s1 = schedule("card-x", undefined, "good", NOW);
check("first good → 1 day", s1.intervalDays === 1 && s1.due === NOW + DAY);
check("first good → ease grows", s1.ease === DEFAULT_EASE + 0.03);
check("first good → no lapses", s1.lapses === 0);

const s2 = schedule("card-x", s1, "good", NOW);
check("second good → 3 days", s2.intervalDays === 3 && s2.due === NOW + 3 * DAY);

const s3 = schedule("card-x", s2, "good", NOW);
check(
  "third good → ~interval×ease (jittered)",
  s3.intervalDays >= 6 && s3.intervalDays <= 8 && s3.due === NOW + s3.intervalDays * DAY
);

// growth is monotonic and capped
let cur = s3;
let prevInterval = s3.intervalDays;
let monotonic = true;
for (let i = 0; i < 20; i++) {
  cur = schedule("card-x", cur, "good", NOW);
  if (cur.intervalDays < prevInterval) monotonic = false;
  prevInterval = cur.intervalDays;
}
check("repeated good → monotonic growth", monotonic);
check("interval capped", cur.intervalDays <= MAX_INTERVAL_DAYS);
check("ease capped", cur.ease <= MAX_EASE);

/* ------------------------- schedule: again ------------------------ */

const a1 = schedule("card-x", s3, "again", NOW);
check("again → relearning", a1.intervalDays === 0);
check("again → due in 10 min", a1.due === NOW + 10 * 60_000);
check("again → lapse counted", a1.lapses === s3.lapses + 1);
check("again → ease drops", a1.ease < s3.ease);

let floored = { ...a1 };
for (let i = 0; i < 12; i++) floored = schedule("card-x", floored, "again", NOW);
check("ease floored", floored.ease >= MIN_EASE - 1e-9);

const recover = schedule("card-x", a1, "good", NOW);
check("good after lapse → back to 1 day", recover.intervalDays === 1);

/* -------------------- effectiveDue: legacy bridge ------------------ */

check("undefined card → never due", effectiveDue(undefined, NOW) === Infinity);
check("unseen card → never due", effectiveDue(legacy(), NOW) === Infinity);
check(
  "legacy wrong+unmastered → due now (old isDue rule)",
  effectiveDue(legacy({ attempts: 3, wrong: 1, lastSeen: NOW }), NOW) === 0
);
check(
  "legacy mastered → decays after 10 days (old rust tier)",
  effectiveDue(legacy({ attempts: 3, correct: 3, mastered: true, lastSeen: NOW - 11 * DAY }), NOW) ===
    NOW - 11 * DAY + 10 * DAY
);
check(
  "legacy seen-clean → due after a day",
  effectiveDue(legacy({ attempts: 1, correct: 1, lastSeen: NOW - 2 * DAY }), NOW) === NOW - DAY
);
check(
  "SRS card → its own due wins",
  effectiveDue(legacy({ attempts: 1, correct: 1, lastSeen: NOW, due: NOW + 5 * DAY }), NOW) === NOW + 5 * DAY
);

/* ----------------------- overdueRatio / dueWithin ------------------ */

const fresh = legacy({ attempts: 1, correct: 1, lastSeen: NOW, due: NOW + 3 * DAY, intervalDays: 3 });
check("not due → ratio 0", overdueRatio(fresh, NOW) === 0);
const stale = legacy({ attempts: 1, correct: 1, lastSeen: 0, due: NOW - 3 * DAY, intervalDays: 3 });
check("one interval overdue → ratio 1", Math.abs(overdueRatio(stale, NOW) - 1) < 1e-9);
check("dueWithin sees upcoming reviews", dueWithin(fresh, 4, NOW) && !dueWithin(fresh, 2, NOW));
check("dueWithin ignores unseen", !dueWithin(legacy(), 365, NOW));

/* ----------------------------- jitter ------------------------------ */

check("jitter deterministic", intervalJitter("abc") === intervalJitter("abc"));
check(
  "jitter bounded ±10%",
  ["a", "b", "thermo:q1", "ma2:limits:3"].every((id) => Math.abs(intervalJitter(id)) <= 0.1)
);

/* ----------------------------- labels ------------------------------ */

check("label: now", nextReviewLabel(NOW + 30_000, NOW) === "now");
check("label: minutes", nextReviewLabel(NOW + 10 * 60_000, NOW) === "in 10 min");
check("label: tomorrow", nextReviewLabel(NOW + DAY, NOW) === "tomorrow");
check("label: days", nextReviewLabel(NOW + 3 * DAY, NOW) === "in 3 d");
check("label: weeks", nextReviewLabel(NOW + 30 * DAY, NOW) === "in 4 w");
check("label: none", nextReviewLabel(undefined, NOW) === null);

/* ------------------------------------------------------------------ */

rmSync(tmp, { force: true });

if (fail) {
  console.error(`verify-srs: ${fail} FAILED, ${pass} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`verify-srs: all ${pass} checks passed`);
