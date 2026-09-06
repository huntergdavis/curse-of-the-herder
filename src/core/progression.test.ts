import { describe, expect, it } from "vitest";
import { curseIntervalSeconds, erudition, filthCeiling, levelFor } from "./progression";

describe("progression", () => {
  it("levels rise with books and cap at 12", () => {
    expect(levelFor(0)).toBe(0);
    expect(levelFor(erudition(1, 0, 0))).toBe(1);
    expect(levelFor(erudition(6, 20, 4))).toBeGreaterThanOrEqual(5);
    expect(levelFor(erudition(40, 60, 9))).toBe(12);
  });
  it("a herder who never finds a book still ends the day above level 5", () => {
    expect(levelFor(erudition(0, 60, 9))).toBeGreaterThanOrEqual(5);
  });
  it("filth ceiling follows frustration bands", () => {
    expect(filthCeiling(0)).toBe(0);
    expect(filthCeiling(45)).toBe(2);
    expect(filthCeiling(100)).toBe(4);
  });
  it("curse interval shrinks with level and frustration but never below 5 s", () => {
    expect(curseIntervalSeconds(0, 0)).toBeGreaterThan(90);
    expect(curseIntervalSeconds(12, 100)).toBeGreaterThanOrEqual(5);
    expect(curseIntervalSeconds(12, 100)).toBeLessThan(curseIntervalSeconds(0, 0));
  });
});
