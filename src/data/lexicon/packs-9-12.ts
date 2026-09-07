// Lexicon packs for levels 10-12: baroque Latinate abuse, rhyme families for
// verse, and the meta register for cursing about cursing (and the Curse).
// Format follows docs/research/LEXICON.md; policy in CONTENT_POLICY.md.
// Rhyme families are encoded as register tags "rhyme:<family>" because
// LexEntry has no rhyme field; `syl` is the syllable count.
import type { LexEntry, LexPack } from "../../core/lang/types";

type B = 0 | 1 | 2 | 3 | 4;
const n = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "noun", band: 0, level: 0, syl, ...extra });
const adj = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "adj", band: 0, level: 0, syl, ...extra });
const ins = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "insult", band: 0, level: 0, syl, ...extra });
const interj = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "interj", band: 0, level: 0, syl, ...extra });
const oath = (w: string, band: B, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "oath", band, level: 0, syl, ...extra });
const inten = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "intensifier", band: 0, level: 0, syl, ...extra });
const sim = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "simile", band: 0, level: 0, ...extra });
const verb = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "verb", band: 0, level: 0, syl, ...extra });
const abs = (w: string, syl: number, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "abstract", band: 0, level: 0, syl, pl: "-", ...extra });
const pan = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "pantheon", band: 0, level: 0, ...extra });
const threat = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "threat", band: 0, level: 0, ...extra });

// ---------------------------------------------------------------- Baroque
const BQ = { reg: ["baroque"] };
const b = (e: LexEntry, gloss?: string): LexEntry => (gloss ? { ...e, ...BQ, gloss } : { ...e, ...BQ });

