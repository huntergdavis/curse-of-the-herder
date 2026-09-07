// Core lexicon packs, levels 0-4 plus the profanity packs that unlock later.
// Format follows docs/research/LEXICON.md. Every pack needs a reviewedAt
// date or the loader refuses it. See docs/research/CONTENT_POLICY.md.
import type { LexEntry, LexPack } from "../../core/lang/types";

const n = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "noun", band: 0, level: 0, ...extra });
const adj = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "adj", band: 0, level: 0, ...extra });
const ins = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "insult", band: 0, level: 0, ...extra });
const interj = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "interj", band: 0, level: 0, ...extra });
const oath = (w: string, band: 0 | 1 | 2 | 3 | 4, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "oath", band, level: 0, ...extra });
const inten = (w: string, band: 0 | 1 | 2 | 3 | 4 = 0, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "intensifier", band, level: 0, ...extra });
const sim = (w: string): LexEntry => ({ w, pos: "simile", band: 0, level: 0 });
const verb = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "verb", band: 0, level: 0, ...extra });
const body = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "bodypart", band: 0, level: 0, ...extra });
const abs = (w: string): LexEntry => ({ w, pos: "abstract", band: 0, level: 0, pl: "-" });
const pan = (w: string): LexEntry => ({ w, pos: "pantheon", band: 0, level: 0 });
const threat = (w: string): LexEntry => ({ w, pos: "threat", band: 0, level: 0 });
const swear = (w: string, band: 1 | 2 | 3 | 4, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "swear", band, level: 0, ...extra });

export const primer: LexPack = {
  id: "primer",
  title: "A Child's First Words for the Farm",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 0,
  entries: [
    n("mud", { pl: "-", tombstoneSafe: true }), n("hill"), n("rain", { pl: "-" }), n("wool", { pl: "-" }), n("hoof"), n("sheep", { pl: "sheep" }),
    n("grass", { pl: "-" }), n("stone"), n("rock"), n("wind", { pl: "-" }), n("fence"), n("gate"), n("ditch"), n("bog"), n("cloud"),
    n("sun", { pl: "-" }), n("sky", { pl: "-" }), n("stick"), n("crook"), n("boot"), n("sock"), n("hat"), n("puddle"), n("slope"),
    n("field"), n("thistle"), n("nettle"), n("bramble"), n("burr"), n("turnip"), n("parsnip"), n("cabbage"), n("bucket"), n("trough"),
    n("hay", { pl: "-" }), n("straw", { pl: "-" }), n("midge"), n("fly", { pl: "flies" }), n("beetle"), n("worm"), n("stile"), n("hedge"),
    n("pebble"), n("twig"), n("dew", { pl: "-" }), n("fog", { pl: "-" }), n("frost", { pl: "-" }), n("pat"), n("dung", { pl: "-" }),
    interj("ugh"), interj("bah"), interj("hmph"), interj("oof"), interj("gah"), interj("argh"), interj("pah"), interj("tsk"),
    interj("hnng"), interj("feh"), interj("meh"), interj("oy"), interj("hah"), interj("no"), interj("why"), interj("again"),
    interj("right"), interj("well"), interj("honestly"), interj("typical"), interj("lovely"), interj("marvellous"), interj("wonderful"),
    body("knees"), n("back", { pl: "-" }), body("feet"), body("legs"), body("hands"), body("elbows"), n("neck", { pl: "-" }),
    body("shoulders"), body("toes"), n("spine", { pl: "-" }), body("lungs"), body("ankles"), body("hips"), body("thumbs"), body("teeth"), body("eyebrows"), body("kneecaps"), body("heels"), body("shins"), body("fingers"), body("ears"),
    verb("walk"), verb("carry"), verb("climb"), verb("wade"), verb("slip"), verb("trudge"), verb("drag"), verb("lift"), verb("chase"),
    verb("fetch"), verb("stumble"), verb("squelch"), verb("haul"), verb("lug"), verb("plod"), verb("shuffle"), verb("stagger"), verb("sigh"),
    pan("by the Ewe Mother"), pan("Saint Woolgather preserve me"), pan("by the Patron of Lost Things"), pan("Great Ram above"),
    pan("merciful Shears"), pan("by the Bell of the First Wether"), pan("Holy Fleece"), pan("by the Green Pasture"), pan("sweet Saint Bleat"),
    pan("by all the lambs of March"), pan("Blessed Crook"), pan("by the Long Fence"), pan("Saint Woolgather's knees"),
  ],
};

