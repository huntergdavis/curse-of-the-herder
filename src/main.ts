import { generateMap, type GameMap } from "./core/map/generate";
import { LEVEL_NAMES, erudition, levelFor } from "./core/progression";
import { nextIdleCurseTicks, speakEpitaph, speakForEvent, speakIdle } from "./core/lang/speech";
import type { Band } from "./core/lang/types";
import { createWorld, dayHour, hoursElapsed, mapForWorld, upgradeWorld, TICKS_PER_HOUR, TICK_SECONDS, type WorldState } from "./core/sim/state";
import { step } from "./core/sim/step";
import { repository } from "./persist/db";
import { BOOK_BY_ID } from "./data/books";
import { grammar, buildContext, signatureWord } from "./core/lang/speech";
import { makeHallRecord, tasteOfPack, type HallRecord } from "./core/hall";
import { sheepName } from "./core/names";
import { catchUpPlan, shouldRecover } from "./runtime/liveness";
import { startUpdatePolling } from "./update/automatic-update";
import { Bubbles } from "./render/bubbles";
import { Camera } from "./render/camera";
import { Minimap } from "./render/minimap";
import { Renderer } from "./render/renderer";

const params = new URLSearchParams(location.search);
/** Simulation ticks per real 250 ms. `?fast=60` runs the day sixty times faster; the menu can change it live. */
let FAST = Math.max(1, Math.min(600, Number(params.get("fast") ?? repository.getSetting("speed", "1")) || 1));
/** At high speed, lines would flash by; keep at least this much real time between bubbles. */
const MIN_SAY_GAP_MS = 1400;
let lastSayMs = -1e9;
const BOARD_SIZE = Math.max(128, Math.min(1024, Number(params.get("size") ?? 512) || 512));
const TICK_MS = TICK_SECONDS * 1000;
const SAVE_EVERY_MS = 10_000;
/** `?fps=15` (or the Eco setting) renders less often for laptops. */
const FPS_CAP = Math.max(5, Math.min(60, Number(params.get("fps") ?? repository.getSetting("fps", "60")) || 60));
const FRAME_MIN_MS = 1000 / FPS_CAP;
void TICKS_PER_HOUR;
/** `?clean=1` caps filth at F1 for shared displays; the toolbar setting persists; `?filth=max` removes the frustration gate for testing. */
let BAND_CAP: Band = params.get("clean") ? 1 : (Number(repository.getSetting("band", "4")) as Band);
/** `?hour=17.8` pins the sky to an hour (development screenshots). */
const HOUR_PIN = params.get("hour") ? Number(params.get("hour")) : null;
/** `?cam=x,y` pins the camera to a tile (development screenshots). */
const CAM_PIN = (() => {
  const v = params.get("cam");
  if (!v) return null;
  const [x, y] = v.split(",").map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? { x: x!, y: y! } : null;
})();
/** `?books=N` starts a new herder as if he had already read N books (skip ahead). */
const START_BOOKS = Math.max(0, Math.min(30, Number(params.get("books") ?? 0) || 0));
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
  recentRules: string[];
  /** Which excerpt of the current book is showing. */
  excerptShown: number;
  /** Lines waiting to be delivered after the current bubble (flyting, quotations). */
  queue: { text: string; heat: number; seconds: number; sheepId?: number; emote?: string; atMs: number }[];
  /** The last book finished, for quoting later. */
  lastBook: { id: string; tick: number; quoted: boolean } | null;
  /** Wall ms when the last sheep was penned; drives the dusk fade. */
  finishedAtMs: number;
  endHandled: boolean;
  napNoted: boolean;
}

let session: Session | null = null;
let paused = false;
let motionSetting = false;
let textScale = 1;
let contrastSetting = false;
let lastFrameMs = performance.now();
let lastTickMs = performance.now();
let lastDrawMs = 0;

