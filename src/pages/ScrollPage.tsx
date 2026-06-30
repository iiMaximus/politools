import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { rt, rtInline } from "../components/RichText";
import { getCourse } from "../courses/registry";
import { cn } from "../lib/cn";
import { TexBlock } from "../lib/math";
import { recordAnswer } from "../lib/progress";
import type { Lesson, LessonBlock, Question } from "../types";
import { NotFound } from "./NotFound";

type ScrollMode = "story" | "drill" | "formula";
type FormulaMark = "known" | "again";

type FeedItem =
  | { id: string; kind: "lesson"; lesson: Lesson; index: number; hook: string }
  | { id: string; kind: "beat"; lesson: Lesson; label: string; title: string; text: ReactNode; part?: string }
  | { id: string; kind: "step"; lesson: Lesson; title: string; label?: string; text: ReactNode; step: number; total: number }
  | {
      id: string;
      kind: "formula";
      lesson: Lesson;
      title: string;
      prompt: string;
      hint: string;
      tex: string;
      caption?: ReactNode;
    }
  | { id: string; kind: "example"; lesson: Lesson; title?: string; text: ReactNode; part?: string }
  | { id: string; kind: "question"; lesson: Lesson; question: Question }
  | { id: string; kind: "finish"; totalLessons: number };

const MAX_STORY_FORMULAS_PER_LESSON = 2;
const MAX_CALLOUTS_PER_LESSON = 2;
const MAX_EXAMPLES_PER_LESSON = 1;
const MAX_QUESTIONS_PER_LESSON = 2;
const DRILL_QUESTIONS_PER_LESSON = 5;
const FEED_KICKER = "text-xs font-black uppercase tracking-[0.22em] text-[var(--accent)]";
const FEED_TITLE =
  "max-w-5xl text-[clamp(2.45rem,11vw,7.25rem)] font-black leading-[0.95] tracking-normal text-white [text-wrap:balance]";
const FEED_BODY =
  "mt-6 max-w-4xl text-[clamp(1.12rem,4.6vw,2.08rem)] font-semibold leading-[1.28] text-white/78 [text-wrap:pretty] [&_p]:m-0 [&_p+p]:mt-5 [&_strong]:text-white [&_em]:font-bold [&_em]:not-italic [&_em]:text-[var(--accent)] [&_.katex-inline]:max-w-full";
const FEED_NOTE =
  "mt-7 max-w-3xl text-base font-bold leading-snug text-white/45";

