import { defineConfig, devices } from "@playwright/test";

/**
 * `reuseExistingServer` attaches to whatever already holds this port, including
 * a dev server from another checkout of this project — which silently tests the
 * wrong tree. Override when running checkouts in parallel:
 * `ATLAS_E2E_PORT=4187 pnpm test:e2e`.
 */
const port = Number(process.env.ATLAS_E2E_PORT ?? 4178);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: origin,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${port} --strictPort`,
    reuseExistingServer: !process.env.CI,
    url: origin,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
});
