import type { GameMap } from "../core/map/generate";
import { Deco, TERRAIN_LAYER_ORDER, Terrain } from "../core/map/terrain";
import { keyedUnit } from "../core/rng";
import { INK, TERRAIN_COLOR, seasonalGreens, seasonalTerrain, shade } from "./palette";

export const CHUNK = 16;

type Surface = OffscreenCanvas | HTMLCanvasElement;
type Ctx = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

function makeSurface(px: number, offscreen: boolean): Surface {
  if (offscreen && typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(px, px);
  const c = document.createElement("canvas");
  c.width = px;
  c.height = px;
  return c;
}

/** Release a canvas's backing store now rather than whenever the GC gets to it. */
function freeSurface(s: Surface): void {
  try {
    s.width = 0;
    s.height = 0;
  } catch {
    /* nothing to free */
  }
}

/** A 1×1 canvas for reading probe pixels, so the chunk surfaces themselves are never read back. */
let probeCanvas: { ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D } | null | undefined;
function probeContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (probeCanvas !== undefined) return probeCanvas?.ctx ?? null;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    probeCanvas = ctx ? { ctx } : null;
  } catch {
    probeCanvas = null;
  }
  return probeCanvas?.ctx ?? null;
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Renders and caches 16x16-tile chunks at a fixed pixel size. Terrain is a
 * blob autotile: flat fill, then each layer in priority order paints rounded
 * squares that overlap their neighbours, so transitions come out rounded.
 */
interface Entry {
  surface: Surface;
  used: number;
  /** A pixel that should hold a known flat terrain colour, for health checks. */
  probe: { x: number; y: number; rgb: [number, number, number] } | null;
}

export class ChunkCache {
  private cache = new Map<number, Entry>();
  private pool: Surface[] = [];
  private frame = 0;
  readonly px: number;
  /** Set when a rendered chunk failed its pixel check: the browser is dropping or refusing canvases. */
  broken = false;
  private recheckCursor = 0;

  private colours: Record<number, string>;
  private greens: string[];

  constructor(readonly map: GameMap, readonly tilePx: number, readonly capacity: number, readonly season = "summer", readonly offscreen = true) {
    this.px = CHUNK * tilePx;
    this.colours = seasonalTerrain(season);
    this.greens = seasonalGreens(season);
  }

  beginFrame(): void {
    this.frame++;
  }

  /** Free every surface now. A dropped cache of two dozen 4 MB canvases should not wait for the GC. */
  dispose(): void {
    for (const e of this.cache.values()) freeSurface(e.surface);
    for (const s of this.pool) freeSurface(s);
    this.cache.clear();
    this.pool = [];
  }

  /** The cached chunk, or null if the browser could not render it correctly (draw it directly instead). */
  get(cx: number, cy: number): Surface | null {
    const key = cy * 4096 + cx;
    const hit = this.cache.get(key);
    if (hit) {
      hit.used = this.frame;
      return hit.surface;
    }
    let surface = this.pool.pop();
    if (!surface) {
      if (this.cache.size >= this.capacity) surface = this.evict();
      else {
        try {
          surface = makeSurface(this.px, this.offscreen);
        } catch {
          this.broken = true;
          return null;
        }
      }
    }
    const ctx = surface.getContext("2d") as Ctx | null;
    if (!ctx) {
      this.broken = true;
      freeSurface(surface);
      return null;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.paint(ctx, cx, cy);
    const probe = this.probeFor(cx, cy);
    const entry: Entry = { surface, used: this.frame, probe };
    if (!this.healthy(ctx, entry)) {
      this.broken = true;
      freeSurface(surface);
      return null;
    }
    this.cache.set(key, entry);
    return surface;
  }

  /** Every so often re-read one cached chunk's probe pixel; a canvas the browser has blanked comes back wrong. */
  recheck(): boolean {
    if (this.cache.size === 0) return true;
    const entries = [...this.cache.values()];
    const e = entries[this.recheckCursor++ % entries.length]!;
    const ctx = e.surface.getContext("2d") as Ctx | null;
    if (!ctx || !this.healthy(ctx, e)) {
      this.broken = true;
      return false;
    }
    return true;
  }

  /** Paint a chunk straight onto another canvas at tile size `T`, clipped to the chunk's own square. */
  paintDirect(ctx: Ctx, cx: number, cy: number, px: number, py: number, T: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, CHUNK * T + 0.5, CHUNK * T + 0.5);
    ctx.clip();
    ctx.translate(px, py);
    const k = T / this.tilePx;
    ctx.scale(k, k);
    this.paint(ctx, cx, cy);
    ctx.restore();
  }

