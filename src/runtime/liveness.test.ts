import { describe, expect, it } from "vitest";
import { catchUpPlan, shouldRecover, STALL_MS } from "./liveness";

const base = { nowMs: 100_000, lastTickMs: 100_000, lastFrameMs: 100_000, hidden: false, paused: false, finished: false };

describe("shouldRecover", () => {
  it("is quiet while healthy", () => {
    expect(shouldRecover(base)).toBe(false);
  });
  it("fires after a stall while visible and running", () => {
    expect(shouldRecover({ ...base, lastTickMs: base.nowMs - STALL_MS - 1, lastFrameMs: base.nowMs - STALL_MS - 1 })).toBe(true);
  });
  it("never fires while hidden, paused or finished", () => {
    const stalled = { ...base, lastTickMs: 0, lastFrameMs: 0 };
    expect(shouldRecover({ ...stalled, hidden: true })).toBe(false);
    expect(shouldRecover({ ...stalled, paused: true })).toBe(false);
    expect(shouldRecover({ ...stalled, finished: true })).toBe(false);
  });
});

describe("catchUpPlan", () => {
  it("simulates every missed tick for a short absence", () => {
    expect(catchUpPlan(10_000, 250, 1)).toEqual({ ticks: 40, dropped: false, longNap: false });
  });
  it("caps a long absence and flags it", () => {
    const plan = catchUpPlan(10 * 3600 * 1000, 250, 1);
    expect(plan.ticks).toBe((4 * 3600 * 1000) / 250);
    expect(plan.dropped).toBe(true);
    expect(plan.longNap).toBe(true);
  });
  it("scales with fast mode", () => {
    expect(catchUpPlan(1000, 250, 10).ticks).toBe(40);
  });
});
