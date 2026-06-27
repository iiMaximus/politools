import type { Course } from "../../types";
import cards from "./electronic-systems-cards.json";
import differentiatorCircuit from "./assets/differentiator-circuit-2025-05-27.png";
import integratorCircuit from "./assets/integrator-circuit-2025-01-15.png";

const practice = (cards as unknown as Course["practice"]).map((card) => {
  if (card.id === "fes-29test15jan2025-q02") {
    return {
      ...card,
      prompt: "What is the operation performed by this circuit?",
      visual: {
        type: "image" as const,
        src: integratorCircuit,
        alt: "Operational amplifier circuit with input resistor R and feedback capacitor C.",
        caption: "Source circuit for 29test15Jan2025, question 2.",
      },
    };
  }

  if (card.id === "fes-30test27may2025-q02") {
    return {
      ...card,
      prompt: "What is the operation performed by this circuit?",
      visual: {
        type: "image" as const,
        src: differentiatorCircuit,
        alt: "Operational amplifier circuit with input capacitor C and feedback resistor R.",
        caption: "Source circuit for 30test27May2025, question 2.",
      },
    };
  }

  return card;
});

const electronicSystems: Course = {
  meta: {
    id: "electronic-systems",
    title: "Fundamentals of Electronic Systems",
    short: "Electronic Systems",
    tagline: "Past-exam MCQs from 2021-2026, grouped by recurring exam topic.",
    description:
      "A practice-first Polito course built from solved Fundamentals of Electronic Systems past exams. Drill the recurring MCQ patterns: op-amp models, logic families, registers, ADC conditioning, filters, frequency response and interface traps.",
    accent: "#0f9f8f",
    accent2: "#2f8cff",
    icon: "CircuitBoard",
    year: 2,
    semester: 2,
    syllabus: [
      "Operational amplifiers and interfaces",
      "Logic families and inverters",
      "Digital logic and registers",
      "Data conversion and conditioning",
      "Filters and frequency response",
    ],
    status: "complete",
  },

  lessons: [
    {
      id: "past-exam-mcq-map",
      lecture: "Exam practice",
      title: "Past-exam MCQ map",
      summary: "How to use the extracted question bank and recognize the recurring traps.",
      minutes: 8,
      objectives: [
        "Recognize the main MCQ families used in recent solved exams.",
        "Choose the right electrical model before calculating or comparing answers.",
        "Use feedback explanations as compact theory notes while drilling.",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <>
              This course is intentionally practice-first. The bank below comes from solved past
              exams and keeps the professor's MCQ wording wherever the source text was reliable.
              Use this page as the map, then spend most of your time in Practice.
            </>
          ),
        },
        {
          kind: "definition",
          term: "Source bank",
          content: (
            <>
              The practice set contains 106 multiple-choice questions extracted from 47 solved PDFs
              covering exam sessions from 2021 to 2026. Numerical open questions and essay problems
              were left out so this subject stays focused on MCQ mastery.
            </>
          ),
        },
        {
          kind: "heading",
          text: "What repeats",
        },
        {
          kind: "steps",
          title: "Solve each MCQ with the same short routine",
          steps: [
            {
              label: "Model",
              content: (
                <>
                  Decide first whether the question is about an ideal amplifier block, a transistor
                  switch, a logic-family level, a register operation or a filter asymptote.
                </>
              ),
            },
            {
              label: "Map",
              content: (
                <>
                  For ADC and conditioning questions, map the whole input swing onto the allowed
                  converter swing before thinking about resolution or sampling.
                </>
              ),
            },
            {
              label: "State",
              content: (
                <>
                  For inverter and CMOS questions, identify which device is ON, which is OFF, and
                  whether the output is tied to VDD, GND or left weakly loaded.
                </>
              ),
            },
            {
              label: "Direction",
              content: (
                <>
                  For flip-flops, shift registers and counters, track the clock edge and the data
                  movement direction. Most distractors swap the state or shift direction.
                </>
              ),
            },
            {
              label: "Slope",
              content: (
                <>
                  For first-order filters, read the pass band, corner frequency and asymptotic
                  slope before comparing formulas.
                </>
              ),
            },
          ],
        },
        {
          kind: "callout",
          tone: "trap",
          title: "Common source traps",
          content: (
            <>
              Many wrong options change only one assumption: zero versus infinite resistance,
              differential versus common-mode gain, VOH/VOL versus VIH/VIL, or linear versus cutoff
              transistor state. When two answers look close, name the model aloud before choosing.
            </>
          ),
        },
        {
          kind: "checkpoint",
          question: {
            id: "fes-map-checkpoint",
            topic: "Exam practice",
            difficulty: "easy",
            prompt: "What is the best way to use this Electronic Systems subject?",
            options: [
              { id: "A", content: "Read the map once, then drill the extracted past-exam MCQs." },
              { id: "B", content: "Memorize only the correct letters from the PDFs." },
              { id: "C", content: "Skip explanations unless the answer was wrong." },
              { id: "D", content: "Treat every amplifier, logic and filter question with the same formula." },
            ],
            correct: "A",
            explanation:
              "The course is built around practice. The explanations are compact theory notes, so review them even when you answer correctly.",
            theory:
              "Past-exam MCQs are most useful when each attempt reinforces the underlying model, not just the answer letter.",
            tags: ["orientation"],
          },
        },
      ],
    },
  ],

  practice,

  exam: [],
};

export default electronicSystems;
