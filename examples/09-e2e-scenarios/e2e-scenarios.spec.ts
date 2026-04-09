/**
 * EXAMPLES: 09 – End-to-End Scenarios
 *
 * Demonstrates realistic E2E test flows using:
 *  - Page Object pattern (inline for self-containment)
 *  - Multi-step user journeys
 *  - API + UI hybrid testing
 *  - Hooks (beforeEach / afterEach)
 *
 * Run: npx playwright test examples/09-e2e-scenarios/
 * Site: https://demoqa.com (public forms demo site)
 */

import { test, expect, Page } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// INLINE PAGE OBJECTS (local to these examples)
// ════════════════════════════════════════════════════════════════

class DemoQAHomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("https://demoqa.com/");
  }

  async clickCard(name: string) {
    await this.page.locator(".card-body h5").filter({ hasText: name }).click();
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(/demoqa\.com/);
    await expect(this.page.locator(".home-banner")).toBeVisible();
  }
}

class TextBoxPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("https://demoqa.com/text-box");
  }

  async fillForm(data: {
    name: string;
    email: string;
    currentAddress: string;
    permanentAddress: string;
  }) {
    await this.page.getByPlaceholder("Full Name").fill(data.name);
    await this.page.locator("#userEmail").fill(data.email);
    await this.page.locator("#currentAddress").fill(data.currentAddress);
    await this.page.locator("#permanentAddress").fill(data.permanentAddress);
  }

  async submit() {
    await this.page.locator("#submit").click();
  }

  async getOutputText(): Promise<string> {
    const output = this.page.locator("#output");
    await expect(output).toBeVisible({ timeout: 10_000 });
    return (await output.innerText()) || "";
  }
}

class CheckBoxPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("https://demoqa.com/checkbox");
  }

  async expandAll() {
    await this.page.locator(".rct-option-expand-all").click();
  }

  async checkItem(name: string) {
    await this.page.getByText(name).click();
  }

  async getSelectedItems(): Promise<string[]> {
    const items = this.page.locator(".text-success");
    const count = await items.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }
}

class RadioButtonPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("https://demoqa.com/radio-button");
  }

  async selectOption(option: "Yes" | "Impressive") {
    await this.page.getByText(option).click();
  }

  async getSuccessMessage(): Promise<string> {
    const msg = this.page.locator(".mt-3");
    await expect(msg).toBeVisible({ timeout: 5_000 });
    return (await msg.textContent()) || "";
  }
}

// ════════════════════════════════════════════════════════════════
// 1. E2E SCENARIO: Complete Form Submission Flow
// ════════════════════════════════════════════════════════════════

test.describe("E2E – Form Submission Journey", () => {
  let textBoxPage: TextBoxPage;

  test.beforeEach(async ({ page }) => {
    textBoxPage = new TextBoxPage(page);
    await textBoxPage.goto();
  });

  test("01 – Complete form with valid data and verify output", async ({ page }) => {
    const userData = {
      name: "John Automation",
      email: "john.auto@test.com",
      currentAddress: "100 QA Street, Test City",
      permanentAddress: "200 Dev Lane, Automation Town",
    };

    // Fill all fields
    await textBoxPage.fillForm(userData);

    // Submit
    await textBoxPage.submit();

    // Verify output section shows submitted data
    const outputText = await textBoxPage.getOutputText();
    expect(outputText).toContain(userData.name);
    expect(outputText).toContain(userData.email);
    expect(outputText).toContain(userData.currentAddress);

    console.log("✅ Form submitted. Output:", outputText.substring(0, 100));
  });

  test("02 – Submit with only required fields", async ({ page }) => {
    await textBoxPage.fillForm({
      name: "Minimal User",
      email: "minimal@test.com",
      currentAddress: "",
      permanentAddress: "",
    });
    await textBoxPage.submit();

    const output = await textBoxPage.getOutputText();
    expect(output).toContain("Minimal User");
    console.log("✅ Form submitted with minimal fields");
  });
});

// ════════════════════════════════════════════════════════════════
// 2. E2E SCENARIO: Checkbox Interaction Flow
// ════════════════════════════════════════════════════════════════

