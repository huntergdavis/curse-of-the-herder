import type { GameMap } from "../map/generate";
import { findPath } from "../map/path";
import { Deco, TERRAIN_SPEED, Terrain, isWalkable } from "../map/terrain";
import { FRUSTRATION, clampFrustration } from "../progression";
import { keyedUnit } from "../rng";
import { MAX_EVENTS, TICK_SECONDS, type SheepState, type WorldEvent, type WorldState } from "./state";

export const HERDER_BASE_SPEED = 1.5; // tiles per second on grass
const CARRY_FACTOR = 0.8;
const FLEE_RADIUS = 2.5;
const MAX_FLEES = 3;
const SEE_RADIUS = 12;

function pushEvent(w: WorldState, e: WorldEvent): void {
  w.events.push(e);
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
    const score = atPen ? map.penDistance[s.y * map.size + s.x]! : Math.hypot(s.x - h.x, s.y - h.y) * (1 + s.ring * 0.05);
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
    s.x = x;
    s.y = y;
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
    // Wander a tile within the leash now and then.
    if (w.tick % 40 === s.id % 40 && keyedUnit(w.seed, "wander", s.id, w.tick) < 0.5 && d > 3) {
      const dir = Math.floor(keyedUnit(w.seed, "wander-dir", s.id, w.tick) * 4);
      const nx = s.x + [1, -1, 0, 0][dir]!;
      const ny = s.y + [0, 0, 1, -1][dir]!;
      if (Math.abs(nx - s.homeX) <= 2 && Math.abs(ny - s.homeY) <= 2 && nx > 0 && ny > 0 && nx < map.size - 1 && ny < map.size - 1) {
        const i = ny * map.size + nx;
        if (isWalkable(map.terrain[i]!) && map.deco[i] !== Deco.Fence && map.deco[i] !== Deco.House && map.deco[i] !== Deco.HouseRed) {
          s.x = nx;
          s.y = ny;
        }
      }
    }
  }
}

function stepHerder(w: WorldState, map: GameMap): void {
  const h = w.herder;
  if (h.mode === "done") return;
  if (h.mode === "resting") {
    if (w.tick >= h.restUntilTick) h.mode = "idle";
    return;
  }
  if (h.mode === "idle") {
    const target = chooseTarget(w, map);
    if (!target) {
      h.mode = "done";
      w.finished = true;
      w.finishedTick = w.tick;
      pushEvent(w, { tick: w.tick, kind: "finished", sheepId: -1 });
      return;
    }
    if (!planPath(w, map, target.x, target.y)) {
      // Unreachable: treat as lost to the hills so the day can still end.
      target.mode = "penned";
      w.sheepPenned++;
      return;
    }
    h.targetSheep = target.id;
    h.approachCount = 0;
    h.mode = "toSheep";
  }

  const tile = tileAt(map, h.x, h.y);
  const terrainSpeed = TERRAIN_SPEED[tile] ?? 1;
  const speed = HERDER_BASE_SPEED * (terrainSpeed || 0.4) * (h.carrying >= 0 ? CARRY_FACTOR : 1) * w.speedScale * (1 + (w.frustration >= 80 ? 0.1 : 0));
  const moved = walk(w, speed * TICK_SECONDS);

  // Frustration from carrying over distance and rough ground.
  const tx = Math.round(h.x);
  const ty = Math.round(h.y);
  if (tx !== h.lastTileX || ty !== h.lastTileY) {
    h.lastTileX = tx;
    h.lastTileY = ty;
    if (h.carrying >= 0) {
      h.carryOdometer += 1;
      if (h.carryOdometer >= 40) {
        h.carryOdometer = 0;
        addFrustration(w, FRUSTRATION.perFortyTilesCarrying);
      }
      const t = map.terrain[ty * map.size + tx];
      // Spec says +2 per rough tile; tuned to +0.5 so a long bog does not pin the meter.
      if (t === Terrain.Mud || t === Terrain.Rock) addFrustration(w, FRUSTRATION.roughTile * 0.25);
    }
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
        if (!planPath(w, map, s.x, s.y)) h.mode = "idle";
        return;
      }
    }
    // The sheep may have wandered; re-path when the path is exhausted but we are not there.
    if (h.path.length === 0) {
      if (d <= 0.75) {
        s.mode = "carried";
        h.carrying = s.id;
        h.carryOdometer = 0;
        if (s.absurd) {
          addFrustration(w, FRUSTRATION.absurdLocation);
          pushEvent(w, { tick: w.tick, kind: "absurd", sheepId: s.id });
        } else {
          pushEvent(w, { tick: w.tick, kind: "caught", sheepId: s.id });
        }
        if (planPath(w, map, map.pen.x, map.pen.y)) h.mode = "toPen";
        else h.mode = "idle";
      } else if (!planPath(w, map, s.x, s.y)) {
        h.mode = "idle";
      }
    }
  } else if (h.mode === "toPen") {
    const s = w.sheep[h.carrying];
    if (s) {
      s.x = h.x;
      s.y = h.y;
    }
    if (h.path.length === 0 && Math.hypot(h.x - map.pen.x, h.y - map.pen.y) < 0.75) {
      if (s) {
        s.mode = "penned";
        const k = w.sheepPenned;
        s.x = map.pen.x - 1 + (k % 3);
        s.y = map.pen.y - 1 + (Math.floor(k / 3) % 3);
        w.sheepPenned++;
        pushEvent(w, { tick: w.tick, kind: "penned", sheepId: s.id });
      }
      h.carrying = -1;
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
  addFrustration(w, FRUSTRATION.decayPerMinute * TICK_SECONDS / 60);
  stepSheep(w, map);
  stepHerder(w, map);
  return w;
}