export function ScrollPage() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  const feedRef = useRef<HTMLElement | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [formulaMarks, setFormulaMarks] = useState<Record<string, FormulaMark>>({});
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<ScrollMode>("story");

  const feed = useMemo(() => (course ? buildFeed(course.lessons, course.practice, mode) : []), [course, mode]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0 });
    setActive(0);
  }, [courseId, mode]);

  useEffect(() => {
    const root = feedRef.current;
    if (!root || !feed.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        setActive(Number((best.target as HTMLElement).dataset.feedIndex ?? 0));
      },
      { root, threshold: [0.55, 0.7, 0.85] }
    );
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-feed-index]"));
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [feed.length, mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      if (tag === "button" || tag === "a" || tag === "input" || tag === "textarea") return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        scrollToIndex(active + 1);
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        scrollToIndex(active - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, feed.length]);

  if (!course) return <NotFound />;

  function choose(question: Question, optionId: string) {
    if (answers[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    recordAnswer(courseId, question.id, optionId === question.correct);
  }

  function scrollToIndex(index: number) {
    const clamped = Math.max(0, Math.min(index, feed.length - 1));
    const node = feedRef.current?.querySelector<HTMLElement>(`[data-feed-index="${clamped}"]`);
    node?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function handleFeedClick(event: MouseEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) return;
    scrollToIndex(active + 1);
  }

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <div className="fixed inset-0 z-50 overflow-hidden bg-[#070b16] text-white" style={{ colorScheme: "dark" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 620px at 18% 10%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%), radial-gradient(760px 580px at 95% 75%, color-mix(in oklab, var(--accent-2) 24%, transparent), transparent 58%), linear-gradient(180deg, #10172d 0%, #070b16 56%, #050812 100%)",
          }}
        />
        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <Link
            to={`/c/${courseId}`}
            className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur-xl transition hover:bg-white/15 hover:text-white"
            aria-label={`Back to ${course.meta.short}`}
          >
            <Icon name="ChevronLeft" size={20} />
          </Link>
          <div className="pointer-events-auto flex min-w-0 items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-xl">
            <ModeButton active={mode === "story"} icon="Sparkles" label="Story" onClick={() => setMode("story")} />
            <ModeButton active={mode === "drill"} icon="CircleHelp" label="Drill" onClick={() => setMode("drill")} />
            <ModeButton active={mode === "formula"} icon="Sigma" label="Formula" onClick={() => setMode("formula")} />
          </div>
          <div className="pointer-events-none min-w-10 text-right font-mono text-[11px] font-semibold text-white/45">
            {feed.length ? active + 1 : 0}/{feed.length}
          </div>
        </header>
        <section
          ref={feedRef}
          onClick={handleFeedClick}
          className="relative z-10 h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth no-scrollbar"
          aria-label="Microlearning scroll feed"
        >
          {feed.map((item, index) => (
            <article
              key={item.id}
              data-feed-index={index}
              className="flex h-[100dvh] snap-start snap-always overflow-hidden px-6 sm:px-10 md:px-16"
              style={{
                paddingTop: "max(4.8rem, calc(env(safe-area-inset-top) + 3.8rem))",
                paddingBottom: "max(2.75rem, calc(env(safe-area-inset-bottom) + 2.4rem))",
              }}
            >
              <FeedCard
                item={item}
                picked={item.kind === "question" ? answers[item.question.id] : undefined}
                revealed={Boolean(revealed[item.id])}
                formulaMark={formulaMarks[item.id]}
                onPick={choose}
                onReveal={() => setRevealed((prev) => ({ ...prev, [item.id]: true }))}
                onFormulaMark={(mark) => setFormulaMarks((prev) => ({ ...prev, [item.id]: mark }))}
              />
            </article>
          ))}
        </section>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div
            className="h-1 origin-left"
            style={{
              transform: `scaleX(${feed.length ? (active + 1) / feed.length : 0})`,
              background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
            }}
          />
        </div>
      </div>
    </CourseTheme>
  );
}

