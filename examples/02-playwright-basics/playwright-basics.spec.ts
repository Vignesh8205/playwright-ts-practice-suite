/**
 * EXAMPLES: 02 – Playwright Basics
 *
 * Demonstrates: navigation, page object usage, title checks,
 * screenshots, and basic assertions against a live public site.
 *
 * Run: npx playwright test examples/02-playwright-basics/
 * Site used: https://playwright.dev (public, no login needed)
 */

import { test, expect, Page } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// 1. NAVIGATION & TITLE
// ════════════════════════════════════════════════════════════════

test("01 – Navigate and verify page title", async ({ page }) => {
  // goto() navigates to a URL (baseURL is set in playwright.config.ts)
  await page.goto("https://playwright.dev/");

  // Assert the page title contains 'Playwright'
  await expect(page).toHaveTitle(/Playwright/);

  const title = await page.title();
  console.log("✅ Page title:", title);
});

// ════════════════════════════════════════════════════════════════
// 2. VERIFY URL
// ════════════════════════════════════════════════════════════════

test("02 – Verify page URL", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // toHaveURL supports string, regex, and function
  await expect(page).toHaveURL("https://playwright.dev/");
  await expect(page).toHaveURL(/playwright\.dev/);

  const url = page.url();
  expect(url).toContain("playwright.dev");
  console.log("✅ Current URL:", url);
});

// ════════════════════════════════════════════════════════════════
// 3. CLICK A LINK & NAVIGATE
// ════════════════════════════════════════════════════════════════

test("03 – Click link and navigate to Docs", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the 'Docs' navigation link
  await page.getByRole("link", { name: "Docs" }).first().click();

  // Wait for navigation
  await page.waitForLoadState("networkidle");

  // Verify we're on the docs page
  await expect(page).toHaveURL(/docs/);
  console.log("✅ Navigated to:", page.url());
});

// ════════════════════════════════════════════════════════════════
// 4. HEADING ASSERTION
// ════════════════════════════════════════════════════════════════

test("04 – Verify heading is visible", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Find h1 heading and check its text
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();

  const headingText = await heading.textContent();
  console.log("✅ H1 Heading:", headingText);
});

// ════════════════════════════════════════════════════════════════
// 5. FIND ELEMENT BY TEXT
// ════════════════════════════════════════════════════════════════

test("05 – Find elements by text", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // getByText finds elements containing the specified text
  const gettingStartedLink = page.getByRole("link", { name: "Get started" });
  await expect(gettingStartedLink).toBeVisible();

  console.log("✅ 'Get started' link is visible");
});

// ════════════════════════════════════════════════════════════════
// 6. MULTIPLE ASSERTIONS ON ONE PAGE
// ════════════════════════════════════════════════════════════════

test("06 – Multiple assertions on Playwright homepage", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Title
  await expect(page).toHaveTitle(/Playwright/);

  // URL
  await expect(page).toHaveURL(/playwright\.dev/);

  // Heading visible
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();

  // Navigation links
  const nav = page.locator("nav");
  await expect(nav).toBeVisible();

  console.log("✅ All homepage assertions passed");
});

// ════════════════════════════════════════════════════════════════
// 7. KEYBOARD NAVIGATION
// ════════════════════════════════════════════════════════════════

test("07 – Keyboard navigation", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Press Tab to navigate through interactive elements
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  // Get the focused element
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  console.log("✅ Focused element tag:", focused);

  expect(focused).toBeTruthy();
});

// ════════════════════════════════════════════════════════════════
// 8. PAGE INFO — TITLE, URL, CONTENT
// ════════════════════════════════════════════════════════════════

test("08 – Get page metadata", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  const title = await page.title();
  const url = page.url();

  // HTML content inspection
  const bodyText = await page.locator("body").innerText();

  expect(title).toBeTruthy();
  expect(url).toBeTruthy();
  expect(bodyText.length).toBeGreaterThan(100);

  console.log("✅ Page metadata:", { title, url, bodyLength: bodyText.length });
});

// ════════════════════════════════════════════════════════════════
// 9. BACK / FORWARD NAVIGATION
// ════════════════════════════════════════════════════════════════

test("09 – Browser back and forward navigation", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  const homeUrl = page.url();

  // Navigate to docs
  await page.getByRole("link", { name: "Docs" }).first().click();
  await page.waitForLoadState("networkidle");
  const docsUrl = page.url();

  // Go back
  await page.goBack();
  await page.waitForLoadState("networkidle");
  expect(page.url()).toBe(homeUrl);

  // Go forward
  await page.goForward();
  await page.waitForLoadState("networkidle");
  expect(page.url()).toBe(docsUrl);

  console.log("✅ Back/Forward navigation works:", { homeUrl, docsUrl });
});

// ════════════════════════════════════════════════════════════════
// 10. SCREENSHOT CAPTURE
// ════════════════════════════════════════════════════════════════

test("10 – Take a screenshot", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Full-page screenshot
  await page.screenshot({
    path: "test-results/examples/screenshot-playwright-dev.png",
    fullPage: false,
  });

  console.log("✅ Screenshot saved to test-results/examples/");
});
