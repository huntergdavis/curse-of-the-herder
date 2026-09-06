# Lexicon — thousands of words, tagged and tiered

The lexicon is the word side of the generator. Target: **~6,000 curated
entries** across the packs below, every one tagged with part of speech,
filthiness band (F0–F4), register, the level at which it unlocks, and
the book that teaches it.

## Entry format

```jsonc
{
  "w": "clodhopper",
  "pos": "noun",            // noun | adj | verb | interj | oath | simile | prefix | suffix
  "band": "F0",
  "level": 3,
  "reg": ["rustic", "grose"],
  "pl": "clodhoppers",      // only if irregular or needed
  "syl": 3,                 // syllables, for verse
  "rhyme": "AH1 P ER0",     // rhyme key, for verse (last stressed vowel onward)
  "gloss": "a clumsy rustic (Grose 1785)",
  "lang": "en",             // en | fr | de | it | es | yi | sco | fr-CA | la
  "gender": null,           // for foreign nouns: m | f | n
  "targets": ["sheep", "self"],  // optional restriction
  "book": "grose-vulgar-tongue",
  "source": "Grose 1785, p. 84",
  "tombstoneSafe": true
}
```

Lists live in `data/lexicon/*.jsonc`, one file per pack, each with a
header block: `curator`, `reviewedAt`, `license`, `notes`. A file with no
`reviewedAt` is not loaded.

## Packs (the unlock order roughly follows level)

| Pack | Level | Band range | Target size | Contents |
| --- | --- | --- | --- | --- |
| `primer` | 0 | F0 | 150 | Pastoral nouns (mud, hill, wool, hoof, rain), interjections (ugh, bah, hmph), body parts (knees, back, feet) |
| `farmyard` | 1 | F0 | 300 | Adjectives of texture and competence (soggy, lumpen, gormless), farm objects, weather |
| `insults-classic` | 2 | F0–F1 | 500 | English general insults that pass the policy: dolt, lummox, ninny, nincompoop, fopdoodle, blatherskite, snollygoster |
| `similes` | 3 | F0 | 400 | Noun phrases for "as X as #simile#": wet bread, a dropped pie, a Tuesday, a fence post in a debate |
| `minced-oaths` | 4 | F1 | 200 | Blast, drat, dash it all, confound, zounds, gadzooks, odds bodkins, jumping Jehoshaphat, crikey, strewth |
| `mild-profanity` | 5 | F2 | 120 | damn, hell, bloody, crap, arse, bum, sod, git, bugger (excl.), and their inflections |
| `grose-vulgar-tongue` | 5 | F0–F2 | 600 | Vetted 18th-century slang from Grose 1785 (PD) |
| `farmer-henley` | 6 | F0–F3 | 400 | Vetted Victorian slang from *Slang and Its Analogues* (PD) |
| `bard` | 6 | F0–F1 | 500 | Shakespearean adjectives/nouns/oaths; archaic verb forms |
| `strong-profanity` | 6 | F3 | 100 | shit, piss, bastard, bollocks, wanker (UK), prick, and inflections; every entry individually justified in the file |
| `french` | 7 | F1–F3 | 250 | sacrebleu, zut, mince, bon sang, merde, putain (F3), bordel (F3), nom d'un chien; nouns with gender |
| `german` | 7 | F1–F3 | 200 | verdammt, Mist, Scheiße (F2), Schafskopf, Dummkopf, Kartoffel; compound-noun building blocks |
| `italian-spanish` | 7 | F1–F3 | 250 | accidenti, mannaggia, cavolo, porca miseria, cazzo (F3); caramba, rayos, maldita sea, mierda (F2) |
| `yiddish-scots-aussie` | 7 | F0–F3 | 300 | schlemiel, nudnik, klutz; eejit, numpty, bawheid, bampot; galah, drongo, fair dinkum |
| `quebec-sacres` | 7 | F2–F3 | 60 | tabarnak, câlisse, ostie, criss, viarge, and the chaining grammar |
| `hemingway` | 8 | F0–F2 | 200 | Plain concrete nouns and verbs; adjectives forbidden in this register |
| `nautical` | 9 | F0–F2 | 300 | Original Haddock-style oath components: thundering, blistering, barnacles, bilge, typhoons, blithering, landlubber |
| `baroque-latinate` | 10 | F0 | 500 | Polysyllabic Latinate abuse: sesquipedalian, flocculent, nugatory, contumelious, tatterdemalion |
| `verse-rhymes` | 11 | F0–F3 | 800 | Rhyme-keyed subset of everything above plus fillers with known syllable counts |
| `f-word` | 8 | F4 | 30 | The f-word and its inflections and permitted compounds ("fuckwit" of a hill, "motherfucking" as intensifier before terrain only) |
| `pantheon` | 0 | F0 | 40 | Invented pastoral deities and saints for exclamations: "by the Ewe Mother", "Saint Woolgather preserve me" |
| `sheep-names` | 0 | F0 | 400 | Names for sheep that earn one: Gerald, Beatrix, Lord Fluffington, The Other Gerald |
| `herder-names` | 0 | F0 | 200 first + 200 epithets | "Old Fennick", "Wulfric the Damp", "Mags of the Lower Field" |

