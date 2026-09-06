import { generateMap, isPlaceable, type GameMap } from "../map/generate";
import { Terrain } from "../map/terrain";
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
}

export type HerderMode = "idle" | "toSheep" | "toPen" | "resting" | "done" | "toLibrary" | "reading";

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
}

export interface WorldEvent {
  /** Monotonic sequence number so consumers can track what they have seen despite the ring cap. */
  seq: number;
  tick: number;
  kind: "flee" | "caught" | "penned" | "absurd" | "repeatEscape" | "started" | "finished" | "book" | "bookFound" | "walkOfShame" | "breather" | "rain" | "rainStops";
  sheepId: number;
  bookId?: string;
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
  rings.forEach((ring, r) => {
    let bucket = buckets[r]!;
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
      sheep.push({
        id: sheep.length,
        x,
        y,
        homeX: x,
        homeY: y,
        mode: "loose",
        skittish: 0.15 + rnd() * 0.6,
        flees: 0,
        absurd: t === Terrain.Rock || (nearWater && rnd() < 0.5),
        seen: false,
        ring: r,
        named: false,
      });
    }
  });

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
    frustration: 0,
    booksRead: 0,
    sheepPenned: 0,
    totalCurses: 0,
    speedScale: 1,
    events: [{ seq: 0, tick: 0, kind: "started", sheepId: -1 }],
    finished: false,
    finishedTick: -1,
    eventCount: 1,
    totalWork: sheep.reduce((a, s) => a + map.penDistance[s.y * map.size + s.x]!, 0),
    libraries: assignBooks(map, rnd),
    knownPacks: [],
    registers: [],
    reading: null,
    lastReadTick: -100000,
    rainUntilTick: 0,
    nextWeatherTick: 4 * TICKS_PER_HOUR * 0.6,
    lastShameTick: -100000,
    lastBreatherTick: -100000,
  };
}

/** Books are handed out in catalogue order along the distance-sorted libraries, with a little shuffle. */
function assignBooks(map: GameMap, rnd: () => number): LibraryState[] {
  const ordered = [...BOOKS].sort((a, b) => a.when - b.when);
  const out: LibraryState[] = [];
  const count = map.libraries.length;
  void rnd;
  for (let k = 0; k < count; k++) {
    const lib = map.libraries[k]!;
    // Catalogue order along the distance-sorted libraries; when there are more
    // libraries than books, mid-catalogue books repeat evenly (bonus reading).
    const bi = count <= 1 ? ordered.length - 1 : Math.round((k / (count - 1)) * (ordered.length - 1));
    out.push({ x: lib.x, y: lib.y, bookId: ordered[bi]!.id, taken: false });
  }
  return out;
}

export function mapForWorld(world: WorldState): GameMap {
  return generateMap(world.seed, { size: world.size });
}

export function dayHour(world: WorldState): number {
  return DAY_START_HOUR + world.tick / TICKS_PER_HOUR;
}

export function isRaining(world: WorldState): boolean {
  return world.rainUntilTick > world.tick;
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
