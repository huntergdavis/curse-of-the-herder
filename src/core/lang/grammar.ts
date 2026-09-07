import { findBanned } from "./banned";
import { capitalize, numberWord, ordinalWord, pluralize, tidySentence, verbForm, withArticle } from "./morphology";
import { fnv1a, mulberry32 } from "../rng";
import type { Band, Context, LexEntry, NonTerminal, Pos, Rule, RuleEvent } from "./types";

const SLOT = /#(?:([FL])(\d):)?([A-Za-z_][\w]*)((?:\.[a-z]+)*)#/g;
const MAX_DEPTH = 12;

export interface GenerateResult {
  text: string;
  ruleId: string;
  tier: number;
  /** Lexicon words that went into the line (for usage tallies). */
  used: string[];
}

const POS_SET = new Set<Pos>(["noun", "insult", "adj", "interj", "oath", "swear", "intensifier", "simile", "verb", "bodypart", "abstract", "pantheon", "threat", "adverb"]);

export class Grammar {
  private byPos = new Map<string, LexEntry[]>();
  private nonTerminals = new Map<string, NonTerminal>();
  private rulesByEvent = new Map<RuleEvent, Rule[]>();
  private packOf = new Map<LexEntry, string>();
  readonly lexicon: LexEntry[];

  constructor(packs: { id: string; level: number; entries: LexEntry[] }[], rules: Rule[], nonTerminals: NonTerminal[]) {
    this.lexicon = [];
    for (const p of packs) {
      for (const e of p.entries) {
        // An entry is never known before its pack; entries may only raise the bar.
        const entry: LexEntry = { ...e, level: Math.max(e.level ?? 0, p.level) };
        this.lexicon.push(entry);
        this.packOf.set(entry, p.id);
        const list = this.byPos.get(entry.pos) ?? [];
        list.push(entry);
        this.byPos.set(entry.pos, list);
      }
    }
    for (const nt of nonTerminals) this.nonTerminals.set(nt.symbol, nt);
    for (const r of rules) {
      const list = this.rulesByEvent.get(r.event) ?? [];
      list.push(r);
      this.rulesByEvent.set(r.event, list);
    }
  }

  /** Entries of one pack (for the reading list). */
  packEntries(packId: string): LexEntry[] {
    return this.lexicon.filter((e) => this.packOf.get(e) === packId);
  }

  /** Expand a one-off template with the current context (used for quotation frames). */
  expandTemplate(template: string, ctx: Context, salt = 0): string | null {
    const rnd = mulberry32(fnv1a(`${ctx.seed}|frame|${ctx.tick}|${salt}`));
    const raw = this.expand(template, ctx, rnd, 0, ctx.band);
    if (raw === null) return null;
    const text = tidySentence(raw);
    return findBanned(text) ? null : text;
  }

  /** Words the herder can use right now (for HUD "vocabulary" stats). */
  knownWords(ctx: Context): number {
    let n = 0;
    for (const e of this.lexicon) if (this.entryKnown(e, ctx)) n++;
    return n;
  }

  private entryKnown(e: LexEntry, ctx: Context): boolean {
    if (e.level <= ctx.level) return true;
    const pack = this.packOf.get(e);
    return pack !== undefined && ctx.knownPacks.includes(pack);
  }

  private entryAllowed(e: LexEntry, ctx: Context, bandCap: Band): boolean {
    if (e.band > Math.min(ctx.band, bandCap)) return false;
    if (!this.entryKnown(e, ctx)) return false;
    if (e.targets && !e.targets.includes(ctx.target.kind)) return false;
    return true;
  }

  private entryWeight(e: LexEntry, ctx: Context): number {
    let w = 1;
    const active = !!e.reg && ctx.registers.length > 0 && e.reg.some((r) => ctx.registers.includes(r));
    if (active) w *= 3;
    // Foreign words and rhyme-pack fillers read as broken in ordinary English slots;
    // keep them mostly for the ten minutes after the book that taught them.
    if (!active && e.lang && e.lang !== "en") w *= 0.25;
    if (!active && e.reg?.some((r) => r === "verse" || r.startsWith("rhyme:"))) w *= 0.3;
    if (e.w === ctx.signatureWord) w *= 4;
    // Prefer words from the newest levels a little, so learning shows.
    if (e.level >= ctx.level - 1 && e.level > 0) w *= 1.6;
    return w;
  }

