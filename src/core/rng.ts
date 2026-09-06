// Deterministic RNG helpers. The real game will use a stateless, keyed RNG
// (hash of seed + domain + entity + tick + purpose) so every roll is
// reproducible and replay-safe; mulberry32 is fine for the teaser.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a 32-bit hash of a string; the basis for keyed, stateless rolls. */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * A reproducible unit-interval roll keyed by everything that identifies the
 * decision. Same inputs, same output, forever; no hidden state to save.
 */
export function keyedUnit(seed: string, ...key: (string | number)[]): number {
  const h = fnv1a([seed, ...key].join("|"));
  return mulberry32(h)();
}
