---
name: verify
description: Build, launch and drive the polito study hub to verify changes end-to-end (dev server + Playwright).
---

# Verifying polito changes

## Build gates (run before hand-off, not instead of driving)
```bash
npm run build     # tsc -b strict + vite build — must pass
npm run verify    # Excel engine (594) + labs (396) + SRS (32) checks
```

## Launch
```bash
npm run dev       # http://localhost:5173, HashRouter → routes live under /#/
npm run preview -- --port 4173 --strictPort   # production build + service worker (PWA tests need this)
```
PWA checks (offline, install, precache) only work against `preview` — the dev server has no SW.
For offline: load once, `await navigator.serviceWorker.ready`, wait ~4s for precache, then
`context.setOffline(true)` and reload. Courses are code-split; `useCourse` chunks resolve async,
so after navigation wait for actual content, not just DOM load.

## Drive (Playwright, no install needed)
Playwright + chromium are already cached — require it directly in a `.cjs` script:
```js
const { chromium } = require("/Users/maksym/.npm/_npx/88950a7d37a5e205/node_modules/playwright");
```
Browsers live in `~/Library/Caches/ms-playwright`. Use a 390×844 viewport to match phone usage.

## Gotchas
- All state is localStorage. Playwright contexts start clean — the user's real
  progress lives in their own Chrome profile and is never touched.
- To seed state: `page.goto(base + "#/")`, `page.evaluate` the `localStorage.setItem`
  calls, then `page.reload()` (hash-only `page.goto` does NOT reload the SPA, and the
  app caches store reads in memory).
- Storage keys: `polito:progress:<courseId>`, `polito:game:v1`, `polito:session:<courseId>`.
- Question ids (JSON-loaded courses): `<topicSlug>-q1…`, checkpoints `<topicSlug>-cp<blockIdx>`,
  scroll formula cards `<lessonId>:formula:<i>`.
- Hub focus cards show `meta.short` ("LAG", "Thermo", "Analysis II") in `h3`, not full titles.
- After a UI action that persists via useEffect (e.g. practice session save), wait ~600 ms
  before `page.reload()` or the write races the reload.
- Useful routes: `/#/c/thermodynamics/practice?mode=due`, `/#/c/<id>/learn/<lessonId>`,
  `/#/c/<id>/scroll`, `/#/c/<id>/path`, `/#/mix`.

## Flows worth driving
- Practice: answer → feedback + "Next review …" chip; reload → resume card on the menu.
- Lesson checkpoint ("Quick check"): click option → card created + game day activity increments.
- Scroll mode: formula card → Reveal → Known/Again → survives reload (hydrated from progress).
- Hub: focus cards, "N reviews waiting", quest board react to seeded progress.
