// One-off migration: old Cyber flashcards -> new Polito Tools cybersecurity practice bank.
// Run from polito/:  node scripts/migrate-cyber.mjs
import fs from "node:fs";

const ROOT = "/Users/maksym/Desktop/apps/TMM";
const cards = JSON.parse(fs.readFileSync(`${ROOT}/Cyber/data/questions.json`, "utf8"));
const map = JSON.parse(fs.readFileSync(`${ROOT}/Cyber/data/content-map.json`, "utf8"));

const lectureTitle = {};
const moduleTitle = {};
const moduleLetter = {};
for (const m of map.modules) {
  moduleTitle[m.id] = m.title;
  const letter = (m.title.match(/Module ([A-Z])/) || [])[1] || "";
  moduleLetter[m.id] = letter;
  for (const l of m.lectures || []) lectureTitle[l.id] = l.title;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const out = cards
  .filter((c) => !c.diagramRequired)
  .map((c) => {
    const options = LETTERS.filter((k) => c.options && c.options[k] != null).map((k) => ({
      id: k,
      content: c.options[k],
    }));
    return {
      id: `cy-${c.id}`,
      // topic = the specific lecture (e.g. "A1: Why cybersecurity"); falls back to module
      topic: lectureTitle[c.lectureId] || moduleTitle[c.moduleId] || c.section || "Cybersecurity",
      module: moduleTitle[c.moduleId] || c.section || "Cybersecurity",
      moduleLetter: moduleLetter[c.moduleId] || "",
      difficulty: ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
      prompt: c.question,
      options,
      correct: c.correctAnswer,
      explanation: c.explanation || "",
      theory: c.relevantTheory || undefined,
      source: c.source || undefined,
      tags: Array.isArray(c.trapTags) && c.trapTags.length ? c.trapTags : undefined,
    };
  });

// sanity checks
const bad = out.filter((q) => !q.options.some((o) => o.id === q.correct));
if (bad.length) {
  console.error("WARNING: cards whose correct answer has no matching option:", bad.map((q) => q.id));
}
const dupes = out.length - new Set(out.map((q) => q.id)).size;

// Preserve gap-fill cards added by the slide-coverage audit (scripts/merge-audit.mjs),
// so re-running this migration never silently drops them.
const target = `${ROOT}/polito/src/courses/cybersecurity/cyber-cards.json`;
let preserved = [];
if (fs.existsSync(target)) {
  try {
    preserved = JSON.parse(fs.readFileSync(target, "utf8")).filter(
      (c) => c.id?.startsWith("cy-aud-") || c.tags?.includes("audit-added")
    );
  } catch {
    /* ignore */
  }
}
const final = out.concat(preserved);
fs.writeFileSync(target, JSON.stringify(final, null, 2) + "\n");
if (preserved.length) console.log(`Preserved ${preserved.length} audit-added cards.`);

// quick per-topic tally
const byTopic = {};
for (const q of out) byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
console.log(`Migrated ${out.length} cards, ${dupes} duplicate ids, ${bad.length} answer-mismatch.`);
console.log(`Topics (${Object.keys(byTopic).length}):`);
for (const [t, n] of Object.entries(byTopic)) console.log(`  ${n.toString().padStart(3)}  ${t}`);
