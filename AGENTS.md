# AGENTS.md — Polito Tools content & engineering standard

This file is the contract for any AI agent (or human) extending **Polito Tools**. Read it fully
before writing code or content. `CLAUDE.md` is a short pointer to this file plus the commands you
run most.

---

## 0. Prime directive

> **This site must be enough to learn the course and pass the exam without attending lectures.**

Everything you add is judged against that. A flashcard that only tests recognition, or a lesson that
restates a slide bullet without teaching it, fails the bar. Teach first, then test.

The experience is three pillars per course:

1. **Learn** — interactive lessons (simulations, figures, math, worked examples) that build intuition.
2. **Practice** — adaptive A/B/C/D questions that *teach in the explanation* and resurface until mastered.
3. **Pass** — real exam-style problems with honest step-by-step solutions and examiner traps.

---

## 1. Golden rules (non-negotiable)

- **Correctness over volume.** A wrong explanation is worse than a missing card. Verify every
  number, formula, and claim. If unsure, say so in your hand-off, don't ship a guess.
- **Teach in the explanation.** Every question's `explanation` says why the right answer is right
  *and why each distractor is wrong*. Add a `theory` line that generalizes so the student can solve
  variants.
- **Use the professor's terminology** when migrating real course material, even if awkward. The exam
  uses their words.
- **Strict TypeScript, zero warnings.** The build runs `tsc -b` with `noUnusedLocals` /
  `noUnusedParameters`. One unused import fails the build. Run `npm run build` before you hand off.
- **Stay inside the content model.** Don't invent new block kinds or page types; extend `types.ts`
  deliberately if you truly need to, and update this file.
- **Balance MCQ answers.** Spread `correct` across A/B/C/D within a course. Don't make them all "A".
- **Never edit another agent's course folder** unless asked. Course folders are isolated on purpose.
- **One concept, one source of truth.** Reuse `lib/` and `components/`; don't copy logic into a course.

---

## 2. Repo layout

```
src/
  types.ts          CONTENT MODEL — Course, Lesson, LessonBlock, Question, ExamProblem. Read first.
  lib/
    math.tsx        <Tex> (inline) / <TexBlock> (block) KaTeX wrappers
    progress.ts     localStorage store + useCourseProgress() + recordAnswer/markLesson/setExamState
    adaptive.ts     mastery / XP / due-review scheduling, levelFromXp, isDue, buildSession
    summary.ts      per-course + aggregate progress summaries (powers dashboards)
    theme.ts        light/dark controller (light is default)
    cn.ts           classNames helper
  components/
    Layout.tsx      TopBar (brand + theme toggle), Page, Brand, Tabs
    CourseNav.tsx   persistent Overview/Practice/Exams tab strip inside a course
    CourseTheme.tsx re-themes a subtree to a course's accent colors
    LessonBlocks.tsx renderer for EVERY LessonBlock kind (+ inline checkpoint)
    SimKit.tsx      Slider / Readout / SimControls / ReadoutRow / SimButton — build sims with these
    Icon.tsx        lucide icon by PascalCase name
    ProgressRing.tsx, ui.tsx (Pill/Kicker/Meter/Stat/SectionHeading), ThemeToggle.tsx
  pages/
    HubPage         dashboard (all-subject progress) + course grid
    CoursePage      per-course home: progress panel, lessons, practice-by-lecture, drill cards
    LessonPage      lesson player (objectives, scroll progress, TOC, completion)
    PracticePage    adaptive MCQ engine (supports ?mode=due and ?topic=<lecture>)
    ExamPage        exam problems with reveal-solution
  courses/
    registry.ts     the ONE place that lists active courses
    <slug>/
      index.tsx       default-exports a Course (meta + lessons + practice + exam)
      sims/*.tsx      interactive simulations used by that course's lessons
      *.json          (optional) migrated/bulk data imported by index.tsx
scripts/
  migrate-cyber.mjs   one-off: old Cyber flashcards -> cybersecurity/cyber-cards.json
```

---

## 3. The content model (`src/types.ts`)

Content is **data + TSX**, so a lesson can embed a live simulation anywhere. Know these types cold.

### `CourseMeta`
`id` (slug), `title`, `short`, `tagline`, `description`, `accent` + `accent2` (hex; re-theme the whole
course), `icon` (lucide PascalCase name), `year` (2|3), `semester` (1|2), `credits?`, `examDate?`
(ISO; drives the countdown), `syllabus: string[]`, `status: "sample" | "in-progress" | "complete"`.

