# Curse of the Herder — Backlog

Priorities: **P0** blocks the next phase · **P1** needed for launch ·
**P2** makes it good · **P3** someday. Research items are prefixed
`R-` and detailed in `docs/research/`. Prune this file; do not let it
become an archive.

## Current implementation priority — 2026-09-06

Phase 1: a board and a walk. See `PLAN.md`.

## P0 — Phase 1: a board and a walk

- [ ] Map generator: seeded noise → terrain classes (water, sand, grass, farm, forest, rock, snow, mud), rivers, roads to 3–5 villages, pen on flat grass near centre. `Uint8Array` storage. (`docs/research/ART.md`, `PACING.md`)
- [ ] Autotile renderer: 4-bit bitmask transitions, chunk cache (32×32 tiles, LRU 48, pooled `OffscreenCanvas` with fallback), camera follow with soft lead, DPR cap 2.
- [ ] Terrain cost grid + A* + distance field from pen.
- [ ] Herder state machine: target → path → walk → catch → carry → pen. Sheep placed by distance ring.
- [ ] Sheep SVG (idle/walk/carried) and herder SVG (idle/walk/carry) drawn and rasterised into an atlas. (R-ART-04)
- [ ] Headless pacing simulator CLI: `npm run pace -- --seeds 1000` → finish-time histogram. (R-PACE-01)
- [ ] World state schema v1 with `assertState`; save/load seed + tick to IndexedDB.
- [ ] Playwright smoke: `?fast=1` day completes; zero external network requests.
- [ ] Replace teaser `main.ts` with the module layout in `PLAN.md`.

## P0 — Phase 2: the mouth

- [ ] Grammar engine: symbol expansion, modifiers (`.a .pl .cap .3s .past`), band and level gating, weights, event rules, deterministic given `(seed, tick, ctx)`.
- [ ] Morphology tables: a/an by phoneme, plurals + irregulars, verb conjugation + `-eth/-est`, thou/thee/thy.
- [ ] Lexicon loader with `reviewedAt` gate; `banned.txt` + inflection regexes; build-time ban test.
- [ ] Never-emit test: 200k generations across all level × band combos; zero bans, zero over-ceiling, zero unlisted proper nouns.
- [ ] Repeat-rate test over a simulated day.
- [ ] Structure lint: reject templates with only one possible expansion.
- [ ] Tiers 0–4 structures (~670) and packs `primer`, `farmyard`, `insults-classic`, `similes`, `minced-oaths`, `pantheon`, `sheep-names`, `herder-names`.
- [ ] Frustration meter and curse scheduler (interval formula in `CURSE_PROGRESSION.md`), event-triggered lines with 3 s debounce.
- [ ] Canvas speech bubbles with wrap at 44 chars, two-bubble sequences for long lines, `aria-live` mirror.
- [ ] `?clean=1` (ceiling F1, badge) and `?filth=max` (test only).

## P1 — Phase 3: the library

- [ ] Little Free Library placement along predicted routes; loose books; waterlogged book.
- [ ] Reading beat: sit, 3–6 excerpts in the book's font, frustration −10, "Learned: N words, M structures" toast, register drift ×3 for 10 min.
- [ ] Book catalog (30 titles) with pack/grammar unlocks. (`docs/research/BOOKS.md`)
- [ ] Curation pipeline scripts for Grose and Farmer & Henley → review CSV. (R-LEX-01, R-LEX-02)
- [ ] Shakespeare harvest from Folger XML. (R-LEX-03)
- [ ] Foreign packs with native review before `reviewedAt`. (R-LEX-04)
- [ ] Tiers 5–8 structures and packs.
- [ ] PD confirmation per quoted title. (R-BOOK-01)

## P1 — Phase 4: the day

- [ ] Day clock 09:00→18:00 from sim time; 5-stop palette shift as a tint pass.
- [ ] Weather (rain, wind, fog) with movement and frustration effects.
- [ ] Events: absurd locations, flee, walk of shame, breathers, sheep names after second escape, 16-entry callback ring.
- [ ] Speed governor with hysteresis, 10-min update period, range [0.6, 1.0]. (R-PACE-03)
- [ ] Web Worker sim + versioned protocol; wall-clock catch-up capped at 4 h; liveness watchdog.
- [ ] IndexedDB repository (`herders`, `hall`, `settings`), sessionStorage mirror, save every 10 s and on beats, migrations chain.
- [ ] Toolbar: play/pause, New herder, Load herder dropdown, Export/Import JSON.
- [ ] Minimap with fog of war.

## P1 — Phase 5: the end

- [ ] Tiers 9–12 structures and packs (nautical, baroque-latinate, verse-rhymes with CMUdict pipeline, meta). (R-LEX-05)
- [ ] Epitaph grammar; `tombstoneSafe` subset review. (R-LEX-09)
- [ ] Ending sequence: still, epitaph, dusk, sleeping sheep, tombstone rise.
- [ ] Hall of Herders: immutable content-hashed records, view with 64-card cap, tombstone graphic, stats.
- [ ] Loop-at-end setting (loop / hold on Hall / stop); new herder dawn.

## P2 — Polish

- [ ] Auto-update (`version.json` poll, SW cache name check script).
- [ ] Workday FPS mode; heap slope test nightly; weekly true 9-hour soak.
- [ ] Sound, off by default: sheep, wind, grumble, page turn.
- [ ] Settings panel, keyboard shortcuts (space pause, N new, H hall).
- [ ] Bonus books (fungi, geology, anatomy, cookery, law, knitting).
- [ ] Flyting duel beat (herder vs. named sheep, alternating lines).
- [ ] Accessibility: reduced-motion mode, high-contrast bubble option, font-size setting.
- [ ] README screenshots and a 20 s GIF of a late-day rant.
- [ ] `?size=1000` board option; ring radii scale.
- [ ] Boundary-check script once `core/` stabilises.

## P3 — Someday

- [ ] Multiple herders on one board (a cursed family).
- [ ] Seasons: a herder started in December gets snow.
- [ ] Shareable "curse card" image export from the Hall (client-side canvas → PNG; download is user-initiated).
- [ ] Community lexicon contributions via PR with the curation checklist as a PR template.
- [ ] Localised UI (the herder stays English-first; his French is a feature).
- [ ] A sheepdog who is no help at all.

## Research backlog index

| ID | Topic | Doc |
| --- | --- | --- |
| R-LEX-01…10 | Lexicon sourcing, curation, rhymes, bans, balancing, tombstone subset, credits | `docs/research/LEXICON.md` |
| R-GRAM (structures) | Structure sources and tier deliverables | `docs/research/SENTENCE_GRAMMAR.md` |
| R-BOOK-01…05 | PD confirmation, excerpts, covers, library art, unlock pacing | `docs/research/BOOKS.md` |
| R-PACE-01…05 | Pacing sim, ring tuning, governor stability, throttling, overnight rule | `docs/research/PACING.md` |
| R-ART-01…07 | Asset hashing, palette, autotile, character SVGs, library/tombstone, fonts, references | `docs/research/ART.md` |
| Policy | Bands, bans, gray zone, enforcement | `docs/research/CONTENT_POLICY.md` |
| Progression | Levels, frustration, frequency, ending | `docs/research/CURSE_PROGRESSION.md` |