export const farmyard: LexPack = {
  id: "farmyard",
  title: "The Sad Almanac",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 1,
  entries: [
    adj("soggy"), adj("heavy"), adj("wet"), adj("cold"), adj("muddy"), adj("slow"), adj("lumpy"), adj("woolly", { targets: ["sheep"] }), adj("stubborn"), adj("damp"),
    adj("sodden"), adj("daft"), adj("silly"), adj("steep", { targets: ["terrain"] }), adj("prickly"), adj("itchy"), adj("sticky"), adj("greasy"),
    adj("smelly"), adj("dripping"), adj("bleating", { targets: ["sheep"] }), adj("wobbly"), adj("useless"), adj("hopeless"), adj("wretched"), adj("miserable"), adj("dreadful"),
    adj("rotten"), adj("pointless"), adj("endless"), adj("thankless"), adj("bothersome"), adj("tiresome"), adj("blasted", { band: 1 }),
    adj("bony"),
    adj("chewy", { targets: ["sheep"] }), adj("windy", { targets: ["weather", "day"] }), adj("rainy", { targets: ["weather", "day"] }), adj("foggy", { targets: ["weather", "day", "terrain"] }), adj("boggy", { targets: ["terrain"] }), adj("rocky", { targets: ["terrain"] }), adj("thorny", { targets: ["terrain"] }), adj("weedy", { targets: ["terrain"] }), adj("mossy", { targets: ["terrain"] }), adj("dank"),
    adj("clammy"), adj("squelchy", { targets: ["terrain", "sheep"] }), adj("slimy"), adj("gritty", { targets: ["terrain", "self"] }), adj("crumbly", { targets: ["terrain"] }), adj("soppy"), adj("dozy"), adj("ornery"), adj("cussed"), adj("weary"), adj("footsore"), adj("cantankerous"), adj("pig-headed"), adj("bone-idle"), adj("no-good"), adj("sorry"), adj("pitiful"), adj("lousy"), adj("shabby"), adj("mangy"), adj("scraggy"),
    adj("contrary"), adj("obstinate"), adj("mulish"), adj("goatish"), adj("gormless"), adj("witless"), adj("feckless"), adj("hapless"),
    n("day", { targets: ["day"] }), n("morning", { pl: "-" }), n("afternoon", { pl: "-" }), n("evening", { pl: "-" }), n("week", { pl: "-" }),
    n("weather", { pl: "-" }), n("drizzle", { pl: "-" }), n("sleet", { pl: "-" }), n("gale"), n("breeze"), n("cloudburst"), n("downpour"),
    n("pail"), n("wheelbarrow"), n("scarecrow"), n("haystack"), n("cowpat"), n("molehill"), n("rabbit hole"), n("ant"), n("wasp"), n("gnat"),
    verb("bleat"), verb("wander"), verb("bolt"), verb("scatter"), verb("dawdle"), verb("loiter"), verb("hide"), verb("stare"), verb("chew"),
    verb("mope"), verb("grumble"), verb("mutter"), verb("curse"), verb("swear"), verb("limp"), verb("ache"), verb("throb"),
  ],
};

