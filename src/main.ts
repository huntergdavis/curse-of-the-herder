import { generateMap, type GameMap } from "./core/map/generate";
import { LEVEL_NAMES, erudition, levelFor } from "./core/progression";
import { nextIdleCurseTicks, speakEpitaph, speakForEvent, speakIdle } from "./core/lang/speech";
import type { Band } from "./core/lang/types";
import { createWorld, dayHour, hoursElapsed, TICKS_PER_HOUR, TICK_SECONDS, type WorldState } from "./core/sim/state";
import { step } from "./core/sim/step";
import { repository } from "./persist/db";
import { BOOK_BY_ID } from "./data/books";
import { grammar, buildContext } from "./core/lang/speech";
import { Bubbles } from "./render/bubbles";
import { Camera } from "./render/camera";
import { Minimap } from "./render/minimap";
import { Renderer } from "./render/renderer";

const params = new URLSearchParams(location.search);
/** Simulation ticks per real 250 ms. `?fast=60` runs the day in nine minutes. */
const FAST = Math.max(1, Math.min(600, Number(params.get("fast") ?? 1) || 1));
const BOARD_SIZE = Math.max(128, Math.min(1024, Number(params.get("size") ?? 512) || 512));
const TICK_MS = TICK_SECONDS * 1000;
const MAX_CATCH_UP_TICKS = 4 * TICKS_PER_HOUR;
const SAVE_EVERY_MS = 10_000;
/** `?clean=1` caps filth at F1 for shared displays; `?filth=max` removes the frustration gate for testing. */
const BAND_CAP: Band = params.get("clean") ? 1 : 4;
const FILTH_MAX = params.get("filth") === "max";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>("game");
const overlay = $<HTMLDivElement>("overlay");
const overlayCard = $<HTMLDivElement>("overlay-card");

interface Session {
  world: WorldState;
  map: GameMap;
  renderer: Renderer;
  minimap: Minimap;
  camera: Camera;
  bubbles: Bubbles;
  nextIdleCurseTick: number;
  lastSaveMs: number;
  /** Highest event seq already reacted to. */
  seenSeq: number;
  recent: string[];
  /** Which excerpt of the current book is showing. */
  excerptShown: number;
}

let session: Session | null = null;
let paused = false;
let lastFrameMs = performance.now();

