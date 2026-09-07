import { chromium } from "@playwright/test";
const [url] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 3 });
p.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") console.log("[console]", m.text().slice(0, 200)); });
await p.goto(url);
await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
await p.waitForTimeout(4000);
console.log("h1", JSON.stringify(await p.evaluate(() => window.__curse.diag().chunk)));
const first = await p.textContent("#hud-name");
await p.waitForFunction((n) => (document.getElementById("hud-name")?.textContent ?? "") !== n && document.getElementById("overlay")?.hidden, first, { timeout: 300000, polling: 1000 });
for (let i = 0; i < 3; i++) { await p.waitForTimeout(3000); console.log("h2", JSON.stringify(await p.evaluate(() => window.__curse.diag()))); }
await b.close();
