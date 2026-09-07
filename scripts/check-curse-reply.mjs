// Run a fast day and log every Curse toast and the herder's next line after it.
import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://localhost:4174/curse-of-the-herder/?fast=100&new=1&seed=heckle&books=6");
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
let lastToast = ""; let lastHeard = ""; let curses = 0; let replies = 0; let awaiting = false;
const t0 = Date.now();
while (Date.now() - t0 < 150000) {
  await p.waitForTimeout(400);
  const [toast, heard] = await p.evaluate(() => [document.getElementById("toast")?.textContent ?? "", document.getElementById("line-text")?.textContent ?? ""]);
  if (toast !== lastToast && toast.startsWith("The Curse:")) { curses++; awaiting = true; console.log("CURSE ", toast.slice(0, 110)); }
  if (heard !== lastHeard && awaiting && heard) { replies++; awaiting = false; console.log("HERDER", heard.slice(0, 110)); }
  lastToast = toast; lastHeard = heard;
}
console.log("curse toasts:", curses, "next herder lines:", replies);
await b.close();
