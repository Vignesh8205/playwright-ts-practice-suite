/**
 * EXAMPLES: 03 – Locators
 *
 * Demonstrates all major Playwright locator strategies:
 *  - Role-based (recommended)
 *  - Label-based
 *  - Placeholder
 *  - Text
 *  - TestId (data-testid)
 *  - CSS selectors
 *  - XPath
 *  - Chaining & filtering
 *
 * Run: npx playwright test examples/03-locators/
 * Site: https://demoqa.com (public demo site with form elements)
 */

import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// 1. ROLE-BASED LOCATORS (Recommended)
// ════════════════════════════════════════════════════════════════

test("01 – Role-based locators", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Links by role
  const docsLink = page.getByRole("link", { name: "Docs" }).first();
  await expect(docsLink).toBeVisible();

  // Heading by role
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toBeVisible();

  // Navigation by role
  const nav = page.getByRole("navigation").first();
  await expect(nav).toBeVisible();

  // Banner (header region)
  const banner = page.getByRole("banner");
  await expect(banner).toBeVisible();

  console.log("✅ Role-based locators found all elements");
});

// ════════════════════════════════════════════════════════════════
// 2. TEXT-BASED LOCATORS
// ════════════════════════════════════════════════════════════════

test("02 – Text-based locators", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Exact text match
  const apiLink = page.getByText("API");
  console.log("API link count:", await apiLink.count());

  // Partial text with regex (case-insensitive)
  const anyLink = page.getByText(/playwright/i).first();
  await expect(anyLink).toBeVisible();

  // getByText vs innerText
  const footerLinks = page.locator("footer a");
  const count = await footerLinks.count();
  console.log(`✅ Found ${count} footer links`);
});

// ════════════════════════════════════════════════════════════════
// 3. CSS SELECTORS
// ════════════════════════════════════════════════════════════════

test("03 – CSS selectors", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Tag selector
  const body = page.locator("body");
  await expect(body).toBeVisible();

  // Class selector
  const links = page.locator("a[href]");
  const linkCount = await links.count();
  expect(linkCount).toBeGreaterThan(5);

  // Attribute selector
  const externalLinks = page.locator("a[target='_blank']");
  const externalCount = await externalLinks.count();
  console.log(`✅ External links: ${externalCount}, Total links: ${linkCount}`);

  // nth child
  const firstLink = page.locator("nav a").first();
  await expect(firstLink).toBeVisible();
});

// ════════════════════════════════════════════════════════════════
// 4. XPATH LOCATORS
// ════════════════════════════════════════════════════════════════

test("04 – XPath locators", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Basic XPath
  const heading = page.locator("//h1");
  await expect(heading).toBeVisible();

  // XPath with contains()
  const playwrightLinks = page.locator("//a[contains(@href, 'playwright')]");
  const count = await playwrightLinks.count();
  console.log(`✅ Links with 'playwright' in href: ${count}`);

  // XPath axis — get parent of an anchor
  const anyAnchor = page.locator("//nav//a").first();
  await expect(anyAnchor).toBeVisible();
});

// ════════════════════════════════════════════════════════════════
// 5. CHAINING LOCATORS
// ════════════════════════════════════════════════════════════════

test("05 – Chaining locators (scoped search)", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Find links inside the nav element only
  const nav = page.locator("nav").first();
  const navLinks = nav.locator("a");
  const navLinkCount = await navLinks.count();
  console.log(`✅ Nav links: ${navLinkCount}`);
  expect(navLinkCount).toBeGreaterThan(0);

  // Find heading inside main content
  const main = page.locator("main, [role='main'], article").first();
  if (await main.count() > 0) {
    const headings = main.locator("h1, h2, h3");
    const headingCount = await headings.count();
    console.log(`✅ Headings in main: ${headingCount}`);
  }
});

// ════════════════════════════════════════════════════════════════
// 6. FILTER LOCATORS
// ════════════════════════════════════════════════════════════════

test("06 – Filtering locators", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Filter links by text content
  const links = page.locator("a");
  const docsLinks = links.filter({ hasText: /docs/i });
  const docsCount = await docsLinks.count();
  console.log(`✅ Links containing 'docs': ${docsCount}`);

  // Filter using regex
  const apiLinks = links.filter({ hasText: /api/i });
  const apiCount = await apiLinks.count();
  console.log(`✅ Links containing 'api': ${apiCount}`);
});

// ════════════════════════════════════════════════════════════════
// 7. NTH ELEMENT SELECTION
// ════════════════════════════════════════════════════════════════

test("07 – Selecting nth elements", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  const allLinks = page.locator("nav a");
  const count = await allLinks.count();

  if (count >= 2) {
    // first(), last(), nth()
    const first = allLinks.first();
    const last = allLinks.last();
    const second = allLinks.nth(1);

    await expect(first).toBeVisible();
    await expect(last).toBeVisible();
    await expect(second).toBeVisible();

    console.log("✅ nth selectors work. Total nav links:", count);
  }
});

// ════════════════════════════════════════════════════════════════
// 8. LOCATOR COUNT & ITERATION
// ════════════════════════════════════════════════════════════════

test("08 – Count and iterate locators", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  const links = page.locator("nav a");
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  // Collect all link texts
  const linkTexts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await links.nth(i).textContent();
    if (text?.trim()) linkTexts.push(text.trim());
  }

  console.log(`✅ Nav link texts (${count}):`, linkTexts);
});

// ════════════════════════════════════════════════════════════════
// 9. ALL LOCATOR METHODS COMPARISON
// ════════════════════════════════════════════════════════════════

test("09 – Locator strategy comparison", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  /**
   * LOCATOR PRIORITY (Most Resilient → Least Resilient)
   *
   * 1. getByRole()        — accessibility-based, survives UI redesign
   * 2. getByLabel()       — for labeled form inputs
   * 3. getByPlaceholder() — for inputs with placeholder text
   * 4. getByText()        — for buttons, links, labels
   * 5. getByTestId()      — data-testid attribute (team-controlled)
   * 6. locator("css")     — CSS selector (implementation-aware)
   * 7. locator("xpath")   — XPath (last resort, very fragile)
   */

  // Role (best)
  const roleLink = page.getByRole("link", { name: "Docs" }).first();
  const isVisible = await roleLink.isVisible();
  console.log("getByRole visible:", isVisible);

  // CSS (acceptable for stable DOM)
  const cssLink = page.locator("nav a").first();
  const cssVisible = await cssLink.isVisible();
  console.log("CSS locator visible:", cssVisible);

  // XPath (last resort)
  const xpathLink = page.locator("//nav//a").first();
  const xpathVisible = await xpathLink.isVisible();
  console.log("XPath locator visible:", xpathVisible);

  expect(isVisible).toBeTruthy();
  expect(cssVisible).toBeTruthy();
  expect(xpathVisible).toBeTruthy();

  console.log("✅ All locator strategies work correctly");
});
