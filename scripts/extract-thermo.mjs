// Extract authored thermo topics from the workflow output into topic JSON files.
// Usage: node scripts/extract-thermo.mjs <workflow-output-file>
import fs from "node:fs";

const ROOT = "/Users/maksym/Desktop/apps/TMM/polito";
const outFile = process.argv[2];
const parsed = JSON.parse(fs.readFileSync(outFile, "utf8"));
const results = Array.isArray(parsed) ? parsed : parsed.result;
if (!Array.isArray(results)) throw new Error("no result array");

const dir = `${ROOT}/src/courses/thermodynamics/topics`;
fs.mkdirSync(dir, { recursive: true });

let total = { lessons: 0, practice: 0, exam: 0 };
const summary = [];
for (const r of results) {
  if (!r || !r.slug || !r.data) continue;
  const d = r.data;
  fs.writeFileSync(`${dir}/${r.slug}.json`, JSON.stringify(d, null, 2) + "\n");
  const nPractice = (d.practice || []).length;
  const nExam = (d.exam || []).length;
  const nBlocks = (d.blocks || []).length;
  const nSims = (d.blocks || []).filter((b) => b.kind === "sim").length;
  total.lessons += 1;
  total.practice += nPractice;
  total.exam += nExam;
  summary.push(`${r.slug.padEnd(16)} blocks:${nBlocks}  sims:${nSims}  MCQ:${nPractice}  exam:${nExam}`);
}

console.log(`Wrote ${total.lessons} topics to topics/`);
summary.forEach((s) => console.log("  " + s));
console.log(`TOTAL: ${total.lessons} lessons, ${total.practice} MCQs, ${total.exam} exam problems`);
