# Curse of the Herder — Product and Technical Plan

## North star

A no-input browser screensaver you start at nine in the morning. A
cursed herder gathers his scattered flock across a large tile map and
carries them home one at a time. He is bad at swearing when the day
begins and magnificent at it by the time he pens the last sheep at six.
Then he dies, a tombstone rises with his final curse on it, he enters
the Hall of Herders, and a new herder wakes up tomorrow. Sisyphus with
sheep.

The thing people come back to their desk for is *the next line*.

## Product constraints

- **Client-side only.** Static files on GitHub Pages at
  `https://hunterdavis.com/curse-of-the-herder/`. No server, no
  telemetry, no network calls after load except the version poll.
- **No LLM.** All language is a deterministic grammar over curated word
  lists (`docs/research/SENTENCE_GRAMMAR.md`, `LEXICON.md`).
- **No human input required.** Every screen is watchable; all controls
  are optional. Starting a new herder or loading one in progress is a
  two-click toolbar action.
- **Nine hours.** The day is paced to the workday (`docs/research/PACING.md`).
- **Runs all day without degrading.** Flat memory, catch-up after
  sleep, watchdog recovery, auto-update when a new build ships.
- **Funny and appropriate.** R-rated comedy, never cruelty
  (`docs/research/CONTENT_POLICY.md`). A colleague passing your monitor
  laughs or shrugs; nobody is hurt.
- **Resolution-independent.** Vector art and procedural terrain; crisp
  at 4K and on a small laptop (`docs/research/ART.md`).
- **Open and attributable.** MIT code; CC0/CC-BY/OFL assets with exact
  bundle hashes in `CREDITS.md`.

## What carries forward from The Grind 2

Copied outright (with paths in that repo for reference):

- Deploy: Vite `base: "/<repo>/"`, `npm run check` gate, Pages
  workflow (`.github/workflows/pages.yml`).
- **Stateless keyed RNG**: `randomUnit(seed, domain, entity, tick,
  purpose)` from `src/core/rng.ts`. Every roll reproducible; no RNG
  state to save.
- **Sim in a Web Worker** behind a versioned message protocol; the
  render thread never touches world state.
- **Wall-clock catch-up** on tab return, capped; **liveness watchdog**
  with a pure `shouldRecoverRuntime()` predicate.
- **Bounded history everywhere** (ring buffers for events, curse log,
  callbacks). Heap slope budget < 1 MB/h.
- **Level as a derived invariant**, validated on load.
- Explicit per-version **save migrations** funnelling into one
  `assertState()`.
- IndexedDB for saves with a sessionStorage mirror; export/import JSON.
- Auto-update: poll `version.json`, persist, reload; loop guard.
- Playwright "zero network requests" guard and a DPR-2 readability
  test.
- Strict `tsconfig`, co-located Vitest tests, no lint tooling.

Deliberately **not** carried: PixiJS (Canvas2D is enough), the local
narrator model, the side-scrolling travel corridor (we have a real
tile camera), the binary event ledger, and a 500 KB append-only
backlog (ours gets pruned).

## The viewing experience

**Main view.** A camera follows the herder across the board at ~24
visible tiles wide on a laptop, ~60 on 4K. Speech bubbles appear over
his head in a hand-drawn font; sheep use wordless emote balloons.
A slim HUD shows the day clock (09:00→18:00), flock count, level name,
books read, and the frustration meter drawn as a slowly reddening
sheep. A minimap in a corner shows the pen, discovered libraries, and
sheep he has *seen* (fog of war for the rest).

**Beats.** Finding a sheep, catching it, the sheep fleeing, an absurd
location ("It is on the roof. Why is it on the roof."), a library,
reading (60–120 s, calm, excerpts shown), penning, rain, the
walk of shame, breathers, dusk, the ending.

**The ending.** Last sheep penned → epitaph generated → 30 s dusk →
tombstone rises → Hall induction card → 60 s later a new herder wakes
at dawn (configurable: loop, hold on Hall, or stop).

