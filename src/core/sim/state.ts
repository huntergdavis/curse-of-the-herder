import { generateMap, isPlaceable, stampLibraries, type GameMap } from "../map/generate";
import { Deco, Terrain } from "../map/terrain";
import { herderName } from "../names";
import { BOOKS } from "../../data/books";
import { mulberry32 } from "../rng";
import { fnv1a } from "../rng";

export const SCHEMA_VERSION = 2;
export const TICK_SECONDS = 0.25;
export const TICKS_PER_HOUR = 3600 / TICK_SECONDS;
export const DAY_START_HOUR = 9;
export const DAY_HOURS = 9;

export type SheepMode = "loose" | "carried" | "penned";

export interface SheepState {
  id: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  mode: SheepMode;
  /** 0..1 tendency to bolt when approached. */
  skittish: number;
  flees: number;
  absurd: boolean;
  seen: boolean;
  ring: number;
  named: boolean;
  /** Where it is ambling to (fractional tiles); equal to x,y when idle. */
  tx: number;
  ty: number;
  /** Tiles per second while moving; fleeing is fast. */
  speed: number;
  /** Sitting on a village roof; caught from the doorstep. */
  onRoof?: boolean;
  /** Standing in the river; caught from the bank. */
  inRiver?: boolean;
  /** Perched on a boulder; caught from beside it. */
  onBoulder?: boolean;
  /** The one black sheep. */
  black?: boolean;
  /** Got out of the pen once already. */
  escapee?: boolean;
  /** Personality: plain | skittish | stubborn | dozy | curious */
  temper?: string;
  /** Curious sheep: has it already come up to say hello? */
  greeted?: boolean;
}

export type HerderMode = "idle" | "toSheep" | "toPen" | "resting" | "done" | "toLibrary" | "reading" | "ranting" | "gazing" | "mishap";

export interface LibraryState {
  x: number;
  y: number;
  bookId: string;
  taken: boolean;
}

export interface ReadingState {
  bookId: string;
  startTick: number;
  untilTick: number;
}

export interface HerderState {
  x: number;
  y: number;
  facing: 0 | 1 | 2 | 3; // right, down, left, up
  mode: HerderMode;
  path: { x: number; y: number }[];
  targetSheep: number;
  carrying: number;
  restUntilTick: number;
  /** Distance walked while carrying, for the every-40-tiles frustration tick. */
  carryOdometer: number;
  approachCount: number;
  lastTileX: number;
  lastTileY: number;
  targetLibrary: number;
  /** Tiles walked since he last stood in the pen. */
  tripTiles: number;
  /** Mode to resume after a rant. */
  rantReturnMode?: HerderMode | undefined;
  /** Current mishap kind while in mishap mode. */
  mishap?: string | undefined;
  gateJammed?: boolean;
}

export interface WorldEvent {
  /** Monotonic sequence number so consumers can track what they have seen despite the ring cap. */
  seq: number;
  tick: number;
  kind: "flee" | "caught" | "penned" | "absurd" | "repeatEscape" | "started" | "finished" | "book" | "bookFound" | "walkOfShame" | "breather" | "rain" | "rainStops" | "bookPassed" | "rant" | "fog" | "fogLifts" | "gaze" | "mishap" | "curious" | "dozy" | "wind" | "windDrops" | "lunch" | "black" | "milestone" | "scarecrow" | "jailbreak" | "streak" | "reread" | "streakBroken" | "recaptured" | "nemesis" | "nemesisCaught";
  sheepId: number;
  bookId?: string;
  /** For mishaps: bog | nettles | stub | cowpat | wasp | bite | gate | molehill */
  detail?: string;
}

