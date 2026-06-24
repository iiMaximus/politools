/* Verify every lab exercise is self-consistent: seeding the canonical
 * formulas (hintFormula) into the given grid must reproduce each check's
 * stated `expected` value. Catches authoring typos and guarantees the
 * in-app "Check answers" turns green for a correct solution.
 *
 *   node scripts/verify-labs.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts", `.excel-engine.${process.pid}.mjs`);
execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  ["src/lib/excel/index.ts", "--bundle", "--format=esm", "--platform=node", `--outfile=${tmp}`],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
);
const { createSheet, valuesMatch } = await import(pathToFileURL(tmp).href);

const labsDir = join(root, "src/courses/statistics/labs");
let files = [];
try { files = readdirSync(labsDir).filter((f) => f.endsWith(".json")); } catch { /* none yet */ }

let pass = 0, fail = 0, exercises = 0;
const failures = [];

for (const file of files) {
  let arr;
  try { arr = JSON.parse(readFileSync(join(labsDir, file), "utf8")); } catch (e) {
    failures.push(`${file}: invalid JSON — ${e.message}`); fail++; continue;
  }
  for (const ex of arr) {
    exercises++;
    const seed = {};
    for (const [k, v] of Object.entries(ex.given ?? {})) seed[k] = String(v);
    for (const c of ex.checks ?? []) {
      seed[c.cell] = c.hintFormula ? c.hintFormula : String(c.expected);
    }
    const sheet = createSheet(seed);
    for (const c of ex.checks ?? []) {
      const got = sheet.get(c.cell);
      const ok = valuesMatch(got, c.expected, c.tol ?? 1e-3);
      if (ok) pass++;
      else {
        fail++;
        failures.push(`${file} [${ex.id}] ${c.cell} "${typeof c.label === "string" ? c.label : ""}"  formula=${c.hintFormula || "(literal)"}  got=${got}  expected=${c.expected}`);
      }
    }
  }
}

rmSync(tmp, { force: true });
console.log(`\nLab exercises: ${exercises} exercises, ${pass} checks passed, ${fail} failed.`);
if (fail) {
  console.log("\nFailures:");
  for (const f of failures.slice(0, 40)) console.log("  " + f);
  process.exit(1);
}
console.log("All lab answers reproduce their expected values. ✓");
