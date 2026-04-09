/**
 * EXAMPLES: 05 – Assertions
 *
 * Demonstrates all major Playwright assertion types:
 *  - Page assertions (URL, title)
 *  - Element assertions (visible, text, value, count)
 *  - Soft assertions
 *  - Custom error messages
 *  - Negation
 *
 * Run: npx playwright test examples/05-assertions/
 */

import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// 1. PAGE ASSERTIONS
// ════════════════════════════════════════════════════════════════

test("01 – Page URL assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Exact URL
  await expect(page).toHaveURL("https://playwright.dev/");

  // URL contains substring (regex)
  await expect(page).toHaveURL(/playwright\.dev/);

  // Negation — URL does NOT contain
  await expect(page).not.toHaveURL(/login/);
  await expect(page).not.toHaveURL(/dashboard/);

  console.log("✅ URL assertions passed:", page.url());
});

test("02 – Page title assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Exact title
  await expect(page).toHaveTitle(/Playwright/);

  // Partial match with regex
  await expect(page).toHaveTitle(/playwright/i); // case-insensitive

  // Negation
  await expect(page).not.toHaveTitle("Google");
  await expect(page).not.toHaveTitle(/selenium/i);

  const title = await page.title();
  console.log("✅ Title assertions passed. Title:", title);
});

// ════════════════════════════════════════════════════════════════
// 2. VISIBILITY ASSERTIONS
// ════════════════════════════════════════════════════════════════

test("03 – Element visibility assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // toBeVisible — element exists in DOM and is visible
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();

  const nav = page.locator("nav").first();
  await expect(nav).toBeVisible();

  // toBeHidden — element not visible (display:none, visibility:hidden, etc.)
  const hiddenInput = page.locator("input[type='hidden']").first();
  if (await hiddenInput.count() > 0) {
    await expect(hiddenInput).toBeHidden();
  }

  // toBeAttached — element exists in DOM (even if hidden)
  await expect(heading).toBeAttached();

  console.log("✅ Visibility assertions passed");
});

// ════════════════════════════════════════════════════════════════
// 3. TEXT CONTENT ASSERTIONS
// ════════════════════════════════════════════════════════════════

test("04 – Text content assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  const heading = page.getByRole("heading", { level: 1 });

  // toHaveText — complete/exact text match
  const h1Text = await heading.textContent();
  if (h1Text) {
    await expect(heading).toHaveText(h1Text.trim());
  }

  // toContainText — partial text match (most common)
  await expect(heading).toContainText("Playwright");

  // Regex match
  await expect(heading).toContainText(/playwright/i);

  // Multiple text checks on body
  const body = page.locator("body");
  await expect(body).toContainText("Playwright");

  // Negation
  await expect(heading).not.toContainText("Selenium");

  console.log("✅ Text assertions passed. H1 text:", h1Text?.trim());
});

// ════════════════════════════════════════════════════════════════
// 4. ATTRIBUTE ASSERTIONS
// ════════════════════════════════════════════════════════════════

test("05 – Attribute assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Links have href
  const docsLink = page.getByRole("link", { name: "Docs" }).first();
  await expect(docsLink).toHaveAttribute("href", /docs/);

  // Image has src
  const images = page.locator("img");
  if (await images.count() > 0) {
    const firstImg = images.first();
    const src = await firstImg.getAttribute("src");
    console.log("First image src:", src);
    await expect(firstImg).toHaveAttribute("src", /.+/); // has any value
  }

  // Negation — element does NOT have attribute
  await expect(docsLink).not.toHaveAttribute("disabled");

  console.log("✅ Attribute assertions passed");
});

// ════════════════════════════════════════════════════════════════
// 5. INPUT VALUE ASSERTIONS
// ════════════════════════════════════════════════════════════════

test("06 – Input value assertions", async ({ page }) => {
  await page.goto("https://demoqa.com/text-box");

  const nameInput = page.getByPlaceholder("Full Name");
  const emailInput = page.locator("#userEmail");

  // Fill and assert value
  await nameInput.fill("Test User");
  await expect(nameInput).toHaveValue("Test User");

  await emailInput.fill("test@example.com");
  await expect(emailInput).toHaveValue("test@example.com");

  // Regex match on value
  await expect(emailInput).toHaveValue(/@example\.com/);

  // Empty value
  await nameInput.clear();
  await expect(nameInput).toHaveValue("");
  await expect(nameInput).toBeEmpty(); // Same as toHaveValue("")

  console.log("✅ Input value assertions passed");
});