export const baroqueLatinate: LexPack = {
  id: "baroque-latinate",
  title: "Sesquipedalia: Long Words for Short Tempers",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 10,
  entries: [
    // Adjectives.
    b(adj("sesquipedalian", 6), "a foot and a half long; of words, and of this sentence"), b(adj("flocculent", 3), "woolly, tufted, like a cloud that has let itself go"),
    b(adj("nugatory", 4), "of no value; trifling"), b(adj("contumelious", 5), "insolently abusive"), b(adj("lugubrious", 4), "mournful to the point of comedy"),
    b(adj("lachrymose", 3), "tearful"), b(adj("recalcitrant", 4), "kicking against the heels; obstinately disobedient"), b(adj("obstreperous", 4), "noisily unruly"),
    b(adj("pertinacious", 4), "holding on stubbornly"), b(adj("pusillanimous", 5), "cowardly; of tiny spirit"), b(adj("vacuous", 3), "empty"), b(adj("otiose", 3), "idle; serving no purpose"),
    b(adj("insalubrious", 5), "unwholesome"), b(adj("mephitic", 3), "foul-smelling"), b(adj("crapulous", 3), "sick from excess; also just sick of it"), b(adj("torpid", 2), "sluggish"),
    b(adj("somnolent", 3), "sleepy"), b(adj("bovine", 2), "cow-like"), b(adj("ovine", 2, { targets: ["sheep"] }), "sheep-like; the highest insult available to a sheep"), b(adj("ruminant", 3, { targets: ["sheep"] }), "cud-chewing"),
    b(adj("ungulate", 3, { targets: ["sheep"] }), "hoofed"), b(adj("ponderous", 3), "heavy and slow"), b(adj("egregious", 3), "outstandingly bad"), b(adj("execrable", 4), "utterly detestable"),
    b(adj("abominable", 5)), b(adj("deplorable", 4)), b(adj("lamentable", 4)), b(adj("insufferable", 5)), b(adj("interminable", 5)), b(adj("incorrigible", 5)),
    b(adj("indefatigable", 6), "never tiring; said of sheep who run"), b(adj("inexorable", 5), "unstoppable"), b(adj("irredeemable", 5)), b(adj("unconscionable", 5)),
    b(adj("preposterous", 4)), b(adj("ludicrous", 3)), b(adj("farcical", 3)), b(adj("calamitous", 4)), b(adj("catastrophic", 4)), b(adj("cataclysmic", 4)),
    b(adj("pestilential", 4)), b(adj("noisome", 2), "offensive to the nose"), b(adj("malodorous", 4)), b(adj("fetid", 2)), b(adj("putrescent", 3)), b(adj("moribund", 3), "at the point of death; of my patience"),
    b(adj("lethargic", 3)), b(adj("phlegmatic", 3)), b(adj("saturnine", 3), "gloomy"), b(adj("splenetic", 3), "bad-tempered"), b(adj("dyspeptic", 3), "of poor digestion and worse mood"),
    b(adj("choleric", 3), "hot-tempered"), b(adj("atrabilious", 5), "melancholy, ill-natured"), b(adj("sanctimonious", 5)), b(adj("supercilious", 5), "haughty"), b(adj("obsequious", 4), "fawning"),
    b(adj("perfidious", 4), "treacherous"), b(adj("mendacious", 3), "lying"), b(adj("fatuous", 3), "silly and self-satisfied"), b(adj("inane", 2)), b(adj("jejune", 2), "naive; unsatisfying"),
    b(adj("vapid", 2)), b(adj("insipid", 3)), b(adj("banal", 2)), b(adj("tedious", 3)), b(adj("soporific", 4), "sleep-inducing"), b(adj("stultifying", 4)), b(adj("obtuse", 2)),
    b(adj("impenetrable", 5)), b(adj("impervious", 4)), b(adj("immovable", 4)), b(adj("inert", 2)), b(adj("sedentary", 4)), b(adj("quadrupedal", 4, { targets: ["sheep"] })), b(adj("lanate", 2, { targets: ["sheep"] }), "woolly (Latin lana, wool)"),
    b(adj("lanuginous", 4, { targets: ["sheep"] }), "covered in soft down"), b(adj("gregarious", 4, { targets: ["sheep"] }), "of the flock"), b(adj("herbivorous", 4, { targets: ["sheep"] })), b(adj("capricious", 3), "goat-like in temper"), b(adj("hircine", 2, { targets: ["sheep"] }), "goatish"),
    b(adj("vermiform", 3), "worm-shaped"), b(adj("invertebrate", 4), "spineless"), b(adj("cretaceous", 3, { targets: ["terrain"] }), "chalky"), b(adj("sedimentary", 5, { targets: ["terrain", "sheep"] }), "settled in layers, like this sheep"), b(adj("metamorphic", 4, { targets: ["terrain"] })),
    b(adj("igneous", 3, { targets: ["terrain"] })), b(adj("glacial", 2)), b(adj("tectonic", 3), "moving at the pace of continents"), b(adj("bucolic", 3, { targets: ["terrain", "day"] }), "of the pasture"), b(adj("agrarian", 4, { targets: ["terrain", "day"] })), b(adj("antediluvian", 6), "from before the Flood"),
    b(adj("primordial", 4)), b(adj("vestigial", 4), "left over and useless"), b(adj("superfluous", 4)), b(adj("gratuitous", 4)), b(adj("ineffable", 4), "beyond words; not for lack of trying"),
    b(adj("unutterable", 5)), b(adj("labyrinthine", 4)), b(adj("byzantine", 3)), b(adj("circumlocutory", 6), "talking round the point"), b(adj("peripatetic", 5), "wandering about"),
    b(adj("ambulatory", 5, { targets: ["sheep", "self"] })), b(adj("comestible", 4, { targets: ["sheep"] }), "edible; said hopefully"), b(adj("truculent", 3), "aggressively defiant"), b(adj("querulous", 3), "complaining"), b(adj("cantankerous", 4)),
    // Insult nouns.
    b(ins("mountebank", 3), "a quack, a charlatan"), b(ins("poltroon", 2), "a coward"), b(ins("popinjay", 3), "a vain chatterer; a parrot"), b(ins("quidnunc", 2), "a gossip ('what now?')"),
    b(ins("jackanapes", 3, { pl: "jackanapes" }), "an impertinent monkey of a fellow"), b(ins("malingerer", 4), "one who feigns illness to avoid work"), b(ins("dilettante", 3), "a dabbler"),
    b(ins("sluggard", 2)), b(ins("laggard", 2)), b(ins("blunderbuss", 3)), b(ins("cataclysm", 4)), b(ins("catastrophe", 4)), b(ins("calamity", 4)), b(ins("abomination", 5)),
    b(ins("perturbation", 4)), b(ins("tribulation", 4)), b(ins("vexation", 3)), b(ins("encumbrance", 3)), b(ins("impediment", 4)), b(ins("obstruction", 3)), b(ins("excrescence", 3), "an unwanted outgrowth"),
    b(ins("protuberance", 4)), b(ins("appendage", 3)), b(ins("afterthought", 3)), b(ins("anachronism", 4)), b(ins("non sequitur", 4), "a thing that does not follow; a sheep"), b(ins("tautology", 4)),
    b(ins("oxymoron", 4)), b(ins("paradox", 3)), b(ins("conundrum", 3)), b(ins("quandary", 3)), b(ins("contretemps", 3), "an awkward mishap"), b(ins("debacle", 3)), b(ins("fiasco", 3)),
    b(ins("boondoggle", 3), "wasteful, pointless work"), b(ins("imbroglio", 4), "a confused entanglement"), b(ins("kerfuffle", 3)), b(ins("brouhaha", 3)), b(ins("hullabaloo", 4)), b(ins("rigmarole", 3)),
    b(ins("farrago", 3), "a confused mixture"), b(ins("gallimaufry", 4), "a hodgepodge"), b(ins("mishmash", 2)), b(ins("hodgepodge", 2)), b(ins("omnishambles", 4)), b(ins("quadruped", 3, { targets: ["sheep"] })),
    b(ins("herbivore", 3, { targets: ["sheep"] })), b(ins("ovoid", 2, { targets: ["sheep"] }), "egg-shaped"), b(ins("cumulus", 3, { targets: ["sheep"] }), "a heaped cloud"), b(ins("cumulonimbus", 5), "a thundercloud, and I mean you"), b(ins("ambulatory mattress", 6)),
    b(ins("perambulating cushion", 7)), b(ins("sesquipedalian nuisance", 8)), b(ins("cloud in the shape of a grievance", 9)), b(ins("footnote to a bog", 5)), b(ins("monument to inertia", 6)),
    b(ins("study in reluctance", 5)), b(ins("essay on dampness", 5)), b(ins("treatise on stubbornness", 6)), b(ins("compendium of burrs", 5)), b(ins("encyclopaedia of mud", 7)),
    // Abstract nouns.
    b(abs("perfidy", 3), "treachery"), b(abs("ignominy", 4), "public disgrace"), b(abs("opprobrium", 4), "harsh criticism"), b(abs("obloquy", 3), "abuse; disgrace"), b(abs("vicissitude", 4), "a turn of fortune"),
    b(abs("lassitude", 3), "weariness"), b(abs("ennui", 2)), b(abs("torpor", 2)), b(abs("desuetude", 4), "disuse"), b(abs("chagrin", 2)), b(abs("malaise", 2)), b(abs("melancholia", 5)),
    b(abs("acedia", 4), "spiritual sloth; the noonday demon"), b(abs("disquietude", 4)), b(abs("discomfiture", 4)), b(abs("mortification", 5)), b(abs("exasperation", 5)), b(abs("consternation", 4)),
    b(abs("turpitude", 3), "depravity"), b(abs("decrepitude", 4)), b(abs("inanition", 4), "exhaustion from emptiness"), b(abs("superfluity", 5)), b(abs("absurdity", 4)), b(abs("iniquity", 4)),
    b(abs("indignation", 4)), b(abs("umbrage", 2)), b(abs("dudgeon", 2), "resentment (high)"), b(abs("pique", 1)), b(abs("rancour", 2)), b(abs("vexation", 3)), b(abs("entropy", 3)),
    // Verbs.
    b(verb("perambulate", 4)), b(verb("expostulate", 4), "to reason earnestly with"), b(verb("vociferate", 4), "to shout"), b(verb("remonstrate", 3)), b(verb("excoriate", 4), "to censure severely"),
    b(verb("obfuscate", 3)), b(verb("procrastinate", 4)), b(verb("ruminate", 3)), b(verb("masticate", 3)), b(verb("perspire", 3)), b(verb("gesticulate", 4)), b(verb("ululate", 3), "to howl"),
    b(verb("lament", 2)), b(verb("bewail", 2)), b(verb("deplore", 2)), b(verb("abominate", 4)), b(verb("execrate", 3)), b(verb("anathematize", 5)), b(verb("fulminate", 3), "to thunder against"),
    b(verb("animadvert", 4), "to criticise"), b(verb("castigate", 3)), b(verb("upbraid", 2)), b(verb("vituperate", 4)), b(verb("objurgate", 3), "to rebuke sharply"), b(verb("enumerate", 4)),
    b(verb("catalogue", 3)), b(verb("itemize", 3)), b(verb("tabulate", 3)), b(verb("circumambulate", 5)), b(verb("prevaricate", 4)),
    // Intensifiers.
    b(inten("egregiously", 4)), b(inten("execrably", 4)), b(inten("insufferably", 5)), b(inten("unconscionably", 5)), b(inten("preposterously", 5)), b(inten("stupendously", 4)),
    b(inten("prodigiously", 4)), b(inten("transcendently", 4)), b(inten("ineffably", 4)), b(inten("unutterably", 5)), b(inten("indescribably", 5)), b(inten("immeasurably", 5)),
    b(inten("incalculably", 5)), b(inten("irredeemably", 5)), b(inten("interminably", 5)), b(inten("inexorably", 5)),
    // Similes and threats.
    b(sim("a syllogism in a bog")), b(sim("a Latin grammar in the rain")), b(sim("an encyclopaedia of mud")), b(sim("a footnote to a footnote")), b(sim("a sonnet addressed to a turnip")),
    b(sim("a cathedral built for one goat")), b(sim("a treatise on the wetness of water")), b(sim("an appendix to an appendix")), b(sim("a dissertation on a puddle")), b(sim("a marble statue of a delay")),
    b(threat("compose a monograph on your shortcomings")), b(threat("footnote you")), b(threat("enumerate your faults alphabetically, twice")), b(threat("translate you into Latin and leave you there")),
    b(threat("deliver a lecture to you, with diagrams")), b(threat("read you the appendix")), b(threat("classify you")), b(threat("index you under 'regret'")),
  ],
};

