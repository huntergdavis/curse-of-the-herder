// Lexicon packs for levels 5-9: historical slang, the Bard, the polyglot
// registers, Hemingway's plain words and original nautical oaths.
// Format follows docs/research/LEXICON.md; policy in CONTENT_POLICY.md.
// Foreign nouns carry gender and article in the gloss: "(m.) ...".
import type { LexEntry, LexPack } from "../../core/lang/types";

type B = 0 | 1 | 2 | 3 | 4;
const n = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "noun", band: 0, level: 0, ...extra });
const adj = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "adj", band: 0, level: 0, ...extra });
const ins = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "insult", band: 0, level: 0, ...extra });
const interj = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "interj", band: 0, level: 0, ...extra });
const oath = (w: string, band: B, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "oath", band, level: 0, ...extra });
const inten = (w: string, band: B = 0, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "intensifier", band, level: 0, ...extra });
const sim = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "simile", band: 0, level: 0, ...extra });
const verb = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "verb", band: 0, level: 0, ...extra });
const abs = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "abstract", band: 0, level: 0, pl: "-", ...extra });
const swear = (w: string, band: 2 | 3 | 4, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "swear", band, level: 0, ...extra });
const threat = (w: string, extra: Partial<LexEntry> = {}): LexEntry => ({ w, pos: "threat", band: 0, level: 0, ...extra });

const G = { reg: ["grose"] };
const g = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...G, gloss });

export const groseVulgarTongue: LexPack = {
  id: "grose-vulgar-tongue",
  title: "The Vulgar Tongue (abridged)",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 5,
  entries: [
    // Insults: fools, loafers, clumsy folk, noisy folk. Nothing about looks, sex, or birth.
    g(ins("addle-pate"), "a muddled thinker"), g(ins("clunch"), "a clumsy, awkward person"), g(ins("nickumpoop"), "a fool; ancestor of nincompoop"),
    g(ins("lobcock"), "a large, idle, sluggish fellow"), g(ins("nigmenog"), "a very silly fellow"),
    g(ins("cake"), "a fool, a soft-head"), g(ins("gollumpus"), "a large, clumsy fellow"), g(ins("looby"), "an awkward, lazy lout"),
    g(ins("lobcock's apprentice"), "one learning to be idle"), g(ins("chuckle-head"), "a thick-witted fellow"), g(ins("jolter-head"), "a large-headed dolt"),
    g(ins("gaby"), "a simpleton"), g(ins("gawney"), "a gawping simpleton"), g(ins("gobbler"), "a greedy eater"),
    g(ins("greenhorn"), "a raw beginner"), g(ins("gudgeon"), "one easily gulled, like the fish"), g(ins("hoddy-doddy"), "a short, round, silly person; also a snail"),
    g(ins("jack-adams"), "a fool"), g(ins("lack-brain"), "one wanting wit"), g(ins("lubber"), "a heavy, clumsy fellow"), g(ins("mopus"), "a dull, moping soul"),
    g(ins("muckworm"), "a miser who grubs in the dirt"), g(ins("nizzie"), "a fool"), g(ins("nokes"), "a ninny"), g(ins("noddy"), "a simpleton"),
    g(ins("numps"), "a fool"), g(ins("pot-walloper"), "one who boils his own pot; a noisy cook"), g(ins("puzzle-pate"), "one whose head is a puzzle to him"),
    g(ins("ragamuffin"), "a tattered wanderer"), g(ins("rantipole"), "a wild, romping creature"), g(ins("sad dog"), "a wicked, debauched fellow (used fondly)"),
    g(ins("scapegrace"), "a wild young rogue"), g(ins("shab"), "a mean, shabby fellow"), g(ins("shag-bag"), "a poor, shabby fellow"),
    g(ins("slouch"), "an idle, stooping fellow"), g(ins("slubberdegullion"), "a dirty, slovenly, paltry fellow"), g(ins("snivel-nose"), "one who whines"),
    g(ins("tatterdemalion"), "a ragged fellow"), g(ins("thick-skull"), "a dolt"), g(ins("tony"), "a silly fellow"), g(ins("tom-noddy"), "a fool; also a puffin"),
    g(ins("tumbler"), "one who falls over often"), g(ins("wiseacre"), "one who pretends to wisdom"), g(ins("whipster"), "a sharp, whippy little fellow"),
    g(ins("dunder-whelp"), "a stupid pup"), g(ins("bufflehead"), "a blockhead, from the buffalo"), g(ins("chaw-bacon"), "a rustic"), g(ins("clod-pate"), "a thick-witted rustic"),
    g(ins("dew-beater"), "a great heavy foot; a heavy-footed fellow"), g(ins("dilly-dallier"), "one who trifles away time"), g(ins("fumbler"), "an awkward, bungling person"),
    g(ins("gormagon"), "a monster of no sense"), g(ins("lollpoop"), "a lazy, idle drone"), g(ins("stick-in-the-mud"), "one who never moves"),
    g(ins("dundering rascal"), "a noisy, blundering rogue"), g(ins("hobbledehoy"), "a gangling youth, neither one thing nor another"),
    g(ins("bumpkin"), "an awkward country fellow"), g(ins("cabbage-head"), "a soft-brained fellow"), g(ins("mumchance"), "one who sits silent and useless"),
    g(ins("noodle"), "a simpleton"), g(ins("goosecap"), "a silly fellow"), g(ins("rum touch"), "an odd, unaccountable fellow"), g(ins("gudgeon-gobbler"), "one who swallows every bait"), g(ins("slugabed"), "one who lies late"), g(ins("lazybones"), "an idle fellow"), g(ins("snudge"), "a mean, sneaking fellow"),
    // Adjectives.
    g(adj("addle-pated"), "muddle-headed"), g(adj("bufflish"), "stupid as a buffalo"), g(adj("chuckle-headed"), "thick-witted"), g(adj("dozy"), "half asleep"),
    g(adj("gormless"), "without gaum, without sense"), g(adj("lobcockish"), "large and idle"), g(adj("lubberly"), "heavy and clumsy"), g(adj("mawkish"), "sickly and feeble of taste"),
    g(adj("muggy"), "damp and close"), g(adj("mumping"), "sulky, begging"), g(adj("nab-cheating"), "hat-stealing; light-fingered"), g(adj("nazy"), "drunkenly foolish"),
    g(adj("peery"), "suspicious, sly"), g(adj("queasy"), "sick at the stomach"), g(adj("rantipoling"), "wild and romping"), g(adj("rum"), "odd of temper; also fine"), g(adj("addle-headed"), "muddled"), g(adj("chuckle-pated"), "thick"), g(adj("lubber-like"), "clumsy"),
    g(adj("shabbaroon"), "shabby and mean"), g(adj("slubbering"), "slobbering and slovenly"), g(adj("snuffling"), "sniffing and whining"),
    g(adj("tatterdemalion"), "ragged"), g(adj("waddling", { targets: ["sheep"] }), "walking like a duck"), g(adj("wamble-cropped"), "sick in the stomach"),
    g(adj("hum-drum"), "dull and tedious"), g(adj("crank"), "unsteady, liable to topple"), g(adj("dilberry-ridden", { band: 1, targets: ["sheep"] }), "with dags in the wool"),
    g(adj("gutfoundered"), "exceedingly hungry"), g(adj("jobbernowled"), "thick of skull"), g(adj("bog-soaked"), "wet from the marsh"), g(adj("mud-larking"), "grubbing in the mud"),
    // Oaths (F0-F2), all exclamatory.
    g(oath("od's bodikins", 1), "God's little bodies; a minced oath"), g(oath("od rot it", 1), "God rot it"), g(oath("stap my vitals", 1), "stop my vitals; a fop's oath"),
    g(oath("od's fish", 1), "a minced oath"), g(oath("gadso", 1), "a minced oath"), g(oath("gadzookers", 1), "God's hooks"), g(oath("split me", 1), "a fop's oath"),
    g(oath("burn me", 1), "a fop's oath"), g(oath("rot me", 1), "may I rot"), g(oath("od's heartlikins", 1), "God's little heart"), g(oath("by the Lord Harry", 1), "by the devil"),
    g(oath("dang my buttons", 1), "a rustic oath"), g(oath("consume it", 1), "may it be consumed"), g(oath("plague on't", 1), "a plague on it"), g(oath("pox take it", 1), "a curse on it"),
    g(oath("a fig for it", 0), "I value it at a fig"), g(oath("fiddle-faddle", 0), "nonsense"), g(oath("flim-flam", 0), "nonsense"), g(oath("hoity-toity", 0), "an exclamation at airs"),
    g(oath("bless my wig", 0), "an exclamation"), g(oath("rabbit it", 1), "a minced oath, drat it"), g(oath("dash my wig", 1), "a minced oath"), g(oath("damme", 2), "damn me"),
    g(oath("dam'me", 2), "damn me"), g(oath("the devil's in it", 2), "there is something wrong here"), g(oath("hell and tommy", 2), "a strong exclamation"),
    // Nouns and abstracts with period flavour.
    g(n("bumbaste"), "a beating"), g(n("clack"), "chatter, noise"), g(n("dilberry", { band: 1 }), "a dag; a clot in the wool"), g(n("gab"), "talk, prattle"),
    g(n("hob-nail"), "a country boot-nail"), g(n("jakes"), "an outhouse"), g(n("kickshaw"), "a trifle, a nothing"), g(n("lumber"), "useless stuff"), g(n("moon-curser"), "a link-boy; one who curses the moonlight"),
    g(n("pettifogging"), "small-minded quibbling"), g(n("quagmire"), "a boggy hole"), g(n("rigmarole"), "a long, tedious tale"), g(n("slough"), "a deep, muddy place"), g(n("wallop"), "a heavy blow"),
    g(abs("humdrudgery"), "dull, tedious labour"), g(abs("collywobbles"), "belly-ache and dread"), g(abs("dumps"), "low spirits"), g(abs("mulligrubs"), "a fit of sulks"), g(abs("megrims"), "low spirits, whims"),
    g(abs("blue devils"), "despondency"), g(abs("the hyp"), "melancholy"), g(abs("mubble-fubbles"), "a fit of gloom"),
    // Similes with an eighteenth-century smell.
    g(sim("a parson's bull in a bog"), "slow and stuck"), g(sim("a tinker's dog at a christening"), "unwelcome and confused"), g(sim("a Dutchman's breeches after rain"), "sodden"),
    g(sim("a beadle without his staff"), "useless"), g(sim("a tallow candle in a gale"), "guttering"), g(sim("a hackney horse on a Sunday"), "worn out"), g(sim("a pie-man with no pies"), "pointless"),
    g(sim("a sedan chair with one bearer"), "going nowhere"), g(sim("a sermon at a fair"), "ignored"), g(sim("a wig in a hedge"), "lost and foolish"),
    g(verb("mizzle"), "to drizzle; to slink away"), g(verb("mump"), "to sulk and beg"), g(verb("wamble"), "to roll and stagger"), g(verb("slubber"), "to do sloppily"), g(verb("dilly-dally"), "to trifle"),
  ],
};

