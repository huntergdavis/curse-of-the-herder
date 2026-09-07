# Real Books Behind the Little Free Libraries

Each box in the game holds an invented or lightly fictionalised title.
This is the map from those titles to real, public-domain works we can
mine for words, phrases and sentence shapes, with the kind of thing each
one contributes. Everything listed is public domain in the US (pre-1930
publication or author dead 70+ years) unless marked. Headword lists are
facts and can be taken freely; glosses and excerpts are rewritten in our
words, or quoted only from PD editions.

| In-game book | Real source(s) | What it gives the herder | Status |
| --- | --- | --- | --- |
| *A Child's First Words for the Farm* | Original | Nouns, interjections, body parts | Done |
| *The Sad Almanac* | Old Farmer's Almanac tradition (pre-1930 volumes are PD) | Weather adjectives, gloomy forecasts | Partly; mine PD almanacs for phrasing |
| *Grumbles of the Lower Field* | Oral tradition; Thomas Hardy's rustics (*Far from the Madding Crowd*, 1874) for shape | Rustic insults (clodhopper, lummox) | Done; Hardy shapes unused |
| *One Hundred Things That Are Slow* | Original | Similes | Done |
| *Manners for the Exasperated Gentleman* | Swift, *A Complete Collection of Genteel and Ingenious Conversation* (1738) | Polite exclamations and comebacks, minced oaths | Shapes only so far |
| *Words Overheard at the Cattle Market* | Original | Mild profanity | Done |
| *A Classical Dictionary of the Vulgar Tongue* | Francis Grose, 1785/1788/1811 (Gutenberg #5402) | 18th-century slang: addle-pate, nickumpoop, dew-beaters, gundiguts (skipped: body), bracket-faced (skipped) | ~160 curated; R-LEX-01 pipeline to add more |
| *Slang and Its Analogues* | Farmer & Henley, 1890–1904 (archive.org) | Victorian slang | Backlog R-LEX-02 |
| *The Complete Insults of William Shakespeare* | The plays (Folger XML, Gutenberg) — *Henry IV*, *Troilus*, *King Lear*, *Timon* | beslubbering, fen-sucked, clotpole, "I do desire we may be better strangers" | ~200 curated |
| *The Drover's Private Vocabulary* | Original | Strong profanity | Done |
| *A Phrasebook for the Disgruntled Traveller* | Molière (*peste!*, *morbleu!*, *parbleu!*), Rabelais (*Gargantua*, Urquhart tr.), Zola for register | French oaths with correct gender/articles | ~85; Molière oaths to add |
| *Schimpfwörter für Anfänger* | Goethe (*Götz von Berlichingen* — skip the famous one), Grimm's *Wörterbuch* | German compounds: Schafskopf, Quatschkopf | ~70 |
| *Porca Miseria!* | Boccaccio (*Decameron*), Cervantes (*Don Quijote*: *¡voto a tal!*, *¡cuerpo de mí!*) | Italian and Spanish exclamations | ~93; Cervantes oaths to add |
| *Ye Sacres of Kébec* | Documented in Wikipedia "Quebec French profanity" (CC BY-SA); needs a Québécois reviewer | tabarnak, câlisse, the "de" chaining grammar | 50; review pending |
| *The Yiddish Book of Kvetching* | Sholem Aleichem (Yiddish originals PD; check each translation), Wiktionary "Yiddish loanwords" | schlemiel, nudnik, kvetch | ~100 incl. Scots/Aussie |
| *Awa' an' Bile Yer Heid* | Robert Burns (*Address to the Deil*, *Tam o' Shanter*), Dunbar & Kennedy *Flyting* (c. 1500), Jamieson's *Scottish Dictionary* (1808) | eejit, numpty, glaikit, dreich; flyting shape | Words done; flyting duel shape partly (follow-up lines) |
| *In Our Time* | Hemingway, 1925 (PD US 2021); *The Sun Also Rises* (1926, PD 2022); *A Farewell to Arms* (1929, PD 2025) | Paratactic shape, polysyndeton; concrete nouns; no adjectives | Shapes done; excerpts original in his style |
| *One Word, Many Uses* | Original | The f-word | Done |
| *The Boatswain's Book of Oaths* | Smollett *Roderick Random* (1748), Marryat *Peter Simple* (1834), Dana *Two Years Before the Mast* (1840) for nautical register; Haddock-style chains are original | thundering, barnacles, landlubber, "shiver my timbers" (Stevenson, 1883) | Original set done; Smollett/Marryat mining backlog |
| *Sesquipedalia* | Roget's *Thesaurus* (1911, Gutenberg #10681), Webster 1913, Bierce *Devil's Dictionary* (1911) | Latinate abuse: contumelious, pusillanimous | ~260 |
| *A Rhyming Dictionary for Shepherds* | Walker's *Rhyming Dictionary* (1775), CMU Pronouncing Dictionary (BSD) | Rhyme families, syllable counts | Families hand-built; CMUdict pipeline backlog |
| *Notes on the Curse* | Original | Meta register | Done |

## Bonus titles (not yet placed)

| Title | Source | Gives |
| --- | --- | --- |
| *A Field Guide to Fungi* | M. C. Cooke, *British Fungi* (1871) | fungal similes (stinkhorn, puffball) |
| *Principles of Sedimentary Geology* | Lyell, *Principles of Geology* (1830) | "you metamorphic lump" |
| *Gray's Anatomy, Abridged* | Gray, 1858 | clinical body nouns for absurd anatomy |
| *The Cook's Oracle* | Kitchiner, 1817 | culinary insults (suet, gristle, dripping) |
| *Black's Law Dictionary* | 1st ed., 1891 | legalese register ("the party of the first part, hereinafter The Sheep") |
| *The Devil's Dictionary* | Bierce, 1911 | definitional structure ("SHEEP, n.") |
| *Gargantua* | Rabelais / Urquhart 1653 | catalogs of 7–12 nouns |
| *Genteel Conversation* | Swift, 1738 | polite-society exclamations |

## How the game shows this

Every Hall record now carries the herder's reading list in order, with
the time he finished each book and four words it taught him (sampled
from the book's pack, deterministic per herder). The end-of-day card
shows the same list. The next step is to record which learned words he
*actually used*, so the list can say "taught him gundiguts, which he
used eleven times, mostly at Gerald".

## Research backlog

- **R-REAL-01** Gutenberg pull of Grose #5402 → review CSV (see R-LEX-01).
- **R-REAL-02** Molière and Cervantes oath harvest (short lists, hand-checked).
- **R-REAL-03** Smollett/Marryat nautical phrase harvest; keep only original
  chains in the game, use the sources for register and rhythm.
- **R-REAL-04** Genuine PD excerpts for the real-titled books (Grose, Shakespeare,
  Hemingway 1925–1929, Bierce, Rabelais) with edition cited in the toast.
- **R-REAL-05** Usage tracking: count learned words used per book and target.
