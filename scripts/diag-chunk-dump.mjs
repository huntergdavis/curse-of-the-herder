// Second herder at dpr 3: dump the chunk surface under the herder and the map rows for it.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
const dump = async (tag) => {
  const r = await p.evaluate(() => window.__curse.chunkAt());
  console.log(tag, "chunk", r.cx, r.cy, "probe", JSON.stringify(r.probe));
  console.log(r.rows.join("\n"));
  if (r.png) writeFileSync(`${out}-${tag}.png`, Buffer.from(r.png.split(",")[1], "base64"));
  await p.screenshot({ path: `${out}-${tag}-screen.png` });
};
await p.waitForTimeout(3000);
await dump("h1");
const first = await p.textContent("#hud-name");
await p.waitForFunction((n) => (document.getElementById("hud-name")?.textContent ?? "") !== n && document.getElementById("overlay")?.hidden, first, { timeout: 300000, polling: 1000 });
await p.waitForTimeout(3000);
await dump("h2");
await b.close();
