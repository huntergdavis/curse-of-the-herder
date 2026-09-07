// Two compressed days, then the Hall with its Almanac.
import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => console.log("[pageerror]", e.message));
for (let day = 0; day < 2; day++) {
  await p.goto("http://localhost:4174/curse-of-the-herder/?fast=600&new=1");
  await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
  await p.waitForSelector("#overlay", { state: "visible", timeout: 200000 });
}
await p.keyboard.press("h");
await p.waitForTimeout(800);
await p.screenshot({ path: process.argv[2] });
await b.close();