const NAP_LINES = [
  "I had a sit-down. A long one. The sheep did not move either, out of respect.",
  "Where was I. Right. Sheep.",
  "I must have dozed. The hill is still here. Of course it is.",
  "That was a long blink. Nobody tell the sheep.",
];

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
  const map = mapForWorld(world);
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
    recentRules: [],
    excerptShown: -1,
    queue: [],
    lastBook: null,
    finishedAtMs: 0,
    endHandled: false,
    napNoted: false,
  };
  renderer.hourOverride = null;
  renderer.reducedMotion = motionSetting;
  renderer.fontScale = textScale;
  renderer.highContrast = contrastSetting;
  repository.setActiveId(world.id);
  // A fresh herder says his first words of the day.
  if (world.tick === 0 && world.events[0]) {
    const u = speakForEvent(world, map, world.events[0], [], BAND_CAP);
    if (u) window.setTimeout(() => session && say(session, u.text, u.heat, u.seconds + 2, performance.now(), true, u), 600);
  }
  // The previous herder's stone stands by the pen.
  const hall = await repository.hall();
  const prev = hall.find((r) => r.seed !== world.seed);
  renderer.memorial = prev ? { name: prev.name, epitaph: prev.epitaph } : null;
  await refreshLoadList();
  hideOverlay();
  updateHud(true);
}

async function newHerder(): Promise<void> {
  const seed = params.get("seed") && !session ? params.get("seed")! : randomSeed();
  const map = generateMap(seed, { size: BOARD_SIZE });
  const world = createWorld(seed, map, Date.now());
  if (START_BOOKS > 0) world.booksRead = START_BOOKS;
  // `?weather=rain|fog|wind` pins a weather for the whole day (development screenshots).
  const weather = params.get("weather");
  if (weather === "rain") world.rainUntilTick = 1e9;
  if (weather === "fog") world.fogUntilTick = 1e9;
  if (weather === "wind") world.windUntilTick = 1e9;
  await repository.save(world);
  await startSession(world);
}