### `Lesson`
`id`, `title`, `summary`, `minutes`, `objectives: string[]`, `blocks: LessonBlock[]`.

### `LessonBlock` (discriminated union — use ONLY these)
| kind | use it for |
| --- | --- |
| `prose` | normal explanation. `content` is ReactNode; embed `<Tex>` for inline math. |
| `heading` | section title; auto-added to the lesson TOC. |
| `definition` | `term` + `content` highlight box. |
| `formula` | centered KaTeX block. `tex` is a string; optional `caption`, `tag` (e.g. "1.2"). |
| `callout` | `tone`: `key`/`info`/`tip`/`trap`/`warn`. Use `trap` for the professor's favorite mistakes. |
| `figure` | `render: () => ReactNode` — an SVG/JSX diagram + `caption`. |
| `sim` | `title` + `render: () => <YourSim/>` — the headline interactive element. |
| `example` | a worked example. |
| `steps` | numbered method (`steps: {label?, content}[]`). |
| `checkpoint` | inline mini-MCQ (`question: Question`) with instant feedback. |

### `Question` (MCQ)
`id` (unique string), `topic?` (the **lecture name** — powers practice-by-lecture), `difficulty`
(`easy`/`medium`/`hard`), `prompt` (ReactNode), `options: {id:"A".."D", content}[]`, `correct`
(option id), `explanation` (ReactNode — why right + why each wrong), `theory?` (generalized idea),
`source?`, `tags?`.

### `ExamProblem`
`id`, `title`, `meta` (e.g. "2024 · Winter · 12 pts"), `difficulty`, `topic?`, `statement`,
`given?`, `steps: {title, content}[]`, `finalAnswer`, `tips?` (examiner notes / traps).

---

## 4. How to add things

### Add a course
1. Create `src/courses/<slug>/index.tsx` that `export default`s a `Course`. Copy
   `thermodynamics/index.tsx` as the template — it's the gold standard.
2. Add interactive sims under `src/courses/<slug>/sims/`.
3. Register it: add one import + one array entry in `src/courses/registry.ts`. Nothing else is wired
   by hand — the hub card, course page, lessons, practice and exams all derive from the data.

### Add a lesson
Append a `Lesson` to the course's `lessons`. Aim for: a `prose` intro → `definition`s → `heading`s
that chunk it → `formula`s → at least one `sim` or `figure` → a `steps` method → a worked `example`
→ a `checkpoint` → a `trap` callout. One lesson per real lecture.

### Add practice questions
Append `Question`s. Each must have 4 plausible options, a teaching `explanation`, and a `theory`
line. Set `topic` to the lecture so it shows under "Practice by lecture". Keep ids unique within the
course.

### Add a simulation
Build with `SimKit` (`Slider`, `Readout`, `SimButton`, `SimControls`, `ReadoutRow`). Rules:
- Must be **interactive** and **numerically correct** — derive values, don't fake them.
- Use **SVG with a `viewBox`** so it scales; never hardcode pixel widths for the plot area.
- If you animate, use `useEffect` + `requestAnimationFrame` and **`cancelAnimationFrame` on cleanup**.
- Theme it with CSS vars (`var(--accent)`, `var(--color-bg)`, `var(--color-ink)`, …) so it works in
  light and dark; use the semantic status tokens (`--good`/`--bad`/`--warn`/`--info`) for pass/fail.

---

## 5. Math, theming, design tokens

- **Math:** inline `<Tex>{"x^2"}</Tex>`; block math via the `formula` block (`tex` string). KaTeX is
  configured with `throwOnError:false`, but still write valid LaTeX.
- **Theme:** light is default; a toggle in the TopBar switches to dark. NEVER hardcode dark-only
  colors. Use the tokens defined in `src/index.css`:
  - surfaces/text: `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-line`,
    `--color-ink`, `--color-muted`, `--color-faint`, `--prose`
  - status: `--good`/`--good-bg`, `--bad`/`--bad-bg`, `--warn`/`--warn-bg`, `--info`/`--info-bg`
  - accent (per course): `--accent`, `--accent-2`, `--accent-soft`, `--accent-line`
- Reusable classes: `.surface`, `.glass`, `.card-hover`, `.btn`/`.btn-primary`/`.btn-ghost`,
  `.prose-lesson`, `.accent-chip`.
