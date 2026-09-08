// Emit golden RNG vectors for the Dreamcast port to check its C RNG against.
// Format: one record per line, tab-separated, consumed by tests/test_rng.c.
//   FNV\t<string>\t<hex32>
//   MUL\t<seed_u32>\t<n>\t<u0,u1,...>            (raw uint32 numerators)
//   KEYED\t<joined>\t<u32>\t<part0|part1|...>     (joined must equal C's join of the parts)
import { fnv1a } from "../src/core/rng";
import { valueNoise, fbm } from "../src/core/noise";
import { distanceField, findPath, type Grid } from "../src/core/map/path";
import { generateMap, VILLAGE_NAMES } from "../src/core/map/generate";
import { erudition, levelFor, filthCeiling, curseIntervalSeconds, clampFrustration, frustrationBaseline, frustrationDrift } from "../src/core/progression";
import { herderName, sheepName, dogName, rivalName } from "../src/core/names";
import { createWorld } from "../src/core/sim/state";

// Raw 64-bit pattern of a double, as 16 hex digits, so C can compare bit-exact.
const dv = new DataView(new ArrayBuffer(8));
function bits64(x: number): string {
  dv.setFloat64(0, x, false);
  return (dv.getUint32(0, false) >>> 0).toString(16).padStart(8, "0") + (dv.getUint32(4, false) >>> 0).toString(16).padStart(8, "0");
}
// The lattice hash is private in noise.ts; reproduce it here for the golden.
function lattice(seed: number, ix: number, iy: number): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (ix * 0x27d4eb2d), 0x165667b1);
  h = Math.imul(h ^ (iy * 0x85ebca6b), 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

// Reproduce mulberry32 but expose the integer numerator (before /2^32).
function mulberry32u32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}
function keyedU32(seed: string, key: (string | number)[]): { joined: string; u32: number } {
  const joined = [seed, ...key].join("|");
  return { joined, u32: mulberry32u32(fnv1a(joined))() };
}

const out: string[] = [];
const strings = ["", "a", "seed", "|", "seed|sheep|7|100|flee", "The Curse", "0", "-1", "curse-of-the-herder", "map|tex|511|511"];
for (const s of strings) out.push(`FNV\t${s}\t${fnv1a(s).toString(16).padStart(8, "0")}`);

for (const seed of [0, 1, 0x811c9dc5, 0xdeadbeef, 4294967295]) {
  const r = mulberry32u32(seed);
  const seq: number[] = [];
  for (let i = 0; i < 8; i++) seq.push(r());
  out.push(`MUL\t${seed >>> 0}\t8\t${seq.join(",")}`);
}

