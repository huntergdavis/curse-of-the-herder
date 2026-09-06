# Books and Little Free Libraries

Books are how the herder levels. They are also the best pacing lever we
have: their placement decides when each register unlocks.

## Placement

- **Little Free Libraries** are small painted boxes on posts, placed on
  the map at roads, village edges, and scenic spots. About 24 per board.
  Each holds 1–3 books.
- Libraries are placed on the herder's *likely* path: the map generator
  computes the pen-to-sheep routes for the first 70% of sheep and drops
  libraries adjacent to those routes in rank order of desired unlock
  time (see `PACING.md`). The remaining libraries are scattered as
  discoveries.
- A few books are **loose**: dropped in a field, on a stump, floating in
  a stream (waterlogged: teaches half its words, all about damp).
- The herder detours up to 12 tiles to reach a visible library when he
  is *not* carrying a sheep. Carrying, he passes it and says something
  wistful about it. This creates natural "I'll come back for that"
  callbacks.

## Reading

Reading takes 60–120 s of screen time. The herder sits (on the box's
bench, a stump, the ground) and the bubble shows 3–6 short excerpts,
one at a time, in the book's typeface. Frustration drops by 10. Then the
book's pack loads, a "Learned: 47 words, 12 structures" toast appears,
and the next few minutes weight that register heavily.

Excerpts are **original text written in the style**, or genuine
public-domain quotations with attribution shown in the toast. No
copyrighted text.

## Catalog (first 30 titles)

| Title | Teaches (pack / grammar) | Level intent | Flavor |
| --- | --- | --- | --- |
| *A Child's First Words for the Farm* | primer, farmyard | 0–1 | Picture book. He points at the sheep. |
| *The Sad Almanac* | weather adjectives | 1 | Weather is always bad |
| *Grumbles of the Lower Field* | insults-classic | 2 | Oral tradition of grumpy herders |
| *One Hundred Things That Are Slow* | similes | 3 | A list book |
| *Manners for the Exasperated Gentleman* | minced-oaths, vocative grammar | 4 | Swift-style etiquette parody |
| *The Vulgar Tongue* (Grose, abridged) | grose-vulgar-tongue | 5 | Genuine PD headwords; the herder is delighted |
| *Slang and Its Analogues, vol. III* | farmer-henley | 6 | |
| *The Complete Insults of William Shakespeare* | bard + Tier 6 grammar | 6 | Folger-derived |
| *A Phrasebook for the Disgruntled Traveller (French)* | french | 7 | |
| *Schimpfwörter für Anfänger* | german | 7 | |
| *Porca Miseria! and Other Useful Phrases* | italian-spanish | 7 | |
| *Ye Sacres of Kébec* | quebec-sacres | 7 | Reviewed by a Québécois speaker |
| *The Yiddish Book of Kvetching* | yiddish | 7 | |
| *Awa' an' Bile Yer Heid: A Scots Primer* | scots | 7 | |
| *In Our Time* (Hemingway, PD) | hemingway + Tier 8 grammar | 8 | Genuine excerpts, attributed |
| *The Boatswain's Book of Oaths* | nautical + alliteration constraints | 9 | Original |
| *Grammar of the Periodic Sentence* | Tier 10 grammar | 10 | A textbook. He reads it *furiously* |
| *Sesquipedalia: Long Words for Short Tempers* | baroque-latinate | 10 | |
| *The Devil's Dictionary* (Bierce, PD) | definitional structures | 10 | |
| *Gargantua* (Rabelais, PD, catalogs only) | catalog structures | 10 | |
| *A Rhyming Dictionary for Shepherds* | verse-rhymes + limerick/haiku | 11 | |
| *The Flyting of Dunbar and Kennedy* | flyting duel structure | 11 | Herder vs. sheep, alternating |
| *Notes on the Curse* (the previous herder's diary) | Tier 12 meta grammar | 12 | Always the last library; seeded near the last sheep |
| *A Field Guide to Fungi* | fungal similes | any | Bonus flavor pack |
| *Principles of Sedimentary Geology* | geological insults ("you metamorphic lump") | any | Bonus |
| *Gray's Anatomy, Abridged* | anatomical F0 nouns | any | Bonus |
| *The Cook's Oracle* (1817, PD) | culinary insults | any | Bonus |
| *Black's Law Dictionary, 1st ed. (PD)* | legalese register | any | Bonus: "the party of the first part, hereinafter The Sheep" |
| *A Treatise on Knitting* | cartoon-threat pack ("a very slow sweater") | any | Bonus |
| *Water-Damaged Book* | random pack at half strength, all glosses "damp" | any | Found in streams |

Bonus books never gate the level curve; they widen it.

## Research backlog

- **R-BOOK-01** Confirm PD status per title/edition in the US (life+70
  or pre-1930 publication) and in the EU for the excerpts we actually
  quote. Hemingway: only the pre-1930 titles.
- **R-BOOK-02** Write 4–6 original excerpts per invented book (30 books
  × 5 = ~150 excerpts). Style sheet per book.
- **R-BOOK-03** Book cover art: one SVG cover template with title band,
  6 color schemes; genre icons from game-icons.net (CC BY 3.0).
- **R-BOOK-04** Little Free Library box art: original SVG, 3 paint
  variants, door open/closed states.
- **R-BOOK-05** Pacing sim: run 1,000 generated boards, record the
  minute each pack unlocks, tune placement so the median Level-6 unlock
  lands at hour 4 ± 0.5 and Level 12 at hour 8.5 ± 0.3.