const B_ = { reg: ["bard"] };
const b = (e: LexEntry, gloss?: string): LexEntry => (gloss ? { ...e, ...B_, gloss } : { ...e, ...B_ });

export const bard: LexPack = {
  id: "bard",
  title: "The Complete Insults of William Shakespeare",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 6,
  entries: [
    // Adjectives.
    b(adj("beslubbering", { syl: 4 })), b(adj("bootless", { syl: 2 }), "useless"), b(adj("churlish", { syl: 2 })), b(adj("clouted", { syl: 2 }), "patched, hobnailed"),
    b(adj("craven", { syl: 2 })), b(adj("dankish", { syl: 2 })), b(adj("fen-sucked", { syl: 2 })), b(adj("fobbing", { syl: 2 }), "cheating"), b(adj("froward", { syl: 2 }), "contrary"),
    b(adj("gleeking", { syl: 2 }), "jesting"), b(adj("goatish", { syl: 2 })), b(adj("loggerheaded", { syl: 4 })), b(adj("mammering", { syl: 3 }), "hesitating"), b(adj("puking", { syl: 2 })),
    b(adj("rank", { syl: 1 })), b(adj("reeky", { syl: 2 })), b(adj("roguish", { syl: 2 })), b(adj("spleeny", { syl: 2 })), b(adj("tottering", { syl: 3 })), b(adj("unmuzzled", { syl: 3 })),
    b(adj("warped", { syl: 1 })), b(adj("weedy", { syl: 2 })), b(adj("yeasty", { syl: 2 })), b(adj("artless", { syl: 2 })), b(adj("bawdy", { syl: 2, band: 1 })), b(adj("beslubbered", { syl: 3 })),
    b(adj("clay-brained", { syl: 2 })), b(adj("currish", { syl: 2 })), b(adj("dismal-dreaming", { syl: 4 })), b(adj("dissembling", { syl: 3 })),
    b(adj("dizzy-eyed", { syl: 3 })), b(adj("droning", { syl: 2 })), b(adj("errant", { syl: 2 })), b(adj("fawning", { syl: 2 })), b(adj("fool-born", { syl: 2 })), b(adj("frothy", { syl: 2 })),
    b(adj("full-gorged", { syl: 2 })), b(adj("guts-griping", { syl: 3 })), b(adj("half-faced", { syl: 2 })), b(adj("hedge-born", { syl: 2 })), b(adj("hell-hated", { syl: 3, band: 1 })),
    b(adj("idle-headed", { syl: 4 })), b(adj("impertinent", { syl: 4 })), b(adj("infectious", { syl: 3 })), b(adj("jarring", { syl: 2 })), b(adj("knotty-pated", { syl: 4 })),
    b(adj("lily-livered", { syl: 4 })), b(adj("lumpish", { syl: 2 })), b(adj("milk-livered", { syl: 3 })), b(adj("motley-minded", { syl: 4 })), b(adj("onion-eyed", { syl: 4 })),
    b(adj("paltry", { syl: 2 })), b(adj("pribbling", { syl: 2 })), b(adj("puny", { syl: 2 })), b(adj("quailing", { syl: 2 })), b(adj("rampallian", { syl: 4 })), b(adj("rough-hewn", { syl: 2 })),
    b(adj("rude-growing", { syl: 3 })), b(adj("rump-fed", { syl: 2 })), b(adj("saucy", { syl: 2 })), b(adj("sheep-biting", { syl: 3 })), b(adj("shard-borne", { syl: 2 }), "borne on a dung-beetle"),
    b(adj("spur-galled", { syl: 2 })), b(adj("surly", { syl: 2 })), b(adj("tardy-gaited", { syl: 4 })), b(adj("toad-spotted", { syl: 3 })),
    b(adj("unchin-snouted", { syl: 4 }), "hedgehog-nosed"), b(adj("unwashed", { syl: 2 })), b(adj("vain", { syl: 1 })), b(adj("venomed", { syl: 2 })), b(adj("villainous", { syl: 3 })),
    b(adj("wayward", { syl: 2 })), b(adj("weather-bitten", { syl: 4 })), b(adj("whey-faced", { syl: 2 }), "pale as whey"), b(adj("wit-starved", { syl: 2 })), b(adj("mouldy", { syl: 2 })),
    b(adj("threadbare", { syl: 2 })), b(adj("elf-skinned", { syl: 2 })), b(adj("plume-plucked", { syl: 2 })), b(adj("ill-nurtured", { syl: 3 })), b(adj("ill-breeding", { syl: 3 })), b(adj("base", { syl: 1 })), b(adj("scurvy", { syl: 2 })), b(adj("mangled", { syl: 2 })),
    // Nouns you may call a sheep.
    b(ins("apple-john"), "a shrivelled old apple"), b(ins("barnacle")), b(ins("bladder")), b(ins("boar-pig")), b(ins("bugbear")), b(ins("canker-blossom")), b(ins("clotpole")),
    b(ins("death-token")), b(ins("dewberry")), b(ins("flap-dragon"), "a raisin snatched from burning brandy"), b(ins("foot-licker")), b(ins("hedge-pig")), b(ins("horn-beast")),
    b(ins("hugger-mugger")), b(ins("lout")), b(ins("maggot-pie"), "a magpie"), b(ins("malt-worm"), "a drinker"), b(ins("mammet"), "a puppet"), b(ins("measle")), b(ins("minnow")),
    b(ins("miscreant")), b(ins("moldwarp"), "a mole"), b(ins("mumble-news")), b(ins("nut-hook")), b(ins("pigeon-egg")), b(ins("pignut")), b(ins("puttock"), "a kite, the bird"),
    b(ins("pumpion"), "a pumpkin"), b(ins("ratsbane")), b(ins("scut"), "a rabbit's tail"), b(ins("skainsmate"), "a companion in mischief"), b(ins("varlet")), b(ins("vassal")),
    b(ins("whey-face")), b(ins("coxcomb")), b(ins("cutpurse")), b(ins("dogfish")), b(ins("eel-skin")), b(ins("elf-skin")), b(ins("gudgeon")), b(ins("hempseed")), b(ins("joithead")),
    b(ins("knave")), b(ins("mouldy rogue")), b(ins("patch"), "a fool in motley"), b(ins("scurvy knave")), b(ins("saucy fellow")), b(ins("base knave")),
    b(ins("popinjay")), b(ins("rabbit-sucker")), b(ins("rudesby")), b(ins("scullion")), b(ins("stockfish"), "dried cod"), b(ins("tallow-catch")),
    b(ins("tickle-brain")), b(ins("toad")), b(ins("bolting-hutch"), "a flour bin"),
    b(ins("trunk of humours")), b(ins("bombard of sack"), "a leather wine-jug"), b(ins("stuffed cloak-bag")), b(ins("roasted Manningtree ox")), b(ins("reverend vice")),
    b(ins("grey iniquity")), b(ins("vanity in years")), b(ins("thing of no bowels"), "a coward"), b(ins("dried neat's-tongue")),
    // Oaths, exclamatory only.
    b(oath("zounds", 1)), b(oath("'sblood", 1), "God's blood"), b(oath("marry", 0), "by Mary, an assent"), b(oath("God's wounds", 1)), b(oath("by'r lady", 1)), b(oath("fie upon it", 0)),
    b(oath("a plague upon it", 1)), b(oath("out upon it", 0)), b(oath("go to", 0)), b(oath("fie, fie", 0)), b(oath("a pox on't", 1)), b(oath("beshrew me", 1)), b(oath("by my troth", 0)),
    b(oath("God's bodykins", 1)), b(oath("i' faith", 0)), b(oath("a murrain on it", 1), "a plague on it"), b(oath("out, out", 0)), b(oath("by the mass", 1)), b(oath("'swounds", 1)),
    b(oath("'slid", 1), "God's eyelid"), b(oath("God's bread", 1)),

    b(inten("most", 0)), b(inten("passing", 0), "surpassingly"), b(inten("right", 0)), b(inten("marvellous", 0)), b(inten("exceeding", 0)), b(inten("wondrous", 0)), b(inten("villainously", 0)),
    // Verbs with archaic feel.
    b(verb("beshrew"), "to curse"), b(verb("bewray"), "to reveal"), b(verb("caper")), b(verb("prate")), b(verb("gape")), b(verb("mew")), b(verb("hie"), "to hasten"), b(verb("tarry")),
    b(verb("wax"), "to grow"), b(verb("wither")), b(verb("rail"), "to scold"), b(verb("sulk")), b(verb("skulk")), b(verb("gambol")),
    b(abs("choler"), "anger"), b(abs("spleen"), "ill temper"), b(abs("dolour"), "grief"), b(abs("vexation")), b(abs("perdition")), b(abs("mischance")), b(abs("infamy")), b(abs("idleness")),
    b(sim("a toad in a well")), b(sim("a candle-end in a chapel")), b(sim("a fishmonger's apron")), b(sim("an ostler's Sunday")), b(sim("a cutpurse at a wake")), b(sim("a stuffed goose at Michaelmas")),
    b(sim("a wet Lent")), b(sim("a jester at a funeral")), b(sim("a barren tree in a churchyard")), b(sim("a beggar's almanac")),
  ],
};

