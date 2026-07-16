/* ================================================================== *
 *  FUN FACTS & ANALOGIES — memory hooks sprinkled into lessons.
 *  Curated per focus course, matched against `lecture + title`, picked
 *  deterministically per lesson so the same lesson keeps its facts.
 *  Text is RichText markup ($math$, **bold**).
 * ================================================================== */

export interface FunFact {
  kind: "fact" | "analogy" | "mnemonic";
  text: string;
}

interface FactRule {
  match: RegExp;
  facts: FunFact[];
}

const THERMO: FactRule[] = [
  {
    match: /Thermodynamics 1/,
    facts: [
      { kind: "fact", text: "The word **gas** was coined by the chemist Van Helmont in the 1600s from the Greek *chaos* — fitting for molecules smashing into your skin at ~500 m/s." },
      { kind: "analogy", text: "The First Law is a bank account: heat $Q$ is income, work $W$ is spending, internal energy $U$ is the balance. The exam is the auditor — the books must always balance." },
      { kind: "mnemonic", text: "Casino rules for the universe, part 1: **you can't win.** Energy out never exceeds energy in — that's the First Law." },
    ],
  },
  {
    match: /Thermodynamics 2/,
    facts: [
      { kind: "fact", text: "Clausius invented the word **entropy** in 1865 from the Greek *tropē* (transformation) — and deliberately made it sound like *energy* so the two ideas would travel together." },
      { kind: "fact", text: "Boltzmann's tombstone in Vienna is engraved with $S = k \\log W$. Imagine loving an equation that much." },
      { kind: "mnemonic", text: "Casino rules, part 2: **you can't even break even.** Every real process produces entropy — that's the Second Law." },
      { kind: "fact", text: "Sadi Carnot died of cholera at 36 and most of his belongings were burned. His thin book on ideal engines survived — and became the Second Law." },
    ],
  },
  {
    match: /Thermodynamics 3/,
    facts: [
      { kind: "fact", text: "Most of the world's electricity is still made by the Rankine cycle: coal, gas and nuclear plants are all just different ways to boil water and spin a turbine." },
      { kind: "analogy", text: "A refrigerator doesn't *make cold* — it's a heat pump hauling heat uphill from cold to hot, like pumping water to a rooftop tank. The compressor pays the bill." },
    ],
  },
  {
    match: /Thermodynamics 4/,
    facts: [
      { kind: "fact", text: "A diesel engine has no spark plugs: squeezing air to ~1/20 of its volume heats it past the fuel's autoignition temperature. The compression *is* the match." },
      { kind: "fact", text: "Your car and a jet engine are cousins: Otto and Diesel cycles on the road, the Brayton cycle in the sky — squeeze, burn, expand, exhaust, repeat." },
    ],
  },
  {
    match: /Thermodynamics 5/,
    facts: [
      { kind: "fact", text: "Willis Carrier drew the psychrometric chart while inventing air conditioning for a printing plant in 1902 — the ink kept smearing in humid air." },
      { kind: "analogy", text: "Sweating is evaporative refrigeration: every gram of sweat that evaporates steals about 2.4 kJ of latent heat from your skin. You are a wet heat exchanger." },
    ],
  },
  {
    match: /Heat Transfer 1/,
    facts: [
      { kind: "fact", text: "Diamond conducts heat about five times better than copper — jewelers call diamonds *ice* because they drain heat from your fingertip instantly." },
      { kind: "analogy", text: "Metal feels colder than wood at the *same* temperature because your hand doesn't sense temperature — it senses heat leaving. Conductivity is the speed of the thief." },
      { kind: "fact", text: "Fourier, who wrote the conduction law in 1822, was also the first to propose that the atmosphere traps heat — the greenhouse effect started as a heat-transfer homework." },
    ],
  },
  {
    match: /Heat Transfer 2/,
    facts: [
      { kind: "fact", text: "On the space station a candle burns as a small blue **sphere**: without gravity there's no buoyancy, so no natural convection to stretch the flame upward." },
      { kind: "fact", text: "\"Wind chill\" is pure convection: moving air raises $h$, so the same skin at the same air temperature loses heat faster. The thermometer isn't lying — your $h$ changed." },
    ],
  },
  {
    match: /Heat Transfer 3/,
    facts: [
      { kind: "fact", text: "Penguin feet are countercurrent heat exchangers: warm outgoing blood pre-heats the cold blood returning from the ice. Counterflow beats parallel flow — nature ran the numbers first." },
      { kind: "analogy", text: "A heat exchanger is two rivers trading warmth through a wall without mixing. Counterflow keeps the temperature difference alive along the whole wall — that's its whole trick." },
    ],
  },
  {
    match: /Heat Transfer 4/,
    facts: [
      { kind: "fact", text: "You are glowing right now: a human body radiates infrared at roughly the power of a 100 W bulb. Thermal cameras just watch the show." },
      { kind: "mnemonic", text: "$T^4$ is brutal: **double the temperature, 16× the radiation.** And it's kelvin only — Celsius lies to this law." },
    ],
  },
];

