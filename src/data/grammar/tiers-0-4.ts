// Sentence structures, tiers 0-4. See docs/research/SENTENCE_GRAMMAR.md.
// #symbol# expands; modifiers: .cap .a .the .pl .up .s .ed .ing .poss
// Context symbols: target targets name vocative you it time remaining penned nth books sig village bignum hour dog
// The .allit modifier makes every .allit slot in a line start with the same letter as the first one.
// The .own modifier restricts a slot to entries tagged with the rule's own register (e.g. knitting threats).
import type { NonTerminal, Rule, RuleEvent } from "../../core/lang/types";

const R = (tier: number, event: RuleEvent, templates: string[], extra: Partial<Rule> = {}): Rule[] =>
  templates.map((template, i) => ({ id: `t${tier}-${event}-${i}`, tier, event, template, ...extra }));

export const NON_TERMINALS: NonTerminal[] = [
  {
    symbol: "insult_np",
    options: [
      { t: "#insult#", weight: 1 },
      { t: "#adj# #insult#", weight: 3 },
      { t: "#adj#, #adj# #insult#", weight: 2, minLevel: 3 },
      { t: "#insult# of a #target#", weight: 1, minLevel: 3 },
      { t: "#insult# of #abstract#", weight: 2, minLevel: 3 },
      { t: "#adj# #insult# of #abstract#", weight: 2, minLevel: 3 },
      { t: "#intensifier# #adj# #insult#", weight: 3, minLevel: 4 },
      { t: "#intensifier# #insult#", weight: 3, minLevel: 2, minBand: 2 },
      { t: "#intensifier# #adj# #insult#", weight: 4, minLevel: 2, minBand: 2 },
      { t: "#swear#-#adj# #insult#", weight: 1, minLevel: 2, minBand: 3 },
      { t: "#adj#, #adj#, #adj# #insult#", weight: 1, minLevel: 4 },
      { t: "#intensifier# #adj#, #adj# #insult# of #abstract#", weight: 1, minLevel: 4 },
    ],
  },
  {
    symbol: "adj_noun",
    options: [
      { t: "#adj# #noun#", weight: 3 },
      { t: "#adj# #target#", weight: 2 },
      { t: "#adj#, #adj# #noun#", weight: 1, minLevel: 3 },
    ],
  },
  {
    symbol: "clause",
    options: [
      { t: "this #target# is #adj#", weight: 3 },
      { t: "my #bodypart# are #selfadj#", weight: 2 },
      { t: "I am #selfadj#", weight: 2 },
      { t: "the #target# is #adj#", weight: 2 },
      { t: "I have #verb.ed# enough", weight: 1 },
      { t: "there is an ache in my #bodypart# the size of #noun.a#", weight: 1 },
      { t: "everything is #adj#", weight: 1 },
      { t: "#remaining# sheep are still out", weight: 2 },
      { t: "my #bodypart# have opinions", weight: 1, minLevel: 3 },
      { t: "you are #insult_np.a#", weight: 3, minLevel: 2 },
      { t: "I have #verb.ed# #penned# sheep", weight: 1 },
      { t: "this is not what I was promised", weight: 1, minLevel: 3 },
      { t: "the #target# has not helped", weight: 1, minLevel: 3 },
      { t: "you are as #adj# as #simile#", weight: 2, minLevel: 3 },
      { t: "I am as #selfadj# as #simile#", weight: 1, minLevel: 3 },
      { t: "#time#, I am #selfadj#", weight: 1, minLevel: 3 },
      { t: "nobody asked the #target#", weight: 1, minLevel: 3 },
      { t: "I did not choose this", weight: 1, minLevel: 2 },
      { t: "the #sig# was better than this", weight: 1, minLevel: 2 },
    ],
  },
  {
    symbol: "exclaim",
    options: [
      { t: "#interj.cap#!", weight: 2 },
      { t: "#interj.cap#.", weight: 2 },
      { t: "#oath.cap#!", weight: 4, minLevel: 4 },
      { t: "#oath.cap#.", weight: 2, minLevel: 4 },
      { t: "#pantheon.cap#!", weight: 2 },
      { t: "#swear.cap#!", weight: 3, minLevel: 5, minBand: 2 },
    ],
  },
  {
    symbol: "oath_phrase",
    options: [
      { t: "#oath.cap#", weight: 4 },
      { t: "#oath.cap# and #oath#", weight: 2 },
      { t: "#pantheon.cap#", weight: 2 },
      { t: "#oath.cap#, #oath# and #oath#", weight: 1 },
      { t: "#pantheon.cap#, #oath#", weight: 1 },
    ],
  },
  {
    symbol: "simile_phrase",
    options: [
      { t: "as #adj# as #simile#", weight: 3 },
      { t: "like #simile#", weight: 2 },
      { t: "with all the #abstract# of #simile#", weight: 1 },
    ],
  },
  {
    symbol: "terrain_gripe",
    options: [
      { t: "#target.cap#. More #target#.", weight: 2 },
      { t: "Who put this #target# here?", weight: 2 },
      { t: "This #target# was not here this morning.", weight: 1 },
      { t: "The #target# is winning.", weight: 1 },
      { t: "I have had it with #target#.", weight: 1 },
    ],
  },
];