export const insultsClassic: LexPack = {
  id: "insults-classic",
  title: "Grumbles of the Lower Field",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 2,
  entries: [
    ins("lump"), ins("oaf"), ins("dolt"), ins("clod"), ins("clodhopper"), ins("lummox"), ins("ninny"), ins("nincompoop"), ins("fopdoodle"),
    ins("blatherskite"), ins("snollygoster"), ins("dunderhead"), ins("muttonhead"), ins("blockhead"), ins("noodle"), ins("twit"), ins("dingbat"),
    ins("dullard"), ins("layabout"), ins("ne'er-do-well"), ins("scoundrel"), ins("rascal"), ins("rogue"), ins("wretch"), ins("wastrel"),
    ins("gasbag"), ins("windbag"), ins("mooncalf", { pl: "mooncalves" }), ins("ninnyhammer"), ins("jobbernowl"), ins("gobemouche"), ins("gnashgab"),
    ins("lubberwort"), ins("muck-spout"), ins("rapscallion"), ins("gudgeon"), ins("saddle-goose", { pl: "saddle-geese" }), ins("scobberlotcher"),
    ins("loiter-sack"), ins("whiffle-whaffle"), ins("zounderkite"), ins("cumberworld"), ins("gollumpus"), ins("slubberdegullion"), ins("dalcop"),
    ins("clot"), ins("twerp"), ins("nit"), ins("wazzock"), ins("prat", { band: 1 }), ins("pillock", { band: 1 }), ins("plonker", { band: 1 }),
    ins("goose", { pl: "geese" }), ins("turnip"), ins("pudding"), ins("bag of wool"), ins("cloud with legs"), ins("wool-sack"), ins("fleece-bag"),
    ins("mattress"), ins("dumpling"), ins("bolster"), ins("hummock"), ins("hassock"), ins("bollard"), ins("footstool"), ins("doorstop"),
    ins("disappointment"), ins("nuisance"), ins("menace"), ins("liability"), ins("mistake"), ins("inconvenience"), ins("obstacle"), ins("pest"), ins("blighter"), ins("reprobate"), ins("miscreant"), ins("lout"), ins("brute"), ins("villain"), ins("good-for-nothing"), ins("waste of wool"), ins("walking haystack"),
    adj("doltish"), adj("oafish"), adj("addle-pated"), adj("mutton-headed", { targets: ["sheep"] }), adj("thick-fleeced", { targets: ["sheep"] }), adj("half-baked"), adj("wool-brained", { targets: ["sheep"] }),
    adj("muddle-headed"), adj("cack-handed", { band: 1 }), adj("hare-brained"), adj("ham-fisted"), adj("slack-jawed"), adj("cud-chewing", { targets: ["sheep"] }),
    adj("mud-caked"), adj("moss-covered"), adj("weather-beaten"), adj("rain-soaked"), adj("wind-blown"), adj("dew-dampened"), adj("burr-ridden"),
    adj("four-footed", { targets: ["sheep"] }), adj("flea-bitten"), adj("moth-eaten"), adj("worm-eaten"), adj("bone-headed"), adj("thick-skulled"), adj("dim-witted"), adj("slow-witted"), adj("lazy"), adj("idle"), adj("shiftless"), adj("truculent"), adj("insolent"), adj("impudent"),
    adj("ill-favoured"), adj("ill-tempered"), adj("ill-mannered"), adj("ill-advised"), adj("misbegotten"), adj("good-for-nothing"),
    adj("confounded", { band: 1 }), adj("infernal", { band: 1 }), adj("accursed", { band: 1 }), adj("benighted"), adj("beggarly"), adj("pestilent"),
    threat("knit you into a scarf"), threat("turn you into a very slow sweater"), threat("make you into mittens"),
    threat("shear you in a pattern you will not enjoy"), threat("put you on a hill and take the hill away"), threat("sell you to a man who makes rugs"),
    threat("explain the pen to you, at length"), threat("carry you upside down"), threat("give you a name and then never use it"),
    threat("write to the Sheep Council"), threat("tell the other sheep about you"), threat("make you walk back"), threat("count you twice"),
    threat("put you in the pen with the goat"), threat("describe you to your mother"), threat("read to you"), threat("stop carrying you"),
    threat("shear you into a hat"), threat("turn you into socks for a man with cold feet and no gratitude"), threat("enter you in a show and lose"),
  ],
};