function buildFeed(lessons: Lesson[], practice: Question[], mode: ScrollMode): FeedItem[] {
  const questionsByTopic = new Map<string, Question[]>();
  const topicOrder: string[] = [];
  for (const q of practice) {
    const key = q.topic ?? "";
    if (!questionsByTopic.has(key)) topicOrder.push(key);
    const list = questionsByTopic.get(key) ?? [];
    list.push(q);
    questionsByTopic.set(key, list);
  }

  const items: FeedItem[] = [];
  for (const [lessonIndex, lesson] of lessons.entries()) {
    const blocks = lesson.blocks;
    const mapBlock = blocks.find(
      (block) => block.kind === "callout" && block.title === "Plain-English map"
    ) as Extract<LessonBlock, { kind: "callout" }> | undefined;
    const recipeBlock = blocks.find(
      (block) => block.kind === "steps" && /recipe|route/i.test(block.title ?? "")
    ) as Extract<LessonBlock, { kind: "steps" }> | undefined;
    const formulas = blocks.filter((block) => block.kind === "formula") as Extract<LessonBlock, { kind: "formula" }>[];
    const callouts = blocks.filter(
      (block) => block.kind === "callout" && block.title !== "Plain-English map"
    ) as Extract<LessonBlock, { kind: "callout" }>[];
    const examples = blocks.filter((block) => block.kind === "example") as Extract<LessonBlock, { kind: "example" }>[];
    const checkpoints = blocks
      .filter((block) => block.kind === "checkpoint")
      .map((block) => (block as Extract<LessonBlock, { kind: "checkpoint" }>).question);
    const lessonTopic = topicOrder[lessonIndex] ?? "";
    const topicQuestions = questionsByTopic.get(lessonTopic) ?? [];
    const directQuestions = practice.filter((q) => q.topic === lesson.title || q.topic?.includes(lesson.title));
    const questionLimit = mode === "drill" ? DRILL_QUESTIONS_PER_LESSON : MAX_QUESTIONS_PER_LESSON;
    const questions = dedupeQuestions([...checkpoints, ...directQuestions, ...topicQuestions]).slice(0, questionLimit);

    items.push({ id: `${lesson.id}:intro`, kind: "lesson", lesson, index: lessonIndex, hook: firstBeat(lesson.summary) });
    if (mode === "story") {
      const analogy = analogyForLesson(lesson);
      items.push({
        id: `${lesson.id}:analogy`,
        kind: "beat",
        lesson,
        label: "Caveman mode",
        title: analogy.title,
        text: analogy.text,
      });
    }

    if (mode !== "formula" && mapBlock) {
      splitNode(mapBlock.content, 155).forEach((text, i, chunks) => {
        items.push({
          id: `${lesson.id}:map:${i}`,
          kind: "beat",
          lesson,
          label: "Concept",
          title: i === 0 ? "The idea" : "Keep it simple",
          text,
          part: chunks.length > 1 ? `${i + 1}/${chunks.length}` : undefined,
        });
      });
    }

    if (mode === "story" && recipeBlock) {
      recipeBlock.steps.slice(0, 5).forEach((step, i, steps) => {
        items.push({
          id: `${lesson.id}:step:${i}`,
          kind: "step",
          lesson,
          title: recipeBlock.title ?? "Exam recipe",
          label: step.label,
          text: step.content,
          step: i + 1,
          total: steps.length,
        });
      });
    }

    if (mode !== "drill") {
      const formulaLimit = mode === "formula" ? formulas.length : MAX_STORY_FORMULAS_PER_LESSON;
      formulas.slice(0, formulaLimit).forEach((formula, i) => {
        const recall = describeFormula(formula, lesson);
        items.push({
          id: `${lesson.id}:formula:${i}`,
          kind: "formula",
          lesson,
          title: recall.title,
          prompt: recall.prompt,
          hint: recall.hint,
          tex: formula.tex,
          caption: formula.caption,
        });
      });
    }

    if (mode === "story") {
      callouts.slice(0, MAX_CALLOUTS_PER_LESSON).forEach((callout, i) => {
        splitNode(callout.content, 150).forEach((text, j, chunks) => {
          items.push({
            id: `${lesson.id}:callout:${i}:${j}`,
            kind: "beat",
            lesson,
            label: callout.tone === "trap" ? "Trap" : "Note",
            title: callout.title ?? callout.tone,
            text,
            part: chunks.length > 1 ? `${j + 1}/${chunks.length}` : undefined,
          });
        });
      });
      examples.slice(0, MAX_EXAMPLES_PER_LESSON).forEach((example, i) => {
        splitExample(example.content).forEach((text, j, chunks) => {
          items.push({
            id: `${lesson.id}:example:${i}:${j}`,
            kind: "example",
            lesson,
            title: example.title,
            text,
            part: chunks.length > 1 ? `${j + 1}/${chunks.length}` : undefined,
          });
        });
      });
    }

    if (mode !== "formula") {
      questions.forEach((question, i) => {
        items.push({ id: `${lesson.id}:question:${i}`, kind: "question", lesson, question });
      });
    }
  }
  items.push({ id: "finish", kind: "finish", totalLessons: lessons.length });
  return items;
}

function dedupeQuestions(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, label, [role='button']"));
}

function splitNode(value: ReactNode, maxChars: number): ReactNode[] {
  if (typeof value !== "string") return [value];
  return splitPlainText(value, maxChars);
}

function splitExample(value: ReactNode): ReactNode[] {
  if (typeof value !== "string") return [value];
  const paragraphs = value.split(/\n{2,}/).filter((p) => p.trim().length);
  const chunks = paragraphs.flatMap((paragraph) => splitPlainText(paragraph, 260));
  return chunks.slice(0, 6);
}

function splitPlainText(text: string, maxChars: number): string[] {
  const normalized = text.replace(/[ \t]+/g, " ").trim();
  if (normalized.length <= maxChars) return [normalized];
  const paragraphs = normalized.split(/\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) {
      chunks.push(paragraph);
      continue;
    }
    const sentences = paragraph.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [paragraph];
    let current = "";
    for (const sentence of sentences.map((s) => s.trim()).filter(Boolean)) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length > maxChars && current) {
        chunks.push(current);
        current = sentence;
      } else {
        current = next;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks.length ? chunks : [normalized];
}

function firstBeat(text: string) {
  const chunks = splitPlainText(text, 165);
  if (chunks.length > 1 && chunks[0].length < 60) {
    return `${chunks[0]} ${chunks[1]}`;
  }
  return chunks[0] ?? text;
}

