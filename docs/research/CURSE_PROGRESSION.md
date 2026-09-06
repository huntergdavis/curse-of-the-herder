# Curse Progression — the 9-hour arc

The whole game is one joke told over nine hours: a man who cannot swear
learns to swear beautifully, and the better he gets at it the worse his day
is going. Everything else (map, sheep, books) exists to pace that joke.

Two independent axes drive every line the herder says:

| Axis | Driven by | What it changes |
| --- | --- | --- |
| **Eloquence** (Level 0–12) | Books read, sheep penned, hours elapsed | Which grammar tiers and lexicon packs are unlocked; sentence length; register (caveman → Shakespeare → Hemingway → polyglot baroque) |
| **Frustration** (0–100 meter) | Distance walked, sheep that flee, terrain, weather, time since last success | Curse *frequency*, *filthiness ceiling*, punctuation intensity, bubble size, how "unhinged" the delivery is |

The two axes are deliberately decoupled. A calm Level 10 herder produces a
polished, quotable, PG-13 barb. A furious Level 2 herder produces
`"MUD. MUD! WHY MUD."` A furious Level 12 herder produces the good stuff.

## Levels

Roughly one level every 40–45 minutes of the day. Level is a **derived
value** (like The Grind 2's `level = f(xp)`), computed from an "erudition"
score, never stored independently:

```
erudition = 100 * booksRead + 8 * sheepPenned + 3 * hoursElapsed
level     = clamp(floor(erudition / 150), 0, 12)
```

Books dominate: about 13 books read over the day (of 24 boxes placed) is
one level every ~45 minutes. A herder who never finds a book still reaches
level 3 from sheep and hours alone.

| Lvl | Name | Register | Sample (calm) | Sample (furious) |
| --- | --- | --- | --- | --- |
| 0 | Grunting | Single words, no verbs | `Sheep.` | `MUD!` |
| 1 | Two Words | Noun + adjective/interjection | `Bad sheep.` | `STUPID HILL!` |
| 2 | Simple Sentences | Subject–verb–object, exclamations | `This sheep is heavy.` | `I hate this sheep!` |
| 3 | The Comparative | Similes, "as X as Y", intensifiers | `You are as slow as wet bread.` | `You woolly, mud-brained lump of regret!` |
| 4 | Vocative Fury | Direct address, compound insults, minced oaths | `Hear me, O Sheep: you are a disappointment.` | `Blast and bother, you thrice-cursed fleece!` |
| 5 | Grose's Vulgar Tongue | 18th-century slang, historical profanity, mild modern swears unlocked | `You gormless, addle-pated clodhopper.` | `Bloody hell, you bracket-faced bleater!` |
| 6 | The Bard | Shakespearean insults, iambic fragments, "thou/thee" | `Thou art a boil, a plague-sore, on my noon.` | `Away, thou crusty batch of nature! Zounds!` |
| 7 | Polyglot | French, German, Italian, Spanish, Yiddish, Scots, Québécois code-switching | `Sacrebleu, another one in the river.` | `Tabarnak! Merde! You absolute *Schafskopf*!` |
| 8 | Hemingway | Terse declaratives, repetition, understatement, dark irony | `The sheep was on the cliff. It was a bad cliff. I went up.` | `I carried it. It bit me. That is all there is to say about sheep.` |
| 9 | Nautical & Alliterative | Captain-Haddock-style oath chains, alliteration, spoonerisms | `Ten thousand thundering typhoons.` | `Blistering barnacles and bilious, bloviating bellwethers!` |
| 10 | The Baroque | Periodic sentences, nested subordinate clauses, Rabelaisian catalogs (lists of 7–12 nouns) | `Were I, at the ending of this most grievous afternoon, to compile a ledger of my woes…` | `…you—yes, you, the one with the burr in your left ear—would occupy pages one through forty.` |
| 11 | Verse | Limericks, haiku, couplets, curses that scan | `There once was a ewe on a crag / whose descent was a bit of a drag…` | (limerick that ends on a legal, filthy word) |
| 12 | The Unhinged Laureate | All of the above, mixed mid-sentence; meta-curses about cursing; direct address to the Curse itself | `O Curse, you have made me articulate and given me nothing to say it to but sheep.` | *(the tombstone line)* |

Register is a *palette*, not a rule: at Level 8 the generator draws mostly
from the Hemingway grammar but still has everything below it available, so
the day keeps its texture rather than switching genres on the hour.

## Frustration

A 0–100 meter with fast attack and slow decay.

Rises on:
- every 40 tiles walked while carrying (`+1`)
- a sheep fleeing when approached (`+6`)
- a sheep found somewhere absurd (cliff ledge, mid-river, on a roof) (`+8`)
- crossing mud, shallow water, scree (`+2` per tile)
- rain (`+0.5`/min), dusk approaching with sheep still out (`+0.2`/min after hour 7)
- passing the pen while carrying *nothing* (`+3`, "the walk of shame")
- the same sheep escaping twice (`+12`, and it earns a name, e.g. "Gerald")

Falls on:
- penning a sheep (`−15`)
- reading a book (`−10`, and a *calm* line: he reads aloud a fragment)
- sitting down at a bench/stump for a "breather" event (`−5`)
- naturally, `−1`/min

Frustration bands map to filthiness ceilings (see `CONTENT_POLICY.md`):

| Frustration | Band | Filthiness ceiling |
| --- | --- | --- |
| 0–19 | Muttering | F0 (clean) |
| 20–39 | Grumbling | F1 (minced oaths: blast, dang, confound it) |
| 40–59 | Cursing | F2 (mild: damn, hell, bloody, crap, arse) |
| 60–79 | Swearing | F3 (strong: shit, bastard, piss, bollocks) |
| 80–100 | Unhinged | F4 (the f-word and its inflections, cataloged compounds) |

Both axes gate a word: a Level 3 herder at 95 frustration still cannot say
the f-word because he has not learned it yet (it arrives with a Level 5
book). A Level 12 herder at 10 frustration will not either; he's calm.
Filthiness rises *slower* than eloquence on purpose: the comedy is a man
who can construct a perfect periodic sentence and chooses to end it with
"you absolute bollock."

## Curse frequency

```
baseInterval = 90s
interval = baseInterval * (1.15 - frustration/100) / (1 + level/12)
```

Level 0 calm: about one line every 100 s. Level 12 unhinged: about one
every 7 s, with a hard floor of 5 s so the screen never becomes a wall of
text. Event-triggered lines (sheep flees, book found, sheep penned) bypass
the interval but respect a 3 s debounce.

## The ending

When the last sheep is penned:

1. The herder walks to the center of the pen and stands still.
2. Frustration is pinned to 100 and level to 12 for one final generation:
   the **Epitaph**. It uses a dedicated "epitaph" grammar (one sentence,
   ≤ 140 chars, must end in a lexicon word tagged `tombstone-safe`, which
   permits F4 but forbids anything ambiguous out of context).
3. A 30 s dusk sequence: the palette fades to night, the pen fills with
   sleeping-sheep sprites, a tombstone rises beside the pen with the
   epitaph carved on it.
4. The herder is inducted into the **Hall of Herders** with name, seed,
   date, sheep count, books read, total curses uttered, vocabulary size,
   longest sentence, most-used word, and the epitaph.
5. After 60 s the screensaver rolls a new herder automatically (or shows
   the Hall, configurable). Sisyphus, after all.

## What this doc deliberately excludes

Word lists (see `LEXICON.md`), template syntax (see `SENTENCE_GRAMMAR.md`),
map pacing (see `PACING.md`).
