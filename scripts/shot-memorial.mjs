// Run a 600× day to the end, wait for the next herder, then zoom on the memorial stone by the pen.
//   node scripts/shot-memorial.mjs <url> <outprefix>
import { chromium } from "@playwright/test";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
const first = await p.textContent("#hud-name");
await p.waitForFunction((n) => (document.getElementById("hud-name")?.textContent ?? "") !== n && document.getElementById("overlay")?.hidden, first, { timeout: 300000, polling: 1000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}-full.png` });
await p.screenshot({ path: `${out}-zoom.png`, clip: { x: 340, y: 220, width: 600, height: 360 } });
console.log("second herder:", await p.textContent("#hud-name"));
await b.close();