export const RULES: Rule[] = [
  // ---------------------------------------------------------------- Tier 0
  ...R(0, "idle", [
    "#noun.cap#.", "#interj.cap#.", "#noun.cap#?!", "#interj.cap#. #noun.cap#.", "#bodypart.cap#.", "No.", "#target.cap#.", "Why.",
    "#noun.cap#. #noun.cap#.", "Far.", "#verb.cap#. #verb.cap#. #verb.cap#.", "#target.cap#?", "#interj.cap#. #interj.cap#.", "Sheep.", "Wool.", "Hmm.",
    "#bodypart.cap#. #interj.cap#.", "#remaining.cap#.", "#remaining.cap# left.", "#noun.cap#!", "#pantheon.cap#.",
  ]),
  ...R(0, "flee", ["No.", "Hey.", "#interj.cap#!", "Sheep!", "Back!", "Stop!", "Wait!", "#vocative.cap#!", "No no no.", "Oh no."]),
  ...R(0, "flee", ["#oath.cap#!", "#oath.cap#! Sheep!", "#swear.cap#. Back!", "#swear.cap#!"], { minBand: 1 }),
  ...R(0, "idle", ["#oath.cap#.", "#swear.cap#.", "#oath.cap#. #noun.cap#.", "#noun.cap#. #swear.cap#.", "#swear.cap#. #swear.cap#.", "#intensifier.cap# #noun#.", "#intensifier.cap# sheep."], { minBand: 1 }),
  ...R(0, "caught", ["#oath.cap#, heavy.", "Got you, you #insult#.", "#swear.cap#. Mine."], { minBand: 1 }),
  ...R(0, "penned", ["#oath.cap#. In.", "In, you #insult#.", "#swear.cap#. One."], { minBand: 1 }),
  ...R(0, "absurd", ["#swear.cap#. How.", "#oath.cap#! Up there?!", "How. #swear.cap#. HOW."], { minBand: 1 }),
  ...R(0, "caught", ["Got.", "Mine.", "#interj.cap#.", "Heavy.", "Up.", "Come.", "Hnngh.", "Got #you#.", "Right."]),
  ...R(0, "penned", ["In.", "Good.", "One.", "Stay.", "There.", "Sit.", "#penned.cap#.", "In. Good.", "Stay in."]),
  ...R(0, "absurd", ["Why. Up.", "How.", "#target.cap#?!", "Up. Why.", "No. How.", "Sheep. Rock. Why.", "#interj.cap#. How."]),
  ...R(0, "repeatEscape", ["You.", "Again.", "You. Again.", "#vocative.cap#.", "No. You.", "Not you."]),
  ...R(0, "finished", ["All. In.", "Done.", "All of them. In.", "...Done. All done."]),
  ...R(0, "epitaph", ["#noun.cap#.", "#interj.cap#.", "Sheep.", "#target.cap#.", "Mud."]),
  ...R(0, "book", ["Book.", "Words.", "Ooh.", "Book. Good.", "Hm. Words."]),
  ...R(0, "walkOfShame", ["Empty.", "#interj.cap#. Nothing.", "Pen. No sheep.", "Past. Nothing."]),
  ...R(0, "rain", ["Rain.", "Wet.", "Rain. #interj.cap#.", "More wet."]),
  ...R(0, "dusk", ["Dark soon.", "Sun low.", "Still sheep.", "Tired."]),
  ...R(0, "breather", ["Sit.", "#bodypart.cap#.", "Moment.", "Rest. Short."]),

  // ---------------------------------------------------------------- Tier 1
  ...R(1, "idle", ["#intensifier.cap# #adj# #target#.", "#oath.cap#, #target#.", "#adj.cap# #intensifier# #noun#.", "#swear.cap#. #adj.cap# #noun#.", "#intensifier.cap# #adj# #noun# in my boot."], { minBand: 1 }),
  ...R(1, "idle", [
    "#adj.cap# #target#.", "#adj.cap# #noun#.", "#interj.cap#, #noun#.", "#bodypart.cap# #selfadj#.", "Not again.", "#adj.cap# day.", "More #noun#.",
    "Too #adj#.", "#adj.cap#. #adj.cap#. #adj.cap#.", "#adj.cap# #target#, #adj# #noun#.", "#remaining.cap# more.", "#interj.cap#, #bodypart#.",
    "#adj.cap# #sig#.", "Long way.", "#noun.cap# in boot.", "#adj.cap# sheep. #adj.cap# hill. #adj.cap# me.", "#pantheon.cap#, #noun#.",
  ]),
  ...R(1, "flee", ["Bad #target#!", "#interj.cap#! #vocative.cap#!", "Come back!", "Stop, #vocative#!", "#adj.cap# #target#!", "Not that way!", "Legs! Why legs!"]),
  ...R(1, "caught", ["Got #you#.", "#adj.cap#. #adj.cap# sheep.", "Up we go.", "Heavy #target#.", "Hold still.", "Mine now.", "#adj.cap# and #adj#."]),
  ...R(1, "penned", ["In. Stay in.", "Good #target#. Stay.", "#penned.cap# in.", "One more in.", "Stay. Good.", "#penned.cap# in, #remaining# out."]),
  ...R(1, "absurd", ["Why here?!", "#adj.cap# place for a sheep.", "How up there.", "A #target#. On a rock.", "Sheep. Why. Up.", "#interj.cap#. Climbing sheep."]),
  ...R(1, "repeatEscape", ["You again.", "#vocative.cap#. Again.", "Bad #vocative#.", "Not you. Not again.", "I know you."]),
  ...R(1, "finished", ["All in. Good.", "Done. All done. #interj.cap#.", "#penned.cap# in. None out."]),
  ...R(1, "epitaph", ["#adj.cap# #noun#.", "#adj.cap# sheep.", "#interj.cap#. #noun.cap#.", "Too #adj#."]),
  ...R(1, "book", ["A book. #interj.cap#.", "Words. #adj.cap# words.", "Good book.", "New words."]),
  ...R(1, "walkOfShame", ["Empty hands.", "Past the pen. Nothing.", "#interj.cap#. Look away, sheep."]),
  ...R(1, "rain", ["Rain now. #interj.cap#.", "Wet #target#.", "Of course. Rain."]),
  ...R(1, "dusk", ["Dark soon. #remaining.cap# out.", "Sun going. Sheep staying.", "#adj.cap# evening."]),
  ...R(1, "breather", ["Sit down. Short.", "#bodypart.cap#. #interj.cap#.", "Moment. Just a moment."]),

  // ---------------------------------------------------------------- Tier 2
  ...R(2, "idle", ["This #intensifier# #target# is #adj#.", "#oath.cap#, my #bodypart#.", "I hate this #intensifier# #target#.", "#swear.cap#. #swear.cap#. #clause.cap#.", "Who put this #intensifier# #target# here?"], { minBand: 2 }),
  ...R(2, "idle", [
    "This #target# is #adj#.", "I do not like #noun.pl#.", "My #bodypart# are #selfadj#.", "This is #adj_noun.a#.", "Why is there #noun.a# in my #bodypart#?",
    "#remaining.cap# sheep left. #interj.cap#.", "I want to sit down.", "Every #target# is #adj#. Every one.", "There is #noun.a# in my boot.",
    "Who put this #target# here?", "#vocative.cap#, you are #adj#.", "You are #insult_np.a#.", "I have carried #penned# sheep and my #bodypart# know it.",
    "The #target# is #adj# and I am #selfadj#.", "#terrain_gripe#", "I am a herder. I herd. I do not #verb#. And yet.", "#clause.cap#.",
    "#clause.cap# and #clause#.", "#exclaim# #clause.cap#.", "Nobody told me about the #noun.pl#.", "I did not sign up for #noun.pl#.",
    "#interj.cap#. #clause.cap#.", "This #sig# is the only #sig# I trust.", "I will remember this #target#.",
  ]),
  ...R(2, "flee", [
    "Come back here, you #insult#!", "#vocative.cap#! Stop running!", "I saw that, #vocative#.", "Do not make me walk.", "You #adj# #insult#!",
    "#interj.cap#! That #insult# runs faster than it looks.", "Where are you going? There is nothing there!", "You have four legs and no plan!",
  ]),
  ...R(2, "caught", [
    "Got you, you #insult#.", "You weigh more than you should.", "There. Was that so hard?", "Hold still, #vocative#.", "Up you come, you #adj# #noun#.",
    "You are #adj# and you are mine.", "I have you. Stop bleating.", "Right. Home. Both of us.",
  ]),
  ...R(2, "penned", [
    "Stay in there. I mean it.", "#nth.cap# one in. #remaining.cap# to go.", "Stay. Sit. Be a #adj# #noun# in there.", "Good. Now do not leave.",
    "In you go, #vocative#.", "That is #penned#. That is not enough.", "One down. My #bodypart# also down.", "The pen is nice. Stay in the pen.",
  ]),
  ...R(2, "absurd", [
    "How did you get up there?", "That is not where sheep go.", "Who taught you to climb?", "You are a sheep. This is a #noun#. Explain.",
    "Sheep do not belong on #noun.pl#.", "I am not built for this. Neither are you.", "Why is it always the #adj# ones?",
  ]),
  ...R(2, "repeatEscape", [
    "You again, #vocative#.", "I know your face, #vocative#.", "Not you. Anyone but you.", "#vocative.cap#. Of course it is you.",
    "I have a name for you now, #vocative#, and it is #vocative#.", "You are the #adj# one. I remember.",
  ]),
  ...R(2, "finished", ["All of them. All of you. In.", "That is every sheep. Every single one.", "#penned.cap# sheep. One herder. Done."]),
  ...R(2, "epitaph", ["He hated #noun.pl#.", "Every #target# was #adj#.", "My #bodypart#.", "#insult_np.cap#."]),
  ...R(2, "book", ["I did not know there was a word for that.", "This book calls it #noun.a#. I have other names.", "Words. So many words.", "Somebody wrote this down. Good."]),
  ...R(2, "walkOfShame", ["Do not look at me, sheep. I am working.", "Empty-handed past the pen. #interj.cap#.", "I know. I know. I am going."]),
  ...R(2, "rain", ["Rain. Of course it is raining.", "The sky has joined in.", "Wet sheep are heavier. Nobody says that."]),
  ...R(2, "dusk", ["Dark soon and #remaining# still out.", "The sun is leaving. The sun is allowed to leave.", "Evening. #adj.cap# evening."]),
  ...R(2, "breather", ["Sitting. Just for a moment.", "My #bodypart#. Just a moment.", "The stump does not run away. I like the stump."]),

  // ---------------------------------------------------------------- Tier 3
  ...R(3, "idle", [
    "You are as #adj# as #simile#.", "This #target# is more #adj# than #simile#.", "I am as #selfadj# as #simile# and twice as #adj#.",
    "#vocative.cap#, you #insult_np#.", "You #adj#, #adj# #insult# of #abstract#!", "My #bodypart# feel like #simile#.", "This day is #simile#, #time#.",
    "Sheep, like #simile#, do not listen.", "I have the #abstract# of #simile#.", "#clause.cap#, #simile_phrase#.", "#exclaim# #clause.cap#, #time#.",
    "#remaining.cap# sheep, #time#, and a #target# like #simile#.", "Every #target# I meet is #adj#. Every one. That is not how any of this is supposed to work.",
    "There is a word for this #target#, and the word is #insult#.", "I would rather carry #simile# than this #target#.",
    "I have seen #simile# move with more purpose than this #target#.", "#clause.cap#; that is all. That is the whole of it.",
    "There is a #noun# in my boot and #abstract# in my heart.",
  ]),
  ...R(3, "flee", [
    "You run like #simile#!", "Come back, you #insult_np#!", "You #adj#, #adj# #insult#!", "#vocative.cap#, you have the loyalty of #simile#.",
    "Run, then! Run like #simile#!", "Every sheep runs, #time#. Every one. Like #simile#.",
  ]),
  ...R(3, "caught", [
    "Got you, you #insult_np#.", "You are heavier than #simile#.", "You smell like #simile# left in #noun#.", "Come here, #insult_np#, and be carried.",
    "I have you, and you are as #adj# as #simile#.",
  ]),
  ...R(3, "penned", [
    "Stay in there like #simile#. Do not move.", "#penned.cap# in, #remaining# out, and my #bodypart# like #simile#.", "In. And stay in, you #insult_np#.",
    "#nth.cap# sheep penned, #time#. I feel like #simile#.",
  ]),
  ...R(3, "absurd", [
    "A sheep on #noun.a#. Like #simile#.", "You have the sense of #simile# and the reach of a goat.", "How? You are #adj#. You are #adj# and round. How?",
    "That is not a place. That is #noun.a# you #insult#.",
  ]),
  ...R(3, "repeatEscape", [
    "#vocative.cap#. Twice. Like #simile#, you keep coming back to disappoint me.", "You, #vocative#, are #abstract# with legs.",
    "#vocative.cap#, you #adj#, #adj# #insult#. Again.", "I named you #vocative# and you have earned it twice.",
  ]),
  ...R(3, "finished", ["#penned.cap# sheep. #books# books. One herder, #simile_phrase#. In.", "Every sheep. Every #adj# one. Like #simile#, I am finished."]),
  ...R(3, "epitaph", ["#insult_np.cap#.", "As #adj# as #simile#.", "#abstract.cap# with legs.", "Here lies a man who hated #noun.pl#."]),
  ...R(3, "book", ["A book, #time#. Better than #simile#.", "Reading. I had forgotten how. Like #simile#.", "New words for old #noun.pl#."]),
  ...R(3, "walkOfShame", ["Past the pen with nothing, like #simile#.", "The sheep watch me go by. Empty. Like #simile#."]),
  ...R(3, "rain", ["Rain, #time#. Like #simile#, it does not care.", "And now rain. As #adj# as #simile#."]),
  ...R(3, "dusk", ["Dusk, #remaining# out, and I feel like #simile#.", "The light goes like #simile#. So do I."]),
  ...R(3, "breather", ["A sit-down. I am as #selfadj# as #simile#.", "Sitting like #simile#. Just a moment."]),

  // ---------------------------------------------------------------- Tier 4
  ...R(4, "idle", [
    "#oath_phrase#, #time#, and still #remaining# sheep to go.", "Hear me, O #vocative.cap#: #clause#, and #clause#.", "#oath.cap# and #oath#! #clause.cap#.",
    "#pantheon.cap#, #clause#.", "Come here, you #insult_np#, so that I may #threat#.", "#clause.cap#, and #clause#, and #oath#.",
    "I will #threat#, #vocative#. I have decided.", "#oath.cap#! #oath.cap#! #interj.cap#!", "#intensifier.cap# #adj#. #intensifier.cap# #adj#. That is this #target#.",
    "O #target.cap#, you #intensifier# #adj# #noun#, #clause#.", "#oath_phrase#! #clause.cap#!", "Attend, #vocative#: #clause#, #clause#, and I am done being polite.",
    "#pantheon.cap#, grant me one #adj# #target# that is not #adj#.", "#oath.cap#, I say, and #oath# again, for #clause#.",
    "Let it be written: #time#, #clause#.", "#intensifier.cap# #adj# #noun.pl#, all of them, #time#.",
  ]),
  ...R(4, "flee", [
    "#oath.cap#, #vocative#! Stand still or I shall #threat#!", "Stop, you #insult_np#, or I will #threat#!", "#pantheon.cap#, it runs!",
    "#oath_phrase#! Come back, you #intensifier# #adj# #insult#!", "Run, #vocative#, and I will #threat# when I catch you!",
  ]),
  ...R(4, "caught", [
    "#oath.cap#, you are heavy. Hold still or I shall #threat#.", "Got you, you #insult_np#, and #oath#, you will stay got.",
    "#pantheon.cap#, you weigh like #simile#. Up.", "There, you #intensifier# #adj# #insult#. Home.",
  ]),
  ...R(4, "penned", [
    "In, #oath#, in! And stay, or I shall #threat#.", "#penned.cap# penned, #remaining# roaming, and #oath#, my #bodypart#.",
    "#pantheon.cap#, that is #penned#. Stay in, you #insult_np#.", "#oath_phrase#, another one in. #remaining.cap# to go.",
  ]),
  ...R(4, "absurd", [
    "#oath.cap#! On #noun.a#! You #insult_np#!", "#pantheon.cap#, how? HOW? You have hooves!", "#oath_phrase#, a sheep on #noun.a#, #time#!",
    "You #intensifier# #adj# #insult#, that is not a place for a sheep!",
  ]),
  ...R(4, "repeatEscape", [
    "#oath.cap#, #vocative#, we meet again, and I have not missed you.", "#vocative.cap#! You #adj#, #adj#, #adj# #insult#! Twice!",
    "#pantheon.cap#, it is #vocative#. Of course it is #vocative#.", "#oath_phrase#! #vocative.cap#, I will #threat#, and I will enjoy it.",
  ]),
  ...R(4, "finished", ["#oath_phrase#. All in. #penned.cap# sheep, #books# books, one herder, and #oath#, my #bodypart#.", "#pantheon.cap#, it is done. Every #adj# one of you. In."]),
  ...R(4, "epitaph", ["#oath.cap#.", "#insult_np.cap#.", "#pantheon.cap#.", "#intensifier.cap# #adj#."]),
  ...R(4, "book", ["#oath.cap#, a book! I shall read it and become insufferable.", "A book, #pantheon#. Words to #verb# by.", "#interj.cap#. Literature. Just what my #bodypart# needed."]),
  ...R(4, "walkOfShame", ["#oath.cap#, past the pen with nothing. Look away, you #insult_np.pl#.", "#pantheon.cap#, the walk of shame, #time#."]),
  ...R(4, "rain", ["#oath.cap#, rain! #intensifier.cap# #adj# rain!", "#pantheon.cap#, must it rain as well?"]),
  ...R(4, "dusk", ["#oath.cap#, the light is going and #remaining# sheep are not.", "Dusk, #pantheon#, and #remaining# #adj# #insult.pl# still out."]),
  ...R(4, "breather", ["#oath.cap#. A sit-down. #intensifier.cap# earned.", "#pantheon.cap#, a stump. I love this stump."]),
];