export const similes: LexPack = {
  id: "similes",
  title: "One Hundred Things That Are Slow",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 3,
  entries: [
    sim("wet bread"), sim("a dropped pie"), sim("a Tuesday"), sim("a fence post in a debate"), sim("a bag of damp hammers"), sim("a sock full of porridge"),
    sim("a snail on holiday"), sim("a puddle's ambition"), sim("a cabbage with opinions"), sim("a bucket with no bottom"), sim("cold gravy"),
    sim("a brick in a sack"), sim("a haystack in the rain"), sim("a pudding left out"), sim("a turnip at a dance"), sim("a door that opens the wrong way"),
    sim("a wheelbarrow with one wheel"), sim("a candle in a bucket"), sim("a duck in a hat"), sim("a stile with a grudge"), sim("a very old cheese"),
    sim("a goat's apology"), sim("a wet Wednesday"), sim("a sheep that has seen things"), sim("an unlit lantern"), sim("porridge on a slope"),
    sim("a moth with a mortgage"), sim("a broken sundial"), sim("gravy on a hill"), sim("a pancake with a grievance"), sim("a hedge in an argument"),
    sim("a scarecrow's promise"), sim("soup in a sieve"), sim("a cloud that owes money"), sim("a ladder with ideas"), sim("a fog with a plan"),
    sim("a boot full of rain"), sim("a stew nobody ordered"), sim("a kettle in a field"), sim("a bell with no clapper"), sim("a pie with no filling"),
    sim("a sundial at midnight"), sim("a mattress in a river"), sim("an owl at noon"), sim("a signpost that points at itself"), sim("a lullaby for a rock"),
    sim("a cushion in a thunderstorm"), sim("a ferry with no far bank"), sim("a rumour about turnips"), sim("a letter to a fence"), sim("a picnic in a bog"),
    sim("a shoe in a hedge"), sim("a hymn sung to a bucket"), sim("the wrong end of a cow"), sim("a well with a lid on"), sim("a sermon in the rain"),
    sim("last week's porridge"), sim("a sandwich left on a wall"), sim("a hat on a scarecrow's day off"), sim("a bridge over dry land"), sim("a sigh with a beard"),
    abs("regret"), abs("despair"), abs("disappointment"), abs("misery"), abs("woe"), abs("futility"), abs("exhaustion"), abs("spite"), abs("ruin"),
    abs("drudgery"), abs("tedium"), abs("sorrow"), abs("grievance"), abs("doom"), abs("consequence"), abs("bad decisions"), abs("poor choices"),
    abs("lost time"), abs("wasted effort"), abs("damp"), abs("gloom"), abs("indignity"), abs("bother"), abs("spent patience"), abs("unfinished business"),
  ],
};

export const mincedOaths: LexPack = {
  id: "minced-oaths",
  title: "Manners for the Exasperated Gentleman",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 4,
  entries: [
    oath("blast", 1), oath("drat", 1), oath("dash it", 1), oath("dash it all", 1), oath("confound it", 1), oath("bother", 1), oath("botheration", 1),
    oath("zounds", 1), oath("gadzooks", 1), oath("odds bodkins", 1), oath("crikey", 1), oath("strewth", 1), oath("blimey", 1), oath("good grief", 1),
    oath("great heavens", 1), oath("heavens above", 1), oath("by thunder", 1), oath("thunderation", 1), oath("tarnation", 1), oath("consarn it", 1),
    oath("dagnabbit", 1), oath("fiddlesticks", 1), oath("poppycock", 1), oath("codswallop", 1), oath("sugar", 1), oath("crumbs", 1),
    oath("stone the crows", 1), oath("well I never", 1), oath("curse it", 1), oath("plague take it", 1), oath("a pox on it", 1), oath("hang it all", 1),
    oath("devil take it", 1), oath("perdition", 1), oath("mercy", 1), oath("saints preserve us", 1), oath("great Scott", 1), oath("bless my boots", 1),
     oath("for the love of wool", 0), oath("oh, for goodness' sake", 0), oath("well, that is just lovely", 0), oath("mercy me", 0), oath("good gravy", 0), oath("great galloping goats", 0), oath("suffering sheepdogs", 0), oath("holy haystacks", 0), oath("jumping jackrabbits", 0), oath("by my boots", 0), oath("wool and water", 0), oath("sheep and shears", 0), oath("bless me", 0), oath("of all the things", 0), oath("oh, marvellous", 0), oath("oh, wonderful", 0), oath("give me strength", 0), oath("not again", 0), oath("oh, for pity's sake", 0), oath("well, that is that", 0), oath("sweet mother of mutton", 0), oath("oh, come on", 0), oath("oh, honestly", 0),
    oath("fie", 1), oath("faugh", 1), oath("pshaw", 1), oath("horsefeathers", 1), oath("balderdash", 1), oath("bosh", 1), oath("tommyrot", 1),
    inten("bally", 1), inten("flipping", 1), inten("blinking", 1), inten("blooming", 1), inten("jolly", 0), inten("dashed", 1), inten("blessed", 1),
    inten("confounded", 1), inten("infernal", 1), inten("accursed", 1), inten("thrice-cursed", 1), inten("perishing", 1), inten("blasted", 1),
    inten("utterly"), inten("thoroughly"), inten("entirely"), inten("absolutely"), inten("frankly"), inten("positively"), inten("monumentally"),
    inten("spectacularly"), inten("heroically"), inten("magnificently"), inten("catastrophically"), inten("profoundly"), inten("cosmically"),
  ],
};

