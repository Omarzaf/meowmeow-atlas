import { expect, test, type Page } from "@playwright/test";

const pageErrors = new WeakMap<Page, string[]>();
const footer = (page: Page) => page.locator(".atlas-footer");

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle("meowmeow — Gen Z Protest Atlas");
  await expect(page.getByRole("heading", { level: 1, name: "meowmeow" })).toBeVisible();
  await expect(page.getByText("Gen Z Protest Atlas", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "meowmeow" }).locator("svg")).toHaveCount(1);
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page) ?? []).toEqual([]);
});

test("searches the corpus and exposes the supporting case evidence", async ({ page }) => {
  await expect(footer(page)).toContainText(
    /Showing 6 of 11 matching cases and 6 of \d+ matching sources\./,
  );

  await page
    .getByLabel("Search cases, countries, rights, methods, or sources")
    .fill("Finance Bill");
  await expect(page.getByRole("button", { name: "Kenya anti-Finance Bill protests" })).toBeVisible();

  await page.getByRole("button", { name: "Kenya anti-Finance Bill protests" }).click();
  await expect(page.getByRole("heading", { name: "What the reviewed material supports" })).toBeVisible();
  await expect(page.getByText(/proposed Finance Bill 2024 helped trigger/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cited sources" })).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(footer(page)).toContainText(
    /Showing 6 of 11 matching cases and 6 of \d+ matching sources\./,
  );

  await page.getByRole("button", { name: "View all cases", exact: true }).click();
  await expect(page.getByRole("button", { name: "Show fewer cases", exact: true })).toBeVisible();
  await expect(footer(page)).toContainText(
    /Showing 11 of 11 matching cases and 6 of \d+ matching sources\./,
  );

  await page.getByRole("button", { name: "Show fewer cases", exact: true }).click();
  await expect(footer(page)).toContainText(
    /Showing 6 of 11 matching cases and 6 of \d+ matching sources\./,
  );
});

test("provides labelled icon navigation and live result feedback", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Explore meowmeow" });
  await expect(navigation).toBeVisible();
  expect(await navigation.locator("svg").count()).toBe(10);
  await expect(
    navigation.getByRole("link", { name: "Visual archive", exact: true }),
  ).toHaveAttribute("href", "/visual-archive");

  const overview = navigation.getByRole("button", { name: "Overview", exact: true });
  const cases = navigation.getByRole("button", { name: "Case atlas", exact: true });
  const monitors = navigation.getByRole("button", { name: "Live monitors", exact: true });

  await expect(overview).toHaveAttribute("aria-current", "location");
  await cases.click();
  await expect(cases).toHaveAttribute("aria-current", "location");
  await expect(page.locator("#cases")).toBeFocused();

  await monitors.click();
  await expect(monitors).toHaveAttribute("aria-current", "location");
  await expect(page.locator("#sources")).toBeFocused();
  await expect(page.getByRole("combobox", { name: "Topic", exact: true })).toHaveValue(
    "connectivity_monitoring",
  );
  await expect(page.getByText(/\d+ cases? · \d+ sources?/)).toBeVisible();

  const clearFilters = page.getByRole("button", { name: "Clear filters", exact: true });
  await expect(clearFilters).toBeEnabled();
  await clearFilters.click();
  await expect(clearFilters).toBeDisabled();
  await expect(page.getByText(/11 cases · \d+ sources/)).toBeVisible();
});

test("opens legal authority and technical-monitoring profiles without leaving the atlas", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Source type", exact: true }).selectOption("legal_standard");
  await expect(footer(page)).toContainText(
    /Showing 0 of 0 matching cases and \d+ of \d+ matching sources\./,
  );

  const sourceToggle = page.getByRole("button", {
    name: "General Comment No. 37 on Article 21: Right of Peaceful Assembly",
  });
  await sourceToggle.click();

  await expect(page.getByRole("heading", { name: "Why it matters" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Legal profile" })).toBeVisible();
  await expect(page.getByText("Authoritative Interpretation", { exact: true })).toBeVisible();
  await expect(page.getByText(/Least Intrusive Means/)).toBeVisible();
  const canonicalLink = page.getByRole("link", { name: "Open canonical source" });
  await expect(canonicalLink).toHaveAttribute("target", "_blank");
  await expect(canonicalLink).toHaveAttribute("href", /^https:\/\/www\.ohchr\.org\//);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("combobox", { name: "Source type", exact: true }).selectOption("monitor");
  await expect(footer(page)).toContainText(
    /Showing 0 of 0 matching cases and \d+ of \d+ matching sources\./,
  );

  await page.getByRole("button", { name: "OONI Explorer", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Technical profile" })).toBeVisible();
  await expect(page.getByText(/false positive/)).toBeVisible();
});

test("keeps the core atlas usable at a mobile viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only responsive assertion");

  await expect(page.getByRole("navigation")).toBeVisible();
  await page.getByRole("combobox", { name: "Topic", exact: true }).selectOption("digital_repression");
  await expect(page.locator(".atlas-footer").getByText("matching sources", { exact: false })).toBeVisible();
  const overviewButton = page.getByRole("button", { name: "Overview", exact: true });
  const overviewBox = await overviewButton.boundingBox();
  expect(overviewBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  const viewportWidths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(viewportWidths.scroll).toBeLessThanOrEqual(viewportWidths.client + 1);
});
