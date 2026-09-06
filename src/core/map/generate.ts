import { fbm } from "../noise";
import { keyedUnit, mulberry32 } from "../rng";
import { distanceField, findPath, type Grid } from "./path";
import { Deco, Terrain, isWalkable, type TerrainId } from "./terrain";

export interface Village {
  x: number;
  y: number;
  name: string;
}

export interface GameMap extends Grid {
  seed: string;
  size: number;
  terrain: Uint8Array;
  deco: Uint8Array;
  pen: { x: number; y: number };
  villages: Village[];
  /** Path cost from the pen to every tile (Infinity = unreachable). */
  penDistance: Float64Array;
  /** Tiles a sheep may be placed on: walkable, not road, not pen, reachable. */
  walkableCount: number;
}

const VILLAGE_NAMES = [
  "Lower Bleating", "Upper Bleating", "Wether Cross", "Muttonham", "Fleecebury",
  "Dagsworth", "Cudmarsh", "Hoofley", "Ramsbottom Minor", "Ewe Hollow",
  "Sheepwash", "Woolpit", "Lambton End", "Tupsley", "Shearing Green",
];

/** Optional progress hook for profiling (set by scripts). */
export let genLog: ((stage: string) => void) | null = null;
export function setGenLog(fn: ((stage: string) => void) | null): void {
  genLog = fn;
}

export interface GenerateOptions {
  size?: number;
  villageCount?: number;
  riverCount?: number;
}