  /** A plain tile inside the chunk whose centre pixel must come out as its flat colour. */
  private probeFor(cx: number, cy: number): Entry["probe"] {
    const { map, tilePx: T } = this;
    const n = map.size;
    for (let y = 1; y < CHUNK - 1; y++) {
      for (let x = 1; x < CHUNK - 1; x++) {
        const wx = cx * CHUNK + x;
        const wy = cy * CHUNK + y;
        if (wx <= 0 || wy <= 0 || wx >= n - 1 || wy >= n - 1) continue;
        const i = wy * n + wx;
        const t = map.terrain[i]!;
        if (t !== Terrain.Grass && t !== Terrain.Meadow && t !== Terrain.Sand && t !== Terrain.Mud && t !== Terrain.Road) continue;
        if (map.deco[i] !== Deco.None || keyedUnit(map.seed, "tex", wx, wy) < 0.4) continue;
        // Neighbours of another kind grow into this tile by a quarter; the centre stays its own colour.
        return { x: Math.floor(x * T + T / 2), y: Math.floor(y * T + T / 2), rgb: hexRgb(this.colours[t]!) };
      }
    }
    return null;
  }

  private healthy(_ctx: Ctx, e: Entry): boolean {
    if (!e.probe) return true;
    const pc = probeContext();
    if (!pc) return true; // cannot check here; assume fine
    try {
      pc.clearRect(0, 0, 1, 1);
      pc.drawImage(e.surface as CanvasImageSource, e.probe.x, e.probe.y, 1, 1, 0, 0, 1, 1);
      const d = pc.getImageData(0, 0, 1, 1).data;
      const [r, g, b] = e.probe.rgb;
      return Math.abs(d[0]! - r) <= 24 && Math.abs(d[1]! - g) <= 24 && Math.abs(d[2]! - b) <= 24 && d[3]! > 200;
    } catch {
      return false;
    }
  }

  private evict(): Surface {
    let oldestKey = -1;
    let oldest = Infinity;
    for (const [k, v] of this.cache) if (v.used < oldest) { oldest = v.used; oldestKey = k; }
    const entry = this.cache.get(oldestKey)!;
    this.cache.delete(oldestKey);
    return entry.surface;
  }

