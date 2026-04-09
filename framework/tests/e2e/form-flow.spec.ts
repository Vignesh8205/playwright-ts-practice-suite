/**
 * FRAMEWORK: tests/e2e/form-flow.spec.ts
 * End-to-end test for a complete form interaction flow.
 * Demonstrates hooks, page objects, logging, and data-driven patterns.
 *
 * Run: npx playwright test framework/tests/e2e/form-flow.spec.ts
 *      --config=framework/playwright.config.ts
 */

import { test, expect } from "../../fixtures";
import { RandomData } from "../../utils/randomDataHelper";
import { logger } from "../../utils/logger";

test.describe("E2E – Complete Form Flow @e2e", () => {

  // ── Hooks ─────────────────────────────────────────────────────
  test.beforeAll(async () => {
    logger.step("E2E Suite Starting");
    logger.info("Environment: " + (process.env.ENV || "qa"));
  });

  test.beforeEach(async ({ textBoxPage, page }, testInfo) => {
    logger.step(`Starting: ${testInfo.title}`);
    await textBoxPage.navigate();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Attach screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach("failure-screenshot", {
        body: screenshot,
        contentType: "image/png",
      });
      logger.fail(`Test FAILED: ${testInfo.title}`);
    } else {
      logger.pass(`Test PASSED: ${testInfo.title}`);
    }
  });

  test.afterAll(async () => {
    logger.step("E2E Suite Complete");
  });

  // ── Test Cases ─────────────────────────────────────────────────

  test("TC200 – Full form submission with all fields @smoke", async ({ textBoxPage }) => {
    const data = {
      name: "E2E Test User",
      email: RandomData.email(),
      currentAddress: "100 Automation Blvd, Test City, TC 12345",
      permanentAddress: "200 QA Avenue, Framework Town, FW 67890",
    };

    logger.info(`Test data: ${JSON.stringify(data)}`);

    await textBoxPage.fillAndSubmit(data);
    await textBoxPage.expectFormSubmittedSuccessfully(data);
  });

  test("TC201 – Verify form output section appears after submit @smoke", async ({
    textBoxPage,
    page,
  }) => {
    const outputSection = page.locator("#output");
    await expect(outputSection).not.toBeVisible(); // Hidden before submit

    await textBoxPage.fillAndSubmit({
      name: RandomData.fullName(),
      email: RandomData.email(),
    });

    await expect(outputSection).toBeVisible(); // Visible after submit
    logger.pass("Output section appears after form submission");
  });

  test("TC202 – Multiple sequential form submissions", async ({ textBoxPage, page }) => {
    const submissions = [
      { name: RandomData.fullName(), email: RandomData.email() },
      { name: RandomData.fullName(), email: RandomData.email() },
    ];

    for (let i = 0; i < submissions.length; i++) {
      logger.step(`Submission ${i + 1}/${submissions.length}`);

      // Navigate fresh for each submission
      await textBoxPage.navigate();
      await textBoxPage.fillAndSubmit(submissions[i]);
      await textBoxPage.expectNameInOutput(submissions[i].name);

      logger.pass(`Submission ${i + 1} verified: ${submissions[i].name}`);
    }
  });

  test("TC203 – Screenshot captured during test", async ({ textBoxPage, page }) => {
    await textBoxPage.fillForm({
      name: "Screenshot Test User",
      email: "screenshot@test.com",
    });

    // Take screenshot before submit
    await textBoxPage.takeScreenshot("pre-submit");

    await textBoxPage.submit();
    await textBoxPage.expectOutputVisible();

    // Take screenshot after submit
    await textBoxPage.takeScreenshot("post-submit");

    logger.pass("Screenshots taken at key test moments");
  });
});

// ── Data-Driven E2E Suite ──────────────────────────────────────
test.describe("E2E – Data-Driven Form @e2e @regression", () => {
  const testDataSet = [
    { name: "Alice Cooper", email: "alice.cooper@test.com", scenario: "standard user" },
    { name: "Bob Dylan", email: "bob.dylan@test.com", scenario: "special characters in name" },
    { name: "Carol King", email: "carol.king@subdomain.test.com", scenario: "subdomain email" },
  ];

  for (const data of testDataSet) {
    test(`TC210 – ${data.scenario}: ${data.name}`, async ({ textBoxPage }) => {
      await textBoxPage.navigate();
      await textBoxPage.fillAndSubmit({ name: data.name, email: data.email });
      await textBoxPage.expectNameInOutput(data.name);
      logger.pass(`Scenario verified: ${data.scenario}`);
    });
  }
});