Sum ≈ 6,500 before curation losses.

## Filthiness levels as a *content* concept

Five bands, defined in `CONTENT_POLICY.md`. Curation rules of thumb:

- F0 should be the *largest* band by far. The joke is eloquence.
- F1 is the day's early spice; keep it period-flavored and silly.
- F2/F3 are where 20th-century vocabulary lives; never let them exceed
  ~5% of the lexicon or the late day gets monotone.
- F4 is a garnish: one word family, used at most once per sentence,
  never as the target noun.

## Sourcing plan (all public domain or permissively licensed)

| Source | Status | What we take | Notes |
| --- | --- | --- | --- |
| Grose, *A Classical Dictionary of the Vulgar Tongue* (1785/1811) | PD, on Project Gutenberg | ~600 usable headwords | Heavy filter: much is racist/sexist/ableist; log rejections |
| Farmer & Henley, *Slang and Its Analogues* (1890–1904) | PD, archive.org scans | ~400 | Same caveat |
| Shakespeare complete works | PD, Gutenberg / Folger | adjectives, nouns, oaths | Use Folger's clean text; build with a script, curate by hand |
| Chaucer, *Canterbury Tales* | PD | Middle English exclamations ("by Goddes bones") | Modernize spelling |
| Rabelais (Urquhart–Motteux) | PD | catalog nouns | |
| Bierce, *Devil's Dictionary* | PD | definitions to parody | |
| Roget's Thesaurus (1911 edition) | PD, Gutenberg #10681 | synonym rings for adjectives | Use for breadth, not authority |
| Webster's 1913 | PD | glosses, syllable hints | |
| Hemingway PD titles (*Sun Also Rises*, *Farewell to Arms*, *In Our Time*) | PD in US | concrete noun/verb list only | No quoted sentences |
| Wiktionary categories ("English vulgarities", "French vulgarities", "Quebec French sacres", "Yiddish loanwords", "Scots insults") | CC BY-SA 4.0 | headwords + glosses | Attribution required; headword lists are facts, glosses are rewritten in our words |
| CMU Pronouncing Dictionary | BSD-style | syllables and rhyme keys | Trim to our lexicon at build time |
| *Moby Word Lists* | PD | plural/inflection sanity | |
| Original writing | ours | nautical oaths, similes, pantheon, names | Most of the funniest material will be written, not mined |

Explicitly **not** used: any modern dictionary of slang under copyright
(Green's, Partridge), Urban Dictionary (license and quality), any list
scraped from social media, any LLM-generated word list (we write it or
we mine PD text).

## Research backlog

1. **R-LEX-01** Script: pull Grose 1785 from Gutenberg, split headwords,
   emit a review CSV with definition, our proposed band, and a
   `keep/reject/reason` column. Human pass. Expected: 2 evenings.
2. **R-LEX-02** Same for Farmer & Henley volume 1–7 (OCR quality check).
3. **R-LEX-03** Shakespeare adjective/noun harvest from Folger XML;
   classify by sentiment with a stoplist; hand-pick 500.
4. **R-LEX-04** Foreign packs: one native or fluent reviewer per
   language before `reviewedAt` is set. Verify gender, spelling,
   diacritics, register. Quebec sacres reviewed by a Québécois speaker;
   they are religious words and the register matters.
5. **R-LEX-05** Rhyme/syllable pipeline: CMUdict → our lexicon; fallback
   heuristic syllable counter for words CMUdict lacks; test against 200
   hand-counted words.
6. **R-LEX-06** Similes and nautical oaths: writing sprints. Target 400
   similes; measure laugh-rate informally with three readers; keep the
   top 60%.
7. **R-LEX-07** Ban-list construction: compile from published moderation
   lists (only the *slur* categories), add inflection regexes, add
   diacritic-stripped forms, and test that the ban list itself never
   appears in any shipped file except `banned.txt`.
8. **R-LEX-08** Frequency balancing: simulate a full day, count word
   usage, flag any word > 1% of all tokens (except the signature word).
9. **R-LEX-09** Tombstone-safe subset: hand-review every F3/F4 entry for
   whether it reads acceptably alone on a gravestone image.
10. **R-LEX-10** Attribution file: `CREDITS.md` entries for Wiktionary
    (CC BY-SA), CMUdict (BSD), and each PD source with edition.
