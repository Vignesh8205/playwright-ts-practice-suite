/**
 * FRAMEWORK: tests/elements/textbox.spec.ts
 * Tests for the Text Box page using POM + Fixtures pattern.
 *
 * Run: npx playwright test framework/tests/elements/textbox.spec.ts
 *      --config=framework/playwright.config.ts
 */

import { test, expect } from "../../fixtures";
import { RandomData } from "../../utils/randomDataHelper";
import { logger } from "../../utils/logger";
import users from "../../test-data/users.json";

test.describe("Text Box Page – @elements @smoke", () => {
  test.beforeEach(async ({ textBoxPage }) => {
    await textBoxPage.navigate();
  });

  // ── Positive Tests ──────────────────────────────────────────────
  test("TC001 – Submit form with all fields @smoke", async ({ textBoxPage }) => {
    logger.step("TC001 – Full form submission");

    const formData = {
      name: users.admin.name,
      email: users.admin.email,
      currentAddress: "100 QA Street, Automation City",
      permanentAddress: "200 Framework Lane, Test World",
    };

    await textBoxPage.fillAndSubmit(formData);
    await textBoxPage.expectFormSubmittedSuccessfully(formData);
  });

  test("TC002 – Submit with only name and email @smoke", async ({ textBoxPage }) => {
    logger.step("TC002 – Minimal form submission");

    const formData = {
      name: RandomData.fullName(),
      email: RandomData.email(),
    };

    await textBoxPage.fillAndSubmit(formData);
    await textBoxPage.expectNameInOutput(formData.name);
    await textBoxPage.expectEmailInOutput(formData.email);
  });

  test("TC003 – Verify random unique user data each run", async ({ textBoxPage }) => {
    logger.step("TC003 – Random data test");

    const name = RandomData.fullName();
    const email = RandomData.email();
    logger.info(`Generated: ${name} | ${email}`, "TC003");

    await textBoxPage.fillAndSubmit({ name, email });
    await textBoxPage.expectNameInOutput(name);
    await textBoxPage.expectEmailInOutput(email);
  });

  // ── Data-Driven ─────────────────────────────────────────────────
  const userDataSet = [
    { name: "Alice Johnson", email: "alice@test.com" },
    { name: "Bob Williams", email: "bob@test.com" },
    { name: "Carol Davis", email: "carol@test.com" },
  ];

  for (const data of userDataSet) {
    test(`TC004 – Data-driven: ${data.name} @regression`, async ({ textBoxPage }) => {
      await textBoxPage.fillAndSubmit(data);
      await textBoxPage.expectNameInOutput(data.name);
      await textBoxPage.expectEmailInOutput(data.email);
      logger.pass(`Data-driven test passed for ${data.name}`);
    });
  }

  // ── Negative Tests ──────────────────────────────────────────────
  test("TC005 – Form retains values before submission", async ({ textBoxPage, page }) => {
    logger.step("TC005 – Field value persistence");

    const name = "Persistence Test";
    await textBoxPage.fillName(name);

    // Value should persist without submission
    await expect(page.getByPlaceholder("Full Name")).toHaveValue(name);
    logger.pass("Field value persists before submission");
  });
});
