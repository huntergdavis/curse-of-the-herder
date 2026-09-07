// Sentence structures, tiers 5-8: the Vulgar Tongue, the Bard, the Polyglot,
// and Hemingway. See docs/research/SENTENCE_GRAMMAR.md. Ids are prefixed
// t5- .. t8- and never collide with tiers-0-4.
import type { NonTerminal, Rule, RuleEvent } from "../../core/lang/types";

const R = (tier: number, event: RuleEvent, templates: string[], extra: Partial<Rule> = {}): Rule[] =>
  templates.map((template, i) => ({ id: `t${tier}-${event}-${i}`, tier, event, template, ...extra }));

const GROSE = { reg: ["grose"] };
const BARD = { reg: ["bard"] };
const POLY = { reg: ["fr", "de", "it", "es", "yi", "sco", "au", "qc"] };
const HEM = { reg: ["hemingway"] };
const JER = { reg: ["jerome"] };
const CRAWL = { reg: ["crawler"] };

export const NON_TERMINALS_5_8: NonTerminal[] = [
  {
    symbol: "triad",
    options: [
      { t: "you #F0:insult#, you #F1:insult#, you #F2:insult#", weight: 3 },
      { t: "#F0:insult#, #F1:insult# and #F2:insult#", weight: 2 },
      { t: "you #adj# #F0:insult#, you #adj# #F1:insult#, you #intensifier# #adj# #F2:insult#", weight: 2 },
      { t: "you #insult#, you #insult#, you #insult#", weight: 1 },
    ],
  },
  {
    symbol: "aside",
    options: [
      { t: "(if that is your real name)", weight: 2 },
      { t: "(and I use the word loosely)", weight: 2 },
      { t: "(for want of a better word)", weight: 1 },
      { t: "(I say this with love, and I am lying)", weight: 1 },
      { t: "(as I have noted before, to nobody)", weight: 1 },
      { t: "(the #nth# of your kind today)", weight: 1 },
      { t: "(and the #target# agrees with me)", weight: 1 },
    ],
  },
  {
    symbol: "bard_np",
    options: [
      { t: "thou #adj# #insult#", weight: 3 },
      { t: "thou #adj#, #adj# #insult#", weight: 3 },
      { t: "thou #intensifier# #adj# #insult#", weight: 2 },
      { t: "thou #insult# of #abstract#", weight: 1 },
      { t: "thou #adj# #insult# of a #target#", weight: 1 },
    ],
  },
  {
    symbol: "bard_clause",
    options: [
      { t: "thou art #adj#", weight: 3 },
      { t: "thy wool offends the very #noun#", weight: 1 },
      { t: "my #bodypart# do ache", weight: 2 },
      { t: "the #target# is #adj# and I am #selfadj#", weight: 2 },
      { t: "#remaining# sheep yet roam", weight: 2 },
      { t: "thou hast #verb.ed# enough", weight: 1 },
      { t: "I am #selfadj# past all bearing", weight: 1 },
      { t: "the #target# mocks me", weight: 1 },
      { t: "thou art #insult_np.a#", weight: 2 },
    ],
  },
  {
    symbol: "poly_oaths",
    options: [
      { t: "#oath.cap#! #oath.cap#!", weight: 3 },
      { t: "#oath.cap#, #oath#, #oath#!", weight: 2 },
      { t: "#oath.cap# and, while I am at it, #oath#.", weight: 2 },
      { t: "#oath.cap#. Also #oath#.", weight: 1 },
    ],
  },
  {
    symbol: "hem_short",
    options: [
      { t: "It was #adj#", weight: 2 },
      { t: "It was a #adj# #target#", weight: 2 },
      { t: "I did not like it", weight: 1 },
      { t: "That was all", weight: 2 },
      { t: "It was #time#", weight: 1 },
      { t: "There was no #noun#", weight: 1 },
      { t: "The #noun# was #adj#", weight: 2 },
      { t: "I #verb.ed# and that was the day", weight: 1 },
    ],
  },
];

