// Two zoomed frames of the dog trotting, 180 ms apart, to check the legs move.
import { chromium } from "@playwright/test";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.waitForTimeout(6000);
for (let i = 0; i < 3; i++) {
  await p.screenshot({ path: `${out}-${i}.png`, clip: { x: 440, y: 260, width: 400, height: 260 } });
  await p.waitForTimeout(180);
}
await b.close();
