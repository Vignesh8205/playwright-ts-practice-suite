/**
 * EXAMPLES: 04 – Actions
 *
 * Demonstrates: click, fill, type, keyboard, hover, select,
 *               checkboxes, drag-drop, scroll, file upload.
 *
 * Run: npx playwright test examples/04-actions/
 * Site: https://demoqa.com — public demo forms site.
 */

import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// 1. CLICK ACTIONS
// ════════════════════════════════════════════════════════════════

test("01 – Click actions", async ({ page }) => {
  await page.goto("https://demoqa.com/buttons");

  // Scroll to buttons section (demoqa has ads at top)
  await page.evaluate(() => window.scrollTo(0, 300));

  // Standard click — find 'Click Me' button (exact match)
  const clickMeButtons = page.getByRole("button", { name: "Click Me" });
  await clickMeButtons.last().click();

  // Verify click message
  const clickMsg = page.locator("#dynamicClickMessage");
  await expect(clickMsg).toBeVisible({ timeout: 10_000 });
  await expect(clickMsg).toContainText("You have done a dynamic click");
  console.log("✅ Single click action verified");
});

test("02 – Double click action", async ({ page }) => {
  await page.goto("https://demoqa.com/buttons");
  await page.evaluate(() => window.scrollTo(0, 300));

  const doubleClickBtn = page.locator("#doubleClickBtn");
  await doubleClickBtn.dblclick();

  const doubleClickMsg = page.locator("#doubleClickMessage");
  await expect(doubleClickMsg).toBeVisible({ timeout: 10_000 });
  await expect(doubleClickMsg).toContainText("double click");
  console.log("✅ Double click action verified");
});

test("03 – Right click action", async ({ page }) => {
  await page.goto("https://demoqa.com/buttons");
  await page.evaluate(() => window.scrollTo(0, 300));

  const rightClickBtn = page.locator("#rightClickBtn");
  await rightClickBtn.click({ button: "right" });

  const rightClickMsg = page.locator("#rightClickMessage");
  await expect(rightClickMsg).toBeVisible({ timeout: 10_000 });
  await expect(rightClickMsg).toContainText("right click");
  console.log("✅ Right click action verified");
});

// ════════════════════════════════════════════════════════════════
// 2. TEXT INPUT ACTIONS
// ════════════════════════════════════════════════════════════════

test("04 – Fill and clear input fields", async ({ page }) => {
  await page.goto("https://demoqa.com/text-box");

  // fill() clears the field first then types
  await page.getByPlaceholder("Full Name").fill("John Doe");
  await page.locator("#userEmail").fill("john.doe@example.com");
  await page.locator("#currentAddress").fill("123 Test Street, QA City");
  await page.locator("#permanentAddress").fill("456 Automation Ave");

  // Verify values
  await expect(page.getByPlaceholder("Full Name")).toHaveValue("John Doe");
  await expect(page.locator("#userEmail")).toHaveValue("john.doe@example.com");

  // Clear a field
  await page.getByPlaceholder("Full Name").clear();
  await expect(page.getByPlaceholder("Full Name")).toHaveValue("");

  // Type new value
  await page.getByPlaceholder("Full Name").fill("Jane Smith");
  await expect(page.getByPlaceholder("Full Name")).toHaveValue("Jane Smith");

  // Submit form
  await page.locator("#submit").click();

  // Verify output
  const output = page.locator("#output");
  await expect(output).toBeVisible({ timeout: 10_000 });
  await expect(output).toContainText("Jane Smith");
  console.log("✅ Fill and form submission verified");
});

// ════════════════════════════════════════════════════════════════
// 3. KEYBOARD ACTIONS
// ════════════════════════════════════════════════════════════════

test("05 – Keyboard actions", async ({ page }) => {
  await page.goto("https://demoqa.com/text-box");

  const nameInput = page.getByPlaceholder("Full Name");

  // Type character by character (slower, more realistic)
  await nameInput.fill(""); // clear first
  await nameInput.click();
  await page.keyboard.type("Hello World", { delay: 50 });
  await expect(nameInput).toHaveValue("Hello World");

  // Select all and delete
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await expect(nameInput).toHaveValue("");

  // Type and press Enter (submitting a search form usually)
  await nameInput.fill("Keyboard Test");
  await page.keyboard.press("Tab"); // Move to next field

  console.log("✅ Keyboard actions verified");
});

// ════════════════════════════════════════════════════════════════
// 4. CHECKBOX ACTIONS
// ════════════════════════════════════════════════════════════════

test("06 – Checkbox actions", async ({ page }) => {
  await page.goto("https://demoqa.com/checkbox");

  // Expand the Home node
  const expandBtn = page.locator(".rct-collapse").first();
  await expandBtn.click();

  // Check the 'Home' checkbox
  const homeCheckbox = page.locator("input[type='checkbox']").first();
  await homeCheckbox.check();
  await expect(homeCheckbox).toBeChecked();
  console.log("✅ Checkbox checked");

  // Uncheck
  await homeCheckbox.uncheck();
  await expect(homeCheckbox).not.toBeChecked();
  console.log("✅ Checkbox unchecked");
});

// ════════════════════════════════════════════════════════════════
// 5. RADIO BUTTON ACTIONS
// ════════════════════════════════════════════════════════════════

test("07 – Radio button actions", async ({ page }) => {
  await page.goto("https://demoqa.com/radio-button");

  // Click 'Yes' radio button
  await page.getByText("Yes").click();
  const yesRadio = page.locator("#yesRadio");
  await expect(yesRadio).toBeChecked();

  // Verify success message
  const msg = page.locator(".mt-3");
  await expect(msg).toContainText("Yes");
  console.log("✅ Radio button selection verified");

  // Click 'Impressive'
  await page.getByText("Impressive").click();
  const impressiveRadio = page.locator("#impressiveRadio");
  await expect(impressiveRadio).toBeChecked();
  await expect(yesRadio).not.toBeChecked(); // Previous deselected

  console.log("✅ Radio buttons work correctly (mutually exclusive)");
});

// ════════════════════════════════════════════════════════════════
// 6. SELECT DROPDOWN ACTIONS
// ════════════════════════════════════════════════════════════════

test("08 – Select dropdown actions", async ({ page }) => {
  await page.goto("https://demoqa.com/select-menu");

  // Standard HTML <select> element
  const colorSelect = page.locator("#oldSelectMenu");

  // Select by value
  await colorSelect.selectOption("1");
  await expect(colorSelect).toHaveValue("1");

  // Select by label text
  await colorSelect.selectOption({ label: "Blue" });

  // Select by index
  await colorSelect.selectOption({ index: 0 });

  console.log("✅ Select dropdown actions verified");
});

// ════════════════════════════════════════════════════════════════
// 7. HOVER ACTION
// ════════════════════════════════════════════════════════════════

test("09 – Hover action", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Hover over a navigation item to reveal submenu
  const navLink = page.getByRole("link", { name: "Docs" }).first();
  await navLink.hover();

  console.log("✅ Hover action performed");
});

// ════════════════════════════════════════════════════════════════
// 8. SCROLL ACTIONS
// ════════════════════════════════════════════════════════════════

test("10 – Scroll actions", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Scroll to bottom of page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));

  // Scroll element into view
  const footer = page.locator("footer").last();
  if (await footer.count() > 0) {
    await footer.scrollIntoViewIfNeeded();
    console.log("✅ Scrolled footer into view");
  }

  // Scroll by specific amount
  await page.mouse.wheel(0, 500); // Scroll down 500px
  console.log("✅ Scroll actions completed");
});
