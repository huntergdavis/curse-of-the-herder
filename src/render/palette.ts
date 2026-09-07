import { Terrain } from "../core/map/terrain";

export const TERRAIN_COLOR: Record<number, string> = {
  [Terrain.Water]: "#4f8fc9",
  [Terrain.Sand]: "#e3d29a",
  [Terrain.Grass]: "#7cb548",
  [Terrain.Meadow]: "#8fbf50",
  [Terrain.Farm]: "#c9a35a",
  [Terrain.Forest]: "#5a9a44",
  [Terrain.Mud]: "#8d6f4e",
  [Terrain.Rock]: "#9a958c",
  [Terrain.Snow]: "#f2f4f7",
  [Terrain.Road]: "#d8c398",
  [Terrain.Bridge]: "#a8804f",
};

export const INK = "#2b2620";

/** Day tint keyframes: [hour, rgba]. Interpolated linearly. */
const TINT_KEYS: [number, [number, number, number, number]][] = [
  [9.0, [120, 160, 255, 0.10]],
  [10.5, [255, 255, 255, 0.0]],
  [15.0, [255, 255, 255, 0.0]],
  [16.5, [255, 190, 110, 0.10]],
  [17.6, [255, 130, 70, 0.22]],
  [18.3, [70, 60, 140, 0.40]],
  [19.5, [20, 24, 70, 0.55]],
];

export interface Tint {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** The sky's colour cast at a given hour; alpha 0 means none. Interpolated smoothly. */
export function dayTint(hour: number): Tint {
  const h = Math.max(TINT_KEYS[0]![0], Math.min(TINT_KEYS[TINT_KEYS.length - 1]![0], hour));
  for (let i = 0; i < TINT_KEYS.length - 1; i++) {
    const [h0, a] = TINT_KEYS[i]!;
    const [h1, b] = TINT_KEYS[i + 1]!;
    if (h >= h0 && h <= h1) {
      const t = (h - h0) / (h1 - h0);
      const mix = (k: 0 | 1 | 2 | 3): number => a[k] + (b[k] - a[k]) * t;
      return { r: mix(0) | 0, g: mix(1) | 0, b: mix(2) | 0, a: mix(3) };
    }
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}