// ---------------------------------------------------------------- Verse
const rh = (fam: string, e: LexEntry): LexEntry => ({ ...e, reg: ["verse", `rhyme:${fam}`] });

export const verseRhymes: LexPack = {
  id: "verse-rhymes",
  title: "A Rhyming Dictionary for Shepherds",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 11,
  entries: [
    // -eep
    rh("eep", n("heap", 1)), rh("eep", adj("steep", 1, { targets: ["terrain"] })), rh("eep", adj("deep", 1, { targets: ["terrain"] })), rh("eep", adj("cheap", 1)), rh("eep", verb("creep", 1)), rh("eep", verb("weep", 1)), rh("eep", verb("sleep", 1)),
    rh("eep", verb("leap", 1)), rh("eep", verb("keep", 1)), rh("eep", verb("seep", 1)), rh("eep", verb("sweep", 1)), rh("eep", verb("peep", 1)), rh("eep", n("sheep", 1, { pl: "sheep" })),
    // -ill
    rh("ill", adj("ill", 1)), rh("ill", adj("still", 1)), rh("ill", adj("shrill", 1)), rh("ill", n("chill", 1)), rh("ill", n("swill", 1, { pl: "-" })), rh("ill", n("mill", 1)), rh("ill", n("quill", 1)),
    rh("ill", n("thrill", 1)), rh("ill", n("frill", 1)), rh("ill", n("dill", 1, { pl: "-" })), rh("ill", n("gill", 1)), rh("ill", verb("spill", 1)), rh("ill", verb("fill", 1)), rh("ill", verb("till", 1)), rh("ill", n("nil", 1, { pl: "-" })),
    // -ain
    rh("ain", n("pain", 1)), rh("ain", adj("plain", 1)), rh("ain", adj("vain", 1)), rh("ain", n("drain", 1)), rh("ain", n("strain", 1)), rh("ain", n("stain", 1)), rh("ain", n("grain", 1, { pl: "-" })),
    rh("ain", n("chain", 1)), rh("ain", n("lane", 1)), rh("ain", n("cane", 1)), rh("ain", n("mane", 1)), rh("ain", n("bane", 1)), rh("ain", verb("wane", 1)), rh("ain", verb("complain", 2)),
    rh("ain", verb("refrain", 2)), rh("ain", abs("disdain", 2)), rh("ain", adj("mundane", 2)), rh("ain", adj("profane", 2)), rh("ain", adj("arcane", 2)), rh("ain", adj("inane", 2)),
    // -ool
    rh("ool", ins("fool", 1)), rh("ool", n("pool", 1)), rh("ool", n("drool", 1, { pl: "-" })), rh("ool", n("stool", 1)), rh("ool", adj("cruel", 2)), rh("ool", n("tool", 1)), rh("ool", n("spool", 1)),
    rh("ool", n("school", 1)), rh("ool", n("rule", 1)), rh("ool", ins("mule", 1)), rh("ool", ins("ghoul", 1)), rh("ool", n("gruel", 2, { pl: "-" })), rh("ool", verb("ridicule", 3)), rh("ool", verb("drool", 1)),
    // -ud
    rh("ud", n("thud", 1)), rh("ud", ins("dud", 1)), rh("ud", n("spud", 1)), rh("ud", n("cud", 1, { pl: "-" })), rh("ud", n("blood", 1, { pl: "-" })), rh("ud", n("bud", 1)), rh("ud", n("flood", 1)),
    rh("ud", n("crud", 1, { pl: "-", band: 1 })), rh("ud", verb("scud", 1)),
    // -og
    rh("og", n("dog", 1)), rh("og", n("log", 1)), rh("og", n("slog", 1)), rh("og", n("cog", 1)), rh("og", n("frog", 1)), rh("og", ins("hog", 1)), rh("og", n("clog", 1)), rh("og", verb("jog", 1)),
    rh("og", n("grog", 1, { pl: "-" })), rh("og", adj("agog", 2)), rh("og", n("smog", 1, { pl: "-" })), rh("og", n("bog", 1)),
    // -ock
    rh("ock", n("clock", 1)), rh("ock", n("flock", 1)), rh("ock", verb("knock", 1)), rh("ock", n("shock", 1)), rh("ock", ins("block", 1)), rh("ock", n("lock", 1)), rh("ock", n("dock", 1)),
    rh("ock", n("frock", 1)), rh("ock", verb("mock", 1)), rh("ock", n("stock", 1, { pl: "-" })), rh("ock", n("crock", 1)), rh("ock", n("hock", 1)), rh("ock", n("gridlock", 2, { pl: "-" })),
    rh("ock", n("padlock", 2)), rh("ock", ins("laughingstock", 3)), rh("ock", n("rock", 1)),
    // -ay
    rh("ay", n("hay", 1, { pl: "-" })), rh("ay", verb("stray", 1)), rh("ay", adj("grey", 1, { targets: ["weather", "day", "terrain"] })), rh("ay", abs("dismay", 2)), rh("ay", verb("pray", 1)), rh("ay", verb("bray", 1)), rh("ay", n("delay", 2)),
    rh("ay", n("clay", 1, { pl: "-" })), rh("ay", n("fray", 1)), rh("ay", verb("sway", 1)), rh("ay", n("tray", 1)), rh("ay", n("bay", 1)), rh("ay", abs("decay", 2)), rh("ay", verb("betray", 2)),
    rh("ay", n("array", 2)), rh("ay", adj("astray", 2)), rh("ay", abs("disarray", 3)), rh("ay", interj("hooray", 2)), rh("ay", n("day", 1, { targets: ["day", "curse"] })),
    // -it
    rh("it", n("bit", 1)), rh("it", verb("spit", 1)), rh("it", n("grit", 1, { pl: "-" })), rh("it", n("wit", 1, { pl: "-" })), rh("it", verb("flit", 1)), rh("it", verb("knit", 1)),
    rh("it", verb("quit", 1)), rh("it", verb("split", 1)), rh("it", n("pit", 1)), rh("it", ins("misfit", 2)), rh("it", adj("counterfeit", 3)), rh("it", adj("unfit", 2)), rh("it", ins("nitwit", 2)),
    // -uck
    rh("uck", n("luck", 1, { pl: "-" })), rh("uck", n("muck", 1, { pl: "-" })), rh("uck", adj("stuck", 1)), rh("uck", n("truck", 1)), rh("uck", n("pluck", 1, { pl: "-" })), rh("uck", n("duck", 1)),
    rh("uck", verb("cluck", 1)), rh("uck", verb("tuck", 1)), rh("uck", n("buck", 1)), rh("uck", verb("chuck", 1)), rh("uck", n("puck", 1)), rh("uck", adj("awestruck", 2)), rh("uck", adj("thunderstruck", 3)), rh("uck", adj("moonstruck", 2)),
    // -ass
    rh("ass", verb("pass", 1)), rh("ass", interj("alas", 2)), rh("ass", n("brass", 1, { pl: "-" })), rh("ass", n("glass", 1)), rh("ass", n("morass", 2)), rh("ass", adj("crass", 1)), rh("ass", n("mass", 1)),
    rh("ass", n("class", 1)), rh("ass", n("sass", 1, { pl: "-" })), rh("ass", verb("trespass", 2)), rh("ass", ins("jackass", 2, { band: 2 })), rh("ass", n("grass", 1, { pl: "-" })),
    // -eat
    rh("eat", n("wheat", 1, { pl: "-" })), rh("eat", n("heat", 1, { pl: "-" })), rh("eat", n("meat", 1, { pl: "-" })), rh("eat", n("seat", 1)), rh("eat", n("treat", 1)), rh("eat", verb("beat", 1)),
    rh("eat", ins("cheat", 1)), rh("eat", abs("defeat", 2)), rh("eat", n("retreat", 2)), rh("eat", verb("repeat", 2)), rh("eat", n("sheet", 1)), rh("eat", adj("effete", 2)), rh("eat", verb("greet", 1)),
    rh("eat", n("peat", 1, { pl: "-" })), rh("eat", n("teat", 1, { band: 1 })), rh("eat", abs("deceit", 2)), rh("eat", abs("conceit", 2)), rh("eat", verb("bleat", 1)),
    // -oat
    rh("oat", n("goat", 1)), rh("oat", n("coat", 1)), rh("oat", n("boat", 1)), rh("oat", n("moat", 1)), rh("oat", verb("bloat", 1)), rh("oat", verb("gloat", 1)), rh("oat", verb("float", 1)),
    rh("oat", n("throat", 1)), rh("oat", n("note", 1)), rh("oat", n("quote", 1)), rh("oat", n("stoat", 1)), rh("oat", adj("afloat", 2)), rh("oat", ins("turncoat", 2)), rh("oat", ins("scapegoat", 2)), rh("oat", n("anecdote", 3)),
    // -ump
    rh("ump", n("bump", 1)), rh("ump", n("dump", 1)), rh("ump", n("hump", 1)), rh("ump", n("rump", 1, { band: 1 })), rh("ump", n("thump", 1)), rh("ump", n("clump", 1)), rh("ump", ins("grump", 1)),
    rh("ump", n("slump", 1)), rh("ump", ins("chump", 1)), rh("ump", ins("mugwump", 2)), rh("ump", n("stump", 1)), rh("ump", ins("lump", 1)),
    // -ew
    rh("ew", n("stew", 1)), rh("ew", verb("chew", 1)), rh("ew", verb("spew", 1)), rh("ew", n("brew", 1)), rh("ew", n("crew", 1)), rh("ew", adj("askew", 2)),
    rh("ew", n("curfew", 2)), rh("ew", n("mildew", 2, { pl: "-" })), rh("ew", n("residue", 3)), rh("ew", n("to-do", 2)), rh("ew", abs("ado", 2)), rh("ew", n("ewe", 1)), rh("ew", n("dew", 1, { pl: "-" })),
    // -ug
    rh("ug", n("bug", 1)), rh("ug", ins("mug", 1)), rh("ug", n("rug", 1)), rh("ug", ins("slug", 1)), rh("ug", adj("smug", 1)), rh("ug", n("jug", 1)), rh("ug", n("plug", 1)),
    rh("ug", verb("chug", 1)), rh("ug", verb("shrug", 1)), rh("ug", oath("humbug", 0, 2)), rh("ug", n("bedbug", 2)), rh("ug", n("ladybug", 3)), rh("ug", verb("lug", 1)),
    // -own / -ound / -air
    rh("own", n("frown", 1)), rh("own", n("gown", 1)), rh("own", ins("clown", 1)), rh("own", n("crown", 1)), rh("own", n("town", 1)), rh("own", abs("renown", 2)), rh("own", n("hand-me-down", 3)),
    rh("ound", n("ground", 1, { pl: "-" })), rh("ound", n("hound", 1)), rh("ound", n("pound", 1)), rh("ound", n("mound", 1)), rh("ound", adj("round", 1, { targets: ["sheep"] })), rh("ound", n("sound", 1)),
    rh("ound", verb("astound", 2)), rh("ound", verb("confound", 2)), rh("ound", verb("surround", 2)),
    rh("air", n("chair", 1)), rh("air", n("affair", 2)), rh("air", n("nightmare", 2)), rh("air", verb("repair", 2)), rh("air", verb("beware", 2)), rh("air", adj("threadbare", 2)),
    rh("air", adj("unaware", 3)), rh("air", n("solitaire", 3)), rh("air", n("hair", 1, { pl: "-" })), rh("air", n("lair", 1)),
    // Verse-flavoured similes.
    rh("none", sim("a sonnet with no last line")), rh("none", sim("a limerick about a funeral")), rh("none", sim("a rhyme for orange")), rh("none", sim("a haiku that runs long")),
    rh("none", sim("a hymn hummed into a bucket")), rh("none", sim("a lullaby sung at a sheep")),
  ],
};

