import { mulberry32 } from "./core/rng";

// Pre-alpha teaser. Everything here is throwaway scaffolding so the Pages
// site has a heartbeat; the real architecture is described in PLAN.md.

const TILE = 24;
const W = 64;
const H = 40;

type Terrain = "water" | "sand" | "grass" | "farm" | "forest" | "rock" | "snow";
const COLORS: Record<Terrain, string> = {
  water: "#3d6fa3",
  sand: "#d9c98a",
  grass: "#6fa54a",
  farm: "#b89b4b",
  forest: "#3d7a3a",
  rock: "#8a8578",
  snow: "#eef0f2",
};

// Value noise: smooth-ish random terrain, good enough for a teaser.
function makeNoise(seed: number, scale: number): (x: number, y: number) => number {
  const r = mulberry32(seed);
  const gw = Math.ceil(W / scale) + 2;
  const gh = Math.ceil(H / scale) + 2;
  const grid = Array.from({ length: gw * gh }, () => r());
  const at = (gx: number, gy: number): number => grid[gy * gw + gx] ?? 0;
  const smooth = (t: number): number => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = x / scale;
    const fy = y / scale;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = smooth(fx - x0);
    const ty = smooth(fy - y0);
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
}

const seed = (Date.now() / 60000) | 0;
const elevation = makeNoise(seed, 9);
const moisture = makeNoise(seed * 31 + 7, 6);

function terrainAt(x: number, y: number): Terrain {
  const e = elevation(x, y);
  const m = moisture(x, y);
  if (e < 0.32) return "water";
  if (e < 0.37) return "sand";
  if (e > 0.82) return "snow";
  if (e > 0.7) return "rock";
  if (m > 0.62) return "forest";
  if (m < 0.35) return "farm";
  return "grass";
}

const map: Terrain[] = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) map.push(terrainAt(x, y));
const walkable = (x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const t = map[y * W + x];
  return t !== "water" && t !== "snow";
};

const pen = { x: W >> 1, y: H >> 1 };
const r = mulberry32(seed ^ 0xbeef);
const sheep: { x: number; y: number; home: boolean }[] = [];
while (sheep.length < 14) {
  const x = (r() * W) | 0;
  const y = (r() * H) | 0;
  if (walkable(x, y) && Math.hypot(x - pen.x, y - pen.y) > 8) sheep.push({ x, y, home: false });
}

const herder = { x: pen.x, y: pen.y + 2, carrying: null as null | (typeof sheep)[number] };

// Tier 0 vocabulary: the herder starts the day barely verbal.
const GRUNTS = ["Baa.", "No.", "Sheep!", "Ugh.", "Why.", "Mud.", "Hill!", "Again?!", "Legs.", "Hmph.", "Wool!", "Bah."];
let bubble = { text: "", until: 0 };
function curse(now: number): void {
  bubble = { text: GRUNTS[(r() * GRUNTS.length) | 0] ?? "Ugh.", until: now + 2200 };
}

// Greedy step toward a target, sidestepping unwalkable tiles.
function stepToward(tx: number, ty: number): void {
  const dx = Math.sign(tx - herder.x);
  const dy = Math.sign(ty - herder.y);
  const options = [
    [dx, 0],
    [0, dy],
    [dx, dy],
    [dy, dx],
    [-dy, dx],
    [dy, -dx],
  ] as const;
  for (const [ox, oy] of options) {
    if ((ox || oy) && walkable(herder.x + ox, herder.y + oy)) {
      herder.x += ox;
      herder.y += oy;
      return;
    }
  }
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = `v${__APP_VERSION__}`;

function resize(): void {
  canvas.width = W * TILE;
  canvas.height = H * TILE;
}
resize();

let lastStep = 0;
function tick(now: number): void {
  if (now - lastStep > 140) {
    lastStep = now;
    const target = herder.carrying ? pen : sheep.find((s) => !s.home);
    if (target) {
      stepToward(target.x, target.y);
      if (herder.carrying) {
        herder.carrying.x = herder.x;
        herder.carrying.y = herder.y;
        if (herder.x === pen.x && herder.y === pen.y) {
          herder.carrying.home = true;
          herder.carrying = null;
        }
      } else if (herder.x === target.x && herder.y === target.y) {
        herder.carrying = target as (typeof sheep)[number];
        curse(now);
      }
      if (r() < 0.02) curse(now);
    }
  }
  draw(now);
  requestAnimationFrame(tick);
}

function draw(now: number): void {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      ctx.fillStyle = COLORS[map[y * W + x] ?? "grass"];
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
  // Pen
  ctx.strokeStyle = "#5a3b1e";
  ctx.lineWidth = 3;
  ctx.strokeRect((pen.x - 1) * TILE + 2, (pen.y - 1) * TILE + 2, TILE * 3 - 4, TILE * 3 - 4);
  // Sheep
  for (const s of sheep) {
    if (s === herder.carrying) continue;
    ctx.fillStyle = "#f4f1e6";
    ctx.beginPath();
    ctx.ellipse(s.x * TILE + TILE / 2, s.y * TILE + TILE / 2, TILE * 0.38, TILE * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(s.x * TILE + TILE * 0.62, s.y * TILE + TILE * 0.38, TILE * 0.2, TILE * 0.2);
  }
  // Herder
  ctx.fillStyle = "#7a3b2e";
  ctx.fillRect(herder.x * TILE + 6, herder.y * TILE + 4, TILE - 12, TILE - 6);
  ctx.fillStyle = "#e8b98a";
  ctx.fillRect(herder.x * TILE + 8, herder.y * TILE + 1, TILE - 16, 7);
  if (herder.carrying) {
    ctx.fillStyle = "#f4f1e6";
    ctx.beginPath();
    ctx.ellipse(herder.x * TILE + TILE / 2, herder.y * TILE - 4, TILE * 0.35, TILE * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Speech bubble
  if (now < bubble.until && bubble.text) {
    ctx.font = "bold 16px Georgia, serif";
    const w = ctx.measureText(bubble.text).width + 16;
    const bx = Math.min(Math.max(herder.x * TILE + TILE / 2 - w / 2, 4), canvas.width - w - 4);
    const by = Math.max(herder.y * TILE - 34, 4);
    ctx.fillStyle = "#fffdf5";
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#222";
    ctx.fillText(bubble.text, bx + 8, by + 17);
  }
  const home = sheep.filter((s) => s.home).length;
  ctx.font = "14px Georgia, serif";
  ctx.fillStyle = "#fffdf5";
  ctx.fillText(`Flock: ${home}/${sheep.length}   Level 0: Grunting   Seed ${seed}`, 8, 18);
}

requestAnimationFrame(tick);
