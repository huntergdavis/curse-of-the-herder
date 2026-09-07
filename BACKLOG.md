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
- Ending: epitaph, dusk fade, stars, tombstone by the pen and on the card, Hall of Herders, loop setting
- Tiers 9-12 (nautical, baroque, verse, meta), callbacks, wistful book lines
- Language selector (full/mild/clean), Export/Import JSON, ?books=N, ?fps=N
- Liveness watchdog, capped catch-up with a "long sit-down" line, self-hosted OFL fonts
- Roof sheep, village names on signposts, flyting follow-ups, quoting books back at the day
- Quiet screensaver mode, ?cam dev parameter, memory soak script, full-day end-to-end test
- Chimney smoke, birds, bleats, snoring flock, stomp dust, sitting by the stone
- Automatic update (version.json), pack-level word gating fix (124 → 2,338 words)
- Hotter/earlier language (stinger pack, faster interval, earlier bands), reading lists with taught words, REAL_BOOKS map
- Menu (New, Hall, Load, Language, end-of-day, Speed 1-100x, fps, Export/Import), mobile layout
- Word-usage tallies in reading lists, genuine PD excerpts (Grose, Shakespeare, Bierce, Rabelais), river sheep, hourly diary, names over notorious sheep, weekly soak workflow
- Scandalised villagers by the wells, favourite word on cards
- Delights: rainbow after rain, fireflies and moon at dusk, sunset band, butterflies, ducks, puddles, whistling and hullos, mud footprints, sun-drifting shadows, trembling meter, name toast, yesterday's stone by the pen, signature-word gags, sneezes
- Mishaps that spike his anger: bog, nettles, stubbed toe, cowpat, molehill, wasp, biting sheep, jammed gate (each with lines and a pose)
- Calmer emotes (no more strobing flock at the end), hot moods favour the strongest allowed words
- Lexicon realness audit (removed hidden slurs and body mockery, fixed glosses, fenced descriptors by target, added genuine bite); dusk flicker fixed with a measured test
- Engine: `.allit` alliteration slots (tier 9 generates its own runs), `.sylN` syllable slots (haiku that scan), `#selfadj#` for first-person lines
- The sheepdog: follows, lies down, chases butterflies, bolts from wasps, barks once at runaways; lines about him
- First words at dawn, crown for thrice-escaped sheep, dog on Hall records, Burns bonus book
- Sheep temperaments (dozy, curious, stubborn), the crook breaking once a day, sheep of the day, wind weather
- Lunch beat, frustration arc rebalanced (mean 28 at 09:00 to 87 at 17:00), English-only verb slots, ?weather pin
- Boulder sheep, the black sheep, miscounting, reduced-motion and text-size settings, culinary pack and bonus books (Cook's Oracle, Geology, Burns, Bierce, Rabelais), Molière and Cervantes lines, CONTRIBUTING and PR template
- Milestone beats (halfway, ten to go, one to go), named sheep on Hall records, rule-recency variety control
- Herder flourishes by level (book, quill, scarf, spectacles, laurel), legal and knitting registers, high-contrast bubbles, `.own` register slots
- Villagers answer back, dog thoughts, dawn forecast, anatomy and fungi books, cloud shadows, book ban-list test
- Delighters round: arrival hop and cheer, dog at his feet at the end, shooting stars, shouting mouth, signature word in red, gossiping sheep, frogs, dusk hedgehog, swinging gate
- Tired stoop, dusk lantern, hay and trough in the pen
- Scarecrows with remarks, owls, ducklings, grazing sheep, jumping fish, rabbits that bolt, vocabulary pop
- Hall Almanac across herders, Marryat line, washing lines, roof cats, village bell
- Highlights of the day on cards, milestone cheers
- Seasons from the calendar (palette, snow, breath, lines), a word for yesterday's herder at dawn
- Seasonal touches: snowmen, huddled winter flock, autumn leaf fall, spring lambs, summer 'phew'
- Jailbreak with wanted poster, the wind steals his hat, language audit fixes (uncountables, .own registers, foreign leakage)
- The Curse's dry remarks from level 10, hat lines, bats after dark, French miscounting
- Streaks he does not trust, rereads, weather-lifting lines, villagers with brooms, toasts visible in quiet mode
- Streak-broken payoff line when a run of five or more ends, with a Curse remark; escapees get a "recaptured" line when caught again and an "(again)" name tag while loose; jailbreak count on the Hall card
- Nemesis arc: the first sheep to bolt three times is declared the enemy ("Everyone else is a sheep. You are a project."), gets a triumph line and a Curse remark when finally caught, and is named in the hourly diary
- The rival: every couple of hours a neighbour in a blue coat strolls past with three sheep that follow him in a line, waving; our herder seethes at every level ("Three sheep. He has three sheep and a smile. I have sixty and a hernia."), the Curse remarks, `?rival=1` forces one for screenshots
- Jailbreaks are plotted first: the sheep whispers "psst" to its neighbours for half a minute before it goes, called off if the herder wanders back
- Pacing CLI, transcript CLI, Playwright smoke test in the deploy workflow

## P0 — Language polish

- [ ] Read a full simulated day as a script (`npx tsx scripts/transcript.ts`) once per release and cut the 10% weakest templates.
- [ ] Template audit to match the lexicon audit: slots like "I am #adj#" should draw adjectives that apply to a person (add a `self` target facet).
- [ ] Per-register heat rules (Hemingway exempt already; verse should keep its own punctuation).
- [ ] Flyting as a real duel: the sheep's emotes should escalate (…, !, ?!) and the herder should react to them.

## P1 — Runtime robustness (Phase 4 leftovers)

- [ ] Simulation in a Web Worker. Decision: not planned. At 1× the sim is negligible on the main thread; a long catch-up is budgeted at 1,500 ticks per frame and janks for a few seconds once. Revisit only if a real device shows the sim itself (not rendering) on the profile.
- [ ] Heap-slope check in a nightly 9-minute fast day; weekly true soak. (Weekly soak exists and passes.)
- [ ] Frame time on a real GPU browser: headless software rendering at 1080p measures ~167 ms/frame regardless of effects (fog +50 ms, wind +33 ms), i.e. the base full-screen passes dominate; effects are cheap. Measure on hardware with `node scripts/frame-time.mjs`; if a laptop struggles, the Eco frame-rate setting is the lever, and the fog gradient could become a cached image.
- [ ] Auto-update via version.json poll and a service worker.

## P1 — Presentation

- [ ] Sheep walk animation while wandering; flee dash.
- [ ] Tombstone rises beside the pen in the world (not only on the card).
- [ ] Pen fills with sleeping sheep in rows; night sky with stars during the fade.
- [ ] Export/Import of a herder and of the Hall as JSON.
- [ ] Settings panel (speed governor toggle, band cap, FPS mode).

## P2 — Polish

- [ ] Auto-update (`version.json` poll, SW cache name check script).
- [ ] Workday FPS mode; heap slope test nightly; weekly true 9-hour soak.
- [ ] Sound, off by default: sheep, wind, grumble, page turn. (Decision so far: it is a silent screensaver; revisit if asked.)
- [ ] Settings panel, keyboard shortcuts (space pause, N new, H hall).
- [ ] Flyting duel beat (herder vs. named sheep, alternating lines).
- [ ] README screenshots and a 20 s GIF of a late-day rant.
- [ ] `?size=1000` board option; ring radii scale.
- [ ] Boundary-check script once `core/` stabilises.

## P3 — Someday

- [ ] Multiple herders on one board (a cursed family).
- [ ] Shareable "curse card" image export from the Hall (client-side canvas → PNG; download is user-initiated).
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