- Each course picks a distinct `accent`/`accent2`. Text on an accent background is `text-white`.

---

## 6. Quality bar (what gets rejected)

**Good question**
- 4 plausible options with realistic traps; `correct` not always the same letter.
- `explanation` covers the right answer and every distractor.
- `theory` generalizes so variants are answerable.
- Difficulty + `topic` set; cites `source` when migrating real material.

**Bad question** (reject/rewrite)
- "A is correct because it is correct."
- Asks about a missing figure without embedding the needed information.
- Generic textbook phrasing instead of course terminology (for real material).
- Trivia with no mechanism explained.

**Good lesson**: teaches from zero, has a working simulation or figure, names the exam traps, and
ends with the student able to do the practice set.

**Good exam problem**: mirrors the real format, shows the *method* step by step (not just the final
number), and calls out where marks are usually lost.

---

## 7. Build & verify (always run before hand-off)

```bash
npm install        # first time
npm run dev        # local dev server (HMR) at http://localhost:5173
npm run build      # tsc -b (strict typecheck) + vite production build  ← must pass
npm run preview    # serve the built dist/
```

Hand-off note should include: what you added (ids / lesson ids / course), how you verified it, and
any uncertainty (especially unverified numbers or claims).

---

> **MA2 source material (added 2026-07-18):** the real course material lives in
> `course_material/Math Analysis II/Material(1)/` — 9 lecture decks (`Slides/`), 8 exercise
> sheets WITH solution sheets (`Exercise sheets*/`), solved exams (`MA2 Exams - Solutions/`)
> and `Past MA2 Exams/ExamsCollection_MecEng_14-23.pdf`. The real syllabus runs curves →
> Fourier series (9 decks, NO ODE deck); the app's `math-analysis-2` course must gain a
> Fourier module and treat ODEs as extra material. A real solved APPELLO paper sits misfiled
> at `course_material/Algebra/_text/LAG/exams/3.txt`. All new MA2/LAG/thermo questions MUST
> cite `source:` (sheet/paper + exercise number) and carry tags: `past-exam` (real papers),
> `tutorial` (exercise sheets), `wt25` (thermo 2025 written-test set) — the official mock
> exams draw from those tags first.

## 8. Migrating real course material

When the student provides slides, tutorials and past exams for a course:

- **Slides → lessons.** One lesson per lecture. Don't copy bullets — teach what the lecture teaches,
  predict what the professor tests, and add a simulation where a concept is dynamic.
- **Past-exam MCQs / self-tests → `practice`.** Preserve wording and traps; add full explanations
  and a `theory` line. Tag each with its lecture `topic`.
- **Written past-exam problems → `exam`.** Reproduce the statement, then give honest worked steps,
  the final answer, and examiner `tips`.
- **Verify coverage.** Compare the questions/lessons against the slide deck and flag anything the
  slides cover that the cards don't. Fill the gaps.

### Cybersecurity (already migrated)
`cybersecurity/cyber-cards.json` holds **345** cards: 297 migrated from the classic
`Cyber/data/questions.json` by `scripts/migrate-cyber.mjs`, plus 48 gap-fill cards added by a
per-module slide-coverage audit (`scripts/merge-audit.mjs`, tagged `audit-added` / id `cy-aud-*`).

- `topic` = the source lecture (e.g. "A1: Why cybersecurity"); `module` = "Module A: …". This drives
  the lecture-first practice menu (`LecturePicker`), grouping lectures under modules exactly like the
  classic site.
- Re-running `node scripts/migrate-cyber.mjs` regenerates the migrated set and **preserves** the
  `audit-added` cards, so it is safe.
- To add more gap-fill cards from a new audit run, feed the workflow output to
  `node scripts/merge-audit.mjs <output-file>`.

### Experimental Statistics & Mechanical Measurements (ESMM)

This exam is hands-on Excel, so the course (`src/courses/statistics/`) ships an **in-browser
spreadsheet**. Two pieces of shared infra power it:

- **Formula engine** `src/lib/excel/` — a real tokenizer/parser/evaluator (`engine.ts`) over a stats
  function table (`functions.ts`) backed by numerical special functions (`stats.ts`: NORM/T/CHISQ/F/
  BINOM/HYPGEOM + inverses, no deps). Public API in `index.ts` (`createSheet`, `Sheet.get`,
  `formatNumber`, `valuesMatch`).
