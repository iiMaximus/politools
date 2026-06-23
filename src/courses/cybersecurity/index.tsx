import type { Course } from "../../types";
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
);

const cybersecurity: Course = {
  meta: {
    id: "cybersecurity",
    title: "Cybersecurity",
    short: "Cyber",
    tagline: "Full module lectures (A–H) + the complete flashcard bank.",
    description: "The full Cybersecurity course: eight module lectures (foundations, human factor, cryptography, secure design, OS & trusted computing, IoT, and cryptography as national defence) plus the complete flashcard bank, practiceable lecture by lecture.",
    accent: "#3aa0ff",
    accent2: "#6aa6ff",
    icon: "ShieldCheck",
    year: 3,
    semester: 1,
    credits: 6,
    examDate: "2026-06-26",
    syllabus: ["A · Foundations","B · Human factor","C · Cryptography","D · Secure design","E · OS security","F · Trusted computing","G · IoT","H · National defence"],
    status: "complete",
  },

  lessons: LESSONS,

  practice: cyberCards as unknown as Course["practice"],

  exam: [
    {
      id: "cy-e1",
      title: "Brute-force a Caesar ciphertext",
      meta: "Classical ciphers · ~8 pts · Summer session style",
      difficulty: "easy",
      topic: "Caesar cipher",
      statement: (
        <>
          You intercept the ciphertext <code className="font-mono">WKLV LV VHFXUH</code> and are told
          it is a Caesar shift over the 26-letter alphabet. Recover the key and the plaintext, and
          state how many candidates you would test in the worst case.
        </>
      ),
      given: (
        <>
          <Tex>{"\\text{Ciphertext: WKLV LV VHFXUH},\\quad c_i = (m_i + k)\\bmod 26"}</Tex>
        </>
      ),
      steps: [
        {
          title: "Bound the work",
          content: (
            <>
              Only 25 useful keys exist, so at most 25 trial decryptions are needed —{" "}
              <Tex>{"|K| = 25"}</Tex>.
            </>
          ),
        },
        {
          title: "Find the key from a crib",
          content: (
            <>
              Guess the first word decrypts to a common word. Testing <Tex>{"k = 3"}</Tex>:{" "}
              <Tex>{"W(22)-3 = 19 = T"}</Tex>, <Tex>{"K(10)-3 = 7 = H"}</Tex>,{" "}
              <Tex>{"L(11)-3 = 8 = I"}</Tex>, <Tex>{"V(21)-3 = 18 = S"}</Tex> ⇒{" "}
              <strong>THIS</strong>. The key is <Tex>{"k = 3"}</Tex>.
            </>
          ),
        },
        {
          title: "Decrypt the rest",
          content: (
            <>
              Applying <Tex>{"m_i = (c_i - 3)\\bmod 26"}</Tex> throughout gives{" "}
              <span className="font-mono">WKLV→THIS, LV→IS, VHFXUH→SECURE</span>.
            </>
          ),
        },
      ],
      finalAnswer: (
        <>
          Key <Tex>{"k = 3"}</Tex>; plaintext <strong>THIS IS SECURE</strong>. Worst case you test 25
          keys.
        </>
      ),
      tips: (
        <>
          You do not need a crib at all — brute-forcing all 25 shifts and eyeballing the readable one
          is just as fast, and is the standard answer. Remember to subtract for decryption and wrap
          with <Tex>{"\\bmod 26"}</Tex>.
        </>
      ),
    },
    {
      id: "cy-e2",
      title: "Why a substitution cipher falls to frequency analysis",
      meta: "Cryptanalysis · ~10 pts",
      difficulty: "medium",
      topic: "Frequency analysis",
      statement: (
        <>
          A monoalphabetic substitution cipher has a key space of{" "}
          <Tex>{"26! \\approx 4\\times10^{26}"}</Tex> permutations — astronomically larger than DES's{" "}
          <Tex>{"2^{56}"}</Tex>. Explain, with reference to the cipher's structure, why it is
          nonetheless broken by hand, and outline the attack.
        </>
      ),
      given: <><Tex>{"|K| = 26! \\approx 4\\times10^{26}"}</Tex>; English frequencies known.</>,
      steps: [
        {
          title: "Identify the structural leak",
          content: (
            <>
              The cipher is <em>deterministic and per-letter</em>: a given plaintext letter always
              maps to the same ciphertext symbol. So the relative frequencies of the symbols equal the
              relative frequencies of the underlying letters — the English fingerprint survives intact.
            </>
          ),
        },
        {
          title: "Exploit it",
          content: (
            <>
              Count symbol frequencies in the ciphertext. The commonest symbol is almost certainly E,
              the next group T, A, O, I, N. Confirm with digrams (TH, HE) and common words (THE, AND).
              Each correct guess fixes part of the key and constrains the rest.
            </>
          ),
        },
        {
          title: "Note why key size does not help",
          content: (
            <>
              Brute force over <Tex>{"26!"}</Tex> keys is infeasible, but the attacker never brute
              forces — frequency analysis reads the key directly from the text, so the huge key space
              is irrelevant.
            </>
          ),
        },
      ],
      finalAnswer: (
        <>
          Because the per-letter mapping preserves the language's statistical structure, frequency
          analysis recovers the key letter by letter regardless of the <Tex>{"26!"}</Tex> key space.
          Large key space is necessary but not sufficient for security.
        </>
      ),
      tips: (
        <>
          The examiner wants the phrase "preserves letter frequencies / statistical structure", not
          "the key is small" — here the key is enormous. Mention digrams and common words for full
          marks.
        </>
      ),
    },
    {
      id: "cy-e3",
      title: "Kerckhoffs's principle and key space (conceptual)",
      meta: "Design principles · ~6 pts",
      difficulty: "medium",
      topic: "Kerckhoffs",
      statement: (
        <>
          A vendor advertises an "unbreakable" cipher whose security depends on keeping the algorithm
          secret, and which uses a 40-bit key. Using Kerckhoffs's principle and a key-space argument,
          give two independent reasons to reject it.
        </>
      ),
      given: <>Key length 40 bits ⇒ <Tex>{"|K| = 2^{40} \\approx 1.1\\times10^{12}"}</Tex>.</>,
      steps: [
        {
          title: "Reason 1 — secret algorithm (Kerckhoffs)",
          content: (
            <>
              Security must rest on the key, not the algorithm. Algorithms leak via reverse
              engineering, insiders or theft, and cannot be rotated like a key. "Security through
              obscurity" is unverifiable and historically fails.
            </>
          ),
        },
        {
          title: "Reason 2 — key space too small",
          content: (
            <>
              <Tex>{"2^{40}\\approx 10^{12}"}</Tex> keys is brute-forceable by modern hardware in
              hours or less. Even if the algorithm were perfect, the key space is the weak link.
              Modern symmetric keys use <Tex>{"\\geq 2^{128}"}</Tex>.
            </>
          ),
        },
        {
          title: "Conclude",
          content: (
            <>
              Both the design philosophy and the parameter choice are unsound; reject the product and
              prefer a public, well-analysed algorithm (e.g. AES-128/256).
            </>
          ),
        },
      ],
      finalAnswer: (
        <>
          Reject it: (1) relying on a secret algorithm violates Kerckhoffs's principle, and (2) a
          40-bit key space (<Tex>{"\\approx 10^{12}"}</Tex>) is brute-forceable. Security needs a
          public algorithm and a <Tex>{"\\geq 128"}</Tex>-bit key.
        </>
      ),
      tips: <>Give two <em>independent</em> reasons — one about the algorithm, one about the key length. Quoting <Tex>{"2^{128}"}</Tex> as the modern baseline earns the last mark.</>,
    },
  ],
};

export default cybersecurity;
