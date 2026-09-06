import { generateMap, isPlaceable, type GameMap } from "../map/generate";
import { Terrain } from "../map/terrain";
import { herderName } from "../names";
import { mulberry32 } from "../rng";
import { fnv1a } from "../rng";

export const SCHEMA_VERSION = 1;
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

export type HerderMode = "idle" | "toSheep" | "toPen" | "resting" | "done";

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
}

export interface WorldEvent {
  tick: number;
  kind: "flee" | "caught" | "penned" | "absurd" | "repeatEscape" | "started" | "finished" | "book";
  sheepId: number;
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
}

export const MAX_EVENTS = 16;

export interface FlockOptions {
  /** Ring path-cost bounds and sheep counts, scaled for a 512 board. */
  rings?: { min: number; max: number; count: number }[];
}

export const DEFAULT_RINGS = [
  { min: 25, max: 55, count: 14 },
  { min: 70, max: 110, count: 14 },
  { min: 130, max: 180, count: 12 },
  { min: 190, max: 250, count: 12 },
  { min: 260, max: 330, count: 8 },
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
    },
    sheep,
    frustration: 0,
    booksRead: 0,
    sheepPenned: 0,
    totalCurses: 0,
    speedScale: 1,
    events: [{ tick: 0, kind: "started", sheepId: -1 }],
    finished: false,
    finishedTick: -1,
  };
}

export function mapForWorld(world: WorldState): GameMap {
  return generateMap(world.seed, { size: world.size });
}

export function dayHour(world: WorldState): number {
  return DAY_START_HOUR + world.tick / TICKS_PER_HOUR;
}

export function hoursElapsed(world: WorldState): number {
  return world.tick / TICKS_PER_HOUR;
}

/** Throws on a structurally invalid state; used after load and in tests. */
export function assertWorld(w: unknown): asserts w is WorldState {
  const o = w as Partial<WorldState>;
  if (!o || o.schemaVersion !== SCHEMA_VERSION) throw new TypeError("bad schemaVersion");
  if (typeof o.seed !== "string" || !o.seed) throw new TypeError("bad seed");
  if (typeof o.size !== "number" || o.size < 64 || o.size > 2048) throw new TypeError("bad size");
  if (typeof o.tick !== "number" || o.tick < 0) throw new TypeError("bad tick");
  if (!Array.isArray(o.sheep) || o.sheep.length === 0) throw new TypeError("no sheep");
  if (!o.herder || typeof o.herder.x !== "number") throw new TypeError("bad herder");
  const penned = o.sheep.filter((s) => s.mode === "penned").length;
  if (penned !== o.sheepPenned) throw new TypeError("sheepPenned does not match flock");
  if (typeof o.frustration !== "number" || o.frustration < 0 || o.frustration > 100) throw new TypeError("bad frustration");
}
