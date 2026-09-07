import { describe, expect, it } from "vitest";
import { checkForUpdate } from "./automatic-update";

function fakeFetch(body: unknown, ok = true): typeof fetch {
  return (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;
}

const store = new Map<string, string>();
(globalThis as unknown as { sessionStorage: Storage }).sessionStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

describe("checkForUpdate", () => {
  it("does nothing when the version matches", async () => {
    let reloaded = false;
    const r = await checkForUpdate({ currentVersion: "1.0.0", versionUrl: "v", beforeReload: async () => {}, fetchImpl: fakeFetch({ version: "1.0.0" }), reload: () => { reloaded = true; }, isHidden: () => false });
    expect(r).toBe("same");
    expect(reloaded).toBe(false);
  });
  it("flushes then reloads once for a new version, never twice for the same build", async () => {
    store.clear();
    let flushed = 0;
    let reloaded = 0;
    const opts = { currentVersion: "1.0.0", versionUrl: "v", beforeReload: async () => { flushed++; }, fetchImpl: fakeFetch({ version: "1.1.0", builtAt: "t" }), reload: () => { reloaded++; }, isHidden: () => false };
    expect(await checkForUpdate(opts)).toBe("reloading");
    expect(await checkForUpdate(opts)).toBe("skipped");
    expect(flushed).toBe(1);
    expect(reloaded).toBe(1);
  });
  it("skips while hidden and reports errors quietly", async () => {
    expect(await checkForUpdate({ currentVersion: "1", versionUrl: "v", beforeReload: async () => {}, fetchImpl: fakeFetch({ version: "2" }), isHidden: () => true })).toBe("skipped");
    expect(await checkForUpdate({ currentVersion: "1", versionUrl: "v", beforeReload: async () => {}, fetchImpl: fakeFetch({}, false), isHidden: () => false })).toBe("error");
  });
});
