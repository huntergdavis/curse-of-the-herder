// Click the minimap's top-left corner, screenshot at once and again after the view returns.
//   node scripts/shot-look.mjs <url> <outprefix>
import { chromium } from "@playwright/test";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}-0-before.png` });
const box = await p.locator("#minimap").boundingBox();
await p.mouse.move(box.x + 30, box.y + 30);
await p.mouse.down();
await p.mouse.move(box.x + 24, box.y + 40, { steps: 8 });
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}-1-held.png` });
await p.mouse.up();
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}-2-released.png` });
await p.waitForTimeout(5000);
await p.screenshot({ path: `${out}-3-back.png` });
await b.close();
