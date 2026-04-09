/**
 * FRAMEWORK: tests/elements/radio-checkbox.spec.ts
 * Tests for Radio Button and Checkbox pages.
 *
 * Run: npx playwright test framework/tests/elements/radio-checkbox.spec.ts
 *      --config=framework/playwright.config.ts
 */

import { test, expect } from "../../fixtures";
import { logger } from "../../utils/logger";

test.describe("Radio Buttons – @elements", () => {
  test.beforeEach(async ({ radioButtonPage }) => {
    await radioButtonPage.navigate();
  });

  test("TC010 – Select Yes and verify @smoke", async ({ radioButtonPage }) => {
    logger.step("Select Yes radio option");
    await radioButtonPage.selectOption("Yes");
    await radioButtonPage.expectOptionSelected("Yes");
    await radioButtonPage.expectSuccessMessage("Yes");
    logger.pass("Yes option selected and confirmed");
  });

  test("TC011 – Select Impressive and verify", async ({ radioButtonPage }) => {
    await radioButtonPage.selectOption("Impressive");
    await radioButtonPage.expectOptionSelected("Impressive");
    await radioButtonPage.expectSuccessMessage("Impressive");
  });

  test("TC012 – Switch selection deselects previous @regression", async ({
    radioButtonPage,
    page,
  }) => {
    await radioButtonPage.selectOption("Yes");
    await expect(page.locator("#yesRadio")).toBeChecked();

    await radioButtonPage.selectOption("Impressive");
    await expect(page.locator("#impressiveRadio")).toBeChecked();
    await expect(page.locator("#yesRadio")).not.toBeChecked();

    logger.pass("Radio button mutual exclusion verified");
  });

  // Data-driven radio tests
  const options = ["Yes", "Impressive"] as const;
  for (const option of options) {
    test(`TC013 – Data-driven: select "${option}"`, async ({ radioButtonPage }) => {
      await radioButtonPage.selectOption(option);
      const message = await radioButtonPage.getSuccessMessage();
      expect(message).toContain(option);
      logger.pass(`Radio option "${option}" verified`);
    });
  }
});

test.describe("Checkboxes – @elements", () => {
  test.beforeEach(async ({ checkBoxPage }) => {
    await checkBoxPage.navigate();
  });

  test("TC020 – Expand all and select Desktop @smoke", async ({ checkBoxPage }) => {
    logger.step("Expand tree and select Desktop");
    await checkBoxPage.expandAll();
    await checkBoxPage.checkItemByLabel("Desktop");
    const selected = await checkBoxPage.getSelectedItems();
    expect(selected.length).toBeGreaterThan(0);
    logger.pass(`Selected items: ${selected.join(", ")}`);
  });

  test("TC021 – Expand all nodes and count items @regression", async ({ page, checkBoxPage }) => {
    await checkBoxPage.expandAll();

    const items = page.locator(".rct-node");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    logger.info(`Tree has ${count} visible nodes`);
  });
});
