# Art Direction and Asset Research

Verified 2026-09-06 by fetching each license page; Kenney packs were
downloaded and inspected. Rule borrowed from The Grind 2: **license
approval attaches to the exact imported bundle, its hash, and the
snapshot date, not to a mutable web page.** Record all three in
`CREDITS.md` when an asset lands in `public/`.

## Direction

Carcassonne-meets-storybook: flat colours, soft rounded terrain
transitions, chunky readable silhouettes, a warm palette that shifts
across the day (cool dawn → bright noon → amber dusk → indigo night).
Resolution-independent: crisp on a 4K monitor, legible on a 1366×768
laptop. The herder should read as a small, put-upon man in a big hat.

## Decision: hybrid vector

**Terrain is procedural vector, ours.** Flat-colour tiles with
bitmask autotiling for rounded transitions (grass/water/farm/forest/
rock/snow), roads as bitmask path segments, rivers as spline strokes.
Drawn with Canvas2D primitives into chunk caches at display resolution,
so 4K is free and there is no license to track. Mountains and water,
the two gaps in every CC0 tileset we found, are solved by construction.

**Props and characters are SVG, CC0 where possible.**

| Need | Source | License | Notes |
| --- | --- | --- | --- |
| Trees, stumps, rocks, farm plots, barn, windmill, houses, church, tents, fenced pen | Kenney **Medieval RTS** (`medievalRTS_vector.svg`, 127 sprites) | CC0 | Best single vector match; also 24 static villagers |
| Snow / rock ground blobs (if not procedural) | Kenney **Map Pack** (SVG) | CC0 | |
| Wordless emotes: `…`, `!`, `?`, `Zz`, heart, idea, in 7 balloon shapes | Kenney **Emotes Pack** (`emotes_vector.svg`) | CC0 | Sheep and herder both use these |
| Panels, buttons, sliders for the Hall and settings | Kenney **UI Pack 2.0** | CC0 | SVG inclusion not yet verified; PNG at 2× is fine |
| Book glyphs, library glyph, HUD icons | game-icons.net ("Book cover", "Open book", "Book pile", "Bookshelf" by Delapouite and Lorc) | **CC BY 3.0** | Attribution required (text below) |
| **Sheep** (idle, walk, flee, carried, asleep) | **Original SVG, ours** | — | Ellipse body, head, four leg dots, 2-frame walk, 1 flee frame, 1 carried pose, 1 sleep pose. A sheep is the easiest animal to draw and we need 6 poses in a consistent style; drawing beats adapting |
| **Herder** (idle, walk ×4 dirs, carry, sit/read, stomp, arms-up curse) | **Original SVG, ours** | — | Circle head, big hat, tunic, crook. ~10 frames. Kenney's villager is the styling reference |
| Little Free Library box | Original SVG, ours | — | Post, gabled roof, glass door, 3 paint variants, open/closed |
| Tombstone, bench, stump, signpost | Original SVG or Medieval RTS | CC0 / ours | |
| Fonts | **Patrick Hand** (bubbles), **Fredoka** (HUD, Hall), **Caveat** (book excerpts, tombstone) | SIL OFL 1.1 | Self-host; keep `OFL.txt` beside the files |

### Fallback: all-pixel, all-CC0 (if the vector look fails or time runs short)

Kenney **Tiny Town** (terrain, forest, fences, signposts, village) +
**Tiny Farm** (farmland, barn, sheep, cow, straw-hat farmer as herder)
+ **Roguelike/RPG pack** (the only CC0 16 px water/shore tiles) +
**16×16 RPG Items DB32** (books, CC0) + Emotes pixel balloons +
**Pixelify Sans**. Nearest-neighbour, integer scale (×4 at 1080p, ×8 at
4K). Everything is CC0. Gap: mountains (use castle-stone or a
procedural mound). Sheep and farmer are single-frame; add 2-frame bob
ourselves.

### Rejected (do not import)

| Asset | Why |
| --- | --- |
| Sprout Lands (Cup Nooble) | Free tier is non-commercial, credit, **no redistribution**. A public repo is redistribution |
| Tiny Swords (Pixel Frog) | Custom license, no redistribution |
| Cainos Top Down Basic | Custom license, no redistribution |
| Cute Fantasy RPG (Kenmi) | Non-commercial, no redistribution |
| LPC Terrains, LPC Base, LPC ram | CC-BY-SA / GPL: usable, but share-alike contaminates derivative art. Avoid unless we need its animation |
| Pixel Adventure | CC0 but side-view platformer |
| Any 3D pre-render packs (GPL) | License and style |

Conditional: **LPC Style Farm Animals** (Daniel Eddeland, CC-BY 3.0 or
GPL 2.0) has proper walking and eating sheep. Use only if our original
sheep fails; requires attribution and a link.

## Attribution text (for `CREDITS.md`)

- "Art by Kenney (kenney.nl), CC0." (optional, but we say it.)
- "Icons made by Delapouite and Lorc. Available on
  https://game-icons.net (CC BY 3.0)." (required if used.)
- "Sheep sprites: 'LPC Style Farm Animals' by Daniel Eddeland, CC-BY
  3.0, https://opengameart.org/content/lpc-style-farm-animals"
  (required only if the fallback sheep are used.)
- Fonts: SIL Open Font License 1.1, `OFL.txt` shipped beside each font.

## Rendering plan

- Map stored as `Uint8Array` terrain ids plus a `Uint8Array` decoration
  layer; 512×512 = 512 KB. Never pre-render the whole board.
- **Chunk cache**: 32×32-tile chunks rendered to `OffscreenCanvas`
  (fallback `HTMLCanvasElement`) at display resolution, LRU of ~48
  chunks, pooled and reused, redrawn on zoom or palette shift (palette
  shift is a cheap `globalCompositeOperation` tint pass over visible
  chunks rather than a redraw).
- Camera follows the herder with a soft lead toward his target;
  integer-snapped draw offsets; DPR capped at 2.
- SVG props rasterised once per zoom level into an atlas via
  `createImageBitmap`, never drawn as `<img src=svg>` per tile.
- Plain **Canvas2D**, no PixiJS. ~2,000 visible tiles and a few dozen
  sprites do not need WebGL, and a 9-hour session does not need WebGL
  context-loss handling.
- Pause the render loop on `visibilitychange`; the sim keeps ticking in
  the worker.

## Research backlog

- **R-ART-01** Download and hash Medieval RTS, Emotes, UI Pack; confirm
  UI Pack ships SVG; record in `CREDITS.md`.
- **R-ART-02** Palette: 7 terrain colours × 5 times of day, checked for
  contrast against white sheep and the speech bubble at all five.
- **R-ART-03** Autotile bitmask study: 4-bit (16 shapes) vs 8-bit
  blob (47 shapes). Start 4-bit; upgrade if corners look boxy.
- **R-ART-04** Draw the sheep and herder SVG sets; test legibility at
  16 display px and 96 display px.
- **R-ART-05** Little Free Library and tombstone SVGs.
- **R-ART-06** Font loading: self-hosted woff2, `font-display: swap`,
  fallback stacks; measure bubble wrap at each font.
- **R-ART-07** Reference study of Carcassonne tile art, *Dorfromantik*,
  *Islanders*, and *Townscaper* for colour and silhouette (inspiration
  only; nothing copied).
