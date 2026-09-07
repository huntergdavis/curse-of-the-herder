// Memory soak: run compressed days back to back and sample the JS heap.
//   node scripts/soak.mjs <url> <minutes>
import { chromium } from "@playwright/test";
const [url, minutes = "4"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--enable-precise-memory-info"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url);
const start = Date.now();
const samples = [];
while (Date.now() - start < Number(minutes) * 60_000) {
  await page.waitForTimeout(20_000);
  const m = await page.evaluate(() => ({
    heap: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : -1,
    flock: document.getElementById("hud-flock")?.textContent,
    name: document.getElementById("hud-name")?.textContent,
    clock: document.getElementById("hud-clock")?.textContent,
  }));
  samples.push(m);
  console.log(`${((Date.now() - start) / 1000) | 0}s heap=${m.heap.toFixed(1)}MB ${m.name} ${m.clock} ${m.flock}`);
}
// Compare GC floors (minimum heap) of the first and second halves: peaks are just GC timing.
const half = Math.floor(samples.length / 2);
const floorOf = (arr) => Math.min(...arr.map((m) => m.heap));
const first = floorOf(samples.slice(0, Math.max(1, half)));
const last = floorOf(samples.slice(half));
const hours = Number(minutes) / 60 / 2;
console.log(`heap floor first-half=${first.toFixed(1)}MB second-half=${last.toFixed(1)}MB slope=${((last - first) / hours).toFixed(1)} MB/hour-of-real-time (floors)`);
await browser.close();
