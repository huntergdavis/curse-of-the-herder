// Measure frame-to-frame brightness during the ending fade; large jumps mean flicker.
import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://localhost:4174/curse-of-the-herder/?fast=600&new=1");
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.waitForFunction(() => document.getElementById("hud-flock")?.textContent?.startsWith("60 /"), null, { timeout: 200000 });
const samples = [];
for (let i = 0; i < 18; i++) {
  await p.waitForTimeout(700);
  samples.push(await p.evaluate(() => {
    const c = document.getElementById("game"); const x = c.getContext("2d");
    const d = x.getImageData(0, 0, c.width, c.height).data; let s = 0, n = 0;
    for (let k = 0; k < d.length; k += 160) { s += d[k] + d[k + 1] + d[k + 2]; n++; }
    return s / n / 3;
  }));
}
const jumps = samples.slice(1).map((v, i) => Math.abs(v - samples[i]));
console.log("brightness:", samples.map((v) => v.toFixed(0)).join(" "));
console.log("max jump between 0.7s frames:", Math.max(...jumps).toFixed(1), "(a smooth fade should stay under ~8)");
await b.close();
