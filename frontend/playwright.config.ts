import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright E2E configuration.
 * Tests run against the local Next.js dev server (http://localhost:3000).
 * CI uses a pre-built production server via webServer.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    /* Desktop Chrome */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    /* Mobile Safari (iPhone 14 viewport) */
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],

  /* Start Next.js dev server before tests in CI */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
