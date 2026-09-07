// The Hall of Herders: immutable, content-addressed induction records.
import { fnv1a } from "./rng";
import { LEVEL_NAMES, erudition, levelFor } from "./progression";
import { dayHour, hoursElapsed, type WorldState } from "./sim/state";

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
}

export function fmtClock(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function makeHallRecord(w: WorldState, epitaph: string, vocabulary: number, signatureWord: string, now = new Date()): HallRecord {
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
  };
  const hash = fnv1a(JSON.stringify([body.seed, w.createdAt, body.epitaph])).toString(16).padStart(8, "0");
  return { id: `herder:${hash}`, ...body };
}
