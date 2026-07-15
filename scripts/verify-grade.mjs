/* Verify the shared grading law (src/lib/game.ts gradeFromScore) that
 * readiness, boss fights and mock exams all use.
 *
 *   node scripts/verify-grade.mjs
 */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts", `.grade.${process.pid}.mjs`);

execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  ["src/lib/game.ts", "--bundle", "--format=esm", "--platform=node", `--outfile=${tmp}`],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
);

const { gradeFromScore } = await import(pathToFileURL(tmp).href);

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

check("score 0 → 17 (below pass)", gradeFromScore(0) === 17);
check("score 34.9 → 17", gradeFromScore(34.9) === 17);
check("score 35 → 18 (pass threshold)", gradeFromScore(35) === 18);
check("score 100 → 31 (30 e lode)", gradeFromScore(100) === 31);
check("score 65 → 24 (midpoint)", gradeFromScore(65) === 24);

let monotonic = true;
let integer = true;
let prev = gradeFromScore(0);
for (let s = 1; s <= 100; s++) {
  const g = gradeFromScore(s);
  if (g < prev) monotonic = false;
  if (!Number.isInteger(g)) integer = false;
  prev = g;
}
check("monotonic over 0..100", monotonic);
check("always integer", integer);
check("range bounded 17..31", gradeFromScore(-5) === 17 && gradeFromScore(200) === 31);

rmSync(tmp, { force: true });

if (fail) {
  console.error(`verify-grade: ${fail} FAILED, ${pass} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`verify-grade: all ${pass} checks passed`);