const MA2: FactRule[] = [
  {
    match: /Limits & continuity/,
    facts: [
      { kind: "fact", text: "Calculus ran on pure intuition for ~150 years before Weierstrass pinned down ε–δ. You're being asked to learn in a semester what took the giants a century to make rigorous." },
      { kind: "analogy", text: "A 2-variable limit exists only if **every trail to the summit reports the same altitude**. Two agreeing paths prove nothing; one disagreeing path destroys everything." },
    ],
  },
  {
    match: /Differential calculus/,
    facts: [
      { kind: "fact", text: "The $\\nabla$ symbol is called **nabla** — the Greek word for a Phoenician harp of that shape. Maxwell thought the name was ridiculous and campaigned for alternatives." },
      { kind: "analogy", text: "The gradient is a mountain compass: it points straight uphill and its length is the steepness. Water, skiers and gradient descent all follow $-\\nabla f$." },
    ],
  },
  {
    match: /Taylor & optimization/,
    facts: [
      { kind: "fact", text: "Your GPS, your phone's physics engine and every neural-network trainer run on Taylor's idea: **up close, everything is a polynomial.**" },
      { kind: "analogy", text: "The second-derivative test is a shape test: bowl, dome, or horse saddle. A *saddle point* is literally named after the horse — one direction up, the other down." },
    ],
  },
  {
    match: /Double & triple integrals/,
    facts: [
      { kind: "analogy", text: "A double integral is a deli slicer: cut the solid into slabs (that's Fubini), measure each slab, add them up. The order of slicing never changes the salami." },
      { kind: "fact", text: "The extra $r$ in $r\\,dr\\,d\\theta$ isn't decoration: an outer arc of a pizza slice really is wider than an inner one. Forgetting the Jacobian is the classic exam kill." },
    ],
  },
  {
    match: /Curves, line integrals & vector fields/,
    facts: [
      { kind: "analogy", text: "A conservative field works like altitude on a hike: the climb depends only on where you start and end, never on the trail. That's why finding a potential kills a line integral instantly." },
      { kind: "fact", text: "Work integrals began as literal work — 19th-century engineers computing what a steam engine earns pushing a piston along a path. The $\\mathbf F \\cdot d\\mathbf r$ paid salaries." },
    ],
  },
  {
    match: /Surfaces, flux & the big theorems/,
    facts: [
      { kind: "fact", text: "\"Stokes' theorem\" debuted as an **exam question**: Stokes received it in a letter from Lord Kelvin and put it on the 1854 Smith's Prize paper at Cambridge. Maxwell sat that exam." },
      { kind: "analogy", text: "Flux is rain through a window: tilt the window and less rain gets in. That tilt is exactly what $\\mathbf F \\cdot \\mathbf n$ measures." },
    ],
  },
  {
    match: /Series & power series/,
    facts: [
      { kind: "fact", text: "The harmonic series diverges at a glacial pace: the partial sum needs about $10^{43}$ terms just to pass 100. Divergence is a destination, not a speed." },
      { kind: "fact", text: "Zeno's arrow paradox is a geometric series: $\\tfrac12+\\tfrac14+\\tfrac18+\\dots=1$. The Greeks lacked a tool for infinity; yours is on the formula sheet." },
      { kind: "fact", text: "Euler got famous by computing $\\sum 1/n^2 = \\pi^2/6$ — the Basel problem had humiliated mathematicians for 90 years. π appearing out of the integers still feels illegal." },
    ],
  },
  {
    match: /Ordinary differential equations/,
    facts: [
      { kind: "fact", text: "Newton invented differential equations to predict planets — then hid his method in an anagram so rivals couldn't use it while he kept priority. Academic paranoia is ancient." },
      { kind: "analogy", text: "$e^{x}$ is the function that shrugs at differentiation — $d/dx$ leaves it unchanged. That's why every linear ODE answer smells of exponentials." },
      { kind: "fact", text: "Cooling coffee, radioactive decay, a discharging capacitor: one equation, $y' = -ky$, three different exam problems. Recognize the shape and you've solved all of them." },
    ],
  },
];

