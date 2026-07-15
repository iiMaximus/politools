import type { NumericQuestion } from "../../types";

/* ================================================================== *
 *  NUMERIC DRILLS — free-answer questions (type a number, tolerance-
 *  checked). Exam problems want a value, not a letter; these train the
 *  compute-and-commit muscle. Served in Practice and mock exams.
 * ================================================================== */

export const numericDrills: NumericQuestion[] = [
  {
    id: "num-ideal-gas-p",
    type: "numeric",
    topic: "Fundamentals (properties & ideal gas)",
    difficulty: "easy",
    prompt:
      "A rigid tank holds $m = 2\\,\\text{kg}$ of air ($R = 287\\,\\text{J/(kg·K)}$) at $T = 300\\,\\text{K}$ in $V = 0.5\\,\\text{m}^3$. Compute the pressure in **kPa**.",
    answer: 344.4,
    tolerance: 0.01,
    unit: "kPa",
    explanation:
      "Ideal gas: $p = mRT/V = 2 \\cdot 287 \\cdot 300 / 0.5 = 344\\,400\\,\\text{Pa} = 344.4\\,\\text{kPa}$. Watch the unit hop: $R$ in J gives Pa, so divide by 1000.",
    theory: "For any ideal-gas state, $pV = mRT$ with $T$ in kelvin. Solve for whichever variable is missing.",
  },
  {
    id: "num-first-law-du",
    type: "numeric",
    topic: "Tutorial 1 — First law",
    difficulty: "easy",
    prompt:
      "A closed system receives $Q = 150\\,\\text{kJ}$ of heat and does $W = 90\\,\\text{kJ}$ of work on the surroundings. Compute $\\Delta U$ in **kJ**.",
    answer: 60,
    tolerance: 0.01,
    unit: "kJ",
    explanation:
      "First Law with work done *by* the system positive: $\\Delta U = Q - W = 150 - 90 = 60\\,\\text{kJ}$.",
    theory: "Energy bookkeeping: heat in is positive, work out is positive. $\\Delta U = Q - W$ for a closed system.",
  },
  {
    id: "num-boundary-work",
    type: "numeric",
    topic: "Tutorial 1 — First law",
    difficulty: "easy",
    prompt:
      "A gas expands at constant pressure $p = 200\\,\\text{kPa}$ from $V_1 = 0.1\\,\\text{m}^3$ to $V_2 = 0.3\\,\\text{m}^3$. Compute the boundary work in **kJ**.",
    answer: 40,
    tolerance: 0.01,
    unit: "kJ",
    explanation:
      "Isobaric boundary work: $W = p\\,(V_2 - V_1) = 200 \\cdot 0.2 = 40\\,\\text{kJ}$ — kPa times m³ gives kJ directly.",
    theory: "On a $p$–$V$ diagram, work is the area under the process curve; for constant pressure it is a rectangle.",
  },
  {
    id: "num-sensible-heat",
    type: "numeric",
    topic: "Tutorial 1 — First law",
    difficulty: "easy",
    prompt:
      "How much heat (in **kJ**) is needed to warm $5\\,\\text{kg}$ of water ($c_p = 4.186\\,\\text{kJ/(kg·K)}$) by $20\\,\\text{K}$?",
    answer: 418.6,
    tolerance: 0.01,
    unit: "kJ",
    explanation: "$Q = m\\,c_p\\,\\Delta T = 5 \\cdot 4.186 \\cdot 20 = 418.6\\,\\text{kJ}$.",
    theory: "Sensible heating of an incompressible substance: $Q = m c \\Delta T$ — no phase change, no work.",
  },
  {
    id: "num-carnot-eta",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    difficulty: "easy",
    prompt:
      "A Carnot engine runs between $T_H = 600\\,\\text{K}$ and $T_C = 300\\,\\text{K}$. Compute its efficiency in **percent**.",
    answer: 50,
    tolerance: 0.01,
    unit: "%",
    explanation:
      "$\\eta_{Carnot} = 1 - T_C/T_H = 1 - 300/600 = 0.5 = 50\\%$. Kelvin only — Celsius here is a classic exam trap.",
    theory: "No engine between two reservoirs can beat $1 - T_C/T_H$. Always convert temperatures to kelvin first.",
  },
  {
    id: "num-carnot-cop",
    type: "numeric",
    topic: "Tutorial 3 — Vapor & refrigeration cycles",
    difficulty: "medium",
    prompt:
      "An ideal (Carnot) refrigerator keeps a cold space at $T_C = 273\\,\\text{K}$ while rejecting to $T_H = 303\\,\\text{K}$. Compute its COP.",
    answer: 9.1,
    tolerance: 0.01,
    explanation:
      "$COP_{ref} = \\dfrac{T_C}{T_H - T_C} = \\dfrac{273}{30} = 9.1$. The smaller the temperature lift, the larger the COP.",
    theory: "Refrigerators pay with work: $COP_{ref} = Q_C/W$. The Carnot limit uses absolute temperatures.",
  },
  {
    id: "num-conduction-wall",
    type: "numeric",
    topic: "Tutorial 6 — Conduction",
    difficulty: "easy",
    prompt:
      "A wall has $k = 0.8\\,\\text{W/(m·K)}$, area $A = 10\\,\\text{m}^2$, thickness $L = 0.2\\,\\text{m}$ and $\\Delta T = 25\\,\\text{K}$ across it. Compute the heat rate in **W**.",
    answer: 1000,
    tolerance: 0.01,
    unit: "W",
    explanation: "Fourier: $\\dot Q = kA\\Delta T/L = 0.8 \\cdot 10 \\cdot 25 / 0.2 = 1000\\,\\text{W}$.",
    theory: "Plane-wall conduction is $\\Delta T$ divided by the resistance $R = L/(kA)$.",
  },
  {
    id: "num-resistance-series",
    type: "numeric",
    topic: "Tutorial 6 — Conduction",
    difficulty: "medium",
    prompt:
      "Two thermal resistances in series, $R_1 = 0.02\\,\\text{K/W}$ and $R_2 = 0.03\\,\\text{K/W}$, carry a temperature difference of $50\\,\\text{K}$. Compute the heat rate in **W**.",
    answer: 1000,
    tolerance: 0.01,
    unit: "W",
    explanation:
      "Series resistances add: $R_{tot} = 0.05\\,\\text{K/W}$, so $\\dot Q = \\Delta T / R_{tot} = 50/0.05 = 1000\\,\\text{W}$.",
    theory: "Thermal circuits behave like electrical ones: resistances in series add, and $\\dot Q = \\Delta T/R_{tot}$.",
  },
  {
    id: "num-convection",
    type: "numeric",
    topic: "Tutorial 7 — Convection",
    difficulty: "easy",
    prompt:
      "A surface with $A = 2\\,\\text{m}^2$ and $h = 25\\,\\text{W/(m}^2\\text{K)}$ sits $40\\,\\text{K}$ above the fluid temperature. Compute the convective heat rate in **W**.",
    answer: 2000,
    tolerance: 0.01,
    unit: "W",
    explanation: "Newton's law of cooling: $\\dot Q = hA\\Delta T = 25 \\cdot 2 \\cdot 40 = 2000\\,\\text{W}$.",
    theory: "All of convection funnels into finding $h$; the heat rate itself is always $hA\\Delta T$.",
  },
  {
    id: "num-radiation-net",
    type: "numeric",
    topic: "Tutorial 9 — Radiation",
    difficulty: "hard",
    prompt:
      "A small blackbody surface of $1\\,\\text{m}^2$ at $T = 500\\,\\text{K}$ faces large surroundings at $300\\,\\text{K}$. Compute the net radiated power in **W** ($\\sigma = 5.67\\times10^{-8}$).",
    answer: 3084.5,
    tolerance: 0.02,
    unit: "W",
    explanation:
      "$\\dot Q = \\sigma A (T^4 - T_{sur}^4) = 5.67\\times10^{-8}(500^4 - 300^4) = 5.67\\times10^{-8} \\cdot 5.44\\times10^{10} \\approx 3084\\,\\text{W}$.",
    theory: "Radiation scales with $T^4$ in kelvin. For a small body in large surroundings, emissivity multiplies the whole difference.",
  },
];