function nodeText(value: ReactNode): string {
  return typeof value === "string" ? value : "";
}

function firstSentence(text: string) {
  return (text.match(/[^.!?]+[.!?]/)?.[0] ?? text).trim();
}

function analogyForLesson(lesson: Lesson) {
  const id = lesson.id;
  const title = lesson.title;
  if (id === "fundamentals") {
    return {
      title: "Name thing. Then solve thing.",
      text:
        "Caveman checklist: box? stuff inside? stuff crossing? gas or wet soup? Name the situation first. Then the equations stop pretending to be a haunted forest.",
    };
  }
  if (id === "first-law") {
    return {
      title: "Energy is a bank account",
      text:
        "Heat is money entering. Work is money leaving. Internal energy is the balance. First Law problems are just accounting wearing safety goggles.",
    };
  }
  if (id === "second-law") {
    return {
      title: "Entropy is the mess receipt",
      text:
        "First Law says the energy is still somewhere. Second Law says some usefulness got shredded. Entropy production is the receipt: zero is perfect, positive is real, negative is nonsense.",
    };
  }
  if (id === "vapor-cycles") {
    return {
      title: "Four machines in a loop",
      text:
        "Rankine is a steam treadmill: pump squeezes, boiler feeds, turbine cashes out, condenser resets. Refrigeration flips the mission: steal heat from the cold side.",
    };
  }
  if (id === "gas-cycles") {
    return {
      title: "Engine cartoons",
      text:
        "Otto, Diesel, and Brayton are exam cartoons. Label each leg: squeeze, heat, expand, dump. Once the cartoon is named, the formulas stop spawning randomly.",
    };
  }
  if (id === "moist-air") {
    return {
      title: "Air with a wet backpack",
      text:
        "Dry air carries a water backpack. Psychrometrics asks three things: how heavy, how full compared with max, and did water get added or removed?",
    };
  }
  if (id === "conduction") {
    return {
      title: "Heat walking through walls",
      text:
        "Heat walks from hot to cold. Every layer is mud. Thick mud, low conductivity, bad contact: slower walk. Draw the path, add the mud, divide temperature push by resistance.",
    };
  }
  if (id === "convection") {
    return {
      title: "Fluid steals heat from the wall",
      text:
        "At the wall, heat crawls out. Moving fluid grabs it and runs. The whole topic asks: how good is the theft? That number is $h$.",
    };
  }
  if (id === "heat-exchangers") {
    return {
      title: "Two rivers trading warmth",
      text:
        "A hot stream and a cold stream pass through a wall. They do not mix; they trade heat. Track who pays, who gains, and how hard the wall taxes the trade.",
    };
  }
  if (id === "radiation") {
    return {
      title: "Heat flashlight",
      text:
        "Radiation is heat as invisible light. No air needed. Hotter objects shout way louder because of $T^4$. Kelvin only, because Celsius lies to this formula.",
    };
  }
  return {
    title: "Tiny mental picture",
    text: `${title} is easier if you first turn it into a picture, then attach the equations to that picture.`,
  };
}

