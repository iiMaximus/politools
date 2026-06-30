// Assemble the Applied Mechanics course from the workflow output.
// Usage: node scripts/assemble-mech.mjs <workflow-output-file>
import fs from "node:fs";

const out = process.argv[2];
const DIR = "/Users/maksym/Desktop/apps/TMM/polito/src/courses/mechanics";
const TOPICS_DIR = `${DIR}/topics`;
fs.mkdirSync(TOPICS_DIR, { recursive: true });

const parsed = JSON.parse(fs.readFileSync(out, "utf8"));
const results = Array.isArray(parsed) ? parsed : parsed.result;

const ORDER = ["mech-kinematics", "mech-dynamics", "mech-friction", "mech-brakes", "mech-gears", "mech-transmission", "mech-vibrations", "mech-exam-sims"];
const byslug = {};
for (const r of results) if (r && r.slug && r.data) byslug[r.slug] = r.data;

const cards = [];
const exam = [];
let cardId = 0, examId = 0, lessons = 0;
const okOpt = (q) => Array.isArray(q.options) && q.options.length === 4 && q.options.some((o) => o.id === q.correct);

for (const slug of ORDER) {
  const d = byslug[slug];
  if (!d) { console.warn("MISSING", slug); continue; }
  const topic = d.title || slug;
  fs.writeFileSync(`${TOPICS_DIR}/${slug}.json`, JSON.stringify({ title: d.title, summary: d.summary, minutes: d.minutes, objectives: d.objectives, blocks: d.blocks }, null, 2) + "\n");
  lessons++;
  for (const q of d.practice ?? []) {
    if (!okOpt(q)) continue;
    cardId++;
    cards.push({ id: `mech-q${cardId}`, topic, difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium", prompt: q.prompt, options: q.options.map((o) => ({ id: o.id, content: o.content })), correct: q.correct, explanation: q.explanation ?? "", theory: q.theory, source: q.source });
  }
  for (const e of d.exam ?? []) {
    if (!e || !e.steps?.length) continue;
    examId++;
    exam.push({ id: `mech-e${examId}`, topic, title: e.title ?? "Problem", meta: e.meta ?? "", difficulty: e.difficulty ?? "medium", statement: e.statement ?? "", given: e.given, steps: e.steps.map((s) => ({ title: s.title ?? "", content: s.content ?? "" })), finalAnswer: e.finalAnswer ?? "", tips: e.tips });
  }
}

fs.writeFileSync(`${DIR}/mechanics-cards.json`, JSON.stringify(cards, null, 2) + "\n");
fs.writeFileSync(`${DIR}/mechanics-exam.json`, JSON.stringify(exam, null, 2) + "\n");

const byTopicExam = {};
for (const e of exam) byTopicExam[e.topic] = (byTopicExam[e.topic] || 0) + 1;
console.log(`Lessons: ${lessons}, practice MCQs: ${cards.length}, worked exam problems: ${exam.length}`);
console.log("Worked problems per topic:");
for (const [t, n] of Object.entries(byTopicExam)) console.log(`  ${String(n).padStart(3)}  ${t}`);