function randomSeed(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function showOverlay(html: string): void {
  overlayCard.innerHTML = html;
  overlay.hidden = false;
}

function hideOverlay(): void {
  overlay.hidden = true;
}

async function startSession(world: WorldState): Promise<void> {
  showOverlay(`<h1>${world.name}</h1><p>Laying out the pasture…</p>`);
  await new Promise((r) => setTimeout(r, 30)); // let the overlay paint
  const map = generateMap(world.seed, { size: world.size });
  const renderer = session?.renderer ?? new Renderer(canvas, map);
  renderer.setMap(map);
  const camera = new Camera(world.herder.x, world.herder.y);
  session = {
    world,
    map,
    renderer,
    minimap: new Minimap(map, 160),
    camera,
    bubbles: new Bubbles(),
    nextIdleCurseTick: world.tick + nextIdleCurseTicks(world),
    lastSaveMs: performance.now(),
    seenSeq: world.eventCount - 1,
    recent: [],
    excerptShown: -1,
  };
  repository.setActiveId(world.id);
  await refreshLoadList();
  hideOverlay();
  updateHud(true);
}

async function newHerder(): Promise<void> {
  const seed = params.get("seed") && !session ? params.get("seed")! : randomSeed();
  const map = generateMap(seed, { size: BOARD_SIZE });
  const world = createWorld(seed, map, Date.now());
  await repository.save(world);
  await startSession(world);
}

async function refreshLoadList(): Promise<void> {
  const sel = $<HTMLSelectElement>("sel-load");
  const list = await repository.list();
  sel.innerHTML = '<option value="">Load…</option>';
  for (const h of list) {
    const opt = document.createElement("option");
    opt.value = h.id;
    opt.textContent = `${h.name} · ${h.penned}/${h.total}${h.finished ? " · retired" : ""}`;
    if (session && h.id === session.world.id) opt.selected = true;
    sel.appendChild(opt);
  }
}

function fmtClock(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

let lastHud = "";
function updateHud(force = false): void {
  if (!session) return;
  const w = session.world;
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const key = `${w.tick >> 2}|${w.sheepPenned}|${level}|${w.frustration | 0}|${paused}`;
  if (!force && key === lastHud) return;
  lastHud = key;
  $("hud-name").textContent = w.name;
  $("hud-clock").textContent = fmtClock(dayHour(w));
  $("hud-flock").textContent = `${w.sheepPenned} / ${w.sheep.length}`;
  $("hud-level").textContent = `${level} · ${LEVEL_NAMES[level] ?? ""}`;
  $("hud-books").textContent = String(w.booksRead);
  $("hud-frust").textContent = String(Math.round(w.frustration));
  $<HTMLDivElement>("meter-fill").style.width = `${w.frustration}%`;
  $("hud-mode").textContent = paused ? "Paused" : FAST > 1 ? `×${FAST}` : "";
  $("btn-pause").textContent = paused ? "Resume" : "Pause";
}

function handleEvents(s: Session, nowMs: number): void {
  const w = s.world;
  const fresh = w.events.filter((e) => e.seq > s.seenSeq);
  if (fresh.length) s.seenSeq = fresh[fresh.length - 1]!.seq;
  for (const e of fresh) {
    if (FILTH_MAX) w.frustration = Math.max(w.frustration, 90);
    const u = speakForEvent(w, s.map, e, s.recent, BAND_CAP);
    if (u) say(s, u.text, u.heat, u.seconds, nowMs);
    if (e.kind === "flee" || e.kind === "repeatEscape") s.bubbles.emote(e.sheepId, "!", 2.5, nowMs);
    if (e.kind === "caught" || e.kind === "absurd") s.bubbles.emote(e.sheepId, "?", 2, nowMs);
    if (e.kind === "bookFound") {
      s.excerptShown = -1;
      const b = e.bookId ? BOOK_BY_ID.get(e.bookId) : undefined;
      if (b) toast(`Found: <em>${b.title}</em>`);
    }
    if (e.kind === "book") {
      const b = e.bookId ? BOOK_BY_ID.get(e.bookId) : undefined;
      if (b) toast(`Read <em>${b.title}</em>. Vocabulary: ${grammar.knownWords(buildContext(w, s.map, null, [], BAND_CAP))} words.`);
    }
    if (e.kind === "finished") onFinished(s);
  }
}

/** While reading, show the book's excerpts one after another in a calm bubble. */
function showExcerpts(s: Session, nowMs: number): void {
  const w = s.world;
  if (w.herder.mode !== "reading" || !w.reading) return;
  const b = BOOK_BY_ID.get(w.reading.bookId);
  if (!b) return;
  const span = w.reading.untilTick - w.reading.startTick;
  const idx = Math.min(b.excerpts.length - 1, Math.floor(((w.tick - w.reading.startTick) / span) * b.excerpts.length));
  if (idx !== s.excerptShown) {
    s.excerptShown = idx;
    const text = `“${b.excerpts[idx] ?? ""}”`;
    s.bubbles.say(text, 0, (span / b.excerpts.length) * TICK_SECONDS / FAST + 0.5, nowMs);
    $("line-text").textContent = text;
  }
}

let toastTimer = 0;
function toast(html: string): void {
  const el = $("toast");
  el.innerHTML = html;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, 6000);
}

function say(s: Session, text: string, heat: number, seconds: number, nowMs: number): void {
  s.bubbles.say(text, heat, seconds, nowMs);
  s.world.totalCurses++;
  s.recent.push(text);
  if (s.recent.length > 32) s.recent.shift();
  $("line-text").textContent = text;
}

function onFinished(s: Session): void {
  const w = s.world;
  const epitaph = speakEpitaph(w, s.map, s.recent, BAND_CAP);
  say(s, epitaph.text, 1, 30, performance.now());
  showOverlay(
    `<h1>${w.name}</h1><p>penned the last of ${w.sheep.length} sheep at ${fmtClock(dayHour(w))} and was retired to the Hall of Herders.</p>` +
      `<p class="epitaph">"${epitaph.text}"</p><p>Curses uttered: ${w.totalCurses}. A new herder wakes at dawn.</p>`,
  );
  void repository.save(w);
  window.setTimeout(() => void newHerder(), 60_000);
}

function frame(nowMs: number): void {
  requestAnimationFrame(frame);
  const s = session;
  if (!s) return;
  const dt = Math.min(0.1, (nowMs - lastFrameMs) / 1000);
  lastFrameMs = nowMs;
  const w = s.world;

  if (!paused && !w.finished) {
    const wall = Date.now();
    let due = Math.floor(((wall - w.lastWallMs) / TICK_MS) * FAST);
    if (due > 0) {
      const catchingUp = due > 40;
      due = Math.min(due, MAX_CATCH_UP_TICKS);
      // Budget per frame so a big catch-up does not freeze the tab.
      const budget = catchingUp ? 1500 : due;
      const run = Math.min(due, budget);
      for (let i = 0; i < run; i++) {
        step(w, s.map);
        if (w.tick >= s.nextIdleCurseTick && !catchingUp) {
          if (FILTH_MAX) w.frustration = Math.max(w.frustration, 90);
          const u = speakIdle(w, s.map, s.recent, BAND_CAP);
          if (u) say(s, u.text, u.heat, u.seconds, nowMs);
          s.nextIdleCurseTick = w.tick + nextIdleCurseTicks(w);
        }
        if (w.finished) break;
      }
      if (w.tick >= s.nextIdleCurseTick) s.nextIdleCurseTick = w.tick + nextIdleCurseTicks(w);
      w.lastWallMs += Math.round((run / FAST) * TICK_MS);
      if (run >= due || w.finished) w.lastWallMs = wall;
      handleEvents(s, nowMs);
      showExcerpts(s, nowMs);
    }
    if (nowMs - s.lastSaveMs > SAVE_EVERY_MS) {
      s.lastSaveMs = nowMs;
      void repository.save(w);
    }
  } else {
    w.lastWallMs = Date.now();
  }

  const h = w.herder;
  // Lead the camera a little toward where he is going.
  const next = h.path[Math.min(4, h.path.length - 1)];
  const lx = next ? (next.x - h.x) * 0.25 : 0;
  const ly = next ? (next.y - h.y) * 0.25 : 0;
  // At high fast-forward the herder outruns an eased camera; scale the easing and snap if he gets away.
  s.camera.follow(h.x + lx, h.y + ly, dt * Math.min(FAST, 12));
  if (Math.hypot(s.camera.x - h.x, s.camera.y - h.y) > 8) s.camera.snap(h.x, h.y);
  s.bubbles.prune(nowMs);
  if (!document.hidden) {
    s.renderer.draw(w, s.camera, s.bubbles, nowMs);
    if ((nowMs | 0) % 4 === 0) s.minimap.draw($<HTMLCanvasElement>("minimap"), w);
  }
  updateHud();
}

async function boot(): Promise<void> {
  window.addEventListener("resize", () => session?.renderer.resize());
  $("btn-pause").addEventListener("click", () => {
    paused = !paused;
    updateHud(true);
  });
  $("btn-new").addEventListener("click", () => void newHerder());
  $<HTMLSelectElement>("sel-load").addEventListener("change", async (e) => {
    const id = (e.target as HTMLSelectElement).value;
    if (!id) return;
    if (session) await repository.save(session.world);
    const w = await repository.load(id);
    if (w) await startSession(w);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      paused = !paused;
      updateHud(true);
    } else if (e.key.toLowerCase() === "n") void newHerder();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && session) session.renderer.resize();
  });
  window.addEventListener("beforeunload", () => {
    if (session) void repository.save(session.world);
  });

  const active = repository.getActiveId();
  let world: WorldState | null = null;
  if (active && !params.get("seed") && params.get("new") === null) {
    try {
      world = await repository.load(active);
    } catch (err) {
      console.warn("Could not load active herder; starting fresh.", err);
    }
  }
  if (world && !world.finished) {
    if (world.size !== BOARD_SIZE && params.has("size")) world = null;
  }
  if (world && !world.finished) await startSession(world);
  else await newHerder();
  requestAnimationFrame(frame);
}

void boot();