**Hall of Herders.** A view listing retired herders newest-first with
name, date, seed, sheep count, books read, curses uttered, vocabulary
size, longest sentence, favourite word, and the epitaph carved on a
tombstone graphic. Capped display of 64 with a hidden-count line.

**Toolbar.** Play/pause, New herder, Load herder (dropdown of in-progress
herders labelled "Name · Lv N · 43/60"), Hall, Settings (speed governor
on/off, clean mode, workday FPS mode, loop-at-end), Export/Import.

## Core architecture

```
src/
  core/        pure, deterministic, worker-safe
    rng.ts            keyed stateless RNG
    map/              generation, autotile bitmasks, distance fields
    sim/              step(state, tick), herder AI, sheep AI, weather, governor
    lang/             grammar engine, morphology, lexicon loader, bans
    progression.ts    erudition → level; frustration meter
    state.ts          WorldState schema, assertState, migrations
  worker/      simulation.worker.ts + protocol.ts + client.ts
  render/      Canvas2D chunk cache, camera, sprites, bubbles, HUD, minimap
  ui/          toolbar, hall, settings, toasts (DOM)
  persist/     IndexedDB repository, sessionStorage mirror, export/import
  update/      version poll + service worker
data/
  lexicon/     *.jsonc packs with curator/reviewedAt headers; banned.txt
  grammar/     tier-NN.json structures
  books/       catalog.json + excerpts
tests/         Playwright specs (fast-day, soak, no-network, readability)
```

### Canonical simulation

`step(state: WorldState, tick: number): WorldState`, pure. 250 ms ticks.
Owns: herder position/intent, carried sheep, sheep positions and moods,
frustration, erudition, weather, day clock, event queue, curse
scheduling (which *rule id* fires when; the surface text is generated on
the render side from the same seed so the worker message stays small).

Herder AI is a small state machine: `choose_target → path → walk →
catch (may fail: flee) → carry → pen → (detour to library | breather)`.
Pathfinding is A* over the terrain cost grid with a precomputed
distance field from the pen; sheep selection is nearest-by-path with
the ring schedule from `PACING.md` biasing outward over the day.
Anti-stall rules adapted from The Grind 2's forward-motion module:
never immediately backtrack, never re-target a sheep that fled in the
last 60 s unless it is the last one.

Sheep AI: wander within a leash, graze, occasionally flee when the
herder is within 3 tiles (probability by sheep temperament and hour of
day), get stuck in absurd locations chosen at generation time.

### Language engine

`generate(ruleSet, lexicon, ctx, seed) → string` where `ctx` carries
level, frustration band, register weights, target, recent-events ring,
signature word, in-game time. Runs on the render thread (it is pure
and cheap) so bubbles can be re-rendered on resize without asking the
worker. The **ban list is enforced at build time** (CI test) and at
runtime as a last-resort filter that swaps a hit for the signature
word and logs a console error.

### Map generation

Seeded value/simplex noise for elevation and moisture → terrain
classes; hydraulic-lite river tracing; a road network from the pen to
3–5 villages via least-cost paths; villages are prop clusters; fields
are rectangles snapped to the road; the pen sits near the centre on
flat grass. Sheep placed by distance ring on walkable tiles; libraries
placed by the pacing algorithm in `BOOKS.md`. Everything derives from
the 128-bit seed so a save is small and a board is reproducible.

### Rendering

Canvas2D. Terrain chunks 32×32 tiles cached at display resolution with
an LRU of ~48, pooled. Palette shifts with the day clock via a tint
pass. SVG props rasterised per zoom into an atlas. Sprites drawn from
the atlas with integer-snapped offsets. Bubbles are canvas-drawn (so
they scale with the map) with DOM fallback for accessibility (an
`aria-live` region mirrors the current line). Target 30 FPS; "workday"
mode 15 FPS; 0 when hidden.

### Persistence

