import type { GameMap } from "../map/generate";
import { findPath } from "../map/path";
import { Deco, TERRAIN_SPEED, Terrain, isWalkable } from "../map/terrain";
import { FRUSTRATION, clampFrustration, frustrationBaseline, frustrationDrift } from "../progression";
import { keyedUnit } from "../rng";
import { MAX_EVENTS, TICK_SECONDS, TICKS_PER_HOUR, type SheepState, type WorldEvent, type WorldState } from "./state";
import { BOOKS, BOOK_BY_ID } from "../../data/books";

export const HERDER_BASE_SPEED = 1.1; // tiles per second on grass (tuned by scripts/pace.ts)
const CARRY_FACTOR = 0.8;
const FLEE_RADIUS = 2.5;
const MAX_FLEES = 3;
const SEE_RADIUS = 12;
const LIBRARY_DETOUR = 12; // tiles from the herder himself
const LIBRARY_PATH_DETOUR = 9; // tiles from any point on his planned route
const GOVERNOR_PERIOD = 2400; // ticks (10 sim minutes)
const DAY_TICKS = 9 * 3600 * 4;
const READ_TICKS_MIN = 240; // 60 s
const READ_TICKS_MAX = 480; // 120 s
const REGISTER_TICKS = 2400; // 10 min of talking like the book
const READ_COOLDOWN = 9 * 60 * 4; // no second book within 9 sim minutes
const SHAME_RADIUS = 4;
const SHAME_COOLDOWN = 15 * 60 * 4;
const BREATHER_TICKS = 80; // 20 s sit-down
const BREATHER_COOLDOWN = 25 * 60 * 4;
const RANT_TICKS = 12; // 3 s of shaking fists at the sky
const RANT_COOLDOWN = 3 * 60 * 4;

function pushEvent(w: WorldState, e: Omit<WorldEvent, "seq">): void {
  w.events.push({ ...e, seq: w.eventCount++ });
  if (w.events.length > MAX_EVENTS) w.events.splice(0, w.events.length - MAX_EVENTS);
}

function addFrustration(w: WorldState, amount: number): void {
  w.frustration = clampFrustration(w.frustration + amount);
}

/** Herder paths treat fences as walls; everything else uses terrain cost. */
function herderCost(map: GameMap): (x: number, y: number, base: number) => number {
  return (x, y, base) => (map.deco[y * map.size + x] === Deco.Fence ? Infinity : base);
}

function tileAt(map: GameMap, x: number, y: number): number {
  const tx = Math.round(x);
  const ty = Math.round(y);
  if (tx < 0 || ty < 0 || tx >= map.size || ty >= map.size) return Terrain.Water;
  return map.terrain[ty * map.size + tx]!;
}

function chooseTarget(w: WorldState, map: GameMap): SheepState | null {
  // At the pen, "nearest by path" is the pen distance field; elsewhere fall
  // back to Euclidean distance from the herder, biased outward by ring so
  // the day escalates.
  let best: SheepState | null = null;
  let bestScore = Infinity;
  const h = w.herder;
  const atPen = Math.hypot(h.x - map.pen.x, h.y - map.pen.y) < 5;
  for (const s of w.sheep) {
    if (s.mode !== "loose") continue;
    // Sheep positions are fractional while they amble; the field is indexed by tile.
    const byPath = map.penDistance[Math.round(s.y) * map.size + Math.round(s.x)];
    let score = atPen && byPath !== undefined && Number.isFinite(byPath) ? byPath : Math.hypot(s.x - h.x, s.y - h.y) * (1 + s.ring * 0.05);
    if (!Number.isFinite(score)) score = 1e9; // never lose a sheep to a bad index; he will go and look
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

function planPath(w: WorldState, map: GameMap, tx: number, ty: number): boolean {
  const h = w.herder;
  const path = findPath(map, Math.round(h.x), Math.round(h.y), tx, ty, herderCost(map));
  if (!path) return false;
  h.path = path;
  return true;
}

/** Path to a sheep, or to the doorstep beside it when it is on a roof. */
function planToSheep(w: WorldState, map: GameMap, s: SheepState): boolean {
  const tx = Math.round(s.tx);
  const ty = Math.round(s.ty);
  if (!s.onRoof) return planPath(w, map, tx, ty);
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1]] as const) {
    const i = (ty + dy) * map.size + (tx + dx);
    if (map.deco[i] === Deco.House || map.deco[i] === Deco.HouseRed || map.deco[i] === Deco.Fence) continue;
    if (planPath(w, map, tx + dx, ty + dy)) return true;
  }
  return false;
}