  generate(event: RuleEvent, ctx: Context, salt = 0, opts: { minTier?: number } = {}): GenerateResult | null {
    const rnd = mulberry32(fnv1a(`${ctx.seed}|${event}|${ctx.tick}|${salt}`));
    let candidates = (this.rulesByEvent.get(event) ?? []).filter((r) => this.ruleAllowed(r, ctx));
    if (opts.minTier !== undefined) {
      const top = candidates.filter((r) => r.tier >= opts.minTier!);
      if (top.length) candidates = top;
    }
    if (candidates.length === 0) return null;
    for (let attempt = 0; attempt < 6; attempt++) {
      const rule = this.pickRule(candidates, ctx, rnd);
      this.usedThisLine = [];
      const raw = this.expand(rule.template, ctx, rnd, 0, 4);
      if (raw === null) continue;
      let text = tidySentence(raw);
      // Deadpan and metrical registers keep their own punctuation no matter how hot he is.
      if (!rule.reg?.some((r) => r === "hemingway" || r === "verse")) text = this.applyHeat(text, ctx, rnd);
      if (rule.maxChars && text.length > rule.maxChars) continue;
      if (text.length > 240) continue;
      if (ctx.recent.some((r) => normaliseLine(r) === normaliseLine(text))) continue;
      if (findBanned(text)) {
        console.error("Curse of the Herder: banned word reached the generator; rule", rule.id);
        continue;
      }
      return { text, ruleId: rule.id, tier: rule.tier, used: [...new Set(this.usedThisLine)] };
    }
    return null;
  }

  private usedThisLine: string[] = [];

  private ruleAllowed(r: Rule, ctx: Context): boolean {
    const minLevel = r.minLevel ?? r.tier;
    if (minLevel > ctx.level) return false;
    if ((r.minBand ?? 0) > ctx.band) return false;
    if (r.targets && !r.targets.includes(ctx.target.kind)) return false;
    return true;
  }

  private pickRule(rules: Rule[], ctx: Context, rnd: () => number): Rule {
    // Favour the newest tiers strongly but keep older shapes in the mix.
    const weights = rules.map((r) => {
      let w = r.weight ?? 1;
      const gap = ctx.level - r.tier;
      w *= gap <= 0 ? 3 : gap === 1 ? 2 : gap === 2 ? 1 : 0.4;
      if (r.reg && ctx.registers.length && r.reg.some((x) => ctx.registers.includes(x))) w *= 3;
      return w;
    });
    return rules[pickIndex(weights, rnd)]!;
  }

  private expand(template: string, ctx: Context, rnd: () => number, depth: number, bandCap: Band): string | null {
    if (depth > MAX_DEPTH) return null;
    // Number agreement: "one #insult.pl# have" reads wrong when one sheep is left.
    if (ctx.sheepRemaining === 1 && template.includes("#remaining#")) template = singularAfterRemaining(template);
    let failed = false;
    const out = template.replace(SLOT, (_m, gateKind: string | undefined, gateNum: string | undefined, symbol: string, mods: string) => {
      let cap = bandCap;
      if (gateKind === "F") cap = Math.min(cap, Number(gateNum)) as Band;
      if (gateKind === "L" && Number(gateNum) > ctx.level) {
        failed = true;
        return "";
      }
      const value = this.resolve(symbol, ctx, rnd, depth, cap);
      if (value === null) {
        failed = true;
        return "";
      }
      return applyModifiers(value.text, mods, value.entry);
    });
    return failed ? null : out;
  }

  private resolve(symbol: string, ctx: Context, rnd: () => number, depth: number, cap: Band): { text: string; entry?: LexEntry } | null {
    const contextual = contextSymbol(symbol, ctx, rnd);
    if (contextual !== null) return { text: contextual };
    const nt = this.nonTerminals.get(symbol);
    if (nt) {
      const opts = nt.options.filter((o) => (o.minLevel ?? 0) <= ctx.level && (o.minBand ?? 0) <= ctx.band);
      if (opts.length === 0) return null;
      const weights = opts.map((o) => (o.weight ?? 1) * (o.reg && o.reg.some((r) => ctx.registers.includes(r)) ? 3 : 1));
      for (let tries = 0; tries < 3; tries++) {
        const o = opts[pickIndex(weights, rnd)]!;
        const t = this.expand(o.t, ctx, rnd, depth + 1, cap);
        if (t !== null) return { text: t };
      }
      return null;
    }
    if (POS_SET.has(symbol as Pos)) {
      const pool = (this.byPos.get(symbol) ?? []).filter((e) => this.entryAllowed(e, ctx, cap));
      if (pool.length === 0) return null;
      const weights = pool.map((e) => this.entryWeight(e, ctx));
      const e = pool[pickIndex(weights, rnd)]!;
      this.usedThisLine.push(e.w);
      return { text: e.w, entry: e };
    }
    return null;
  }

  private applyHeat(text: string, ctx: Context, rnd: () => number): string {
    let t = text;
    if (/\)$/.test(t)) return t; // a parenthetical aside is delivered quietly
    if (ctx.heat > 0.55 && /\.$/.test(t) && rnd() < 0.7) t = t.slice(0, -1) + "!";
    if (ctx.heat > 0.8 && /!$/.test(t) && rnd() < 0.5) t += "!";
    if (ctx.heat > 0.9 && rnd() < 0.5) {
      // Shout the last word or two.
      const m = /([A-Za-z'-]+(?: [A-Za-z'-]+)?)([.!?]+)$/.exec(t);
      if (m && m.index > 0) t = t.slice(0, m.index) + m[1]!.toUpperCase() + m[2]!;
    }
    return t;
  }
}

