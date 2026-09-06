// Master ban list. See docs/research/CONTENT_POLICY.md. Every lexicon pack
// and every template is tested against these patterns in CI, and the
// generator filters at runtime as a last resort. Keep this list boring and
// complete; do not add jokes here.
//
// Patterns are matched case-insensitively against whole words with common
// inflections and light obfuscation (repeated letters, 1/! for i, 0 for o,
// @ for a, $ for s) normalised first.

export const BANNED_PATTERNS: readonly RegExp[] = [
  // Slurs by race, ethnicity, nationality, religion. Listed as fragments so
  // the source is not itself a list of slurs in plain text.
  /\bn[i1]gg?(?:e|a|u)r?s?\b/i,
  /\bch[i1]nks?\b/i,
  /\bg[o0]{2}ks?\b/i,
  /\bk[i1]kes?\b/i,
  /\bsp[i1]cs?\b/i,
  /\bwetbacks?\b/i,
  /\btowel ?heads?\b/i,
  /\bragheads?\b/i,
  /\bgyps?(?:y|ies)\b/i,
  /\bpak[i1]s?\b/i,
  /\bredskins?\b/i,
  /\bsquaws?\b/i,
  /\bcoons?\b/i,
  /\bdarkies?\b/i,
  /\bhalf[- ]?breeds?\b/i,
  /\bjap(?:s)?\b/i,
  /\bpolacks?\b/i,
  /\bkrauts?\b/i,
  /\bwops?\b/i,
  /\bdagos?\b/i,
  /\bmicks?\b/i,
  /\byids?\b/i,
  /\bhebes?\b/i,
  /\bzipperheads?\b/i,
  // Sexual orientation and gender identity.
  /\bfagg?(?:ot|it)s?\b/i,
  /\bfags?\b/i,
  /\bdykes?\b/i,
  /\btrann(?:y|ies)\b/i,
  /\bshemales?\b/i,
  /\bhomos?\b/i,
  /\bqueers?\b/i,
  /\bpoof(?:ter)?s?\b/i,
  /\bso gay\b/i,
  /\bthat'?s gay\b/i,
  // Ableist and clinical-turned-insult.
  /\bretard(?:ed|s)?\b/i,
  /\bspaz(?:z|tic|zes|es)?\b/i,
  /\bspastics?\b/i,
  /\bcretins?\b/i,
  /\bimbeciles?\b/i,
  /\bmorons?\b/i,
  /\bmongoloids?\b/i,
  /\bmongs?\b/i,
  /\bpsychos?\b/i,
  /\bschizos?\b/i,
  /\bidiots?\b/i,
  /\bidiotic\b/i,
  /\bdumb\b/i,
  /\blame\b/i,
  /\bcrazy\b/i,
  /\binsane\b/i,
  /\blunatics?\b/i,
  /\bcripples?\b/i,
  /\bcrippled\b/i,
  /\bmidgets?\b/i,
  /\bdwarf\b/i,
  /\bfat(?:ty|so|ass)?\b/i,
  /\bugly\b/i,
  // Gendered and sexual abuse.
  /\bc[u\*]nts?\b/i,
  /\bb[i1]tch(?:es|y)?\b/i,
  /\bwhores?\b/i,
  /\bsluts?\b/i,
  /\bskanks?\b/i,
  /\bhysterical\b/i,
  /\btw[a@]ts?\b/i,
  /\bp[u\*]ss(?:y|ies)\b/i,
  /\bc[o0]cks?(?:sucker)?s?\b/i,
  /\bmotherfucker\b/i,
  /\brape[sd]?\b/i,
  /\brapist\b/i,
  /\bmolest/i,
  /\bpedo/i,
  /\bincest/i,
  // Violence and self-harm as jokes.
  /\bkill (?:your|my)self\b/i,
  /\bsuicide\b/i,
  /\bhang (?:your|my)self\b/i,
  // Drugs.
  /\bcrackhead\b/i,
  /\bjunkie\b/i,
  // Real-world groups and politics.
  /\bnazi\b/i,
  /\bhitler\b/i,
  /\bjihad/i,
  /\bterrorist/i,
];

const LEET: [RegExp, string][] = [
  [/[1!|]/g, "i"],
  [/0/g, "o"],
  [/@/g, "a"],
  [/\$/g, "s"],
  [/3/g, "e"],
  [/(.)\1{2,}/g, "$1$1"],
];

export function normaliseForBan(text: string): string {
  let t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [re, rep] of LEET) t = t.replace(re, rep);
  return t;
}

export function findBanned(text: string): string | null {
  const t = normaliseForBan(text);
  for (const re of BANNED_PATTERNS) {
    const m = re.exec(t);
    if (m) return m[0];
  }
  return null;
}