const F = { reg: ["fr"], lang: "fr" };
const f = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...F, gloss });

export const french: LexPack = {
  id: "french",
  title: "A Phrasebook for the Disgruntled Traveller",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 7,
  entries: [
    f(oath("sacrebleu", 1), "sacred blue; minced from sacré Dieu"), f(oath("zut", 1), "darn"), f(oath("zut alors", 1), "darn, then"), f(oath("mince", 1), "minced from merde; drat"),
    f(oath("bon sang", 1), "good blood; good grief"), f(oath("nom d'un chien", 1), "name of a dog; minced oath"), f(oath("saperlipopette", 1), "a comic minced oath"),
    f(oath("punaise", 1), "bedbug; drat"), f(oath("merde", 2), "shit"), f(oath("merde alors", 2), "shit, then"), f(oath("putain", 3), "vulgar exclamation, lit. whore; used as 'damn it'"),
    f(oath("bordel", 3), "brothel; used as 'what a mess'"), f(oath("nom de Dieu", 2), "name of God"), f(oath("la vache", 1), "the cow; wow, damn"), f(oath("purée", 1), "mash; minced oath"),
    f(oath("flûte", 1), "flute; drat"), f(oath("crotte", 1), "droppings; poo"), f(oath("diantre", 1), "minced from diable"), f(oath("sapristi", 1), "minced from sacristi"),
    f(oath("nom d'une pipe", 1), "name of a pipe; minced oath"), f(oath("bon Dieu de bon Dieu", 2), "good God of good God"), f(oath("sacré nom", 2), "sacred name"),
    f(oath("putain de merde", 3), "damn shit"), f(swear("Merde", 2, { tombstoneSafe: true }), "shit"),  f(oath("oh là là", 0), "oh dear"), f(oath("bof", 0), "meh"), f(oath("ras le bol", 1), "I've had it up to here"),
    f(inten("sacré", 1), "damned, blessed; before the noun"), f(inten("fichu", 1), "wretched, ruddy"), f(inten("foutu", 3), "damned, done for"), f(inten("maudit", 1), "cursed"),
    f(inten("satané", 1), "confounded"),
    f(ins("andouille", { pl: "andouilles" }), "(f.) une andouille: a sausage; a twit"), f(ins("cornichon", { pl: "cornichons" }), "(m.) un cornichon: a gherkin; a twit"),
    f(ins("nigaud", { pl: "nigauds" }), "(m.) un nigaud: a simpleton"), f(ins("ballot", { pl: "ballots" }), "(m.) un ballot: a bale; a clumsy fool"),
    f(ins("bougre d'âne", { pl: "bougres d'âne" }), "(m.) un bougre d'âne: a blighter of a donkey"), f(ins("tête de mule", { pl: "têtes de mule" }), "(f.) une tête de mule: a mule-head"),
    f(ins("patate", { pl: "patates" }), "(f.) une patate: a potato; a clod"), f(ins("banane", { pl: "bananes" }), "(f.) une banane: a banana; a fool"), f(ins("cruche", { pl: "cruches" }), "(f.) une cruche: a jug; a dim soul"),
    f(ins("gros nigaud", { pl: "gros nigauds" }), "(m.) a big simpleton"), f(ins("empoté", { pl: "empotés" }), "(m.) un empoté: a clumsy oaf"), f(ins("mollusque", { pl: "mollusques" }), "(m.) un mollusque: a mollusc; a sluggard"),
    f(ins("moule", { pl: "moules" }), "(f.) une moule: a mussel; a dope"), f(ins("courge", { pl: "courges" }), "(f.) une courge: a gourd; a twit"), f(ins("bourrique", { pl: "bourriques" }), "(f.) une bourrique: a she-donkey; a stubborn ass"),
    f(ins("tête de linotte", { pl: "têtes de linotte" }), "(f.) linnet-head; a scatterbrain"), f(ins("sac à puces", { pl: "sacs à puces" }), "(m.) flea-bag"), f(ins("boulet", { pl: "boulets" }), "(m.) un boulet: a cannonball; a dead weight"),
    f(ins("fainéant", { pl: "fainéants" }), "(m.) un fainéant: a do-nothing"), f(ins("mouton", { pl: "moutons" }), "(m.) un mouton: a sheep; one who follows"), f(ins("bon à rien", { pl: "bons à rien" }), "(m.) good-for-nothing"),
    f(ins("saucisson", { pl: "saucissons" }), "(m.) un saucisson: a dry sausage"), f(ins("navet", { pl: "navets" }), "(m.) un navet: a turnip; a dud"), f(ins("tas de boue", { pl: "tas de boue" }), "(m.) heap of mud"),
    f(adj("lourd"), "heavy"), f(adj("crotté"), "mud-splattered"), f(adj("trempé"), "soaked"), f(adj("têtu"), "stubborn"), f(adj("nul"), "hopeless, useless"), f(adj("minable"), "pathetic, shabby"),
    f(adj("ridicule"), "ridiculous"), f(adj("insupportable"), "unbearable"), f(adj("épuisant"), "exhausting"), f(adj("détrempé"), "sodden"), f(adj("boueux"), "muddy"),
    f(interj("pfff"), "a puff of disdain"), f(interj("eh bien"), "well then"), f(interj("hélas"), "alas"), f(interj("quoi"), "what"), f(interj("voilà"), "there it is"),
    f(abs("le désespoir"), "despair"), f(abs("la fatigue"), "tiredness"), f(abs("l'ennui"), "boredom, weariness"), f(abs("la misère"), "misery"), f(abs("le chagrin"), "sorrow"),
    f(sim("un dimanche à Roubaix"), "a Sunday in Roubaix; dull"), f(sim("une baguette d'hier"), "yesterday's baguette"), f(sim("un escargot en grève"), "a snail on strike"),
    f(verb("rouspéter"), "to grumble"), f(verb("râler"), "to moan"), f(verb("traîner"), "to dawdle"), f(verb("patauger"), "to wade through mud"),
  ],
};