const LAG: FactRule[] = [
  {
    match: /Geometric vectors/,
    facts: [
      { kind: "fact", text: "The cross product only exists in 3 and 7 dimensions — a deep algebraic accident. Engineers got lucky living in one of them." },
      { kind: "analogy", text: "The dot product is an agreement meter: positive = pulling the same way, zero = minding their own business (perpendicular), negative = actively working against each other." },
    ],
  },
  {
    match: /Lines & planes/,
    facts: [
      { kind: "analogy", text: "A plane's normal vector is its door handle: the entire orientation of the door lives in that one perpendicular stick. Every plane problem starts by grabbing it." },
    ],
  },
  {
    match: /Matrices & determinants/,
    facts: [
      { kind: "fact", text: "**Matrix** is Latin for *womb* — Sylvester coined it in 1850 as the thing determinants are born from." },
      { kind: "analogy", text: "The determinant is the volume knob of a matrix: $|\\det| = 3$ means volumes triple; $\\det = 0$ means space gets squashed flat — and you can't un-squash (no inverse)." },
    ],
  },
  {
    match: /Linear systems, rank/,
    facts: [
      { kind: "fact", text: "\"Gaussian\" elimination appears in the Chinese *Nine Chapters on the Mathematical Art*, roughly 1,800 years before Gauss. Naming rights in math are deeply unfair." },
    ],
  },
  {
    match: /Vector spaces/,
    facts: [
      { kind: "fact", text: "Polynomials, audio signals and ODE solutions are all *vectors* — that's the entire point of the abstraction: prove a theorem once, use it everywhere." },
    ],
  },
  {
    match: /Linear maps/,
    facts: [
      { kind: "analogy", text: "A linear map is a factory: the **kernel** is everything the machine shreds to zero, the **image** is everything it can actually produce. Dimensions in = shredded + produced (rank–nullity)." },
    ],
  },
  {
    match: /Eigenvalues, eigenspaces/,
    facts: [
      { kind: "fact", text: "Google's original PageRank is one giant eigenvector computation: the most important page on the web is the biggest entry of the link matrix's dominant eigenvector." },
      { kind: "fact", text: "*Eigen* is German for \"own\": eigenvectors are the directions a matrix treats as its own — it only stretches them, never turns them." },
    ],
  },
  {
    match: /Orthogonality/,
    facts: [
      { kind: "fact", text: "JPEG compression is a change to an orthogonal basis (the discrete cosine transform): keep the big coordinates, discard the tiny ones. Your holiday photos are quadratic-forms homework." },
    ],
  },
  {
    match: /Conics/,
    facts: [
      { kind: "fact", text: "Apollonius sliced cones around 200 BC as pure geometry. Eighteen centuries later Kepler found the planets ride exactly those curves — the best delayed payoff in mathematics." },
    ],
  },
  {
    match: /Distances, circles/,
    facts: [
      { kind: "analogy", text: "Every \"distance from a point\" problem hides the same move: **drop a perpendicular**. The orthogonal projection *is* the shortest path — that's not a trick, it's a theorem." },
    ],
  },
  {
    match: /MATLAB|Floating point|numerically|power method/i,
    facts: [
      { kind: "fact", text: "MATLAB literally means **MATrix LABoratory** — Cleve Moler wrote it so his students could use his Fortran matrix libraries without learning Fortran." },
      { kind: "fact", text: "In floating point, `0.1 + 0.2` is *not* `0.3` — 0.1 has no finite binary representation, like 1/3 in decimal. That's why numerical answers are checked with tolerances, here and in real engineering." },
    ],
  },
];

const REGISTRY: Record<string, FactRule[]> = {
  thermodynamics: THERMO,
  "math-analysis-2": MA2,
  "linear-algebra": LAG,
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Up to `n` facts for a lesson — deterministic per lesson id, so a lesson
 *  keeps its facts between visits. */
export function pickFacts(
  courseId: string,
  lesson: { id: string; title: string; lecture?: string },
  n = 2
): FunFact[] {
  const rules = REGISTRY[courseId];
  if (!rules) return [];
  const hay = `${lesson.lecture ?? ""} ${lesson.title}`;
  const pool = rules.filter((r) => r.match.test(hay)).flatMap((r) => r.facts);
  if (!pool.length) return [];
  const start = hash(lesson.id) % pool.length;
  const out: FunFact[] = [];
  for (let k = 0; k < Math.min(n, pool.length); k++) out.push(pool[(start + k) % pool.length]);
  return out;
}
