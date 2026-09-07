import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4174/curse-of-the-herder/?fast=8&new=1"); await p.waitForTimeout(6000);
await p.click("#btn-menu"); await p.waitForTimeout(500); await p.screenshot({ path: process.argv[2] }); await b.close();
