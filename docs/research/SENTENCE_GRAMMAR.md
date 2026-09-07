# Sentence Grammar — thousands of structures without an LLM

No model, no network. The generator is a **tiered, weighted, context-free
grammar with morphology**, in the Tracery family but with agreement rules
and a register system. This is the same technology that powers Shakespeare
insult kits, Mad Libs, and Dwarf Fortress; it can produce effectively
infinite distinct sentences from a few hundred handwritten structures and
a few thousand words. The craft is in the structures.

## Vocabulary of the grammar

```
#symbol#                 expand a non-terminal
#adj.cap#                modifier: capitalize
#noun.a#                 modifier: prepend a/an correctly
#noun.pl#                modifier: pluralize (irregulars in lexicon)
#verb.3s# #verb.past#    conjugation
#target#                 the thing being cursed (sheep, hill, mud, self…)
#target.name#            its name if it has one ("Gerald"), else "you"
#F2:oath#                symbol restricted to filthiness band ≤ F2
#L6:insult#              symbol restricted to level ≥ 6 packs
[reg=bard]               set register for the rest of this expansion
#adj.allit#              modifier: all .allit slots in a line share the first slot's initial letter
#noun.syl2#              modifier: pick an entry with exactly 2 syllables (tagged `syl`, else a rough count)
{rhyme=#slot1#}          constraint: rhymes with an earlier slot
```

Rules carry: `id`, `tier` (grammar tier 0–12), `minLevel`, `maxBand`,
`register` tags, `weight`, `targets` allowed, and `event` (optional:
`sheep_fled`, `book_found`, `penned`, `absurd_location`, `rain`,
`walk_of_shame`, `epitaph`).

Implementation is ~500 lines of TypeScript, deterministic given (seed,
tick, state). Every expansion is pure so it can run in the worker and be
unit-tested exhaustively.

## Structure tiers (the progression of syntax)

Target counts are handwritten **structures**; combinatorics multiply them
by orders of magnitude. "Thousands of structures" is reached by tier 6.

| Tier | Grammar features unlocked | Handwritten structures (target) | Example structures |
| --- | --- | --- | --- |
| 0 | Bare noun / interjection. Full stop or `!` | 40 | `#noun.cap#.` `#interj.cap#!` `#noun.cap#?!` |
| 1 | Adj + noun; noun + noun; negation | 60 | `#adj.cap# #noun#.` `No #noun#.` `#noun.cap#. #noun.cap#. #noun.cap#.` |
| 2 | SVO; copula; demonstratives; simple exclamative | 120 | `This #target# is #adj#.` `I #verb.neg# #noun.pl#.` `Why is there #noun.a# in my #bodypart#?` |
| 3 | Comparatives, similes, intensifiers, compound adjectives with hyphens | 200 | `You are as #adj# as #simile_np#.` `#target.cap#, you #compound_adj# #noun#.` `That is the #superl# #noun# I have ever #verb.past#.` |
| 4 | Vocative ("O Sheep"), imperatives, minced oaths, coordinated clauses (and/but/so) | 250 | `#oath.cap#, #target.name#, #clause# and #clause#.` `Hear me, O #target.cap#: #clause#.` `Come here, you #insult#, so that I may #threat_cartoon#.` |
| 5 | Historical slang templates, appositives, parenthetical asides, lists of three | 300 | `You #F0:insult#, you #F1:insult#, you #F2:insult#.` `#target.cap# (if that is your real name) #clause#.` |
| 6 | Bard: thou/thee/thy agreement, "-eth/-est", inversions, iambic fragments, tripartite insult (adj, adj, noun) | 350 | `Thou #bard_adj# #bard_adj# #bard_noun#!` `Would that #target# were #adj#, for then #clause_archaic#.` `#bard_oath#! Get thee to #place#.` |
| 7 | Code-switching: foreign interjection + English clause, foreign NP with correct article/gender, macaronic lists | 350 | `#fr_oath.cap#, #clause#.` `You absolute #de_noun# of a #target#.` `#it_oath#! #es_oath#! #yi_insult.cap#!` |
| 8 | Hemingway: paratactic chains, polysyndeton ("and… and… and"), understatement, repetition of a key noun, no adjectives | 250 | `The #target# was #prep_phrase#. It was a bad #target#. I went #direction#.` `I carried it and it was heavy and the hill was long and that was the day.` |
| 9 | Alliteration constraints, oath chains, spoonerisms, nautical register, numerals ("ten thousand…") | 250 | `{alliterate:#letter#} #number.cap# #adj# #noun.pl#!` `#nautical_oath# and #nautical_oath#!` |
| 10 | Periodic sentences: fronted subordinate clauses, nested relative clauses, catalogs of 7–12 items, dashes and semicolons | 300 | `Were I, #time_phrase#, to #verb# #catalog#, #target# would #verb# #ordinal#.` `#target.cap#—yes, you, the one #distinguishing_feature#—#clause#.` |
| 11 | Verse: limerick (AABBA with syllable/rhyme constraints), haiku (5-7-5), heroic couplet, clerihew | 150 templates + rhyme dictionary | `There once was #noun.a# #place_rhyme_a# / …` |
| 12 | Meta and mixed: address the Curse, the viewer's monitor (never the viewer), his own eloquence; any tier may be spliced mid-sentence with `[reg=…]` switches | 150 | `O Curse, you gave me #abstract_noun# and #abstract_noun# and #number# #noun.pl# to spend them on.` |