async function exportJson(): Promise<void> {
  const hall = await repository.hall();
  const payload = { format: "curse-of-the-herder-export", version: 1, exportedAt: new Date().toISOString(), herder: session?.world ?? null, hall };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `curse-of-the-herder-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

async function importJson(file: File): Promise<void> {
  try {
    const data = JSON.parse(await file.text()) as { format?: string; herder?: unknown; hall?: HallRecord[] };
    if (data.format !== "curse-of-the-herder-export") throw new Error("not an export file");
    let inducted = 0;
    for (const r of data.hall ?? []) {
      if (r && r.schemaVersion === 1 && typeof r.id === "string") {
        await repository.induct(r);
        inducted++;
      }
    }
    if (data.herder) {
      const w = upgradeWorld(data.herder);
      await repository.save(w);
      await startSession(w);
    }
    toast(`Imported ${inducted} Hall record${inducted === 1 ? "" : "s"}${data.herder ? " and a herder" : ""}.`);
  } catch (err) {
    toast(`Could not import: ${err instanceof Error ? err.message : String(err)}`);
  }
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
let lastVocabBooks = -1;
let lastVocabLevel = -1;
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
  if (force || w.booksRead !== lastVocabBooks || level !== lastVocabLevel) {
    lastVocabBooks = w.booksRead;
    lastVocabLevel = level;
    $("hud-vocab").textContent = `${grammar.knownWords(buildContext(w, session.map, null, [], BAND_CAP))} words`;
  }
  const mood = w.frustration < 20 ? "Muttering" : w.frustration < 40 ? "Grumbling" : w.frustration < 60 ? "Cursing" : w.frustration < 80 ? "Swearing" : "Unhinged";
  $("hud-frust").textContent = `${mood} · ${Math.round(w.frustration)}`;
  $<HTMLDivElement>("meter-fill").style.width = `${w.frustration}%`;
  $<HTMLDivElement>("meter").classList.toggle("tremble", w.frustration >= 88 && !w.finished);
  $("hud-mode").textContent = paused ? "Paused" : FAST > 1 ? `×${FAST}` : "";
  $("btn-pause").textContent = paused ? "Resume" : "Pause";
}

function handleEvents(s: Session, nowMs: number): void {
  const w = s.world;
  const fresh = w.events.filter((e) => e.seq > s.seenSeq);
  if (fresh.length) s.seenSeq = fresh[fresh.length - 1]!.seq;
  for (const e of fresh) {
    if (FILTH_MAX) w.frustration = Math.max(w.frustration, 90);
    const u = speakForEvent(w, s.map, e, { lines: s.recent, rules: s.recentRules }, BAND_CAP);
    if (u) say(s, u.text, u.heat, u.seconds, nowMs, false, u);
    if (e.kind === "flee" || e.kind === "repeatEscape") s.bubbles.emote(e.sheepId, "!", 2.5, nowMs);
    if (e.kind === "repeatEscape" && w.sheep[e.sheepId]?.flees === 2) toast(`That one has earned a name. It is <strong>${escapeHtml(sheepName(w.seed, e.sheepId))}</strong> now.`);
    if (e.kind === "rainStops") s.renderer.rainStopped(nowMs);
    if (e.kind === "penned") {
      const el = $("hud-flock");
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }
    if (e.kind === "mishap" && e.detail === "bite" && e.sheepId >= 0) s.bubbles.emote(e.sheepId, "grr", 2.5, nowMs);
    if (e.kind === "mishap" && e.detail === "wasp") s.renderer.dogReact("wasp", nowMs);
    if (e.kind === "mishap" && e.detail === "bite") s.renderer.dogReact("bite", nowMs);
    if (e.kind === "flee" || e.kind === "repeatEscape") s.renderer.dogReact("flee", nowMs);
    if (e.kind === "bookFound") s.renderer.dogReact("book", nowMs);
    if (e.kind === "caught" || e.kind === "absurd") s.bubbles.emote(e.sheepId, "?", 2, nowMs);
    if (e.kind === "bookFound") {
      s.excerptShown = -1;
      const b = e.bookId ? BOOK_BY_ID.get(e.bookId) : undefined;
      if (b) toast(`Found: <em>${b.title}</em>`);
    }
    if (e.kind === "book") {
      const b = e.bookId ? BOOK_BY_ID.get(e.bookId) : undefined;
      if (b) {
        const sample = b.pack ? tasteOfPack(grammar.packEntries(b.pack), w.seed + b.id + "toast", 3) : [];
        toast(`Read <em>${b.title}</em>${sample.length ? `: ${sample.map(escapeHtml).join(", ")}…` : ""} Vocabulary: ${grammar.knownWords(buildContext(w, s.map, null, [], BAND_CAP))} words.`);
      }
      if (e.bookId) s.lastBook = { id: e.bookId, tick: w.tick, quoted: false };
    }
    // A notorious sheep, finally caught, gets a proper telling-off: a short flyting.
    if (e.kind === "caught" && w.sheep[e.sheepId]?.named && u) {
      const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
      if (level >= 2) {
        const salts = [101, 202];
        let at = nowMs + u.seconds * 1000 + 400;
        for (const salt of salts) {
          const line = speakForEvent(w, s.map, { ...e, kind: "repeatEscape", seq: e.seq * 10 + salt }, { lines: s.recent, rules: s.recentRules }, BAND_CAP);
          if (!line) continue;
          s.queue.push({ text: line.text, heat: Math.min(1, line.heat + (salt === 101 ? 0.15 : 0.3)), seconds: line.seconds, sheepId: e.sheepId, emote: salt === 101 ? "!" : "?!", atMs: at });
          at += line.seconds * 1000 + 400;
        }
      }
    }
    if (e.kind === "finished") onFinished(s);
  }
}

const QUOTE_FRAMES: [number, string[]][] = [
  [0, ["The book said: {q} It was right.", "{q} That is from a book. The book had not met this sheep.", "A book told me: {q} I believed it."]],
  [4, ["{q} So says the book, and I say #oath#.", "As the book has it: {q} As I have it: #insult_np#.", "I read {q} this morning. I have since revised it."]],
  [8, ["{q} I read that. I carried a sheep afterwards. Both are true.", "The book said {q} The book did not have to carry anything."]],
  [10, ["{q} — thus the volume; thus, too, the afternoon, which has annotated it in mud.", "One reads {q} and one carries a sheep regardless. The two activities are not in conversation."]],
];

/** Ten-odd minutes after a book, he quotes it back at the day. */
function maybeQuoteBook(s: Session, nowMs: number): void {
  const w = s.world;
  const lb = s.lastBook;
  if (!lb || lb.quoted || w.tick - lb.tick < 8 * 60 * 4 || w.tick - lb.tick > 25 * 60 * 4) return;
  if (w.herder.mode !== "toSheep" && w.herder.mode !== "toPen") return;
  lb.quoted = true;
  const book = BOOK_BY_ID.get(lb.id);
  if (!book) return;
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const frames = [...QUOTE_FRAMES].reverse().find(([min]) => level >= min)?.[1] ?? QUOTE_FRAMES[0]![1];
  const frame = frames[(w.tick + lb.id.length) % frames.length]!;
  const excerpt = book.excerpts[(w.tick >> 3) % book.excerpts.length] ?? "";
  // Let the grammar fill any slots in the frame, then drop the quotation in.
  const ctx = buildContext(w, s.map, null, s.recent, BAND_CAP);
  const filled = grammar.expandTemplate(frame.replace("{q}", "QUOTEHERE"), ctx) ?? frame.replace("{q}", "QUOTEHERE");
  const text = filled.replace("QUOTEHERE", `“${excerpt}”`);
  say(s, text, Math.min(0.6, w.frustration / 100), 5 + text.length * 0.04, nowMs);
}

let lastDiaryHour = -1;
/** On the hour, a one-line entry from the herder's day book. */
function hourlyDiary(s: Session): void {
  const w = s.world;
  const hour = Math.floor(dayHour(w));
  if (hour === lastDiaryHour || w.tick < 40) return;
  lastDiaryHour = hour;
  if (hour === 9) return;
  const level = levelFor(erudition(w.booksRead, w.sheepPenned, hoursElapsed(w)));
  const mood = w.frustration < 22 ? "grumbling" : w.frustration < 42 ? "cursing" : w.frustration < 66 ? "swearing" : "unhinged";
  const notes = [
    w.stats.flees ? `${w.stats.flees} bolted` : "",
    w.stats.absurds ? `${w.stats.absurds} found somewhere absurd` : "",
    w.stats.rains ? `${w.stats.rains} rain${w.stats.rains === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(", ");
  toast(`<strong>${String(hour).padStart(2, "0")}:00</strong> · ${w.sheepPenned}/${w.sheep.length} sheep in · ${w.booksRead} book${w.booksRead === 1 ? "" : "s"} · level ${level} · ${mood}${notes ? ` · ${notes}` : ""}`);
}

/** Deliver queued follow-up lines when their time comes. */
function flushQueue(s: Session, nowMs: number): void {
  while (s.queue.length && s.queue[0]!.atMs <= nowMs) {
    const q = s.queue.shift()!;
    say(s, q.text, q.heat, q.seconds, nowMs);
    if (q.sheepId !== undefined && q.emote) s.bubbles.emote(q.sheepId, q.emote, Math.min(3, q.seconds), nowMs + 500);
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

function tallyUse(w: WorldState, used: string[] | undefined, at: string | undefined): void {
  if (!used) return;
  for (const word of used) {
    const rec = (w.wordUse[word] ??= { n: 0, at: {} });
    rec.n++;
    if (at) rec.at[at] = (rec.at[at] ?? 0) + 1;
  }
}

function say(s: Session, text: string, heat: number, seconds: number, nowMs: number, force = false, u?: { used?: string[]; targetLabel?: string; ruleId?: string }): void {
  if (!force && FAST > 1 && nowMs - lastSayMs < MIN_SAY_GAP_MS) return;
  lastSayMs = nowMs;
  if (u) {
    tallyUse(s.world, u.used, u.targetLabel);
    if (u.ruleId) {
      s.recentRules.push(u.ruleId);
      if (s.recentRules.length > 12) s.recentRules.shift();
    }
  }
  // Villagers within earshot are scandalised by strong language.
  if (heat > 0.55) s.renderer.scandalise(s.world.herder.x, s.world.herder.y, nowMs);
  s.bubbles.say(text, heat, seconds, nowMs);
  s.world.totalCurses++;
  s.recent.push(text);
  if (s.recent.length > 32) s.recent.shift();
  if (text.length > s.world.longestLine.length) s.world.longestLine = text;
  $("line-text").textContent = text;
}

const END_FADE_MS = 24_000;
const END_HOLD_MS = 60_000;

function stoneHtml(r: { name: string; epitaph: string; finishedClock: string; inductedAt: string }): string {
  const date = new Date(r.inductedAt);
  return `<div class="stone"><div class="rip">HERE LIES</div><div class="who">${escapeHtml(r.name)}</div><div class="ep">“${escapeHtml(r.epitaph)}”</div><div class="when">retired ${r.finishedClock}, ${date.toLocaleDateString()}</div></div><div class="grass-strip"></div>`;
}

function readingHtml(r: HallRecord, compact = false): string {
  if (!r.reading?.length) return "";
  const items = r.reading
    .map((b) => {
      const use = b.used?.length ? b.used.map((x) => `${escapeHtml(x.w)} (${x.n}×${x.mostly ? `, mostly at ${escapeHtml(x.mostly)}` : ""})`).join("; ") : "";
      const taught = use ? `taught him ${use}` : b.taught.length ? `taught him ${b.taught.map(escapeHtml).join(", ")}` : "";
      return `<li><span class="rl-title">${escapeHtml(b.title)}</span> <span class="rl-when">${b.clock}</span>${taught ? `<span class="rl-taught">${taught}</span>` : ""}</li>`;
    })
    .join("");
  return `<details class="reading" ${compact ? "" : "open"}><summary>Reading list (${r.reading.length} book${r.reading.length === 1 ? "" : "s"})</summary><ol>${items}</ol></details>`;
}

function escapeHtml(t: string): string {
  return t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
}

/** The last sheep is in. He says his piece, night falls, a stone rises. */
function onFinished(s: Session): void {
  if (s.endHandled) return;
  s.endHandled = true;
  const w = s.world;
  const epitaph = speakEpitaph(w, s.map, { lines: s.recent, rules: s.recentRules }, BAND_CAP);
  say(s, epitaph.text, 1, END_FADE_MS / 1000, performance.now(), true);
  s.finishedAtMs = performance.now();
  const vocabulary = grammar.knownWords(buildContext(w, s.map, null, [], BAND_CAP));
  const record = makeHallRecord(w, epitaph.text, vocabulary, signatureWord(w.seed), (id) => grammar.packEntries(id));
  void repository.save(w);
  void repository.induct(record);
  window.setTimeout(() => showEndCard(record), END_FADE_MS);
}

function showEndCard(r: HallRecord): void {
  const mode = repository.getSetting("end", "loop");
  const next = mode === "loop" ? "A new herder wakes at dawn in a minute." : mode === "hall" ? "" : "The pasture is quiet.";
  showOverlay(
    `<h1>${escapeHtml(r.name)}</h1><p>penned the last of ${r.sheep} sheep at ${r.finishedClock} and was retired to the Hall of Herders.</p>` +
      stoneHtml(r) +
      `<p>${r.totalCurses} curses · ${r.booksRead} books · ${r.vocabulary} words · Level ${r.level}, ${escapeHtml(r.levelName)}${r.dogName ? ` · with ${escapeHtml(r.dogName)}, who was no help` : ""}</p>` +
      (r.favouriteWord ? `<p>Favourite word: <strong>${escapeHtml(r.favouriteWord.w)}</strong> (${r.favouriteWord.n}×${r.favouriteWord.mostly ? `, mostly at ${escapeHtml(r.favouriteWord.mostly)}` : ""})</p>` : "") +
      (r.sheepOfTheDay ? `<p>Sheep of the day: <strong>${escapeHtml(r.sheepOfTheDay.name)}</strong>, who ran ${r.sheepOfTheDay.flees} times and regrets nothing.</p>` : "") +
      (r.longestLine ? `<p class="epitaph" style="font-size:15px;opacity:.8">Longest outburst: “${escapeHtml(r.longestLine)}”</p>` : "") +
      readingHtml(r, true) +
      `<p>${next}</p>`,
  );
  if (mode === "loop") window.setTimeout(() => void newHerder(), END_HOLD_MS);
  else if (mode === "hall") window.setTimeout(() => { hideOverlay(); void showHall(); }, 8000);
}

async function showHall(): Promise<void> {
  const hall = $<HTMLElement>("hall");
  const grid = $("hall-grid");
  const records = await repository.hall();
  const totals = records.reduce((a, r) => ({ sheep: a.sheep + r.sheep, curses: a.curses + r.totalCurses, books: a.books + r.booksRead }), { sheep: 0, curses: 0, books: 0 });
  $("hall-totals").textContent = records.length ? `${records.length} herder${records.length === 1 ? "" : "s"} retired · ${totals.sheep} sheep carried home · ${totals.books} books read · ${totals.curses} curses uttered` : "";
  grid.innerHTML = records
    .slice(0, 64)
    .map(
      (r) =>
        `<article class="hall-card">${stoneHtml(r)}<dl><dt>Sheep</dt><dd>${r.sheep}</dd><dt>Books</dt><dd>${r.booksRead}</dd><dt>Curses</dt><dd>${r.totalCurses}</dd><dt>Vocabulary</dt><dd>${r.vocabulary}</dd><dt>Level</dt><dd>${r.level} · ${escapeHtml(r.levelName)}</dd><dt>Hours</dt><dd>${r.hoursOnTheJob}</dd>${r.dogName ? `<dt>Dog</dt><dd>${escapeHtml(r.dogName)} (no help)</dd>` : ""}${r.sheepOfTheDay ? `<dt>Sheep of the day</dt><dd>${escapeHtml(r.sheepOfTheDay.name)} (${r.sheepOfTheDay.flees} escapes)</dd>` : ""}${r.favouriteWord ? `<dt>Favourite word</dt><dd>${escapeHtml(r.favouriteWord.w)} (${r.favouriteWord.n}×)</dd>` : ""}</dl>` +
        (r.longestLine ? `<div class="longest">“${escapeHtml(r.longestLine)}”</div>` : "") +
        (r.namedSheep?.length ? `<div class="longest">Named today: ${r.namedSheep.map((n) => `${escapeHtml(n.name)} (${n.flees})`).join(", ")}</div>` : "") +
        readingHtml(r, true) +
        `</article>`,
    )
    .join("");
  $("hall-empty").hidden = records.length > 0;
  hall.hidden = false;
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
    const plan = catchUpPlan(wall - w.lastWallMs, TICK_MS, FAST);
    let due = plan.ticks;
    if (plan.longNap && !s.napNoted) {
      s.napNoted = true;
      const line = NAP_LINES[Math.floor(Math.random() * NAP_LINES.length)] ?? NAP_LINES[0]!;
      say(s, line, 0.2, 6, nowMs);
      if (plan.dropped) toast("He was away so long the day paused. Picking up where he left off.");
    }
    if (plan.dropped) w.lastWallMs = wall - (due / FAST) * TICK_MS;
    if (due > 0) {
      lastTickMs = nowMs;
      const catchingUp = due > 40;
      // Budget per frame so a big catch-up does not freeze the tab.
      const budget = catchingUp ? 1500 : due;
      const run = Math.min(due, budget);
      for (let i = 0; i < run; i++) {
        step(w, s.map);
        if (w.tick >= s.nextIdleCurseTick && !catchingUp) {
          if (FILTH_MAX) w.frustration = Math.max(w.frustration, 90);
          const u = speakIdle(w, s.map, { lines: s.recent, rules: s.recentRules }, BAND_CAP);
          if (u) {
            say(s, u.text, u.heat, u.seconds, nowMs, false, u);
            // The addressed sheep has nothing to say for itself.
            if (u.sheepId !== undefined && Math.hypot((w.sheep[u.sheepId]?.x ?? 0) - w.herder.x, (w.sheep[u.sheepId]?.y ?? 0) - w.herder.y) < 14) s.bubbles.emote(u.sheepId, "…", Math.min(4, u.seconds), nowMs + 700);
          }
          s.nextIdleCurseTick = w.tick + nextIdleCurseTicks(w);
        }
        if (w.finished) break;
      }
      if (w.tick >= s.nextIdleCurseTick) s.nextIdleCurseTick = w.tick + nextIdleCurseTicks(w);
      w.lastWallMs += Math.round((run / FAST) * TICK_MS);
      if (run >= due || w.finished) {
        w.lastWallMs = wall;
        s.napNoted = false;
      }
      handleEvents(s, nowMs);
      showExcerpts(s, nowMs);
      if (!catchingUp && w.tick % 40 === 0) maybeQuoteBook(s, nowMs);
      if (!catchingUp && FAST <= 20) hourlyDiary(s);
    }
    flushQueue(s, nowMs);
    if (nowMs - s.lastSaveMs > SAVE_EVERY_MS) {
      s.lastSaveMs = nowMs;
      void repository.save(w);
    }
  } else {
    w.lastWallMs = Date.now();
  }
  if (HOUR_PIN !== null && !w.finished) s.renderer.hourOverride = HOUR_PIN;
  if (w.finished) {
    if (!s.endHandled) onFinished(s);
    const t = Math.min(1, (nowMs - s.finishedAtMs) / END_FADE_MS);
    s.renderer.hourOverride = Math.max(dayHour(w), 17.6) + t * 2.2;
  }

  const h = w.herder;
  // Lead the camera a little toward where he is going.
  const next = h.path[Math.min(4, h.path.length - 1)];
  const lx = next ? (next.x - h.x) * 0.25 : 0;
  const ly = next ? (next.y - h.y) * 0.25 : 0;
  // At high fast-forward the herder outruns an eased camera; scale the easing and snap if he gets away.
  if (CAM_PIN) s.camera.snap(CAM_PIN.x, CAM_PIN.y);
  else {
    s.camera.follow(h.x + lx, h.y + ly, dt * Math.min(FAST, 12));
    if (Math.hypot(s.camera.x - h.x, s.camera.y - h.y) > 8) s.camera.snap(h.x, h.y);
  }
  s.bubbles.prune(nowMs);
  if (!document.hidden && nowMs - lastDrawMs >= FRAME_MIN_MS - 1) {
    lastDrawMs = nowMs;
    s.renderer.draw(w, s.camera, s.bubbles, nowMs);
    if ((nowMs | 0) % 4 === 0) s.minimap.draw($<HTMLCanvasElement>("minimap"), w);
  }
  updateHud();
}

/** Watchdog: if the loop dies while we are visible and running, restart it from the saved state. */
window.setInterval(() => {
  const s = session;
  if (!s) return;
  if (shouldRecover({ nowMs: performance.now(), lastTickMs, lastFrameMs, hidden: document.hidden, paused, finished: s.world.finished })) {
    console.warn("Curse of the Herder: loop stalled; restarting frame loop.");
    lastTickMs = lastFrameMs = performance.now();
    requestAnimationFrame(frame);
  }
}, 5000);

/** Hide the chrome after ten quiet seconds; any mouse or key brings it back. */
function installQuietMode(): void {
  let timer = 0;
  const wake = (): void => {
    document.body.classList.remove("quiet");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if ($<HTMLElement>("hall").hidden && overlay.hidden && $<HTMLElement>("menu").hidden) document.body.classList.add("quiet");
    }, 10_000);
  };
  for (const ev of ["mousemove", "mousedown", "keydown", "touchstart", "wheel"]) window.addEventListener(ev, wake, { passive: true });
  wake();
}

