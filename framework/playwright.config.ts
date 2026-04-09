/**
 * FRAMEWORK: playwright.config.ts
 * Industry-standard configuration for the complete framework.
 */
import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

const env = process.env.ENV || "qa";
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",

  /* Parallelism */
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  /* Retries */
  retries: process.env.CI ? 2 : 0,

  /* Timeouts */
  timeout: 45_000,
  expect: { timeout: 15_000 },

  /* Global setup – authenticates once and saves session */
  globalSetup: "./global-setup.ts",

  /* Reporters */
  reporter: [
    ["html", { outputFolder: "./reports/html", open: "never" }],
    ["list"],
    ["json", { outputFile: "./reports/json/results.json" }],
    ...(process.env.CI ? [["github"] as const] : []),
  ],

  /* Shared settings for all projects */
  use: {
    baseURL: process.env.BASE_URL || "https://demoqa.com",
    headless: process.env.HEADLESS !== "false",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },

  /* Browser Projects */
  projects: [
    /* Setup — runs global-setup before authenticated tests */
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
    },

    /* Main browser — Chromium (default) */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use stored auth state if it exists
        // storageState: "./reports/.auth/user.json",
      },
      // dependencies: ["setup"],
    },

    /* Firefox */
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    /* WebKit (Safari) */
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* API-only tests — no browser */
    {
      name: "api",
      use: {
        baseURL: process.env.API_URL || "https://jsonplaceholder.typicode.com",
        extraHTTPHeaders: {
          "Content-Type": "application/json",
        },
      },
      testMatch: "**/api/**/*.spec.ts",
    },
  ],

  outputDir: "./reports/test-results/",
});