Total handwritten: ~2,800 structures. Combined with ~6,000 lexicon
entries and modifiers, the distinct-output space is in the billions; the
practical measure is **repeat rate**, tested as "no identical sentence
twice in a simulated 9-hour day at p > 0.999".

## Agreement and morphology (the unglamorous part that makes it read well)

- **a/an**: by phoneme, not letter (`an hour`, `a ewe`, `a unicorn`).
  Exceptions list in lexicon.
- **Plurals**: `-s/-es/-ies`, irregulars (`sheep→sheep`, `ox→oxen`,
  `hoof→hooves`), uncountables flagged (`mud`, `regret`).
- **Verbs**: base, 3s, past, participle, `-eth/-est` archaic forms;
  irregular table (~200 verbs).
- **Thou/thee/thy/thine** selection by case and following vowel.
- **Foreign nouns**: gender + article + plural in the lexicon; templates
  never hard-code `le/la/der/die`.
- **Capitalization**: sentence-initial and after `. ! ?` only; proper
  nouns flagged. Names of sheep are proper nouns.
- **Punctuation intensity** scales with frustration: `.` → `!` → `!!` →
  interrobang → ALL CAPS on the final noun phrase only (never whole
  sentences above 8 words; it becomes unreadable).
- **Length budget**: bubbles wrap at 44 chars; templates declare a max
  length and the renderer picks a font size; anything > 220 chars is
  delivered as a two-bubble sequence.

## Coherence devices (so it feels like one person's day, not a slot machine)

- **Sheep memory**: a sheep that flees twice gets a name from
  `sheep_names.txt`; templates with `#target.name#` are then preferred.
- **Callbacks**: 5% of lines reference an earlier event stored in a
  16-entry ring buffer ("This is the third river today.").
- **Running gag**: each herder rolls one "signature word" at creation
  (an F0 noun like `turnip`); it is weighted ×4 all day and must appear
  in the epitaph grammar's candidate set.
- **Register drift**: after reading a book, the next 10 minutes weight
  that book's register ×3 (he's just read Hemingway, so he talks like
  Hemingway for a bit).
- **Weather/time slots**: `#time_phrase#` resolves from the in-game
  clock ("at this ungodly hour", "with the sun already past the elm").

## Research backlog for structures

Sources to mine for *shapes*, not text (all public domain or
descriptive linguistics):

- Shakespeare's insult catalog (the well-known three-column kit) for the
  adj-adj-noun triad; plus *Henry IV* and *Troilus and Cressida* for
  shapes of extended invective.
- Rabelais, *Gargantua and Pantagruel* (Urquhart–Motteux translation,
  PD): catalogs and grotesque lists.
- Swift, *A Complete Collection of Genteel and Ingenious Conversation*
  (1738): polite-society exclamations and comebacks.
- Bierce, *The Devil's Dictionary* (1911): definitional insult shape
  ("SHEEP, n. …").
- Grose, *Classical Dictionary of the Vulgar Tongue* (1785) and Farmer &
  Henley, *Slang and Its Analogues* (1890–1904): 18th/19th-c. insult
  phrases and their idiomatic frames.
- Hemingway, *The Sun Also Rises* (PD in the US since 2022) and *A
  Farewell to Arms* (2025): parataxis and polysyndeton patterns.
- Captain Haddock's oath style (Tintin) is *not* PD: study the technique
  (alliterative, pseudo-nautical, escalating) and write original oaths.
- Quebec sacres: the well-documented grammar of chaining sacres with
  "de" ("ostie de câlisse de tabarnak") is a syntactic pattern to
  implement, not text to copy.
- Cockney rhyming slang formation rules for a late-tier "rhyming slang"
  register.
- Limerick and haiku meter rules; CMU Pronouncing Dictionary (BSD-ish
  license) for syllable counts and rhymes, trimmed to our lexicon.
- Old English and Norse flyting (Lokasenna, *The Flyting of Dunbar and
  Kennedy*) for the boast–insult duel shape (herder vs. sheep).
- Tracery (Kate Compton) and Dwarf Fortress speech for implementation
  patterns; Inform 7 and Ink for how to keep a grammar maintainable.

Deliverables: `data/grammar/tier-NN.json` per tier, a `structures.md`
style guide, and a "structure lint" that rejects a template whose slots
can only be filled from a single lexicon entry (a disguised fixed
sentence).