function describeFormula(formula: Extract<LessonBlock, { kind: "formula" }>, lesson: Lesson) {
  const tex = formula.tex;
  const caption = nodeText(formula.caption);
  const has = (needle: string) => tex.includes(needle);
  if (has("pV = mRT") || has("pv = RT")) {
    return {
      title: "Ideal-gas law",
      prompt: "Can you write the equation connecting pressure, volume, mass, gas constant, and absolute temperature?",
      hint: "The temperature is in kelvin. If the tank is rigid, volume is constant.",
    };
  }
  if (has("2 independent intensive properties")) {
    return {
      title: "State postulate",
      prompt: "How many independent intensive properties fix a simple compressible state?",
      hint: "Inside the vapor dome, pressure and temperature are not independent.",
    };
  }
  if (has("du=c_v") || has("dh=c_p")) {
    return {
      title: "Ideal-gas energy changes",
      prompt: "For an ideal gas, how do you compute changes in internal energy and enthalpy from temperature?",
      hint: "Use the specific heat that matches the property: $u$ with $c_v$, $h$ with $c_p$.",
    };
  }
  if (has("c_p-c_v") || has("k=\\frac{c_p}")) {
    return {
      title: "Specific-heat relations",
      prompt: "Can you reconstruct the shortcuts linking $c_p$, $c_v$, $R$, and $k$?",
      hint: "Start from $c_p-c_v=R$ and $k=c_p/c_v$.",
    };
  }
  if (has("v=(1-x)v_f") || has("h=h_f+x")) {
    return {
      title: "Wet-mixture property",
      prompt: "Inside the vapor dome, how do you compute a property using quality $x$?",
      hint: "It is a mass-weighted blend between saturated liquid $f$ and saturated vapor $g$.",
    };
  }
  if (has("y = y_1")) {
    return {
      title: "Linear interpolation",
      prompt: "If the table value is between two rows, what interpolation formula do you use?",
      hint: "Start at row 1 and add the fraction of the gap from row 1 to row 2.",
    };
  }
  if (has("Q-W") || has("\\Delta U")) {
    return {
      title: "Closed-system energy balance",
      prompt: "For a fixed mass, what First Law balance connects heat, work, and stored energy?",
      hint: "With this course's sign convention, work done by the system is positive.",
    };
  }
  if (has("W_{12}") || has("\\int_1^2 p") || has("p\\,dV")) {
    return {
      title: "Boundary work",
      prompt: "When a piston moves, how do you compute the work from the $p$-$V$ path?",
      hint: "On a $p$-$V$ diagram, work is area under the curve.",
    };
  }
  if (has("pV^n") || has("T_2/T_1") || has("V_1/V_2")) {
    return {
      title: "Process shortcut",
      prompt: "Which shortcut connects the two states for this special process?",
      hint: "First name the process: isobaric, isochoric, isothermal, adiabatic, or polytropic.",
    };
  }
  if (has("\\dot Q") || has("\\dot W") || has("\\dot m")) {
    return {
      title: "Steady-flow energy balance",
      prompt: "For a turbine, compressor, nozzle, pump, or heat exchanger, what balance do you start from?",
      hint: "Mass carries enthalpy through the control volume.",
    };
  }
  if (has("\\eta") || has("COP") || has("\\beta") || has("\\gamma")) {
    return {
      title: "Performance ratio",
      prompt: "What efficiency or COP relation measures useful effect divided by what you pay?",
      hint: "Engines pay with heat input; refrigerators and heat pumps pay with work input.",
    };
  }
  if (has("\\sigma") || has("\\Delta S") || has("dS=")) {
    return {
      title: "Entropy balance",
      prompt: "How do you decide if a process is reversible, irreversible, or impossible?",
      hint: "Entropy production is zero for reversible, positive for real, negative for impossible.",
    };
  }
  if (has("Nu") || has("Re") || has("Pr") || has("Gr") || has("Ra")) {
    return {
      title: "Convection correlation chain",
      prompt: "Which dimensionless group gives the convection coefficient $h$?",
      hint: "Find $Nu$, then convert it with $Nu=hL/k$ or $Nu=hD/k$.",
    };
  }
  if (has("\\varepsilon") || has("NTU") || has("\\Delta T_{lm}")) {
    return {
      title: "Heat-exchanger method",
      prompt: "Which heat-exchanger relation do you use when outlet temperatures or effectiveness are involved?",
      hint: "LMTD uses terminal temperature differences; $\\varepsilon$-NTU uses maximum possible heat transfer.",
    };
  }
  if (has("\\omega") || has("\\varphi")) {
    return {
      title: "Moist-air property",
      prompt: "What relation describes water vapor carried per kg of dry air or relative humidity?",
      hint: "Psychrometrics is almost always per kg of dry air.",
    };
  }
  if (has("\\sigma T^4") || has("T^4") || has("\\varepsilon\\sigma")) {
    return {
      title: "Radiation heat transfer",
      prompt: "What radiation relation depends on absolute temperature to the fourth power?",
      hint: "Always convert to kelvin before using radiation formulas.",
    };
  }
  if (has("R_{")) {
    return {
      title: "Thermal resistance",
      prompt: "Can you write the resistance you need, then use heat rate as driving temperature difference over resistance?",
      hint: "Think electric circuit: resistances in series add.",
    };
  }

  const fallback = firstSentence(caption) || lesson.title;
  return {
    title: "Key equation",
    prompt: "Can you recreate the equation behind this idea without looking?",
    hint: fallback,
  };
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} mode`}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-black uppercase tracking-wide transition",
        active ? "text-[#080b14]" : "text-white/55 hover:bg-white/10 hover:text-white"
      )}
      style={active ? { background: "linear-gradient(180deg,var(--accent),var(--accent-2))" } : undefined}
    >
      <Icon name={icon} size={15} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function FeedCard({
  item,
  picked,
  revealed,
  formulaMark,
  onPick,
  onReveal,
  onFormulaMark,
}: {
  item: FeedItem;
  picked?: string;
  revealed: boolean;
  formulaMark?: FormulaMark;
  onPick: (question: Question, optionId: string) => void;
  onReveal: () => void;
  onFormulaMark: (mark: FormulaMark) => void;
}) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col justify-center">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 no-scrollbar">
        {item.kind === "lesson" && <LessonIntro item={item} />}
        {item.kind === "beat" && <BeatCard item={item} />}
        {item.kind === "step" && <StepCard item={item} />}
        {item.kind === "formula" && (
          <FormulaCard item={item} revealed={revealed} mark={formulaMark} onReveal={onReveal} onMark={onFormulaMark} />
        )}
        {item.kind === "example" && <ExampleCard item={item} />}
        {item.kind === "question" && <QuestionScrollCard item={item} picked={picked} onPick={onPick} />}
        {item.kind === "finish" && <FinishCard item={item} />}
      </div>
    </div>
  );
}

function LessonIntro({ item }: { item: Extract<FeedItem, { kind: "lesson" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className={FEED_KICKER}>Lesson {item.index + 1}</div>
      <h1 className={cn(FEED_TITLE, "mt-4")}>{rtInline(item.lesson.title)}</h1>
      <div className={FEED_BODY}>{rt(item.hook)}</div>
      <div className={FEED_NOTE}>
        One idea per screen. No textbook fog. Tap empty space or swipe when the idea lands.
      </div>
    </div>
  );
}

function BeatCard({ item }: { item: Extract<FeedItem, { kind: "beat" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className={cn(FEED_KICKER, "flex items-center gap-2")}>
        {item.label}
        {item.part && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">{item.part}</span>}
      </div>
      <h2 className={cn(FEED_TITLE, "mt-4")}>{rtInline(item.title)}</h2>
      <div className={FEED_BODY}>{rt(item.text)}</div>
    </div>
  );
}

function StepCard({ item }: { item: Extract<FeedItem, { kind: "step" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className={FEED_KICKER}>
        Move {item.step}/{item.total}
      </div>
      <h2 className={cn(FEED_TITLE, "mt-4")}>{item.label ? rtInline(item.label) : rtInline(item.title)}</h2>
      <div className={FEED_BODY}>{rt(item.text)}</div>
      <div className={FEED_NOTE}>
        This is the move. Do it before the algebra starts yelling.
      </div>
    </div>
  );
}

function FormulaCard({
  item,
  revealed,
  mark,
  onReveal,
  onMark,
}: {
  item: Extract<FeedItem, { kind: "formula" }>;
  revealed: boolean;
  mark?: FormulaMark;
  onReveal: () => void;
  onMark: (mark: FormulaMark) => void;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className={FEED_KICKER}>Closed-book recall</div>
      <h2 className={cn(FEED_TITLE, "mt-4")}>{rtInline(item.title)}</h2>
      <div className="mt-6 max-w-4xl rounded-3xl border border-[var(--accent-line)] bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] px-5 py-4 text-[clamp(1.05rem,4vw,1.9rem)] font-black leading-tight text-white">
        {rt(item.prompt)}
      </div>
      <div className="mt-3 max-w-3xl text-base font-semibold leading-snug text-white/55">
        Hint: {rtInline(item.hint)}
      </div>

      {revealed ? (
        <>
          <div className="mt-6 max-w-full overflow-x-auto rounded-3xl border border-white/10 bg-white/10 p-4 text-white/90 backdrop-blur [&_.katex-display]:my-0">
            <TexBlock>{item.tex}</TexBlock>
            {item.caption && (
              <div className="mt-4 text-sm font-semibold leading-relaxed text-white/55 [&_p]:m-0 [&_p+p]:mt-3">{rt(item.caption)}</div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onMark("known")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition",
                mark === "known" ? "bg-white text-[#070b16]" : "border border-white/10 bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              <Icon name="CircleCheck" size={16} /> I knew it
            </button>
            <button
              type="button"
              onClick={() => onMark("again")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition",
                mark === "again" ? "bg-white text-[#070b16]" : "border border-white/10 bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              <Icon name="RotateCcw" size={16} /> Drill again
            </button>
          </div>
          {mark && (
            <div className="mt-3 max-w-lg rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white/65">
              {mark === "known" ? "Good. This one can move to fast recall." : "Marked for reps. Formula mode is for exactly this."}
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          className="mt-7 inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-[#070b16] shadow-lg shadow-black/20 transition hover:scale-[1.02]"
          style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
        >
          <Icon name="Eye" size={16} /> Reveal after trying
        </button>
      )}
    </div>
  );
}

function ExampleCard({ item }: { item: Extract<FeedItem, { kind: "example" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className={cn(FEED_KICKER, "flex items-center gap-2")}>
        Worked example
        {item.part && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">{item.part}</span>}
      </div>
      <h2 className={cn(FEED_TITLE, "mt-4")}>{rtInline(item.title ?? "Example")}</h2>
      <div className={FEED_BODY}>{rt(item.text)}</div>
    </div>
  );
}

function QuestionScrollCard({
  item,
  picked,
  onPick,
}: {
  item: Extract<FeedItem, { kind: "question" }>;
  picked?: string;
  onPick: (question: Question, optionId: string) => void;
}) {
  const answered = Boolean(picked);
  const correct = picked === item.question.correct;

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={FEED_KICKER}>Quick check</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white/55">
          {item.question.difficulty}
        </span>
      </div>
      <div className="max-w-5xl text-[clamp(1.35rem,5.4vw,2.8rem)] font-black leading-[1.08] text-white [text-wrap:balance] [&_p]:m-0">
        {rt(item.question.prompt)}
      </div>
      <div className="mt-6 grid max-w-5xl gap-2.5">
        {item.question.options.map((option) => {
          const isCorrect = option.id === item.question.correct;
          const show = answered && (option.id === picked || isCorrect);
          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => onPick(item.question, option.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-[clamp(0.95rem,3.5vw,1.15rem)] font-bold leading-snug text-white/75 transition",
                !answered && "border-white/10 bg-white/8 hover:border-[var(--accent-line)] hover:bg-white/12",
                show && isCorrect && "border-emerald-300/50 bg-emerald-400/15 text-white",
                show && !isCorrect && "border-rose-300/50 bg-rose-400/15 text-white",
                answered && !show && "border-white/5 opacity-40"
              )}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-xs font-black text-white/55">
                {option.id}
              </span>
              <span>{rtInline(option.content)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div
            className="mb-2 flex items-center gap-2 font-bold"
            style={{ color: correct ? "var(--good)" : "var(--bad)" }}
          >
            <Icon name={correct ? "CircleCheck" : "CircleX"} size={18} />
            {correct ? "Locked" : `Correct answer: ${item.question.correct}`}
          </div>
          <div className="text-sm font-semibold leading-relaxed text-white/65 [&_p]:m-0 [&_p+p]:mt-3">{rt(item.question.explanation)}</div>
          {item.question.theory && (
            <div className="mt-3 border-t border-white/10 pt-3 text-sm font-semibold leading-relaxed text-white/75 [&_p]:m-0 [&_p+p]:mt-3">
              {rt(item.question.theory)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinishCard({ item }: { item: Extract<FeedItem, { kind: "finish" }> }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <span
        className="grid h-16 w-16 place-items-center rounded-full text-[#070b16]"
        style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
      >
        <Icon name="Flag" size={30} />
      </span>
      <h2 className="mt-6 text-[clamp(2.8rem,12vw,7rem)] font-black leading-none text-white [text-wrap:balance]">
        Feed complete
      </h2>
      <p className="mt-5 max-w-2xl text-[clamp(1.05rem,4vw,1.7rem)] font-semibold leading-tight text-white/65">
        {item.totalLessons} lessons moved through your brain. Now make it stick with actual practice.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="../practice"
          relative="path"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-[#070b16]"
          style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
        >
          <Icon name="Dumbbell" size={16} /> Practice
        </Link>
        <Link
          to="../exams"
          relative="path"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white/75 backdrop-blur transition hover:bg-white/15"
        >
          <Icon name="FileText" size={16} /> Exam problems
        </Link>
      </div>
    </div>
  );
}
