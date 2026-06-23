// Wire the 8 authored Cyber module lessons into the cybersecurity course.
import fs from "node:fs";
const p = "src/courses/cybersecurity/index.tsx";
let s = fs.readFileSync(p, "utf8");

// 1) imports + LESSONS assembly (drop the direct CaesarCipherSim import; it's via the registry now)
s = s.replace(
  `import type { Course } from "../../types";
import { Tex } from "../../lib/math";
import { CaesarCipherSim } from "./sims/CaesarCipherSim";
import cyberCards from "./cyber-cards.json";`,
  `import type { Course } from "../../types";
import { Tex } from "../../lib/math";
import { loadTopic } from "../../lib/loadTopic";
import { CYBER_SIMS } from "./sims/registry";
import cyberCards from "./cyber-cards.json";
import moduleA from "./topics/module-a.json";
import moduleB from "./topics/module-b.json";
import moduleC from "./topics/module-c.json";
import moduleD from "./topics/module-d.json";
import moduleE from "./topics/module-e.json";
import moduleF from "./topics/module-f.json";
import moduleG from "./topics/module-g.json";
import moduleH from "./topics/module-h.json";

// Authored from the Cyber lecture slides (Cyber/Material). One lesson per module A–H.
const LESSON_SRC: [string, unknown][] = [
  ["module-a", moduleA],
  ["module-b", moduleB],
  ["module-c", moduleC],
  ["module-d", moduleD],
  ["module-e", moduleE],
  ["module-f", moduleF],
  ["module-g", moduleG],
  ["module-h", moduleH],
];
const LESSONS = LESSON_SRC.map(([slug, raw]) =>
  loadTopic(raw, slug, { tutorial: "", fallbackTitle: slug }, CYBER_SIMS).lesson
);`
);

// 2) drop the now-unused FrequencyTable helper (between the LESSONS block and the course object)
const marker = "CYBER_SIMS).lesson\n);";
const mIdx = s.indexOf(marker) + marker.length;
const aIdx = s.indexOf("const cybersecurity: Course");
if (mIdx < marker.length || aIdx === -1) throw new Error("markers not found");
s = s.slice(0, mIdx) + "\n\n" + s.slice(aIdx);

// 3) swap the inline sample lesson for the loaded module lessons
const li = s.indexOf("  lessons: [");
const pi = s.indexOf("  practice:", li);
if (li === -1 || pi === -1) throw new Error("lessons/practice markers not found");
s = s.slice(0, li) + "  lessons: LESSONS,\n\n" + s.slice(pi);

// 4) meta updates
s = s.replace('status: "sample",', 'status: "complete",');
s = s.replace(
  'tagline: "From classical ciphers to modern crypto and defence.",',
  'tagline: "Full module lectures (A–H) + the complete flashcard bank.",'
);
s = s.replace(
  /description:\s*"[^"]*",/,
  'description: "The full Cybersecurity course: eight module lectures (foundations, human factor, cryptography, secure design, OS & trusted computing, IoT, and cryptography as national defence) plus the complete flashcard bank, practiceable lecture by lecture.",'
);
s = s.replace(
  /syllabus: \[[^\]]*\],/,
  'syllabus: ["A · Foundations","B · Human factor","C · Cryptography","D · Secure design","E · OS security","F · Trusted computing","G · IoT","H · National defence"],'
);

fs.writeFileSync(p, s);
console.log("wired cyber lessons; file is", s.split("\n").length, "lines");
