import type { NumericQuestion } from "../../types";

/* ================================================================== *
 *  THE 2025 WRITTEN-TEST EXERCISES — the professor's recurring set
 *  (course_material/thermo_course/Supplementary exercises/2025-Written
 *  test exercises.pdf). These 8 exercises are the backbone of the real
 *  written test. Every answer below is the printed key, independently
 *  recomputed before shipping. Tagged wt25 → the official mock's
 *  problem section draws from here first.
 * ================================================================== */

const WT = "2025 Written test exercises";

export const writtenTest2025: NumericQuestion[] = [
  /* ---------------- Exercise 1 · Otto cycle ---------------- */
  {
    id: "wt25-ex1-mass",
    type: "numeric",
    topic: "Tutorial 4 — Gas cycles",
    tags: ["wt25"],
    source: `${WT} · Ex 1`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** A standard-air Otto cycle starts compression at $p_1 = 1\\,\\text{bar}$, $T_1 = 300\\,\\text{K}$, $V_1 = 400\\,\\text{dm}^3$ ($c_p = 1004.5\\,\\text{J/(kg·K)}$, $k = 1.4$). Compute the **mass of air** in kg (3 decimals).",
    answer: 0.465,
    tolerance: 0.01,
    unit: "kg",
    explanation:
      "$R = c_p - c_v = c_p(1 - 1/k) = 287\\,\\text{J/(kg·K)}$, then $m = p_1 V_1/(R T_1) = 10^5 \\cdot 0.4 / (287 \\cdot 300) = 0.465\\,\\text{kg}$. Watch $V$ in m³: $400\\,\\text{dm}^3 = 0.4\\,\\text{m}^3$.",
    theory: "Every cycle exercise starts the same way: pin down the mass from the ideal-gas law at the best-known state.",
  },
  {
    id: "wt25-ex1-qin",
    type: "numeric",
    topic: "Tutorial 4 — Gas cycles",
    tags: ["wt25"],
    source: `${WT} · Ex 1`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Same Otto cycle ($m = 0.465\\,\\text{kg}$, $T_1 = 300\\,\\text{K}$, $r = 8$, $T_3 = 1800\\,\\text{K}$, $c_p = 1004.5$, $k = 1.4$). Compute the **heat addition** $Q_{in}$ in kJ (1 decimal).",
    answer: 370.3,
    tolerance: 0.01,
    unit: "kJ",
    explanation:
      "$T_2 = T_1 r^{k-1} = 300 \\cdot 8^{0.4} = 689\\,\\text{K}$. Heat is added at constant volume: $Q_{in} = m c_v (T_3 - T_2) = 0.465 \\cdot 717.5 \\cdot (1800 - 689) = 370.3\\,\\text{kJ}$ with $c_v = c_p/k$.",
    theory: "Otto adds heat isochorically → use $c_v$, never $c_p$. The compression shortcut $T_2 = T_1 r^{k-1}$ is mandatory speed.",
  },
  {
    id: "wt25-ex1-eta",
    type: "numeric",
    topic: "Tutorial 4 — Gas cycles",
    tags: ["wt25"],
    source: `${WT} · Ex 1`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** For the same Otto cycle ($r = 8$, $k = 1.4$), compute the **thermal efficiency** in percent (1 decimal).",
    answer: 56.5,
    tolerance: 0.01,
    unit: "%",
    explanation:
      "$\\eta_{Otto} = 1 - r^{1-k} = 1 - 8^{-0.4} = 0.565 = 56.5\\%$. It depends only on the compression ratio and $k$ — the temperatures cancel.",
    theory: "If an Otto question gives you temperatures for the efficiency, it's testing whether you know you don't need them.",
  },

  /* --------- Exercise 2 · Constant-p heating + turbine --------- */
  {
    id: "wt25-ex2-power",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    tags: ["wt25"],
    source: `${WT} · Ex 2`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** An ideal gas ($R = 287$, $c_p = 1\\,\\text{kJ/(kg·K)}$, $\\dot m = 1\\,\\text{kg/s}$) is heated at 30 bar from 250 °C to 900 °C, then expands adiabatically in a turbine ($\\eta_{is} = 0.86$) to an exit temperature of 400 °C. Compute the **mechanical power** of the turbine in kW.",
    answer: 500,
    tolerance: 0.01,
    unit: "kW",
    explanation:
      "Steady-flow adiabatic turbine: $\\dot W = \\dot m c_p (T_{in} - T_{out}) = 1 \\cdot 1 \\cdot (900 - 400) = 500\\,\\text{kW}$. The isentropic efficiency is NOT needed for the actual power when both real temperatures are given — it's a trap.",
    theory: "With real inlet and outlet states known, the energy balance alone gives the power; $\\eta_{is}$ only matters for finding unknown states.",
  },
  {
    id: "wt25-ex2-pexit",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    tags: ["wt25"],
    source: `${WT} · Ex 2`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Same turbine ($T_{in} = 900$ °C at 30 bar, real $T_{out} = 400$ °C, $\\eta_{is} = 0.86$, $R = 287$, $c_p = 1000\\,\\text{J/(kg·K)}$). Compute the **exit pressure** in bar (1 decimal).",
    answer: 2.8,
    tolerance: 0.02,
    unit: "bar",
    explanation:
      "Real drop $\\Delta T = 500\\,\\text{K}$ → ideal drop $\\Delta T_s = 500/0.86 = 581\\,\\text{K}$ → $T_{out,s} = 592\\,\\text{K}$. The isentropic relation gives $p_{out} = p_{in}(T_{out,s}/T_{in})^{c_p/R} = 30 \\cdot (592/1173)^{3.48} \\approx 2.8\\,\\text{bar}$.",
    theory: "Pressure lives on the ISENTROPIC path: convert the real temperature drop to the ideal one with $\\eta_{is}$ first, then apply $T$–$p$ relations.",
  },

  /* --------- Exercise 3 · Piston: adiabatic + isochoric --------- */
  {
    id: "wt25-ex3-work",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    tags: ["wt25"],
    source: `${WT} · Ex 3`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Oxygen ($R = 249$, $c_p = 969\\,\\text{J/(kg·K)}$) at 186 °C, 0.3 bar, 19.9 m³ is compressed adiabatically and reversibly to 3.47 bar. Compute the **magnitude of the compression work** in kJ.",
    answer: 1512,
    tolerance: 0.01,
    unit: "kJ",
    explanation:
      "$m = pV/(RT) = 5.22\\,\\text{kg}$; $T_B = T_A (p_B/p_A)^{R/c_p} = 459 \\cdot 11.57^{0.257} = 861\\,\\text{K}$. Adiabatic closed system: $W = -\\Delta U = -m c_v (T_B - T_A) = -1512\\,\\text{kJ}$ (work done ON the gas), $c_v = 720$.",
    theory: "Adiabatic ⇒ $Q = 0$ ⇒ all the work shows up as internal energy. The sign says who paid: negative = the piston did.",
  },
  {
    id: "wt25-ex3-tc",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    tags: ["wt25"],
    source: `${WT} · Ex 3`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** The same oxygen ($m = 5.22\\,\\text{kg}$, $c_v = 720\\,\\text{J/(kg·K)}$) is then cooled at constant volume from $T_B = 861\\,\\text{K}$, rejecting 2000 kJ. Compute the **final temperature** in K (1 decimal).",
    answer: 329.2,
    tolerance: 0.01,
    unit: "K",
    explanation:
      "Isochoric: $Q = m c_v (T_C - T_B)$ → $T_C = T_B + Q/(m c_v) = 861 - 2\\,000\\,000/(5.22 \\cdot 720) = 329\\,\\text{K}$. Heat rejected → $Q$ negative.",
    theory: "At constant volume no boundary work exists — heat maps directly onto $\\Delta U$.",
  },

  /* --------- Exercise 4 · Adiabatic expansion, is/irr --------- */
  {
    id: "wt25-ex4-t2s",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    tags: ["wt25"],
    source: `${WT} · Ex 4`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** 10 g of an ideal gas ($c_p = 2300$, $R = 300\\,\\text{J/(kg·K)}$) expands adiabatically and reversibly from 20 bar, 127 °C to 4 bar. Compute the **final temperature** in K (1 decimal).",
    answer: 324.3,
    tolerance: 0.01,
    unit: "K",
    explanation:
      "$T_2 = T_1 (p_2/p_1)^{R/c_p} = 400.15 \\cdot 0.2^{300/2300} = 324.3\\,\\text{K}$. Kelvin in, kelvin out — 127 °C is 400.15 K.",
    theory: "For isentropic ideal-gas processes the exponent is $R/c_p$ in the $T$–$p$ form. Memorize it — deriving it mid-exam costs 5 minutes.",
  },
  {
    id: "wt25-ex4-t2irr",
    type: "numeric",
    topic: "Tutorial 2 — Second law",
    tags: ["wt25"],
    source: `${WT} · Ex 4`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Same expansion (20 → 4 bar, $T_{2,is} = 324.3\\,\\text{K}$, $c_p = 2300\\,\\text{J/(kg·K)}$), but internally irreversible with a specific-entropy increase of $175\\,\\text{J/(kg·K)}$. Compute the **real final temperature** in K (1 decimal).",
    answer: 349.9,
    tolerance: 0.01,
    unit: "K",
    explanation:
      "Same pressures ⇒ $\\Delta s = c_p \\ln(T_2/T_{2,is})$ → $T_2 = T_{2,is} \\, e^{\\Delta s/c_p} = 324.3 \\cdot e^{175/2300} = 349.9\\,\\text{K}$. Irreversibility leaves the gas hotter — some work was lost to friction.",
    theory: "Entropy production during an adiabatic expansion always raises the outlet temperature above the isentropic one.",
  },

  /* --------- Exercise 5 · HX configuration reasoning --------- */
  {
    id: "wt25-ex5-cratio",
    type: "numeric",
    topic: "Tutorial 8 — Heat exchangers",
    tags: ["wt25"],
    source: `${WT} · Ex 5`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** A concentric-pipe heat exchanger has $t_{hi} = 200$ °C, $t_{ci} = 100$ °C, $t_{ho} = 110$ °C, $t_{co} = 125$ °C (counterflow — the cold outlet exceeds the hot outlet). Compute the **capacity-rate ratio** $C_h/C_c$ (3 decimals).",
    answer: 0.278,
    tolerance: 0.01,
    explanation:
      "Energy balance: $C_h \\Delta T_h = C_c \\Delta T_c$ → $C_h/C_c = \\Delta T_c/\\Delta T_h = (125-100)/(200-110) = 25/90 = 0.278$. The fluid with the LARGER temperature change has the smaller capacity rate.",
    theory: "Capacity rates are read straight off the temperature swings — no areas, no $U$ needed.",
  },
  {
    id: "wt25-ex5-eff",
    type: "numeric",
    topic: "Tutorial 8 — Heat exchangers",
    tags: ["wt25"],
    source: `${WT} · Ex 5`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** Same exchanger ($t_{hi} = 200$, $t_{ci} = 100$, $t_{ho} = 110$ °C; the hot fluid has $C_{min}$). Compute the **effectiveness** $\\varepsilon$ (2 decimals).",
    answer: 0.9,
    tolerance: 0.01,
    explanation:
      "$\\varepsilon = \\dfrac{C_h (t_{hi} - t_{ho})}{C_{min}(t_{hi} - t_{ci})} = \\dfrac{200-110}{200-100} = 0.9$ since $C_h = C_{min}$.",
    theory: "Effectiveness = actual heat over the thermodynamic maximum $C_{min}(t_{hi}-t_{ci})$ — the $C_{min}$ stream sets the ceiling.",
  },

  /* --------- Exercise 6 · Parallel-flow HX sizing --------- */
  {
    id: "wt25-ex6-q",
    type: "numeric",
    topic: "Tutorial 8 — Heat exchangers",
    tags: ["wt25"],
    source: `${WT} · Ex 6`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** Parallel-flow exchanger: hot air $\\dot m_h = 0.5\\,\\text{kg/s}$ ($c_{ph} = 1.2\\,\\text{kJ/kgK}$) in at 250 °C; water $\\dot m_c = 0.75\\,\\text{kg/s}$ ($c_{pc} = 4186\\,\\text{J/kgK}$) out at 60 °C; the maximum fluid-to-fluid $\\Delta T$ is 200 °C. Compute the **heat rate** in kW (1 decimal).",
    answer: 31.4,
    tolerance: 0.01,
    unit: "kW",
    explanation:
      "Parallel flow → max $\\Delta T$ is at the inlet: $t_{ci} = 250 - 200 = 50$ °C. Then $q = \\dot m_c c_{pc}(t_{co} - t_{ci}) = 0.75 \\cdot 4186 \\cdot 10 = 31.4\\,\\text{kW}$.",
    theory: "In parallel flow the inlet end has the biggest temperature gap — that's how you decode 'maximum ΔT' clues.",
  },
  {
    id: "wt25-ex6-area",
    type: "numeric",
    topic: "Tutorial 8 — Heat exchangers",
    tags: ["wt25"],
    source: `${WT} · Ex 6`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Same exchanger ($q = 31.4\\,\\text{kW}$, $t_{hi} = 250$, $t_{ho} = 197.7$, $t_{ci} = 50$, $t_{co} = 60$ °C, $U = 250\\,\\text{W/m}^2\\text{K}$, parallel flow). Compute the **heat-transfer area** in m² (2 decimals).",
    answer: 0.75,
    tolerance: 0.02,
    unit: "m²",
    explanation:
      "$\\Delta T_1 = 200$, $\\Delta T_2 = 197.7 - 60 = 137.7$ → $\\Delta T_{lm} = (200 - 137.7)/\\ln(200/137.7) = 167\\,\\text{K}$, so $A = q/(U \\Delta T_{lm}) = 31\\,395/(250 \\cdot 167) = 0.75\\,\\text{m}^2$.",
    theory: "LMTD uses the terminal differences of the ACTUAL flow arrangement — in parallel flow both ends pair inlet-with-inlet, outlet-with-outlet.",
  },

  /* --------- Exercise 7 · Lumped-capacitance quench --------- */
  {
    id: "wt25-ex7-time",
    type: "numeric",
    topic: "Tutorial 6 — Conduction",
    tags: ["wt25"],
    source: `${WT} · Ex 7`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** A 2 cm steel cube ($\\rho = 8000\\,\\text{kg/m}^3$, $c = 0.46\\,\\text{kJ/kgK}$, $k = 50\\,\\text{W/mK}$) at 500 °C is quenched in fluid at 20 °C ($h = 100\\,\\text{W/m}^2\\text{K}$; $Bi = 6.7\\times10^{-3}$, lumped OK). Compute the **time to reach 100 °C** in s (1 decimal).",
    answer: 219.8,
    tolerance: 0.01,
    unit: "s",
    explanation:
      "$\\tau = \\rho V c/(hA) = \\rho c L_c/h$ with $L_c = a/6 = 3.33\\,\\text{mm}$ → $\\tau = 122.7\\,\\text{s}$. Then $t = \\tau \\ln\\frac{T_1 - T_f}{T_2 - T_f} = 122.7 \\ln(480/80) = 219.8\\,\\text{s}$.",
    theory: "Lumped capacitance is a first-order decay: check $Bi < 0.1$, build $\\tau$, then it's pure exponentials.",
  },
  {
    id: "wt25-ex7-qdot",
    type: "numeric",
    topic: "Tutorial 6 — Conduction",
    tags: ["wt25"],
    source: `${WT} · Ex 7`,
    difficulty: "medium",
    prompt:
      "**[Real written-test exercise]** Same cube (side 2 cm, $h = 100\\,\\text{W/m}^2\\text{K}$, fluid at 20 °C). Compute the **instantaneous heat rate** when the cube is at 100 °C, in W (1 decimal).",
    answer: 19.2,
    tolerance: 0.01,
    unit: "W",
    explanation:
      "$q = hA(T - T_f) = 100 \\cdot (6 \\cdot 0.02^2) \\cdot 80 = 19.2\\,\\text{W}$ — the cube has six faces: $A = 6a^2 = 2.4\\times10^{-3}\\,\\text{m}^2$.",
    theory: "Instantaneous rate is just Newton cooling at that moment — no transient math needed once the temperature is given.",
  },

  /* --------- Exercise 8 · Internal forced convection --------- */
  {
    id: "wt25-ex8-h",
    type: "numeric",
    topic: "Tutorial 7 — Convection",
    tags: ["wt25"],
    source: `${WT} · Ex 8`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Air ($\\rho = 0.608\\,\\text{kg/m}^3$, $k = 0.0444\\,\\text{W/mK}$, $c = 1.0465\\,\\text{kJ/kgK}$, $\\mu = 2.9392\\times10^{-5}\\,\\text{Pa·s}$) flows at 20 m/s in a 20 cm pipe ($Re = 82\\,744$, turbulent: $Nu = 0.023\\,Re^{0.8}Pr^{0.4}$). Compute the **convection coefficient** $h$ in W/m²K (1 decimal).",
    answer: 37.9,
    tolerance: 0.02,
    unit: "W/m²K",
    explanation:
      "$Pr = \\mu c/k = 0.693$; $Nu = 0.023 \\cdot 82\\,744^{0.8} \\cdot 0.693^{0.4} = 171$; $h = Nu\\,k/D = 171 \\cdot 0.0444/0.2 = 37.9\\,\\text{W/m}^2\\text{K}$.",
    theory: "The correlation chain never changes: $Re \\to Pr \\to Nu \\to h = Nu\\,k/L_c$. Pick the correlation the sheet gives you.",
  },
  {
    id: "wt25-ex8-tout",
    type: "numeric",
    topic: "Tutorial 7 — Convection",
    tags: ["wt25"],
    source: `${WT} · Ex 8`,
    difficulty: "hard",
    prompt:
      "**[Real written-test exercise]** Same pipe ($\\dot m = 0.5\\,\\text{kg/s}$, $c = 1046.5\\,\\text{J/kgK}$, $h = 37.9\\,\\text{W/m}^2\\text{K}$, $D = 0.2\\,\\text{m}$, $L = 10\\,\\text{m}$, wall–air $\\Delta T$ held at 30 °C). Air enters at 15 °C — compute the **exit temperature** in °C (1 decimal).",
    answer: 28.6,
    tolerance: 0.01,
    unit: "°C",
    explanation:
      "$q = hA\\Delta T = 37.9 \\cdot (\\pi \\cdot 0.2 \\cdot 10) \\cdot 30 = 7.14\\,\\text{kW}$, then the energy balance on the air: $T_{out} = T_{in} + q/(\\dot m c) = 15 + 7140/(0.5 \\cdot 1046.5) = 28.6$ °C.",
    theory: "Convection finds the heat; the first law on the flowing stream turns it into a temperature rise.",
  },
];
