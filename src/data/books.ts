// The little free library catalogue. Excerpts are original text written in
// the style of each book (no copyrighted quotations). See docs/research/BOOKS.md.

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Lexicon pack unlocked on reading (may be already level-unlocked; that is fine). */
  pack: string | null;
  /** Register weighted up for a while after reading. */
  register: string | null;
  /** Roughly when in the day this should be found (0..1). */
  when: number;
  excerpts: string[];
  /** Cover colour. */
  colour: string;
}

export const BOOKS: Book[] = [
  {
    id: "first-words", title: "A Child's First Words for the Farm", author: "Anon.", pack: "primer", register: null, when: 0.02, colour: "#e0b33c",
    excerpts: ["This is a SHEEP. The sheep says baa.", "This is MUD. Mud is for boots.", "This is a HILL. We do not like the hill.", "The herder is TIRED. Can you say tired?"],
  },
  {
    id: "sad-almanac", title: "The Sad Almanac", author: "A Farmer of the Lower Field", pack: "farmyard", register: null, when: 0.06, colour: "#7a8fa6",
    excerpts: ["March: wet. April: wetter. May: a different kind of wet.", "Forecast for tomorrow: the same, but with wind.", "A red sky at night means the sheep are somewhere else.", "Turnips this year: soggy. Outlook: soggy."],
  },
  {
    id: "grumbles", title: "Grumbles of the Lower Field", author: "collected from herders", pack: "insults-classic", register: null, when: 0.1, colour: "#8c4a3a",
    excerpts: ["A sheep is a cloud that has given up and grown legs.", "Never trust a lummox with a fence.", "Call it a clodhopper. It will not mind, and you will feel better.", "There is no such thing as a clever sheep. There are only sheep that have not been caught yet."],
  },
  {
    id: "slow-things", title: "One Hundred Things That Are Slow", author: "A List-Maker", pack: "similes", register: null, when: 0.16, colour: "#5b7a3a",
    excerpts: ["No. 41: wet bread. No. 42: a Tuesday.", "No. 67: a snail on holiday, which is slower than a snail at work.", "No. 88: a cabbage with opinions.", "No. 100: the herder, by teatime."],
  },
  {
    id: "manners", title: "Manners for the Exasperated Gentleman", author: "a Person of Quality", pack: "minced-oaths", register: null, when: 0.22, colour: "#3f5f9f",
    excerpts: ["When vexed, say 'confound it'. When very vexed, say it twice.", "'Zounds' is acceptable before company; 'gadzooks' only after dinner.", "Address the offending animal directly: 'Hear me, O Sheep.' It will not, but you will feel heard.", "A gentleman does not shout. He enunciates, with force."],
  },
  {
    id: "cattle-market", title: "Words Overheard at the Cattle Market", author: "unsigned", pack: "mild-profanity", register: null, when: 0.3, colour: "#a0522d",
    excerpts: ["'Damn' is a small word for a large feeling.", "'Bloody', as in 'bloody hill', refers to no blood. It refers to the hill.", "'Sod it' may be said to a bucket, a gate, or the sky.", "Never say these words to your mother. Say them to a sheep."],
  },
  {
    id: "vulgar-tongue", title: "A Classical Dictionary of the Vulgar Tongue", author: "Francis Grose, 1785 (genuine entries)", pack: "grose-vulgar-tongue", register: "grose", when: 0.36, colour: "#6b4a2b",
    excerpts: ["ADDLE PATE. An inconsiderate foolish fellow.", "DEW BEATERS. Feet. Mind your dew beaters; mind your feet.", "NICKUMPOOP, or NINCUMPOOP. A foolish fellow.", "LOBCOCK. A large relaxed fellow; also an inactive fellow.", "CLUNCH. An awkward clownish fellow."],
  },
  {
    id: "bard", title: "The Complete Insults of William Shakespeare", author: "W. Shakespeare (genuine lines)", pack: "bard", register: "bard", when: 0.44, colour: "#7b2d3a",
    excerpts: ["Thou art a boil, a plague-sore, an embossed carbuncle in my corrupted blood. (King Lear)", "I do desire we may be better strangers. (As You Like It)", "Would thou wert clean enough to spit upon! (Timon of Athens)", "Thou clay-brained guts, thou knotty-pated fool! (Henry IV, Part 1)", "More of your conversation would infect my brain. (Coriolanus)"],
  },
  {
    id: "drover", title: "The Drover's Private Vocabulary", author: "not for publication", pack: "strong-profanity", register: null, when: 0.5, colour: "#333333",
    excerpts: ["Chapter one: 'shit'. Chapter two: applications.", "'Bollocks' is both a noun and a complete sentence.", "A 'bastard' hill is one that goes up when you go down it.", "Say it to the weather. The weather started it."],
  },
  {
    id: "french", title: "A Phrasebook for the Disgruntled Traveller", author: "Mme. Anon", pack: "french", register: "fr", when: 0.56, colour: "#2e4a9f",
    excerpts: ["Sacrebleu: a mild oath, suitable for spilled soup and lost sheep.", "Merde: exactly what you think. Pronounce it with feeling.", "Andouille (f.): a sausage; also a fool. The French see no difference.", "Putain: reserve this for rivers."],
  },
  {
    id: "german", title: "Schimpfwörter für Anfänger", author: "Herr Dr. Anon", pack: "german", register: "de", when: 0.6, colour: "#4a4a4a",
    excerpts: ["Schafskopf (m.): sheep-head. Precise, and correct.", "Verdammt: damned. Verflixt: the same, but you are in company.", "German lets you build the insult you need. Start with 'Schaf'. Add words until satisfied.", "Scheiße: the universal solvent."],
  },
  {
    id: "porca", title: "Porca Miseria! and Other Useful Phrases", author: "Sig. and Sra. Anon", pack: "italian-spanish", register: "it", when: 0.64, colour: "#c94f4f",
    excerpts: ["Porca miseria: 'pig misery'. There is no better description of this afternoon.", "Mannaggia: say it while throwing your hands up. The hands are mandatory.", "Cabezón: big-head; stubborn. Every sheep you have ever met.", "Caramba is for surprise. Rayos is for rain."],
  },
  {
    id: "sacres", title: "Ye Sacres of Kébec", author: "un gars", pack: "quebec-sacres", register: "qc", when: 0.68, colour: "#3b6fb5",
    excerpts: ["Tabarnak: the big one. Do not open with it.", "Sacres can be chained: 'ostie de câlisse de tabarnak'. Each 'de' is a stair.", "Câline and tabarnouche are for children and for herders who are trying.", "Maudit: cursed. Maudit mouton: you know the one."],
  },
  {
    id: "kvetch", title: "The Yiddish Book of Kvetching", author: "Bubbe Anon", pack: "yiddish-scots-aussie", register: "yi", when: 0.72, colour: "#8a6238",
    excerpts: ["A schlemiel spills the soup. A schlimazel gets spilled on. The sheep is both.", "Nudnik: a pest. Nudnik with wool: a sheep.", "Oy vey is not a complaint. It is a summary.", "To kvetch is to complain properly. You have been doing it wrong."],
  },
  {
    id: "hemingway", title: "In Our Time", author: "E. Hemingway (public domain)", pack: "hemingway", register: "hemingway", when: 0.78, colour: "#d8c398",
    excerpts: ["The hill was long. The sheep was heavy. He went up.", "It rained and the road was mud and he did not stop.", "He carried it and it did not thank him and that was all right.", "Short words. Wet boots. One more."],
  },
  {
    id: "one-word", title: "One Word, Many Uses", author: "a Linguist", pack: "f-word", register: null, when: 0.84, colour: "#1f1f1f",
    excerpts: ["It is a noun, a verb, an adjective and, on a hill in the rain, a prayer.", "Use sparingly, like salt. Or like salt if you are very angry.", "Never at a person. Always at a hill.", "Chapter twelve: the hill, revisited."],
  },
  {
    id: "boatswain", title: "The Boatswain's Book of Oaths", author: "Bosun Anon", pack: "nautical", register: "nautical", when: 0.9, colour: "#1e5f74",
    excerpts: ["Ten thousand thundering typhoons! (For when one typhoon will not do.)", "Blistering barnacles: a general-purpose oath, good in all weathers.", "A landlubber is anyone who is not you. Including sheep.", "Alliterate. It doubles the force and halves the thought."],
  },
  {
    id: "devils-dictionary", title: "The Devil's Dictionary", author: "Ambrose Bierce, 1911 (genuine entries)", pack: "baroque-latinate", register: "baroque", when: 0.8, colour: "#4a2c5a",
    excerpts: ["PATIENCE, n. A minor form of despair, disguised as a virtue.", "SHEEP, n. Not in Bierce. He had never met one. (This entry is ours.)", "CYNIC, n. A blackguard whose faulty vision sees things as they are, not as they ought to be.", "PERSEVERANCE, n. A lowly virtue whereby mediocrity achieves an inglorious success.", "DAY, n. A period of twenty-four hours, mostly misspent."],
  },
  {
    id: "gargantua", title: "Gargantua and Pantagruel", author: "Rabelais, tr. Urquhart 1653 (genuine catalogue)", pack: "baroque-latinate", register: "baroque", when: 0.82, colour: "#8b5a2b",
    excerpts: ["...you ninny lobcocks, you gaping changelings, you codsheads, you loggerheads, you noddy-peaks, you bloated wind-bags...", "He that hath patience may compass anything. (Rabelais did not herd sheep.)", "The appetite grows by eating. So does the list.", "A list of nine insults is a list of nine insults. Rabelais would have made it forty."],
  },
  {
    id: "notes", title: "Notes on the Curse", author: "the herder before you", pack: null, register: null, when: 0.97, colour: "#5a3b1e",
    excerpts: ["Day one: sixty sheep. Day one thousand: sixty sheep.", "The words get better. The sheep do not.", "I learned Latin. It did not help. It was beautiful.", "Whoever reads this: the last one is on the rock. It is always on the rock."],
  },
];

export const BOOK_BY_ID = new Map(BOOKS.map((b) => [b.id, b]));
