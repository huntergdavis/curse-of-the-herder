import { INK } from "./palette";

type Ctx = CanvasRenderingContext2D;

export type SheepPose = "idle" | "walk" | "carried" | "asleep" | "fled";

/** Draw a sheep centred at (x, y) with body width ~T. `phase` 0..1 animates. */
export function drawSheep(ctx: Ctx, x: number, y: number, T: number, pose: SheepPose, facing: number, phase: number, named: boolean): void {
  const flip = facing === 2 ? -1 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip, 1);
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.strokeStyle = INK;
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, T * 0.32, T * 0.36, T * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  const bob = pose === "walk" ? Math.sin(phase * Math.PI * 2) * T * 0.04 : 0;
  // Legs
  ctx.strokeStyle = "#3a2f2a";
  ctx.lineWidth = Math.max(1.5, T * 0.08);
  const legSwing = pose === "walk" ? Math.sin(phase * Math.PI * 2) * T * 0.08 : 0;
  ctx.beginPath();
  for (const [lx, s] of [[-0.18, 1], [0.18, -1], [-0.08, -1], [0.08, 1]] as const) {
    ctx.moveTo(lx * T, T * 0.12 + bob);
    ctx.lineTo(lx * T + legSwing * s, T * 0.32);
  }
  ctx.stroke();
  // Body (a cloud)
  ctx.fillStyle = pose === "asleep" ? "#e9e4d3" : "#f6f2e6";
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.beginPath();
  ctx.ellipse(0, bob, T * 0.36, T * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (const [bx, by, br] of [[-0.22, -0.12, 0.14], [0.0, -0.2, 0.15], [0.22, -0.1, 0.13], [-0.1, 0.1, 0.12], [0.14, 0.1, 0.12]] as const) {
    ctx.beginPath();
    ctx.arc(bx * T, by * T + bob, br * T, 0, Math.PI * 2);
    ctx.fill();
  }
  // Head
  ctx.fillStyle = "#3a2f2a";
  ctx.beginPath();
  ctx.ellipse(T * 0.36, -T * 0.02 + bob, T * 0.16, T * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Ear
  ctx.beginPath();
  ctx.ellipse(T * 0.3, -T * 0.14 + bob, T * 0.08, T * 0.04, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Eye
  if (pose === "asleep") {
    ctx.strokeStyle = "#f6f2e6";
    ctx.beginPath();
    ctx.moveTo(T * 0.36, -T * 0.04 + bob);
    ctx.lineTo(T * 0.44, -T * 0.04 + bob);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#f6f2e6";
    ctx.beginPath();
    ctx.arc(T * 0.4, -T * 0.05 + bob, T * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(T * 0.415, -T * 0.05 + bob, T * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
  if (named) {
    // A little red ribbon: this one has a name and a reputation.
    ctx.fillStyle = "#c94f4f";
    ctx.beginPath();
    ctx.moveTo(T * 0.24, -T * 0.2 + bob);
    ctx.lineTo(T * 0.34, -T * 0.3 + bob);
    ctx.lineTo(T * 0.3, -T * 0.16 + bob);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export interface HerderPose {
  facing: 0 | 1 | 2 | 3;
  walking: boolean;
  carrying: boolean;
  phase: number;
  /** 0..1, raises arms / tilts hat as he loses it. */
  fury: number;
  resting: boolean;
  /** Sitting with a book. */
  reading?: boolean;
  bookColour?: string;
}

/** Draw the herder with feet at (x, y). Height ~1.4 T. */
export function drawHerder(ctx: Ctx, x: number, y: number, T: number, p: HerderPose): void {
  const flip = p.facing === 2 ? -1 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip, 1);
  if (p.reading || p.resting) {
    // Sitting: everything drops by a third of a tile, legs fold forward.
    ctx.translate(0, T * 0.05);
    ctx.lineWidth = Math.max(1, T * 0.05);
    ctx.strokeStyle = INK;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 0, T * 0.34, T * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3b3a4a";
    ctx.lineWidth = Math.max(2, T * 0.12);
    ctx.beginPath();
    ctx.moveTo(-T * 0.06, -T * 0.3);
    ctx.lineTo(T * 0.3, -T * 0.3);
    ctx.lineTo(T * 0.34, -T * 0.02);
    ctx.moveTo(T * 0.06, -T * 0.3);
    ctx.lineTo(T * 0.38, -T * 0.28);
    ctx.lineTo(T * 0.42, -T * 0.02);
    ctx.stroke();
    ctx.translate(0, T * 0.35);
  }
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.strokeStyle = INK;
  const stride = p.walking ? Math.sin(p.phase * Math.PI * 2) : 0;
  const bob = p.walking ? Math.abs(Math.cos(p.phase * Math.PI * 2)) * T * 0.05 : 0;
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 0, T * 0.3, T * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.strokeStyle = "#3b3a4a";
  ctx.lineWidth = Math.max(2, T * 0.12);
  ctx.beginPath();
  ctx.moveTo(-T * 0.08, -T * 0.45 - bob);
  ctx.lineTo(-T * 0.08 + stride * T * 0.14, -T * 0.02);
  ctx.moveTo(T * 0.08, -T * 0.45 - bob);
  ctx.lineTo(T * 0.08 - stride * T * 0.14, -T * 0.02);
  ctx.stroke();
  // Tunic
  ctx.fillStyle = p.fury > 0.8 ? "#8a3d2e" : "#7a5a3a";
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.beginPath();
  ctx.roundRect(-T * 0.24, -T * 0.95 - bob, T * 0.48, T * 0.55, T * 0.1);
  ctx.fill();
  ctx.stroke();
  // Belt
  ctx.fillStyle = "#3a2f2a";
  ctx.fillRect(-T * 0.24, -T * 0.55 - bob, T * 0.48, T * 0.06);
  // Arms
  ctx.strokeStyle = "#e8b98a";
  ctx.lineWidth = Math.max(2, T * 0.1);
  ctx.beginPath();
  if (p.reading) {
    ctx.moveTo(-T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(-T * 0.12, -T * 0.62 - bob);
    ctx.moveTo(T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(T * 0.3, -T * 0.62 - bob);
    ctx.stroke();
    // The book, held open.
    ctx.fillStyle = p.bookColour ?? "#c94f4f";
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, T * 0.04);
    ctx.beginPath();
    ctx.roundRect(-T * 0.14, -T * 0.78 - bob, T * 0.44, T * 0.28, T * 0.03);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(-T * 0.1, -T * 0.75 - bob, T * 0.17, T * 0.22);
    ctx.fillRect(T * 0.09, -T * 0.75 - bob, T * 0.17, T * 0.22);
    ctx.strokeStyle = "rgba(43,38,32,0.4)";
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      ctx.moveTo(-T * 0.08, -T * (0.71 - k * 0.06) - bob);
      ctx.lineTo(T * 0.05, -T * (0.71 - k * 0.06) - bob);
      ctx.moveTo(T * 0.11, -T * (0.71 - k * 0.06) - bob);
      ctx.lineTo(T * 0.24, -T * (0.71 - k * 0.06) - bob);
    }
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.beginPath();
  } else if (p.carrying) {
    ctx.moveTo(-T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(-T * 0.28, -T * 1.2 - bob);
    ctx.moveTo(T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(T * 0.28, -T * 1.2 - bob);
  } else if (p.fury > 0.6 && !p.walking) {
    // Fists shaking at the sky.
    const shake = Math.sin(p.phase * Math.PI * 8) * T * 0.04;
    ctx.moveTo(-T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(-T * 0.38 + shake, -T * 1.25 - bob);
    ctx.moveTo(T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(T * 0.38 - shake, -T * 1.25 - bob);
  } else {
    ctx.moveTo(-T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(-T * 0.3 - stride * T * 0.06, -T * 0.5 - bob);
    ctx.moveTo(T * 0.2, -T * 0.85 - bob);
    ctx.lineTo(T * 0.3 + stride * T * 0.06, -T * 0.5 - bob);
  }
  ctx.stroke();
  // Crook (in the front hand when not carrying); leans on the ground while sitting.
  if (!p.carrying && !p.reading) {
    ctx.strokeStyle = "#8a6238";
    ctx.lineWidth = Math.max(1.5, T * 0.06);
    ctx.beginPath();
    const hx = T * 0.3 + stride * T * 0.06;
    ctx.moveTo(hx, -T * 0.05);
    ctx.lineTo(hx, -T * 1.35 - bob);
    ctx.arc(hx - T * 0.1, -T * 1.35 - bob, T * 0.1, 0, Math.PI, true);
    ctx.stroke();
  }
  // Head
  ctx.fillStyle = "#e8b98a";
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.beginPath();
  ctx.arc(0, -T * 1.08 - bob, T * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Beard
  ctx.fillStyle = "#c9c2b5";
  ctx.beginPath();
  ctx.ellipse(T * 0.02, -T * 0.97 - bob, T * 0.15, T * 0.1, 0, 0, Math.PI);
  ctx.fill();
  // Eye and brow (brow angle = fury)
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(T * 0.09, -T * 1.1 - bob, T * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1, T * 0.04);
  ctx.beginPath();
  ctx.moveTo(T * 0.02, -T * (1.17 - p.fury * 0.03) - bob);
  ctx.lineTo(T * 0.16, -T * (1.17 + p.fury * 0.05) - bob);
  ctx.stroke();
  // Hat: wide brim, tall dome; tilts back when furious.
  ctx.save();
  ctx.translate(0, -T * 1.22 - bob);
  ctx.rotate(-p.fury * 0.25);
  ctx.fillStyle = "#5b7a3a";
  ctx.beginPath();
  ctx.ellipse(0, 0, T * 0.36, T * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-T * 0.2, 0);
  ctx.quadraticCurveTo(-T * 0.16, -T * 0.32, 0, -T * 0.34);
  ctx.quadraticCurveTo(T * 0.16, -T * 0.32, T * 0.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** Word-wrap `text` to at most `maxChars` per line. */
export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

export interface BubbleStyle {
  /** 0..1 intensity: thicker outline, jagged edge, redder fill. */
  heat: number;
  font: string;
}

/** Speech bubble whose tail points at (tx, ty). Returns nothing; clamps to canvas. */
export function drawBubble(ctx: Ctx, tx: number, ty: number, text: string, fontPx: number, style: BubbleStyle, canvasW: number, canvasH: number): void {
  // Verse uses " / " as a hard line break and is centred; prose wraps.
  const verse = text.includes(" / ");
  const lines = verse ? text.split(" / ").flatMap((l) => wrapText(l, 44)) : wrapText(text, 40);
  ctx.font = `${fontPx}px ${style.font}`;
  const lineH = fontPx * 1.22;
  let w = 0;
  for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  const padX = fontPx * 0.8;
  const padY = fontPx * 0.55;
  const bw = w + padX * 2;
  const bh = lines.length * lineH + padY * 2;
  let bx = tx - bw / 2;
  let by = ty - bh - fontPx * 1.1;
  bx = Math.max(8, Math.min(canvasW - bw - 8, bx));
  by = Math.max(8, Math.min(canvasH - bh - 8, by));
  ctx.save();
  ctx.lineWidth = Math.max(1.5, fontPx * (0.08 + style.heat * 0.08));
  ctx.strokeStyle = INK;
  ctx.fillStyle = style.heat > 0.75 ? "#ffe9dc" : style.heat > 0.45 ? "#fff6e6" : "#fffdf5";
  ctx.beginPath();
  if (style.heat > 0.85) {
    // Jagged shout bubble: the inner envelope must clear the text box's corners.
    const spikes = 18;
    const baseRx = Math.hypot(bw / 2, bh / 2) * 0.92 + fontPx * 0.2;
    const baseRy = bh / 2 + Math.hypot(bw / 2, bh / 2) * 0.28 + fontPx * 0.2;
    for (let i = 0; i <= spikes; i++) {
      const a = (i / spikes) * Math.PI * 2;
      const rx = baseRx + (i % 2 ? fontPx * 0.8 : 0);
      const ry = baseRy + (i % 2 ? fontPx * 0.8 : 0);
      const px = bx + bw / 2 + Math.cos(a) * rx;
      const py = by + bh / 2 + Math.sin(a) * ry;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.roundRect(bx, by, bw, bh, fontPx * 0.7);
  }
  ctx.fill();
  ctx.stroke();
  // Tail
  const tailBaseX = Math.max(bx + fontPx, Math.min(bx + bw - fontPx, tx));
  ctx.beginPath();
  ctx.moveTo(tailBaseX - fontPx * 0.5, by + bh - 1);
  ctx.lineTo(tx, Math.min(ty, by + bh + fontPx * 1.2));
  ctx.lineTo(tailBaseX + fontPx * 0.5, by + bh - 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(tailBaseX - fontPx * 0.5, by + bh);
  ctx.lineTo(tx, Math.min(ty, by + bh + fontPx * 1.2));
  ctx.lineTo(tailBaseX + fontPx * 0.5, by + bh);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textBaseline = "top";
  if (verse) {
    ctx.textAlign = "center";
    lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + padY + i * lineH));
  } else {
    lines.forEach((l, i) => ctx.fillText(l, bx + padX, by + padY + i * lineH));
  }
  ctx.restore();
}

/** Small wordless emote balloon above a sheep: "!", "?", "…", "z". */
export function drawEmote(ctx: Ctx, x: number, y: number, T: number, glyph: string): void {
  ctx.save();
  ctx.fillStyle = "#fffdf5";
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.beginPath();
  ctx.ellipse(x, y, T * 0.28, T * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `bold ${T * 0.32}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, x, y + T * 0.02);
  ctx.restore();
}
