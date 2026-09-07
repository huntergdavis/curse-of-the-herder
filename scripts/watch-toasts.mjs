// Log every toast and herder line for a while: node scripts/watch-toasts.mjs <url> [seconds]
import { chromium } from "@playwright/test";
const [url, secs = "90"] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
let lastToast = ""; let lastHeard = "";
const t0 = Date.now();
while (Date.now() - t0 < Number(secs) * 1000) {
  await p.waitForTimeout(300);
  const [toast, heard, clock] = await p.evaluate(() => [document.getElementById("toast")?.textContent ?? "", document.getElementById("line-text")?.textContent ?? "", document.getElementById("hud-clock")?.textContent ?? ""]);
  if (toast !== lastToast && toast) console.log(`${clock} TOAST  ${toast.slice(0, 120)}`);
  if (heard !== lastHeard && heard) console.log(`${clock} HERDER ${heard.slice(0, 120)}`);
  lastToast = toast; lastHeard = heard;
}
await b.close();