IndexedDB `curse-of-the-herder`, stores `herders` (in-progress world
states, keyed by id), `hall` (immutable induction records, content
hashed), `settings`. Save after every 40 ticks (10 s) and on every
event beat and before update reload; sessionStorage mirror for same-tab
durability. `schemaVersion` on every record with a migration chain.
Export/import of one herder or the whole Hall as JSON.

### Runtime governor

Watchdog every 5 s; catch-up on `visibilitychange`; speed governor
steering finish time (never above 1.0×); FPS mode; auto-update poll
every 60–75 min.

## Build phases

### Phase 0 — Scaffold (done)
Repo, Vite/TS, Pages workflow, teaser canvas, RNG module + tests.

### Phase 1 — A board and a walk (1–2 weeks)
Map generator, autotile renderer with chunk cache, camera, A* herder
walking to sheep and back to a pen, sheep as SVG. Pacing simulator
(headless) prints finish-time histograms. Save/load of a world seed +
tick. Playwright `?fast=1` smoke test.

### Phase 2 — The mouth (2–3 weeks)
Grammar engine + morphology, tiers 0–4 with lexicon packs `primer`
through `minced-oaths`, frustration meter, curse scheduler, canvas
speech bubbles, ban-list CI test, never-emit test, `?clean=1`.

### Phase 3 — The library (2 weeks)
Little Free Libraries on the map, book catalog, reading beat with
excerpts, pack unlocking, register drift, tiers 5–8 packs (Grose,
Bard, polyglot, Hemingway) with the curation pipeline and
`reviewedAt` gating.

### Phase 4 — The day (2 weeks)
Day clock and palette shift, weather, breathers, walk of shame, absurd
locations, sheep names and callbacks, speed governor, worker + catch-up
+ watchdog, IndexedDB persistence, New/Load herder UI.

### Phase 5 — The end (1–2 weeks)
Tiers 9–12 (nautical, baroque, verse, meta), epitaph grammar,
tombstone-safe subset, dusk ending, Hall of Herders, loop-at-end.

### Phase 6 — Polish and soak (ongoing)
Full 9-hour soak in CI weekly, heap slope check, auto-update, settings,
accessibility pass, sound (optional, off by default: sheep, wind, a
grumble), README screenshots, launch.

## Quality gates (`npm run check`)

typecheck → unit tests (grammar exhaustiveness, ban list, morphology,
rng, migrations, pacing invariants) → build → Playwright fast-day
smoke. Nightly: 9-minute fast day with heap sampling. Weekly: real
9-hour soak. Every lexicon file must have `reviewedAt`; every grammar
tier must pass structure lint; the never-emit test runs 200k
generations.

## Principal risks and controls

| Risk | Control |
| --- | --- |
| The jokes are not funny | Writing sprints with three readers; keep top 60%; ship the pacing sim so we can *read* a whole simulated day as a transcript and edit it like a script |
| Something offensive slips through | Ban list + never-emit test + no "person" target category + per-file review dates + `?clean=1` |
| Repetition over nine hours | Repeat-rate test (p > 0.999 no identical sentence per day), callbacks, signature word, register drift |
| Foreign-language errors | Native reviewer per pack before `reviewedAt` is set |
| The day does not last nine hours | Pacing sim over 1,000 seeds; governor; content sized to ~6 h so the governor only slows |
| Browser sleep/throttling breaks the day | Wall-clock catch-up with cap; watchdog; weekly soak |
| Memory creep | Ring buffers, pooled chunk canvases, heap slope budget in CI |
| Asset license drift | Hash + date per bundle in `CREDITS.md`; rejected list in `ART.md` |
| `main.ts` becomes 5,000 lines | Module boundaries above; a boundary check script like The Grind 2's once `core/` stabilises |

## First implementation target

Phase 1: a 512×512 seeded board, rendered with cached chunks and a
following camera, where a herder A*-walks to the nearest of 60 sheep,
carries it to the pen, and repeats, with a headless pacing report that
says how long that takes. No words yet. Words are Phase 2, and they
will be worth the wait.