export const mildProfanity: LexPack = {
  id: "mild-profanity",
  title: "Words Overheard at the Cattle Market",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 2,
  entries: [
    oath("damn", 2), oath("damn it", 2), oath("dammit", 2), oath("hell", 2), oath("bloody hell", 2), oath("hell's bells", 2), oath("hell's teeth", 2),
    oath("crap", 2), oath("oh, crap", 2), oath("arse", 2), oath("sod it", 2), oath("bugger", 2), oath("bugger it", 2), oath("bugger this", 2),
    oath("goddamn it", 2), oath("hellfire", 2), oath("damn and blast", 2), oath("bloody Nora", 2), oath("hell and damnation", 2), oath("bugger me", 2), oath("sod this", 2), oath("Christ on a bike", 2), oath("Jesus wept", 2), oath("for crying out loud", 0), oath("bloody buggering hell", 2), oath("damn and double damn", 2),
    inten("damned", 2), inten("bloody", 2), inten("sodding", 2), inten("ruddy", 1), inten("crappy", 2), inten("flaming", 1), inten("goddamn", 2),
    inten("bleeding", 2), inten("blasted", 1), inten("damnable", 2), inten("hellish", 2),
    swear("Arse", 2, { tombstoneSafe: true }), swear("Crap", 2, { tombstoneSafe: true }), swear("Hell", 2, { tombstoneSafe: true }), swear("Damn", 2, { tombstoneSafe: true }),
    swear("Bugger", 2, { tombstoneSafe: true }), swear("Sod it", 2, { tombstoneSafe: true }),
    ins("sod", { band: 2 }), ins("git", { band: 2 }), ins("bugger", { band: 2 }), ins("arse", { band: 2 }), ins("damned nuisance", { band: 2 }),
    ins("bloody menace", { band: 2 }), ins("hell-bound wool-sack", { band: 2 }), ins("tosspot", { band: 2 }), ins("sodding nuisance", { band: 2 }), ins("bloody fool", { band: 2 }), ins("damned disgrace", { band: 2 }), ins("arse-end of a sheep", { band: 2, targets: ["sheep", "terrain", "day"] }),
    adj("bloody-minded", { band: 2 }), adj("damnable", { band: 2 }), adj("hellish", { band: 2 }), adj("god-forsaken", { band: 2 }), adj("bloody useless", { band: 2 }),
  ],
};

