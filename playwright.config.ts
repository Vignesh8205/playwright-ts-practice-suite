/**
 * ROOT playwright.config.ts
 * Used for running all standalone examples in the /examples folder.
 * For the full framework, use framework/playwright.config.ts
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Examples use the public Playwright demo site
  testDir: "./examples",
  // testMatch: "**/*.spec.ts",

  fullyParallel: false,     // Keep serial for learning purposes
  workers: 1,
  retries: 0,
  timeout: 30_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  use: {
    // Public demo sites used for examples
    baseURL: "https://playwright.dev",
    headless: true,
    screenshot: "only-on-failure",
    video: "off",
    trace: "off",
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  outputDir: "test-results/examples/",
});
