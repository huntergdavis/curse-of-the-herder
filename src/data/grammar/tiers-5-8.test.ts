import { describe, expect, it } from "vitest";
import { findBanned } from "../../core/lang/banned";
import { Grammar } from "../../core/lang/grammar";
import type { Band, Context, RuleEvent } from "../../core/lang/types";
import { CORE_PACKS } from "../lexicon/core-packs";
import { PACKS_5_8 } from "../lexicon/packs-5-8";
import { NON_TERMINALS, RULES } from "./tiers-0-4";
import { NON_TERMINALS_5_8, RULES_5_8 } from "./tiers-5-8";

const packs = [...CORE_PACKS, ...PACKS_5_8];
const rules = [...RULES, ...RULES_5_8];
const nts = [...NON_TERMINALS, ...NON_TERMINALS_5_8];
const grammar = new Grammar(packs, rules, nts);

function ctx(level: number, band: Band, tick = 1): Context {
  return {
    seed: "test58",
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
  };
}

const EVENTS: RuleEvent[] = ["idle", "flee", "caught", "penned", "absurd", "repeatEscape", "finished", "epitaph", "book", "walkOfShame", "rain", "dusk", "breather"];

describe("packs 5-8", () => {
  it("contain no banned words", () => {
    for (const p of PACKS_5_8) for (const e of p.entries) expect(findBanned(e.w), `${p.id}: ${e.w}`).toBeNull();
    for (const r of RULES_5_8) expect(findBanned(r.template), r.id).toBeNull();
    for (const nt of NON_TERMINALS_5_8) for (const o of nt.options) expect(findBanned(o.t), nt.symbol).toBeNull();
  });
  it("every pack has a review date", () => {
    for (const p of PACKS_5_8) expect(p.reviewedAt, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("rule ids do not collide with tiers 0-4", () => {
    const ids = new Set(RULES.map((r) => r.id));
    for (const r of RULES_5_8) expect(ids.has(r.id), r.id).toBe(false);
  });
  it("every rule expands at its own tier", () => {
    for (const r of RULES_5_8) {
      const g = new Grammar(packs, [r], nts);
      const out = g.generate(r.event, ctx(Math.max(r.tier, r.minLevel ?? 0), 4, 7));
      expect(out, r.id).not.toBeNull();
    }
  }, 120_000);
  it("never emits a banned word across levels 5-9", () => {
    let produced = 0;
    for (let level = 5; level <= 9; level++) {
      for (const band of [0, 1, 2, 3, 4] as Band[]) {
        for (const ev of EVENTS) {
          for (let tick = 0; tick < 15; tick++) {
            const out = grammar.generate(ev, ctx(level, band, tick * 53 + level));
            if (!out) continue;
            produced++;
            expect(findBanned(out.text), out.text).toBeNull();
            expect(out.text.length).toBeLessThanOrEqual(240);
          }
        }
      }
    }
    expect(produced).toBeGreaterThan(3000);
  }, 120_000);
});