export interface WorldState {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  seed: string;
  name: string;
  size: number;
  tick: number;
  /** Wall-clock ms when the herder was created. */
  createdAt: number;
  /** Wall-clock ms of the last simulated tick (for catch-up). */
  lastWallMs: number;
  herder: HerderState;
  sheep: SheepState[];
  frustration: number;
  booksRead: number;
  sheepPenned: number;
  totalCurses: number;
  speedScale: number;
  events: WorldEvent[];
  finished: boolean;
  finishedTick: number;
  /** Derived from the calendar when the herder was created (northern hemisphere). */
  season: "spring" | "summer" | "autumn" | "winter";
  eventCount: number;
  /** Sum of pen distances of all sheep at creation, for the speed governor. */
  totalWork: number;
  libraries: LibraryState[];
  /** Lexicon packs unlocked by reading, regardless of level. */
  knownPacks: string[];
  /** Registers weighted up until a tick (after reading a book). */
  registers: { reg: string; untilTick: number }[];
  reading: ReadingState | null;
  lastReadTick: number;
  /** Rain until this tick (0 = dry). */
  rainUntilTick: number;
  nextWeatherTick: number;
  lastShameTick: number;
  lastBreatherTick: number;
  longestLine: string;
  lastBookPassTick: number;
  stats: { flees: number; absurds: number; shames: number; rains: number; breathers: number; books: number; mishaps?: number };
  lastRantTick: number;
  lastGazeTick: number;
  lastMishapTick: number;
  crookBroken: boolean;
  hadLunch: boolean;
  lastScarecrowTick: number;
  lastJailbreakTick: number;
  jailbreaks: number;
  /** Pennings in a row without a flight, a mishap or a stranded sheep. */
  streak: number;
  /** Fog until this tick (0 = clear). */
  fogUntilTick: number;
  /** Wind until this tick (0 = still). */
  windUntilTick: number;
  /** Books finished today, in order. */
  readingList: { bookId: string; tick: number }[];
  /** Word → [times used, target label → count]. Capped to learned words. */
  wordUse: Record<string, { n: number; at: Record<string, number> }>;
  /** The day's best lines: hottest and most elaborate, at most eight. */
  highlights: { text: string; score: number; clock: string }[];
}

export const MAX_EVENTS = 16;

export interface FlockOptions {
  /** Ring path-cost bounds and sheep counts, scaled for a 512 board. */
  rings?: { min: number; max: number; count: number }[];
}

export const DEFAULT_RINGS = [
  { min: 28, max: 62, count: 14 },
  { min: 80, max: 125, count: 14 },
  { min: 150, max: 205, count: 12 },
  { min: 220, max: 285, count: 12 },
  { min: 300, max: 380, count: 8 },
];

export type Season = WorldState["season"];

export function seasonFor(wallMs: number): Season {
  const m = new Date(wallMs).getMonth();
  return m >= 2 && m <= 4 ? "spring" : m >= 5 && m <= 7 ? "summer" : m >= 8 && m <= 10 ? "autumn" : "winter";
}

