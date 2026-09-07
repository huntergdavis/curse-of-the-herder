import type { GameMap } from "../core/map/generate";
import type { WorldState } from "../core/sim/state";
import { seasonalTerrain } from "./palette";

/** A once-rendered thumbnail of the board plus live markers. */
export class Minimap {
  private base: HTMLCanvasElement;
  constructor(private map: GameMap, private px: number, season = "summer") {
    const colours = seasonalTerrain(season);
    this.base = document.createElement("canvas");
    this.base.width = px;
    this.base.height = px;
    const ctx = this.base.getContext("2d")!;
    const img = ctx.createImageData(px, px);
    const n = map.size;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const wx = Math.floor((x / px) * n);
        const wy = Math.floor((y / px) * n);
        const hex = colours[map.terrain[wy * n + wx]!]!;
        const v = parseInt(hex.slice(1), 16);
        const o = (y * px + x) * 4;
        img.data[o] = (v >> 16) & 255;
        img.data[o + 1] = (v >> 8) & 255;
        img.data[o + 2] = v & 255;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /** World coordinates for a point on the minimap canvas (CSS pixels relative to its box). */
  worldAt(target: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
    const r = target.getBoundingClientRect();
    const u = Math.max(0, Math.min(1, (clientX - r.left) / Math.max(1, r.width)));
    const v = Math.max(0, Math.min(1, (clientY - r.top) / Math.max(1, r.height)));
    return { x: u * this.map.size, y: v * this.map.size };
  }

  draw(target: HTMLCanvasElement, world: WorldState, view?: { x: number; y: number; w: number; h: number; looking: boolean }): void {
    const ctx = target.getContext("2d")!;
    const px = this.px;
    if (target.width !== px || target.height !== px) {
      target.width = px;
      target.height = px;
    }
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(this.base, 0, 0);
    const s = px / this.map.size;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, px, px);
    // Pen
    ctx.fillStyle = "#5a3b1e";
    ctx.fillRect(this.map.pen.x * s - 3, this.map.pen.y * s - 3, 6, 6);
    // Sheep seen (loose), penned are omitted
    for (const sh of world.sheep) {
      if (sh.mode !== "loose" || !sh.seen) continue;
      ctx.fillStyle = "#f6f2e6";
      ctx.beginPath();
      ctx.arc(sh.x * s, sh.y * s, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // Unread libraries
    for (const l of world.libraries) {
      if (l.taken) continue;
      ctx.fillStyle = "#ffd37a";
      ctx.fillRect(l.x * s - 1.5, l.y * s - 1.5, 3, 3);
    }
    // Herder
    ctx.fillStyle = "#ff5a3c";
    ctx.beginPath();
    ctx.arc(world.herder.x * s, world.herder.y * s, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fffdf5";
    ctx.lineWidth = 1;
    ctx.stroke();
    // The viewport: a reticle showing what the screen is looking at. Gold while a viewer is steering it.
    if (view) {
      const x0 = view.x * s - (view.w * s) / 2;
      const y0 = view.y * s - (view.h * s) / 2;
      const w = Math.max(8, view.w * s);
      const hh = Math.max(8, view.h * s);
      const tick = Math.min(6, w / 3);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.strokeRect(x0, y0, w, hh);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = view.looking ? "#ffd37a" : "#fffdf5";
      ctx.strokeRect(x0, y0, w, hh);
      // Corner ticks, so it reads as a reticle and not a stray box.
      ctx.beginPath();
      for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + hh, 1, -1], [x0 + w, y0 + hh, -1, -1]] as const) {
        ctx.moveTo(cx - dx * tick * 0.6, cy);
        ctx.lineTo(cx + dx * tick, cy);
        ctx.moveTo(cx, cy - dy * tick * 0.6);
        ctx.lineTo(cx, cy + dy * tick);
      }
      ctx.stroke();
    }
  }
}
