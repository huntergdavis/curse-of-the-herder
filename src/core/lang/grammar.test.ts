import { describe, expect, it } from "vitest";
import { CORE_PACKS } from "../../data/lexicon/core-packs";
import { NON_TERMINALS, RULES } from "../../data/grammar/tiers-0-4";
import { findBanned } from "./banned";
import { Grammar } from "./grammar";
import type { Band, Context, RuleEvent } from "./types";

const grammar = new Grammar(CORE_PACKS, RULES, NON_TERMINALS);

function ctx(level: number, band: Band, tick = 1): Context {
  return {
    seed: "test",
    tick,
    level,
    band,
    heat: band / 4,
    hour: 9 + level * 0.7,
    target: { kind: "sheep", noun: "sheep", name: tick % 2 ? "Gerald" : null, plural: false },
    registers: [],
    signatureWord: "turnip",
    sheepRemaining: 60 - level * 4,
    sheepPenned: level * 4,
    booksRead: level,
    recent: [],
    knownPacks: [],
    villageName: "Muttonham",
    stats: { flees: 3, absurds: 1, shames: 2, rains: 1, breathers: 0, books: level },
  };
}

const EVENTS: RuleEvent[] = ["idle", "flee", "caught", "penned", "absurd", "repeatEscape", "finished", "epitaph", "book", "walkOfShame", "rain", "dusk", "breather"];

describe("lexicon and templates", () => {
  it("contain no banned words", () => {
    for (const p of CORE_PACKS) for (const e of p.entries) expect(findBanned(e.w), `${p.id}: ${e.w}`).toBeNull();
    for (const r of RULES) expect(findBanned(r.template), r.id).toBeNull();
    for (const nt of NON_TERMINALS) for (const o of nt.options) expect(findBanned(o.t), nt.symbol).toBeNull();
  });
  it("every pack has a review date", () => {
    for (const p of CORE_PACKS) expect(p.reviewedAt, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("no template expands to nothing at its own tier", () => {
    for (const r of RULES) {
      const c = ctx(Math.max(r.tier, r.minLevel ?? 0), 4, 7);
      const g = new Grammar(CORE_PACKS, [r], NON_TERMINALS);
      const out = g.generate(r.event, c);
      expect(out, r.id).not.toBeNull();
    }
  });
});

describe("generate", () => {
  it("is deterministic", () => {
    const a = grammar.generate("idle", ctx(4, 3, 99));
    const b = grammar.generate("idle", ctx(4, 3, 99));
    expect(a?.text).toBe(b?.text);
  });

  it("never emits banned words or words above the filth ceiling (never-emit)", () => {
    // Tokens that only ever appear in entries above the ceiling.
    const above = new Map<Band, RegExp>();
    const STOP = new Set(["this", "that", "with", "your", "sake", "into", "upon", "take", "well", "never", "much", "sideways", "hell's"]);
    const tokens = (w: string): string[] => w.toLowerCase().split(/[^a-z'-]+/).filter((t) => t && !STOP.has(t));
    for (const band of [0, 1, 2, 3] as Band[]) {
      const ok = new Set(grammar.lexicon.filter((e) => e.band <= band).flatMap((e) => tokens(e.w)));
      const words = new Set(grammar.lexicon.filter((e) => e.band > band).flatMap((e) => tokens(e.w)).filter((t) => !ok.has(t) && t.length > 3));
      above.set(band, new RegExp(`\\b(?:${[...words].map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i"));
    }
    let produced = 0;
    for (let level = 0; level <= 8; level++) {
      for (const band of [0, 1, 2, 3, 4] as Band[]) {
        for (const ev of EVENTS) {
          for (let tick = 0; tick < 40; tick++) {
            const out = grammar.generate(ev, ctx(level, band, tick * 37 + level));
            if (!out) continue;
            produced++;
            expect(findBanned(out.text), out.text).toBeNull();
            const re = above.get(band);
            if (re) expect(re.test(out.text), `${out.text} exceeds band ${band}`).toBe(false);
            expect(out.text.length).toBeLessThanOrEqual(240);
          }
        }
      }
    }
    expect(produced).toBeGreaterThan(15000);
  }, 120_000);

  it("does not repeat itself much across a long stretch", () => {
    const seen = new Set<string>();
    const recent: string[] = [];
    let n = 0;
    for (let tick = 0; tick < 400; tick++) {
      const c = ctx(4, 2, tick * 91);
      c.recent = recent;
      const out = grammar.generate("idle", c);
      if (!out) continue;
      n++;
      seen.add(out.text);
      recent.push(out.text);
      if (recent.length > 32) recent.shift();
    }
    expect(seen.size / n).toBeGreaterThan(0.9);
  });

  it("gets longer and more elaborate as the level rises", () => {
    const avg = (level: number): number => {
      let total = 0;
      let n = 0;
      for (let t = 0; t < 60; t++) {
        const out = grammar.generate("idle", ctx(level, 2, t * 13));
        if (out) { total += out.text.length; n++; }
      }
      return total / n;
    };
    expect(avg(0)).toBeLessThan(avg(2));
    expect(avg(2)).toBeLessThan(avg(4));
  });

  it("uses the sheep's name when it has one", () => {
    let named = 0;
    for (let t = 1; t < 80; t += 2) {
      const out = grammar.generate("repeatEscape", ctx(3, 2, t));
      if (out?.text.includes("Gerald")) named++;
    }
    expect(named).toBeGreaterThan(20);
  });
});