export function createWorld(seed: string, map: GameMap, wallMs: number, opts: FlockOptions = {}): WorldState {
  const rnd = mulberry32(fnv1a(seed + "|flock"));
  const scale = map.size / 512;
  const rings = (opts.rings ?? DEFAULT_RINGS).map((r) => ({ min: r.min * scale, max: r.max * scale, count: r.count }));
  const buckets: number[][] = rings.map(() => []);
  for (let y = 2; y < map.size - 2; y++) {
    for (let x = 2; x < map.size - 2; x++) {
      if (!isPlaceable(map, x, y)) continue;
      const d = map.penDistance[y * map.size + x]!;
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r]!;
        if (d >= ring.min && d <= ring.max) {
          buckets[r]!.push(y * map.size + x);
          break;
        }
      }
    }
  }
  const sheep: SheepState[] = [];
  const taken = new Set<number>();
  // A few sheep have got onto roofs. Nobody knows how.
  const roofs: number[] = [];
  for (let i = 0; i < map.size * map.size; i++) if ((map.deco[i] === Deco.House || map.deco[i] === Deco.HouseRed) && Number.isFinite(map.penDistance[i - 1] ?? Infinity)) roofs.push(i);
  const roofCount = Math.min(3, roofs.length);
  // And a few have waded into the river and stopped, as sheep do.
  const shallows: number[] = [];
  for (let y = 2; y < map.size - 2; y++) for (let x = 2; x < map.size - 2; x++) {
    const i = y * map.size + x;
    if (map.terrain[i] !== Terrain.Water) continue;
    const bank = [i - 1, i + 1, i - map.size, i + map.size].filter((j) => Number.isFinite(map.penDistance[j]!) && map.terrain[j] !== Terrain.Water && map.terrain[j] !== Terrain.Bridge);
    const d = map.penDistance[bank[0] ?? i];
    if (bank.length >= 2 && d !== undefined && d > 60 * (map.size / 512) && d < 300 * (map.size / 512)) shallows.push(i);
  }
  const riverCount = Math.min(3, shallows.length);
  // Boulders on rock, a little way out.
  const boulders: number[] = [];
  for (let i = 0; i < map.size * map.size; i++) if (map.deco[i] === Deco.Boulder && Number.isFinite(map.penDistance[i]!) && map.penDistance[i]! > 80 * (map.size / 512)) boulders.push(i);
  const boulderCount = Math.min(3, boulders.length);
  rings.forEach((ring, r) => {
    let bucket = buckets[r]!;
    // Swap one sheep of the middle rings for a boulder sheep.
    if (r >= 2 && r <= 4 && sheep.filter((x) => x.onBoulder).length < boulderCount && boulders.length) {
      const i = boulders.splice(Math.floor(rnd() * boulders.length), 1)[0]!;
      const x = i % map.size;
      const y = Math.floor(i / map.size);
      sheep.push({ id: sheep.length, x, y, homeX: x, homeY: y, mode: "loose", skittish: 0, flees: 0, absurd: true, seen: false, ring: r, named: false, tx: x, ty: y, speed: 0, onBoulder: true, temper: "plain" });
      ring = { ...ring, count: ring.count - 1 };
    }
    // Swap one sheep of the middle rings for a river sheep.
    if (r >= 1 && r <= 3 && sheep.filter((x) => x.inRiver).length < riverCount && shallows.length) {
      const i = shallows.splice(Math.floor(rnd() * shallows.length), 1)[0]!;
      const x = i % map.size;
      const y = Math.floor(i / map.size);
      sheep.push({ id: sheep.length, x, y, homeX: x, homeY: y, mode: "loose", skittish: 0, flees: 0, absurd: true, seen: false, ring: r, named: false, tx: x, ty: y, speed: 0, inRiver: true });
      ring = { ...ring, count: ring.count - 1 };
    }
    // Swap one sheep of the middle rings for a roof sheep.
    if (r >= 1 && r <= 3 && sheep.filter((x) => x.onRoof).length < roofCount && roofs.length) {
      const i = roofs.splice(Math.floor(rnd() * roofs.length), 1)[0]!;
      const x = i % map.size;
      const y = Math.floor(i / map.size);
      sheep.push({ id: sheep.length, x, y, homeX: x, homeY: y, mode: "loose", skittish: 0, flees: 0, absurd: true, seen: false, ring: r, named: false, tx: x, ty: y, speed: 0, onRoof: true });
      ring = { ...ring, count: ring.count - 1 };
    }
    // Fall back to the nearest non-empty bucket on odd boards.
    for (let k = 1; bucket.length === 0 && k < rings.length; k++) bucket = buckets[Math.max(0, r - k)] ?? buckets[Math.min(rings.length - 1, r + k)] ?? [];
    for (let c = 0; c < ring.count && bucket.length > 0; c++) {
      let i = bucket[Math.floor(rnd() * bucket.length)]!;
      let guard = 0;
      while (taken.has(i) && guard++ < 20) i = bucket[Math.floor(rnd() * bucket.length)]!;
      taken.add(i);
      const x = i % map.size;
      const y = Math.floor(i / map.size);
      const t = map.terrain[i]!;
      const nearWater = [1, -1, map.size, -map.size].some((o) => map.terrain[i + o] === Terrain.Water);
      const tr = rnd();
      const temper = tr < 0.4 ? "plain" : tr < 0.6 ? "skittish" : tr < 0.75 ? "stubborn" : tr < 0.9 ? "dozy" : "curious";
      sheep.push({
        id: sheep.length,
        x,
        y,
        homeX: x,
        homeY: y,
        mode: "loose",
        skittish: temper === "skittish" ? 0.6 + rnd() * 0.35 : temper === "dozy" || temper === "curious" ? 0.05 : 0.15 + rnd() * 0.4,
        temper,
        flees: 0,
        absurd: t === Terrain.Rock || (nearWater && rnd() < 0.5),
        seen: false,
        ring: r,
        named: false,
        tx: x,
        ty: y,
        speed: 0,
      });
    }
  });

  // There is always one.
  const plainOnes = sheep.filter((x) => !x.absurd);
  const black = plainOnes[Math.floor(rnd() * plainOnes.length)];
  if (black) black.black = true;

  return {
    schemaVersion: SCHEMA_VERSION,
    id: `${seed}-${wallMs.toString(36)}`,
    seed,
    name: herderName(seed),
    size: map.size,
    tick: 0,
    createdAt: wallMs,
    lastWallMs: wallMs,
    herder: {
      x: map.pen.x,
      y: map.pen.y + 3,
      facing: 1,
      mode: "idle",
      path: [],
      targetSheep: -1,
      carrying: -1,
      restUntilTick: 0,
      carryOdometer: 0,
      approachCount: 0,
      lastTileX: map.pen.x,
      lastTileY: map.pen.y + 3,
      targetLibrary: -1,
      tripTiles: 0,
    },
    sheep,
    frustration: 10,
    booksRead: 0,
    sheepPenned: 0,
    totalCurses: 0,
    speedScale: 1,
    events: [{ seq: 0, tick: 0, kind: "started", sheepId: -1 }],
    finished: false,
    finishedTick: -1,
    season: seasonFor(wallMs),
    eventCount: 1,
    totalWork: sheep.reduce((a, s) => a + map.penDistance[s.y * map.size + s.x]!, 0),
    libraries: placeLibraries(map, sheep, rnd),
    knownPacks: [],
    registers: [],
    reading: null,
    lastReadTick: -100000,
    rainUntilTick: 0,
    nextWeatherTick: 4 * TICKS_PER_HOUR * 0.6,
    lastShameTick: -100000,
    lastBreatherTick: -100000,
    longestLine: "",
    lastBookPassTick: -100000,
    stats: { flees: 0, absurds: 0, shames: 0, rains: 0, breathers: 0, books: 0 },
    lastRantTick: -100000,
    lastGazeTick: -100000,
    lastMishapTick: -100000,
    crookBroken: false,
    hadLunch: false,
    lastScarecrowTick: -100000,
    lastJailbreakTick: -100000,
    jailbreaks: 0,
    streak: 0,
    fogUntilTick: 0,
    windUntilTick: 0,
    readingList: [],
    wordUse: {},
    highlights: [],
  };
}