/** Move along the path by up to `budget` tiles; returns tiles actually moved. */
function walk(w: WorldState, budget: number): number {
  const h = w.herder;
  let moved = 0;
  while (budget > 0 && h.path.length > 0) {
    const next = h.path[0]!;
    const dx = next.x - h.x;
    const dy = next.y - h.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1e-6) {
      h.path.shift();
      continue;
    }
    const step = Math.min(dist, budget);
    h.x += (dx / dist) * step;
    h.y += (dy / dist) * step;
    budget -= step;
    moved += step;
    if (Math.abs(dx) > Math.abs(dy)) h.facing = dx > 0 ? 0 : 2;
    else h.facing = dy > 0 ? 1 : 3;
    if (step >= dist - 1e-6) {
      h.x = next.x;
      h.y = next.y;
      h.path.shift();
    }
  }
  return moved;
}

function fleeTo(w: WorldState, map: GameMap, s: SheepState): void {
  const h = w.herder;
  const ax = s.x - h.x;
  const ay = s.y - h.y;
  const len = Math.hypot(ax, ay) || 1;
  // Try a fan of directions away from the herder, far first.
  for (let attempt = 0; attempt < 24; attempt++) {
    const spread = (keyedUnit(w.seed, "flee-dir", s.id, s.flees, attempt) - 0.5) * Math.PI * 0.9;
    const r = 9 - Math.floor(attempt / 6) * 1.5;
    const ang = Math.atan2(ay, ax) + spread;
    const x = Math.round(s.x + Math.cos(ang) * r);
    const y = Math.round(s.y + Math.sin(ang) * r);
    if (x < 1 || y < 1 || x >= map.size - 1 || y >= map.size - 1) continue;
    const i = y * map.size + x;
    if (!isWalkable(map.terrain[i]!) || !Number.isFinite(map.penDistance[i]!)) continue;
    if (map.deco[i] === Deco.Fence || map.deco[i] === Deco.PenGround || map.deco[i] === Deco.House || map.deco[i] === Deco.HouseRed) continue;
    s.tx = x;
    s.ty = y;
    s.speed = 3.2;
    void len;
    return;
  }
}

function stepSheep(w: WorldState, map: GameMap): void {
  const h = w.herder;
  for (const s of w.sheep) {
    if (s.mode !== "loose") continue;
    const d = Math.hypot(s.x - h.x, s.y - h.y);
    if (!s.seen && d < SEE_RADIUS) s.seen = true;
    // Move toward the current target at the current speed.
    const dx = s.tx - s.x;
    const dy = s.ty - s.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1e-3) {
      const stepLen = Math.min(dist, (s.speed || 0.6) * TICK_SECONDS);
      s.x += (dx / dist) * stepLen;
      s.y += (dy / dist) * stepLen;
      if (stepLen >= dist - 1e-6) {
        s.x = s.tx;
        s.y = s.ty;
        s.speed = 0;
      }
      continue;
    }
    // Stranded sheep stay stranded; the others amble a tile within the leash now and then.
    if (s.absurd) continue;
    if (w.tick % 40 === s.id % 40 && keyedUnit(w.seed, "wander", s.id, w.tick) < 0.5 && d > 3) {
      const dir = Math.floor(keyedUnit(w.seed, "wander-dir", s.id, w.tick) * 4);
      const nx = Math.round(s.x) + [1, -1, 0, 0][dir]!;
      const ny = Math.round(s.y) + [0, 0, 1, -1][dir]!;
      if (Math.abs(nx - s.homeX) <= 2 && Math.abs(ny - s.homeY) <= 2 && nx > 0 && ny > 0 && nx < map.size - 1 && ny < map.size - 1) {
        const i = ny * map.size + nx;
        if (isWalkable(map.terrain[i]!) && map.deco[i] !== Deco.Fence && map.deco[i] !== Deco.House && map.deco[i] !== Deco.HouseRed && map.deco[i] !== Deco.Library) {
          s.tx = nx;
          s.ty = ny;
          s.speed = 0.6;
        }
      }
    }
  }
}