/** Rewrite the clause after #remaining# for a count of one: drop .pl and fix common verbs. */
function singularAfterRemaining(template: string): string {
  const i = template.indexOf("#remaining#");
  const head = template.slice(0, i);
  let tail = template.slice(i);
  const clauseEnd = tail.search(/[.!?;]|$/);
  let clause = tail.slice(0, clauseEnd);
  const rest = tail.slice(clauseEnd);
  clause = clause.replace(/\.pl#/g, "#").replace(/\bare\b/, "is").replace(/\bhave\b/, "has").replace(/\bwere\b/, "was").replace(/\bremain\b/, "remains").replace(/\bdo not\b/, "does not");
  tail = clause + rest;
  return head + tail;
}

/** Punctuation and case do not make a line new. */
function normaliseLine(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickIndex(weights: number[], rnd: () => number): number {
  let total = 0;
  for (const w of weights) total += w;
  let r = rnd() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function applyModifiers(text: string, mods: string, entry?: LexEntry): string {
  if (!mods) return text;
  let t = text;
  for (const m of mods.split(".").filter(Boolean)) {
    switch (m) {
      case "cap":
        t = capitalize(t);
        break;
      case "up":
        t = t.toUpperCase();
        break;
      case "a":
        t = withArticle(t);
        break;
      case "the":
        t = "the " + t;
        break;
      case "pl":
        t = pluralize(t, entry?.pl);
        break;
      case "s":
        t = verbForm(t, "s", entry?.forms);
        break;
      case "ed":
        t = verbForm(t, "ed", entry?.forms);
        break;
      case "en":
        t = verbForm(t, "en", entry?.forms);
        break;
      case "ing":
        t = verbForm(t, "ing", entry?.forms);
        break;
      case "poss":
        t = /s$/.test(t) ? t + "'" : t + "'s";
        break;
      case "quote":
        t = `"${t}"`;
        break;
    }
  }
  return t;
}

const TIME_PHRASES: [number, string[]][] = [
  [10, ["at this hour", "before the dew is off", "first thing", "this early"]],
  [12, ["before noon", "with the sun climbing", "all morning", "on a perfectly good morning"]],
  [14, ["at midday", "with the sun straight up", "at lunch, which I have not had", "in the heat of the day"]],
  [16.5, ["all afternoon", "at this stage of the afternoon", "with the shadows getting long", "past teatime"]],
  [18, ["at dusk", "with the light going", "at the tail end of the day", "as the sun gives up on me"]],
  [99, ["in the dark", "at night", "by moonlight, apparently", "after hours"]],
];

function timePhrase(hour: number, rnd: () => number): string {
  for (const [until, list] of TIME_PHRASES) if (hour < until) return list[Math.floor(rnd() * list.length)]!;
  return "today";
}

const BIG_NUMBERS = ["ten thousand", "a hundred", "forty", "seven", "a thousand", "twelve", "ninety-nine", "a million", "eleven", "several hundred"];

const NO_STATS = { flees: 0, absurds: 0, shames: 0, rains: 0, breathers: 0, books: 0 };

function contextSymbol(symbol: string, ctx: Context, rnd: () => number): string | null {
  const stats = ctx.stats ?? NO_STATS;
  switch (symbol) {
    case "target":
      return ctx.target.noun;
    case "targets":
      return pluralize(ctx.target.noun);
    case "name":
      return ctx.target.name ?? ctx.target.noun;
    case "vocative":
      return ctx.target.name ?? (ctx.target.kind === "sheep" ? "sheep" : ctx.target.noun);
    case "you":
      return ctx.target.name ?? "you";
    case "it":
      return ctx.target.name ?? (ctx.target.plural ? "them" : "it");
    case "time":
      return timePhrase(ctx.hour, rnd);
    case "remaining":
      return numberWord(ctx.sheepRemaining);
    case "penned":
      return numberWord(ctx.sheepPenned);
    case "nth":
      return ordinalWord(Math.max(1, ctx.sheepPenned));
    case "books":
      return numberWord(ctx.booksRead);
    case "sig":
      return ctx.signatureWord;
    case "village":
      return ctx.villageName;
    case "bignum":
      return BIG_NUMBERS[Math.floor(rnd() * BIG_NUMBERS.length)]!;
    case "hour":
      return numberWord(Math.max(1, Math.round(ctx.hour - 9)));
    case "flees":
      return numberWord(stats.flees);
    case "fleesNth":
      return ordinalWord(Math.max(1, stats.flees));
    case "absurds":
      return numberWord(stats.absurds);
    case "rains":
      return numberWord(stats.rains);
    case "rainsNth":
      return ordinalWord(Math.max(1, stats.rains));
    case "shames":
      return numberWord(stats.shames);
    default:
      return null;
  }
}
