// Small English morphology: enough to make generated lines read as prose.

const AN_EXCEPTIONS_A = /^(?:ewe|europe|euro|eulog|unicorn|unifor|union|unique|unit|univers|use|user|usual|utensil|utopia|one|once|ouija)/i;
const AN_EXCEPTIONS_AN = /^(?:hour|honest|honou?r|heir|herb\b)/i;

export function article(word: string): string {
  const w = word.trim();
  if (!w) return "a";
  if (AN_EXCEPTIONS_A.test(w)) return "a";
  if (AN_EXCEPTIONS_AN.test(w)) return "an";
  return /^[aeiou]/i.test(w) ? "an" : "a";
}

export function withArticle(word: string): string {
  return `${article(word)} ${word}`;
}

const IRREGULAR_PLURALS: Record<string, string> = {
  sheep: "sheep",
  ewe: "ewes",
  ox: "oxen",
  hoof: "hooves",
  foot: "feet",
  tooth: "teeth",
  goose: "geese",
  mouse: "mice",
  louse: "lice",
  man: "men",
  woman: "women",
  child: "children",
  knife: "knives",
  leaf: "leaves",
  loaf: "loaves",
  calf: "calves",
  half: "halves",
  wolf: "wolves",
  life: "lives",
  potato: "potatoes",
  tomato: "tomatoes",
  hero: "heroes",
  cactus: "cacti",
  fungus: "fungi",
  radius: "radii",
  crisis: "crises",
  mud: "mud",
  rain: "rain",
  regret: "regret",
  wool: "wool",
  grass: "grass",
  despair: "despair",
  misery: "misery",
  woe: "woes",
};

export function pluralize(word: string, override?: string): string {
  if (override === "-") return word;
  if (override) return override;
  // Pluralise only the head of a multi-word phrase ("lump of regret" -> "lumps of regret").
  const ofIdx = word.indexOf(" of ");
  if (ofIdx > 0) return pluralize(word.slice(0, ofIdx)) + word.slice(ofIdx);
  const parts = word.split(" ");
  if (parts.length > 1) return parts.slice(0, -1).join(" ") + " " + pluralize(parts[parts.length - 1]!);
  const lower = word.toLowerCase();
  const irr = IRREGULAR_PLURALS[lower];
  if (irr) return matchCase(word, irr);
  // Already plural ("typhoons", "barnacles"): leave it. Singulars in -s are rarer than plurals in our lexicon.
  if (/[^sui]s$/i.test(word) && !/(?:ss|us|is)$/i.test(word)) return word;
  if (/(?:s|x|z|ch|sh)$/i.test(word)) return word + "es";
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + "ies";
  if (/(?:fe)$/i.test(word)) return word.slice(0, -2) + "ves";
  return word + "s";
}

function matchCase(source: string, target: string): string {
  return source[0] === source[0]?.toUpperCase() && source[0] !== source[0]?.toLowerCase() ? capitalize(target) : target;
}

export function capitalize(s: string): string {
  return s ? s[0]!.toUpperCase() + s.slice(1) : s;
}

const IRREGULAR_VERBS: Record<string, [string, string, string]> = {
  be: ["is", "was", "been"],
  have: ["has", "had", "had"],
  do: ["does", "did", "done"],
  go: ["goes", "went", "gone"],
  carry: ["carries", "carried", "carried"],
  run: ["runs", "ran", "run"],
  eat: ["eats", "ate", "eaten"],
  bite: ["bites", "bit", "bitten"],
  fall: ["falls", "fell", "fallen"],
  find: ["finds", "found", "found"],
  lose: ["loses", "lost", "lost"],
  sit: ["sits", "sat", "sat"],
  stand: ["stands", "stood", "stood"],
  hide: ["hides", "hid", "hidden"],
  flee: ["flees", "fled", "fled"],
  know: ["knows", "knew", "known"],
  see: ["sees", "saw", "seen"],
  get: ["gets", "got", "got"],
  take: ["takes", "took", "taken"],
  give: ["gives", "gave", "given"],
  come: ["comes", "came", "come"],
  make: ["makes", "made", "made"],
  say: ["says", "said", "said"],
  think: ["thinks", "thought", "thought"],
  bring: ["brings", "brought", "brought"],
  leave: ["leaves", "left", "left"],
  sink: ["sinks", "sank", "sunk"],
  climb: ["climbs", "climbed", "climbed"],
  swim: ["swims", "swam", "swum"],
  wet: ["wets", "wet", "wet"],
  forget: ["forgets", "forgot", "forgotten"],
  rain: ["rains", "rained", "rained"],
  smite: ["smites", "smote", "smitten"],
};

