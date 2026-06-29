import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { CourseNav } from "../components/CourseNav";
import { CourseTheme } from "../components/CourseTheme";
import { Icon } from "../components/Icon";
import { TopBar, Page } from "../components/Layout";
import { rt, rtInline } from "../components/RichText";
import { Pill } from "../components/ui";
import { getCourse } from "../courses/registry";
import { dueCount } from "../lib/adaptive";
import { cn } from "../lib/cn";
import { TexBlock } from "../lib/math";
import { recordAnswer, useCourseProgress } from "../lib/progress";
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

export function ScrollPage() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  const progress = useCourseProgress(courseId);
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

  const current = feed[active];
  const lessonLabel = current && "lesson" in current ? current.lesson.title : course.meta.short;

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

  return (
    <CourseTheme accent={course.meta.accent} accent2={course.meta.accent2}>
      <TopBar crumbs={[{ label: course.meta.short, to: `/c/${courseId}` }, { label: "Scroll" }]}>
        <Link to={`/c/${courseId}/practice`} className="btn btn-ghost !py-2 !text-sm">
          <Icon name="Dumbbell" size={15} /> <span className="hidden sm:inline">Practice</span>
        </Link>
      </TopBar>

      <Page className="max-w-5xl pb-5">
        <div className="mb-3">
          <CourseNav courseId={courseId} due={dueCount(course.practice, progress)} />
        </div>

        <div className="mb-3 rounded-2xl border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-2 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[9rem] flex-1 px-2">
              <div className="truncate text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)]">
                TikTok mode
              </div>
              <div className="truncate text-sm font-bold">{rtInline(lessonLabel)}</div>
            </div>
            <ModeButton active={mode === "story"} icon="Sparkles" label="Story" onClick={() => setMode("story")} />
            <ModeButton active={mode === "drill"} icon="CircleHelp" label="Drill" onClick={() => setMode("drill")} />
            <ModeButton active={mode === "formula"} icon="Sigma" label="Formula" onClick={() => setMode("formula")} />
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${feed.length ? ((active + 1) / feed.length) * 100 : 0}%`,
                background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
              }}
            />
          </div>
        </div>

        <section
          ref={feedRef}
          className="mx-auto h-[calc(100svh-15.75rem)] min-h-[520px] max-w-3xl snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-[1.6rem] border border-[var(--color-line)] bg-[var(--color-bg)] scroll-smooth"
          aria-label="Microlearning scroll feed"
        >
          {feed.map((item, index) => (
            <article key={item.id} data-feed-index={index} className="h-full snap-start snap-always p-2 sm:p-4">
              <div className="flex h-full min-h-0 rounded-[1.35rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-7">
                <FeedCard
                  item={item}
                  index={index}
                  total={feed.length}
                  picked={item.kind === "question" ? answers[item.question.id] : undefined}
                  revealed={Boolean(revealed[item.id])}
                  formulaMark={formulaMarks[item.id]}
                  onPick={choose}
                  onReveal={() => setRevealed((prev) => ({ ...prev, [item.id]: true }))}
                  onFormulaMark={(mark) => setFormulaMarks((prev) => ({ ...prev, [item.id]: mark }))}
                  onNext={() => scrollToIndex(index + 1)}
                  onPrevious={() => scrollToIndex(index - 1)}
                />
              </div>
            </article>
          ))}
        </section>
      </Page>
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
      splitNode(mapBlock.content, 210).forEach((text, i, chunks) => {
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
        splitNode(callout.content, 210).forEach((text, j, chunks) => {
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

function splitNode(value: ReactNode, maxChars: number): ReactNode[] {
  if (typeof value !== "string") return [value];
  return splitPlainText(value, maxChars);
}

function splitExample(value: ReactNode): ReactNode[] {
  if (typeof value !== "string") return [value];
  const paragraphs = value.split(/\n{2,}/).filter((p) => p.trim().length);
  const chunks = paragraphs.flatMap((paragraph) => splitPlainText(paragraph, 420));
  return chunks.slice(0, 4);
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
  const chunks = splitPlainText(text, 210);
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
        "Caveman version: before math, point at the box and grunt: what is inside, what can cross the wall, and what state is it in? Thermodynamics gets annoying when you skip naming the problem before chasing equations.",
    };
  }
  if (id === "first-law") {
    return {
      title: "Energy is a bank account",
      text:
        "Heat is money entering. Work is money leaving. Internal energy is the account balance. First Law problems are not magic; they are accounting with hotter words.",
    };
  }
  if (id === "second-law") {
    return {
      title: "Entropy is the mess receipt",
      text:
        "First Law says the money is still somewhere. Second Law says some of it got turned into glitter on the floor. Entropy production is the receipt for the mess. Zero mess: reversible. Positive mess: real. Negative mess: fantasy.",
    };
  }
  if (id === "vapor-cycles") {
    return {
      title: "Four machines in a loop",
      text:
        "Rankine is a little steam gym: pump squeezes, boiler feeds, turbine works, condenser cools it back down. Refrigeration is the same loop energy-wise, but the goal is stealing heat from the cold side.",
    };
  }
  if (id === "gas-cycles") {
    return {
      title: "Engine cartoons",
      text:
        "Otto, Diesel, and Brayton are not full real engines. They are exam cartoons. Label each leg of the cartoon first: squeeze, heat, expand, dump heat. Once labels are right, formulas stop feeling random.",
    };
  }
  if (id === "moist-air") {
    return {
      title: "Air with a wet backpack",
      text:
        "Dry air is the person. Water vapor is the backpack. Psychrometrics keeps asking: how heavy is the backpack, how full is it compared to max, and did water get added or removed?",
    };
  }
  if (id === "conduction") {
    return {
      title: "Heat walking through walls",
      text:
        "Heat wants to walk from hot to cold. Every wall layer is mud it must walk through. Thick mud, low conductivity, bad contact: slower walk. Draw the path, add the muds, divide temperature push by resistance.",
    };
  }
  if (id === "convection") {
    return {
      title: "Fluid steals heat from the wall",
      text:
        "At the wall, heat first crawls by conduction. Then moving fluid grabs it and runs away. The whole topic is basically: how good is the fluid thief? That number is $h$.",
    };
  }
  if (id === "heat-exchangers") {
    return {
      title: "Two rivers trading warmth",
      text:
        "A hot river and a cold river pass each other through a wall. They do not mix; they just trade heat. Your job is to track who lost warmth, who gained it, and how hard the wall made the trade.",
    };
  }
  if (id === "radiation") {
    return {
      title: "Heat flashlight",
      text:
        "Radiation is heat sent as light you mostly cannot see. No air needed. Hotter objects scream energy much louder because of $T^4$. Kelvin only, because Celsius lies to this formula.",
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
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition",
        active ? "text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
      )}
      style={active ? { background: "linear-gradient(180deg,var(--accent),var(--accent-2))" } : undefined}
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

function FeedCard({
  item,
  index,
  total,
  picked,
  revealed,
  formulaMark,
  onPick,
  onReveal,
  onFormulaMark,
  onNext,
  onPrevious,
}: {
  item: FeedItem;
  index: number;
  total: number;
  picked?: string;
  revealed: boolean;
  formulaMark?: FormulaMark;
  onPick: (question: Question, optionId: string) => void;
  onReveal: () => void;
  onFormulaMark: (mark: FormulaMark) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Pill tone={item.kind === "question" ? "accent" : item.kind === "formula" ? "warn" : "neutral"}>
          <Icon name={kindIcon(item.kind)} size={13} /> {kindLabel(item.kind)}
        </Pill>
        <span className="font-mono text-xs text-[var(--color-faint)]">
          {index + 1}/{total}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={index === 0}
          className="btn btn-ghost !h-10 !px-3 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous card"
        >
          <Icon name="ChevronUp" size={16} />
        </button>
        <span className="hidden text-xs font-semibold uppercase tracking-wider text-[var(--color-faint)] sm:inline">
          Scroll, swipe, or press down
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={index >= total - 1}
          className="btn btn-primary !h-10 !px-4 disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next <Icon name="ChevronDown" size={16} />
        </button>
      </div>
    </div>
  );
}

function LessonIntro({ item }: { item: Extract<FeedItem, { kind: "lesson" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Lesson {item.index + 1}</div>
      <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{rtInline(item.lesson.title)}</h1>
      <div className="prose-lesson mt-5 text-xl leading-relaxed text-[var(--color-muted)]">{rt(item.hook)}</div>
      <div className="mt-6 rounded-2xl bg-[var(--color-bg)] p-4 text-sm font-semibold text-[var(--color-muted)]">
        One screen at a time. You are not reading the chapter; you are collecting handles.
      </div>
    </div>
  );
}

function BeatCard({ item }: { item: Extract<FeedItem, { kind: "beat" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
        {item.label}
        {item.part && <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px]">{item.part}</span>}
      </div>
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title)}</h2>
      <div className="prose-lesson mt-5 text-xl leading-relaxed">{rt(item.text)}</div>
    </div>
  );
}

function StepCard({ item }: { item: Extract<FeedItem, { kind: "step" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
        Move {item.step}/{item.total}
      </div>
      <h2 className="text-3xl font-black tracking-tight">{item.label ? rtInline(item.label) : rtInline(item.title)}</h2>
      <div className="prose-lesson mt-5 text-xl leading-relaxed">{rt(item.text)}</div>
      <div className="mt-6 rounded-2xl bg-[var(--color-bg)] p-4 text-sm text-[var(--color-muted)]">
        This is one exam move. Learn the move, then swipe.
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
      <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--warn)]">Closed-book recall</div>
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title)}</h2>
      <div className="prose-lesson mt-4 rounded-2xl bg-[var(--warn-bg)] p-4 text-lg font-semibold text-[var(--warn)]">
        {rt(item.prompt)}
      </div>
      <div className="prose-lesson mt-3 rounded-2xl bg-[var(--color-bg)] p-4 text-sm text-[var(--color-muted)]">
        <strong>Hint:</strong> {rtInline(item.hint)}
      </div>

      {revealed ? (
        <>
          <div className="mt-5 rounded-2xl bg-[var(--color-bg)] p-4">
            <TexBlock>{item.tex}</TexBlock>
            {item.caption && <div className="prose-lesson mt-4 text-sm text-[var(--color-muted)]">{rt(item.caption)}</div>}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onMark("known")}
              className={cn("btn", mark === "known" ? "btn-primary" : "btn-ghost")}
            >
              <Icon name="CircleCheck" size={16} /> I knew it
            </button>
            <button
              type="button"
              onClick={() => onMark("again")}
              className={cn("btn", mark === "again" ? "btn-primary" : "btn-ghost")}
            >
              <Icon name="RotateCcw" size={16} /> Drill again
            </button>
          </div>
          {mark && (
            <div className="mt-3 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">
              {mark === "known" ? "Good. This one can move to fast recall." : "Marked for reps. Formula mode is for exactly this."}
            </div>
          )}
        </>
      ) : (
        <button type="button" onClick={onReveal} className="btn btn-primary mt-6 w-full justify-center">
          <Icon name="Eye" size={16} /> Reveal after trying
        </button>
      )}
    </div>
  );
}

function ExampleCard({ item }: { item: Extract<FeedItem, { kind: "example" }> }) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
        Worked example
        {item.part && <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px]">{item.part}</span>}
      </div>
      <h2 className="text-3xl font-black tracking-tight">{rtInline(item.title ?? "Example")}</h2>
      <div className="prose-lesson mt-5 text-lg leading-relaxed">{rt(item.text)}</div>
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
      <div className="mb-3 flex flex-wrap gap-2">
        <Pill tone="accent">Quick check</Pill>
        <Pill tone="neutral">{item.question.difficulty}</Pill>
      </div>
      <div className="prose-lesson text-xl font-bold leading-snug">{rt(item.question.prompt)}</div>
      <div className="mt-5 grid gap-2.5">
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
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                !answered && "border-[var(--color-line)] hover:border-[var(--accent-line)] hover:bg-[var(--color-bg)]",
                show && isCorrect && "border-emerald-500/50 bg-emerald-500/10",
                show && !isCorrect && "border-rose-500/50 bg-rose-500/10",
                answered && !show && "border-[var(--color-line)] opacity-45"
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--color-bg)] font-mono text-xs font-bold text-[var(--color-faint)]">
                {option.id}
              </span>
              <span>{rtInline(option.content)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 rounded-2xl bg-[var(--color-bg)] p-4">
          <div
            className="mb-2 flex items-center gap-2 font-bold"
            style={{ color: correct ? "var(--good)" : "var(--bad)" }}
          >
            <Icon name={correct ? "CircleCheck" : "CircleX"} size={18} />
            {correct ? "Locked" : `Correct answer: ${item.question.correct}`}
          </div>
          <div className="prose-lesson text-sm text-[var(--color-muted)]">{rt(item.question.explanation)}</div>
          {item.question.theory && (
            <div className="prose-lesson mt-3 border-t border-[var(--color-line)] pt-3 text-sm">
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
        className="grid h-16 w-16 place-items-center rounded-2xl text-white"
        style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2))" }}
      >
        <Icon name="Flag" size={30} />
      </span>
      <h2 className="mt-5 text-3xl font-black tracking-tight">Feed complete</h2>
      <p className="mt-3 max-w-md text-[var(--color-muted)]">
        You moved through {item.totalLessons} lessons in micro-cards. Now do a real practice set so the exam has fewer surprises.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="../practice" relative="path" className="btn btn-primary">
          <Icon name="Dumbbell" size={16} /> Practice
        </Link>
        <Link to="../exams" relative="path" className="btn btn-ghost">
          <Icon name="FileText" size={16} /> Exam problems
        </Link>
      </div>
    </div>
  );
}

function kindIcon(kind: FeedItem["kind"]) {
  switch (kind) {
    case "lesson":
      return "BookOpen";
    case "beat":
      return "Sparkles";
    case "step":
      return "ListChecks";
    case "formula":
      return "Sigma";
    case "example":
      return "PencilLine";
    case "question":
      return "CircleHelp";
    case "finish":
      return "Flag";
  }
}

function kindLabel(kind: FeedItem["kind"]) {
  switch (kind) {
    case "lesson":
      return "Lesson";
    case "beat":
      return "Micro-card";
    case "step":
      return "Exam move";
    case "formula":
      return "Recall";
    case "example":
      return "Example";
    case "question":
      return "Question";
    case "finish":
      return "Done";
  }
}
