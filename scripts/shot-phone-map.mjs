// Phone viewport: tap the Map button, then screenshot with the minimap shown.
import { chromium } from "@playwright/test";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}-before.png` });
await p.click("#btn-map");
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}-map.png` });
const box = await p.locator("#minimap").boundingBox();
console.log("minimap box", JSON.stringify(box));
await b.close();
