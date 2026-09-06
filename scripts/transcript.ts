// Print a day's worth of the herder's lines from a headless simulation.
//   npx tsx scripts/transcript.ts --seed demo --books 24 --hours 9
// Books are faked: one is "read" every (hours*60/books) minutes so the
// level curve resembles a real day before the library system exists.
import { generateMap } from "../src/core/map/generate";
import { nextIdleCurseTicks, speakForEvent, speakIdle, speakEpitaph } from "../src/core/lang/speech";
import { erudition, levelFor, LEVEL_NAMES } from "../src/core/progression";
import { createWorld, hoursElapsed, TICKS_PER_HOUR } from "../src/core/sim/state";
import { step } from "../src/core/sim/step";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i]!.replace(/^--/, ""), process.argv[i + 1] ?? "");
const seed = args.get("seed") ?? "demo";
const books = Number(args.get("books") ?? 24);
const hours = Number(args.get("hours") ?? 9);
const filth = args.get("filth"); // "max" pins frustration high

const map = generateMap(seed, { size: 512 });
const w = createWorld(seed, map, 0);
const recent: string[] = [];
let nextIdle = nextIdleCurseTicks(w);
let seen = w.events.length;
const bookEvery = Math.floor((hours * TICKS_PER_HOUR) / (books + 1));
const clock = (): string => {
  const h = 9 + hoursElapsed(w);
  return `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;
};
const lvl = (): string => `L${levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)))}`;
const say = (kind: string, text: string): void => {
  console.log(`${clock()} ${lvl()} f${String(Math.round(w.frustration)).padStart(3)} [${kind.padEnd(12)}] ${text}`);
  recent.push(text);
  if (recent.length > 32) recent.shift();
};
console.log(`# ${w.name} — seed ${seed} — ${w.sheep.length} sheep`);
while (!w.finished && w.tick < hours * 1.5 * TICKS_PER_HOUR) {
  step(w, map);
  if (filth === "max") w.frustration = Math.max(w.frustration, 92);
  if (w.tick % bookEvery === 0 && w.booksRead < books) {
    w.booksRead++;
    w.frustration = Math.max(0, w.frustration - 10);
    say("book", `(reads a book: ${w.booksRead}) → ${LEVEL_NAMES[levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)))]}`);
    const u = speakForEvent(w, map, { tick: w.tick, kind: "book", sheepId: -1 }, recent);
    if (u) say("book", u.text);
  }
  for (const e of w.events.slice(seen)) {
    const u = speakForEvent(w, map, e, recent);
    if (u) say(e.kind, u.text);
  }
  seen = w.events.length;
  if (w.tick >= nextIdle) {
    const u = speakIdle(w, map, recent);
    if (u) say("idle", u.text);
    nextIdle = w.tick + nextIdleCurseTicks(w);
  }
}
const ep = speakEpitaph(w, map, recent);
console.log(`\nEPITAPH: ${ep.text}`);
console.log(`finished=${w.finished} at ${clock()}, penned ${w.sheepPenned}/${w.sheep.length}, lines ${recent.length}+`);
