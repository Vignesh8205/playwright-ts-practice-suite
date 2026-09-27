/**
 * ROOT playwright.config.ts
 * Used for running all standalone examples in the /examples folder.
 * For the full framework, use framework/playwright.config.ts
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Include all specs across the project
  testDir: ".",
  testMatch: "**/*.spec.ts",

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
    {
      name: "edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],

  outputDir: "test-results/examples/",
});
