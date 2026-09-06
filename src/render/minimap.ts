import type { GameMap } from "../core/map/generate";
import type { WorldState } from "../core/sim/state";
import { TERRAIN_COLOR } from "./palette";

/** A once-rendered thumbnail of the board plus live markers. */
export class Minimap {
  private base: HTMLCanvasElement;
  constructor(private map: GameMap, private px: number) {
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
        const hex = TERRAIN_COLOR[map.terrain[wy * n + wx]!]!;
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

  draw(target: HTMLCanvasElement, world: WorldState): void {
    const ctx = target.getContext("2d")!;
    const px = this.px;
    target.width = px;
    target.height = px;
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
    // Herder
    ctx.fillStyle = "#ff5a3c";
    ctx.beginPath();
    ctx.arc(world.herder.x * s, world.herder.y * s, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fffdf5";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
