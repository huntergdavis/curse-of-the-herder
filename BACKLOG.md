# Curse of the Herder — Backlog

Priorities: **P0** blocks the next phase · **P1** needed for launch ·
**P2** makes it good · **P3** someday. Research items are prefixed
`R-` and detailed in `docs/research/`. Prune this file; do not let it
become an archive.

## Current implementation priority — 2026-09-06 (evening)

Phases 1-3 and most of 4-5 are in. Next: tiers 9-12 content (in progress),
runtime robustness (worker, watchdog), self-hosted fonts, sound, and the
long soak.

## Done (kept for one release, then pruned)

- Map generator, autotile chunk renderer, camera, minimap, A*, distance fields
- Herder and sheep sim, rings, flee/absurd/repeat-escape, names
- Grammar engine, morphology, ban list, never-emit test, tiers 0-8 content
- Libraries and books (catalogue order, cooldown, register drift, excerpts)
- Frustration baseline, rain, walk of shame, breathers, speed governor
- IndexedDB saves, resume, New/Load, wall-clock catch-up, ?fast, ?clean
- Ending: epitaph, dusk fade, tombstone card, Hall of Herders, loop setting
- Pacing CLI, transcript CLI, Playwright smoke test in the deploy workflow

## P0 — Finish the language arc

- [ ] Tiers 9-12 (nautical, baroque, verse, meta) packs and structures. (fork in progress)
- [ ] Epitaph quality pass: only `tombstoneSafe`/short rules for the stone; test that epitaphs are ≤ 110 chars.
- [ ] Callbacks: 5% of idle lines reference an event from the ring ("This is the third river today.").
- [ ] Wistful line when passing a library while carrying ("I will come back for you, book.").
- [ ] Sheep-name lines when the *carried* sheep is named.
- [ ] Register-specific idle weighting so a fresh book audibly changes his voice for ten minutes (partly done via reg ×3).

## P1 — Runtime robustness (Phase 4 leftovers)

- [ ] Simulation in a Web Worker behind a versioned protocol.
- [ ] Liveness watchdog (pure predicate, 5 s cadence).
- [ ] Cap catch-up at 4 h and say something about having had a sit-down.
- [ ] Heap-slope check in a nightly 9-minute fast day; weekly true soak.
- [ ] Self-host Patrick Hand and Fredoka (OFL) and make the no-network test strict.
- [ ] Auto-update via version.json poll and a service worker.
- [ ] "Workday" FPS mode (15 FPS) and reduced-motion mode.

## P1 — Presentation

- [ ] Sheep walk animation while wandering; flee dash.
- [ ] Villages: signposts with names; a villager or two; smoke from chimneys.
- [ ] Better absurd-location staging: sheep drawn *on* the rock / mid-river with a "?" emote until approached.
- [ ] Tombstone rises beside the pen in the world (not only on the card).
- [ ] Pen fills with sleeping sheep in rows; night sky with stars during the fade.
- [ ] Export/Import of a herder and of the Hall as JSON.
- [ ] Settings panel (speed governor toggle, band cap, FPS mode).

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
