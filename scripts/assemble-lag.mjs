// Assemble the Linear Algebra & Geometry course from the 3 workflow outputs.
// Usage: node scripts/assemble-lag.mjs <mcqOut> <matlabOut> <theoryOut>
import fs from "node:fs";

const [mcqFile, matlabFile, theoryFile] = process.argv.slice(2);
const ROOT = "/Users/maksym/Desktop/apps/TMM/polito";
const DIR = `${ROOT}/src/courses/linear-algebra`;
const TOPICS_DIR = `${DIR}/topics`;
fs.mkdirSync(TOPICS_DIR, { recursive: true });

const readResult = (f) => {
  const p = JSON.parse(fs.readFileSync(f, "utf8"));
  return Array.isArray(p) ? p : p.result;
};

// canonical topic label per source slug / W1 topic
const CANON = {
  "matlab-basics": "MATLAB · Basics",
  "matlab-errors": "MATLAB · Numerical errors",
  "matlab-systems": "MATLAB · Linear systems",
  "matlab-eigen": "MATLAB · Eigenvalues & SVD",
  "th-vectors": "Vectors & geometry",
  "th-lines-planes": "Lines & planes",
  "th-matrices": "Matrices & determinants",
  "th-systems": "Linear systems & rank",
  "th-vector-spaces": "Vector spaces & bases",
  "th-linear-maps": "Linear maps",
  "th-eigen": "Eigenvalues & diagonalization",
  "th-orthogonality": "Orthogonality & quadratic forms",
  "th-conics": "Conics & quadrics",
  "th-distances": "Distances, circles & spheres",
};
// normalize W1 free-text topics → canonical
const W1MAP = {
  "Spheres & distances": "Distances, circles & spheres",
  "Linear systems & rank": "Linear systems & rank",
  "Eigenvalues & diagonalization": "Eigenvalues & diagonalization",
  "Vectors & geometry": "Vectors & geometry",
  "Lines & planes": "Lines & planes",
  "Matrices & determinants": "Matrices & determinants",
  "Vector spaces & bases": "Vector spaces & bases",
  "Linear maps": "Linear maps",
  "Orthogonality & quadratic forms": "Orthogonality & quadratic forms",
  "Conics & quadrics": "Conics & quadrics",
};

const MATLAB_ORDER = ["matlab-basics", "matlab-errors", "matlab-systems", "matlab-eigen"];
const THEORY_ORDER = ["th-vectors", "th-lines-planes", "th-matrices", "th-systems", "th-vector-spaces", "th-linear-maps", "th-eigen", "th-orthogonality", "th-conics", "th-distances"];
const MATLAB_TOPICS = new Set(MATLAB_ORDER);

const cards = [];
const exam = [];
let cardId = 0;
let examId = 0;
const okOpt = (q) => Array.isArray(q.options) && q.options.length === 4 && q.options.some((o) => o.id === q.correct);

function addCard(q, topic, mod, src) {
  if (!okOpt(q)) return false;
  cardId++;
  cards.push({
    id: `lag-q${cardId}`,
    module: mod,
    topic,
    difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
    prompt: q.prompt,
    options: q.options.map((o) => ({ id: o.id, content: o.content })),
    correct: q.correct,
    explanation: q.explanation ?? "",
    theory: q.theory,
    source: q.source ?? src,
  });
  return true;
}
function addExam(e, topic, src) {
  if (!e || !e.steps || !e.steps.length) return false;
  examId++;
  exam.push({
    id: `lag-e${examId}`,
    topic,
    title: e.title ?? "Exercise",
    meta: e.meta ?? src,
    difficulty: e.difficulty ?? "medium",
    statement: e.statement ?? "",
    given: e.given,
    steps: e.steps.map((s) => ({ title: s.title ?? "", content: s.content ?? "" })),
    finalAnswer: e.finalAnswer ?? "",
    tips: e.tips,
  });
  return true;
}

// ---- W2 + W3: lessons + their practice/exam ----
const topicData = {};
for (const f of [matlabFile, theoryFile]) {
  for (const r of readResult(f)) {
    if (!r || !r.slug || !r.data) continue;
    topicData[r.slug] = r.data;
  }
}
let lessonsWritten = 0;
for (const slug of [...MATLAB_ORDER, ...THEORY_ORDER]) {
  const d = topicData[slug];
  if (!d) {
    console.warn("MISSING topic:", slug);
    continue;
  }
  const lecture = MATLAB_TOPICS.has(slug) ? "MATLAB part" : "Written part (theory)";
  fs.writeFileSync(
    `${TOPICS_DIR}/${slug}.json`,
    JSON.stringify({ title: d.title, summary: d.summary, minutes: d.minutes, objectives: d.objectives, blocks: d.blocks, lecture }, null, 2) + "\n"
  );
  lessonsWritten++;
  const topic = CANON[slug] ?? d.title;
  const mod = MATLAB_TOPICS.has(slug) ? "MATLAB part" : "Written part";
  for (const q of d.practice ?? []) addCard(q, topic, mod, d.title);
  for (const e of d.exam ?? []) addExam(e, topic, d.title);
}

// ---- W1: the extracted MCQ bank (written part) ----
let w1 = 0;
for (const r of readResult(mcqFile)) {
  for (const q of (r && r.mcqs) ?? []) {
    const topic = W1MAP[q.topic] ?? q.topic ?? "Written MCQs";
    if (addCard(q, topic, "Written part", "Official LAG MCQ")) w1++;
  }
}

fs.writeFileSync(`${DIR}/linear-algebra-cards.json`, JSON.stringify(cards, null, 2) + "\n");
fs.writeFileSync(`${DIR}/linear-algebra-exam.json`, JSON.stringify(exam, null, 2) + "\n");

// per-topic tally
const byTopic = {};
for (const c of cards) byTopic[c.topic] = (byTopic[c.topic] || 0) + 1;
const dist = { A: 0, B: 0, C: 0, D: 0 };
for (const c of cards) dist[c.correct] = (dist[c.correct] || 0) + 1;

console.log(`Lessons: ${lessonsWritten} topic files`);
console.log(`Cards: ${cards.length} (official MCQs from W1: ${w1})`);
console.log(`Exam problems: ${exam.length}`);
console.log("Correct-letter distribution:", dist);
console.log("Cards per topic:");
for (const [t, n] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${t}`);
