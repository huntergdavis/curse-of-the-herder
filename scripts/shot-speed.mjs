// Verify a 100x day via the menu selector: pick 100x, wait, report clock and line count.
import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
p.on("pageerror", (e) => console.log("[pageerror]", e.message));
await p.goto("http://localhost:4174/curse-of-the-herder/?new=1");
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.click("#btn-menu");
await p.selectOption("#sel-speed", "100");
await p.click("#btn-menu-close");
let lines = 0, last = "";
const start = Date.now();
while (Date.now() - start < 60000) {
  await p.waitForTimeout(500);
  const t = await p.textContent("#line-text");
  if (t !== last) { last = t; lines++; }
}
console.log("after 60s at 100x:", await p.textContent("#hud-clock"), await p.textContent("#hud-flock"), "distinct lines shown:", lines, "mode:", await p.textContent("#hud-mode"));
await p.screenshot({ path: process.argv[2] });
await b.close();
