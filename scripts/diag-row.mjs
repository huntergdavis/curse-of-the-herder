// Compare the sim's terrain along the herder's row with what the main canvas shows there.
import { chromium } from "@playwright/test";
const [url] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.evaluate(() => { window.__curse.teleportToPen(); });
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const d = window.__curse.diag();
  const c = document.getElementById("game"); const ctx = c.getContext("2d");
  const T = d.tilePx; const W = c.width, H = c.height;
  const cam = d.camera; const hy = Math.round(d.herder.y);
  const offX = Math.round(W / 2 - (cam.x + 0.5) * T); const offY = Math.round(H / 2 - (cam.y + 0.5) * T);
  let sim = "", seen = "";
  const m = window.__curse.mapRow(hy, Math.round(d.herder.x) - 14, Math.round(d.herder.x) + 14);
  for (let i = 0; i < m.length; i++) {
    const wx = Math.round(d.herder.x) - 14 + i;
    const px = ctx.getImageData(Math.floor(offX + (wx + 0.5) * T), Math.floor(offY + (hy + 0.5) * T), 1, 1).data;
    const [R, G, B] = px;
    seen += B > 150 && R < 120 ? "W" : R > 190 && G > 170 ? "R" : G > R && G > 120 ? "g" : "?";
  }
  sim = m;
  return { herder: d.herder, pen: d.pen, cam, T, W, H, sim, seen };
});
console.log(JSON.stringify(r));
await b.close();
