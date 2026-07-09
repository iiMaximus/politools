import type { Course } from "../../types";
import { loadTopic } from "./load";

// Authored from the real course material (course_material/statistics).
// Theory + interactive Excel labs + practice + exams for the Polito
// "Experimental Statistics & Mechanical Measurements" (ESMM) exam.
import theoryMeasurement from "./topics/theory-measurement.json";
import theoryProbability from "./topics/theory-probability.json";
import theoryStatistics from "./topics/theory-statistics.json";
import lab1prob from "./topics/lab1-prob.json";
import lab1stats from "./topics/lab1-stats.json";
import theoryData from "./topics/theory-data.json";
import theoryRegression from "./topics/theory-regression.json";
import theoryHypothesis from "./topics/theory-hypothesis.json";
import lab2data from "./topics/lab2-data.json";
import theoryUncB from "./topics/theory-uncertainty-b.json";
import theoryUncCombined from "./topics/theory-uncertainty-combined.json";
import lab3uncertainty from "./topics/lab3-uncertainty.json";
import drillUncertainty from "./topics/drill-uncertainty.json";
import theoryMechanical from "./topics/theory-mechanical.json";
import excelCheatSheet from "./topics/excel-cheat-sheet.json";
import exam from "./topics/exam.json";

// [slug, raw, fallbackTitle, lecture (groups lessons), tutorial (groups questions/exams)]
const ORDER: [string, unknown, string, string, string][] = [
  ["theory-measurement", theoryMeasurement, "Measurement results & instruments", "Foundations", "Measurement results & instruments"],
  ["theory-probability", theoryProbability, "Probability & distributions", "Foundations", "Probability & distributions"],
  ["theory-statistics", theoryStatistics, "Statistics & sampling", "Foundations", "Statistics & sampling"],
  ["lab1-prob", lab1prob, "Lab 1 · Probability in Excel", "Lab 1 · Probability & Statistics", "Lab 1 — Probability"],
  ["lab1-stats", lab1stats, "Lab 1 · Statistics in Excel", "Lab 1 · Probability & Statistics", "Lab 1 — Statistics"],
  ["theory-data", theoryData, "Managing experimental data", "Data-analysis theory", "Data analysis & outliers"],
  ["theory-regression", theoryRegression, "Linear regression", "Data-analysis theory", "Linear regression"],
  ["theory-hypothesis", theoryHypothesis, "Hypothesis tests & ANOVA", "Data-analysis theory", "Hypothesis tests & ANOVA"],
  ["lab2-data", lab2data, "Lab 2 · Analysis of Experimental Data", "Lab 2 · Analysis of Experimental Data", "Lab 2 — Data analysis"],
  ["theory-uncertainty-b", theoryUncB, "Type B uncertainty", "Uncertainty theory", "Type B uncertainty"],
  ["theory-uncertainty-combined", theoryUncCombined, "Combined & expanded uncertainty", "Uncertainty theory", "Combined & expanded uncertainty"],
  ["lab3-uncertainty", lab3uncertainty, "Lab 3 · Evaluation of Measurement Uncertainty", "Lab 3 · Evaluation of Measurement Uncertainty", "Lab 3 — Uncertainty"],
  ["drill-uncertainty", drillUncertainty, "Uncertainty exam drill", "Uncertainty drill", "Uncertainty drill — exam bank"],
  ["theory-mechanical", theoryMechanical, "Mechanical measurements", "Mechanical measurements", "Mechanical measurements (T/F)"],
  ["excel-cheat-sheet", excelCheatSheet, "Excel exam cheat sheet", "Exam", "Excel exam cheat sheet"],
  ["exam", exam, "The exam, end to end", "Exam", "Exam simulation"],
];

const loaded = ORDER.map(([slug, raw, fallbackTitle, lecture, tutorial]) =>
  loadTopic(raw, slug, { fallbackTitle, lecture, tutorial })
);

const statistics: Course = {
  meta: {
    id: "statistics",
    title: "Experimental Statistics & Mechanical Measurements",
    short: "ESMM",
    tagline: "Master the Excel labs and the theory — pass ESMM with 30/30.",
    description:
      "The complete Polito ESMM course, built around the exam's three hands-on Excel labs — Applications of Probability & Statistics, Analysis of Experimental Data, and Evaluation of Measurement Uncertainty — plus the Mechanical Measurements true/false theory. Learn the theory briefly, then practise every tutorial inside a real in-browser spreadsheet: type the formulas, press Check, and see exactly how the exam is solved.",
    accent: "#1f9d8f",
    accent2: "#37c2a8",
    icon: "Sigma",
    year: 2,
    semester: 1,
    credits: 6,
    examDate: "2026-07-08",
    syllabus: [
      "Probability & discrete distributions",
      "Descriptive statistics & sampling",
      "Outliers, frequency & normal-probability plots",
      "Linear regression",
      "Hypothesis tests & ANOVA",
      "Type B, combined & expanded uncertainty",
      "Mechanical measurements (length, mass, hardness)",
    ],
    status: "complete",
  },
  lessons: loaded.map((l) => l.lesson),
  practice: loaded.flatMap((l) => l.practice),
  exam: loaded.flatMap((l) => l.exam),
};

export default statistics;