const keys: (string | number)[][] = [
  ["sheep", 7, 100, "flee"], ["sheep", 7, 101, "flee"], ["sheep", 8, 100, "flee"],
  ["tex", 511, 511], ["deco-var", 0, 0], ["dog-name"], ["signature"], ["rain-len", 4200],
  ["pen-x", 3], ["flee", 12, 2, 480], ["mishap", "bog", 999], ["jailbreak-who", 12345],
];
for (const seed of ["seed", "other", "curse-of-the-herder", "payoff"]) {
  for (const k of keys) {
    const { joined, u32 } = keyedU32(seed, k);
    out.push(`KEYED\t${joined}\t${u32}\t${[seed, ...k].join("|")}`);
  }
}
for (const [seed, ix, iy] of [[0,0,0],[123,5,9],[0x811c9dc5,511,511],[42,-3,-7],[999,100,250]] as [number,number,number][]) {
  out.push(`LATTICE\t${seed >>> 0}\t${ix}\t${iy}\t${bits64(lattice(seed >>> 0, ix, iy))}`);
}
for (const [seed, x, y] of [[7,0.5,0.5],[7,10.25,3.75],[0x811c9dc5,128.5,64.5],[42,255.9,255.1],[3,0.0,0.0]] as [number,number,number][]) {
  out.push(`VNOISE\t${seed >>> 0}\t${bits64(x)}\t${bits64(y)}\t${bits64(valueNoise(seed >>> 0, x, y))}`);
}
for (const [seed, x, y, scale] of [[7,100,100,40],[7,10.5,20.5,16],[0x811c9dc5,300,300,85],[42,1.5,2.5,4]] as [number,number,number,number][]) {
  out.push(`FBM\t${seed >>> 0}\t${bits64(x)}\t${bits64(y)}\t${bits64(scale)}\t${bits64(fbm(seed >>> 0, x, y, scale))}`);
}
// --- pathfinding on small synthetic grids: exact heap tie-breaking and double costs ---
type SG = { id: string; n: number; rows: string[] };
const SGRIDS: SG[] = [
  { id: "open", n: 8, rows: ["22222222","22222222","22222222","22222222","22222222","22222222","22222222","22222222"] },
  { id: "wall", n: 8, rows: ["22222222","22200222","22200222","22200222","22200222","22200222","22222222","22222222"] },
  { id: "mixed", n: 10, rows: ["2222222222","2005500222","2005500992","2999999992","2000000092","2666622092","2266622222","2200000000","2299999992","2222222222"] },
  { id: "corner", n: 6, rows: ["222222","200022","200022","220022","222222","222222"] },
];
function toGrid(g: SG): Grid { const t = new Uint8Array(g.n * g.n); for (let y = 0; y < g.n; y++) for (let x = 0; x < g.n; x++) t[y*g.n+x] = parseInt(g.rows[y]![x]!, 16); return { size: g.n, terrain: t }; }
for (const g of SGRIDS) {
  out.push(`GRID\t${g.id}\t${g.n}\t${g.rows.join("")}`);
  const grid = toGrid(g);
  const df = distanceField(grid, 1, 1);
  out.push(`DIST\t${g.id}\t1\t1\t${Array.from(df).map(bits64).join(",")}`);
  const gx = g.n - 2, gy = g.n - 2;
  const path = findPath(grid, 1, 1, gx, gy);
  out.push(`PATH\t${g.id}\t1\t1\t${gx}\t${gy}\t${path ? path.map((p) => p.x + "." + p.y).join(",") : "null"}`);
}
function classify(e: number, m: number): number {
  if (e < 0.31) return 0;
  if (e < 0.345) return 1;
  if (e > 0.855) return 8;
  if (e > 0.745) return 7;
  if (e < 0.40 && m > 0.58) return 6;
  if (m > 0.64) return 5;
  if (m < 0.36) return 3;
  return 2;
}
for (let ei = 0; ei <= 20; ei++) for (let mi = 0; mi <= 20; mi++) {
  const e = ei / 20, m = mi / 20;
  out.push(`CLASSIFY\t${bits64(e)}\t${bits64(m)}\t${classify(e, m)}`);
}
// --- full map generation parity ---
function byteHash(a: Uint8Array): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < a.length; i++) { h ^= a[i]!; h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}
const hex = "0123456789abcde";
for (const seed of ["seed", "curse-of-the-herder", "payoff", "grudge"]) {
  for (const size of [576, 128]) {
    const m = generateMap(seed, { size });
    const vs = m.villages.map((v) => `${VILLAGE_NAMES.indexOf(v.name)}.${v.x}.${v.y}`).join(";");
    out.push(`MAP\t${seed}\t${size}\t${byteHash(m.terrain)}\t${byteHash(m.deco)}\t${m.pen.x}\t${m.pen.y}\t${m.walkableCount}\t${vs}`);
  }
}
// A small full dump so a mismatch can be located tile by tile.
{
  const m = generateMap("seed", { size: 96 });
  let terr = "", dec = "";
  for (let i = 0; i < m.terrain.length; i++) { terr += hex[m.terrain[i]!]; dec += hex[m.deco[i]!]; }
  out.push(`MAPGRID\tseed\t96\t${terr}\t${dec}`);
}
// progression: numeric curves as bit-exact doubles / ints.
for (const [b, sh, hr] of [[0,0,0],[3,17,1.5],[20,60,9],[7,33,4.2]] as [number,number,number][]) {
  const er = erudition(b, sh, hr);
  out.push(`PROG_ER\t${bits64(b)}\t${bits64(sh)}\t${bits64(hr)}\t${bits64(er)}\t${levelFor(er)}`);
}
for (const f of [0,7,8,21,22,41,42,65,66,90]) out.push(`PROG_FILTH\t${f}\t${filthCeiling(f)}`);
for (const [lv, f] of [[0,10],[6,50],[12,90],[3,0]] as [number,number][]) out.push(`PROG_CI\t${lv}\t${bits64(f)}\t${bits64(curseIntervalSeconds(lv, f))}`);
for (const c of [-5, 0, 50, 100, 130]) out.push(`PROG_CLAMP\t${bits64(c)}\t${bits64(clampFrustration(c))}`);
for (const h of [0, 2.5, 8, 12]) out.push(`PROG_BASE\t${bits64(h)}\t${bits64(frustrationBaseline(h))}`);
for (const [cur, bl, dt] of [[80,40,0.25],[20,40,0.25],[40,40,1],[95,74,0.5]] as [number,number,number][]) out.push(`PROG_DRIFT\t${bits64(cur)}\t${bits64(bl)}\t${bits64(dt)}\t${bits64(frustrationDrift(cur, bl, dt))}`);
// names: the chosen indices (parity for the keyed picks). herderName parts via index lookup.
const FIRSTN = ["Fennick","Wulfric","Mags","Dunstan","Hob","Alwin","Tamsin","Godric","Bran","Osric","Edda","Perkin","Wat","Cuthbert","Aldous","Nell","Piers","Hodge","Gilly","Ansel","Bartle","Elric","Maud","Rowan","Silas","Tobin","Ulric","Wynn","Ysolde","Jory","Ebenezer","Hamnet","Lettice","Oswin","Rafe","Sibyl","Thurstan","Cadoc","Idony","Mungo"];
for (const seed of ["seed","payoff","grudge","curse-of-the-herder","tom"]) {
  const hn = herderName(seed);
  out.push(`NAME_HERDER\t${seed}\t${hn}`);
  out.push(`NAME_DOG\t${seed}\t${dogName(seed)}`);
  out.push(`NAME_RIVAL\t${seed}\t${rivalName(seed)}`);
  for (const id of [0, 7, 41, 43]) out.push(`NAME_SHEEP\t${seed}\t${id}\t${sheepName(seed, id)}`);
  void FIRSTN;
}
// initial flock placement (deterministic sheep array from createWorld).
const TEMPER = ["plain","skittish","stubborn","dozy","curious"];
for (const seed of ["seed","payoff","grudge","curse-of-the-herder"]) {
  const map = generateMap(seed, { size: 576 });
  const w = createWorld(seed, map, 0);
  out.push(`FLOCKN\t${seed}\t576\t${w.sheep.length}`);
  for (const s of w.sheep) {
    const flags = (s.onRoof ? "r" : "") + (s.inRiver ? "v" : "") + (s.onBoulder ? "b" : "") || "-";
    const tp = s.temper ?? "-";
    out.push(`FLOCKS\t${seed}\t${s.id}\t${s.x}\t${s.y}\t${bits64(s.skittish)}\t${tp}\t${s.absurd ? 1 : 0}\t${s.ring}\t${flags}\t${s.black ? 1 : 0}`);
    void TEMPER;
  }
}
for (const seed of ["seed","payoff","grudge","curse-of-the-herder"]) {
  const map = generateMap(seed, { size: 576 });
  const w = createWorld(seed, map, 0);
  out.push(`LIBN\t${seed}\t${w.libraries.length}`);
  w.libraries.forEach((l, k) => out.push(`LIBS\t${seed}\t${k}\t${l.x}\t${l.y}`));
}
process.stdout.write(out.join("\n") + "\n");