// ---------------------------------------------------------------- Meta
const MT = { reg: ["meta"] };
const m = (e: LexEntry, gloss?: string): LexEntry => (gloss ? { ...e, ...MT, gloss } : { ...e, ...MT });

export const meta: LexPack = {
  id: "meta",
  title: "Notes on the Curse",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 12,
  entries: [
    // Nouns about words.
    m(n("vocabulary", 5)), m(n("syntax", 2, { pl: "-" })), m(n("subordinate clause", 5)), m(n("semicolon", 4)), m(n("thesaurus", 3, { pl: "thesauruses" })), m(n("footnote", 2)), m(n("epilogue", 3)),
    m(n("denouement", 3), "the untying at the end of a story"), m(n("tombstone", 2)), m(n("epitaph", 3)), m(n("tomorrow", 3)), m(n("grammar", 2, { pl: "-" })), m(n("lexicon", 3)), m(n("appendix", 3, { pl: "appendices" })),
    m(n("index", 2, { pl: "indices" })), m(n("glossary", 3)), m(n("punctuation", 4, { pl: "-" })), m(n("adjective", 3)), m(n("adverb", 2)), m(n("participle", 4)), m(n("gerund", 2)), m(n("subjunctive", 3)),
    m(n("apostrophe", 4)), m(n("parenthesis", 4, { pl: "parentheses" })), m(n("ellipsis", 3, { pl: "ellipses" })), m(n("interrobang", 4)), m(n("dictionary", 4)), m(n("monologue", 3)), m(n("soliloquy", 4)),
    m(n("screed", 1)), m(n("tirade", 2)), m(n("diatribe", 3)), m(n("jeremiad", 4), "a long lament"), m(n("philippic", 3), "a bitter attack in words"), m(n("invective", 3, { pl: "-" })), m(n("harangue", 2)),
    m(n("rant", 1)), m(n("sequel", 2)), m(n("rerun", 2)), m(n("encore", 2)), m(n("loop", 1)), m(n("treadmill", 2)), m(n("boulder", 2)), m(n("ledger", 2)), m(n("stone", 1)), m(n("morning after this one", 6)),
    m(n("herder after me", 5)), m(n("first draft", 2)), m(n("second draft", 2)), m(n("footnote to the footnote", 6)), m(n("citation", 3)), m(n("erratum", 3, { pl: "errata" })), m(n("preface", 2)),
    // Adjectives about words and fate.
    m(adj("articulate", 4)), m(adj("verbose", 2)), m(adj("grandiloquent", 4), "pompous in speech"), m(adj("redundant", 3)), m(adj("recursive", 3)), m(adj("eternal", 3)), m(adj("Sisyphean", 4), "endless and futile, like a hill"),
    m(adj("predestined", 3)), m(adj("inevitable", 5)), m(adj("perpetual", 4)), m(adj("circular", 3)), m(adj("repetitive", 4)), m(adj("iterative", 4)), m(adj("cyclical", 3)), m(adj("unending", 3)),
    m(adj("unabridged", 3)), m(adj("annotated", 4)), m(adj("footnoted", 3)), m(adj("parenthetical", 5)), m(adj("polysyllabic", 5)), m(adj("monosyllabic", 5)), m(adj("ungrammatical", 5)),
    m(adj("well-read", 2)), m(adj("overeducated", 5)), m(adj("self-aware", 3)), m(adj("quotable", 3)), m(adj("epigrammatic", 5)), m(adj("prolix", 2), "tediously lengthy"), m(adj("loquacious", 3)),
    m(adj("garrulous", 3)), m(adj("voluble", 3)), m(adj("unpublishable", 5)), m(adj("out of print", 3)), m(adj("posthumous", 3)), m(adj("apocryphal", 4)), m(adj("canonical", 4)),
    // Verbs.
    m(verb("annotate", 3)), m(verb("footnote", 2)), m(verb("paraphrase", 3)), m(verb("recant", 2)), m(verb("reiterate", 4)), m(verb("recapitulate", 5)), m(verb("summarize", 3)), m(verb("abridge", 2)),
    m(verb("revise", 2)), m(verb("transcribe", 2)), m(verb("dictate", 2)), m(verb("declaim", 2)), m(verb("orate", 2)), m(verb("pontificate", 4)), m(verb("soliloquize", 4)), m(verb("editorialize", 5)),
    m(verb("digress", 2)), m(verb("conclude", 2)), m(verb("resume", 2)), m(verb("recur", 2)), m(verb("repeat", 2)), m(verb("quote", 1)), m(verb("misquote", 2)),
    // Abstract.
    m(abs("irony", 3)), m(abs("recurrence", 3)), m(abs("redundancy", 4)), m(abs("verbosity", 4)), m(abs("eloquence", 3)), m(abs("posterity", 4)), m(abs("eternity", 4)), m(abs("hindsight", 2)),
    m(abs("foresight", 2)), m(abs("déjà vu", 3)), m(abs("circularity", 5)), m(abs("inevitability", 6)), m(abs("self-awareness", 4)), m(abs("bathos", 2), "a lurch from the sublime to the ridiculous"),
    m(abs("pathos", 2)), m(abs("anticlimax", 4)), m(abs("catharsis", 3), "purging; there was none"), m(abs("closure", 2), "not available"),
    // Addressing the Curse.
    m(pan("O Curse")), m(pan("by the Curse that made me")), m(pan("Curse, you old friend")), m(pan("by the stone I will not see")), m(pan("by the herder who comes after me")), m(pan("by every tomorrow")),
    m(pan("in the name of the epilogue")), m(pan("by the ink and the sheep")), m(pan("O Author of this pasture")), m(pan("by the last page")),
    // Oaths.
    m(oath("footnote it", 0, 3)), m(oath("strike that", 0, 2)), m(oath("see appendix", 0, 4)), m(oath("citation needed", 0, 5)), m(oath("end of quote", 0, 3)), m(oath("full stop", 0, 2)), m(oath("new paragraph", 0, 4)),
    m(oath("sic", 0, 1)), m(oath("et cetera", 0, 4)), m(oath("quod erat demonstrandum", 0, 7)), m(oath("damn it, in the original Latin", 2, 8)), m(oath("hell, and I have read the etymology", 2, 10)),
    m(oath("to be continued", 0, 5)), m(oath("as I was saying", 0, 5)), m(oath("where was I", 0, 3)), m(oath("as foretold", 0, 3)),
    m(interj("ahem", 2)), m(interj("anyway", 3)), m(interj("moreover", 3)), m(interj("nevertheless", 4)), m(interj("in conclusion", 4)), m(interj("as I say", 3)),
    // Similes and threats.
    m(sim("a footnote to a footnote")), m(sim("a sequel nobody asked for")), m(sim("a semicolon in a shopping list")), m(sim("a thesaurus with one word in it")), m(sim("an encore for an empty room")),
    m(sim("a sonnet about a spreadsheet")), m(sim("a monologue in an empty barn")), m(sim("the last page of a book about sheep")), m(sim("a rerun of a rerun")), m(sim("a boulder with a schedule")),
    m(threat("footnote you")), m(threat("put you in the index under 'regret'")), m(threat("write you a limerick and read it at your shearing")), m(threat("make you the subject of a monograph")),
    m(threat("describe you to posterity")), m(threat("put you on the stone")), m(threat("quote you back at yourself")), m(threat("abridge you")), m(threat("leave you out of the sequel")),
  ],
};

export const PACKS_9_12: LexPack[] = [baroqueLatinate, verseRhymes, meta];
