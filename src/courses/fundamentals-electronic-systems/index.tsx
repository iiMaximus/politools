import type { Course, QuestionVisual } from "../../types";
import cards from "./fundamentals-electronic-systems-cards.json";
import balancedLoadFeb23 from "./assets/balanced-load-2024-02-23.png";
import capacitorVoltageWaveform from "./assets/capacitor-voltage-waveform-2023-11-25-t1.png";
import dcCurrentGeneratorSep05 from "./assets/dc-current-generator-2024-09-05.png";
import dcGeneratorPowerApr29 from "./assets/dc-generator-power-2024-04-29.png";
import dcI3CircuitFeb23 from "./assets/dc-i3-circuit-2024-02-23.png";
import impedanceComponentTurno1 from "./assets/impedance-component-2023-11-25-t1.png";
import impedanceComponentTurno2 from "./assets/impedance-component-2023-11-25-t2.png";
import inductorIvFeb06 from "./assets/inductor-iv-2024-02-06.png";
import inductorSquareVoltageSep07 from "./assets/inductor-square-voltage-2023-09-07.png";
import inductorVoltageWaveformTurno2 from "./assets/inductor-voltage-waveform-2023-11-25-t2.png";
import nodeCurrentKclSep05 from "./assets/node-current-kcl-2024-09-05.png";
import opposedSourcesFeb06 from "./assets/opposed-sources-2024-02-06.png";
import parallelLcSep07 from "./assets/parallel-lc-2023-09-07.png";
import periodicRectWaveFeb23 from "./assets/periodic-rect-wave-2024-02-23.png";
import rcParallelPowerFeb06 from "./assets/rc-parallel-power-2024-02-06.png";
import seriesLcPhasorSep05 from "./assets/series-lc-phasor-2024-09-05.png";
import seriesRxCurrentFeb23 from "./assets/series-rx-current-2024-02-23.png";
import sinusoidalGridApr29 from "./assets/sinusoidal-grid-2024-04-29.png";
import threePhaseReactiveLoadApr29 from "./assets/three-phase-reactive-load-2024-04-29.png";
import voltageCurrentWaveformsSep05 from "./assets/voltage-current-waveforms-2024-09-05.png";

