// README assets: a few stills into docs/img and 60 frames for a GIF into <framesDir>.
//   node scripts/shot-readme.mjs <base-url> <framesDir>
import { chromium } from "@playwright/test";
const [base, frames] = process.argv.slice(2);
const b = await chromium.launch();
const shot = async (path, file, waitMs, vp = { width: 1280, height: 800 }, extra = null) => {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1, ...(extra ?? {}) });
  await p.goto(`${base}${path}`);
  await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
  await p.waitForTimeout(waitMs);
  await p.screenshot({ path: `docs/img/${file}` });
  await p.close();
  console.log("saved", file);
};
await shot("?new=1&seed=readme-dawn&clean=1", "herder-and-dog.png", 2500);
await shot("?new=1&seed=readme-road&fast=100&clean=1", "morning-road.png", 24000);
await shot("?new=1&seed=tom&rival=1&clean=1", "neighbour.png", 5200);
await shot("?new=1&seed=readme-lunch&fast=100&books=6&clean=1", "afternoon.png", 45000);
// Phone with the map popped.
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`${base}?new=1&seed=phone`);
  await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.click("#btn-map");
  await p.waitForTimeout(500);
  await p.screenshot({ path: "docs/img/phone.png" });
  await p.close();
  console.log("saved phone.png");
}
// GIF frames: warm up at 100x with a few books, then 10x for twenty seconds at 3 fps.
{
  const p = await b.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 1 });
  await p.goto(`${base}?new=1&seed=readme-gif&fast=100&books=10&clean=1`);
  await p.waitForSelector("#overlay", { state: "hidden", timeout: 60000 });
  await p.waitForTimeout(40000);
  await p.evaluate(() => { const s = document.querySelector("#sel-speed"); s.value = "10"; s.dispatchEvent(new Event("change")); });
  for (let i = 0; i < 60; i++) {
    await p.waitForTimeout(333);
    await p.screenshot({ path: `${frames}/f-${String(i).padStart(3, "0")}.png` });
  }
  await p.close();
  console.log("frames done");
}
await b.close();
