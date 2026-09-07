import { chromium } from "@playwright/test";
const [url] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
p.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") console.log("[console]", m.text().slice(0, 200)); });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
const first = await p.textContent("#hud-name");
await p.waitForFunction((n) => (document.getElementById("hud-name")?.textContent ?? "") !== n && document.getElementById("overlay")?.hidden, first, { timeout: 300000, polling: 1000 });
await p.waitForTimeout(3000);
const read = async () => p.evaluate(() => {
  const c = document.getElementById("game"); const ctx = c.getContext("2d");
  const d = window.__curse.diag();
  // sample 5 points across the middle row of the canvas
  const pts = [0.2, 0.35, 0.5, 0.65, 0.8].map((f) => { const px = ctx.getImageData(Math.floor(c.width * f), Math.floor(c.height * 0.5), 1, 1).data; return `${px[0]},${px[1]},${px[2]}`; });
  return { name: d.name, mode: d.chunk.mode, canvasPixels: pts, w: c.width, h: c.height };
});
console.log("before", JSON.stringify(await read()));
await p.screenshot({ path: `${process.env.S}/exp-before.png` });
await p.evaluate(() => window.dispatchEvent(new Event("resize")));
await p.waitForTimeout(1500);
console.log("after resize", JSON.stringify(await read()));
await p.screenshot({ path: `${process.env.S}/exp-after.png` });
await b.close();