const VISUALS: Record<string, QuestionVisual> = {
  "fees-20240206-q01": {
    type: "image",
    src: inductorIvFeb06,
    alt: "Ideal inductor with current i(t), voltage v(t), and inductance L.",
    caption: "Source figure for 01JWDMN_20240206_eng, Quiz 1.",
  },
  "fees-20240206-q02": {
    type: "image",
    src: rcParallelPowerFeb06,
    alt: "Two-terminal component with a resistor in parallel with a capacitive reactance jXc.",
    caption: "Source figure for 01JWDMN_20240206_eng, Quiz 2.",
  },
  "fees-20240206-q04": {
    type: "image",
    src: opposedSourcesFeb06,
    alt: "Two DC branches with equal resistors and voltage sources of opposite polarities connected to output terminals.",
    caption: "Source figure for 01JWDMN_20240206_eng, Quiz 4.",
  },
  "fees-20240223-q01": {
    type: "image",
    src: dcI3CircuitFeb23,
    alt: "DC multi-branch circuit with resistors R1, R2, R3, sources E1, E2, E3, and current I3.",
    caption: "Source figure for 01JWDMN_20240223_eng, Quiz 1.",
  },
  "fees-20240223-q02": {
    type: "image",
    src: seriesRxCurrentFeb23,
    alt: "Series AC circuit with resistor R, reactance X, source E, and loop current I.",
    caption: "Source figure for 01JWDMN_20240223_eng, Quiz 2.",
  },
  "fees-20240223-q03": {
    type: "image",
    src: balancedLoadFeb23,
    alt: "Balanced three-phase load with three equal R-X branches.",
    caption: "Source figure for 01JWDMN_20240223_eng, Quiz 3.",
  },
  "fees-20240223-q04": {
    type: "image",
    src: periodicRectWaveFeb23,
    alt: "Periodic rectangular waveform with 4 ms positive interval and 1 ms negative interval.",
    caption: "Source figure for 01JWDMN_20240223_eng, Quiz 4.",
  },
  "fees-20231125-t1-q02": {
    type: "image",
    src: capacitorVoltageWaveform,
    alt: "Capacitor voltage waveform increasing, then flat between t1 and t2, then increasing again.",
    caption: "Source figure for 20231125_01JWDMN_turno1_eng, Quiz 2.",
  },
  "fees-20231125-t1-q03": {
    type: "image",
    src: impedanceComponentTurno1,
    alt: "Two-terminal AC impedance Z with current I and voltage V references.",
    caption: "Source figure for 20231125_01JWDMN_turno1_eng, Quiz 3.",
  },
  "fees-20231125-t2-q02": {
    type: "image",
    src: inductorVoltageWaveformTurno2,
    alt: "Inductor voltage waveform with a positive constant segment from t1 to t2.",
    caption: "Source figure for 20231125_01JWDMN_turno2_eng, Quiz 2.",
  },
  "fees-20231125-t2-q03": {
    type: "image",
    src: impedanceComponentTurno2,
    alt: "Two-terminal AC impedance Z with current I and voltage V references.",
    caption: "Source figure for 20231125_01JWDMN_turno2_eng, Quiz 3.",
  },
  "fees-20240429-q01": {
    type: "image",
    src: dcGeneratorPowerApr29,
    alt: "DC loop with one voltage generator E and one current generator A.",
    caption: "Source figure for 20240429_01JWDMN_eng, Quiz 1.",
  },
  "fees-20240429-q03": {
    type: "image",
    src: threePhaseReactiveLoadApr29,
    alt: "Balanced three-phase load with each phase containing resistance R and reactance X.",
    caption: "Source figure for 20240429_01JWDMN_eng, Quiz 3.",
  },
  "fees-20240429-q04": {
    type: "image",
    src: sinusoidalGridApr29,
    alt: "Sinusoidal voltage waveform drawn on a square grid with t and v(t) axes.",
    caption: "Source figure for 20240429_01JWDMN_eng, Quiz 4.",
  },
  "fees-20240905-q01": {
    type: "image",
    src: nodeCurrentKclSep05,
    alt: "Circuit node with currents i1(t), i2(t), and i3(t) entering or leaving the node.",
    caption: "Source figure for Exam05092024_eng, question 1.",
  },
  "fees-20240905-q02": {
    type: "image",
    src: dcCurrentGeneratorSep05,
    alt: "DC circuit with a current generator, resistor R1, resistor R2, and voltage source E.",
    caption: "Source figure for Exam05092024_eng, question 2.",
  },
  "fees-20240905-q03": {
    type: "image",
    src: seriesLcPhasorSep05,
    alt: "Series capacitor and inductor with common current I and voltages VC and VL.",
    caption: "Source figure for Exam05092024_eng, question 3.",
  },
  "fees-20240905-q04": {
    type: "image",
    src: voltageCurrentWaveformsSep05,
    alt: "Voltage and current sinusoids where the current leads the voltage.",
    caption: "Source figure for Exam05092024_eng, question 4.",
  },
  "fees-20230907-q01": {
    type: "image",
    src: inductorSquareVoltageSep07,
    alt: "Square waveform of voltage across an inductor.",
    caption: "Source figure for Exam07Sep2023eng, question 1.",
  },
  "fees-20230907-q02": {
    type: "image",
    src: parallelLcSep07,
    alt: "Parallel connection of a capacitive reactance and an inductive reactance between terminals A and B.",
    caption: "Source figure for Exam07Sep2023eng, question 2.",
  },
  "fees-sim1-q01": {
    type: "image",
    src: inductorSquareVoltageSep07,
    alt: "Square waveform of voltage across an inductor.",
    caption: "Source figure for Exam_simulation1_solution, question 1.",
  },
  "fees-sim1-q02": {
    type: "image",
    src: parallelLcSep07,
    alt: "Parallel connection of a capacitive reactance and an inductive reactance between terminals A and B.",
    caption: "Source figure for Exam_simulation1_solution, question 2.",
  },
};

const practice = (cards as unknown as Course["practice"]).map((card) => {
  const visual = VISUALS[card.id];
  return visual ? { ...card, visual } : card;
});

