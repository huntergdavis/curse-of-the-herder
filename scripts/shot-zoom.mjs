// Zoomed screenshot of the centre of the view: node scripts/shot-zoom.mjs <url> <outfile> [waitMs]
import { chromium } from "@playwright/test";
const [url, out, waitMs = "3000"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
await page.goto(url);
await page.waitForTimeout(Number(waitMs));
await page.screenshot({ path: out, clip: { x: 440, y: 270, width: 400, height: 260 } });
console.log("saved", out);
await browser.close();
