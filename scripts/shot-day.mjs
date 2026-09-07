// Screenshot a fast day every few seconds, through the end and into the next herder.
//   node scripts/shot-day.mjs <url> <outdir> [totalSeconds] [everySeconds]
import { chromium } from "@playwright/test";
const [url, out, total = "200", every = "8"] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
p.on("pageerror", (e) => console.log("[pageerror]", e.message));
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
const t0 = Date.now(); let n = 0;
while (Date.now() - t0 < Number(total) * 1000) {
  await p.waitForTimeout(Number(every) * 1000);
  const [clock, name, flock] = await p.evaluate(() => ["hud-clock", "hud-name", "hud-flock"].map((id) => document.getElementById(id)?.textContent ?? ""));
  const file = `${out}/day-${String(n).padStart(2, "0")}.png`;
  await p.screenshot({ path: file });
  console.log(`${String(n).padStart(2, "0")} ${clock} ${flock} ${name}`);
  n++;
}
await b.close();
