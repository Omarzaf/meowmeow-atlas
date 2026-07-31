import { expect, test } from "@playwright/test";

/**
 * The dev server hands every path the same shell, so these assert the routing
 * and metadata the client applies. The 404 *status* is asserted against the
 * worker in tests/sites-worker.test.mjs, which is what serves production.
 */
test("unknown routes render the not-found page, not the atlas", async ({ page }) => {
  await page.goto("/not-a-real-page");

  await expect(page).toHaveTitle("Page not found — MeowMeow");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /This address is not part of the atlas/,
  );
  await expect(page.getByRole("heading", { level: 1, name: "MeowMeow" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Research atlas/ })).toBeVisible();
});

test("each route carries its own title, description, and canonical URL", async ({ page }) => {
  const metadataFor = async (path: string) => {
    await page.goto(path);
    return page.evaluate(() => ({
      title: document.title,
      description: document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    }));
  };

  const atlas = await metadataFor("/");
  const archive = await metadataFor("/visual-archive");

  expect(atlas.title).toBe("MeowMeow — Gen Z Protest Atlas");
  expect(archive.title).toBe("Visual archive — MeowMeow");
  expect(atlas.description).not.toBe(archive.description);
  expect(archive.description).toMatch(/Rights-cleared protest photographs/);
  expect(atlas.canonical).toMatch(/\/$/);
  expect(archive.canonical).toMatch(/\/visual-archive$/);
});

test("the not-found page recovers to a working route", async ({ page }) => {
  await page.goto("/visual-archive/typo");
  await page.getByRole("link", { name: /Research atlas/ }).click();

  await expect(page).toHaveTitle("MeowMeow — Gen Z Protest Atlas");
  await expect(page.getByRole("heading", { level: 1, name: "MeowMeow" })).toBeVisible();
});

test("the wordmark cat stops moving when the reader asks for reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  const legs = page.locator(".walking-cat__leg");
  await expect(legs).toHaveCount(4);

  // Every leg and the tail must have no running animation at all.
  const running = await page.evaluate(() =>
    [...document.querySelectorAll(".walking-cat__leg, .walking-cat__tail")].filter(
      (node) => node.getAnimations().length > 0,
    ).length,
  );
  expect(running).toBe(0);

  // ...and they must settle mid-stride rather than snapping to a rest pose,
  // so the still mark is still deliberately a cat walking.
  const rotations = await page.evaluate(() =>
    [...document.querySelectorAll(".walking-cat__leg")].map(
      (node) => getComputedStyle(node).transform,
    ),
  );
  expect(rotations.every((value) => value !== "none")).toBe(true);

  await context.close();
});