/** Nearest untaken library within detour range of the herder, or -1. */
function nearbyLibrary(w: WorldState): number {
  const h = w.herder;
  let best = -1;
  let bestD = LIBRARY_DETOUR;
  for (let i = 0; i < w.libraries.length; i++) {
    const l = w.libraries[i]!;
    if (l.taken) continue;
    const d = Math.hypot(l.x - h.x, l.y - h.y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** An untaken library close to the planned route (sampled), or -1. */
function libraryAlongPath(w: WorldState): number {
  const path = w.herder.path;
  for (let i = 0; i < w.libraries.length; i++) {
    const l = w.libraries[i]!;
    if (l.taken) continue;
    for (let k = 0; k < path.length; k += 4) {
      const p = path[k]!;
      if (Math.abs(p.x - l.x) <= LIBRARY_PATH_DETOUR && Math.abs(p.y - l.y) <= LIBRARY_PATH_DETOUR) return i;
    }
  }
  return -1;
}

function goToLibrary(w: WorldState, map: GameMap, lib: number): boolean {
  const h = w.herder;
  const l = w.libraries[lib]!;
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]] as const) {
    if (planPath(w, map, l.x + dx, l.y + dy)) {
      h.targetLibrary = lib;
      h.mode = "toLibrary";
      return true;
    }
  }
  l.taken = true; // unreachable box: forget it
  return false;
}

/**
 * Steer the finish toward the nine-hour mark. Work done is the share of
 * total pen-distance already carried home; if that is ahead of the clock,
 * slow the herder (never above 1.0: a lingering herder reads as tired).
 */
function govern(w: WorldState): void {
  if (w.tick % GOVERNOR_PERIOD !== 0 || w.totalWork <= 0) return;
  let done = 0;
  for (const s of w.sheep) if (s.mode === "penned") done += s.homeX >= 0 ? 1 : 0;
  const workFrac = w.sheepPenned === 0 ? 0 : done / w.sheep.length;
  const timeFrac = w.tick / DAY_TICKS;
  const ahead = workFrac - timeFrac;
  const target = ahead > 0.02 ? Math.max(0.5, 1 - ahead * 3.0) : 1;
  // Hysteresis: move a third of the way each period.
  w.speedScale += (target - w.speedScale) / 3;
}

/** Books come in catalogue order no matter which box he opens; extras are bonus re-reads. */
function nextBookId(w: WorldState): string {
  const read = new Set(w.libraries.filter((l) => l.taken).map((l) => l.bookId));
  const ordered = [...BOOKS].sort((a, b) => a.when - b.when);
  const remainingBoxes = w.libraries.filter((l) => !l.taken).length;
  const unread = ordered.filter((b) => !read.has(b.id));
  // Save "Notes on the Curse" for the very last box.
  const notes = unread.find((b) => b.id === "notes");
  const pool = remainingBoxes > 1 && notes && unread.length > 1 ? unread.filter((b) => b.id !== "notes") : unread;
  if (pool.length > 0) return pool[0]!.id;
  const bonus = ordered.filter((b) => b.pack && b.id !== "notes");
  return bonus[Math.floor(keyedUnit(w.seed, "bonus-book", w.tick) * bonus.length)]?.id ?? ordered[0]!.id;
}

function startReading(w: WorldState, libIndex: number): void {
  const h = w.herder;
  const lib = w.libraries[libIndex]!;
  lib.bookId = nextBookId(w);
  const len = READ_TICKS_MIN + Math.floor(keyedUnit(w.seed, "read-len", libIndex) * (READ_TICKS_MAX - READ_TICKS_MIN));
  w.reading = { bookId: lib.bookId, startTick: w.tick, untilTick: w.tick + len };
  h.mode = "reading";
  h.path = [];
  pushEvent(w, { tick: w.tick, kind: "bookFound", sheepId: -1, bookId: lib.bookId });
}

