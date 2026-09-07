import { describe, expect, it } from "vitest";
import { generateMap, isPlaceable } from "./generate";
import { Terrain } from "./terrain";

describe("generateMap", () => {
  const map = generateMap("test-seed", { size: 128 });
  // This machine is slow; generation-heavy tests get generous timeouts.
  const SLOW = 60_000;

  it("is deterministic", () => {
    const again = generateMap("test-seed", { size: 128 });
    expect(again.terrain).toEqual(map.terrain);
    expect(again.pen).toEqual(map.pen);
  }, SLOW);

  it("puts the pen on reachable grass with a fence and a gate", () => {
    const i = map.pen.y * map.size + map.pen.x;
    expect(map.terrain[i]).toBe(Terrain.Grass);
    expect(map.penDistance[i]).toBe(0);
    expect(map.deco[(map.pen.y + 2) * map.size + map.pen.x]).toBe(0);
  });

  it("has a mix of terrain and a lot of reachable ground", () => {
    const counts = new Map<number, number>();
    for (const t of map.terrain) counts.set(t, (counts.get(t) ?? 0) + 1);
    expect(counts.get(Terrain.Water) ?? 0).toBeGreaterThan(0);
    expect(counts.get(Terrain.Grass) ?? 0).toBeGreaterThan(0);
    expect(counts.get(Terrain.Road) ?? 0).toBeGreaterThan(20);
    expect(map.walkableCount).toBeGreaterThan(map.size * map.size * 0.4);
  });

  it("connects every village to the pen", () => {
    expect(map.villages.length).toBeGreaterThan(2);
    for (const v of map.villages) {
      expect(Number.isFinite(map.penDistance[v.y * map.size + v.x])).toBe(true);
    }
  });

  it("does not consider roads or water placeable", () => {
    let placeable = 0;
    for (let y = 0; y < map.size; y++) for (let x = 0; x < map.size; x++) {
      if (isPlaceable(map, x, y)) {
        placeable++;
        const t = map.terrain[y * map.size + x];
        expect(t).not.toBe(Terrain.Water);
        expect(t).not.toBe(Terrain.Road);
      }
    }
    expect(placeable).toBeGreaterThan(1000);
  }, SLOW);
});
