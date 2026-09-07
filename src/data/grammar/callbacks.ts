// Lines that remember the day: tallies of flees, rains and shames, and the
// wistful glance at a book he cannot stop for. Available from tier 2 up.
import type { Rule, RuleEvent } from "../../core/lang/types";

const R = (tier: number, event: RuleEvent, templates: string[], extra: Partial<Rule> = {}): Rule[] =>
  templates.map((template, i) => ({ id: `cb${tier}-${event}-${i}`, tier, event, template, ...extra }));

export const CALLBACK_RULES: Rule[] = [
  ...R(2, "callback", [
    "That is #flees# sheep that have run from me today. #flees.cap#.",
    "This is the #rainsNth# rain today. I have counted.",
    "#shames.cap# times past the pen with nothing. The sheep in the pen know.",
    "#absurds.cap# sheep on things they should not be on. Today. Just today.",
    "#flees.cap# runners, #absurds# climbers, #remaining# still out. I keep a tally now. It does not help.",
  ]),
  ...R(4, "callback", [
    "#oath.cap#, that is the #fleesNth# time today a sheep has looked me in the eye and left.",
    "Let the record show: #rains# rains, #flees# flights, #shames# walks of shame, and one herder, still #adj#.",
    "#pantheon.cap#, #flees# of them have run. #flees.cap#! And I have the legs of one man.",
    "By my count, #absurds# sheep have been somewhere no sheep should be, and every one of them looked pleased about it.",
  ]),
  ...R(6, "callback", [
    "Thou art the #fleesNth# sheep to flee me this day, and I say to thee what I said to the others: #oath#.",
    "#rains.cap# rains hath the sky sent me, and #flees# sheep have bolted, and my #bodypart# do remember every one.",
  ]),
  ...R(8, "callback", [
    "#flees.cap# ran. I counted. Counting is what you do when you cannot do anything else.",
    "It rained #rains# times. Each time it was rain. I did not expect it to be anything else.",
  ], { reg: ["hemingway"] }),
  ...R(1, "river", ["Wet sheep.", "Water. Sheep. Why.", "Out. Out of the water.", "#interj.cap#. Swimming."]),
  ...R(2, "river", [
    "You are standing in the water. On purpose. I can tell it is on purpose.",
    "Sheep do not swim. You are not swimming. You are standing in it, which is worse.",
    "Wet wool weighs twice as much. Did you know that? You do now. So do my arms.",
    "Come out of the river, you #adj# #insult#, before you dissolve.",
  ]),
  ...R(4, "river", [
    "#oath.cap#, #vocative#, that is WATER. You have the buoyancy of #simile#.",
    "#pantheon.cap#, a sheep in the water, #time#, looking at me like I put it there.",
    "Out, you #insult_np#! The river has enough in it without you!",
  ]),
  ...R(8, "river", [
    "The sheep stood in the river. The river went past it. I went in. That is the order things happened.",
    "It was cold. The sheep did not mind. I minded for both of us.",
  ], { reg: ["hemingway"] }),
  ...R(1, "roof", ["Roof. Why roof.", "A sheep. On a house.", "Down. Now.", "#interj.cap#. A roof."]),
  ...R(2, "roof", [
    "You are on a roof. You are a sheep. One of these facts has to give.",
    "How did you get onto the roof? No. Do not tell me. Come down.",
    "The people who live here did not order a sheep for the roof.",
    "Sheep do not go on roofs. It is one of the very few rules.",
  ]),
  ...R(4, "roof", [
    "#oath.cap#, #vocative#, that is a ROOF. Are you a weathervane? You are not a weathervane.",
    "#pantheon.cap#, a sheep on the thatch, in #village#, in front of everyone.",
    "Come down, you #insult_np#, before the chimney gets ideas.",
  ]),
  ...R(8, "roof", [
    "The sheep was on the roof. I did not ask how. You do not ask a sheep how. You climb.",
    "It was a good roof. It was a bad place for a sheep. I went up.",
  ], { reg: ["hemingway"] }),
  ...R(2, "rant", [
    "Sky! Yes, you! You have been up there all day doing NOTHING.",
    "I am talking to you, hill. I know you can hear me. You are a hill. You have nothing else to do.",
    "Why are there so many of you? Who needs sixty sheep? WHO?",
    "Every one of you knows where the pen is. EVERY ONE.",
  ], { minBand: 2 }),
  ...R(4, "rant", [
    "#oath.cap#! #oath.cap#! Hear me, O sky, O #target#, O #insult_np#: I have HAD it!",
    "#pantheon.cap#, I ask for so little. A sheep that stays. A hill that is flat. A day that ENDS.",
    "You! Curse! I know you are watching! Is this FUNNY to you? It is a little funny. I am still angry.",
  ], { minBand: 2 }),
  ...R(8, "rant", [
    "I stopped walking. I shook my fist at the sky. The sky did not notice. I felt better anyway.",
    "There is a point in every day where a man shouts at a hill. This was the point.",
    "I put the sheep down. I said what I had to say to the weather. I picked the sheep up.",
    "A man can carry a sheep or he can shout. For a moment I did neither. It was a good moment.",
  ], { minBand: 2, reg: ["hemingway"] }),
  ...R(3, "rant", [
    "Look at me. LOOK at me. I am a grown man shouting at #noun.a#.",
    "You, #target#, are the #adj#est thing I have met today, and I have met #penned# sheep.",
    "If I had a coin for every #adj# sheep I would have #penned# coins and I would spend them on a chair.",
    "Do you know what I wanted to be? A herder. This is on me. THIS IS ON ME.",
  ], { minBand: 2 }),
  ...R(6, "rant", [
    "Thou sky! Thou great grey nothing! I have words for thee and none of them are thanks!",
    "Hear me, hill, thou #adj# lump of the earth's bad temper: I am done being reasonable, and I was never good at it.",
    "#oath.cap#, and #oath#, and, for the sheep who are listening, #oath#!",
  ], { minBand: 2 }),
  ...R(7, "rant", [
    "#oath.cap#! That is one language. #oath.cap#! That is another. I have MORE.",
    "In every tongue I know, the word for this day is the same, and it is not a nice word, and I am going to say it: #swear#.",
  ], { minBand: 2 }),
  ...R(11, "rant", [
    "Sky above and mud below, / Sixty sheep and one to go, / One herder, hoarse, who used to grunt, / Now shouting couplets at the front!",
    "I shook my fist. I shook it twice. / The hill said nothing. Very nice.",
  ], { minBand: 2, reg: ["verse"] }),
  ...R(12, "rant", [
    "O Curse, if you are taking notes: this is the part where the herder stops walking. You have seen it before. You will see it again. I know. I KNOW.",
    "Whoever built this hill: I have questions, and a vocabulary, and nowhere to sit.",
  ], { minBand: 2 }),
  ...R(10, "rant", [
    "Let the record reflect, O Curse, that on this day, at this hour, in front of these #insult_np.pl#, I raised my fists to heaven and heaven RAISED NOTHING BACK.",
  ], { minBand: 2 }),
  ...R(1, "fog", ["Fog. Lovely.", "Fog now. Fog.", "Where sheep. Fog."]),
  ...R(2, "fog", ["Fog. Now I cannot see the sheep I cannot catch.", "The fog has come to watch. Good. Nobody else has.", "Somewhere in this fog there is a sheep laughing at me."]),
  ...R(4, "fog", ["#oath.cap#, fog. As if the sheep were not hard enough to find when I could SEE them.", "#pantheon.cap#, the fog. The hill has put on a disguise."]),
  ...R(8, "fog", ["The fog came in. I could not see the sheep. It was not much different from before.", "Fog. I walked into it. That is what you do with fog."], { reg: ["hemingway"] }),
  ...R(2, "bookPassed", [
    "A book. And my arms are full of sheep. Later, book.",
    "I see you, book. I will come back for you.",
    "Of course there is a book here. Of course I am carrying a #adj# sheep.",
    "Not now, book. I have a #target# to deliver.",
  ]),
  ...R(4, "bookPassed", [
    "#oath.cap#, a library, and I with a sheep on my shoulders like a #adj# scarf.",
    "Wait for me, little library. I am coming back, and I am bringing opinions.",
    "#pantheon.cap#, a book, and no hands to hold it. This is what the curse does. It gives you a book and a sheep.",
  ]),
  ...R(8, "bookPassed", [
    "There was a book. I was carrying a sheep. You cannot read with a sheep. That is a rule.",
    "I saw the box. I kept walking. The sheep did not read either.",
  ], { reg: ["hemingway"] }),
];