function finishReading(w: WorldState): void {
  const h = w.herder;
  const r = w.reading;
  if (r) {
    const lib = w.libraries[h.targetLibrary];
    if (lib) lib.taken = true;
    const book = BOOK_BY_ID.get(r.bookId);
    w.booksRead++;
    w.stats.books++;
    addFrustration(w, FRUSTRATION.book);
    if (book?.pack && !w.knownPacks.includes(book.pack)) w.knownPacks.push(book.pack);
    if (book?.register) {
      w.registers = w.registers.filter((x) => x.reg !== book.register);
      w.registers.push({ reg: book.register, untilTick: w.tick + REGISTER_TICKS });
    }
    pushEvent(w, { tick: w.tick, kind: "book", sheepId: -1, bookId: r.bookId });
  }
  w.reading = null;
  w.lastReadTick = w.tick;
  h.targetLibrary = -1;
  h.mode = "idle";
}

function readingAllowed(w: WorldState): boolean {
  if (w.tick - w.lastReadTick > READ_COOLDOWN) return true;
  // The last box is always worth it.
  return w.libraries.filter((l) => !l.taken).length <= 1;
}

function stepWeather(w: WorldState): void {
  if (w.rainUntilTick && w.tick >= w.rainUntilTick) {
    w.rainUntilTick = 0;
    pushEvent(w, { tick: w.tick, kind: "rainStops", sheepId: -1 });
  }
  if (w.fogUntilTick && w.tick >= w.fogUntilTick) {
    w.fogUntilTick = 0;
    pushEvent(w, { tick: w.tick, kind: "fogLifts", sheepId: -1 });
  }
  if (w.tick >= w.nextWeatherTick) {
    const u = keyedUnit(w.seed, "weather", w.tick);
    if (u < 0.45 && !w.rainUntilTick) {
      w.rainUntilTick = w.tick + 8 * 60 * 4 + Math.floor(keyedUnit(w.seed, "rain-len", w.tick) * 14 * 60 * 4);
      w.stats.rains++;
      pushEvent(w, { tick: w.tick, kind: "rain", sheepId: -1 });
    } else if (u < 0.62 && !w.fogUntilTick && !w.rainUntilTick) {
      w.fogUntilTick = w.tick + 6 * 60 * 4 + Math.floor(keyedUnit(w.seed, "fog-len", w.tick) * 10 * 60 * 4);
      pushEvent(w, { tick: w.tick, kind: "fog", sheepId: -1 });
    }
    w.nextWeatherTick = w.tick + 30 * 60 * 4 + Math.floor(keyedUnit(w.seed, "weather-gap", w.tick) * 50 * 60 * 4);
  }
  if (w.rainUntilTick && w.tick % 4 === 0) addFrustration(w, FRUSTRATION.rainPerMinute / 60);
}