// ════════════════════════════════════════════════════════════════
// 6. COUNT ASSERTION
// ════════════════════════════════════════════════════════════════

test("07 – Count assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // toHaveCount — exact number of elements
  const navLinks = page.locator("nav a");
  const count = await navLinks.count();
  await expect(navLinks).toHaveCount(count); // Assert exact count

  // Expect more than 0 links (use with count())
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(100);

  console.log(`✅ Count assertions passed. Nav links: ${count}`);
});

// ════════════════════════════════════════════════════════════════
// 7. ENABLED / DISABLED ASSERTIONS
// ════════════════════════════════════════════════════════════════

test("08 – Enabled and disabled assertions", async ({ page }) => {
  await page.goto("https://demoqa.com/text-box");

  const nameInput = page.getByPlaceholder("Full Name");
  const submitBtn = page.locator("#submit");

  // Enabled elements
  await expect(nameInput).toBeEnabled();
  await expect(submitBtn).toBeEnabled();

  // Negation
  await expect(nameInput).not.toBeDisabled();

  console.log("✅ Enabled/disabled assertions passed");
});

// ════════════════════════════════════════════════════════════════
// 8. CHECKBOX CHECKED ASSERTION
// ════════════════════════════════════════════════════════════════

test("09 – Checkbox checked assertions", async ({ page }) => {
  await page.goto("https://demoqa.com/checkbox");

  const checkboxes = page.locator("input[type='checkbox']");
  if (await checkboxes.count() > 0) {
    const first = checkboxes.first();
    await expect(first).not.toBeChecked(); // Initially unchecked

    await first.check();
    await expect(first).toBeChecked();

    await first.uncheck();
    await expect(first).not.toBeChecked();

    console.log("✅ Checkbox checked assertions passed");
  }
});

// ════════════════════════════════════════════════════════════════
// 9. SOFT ASSERTIONS (Don't stop test on failure)
// ════════════════════════════════════════════════════════════════

test("10 – Soft assertions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  /**
   * Soft assertions: unlike regular expect(), these do NOT stop
   * the test on failure. Instead they collect all failures and
   * report them together at the end.
   *
   * Use case: Validating multiple independent elements on one page
   *           where you want to see ALL failures, not just the first.
   */
  await expect.soft(page).toHaveTitle(/Playwright/);

  const heading = page.getByRole("heading", { level: 1 });
  await expect.soft(heading).toBeVisible();
  await expect.soft(heading).toContainText("Playwright");

  const nav = page.locator("nav").first();
  await expect.soft(nav).toBeVisible();

  // This would fail softly without stopping the test:
  // await expect.soft(page).toHaveTitle("Wrong Title");

  console.log("✅ Soft assertions all collected and passed");
});

// ════════════════════════════════════════════════════════════════
// 10. CUSTOM ERROR MESSAGES
// ════════════════════════════════════════════════════════════════

test("11 – Custom assertion error messages", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Add custom message for better error reports
  await expect(page, "Home page should have correct title")
    .toHaveTitle(/Playwright/);

  await expect(
    page.getByRole("heading", { level: 1 }),
    "Main heading must be visible on load"
  ).toBeVisible();

  await expect(
    page.locator("nav").first(),
    "Navigation bar must exist on every page"
  ).toBeVisible();

  console.log("✅ Custom assertion messages configured");
});

// ════════════════════════════════════════════════════════════════
// 11. JEST-STYLE VALUE ASSERTIONS (for non-element values)
// ════════════════════════════════════════════════════════════════

test("12 – Value assertions (non-element)", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  const title = await page.title();
  const url = page.url();

  // String assertions
  expect(title).toBeTruthy();
  expect(title).toContain("Playwright");
  expect(title).toMatch(/playwright/i);

  // URL assertions
  expect(url).toContain("playwright.dev");
  expect(url).not.toContain("localhost");

  // Number assertions
  const linkCount = await page.locator("a").count();
  expect(linkCount).toBeGreaterThan(5);
  expect(linkCount).toBeLessThan(1000);
  expect(linkCount).not.toBe(0);

  // Boolean assertions
  expect(true).toBeTruthy();
  expect(false).toBeFalsy();
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();

  // Array assertions
  const browsers = ["chromium", "firefox", "webkit"];
  expect(browsers).toContain("chromium");
  expect(browsers).toHaveLength(3);
  expect(browsers).not.toContain("IE");

  console.log("✅ Value assertions passed:", { title, url, linkCount });
});
