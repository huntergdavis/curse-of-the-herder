// The Hall of Herders: immutable, content-addressed induction records.
import { fnv1a } from "./rng";
import { LEVEL_NAMES, erudition, levelFor } from "./progression";
import { dayHour, hoursElapsed, type WorldState } from "./sim/state";
import { BOOK_BY_ID } from "../data/books";
import { dogName, sheepName } from "./names";
import type { LexEntry } from "./lang/types";

export const HALL_SCHEMA = 1;

export interface HallRecord {
  schemaVersion: typeof HALL_SCHEMA;
  /** "herder:<hash>" so the same day can never be inducted twice. */
  id: string;
  name: string;
  seed: string;
  /** ISO date of induction (wall clock). */
  inductedAt: string;
  finishedClock: string;
  hoursOnTheJob: number;
  sheep: number;
  booksRead: number;
  totalCurses: number;
  vocabulary: number;
  level: number;
  levelName: string;
  longestLine: string;
  epitaph: string;
  signatureWord: string;
  dogName?: string | undefined;
  jailbreaks?: number | undefined;
  /** Times the neighbour strolled past with his tidy flock. */
  rivalsSeen?: number | undefined;
  /** The sheep with the most escapes, if any escaped twice or more. */
  sheepOfTheDay?: { name: string; flees: number } | undefined;
  /** The sheep he declared his personal enemy, if any earned it. */
  nemesis?: { name: string; flees: number } | undefined;
  /** The day's best lines. */
  highlights?: { text: string; clock: string }[] | undefined;
  /** Every sheep that earned a name today. */
  namedSheep?: { name: string; flees: number }[] | undefined;
  /** Most-used lexicon word and its favourite target. */
  favouriteWord?: { w: string; n: number; mostly: string } | undefined;
  /** What he read, in order, and a taste of what each book gave him. */
  reading: { title: string; author: string; clock: string; taught: string[]; used?: { w: string; n: number; mostly: string }[] }[];
}

export function fmtClock(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** A few distinctive words from a pack, deterministic per herder. */
export function tasteOfPack(entries: LexEntry[], seed: string, count = 4): string[] {
  const pool = entries.filter((e) => e.pos === "insult" || e.pos === "adj" || e.pos === "oath" || e.pos === "simile" || e.pos === "abstract");
  const src = pool.length >= count ? pool : entries;
  const out: string[] = [];
  let h = fnv1a(seed);
  for (let i = 0; i < src.length && out.length < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const e = src[h % src.length]!;
    if (!out.includes(e.w)) out.push(e.w);
  }
  return out;
}

export function makeHallRecord(w: WorldState, epitaph: string, vocabulary: number, signatureWord: string, packEntries: (packId: string) => LexEntry[], now = new Date()): HallRecord {
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const body = {
    schemaVersion: HALL_SCHEMA as typeof HALL_SCHEMA,
    name: w.name,
    seed: w.seed,
    inductedAt: now.toISOString(),
    finishedClock: fmtClock(dayHour(w)),
    hoursOnTheJob: Math.round(hoursElapsed(w) * 100) / 100,
    sheep: w.sheepPenned,
    booksRead: w.booksRead,
    totalCurses: w.totalCurses,
    vocabulary,
    level,
    levelName: LEVEL_NAMES[level] ?? "",
    longestLine: w.longestLine,
    epitaph,
    signatureWord,
    dogName: dogName(w.seed),
    jailbreaks: w.jailbreaks,
    rivalsSeen: w.rivalsSeen,
    sheepOfTheDay: (() => {
      const top = [...w.sheep].sort((a, b) => b.flees - a.flees)[0];
      return top && top.flees >= 2 ? { name: sheepName(w.seed, top.id), flees: top.flees } : undefined;
    })(),
    nemesis: (() => {
      const n = w.sheep.find((o) => o.nemesis);
      return n ? { name: sheepName(w.seed, n.id), flees: n.flees } : undefined;
    })(),
    highlights: [...w.highlights].sort((a, b) => b.score - a.score).slice(0, 5).map((h) => ({ text: h.text, clock: h.clock })),
    namedSheep: w.sheep.filter((s) => s.named).sort((a, b) => b.flees - a.flees).map((s) => ({ name: sheepName(w.seed, s.id), flees: s.flees })),
    favouriteWord: (() => {
      const top = Object.entries(w.wordUse).sort((a, b) => b[1].n - a[1].n)[0];
      if (!top || top[1].n < 2) return undefined;
      return { w: top[0], n: top[1].n, mostly: Object.entries(top[1].at).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "" };
    })(),
    reading: w.readingList.map((r) => {
      const b = BOOK_BY_ID.get(r.bookId);
      const entries = b?.pack ? packEntries(b.pack) : [];
      const used = entries
        .map((e) => ({ w: e.w, u: w.wordUse[e.w] }))
        .filter((x): x is { w: string; u: { n: number; at: Record<string, number> } } => !!x.u)
        .sort((a, b2) => b2.u.n - a.u.n)
        .slice(0, 3)
        .map((x) => ({ w: x.w, n: x.u.n, mostly: Object.entries(x.u.at).sort((a, b2) => b2[1] - a[1])[0]?.[0] ?? "" }));
      return {
        title: b?.title ?? r.bookId,
        author: b?.author ?? "",
        clock: fmtClock(9 + r.tick / 14400),
        taught: used.length >= 2 ? used.map((x) => x.w) : b?.pack ? tasteOfPack(entries, w.seed + r.bookId) : [],
        used,
      };
    }),
  };
  const hash = fnv1a(JSON.stringify([body.seed, w.createdAt, body.epitaph])).toString(16).padStart(8, "0");
  return { id: `herder:${hash}`, ...body };
}
