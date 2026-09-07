// Screenshot the rainbow: trigger the renderer's rainStopped hook directly via a debug path is not exposed,
// so run a fast day and grab the frame when "rainStops" has just happened (poll the caption for a rain line).
import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4174/curse-of-the-herder/?seed=roofy&new=1&fast=40");
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
// rainStopped fires renderer.rainbowFromMs; we cannot see it from outside, so sample frames every 2 s for 2 min and keep the most colourful.
let best = null, bestScore = -1;
for (let i = 0; i < 60; i++) {
  await p.waitForTimeout(2000);
  const score = await p.evaluate(() => {
    const c = document.getElementById("game"); const x = c.getContext("2d");
    const d = x.getImageData(0, 0, c.width, Math.floor(c.height * 0.3)).data; let s = 0;
    for (let k = 0; k < d.length; k += 64) { const r = d[k], g = d[k + 1], bl = d[k + 2]; if (r > 200 && g < 120 && bl < 120) s++; }
    return s;
  });
  if (score > bestScore) { bestScore = score; best = await p.screenshot(); }
}
(await import("node:fs")).writeFileSync(process.argv[2], best);
console.log("best red-sky score", bestScore);
await b.close();
