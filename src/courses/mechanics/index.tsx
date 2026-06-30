import type { Course } from "../../types";
import { loadTopic } from "../../lib/loadTopic";
import cards from "./mechanics-cards.json";
import examProblems from "./mechanics-exam.json";

import kinematics from "./topics/mech-kinematics.json";
import dynamics from "./topics/mech-dynamics.json";
import friction from "./topics/mech-friction.json";
import brakes from "./topics/mech-brakes.json";
import gears from "./topics/mech-gears.json";
import transmission from "./topics/mech-transmission.json";
import vibrations from "./topics/mech-vibrations.json";
import examSims from "./topics/mech-exam-sims.json";

// Built from the Ferraresi–Raparelli "Applied Mechanics" material (course_material/Mechanics).
const TOPIC_FILES: [string, unknown][] = [
  ["mech-kinematics", kinematics],
  ["mech-dynamics", dynamics],
  ["mech-friction", friction],
  ["mech-brakes", brakes],
  ["mech-gears", gears],
  ["mech-transmission", transmission],
  ["mech-vibrations", vibrations],
  ["mech-exam-sims", examSims],
];

const LESSONS = TOPIC_FILES.map(
  ([slug, raw]) => loadTopic(raw, slug, { tutorial: "", fallbackTitle: slug }).lesson
);

const mechanics: Course = {
  meta: {
    id: "mechanics",
    title: "Applied Mechanics",
    short: "Mechanics",
    tagline: "The exam is worked problems — so this is 70+ solved exercises + quick theory.",
    description:
      "An exam-focused Applied Mechanics sprint built from the Ferraresi–Raparelli course material. The exam is three multi-part problems (mechanism kinematics, dynamics/vibration, motion transmission), so the heart of this course is 70+ fully worked exercises (verified against the official answer keys) plus the two complete exam simulations. Each topic opens with a short, formula-focused theory refresher — just enough to solve the problems.",
    accent: "#3f9b8e",
    accent2: "#5fc7a3",
    icon: "Cog",
    year: 3,
    semester: 1,
    credits: 10,
    examDate: "2026-06-24",
    syllabus: [
      "Kinematics of mechanisms (ICR, four-bar, slider-crank)",
      "Dynamics: FBD, Newton-Euler & energy",
      "Friction & rolling",
      "Brakes & clutches",
      "Gears & tooth forces",
      "Gear trains, belts & power screws",
      "Transients & vibrations",
      "Full exam simulations",
    ],
    status: "complete",
  },
  lessons: LESSONS,
  practice: cards as unknown as Course["practice"],
  exam: examProblems as unknown as Course["exam"],
};

export default mechanics;
