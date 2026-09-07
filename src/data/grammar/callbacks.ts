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
  ]),
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
  ]),
];
