# Contributing

The most useful contributions are words and sentence shapes. The engine is
small; the comedy is in the lists.

## Adding words

Lexicon packs live in `src/data/lexicon/`. Every entry has a part of speech,
a filth band (F0 clean to F4 the f-word), the level it unlocks at (usually the
pack's), optional `targets` (who it can be aimed at), `reg` (register tags),
`lang` and a `gloss` for anything a reader might not know.

Before opening a pull request, read `docs/research/CONTENT_POLICY.md`. In short:
the herder is filthy, never cruel. No slurs of any kind, nothing ableist or
body-shaming, nothing gendered or sexual, no real people. Historical slang
needs checking: a lot of Grose is a slur wearing a hat. If a word's *origin*
is one of those things (dropkick, berk, whacker), leave it out even if it
sounds mild today.

Every entry must be a real word or an established phrase, or an obviously
deliberate coinage in a pack whose flavour is coinage (the nautical oaths).
Foreign words need correct spelling, diacritics, gender in the gloss, and
ideally a fluent reviewer.

## Adding sentence shapes

Templates live in `src/data/grammar/`. Slots are `#symbol.modifier#`; the
list of symbols and modifiers is at the top of `tiers-0-4.ts`. A template
must expand at its own tier from the words available at that tier (the tests
check this), must not hard-code a swear (use `#oath#`, `#swear#`,
`#intensifier#`, which are band-gated), and must aim only at sheep, terrain,
weather, the day, the Curse, books or the herder himself.

## Checking your work

```sh
npm run check                      # typecheck, tests (incl. the ban list and never-emit), build
npx tsx scripts/transcript.ts --seed yourname   # read a whole day
```

Read the transcript. If a line makes you wince rather than laugh, cut it.
