import { describe, expect, it } from "vitest";
import { findBanned } from "../core/lang/banned";
import { BOOKS } from "./books";

describe("books", () => {
  it("have unique ids and no banned words in titles or excerpts", () => {
    const ids = new Set<string>();
    for (const b of BOOKS) {
      expect(ids.has(b.id), b.id).toBe(false);
      ids.add(b.id);
      expect(findBanned(b.title), b.title).toBeNull();
      for (const e of b.excerpts) expect(findBanned(e), e).toBeNull();
      expect(b.excerpts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