export const strongProfanity: LexPack = {
  id: "strong-profanity",
  title: "The Drover's Private Vocabulary",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 4,
  entries: [
    oath("shit", 3), oath("shite", 3), oath("oh, shit", 3), oath("bollocks", 3), oath("piss", 3), oath("piss on it", 3), oath("bastard", 3),
    oath("shit and bollocks", 3), oath("bollocking hell", 3), oath("holy shit", 3), oath("pissing hell", 3), oath("arse-biscuits", 3),
    inten("bastard", 3), inten("pissing", 3), inten("shitting", 3), inten("bollocking", 3), inten("shit-caked", 3),
    swear("Shit", 3, { tombstoneSafe: true }), swear("Bollocks", 3, { tombstoneSafe: true }), swear("Shite", 3, { tombstoneSafe: true }),
    swear("Piss", 3, { tombstoneSafe: true }), swear("Bastard", 3, { tombstoneSafe: true }),
    ins("bastard", { band: 3 }), ins("shitehawk", { band: 3 }), ins("arsehole", { band: 3 }), ins("wanker", { band: 3, targets: ["sheep"] }),
    ins("prick", { band: 3, targets: ["sheep", "terrain"] }), ins("piss-artist", { band: 3 }), ins("shit-magnet", { band: 3 }), ins("bollock", { band: 3 }), ins("shit-for-brains", { band: 3 }), ins("arse-wipe", { band: 3 }), ins("piss-pot", { band: 3 }), ins("shitbag", { band: 3 }), ins("bollock-brain", { band: 3 }), ins("sack of shit", { band: 3 }),
    adj("shitty", { band: 3 }), adj("pissy", { band: 3 }), adj("bastardly", { band: 3 }), adj("bollocksed", { band: 3 }), adj("shit-stained", { band: 3 }), adj("piss-poor", { band: 3 }), adj("bollock-brained", { band: 3 }), adj("shit-eating", { band: 3, targets: ["sheep"] }), adj("arse-backwards", { band: 3 }),
    oath("bloody buggering shit", 3), oath("well, bugger me sideways", 3), oath("piss and vinegar", 3), oath("shit on a stick", 3),
  ],
};

export const fWord: LexPack = {
  id: "f-word",
  title: "One Word, Many Uses",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 6,
  entries: [
    oath("fuck", 4), oath("fuck it", 4), oath("fuck this", 4), oath("oh, fuck", 4), oath("fucking hell", 4), oath("fuck me sideways", 4), oath("for fuck's sake", 4),
    inten("fucking", 4), inten("absolutely fucking", 4), inten("motherfucking", 4, { targets: ["terrain", "weather", "day", "curse"] }),
    swear("Fuck", 4, { tombstoneSafe: true }), swear("Fuck it", 4, { tombstoneSafe: true }), swear("Fucking hell", 4, { tombstoneSafe: true }),
    ins("fuckwit", { band: 4 }), ins("fucking liability", { band: 4 }), ins("fuck-knuckle", { band: 4 }), ins("fucknugget", { band: 4 }),
    adj("fucking", { band: 4 }), adj("fucked", { band: 4, targets: ["terrain", "day", "self", "curse"] }),
  ],
};

/** What every herder knows before he has read a word: the short, sharp stuff. */
export const stingers: LexPack = {
  id: "stingers",
  title: "Born Knowing",
  curator: "hunter",
  reviewedAt: "2026-09-07",
  level: 0,
  entries: [
    oath("damn", 2), oath("damn it", 2), oath("hell", 2), oath("bloody hell", 2), oath("blast", 1), oath("bugger", 2), oath("sod it", 2), oath("arse", 2),
    oath("oh, hell", 2), oath("hell's teeth", 2), oath("crap", 2), oath("drat", 1), oath("bother", 1), oath("blast it", 1), oath("damn and blast", 2),
    oath("bollocks", 3), oath("shit", 3), oath("oh, shit", 3), oath("bastard", 3),
    swear("Damn", 2, { tombstoneSafe: true }), swear("Hell", 2, { tombstoneSafe: true }), swear("Bugger", 2, { tombstoneSafe: true }), swear("Arse", 2, { tombstoneSafe: true }),
    swear("Shit", 3, { tombstoneSafe: true }), swear("Bollocks", 3, { tombstoneSafe: true }), swear("Blast", 1, { tombstoneSafe: true }),
    inten("bloody", 2), inten("damned", 2), inten("sodding", 2), inten("blasted", 1), inten("bastard", 3), inten("shitting", 3),
    ins("sod", { band: 2 }), ins("git", { band: 2 }), ins("bastard", { band: 3 }), ins("arse", { band: 2 }),
  ],
};