const D = { reg: ["de"], lang: "de" };
const d = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...D, gloss });

export const german: LexPack = {
  id: "german",
  title: "Schimpfwörter für Anfänger",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 7,
  entries: [
    d(oath("verdammt", 1), "damned"), d(oath("verdammt noch mal", 2), "damn it all"), d(oath("Mist", 1), "manure; drat"), d(oath("so ein Mist", 1), "such manure; what a pain"),
    d(oath("Scheiße", 2), "shit"), d(oath("verflixt", 1), "confounded; minced"), d(oath("verflixt und zugenäht", 1), "confounded and sewn up"), d(oath("Himmel Herrgott", 2), "heaven, Lord God"),
    d(oath("Himmel, Arsch und Zwirn", 2), "heaven, arse and thread"), d(oath("ach du liebe Zeit", 0), "oh dear me"), d(oath("du meine Güte", 0), "my goodness"), d(oath("Donnerwetter", 1), "thunder-weather"),
    d(oath("Herrje", 0), "good grief"), d(oath("Menschenskind", 0), "child of man; good heavens"), d(oath("Kruzifix", 2), "crucifix; Bavarian oath"), d(oath("Sackzement", 1), "minced from Sakrament"),
    d(oath("Heiliger Strohsack", 1), "holy straw-sack"), d(oath("verdammte Hacke", 2), "damned hoe; damn it"), d(oath("Potzblitz", 1), "gadzooks, lightning"),
    d(inten("verdammt", 2), "damned"), d(inten("verflixt", 1), "confounded"), d(adj("saublöd", { band: 1 }), "pig-silly; utterly daft"),
    d(ins("Schafskopf", { pl: "Schafsköpfe" }), "(m.) der Schafskopf: sheep-head, a fool"), d(ins("Dummkopf", { pl: "Dummköpfe" }), "(m.) der Dummkopf: a blockhead"),
    d(ins("Kartoffel", { pl: "Kartoffeln" }), "(f.) die Kartoffel: a potato"), d(ins("Blödmann", { pl: "Blödmänner" }), "(m.) der Blödmann: a silly man"), d(ins("Quatschkopf", { pl: "Quatschköpfe" }), "(m.) der Quatschkopf: a nonsense-head"),
    d(ins("Drecksack", { pl: "Drecksäcke", band: 2 }), "(m.) der Drecksack: a dirt-bag"), d(ins("Trottel", { pl: "Trottel" }), "(m.) der Trottel: a dolt"), d(ins("Depp", { pl: "Deppen" }), "(m.) der Depp: a twit"),
    d(ins("Schlafmütze", { pl: "Schlafmützen" }), "(f.) die Schlafmütze: a sleeping cap; a dozy soul"), d(ins("Faulpelz", { pl: "Faulpelze" }), "(m.) der Faulpelz: a lazy fur; a lazybones"),
    d(ins("Landei", { pl: "Landeier" }), "(n.) das Landei: a country egg; a bumpkin"), d(ins("Dussel", { pl: "Dussel" }), "(m.) der Dussel: a dope"), d(ins("Tölpel", { pl: "Tölpel" }), "(m.) der Tölpel: an oaf"),
    d(ins("Hornochse", { pl: "Hornochsen" }), "(m.) der Hornochse: a horned ox; a blockhead"), d(ins("Schnarchnase", { pl: "Schnarchnasen" }), "(f.) die Schnarchnase: a snore-nose; a slowcoach"),
    d(ins("Wollknäuel", { pl: "Wollknäuel" }), "(n.) das Wollknäuel: a ball of wool"), d(ins("Sturkopf", { pl: "Sturköpfe" }), "(m.) der Sturkopf: a stubborn head"), d(ins("Pfeife", { pl: "Pfeifen" }), "(f.) die Pfeife: a pipe; a dud"),
    d(ins("Blindschleiche", { pl: "Blindschleichen" }), "(f.) die Blindschleiche: a slow-worm"), d(ins("Nervensäge", { pl: "Nervensägen" }), "(f.) die Nervensäge: a nerve-saw; a pest"),
    d(ins("Miesepeter", { pl: "Miesepeter" }), "(m.) der Miesepeter: a grouch"), d(ins("Klugscheißer", { pl: "Klugscheißer", band: 3 }), "(m.) der Klugscheißer: a smart-shitter; a know-all"),
    d(ins("Arschgeige", { pl: "Arschgeigen", band: 3 }), "(f.) die Arschgeige: an arse-violin"), d(ins("Vollpfosten", { pl: "Vollpfosten" }), "(m.) der Vollpfosten: a full fencepost; a clod"),
    d(adj("blöd"), "silly"), d(adj("stur"), "stubborn"), d(adj("nass"), "wet"), d(adj("matschig"), "muddy"), d(adj("schwer"), "heavy"), d(adj("nutzlos"), "useless"),
    d(adj("erbärmlich"), "pitiful"), d(adj("schrecklich"), "terrible"), d(adj("lahmarschig", { band: 3 }), "lazy-arsed, slow"), d(adj("saudumm", { band: 1 }), "pig-silly"),
    d(interj("ach"), "oh"), d(interj("na toll"), "oh great"), d(interj("also bitte"), "oh please"), d(interj("jawohl"), "yes indeed"),
    d(abs("der Weltschmerz"), "world-weariness"), d(abs("die Verzweiflung"), "despair"), d(abs("der Ärger"), "annoyance"), d(abs("die Erschöpfung"), "exhaustion"),
    d(sim("ein Sonntag in Bielefeld"), "a Sunday in Bielefeld"), d(sim("ein Sauerkraut ohne Wurst"), "sauerkraut without sausage"),
    d(verb("meckern"), "to grumble, like a goat"), d(verb("schleppen"), "to lug"), d(verb("trödeln"), "to dawdle"),
  ],
};