export function generateMap(seed: string, opts: GenerateOptions = {}): GameMap {
  const size = opts.size ?? 512;
  const villageCount = opts.villageCount ?? 5;
  const riverCount = opts.riverCount ?? Math.round(size / 85);
  const n = size;
  const terrain = new Uint8Array(n * n);
  const deco = new Uint8Array(n * n);
  const s = hashSeed(seed);
  const elev = new Float32Array(n * n);
  const idx = (x: number, y: number): number => y * n + x;

  // --- 1. Elevation and moisture ------------------------------------------
  const cx = (n - 1) / 2;
  const cy = (n - 1) / 2;
  const radius = n * 0.52;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const base = fbm(s, x, y, n * 0.27, 6, 0.5);
      const ridge = fbm(s + 7, x, y, n * 0.09, 4, 0.55);
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const falloff = Math.max(0, dx * dx + dy * dy - 0.35) * 0.9;
      let e = base * 0.72 + ridge * 0.28 - falloff;
      // Keep the middle gentle so the pen and early rings are pleasant.
      const center = Math.exp(-(dx * dx + dy * dy) * 6);
      e = e * (1 - center * 0.5) + 0.52 * center * 0.5;
      elev[idx(x, y)] = e;
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const e = elev[idx(x, y)]!;
      const m = fbm(s + 99, x, y, n * 0.18, 5, 0.5);
      let t: TerrainId;
      if (e < 0.31) t = Terrain.Water;
      else if (e < 0.345) t = Terrain.Sand;
      else if (e > 0.855) t = Terrain.Snow;
      else if (e > 0.745) t = Terrain.Rock;
      else if (e < 0.40 && m > 0.58) t = Terrain.Mud;
      else if (m > 0.64) t = Terrain.Forest;
      else if (m < 0.36) t = Terrain.Meadow;
      else t = Terrain.Grass;
      terrain[idx(x, y)] = t;
    }
  }

  genLog?.("noise");
  // --- 2. Rivers: descend from high ground until water or a basin ---------
  const rnd = mulberry32(s ^ 0x5eed);
  let carved = 0;
  for (let attempt = 0; attempt < riverCount * 30 && carved < riverCount; attempt++) {
    let x = Math.floor(rnd() * n);
    let y = Math.floor(rnd() * n);
    if (elev[idx(x, y)]! < 0.68) continue;
    const path: number[] = [];
    for (let step = 0; step < n * 2; step++) {
      path.push(idx(x, y));
      if (terrain[idx(x, y)] === Terrain.Water) break;
      let bx = x;
      let by = y;
      let be = elev[idx(x, y)]! + 0.004; // small tolerance lets rivers cross flats
      for (let k = 0; k < 8; k++) {
        const nx = x + [1, -1, 0, 0, 1, 1, -1, -1][k]!;
        const ny = y + [0, 0, 1, -1, 1, -1, 1, -1][k]!;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const ne = elev[idx(nx, ny)]! + (rnd() - 0.5) * 0.01;
        if (ne < be) {
          be = ne;
          bx = nx;
          by = ny;
        }
      }
      if (bx === x && by === y) break; // basin: ends in a pond
      x = bx;
      y = by;
    }
    if (path.length < 25) continue;
    for (const i of path) {
      if (terrain[i] !== Terrain.Snow) terrain[i] = Terrain.Water;
    }
    carved++;
  }

  genLog?.("rivers");
  // --- 3. The pen: nearest flat grass patch to the centre -----------------
  const pen = findPenSite(terrain, n);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      terrain[idx(pen.x + dx, pen.y + dy)] = Terrain.Grass;
      deco[idx(pen.x + dx, pen.y + dy)] = Deco.PenGround;
    }
  }
  for (let d = -2; d <= 2; d++) {
    for (const [x, y] of [
      [pen.x + d, pen.y - 2],
      [pen.x + d, pen.y + 2],
      [pen.x - 2, pen.y + d],
      [pen.x + 2, pen.y + d],
    ] as const) {
      terrain[idx(x, y)] = Terrain.Grass;
      // Gate on the south side.
      deco[idx(x, y)] = x === pen.x && y === pen.y + 2 ? Deco.None : Deco.Fence;
    }
  }

  genLog?.("pen");
  // --- 4. Villages and their fields ----------------------------------------
  const grid: Grid = { size: n, terrain };
  let penDistance = distanceField(grid, pen.x, pen.y);
  genLog?.("pen-distance");
  const villages: Village[] = [];
  const namePool = [...VILLAGE_NAMES];
  const villageRings = [0.16, 0.24, 0.32, 0.4, 0.46, 0.5, 0.55, 0.6];
  for (let v = 0; v < villageCount; v++) {
    const want = (villageRings[v % villageRings.length] ?? 0.3) * n;
    let best: { x: number; y: number; score: number } | null = null;
    for (let tries = 0; tries < 400; tries++) {
      const ang = rnd() * Math.PI * 2;
      const r = want * (0.85 + rnd() * 0.3);
      const x = Math.round(cx + Math.cos(ang) * r);
      const y = Math.round(cy + Math.sin(ang) * r);
      if (x < 6 || y < 6 || x >= n - 6 || y >= n - 6) continue;
      if (!Number.isFinite(penDistance[idx(x, y)]!)) continue;
      let flat = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const t = terrain[idx(x + dx, y + dy)];
        if (t === Terrain.Grass || t === Terrain.Meadow) flat++;
      }
      let spacing = Infinity;
      for (const o of villages) spacing = Math.min(spacing, Math.hypot(o.x - x, o.y - y));
      if (spacing < n * 0.12) continue;
      const score = flat + Math.min(spacing, n * 0.3) / n;
      if (!best || score > best.score) best = { x, y, score };
    }
    genLog?.(`village ${v} search`);
    if (!best) continue;
    const name = namePool.splice(Math.floor(rnd() * namePool.length), 1)[0] ?? `Hamlet ${v + 1}`;
    villages.push({ x: best.x, y: best.y, name });
    // Houses around a well.
    deco[idx(best.x, best.y)] = Deco.Well;
    terrain[idx(best.x, best.y)] = Terrain.Grass;
    const spots: [number, number][] = [[-2, -1], [2, -1], [-2, 1], [2, 1], [0, -2], [0, 2], [-1, -3], [3, 0]];
    for (const [dx, dy] of spots) {
      if (rnd() < 0.8) {
        const i = idx(best.x + dx, best.y + dy);
        if (isWalkable(terrain[i]!)) {
          terrain[i] = Terrain.Grass;
          deco[i] = rnd() < 0.5 ? Deco.House : Deco.HouseRed;
        }
      }
    }
    // A field or two beside the village.
    for (let f = 0; f < 2; f++) {
      const fx = best.x + (rnd() < 0.5 ? -9 : 5);
      const fy = best.y + (rnd() < 0.5 ? -7 : 4);
      const fw = 4 + Math.floor(rnd() * 3);
      const fh = 3 + Math.floor(rnd() * 3);
      for (let y = fy; y < fy + fh; y++) for (let x = fx; x < fx + fw; x++) {
        if (x < 0 || y < 0 || x >= n || y >= n) continue;
        const i = idx(x, y);
        const t = terrain[i];
        if (t === Terrain.Grass || t === Terrain.Meadow || t === Terrain.Forest) {
          terrain[i] = Terrain.Farm;
          deco[i] = Deco.None;
        }
      }
    }
  }

  genLog?.("villages");
  // --- 5. Roads from the pen to each village (reuse existing roads) ------
  const roadBias = (x: number, y: number, base: number): number => {
    const dd = deco[idx(x, y)];
    if (dd === Deco.Fence || dd === Deco.PenGround) return Infinity;
    const t = terrain[idx(x, y)];
    if (t === Terrain.Road || t === Terrain.Bridge) return 0.25;
    if (t === Terrain.Water) return 9; // bridges are possible but pricey
    return base;
  };
  for (const v of villages) {
    const path = findPath(grid, pen.x, pen.y + 3, v.x, v.y + 1, roadBias);
    if (!path) continue;
    for (const p of path) {
      const i = idx(p.x, p.y);
      if (deco[i] === Deco.PenGround || deco[i] === Deco.Fence || deco[i] === Deco.Well) continue;
      terrain[i] = terrain[i] === Terrain.Water ? Terrain.Bridge : Terrain.Road;
      deco[i] = Deco.None;
    }
  }
  // Signposts where roads meet villages.
  for (const v of villages) {
    const i = idx(v.x - 1, v.y + 1);
    if (deco[i] === Deco.None && terrain[i] !== Terrain.Water) deco[i] = Deco.Signpost;
  }

  genLog?.("roads");
  // --- 6. Decorations ------------------------------------------------------
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = idx(x, y);
      if (deco[i] !== Deco.None) continue;
      if (Math.max(Math.abs(x - pen.x), Math.abs(y - pen.y)) <= 3) continue; // keep the pen and gate clear
      const t = terrain[i];
      const u = keyedUnit(seed, "deco", x, y);
      if (t === Terrain.Forest) deco[i] = u < 0.55 ? Deco.Tree : u < 0.9 ? Deco.Tree2 : u < 0.95 ? Deco.Stump : Deco.None;
      else if (t === Terrain.Rock) deco[i] = u < 0.3 ? Deco.Boulder : Deco.None;
      else if (t === Terrain.Grass) deco[i] = u < 0.05 ? Deco.Tuft : u < 0.07 ? Deco.Tree : Deco.None;
      else if (t === Terrain.Meadow) deco[i] = u < 0.08 ? Deco.Flowers : u < 0.1 ? Deco.Tuft : Deco.None;
    }
  }

  genLog?.("deco");
  penDistance = distanceField(grid, pen.x, pen.y);
  genLog?.("distance");
  let walkableCount = 0;
  for (let i = 0; i < n * n; i++) if (Number.isFinite(penDistance[i]!)) walkableCount++;

  return { seed, size: n, terrain, deco, pen, villages, penDistance, walkableCount };
}

function findPenSite(terrain: Uint8Array, n: number): { x: number; y: number } {
  const c = Math.floor(n / 2);
  for (let r = 0; r < n / 2; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = c + dx;
        const y = c + dy;
        if (x < 6 || y < 6 || x >= n - 6 || y >= n - 6) continue;
        let ok = true;
        for (let yy = -3; yy <= 3 && ok; yy++) for (let xx = -3; xx <= 3; xx++) {
          const t = terrain[(y + yy) * n + (x + xx)];
          if (t !== Terrain.Grass && t !== Terrain.Meadow) { ok = false; break; }
        }
        if (ok) return { x, y };
      }
    }
  }
  return { x: c, y: c };
}

function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Tiles a sheep or library may occupy: reachable, plain ground, not built on. */
export function isPlaceable(map: GameMap, x: number, y: number): boolean {
  const i = y * map.size + x;
  const t = map.terrain[i]!;
  if (!Number.isFinite(map.penDistance[i]!)) return false;
  if (t === Terrain.Road || t === Terrain.Bridge) return false;
  const d = map.deco[i]!;
  return d === Deco.None || d === Deco.Tuft || d === Deco.Flowers || d === Deco.Boulder;
}
