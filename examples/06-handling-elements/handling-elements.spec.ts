/**
 * EXAMPLES: 06 – Handling Special Elements
 *
 * Demonstrates: alerts, iFrames, new tabs/popups, file upload,
 *               drag-drop, network mocking, waits.
 *
 * Run: npx playwright test examples/06-handling-elements/
 */

import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// 1. HANDLING BROWSER DIALOGS (Alert / Confirm / Prompt)
// ════════════════════════════════════════════════════════════════

test("01 – Handle Alert dialog (accept)", async ({ page }) => {
  await page.goto("https://demoqa.com/alerts");

  // Register dialog handler BEFORE triggering it
  page.once("dialog", async (dialog) => {
    console.log("  Dialog type:", dialog.type());
    console.log("  Dialog message:", dialog.message());
    expect(dialog.type()).toBe("alert");
    expect(dialog.message()).toContain("alert box");
    await dialog.accept();
  });

  // Trigger the alert
  await page.locator("#alertButton").click();
  console.log("✅ Alert dialog handled (accepted)");
});

test("02 – Handle Confirm dialog (dismiss)", async ({ page }) => {
  await page.goto("https://demoqa.com/alerts");

  // Dismiss (Cancel) the confirm dialog
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.dismiss(); // Click Cancel
  });

  await page.locator("#confirmButton").click();

  // Check result message
  const result = page.locator("#confirmResult");
  await expect(result).toContainText("Do You Confirm?");
  console.log("✅ Confirm dialog dismissed");
});

test("03 – Handle Prompt dialog (type text)", async ({ page }) => {
  await page.goto("https://demoqa.com/alerts");

  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("prompt");
    await dialog.accept("Playwright Automation"); // Type and click OK
  });

  await page.locator("#promtButton").click();

  const result = page.locator("#promptResult");
  await expect(result).toContainText("Playwright Automation");
  console.log("✅ Prompt dialog handled with typed text");
});

// ════════════════════════════════════════════════════════════════
// 2. HANDLING iFRAMES
// ════════════════════════════════════════════════════════════════

test("04 – Interact inside an iFrame", async ({ page }) => {
  // Using a site known to have an iframe for demonstration
  await page.goto("https://demoqa.com/frames");

  // frameLocator() is the modern Playwright way to work with iframes
  const frame1 = page.frameLocator("#frame1");

  // Find element inside iframe
  const heading = frame1.locator("#sampleHeading");
  await expect(heading).toBeVisible();
  await expect(heading).toContainText("This is a sample page");

  const text = await heading.textContent();
  console.log("✅ iFrame content found:", text);
});

test("05 – Nested iFrames", async ({ page }) => {
  await page.goto("https://demoqa.com/nestedframes");

  // Outer frame
  const outerFrame = page.frameLocator("#frame1");
  const outerBody = outerFrame.locator("body");
  await expect(outerBody).toContainText("Parent frame");

  // Inner frame nested inside outer frame
  const innerFrame = outerFrame.frameLocator("iframe");
  const innerBody = innerFrame.locator("body");
  await expect(innerBody).toContainText("Child Iframe");

  console.log("✅ Nested iFrames accessed successfully");
});

// ════════════════════════════════════════════════════════════════
// 3. HANDLING NEW TABS / POPUPS
// ════════════════════════════════════════════════════════════════

test("06 – Handle new tab / popup", async ({ page }) => {
  await page.goto("https://demoqa.com/browser-windows");

  // Wait for popup BEFORE clicking
  const popupPromise = page.waitForEvent("popup");
  await page.locator("#tabButton").click();
  const popup = await popupPromise;

  // Wait for popup to load
  await popup.waitForLoadState();

  // Assert popup URL and content
  expect(popup.url()).toContain("sample");
  const heading = popup.locator("h1");
  await expect(heading).toBeVisible();

  const text = await heading.textContent();
  console.log("✅ New tab opened. Heading:", text);

  await popup.close();
});

test("07 – Handle new window", async ({ page }) => {
  await page.goto("https://demoqa.com/browser-windows");

  const windowPromise = page.waitForEvent("popup");
  await page.locator("#windowButton").click();
  const newWindow = await windowPromise;

  await newWindow.waitForLoadState();
  const url = newWindow.url();
  console.log("✅ New window URL:", url);
  expect(url).toBeTruthy();

  await newWindow.close();
});

