// Reach the second herder at 600x, drop to 1x, then compare screenshot, canvas readback and the chunk under the herder.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const [url, out, speedSel = "#sel-speed"] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
p.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") console.log("[console]", m.text().slice(0, 200)); });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
const first = await p.textContent("#hud-name");
await p.waitForFunction((n) => (document.getElementById("hud-name")?.textContent ?? "") !== n && document.getElementById("overlay")?.hidden, first, { timeout: 300000, polling: 1000 });
await p.evaluate((sel) => { const s = document.querySelector(sel); s.value = "1"; s.dispatchEvent(new Event("change")); }, speedSel);
await p.waitForTimeout(4000);
const r = await p.evaluate(async () => {
  const c = document.getElementById("game"); const ctx = c.getContext("2d");
  const d = window.__curse.diag();
  const ch = await window.__curse.chunkAt();
  const pts = [0.2, 0.35, 0.5, 0.65, 0.8].map((f) => { const px = ctx.getImageData(Math.floor(c.width * f), Math.floor(c.height * 0.5), 1, 1).data; return `${px[0]},${px[1]},${px[2]}`; });
  return { d, rows: ch.rows, png: ch.png, cx: ch.cx, cy: ch.cy, pts, w: c.width, h: c.height };
});
await p.screenshot({ path: `${out}-screen.png` });
if (r.png) writeFileSync(`${out}-chunk.png`, Buffer.from(r.png.split(",")[1], "base64"));
console.log(JSON.stringify({ name: r.d.name, herder: r.d.herder, cam: r.d.camera, simT: r.d.simTerrainAtHerder, chunk: r.d.chunk, cxcy: [r.cx, r.cy], pts: r.pts }));
console.log(r.rows.join("\n"));
await b.close();
