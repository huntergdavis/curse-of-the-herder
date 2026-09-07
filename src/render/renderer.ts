import type { GameMap } from "../core/map/generate";
import { dayHour, isRaining, type WorldState } from "../core/sim/state";
import { BOOK_BY_ID } from "../data/books";
import { Deco } from "../core/map/terrain";
import type { Bubbles } from "./bubbles";
import type { Camera } from "./camera";
import { CHUNK, ChunkCache } from "./chunks";
import { dayTint } from "./palette";
import { drawBubble, drawEmote, drawHerder, drawSheep } from "./sprites";

export const BUBBLE_FONT = '"Patrick Hand", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private chunks: ChunkCache | null = null;
  private dpr = 1;
  /** Display pixels per tile (CSS px * dpr). */
  tilePx = 48;
  private chunkTilePx = 48;
  width = 0;
  height = 0;

  constructor(private canvas: HTMLCanvasElement, private map: GameMap) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
  }

  setMap(map: GameMap): void {
    this.map = map;
    this.chunks = null;
  }

  resize(): void {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    this.width = Math.floor(cssW * this.dpr);
    this.height = Math.floor(cssH * this.dpr);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // About 22 tiles tall on any screen, clamped for legibility.
    this.tilePx = Math.max(20, Math.min(120, Math.round(Math.min(cssW, cssH) / 20))) * this.dpr;
    this.chunkTilePx = Math.min(96, this.tilePx);
    this.chunks = null;
  }

  private ensureChunks(): ChunkCache {
    if (!this.chunks) {
      const chunkPx = CHUNK * this.chunkTilePx;
      const visible = (Math.ceil(this.width / chunkPx) + 2) * (Math.ceil(this.height / chunkPx) + 2);
      this.chunks = new ChunkCache(this.map, this.chunkTilePx, visible + 8);
    }
    return this.chunks;
  }

  /** When set, the sky follows this hour instead of the world clock (ending fade). */
  hourOverride: number | null = null;

  draw(world: WorldState, cam: Camera, bubbles: Bubbles, nowMs: number): void {
    const ctx = this.ctx;
    const T = this.tilePx;
    const chunks = this.ensureChunks();
    chunks.beginFrame();
    const W = this.width;
    const H = this.height;
    // World → screen: screen = (world - cam) * T + centre. Snap to whole pixels.
    const offX = Math.round(W / 2 - (cam.x + 0.5) * T);
    const offY = Math.round(H / 2 - (cam.y + 0.5) * T);
    const sx = (wx: number): number => offX + wx * T;
    const sy = (wy: number): number => offY + wy * T;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#4f8fc9";
    ctx.fillRect(0, 0, W, H);

    const chunkWorld = CHUNK;
    const c0x = Math.floor((cam.x - W / (2 * T)) / chunkWorld) - 0;
    const c1x = Math.floor((cam.x + W / (2 * T)) / chunkWorld) + 1;
    const c0y = Math.floor((cam.y - H / (2 * T)) / chunkWorld) - 0;
    const c1y = Math.floor((cam.y + H / (2 * T)) / chunkWorld) + 1;
    const maxChunk = Math.ceil(this.map.size / chunkWorld);
    const chunkDraw = chunkWorld * T;
    for (let cy = Math.max(0, c0y); cy <= Math.min(maxChunk - 1, c1y); cy++) {
      for (let cx = Math.max(0, c0x); cx <= Math.min(maxChunk - 1, c1x); cx++) {
        const surface = chunks.get(cx, cy);
        ctx.drawImage(surface as CanvasImageSource, sx(cx * chunkWorld), sy(cy * chunkWorld), chunkDraw + 0.5, chunkDraw + 0.5);
      }
    }

    // Sheep, sorted by y for overlap.
    const phase = (nowMs / 600) % 1;
    const visibleSheep = world.sheep
      .filter((s) => s.mode !== "carried" && Math.abs(s.x - cam.x) * T < W / 2 + T * 2 && Math.abs(s.y - cam.y) * T < H / 2 + T * 2)
      .sort((a, b) => a.y - b.y);
    const h = world.herder;
    let herderDrawn = false;
    for (const s of visibleSheep) {
      if (!herderDrawn && s.y > h.y) {
        this.drawHerder(world, sx, sy, T, phase, nowMs);
        herderDrawn = true;
      }
      const pose = s.mode === "penned" ? (world.finished ? "asleep" : "idle") : "idle";
      const facing = s.x < h.x ? 0 : 2;
      drawSheep(ctx, sx(s.x + 0.5), sy(s.y + 0.5), T * 0.9, pose, facing, phase, s.named);
    }
    if (!herderDrawn) this.drawHerder(world, sx, sy, T, phase, nowMs);

    // Emotes above sheep.
    for (const b of bubbles.list) {
      if (b.anchor === "herder") continue;
      const s = world.sheep[b.anchor];
      if (!s) continue;
      drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T, b.text);
    }

    // Emptied libraries get a little "read" tag so the map remembers.
    for (const l of world.libraries) {
      if (!l.taken) continue;
      if (Math.abs(l.x - cam.x) * T > W / 2 + T || Math.abs(l.y - cam.y) * T > H / 2 + T) continue;
      const book = BOOK_BY_ID.get(l.bookId);
      ctx.fillStyle = "#fffdf5";
      ctx.strokeStyle = "#2b2620";
      ctx.lineWidth = Math.max(1, T * 0.04);
      ctx.beginPath();
      ctx.roundRect(sx(l.x) + T * 0.62, sy(l.y) - T * 0.05, T * 0.34, T * 0.22, T * 0.04);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = book?.colour ?? "#c94f4f";
      ctx.fillRect(sx(l.x) + T * 0.67, sy(l.y) + T * 0.0, T * 0.1, T * 0.12);
      ctx.fillStyle = "#2b2620";
      ctx.font = `${Math.max(8, T * 0.16)}px sans-serif`;
      ctx.fillText("✓", sx(l.x) + T * 0.8, sy(l.y) + T * 0.12);
    }
    void Deco;

    // Rain: diagonal streaks, deterministic per frame bucket so they scroll.
    if (isRaining(world)) {
      ctx.strokeStyle = "rgba(200, 220, 255, 0.35)";
      ctx.lineWidth = Math.max(1, T * 0.03);
      ctx.beginPath();
      const drops = Math.floor((W * H) / (T * T) * 0.6);
      const t = nowMs / 1000;
      for (let i = 0; i < drops; i++) {
        const seedX = (i * 7919) % 10007;
        const seedY = (i * 104729) % 10009;
        const x = ((seedX / 10007) * W + t * T * 3) % W;
        const y = ((seedY / 10009) * H + t * T * 12 + i) % H;
        ctx.moveTo(x, y);
        ctx.lineTo(x - T * 0.18, y + T * 0.6);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(60, 70, 110, 0.18)";
      ctx.fillRect(0, 0, W, H);
    }

    // Day tint over the world, under the bubble.
    const tint = dayTint(this.hourOverride ?? dayHour(world));
    if (!tint.endsWith("0)") && !tint.endsWith("0.000)")) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, W, H);
    }

    const line = bubbles.herderLine();
    if (line) {
      const fontPx = Math.max(14 * this.dpr, Math.min(T * 0.42, 30 * this.dpr));
      drawBubble(ctx, sx(h.x + 0.5), sy(h.y + 0.5) - T * 1.45, line.text, fontPx, { heat: line.heat, font: BUBBLE_FONT }, W, H);
    }
  }

  private drawHerder(world: WorldState, sx: (x: number) => number, sy: (y: number) => number, T: number, phase: number, nowMs: number): void {
    const h = world.herder;
    const walking = h.mode === "toSheep" || h.mode === "toPen";
    const reading = h.mode === "reading" && world.reading;
    drawHerder(this.ctx, sx(h.x + 0.5), sy(h.y + 0.95), T, {
      facing: h.facing,
      walking,
      carrying: h.carrying >= 0,
      phase: walking ? (nowMs / 420) % 1 : phase,
      fury: world.frustration / 100,
      resting: h.mode === "resting",
      reading: !!reading,
      bookColour: reading ? BOOK_BY_ID.get(world.reading!.bookId)?.colour ?? "#c94f4f" : "#c94f4f",
    });
    if (h.carrying >= 0) {
      drawSheep(this.ctx, sx(h.x + 0.5), sy(h.y + 0.95) - T * 1.35, T * 0.8, "carried", h.facing === 2 ? 0 : 2, phase, world.sheep[h.carrying]?.named ?? false);
    }
  }
}