// ════════════════════════════════════════════════════════════════
// 4. DYNAMIC WAITS
// ════════════════════════════════════════════════════════════════

test("08 – Wait for element to appear", async ({ page }) => {
  await page.goto("https://demoqa.com/dynamic-properties");

  /**
   * waitForSelector is useful for elements that appear after a delay.
   * Playwright auto-waits for most actions, but explicit waits help
   * when you need to synchronize with dynamic content.
   */

  // Wait for button that appears after 5 seconds
  const enableAfterBtn = page.locator("#enableAfter");

  // Initially disabled
  await expect(enableAfterBtn).toBeDisabled();

  // Wait until enabled (uses polling internally)
  await expect(enableAfterBtn).toBeEnabled({ timeout: 10_000 });
  console.log("✅ Button became enabled after waiting");
});

test("09 – Wait for element to appear (visible after delay)", async ({ page }) => {
  await page.goto("https://demoqa.com/dynamic-properties");

  // Element visible after delay
  const visibleAfterBtn = page.locator("#visibleAfter");

  // Wait until visible
  await expect(visibleAfterBtn).toBeVisible({ timeout: 10_000 });
  console.log("✅ Element became visible after delay");
});

test("10 – Wait for network response", async ({ page }) => {
  /**
   * waitForResponse() is useful for SPAs (Single Page Applications)
   * where content loads via XHR/fetch requests.
   */
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes("playwright.dev") && res.status() === 200
  );

  await page.goto("https://playwright.dev/");
  const response = await responsePromise;

  expect(response.status()).toBe(200);
  console.log("✅ Network response captured:", response.url());
});

// ════════════════════════════════════════════════════════════════
// 5. NETWORK INTERCEPTION (MOCKING)
// ════════════════════════════════════════════════════════════════

test("11 – Mock API response", async ({ page }) => {
  /**
   * Route interception lets you:
   *  - Mock API responses (great for isolated tests)
   *  - Block unwanted requests (ads, analytics)
   *  - Modify request/response
   */

  // Intercept all requests to a fake API endpoint
  await page.route("**/api/users", async (route) => {
    // Return mock data instead of real API call
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, name: "Alice", email: "alice@test.com" },
        { id: 2, name: "Bob", email: "bob@test.com" },
      ]),
    });
  });

  // Intercept all image requests (block them for speed)
  await page.route("**/*.{png,jpg,jpeg,gif,svg}", (route) => route.abort());

  await page.goto("https://playwright.dev/");
  console.log("✅ Network interception configured");
});

test("12 – Block ads and analytics", async ({ page }) => {
  // Block common tracking/analytics domains
  await page.route("**/{analytics,tracking,ads,gtm}**", (route) => {
    console.log("  Blocked:", route.request().url());
    route.abort();
  });

  await page.goto("https://playwright.dev/");
  await expect(page).toHaveTitle(/Playwright/);
  console.log("✅ Page loaded with ads/analytics blocked");
});

// ════════════════════════════════════════════════════════════════
// 6. CUSTOM SCROLL & VISIBILITY
// ════════════════════════════════════════════════════════════════

test("13 – ScrollIntoView for off-screen elements", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Scroll footer into view
  const footer = page.locator("footer");
  if (await footer.count() > 0) {
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    console.log("✅ Footer scrolled into view");
  }
});

// ════════════════════════════════════════════════════════════════
// 7. EVALUATE JavaScript IN PAGE CONTEXT
// ════════════════════════════════════════════════════════════════

test("14 – Execute JavaScript in browser", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Run JavaScript in page context and return value
  const pageTitle = await page.evaluate(() => document.title);
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const linksCount = await page.evaluate(() => document.querySelectorAll("a").length);
  const cookies = await page.evaluate(() => document.cookie);

  console.log("✅ page.evaluate results:", {
    pageTitle,
    scrollHeight,
    linksCount,
    hasCookies: !!cookies,
  });

  expect(pageTitle).toContain("Playwright");
  expect(scrollHeight).toBeGreaterThan(100);
  expect(linksCount).toBeGreaterThan(0);

  // Inject values into the page
  await page.evaluate(() => {
    window.localStorage.setItem("test_key", "test_value");
  });

  const storedValue = await page.evaluate(() =>
    window.localStorage.getItem("test_key")
  );
  expect(storedValue).toBe("test_value");

  console.log("✅ localStorage set/get via evaluate works");
});
