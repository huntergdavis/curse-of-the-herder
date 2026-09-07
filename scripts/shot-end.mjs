// Run a compressed day to its end and screenshot the ending card and the Hall.
import { chromium } from "@playwright/test";
const [url, outPrefix] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text()); });
await page.goto(url);
const start = Date.now();
while (Date.now() - start < 240_000) {
  const flock = await page.textContent("#hud-flock");
  const overlayShown = await page.evaluate(() => !document.getElementById("overlay").hidden);
  if (overlayShown && Date.now() - start > 5000) break;
  await page.waitForTimeout(2000);
}
console.log("flock at end:", await page.textContent("#hud-flock"), "after", ((Date.now() - start) / 1000) | 0, "s");
await page.screenshot({ path: `${outPrefix}-end.png` });
await page.keyboard.press("h");
await page.waitForTimeout(800);
await page.screenshot({ path: `${outPrefix}-hall.png` });
await browser.close();
