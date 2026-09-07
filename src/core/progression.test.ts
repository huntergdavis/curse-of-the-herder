import { describe, expect, it } from "vitest";
import { curseIntervalSeconds, erudition, filthCeiling, frustrationBaseline, frustrationDrift, levelFor } from "./progression";

describe("progression", () => {
  it("levels rise with books and cap at 12", () => {
    expect(levelFor(0)).toBe(0);
    expect(levelFor(erudition(1, 0, 0))).toBe(0);
    expect(levelFor(erudition(3, 0, 0))).toBe(1);
    expect(levelFor(erudition(10, 30, 4))).toBeGreaterThanOrEqual(5);
    expect(levelFor(erudition(21, 60, 9))).toBe(12);
    expect(levelFor(erudition(40, 60, 9))).toBe(12);
  });
  it("a herder who never finds a book still ends the day at level 2", () => {
    expect(levelFor(erudition(0, 60, 9))).toBe(2);
  });
  it("seven sheep and no books is still level 0", () => {
    expect(levelFor(erudition(0, 7, 0.2))).toBe(0);
  });
  it("filth ceiling follows frustration bands", () => {
    expect(filthCeiling(0)).toBe(0);
    expect(filthCeiling(30)).toBe(2);
    expect(filthCeiling(50)).toBe(3);
    expect(filthCeiling(100)).toBe(4);
  });
  it("curse interval shrinks with level and frustration but never below 5 s", () => {
    expect(curseIntervalSeconds(0, 0)).toBeGreaterThan(40);
    expect(curseIntervalSeconds(12, 100)).toBeGreaterThanOrEqual(4);
    expect(curseIntervalSeconds(12, 100)).toBeLessThan(curseIntervalSeconds(0, 0));
  });
  it("frustration baseline rises through the day and the meter drifts toward it", () => {
    expect(frustrationBaseline(0)).toBe(10);
    expect(frustrationBaseline(4)).toBeGreaterThan(38);
    expect(frustrationBaseline(9)).toBe(74);
    expect(frustrationDrift(80, 40, 10)).toBeLessThan(75);
    expect(frustrationDrift(80, 40, 10)).toBeGreaterThan(40);
    expect(frustrationDrift(10, 40, 10)).toBe(30);
    expect(frustrationDrift(39.9, 40, 10)).toBe(40);
  });
});
