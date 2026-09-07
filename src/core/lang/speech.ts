// The herder's mouth: builds a generation context from the world and asks
// the grammar for a line. Deterministic given (seed, tick, event).

import { CORE_PACKS } from "../../data/lexicon/core-packs";
import { NON_TERMINALS, RULES } from "../../data/grammar/tiers-0-4";
import { NON_TERMINALS_5_8, RULES_5_8 } from "../../data/grammar/tiers-5-8";
import { CALLBACK_RULES } from "../../data/grammar/callbacks";
import { PACKS_5_8 } from "../../data/lexicon/packs-5-8";
import { PACKS_9_12 } from "../../data/lexicon/packs-9-12";
import { NON_TERMINALS_9_12, RULES_9_12 } from "../../data/grammar/tiers-9-12";
import { Deco, Terrain } from "../map/terrain";
import type { GameMap } from "../map/generate";
import { sheepName } from "../names";
import { curseIntervalSeconds, erudition, filthCeiling, levelFor } from "../progression";
import { keyedUnit } from "../rng";
import { hoursElapsed, type WorldEvent, type WorldState } from "../sim/state";
import { Grammar } from "./grammar";
import type { Band, Context, RuleEvent } from "./types";

export interface Utterance {
  text: string;
  /** 0..1 how hot the delivery is (bubble styling). */
  heat: number;
  seconds: number;
  ruleId: string;
  /** The sheep being addressed, if any, so it can react. */
  sheepId?: number;
}

const packs = [...CORE_PACKS, ...PACKS_5_8, ...PACKS_9_12].filter((p) => p.reviewedAt);
export const grammar = new Grammar(packs, [...RULES, ...RULES_5_8, ...RULES_9_12, ...CALLBACK_RULES], [...NON_TERMINALS, ...NON_TERMINALS_5_8, ...NON_TERMINALS_9_12]);

const SIGNATURE_WORDS = ["turnip", "bucket", "parsnip", "cabbage", "sock", "thistle", "puddle", "trough", "wheelbarrow", "stile", "haystack", "pebble"];

export function signatureWord(seed: string): string {
  return SIGNATURE_WORDS[Math.floor(keyedUnit(seed, "signature") * SIGNATURE_WORDS.length)] ?? "turnip";
}

function terrainNoun(map: GameMap, x: number, y: number, rnd: number): string {
  const t = map.terrain[Math.round(y) * map.size + Math.round(x)];
  switch (t) {
    case Terrain.Mud: return rnd < 0.5 ? "mud" : "bog";
    case Terrain.Rock: return rnd < 0.5 ? "rock" : "scree";
    case Terrain.Forest: return rnd < 0.5 ? "bramble" : "wood";
    case Terrain.Farm: return "furrow";
    case Terrain.Sand: return "sand";
    case Terrain.Water: case Terrain.Bridge: return "river";
    case Terrain.Road: return "road";
    default: return rnd < 0.5 ? "hill" : rnd < 0.8 ? "field" : "slope";
  }
}

function pickTarget(w: WorldState, map: GameMap, e: WorldEvent | null): Context["target"] {
  const h = w.herder;
  const sheepTarget = (id: number): Context["target"] => {
    const s = w.sheep[id];
    return { kind: "sheep", noun: "sheep", name: s?.named ? sheepName(w.seed, id) : null, plural: false };
  };
  if (e && e.sheepId >= 0) return sheepTarget(e.sheepId);
  const r = keyedUnit(w.seed, "target", w.tick);
  if (r < 0.45 && h.targetSheep >= 0) return sheepTarget(h.targetSheep);
  if (r < 0.8) return { kind: "terrain", noun: terrainNoun(map, h.x, h.y, keyedUnit(w.seed, "terrain-noun", w.tick)), name: null, plural: false };
  if (r < 0.9) return { kind: "day", noun: "day", name: null, plural: false };
  return { kind: "curse", noun: "curse", name: null, plural: false };
}

export function buildContext(w: WorldState, map: GameMap, e: WorldEvent | null, recent: string[], bandCap: Band = 4): Context {
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const band = Math.min(bandCap, filthCeiling(w.frustration)) as Band;
  const nearest = map.villages.reduce<{ name: string; d: number }>((best, v) => {
    const d = Math.hypot(v.x - w.herder.x, v.y - w.herder.y);
    return d < best.d ? { name: v.name, d } : best;
  }, { name: "the village", d: Infinity });
  return {
    seed: w.seed,
    tick: w.tick,
    level,
    band,
    heat: w.frustration / 100,
    hour: 9 + hoursElapsed(w),
    target: pickTarget(w, map, e),
    registers: w.registers.filter((r) => r.untilTick > w.tick).map((r) => r.reg),
    signatureWord: signatureWord(w.seed),
    sheepRemaining: w.sheep.length - w.sheepPenned,
    sheepPenned: w.sheepPenned,
    booksRead: w.booksRead,
    recent,
    knownPacks: w.knownPacks,
    villageName: nearest.name,
    stats: w.stats,
  };
}

