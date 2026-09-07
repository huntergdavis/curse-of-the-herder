# Changelog

## 1.0.1 — 2026-09-07

- The dog's legs trot again: its gait now follows the ground it actually covers each frame, with a longer stride.
- He faces the way he is going: vertical legs of a path keep the last left/right facing instead of drawing him looking right.
- The water trough in the pen looks like a trough (planks, legs, water with a glint) rather than a blue bar.

## 1.0.0 — 2026-09-07

The first release. A cursed herder gathers sixty sheep across a 576×576
seeded island over a real nine-hour day, learns to swear from twenty-nine
books in little free libraries (twelve registers, about 2,500 words and
1,000 sentence structures, no language model), and retires to a Hall of
Herders with his last words on a stone.

Highlights of the road to 1.0:

- Deterministic simulation with wall-clock catch-up, a speed governor, and
  a 600× test day in CI on every push.
- A Tracery-style grammar with morphology, filth bands × eloquence levels,
  registers weighted by what he has read, day-long repeat memory, and a
  ban list enforced at build time and by a never-emit test.
- Genuine public-domain excerpts from Grose, Shakespeare, Bierce, Rabelais,
  Molière, Cervantes, Burns, Marryat, Hemingway and Jerome K. Jerome; a
  crib-notes easter egg after *Dungeon Crawler Carl* ("Goddamnit, Donut!").
- Company on the hill: a sheepdog who helps once a day, a nemesis sheep,
  jailbreaks plotted in whispers, lunch theft, the neighbour Tom and his
  three obedient sheep (one bolts on his third pass), cows, hens, the
  Cursed Ram inn, signposts, the well, sticks, streaks, the Curse itself
  heckling and being answered, and a flyting duel with the notorious sheep.
- Seasons from the calendar, weather, wildlife, villagers who answer back,
  a memorial stone for yesterday's herder and a tombstone that rises at dusk.
- A minimap with a viewport reticle; click or drag to look around the
  island (a Map button on phones); the view glides back after two seconds.
- Menu: speed 1×–600×, language level cap, text size, contrast, motion,
  frame-rate cap (defaults to the display rate), end-of-day mode,
  export/import; `?stats=1` shows frame and draw times.
- Robustness: liveness watchdog, weekly soak, self-probing terrain chunks,
  and per-world renderer state reset (the fix for a sea-over-the-island bug
  caused by a puddle timer that survived from the previous herder).

Decided against, on purpose: sound, a service worker, a Web Worker for the
simulation, keyboard shortcuts.
