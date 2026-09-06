// Seeded 2D value noise with fractal Brownian motion. Deterministic given
// (seed, x, y); no tables to allocate, so it is worker- and script-safe.

import { fnv1a } from "./rng";

function lattice(seed: number, ix: number, iy: number): number {
  // Integer hash of a lattice point. Mixing in the seed via FNV keeps
  // different noise fields (elevation vs moisture) uncorrelated.
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (ix * 0x27d4eb2d), 0x165667b1);
  h = Math.imul(h ^ (iy * 0x85ebca6b), 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

export function valueNoise(seed: number, x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smooth(x - x0);
  const ty = smooth(y - y0);
  const a = lattice(seed, x0, y0);
  const b = lattice(seed, x0 + 1, y0);
  const c = lattice(seed, x0, y0 + 1);
  const d = lattice(seed, x0 + 1, y0 + 1);
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

/** Fractal noise in [0, 1]. `scale` is the wavelength of the first octave in tiles. */
export function fbm(seed: number, x: number, y: number, scale: number, octaves = 5, gain = 0.5, lacunarity = 2.0): number {
  let amp = 1;
  let freq = 1 / scale;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(seed + o * 101, x * freq + o * 17.3, y * freq - o * 9.1);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

export function seedFromString(s: string): number {
  return fnv1a(s);
}
