# CLAUDE.md

**Read [AGENTS.md](./AGENTS.md) first — it is the full content & engineering standard.** This file is
the quick reference.

## What this is
Polito Tools: a Vite + React + TypeScript hub that teaches Politecnico di Torino mechanical-eng
courses end to end. Each course has three pillars — **Learn** (interactive lessons), **Practice**
(adaptive MCQs), **Pass** (exam problems). It must be enough to learn the course and pass without
lectures.

## Prime directive
**Teach, then test.** Lessons build intuition with simulations/figures/math; every question's
explanation teaches why each option is right/wrong; exam solutions show the method, not just the
answer. Correctness beats volume — verify every number and claim.

## Commands (run the build before any hand-off)
```bash
npm run dev      # http://localhost:5173 (HMR)
npm run build    # tsc -b (strict) + vite build — MUST pass
```

## Where things live
- Content model: `src/types.ts` (Course / Lesson / LessonBlock / Question / ExamProblem).
- A course = `src/courses/<slug>/index.tsx` (default-exports a `Course`) + `sims/`. Register it in
  `src/courses/registry.ts` (one line).
- Engines/pages: `src/pages/*`. Shared logic: `src/lib/*`. UI: `src/components/*`.
- Sims are built from `src/components/SimKit.tsx`.

## Must-dos
- Strict TS, **no unused imports/vars** (build fails otherwise).
- Stay within the existing `LessonBlock` kinds; don't invent page types.
- Light theme is default; use the CSS tokens (`--color-*`, `--accent*`, `--good/--bad/--warn/--info`),
  never hardcode dark-only colors. Sims must work in both themes and animate with rAF cleanup.
- MCQs: 4 plausible options, `correct` balanced across A–D, full `explanation` + `theory`, set `topic`
  to the lecture. Inline math `<Tex>{"..."}</Tex>`; block math via the `formula` block.

## Cyber data
`cybersecurity/cyber-cards.json` is generated from the classic site via
`node scripts/migrate-cyber.mjs`. Don't hand-edit it; change the source or the script and re-run.
