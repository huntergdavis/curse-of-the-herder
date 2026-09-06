import { describe, expect, it } from "vitest";
import { fnv1a, keyedUnit, mulberry32 } from "./rng";

describe("mulberry32", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("fnv1a", () => {
  it("matches the known 32-bit FNV-1a test vectors", () => {
    expect(fnv1a("")).toBe(0x811c9dc5);
    expect(fnv1a("a")).toBe(0xe40c292c);
  });
});

describe("keyedUnit", () => {
  it("depends on every part of the key", () => {
    const base = keyedUnit("seed", "sheep", 7, 100, "flee");
    expect(keyedUnit("seed", "sheep", 7, 100, "flee")).toBe(base);
    expect(keyedUnit("seed", "sheep", 8, 100, "flee")).not.toBe(base);
    expect(keyedUnit("seed", "sheep", 7, 101, "flee")).not.toBe(base);
    expect(keyedUnit("other", "sheep", 7, 100, "flee")).not.toBe(base);
  });
});
