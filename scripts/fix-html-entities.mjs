// Decode HTML entities (&amp; &lt; &gt; &quot; &#39;) that leaked into authored
// JSON string fields. Decode &amp; LAST. Reports per-file change counts.
import fs from "node:fs";
import path from "node:path";

let changed = 0, files = 0;
const decode = (s) => {
  if (typeof s !== "string") return s;
  const out = s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  if (out !== s) changed++;
  return out;
};
const walk = (v) =>
  typeof v === "string" ? decode(v) : Array.isArray(v) ? v.map(walk) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v;

const findJson = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? findJson(p) : e.name.endsWith(".json") ? [p] : [];
  });

for (const f of findJson(process.argv[2] || "src/courses")) {
  let data;
  try { data = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }
  const before = changed;
  const fixed = walk(data);
  if (changed > before) {
    fs.writeFileSync(f, JSON.stringify(fixed, null, 2) + "\n");
    files++;
    console.log(`  ${changed - before} field(s): ${path.relative(process.cwd(), f)}`);
  }
}
console.log(`Done. ${changed} fields decoded across ${files} files.`);