  private paint(ctx: Ctx, cx: number, cy: number): void {
    const { map, tilePx: T } = this;
    const n = map.size;
    const ox = cx * CHUNK;
    const oy = cy * CHUNK;
    const M = 2; // margin tiles so neighbours can encroach
    ctx.fillStyle = this.colours[Terrain.Water]!;
    ctx.fillRect(-M * T, -M * T, this.px + 2 * M * T, this.px + 2 * M * T);
    const terrainAt = (x: number, y: number): number => (x < 0 || y < 0 || x >= n || y >= n ? Terrain.Water : map.terrain[y * n + x]!);

    // Flat pass.
    for (let y = -M; y < CHUNK + M; y++) {
      for (let x = -M; x < CHUNK + M; x++) {
        const t = terrainAt(ox + x, oy + y);
        ctx.fillStyle = this.colours[t]!;
        ctx.fillRect(x * T, y * T, T, T);
      }
    }
    // Blob passes in layer order.
    const grow = T * 0.24;
    const r = T * 0.5;
    for (const layer of TERRAIN_LAYER_ORDER) {
      if (layer === Terrain.Water) continue;
      ctx.fillStyle = this.colours[layer]!;
      ctx.beginPath();
      for (let y = -M; y < CHUNK + M; y++) {
        for (let x = -M; x < CHUNK + M; x++) {
          if (terrainAt(ox + x, oy + y) !== layer) continue;
          ctx.roundRect(x * T - grow, y * T - grow, T + 2 * grow, T + 2 * grow, r);
        }
      }
      ctx.fill();
    }
    // Texture and decorations.
    for (let y = -1; y < CHUNK + 1; y++) {
      for (let x = -1; x < CHUNK + 1; x++) {
        const wx = ox + x;
        const wy = oy + y;
        if (wx < 0 || wy < 0 || wx >= n || wy >= n) continue;
        const t = map.terrain[wy * n + wx]!;
        const px = x * T;
        const py = y * T;
        const u = keyedUnit(map.seed, "tex", wx, wy);
        if (t === Terrain.Water && u < 0.35) {
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = Math.max(1, T * 0.05);
          ctx.beginPath();
          ctx.moveTo(px + T * 0.2, py + T * (0.3 + u));
          ctx.quadraticCurveTo(px + T * 0.5, py + T * (0.2 + u), px + T * 0.8, py + T * (0.3 + u));
          ctx.stroke();
        } else if (t === Terrain.Farm) {
          ctx.strokeStyle = shade(TERRAIN_COLOR[Terrain.Farm]!, -30);
          ctx.lineWidth = Math.max(1, T * 0.08);
          ctx.beginPath();
          for (let k = 1; k < 4; k++) {
            ctx.moveTo(px + T * 0.1, py + (T * k) / 4);
            ctx.lineTo(px + T * 0.9, py + (T * k) / 4);
          }
          ctx.stroke();
        } else if (t === Terrain.Rock && u < 0.5) {
          ctx.fillStyle = shade(TERRAIN_COLOR[Terrain.Rock]!, -25);
          ctx.beginPath();
          ctx.moveTo(px + T * 0.2, py + T * 0.7);
          ctx.lineTo(px + T * 0.5, py + T * 0.25);
          ctx.lineTo(px + T * 0.8, py + T * 0.7);
          ctx.closePath();
          ctx.fill();
        } else if (t === Terrain.Snow && u < 0.3) {
          ctx.fillStyle = "rgba(180,190,210,0.5)";
          ctx.beginPath();
          ctx.moveTo(px + T * 0.25, py + T * 0.75);
          ctx.lineTo(px + T * 0.5, py + T * 0.2);
          ctx.lineTo(px + T * 0.75, py + T * 0.75);
          ctx.closePath();
          ctx.fill();
        } else if ((t === Terrain.Grass || t === Terrain.Meadow) && u < 0.18) {
          ctx.fillStyle = this.season === "winter" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.07)";
          ctx.beginPath();
          ctx.ellipse(px + T * (0.3 + u), py + T * 0.5, T * 0.18, T * 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        this.drawDeco(ctx, map.deco[wy * n + wx]!, px, py, T, wx, wy);
      }
    }
  }

  private drawDeco(ctx: Ctx, d: number, px: number, py: number, T: number, wx: number, wy: number): void {
    if (d === Deco.None) return;
    const { map } = this;
    const u = keyedUnit(map.seed, "deco-var", wx, wy);
    ctx.lineWidth = Math.max(1, T * 0.06);
    ctx.strokeStyle = INK;
    switch (d) {
      case Deco.Tree: {
        const cxp = px + T * (0.35 + u * 0.3);
        const base = py + T * 0.85;
        const size = 0.8 + ((u * 7) % 1) * 0.45;
        ctx.fillStyle = "#6b4a2b";
        ctx.fillRect(cxp - T * 0.07, base - T * 0.3 * size, T * 0.14, T * 0.3 * size);
        ctx.fillStyle = this.greens[Math.floor(u * 5) % 5]!;
        ctx.beginPath();
        ctx.arc(cxp, base - T * 0.5 * size, T * 0.32 * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.arc(cxp - T * 0.1 * size, base - T * 0.6 * size, T * 0.14 * size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case Deco.Tree2: {
        const cxp = px + T * (0.35 + ((u * 13) % 1) * 0.3);
        const base = py + T * 0.9;
        const size = 0.8 + ((u * 3) % 1) * 0.5;
        ctx.fillStyle = "#6b4a2b";
        ctx.fillRect(cxp - T * 0.06, base - T * 0.2, T * 0.12, T * 0.2);
        ctx.fillStyle = this.season === "winter" ? (u < 0.5 ? "#4d6a52" : "#5a7a5e") : u < 0.5 ? "#2f6f3a" : "#3a7d46";
        ctx.beginPath();
        ctx.moveTo(cxp - T * 0.3 * size, base - T * 0.15);
        ctx.lineTo(cxp, base - T * 0.85 * size);
        ctx.lineTo(cxp + T * 0.3 * size, base - T * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.beginPath();
        ctx.moveTo(cxp, base - T * 0.15);
        ctx.lineTo(cxp, base - T * 0.85 * size);
        ctx.lineTo(cxp + T * 0.3 * size, base - T * 0.15);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case Deco.Stump:
        ctx.fillStyle = "#7d5a35";
        ctx.beginPath();
        ctx.ellipse(px + T * 0.5, py + T * 0.6, T * 0.2, T * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case Deco.Boulder:
        ctx.fillStyle = "#7a746b";
        ctx.beginPath();
        ctx.ellipse(px + T * 0.5, py + T * 0.6, T * 0.28, T * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.ellipse(px + T * 0.42, py + T * 0.52, T * 0.1, T * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case Deco.Tuft:
        ctx.strokeStyle = "rgba(40,90,30,0.7)";
        ctx.beginPath();
        for (let k = -1; k <= 1; k++) {
          ctx.moveTo(px + T * 0.5 + k * T * 0.12, py + T * 0.7);
          ctx.lineTo(px + T * 0.5 + k * T * 0.2, py + T * 0.4);
        }
        ctx.stroke();
        break;
      case Deco.Flowers: {
        const cols = ["#f2c14e", "#e86a92", "#f4f1e6", "#b58cf0"];
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = cols[(k + Math.floor(u * 4)) % 4]!;
          ctx.beginPath();
          ctx.arc(px + T * (0.3 + k * 0.2), py + T * (0.45 + ((k * 7) % 3) * 0.12), T * 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case Deco.House:
      case Deco.HouseRed: {
        const wall = d === Deco.House ? "#e8dcc3" : "#d8b28a";
        const roof = d === Deco.House ? "#8c4a3a" : "#b03a3a";
        ctx.fillStyle = wall;
        ctx.fillRect(px + T * 0.18, py + T * 0.45, T * 0.64, T * 0.45);
        ctx.strokeRect(px + T * 0.18, py + T * 0.45, T * 0.64, T * 0.45);
        ctx.fillStyle = roof;
        ctx.beginPath();
        ctx.moveTo(px + T * 0.1, py + T * 0.48);
        ctx.lineTo(px + T * 0.5, py + T * 0.1);
        ctx.lineTo(px + T * 0.9, py + T * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#5a3b1e";
        ctx.fillRect(px + T * 0.42, py + T * 0.65, T * 0.16, T * 0.25);
        break;
      }
      case Deco.Well:
        ctx.fillStyle = "#8a8578";
        ctx.beginPath();
        ctx.ellipse(px + T * 0.5, py + T * 0.62, T * 0.28, T * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#4f8fc9";
        ctx.beginPath();
        ctx.ellipse(px + T * 0.5, py + T * 0.62, T * 0.18, T * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8c4a3a";
        ctx.beginPath();
        ctx.moveTo(px + T * 0.2, py + T * 0.3);
        ctx.lineTo(px + T * 0.5, py + T * 0.08);
        ctx.lineTo(px + T * 0.8, py + T * 0.3);
        ctx.closePath();
        ctx.fill();
        break;
      case Deco.PenGround:
        ctx.fillStyle = "rgba(120,90,50,0.25)";
        ctx.fillRect(px, py, T, T);
        break;
      case Deco.Fence: {
        const n = map.size;
        const has = (dx: number, dy: number): boolean => map.deco[(wy + dy) * n + (wx + dx)] === Deco.Fence;
        ctx.strokeStyle = "#6b4a2b";
        ctx.lineWidth = Math.max(1.5, T * 0.1);
        ctx.beginPath();
        const cxp = px + T * 0.5;
        const cyp = py + T * 0.5;
        if (has(1, 0) || has(-1, 0)) {
          const x0 = has(-1, 0) ? px : cxp;
          const x1 = has(1, 0) ? px + T : cxp;
          ctx.moveTo(x0, cyp - T * 0.12);
          ctx.lineTo(x1, cyp - T * 0.12);
          ctx.moveTo(x0, cyp + T * 0.12);
          ctx.lineTo(x1, cyp + T * 0.12);
        }
        if (has(0, 1) || has(0, -1)) {
          const y0 = has(0, -1) ? py : cyp;
          const y1 = has(0, 1) ? py + T : cyp;
          ctx.moveTo(cxp - T * 0.12, y0);
          ctx.lineTo(cxp - T * 0.12, y1);
          ctx.moveTo(cxp + T * 0.12, y0);
          ctx.lineTo(cxp + T * 0.12, y1);
        }
        ctx.stroke();
        ctx.fillStyle = "#8a6238";
        ctx.fillRect(cxp - T * 0.09, cyp - T * 0.3, T * 0.18, T * 0.6);
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1, T * 0.04);
        ctx.strokeRect(cxp - T * 0.09, cyp - T * 0.3, T * 0.18, T * 0.6);
        break;
      }
      case Deco.Scarecrow: {
        const cxp = px + T * 0.5;
        ctx.strokeStyle = "#6b4a2b";
        ctx.lineWidth = Math.max(1.5, T * 0.07);
        ctx.beginPath();
        ctx.moveTo(cxp, py + T * 0.95);
        ctx.lineTo(cxp, py + T * 0.2);
        ctx.moveTo(cxp - T * 0.32, py + T * 0.42);
        ctx.lineTo(cxp + T * 0.32, py + T * 0.42);
        ctx.stroke();
        ctx.fillStyle = "#8c6a3a";
        ctx.beginPath();
        ctx.roundRect(cxp - T * 0.16, py + T * 0.36, T * 0.32, T * 0.36, T * 0.05);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(1, T * 0.04);
        ctx.stroke();
        ctx.fillStyle = "#e0b33c";
        ctx.beginPath();
        ctx.arc(cxp, py + T * 0.26, T * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#5b7a3a";
        ctx.beginPath();
        ctx.ellipse(cxp, py + T * 0.15, T * 0.24, T * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(cxp - T * 0.04, py + T * 0.25, T * 0.02, 0, Math.PI * 2);
        ctx.arc(cxp + T * 0.05, py + T * 0.25, T * 0.02, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case Deco.Signpost:
        ctx.fillStyle = "#8a6238";
        ctx.fillRect(px + T * 0.46, py + T * 0.3, T * 0.08, T * 0.6);
        ctx.fillStyle = "#d8c398";
        ctx.fillRect(px + T * 0.25, py + T * 0.3, T * 0.5, T * 0.2);
        ctx.strokeRect(px + T * 0.25, py + T * 0.3, T * 0.5, T * 0.2);
        break;
      case Deco.Library: {
        ctx.fillStyle = "#8a6238";
        ctx.fillRect(px + T * 0.46, py + T * 0.55, T * 0.08, T * 0.4);
        ctx.fillStyle = u < 0.33 ? "#c94f4f" : u < 0.66 ? "#3f7fbf" : "#e0b33c";
        ctx.fillRect(px + T * 0.22, py + T * 0.3, T * 0.56, T * 0.32);
        ctx.strokeRect(px + T * 0.22, py + T * 0.3, T * 0.56, T * 0.32);
        ctx.fillStyle = "#5a3b1e";
        ctx.beginPath();
        ctx.moveTo(px + T * 0.15, py + T * 0.32);
        ctx.lineTo(px + T * 0.5, py + T * 0.08);
        ctx.lineTo(px + T * 0.85, py + T * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f4f1e6";
        ctx.fillRect(px + T * 0.3, py + T * 0.36, T * 0.4, T * 0.2);
        ctx.fillStyle = "#c94f4f";
        ctx.fillRect(px + T * 0.33, py + T * 0.4, T * 0.08, T * 0.13);
        ctx.fillStyle = "#3f7fbf";
        ctx.fillRect(px + T * 0.43, py + T * 0.38, T * 0.08, T * 0.15);
        ctx.fillStyle = "#e0b33c";
        ctx.fillRect(px + T * 0.53, py + T * 0.41, T * 0.08, T * 0.12);
        break;
      }
    }
  }
}
