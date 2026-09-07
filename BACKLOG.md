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
- The Curse heckles from the start, rarely and dryly ("That was a sentence. Technically."), and every eight minutes once he is eloquent
- Loose sheep within earshot drift over to listen while he reads aloud, then stand there
- At dusk on the last sheep the neighbour passes once more and, for once, asks "sixty?" (`node scripts/shot-finale.mjs <dir>` runs a 600× day and screenshots the fade)
- Language quality: day-long rule memory (slot-free one-liners said once a day, ~96% distinct lines), longer recent-line window, no predicate "fucking", the Curse capitalised as a vocative, mismatched-noun rule fixed
- Yan Tan Tethera: the old dales sheep-count as grammar symbols (`#yantan#`, `#yantancount#`), used in pen lines from level 1 ("Yan, tan, tethera, methera. Old counting. Grandfather did it.")
- Cows: one per village and one by the pen, chewing and swishing, "moo" when he passes, and a line about them every twenty sim-minutes at most ("a cow, standing there with the confidence of a thing nobody has ever tried to carry")
- He answers the Curse back about half the time ("Say that to my face! You have no face! That is exactly my POINT!")
- The neighbour has a name (Tom, Alfred, Cuthbert…) used in lines, the first-pass toast and the end card; his sheep are Patience, Prudence and Also Prudence; the nemesis goes "hah" when he comes near; the Curse notices him talking to cows
- Lunch theft: three times in four a loose sheep within reach eats his bread and cheese halfway through lunch, chewing "nom" at him; a big frustration spike, lines at every level ("a creature with four stomachs and NO SHAME"), a toast and a Curse remark
- The thief is caught with its own lines ("You. Cheese breath. Up you come.") and named on the end card
- Hens by every third house: peck, scatter with a "!" when he comes within two tiles, drift back
- He takes the hens personally ("Even the HENS run from me. I have never so much as looked at a hen."), at most every fifteen sim-minutes; `npx tsx scripts/village-of.ts <seed>` prints village coordinates for camera screenshots
- Once a day after two o'clock the dog herds the sheep he is walking toward straight to him, darting behind it with a "hup!"; he does not know what to do with his face, the Curse did not authorise it, and there is a toast
- New mishap: the dog underfoot, flat out where his boot was going ("you have a whole county to lie down in and you chose my boots")
- The Almanac counts lunches eaten by sheep, days a dog did its job, herders with a nemesis, and the most frequent passer-by; named sheep in the Hall say why they were named
- The Cursed Ram: one house per village is the inn, with a swinging ram's-head sign; walking past it costs him ("That was the hardest thing I have done today and it is not yet noon"), at most once every half hour, and the Curse has checked he is not allowed in
- On the neighbour's third pass, Also Prudence bolts from the line and runs downhill; he is thrilled ("IT HAPPENS TO HIM TOO!"), the Curse tells him not to enjoy it, and there is a toast
- The neighbour stops dead for six seconds and calls after her, which is a new feeling for him
- He waves back at the neighbour, stiffly, whenever he passes within five tiles and his hands are free (`?wave=1` holds the pose; `?rival=1` now spawns him three seconds in, within waving distance)
- When he sits down, the dog sometimes fetches him a stick ("I asked for sheep and you have brought me KINDLING!")
- He throws the stick; the dog fetches it, the fastest it moves all day
- Level-ups are announced: a toast with the new level name, a line about the words arriving ("A new word arrives and the first thing I do with it is throw it at a hill"), and a Curse remark
- `node scripts/watch-toasts.mjs <url> [seconds]` logs every toast and herder line with the sim clock; `npx tsx scripts/probe-kind.ts` checks the renderer-hook kinds produce lines at level 0
- Signposts: he takes their certainty personally when he passes one ("It is a plank on a stick and it is more certain than I am")
- Mid-afternoon he stops at a village well for a drink ("Cold, honest, and utterly without alcohol, like everything else in my life"), once a day
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
