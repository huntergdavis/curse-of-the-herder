# Curse of the Herder

A no-input browser screensaver. A herder, cursed like Sisyphus to gather
his flock for all eternity, spends a nine-hour day carrying sheep home
across a vast tile map. He starts the morning barely able to grunt.
By evening, after finding books in little free libraries along the way,
he curses in Shakespearean iambs, Hemingway declaratives, Québécois
sacres and Rabelaisian catalogs. When the last sheep is penned he
retires to the Hall of Herders, and his final curse goes on his
tombstone.

No LLM. Every line comes from a deterministic grammar over thousands of
curated words and sentence structures. Filthy, never cruel.

**Play:** https://hunterdavis.com/curse-of-the-herder/ (pre-alpha teaser)

```sh
npm install
npm run dev
```

`npm run check` runs typecheck, tests and the production build; it is
the same gate the Pages deploy uses.

## Documents

- [PLAN.md](PLAN.md): product and technical plan, build phases.
- [BACKLOG.md](BACKLOG.md): prioritised work and the research index.
- `docs/research/`:
  [CURSE_PROGRESSION](docs/research/CURSE_PROGRESSION.md) ·
  [SENTENCE_GRAMMAR](docs/research/SENTENCE_GRAMMAR.md) ·
  [LEXICON](docs/research/LEXICON.md) ·
  [CONTENT_POLICY](docs/research/CONTENT_POLICY.md) ·
  [BOOKS](docs/research/BOOKS.md) ·
  [PACING](docs/research/PACING.md) ·
  [ART](docs/research/ART.md)
- [CREDITS.md](CREDITS.md): third-party assets and sources.

## How it works, briefly

- A 512×512 seeded board (water, farmland, forest, mountains, villages,
  roads) with about 60 sheep placed in rings around a central pen, so
  the day escalates.
- The herder pathfinds to a sheep, carries it back, repeats. Sheep flee.
  Some are on roofs. Frustration rises; it falls when he pens a sheep or
  sits down with a book.
- Two axes drive every line: **eloquence** (level 0–12, unlocked by
  books) and **frustration** (0–100, sets frequency and the filthiness
  ceiling). Filth caps at R-rated; eloquence goes to eleven.
- Real time drives the day. Close the laptop and he catches up when you
  return. Start a herder whenever; load any herder in progress.
- Rendered in plain Canvas2D from procedural vector terrain and CC0 SVG
  props, so it looks right on a 4K monitor and a small laptop.

Inspired by, and borrowing runtime lessons from,
[The Grind 2](https://github.com/huntergdavis/the-grind-2).

## License

Code: MIT (see `LICENSE`). Third-party art, fonts and word sources are
listed with their licenses in `CREDITS.md`.
