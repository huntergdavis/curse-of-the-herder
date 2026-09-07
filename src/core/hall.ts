// The Hall of Herders: immutable, content-addressed induction records.
import { fnv1a } from "./rng";
import { LEVEL_NAMES, erudition, levelFor } from "./progression";
import { dayHour, hoursElapsed, type WorldState } from "./sim/state";
import { BOOK_BY_ID } from "../data/books";
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
  /** What he read, in order, and a taste of what each book gave him. */
  reading: { title: string; author: string; clock: string; taught: string[] }[];
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
    reading: w.readingList.map((r) => {
      const b = BOOK_BY_ID.get(r.bookId);
      return {
        title: b?.title ?? r.bookId,
        author: b?.author ?? "",
        clock: fmtClock(9 + r.tick / 14400),
        taught: b?.pack ? tasteOfPack(packEntries(b.pack), w.seed + r.bookId) : [],
      };
    }),
  };
  const hash = fnv1a(JSON.stringify([body.seed, w.createdAt, body.epitaph])).toString(16).padStart(8, "0");
  return { id: `herder:${hash}`, ...body };
}
