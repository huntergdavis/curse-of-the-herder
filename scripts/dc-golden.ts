// Emit golden RNG vectors for the Dreamcast port to check its C RNG against.
// Format: one record per line, tab-separated, consumed by tests/test_rng.c.
//   FNV\t<string>\t<hex32>
//   MUL\t<seed_u32>\t<n>\t<u0,u1,...>            (raw uint32 numerators)
//   KEYED\t<joined>\t<u32>\t<part0|part1|...>     (joined must equal C's join of the parts)
import { fnv1a } from "../src/core/rng";

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
process.stdout.write(out.join("\n") + "\n");
