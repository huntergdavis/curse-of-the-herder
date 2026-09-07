export type Band = 0 | 1 | 2 | 3 | 4;

export type Pos =
  | "noun" // a thing to be cursed at or with: mud, hill, lump
  | "insult" // a noun you can call a sheep: dolt, clodhopper
  | "adj" // soggy, gormless
  | "interj" // ugh, bah, hmph
  | "oath" // blast, drat, damn (exclamations)
  | "swear" // standalone strong words, band-gated
  | "intensifier" // utterly, thoroughly, bloody (band-gated)
  | "simile" // noun phrase for "as X as ___": wet bread
  | "verb" // walk, carry (base form)
  | "bodypart" // knees, back
  | "abstract" // regret, despair
  | "pantheon" // by the Ewe Mother
  | "threat" // cartoon threats: knit you into a scarf
  | "adverb";

export type TargetKind = "sheep" | "terrain" | "weather" | "self" | "curse" | "pantheon" | "book" | "pen" | "sky" | "day";

export interface LexEntry {
  w: string;
  pos: Pos;
  band: Band;
  /** Level at which this word is known. */
  level: number;
  /** Register tags: rustic, grose, bard, fr, de, hemingway, nautical, baroque ... */
  reg?: string[];
  /** Irregular plural, or "-" for uncountable. */
  pl?: string;
  /** Verb forms: [3rd sing, past, participle] if irregular. */
  forms?: [string, string, string];
  syl?: number;
  gloss?: string;
  lang?: string;
  /** Only usable when cursing at these targets. */
  targets?: TargetKind[];
  tombstoneSafe?: boolean;
}

export type RuleEvent = "idle" | "flee" | "caught" | "penned" | "absurd" | "repeatEscape" | "finished" | "book" | "epitaph" | "rain" | "dusk" | "walkOfShame" | "breather" | "bookPassed" | "callback" | "roof" | "rant" | "fog" | "river" | "gaze" | "bog" | "nettles" | "stub" | "cowpat" | "wasp" | "bite" | "gate" | "molehill" | "dawn" | "heave" | "curious" | "dozy" | "crook" | "wind" | "lunch" | "boulder" | "black" | "miscount" | "halfway" | "tentogo" | "lastone" | "scarecrow" | "jailbreak" | "hat" | "streak" | "reread" | "rainStops" | "fogLifts" | "windDrops" | "streakBroken" | "recaptured" | "nemesis" | "nemesisCaught" | "rival" | "rivalGone" | "cow";

export interface Rule {
  id: string;
  /** Grammar tier 0..12; also the minimum level unless minLevel overrides. */
  tier: number;
  template: string;
  weight?: number;
  minLevel?: number;
  /** Only fire when the herder is at least this hot. */
  minBand?: Band;
  event: RuleEvent;
  reg?: string[];
  targets?: TargetKind[];
  maxChars?: number;
  /** Only in this season. */
  season?: string;
}

export interface NonTerminal {
  symbol: string;
  options: { t: string; weight?: number; minLevel?: number; minBand?: Band; reg?: string[] }[];
}

export interface LexPack {
  id: string;
  title: string;
  curator: string;
  reviewedAt: string;
  level: number;
  entries: LexEntry[];
}

export interface Context {
  seed: string;
  tick: number;
  level: number;
  /** Filth ceiling from frustration. */
  band: Band;
  /** 0..1 */
  heat: number;
  hour: number;
  target: { kind: TargetKind; noun: string; name: string | null; plural: boolean };
  /** Registers to weight up (e.g. after reading a Bard book). */
  registers: string[];
  signatureWord: string;
  sheepRemaining: number;
  sheepPenned: number;
  booksRead: number;
  /** Recent lines to avoid repeating. */
  recent: string[];
  /** Ids of the rules behind recent lines; the caller keeps this so generation stays a pure function of the context. */
  recentRules?: string[];
  /** Every rule used so far today; slot-free one-liners are held back once said. */
  rulesToday?: ReadonlySet<string> | undefined;
  /** Words the herder has learned from books, in addition to level-unlocked packs. */
  knownPacks: string[];
  villageName: string;
  dogName: string;
  season?: string;
  /** Running tallies for callbacks (optional so simple test contexts stay small). */
  stats?: { flees: number; absurds: number; shames: number; rains: number; breathers: number; books: number };
}
