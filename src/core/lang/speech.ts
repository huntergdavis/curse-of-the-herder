// Placeholder mouth for the herder until the grammar engine lands (Phase 2).
// Tier 0/1 only: single words and two-word grunts, chosen deterministically.

import { keyedUnit } from "../rng";
import { levelFor, erudition, filthCeiling, curseIntervalSeconds } from "../progression";
import { hoursElapsed, type WorldEvent, type WorldState } from "../sim/state";
import { sheepName } from "../names";

export interface Utterance {
  text: string;
  /** 0..1 how hot the delivery is (bubble styling). */
  heat: number;
  /** Seconds to hold the bubble. */
  seconds: number;
}

const IDLE_0 = ["Sheep.", "Ugh.", "Hmph.", "Why.", "Legs.", "Wool.", "Hill.", "Mud.", "Bah.", "Far.", "Again.", "No."];
const IDLE_1 = ["Bad sheep.", "Stupid hill.", "Wet grass.", "Long day.", "Sore back.", "More sheep.", "Not again.", "Heavy sheep.", "Cold wind.", "Too far."];
const PENNED = ["Good.", "One.", "Stay.", "There.", "Sit.", "Done. One.", "In. Stay in."];
const CAUGHT = ["Got you.", "Mine.", "Come.", "Up we go.", "Heavy.", "Hnngh."];
const FLEE = ["NO.", "Hey!", "Wait!", "Stop!", "Come BACK.", "Sheep! No!"];
const REPEAT = ["YOU. AGAIN.", "Not you.", "Oh no. Not you.", "I know you."];
const ABSURD = ["Why. Up. There.", "How.", "HOW.", "Roof. Why roof.", "Why here?!", "Rocks. Really."];
const MUTTER_DUSK = ["Dark soon.", "Sun low.", "Still sheep.", "Tired."];

function pick(list: readonly string[], w: WorldState, purpose: string, salt: number): string {
  return list[Math.floor(keyedUnit(w.seed, purpose, salt, w.tick) * list.length)] ?? list[0] ?? "Ugh.";
}

export function speakForEvent(w: WorldState, e: WorldEvent): Utterance | null {
  const heat = Math.min(1, w.frustration / 100 + 0.1);
  switch (e.kind) {
    case "penned":
      return { text: pick(PENNED, w, "penned", e.sheepId), heat: heat * 0.4, seconds: 2.5 };
    case "caught":
      return { text: pick(CAUGHT, w, "caught", e.sheepId), heat: heat * 0.6, seconds: 2.5 };
    case "flee":
      return { text: pick(FLEE, w, "flee", e.sheepId), heat: Math.max(0.5, heat), seconds: 3 };
    case "repeatEscape": {
      const name = sheepName(w.seed, e.sheepId);
      const line = pick(REPEAT, w, "repeat", e.sheepId);
      return { text: keyedUnit(w.seed, "name-it", e.sheepId) < 0.6 ? `${name}. ${line}` : line, heat: Math.max(0.7, heat), seconds: 3.5 };
    }
    case "absurd":
      return { text: pick(ABSURD, w, "absurd", e.sheepId), heat: Math.max(0.6, heat), seconds: 3.5 };
    case "finished":
      return { text: "...All of them. All of you. In.", heat: 1, seconds: 8 };
    default:
      return null;
  }
}

export function speakIdle(w: WorldState): Utterance {
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const band = filthCeiling(w.frustration);
  const hour = 9 + hoursElapsed(w);
  const list = hour > 16.5 && keyedUnit(w.seed, "dusk", w.tick) < 0.4 ? MUTTER_DUSK : level >= 1 ? IDLE_1 : IDLE_0;
  let text = pick(list, w, "idle", level);
  if (band >= 2) text = text.toUpperCase();
  if (band >= 3) text = text.replace(/\.$/, "!");
  return { text, heat: w.frustration / 100, seconds: 2.5 + text.length * 0.05 };
}

export function nextIdleCurseTicks(w: WorldState): number {
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const seconds = curseIntervalSeconds(level, w.frustration);
  const jitter = 0.7 + keyedUnit(w.seed, "curse-jitter", w.tick) * 0.6;
  return Math.max(20, Math.round((seconds * jitter) / 0.25));
}
