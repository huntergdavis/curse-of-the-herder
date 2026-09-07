```
  ____ _   _ ____  ____  _____    ___  _____   _____ _   _ _____   _   _ _____ ____  ____  _____ ____
 / ___| | | |  _ \/ ___|| ____|  / _ \|  ___| |_   _| | | | ____| | | | | ____|  _ \|  _ \| ____|  _ \
| |   | | | | |_) \___ \|  _|   | | | | |_      | | | |_| |  _|   | |_| |  _| | |_) | | | |  _| | |_) |
| |___| |_| |  _ < ___) | |___  | |_| |  _|     | | |  _  | |___  |  _  | |___|  _ <| |_| | |___|  _ <
 \____|\___/|_| \_\____/|_____|  \___/|_|       |_| |_| |_|_____| |_| |_|_____|_| \_\____/|_____|_| \_\

                       S T A T U S   R E P O R T   ·   2 0 2 6 - 0 9 - 0 7
```

## Clock and frame rate

Frame rate: the draw takes 1–3 ms on a MacBook Air (7 ms outliers), so the game is never the limit; the browser decides how many frames it delivers (a low-power mode gives 30). The cap defaults to the display rate; the menu still offers 60/30/15 for battery. One tick is 250 ms of wall time at 1×, so the sim clock runs at real speed: 09:00 to 18:00 is nine real hours, a day that ends at 18:30 is 9.5 real hours. At 10× that is 57 minutes; at 100×, about 5.7 minutes; at 600× (the test speed), under a minute.

## Where we are

**Live:** https://hunterdavis.com/curse-of-the-herder/ — every push deploys through GitHub Actions (typecheck, unit tests, ban-list tests, a full 600× Playwright day), and every deploy in the last two days is green.

**The game is feature-complete against the original brief.** A cursed herder gathers sixty sheep across a 576×576 seeded island over a real nine-hour day, learns to swear from books in little free libraries (29 books, 12 registers, ~2,500 words, ~1,000 sentence structures, no LLM), and retires to a Hall of Herders with his last curse on a tombstone. New herder any time; herders in progress reload; export/import; menu with speed 1×–600×, language level cap, text size, contrast, motion, end-of-day mode.

| Area | State |
| --- | --- |
| Board, sim, pathing, pacing | Done. 576 board, governor lands the last sheep 17:56–18:33 (median 18:07) over six seeds. |
| Language engine | Done. Grammar with morphology, bands × levels, registers, day-long repeat memory (~96% distinct lines/day), ban list enforced at build and runtime. |
| Books | 29, including genuine PD excerpts (Grose, Shakespeare, Bierce, Rabelais, Molière, Cervantes, Burns, Marryat, Hemingway, Jerome) and the *Dungeon Crawler Carl* crib-notes easter egg ("Goddamnit, Donut!"). |
| Delighters | Dog, nemesis sheep, jailbreaks (plotted in whispers), lunch theft, the neighbour Tom and his three obedient sheep (one bolts on his third pass), cows, hens, the Cursed Ram inn, signposts, the well, sticks, streaks, the Curse heckling and being answered, level-up announcements, seasons, weather, wildlife, villagers, washing lines, the dusk finale. |
| Hall of Herders | Done. Tombstone, reading list with word usage, favourite word, nemesis, lunch thief, dog's one good deed, neighbour visits, highlights, Almanac across herders. |
| Mobile | Done. Header collapses; verified at 390×844. |
| Minimap | Viewport reticle; click or drag to look around; two-second hold, then a glide back. Hidden on narrow phones. |
| Robustness | Liveness watchdog, wall-clock catch-up (capped 4 h), weekly soak, heap floors, and (today) self-probing terrain chunks with two fallback modes. |

## Fixed today (bug report round)

- **Sea over the whole island after a long day.** Root cause (confirmed by pixel readback on a second herder at 1×): the puddle layer's "seconds since rain" used a last-rain tick the renderer kept from the previous herder; a new world starts at tick 0, so wetness came out about 50 instead of at most 1 and every 23rd grass tile got an opaque blue ellipse fifteen tiles wide. Overlapping along the tile pattern they read as screen-width diagonal strips, and they shrank as the day's ticks caught up. Per-world renderer timers are now reset when a herder starts, and wetness is clamped. Along the way the terrain chunk layer also gained self-probing, surface reuse and fallback modes; those stay as defence in depth.
- **Day ended at 17:30.** Board 512 → 576 and a steeper governor.
- **Memorial stone text ran off the stone.** The previous herder's epitaph on the stone by the pen wrapped by character count, not width. It is now measured against the stone, wrapped to at most four lines with an ellipsis, and clipped to the stone shape; the stone is a little larger.
- **The dog.** At 100× it could not keep up (its ease ran per frame, blind to sim speed); it now eases in real time scaled by the speed and snaps to heel if left behind. Its bubbles came out of the wrong end when it faced left; they now come from the head on whichever side it faces. It has a snout and a floppy ear, so it no longer reads as a cat.
- **Looking around.** The minimap shows the viewport as a reticle; click or hold-and-drag on it to look anywhere on the island, and the view glides back to the herder two seconds after release. Covered by a Playwright test.
- `scratch/` is ignored by git.

## Backlog (re-cut 2026-09-07, evening)

```
 P0  Must be right for a screensaver that runs all day
     [ ] Confirm on the Air: a full day, then a second herder, no sea over the island (fix deployed)
     [x] Frame rate: was pinned at 30 by the browser on the Air; the cap now defaults to "display rate"
         (60, 120 Hz…) and ?stats=1 shows what the browser delivers vs what we draw. Draw is 1–3 ms.
     [x] Memorial stone text stays on the stone
 P1  Things a viewer will notice
     [x] Phones get the look-around: a Map button in the toolbar pops a larger minimap; drag to look
     [ ] Language: cut weakest templates per release; `self` facet for "I am #adj#"
     [ ] Flyting as a real duel (needs a new shape now the dots are gone)
     [ ] Tombstone rising in the world during the end fade
     [ ] Sheep walk animation while wandering; flee dash
 P2  Nice to have
     [ ] README screenshots and a 20 s GIF
     [ ] A second Jerome-style book for levels 7–8
 Decided
     Sound: never.  P3: removed.  Web Worker: not planned.
     Service worker: dropped (too complicated for what it buys).  Keyboard shortcuts: skipped.
```

## How to check things

- `npm run check` — typecheck, unit tests, ban tests.
- `npx tsx scripts/transcript.ts --seed X` — a whole day as a script.
- `npx tsx scripts/pace.ts --seeds 6` — how long a day takes.
- `node scripts/shot-day.mjs <url> <dir> 230 10` — screenshots through a 600× day and into the next herder.
- URL hooks: `?fast=N ?new=1 ?seed= ?books=N ?rival=1|4 ?read=1 ?rest=1 ?drink=1 ?wave=1 ?weather=rain|fog|wind ?season= ?clean=1`.