const fundamentalsElectronicSystems: Course = {
  meta: {
    id: "fundamentals-electronic-systems",
    title: "Fundamentals of Electronic Systems",
    short: "Fundamentals ES",
    tagline: "Intro circuit MCQs with the original source diagrams and waveforms.",
    description:
      "A focused practice course for the Fundamentals side of the electronic systems split. The bank extracts the multiple-choice and theory questions from the new past-exam folder, with the required circuits, phasor diagrams, three-phase loads and waveforms attached to each card.",
    accent: "#d97706",
    accent2: "#16a34a",
    icon: "Zap",
    year: 2,
    semester: 1,
    syllabus: [
      "DC circuit laws and power conventions",
      "Capacitors, inductors and first-order transients",
      "AC phasors and impedance",
      "Single-phase and three-phase power",
      "Waveform reading, average, RMS and frequency",
    ],
    status: "complete",
  },

  lessons: [
    {
      id: "fundamentals-mcq-map",
      lecture: "Exam practice",
      title: "Fundamentals MCQ map",
      summary: "How to attack the extracted fundamentals quiz questions without losing sign or phase conventions.",
      minutes: 8,
      objectives: [
        "Separate passive and active sign conventions before judging source power.",
        "Read capacitor and inductor waveform questions from derivatives and integrals.",
        "Use phasor angle, line-phase relations and grid scales to eliminate distractors.",
      ],
      blocks: [
        {
          kind: "prose",
          content: (
            <>
              This subject is the fundamentals half of the electronic systems material. The
              practice bank below keeps the exam MCQs and theory questions together with their
              source circuits, phasor sketches and waveform graphs.
            </>
          ),
        },
        {
          kind: "definition",
          term: "Source bank",
          content: (
            <>
              The practice set contains 29 cards extracted from the fundamentals exam folder.
              Numerical open-answer exercises were left out because this Polito Tools course is
              tuned for MCQ drilling, the same style as the existing Electronic Systems and TMM
              practice modes.
            </>
          ),
        },
        {
          kind: "heading",
          text: "What repeats",
        },
        {
          kind: "steps",
          title: "Use this short routine",
          steps: [
            {
              label: "Convention",
              content: (
                <>
                  Check whether the problem states passive or active sign convention. Most power
                  distractors are just the correct circuit with the sign reversed.
                </>
              ),
            },
            {
              label: "State variable",
              content: (
                <>
                  For capacitors, voltage is continuous and current follows dv/dt. For inductors,
                  current is continuous and voltage follows di/dt.
                </>
              ),
            },
            {
              label: "Phasor",
              content: (
                <>
                  A positive impedance angle means current lags voltage. Capacitive behavior means
                  current leads voltage and reactive power is negative under passive convention.
                </>
              ),
            },
            {
              label: "Three-phase",
              content: (
                <>
                  Decide whether the given voltage is phase or line voltage before using √3 factors.
                  In a balanced load, total power is three times the phase power.
                </>
              ),
            },
            {
              label: "Graph",
              content: (
                <>
                  On waveform questions, count the period on the original graph first, then compute
                  frequency, average or RMS. Do not guess from the amplitude alone.
                </>
              ),
            },
          ],
        },
        {
          kind: "callout",
          tone: "trap",
          title: "The usual traps",
          content: (
            <>
              Watch for absolute words like always, all and zero. Current generators do not always
              deliver positive power, source labels do not decide sign by themselves, and AC
              impedances require complex magnitude or phase reasoning.
            </>
          ),
        },
        {
          kind: "checkpoint",
          question: {
            id: "fees-map-checkpoint",
            topic: "Exam practice",
            difficulty: "easy",
            prompt: "A capacitor voltage is perfectly flat over a time interval. What should you conclude about the ideal capacitor current in that same interval?",
            options: [
              { id: "A", content: "It is zero because i = C dv/dt and the slope is zero." },
              { id: "B", content: "It must be infinite because the capacitor stores energy." },
              { id: "C", content: "It is a positive constant because the voltage is positive." },
              { id: "D", content: "It is undefined unless the resistance is known." },
            ],
            correct: "A",
            explanation:
              "A is correct. In an ideal capacitor the current depends on the derivative of voltage, not directly on the voltage value.",
            theory:
              "Capacitor voltage is the state variable. A flat voltage segment has zero derivative, so ideal capacitor current is zero during that segment.",
            tags: ["orientation", "capacitor"],
          },
        },
      ],
    },
  ],

  practice,

  exam: [],
};

export default fundamentalsElectronicSystems;
