import { describe, expect, it } from "vitest";
import { dayTint } from "./palette";

describe("dayTint", () => {
  it("is smooth: no frame in the dusk fade drops the tint", () => {
    let prev = dayTint(17.0).a;
    for (let h = 17.0; h <= 19.5; h += 0.003) {
      const a = dayTint(h).a;
      expect(Math.abs(a - prev)).toBeLessThan(0.01);
      prev = a;
    }
    expect(dayTint(12).a).toBe(0);
    expect(dayTint(19).a).toBeGreaterThan(0.4);
  });
});