/** Kitchen abuse, from a book found on the road. */
export const culinary: LexPack = {
  id: "culinary",
  title: "The Cook's Oracle",
  curator: "hunter",
  reviewedAt: "2026-09-07",
  level: 5,
  entries: [
    ins("suet pudding", { reg: ["culinary"] }), ins("lump of cold gristle", { reg: ["culinary"] }), ins("dripping-pot", { reg: ["culinary"] }), ins("burnt crust", { reg: ["culinary"] }),
    ins("boiled cabbage", { reg: ["culinary"] }), ins("cold porridge", { reg: ["culinary"] }), ins("week-old loaf", { reg: ["culinary"] }), ins("dumpling", { reg: ["culinary"] }),
    ins("rind", { reg: ["culinary"] }), ins("gizzard", { reg: ["culinary"] }), ins("tripe", { reg: ["culinary"], pl: "-" }), ins("offal", { reg: ["culinary"], pl: "-" }),
    ins("stale bun", { reg: ["culinary"] }), ins("wet biscuit", { reg: ["culinary"] }), ins("failed soufflé", { reg: ["culinary"] }), ins("mutton chop", { reg: ["culinary"] }),
    ins("bag of giblets", { reg: ["culinary"] }), ins("jellied eel", { reg: ["culinary"] }), ins("burnt sausage", { reg: ["culinary"] }), ins("pickled egg", { reg: ["culinary"] }),
    adj("stodgy", { reg: ["culinary"] }), adj("lardy", { reg: ["culinary"] }), adj("overboiled", { reg: ["culinary"] }), adj("curdled", { reg: ["culinary"] }),
    adj("rancid", { reg: ["culinary"] }), adj("gristly", { reg: ["culinary"] }), adj("underdone", { reg: ["culinary"] }), adj("lumpy", { reg: ["culinary"] }),
    adj("half-chewed", { reg: ["culinary"] }), adj("greasy", { reg: ["culinary"] }), adj("congealed", { reg: ["culinary"] }), adj("tepid", { reg: ["culinary"] }),
    adj("gone off", { reg: ["culinary"] }), adj("stale", { reg: ["culinary"] }), adj("indigestible", { reg: ["culinary"] }), adj("unseasoned", { reg: ["culinary"] }),
    sim("a stew nobody stirred"), sim("gravy that has given up"), sim("a pudding left on the sill"), sim("a boiled egg with a grudge"), sim("dripping on a cold plate"),
    threat("boil you slowly and season you badly"), threat("serve you at a wedding nobody attends"), threat("put you in a pie and label it turnip"),
    n("gruel", { pl: "-" }), n("suet", { pl: "-" }), n("dripping", { pl: "-" }), n("gristle", { pl: "-" }), n("lard", { pl: "-" }),
  ],
};

