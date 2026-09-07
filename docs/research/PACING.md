# Pacing — making a board last nine hours

Target: a fresh herder started at 09:00 pens the last sheep at
18:00 ± 20 min on a typical board, with variance coming from map luck,
not from the clock. The board must also **degrade gracefully** when the
tab is hidden, the laptop sleeps, or the browser throttles timers.

## The arithmetic

Assume a 512×512 board (see below for why not 1000×1000). Herder speed
is 2 tiles/s on road, 1.5 grass, 1.0 farmland/forest, 0.6 mud/scree/
shallows, 0 water/cliff (pathfinds around). Carrying a sheep: ×0.8.

One sheep round-trip at distance *d* tiles (path length, not Euclidean):
`t ≈ d / 1.4 + d / (1.4 × 0.8) ≈ 1.6 d seconds` plus ~30 s of catch,
pen, and reading events.

Sheep are placed in **distance rings** around the pen so the day
escalates: early sheep are near, late sheep are far and awkward. With
60 sheep and mean path distance rising from 40 tiles (ring 1) to 260
tiles (ring 5):

| Ring | Sheep | Mean path d | Per-sheep time | Ring total |
| --- | --- | --- | --- | --- |
| 1 | 14 | 40 | ~95 s | 22 min |
| 2 | 14 | 90 | ~175 s | 41 min |
| 3 | 12 | 150 | ~270 s | 54 min |
| 4 | 12 | 210 | ~365 s | 73 min |
| 5 | 8 | 260 | ~445 s | 59 min |

That is ~4.2 h of walking. Add: reading 24 books (~35 min), flee events
(~20% of sheep flee once, +2 min each: ~25 min), absurd-location
retrievals (~10 sheep × 3 min), weather slowdowns, breathers, and the
ending sequence. ~6 h. The remaining ~3 h come from a **global speed
governor** that scales herder speed so the projected finish lands on
the 9-hour mark (details below). Keep the raw content at ~6 h so the
governor only ever *slows* the herder (a lingering herder reads as
"tired"; a sped-up one reads as a bug).

## Why 512 and not 1000×1000

A 1000×1000 board is a million tiles: fine for memory (1 MB as a
Uint8Array) but the herder at ~1.5 tiles/s would cover only ~50,000
tiles of *path* in a day, i.e. he would see 5% of the board. The board
would be big for the sake of a number. 512×512 keeps the camera moving
through varied terrain all day, every sheep is reachable in a
believable time, and the overview minimap is legible. If we want the
1000×1000 number for marketing, the map generator supports it behind a
`?size=1000` parameter and the ring radii scale with it.

## Time model

- **Simulation tick** = 250 ms of world time. The sim is a pure
  function `step(state, tick) → state` and runs in a Web Worker.
- **Wall clock is the truth.** Each tick records the wall time; on
  wake, catch up `floor(elapsed / 250 ms)` ticks, capped at 4 hours of
  catch-up (57,600 ticks, ~2 s of CPU). Beyond the cap, the day
  "pauses" and the herder says something about having had a sit-down.
- **Day clock** (the 09:00–18:00 fiction, sky color, shadows) is
  derived from *simulated* time, not wall time, so a herder started at
  14:00 still gets a full nine-hour day and a dusk ending.
- **Speed governor**: every 10 sim-minutes, estimate remaining work
  (sum of path lengths to remaining sheep, from the pen, via the
  precomputed distance field) and scale movement speed within
  [0.6×, 1.0×] to steer the projected finish toward 9 h. Never above
  1.0×; if he is behind, the day just runs long and the sky waits.
- The frustration meter feeds *into* the governor: an unhinged herder
  walks 10% faster (stomping), so late-day bursts feel earned.

## Screensaver behavior

- `document.hidden` → stop rendering, keep the worker ticking at 1 Hz
  wall-clock checkpoints; catch up on return.
- Browser timer throttling in background tabs (1/min in Chrome after
  5 min) is fine: catch-up handles it.
- Liveness watchdog every 5 s (borrowed from The Grind 2): if no tick
  in 20 s while visible, reset the worker from the last durable state.
- Memory budget: heap slope < 1 MB/h, verified by a 9-hour Playwright
  soak in CI (nightly, `?fast=1` compresses the day to 9 minutes for
  functional tests; the true-time soak runs weekly).
- Frame budget: 30 FPS while visible, with a "workday" mode (15 FPS,
  no particles) selectable for laptops.

## Measured (2026-09-07)

`npm run pace -- --seeds 5` on a 512 board: 8.15–8.77 h (median 8.4 h),
60/60 sheep every seed, 12–27 flights, frustration 70–92 at the end.
Raw content without the governor is ~5.5 h; the governor supplies the
rest. About 20 of 24 books get read.

## Research backlog

- **R-PACE-01** Build the offline pacing simulator (headless sim, no
  renderer) and run 1,000 seeds; report finish-time histogram.
- **R-PACE-02** Tune ring radii and sheep counts to a 6 h ± 30 min raw
  content median.
- **R-PACE-03** Governor stability: prove it cannot oscillate (hysteresis
  and a 10-minute update period).
- **R-PACE-04** Measure real browser throttling on Chrome/Firefox/Safari
  for hidden tabs and OS sleep; confirm catch-up math.
- **R-PACE-05** Decide the "overnight" rule: a herder left running past
  18:00 who finishes at 02:00 gets a night ending; a herder who is not
  finished by 24 h wall-clock gets a "gave up for the night" pause and
  resumes the next morning at the same in-game hour.
