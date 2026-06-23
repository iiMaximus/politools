// Merge audit gap-fill cards into cyber-cards.json.
// Usage: node scripts/merge-audit.mjs <workflow-output-file>
import fs from "node:fs";

const ROOT = "/Users/maksym/Desktop/apps/TMM";
const outFile = process.argv[2];
const raw = fs.readFileSync(outFile, "utf8");

// The output file is the workflow's structured result: either the array itself
// or an object wrapping it under `result`.
const parsed = JSON.parse(raw);
const modules = Array.isArray(parsed) ? parsed : parsed.result;
if (!Array.isArray(modules)) throw new Error("could not find module results array");

// letter -> module title, from the classic content-map
const map = JSON.parse(fs.readFileSync(`${ROOT}/Cyber/data/content-map.json`, "utf8"));
const letterToTitle = {};
for (const m of map.modules) {
  const l = (m.title.match(/Module ([A-Z])/) || [])[1];
  if (l) letterToTitle[l] = m.title;
}

const cardsPath = `${ROOT}/polito/src/courses/cybersecurity/cyber-cards.json`;
const existing = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
const existingPrompts = new Set(existing.map((c) => c.prompt.trim().toLowerCase()));

const added = [];
const skipped = [];
let perLetter = {};
for (const mod of modules) {
  for (const c of mod.newCards || []) {
    const letter = (c.topic.match(/^([A-Z])\d/) || [])[1] || (c.topic[0] || "");
    // validity checks
    const optIds = (c.options || []).map((o) => o.id);
    if (!c.options || c.options.length !== 4 || !optIds.includes(c.correct)) {
      skipped.push({ topic: c.topic, reason: "bad options/correct" });
      continue;
    }
    if (existingPrompts.has(c.prompt.trim().toLowerCase())) {
      skipped.push({ topic: c.topic, reason: "duplicate prompt" });
      continue;
    }
    perLetter[letter] = (perLetter[letter] || 0) + 1;
    added.push({
      id: `cy-aud-${letter}-${perLetter[letter]}`,
      topic: c.topic,
      module: letterToTitle[letter] || "Cybersecurity",
      moduleLetter: letter,
      difficulty: ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
      prompt: c.prompt,
      options: c.options.map((o) => ({ id: o.id, content: o.content })),
      correct: c.correct,
      explanation: c.explanation || "",
      theory: c.theory || undefined,
      source: c.source || undefined,
      tags: ["audit-added"],
    });
    existingPrompts.add(c.prompt.trim().toLowerCase());
  }
}

const merged = existing.concat(added);
fs.writeFileSync(cardsPath, JSON.stringify(merged, null, 2) + "\n");

console.log(`Existing: ${existing.length}  +Added: ${added.length}  =Total: ${merged.length}`);
console.log("Added per module:", perLetter);
if (skipped.length) console.log("Skipped:", skipped);