export const RULES_5_8: Rule[] = [
  // ---------------------------------------------------------------- Tier 5: The Vulgar Tongue
  ...R(5, "idle", [
    "#vocative.cap# #aside#, #clause#.", "#triad.cap#.", "You are #insult_np.a#, #vocative#, and I say that as a man who has met #insult.pl#.",
    "#oath.cap#, #clause#, which is a thing I never thought I would say aloud, and yet.", "#clause.cap#; #clause#; and, #oath#, #clause#.",
    "#remaining.cap# sheep left, and every one of them #insult_np.a#.", "There is a word for you, #vocative#. The word is #insult#. There are others.",
    "I have been called many things, #vocative#, but never #adj# by a #target#.", "#interj.cap#. #clause.cap#. I record this for the benefit of nobody.",
    "#vocative.cap#, you #insult#, you #insult#, you thoroughgoing #insult#.", "My #bodypart#, #vocative#, are #adj#, and it is your doing.",
    "Consider the #target#: #adj#, #adj#, and, in the final analysis, #adj#.", "This is the #nth# #target# today to be #adj# at me. I am keeping count.",
    "#oath.cap#. #oath.cap#. I have run out of the polite ones.", "A #adj# #target#, a #adj# sky, and a herder as #adj# as #simile#. Behold the morning.",
    "#triad.cap#! And I have not yet started on your relatives.", "There is #noun.a# in my boot #aside#, and #abstract# in my heart.",
    "#vocative.cap#, I would call you #insult_np.a# but I have standards, and they are #adj#.", "One could say, #vocative#, that you are #adj#. One would be understating it.",
  ], GROSE),
  ...R(5, "flee", [
    "Stop, #vocative#, you #insult#, you #insult#, you #intensifier# #adj# #insult#!", "#oath.cap#! Come back here #aside# and be caught like a sensible #noun#!",
    "#triad.cap#! Running! From me!", "Where does #insult_np.a# even go, #vocative#? There is nothing over there but #noun#!",
    "Oh, that is #adj#, #vocative#. That is #intensifier# #adj#. Run, then.", "#oath.cap#, the #adj# #insult# has legs after all.",
  ], GROSE),
  ...R(5, "caught", [
    "Got you, #vocative# #aside#. You weigh what #simile# weighs.", "There, you #insult#. Caught, and not before time.",
    "You are #adj#, you are heavy, and you are, #oath#, coming with me.", "#oath.cap#, #vocative#, you are #insult_np.a# and I have you by the middle.",
    "Caught. #triad.cap#. Caught.",
  ], GROSE),
  ...R(5, "penned", [
    "In you go, #vocative#, and may the pen improve you.", "#nth.cap# sheep penned #aside#. #remaining.cap# remain, each more #adj# than the last.",
    "#oath.cap#, that is #penned#. I am told there are #remaining# more. I am told this by my #bodypart#.", "Stay in, you #insult#. The gate is not a suggestion.",
    "#penned.cap# in. My #bodypart# lodge a complaint, and I have signed it.",
  ], GROSE),
  ...R(5, "absurd", [
    "#oath.cap#! On #noun.a#! A #target#, #vocative#, #aside#, on #noun.a#!", "How, #vocative#? How? You #insult#, you have no thumbs!",
    "Sheep do not belong up there. That is where #noun.pl# belong, and #abstract#.", "#triad.cap#, come down from there this instant!",
  ], GROSE),
  ...R(5, "repeatEscape", [
    "#vocative.cap#. Again. #triad.cap#.", "#oath.cap#, #vocative#, twice in one day! You #insult#! You #adj# #insult#!",
    "I named you, #vocative#, and now I regret it, for I must say your name when I curse you.", "#vocative.cap# #aside#, we have done this. We have done exactly this.",
  ], GROSE),
  ...R(5, "book", ["A book! #oath.cap#, I shall learn a word and misuse it before dusk.", "Words, #vocative#. Some of them about you.", "#interj.cap#. A book #aside#. Sit. Read. Curse better."], GROSE),
  ...R(5, "dusk", ["The light goes, #oath#, and #remaining# #insult.pl# have not.", "Dusk #aside#, and I am as #selfadj# as #simile#."], GROSE),
  ...R(5, "breather", ["A sit-down, #oath#. My #bodypart# have earned it; the #target# has not.", "I sit. The #target# does not. I am winning, in a sense."], GROSE),
  ...R(5, "walkOfShame", ["Past the pen, empty-handed, like #simile# #aside#.", "Look away, #insult.pl#. I am between sheep."], GROSE),
  ...R(5, "rain", ["Rain, #oath#, on top of #noun#, on top of #abstract#.", "The sky is #adj# too. Everything is #adj# today #aside#."], GROSE),
  ...R(5, "finished", ["#oath.cap#. All in. #penned.cap# #insult.pl#, one herder, and no witnesses.", "Done, #oath#. Every #adj# one. I shall now sit down for a hundred years."], GROSE),
  ...R(5, "epitaph", ["#triad.cap#.", "#insult_np.cap#, all of them.", "He kept count.", "#oath.cap#, said he, and sat.", "#adj.cap# to the last."], { ...GROSE, maxChars: 80 }),

  // ---------------------------------------------------------------- Tier 6: The Bard
  ...R(6, "idle", [
    "#bard_np.cap#!", "#oath.cap#! #bard_np.cap#!", "Would that #target# were #adj#, for then #clause#.", "Thou art #insult_np.a#, and I am weary of thee.",
    "#bard_clause.cap#, and #bard_clause#.", "Hie thee hence, #bard_np#, ere I #threat#.", "A plague upon this #target#, and upon thee, #bard_np#.",
    "#vocative.cap#, thou #adj#, #adj# #insult#, hear me: #bard_clause#.", "Out, #adj# #target#! Out, I say! #bard_clause.cap#.",
    "I would thou wert more #adj#, that I might curse thee the more.", "#oath.cap#, what #insult# is this that stands before me, #adj# and #adj#?",
    "Thou #insult#, thou #insult#, thou #intensifier# #adj# #insult#, get thee to #noun.a#!", "#bard_clause.cap#; I have said it, and I shall say it again to the #target#.",
    "Marry, #vocative#, thou art as #adj# as #simile#, and the day is #adj# with thee.", "What #abstract# is this, that I should #verb# #remaining# sheep #time#?",
    "#oath.cap#! Get thee to #noun.a#, #bard_np#.", "Thou #adj# #insult#, thy wool is #adj# and thy purpose more #adj# still.",
    "Peace, #target#! Thou art #adj#, and I would have quiet from thee.", "I do beshrew this #target#, and this #noun#, and thee, #bard_np#.",
    "Hear me, ye #noun.pl#: #bard_clause#, and I am past caring.", "#bard_np.cap#, thou wert made of #abstract# and left out in the rain.",
    "Sirrah #target#, I have carried #penned# of thy kind, and each was more #adj# than the last.", "Fie! #bard_clause.cap#! Fie again!",
  ], BARD),
  ...R(6, "flee", [
    "Stay, #bard_np#! Stay, I say, ere I #threat#!", "#oath.cap#! It flies! #bard_np.cap#, come hither!", "Hold, thou #adj# #insult#! Thy legs are #adj# and thy cause is lost!",
    "Wilt thou run, #vocative#? Then run, #bard_np#, and be #adj# elsewhere!", "#oath.cap#, the #insult# bolts like #simile#!",
  ], BARD),
  ...R(6, "caught", [
    "Now, #bard_np#, I have thee, and thou art heavy.", "Thou art caught, #vocative#, and I am #selfadj#; we are neither of us pleased.",
    "#oath.cap#, thou weighest as #simile#. Up, #insult#.", "Come, #bard_np#, and be carried, for thou wilt not be led.",
  ], BARD),
  ...R(6, "penned", [
    "In, #bard_np#, and trouble me no more.", "#nth.cap# sheep penned. #oath.cap#, #remaining# yet roam, each one #insult_np.a#.",
    "There, #vocative#. Abide, and be #adj# where I cannot see thee.", "Get thee in, thou #adj# #insult#, and mind the gate.",
  ], BARD),
  ...R(6, "absurd", [
    "#oath.cap#! A sheep upon #noun.a#! What #abstract# is this?", "How camest thou there, #bard_np#? Thou hast no wings, and less sense!",
    "Come down, thou #adj# #insult#, ere I #threat#!", "Sheep do not roost. Thou art not a #noun#. Come down.",
  ], BARD),
  ...R(6, "repeatEscape", [
    "#vocative.cap#! Thou again! #bard_np.cap#, I know thee!", "Twice, #vocative#! Twice thou hast fled me, thou #adj#, #adj# #insult#!",
    "#oath.cap#, it is #vocative#. Of all the sheep in this #adj# field, #vocative#.", "I named thee #vocative#, and thou hast made a curse of it.",
  ], BARD),
  ...R(6, "book", ["A book! #oath.cap#, I shall read, and be the more eloquent in my #abstract#.", "Soft, what words are these? Ill words, I hope, for the #target#.", "Marry, a book. I shall learn a phrase and spend it on a sheep."], BARD),
  ...R(6, "dusk", ["The light doth fail, and #remaining# sheep do not.", "Dusk, #oath#, and I am #selfadj# as #simile#."], BARD),
  ...R(6, "breather", ["I sit. #oath.cap#, my #bodypart# thank me; the #target# does not.", "A moment's rest, ere I #verb# again into #abstract#."], BARD),
  ...R(6, "walkOfShame", ["Past the pen, empty-handed, like #simile#. Look not upon me, #insult.pl#.", "#oath.cap#, I pass mine own pen with nothing. The sheep within do smirk."], BARD),
  ...R(6, "rain", ["Rain! #oath.cap#, the heavens are #adj# too!", "It rains, and I am #selfadj#, and the #target# is more #adj#."], BARD),
  ...R(6, "finished", ["#oath.cap#. All in. #penned.cap# sheep, and I, #adj# as #simile#, am done.", "The last is penned. Fie upon this day, and good night."], BARD),
  ...R(6, "epitaph", ["#bard_np.cap#.", "Get thee to #noun.a#.", "#oath.cap#, and so to bed.", "He was #adj#. They were more #adj#.", "Exit, pursued by sheep."], { ...BARD, maxChars: 80 }),

  // ---------------------------------------------------------------- Tier 7: Polyglot
  ...R(7, "idle", [
    "#oath.cap#, #clause#.", "#poly_oaths# #clause.cap#.", "You absolute #insult# of a #target#.", "#oath.cap#! You #intensifier# #adj# #insult#!",
    "#oath.cap#, #oath#, #oath#. There. Three languages, one #target#.", "#vocative.cap#, you #insult#. You #insult#. You, in a word, #insult#.",
    "I have words in four tongues for you, #vocative#, and the kindest is #insult#.", "#oath.cap#, #clause#, and #oath#, #clause#.",
    "Every language has a word for you, #vocative#. Today's is #insult#.", "#oath.cap#. #interj.cap#. #oath.cap#. I have run out of English.",
    "A #target# like this deserves a better oath than I own. #oath.cap#. That will have to do.", "#clause.cap#. #oath.cap#. #clause.cap#. #oath.cap#. It is a rhythm now.",
    "#vocative.cap#, sacré #insult#, #clause#.", "Herr #target.cap#, you #intensifier# #adj# #insult#, #clause#.",
    "#oath.cap#! The #target# is #adj#, the sky is #adj#, and I am #selfadj# in several languages.", "You #insult#, #vocative#. You #adj#, #adj# #insult#. #oath.cap#.",
    "#interj.cap#. #oath.cap#. #remaining.cap# sheep, and no word in any tongue for how #adj# I am.", "#oath.cap#, and I mean that in the original.",
    "Signor #target.cap#, #clause#; #oath#.", "#poly_oaths# That is what I think of this #target#.",
  ], POLY),
  ...R(7, "flee", [
    "#oath.cap#! Come back, you #insult#!", "#poly_oaths# It runs!", "#oath.cap#, #vocative#! Arrêtez! Halt! Stop, you #adj# #insult#!",
    "Run, you #insult#! I have oaths in four languages and legs in none!", "#oath.cap#! #oath.cap#! You #intensifier# #adj# #insult#, stand still!",
  ], POLY),
  ...R(7, "caught", [
    "#oath.cap#, got you, you #insult#.", "There, you #adj# #insult#. #oath.cap#. Up.", "#poly_oaths# You weigh like #simile#, #vocative#.",
    "Caught, you #insult#. #oath.cap#. Home.",
  ], POLY),
  ...R(7, "penned", [
    "#oath.cap#, in you go. #remaining.cap# left.", "#nth.cap# penned. #oath.cap#, #oath#, and stay in.", "In, you #insult#. #oath.cap#, my #bodypart#.",
    "#poly_oaths# That is #penned#. Stay.",
  ], POLY),
  ...R(7, "absurd", [
    "#oath.cap#! On #noun.a#! You #insult#!", "#poly_oaths# How? HOW, you #adj# #insult#?", "Mamma mia, #vocative#, that is #noun.a#, not a pasture!",
    "#oath.cap#, a sheep on #noun.a#. I need a word for this and I have several.",
  ], POLY),
  ...R(7, "repeatEscape", [
    "#oath.cap#, #vocative#! Again! You #intensifier# #adj# #insult#!", "#poly_oaths# #vocative.cap#. Of course.", "#vocative.cap#, you #insult#, you #insult#, you #insult#. Twice.",
    "#oath.cap#, it is #vocative#. Every language I know has a word for you, and they are all #insult#.",
  ], POLY),
  ...R(7, "book", ["#oath.cap#, a book! More words! More languages to be #adj# in!", "A book. #interj.cap#. I shall learn to swear in a fifth tongue.", "Words, #oath#. I collect them like burrs."], POLY),
  ...R(7, "dusk", ["#oath.cap#, dusk, and #remaining# sheep still out.", "The sun goes, #oath#, in every language at once."], POLY),
  ...R(7, "breather", ["#oath.cap#. A sit-down. Bene. Gut. Bon.", "I sit, #oath#, and the #target# does not follow. Small mercies."], POLY),
  ...R(7, "walkOfShame", ["#oath.cap#, past the pen with nothing. Do not look, #insult.pl#.", "Empty-handed, #oath#, like #simile#."], POLY),
  ...R(7, "rain", ["#oath.cap#, rain! #oath.cap#, more rain!", "Rain, #oath#. Il pleut. Es regnet. It is all the same water."], POLY),
  ...R(7, "finished", ["#poly_oaths# All in. #penned.cap# sheep and one herder, #adj# in every tongue.", "#oath.cap#. Done. Fini. Fertig. In."], POLY),
  ...R(7, "epitaph", ["#oath.cap#.", "#oath.cap#. #oath.cap#.", "#insult.cap#, in every language.", "#swear.cap#.", "Fini."], { ...POLY, maxChars: 80 }),

  // ---------------------------------------------------------------- Tier 8: Hemingway
  ...R(8, "idle", [
    "The #target# was #adj.own#. It was a bad #target#. I went up.", "I carried it and it was heavy and the #target# was long and that was the day.",
    "It bit me. That is all there is to say about sheep.", "There were #remaining# sheep. There had been more. I did not think about the ones before.",
    "The #noun# was #adj.own# and the #noun# was #adj.own# and I was not.", "I #verb.ed#. I #verb.ed# again. The #target# did not care and I did not ask it to.",
    "#hem_short#. #hem_short#. #hem_short#.", "A man carries a sheep. Then he carries another. There is no more to it than that.",
    "The #target# was there #time#. I was there too. Neither of us said anything.", "I did not think about the #noun#. I thought about the #noun# instead. It was the same.",
    "#remaining.cap# sheep. #penned.cap# in. The #noun# does not count them and neither should I.", "It was #adj.own# and it was #time# and I was tired in the way that is not tiredness.",
    "The #noun# did not help. Nothing helps. You carry the sheep or you do not.", "I said nothing to the #target#. The #target# had said nothing to me. We understood each other.",
    "The rain came and the #noun# was #adj.own# with it and I walked in it because that was what there was.", "I wanted #noun.a#. There was no #noun#. There was a #target#.",
    "The #target# was #adj.own#. I had known #adj.own# #target.pl# before. This one was more #adj.own#, but not by much.", "You do not talk to a sheep. You carry it. Talking is for the #noun#.",
    "I had #verb.ed# all morning. The morning was #adj.own#. It had not asked me.", "The #noun# was good. It was the only good thing. I did not tell it so.",
  ], HEM),
  ...R(8, "flee", [
    "It ran. They do that. I went after it because that is the work.", "The sheep ran and I did not run. I walked. It would stop. They always stop.",
    "It went over the #noun#. I had not wanted to go over the #noun#. I went over the #noun#.", "It ran like they all run, without a plan, and I followed like I always follow.",
  ], HEM),
  ...R(8, "caught", [
    "I had it. It was heavy. It was always going to be heavy.", "I picked it up. It did not like it. Neither did I. We went home.",
    "It stopped and I took it. That was all. There was nothing fine about it.", "I lifted it and my #bodypart# said something and I did not listen.",
  ], HEM),
  ...R(8, "penned", [
    "In. #penned.cap# now. I did not feel anything about it.", "I put it in the pen and closed the gate. The gate was #adj.own#. I stood there a while.",
    "One more in. The #noun# was the same as before. I went back out.", "That was #penned#. I would not think about #remaining#. I thought about #remaining#.",
  ], HEM),
  ...R(8, "absurd", [
    "It was on #noun.a#. Sheep do not go on #noun.pl#. This one had.", "I looked at the #target# on the #noun#. The #target# looked at me. I went up.",
    "There is no reason for a sheep to be up there. There was a sheep up there.", "I did not ask how. You do not ask a sheep how. You climb.",
  ], HEM),
  ...R(8, "repeatEscape", [
    "It was #vocative#. It was always #vocative#. I knew it before I saw it.", "#vocative.cap# ran again. I had named it and that had changed nothing.",
    "Twice. I had a name for it. The name was #vocative# and the name was not enough.", "#vocative.cap#. I said the name out loud. The #target# heard it and did not care.",
  ], HEM),
  ...R(8, "book", ["A book. I sat and read it. The words were #adj.own#. I kept them.", "There was a book in the box. I read it because it was there. That is why anyone reads.", "I read. It was #time#. The sheep waited or they did not."], HEM),
  ...R(8, "dusk", ["The light went. #remaining.cap# sheep were out in it. So was I.", "It got dark the way it always does, slowly and then all at once, and the sheep were still out."], HEM),
  ...R(8, "breather", ["I sat down. The #noun# was #adj.own# under me. I did not get up for a while.", "I sat. That was all I did. It was enough for now."], HEM),
  ...R(8, "walkOfShame", ["I passed the pen with nothing. The sheep inside watched. I let them.", "Empty hands past the gate. I did not look in. I knew what was in there."], HEM),
  ...R(8, "rain", ["It rained. It had been going to rain all day. Now it rained.", "The rain came down on the #target# and on me. It did not choose."], HEM),
  ...R(8, "finished", ["They were all in. #penned.cap#. I stood at the gate and it was done and I did not feel what I thought I would feel.", "The last one was in. It was #time#. I sat down on the #noun# and that was the end of it."], HEM),
  ...R(8, "epitaph", ["He carried them. That was all.", "It was heavy. He went up.", "#penned.cap# sheep. One man. Done.", "The #noun# was #adj.own#.", "He did not ask how."], { ...HEM, maxChars: 80 }),
  // Jerome K. Jerome: the idler's outrage, in long indignant sentences.
  ...R(7, "idle", [
    "I do not know why it should be, I am sure, but the sight of a sheep standing still when I am walking maddens me.",
    "I like herding: it fascinates me. I can sit and look at a sheep for hours. It is the carrying I object to.",
    "It is a most extraordinary thing, but I never look at #target.the# without being impelled to the conclusion that it is the most #adj# specimen of its kind on record.",
    "There is nothing irritates me more than seeing a sheep sitting about doing nothing when I am working. Which is always. Which is all of them.",
    "I want to get up and superintend, and walk round with my hands in my pockets, and tell the sheep what to do. The sheep has other ideas. The sheep always has other ideas.",
    "Harris would have had that sheep in the pen by now, and cut himself, and broken the crook, and blamed the sheep, and I would have agreed with him.",
    "Confound it, #vocative#, you have all the obstinacy of #simile.a# and none of the charm.",
    "I have been told that a man should take his troubles lightly. I take mine on my shoulders, at about forty pounds each, up a hill.",
    "One should not grumble, they say. They have not met #target.the#. They have not met any of them. They live in town.",
  ], JER),
  ...R(7, "caught", ["Got you, you great lumbering duffer. There is a knack to this and I do not have it and neither, I notice, do you.", "Up you come. Oh, bother, you are heavier than you have any right to be; I suspect you of eating on purpose."], JER),
  ...R(7, "penned", ["In. Another one in. I feel like a man who has packed the hamper and forgotten the tin-opener: complete, technically.", "#penned.cap# in. I should like it noted that I did all of that without superintendence, which is the hardest way."], JER),
  ...R(7, "rain", ["The rain came on, as it always does when one has decided against the umbrella, which is to say on principle."], JER),
  ...R(7, "flee", ["Off it goes, at a pace it has never once shown in my direction. Hang it all.", "Dash it! It ran! It stood there like a tin of pineapple for an hour and now it RUNS!"], JER),
  ...R(7, "breather", ["I shall sit. I am told that idleness is a vice; I have always found it the only one I am any good at."], JER),
  // Crib notes on a dungeon crawl: the announcer keeps score, and the oath is Carl's.
  ...R(6, "idle", [
    "Goddamnit, Donut! Get down from there! You are a sheep! You do not even have the EXCUSE of being a cat!",
    "Goddamnit, Donut. Every time. Every single time I turn my back.",
    "New achievement! You have walked #bignum# miles for a sheep that was behind you. Reward: the sheep is still behind you.",
    "Achievement unlocked: #adj.cap# Herder. Description: carried a sheep up a hill and said something #adj# about it. Reward: another hill.",
    "This is floor one. This is the TUTORIAL. Nobody told me the tutorial had sixty of you in it.",
    "Loot box! Contents: one sheep, #adj#, slightly used. I have opened #penned# of these today and every one of them was a sheep.",
    "The announcer in my head says #remaining# to go, in a voice that is enjoying this far too much.",
    "At least the man in the book had a cat with a tiara. I have #vocative#, who has neither a tiara nor a single redeeming quality.",
    "If this hill had a leaderboard I would be on it, under the heading Most #adj#, and I would not be proud.",
    "Goddamnit, Donut, that is a ROOF. We have talked about roofs.",
  ], CRAWL),
  ...R(6, "caught", ["Goddamnit, Donut! Up! Up you come! New achievement: Lifting Things That Object.", "Got you. Loot box, opened. Contents: you. I want a refund."], CRAWL),
  ...R(6, "penned", ["Goddamnit, Donut, stay IN. New achievement: #penned.cap# in the Pen. Reward: an announcer who will not stop.", "In. #penned.cap#. If there were sponsors they would have left by now."], CRAWL),
  ...R(6, "flee", ["Goddamnit, DONUT!", "It ran. The announcer would call that a boss mechanic. I call it a #adj# sheep."], CRAWL),
  ...R(6, "absurd", ["Goddamnit, Donut, how are you UP there? What floor is this? Who put stairs on a hill?"], CRAWL),
  ...R(6, "repeatEscape", ["Not you. Not AGAIN. Goddamnit, Donut, you are a boss fight with wool."], CRAWL),
  ...R(6, "epitaph", ["Goddamnit, Donut.", "New achievement: Done. Reward: a stone.", "He never found his trousers. He found the sheep."], { ...CRAWL, maxChars: 60 }),
];
