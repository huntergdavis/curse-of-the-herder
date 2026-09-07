// Headless pacing simulator: how long does a board take?
//   npx tsx scripts/pace.ts --seeds 20 --size 512
import { generateMap } from "../src/core/map/generate";
import { createWorld, TICKS_PER_HOUR } from "../src/core/sim/state";
import { step } from "../src/core/sim/step";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i]!.replace(/^--/, ""), process.argv[i + 1] ?? "");
const seeds = Number(args.get("seeds") ?? 5);
const size = Number(args.get("size") ?? 576);
const maxHours = Number(args.get("maxHours") ?? 24);
const verbose = args.has("verbose");

const results: number[] = [];
for (let s = 0; s < seeds; s++) {
  const seed = `pace-${s}`;
  const t0 = performance.now();
  const map = generateMap(seed, { size });
  const world = createWorld(seed, map, 0);
  const maxTicks = maxHours * TICKS_PER_HOUR;
  let flees = 0;
  let lastPenned = 0;
  const ringDone: number[] = [];
  while (!world.finished && world.tick < maxTicks) {
    step(world, map);
    if (world.sheepPenned !== lastPenned) {
      lastPenned = world.sheepPenned;
      const ring = world.sheep.filter((x) => x.mode === "penned").reduce((m, x) => Math.max(m, x.ring), 0);
      if (ringDone[ring] === undefined) ringDone[ring] = world.tick;
    }
  }
  flees = world.sheep.reduce((a, x) => a + x.flees, 0);
  const hours = world.tick / TICKS_PER_HOUR;
  results.push(hours);
  const ringStr = ringDone.map((t, r) => `r${r}@${(t / TICKS_PER_HOUR).toFixed(1)}h`).join(" ");
  console.log(`${seed}: ${world.finished ? "done" : "UNFINISHED"} in ${hours.toFixed(2)} h; sheep ${world.sheepPenned}/${world.sheep.length}; flees ${flees}; frustration ${world.frustration.toFixed(0)}; ${ringStr}; sim ${(performance.now() - t0) / 1000 | 0}s`);
  if (verbose) for (const e of world.events) console.log("  ", e);
}
results.sort((a, b) => a - b);
const median = results[Math.floor(results.length / 2)] ?? 0;
console.log(`\nmedian ${median.toFixed(2)} h, min ${results[0]?.toFixed(2)} h, max ${results[results.length - 1]?.toFixed(2)} h over ${seeds} seeds`);
