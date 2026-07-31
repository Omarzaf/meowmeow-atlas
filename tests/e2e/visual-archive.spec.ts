import { expect, test, type Page } from "@playwright/test";

const pageErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/visual-archive");
  await expect(page).toHaveTitle("Visual archive — MeowMeow");
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page) ?? []).toEqual([]);
});

test("presents eight local, rights-cleared visual records with context", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Visual archive" })).toBeVisible();
  await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".archive-feature")).toHaveCount(1);
  await expect(page.locator(".archive-card")).toHaveCount(7);

  const images = page.locator("main img");
  await expect(images).toHaveCount(8);
  const sources = await images.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("src")),
  );
  expect(sources.every((source) => source?.startsWith("/visual-archive/"))).toBe(true);

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  await expect(page.locator(".archive-image-fallback")).toHaveCount(0);

  const feature = page.locator(".archive-feature");
  await expect(feature.getByRole("heading", { name: "Bangla Blockade" })).toBeVisible();
  await expect(feature.getByRole("heading", { name: "Context sources" })).toBeVisible();
  await expect(feature.locator(".archive-sources a")).toHaveCount(2);
  await feature.locator("summary").click();
  await expect(feature.getByText(/No independent forensic manipulation audit/)).toBeVisible();
});

test("labels international solidarity separately and opens the related atlas case", async ({
  page,
}) => {
  const solidarityCard = page.locator(".archive-card").filter({
    has: page.getByRole("heading", { name: "Woman, Life, Freedom travels" }),
  });

  await solidarityCard.scrollIntoViewIfNeeded();
  await expect(solidarityCard.getByText("International solidarity", { exact: true })).toBeVisible();
  await expect(solidarityCard.getByText(/Berlin, Germany/)).toBeVisible();
  await expect(
    solidarityCard.getByText(/This photograph was made in Germany, not Iran\./),
  ).toBeVisible();

  const relatedCase = page.getByRole("link", {
    name: /Open related case: Bangladesh quota-reform protests/,
  });
  await relatedCase.click();
  await expect(page).toHaveTitle("MeowMeow — Gen Z Protest Atlas");
  await expect(page.getByRole("combobox", { name: "Case", exact: true })).toHaveValue(
    "bangladesh-2024",
  );
  await expect(page.getByRole("button", { name: "Bangladesh quota-reform protests" })).toBeVisible();
});

test("keeps archive navigation and content usable on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only responsive assertion");

  const navigation = page.getByRole("navigation", { name: "Explore MeowMeow" });
  await expect(navigation).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Visual archive", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: "Method & rights", exact: true }).click();
  await expect(page.getByRole("heading", { name: "How to read this archive" })).toBeVisible();

  const viewportWidths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(viewportWidths.scroll).toBeLessThanOrEqual(viewportWidths.client + 1);
});
