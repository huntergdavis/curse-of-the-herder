// Pure liveness rules for the runtime watchdog (borrowed from The Grind 2).
// Everything here is a function of plain numbers so it can be unit-tested.

export interface LivenessInput {
  nowMs: number;
  lastTickMs: number;
  lastFrameMs: number;
  hidden: boolean;
  paused: boolean;
  finished: boolean;
}

/** No sim tick for this long while visible and running means the loop died. */
export const STALL_MS = 20_000;

export function shouldRecover(i: LivenessInput): boolean {
  if (i.hidden || i.paused || i.finished) return false;
  return i.nowMs - i.lastTickMs > STALL_MS && i.nowMs - i.lastFrameMs > STALL_MS;
}

export const MAX_CATCH_UP_HOURS = 4;

/**
 * How many ticks to simulate after an absence, and whether the absence was
 * long enough to be worth a remark. Anything past the cap is dropped: the
 * day simply pauses while nobody is watching.
 */
export function catchUpPlan(elapsedMs: number, tickMs: number, fast: number): { ticks: number; dropped: boolean; longNap: boolean } {
  const due = Math.floor((elapsedMs / tickMs) * fast);
  const cap = (MAX_CATCH_UP_HOURS * 3600 * 1000) / tickMs;
  return { ticks: Math.min(due, cap), dropped: due > cap, longNap: elapsedMs > 20 * 60 * 1000 };
}
