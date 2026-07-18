import type { Course } from "../../types";
import { loadTopic } from "./load";
import { numericDrills } from "./numeric";
import { writtenTest2025 } from "./written-test";

// Authored from the real course material (course_material/thermo_course).
// Regenerate JSON with: node scripts/extract-thermo.mjs <workflow-output>
import fundamentals from "./topics/fundamentals.json";
import firstLaw from "./topics/first-law.json";
import secondLaw from "./topics/second-law.json";
import vaporCycles from "./topics/vapor-cycles.json";
import gasCycles from "./topics/gas-cycles.json";
import moistAir from "./topics/moist-air.json";
import conduction from "./topics/conduction.json";
import convection from "./topics/convection.json";
import heatExchangers from "./topics/heat-exchangers.json";
import radiation from "./topics/radiation.json";

// [slug, raw, fallbackTitle, lecture (groups lessons), tutorial (groups questions)]
const ORDER: [string, unknown, string, string, string][] = [
  ["fundamentals", fundamentals, "Fundamentals", "Thermodynamics 1", "Fundamentals (properties & ideal gas)"],
  ["first-law", firstLaw, "First Law", "Thermodynamics 1", "Tutorial 1 — First law"],
  ["second-law", secondLaw, "Second Law & Entropy", "Thermodynamics 2", "Tutorial 2 — Second law"],
  ["vapor-cycles", vaporCycles, "Vapor power & refrigeration cycles", "Thermodynamics 3", "Tutorial 3 — Vapor & refrigeration cycles"],
  ["gas-cycles", gasCycles, "Gas power & refrigeration cycles", "Thermodynamics 4", "Tutorial 4 — Gas cycles"],
  ["moist-air", moistAir, "Moist air & air conditioning", "Thermodynamics 5", "Tutorial 5 — Moist air & A/C"],
  ["conduction", conduction, "Conduction", "Heat Transfer 1", "Tutorial 6 — Conduction"],
  ["convection", convection, "Convection", "Heat Transfer 2", "Tutorial 7 — Convection"],
  ["heat-exchangers", heatExchangers, "Heat exchangers", "Heat Transfer 3", "Tutorial 8 — Heat exchangers"],
  ["radiation", radiation, "Radiation", "Heat Transfer 4", "Tutorial 9 — Radiation"],
];

const loaded = ORDER.map(([slug, raw, fallbackTitle, lecture, tutorial]) =>
  loadTopic(raw, slug, { fallbackTitle, lecture, tutorial })
);

const thermodynamics: Course = {
  meta: {
    id: "thermodynamics",
    title: "Thermodynamics & Heat Transfer",
    short: "Thermo",
    tagline: "Energy, cycles and heat flow — taught like a checklist, not a brick wall.",
    description:
      "The complete Thermodynamics & Heat Transfer course, rewritten to be easier to enter: every lesson starts with the plain-English idea, the exam recipe, and the traps that usually steal marks. Then the course builds from properties and the two laws through power and refrigeration cycles, moist air, conduction, convection, heat exchangers, and radiation, with simulations, worked examples, checkpoints, adaptive practice, and exam-style problems.",
    accent: "#ff7a59",
    accent2: "#ffb454",
    icon: "Flame",
    year: 2,
    semester: 2,
    credits: 8,
    examDate: "2026-09-16",
    syllabus: [
      "Properties & ideal gas",
      "First Law",
      "Second Law & entropy",
      "Vapor cycles",
      "Gas cycles",
      "Moist air",
      "Conduction",
      "Convection",
      "Heat exchangers",
      "Radiation",
    ],
    status: "complete",
  },
  lessons: loaded.map((l) => l.lesson),
  practice: [...loaded.flatMap((l) => l.practice), ...numericDrills, ...writtenTest2025],
  exam: loaded.flatMap((l) => l.exam),
};

export default thermodynamics;
