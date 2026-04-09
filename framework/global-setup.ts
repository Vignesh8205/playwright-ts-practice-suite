/**
 * FRAMEWORK: global-setup.ts
 * Runs once before all tests.
 * Performs login and saves auth state to avoid re-login on every test.
 */
import { chromium, FullConfig } from "@playwright/test";
import { logger } from "./utils/logger";
import * as fs from "fs";
import * as path from "path";

async function globalSetup(_config: FullConfig): Promise<void> {
  logger.step("Global Setup — Starting");

  // Ensure auth folder exists
  const authDir = path.join(__dirname, "reports", ".auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const baseURL = process.env.BASE_URL || "https://demoqa.com";
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // Skip auth setup if credentials not configured
  if (!username || !password) {
    logger.warn("No credentials configured in .env — skipping auth setup", "GlobalSetup");
    logger.info("Tests will run without pre-authenticated state", "GlobalSetup");
    return;
  }

  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== "false",
  });
  const context = await browser.newContext({ baseURL, ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    await page.goto("/login");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard", { timeout: 30_000 });

    // Save auth state
    const authPath = path.join(authDir, "user.json");
    await context.storageState({ path: authPath });
    logger.pass(`Auth state saved to: ${authPath}`, "GlobalSetup");
  } catch (error) {
    logger.warn(`Login skipped (app may not have auth): ${error}`, "GlobalSetup");
  } finally {
    await context.close();
    await browser.close();
  }

  logger.pass("Global Setup — Complete");
}

export default globalSetup;
