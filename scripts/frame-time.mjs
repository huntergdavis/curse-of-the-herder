// Measure render frame times in the browser under several conditions.
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const cases = [
  ["plain field, noon", "?seed=roofy&new=1&fast=1&hour=12", false],
  ["plain field, reduced motion", "?seed=roofy&new=1&fast=1&hour=12", true],
  ["village, noon", "?seed=roofy&new=1&cam=222,190&fast=1&hour=12", false],
  ["windy dusk", "?seed=roofy&new=1&fast=1&weather=wind&hour=17.9", false],
  ["fog", "?seed=roofy&new=1&fast=1&weather=fog&hour=12", false],
];
for (const [label, url, reduced] of cases) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  if (reduced) await ctx.addInitScript(() => localStorage.setItem("curse-of-the-herder:motion", "reduced"));
  const p = await ctx.newPage();
  await p.goto("http://localhost:4174/curse-of-the-herder/" + url);
  await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
  await p.waitForTimeout(2500);
  const stats = await p.evaluate(() => new Promise((res) => {
    const t = []; let last = performance.now(); let n = 0;
    const tick = (now) => { t.push(now - last); last = now; if (++n < 120) requestAnimationFrame(tick); else { t.sort((a, b) => a - b); res({ median: t[60], p95: t[114] }); } };
    requestAnimationFrame(tick);
  }));
  console.log(label.padEnd(30), "median", stats.median.toFixed(1), "ms  p95", stats.p95.toFixed(1));
  await ctx.close();
}
await b.close();
