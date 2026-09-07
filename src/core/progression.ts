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

/** Linear in erudition: with ~20 books read over the day this is roughly one level per 45 minutes. */
export const ERUDITION_PER_LEVEL = 210;

export function levelFor(eruditionScore: number): number {
  return Math.max(0, Math.min(MAX_LEVEL, Math.floor(Math.max(0, eruditionScore) / ERUDITION_PER_LEVEL)));
}

export type FilthBand = 0 | 1 | 2 | 3 | 4;

export function filthCeiling(frustration: number): FilthBand {
  if (frustration < 8) return 0;
  if (frustration < 22) return 1;
  if (frustration < 42) return 2;
  if (frustration < 66) return 3;
  return 4;
}

/** Seconds between spontaneous curses. Event lines (flee, catch, pen) come on top. */
export function curseIntervalSeconds(level: number, frustration: number): number {
  const base = 42;
  const v = (base * (1.1 - frustration / 100)) / (1 + level / MAX_LEVEL);
  return Math.max(4, v);
}

export const FRUSTRATION = {
  /** A neighbour's flock walking past in a tidy line. */
  rival: 7,
  perFortyTilesCarrying: 1,
  flee: 6,
  absurdLocation: 8,
  roughTile: 2,
  rainPerMinute: 0.5,
  duskPerMinute: 0.2,
  walkOfShame: 3,
  repeatEscape: 12,
  penned: -5,
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
  // He wakes up already a little sore about it.
  return Math.max(0, Math.min(74, 10 + hoursElapsed * 7.5));
}

/** Per-tick drift toward the baseline: slow relief above it, steady simmer below it. */
export function frustrationDrift(current: number, baseline: number, dtMinutes: number): number {
  // Spikes above the baseline fade at about a point a minute, faster the higher they are.
  if (current > baseline) return Math.max(baseline, current - (0.8 + (current - baseline) / 40) * dtMinutes);
  return Math.min(baseline, current + 2.0 * dtMinutes);
}
