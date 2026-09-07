// A fresh herder at the pen at 1×, with a long epitaph set on the memorial stone through the debug hook.
//   node scripts/shot-memorial.mjs <url-with-debug=1> <outprefix>
import { chromium } from "@playwright/test";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.evaluate(() => { window.__curse.teleportToPen(); window.__curse.memorial("Lettice Half-Awake of the Far Pen", "Here lies misery, with a hat, sixty sheep behind him and not one of them grateful; he said what he meant."); });
console.log("after teleport", JSON.stringify(await p.evaluate(() => { const d = window.__curse.diag(); return { herder: d.herder, camera: d.camera }; })));
await p.waitForTimeout(400);
console.log("400ms later", JSON.stringify(await p.evaluate(() => { const d = window.__curse.diag(); return { herder: d.herder, camera: d.camera }; })));
await p.screenshot({ path: `${out}-full.png` });
await p.screenshot({ path: `${out}-zoom.png`, clip: { x: 380, y: 250, width: 520, height: 300 } });
console.log("clock", await p.textContent("#hud-clock"));
await b.close();
