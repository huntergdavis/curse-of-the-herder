import type { GameMap } from "../core/map/generate";
import { dayHour, isFoggy, isRaining, type WorldState } from "../core/sim/state";
import { BOOK_BY_ID } from "../data/books";
import { dogName, sheepName } from "../core/names";
import { Deco } from "../core/map/terrain";
import type { Bubbles } from "./bubbles";
import type { Camera } from "./camera";
import { CHUNK, ChunkCache } from "./chunks";
import { dayTint } from "./palette";
import { drawBubble, drawEmote, drawHerder, drawSheep, setShadowSkew } from "./sprites";
import { Terrain } from "../core/map/terrain";
import { keyedUnit } from "../core/rng";

export const BUBBLE_FONT = '"Patrick Hand", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';

function walkingHerder(world: WorldState): boolean {
  return world.herder.mode === "toSheep" || world.herder.mode === "toPen";
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private chunks: ChunkCache | null = null;
  private dpr = 1;
  /** Display pixels per tile (CSS px * dpr). */
  tilePx = 48;
  private chunkTilePx = 48;
  width = 0;
  height = 0;

  private houses: { x: number; y: number }[] = [];
  /** Villagers stand by their wells; each remembers when it last heard something. */
  private villagers: { x: number; y: number; shockedUntil: number; variant: number }[] = [];

  constructor(private canvas: HTMLCanvasElement, private map: GameMap) {
    this.ctx = canvas.getContext("2d")!;
    this.indexHouses();
    this.resize();
  }

  setMap(map: GameMap): void {
    this.map = map;
    this.chunks = null;
    this.indexHouses();
  }

  private indexHouses(): void {
    this.houses = [];
    this.villagers = [];
    const n = this.map.size;
    for (let i = 0; i < n * n; i++) {
      const d = this.map.deco[i];
      if (d === Deco.House || d === Deco.HouseRed) this.houses.push({ x: i % n, y: Math.floor(i / n) });
      if (d === Deco.Well) this.villagers.push({ x: (i % n) + 1, y: Math.floor(i / n), shockedUntil: 0, variant: (i * 7) % 3 });
    }
  }

  /** A strong line was said at (x, y); villagers within earshot clutch their pearls. */
  scandalise(x: number, y: number, nowMs: number): void {
    for (const v of this.villagers) if (Math.hypot(v.x - x, v.y - y) < 11) v.shockedUntil = nowMs + 2600;
  }

  /** A calm herder passing close by gets a wave, and gives one back. */
  private greetings(world: WorldState, nowMs: number): { x: number; y: number } | null {
    const h = world.herder;
    if (world.frustration >= 30) return null;
    for (const v of this.villagers) {
      if (Math.hypot(v.x - h.x, v.y - h.y) < 3.2) {
        if (nowMs > v.shockedUntil) v.shockedUntil = -nowMs; // negative marks a wave
        return v;
      }
    }
    return null;
  }

  private drawDog(px: number, py: number, T: number, facing: number, moving: boolean, lying: boolean, nowMs: number): void {
    const ctx = this.ctx;
    const flip = facing === 2 ? -1 : 1;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(flip, 1);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 0, T * 0.3, T * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b2620";
    ctx.lineWidth = Math.max(1, T * 0.04);
    const bob = moving ? Math.abs(Math.sin(nowMs / 130)) * T * 0.05 : 0;
    const bodyY = lying ? -T * 0.14 : -T * 0.3 - bob;
    // Legs
    if (!lying) {
      ctx.strokeStyle = "#2b2620";
      ctx.lineWidth = Math.max(1.5, T * 0.06);
      ctx.beginPath();
      const sw = moving ? Math.sin(nowMs / 130) * T * 0.08 : 0;
      for (const [lx, sgn] of [[-0.16, 1], [0.14, -1], [-0.08, -1], [0.06, 1]] as const) {
        ctx.moveTo(lx * T, bodyY + T * 0.08);
        ctx.lineTo(lx * T + sw * sgn, -T * 0.02);
      }
      ctx.stroke();
    }
    // Body
    ctx.fillStyle = "#2b2620";
    ctx.beginPath();
    ctx.ellipse(0, bodyY, T * 0.3, lying ? T * 0.12 : T * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f1e6";
    ctx.beginPath();
    ctx.ellipse(-T * 0.02, bodyY + T * 0.03, T * 0.16, lying ? T * 0.06 : T * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail (wags when lying and content)
    ctx.strokeStyle = "#2b2620";
    ctx.lineWidth = Math.max(1.5, T * 0.05);
    ctx.beginPath();
    ctx.moveTo(-T * 0.28, bodyY - T * 0.02);
    ctx.lineTo(-T * 0.42, bodyY - T * 0.18 + (lying ? Math.sin(nowMs / 200) * T * 0.06 : Math.sin(nowMs / 300) * T * 0.03));
    ctx.stroke();
    // Head
    ctx.fillStyle = "#2b2620";
    ctx.beginPath();
    ctx.ellipse(T * 0.3, bodyY - T * 0.1, T * 0.13, T * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f1e6";
    ctx.beginPath();
    ctx.ellipse(T * 0.37, bodyY - T * 0.06, T * 0.07, T * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ear and eye
    ctx.fillStyle = "#2b2620";
    ctx.beginPath();
    ctx.ellipse(T * 0.24, bodyY - T * 0.2, T * 0.05, T * 0.08, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f1e6";
    ctx.beginPath();
    ctx.arc(T * 0.32, bodyY - T * 0.12, T * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // A thought, now and then: never about sheep.
    const beat = Math.floor(nowMs / 1000) % 29;
    if (beat === 0) drawEmote(ctx, px + T * 0.45, py - T * 0.75, T * 0.8, lying ? "z" : "?");
    else if (beat === 14 && !lying) drawEmote(ctx, px + T * 0.45, py - T * 0.75, T * 0.8, "woof");
  }

  private drawVillager(v: { x: number; y: number; shockedUntil: number; variant: number }, sx: (x: number) => number, sy: (y: number) => number, T: number, nowMs: number): void {
    const ctx = this.ctx;
    const px = sx(v.x + 0.5);
    const py = sy(v.y + 0.95);
    const shocked = nowMs < v.shockedUntil;
    const waving = v.shockedUntil < 0 && nowMs + v.shockedUntil < 2500;
    const bob = Math.sin(nowMs / 900 + v.variant) * T * 0.01;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(px, py, T * 0.22, T * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b2620";
    ctx.lineWidth = Math.max(1, T * 0.04);
    ctx.fillStyle = ["#7f9bd1", "#c97c7c", "#8fb07a"][v.variant]!;
    ctx.beginPath();
    ctx.roundRect(px - T * 0.16, py - T * 0.62 - bob, T * 0.32, T * 0.42, T * 0.08);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#e8b98a";
    ctx.beginPath();
    ctx.arc(px, py - T * 0.74 - bob, T * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hands: on hips normally, over the mouth when scandalised.
    ctx.strokeStyle = "#e8b98a";
    ctx.lineWidth = Math.max(2, T * 0.07);
    ctx.beginPath();
    if (shocked) {
      ctx.moveTo(px - T * 0.14, py - T * 0.5 - bob);
      ctx.lineTo(px - T * 0.03, py - T * 0.7 - bob);
      ctx.moveTo(px + T * 0.14, py - T * 0.5 - bob);
      ctx.lineTo(px + T * 0.03, py - T * 0.7 - bob);
    } else if (waving) {
      ctx.moveTo(px - T * 0.16, py - T * 0.55 - bob);
      ctx.lineTo(px - T * 0.22, py - T * 0.35 - bob);
      ctx.moveTo(px + T * 0.16, py - T * 0.55 - bob);
      ctx.lineTo(px + T * 0.3 + Math.sin(nowMs / 120) * T * 0.05, py - T * 0.95 - bob);
    } else {
      ctx.moveTo(px - T * 0.16, py - T * 0.55 - bob);
      ctx.lineTo(px - T * 0.22, py - T * 0.35 - bob);
      ctx.moveTo(px + T * 0.16, py - T * 0.55 - bob);
      ctx.lineTo(px + T * 0.22, py - T * 0.35 - bob);
    }
    ctx.stroke();
    if (shocked) drawEmote(ctx, px + T * 0.3, py - T * 1.15, T, "!");
    else if (waving) drawEmote(ctx, px + T * 0.3, py - T * 1.15, T, "hullo");
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
  /** Wall ms when the rain last stopped; a rainbow follows for a while. */
  rainbowFromMs = -1e9;
  private lastRainTick = -1e9;
  /** Recent muddy footprints, world coords. */
  private prints: { x: number; y: number; atMs: number }[] = [];
  private lastPrint = { x: -1, y: -1 };

  rainStopped(nowMs: number): void {
    this.rainbowFromMs = nowMs;
  }

  /** The sheepdog: follows him about, sits when he sits, helps with nothing. */
  private dog = { x: 0, y: 0, vx: 0, vy: 0, facing: 0, init: false, lastIdleMs: 0, reactUntil: 0, react: "" };

  /** The dog notices things, briefly. */
  dogReact(kind: "wasp" | "flee" | "bite" | "book", nowMs: number): void {
    this.dog.react = kind;
    this.dog.reactUntil = nowMs + (kind === "wasp" ? 3500 : 2200);
  }

  /** Epitaph of the herder before this one, carved on a stone by the pen. */
  memorial: { name: string; epitaph: string } | null = null;

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

    const h = world.herder;
    const hourNow = this.hourOverride ?? dayHour(world);
    setShadowSkew(Math.max(-0.6, Math.min(0.6, (hourNow - 13.5) * 0.14)));

    // Footprints in the mud: remember where he stepped, fade them out.
    {
      const tx = Math.round(h.x);
      const ty = Math.round(h.y);
      if ((tx !== this.lastPrint.x || ty !== this.lastPrint.y) && this.map.terrain[ty * this.map.size + tx] === Terrain.Mud) {
        this.lastPrint = { x: tx, y: ty };
        this.prints.push({ x: h.x + 0.5 + (this.prints.length % 2 ? 0.12 : -0.12), y: h.y + 0.95, atMs: nowMs });
        if (this.prints.length > 40) this.prints.shift();
      }
      for (const p of this.prints) {
        const age = (nowMs - p.atMs) / 60_000;
        if (age > 1) continue;
        ctx.fillStyle = `rgba(60, 40, 20, ${(0.35 * (1 - age)).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(sx(p.x), sy(p.y), T * 0.09, T * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Puddles gather on grass while it rains and linger a while after.
    {
      const sinceRain = world.rainUntilTick ? 0 : (world.tick - this.lastRainTick) * 0.25;
      if (isRaining(world)) this.lastRainTick = world.tick;
      const wet = isRaining(world) ? 1 : Math.max(0, 1 - sinceRain / 600);
      if (wet > 0) {
        const x0 = Math.max(0, Math.floor(cam.x - W / (2 * T)) - 1);
        const x1 = Math.min(this.map.size - 1, Math.ceil(cam.x + W / (2 * T)) + 1);
        const y0 = Math.max(0, Math.floor(cam.y - H / (2 * T)) - 1);
        const y1 = Math.min(this.map.size - 1, Math.ceil(cam.y + H / (2 * T)) + 1);
        ctx.fillStyle = `rgba(90, 140, 200, ${(0.35 * wet).toFixed(3)})`;
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const i = y * this.map.size + x;
            const t = this.map.terrain[i];
            if ((t !== Terrain.Grass && t !== Terrain.Meadow && t !== Terrain.Road) || this.map.deco[i] !== Deco.None) continue;
            if (((x * 37 + y * 101) % 23) !== 5) continue;
            ctx.beginPath();
            ctx.ellipse(sx(x + 0.5), sy(y + 0.6), T * 0.3 * wet, T * 0.14 * wet, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Ducks paddle in slow circles on water near the camera; butterflies dither over flowers.
    {
      const x0 = Math.max(0, Math.floor(cam.x - W / (2 * T)) - 1);
      const x1 = Math.min(this.map.size - 1, Math.ceil(cam.x + W / (2 * T)) + 1);
      const y0 = Math.max(0, Math.floor(cam.y - H / (2 * T)) - 1);
      const y1 = Math.min(this.map.size - 1, Math.ceil(cam.y + H / (2 * T)) + 1);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * this.map.size + x;
          const t = this.map.terrain[i];
          if (t === Terrain.Water) {
            if (((x * 73 + y * 151) % 97) !== 3) continue; // roughly one duck per hundred water tiles
            const a = nowMs / 4000 + x;
            const dx = Math.cos(a) * 0.35;
            const dy = Math.sin(a) * 0.2;
            const px = sx(x + 0.5 + dx);
            const py = sy(y + 0.5 + dy);
            ctx.fillStyle = "#6b4a2b";
            ctx.beginPath();
            ctx.ellipse(px, py, T * 0.14, T * 0.09, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#3f7a3a";
            ctx.beginPath();
            ctx.arc(px + (Math.cos(a) < 0 ? -1 : 1) * T * 0.11, py - T * 0.09, T * 0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e0b33c";
            ctx.fillRect(px + (Math.cos(a) < 0 ? -1 : 1) * T * 0.16 - T * 0.02, py - T * 0.1, T * 0.05, T * 0.025);
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = Math.max(1, T * 0.02);
            ctx.beginPath();
            ctx.moveTo(px - T * 0.2, py + T * 0.12);
            ctx.lineTo(px - T * 0.45, py + T * 0.22);
            ctx.moveTo(px + T * 0.2, py + T * 0.12);
            ctx.lineTo(px + T * 0.45, py + T * 0.22);
            ctx.stroke();
          } else if (this.map.deco[i] === Deco.Flowers && hourNow < 17.5) {
            const u = keyedUnit(this.map.seed, "bfly", x, y);
            if (u > 0.5) continue;
            const a = nowMs / 1300 + u * 20;
            const px = sx(x + 0.5 + Math.sin(a) * 0.35 + Math.sin(a * 2.7) * 0.1);
            const py = sy(y + 0.2 + Math.cos(a * 1.3) * 0.25);
            const flap = Math.abs(Math.sin(nowMs / 90 + u * 9));
            ctx.fillStyle = u < 0.2 ? "#f2c14e" : u < 0.35 ? "#f4f1e6" : "#b58cf0";
            ctx.beginPath();
            ctx.ellipse(px - T * 0.06 * flap, py, T * 0.06 * flap, T * 0.05, 0, 0, Math.PI * 2);
            ctx.ellipse(px + T * 0.06 * flap, py, T * 0.06 * flap, T * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // The dog: trails a tile and a half behind, lies down when he stops, wanders off after butterflies.
    {
      const d = this.dog;
      if (!d.init) {
        d.x = h.x - 1.5;
        d.y = h.y;
        d.init = true;
      }
      const moving = h.mode === "toSheep" || h.mode === "toPen" || h.mode === "toLibrary";
      const targetX = h.x - (h.facing === 0 ? 1.6 : h.facing === 2 ? -1.6 : 0.9);
      const targetY = h.y - (h.facing === 1 ? 1.4 : h.facing === 3 ? -1.4 : 0.3) + 0.5;
      const dist = Math.hypot(targetX - d.x, targetY - d.y);
      if (moving || dist > 3) {
        const k = 1 - Math.exp(-(1 / 60) * 3.2);
        d.vx = (targetX - d.x) * k;
        d.vy = (targetY - d.y) * k;
        d.x += d.vx;
        d.y += d.vy;
        if (Math.abs(d.vx) > 0.002) d.facing = d.vx > 0 ? 0 : 2;
      }
      // Reactions: bolt from a wasp, one bark at a runaway, then lose interest.
      const reacting = nowMs < d.reactUntil;
      if (reacting && d.react === "wasp") {
        d.x += (d.facing === 0 ? -1 : 1) * 0.06;
        d.vx = (d.facing === 0 ? -1 : 1) * 0.06;
      }
      const dogMoving = Math.hypot(d.vx, d.vy) > 0.004;
      if (Math.abs(d.x - cam.x) * T < W / 2 + T * 2 && Math.abs(d.y - cam.y) * T < H / 2 + T * 2) {
        this.drawDog(sx(d.x + 0.5), sy(d.y + 0.9), T, d.facing, dogMoving, !moving && !dogMoving && !reacting, nowMs);
        if (reacting) {
          const glyph = d.react === "wasp" ? "!" : d.react === "flee" ? (nowMs < d.reactUntil - 1100 ? "woof" : "…") : d.react === "bite" ? "?" : "…";
          drawEmote(ctx, sx(d.x + 0.5) + T * 0.45, sy(d.y + 0.9) - T * 0.85, T * 0.8, glyph);
        }
        if (T >= 40 && !moving) {
          ctx.font = `${Math.max(9, T * 0.18)}px "Fredoka", sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(43,38,32,0.7)";
          ctx.fillText(dogName(world.seed), sx(d.x + 0.5), sy(d.y + 0.9) + T * 0.28);
          ctx.textAlign = "left";
        }
      }
    }

    // Villagers by their wells.
    const greeted = this.greetings(world, nowMs);
    if (greeted && Math.floor(nowMs / 1000) % 2 === 0) drawEmote(ctx, sx(h.x + 0.5) - T * 0.45, sy(h.y + 0.95) - T * 1.7, T * 0.8, "hullo");
    for (const v of this.villagers) {
      if (Math.abs(v.x - cam.x) * T > W / 2 + T * 2 || Math.abs(v.y - cam.y) * T > H / 2 + T * 2) continue;
      this.drawVillager(v, sx, sy, T, nowMs);
    }

    // Sheep, sorted by y for overlap.
    const phase = (nowMs / 600) % 1;
    const visibleSheep = world.sheep
      .filter((s) => s.mode !== "carried" && Math.abs(s.x - cam.x) * T < W / 2 + T * 2 && Math.abs(s.y - cam.y) * T < H / 2 + T * 2)
      .sort((a, b) => a.y - b.y);
    let herderDrawn = false;
    for (const s of visibleSheep) {
      if (!herderDrawn && s.y > h.y) {
        this.drawHerder(world, sx, sy, T, phase, nowMs);
        herderDrawn = true;
      }
      const moving = s.mode === "loose" && (Math.abs(s.tx - s.x) > 1e-3 || Math.abs(s.ty - s.y) > 1e-3);
      const pose = s.mode === "penned" ? (world.finished ? "asleep" : "idle") : moving ? "walk" : "idle";
      const facing = moving ? (s.tx < s.x ? 2 : 0) : s.x < h.x ? 0 : 2;
      const walkPhase = moving && s.speed > 2 ? (nowMs / 160) % 1 : (nowMs / 500 + s.id * 0.13) % 1;
      if (s.inRiver && s.mode === "loose") {
        // Ripples around a sheep standing in the water.
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = Math.max(1, T * 0.04);
        for (let k = 0; k < 2; k++) {
          const r = ((nowMs / 1400 + k / 2) % 1);
          ctx.beginPath();
          ctx.ellipse(sx(s.x + 0.5), sy(s.y + 0.62), T * (0.3 + r * 0.35), T * (0.12 + r * 0.16), 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      drawSheep(ctx, sx(s.x + 0.5), sy(s.y + (s.onRoof ? 0.12 : s.inRiver ? 0.6 : 0.5)), T * (s.onRoof ? 0.75 : s.inRiver ? 0.8 : 0.9), s.inRiver && s.mode === "loose" ? "asleep" : pose, facing, walkPhase, s.named);
      if (s.named && s.mode === "loose" && T >= 32) {
        ctx.font = `${Math.max(9, T * 0.2)}px "Fredoka", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(43,38,32,0.8)";
        ctx.fillText(sheepName(world.seed, s.id), sx(s.x + 0.5), sy(s.y + 0.5) + T * 0.62);
        ctx.textAlign = "left";
      }
      // Stranded sheep look faintly puzzled about it, now and then; the others bleat occasionally.
      if (s.mode === "loose" && s.absurd && Math.floor(nowMs / 1000 + s.id) % 7 < 2) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T, "?");
      else if (s.mode !== "carried" && !world.finished && Math.floor(nowMs / 1000 + s.id * 7) % 23 === 0) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T, (s.id * 13 + Math.floor(nowMs / 23000)) % 9 === 0 ? "achoo" : "baa");
      // At night one or two sheep snore at a time, gently.
      else if (world.finished && s.mode === "penned" && s.id % 20 === Math.floor(nowMs / 6000) % 20) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "z");
      // One penned sheep at a time gives him a look when he passes empty-handed.
      else if (s.mode === "penned" && h.carrying < 0 && !world.finished && Math.hypot(h.x - this.map.pen.x, h.y - this.map.pen.y) < 7 && s.id % 12 === Math.floor(nowMs / 4000) % 12) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "…");
    }
    if (!herderDrawn) this.drawHerder(world, sx, sy, T, phase, nowMs);

    // Whistling while he works, when the day has not yet got to him.
    if (walkingHerder(world) && world.frustration < 18 && Math.floor(nowMs / 1000) % 11 < 3) drawEmote(ctx, sx(h.x + 0.5) + T * 0.45, sy(h.y + 0.95) - T * 1.7, T * 0.8, "♪");

    // Yesterday's herder rests beside the pen; today's herder walks past him every trip.
    if (this.memorial && !world.finished) {
      const gx = sx(this.map.pen.x - 2.7);
      const gy = sy(this.map.pen.y + 0.9);
      if (Math.abs(this.map.pen.x - cam.x) * T < W && Math.abs(this.map.pen.y - cam.y) * T < H) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(gx, gy, T * 0.4, T * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#b3afa5";
        ctx.strokeStyle = "#2b2620";
        ctx.lineWidth = Math.max(1, T * 0.05);
        ctx.beginPath();
        ctx.moveTo(gx - T * 0.32, gy);
        ctx.lineTo(gx - T * 0.32, gy - T * 0.6);
        ctx.arc(gx, gy - T * 0.6, T * 0.32, Math.PI, 0);
        ctx.lineTo(gx + T * 0.32, gy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (T >= 40 && Math.hypot(h.x - this.map.pen.x, h.y - this.map.pen.y) < 9) {
          ctx.fillStyle = "rgba(43,38,32,0.85)";
          ctx.font = `${Math.max(8, T * 0.16)}px "Patrick Hand", cursive`;
          ctx.textAlign = "center";
          ctx.fillText(this.memorial.name, gx, gy - T * 0.55);
          const words = this.memorial.epitaph.split(" ");
          let line = "";
          let ly = gy - T * 0.36;
          for (const wd of words) {
            if ((line + " " + wd).trim().length > 14) {
              ctx.fillText(line, gx, ly);
              ly += T * 0.17;
              line = wd;
            } else line = (line + " " + wd).trim();
            if (ly > gy - T * 0.05) break;
          }
          if (line && ly <= gy - T * 0.05) ctx.fillText(line, gx, ly);
          ctx.textAlign = "left";
        }
      }
    }

    // The stone beside the pen, once the day is done.
    if (world.finished) {
      const gx = sx(this.map.pen.x + 3.2);
      const gy = sy(this.map.pen.y + 0.9);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(gx, gy, T * 0.45, T * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a9a59b";
      ctx.strokeStyle = "#2b2620";
      ctx.lineWidth = Math.max(1, T * 0.05);
      ctx.beginPath();
      ctx.moveTo(gx - T * 0.36, gy);
      ctx.lineTo(gx - T * 0.36, gy - T * 0.7);
      ctx.arc(gx, gy - T * 0.7, T * 0.36, Math.PI, 0);
      ctx.lineTo(gx + T * 0.36, gy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(43,38,32,0.45)";
      ctx.lineWidth = Math.max(1, T * 0.035);
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        ctx.moveTo(gx - T * 0.2, gy - T * 0.55 + k * T * 0.14);
        ctx.lineTo(gx + T * 0.2, gy - T * 0.55 + k * T * 0.14);
      }
      ctx.stroke();
    }

    // Emotes above sheep.
    for (const b of bubbles.list) {
      if (b.anchor === "herder") continue;
      const s = world.sheep[b.anchor];
      if (!s) continue;
      drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T, b.text);
    }

    // Chimney smoke: a few soft puffs drifting up and to the right from each house.
    for (const hse of this.houses) {
      if (Math.abs(hse.x - cam.x) * T > W / 2 + T * 2 || Math.abs(hse.y - cam.y) * T > H / 2 + T * 2) continue;
      const seedish = (hse.x * 31 + hse.y * 17) % 1000;
      for (let k = 0; k < 3; k++) {
        const t = ((nowMs / 2600 + k / 3 + seedish / 1000) % 1);
        const px = sx(hse.x + 0.72) + t * T * 0.6 + Math.sin((t + k) * 6) * T * 0.05;
        const py = sy(hse.y + 0.12) - t * T * 0.9;
        ctx.fillStyle = `rgba(240, 240, 235, ${(0.45 * (1 - t)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, T * (0.06 + t * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Birds: a small flock crosses now and then, high above everything.
    {
      const period = 140_000;
      const phase = (nowMs % period) / period;
      if (phase < 0.22) {
        const t = phase / 0.22;
        const flockSeed = Math.floor(nowMs / period);
        const dir = flockSeed % 2 === 0 ? 1 : -1;
        const baseY = H * (0.15 + ((flockSeed * 37) % 60) / 100);
        const baseX = dir > 0 ? -T + t * (W + 2 * T) : W + T - t * (W + 2 * T);
        ctx.strokeStyle = "rgba(43,38,32,0.7)";
        ctx.lineWidth = Math.max(1, T * 0.035);
        for (let b = 0; b < 5; b++) {
          const bx = baseX - dir * b * T * 0.55 * (b % 2 ? 1 : 0.8);
          const by = baseY + Math.abs(b - 2) * T * 0.3 + Math.sin(nowMs / 90 + b) * T * 0.04;
          const flap = Math.sin(nowMs / 110 + b * 1.3) * T * 0.09;
          ctx.beginPath();
          ctx.moveTo(bx - T * 0.16, by + flap);
          ctx.lineTo(bx, by - T * 0.02);
          ctx.lineTo(bx + T * 0.16, by + flap);
          ctx.stroke();
        }
      }
    }

    // Village names on their signposts, when close enough to read.
    if (T >= 36) {
      ctx.font = `${Math.max(9, T * 0.22)}px "Fredoka", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      for (const v of this.map.villages) {
        if (Math.abs(v.x - cam.x) * T > W / 2 + T * 4 || Math.abs(v.y - cam.y) * T > H / 2 + T * 4) continue;
        const px = sx(v.x - 1 + 0.5);
        const py = sy(v.y + 1) + T * 0.28;
        ctx.fillStyle = "rgba(43,38,32,0.85)";
        ctx.fillText(v.name, px, py);
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
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

    // A warm band across the top of the sky at sunset.
    if (hourNow > 16.4 && hourNow < 18.6) {
      const k = Math.sin(((hourNow - 16.4) / 2.2) * Math.PI);
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.45);
      g.addColorStop(0, `rgba(255, 150, 80, ${(0.35 * k).toFixed(3)})`);
      g.addColorStop(1, "rgba(255, 150, 80, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.45);
    }

    // A rainbow for a minute after the rain stops.
    {
      const age = (nowMs - this.rainbowFromMs) / 60_000;
      if (age >= 0 && age < 1 && !isRaining(world)) {
        const alpha = age < 0.15 ? age / 0.15 : age > 0.7 ? (1 - age) / 0.3 : 1;
        const cx0 = W * 0.5;
        const cy0 = H * 1.05;
        const r0 = Math.min(W, H) * 0.75;
        const bands = ["#ff5a5a", "#ffa23c", "#ffe14c", "#6fd36f", "#5aa7ff", "#8a6cff"];
        ctx.lineWidth = Math.max(3, T * 0.12);
        bands.forEach((c, i) => {
          ctx.strokeStyle = c;
          ctx.globalAlpha = 0.28 * alpha;
          ctx.beginPath();
          ctx.arc(cx0, cy0, r0 - i * ctx.lineWidth, Math.PI * 1.08, Math.PI * 1.92);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
    }

    // Fireflies at dusk, drifting near the herder.
    if (hourNow > 17.3 && hourNow < 19.6) {
      const strength = Math.min(1, (hourNow - 17.3) / 0.6);
      for (let i = 0; i < 14; i++) {
        const a = nowMs / (2600 + i * 90) + i * 2.1;
        const px = sx(h.x + 0.5) + Math.cos(a) * T * (2 + (i % 5)) + Math.sin(a * 1.7) * T;
        const py = sy(h.y + 0.5) + Math.sin(a * 0.8) * T * (1.5 + (i % 4)) - T * 0.6;
        const blink = Math.max(0, Math.sin(nowMs / 400 + i * 1.9));
        ctx.fillStyle = `rgba(255, 240, 140, ${(blink * 0.12 * strength).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, T * 0.11), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 250, 200, ${(blink * strength).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.5, T * 0.06), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Fog: a soft white veil that thins toward the herder.
    if (isFoggy(world)) {
      const g = ctx.createRadialGradient(sx(h.x + 0.5), sy(h.y + 0.5), T * 3, sx(h.x + 0.5), sy(h.y + 0.5), Math.max(W, H) * 0.7);
      g.addColorStop(0, "rgba(235, 238, 240, 0.15)");
      g.addColorStop(1, "rgba(235, 238, 240, 0.78)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // Day tint over the world, under the bubble.
    const hour = this.hourOverride ?? dayHour(world);
    const tint = dayTint(hour);
    if (tint.a > 0.002) {
      ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a.toFixed(4)})`;
      ctx.fillRect(0, 0, W, H);
    }
    // A moon rises with the stars.
    if (hour > 18.4) {
      const a = Math.min(1, (hour - 18.4) / 1.0);
      const mx = W * 0.82;
      const my = H * (0.22 - a * 0.06);
      ctx.fillStyle = `rgba(255, 250, 225, ${(0.9 * a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(mx, my, T * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(60, 60, 110, ${(0.9 * a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(mx - T * 0.32, my - T * 0.12, T * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // Stars come out after half past six.
    if (hour > 18.5) {
      const a = Math.min(1, (hour - 18.5) / 1.2);
      ctx.fillStyle = `rgba(255, 250, 230, ${(0.85 * a).toFixed(3)})`;
      for (let i = 0; i < 90; i++) {
        const px = ((i * 7919) % 1000) / 1000 * W;
        const py = ((i * 104729) % 1000) / 1000 * H * 0.9;
        const tw = 0.6 + 0.4 * Math.sin(nowMs / 700 + i);
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, T * 0.035) * tw, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const line = bubbles.herderLine();
    if (line) {
      const fontPx = Math.max(14 * this.dpr, Math.min(T * 0.42, 30 * this.dpr));
      drawBubble(ctx, sx(h.x + 0.5), sy(h.y + 0.5) - T * 1.45, line.text, fontPx, { heat: line.heat, font: BUBBLE_FONT }, W, H);
    }
  }

  private drawHerder(world: WorldState, sx: (x: number) => number, sy: (y: number) => number, T: number, phase: number, nowMs: number): void {
    void walkingHerder;
    const h = world.herder;
    const walking = h.mode === "toSheep" || h.mode === "toPen";
    const reading = h.mode === "reading" && world.reading;
    const stomping = walking && world.frustration >= 80;
    const mishap = h.mode === "mishap" ? h.mishap : undefined;
    if (stomping) {
      // Little dust puffs kicked up behind him.
      const ctx = this.ctx;
      for (let k = 0; k < 3; k++) {
        const t = ((nowMs / 700 + k / 3) % 1);
        const back = h.facing === 0 ? -1 : h.facing === 2 ? 1 : 0;
        ctx.fillStyle = `rgba(150, 130, 100, ${(0.35 * (1 - t)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx(h.x + 0.5) + back * T * (0.25 + t * 0.5) + (k - 1) * T * 0.08, sy(h.y + 0.95) - t * T * 0.25, T * (0.05 + t * 0.09), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Mishap staging: sunk in the bog, hopping on one foot, a wasp circling.
    let mishapY = 0;
    if (mishap === "bog") mishapY = T * 0.35;
    const hop = mishap === "stub" || mishap === "nettles" || mishap === "cowpat" || mishap === "molehill" || mishap === "bite" ? Math.abs(Math.sin(nowMs / 140)) * T * 0.25 : 0;
    if (mishap === "wasp") {
      const a = nowMs / 180;
      drawEmote(this.ctx, sx(h.x + 0.5) + Math.cos(a) * T * 0.9, sy(h.y + 0.95) - T * 1.1 + Math.sin(a * 1.3) * T * 0.5, T * 0.7, "bzz");
    }
    if (mishap === "bog") {
      this.ctx.fillStyle = "rgba(90, 65, 40, 0.75)";
      this.ctx.beginPath();
      this.ctx.ellipse(sx(h.x + 0.5), sy(h.y + 0.95) - T * 0.05, T * 0.5, T * 0.18, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    if (mishap === "cowpat") {
      this.ctx.fillStyle = "#5a4520";
      this.ctx.beginPath();
      this.ctx.ellipse(sx(h.x + 0.5) - T * 0.1, sy(h.y + 0.95) + T * 0.05, T * 0.32, T * 0.12, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    drawHerder(this.ctx, sx(h.x + 0.5), sy(h.y + 0.95) + mishapY - hop, T, {
      facing: h.facing,
      walking,
      carrying: h.carrying >= 0,
      phase: walking ? (nowMs / (stomping ? 300 : 420)) % 1 : phase,
      fury: h.mode === "ranting" || mishap ? 1 : world.frustration / 100,
      ranting: h.mode === "ranting",
      resting: h.mode === "resting" || h.mode === "done",
      reading: !!reading,
      bookColour: reading ? BOOK_BY_ID.get(world.reading!.bookId)?.colour ?? "#c94f4f" : "#c94f4f",
    });
    if (h.carrying >= 0) {
      drawSheep(this.ctx, sx(h.x + 0.5), sy(h.y + 0.95) - T * 1.35 + mishapY - hop, T * 0.8, "carried", h.facing === 2 ? 0 : 2, phase, world.sheep[h.carrying]?.named ?? false);
    }
  }
}
