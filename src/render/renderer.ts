import type { GameMap } from "../core/map/generate";
import { dayHour, hoursElapsed, isFoggy, isRaining, isWindy, type WorldState } from "../core/sim/state";
import { erudition, levelFor } from "../core/progression";
import { BOOK_BY_ID } from "../data/books";
import { dogName, sheepName } from "../core/names";
import { Deco } from "../core/map/terrain";
import type { Bubbles } from "./bubbles";
import type { Camera } from "./camera";
import { CHUNK, ChunkCache } from "./chunks";
import { dayTint } from "./palette";
import { drawBubble, drawEmote, drawHerder, drawLooseHat, drawSheep, setShadowSkew } from "./sprites";
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
  private villagers: { x: number; y: number; shockedUntil: number; variant: number; line?: string; offences: number }[] = [];

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
      if (d === Deco.Well) this.villagers.push({ x: (i % n) + 1, y: Math.floor(i / n), shockedUntil: 0, variant: (i * 7) % 3, offences: 0 });
    }
  }

  private static VILLAGER_LINES = ["Language!", "Well I never.", "There are children!", "We heard that.", "Not in front of the well.", "Charming.", "My mother is in.", "Say it again, I am writing it down.", "The vicar is about!", "Honestly."];
  private static DOG_THOUGHTS = ["butterfly.", "stick?", "sheep? no.", "shade.", "is it lunch.", "good spot.", "bird.", "later.", "hm.", "nap."];

  /** A strong line was said at (x, y); villagers within earshot clutch their pearls. */
  scandalise(x: number, y: number, nowMs: number): void {
    for (const v of this.villagers) {
      if (Math.hypot(v.x - x, v.y - y) < 11) {
        v.shockedUntil = nowMs + 2600;
        v.offences++;
        // After the third time they fetch the broom.
        v.line = v.offences >= 3 ? (["OUT!", "Not here!", "I have a broom!", "Take it to the hill!"][v.offences % 4] ?? "OUT!") : Renderer.VILLAGER_LINES[(v.x * 7 + v.y * 13 + Math.floor(nowMs / 1000)) % Renderer.VILLAGER_LINES.length] ?? "Language!";
      }
    }
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
    else if (beat === 21 || beat === 22) drawEmote(ctx, px + T * 0.5, py - T * 0.75, T * 0.9, Renderer.DOG_THOUGHTS[Math.floor(nowMs / 29000) % Renderer.DOG_THOUGHTS.length] ?? "hm.");
  }

  private drawVillager(v: { x: number; y: number; shockedUntil: number; variant: number; line?: string; offences: number }, sx: (x: number) => number, sy: (y: number) => number, T: number, nowMs: number): void {
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
    if (shocked && v.offences >= 3) {
      // Broom raised and shaken.
      const shake = Math.sin(nowMs / 90) * T * 0.06;
      ctx.moveTo(px - T * 0.16, py - T * 0.55 - bob);
      ctx.lineTo(px - T * 0.22, py - T * 0.35 - bob);
      ctx.moveTo(px + T * 0.16, py - T * 0.55 - bob);
      ctx.lineTo(px + T * 0.3 + shake, py - T * 0.9 - bob);
      ctx.stroke();
      ctx.strokeStyle = "#8a6238";
      ctx.lineWidth = Math.max(1.5, T * 0.05);
      ctx.beginPath();
      ctx.moveTo(px + T * 0.3 + shake, py - T * 0.55 - bob);
      ctx.lineTo(px + T * 0.3 + shake, py - T * 1.25 - bob);
      ctx.stroke();
      ctx.fillStyle = "#d9b25a";
      ctx.beginPath();
      ctx.moveTo(px + T * 0.3 + shake, py - T * 0.55 - bob);
      ctx.lineTo(px + T * 0.18 + shake, py - T * 0.32 - bob);
      ctx.lineTo(px + T * 0.42 + shake, py - T * 0.32 - bob);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e8b98a";
      ctx.lineWidth = Math.max(2, T * 0.07);
      ctx.beginPath();
    } else if (shocked) {
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
    if (shocked) {
      // Hands over the mouth for the first second, then the reply.
      if (v.shockedUntil - nowMs > 1600 || !v.line) drawEmote(ctx, px + T * 0.3, py - T * 1.15, T, "!");
      else drawEmote(ctx, px + T * 0.5, py - T * 1.15, T * 1.1, v.line);
    } else if (waving) drawEmote(ctx, px + T * 0.3, py - T * 1.15, T, "hullo");
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
      this.chunks = new ChunkCache(this.map, this.chunkTilePx, visible + 8, this.season);
    }
    return this.chunks;
  }

  /** Fewer moving decorations for viewers who prefer reduced motion. */
  reducedMotion = false;
  /** Season of the current herder; changes the palette and the weather's look. */
  season = "summer";

  setSeason(season: string): void {
    if (season !== this.season) {
      this.season = season;
      this.chunks = null;
    }
  }
  /** Multiplier on bubble text for viewing from a distance. */
  fontScale = 1;
  highContrast = false;

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

  /** When the day ended, for the neighbour's last pass. */
  private finaleStartMs = -1;

  /** The sheepdog: follows him about, sits when he sits, helps with nothing. */
  private dog = { x: 0, y: 0, vx: 0, vy: 0, facing: 0, init: false, lastIdleMs: 0, reactUntil: 0, react: "" };

  /** The dog notices things, briefly. */
  dogReact(kind: "wasp" | "flee" | "bite" | "book", nowMs: number): void {
    this.dog.react = kind;
    this.dog.reactUntil = nowMs + (kind === "wasp" ? 3500 : 2200);
  }

  private shoutingNow = false;
  /** The wind took his hat: when, and where it went. */
  private hat = { lostAt: -1e9, dx: 0, dy: 0 };
  /** Seconds between hat-losing windows in wind (development: ?hat=1 shortens it). */
  hatPeriod = 170;
  /** Name on the wanted poster by the pen, if a sheep has broken out. */
  wanted: string | null = null;
  /** Called when the wind takes the hat, so the herder can have words. */
  onHatLost: (() => void) | null = null;
  /** Recently penned sheep, for the arrival hop and the neighbours' cheer. */
  private arrivals: { id: number; atMs: number }[] = [];
  /** The herder's signature word, drawn in colour when it appears in a bubble. */
  signatureWord = "";

  sheepPenned(id: number, nowMs: number): void {
    this.arrivals.push({ id, atMs: nowMs });
    if (this.arrivals.length > 8) this.arrivals.shift();
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
    this.shoutingNow = (bubbles.herderLine()?.heat ?? 0) > 0.7;
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
      const wet = this.season === "winter" ? 0 : isRaining(world) ? 1 : Math.max(0, 1 - sinceRain / 600);
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
          if (t === Terrain.Grass || t === Terrain.Meadow) {
            // Frogs sit by the water and croak now and then.
            if (((x * 31 + y * 17) % 41) !== 7 || this.map.deco[i] !== Deco.None) continue;
            const nearWater = [i - 1, i + 1, i - this.map.size, i + this.map.size].some((j) => this.map.terrain[j] === Terrain.Water);
            if (!nearWater) continue;
            const fx = sx(x + 0.5);
            const fy = sy(y + 0.6);
            ctx.fillStyle = "#4f8a3a";
            ctx.beginPath();
            ctx.ellipse(fx, fy, T * 0.13, T * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f4f1e6";
            ctx.beginPath();
            ctx.arc(fx - T * 0.06, fy - T * 0.07, T * 0.025, 0, Math.PI * 2);
            ctx.arc(fx + T * 0.06, fy - T * 0.07, T * 0.025, 0, Math.PI * 2);
            ctx.fill();
            if (Math.floor(nowMs / 1000 + x) % 17 === 0) drawEmote(ctx, fx + T * 0.25, fy - T * 0.4, T * 0.6, "ribbit");
            continue;
          }
          if (t === Terrain.Water && ((x * 41 + y * 67) % 131) === 9) {
            // A fish jumps now and then: a small arc and a splash ring.
            const cycle = (nowMs / 1000 + x) % 11;
            if (cycle < 0.8) {
              const k = cycle / 0.8;
              const fx = sx(x + 0.5) + (k - 0.5) * T * 0.5;
              const fy = sy(y + 0.5) - Math.sin(k * Math.PI) * T * 0.45;
              ctx.fillStyle = "#8fb9d9";
              ctx.beginPath();
              ctx.ellipse(fx, fy, T * 0.09, T * 0.045, (k - 0.5) * 1.6, 0, Math.PI * 2);
              ctx.fill();
            } else if (cycle < 1.8) {
              const r = (cycle - 0.8) / 1.0;
              ctx.strokeStyle = `rgba(255,255,255,${(0.5 * (1 - r)).toFixed(3)})`;
              ctx.lineWidth = Math.max(1, T * 0.03);
              ctx.beginPath();
              ctx.ellipse(sx(x + 0.5) + T * 0.25, sy(y + 0.5), T * (0.1 + r * 0.3), T * (0.05 + r * 0.14), 0, 0, Math.PI * 2);
              ctx.stroke();
            }
            continue;
          }
          if (this.map.deco[i] === Deco.Tuft && ((x * 19 + y * 23) % 29) === 5) {
            // Rabbits sit by the tufts and bolt when he comes near.
            const near = Math.hypot(x - h.x, y - h.y) < 3.5;
            if (near) continue;
            const rx = sx(x + 0.5) + T * 0.3;
            const ry = sy(y + 0.55);
            const twitch = Math.floor(nowMs / 400 + x) % 5 === 0 ? T * 0.01 : 0;
            ctx.fillStyle = "#a08868";
            ctx.beginPath();
            ctx.ellipse(rx, ry, T * 0.1, T * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(rx - T * 0.03, ry - T * 0.16 + twitch, T * 0.02, T * 0.07, -0.2, 0, Math.PI * 2);
            ctx.ellipse(rx + T * 0.03, ry - T * 0.16 - twitch, T * 0.02, T * 0.07, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f4f1e6";
            ctx.beginPath();
            ctx.arc(rx - T * 0.09, ry + T * 0.01, T * 0.025, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }
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
            // Two ducklings paddle behind, a little out of line.
            for (let k = 1; k <= 2; k++) {
              const a2 = a - k * 0.45;
              const qx = sx(x + 0.5 + Math.cos(a2) * 0.35);
              const qy = sy(y + 0.5 + Math.sin(a2) * 0.2 + Math.sin(nowMs / 300 + k) * 0.03);
              ctx.fillStyle = "#e0c060";
              ctx.beginPath();
              ctx.ellipse(qx, qy, T * 0.06, T * 0.045, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = Math.max(1, T * 0.02);
            ctx.beginPath();
            ctx.moveTo(px - T * 0.2, py + T * 0.12);
            ctx.lineTo(px - T * 0.45, py + T * 0.22);
            ctx.moveTo(px + T * 0.2, py + T * 0.12);
            ctx.lineTo(px + T * 0.45, py + T * 0.22);
            ctx.stroke();
          } else if (this.map.deco[i] === Deco.Flowers && hourNow < 17.5 && !this.reducedMotion && this.season !== "winter") {
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
      // At the end of the day the dog comes and lies down at his feet.
      const targetX = world.finished ? h.x + 0.9 : h.x - (h.facing === 0 ? 1.6 : h.facing === 2 ? -1.6 : 0.9);
      const targetY = world.finished ? h.y + 0.6 : h.y - (h.facing === 1 ? 1.4 : h.facing === 3 ? -1.4 : 0.3) + 0.5;
      let dist = Math.hypot(targetX - d.x, targetY - d.y);
      // When the herder stops, the dog notices flowers and drifts toward them, tail up.
      let chasing = false;
      // The neighbour's sheep are far more interesting than ours; the dog trots over and is ignored.
      if (world.rival && Math.abs(world.rival.x - h.x) < 9) {
        const r = world.rival;
        const back = r.dx > 0 ? -1 : 1;
        const bx = r.x + 0.5 + back * 4.3 + Math.sin(nowMs / 700) * 0.3;
        const by = r.y + 0.3;
        d.vx = (bx - d.x) * 0.05;
        d.vy = (by - d.y) * 0.05;
        d.x += d.vx;
        d.y += d.vy;
        if (Math.abs(d.vx) > 0.002) d.facing = d.vx > 0 ? 0 : 2;
        chasing = true;
        if (Math.floor(nowMs / 1000) % 9 === 7 && Math.hypot(bx - d.x, by - d.y) < 1) drawEmote(ctx, sx(d.x + 0.5) + T * 0.25, sy(d.y + 0.2), T * 0.7, "?");
      }
      if (!moving && !chasing) {
        const fx = Math.round(d.x);
        const fy = Math.round(d.y);
        for (let oy = -3; oy <= 3 && !chasing; oy++) for (let ox = -3; ox <= 3; ox++) {
          const i = (fy + oy) * this.map.size + (fx + ox);
          if (this.map.deco[i] === Deco.Flowers && Math.hypot(fx + ox - h.x, fy + oy - h.y) < 6) {
            const bx = fx + ox + Math.sin(nowMs / 900) * 0.4;
            const by = fy + oy + Math.cos(nowMs / 1100) * 0.3;
            d.vx = (bx - d.x) * 0.03;
            d.vy = (by - d.y) * 0.03;
            d.x += d.vx;
            d.y += d.vy;
            if (Math.abs(d.vx) > 0.002) d.facing = d.vx > 0 ? 0 : 2;
            chasing = true;
            break;
          }
        }
      }
      if (!chasing && (moving || dist > (world.finished ? 0.3 : 3))) {
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
        this.drawDog(sx(d.x + 0.5), sy(d.y + 0.9), T, d.facing, dogMoving || chasing, !moving && !dogMoving && !reacting && !chasing, nowMs);
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

    // Cloud shadows drift slowly across the land (not at night, not in fog, not in reduced motion).
    if (!this.reducedMotion && hourNow < 18 && !isFoggy(world)) {
      ctx.fillStyle = isRaining(world) ? "rgba(20, 30, 60, 0.10)" : "rgba(20, 40, 30, 0.07)";
      for (let i = 0; i < 4; i++) {
        const drift = (nowMs / 40000 + i * 0.37) % 1.3 - 0.15;
        const cxp = W * drift + Math.sin(i * 2.1) * W * 0.1;
        const cyp = H * ((i * 0.29 + 0.15) % 1) + Math.sin(nowMs / 23000 + i) * H * 0.05;
        ctx.beginPath();
        ctx.ellipse(cxp, cyp, T * (5 + (i % 3) * 2), T * (2.5 + (i % 2)), 0.2, 0, Math.PI * 2);
        ctx.ellipse(cxp + T * 3, cyp - T * 0.8, T * 3.5, T * 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Owls hoot from the trees after dark.
    if (hourNow > 18.4 && !this.reducedMotion) {
      const x0 = Math.max(0, Math.floor(cam.x - W / (2 * T)));
      const x1 = Math.min(this.map.size - 1, Math.ceil(cam.x + W / (2 * T)));
      const y0 = Math.max(0, Math.floor(cam.y - H / (2 * T)));
      const y1 = Math.min(this.map.size - 1, Math.ceil(cam.y + H / (2 * T)));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const i = y * this.map.size + x;
        if (this.map.deco[i] !== Deco.Tree || ((x * 53 + y * 29) % 37) !== 11) continue;
        const px = sx(x + 0.5);
        const py = sy(y + 0.3);
        ctx.fillStyle = "#5a4634";
        ctx.beginPath();
        ctx.ellipse(px, py, T * 0.09, T * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        const blink = Math.floor(nowMs / 700 + x) % 9 === 0;
        ctx.fillStyle = blink ? "#5a4634" : "#ffe27a";
        ctx.beginPath();
        ctx.arc(px - T * 0.035, py - T * 0.04, T * 0.028, 0, Math.PI * 2);
        ctx.arc(px + T * 0.035, py - T * 0.04, T * 0.028, 0, Math.PI * 2);
        ctx.fill();
        if (Math.floor(nowMs / 1000 + x * 3) % 19 === 0) drawEmote(ctx, px + T * 0.25, py - T * 0.4, T * 0.6, "hoo");
      }
    }

    // A hedgehog trundles along the road at dusk, near enough to notice.
    if (hourNow > 16.8 && hourNow < 19 && !this.reducedMotion) {
      const period = 90_000;
      const ph = (nowMs % period) / period;
      if (ph < 0.25) {
        // Find a road tile near the herder to walk along.
        const ry = Math.round(h.y) + 3;
        let rx = -1;
        for (let dx = -8; dx <= 8 && rx < 0; dx++) {
          const x = Math.round(h.x) + dx;
          const i = ry * this.map.size + x;
          if (i >= 0 && i < this.map.size * this.map.size && (this.map.terrain[i] === Terrain.Road || this.map.terrain[i] === Terrain.Grass)) rx = x;
        }
        if (rx >= 0) {
          const t = ph / 0.25;
          const px = sx(rx - 4 + t * 8 + 0.5);
          const py = sy(ry + 0.7);
          ctx.fillStyle = "#5a4634";
          ctx.beginPath();
          ctx.ellipse(px, py, T * 0.16, T * 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a2a1c";
          ctx.lineWidth = Math.max(1, T * 0.025);
          ctx.beginPath();
          for (let k = -3; k <= 3; k++) {
            ctx.moveTo(px + k * T * 0.04, py - T * 0.06);
            ctx.lineTo(px + k * T * 0.05, py - T * 0.15 - Math.abs(k) * T * 0.005);
          }
          ctx.stroke();
          ctx.fillStyle = "#3a2a1c";
          ctx.beginPath();
          ctx.arc(px + T * 0.17, py + T * 0.01, T * 0.03, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Hay in a corner of the pen, and a water trough.
    {
      const bx = sx(this.map.pen.x - 1 + 0.5);
      const by = sy(this.map.pen.y - 1 + 0.5);
      if (Math.abs(this.map.pen.x - cam.x) * T < W && Math.abs(this.map.pen.y - cam.y) * T < H) {
        ctx.fillStyle = "#d9b25a";
        ctx.strokeStyle = "#2b2620";
        ctx.lineWidth = Math.max(1, T * 0.04);
        ctx.beginPath();
        ctx.roundRect(bx - T * 0.35, by - T * 0.3, T * 0.5, T * 0.32, T * 0.05);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(120, 90, 30, 0.6)";
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          ctx.moveTo(bx - T * 0.3 + k * T * 0.12, by - T * 0.28);
          ctx.lineTo(bx - T * 0.27 + k * T * 0.12, by - T * 0.02);
        }
        ctx.stroke();
        const tx = sx(this.map.pen.x + 1 + 0.5);
        const ty = sy(this.map.pen.y + 1 + 0.5);
        ctx.fillStyle = "#8a6238";
        ctx.strokeStyle = "#2b2620";
        ctx.beginPath();
        ctx.roundRect(tx - T * 0.3, ty - T * 0.12, T * 0.6, T * 0.24, T * 0.04);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#4f8fc9";
        ctx.fillRect(tx - T * 0.26, ty - T * 0.08, T * 0.52, T * 0.12);
      }
    }

    // A wanted poster on the fence once a sheep has broken out.
    if (this.wanted && Math.abs(this.map.pen.x - cam.x) * T < W && Math.abs(this.map.pen.y - cam.y) * T < H) {
      const px = sx(this.map.pen.x + 2 + 0.5) + T * 0.3;
      const py = sy(this.map.pen.y - 1 + 0.5) - T * 0.35;
      ctx.fillStyle = "#f4e9c8";
      ctx.strokeStyle = "#2b2620";
      ctx.lineWidth = Math.max(1, T * 0.03);
      ctx.beginPath();
      ctx.rect(px, py, T * 0.62, T * 0.5);
      ctx.fill();
      ctx.stroke();
      if (T >= 36) {
        ctx.fillStyle = "#2b2620";
        ctx.font = `bold ${Math.max(7, T * 0.11)}px "Fredoka", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("WANTED", px + T * 0.31, py + T * 0.14);
        ctx.font = `${Math.max(7, T * 0.1)}px "Patrick Hand", cursive`;
        ctx.fillText(this.wanted, px + T * 0.31, py + T * 0.42);
        ctx.textAlign = "left";
      }
      drawSheep(ctx, px + T * 0.31, py + T * 0.27, T * 0.28, "idle", 0, 0, false);
    }

    // The pen gate swings open as he arrives with a sheep.
    if (h.carrying >= 0 && Math.hypot(h.x - this.map.pen.x, h.y - (this.map.pen.y + 2)) < 3) {
      const gx = sx(this.map.pen.x + 0.5);
      const gy = sy(this.map.pen.y + 2 + 0.5);
      const open = Math.min(1, (3 - Math.hypot(h.x - this.map.pen.x, h.y - (this.map.pen.y + 2))) / 1.5);
      ctx.strokeStyle = "#6b4a2b";
      ctx.lineWidth = Math.max(1.5, T * 0.1);
      ctx.beginPath();
      const ang = open * 1.1;
      ctx.moveTo(gx - T * 0.5, gy);
      ctx.lineTo(gx - T * 0.5 + Math.cos(ang) * T, gy + Math.sin(ang) * T * 0.6);
      ctx.moveTo(gx - T * 0.5, gy + T * 0.18);
      ctx.lineTo(gx - T * 0.5 + Math.cos(ang) * T, gy + T * 0.18 + Math.sin(ang) * T * 0.6);
      ctx.stroke();
    }

    // Seasonal touches: snowmen by the wells in winter, drifting leaves in autumn.
    if (this.season === "winter") {
      for (const v of this.map.villages) {
        if (Math.abs(v.x - cam.x) * T > W / 2 + T * 3 || Math.abs(v.y - cam.y) * T > H / 2 + T * 3) continue;
        const px = sx(v.x + 2 + 0.5);
        const py = sy(v.y - 2 + 0.9);
        ctx.fillStyle = "#f4f6f8";
        ctx.strokeStyle = "#2b2620";
        ctx.lineWidth = Math.max(1, T * 0.04);
        for (const [r, dy] of [[0.28, 0], [0.2, 0.42], [0.14, 0.72]] as const) {
          ctx.beginPath();
          ctx.arc(px, py - T * dy, T * r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = "#e0782b";
        ctx.beginPath();
        ctx.moveTo(px + T * 0.06, py - T * 0.72);
        ctx.lineTo(px + T * 0.3, py - T * 0.7);
        ctx.lineTo(px + T * 0.06, py - T * 0.66);
        ctx.fill();
        ctx.fillStyle = "#2b2620";
        ctx.beginPath();
        ctx.arc(px - T * 0.04, py - T * 0.76, T * 0.02, 0, Math.PI * 2);
        ctx.arc(px + T * 0.02, py - T * 0.77, T * 0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(px - T * 0.16, py - T * 0.92, T * 0.32, T * 0.05);
        ctx.fillRect(px - T * 0.1, py - T * 1.12, T * 0.2, T * 0.22);
      }
    }
    if (this.season === "autumn" && !this.reducedMotion && !isWindy(world)) {
      const cols = ["rgba(217, 130, 43, 0.8)", "rgba(201, 80, 47, 0.8)", "rgba(224, 179, 60, 0.8)"];
      for (let i = 0; i < 10; i++) {
        const t = ((nowMs / 9000) + i * 0.1) % 1;
        const x = (((i * 7919) % 1000) / 1000) * W + Math.sin(t * Math.PI * 4 + i) * T * 0.8;
        const y = t * (H + T) - T * 0.5;
        ctx.fillStyle = cols[i % 3]!;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 12 + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, T * 0.08, T * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
      const grazing = !moving && s.mode !== "carried" && Math.floor(nowMs / 1000 + s.id * 5) % 9 < 4;
      const pose = s.mode === "penned" ? (world.finished ? "asleep" : grazing ? "graze" : "idle") : moving ? "walk" : s.temper === "dozy" && s.mode === "loose" ? "asleep" : grazing && !s.absurd ? "graze" : "idle";
      const facing = moving ? (s.tx < s.x ? 2 : 0) : s.x < h.x ? 0 : 2;
      const walkPhase = moving && s.speed > 2 ? (nowMs / 160) % 1 : (nowMs / 500 + s.id * 0.13) % 1;
      // Spring: some sheep have a lamb at heel.
      if (this.season === "spring" && s.id % 5 === 0 && s.mode !== "carried") {
        const lx = sx(s.x + 0.5) - T * 0.45;
        const ly = sy(s.y + 0.5) + T * 0.12 + (s.mode === "loose" ? Math.abs(Math.sin(nowMs / 250 + s.id)) * -T * 0.06 : 0);
        drawSheep(ctx, lx, ly, T * 0.45, s.mode === "penned" && world.finished ? "asleep" : "idle", s.x < h.x ? 0 : 2, (nowMs / 500) % 1, false);
      }
      // A newly penned sheep hops for a second; its neighbours in the pen cheer.
      const arrival = this.arrivals.find((a) => a.id === s.id && nowMs - a.atMs < 1200);
      const hopY = arrival ? -Math.abs(Math.sin(((nowMs - arrival.atMs) / 1200) * Math.PI * 3)) * T * 0.25 : 0;
      const cheer = s.mode === "penned" && !arrival && this.arrivals.some((a) => nowMs - a.atMs < 1500) && s.id % 3 === Math.floor(nowMs / 500) % 3;
      if (cheer) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "!");
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
      const huddle = this.season === "winter" && s.mode === "penned" ? 0.3 : 0;
      drawSheep(ctx, sx(s.x + 0.5 + (this.map.pen.x - s.x) * huddle), sy(s.y + (s.onRoof ? 0.12 : s.inRiver ? 0.6 : s.onBoulder && s.mode === "loose" ? 0.25 : 0.5) + (this.map.pen.y - s.y) * huddle) + hopY, T * (s.onRoof ? 0.75 : s.inRiver ? 0.8 : 0.9), s.inRiver && s.mode === "loose" ? "asleep" : pose, facing, walkPhase, s.named, s.flees >= 3, !!s.black);
      if (s.named && s.mode === "loose" && T >= 32) {
        ctx.font = `${Math.max(9, T * 0.2)}px "Fredoka", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(43,38,32,0.8)";
        ctx.fillText(sheepName(world.seed, s.id) + (s.escapee ? " (again)" : ""), sx(s.x + 0.5), sy(s.y + 0.5) + T * 0.62);
        ctx.textAlign = "left";
      }
      // Two loose sheep standing near each other gossip.
      if (s.mode === "loose" && !s.absurd && Math.floor(nowMs / 1000) % 13 === 4) {
        const buddy = world.sheep.find((o) => o.id !== s.id && o.mode === "loose" && Math.hypot(o.x - s.x, o.y - s.y) < 2.2);
        if (buddy && s.id < buddy.id) {
          drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "…");
          drawEmote(ctx, sx(buddy.x + 0.5) + T * 0.3, sy(buddy.y) - T * 0.35, T * 0.8, "baa");
        }
      }
      // Stranded sheep look faintly puzzled about it, now and then; the others bleat occasionally.
      if (s.mode === "loose" && s.absurd && Math.floor(nowMs / 1000 + s.id) % 7 < 2) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T, "?");
      else if (s.mode === "loose" && s.temper === "dozy" && Math.floor(nowMs / 1000 + s.id) % 5 < 2) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "z");
      else if (s.mode !== "carried" && !world.finished && Math.floor(nowMs / 1000 + s.id * 7) % 23 === 0) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T, (s.id * 13 + Math.floor(nowMs / 23000)) % 9 === 0 ? "achoo" : "baa");
      // At night one or two sheep snore at a time, gently.
      else if (world.finished && s.mode === "penned" && s.id % 20 === Math.floor(nowMs / 6000) % 20) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "z");
      // The plotter whispers to its neighbours before the jailbreak; the herder is elsewhere and hears nothing.
      else if (world.jailbreakPlan && s.mode === "penned") {
        const plotter = world.jailbreakPlan.sheepId === s.id;
        const beat = Math.floor(nowMs / 900) % 4;
        if (plotter && beat < 2) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.75, beat === 0 ? "psst" : "…");
        else if (!plotter && beat === 3 && s.id % 7 === Math.floor(nowMs / 3600) % 7) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.7, "?");
      }
      // One penned sheep at a time gives him a look when he passes empty-handed.
      else if (s.mode === "penned" && h.carrying < 0 && !world.finished && Math.hypot(h.x - this.map.pen.x, h.y - this.map.pen.y) < 7 && s.id % 12 === Math.floor(nowMs / 4000) % 12) drawEmote(ctx, sx(s.x + 0.5) + T * 0.3, sy(s.y) - T * 0.35, T * 0.8, "…");
    }
    if (!herderDrawn) this.drawHerder(world, sx, sy, T, phase, nowMs);

    // The neighbour and his three well-behaved sheep, strolling past.
    // At the end of the day he passes once more, in the dusk, and for once he is the one looking.
    if (world.finished && this.finaleStartMs < 0) this.finaleStartMs = nowMs;
    const finaleT = world.finished ? (nowMs - this.finaleStartMs - 4000) / 26000 : -1;
    const finaleRival = finaleT >= 0 && finaleT <= 1 ? { x: h.x - 12 + finaleT * 24, y: h.y + 3.5, dx: 0.11, finale: true } : undefined;
    const rivalNow = world.rival ?? finaleRival;
    if (rivalNow) {
      const r = rivalNow;
      const facing: 0 | 2 = r.dx > 0 ? 0 : 2;
      const back = r.dx > 0 ? -1 : 1;
      for (let k = 3; k >= 1; k--) drawSheep(ctx, sx(r.x + 0.5 + back * k * 1.15), sy(r.y + 0.5), T * 0.85, "walk", facing, phase + k * 0.7, false, false, false);
      drawHerder(ctx, sx(r.x + 0.5), sy(r.y + 0.95), T, { facing, walking: true, carrying: false, phase, fury: 0, resting: false, coat: "#4a6a8a" });
      const beat = Math.floor(nowMs / 1000) % 9;
      if ("finale" in r) {
        if (Math.abs(r.x - h.x) < 3) drawEmote(ctx, sx(r.x + 0.5) + T * 0.35, sy(r.y) - T * 0.45, T * 0.85, "sixty?");
      } else if (beat < 2) drawEmote(ctx, sx(r.x + 0.5) + T * 0.35, sy(r.y) - T * 0.45, T * 0.85, "hullo!");
      else if (beat === 5) drawEmote(ctx, sx(r.x + 0.5 + back * 1.15) + T * 0.3, sy(r.y) - T * 0.2, T * 0.7, "baa");
    }

    // Summer afternoons: a "phew" now and then.
    if (this.season === "summer" && hourNow > 12 && hourNow < 16 && Math.floor(nowMs / 1000) % 23 === 5) drawEmote(ctx, sx(h.x + 0.5) + T * 0.45, sy(h.y + 0.95) - T * 1.7, T * 0.8, "phew");
    // In a wind, every few minutes, the hat goes. It tumbles off downwind and reappears on his head a little later.
    const hatGone = nowMs - this.hat.lostAt < 6500;
    if (isWindy(world) && !hatGone && !world.finished && Math.floor(nowMs / 1000) % this.hatPeriod === 7 && (nowMs % 1000) < 40) {
      this.hat.lostAt = nowMs;
      this.hat.dx = 0;
      this.hat.dy = 0;
      this.onHatLost?.();
    }
    if (hatGone) {
      const t = (nowMs - this.hat.lostAt) / 6500;
      const dist = Math.min(1, t * 1.6) * T * 4.5;
      const hx0 = sx(h.x + 0.5) + dist;
      const hy0 = sy(h.y + 0.95) - T * 1.3 + Math.sin(t * Math.PI * 5) * T * 0.4 + t * T * 1.2;
      if (t < 0.75) drawLooseHat(ctx, hx0, hy0, T, t * 14);
      if (t > 0.1 && t < 0.4 && Math.floor(nowMs / 400) % 2 === 0) drawEmote(ctx, sx(h.x + 0.5) + T * 0.45, sy(h.y + 0.95) - T * 1.7, T * 0.8, "hat!");
    }
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

    // Washing lines between neighbouring houses; the cloths flap harder in the wind.
    {
      const windy = isWindy(world);
      for (let a = 0; a < this.houses.length; a++) {
        const h1 = this.houses[a]!;
        if (Math.abs(h1.x - cam.x) * T > W / 2 + T * 4 || Math.abs(h1.y - cam.y) * T > H / 2 + T * 4) continue;
        const h2 = this.houses.find((o) => o.y === h1.y && o.x - h1.x === 4);
        if (!h2) continue;
        const x1 = sx(h1.x + 0.9);
        const x2 = sx(h2.x + 0.1);
        const y = sy(h1.y + 0.55);
        ctx.strokeStyle = "#5a4634";
        ctx.lineWidth = Math.max(1, T * 0.025);
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.quadraticCurveTo((x1 + x2) / 2, y + T * 0.12, x2, y);
        ctx.stroke();
        const cols = ["#f4f1e6", "#c97c7c", "#7f9bd1", "#e0b33c"];
        for (let k = 0; k < 3; k++) {
          const t = 0.25 + k * 0.25;
          const cx0 = x1 + (x2 - x1) * t;
          const cy0 = y + T * 0.1 * Math.sin(Math.PI * t);
          const flap = Math.sin(nowMs / (windy ? 90 : 500) + k * 1.7) * T * (windy ? 0.14 : 0.03);
          ctx.fillStyle = cols[(k + a) % 4]!;
          ctx.beginPath();
          ctx.moveTo(cx0 - T * 0.09, cy0);
          ctx.lineTo(cx0 + T * 0.09, cy0);
          ctx.lineTo(cx0 + T * 0.09 + flap, cy0 + T * 0.22);
          ctx.lineTo(cx0 - T * 0.09 + flap, cy0 + T * 0.22);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // A cat on one roof per village, tail swaying, watching everything and helping with none of it.
    for (const v of this.map.villages) {
      if (Math.abs(v.x - cam.x) * T > W / 2 + T * 4 || Math.abs(v.y - cam.y) * T > H / 2 + T * 4) continue;
      const roof = this.houses.find((o) => Math.abs(o.x - v.x) <= 3 && Math.abs(o.y - v.y) <= 3);
      if (!roof) continue;
      const cxp = sx(roof.x + 0.62);
      const cyp = sy(roof.y + 0.3);
      ctx.fillStyle = "#3a3532";
      ctx.beginPath();
      ctx.ellipse(cxp, cyp, T * 0.11, T * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cxp + T * 0.1, cyp - T * 0.05, T * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cxp + T * 0.06, cyp - T * 0.09);
      ctx.lineTo(cxp + T * 0.08, cyp - T * 0.15);
      ctx.lineTo(cxp + T * 0.1, cyp - T * 0.09);
      ctx.moveTo(cxp + T * 0.11, cyp - T * 0.09);
      ctx.lineTo(cxp + T * 0.13, cyp - T * 0.15);
      ctx.lineTo(cxp + T * 0.15, cyp - T * 0.09);
      ctx.fill();
      ctx.strokeStyle = "#3a3532";
      ctx.lineWidth = Math.max(1, T * 0.03);
      ctx.beginPath();
      ctx.moveTo(cxp - T * 0.1, cyp);
      ctx.quadraticCurveTo(cxp - T * 0.2, cyp - T * 0.1 + Math.sin(nowMs / 600 + v.x) * T * 0.06, cxp - T * 0.22, cyp - T * 0.02);
      ctx.stroke();
      ctx.fillStyle = "#e0b33c";
      ctx.beginPath();
      ctx.arc(cxp + T * 0.08, cyp - T * 0.06, T * 0.012, 0, Math.PI * 2);
      ctx.arc(cxp + T * 0.12, cyp - T * 0.06, T * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }

    // The village bell at noon and at six: a "dong" over the well for a minute.
    {
      const minute = (hourNow % 1) * 60;
      if ((Math.floor(hourNow) === 12 || Math.floor(hourNow) === 18) && minute < 1.2) {
        for (const v of this.map.villages) {
          if (Math.abs(v.x - cam.x) * T > W / 2 + T * 2 || Math.abs(v.y - cam.y) * T > H / 2 + T * 2) continue;
          if (Math.floor(nowMs / 1000) % 3 === 0) drawEmote(ctx, sx(v.x + 0.5) + T * 0.4, sy(v.y) - T * 0.6, T * 0.9, "dong");
        }
      }
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

    // Bats after dark: quick, jittery, low over the trees.
    if (!this.reducedMotion && hourNow > 18.3) {
      for (let i = 0; i < 4; i++) {
        const a = nowMs / (700 + i * 90) + i * 1.9;
        const bx = W * (0.3 + 0.4 * ((i * 0.31 + nowMs / 40000) % 1)) + Math.sin(a * 1.3) * T * 2;
        const by = H * 0.25 + Math.sin(a) * T * 1.5 + Math.cos(a * 2.3) * T * 0.6;
        const flap = Math.sin(nowMs / 60 + i) * T * 0.1;
        ctx.strokeStyle = "rgba(20, 18, 30, 0.85)";
        ctx.lineWidth = Math.max(1, T * 0.04);
        ctx.beginPath();
        ctx.moveTo(bx - T * 0.14, by + flap);
        ctx.quadraticCurveTo(bx - T * 0.07, by - T * 0.05, bx, by);
        ctx.quadraticCurveTo(bx + T * 0.07, by - T * 0.05, bx + T * 0.14, by + flap);
        ctx.stroke();
      }
    }
    // Birds: a small flock crosses now and then, high above everything (by day).
    if (!this.reducedMotion && hourNow <= 18.3) {
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

    // Winter: rain falls as snow, slow and drifting.
    if (isRaining(world) && this.season === "winter") {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const flakes = Math.floor((W * H) / (T * T) * 0.25);
      const t = nowMs / 1000;
      for (let i = 0; i < flakes; i++) {
        const seedX = (i * 7919) % 10007;
        const seedY = (i * 104729) % 10009;
        const x = ((seedX / 10007) * W + Math.sin(t * 0.7 + i) * T * 0.6) % W;
        const y = ((seedY / 10009) * H + t * T * 1.2 + i) % H;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, T * 0.035) * (0.7 + ((i * 13) % 7) / 10), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(230, 235, 245, 0.12)";
      ctx.fillRect(0, 0, W, H);
    }
    // Breath in the cold: little puffs from the herder every couple of seconds.
    if (this.season === "winter" && !world.finished) {
      const ph = (nowMs % 2600) / 2600;
      if (ph < 0.5) {
        const dir = h.facing === 2 ? -1 : 1;
        ctx.fillStyle = `rgba(255,255,255,${(0.45 * (1 - ph * 2)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx(h.x + 0.5) + dir * T * (0.25 + ph * 0.5), sy(h.y + 0.95) - T * 1.05 - ph * T * 0.3, T * (0.06 + ph * 0.14), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rain: diagonal streaks, deterministic per frame bucket so they scroll.
    if (isRaining(world) && this.season !== "winter") {
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
      if (age >= 0 && age < 1 && !isRaining(world) && hourNow < 17.4) {
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
    if (hourNow > 17.3 && hourNow < 19.6 && !this.reducedMotion) {
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

    // Wind: leaves and petals stream across the screen.
    if (isWindy(world) && !this.reducedMotion) {
      const dir = 1;
      for (let i = 0; i < 26; i++) {
        const speed = 0.9 + (i % 5) * 0.25;
        const px = ((i * 7919) % 1000) / 1000 * W + ((nowMs * speed * 0.35 * dir) % (W + T * 2)) - T;
        const py = ((i * 104729) % 1000) / 1000 * H + Math.sin(nowMs / 400 + i) * T * 0.4;
        const x = ((px % (W + T * 2)) + W + T * 2) % (W + T * 2) - T;
        ctx.fillStyle = i % 3 === 0 ? "rgba(240, 170, 90, 0.7)" : i % 3 === 1 ? "rgba(120, 170, 70, 0.7)" : "rgba(244, 200, 220, 0.75)";
        ctx.save();
        ctx.translate(x, py);
        ctx.rotate(nowMs / 150 + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, T * 0.09, T * 0.045, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
    // A shooting star, now and then, once it is properly dark.
    if (hour > 18.8 && !this.reducedMotion) {
      const period = 23000;
      const ph = (nowMs % period) / period;
      if (ph < 0.06) {
        const k = Math.floor(nowMs / period);
        const x0 = W * (0.2 + ((k * 37) % 60) / 100);
        const y0 = H * (0.08 + ((k * 53) % 25) / 100);
        const t = ph / 0.06;
        const x = x0 + t * T * 6;
        const y = y0 + t * T * 2.2;
        const g = ctx.createLinearGradient(x - T * 1.4, y - T * 0.5, x, y);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, `rgba(255,255,240,${(0.9 * (1 - t)).toFixed(3)})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.max(1, T * 0.04);
        ctx.beginPath();
        ctx.moveTo(x - T * 1.4, y - T * 0.5);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
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
      const fontPx = Math.max(14 * this.dpr, Math.min(T * 0.42, 30 * this.dpr)) * this.fontScale;
      drawBubble(ctx, sx(h.x + 0.5), sy(h.y + 0.5) - T * 1.45, line.text, fontPx, { heat: line.heat, font: BUBBLE_FONT, highContrast: this.highContrast, highlight: this.signatureWord }, W, H);
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
    const nearMemorial = !!this.memorial && !world.finished && h.carrying < 0 && Math.hypot(h.x - (this.map.pen.x - 2.7), h.y - (this.map.pen.y + 0.9)) < 2.2;
    if (mishap === "cowpat") {
      this.ctx.fillStyle = "#5a4520";
      this.ctx.beginPath();
      this.ctx.ellipse(sx(h.x + 0.5) - T * 0.1, sy(h.y + 0.95) + T * 0.05, T * 0.32, T * 0.12, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    const lunching = h.mode === "resting" && world.hadLunch && dayHour(world) >= 12.5 && dayHour(world) < 13.2 && !world.finished;
    if (lunching) {
      // A heel of bread and a wedge of cheese on a cloth beside him.
      const bx = sx(h.x + 0.5) + T * 0.55;
      const by = sy(h.y + 0.95) - T * 0.05;
      this.ctx.fillStyle = "#f4f1e6";
      this.ctx.fillRect(bx - T * 0.22, by - T * 0.12, T * 0.44, T * 0.16);
      this.ctx.fillStyle = "#c9944a";
      this.ctx.beginPath();
      this.ctx.ellipse(bx - T * 0.08, by - T * 0.06, T * 0.12, T * 0.07, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = "#f2d16b";
      this.ctx.beginPath();
      this.ctx.moveTo(bx + T * 0.04, by - T * 0.02);
      this.ctx.lineTo(bx + T * 0.2, by - T * 0.02);
      this.ctx.lineTo(bx + T * 0.12, by - T * 0.14);
      this.ctx.closePath();
      this.ctx.fill();
    }
    drawHerder(this.ctx, sx(h.x + 0.5), sy(h.y + 0.95) + mishapY - hop, T, {
      facing: h.facing,
      walking,
      carrying: h.carrying >= 0,
      phase: walking ? (nowMs / (stomping ? 300 : 420)) % 1 : phase,
      fury: h.mode === "ranting" || mishap ? 1 : world.frustration / 100,
      ranting: h.mode === "ranting" || nearMemorial,
      crookBroken: world.crookBroken,
      windy: isWindy(world) && h.carrying < 0 && !reading,
      level: levelFor(erudition(world.booksRead, world.sheepPenned, hoursElapsed(world))),
      shouting: this.shoutingNow,
      winter: this.season === "winter",
      hatless: nowMs - this.hat.lostAt < 6500 && (nowMs - this.hat.lostAt) / 6500 < 0.85,
      tired: Math.max(0, Math.min(1, (dayHour(world) - 14) / 4)),
      lantern: (this.hourOverride ?? dayHour(world)) > 17.9,
      resting: h.mode === "resting" || h.mode === "done",
      reading: !!reading,
      bookColour: reading ? BOOK_BY_ID.get(world.reading!.bookId)?.colour ?? "#c94f4f" : "#c94f4f",
    });
    if (h.carrying >= 0) {
      drawSheep(this.ctx, sx(h.x + 0.5), sy(h.y + 0.95) - T * 1.35 + mishapY - hop, T * 0.8, "carried", h.facing === 2 ? 0 : 2, phase, world.sheep[h.carrying]?.named ?? false, false, !!world.sheep[h.carrying]?.black);
    }
  }
}