function wasOnRoof(w: WorldState, map: GameMap, sheepId: number): boolean {
  const s = w.sheep[sheepId];
  if (!s) return false;
  const d = map.deco[Math.round(s.homeY) * map.size + Math.round(s.homeX)];
  return d === Deco.House || d === Deco.HouseRed;
}

const EVENT_MAP: Partial<Record<WorldEvent["kind"], RuleEvent>> = {
  flee: "flee",
  caught: "caught",
  penned: "penned",
  absurd: "absurd",
  repeatEscape: "repeatEscape",
  finished: "finished",
  book: "book",
  walkOfShame: "walkOfShame",
  breather: "breather",
  rain: "rain",
  bookPassed: "bookPassed",
};

function holdSeconds(text: string, heat: number): number {
  const words = text.split(/\s+/).length;
  return Math.min(14, Math.max(2.2, 1.6 + words * 0.42 + heat * 0.5));
}

export function speakForEvent(w: WorldState, map: GameMap, e: WorldEvent, recent: string[], bandCap: Band = 4): Utterance | null {
  let ev = EVENT_MAP[e.kind];
  if (!ev) return null;
  // Catching a sheep off a roof gets its own material.
  if (e.kind === "absurd" && wasOnRoof(w, map, e.sheepId)) ev = "roof";
  const ctx = buildContext(w, map, e, recent, bandCap);
  // Events run hotter than the meter says: something just happened.
  const bump: Partial<Record<RuleEvent, number>> = { flee: 0.25, repeatEscape: 0.4, absurd: 0.3, penned: -0.2, finished: 0.5 };
  ctx.heat = Math.max(0, Math.min(1, ctx.heat + (bump[ev] ?? 0)));
  const r = grammar.generate(ev, ctx, e.sheepId);
  if (!r) return null;
  return { text: r.text, heat: ctx.heat, seconds: holdSeconds(r.text, ctx.heat), ruleId: r.ruleId };
}

export function speakIdle(w: WorldState, map: GameMap, recent: string[], bandCap: Band = 4): Utterance | null {
  const ctx = buildContext(w, map, null, recent, bandCap);
  const hour = ctx.hour;
  let ev: RuleEvent = "idle";
  const u = keyedUnit(w.seed, "idle-kind", w.tick);
  if (hour >= 16.5 && u < 0.3) ev = "dusk";
  else if (u > 0.92 && (w.stats.flees + w.stats.rains + w.stats.shames + w.stats.absurds) >= 2) ev = "callback";
  const r = grammar.generate(ev, ctx) ?? grammar.generate("idle", ctx);
  if (!r) return null;
  const out: Utterance = { text: r.text, heat: ctx.heat, seconds: holdSeconds(r.text, ctx.heat), ruleId: r.ruleId };
  if (ctx.target.kind === "sheep" && w.herder.targetSheep >= 0) out.sheepId = w.herder.targetSheep;
  return out;
}

export function speakEpitaph(w: WorldState, map: GameMap, recent: string[], bandCap: Band = 4): Utterance {
  const ctx = buildContext(w, map, null, recent, bandCap);
  ctx.heat = 1;
  ctx.band = Math.min(bandCap, 4) as Band;
  // A stone has room for about a hundred characters, and deserves his best tiers.
  const opts = { minTier: Math.max(0, ctx.level - 1) };
  let r = grammar.generate("epitaph", ctx, 0, opts);
  for (let salt = 1; (!r || r.text.length > 110) && salt < 12; salt++) r = grammar.generate("epitaph", ctx, salt, opts);
  if (!r || r.text.length > 110) r = { text: "Sheep.", ruleId: "fallback", tier: 0 };
  return { text: r.text, heat: 1, seconds: 30, ruleId: r.ruleId };
}

export function nextIdleCurseTicks(w: WorldState): number {
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const seconds = curseIntervalSeconds(level, w.frustration);
  const jitter = 0.7 + keyedUnit(w.seed, "curse-jitter", w.tick) * 0.6;
  return Math.max(20, Math.round((seconds * jitter) / 0.25));
}