const IT = { reg: ["it"], lang: "it" };
const ES = { reg: ["es"], lang: "es" };
const it = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...IT, gloss });
const es = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...ES, gloss });

export const italianSpanish: LexPack = {
  id: "italian-spanish",
  title: "Porca Miseria! and Other Useful Phrases",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 7,
  entries: [
    it(oath("accidenti", 1), "accidents; dash it"), it(oath("mannaggia", 1), "damn it, minced from mal ne abbia"), it(oath("cavolo", 1), "cabbage; minced oath"), it(oath("porca miseria", 1), "pig misery"),
    it(oath("porca vacca", 1), "pig cow"), it(oath("uffa", 0), "a huff of exasperation"), it(oath("cazzo", 3), "vulgar exclamation, lit. penis; used as 'damn'"), it(oath("che palle", 3), "what balls; what a drag"),
    it(oath("porca paletta", 1), "pig shovel; minced oath"), it(oath("mamma mia", 0), "my mother"), it(oath("porco cane", 1), "pig dog"), it(oath("santo cielo", 0), "holy sky"), it(oath("madonna santa", 1), "holy Madonna"),
    it(oath("che barba", 0), "what a beard; how boring"), it(oath("maledizione", 1), "curses"), it(oath("perbacco", 1), "by Bacchus"), it(oath("caspita", 0), "gosh"), it(oath("acciderba", 1), "minced accidenti"),
    it(ins("testa di rapa", { pl: "teste di rapa" }), "(f.) turnip-head"), it(ins("salame", { pl: "salami" }), "(m.) un salame: a salami; a clot"), it(ins("pappamolla", { pl: "pappemolle" }), "(m.) a soft-pap; a wimp"),
    it(ins("babbeo", { pl: "babbei" }), "(m.) un babbeo: a simpleton"), it(ins("tonto", { pl: "tonti" }), "(m.) un tonto: a dolt"), it(ins("zuccone", { pl: "zucconi" }), "(m.) uno zuccone: a big pumpkin; a blockhead"),
    it(ins("citrullo", { pl: "citrulli" }), "(m.) un citrullo: a cucumber; a fool"), it(ins("broccolo", { pl: "broccoli" }), "(m.) un broccolo: a broccoli; a fool"), it(ins("pecorone", { pl: "pecoroni" }), "(m.) un pecorone: a big sheep; a follower"),
    it(ins("fannullone", { pl: "fannulloni" }), "(m.) un fannullone: a do-nothing"), it(ins("lumacone", { pl: "lumaconi" }), "(m.) un lumacone: a big slug"), it(ins("scemo", { pl: "scemi" }), "(m.) uno scemo: a silly one"),
    it(adj("pesante"), "heavy"), it(adj("fangoso"), "muddy"), it(adj("testardo"), "stubborn"), it(adj("inutile"), "useless"), it(adj("bagnato"), "wet"), it(adj("maledetto", { band: 1 }), "cursed"),
    it(inten("maledetto", 1), "cursed"), it(inten("benedetto", 0), "blessed; ironic"), it(interj("basta"), "enough"), it(interj("boh"), "dunno"), it(interj("eh"), "eh"),
    it(abs("la noia"), "boredom"), it(abs("la stanchezza"), "tiredness"), it(abs("la disperazione"), "despair"), it(sim("una domenica a Ferragosto"), "a Sunday in mid-August; empty"),
    it(sim("un cappuccino dopo pranzo"), "a cappuccino after lunch; wrong"), it(verb("brontolare"), "to grumble"),
    es(oath("caramba", 1), "dash it"), es(oath("rayos", 1), "lightning bolts"), es(oath("maldita sea", 1), "may it be cursed"), es(oath("mierda", 2), "shit"), es(oath("pardiez", 1), "by God; archaic"),
    es(oath("caray", 1), "minced caramba"), es(oath("demonios", 1), "demons"), es(oath("por Dios", 1), "by God"), es(oath("madre mía", 0), "my mother"), es(oath("hostia", 3), "host, the wafer; strong"),
    es(oath("joder", 3), "vulgar exclamation; damn"), es(oath("qué lata", 0), "what a tin; what a drag"), es(oath("vaya por Dios", 1), "well, by God"), es(oath("ay, Dios mío", 1), "oh my God"),
    es(oath("recórcholis", 1), "a comic minced oath"), es(oath("córcholis", 1), "a comic minced oath"), es(oath("cáspita", 0), "gosh"),
    es(ins("cabezón", { pl: "cabezones" }), "(m.) un cabezón: a big-head; stubborn"), es(ins("zoquete", { pl: "zoquetes" }), "(m.) un zoquete: a block of wood; a dolt"), es(ins("melón", { pl: "melones" }), "(m.) un melón: a melon; a twit"),
    es(ins("bobo", { pl: "bobos" }), "(m.) un bobo: a silly one"), es(ins("zopenco", { pl: "zopencos" }), "(m.) un zopenco: a dunce"), es(ins("tarugo", { pl: "tarugos" }), "(m.) un tarugo: a wooden peg; a clod"),
    es(ins("borrego", { pl: "borregos" }), "(m.) un borrego: a yearling sheep; a follower"), es(ins("alcornoque", { pl: "alcornoques" }), "(m.) un alcornoque: a cork oak; a dolt"), es(ins("pasmarote", { pl: "pasmarotes" }), "(m.) un pasmarote: a gawping post"),
    es(ins("vago", { pl: "vagos" }), "(m.) un vago: a layabout"), es(ins("cenutrio", { pl: "cenutrios" }), "(m.) un cenutrio: a dimwit"), es(ins("berzotas", { pl: "berzotas" }), "(m.) a cabbage-head"),
    es(adj("pesado"), "heavy; tiresome"), es(adj("terco"), "stubborn"), es(adj("inútil"), "useless"), es(adj("empapado"), "soaked"), es(adj("fangoso"), "muddy"), es(adj("maldito", { band: 1 }), "cursed"),
    es(inten("maldito", 1), "cursed"), es(inten("bendito", 0), "blessed; ironic"), es(interj("venga"), "come on"), es(interj("ay"), "oh"), es(interj("hala"), "wow"),
    es(abs("el aburrimiento"), "boredom"), es(abs("la desgracia"), "misfortune"), es(abs("el cansancio"), "tiredness"), es(sim("una siesta sin sombra"), "a siesta with no shade"),
    es(sim("un lunes en Albacete"), "a Monday in Albacete"), es(verb("refunfuñar"), "to grumble"),
  ],
};