const LIBRARY_COUNT = 24;

/**
 * One box for roughly every two and a half sheep, planted a few tiles from a
 * sheep so his route passes it. Books are assigned when a box is opened (see
 * step.ts), so the bookId here is a placeholder cover.
 */
function placeLibraries(map: GameMap, sheep: SheepState[], rnd: () => number): LibraryState[] {
  const out: LibraryState[] = [];
  const byDistance = [...sheep].sort((a, b) => map.penDistance[a.y * map.size + a.x]! - map.penDistance[b.y * map.size + b.x]!);
  const count = Math.min(LIBRARY_COUNT, byDistance.length);
  const used = new Set<number>();
  for (let k = 0; k < count; k++) {
    // Bias anchors toward far sheep: near sheep go quickly, so an even spread front-loads the books.
    const anchor = byDistance[Math.round(Math.pow(k / Math.max(1, count - 1), 0.75) * (byDistance.length - 1))]!;
    let placed = false;
    for (let tries = 0; tries < 60 && !placed; tries++) {
      const r = 3 + rnd() * 4;
      const a = rnd() * Math.PI * 2;
      const x = Math.round(anchor.x + Math.cos(a) * r);
      const y = Math.round(anchor.y + Math.sin(a) * r);
      if (x < 2 || y < 2 || x >= map.size - 2 || y >= map.size - 2) continue;
      const i = y * map.size + x;
      if (used.has(i) || !isPlaceable(map, x, y)) continue;
      if (sheep.some((s) => s.x === x && s.y === y)) continue;
      if (out.some((l) => Math.hypot(l.x - x, l.y - y) < 10)) continue;
      used.add(i);
      out.push({ x, y, bookId: BOOKS[0]!.id, taken: false });
      placed = true;
    }
  }
  out.sort((a, b) => map.penDistance[a.y * map.size + a.x]! - map.penDistance[b.y * map.size + b.x]!);
  stampLibraries(map, out);
  return out;
}

export function mapForWorld(world: WorldState): GameMap {
  const map = generateMap(world.seed, { size: world.size });
  stampLibraries(map, world.libraries);
  return map;
}

export function dayHour(world: WorldState): number {
  return DAY_START_HOUR + world.tick / TICKS_PER_HOUR;
}

export function isRaining(world: WorldState): boolean {
  return world.rainUntilTick > world.tick;
}

export function isFoggy(world: WorldState): boolean {
  return world.fogUntilTick > world.tick;
}

export function isWindy(world: WorldState): boolean {
  return world.windUntilTick > world.tick;
}

export function hoursElapsed(world: WorldState): number {
  return world.tick / TICKS_PER_HOUR;
}

