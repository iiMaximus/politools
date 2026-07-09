# Polito Tools

A personal study hub for Politecnico di Torino mechanical-engineering courses. Each course teaches
end to end through three pillars: **Learn** (interactive lessons), **Practice** (adaptive A/B/C/D
questions), **Pass** (exam problems with full solutions). The goal is for it to be enough to learn a
course and pass the exam without attending lectures.

> Extending this? Read **[AGENTS.md](./AGENTS.md)** — the content & engineering standard. AI agents
> should also read **[CLAUDE.md](./CLAUDE.md)** (the short version).

## Run it

**Prerequisite:** [Node.js](https://nodejs.org) 18+ (ships with `npm`).

Start the website in two steps from this folder (`polito/`):

```bash
npm install        # once — installs dependencies into node_modules/
npm run dev        # starts the dev server with hot reload
```

Then open **http://localhost:5173** in your browser. The dev server prints this URL when it's
ready; leave it running and edits reload live. Press `Ctrl+C` to stop it.

Other commands:

```bash
npm run build      # tsc -b (strict typecheck) + vite production build → dist/
npm run preview    # serve the built dist/ locally to sanity-check a build
npm run typecheck  # strict type check only, no emit
```

Stack: **Vite + React + TypeScript**, **Tailwind CSS v4**, **KaTeX** (math), **framer-motion**,
**lucide-react**. `HashRouter` + `base: "./"` so a build also runs from the filesystem.

## What's in it

- **Hub** — a dashboard of progress across all subjects (overall %, lessons, mastered cards, exam
  problems, reviews due, XP) plus a card per course with its own breakdown.
- **Four sample courses** with one interactive simulation each:
  - **Thermodynamics** — P–V process explorer (First Law)
  - **Mathematical Analysis II** — multivariable-limit path explorer
  - **Mechanics & Vibrations** — mass-spring-damper response
  - **Cybersecurity** — Caesar cipher + frequency analysis
- **Cybersecurity** also carries the **full flashcard bank** from the classic Cyber site — 297
  migrated cards + 48 added by a slide-coverage audit = **345**, grouped by lecture (modules A–H) and
  practiceable lecture-by-lecture (the default), Mix, or Review.
- **Light theme by default**, with a dark toggle in the top bar.

## Architecture (short)

```
src/
  types.ts          content model: Course, Lesson, LessonBlock, Question, ExamProblem
  lib/              math, progress (localStorage), adaptive scheduling, summary, theme
  components/       Layout, CourseNav, LessonBlocks, SimKit, ProgressRing, ui, Icon, ...
  pages/            HubPage, CoursePage, LessonPage, PracticePage, ExamPage
  courses/
    registry.ts     lists active courses (add one line per course)
    <slug>/index.tsx   default-exports a Course; sims/ holds its simulations
scripts/migrate-cyber.mjs   regenerates cybersecurity/cyber-cards.json from the classic site
```

A course is pure data + TSX: define `meta`, `lessons`, `practice`, `exam`, add it to the registry,
and the hub card, course page, lesson player, practice engine and exam viewer all light up
automatically. Full details and quality bar are in [AGENTS.md](./AGENTS.md).

## Adding / completing a course

1. Copy `src/courses/thermodynamics/index.tsx` to a new `src/courses/<slug>/` and edit the data.
2. Build simulations in `sims/` using `src/components/SimKit.tsx`.
3. Register the course in `src/courses/registry.ts`.
4. When real slides/past-exams arrive: one lesson per lecture, past-exam MCQs → `practice` (with full
   explanations + a `theory` line, tagged by lecture), written problems → `exam` with worked steps.
   Compare against the slide decks and fill any gaps. See [AGENTS.md §8](./AGENTS.md).

## The game layer

The hub is mission control: study streak with freeze tokens, GitHub-style activity heatmap,
account rank (Matricola → Rettore), daily quests, and a beer counter. Each focus course shows a
**readiness dial** (projected 18–30L grade) and an exam countdown. Ways to study:

- **Daily Mix** (`/mix`) — one button, ~20 cards interleaved across your focus courses (due
  reviews first, then rusty cards, then new), with a combo meter and bonus XP.
- **Skill path** (`/c/<id>/path`) — a Duolingo-style road: lesson → checkpoint → … → boss.
- **Boss fights** (`/c/<id>/boss`) — the exam as a procedural three.js boss (Lord Entropy, the
  Limit Wraith, Σ-Prime…). Correct answers deal damage (speed/combo bonuses, crits), misses cost
  hearts; a win is graded 18–30 e lode and earns a beer. Fights feed the same adaptive progress.
- **Rust** — mastered cards corrode after 10/21/42 days untouched; polishing them pays XP and
  keeps the readiness score honest. Achievements (Perpetuum Mobile, Entropy Slayer, Il Gufo…)
  celebrate the grind.

Season setup (gear icon on the hub) sets your focus courses, exam dates and the passed-course
trophy shelf.

## Roadmap

- [x] Hub + shared engine + design system + light/dark
- [x] Game layer: streaks, quests, rust, readiness, Daily Mix, skill paths, 3-D boss fights
- [x] Math Analysis II full course (8 modules: limits → differential → Taylor/optimization →
      multiple integrals → curves/fields → surfaces/flux → series → ODEs)
- [x] ESMM uncertainty exam drill (28 verified questions + 2 full budgets)
- [x] Cybersecurity full flashcard migration + practice-by-lecture
- [ ] Per-module Cyber lessons from the slide decks
- [ ] Fluid Mechanics, Industrial Plants, Manufacturing Processes, Safety
- [ ] Migrate the classic TMM site into this engine
- [ ] Code-split lucide icons to shrink the bundle
```