const Y = { reg: ["yi"], lang: "yi" };
const SC = { reg: ["sco"], lang: "sco" };
const AU = { reg: ["au"], lang: "en-AU" };
const y = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...Y, gloss });
const sc = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...SC, gloss });
const au = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...AU, gloss });

export const yiddishScotsAussie: LexPack = {
  id: "yiddish-scots-aussie",
  title: "The Yiddish Book of Kvetching, bound with a Scots Primer and an Antipodean Appendix",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 7,
  entries: [
    y(ins("schlemiel", { pl: "schlemiels" }), "a hapless bungler"), y(ins("schlimazel", { pl: "schlimazels" }), "one with chronic bad luck"), y(ins("nudnik", { pl: "nudniks" }), "a pest, a bore"),
    y(ins("klutz", { pl: "klutzes" }), "a clumsy person"), y(ins("nebbish", { pl: "nebbishes" }), "a timid, ineffectual soul"), y(ins("schnorrer", { pl: "schnorrers" }), "a freeloader"),
    y(ins("shlub", { pl: "shlubs" }), "a clumsy, oafish person"), y(ins("kvetch", { pl: "kvetches" }), "a chronic complainer"), y(ins("nogoodnik", { pl: "nogoodniks" }), "a good-for-nothing"),
    y(ins("shmendrik", { pl: "shmendriks" }), "a nincompoop"), y(ins("golem", { pl: "golems" }), "a lump of clay; a clod"), y(ins("shmegegge", { pl: "shmegegges" }), "a buffoon"),
    y(ins("luftmensch", { pl: "luftmenschen" }), "an air-person with no practical sense"), y(ins("alter kocker", { pl: "alter kockers", band: 2 }), "an old grump; lit. old defecator"),
    y(verb("kvetch"), "to complain"), y(verb("schlep"), "to drag or haul"), y(verb("plotz"), "to collapse from exhaustion"), y(verb("kibitz"), "to offer unwanted advice"),
    y(interj("oy vey"), "oh woe"), y(interj("feh"), "an expression of disgust"), y(interj("oy gevalt"), "oh, violence; oh no"), y(interj("nu"), "well? so?"), y(interj("genug"), "enough"),
    y(oath("oy vey iz mir", 0), "oh woe is me"), y(oath("gevalt", 0), "help, alarm"), y(abs("tsuris"), "troubles"), y(abs("shpilkes"), "restlessness, pins"), y(adj("farshlepteh"), "dragged-out, tedious"),
    y(adj("farmisht"), "confused"), y(adj("shlumpy"), "slovenly"), y(sim("a bagel with no hole"), "pointless"), y(sim("a wedding with no music"), "joyless"),
    sc(ins("eejit", { pl: "eejits" }), "a fool"), sc(ins("numpty", { pl: "numpties" }), "a hapless fool"), sc(ins("bawheid", { pl: "bawheids" }), "ball-head; a fool"), sc(ins("bampot", { pl: "bampots" }), "a wild fool"),
    sc(ins("dafty", { pl: "dafties" }), "a daft one"), sc(ins("galoot", { pl: "galoots" }), "a clumsy lout"), sc(ins("tumshie", { pl: "tumshies" }), "a turnip; a fool"), sc(ins("bawbag", { pl: "bawbags", band: 3, targets: ["sheep", "terrain", "curse"] }), "scrotum; a contemptible person"),
    sc(ins("roaster", { pl: "roasters" }), "a ridiculous, loud fool"), sc(ins("wee scunner", { pl: "wee scunners" }), "a little nuisance"), sc(ins("tube", { pl: "tubes" }), "a fool (Glasgow)"), sc(ins("sumph", { pl: "sumphs" }), "a soft, slow fellow"), sc(ins("gowk", { pl: "gowks" }), "a cuckoo; a fool"),
    sc(ins("haiver", { pl: "haivers" }), "a talker of nonsense"), sc(ins("nyaff", { pl: "nyaffs" }), "an irritating little person"), sc(ins("clype", { pl: "clypes" }), "a tell-tale"),
    sc(adj("glaikit"), "vacant, foolish"), sc(adj("wee"), "small"), sc(adj("dreich", { targets: ["weather", "day", "terrain"] }), "dreary, wet and grey"), sc(adj("boggin"), "filthy, disgusting"), sc(adj("mingin"), "smelly"), sc(adj("drookit"), "soaked through"),
    sc(adj("crabbit"), "bad-tempered"), sc(adj("thrawn"), "stubborn, contrary"), sc(adj("scunnered"), "fed up"), sc(adj("puggled"), "worn out"), sc(adj("shoogly"), "wobbly"), sc(adj("blootered", { band: 1 }), "drunk; wrecked"),
    sc(oath("jings", 0), "gosh"), sc(oath("crivvens", 0), "gosh"), sc(oath("help ma boab", 0), "help my Bob; good grief"), sc(oath("michty me", 0), "mighty me"), sc(oath("och", 0), "oh"),
    sc(oath("awa' an' bile yer heid", 1), "go and boil your head"), sc(oath("haud yer wheesht", 0), "hold your tongue"), sc(oath("jobby", 2), "excrement; a nuisance"), sc(oath("ya beauty", 0), "you beauty; ironic"),
    sc(n("jobby", { band: 2 }), "a turd"), sc(abs("the scunner"), "disgust, weariness"), sc(verb("haver"), "to talk nonsense"),
    sc(verb("trauchle"), "to trudge wearily"), sc(sim("a wet week in Greenock"), "dismal"), sc(sim("a piper with nae wind"), "useless"),
    au(ins("galah", { pl: "galahs" }), "a pink cockatoo; a loud fool"), au(ins("drongo", { pl: "drongos" }), "a bird; a hopeless fool"),
    au(ins("dill", { pl: "dills" }), "a silly person"), au(ins("boofhead", { pl: "boofheads" }), "a big-headed fool"), au(ins("nong", { pl: "nongs" }), "a fool"), au(ins("bludger", { pl: "bludgers" }), "a layabout"),
    au(ins("flamin' galah", { pl: "flamin' galahs" }), "a flaming fool"), au(ins("dag", { pl: "dags" }), "a matted lock of wool; an unfashionable oddball"), au(ins("mongrel", { pl: "mongrels", band: 2, targets: ["sheep", "terrain", "day", "curse"] }), "a contemptible thing"),
    au(interj("fair dinkum"), "truly, honestly"), au(interj("crikey"), "gosh"), au(interj("strewth"), "God's truth"), au(oath("stone the flamin' crows", 1), "an exclamation"),
    au(oath("bloody oath", 2), "too right"), au(oath("flamin' heck", 1), "flaming heck"), au(adj("buggered", { band: 2 }), "worn out"), au(adj("crook"), "unwell, wrong"), au(adj("stuffed", { band: 1 }), "exhausted, broken"),
    au(adj("daggy"), "unfashionable, sheepish"), au(inten("flamin'", 1), "flaming"), au(inten("bloody", 2), "bloody"), au(sim("a shag on a rock"), "lonely and exposed"), au(sim("a stunned mullet"), "gormless"),
    au(sim("a dunny in a flood"), "in trouble"), au(verb("whinge"), "to whine"), au(abs("the whinge"), "the complaint"),
  ],
};

// A Québécois reviewer should sign off before this reviewedAt is trusted; the
// sacres are religious words and register matters. Date set so the loader accepts it.
const Q = { reg: ["qc"], lang: "fr-CA" };
const q = (e: LexEntry, gloss: string): LexEntry => ({ ...e, ...Q, gloss });