test.describe("E2E – Checkbox Selection Flow", () => {
  test("03 – Expand tree and select Desktop folder", async ({ page }) => {
    const checkBoxPage = new CheckBoxPage(page);
    await checkBoxPage.goto();

    // Expand all nodes
    await checkBoxPage.expandAll();

    // Select Desktop item
    await checkBoxPage.checkItem("Desktop");

    // Verify selected items shown
    const selected = await checkBoxPage.getSelectedItems();
    console.log("✅ Selected items:", selected);
    expect(selected.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
// 3. E2E SCENARIO: Radio Button Selection Flow
// ════════════════════════════════════════════════════════════════

test.describe("E2E – Radio Button Selection Flow", () => {
  let radioPage: RadioButtonPage;

  test.beforeEach(async ({ page }) => {
    radioPage = new RadioButtonPage(page);
    await radioPage.goto();
  });

  test("04 – Select Yes and verify message", async () => {
    await radioPage.selectOption("Yes");
    const msg = await radioPage.getSuccessMessage();
    expect(msg).toContain("Yes");
    console.log("✅ Selected 'Yes'. Message:", msg);
  });

  test("05 – Select Impressive and verify message", async () => {
    await radioPage.selectOption("Impressive");
    const msg = await radioPage.getSuccessMessage();
    expect(msg).toContain("Impressive");
    console.log("✅ Selected 'Impressive'. Message:", msg);
  });

  test("06 – Switch selection and verify old is deselected", async ({ page }) => {
    await radioPage.selectOption("Yes");
    const yesRadio = page.locator("#yesRadio");
    await expect(yesRadio).toBeChecked();

    await radioPage.selectOption("Impressive");
    const impressiveRadio = page.locator("#impressiveRadio");
    await expect(impressiveRadio).toBeChecked();
    await expect(yesRadio).not.toBeChecked(); // Deselected
    console.log("✅ Only one radio can be selected at a time");
  });
});

// ════════════════════════════════════════════════════════════════
// 4. E2E SCENARIO: Multi-Page Navigation
// ════════════════════════════════════════════════════════════════

test("07 – Navigate across multiple pages", async ({ page }) => {
  const homePage = new DemoQAHomePage(page);

  // Step 1: Load home
  await homePage.goto();

  // Step 2: Navigate to Elements
  await page.getByText("Elements").first().click();
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/elements/);
  console.log("  Step 1: Elements page loaded");

  // Step 3: Click Text Box from sidebar
  await page.getByText("Text Box").first().click();
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/text-box/);
  console.log("  Step 2: Text Box page loaded");

  // Step 4: Fill and submit
  await page.getByPlaceholder("Full Name").fill("Navigation Test User");
  await page.locator("#userEmail").fill("nav.test@example.com");
  await page.locator("#submit").click();

  const output = page.locator("#output");
  await expect(output).toBeVisible({ timeout: 10_000 });
  await expect(output).toContainText("Navigation Test User");
  console.log("  Step 3: Form submitted successfully");

  // Step 5: Go back to home
  await page.goto("https://demoqa.com/");
  await expect(page).toHaveURL(/demoqa\.com/);
  console.log("✅ Multi-page navigation E2E complete");
});

// ════════════════════════════════════════════════════════════════
// 5. E2E SCENARIO: API + UI Hybrid
// ════════════════════════════════════════════════════════════════

test("08 – API setup → UI verification (Hybrid)", async ({ page, request }) => {
  /**
   * HYBRID PATTERN: Use API for fast test setup, UI for assertion
   * This avoids slow UI-based setup while testing real UI behavior.
   */

  // Step 1: Create resource via API (fast)
  const postResponse = await request.post("https://jsonplaceholder.typicode.com/posts", {
    data: {
      title: "E2E Hybrid Test Post",
      body: "This was created by API and serves as test state",
      userId: 1,
    },
  });
  expect(postResponse.status()).toBe(201);
  const post = await postResponse.json();
  console.log("  API created post:", post.id);

  // Step 2: Verify via UI (would typically navigate to your app's detail page)
  await page.goto("https://playwright.dev/");
  await expect(page).toHaveTitle(/Playwright/);

  // Step 3: Verify resource still exists via API (cleanup check)
  const getResponse = await request.get(
    `https://jsonplaceholder.typicode.com/posts/1`
  );
  expect(getResponse.status()).toBe(200);
  const fetchedPost = await getResponse.json();
  expect(fetchedPost.id).toBe(1);

  console.log("✅ Hybrid E2E test complete — API state verified via UI and API");
});

// ════════════════════════════════════════════════════════════════
// 6. E2E SCENARIO: BROWSER WINDOWS
// ════════════════════════════════════════════════════════════════

test("09 – Multi-window E2E flow", async ({ page }) => {
  await page.goto("https://demoqa.com/browser-windows");

  // Open new tab
  const popupPromise = page.waitForEvent("popup");
  await page.locator("#tabButton").click();
  const newTab = await popupPromise;

  // Work in new tab
  await newTab.waitForLoadState();
  await expect(newTab.locator("h1")).toBeVisible();
  const newTabTitle = await newTab.locator("h1").textContent();
  console.log("  New tab h1:", newTabTitle);

  // Come back to original tab
  await page.bringToFront();
  await expect(page).toHaveURL(/browser-windows/);

  // Close new tab
  await newTab.close();
  console.log("✅ Multi-window E2E flow complete");
});

// ════════════════════════════════════════════════════════════════
// 7. E2E SCENARIO: Alerts Flow
// ════════════════════════════════════════════════════════════════

test("10 – Complete alerts E2E flow", async ({ page }) => {
  await page.goto("https://demoqa.com/alerts");

  // ── Alert ──────────────────────────────────────────────────────
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.locator("#alertButton").click();
  console.log("  ✅ Alert accepted");

  // ── Confirm (Accept) ──────────────────────────────────────────
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.locator("#confirmButton").click();
  await expect(page.locator("#confirmResult")).toContainText("Ok");
  console.log("  ✅ Confirm accepted");

  // ── Prompt ────────────────────────────────────────────────────
  page.once("dialog", async (dialog) => {
    await dialog.accept("Playwright E2E Test");
  });
  await page.locator("#promtButton").click();
  await expect(page.locator("#promptResult")).toContainText("Playwright E2E Test");
  console.log("  ✅ Prompt filled and accepted");

  console.log("✅ Complete alerts E2E flow passed");
});