/** Legalese, from a dictionary found by the road. */
export const legal: LexPack = {
  id: "legal",
  title: "Black's Law Dictionary",
  curator: "hunter",
  reviewedAt: "2026-09-07",
  level: 6,
  entries: [
    ins("party of the first part", { reg: ["legal"] }), ins("defendant", { reg: ["legal"] }), ins("respondent", { reg: ["legal"] }), ins("recidivist", { reg: ["legal"] }),
    ins("absconder", { reg: ["legal"] }), ins("trespasser", { reg: ["legal"] }), ins("public nuisance", { reg: ["legal"] }), ins("attractive nuisance", { reg: ["legal"] }),
    ins("tortfeasor", { reg: ["legal"] }), ins("vagrant", { reg: ["legal"] }), ins("chattel", { reg: ["legal"] }), ins("encumbrance", { reg: ["legal"] }),
    ins("liability", { reg: ["legal"] }), ins("breach", { reg: ["legal"], pl: "breaches" }), ins("estray", { reg: ["legal"], gloss: "a wandering domestic animal, in law" }),
    adj("aforesaid", { reg: ["legal"] }), adj("hereinafter", { reg: ["legal"] }), adj("negligent", { reg: ["legal"] }), adj("wilful", { reg: ["legal"] }),
    adj("contumacious", { reg: ["legal"], gloss: "stubbornly disobedient to authority" }), adj("in flagrant breach", { reg: ["legal"] }), adj("without prejudice", { reg: ["legal"] }),
    adj("in contempt", { reg: ["legal"] }), adj("ultra vires", { reg: ["legal"], gloss: "beyond one's powers" }), adj("non-compliant", { reg: ["legal"] }),
    adj("inadmissible", { reg: ["legal"] }), adj("actionable", { reg: ["legal"] }), adj("hereby dismissed", { reg: ["legal"] }),
    abs("liability"), abs("negligence"), abs("contempt"), abs("malfeasance"), abs("misadventure"), abs("prior notice"),
    oath("objection", 0, { reg: ["legal"] }), oath("overruled", 0, { reg: ["legal"] }), oath("I rest my case", 0, { reg: ["legal"] }), oath("case dismissed", 0, { reg: ["legal"] }),
    { w: "serve you with papers", pos: "threat", band: 0, level: 0, reg: ["legal"] }, { w: "read you your rights, all of which you have forfeited", pos: "threat", band: 0, level: 0, reg: ["legal"] }, { w: "enter you into evidence", pos: "threat", band: 0, level: 0, reg: ["legal"] }, { w: "find against you, with costs", pos: "threat", band: 0, level: 0, reg: ["legal"] },
  ],
};

/** Knitting: the threats are the point. */
export const knitting: LexPack = {
  id: "knitting",
  title: "A Treatise on Knitting",
  curator: "hunter",
  reviewedAt: "2026-09-07",
  level: 3,
  entries: [
    { w: "knit you into a cardigan for a man I do not like", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "make you into a tea cosy", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "turn you into bed socks for a very cold widow", pos: "threat", band: 0, level: 0, reg: ["knitting"] },
    { w: "card you, spin you and knit you into something regrettable", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "make you into a bobble hat and wear you to market", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "unravel you and start again", pos: "threat", band: 0, level: 0, reg: ["knitting"] },
    { w: "knit you into a scarf so long it goes twice round the hill", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "purl you", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "make you into oven gloves", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "darn you", pos: "threat", band: 0, level: 0, reg: ["knitting"] },
    { w: "make you a jumper and give it to the dog", pos: "threat", band: 0, level: 0, reg: ["knitting"] }, { w: "knit you a jumper and make you wear it", pos: "threat", band: 0, level: 0, reg: ["knitting"] },
    ins("ball of wool", { reg: ["knitting"] }), ins("dropped stitch", { reg: ["knitting"] }), ins("tangle", { reg: ["knitting"] }), ins("unfinished jumper", { reg: ["knitting"] }),
    ins("bobble", { reg: ["knitting"] }), ins("tea cosy", { reg: ["knitting"] }), ins("skein of trouble", { reg: ["knitting"] }), ins("moth-bait", { reg: ["knitting"] }),
    adj("knotted", { reg: ["knitting"] }), adj("frayed", { reg: ["knitting"] }), adj("unravelled", { reg: ["knitting"] }), adj("felted", { reg: ["knitting"] }),
    adj("bobbly", { reg: ["knitting"] }), adj("moth-eaten", { reg: ["knitting"] }), adj("loose-knit", { reg: ["knitting"] }), adj("badly cast on", { reg: ["knitting"] }),
    sim("a jumper knitted by a distant aunt"), sim("a scarf with no end"), sim("a ball of wool the cat found first"),
  ],
};

export const CORE_PACKS: LexPack[] = [primer, stingers, farmyard, insultsClassic, similes, mincedOaths, mildProfanity, strongProfanity, fWord, culinary, legal, knitting];