function stepHerder(w: WorldState, map: GameMap): void {
  const h = w.herder;
  if (h.mode === "done") return;
  if (h.mode === "resting") {
    if (w.tick >= h.restUntilTick) h.mode = "idle";
    return;
  }
  if (h.mode === "reading") {
    if (!w.reading || w.tick >= w.reading.untilTick) finishReading(w);
    return;
  }
  if (h.mode === "ranting") {
    if (w.tick >= h.restUntilTick) h.mode = h.rantReturnMode ?? "idle";
    return;
  }
  if (h.mode === "idle") {
    // A breather when he is fuming and empty-handed.
    if (w.frustration >= 60 && w.tick - w.lastBreatherTick > BREATHER_COOLDOWN && keyedUnit(w.seed, "breather", w.tick) < 0.5) {
      w.lastBreatherTick = w.tick;
      w.stats.breathers++;
      h.mode = "resting";
      h.restUntilTick = w.tick + BREATHER_TICKS;
      addFrustration(w, FRUSTRATION.breather);
      pushEvent(w, { tick: w.tick, kind: "breather", sheepId: -1 });
      return;
    }
    // A book within reach beats a sheep; he is not carrying anything.
    const lib = readingAllowed(w) ? nearbyLibrary(w) : -1;
    if (lib >= 0 && goToLibrary(w, map, lib)) return;
    const target = chooseTarget(w, map);
    if (!target) {
      h.mode = "done";
      w.finished = true;
      w.finishedTick = w.tick;
      pushEvent(w, { tick: w.tick, kind: "finished", sheepId: -1 });
      return;
    }
    if (!planToSheep(w, map, target)) {
      // Unreachable: treat as lost to the hills so the day can still end.
      target.mode = "penned";
      w.sheepPenned++;
      return;
    }
    h.targetSheep = target.id;
    h.approachCount = 0;
    h.mode = "toSheep";
    // Is there a library near the route? Read first, then fetch the sheep.
    const onWay = readingAllowed(w) ? libraryAlongPath(w) : -1;
    if (onWay >= 0 && goToLibrary(w, map, onWay)) return;
  }

  // When he is unhinged he stops now and then to shake his fists at the sky.
  if ((h.mode === "toSheep" || h.mode === "toPen") && w.frustration >= 75 && w.tick - w.lastRantTick > RANT_COOLDOWN && keyedUnit(w.seed, "rant", w.tick) < 0.004) {
    w.lastRantTick = w.tick;
    h.restUntilTick = w.tick + RANT_TICKS;
    h.rantReturnMode = h.mode;
    h.mode = "ranting";
    pushEvent(w, { tick: w.tick, kind: "rant", sheepId: -1 });
    return;
  }

  const tile = tileAt(map, h.x, h.y);
  const terrainSpeed = TERRAIN_SPEED[tile] ?? 1;
  const rainFactor = w.rainUntilTick > w.tick ? 0.85 : 1;
  const speed = HERDER_BASE_SPEED * (terrainSpeed || 0.4) * (h.carrying >= 0 ? CARRY_FACTOR : 1) * w.speedScale * rainFactor * (1 + (w.frustration >= 80 ? 0.1 : 0));
  const moved = walk(w, speed * TICK_SECONDS);

  // Frustration from carrying over distance and rough ground.
  const tx = Math.round(h.x);
  const ty = Math.round(h.y);
  if (tx !== h.lastTileX || ty !== h.lastTileY) {
    h.lastTileX = tx;
    h.lastTileY = ty;
    // The walk of shame: past the pen with nothing to show for it.
    h.tripTiles++;
    if (h.carrying < 0 && h.mode === "toSheep" && h.tripTiles > 30 && w.tick - w.lastShameTick > SHAME_COOLDOWN && Math.hypot(tx - map.pen.x, ty - map.pen.y) <= SHAME_RADIUS && h.path.length > 12) {
      w.lastShameTick = w.tick;
      w.stats.shames++;
      addFrustration(w, FRUSTRATION.walkOfShame);
      pushEvent(w, { tick: w.tick, kind: "walkOfShame", sheepId: -1 });
    }
    if (h.carrying >= 0) {
      h.carryOdometer += 1;
      if (h.carryOdometer >= 25) {
        h.carryOdometer = 0;
        addFrustration(w, FRUSTRATION.perFortyTilesCarrying);
      }
      const t = map.terrain[ty * map.size + tx];
      // Spec says +2 per rough tile; tuned to +0.5 so a long bog does not pin the meter.
      if (t === Terrain.Mud || t === Terrain.Rock) addFrustration(w, FRUSTRATION.roughTile * 0.25);
    }
  }

  if (h.mode === "toLibrary") {
    const lib = w.libraries[h.targetLibrary];
    if (!lib || lib.taken) {
      h.mode = "idle";
      return;
    }
    if (h.path.length === 0) {
      if (Math.hypot(lib.x - h.x, lib.y - h.y) <= 1.6) startReading(w, h.targetLibrary);
      else h.mode = "idle";
    }
    return;
  }

  if (h.mode === "toSheep") {
    const s = w.sheep[h.targetSheep];
    if (!s || s.mode !== "loose") {
      h.mode = "idle";
      return;
    }
    const d = Math.hypot(s.x - h.x, s.y - h.y);
    // Flee check when first entering the approach radius.
    if (d < FLEE_RADIUS && h.approachCount === 0) {
      h.approachCount = 1;
      const hourFactor = 1 + w.tick / (4 * 3600 * 4) * 0.3; // later in the day, twitchier
      if (s.flees < MAX_FLEES && keyedUnit(w.seed, "flee", s.id, s.flees, w.tick) < s.skittish * 0.5 * hourFactor) {
        s.flees++;
        w.stats.flees++;
        fleeTo(w, map, s);
        if (s.flees >= 2) {
          addFrustration(w, FRUSTRATION.repeatEscape);
          s.named = true;
          pushEvent(w, { tick: w.tick, kind: "repeatEscape", sheepId: s.id });
        } else {
          addFrustration(w, FRUSTRATION.flee);
          pushEvent(w, { tick: w.tick, kind: "flee", sheepId: s.id });
        }
        h.approachCount = 0;
        if (!planToSheep(w, map, s)) h.mode = "idle";
        return;
      }
    }
    // The sheep may have wandered; re-path when the path is exhausted but we are not there.
    if (h.path.length === 0) {
      if (d <= (s.onRoof ? 1.6 : 0.75)) {
        s.onRoof = false;
        s.mode = "carried";
        h.carrying = s.id;
        h.carryOdometer = 0;
        if (s.absurd) {
          w.stats.absurds++;
          addFrustration(w, FRUSTRATION.absurdLocation);
          pushEvent(w, { tick: w.tick, kind: "absurd", sheepId: s.id });
        } else {
          pushEvent(w, { tick: w.tick, kind: "caught", sheepId: s.id });
        }
        if (planPath(w, map, map.pen.x, map.pen.y)) h.mode = "toPen";
        else h.mode = "idle";
      } else if (!planToSheep(w, map, s)) {
        h.mode = "idle";
      }
    }
  } else if (h.mode === "toPen") {
    const s = w.sheep[h.carrying];
    if (s) {
      s.x = h.x;
      s.y = h.y;
      s.tx = h.x;
      s.ty = h.y;
    }
    // A book he cannot stop for.
    if (w.tick % 8 === 0 && w.tick - w.lastBookPassTick > 10 * 60 * 4) {
      const lib = nearbyLibrary(w);
      if (lib >= 0 && Math.hypot(w.libraries[lib]!.x - h.x, w.libraries[lib]!.y - h.y) < 6) {
        w.lastBookPassTick = w.tick;
        pushEvent(w, { tick: w.tick, kind: "bookPassed", sheepId: -1 });
      }
    }
    if (h.path.length === 0 && Math.hypot(h.x - map.pen.x, h.y - map.pen.y) < 0.75) {
      if (s) {
        s.mode = "penned";
        const k = w.sheepPenned;
        s.x = map.pen.x - 1.2 + (k % 4) * 0.8 + keyedUnit(w.seed, "pen-x", k) * 0.3;
        s.y = map.pen.y - 1.1 + (Math.floor(k / 4) % 4) * 0.7 + keyedUnit(w.seed, "pen-y", k) * 0.3;
        s.tx = s.x;
        s.ty = s.y;
        w.sheepPenned++;
        pushEvent(w, { tick: w.tick, kind: "penned", sheepId: s.id });
      }
      h.carrying = -1;
      h.tripTiles = 0;
      addFrustration(w, FRUSTRATION.penned);
      h.mode = "resting";
      h.restUntilTick = w.tick + 8; // two seconds to catch his breath
    } else if (h.path.length === 0) {
      if (!planPath(w, map, map.pen.x, map.pen.y)) h.mode = "idle";
    }
  }
  void moved;
}

/** Advance the world by one tick. Mutates and returns the same object. */
export function step(w: WorldState, map: GameMap): WorldState {
  w.tick++;
  w.frustration = clampFrustration(frustrationDrift(w.frustration, frustrationBaseline(w.tick / TICKS_PER_HOUR), TICK_SECONDS / 60));
  if (w.registers.length && w.tick % 40 === 0) w.registers = w.registers.filter((r) => r.untilTick > w.tick);
  stepWeather(w);
  govern(w);
  stepSheep(w, map);
  stepHerder(w, map);
  return w;
}
