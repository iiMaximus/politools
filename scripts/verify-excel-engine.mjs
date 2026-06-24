/* Verify the in-browser Excel engine against Excel's own cached values.
 *
 *   node scripts/verify-excel-engine.mjs
 *
 * Ground truth = scripts/excel-fixtures.json, generated from the course's
 * "Statistics functions.xlsx" (every NORM/T/CHISQ/F/BINOM/HYPGEOM cell +
 * inverses), plus hand-built descriptive-stat checks from the real exam.
 * The TS engine is bundled on the fly with esbuild (already a dep). */

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, "scripts", `.excel-engine.${process.pid}.mjs`);

// 1. bundle the engine
execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  ["src/lib/excel/index.ts", "--bundle", "--format=esm", "--platform=node", `--outfile=${tmp}`],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] }
);

const { createSheet } = await import(pathToFileURL(tmp).href);

const REL = 2e-6;     // relative tolerance for distribution direct values
const INV_REL = 1e-4; // looser for inverse-CDF (bisection) results

let pass = 0;
let fail = 0;
const failures = [];

function close(got, exp, rel) {
  if (typeof got !== "number" || !Number.isFinite(got)) return false;
  const denom = Math.max(1e-12, Math.abs(exp));
  return Math.abs(got - exp) <= rel * denom || Math.abs(got - exp) <= 1e-9;
}

// 2. replay the fixture sheets
const fixtures = JSON.parse(readFileSync(join(root, "scripts/excel-fixtures.json"), "utf8"));
for (const fx of fixtures) {
  const sheet = createSheet(fx.cells);
  const isInv = /INV/.test(Object.values(fx.cells).join(" "));
  for (const [addr, exp] of Object.entries(fx.expected)) {
    const got = sheet.get(addr);
    const rel = /INV/.test(fx.cells[addr] || "") ? INV_REL : REL;
    if (close(got, exp, rel)) pass++;
    else {
      fail++;
      if (failures.length < 25)
        failures.push(`${fx.sheet}!${addr}  ${fx.cells[addr]}  got=${got}  exp=${exp}`);
    }
  }
  void isInv;
}

// 3. hand-built descriptive-stat ground truth (real 14/01/2026 exam, Data Analysis)
const rough = [43, 42, 46, 44, 48, 44, 48, 45, 45, 47, 42, 46, 47, 41, 48, 36, 46, 48, 47, 45];
const seed = {};
rough.forEach((v, i) => (seed[`A${i + 1}`] = String(v)));
seed.C1 = "=AVERAGE(A1:A20)";
seed.C2 = "=STDEV.S(A1:A20)";
seed.C3 = "=1/(2*COUNT(A1:A20))";          // alpha (Chauvenet risk)
seed.C4 = "=C1-NORM.S.INV(1-1/(4*COUNT(A1:A20)))*C2"; // lower exclusion limit
seed.C5 = "=C1+NORM.S.INV(1-1/(4*COUNT(A1:A20)))*C2"; // upper exclusion limit
seed.C6 = "=MEDIAN(A1:A20)";
seed.C7 = "=QUARTILE(A1:A20,1)";
seed.C8 = "=QUARTILE(A1:A20,3)";
const ds = createSheet(seed);
const checks = [
  ["AVERAGE", "C1", 44.9, REL],
  ["STDEV.S", "C2", 3.0079, 1e-3],
  ["alpha 1/(2n)", "C3", 0.025, REL],
  ["Chauvenet lower", "C4", 38.16, 1e-2],
  ["Chauvenet upper", "C5", 51.64, 1e-2],
  ["MEDIAN", "C6", 45.5, REL],
  ["QUARTILE.1", "C7", 43.75, 1e-3],
  ["QUARTILE.3", "C8", 47, 1e-3],
];
for (const [name, addr, exp, rel] of checks) {
  const got = ds.get(addr);
  if (close(got, exp, rel)) pass++;
  else { fail++; failures.push(`descriptive ${name} ${addr}  got=${got}  exp=${exp}`); }
}

// 4. report
rmSync(tmp, { force: true });

console.log(`\nExcel engine verification: ${pass} passed, ${fail} failed (of ${pass + fail}).`);
if (fail) {
  console.log("\nFirst failures:");
  for (const f of failures) console.log("  " + f);
  process.exit(1);
}
console.log("All ground-truth values match Excel. ✓");