/** Throws on a structurally invalid state; used after load and in tests. */
/** Upgrade older saves in place, then validate. */
export function upgradeWorld(w: unknown): WorldState {
  const o = w as Record<string, unknown>;
  if (o && o["schemaVersion"] === 1) {
    o["libraries"] = [];
    o["knownPacks"] = [];
    o["registers"] = [];
    o["reading"] = null;
    o["eventCount"] = Array.isArray(o["events"]) ? (o["events"] as unknown[]).length : 0;
    (o["events"] as { seq?: number }[]).forEach((e, i) => { e.seq = i; });
    o["totalWork"] = 0;
    o["lastReadTick"] = -100000;
    o["rainUntilTick"] = 0;
    o["nextWeatherTick"] = 0;
    o["lastShameTick"] = -100000;
    o["lastBreatherTick"] = -100000;
    (o["herder"] as Record<string, unknown>)["targetLibrary"] = -1;
    (o["herder"] as Record<string, unknown>)["tripTiles"] = 0;
    o["schemaVersion"] = 2;
  }
  if (o && o["schemaVersion"] === 2) {
    // Fields added within v2 during development; default them.
    if (typeof o["longestLine"] !== "string") o["longestLine"] = "";
    if (typeof o["lastReadTick"] !== "number") o["lastReadTick"] = -100000;
    if (typeof o["rainUntilTick"] !== "number") o["rainUntilTick"] = 0;
    if (typeof o["nextWeatherTick"] !== "number") o["nextWeatherTick"] = 0;
    if (typeof o["lastShameTick"] !== "number") o["lastShameTick"] = -100000;
    if (typeof o["lastBreatherTick"] !== "number") o["lastBreatherTick"] = -100000;
    if (typeof o["eventCount"] !== "number") o["eventCount"] = 0;
    if (typeof o["totalWork"] !== "number") o["totalWork"] = 0;
    const h = o["herder"] as Record<string, unknown> | undefined;
    if (h && typeof h["tripTiles"] !== "number") h["tripTiles"] = 0;
    if (typeof o["lastBookPassTick"] !== "number") o["lastBookPassTick"] = -100000;
    if (typeof o["lastRantTick"] !== "number") o["lastRantTick"] = -100000;
    if (typeof o["lastGazeTick"] !== "number") o["lastGazeTick"] = -100000;
    if (typeof o["lastMishapTick"] !== "number") o["lastMishapTick"] = -100000;
    if (typeof o["crookBroken"] !== "boolean") o["crookBroken"] = false;
    if (typeof o["hadLunch"] !== "boolean") o["hadLunch"] = false;
    if (typeof o["lastScarecrowTick"] !== "number") o["lastScarecrowTick"] = -100000;
    if (typeof o["lastJailbreakTick"] !== "number") o["lastJailbreakTick"] = -100000;
    if (typeof o["jailbreaks"] !== "number") o["jailbreaks"] = 0;
    if (typeof o["streak"] !== "number") o["streak"] = 0;
    if (typeof o["fogUntilTick"] !== "number") o["fogUntilTick"] = 0;
    if (typeof o["windUntilTick"] !== "number") o["windUntilTick"] = 0;
    if (!Array.isArray(o["readingList"])) o["readingList"] = [];
    if (!o["wordUse"] || typeof o["wordUse"] !== "object") o["wordUse"] = {};
    if (!Array.isArray(o["highlights"])) o["highlights"] = [];
    if (typeof o["season"] !== "string") o["season"] = seasonFor(typeof o["createdAt"] === "number" ? (o["createdAt"] as number) : Date.now());
    if (!o["stats"]) o["stats"] = { flees: 0, absurds: 0, shames: 0, rains: 0, breathers: 0, books: 0 };
    for (const sh of (o["sheep"] as Record<string, unknown>[]) ?? []) {
      if (typeof sh["tx"] !== "number") { sh["tx"] = sh["x"]; sh["ty"] = sh["y"]; sh["speed"] = 0; }
    }
  }
  assertWorld(o);
  return o;
}

export function assertWorld(w: unknown): asserts w is WorldState {
  const o = w as Partial<WorldState>;
  if (!o || o.schemaVersion !== SCHEMA_VERSION) throw new TypeError("bad schemaVersion");
  if (!Array.isArray(o.libraries) || !Array.isArray(o.knownPacks) || !Array.isArray(o.registers)) throw new TypeError("bad library state");
  if (typeof o.seed !== "string" || !o.seed) throw new TypeError("bad seed");
  if (typeof o.size !== "number" || o.size < 64 || o.size > 2048) throw new TypeError("bad size");
  if (typeof o.tick !== "number" || o.tick < 0) throw new TypeError("bad tick");
  if (!Array.isArray(o.sheep) || o.sheep.length === 0) throw new TypeError("no sheep");
  if (!o.herder || typeof o.herder.x !== "number") throw new TypeError("bad herder");
  const penned = o.sheep.filter((s) => s.mode === "penned").length;
  if (penned !== o.sheepPenned) throw new TypeError("sheepPenned does not match flock");
  if (typeof o.frustration !== "number" || o.frustration < 0 || o.frustration > 100) throw new TypeError("bad frustration");
}