- **Mock-Excel UI** `src/components/excel/` — `ExcelGrid` (grid + formula bar, type real formulas,
  live recalc) and `ExcelLab` (an exercise: seeded grid + Check + Reveal). A `LabExercise` is data.

Content is authored as **JSON** (loaded via `loadTopic`, like thermo): `topics/*.json` are lessons
(+ their `practice`/`exam`), `labs/*.json` are arrays of `LabExercise`. The `labs.tsx` registry maps
each exercise to a `lab:<id>` simKey; lab lessons embed them as `sim` blocks. Distribution explorers
use `dist-normal|student|chisq|fisher`.

**Verification gates (run after editing the engine or any lab JSON):**
- `npm run verify:excel` — replays 586 cells from the course's "Statistics functions.xlsx"
  (`scripts/excel-fixtures.json`, regen with the python in that script's header) and asserts the
  engine matches Excel's cached values. Hard gate for the engine.
- `npm run verify:labs` — seeds every exercise's canonical `hintFormula`s and asserts each `check`
  reproduces its `expected`. Hard gate for lab content (catches typos; guarantees "Check" goes green).
- `npm run verify` runs both. Lab `expected` values must equal the solution `.xlsx` cached values.

---

## 9. The game layer

Studying is gamified. The pieces (added 2026-07):

- `src/lib/game.ts` — ONE localStorage store (`polito:game:v1`) for the daily activity log
  (streak + heatmap), freeze tokens, rust on mastered cards (tiers at 10/21/42 days since
  `lastSeen`), per-course readiness → projected 18–30L grade, auto-generated daily quests,
  achievements, beers and season settings (focus courses, passed courses, exam-date overrides,
  sound). **game.ts must not import progress.ts or the registry** — callers pass data in; that is
  what keeps the module graph acyclic. `progress.recordAnswer`/`markLesson` mirror events into it.
- `src/lib/bosses.ts` + `src/pages/BossPage.tsx` + `src/components/game/BossArena.tsx` — every
  course has a final boss (procedural three.js). BossArena is lazy-loaded; NEVER import `three`
  from non-lazy code, it must stay out of the main bundle.
- `src/pages/PathPage.tsx` + `src/lib/path.ts` — Duolingo-style skill path generated from course
  data: per section (lecture group) lessons → checkpoint gate → MINI-BOSS, final boss at the end.
  Topic mapping strategies live in `lib/path.ts` (`courseSections`): per-lesson topics when the
  distinct practice-topic count equals the lesson count (topic-file courses), lecture-name==topic
  (the MA2 modules), else one generic gate. Keeping `lesson.lecture` == practice `topic` per module
  gives the path clean checkpoints. Mini-boss fights are `/c/<id>/boss?mini=<section>` (60 HP,
  2 hearts, section-scoped deck); victories persist in `game.miniBoss`.
- Boss fights are FULL-SCREEN (BossPage renders `fixed inset-0`, no TopBar/Page); question timers
  scale with difficulty (easy 25s / medium 40s / hard 60s). The CourseNav strip is deliberately
  four tabs (Path · Learn · Practice · Exams) — Scroll and Boss are reached from cards/path, don't
  re-add tabs.
- `src/pages/MixPage.tsx` — cross-course Daily Mix (due → rusty → fresh, round-robin, combo meter).
- `src/lib/sound.ts` (WebAudio synth) and `src/lib/confetti.ts` (canvas burst) — no assets, no deps.

### Math Analysis II layout
`courses/math-analysis-2/` is assembled from `modules/*.tsx`, one file per syllabus module, each
exporting `MODULE` (the lecture/topic string), `lessons`, `practice`, `exam`. Add content by editing
exactly one module file (or adding a new one to `index.tsx`); never let two authors touch the same
module file.

## 10. Gotchas

- JSON is imported (`resolveJsonModule`); migrated banks are cast `as unknown as Question[]` because
  JSON widens `difficulty`/`correct` to `string`.
- Routing is `HashRouter` and Vite `base: "./"` so a production build runs from any path / the
  filesystem. Keep links relative (`/c/<id>/...` via `<Link>`).
- `lucide-react` is imported by name via `Icon`; the full set is bundled (known bundle-size cost,
  acceptable; code-split later if needed).
- Don't introduce new dependencies without a strong reason; the stack is React + Tailwind v4 + KaTeX
  + framer-motion + lucide only.