export function verbForm(base: string, form: "s" | "ed" | "ing" | "en", override?: [string, string, string]): string {
  const forms = override ?? IRREGULAR_VERBS[base.toLowerCase()];
  if (forms) {
    if (form === "s") return forms[0];
    if (form === "ed") return forms[1];
    if (form === "en") return forms[2];
  }
  if (form === "ing") {
    if (/ie$/.test(base)) return base.slice(0, -2) + "ying";
    if (/[^e]e$/.test(base)) return base.slice(0, -1) + "ing";
    if (/[^aeiou][aeiou][^aeiouwxy]$/.test(base) && base.length <= 5) return base + base[base.length - 1] + "ing";
    return base + "ing";
  }
  if (form === "s") {
    if (/(?:s|x|z|ch|sh)$/.test(base)) return base + "es";
    if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ies";
    return base + "s";
  }
  // past / participle
  if (/e$/.test(base)) return base + "d";
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ied";
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(base) && base.length <= 5) return base + base[base.length - 1] + "ed";
  return base + "ed";
}

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function numberWord(n: number): string {
  if (n < 0) return "minus " + numberWord(-n);
  if (n < 20) return ONES[n]!;
  if (n < 100) return TENS[Math.floor(n / 10)]! + (n % 10 ? "-" + ONES[n % 10]! : "");
  if (n < 1000) return ONES[Math.floor(n / 100)]! + " hundred" + (n % 100 ? " and " + numberWord(n % 100) : "");
  return String(n);
}

export function ordinalWord(n: number): string {
  const special: Record<number, string> = { 1: "first", 2: "second", 3: "third", 5: "fifth", 8: "eighth", 9: "ninth", 12: "twelfth" };
  if (special[n]) return special[n]!;
  if (n > 20 && n < 100 && n % 10 !== 0) return TENS[Math.floor(n / 10)]! + "-" + ordinalWord(n % 10);
  const w = numberWord(n);
  if (w.endsWith("y")) return w.slice(0, -1) + "ieth";
  return w + "th";
}

/** Rough English syllable count for words without a tagged count. */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, " ").trim();
  if (!w) return 0;
  let total = 0;
  for (const part of w.split(/\s+/)) {
    let p = part.replace(/e$/, "").replace(/(?:es|ed)$/, "");
    if (!p) p = part;
    const groups = p.match(/[aeiouy]+/g);
    let n = groups ? groups.length : 1;
    if (/[^aeiou]le$/.test(part)) n++;
    total += Math.max(1, n);
  }
  return total;
}

/** Capitalise sentence starts and fix spacing around punctuation. */
export function tidySentence(s: string): string {
  // Three dots become an ellipsis so the spacing rules below leave them alone.
  let t = s.replace(/\.\.\./g, "…").replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").replace(/([,;:])(?=\S)/g, "$1 ").trim();
  t = t.replace(/\b(a|an|A|An)(\s+)([A-Za-z][\w-]*)/g, (_m, art: string, sp: string, word: string) => {
    const want = article(word);
    const fixed = art[0] === "A" ? capitalize(want) : want;
    return `${fixed}${sp}${word}`;
  });
  t = t.replace(/(^|[.!?]\s+|["“]\s*)([("“']*)([a-z])/g, (_m, pre: string, open: string, ch: string) => pre + open + ch.toUpperCase());
  t = t.replace(/\bi\b/g, "I");
  // "(It scans.)" is already terminated; otherwise add a full stop.
  if (!/[.!?…"”]$/.test(t) && !/[.!?…]\)$/.test(t)) t += ".";
  return t;
}