async function boot(): Promise<void> {
  installQuietMode();
  startUpdatePolling({
    currentVersion: __APP_VERSION__,
    versionUrl: `${import.meta.env.BASE_URL}version.json`,
    beforeReload: async () => {
      if (session) await repository.save(session.world);
    },
  });
  window.addEventListener("resize", () => session?.renderer.resize());
  $("btn-pause").addEventListener("click", () => {
    paused = !paused;
    updateHud(true);
  });
  const menu = $<HTMLElement>("menu");
  const toggleMenu = (show?: boolean): void => {
    menu.hidden = show === undefined ? !menu.hidden : !show;
    if (!menu.hidden) void refreshLoadList();
  };
  $("btn-menu").addEventListener("click", () => toggleMenu());
  $("btn-menu-close").addEventListener("click", () => toggleMenu(false));
  $("btn-new").addEventListener("click", () => {
    toggleMenu(false);
    void newHerder();
  });
  $("btn-hall").addEventListener("click", () => {
    toggleMenu(false);
    void showHall();
  });
  const selSpeed = $<HTMLSelectElement>("sel-speed");
  selSpeed.value = [1, 2, 5, 10, 20, 50, 100].includes(FAST) ? String(FAST) : "1";
  selSpeed.addEventListener("change", () => {
    FAST = Number(selSpeed.value) || 1;
    repository.setSetting("speed", String(FAST));
    if (session) session.world.lastWallMs = Date.now();
    updateHud(true);
    toast(FAST === 1 ? "Real time. A day is a day." : `${FAST}× speed: a day takes about ${Math.round((9 * 60) / FAST)} minutes.`);
  });
  const selText = $<HTMLSelectElement>("sel-text");
  selText.value = repository.getSetting("text", "1");
  const applyText = (v: string): void => {
    textScale = Number(v) || 1;
    if (session) session.renderer.fontScale = textScale;
    document.documentElement.style.setProperty("--caption-scale", String(textScale));
  };
  applyText(selText.value);
  selText.addEventListener("change", () => {
    repository.setSetting("text", selText.value);
    applyText(selText.value);
  });
  const selContrast = $<HTMLSelectElement>("sel-contrast");
  selContrast.value = repository.getSetting("contrast", "paper");
  const applyContrast = (v: string): void => {
    contrastSetting = v === "high";
    if (session) session.renderer.highContrast = contrastSetting;
  };
  applyContrast(selContrast.value);
  selContrast.addEventListener("change", () => {
    repository.setSetting("contrast", selContrast.value);
    applyContrast(selContrast.value);
  });
  const selMotion = $<HTMLSelectElement>("sel-motion");
  const osReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const applyMotion = (v: string): void => {
    const reduced = v === "reduced";
    document.body.classList.toggle("reduced-motion", reduced);
    if (session) session.renderer.reducedMotion = reduced;
    motionSetting = reduced;
  };
  selMotion.value = repository.getSetting("motion", osReduced ? "reduced" : "full");
  applyMotion(selMotion.value);
  selMotion.addEventListener("change", () => {
    repository.setSetting("motion", selMotion.value);
    applyMotion(selMotion.value);
  });
  const selFps = $<HTMLSelectElement>("sel-fps");
  selFps.value = String(FPS_CAP === 60 || FPS_CAP === 30 || FPS_CAP === 15 ? FPS_CAP : 60);
  selFps.addEventListener("change", () => {
    repository.setSetting("fps", selFps.value);
    toast("Frame rate applies after the next reload.");
  });
  $("btn-hall-close").addEventListener("click", () => {
    $<HTMLElement>("hall").hidden = true;
  });
  const selLang = $<HTMLSelectElement>("sel-lang");
  selLang.value = String(BAND_CAP);
  selLang.addEventListener("change", () => {
    BAND_CAP = Number(selLang.value) as Band;
    repository.setSetting("band", selLang.value);
    toast(BAND_CAP === 4 ? "Full language. He will say what he says." : BAND_CAP === 2 ? "Mild: damns and bloodies, nothing stronger." : "Clean: minced oaths only.");
  });
  $("btn-export").addEventListener("click", () => void exportJson());
  $<HTMLInputElement>("inp-import").addEventListener("change", (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) void importJson(f);
  });
  const selEnd = $<HTMLSelectElement>("sel-end");
  selEnd.value = repository.getSetting("end", "loop");
  selEnd.addEventListener("change", () => repository.setSetting("end", selEnd.value));
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
    else if (e.key.toLowerCase() === "m") toggleMenu();
    else if (e.key.toLowerCase() === "h") {
      const hall = $<HTMLElement>("hall");
      if (hall.hidden) void showHall();
      else hall.hidden = true;
    } else if (e.key === "Escape") {
      $<HTMLElement>("hall").hidden = true;
      toggleMenu(false);
    }
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