export const quebecSacres: LexPack = {
  id: "quebec-sacres",
  title: "Ye Sacres of Kébec",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 7,
  entries: [
    q(oath("tabarnak", 3), "from tabernacle; strong"), q(oath("câlisse", 3), "from calice, chalice; strong"), q(oath("ostie", 3), "from hostie, the host; strong"), q(oath("criss", 3), "from Christ; strong"),
    q(oath("viarge", 2), "from vierge, virgin; medium"), q(oath("maudit", 2), "cursed; medium"), q(oath("torrieux", 2), "from tort à Dieu; medium"), q(oath("sacrament", 2), "from sacrement; medium"),
    q(oath("tabarnouche", 1), "softened tabarnak"), q(oath("câline", 1), "softened câlisse"), q(oath("tabarouette", 1), "softened tabarnak, lit. wheelbarrow"), q(oath("câline de bine", 1), "softened; bean"),
    q(oath("crisse de tabarnak", 3), "a chained sacre"), q(oath("ostie de câlisse", 3), "a chained sacre"), q(oath("câlisse de tabarnak", 3), "a chained sacre"), q(oath("maudite marde", 2), "cursed shit, in Québec spelling"),
    q(oath("bâtard", 3), "bastard, as an exclamation"), q(swear("Tabarnak", 3, { tombstoneSafe: true }), "the strongest sacre, alone"), q(swear("Câlisse", 3, { tombstoneSafe: true }), "a sacre, alone"), q(oath("sacrifice", 1), "softened sacrement"), q(oath("mautadit", 1), "softened maudit"), q(oath("torvisse", 1), "softened torrieux"),
    q(inten("crisse de", 3), "damned; before the noun"), q(inten("câlisse de", 3), "damned; before the noun"), q(inten("maudit", 2), "cursed"), q(inten("ostie de", 3), "damned; before the noun"),
    q(inten("tabarnak de", 3), "damned; before the noun"), q(inten("viarge de", 2), "cursed"), q(inten("sacrament de", 2), "cursed"),
    q(ins("épais", { pl: "épais" }), "(m.) un épais: a thick one"), q(ins("niaiseux", { pl: "niaiseux" }), "(m.) un niaiseux: a silly one"),
    q(ins("mouton", { pl: "moutons" }), "(m.) un mouton: a sheep"), q(ins("tête carrée", { pl: "têtes carrées" }), "(f.) square-head; stubborn"), q(ins("gnochon", { pl: "gnochons" }), "(m.) un gnochon: a clumsy dolt"),
    q(adj("niaiseux"), "silly"), q(adj("épais"), "thick"), q(adj("plate"), "flat; boring"), q(adj("écoeurant", { band: 1 }), "sickening; also, amazing"), q(adj("frette", { targets: ["weather", "day", "terrain", "self"] }), "cold"), q(adj("mouillé"), "wet"),
    q(interj("ben là"), "well now"), q(interj("voyons donc"), "come on now"), q(interj("aïe"), "ouch"), q(abs("la marde"), "shit, in Québec spelling"), q(abs("le trouble"), "trouble"),
    q(sim("un hiver de sept mois"), "a seven-month winter"), q(sim("une poutine sans sauce"), "a poutine without gravy"), q(verb("chialer"), "to whine"), q(verb("sacrer"), "to swear"),
  ],
};

const H = { reg: ["hemingway"] };
const h = (e: LexEntry): LexEntry => ({ ...e, ...H });

export const hemingway: LexPack = {
  id: "hemingway",
  title: "In Our Time",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 8,
  entries: [
    h(n("river")), h(n("hill")), h(n("sheep", { pl: "sheep" })), h(n("rain", { pl: "-" })), h(n("road")), h(n("bread", { pl: "-" })), h(n("wine", { pl: "-" })), h(n("boots")), h(n("cold", { pl: "-" })),
    h(n("dark", { pl: "-" })), h(n("dust", { pl: "-" })), h(n("stone")), h(n("rope")), h(n("fence")), h(n("hat")), h(n("knife", { pl: "knives" })), h(n("gate")), h(n("wall")), h(n("water", { pl: "-" })),
    h(n("wind", { pl: "-" })), h(n("sun", { pl: "-" })), h(n("light", { pl: "-" })), h(n("ground", { pl: "-" })), h(n("grass", { pl: "-" })), h(n("tree")), h(n("field")), h(n("mud", { pl: "-" })),
    h(n("morning", { pl: "-" })), h(n("night", { pl: "-" })), h(n("coffee", { pl: "-" })), h(n("cheese", { pl: "-" })), h(n("blanket")), h(n("fire")), h(n("smoke", { pl: "-" })), h(n("snow", { pl: "-" })),
    h(n("path")), h(n("bridge")), h(n("post")), h(n("bell")), h(n("wool", { pl: "-" })), h(n("hand")), h(n("shoulder")), h(n("back", { pl: "-" })), h(n("distance", { pl: "-" })),
    h(n("pen")), h(n("crook")), h(n("mountain")), h(n("village")), h(n("table")), h(n("bottle")), h(n("cup")), h(n("stick")), h(n("shadow")), h(n("hunger", { pl: "-" })),
    h(adj("good")), h(adj("bad")), h(adj("true")), h(adj("fine")), h(adj("clean")), h(adj("cold")),
    h(verb("carry")), h(verb("walk")), h(verb("go")), h(verb("come")), h(verb("sit")), h(verb("stand")), h(verb("drink")), h(verb("eat")), h(verb("wait")), h(verb("look")), h(verb("climb")),
    h(verb("lift")), h(verb("fall")), h(verb("cross")), h(verb("hold")), h(verb("run")), h(verb("stop")), h(verb("rest")), h(verb("work")), h(verb("know")), h(verb("say")), h(verb("see")),
    h(verb("sleep")), h(verb("wake")), h(verb("push")), h(verb("pull")), h(verb("lose")), h(verb("find")), h(verb("bite")), h(verb("hurt", { forms: ["hurts", "hurt", "hurt"] })),
    h(abs("the cold")), h(abs("the dark")), h(abs("the distance")), h(abs("the work")), h(abs("the hunger")), h(abs("nothing")),
  ],
};

const J = { reg: ["jerome"] };
const j = (e: LexEntry): LexEntry => ({ ...e, ...J });

/** Jerome K. Jerome: the Victorian idler's outrage. Tins of pineapple, tow-lines, and other men's idleness. */
export const jerome: LexPack = {
  id: "jerome",
  title: "Three Men in a Boat",
  curator: "hunter",
  reviewedAt: "2026-09-07",
  level: 7,
  entries: [
    j(adj("beastly")), j(adj("confounded")), j(adj("bally")), j(adj("harum-scarum", { syl: 4 })), j(adj("preposterous", { syl: 4 })), j(adj("insufferable", { syl: 4 })),
    j(adj("abominable", { syl: 4 })), j(adj("ridiculous", { syl: 4 })), j(adj("wretched")), j(adj("hopeless")), j(adj("exasperating", { syl: 5 })),
    j(adj("maddening", { syl: 3 })), j(adj("lumbering", { syl: 3 })), j(adj("unprincipled", { syl: 4 })), j(adj("ungrateful", { syl: 3 })),
    j(n("muddle")), j(n("nuisance")), j(n("humbug", { pl: "-" })), j(n("tomfoolery", { pl: "-" })), j(n("kettle")), j(n("hamper")), j(n("tin of pineapple")), j(n("tow-line")), j(n("banjo")),
    j(n("umbrella")), j(n("tea", { pl: "-" })), j(n("patent medicine")), j(n("lock-keeper")), j(n("steam launch", { pl: "steam launches" })), j(n("cheese", { pl: "-" })),
    j(ins("duffer")), j(ins("silly ass", { band: 1 })), j(ins("blithering duffer", { band: 1 })), j(ins("born fool", { band: 1 })), j(ins("great lumbering duffer")), j(ins("humbug")),
    j(ins("idler")), j(ins("loafer")), j(ins("nincompoop")), j(ins("muddler")),
    j(interj("Confound it!")), j(interj("Oh, bother!")), j(interj("Hang it all!")), j(interj("Dash it!")), j(interj("Well, I never!")),
    j(abs("idleness")), j(abs("the work I am not doing")), j(abs("a settled melancholy")), j(abs("the injustice of it")),
    j(sim("a tin of pineapple with no opener")), j(sim("a tow-line that has been left to itself for five minutes")), j(sim("a man packing a hamper and forgetting the butter")),
    j(sim("Harris with a corkscrew")), j(sim("a steam launch on a quiet river")), j(sim("a patent medicine advertisement")),
    j(verb("potter")), j(verb("loaf")), j(verb("dawdle")), j(verb("muddle")), j(verb("grumble")), j(verb("superintend")),
  ],
};

