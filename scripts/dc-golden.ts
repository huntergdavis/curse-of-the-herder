// Emit golden RNG vectors for the Dreamcast port to check its C RNG against.
// Format: one record per line, tab-separated, consumed by tests/test_rng.c.
//   FNV\t<string>\t<hex32>
//   MUL\t<seed_u32>\t<n>\t<u0,u1,...>            (raw uint32 numerators)
//   KEYED\t<joined>\t<u32>\t<part0|part1|...>     (joined must equal C's join of the parts)
import { fnv1a } from "../src/core/rng";
import { valueNoise, fbm } from "../src/core/noise";

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
process.stdout.write(out.join("\n") + "\n");
