import { expect, test } from "@playwright/test";

test("a compressed day starts, the herder pens sheep, and nothing external is fetched", async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.hostname !== "localhost") external.push(r.url());
  });
  await page.goto("?fast=120&new=1");
  await expect(page.locator("#hud-name")).not.toHaveText("Curse of the Herder", { timeout: 60_000 });
  await expect(page.locator("#overlay")).toBeHidden({ timeout: 60_000 });
  // At 120x, a few sheep are home within half a minute.
  await expect.poll(async () => Number((await page.textContent("#hud-flock"))?.split("/")[0]), { timeout: 60_000 }).toBeGreaterThan(2);
  // He has said something.
  await expect(page.locator("#line-text")).not.toHaveText("…");
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("the Hall opens and closes", async ({ page }) => {
  await page.goto("?new=1");
  await expect(page.locator("#overlay")).toBeHidden({ timeout: 60_000 });
  await page.click("#btn-hall");
  await expect(page.locator("#hall")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#hall")).toBeHidden();
});

test("a whole compressed day ends with every sheep penned and a Hall record", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("?fast=600&new=1");
  await expect(page.locator("#overlay")).toBeHidden({ timeout: 60_000 });
  // The end card appears about 24 s after the last sheep; a day at 600x is ~55 s.
  await expect(page.locator("#overlay")).toBeVisible({ timeout: 200_000 });
  await expect(page.locator("#hud-flock")).toHaveText(/^60 \/ 60$/);
  await expect(page.locator("#overlay .stone .ep")).not.toBeEmpty();
  await page.keyboard.press("h");
  await expect(page.locator("#hall-grid .hall-card").first()).toBeVisible();
  expect(errors).toEqual([]);
});
