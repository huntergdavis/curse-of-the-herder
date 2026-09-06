import { TERRAIN_COST } from "./terrain";

// Binary min-heap over (cost, index) pairs, kept as parallel typed arrays.
class Heap {
  private keys: Float64Array;
  private vals: Int32Array;
  size = 0;
  constructor(capacity: number) {
    this.keys = new Float64Array(capacity);
    this.vals = new Int32Array(capacity);
  }
  push(key: number, val: number): void {
    if (this.size === this.keys.length) {
      const k = new Float64Array(this.size * 2);
      k.set(this.keys);
      this.keys = k;
      const v = new Int32Array(this.size * 2);
      v.set(this.vals);
      this.vals = v;
    }
    let i = this.size++;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.keys[p]! <= key) break;
      this.keys[i] = this.keys[p]!;
      this.vals[i] = this.vals[p]!;
      i = p;
    }
    this.keys[i] = key;
    this.vals[i] = val;
  }
  pop(): number {
    const top = this.vals[0]!;
    const n = --this.size;
    if (n > 0) {
      const key = this.keys[n]!;
      const val = this.vals[n]!;
      let i = 0;
      for (;;) {
        let c = 2 * i + 1;
        if (c >= n) break;
        if (c + 1 < n && this.keys[c + 1]! < this.keys[c]!) c++;
        if (this.keys[c]! >= key) break;
        this.keys[i] = this.keys[c]!;
        this.vals[i] = this.vals[c]!;
        i = c;
      }
      this.keys[i] = key;
      this.vals[i] = val;
    }
    return top;
  }
}

const DX = [1, -1, 0, 0, 1, 1, -1, -1];
const DY = [0, 0, 1, -1, 1, -1, 1, -1];
const DIAG = [false, false, false, false, true, true, true, true];
const SQRT2 = Math.SQRT2;

export interface Grid {
  size: number;
  terrain: Uint8Array;
}

export function tileCost(grid: Grid, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= grid.size || y >= grid.size) return Infinity;
  return TERRAIN_COST[grid.terrain[y * grid.size + x]!] ?? Infinity;
}

/**
 * Dijkstra over the whole grid from one source; returns the path cost to
 * every tile (Infinity where unreachable). Used for the pen distance field
 * and for placing sheep by "how far is this really".
 */
export function distanceField(grid: Grid, sx: number, sy: number, costOverride?: (x: number, y: number, base: number) => number): Float64Array {
  const n = grid.size;
  // Float64 on purpose: a Float32 store can round *up*, which makes the
  // exact double candidate look like an improvement forever.
  const dist = new Float64Array(n * n).fill(Infinity);
  const heap = new Heap(4096);
  const start = sy * n + sx;
  dist[start] = 0;
  heap.push(0, start);
  let pops = 0;
  let pushes = 1;
  while (heap.size > 0) {
    const i = heap.pop();
    const d = dist[i]!;
    if (++pops > 40 * n * n) throw new Error(`distanceField runaway: pops=${pops} pushes=${pushes} heap=${heap.size} d=${d}`);
    if (d > dist[i]!) continue; // stale heap entry
    const x = i % n;
    const y = (i - x) / n;
    for (let k = 0; k < 8; k++) {
      const nx = x + DX[k]!;
      const ny = y + DY[k]!;
      if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
      let c = tileCost(grid, nx, ny);
      if (costOverride) c = costOverride(nx, ny, c);
      if (!Number.isFinite(c)) continue;
      if (DIAG[k]) {
        // No corner cutting through impassable tiles.
        if (!Number.isFinite(tileCost(grid, x + DX[k]!, y)) || !Number.isFinite(tileCost(grid, x, y + DY[k]!))) continue;
        c *= SQRT2;
      }
      const j = ny * n + nx;
      const nd = d + c;
      if (nd < dist[j]!) {
        dist[j] = nd;
        heap.push(nd, j);
        pushes++;
      }
    }
  }
  return dist;
}

/**
 * A* on the terrain grid, 8-connected, octile heuristic scaled by the
 * cheapest terrain cost so it stays admissible. Returns tile centres from
 * the tile after start up to and including goal, or null if unreachable.
 */
export function findPath(grid: Grid, sx: number, sy: number, gx: number, gy: number, costOverride?: (x: number, y: number, base: number) => number, maxExpansions = 400_000): { x: number; y: number }[] | null {
  const n = grid.size;
  if (sx === gx && sy === gy) return [];
  const g = new Float64Array(n * n).fill(Infinity);
  const parent = new Int32Array(n * n).fill(-1);
  const closed = new Uint8Array(n * n);
  const heap = new Heap(4096);
  const start = sy * n + sx;
  const goal = gy * n + gx;
  const minCost = 0.7;
  const h = (x: number, y: number): number => {
    const dx = Math.abs(x - gx);
    const dy = Math.abs(y - gy);
    return minCost * (Math.max(dx, dy) + (SQRT2 - 1) * Math.min(dx, dy));
  };
  g[start] = 0;
  heap.push(h(sx, sy), start);
  let expansions = 0;
  while (heap.size > 0) {
    const i = heap.pop();
    if (closed[i]) continue;
    closed[i] = 1;
    if (i === goal) break;
    if (++expansions > maxExpansions) return null;
    const x = i % n;
    const y = (i - x) / n;
    const gi = g[i]!;
    for (let k = 0; k < 8; k++) {
      const nx = x + DX[k]!;
      const ny = y + DY[k]!;
      if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
      const j = ny * n + nx;
      if (closed[j]) continue;
      let c = tileCost(grid, nx, ny);
      if (costOverride) c = costOverride(nx, ny, c);
      if (!Number.isFinite(c)) continue;
      if (DIAG[k]) {
        if (!Number.isFinite(tileCost(grid, x + DX[k]!, y)) || !Number.isFinite(tileCost(grid, x, y + DY[k]!))) continue;
        c *= SQRT2;
      }
      const ng = gi + c;
      if (ng < g[j]!) {
        g[j] = ng;
        parent[j] = i;
        heap.push(ng + h(nx, ny), j);
      }
    }
  }
  if (!closed[goal]) return null;
  const out: { x: number; y: number }[] = [];
  for (let i = goal; i !== start && i !== -1; i = parent[i]!) {
    out.push({ x: i % n, y: Math.floor(i / n) });
  }
  out.reverse();
  return out;
}
