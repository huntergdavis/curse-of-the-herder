// Screenshot helper: node scripts/shot.mjs <url> <outfile> [waitMs] [w] [h]
import { chromium } from "@playwright/test";
const [url, out, waitMs = "4000", w = "1440", h = "900"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[console]", m.type(), m.text()); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url);
await page.waitForTimeout(Number(waitMs));
await page.screenshot({ path: out });
console.log("saved", out);
await browser.close();
