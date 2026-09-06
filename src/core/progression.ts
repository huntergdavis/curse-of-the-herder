// Level is a derived value; never store it. See docs/research/CURSE_PROGRESSION.md.

export const MAX_LEVEL = 12;

export const LEVEL_NAMES: readonly string[] = [
  "Grunting", "Two Words", "Simple Sentences", "The Comparative", "Vocative Fury",
  "The Vulgar Tongue", "The Bard", "Polyglot", "Hemingway", "Nautical",
  "The Baroque", "Verse", "Unhinged Laureate",
];

/** Books dominate; sheep and hours give a slow floor so a bookless day still climbs a little. */
export function erudition(booksRead: number, sheepPenned: number, hoursElapsed: number): number {
  return 100 * booksRead + 8 * sheepPenned + 3 * hoursElapsed;
}

/** Linear in erudition: with ~24 books over the day this is roughly one level per 45 minutes. */
export const ERUDITION_PER_LEVEL = 240;

export function levelFor(eruditionScore: number): number {
  return Math.max(0, Math.min(MAX_LEVEL, Math.floor(Math.max(0, eruditionScore) / ERUDITION_PER_LEVEL)));
}

export type FilthBand = 0 | 1 | 2 | 3 | 4;

export function filthCeiling(frustration: number): FilthBand {
  if (frustration < 20) return 0;
  if (frustration < 40) return 1;
  if (frustration < 60) return 2;
  if (frustration < 80) return 3;
  return 4;
}

/** Seconds between spontaneous curses. */
export function curseIntervalSeconds(level: number, frustration: number): number {
  const base = 90;
  const v = (base * (1.15 - frustration / 100)) / (1 + level / MAX_LEVEL);
  return Math.max(5, v);
}

export const FRUSTRATION = {
  perFortyTilesCarrying: 1,
  flee: 6,
  absurdLocation: 8,
  roughTile: 2,
  rainPerMinute: 0.5,
  duskPerMinute: 0.2,
  walkOfShame: 3,
  repeatEscape: 12,
  penned: -8,
  book: -10,
  breather: -5,
  decayPerMinute: -0.5,
} as const;

export function clampFrustration(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/**
 * The floor the meter drifts toward. A fresh herder is calm; by mid-afternoon
 * he is simmering even when nothing is going wrong. Hours are sim hours since
 * the day began.
 */
export function frustrationBaseline(hoursElapsed: number): number {
  return Math.max(0, Math.min(72, (hoursElapsed - 0.75) * 11));
}

/** Per-tick drift toward the baseline: slow relief above it, steady simmer below it. */
export function frustrationDrift(current: number, baseline: number, dtMinutes: number): number {
  if (current > baseline) return Math.max(baseline, current + FRUSTRATION.decayPerMinute * dtMinutes);
  return Math.min(baseline, current + 1.2 * dtMinutes);
}
