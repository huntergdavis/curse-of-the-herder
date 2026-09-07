import { describe, expect, it } from "vitest";
import { generateMap } from "../map/generate";
import { createWorld, TICKS_PER_HOUR } from "./state";
import { step } from "./step";

describe("a whole day, headless", () => {
  it("pens every sheep and never ends with a loose one", () => {
    const seed = "a2";
    const map = generateMap(seed, { size: 256 });
    const w = createWorld(seed, map, 0);
    while (!w.finished && w.tick < 14 * TICKS_PER_HOUR) step(w, map);
    expect(w.finished).toBe(true);
    expect(w.sheepPenned).toBe(w.sheep.length);
    expect(w.sheep.filter((s) => s.mode !== "penned")).toEqual([]);
    expect(w.booksRead).toBeGreaterThan(5);
  }, 240_000);
});