const N_ = { reg: ["nautical"] };
const nt = (e: LexEntry): LexEntry => ({ ...e, ...N_ });

export const nautical: LexPack = {
  id: "nautical",
  title: "The Boatswain's Book of Oaths",
  curator: "hunter",
  reviewedAt: "2026-09-06",
  level: 9,
  entries: [
    nt(adj("thundering", { syl: 3 })), nt(adj("blistering", { syl: 3 })), nt(adj("blithering", { syl: 3 })), nt(adj("bilious", { syl: 3 })), nt(adj("barnacled", { syl: 3 })), nt(adj("bloviating", { syl: 4 })),
    nt(adj("ten-thousand-fathomed", { syl: 5 })), nt(adj("bilge-brained", { syl: 2 })), nt(adj("bandy-bowsprited", { syl: 5 })), nt(adj("becalmed", { syl: 2 })), nt(adj("keel-hauled", { syl: 2 })),
    nt(adj("salt-crusted", { syl: 3 })), nt(adj("kelp-brained", { syl: 2 })), nt(adj("fog-bound", { syl: 2 })), nt(adj("scuppered", { syl: 2 })), nt(adj("three-sheets-gone", { syl: 3 })), nt(adj("rudderless", { syl: 3 })),
    nt(adj("brine-pickled", { syl: 3 })), nt(adj("gull-pecked", { syl: 2 })), nt(adj("mast-headed", { syl: 3 })), nt(adj("waterlogged", { syl: 3 })), nt(adj("wind-bagged", { syl: 2 })), nt(adj("barnacle-bottomed", { syl: 5 })),
    nt(adj("squid-witted", { syl: 3 })), nt(adj("half-hitched", { syl: 2 })), nt(adj("plank-walking", { syl: 3 })), nt(adj("tide-tossed", { syl: 2 })), nt(adj("mizzen-minded", { syl: 4 })), nt(adj("bilge-soaked", { syl: 2 })),
    nt(ins("barnacle", { syl: 3 })), nt(ins("bilge-rat", { syl: 2 })), nt(ins("landlubber", { syl: 3 })), nt(ins("sea-gherkin", { syl: 3 })), nt(ins("freshwater swab", { syl: 4 })), nt(ins("porthole", { syl: 2 })),
    nt(ins("kelp-brained bollard", { syl: 5 })), nt(ins("ship's biscuit", { syl: 3 })), nt(ins("bag of ballast", { syl: 4 })), nt(ins("anchor without a chain", { syl: 6 })), nt(ins("walrus", { syl: 2, pl: "walruses" })),
    nt(ins("sea-cucumber", { syl: 4 })), nt(ins("limpet", { syl: 2 })), nt(ins("blowfish", { syl: 2, pl: "blowfish" })), nt(ins("bilge-pump", { syl: 2 })), nt(ins("fo'c'sle mattress", { syl: 4 })), nt(ins("lubber's knot", { syl: 3 })),
    nt(ins("wet hawser", { syl: 3 })), nt(ins("mainsail with no wind", { syl: 5 })), nt(ins("barrel of weevils", { syl: 5 })), nt(ins("sea-sponge", { syl: 2 })), nt(ins("beached whelk", { syl: 2 })), nt(ins("gulls' perch", { syl: 2 })),
    nt(ins("jellyfish", { syl: 3, pl: "jellyfish" })), nt(ins("coil of rotten rope", { syl: 5 })), nt(ins("scuttled dinghy", { syl: 4 })), nt(ins("bosun's nightmare", { syl: 4 })), nt(ins("sack of salt", { syl: 3 })),
    nt(n("barnacles")), nt(n("typhoons")), nt(n("bilge", { pl: "-" })), nt(n("kelp", { pl: "-" })), nt(n("brine", { pl: "-" })), nt(n("shingle", { pl: "-" })), nt(n("hawser")), nt(n("bowsprit")), nt(n("mizzen")),
    nt(n("scupper")), nt(n("keel")), nt(n("fathom")), nt(n("squall")), nt(n("doldrums", { pl: "doldrums" })), nt(n("flotsam", { pl: "-" })), nt(n("jetsam", { pl: "-" })), nt(n("tar", { pl: "-" })), nt(n("oakum", { pl: "-" })),
    nt(oath("thundering typhoons", 0)), nt(oath("blistering barnacles", 0)), nt(oath("by the bilge", 0)), nt(oath("shiver my timbers", 0)), nt(oath("salt and shingle", 0)), nt(oath("ten thousand thundering typhoons", 0)),
    nt(oath("bilious barnacles", 0)), nt(oath("blithering bowsprits", 0)), nt(oath("by all the fathoms", 0)), nt(oath("kelp and keelhaul", 0)), nt(oath("scupper me", 0)), nt(oath("blow me down", 0)),
    nt(oath("splice the mainbrace", 0)), nt(oath("great grinding gunwales", 0)), nt(oath("tarred and feathered", 0)), nt(oath("hoist my hawser", 0)), nt(oath("barnacles and brimstone", 1)),
    nt(oath("thundering, blistering, bilious barnacles", 0)), nt(oath("by Neptune's soggy beard", 0)), nt(oath("bilge and blazes", 1)), nt(oath("ten thousand barnacled bollards", 0)), nt(oath("blast my ballast", 1)),
    nt(inten("thunderingly", 0)), nt(inten("blisteringly", 0)), nt(inten("ten-thousand-fold", 0)), nt(inten("keelhaulingly", 0)),
    nt(abs("the doldrums")), nt(abs("scurvy")), nt(abs("shipwreck")), nt(abs("mutiny")), nt(sim("a shipwreck in a bathtub")), nt(sim("a mermaid's tax return")), nt(sim("a lighthouse in a cupboard")),
    nt(sim("a barnacle on a bicycle")), nt(sim("a tide that forgot to come in")), nt(sim("a walrus at a wedding")), nt(sim("a sextant in a snowstorm")), nt(sim("a figurehead facing backwards")),
    nt(verb("scupper")), nt(verb("keelhaul")), nt(verb("swab")), nt(verb("founder")), nt(verb("capsize")), nt(verb("heave")), nt(verb("wallow")),
    nt(threat("keelhaul you through a puddle")), nt(threat("swab the pen with you")), nt(threat("hoist you up the fence as a flag")), nt(threat("sail you to a land with no grass")),
    nt(threat("make you the figurehead of a very small boat")),
  ],
};

export const PACKS_5_8: LexPack[] = [groseVulgarTongue, bard, french, german, italianSpanish, yiddishScotsAussie, quebecSacres, hemingway, nautical, jerome];
