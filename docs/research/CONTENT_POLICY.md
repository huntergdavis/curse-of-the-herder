# Content Policy — where the line is

The herder is filthy, not cruel. The target of every curse is a sheep, a
hill, the weather, a book, the gods of the pasture, the Curse itself, or
the herder. Never a real person, never a group of people, never the viewer.

This is a workplace screensaver. The bar is: **a colleague walking past
your monitor laughs, or at worst rolls their eyes. Nobody has to report
it.** That is roughly an R-rated comedy, not a roast.

## Filthiness bands (F0–F4)

Every lexicon entry carries exactly one band. The generator never emits a
word above the current ceiling (see `CURSE_PROGRESSION.md`).

| Band | Contents | Examples |
| --- | --- | --- |
| F0 | Clean. Insults of competence, texture, animal comparisons, archaic words that only *sound* rude | dolt, lump, clodhopper, gormless, ninnyhammer, fopdoodle, "wet bread" |
| F1 | Minced oaths, mild religious exclamations in the exclamatory sense | blast, dang, drat, confound it, zounds, gadzooks, heavens, good grief, sacrebleu |
| F2 | Mild profanity and body parts in the comic register | damn, hell, bloody, crap, arse, bum, sod, git, bugger (UK sense), merde, Scheiße |
| F3 | Strong profanity, scatological, vulgar body references | shit, piss, bastard, bollocks, tits (only in "arse over tit"), putain, cazzo, Quebec sacres (tabarnak, câlisse, ostie) |
| F4 | The f-word and its inflections, compound vulgarities | fuck, fucking, motherfucking (in "motherfucking hill"), shitting, arse-biscuit, "fuckwit of a hill" |

Nothing lives above F4. The eloquence goes to 11; the filth caps at 4.

## Hard bans (never in any list, enforced by test)

- Slurs against any race, ethnicity, nationality, religion, caste
- Slurs and pejoratives about sexual orientation or gender identity,
  including using "gay" or the like as a negative
- Ableist slurs and the clinical-turned-insult words: retard(ed), spaz,
  spastic, cretin, imbecile, moron, mongoloid, psycho, schizo, "lame" as
  an insult, "dumb" meaning stupid, "crazy/insane" as a put-down. Also
  banned as *targets*: any reference to disability, mental illness,
  appearance-based body shaming (fat, ugly, etc.). "Idiot" is on the
  banned list too; it is borderline and we have ten thousand better words.
- Sexual content: no sexual acts, no genital insults aimed at a target's
  sexuality, nothing about anyone's sex life. Body parts appear only as
  exclamations or absurd anatomy ("you sedimentary buttock of a hill").
  "Cunt" is banned outright in all variants; it reads as gendered abuse
  to too many viewers. "Bitch" is banned (gendered) even though the
  herder has, technically, a sheepdog he does not have.
- Sexist terms: whore, slut, and the whole family; "hysterical"; no
  gendered insults at all. The sheep are "it" or by name.
- Violence: no threats of real harm to people; against sheep only the
  cartoon kind ("I will knit you into a scarf", "I will turn you into a
  very slow sweater"). No weapons.
- Real people: no names of living or historical persons as insult
  targets or comparators.
- Religion: exclamatory usage only (damn, hell, sacre-, the Quebec
  sacres, "gods of the pasture"). Never mock a believer or a specific
  faith's figures. The herder's own pantheon is invented (the Ewe Mother,
  Saint Woolgather, the Patron of Lost Things).
- Drugs, self-harm, suicide, sexual assault, incest: absent entirely,
  including as jokes.
- Anything that reads as a real-world political statement.

## Gray zone (case by case, documented in the list file)

- "Bugger": allowed in its UK-exclamation sense at F2; the anatomical/
  sexual sense is not reachable because it is never a verb in templates.
- "Bastard": F3, allowed as a generic intensifier ("this bastard hill"),
  never applied to a person's parentage.
- "Sod": F2 as "sod it / sod off / you daft sod".
- "Dick" and "prick": allowed at F3 *only* as "you absolute prick" type
  lines directed at a sheep or hill. Reviewed per template.
- "Bloody": F2. Australians will tell you it is F0. We keep F2 to give
  the early hours something to unlock.
- "Wanker": F3, UK, allowed at a sheep only. Reviewed.
- Words about animals' body parts (dags, teat, udder): F1, comedic.
- Historical slang from Grose (1785) and Farmer & Henley (1890s) must be
  vetted entry by entry; a sizeable fraction is racist, sexist, or
  ableist and must be discarded. Log every rejection with the reason in
  `data/lexicon/REJECTED.md` so it is never re-imported by accident.

## Enforcement

1. `data/lexicon/banned.txt`: the master ban list (plus regex patterns for
   inflections and leetspeak). Every lexicon pack and every template is
   tested against it in CI. A hit fails the build.
2. **Never-emit test**: run the generator 200,000 times across every
   level/frustration combination with a fixed seed; assert zero ban-list
   hits and zero words above the ceiling. Also assert that no output
   contains a proper noun not on the allow list (herder names, sheep
   names, invented pantheon).
3. **Target test**: every template's target slot must be filled from
   `targets.json` (sheep, terrain, weather, self, curse, pantheon,
   books). There is no "person" target category, so a template cannot
   accidentally aim at one.
4. Every list file has a `curator` field and a `reviewedAt` date. Lists
   without a review date are not loaded by the build.
5. A `?clean=1` URL parameter caps the ceiling at F1 for shared or
   sensitive displays, with an on-screen badge. A `?filth=max` parameter
   removes the frustration gate (not the level gate) for testing and for
   people who want the good stuff by lunch.

## Tone guidance for curators

- Prefer **specificity** over strength. "You crag-clinging, cud-chewing
  cloud of bad decisions" beats a bare swear every time.
- Prefer the **absurd** over the mean. The herder is losing, and he knows
  it. He is furious at the universe, not punching down.
- Historical and foreign-language material should feel like *erudition*,
  not exoticism. Every foreign word ships with a gloss in the lexicon and
  is used correctly (gender, article, spelling with diacritics).
- When in doubt, cut it. The list will still be thousands long.
