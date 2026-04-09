/**
 * FRAMEWORK: fixtures/index.ts
 * Custom test fixtures using Playwright's extend mechanism.
 * Import `test` and `expect` from here instead of @playwright/test.
 *
 * Usage: import { test, expect } from "../fixtures"
 */
import { test as base, APIRequestContext } from "@playwright/test";
import { TextBoxPage } from "../pages/TextBoxPage";
import { CheckBoxPage } from "../pages/CheckBoxPage";
import { RadioButtonPage } from "../pages/RadioButtonPage";
import { ApiHelper } from "../utils/apiHelper";
import { config } from "../config/envConfig";
import { logger } from "../utils/logger";

// ── Fixture Type Definitions ────────────────────────────────────
type PageFixtures = {
  textBoxPage: TextBoxPage;
  checkBoxPage: CheckBoxPage;
  radioButtonPage: RadioButtonPage;
};

type ApiFixtures = {
  apiHelper: ApiHelper;
};

type AllFixtures = PageFixtures & ApiFixtures;

// ── Extend base test with custom fixtures ─────────────────────
export const test = base.extend<AllFixtures>({

  /**
   * TextBoxPage fixture
   * Automatically instantiates and navigates to the text box page.
   */
  textBoxPage: async ({ page }, use) => {
    logger.debug("Creating TextBoxPage fixture", "Fixtures");
    const textBoxPage = new TextBoxPage(page);
    await use(textBoxPage);
    // Teardown (runs after test completes)
    logger.debug("TextBoxPage fixture torn down", "Fixtures");
  },

  /**
   * CheckBoxPage fixture
   */
  checkBoxPage: async ({ page }, use) => {
    logger.debug("Creating CheckBoxPage fixture", "Fixtures");
    const checkBoxPage = new CheckBoxPage(page);
    await use(checkBoxPage);
  },

  /**
   * RadioButtonPage fixture
   */
  radioButtonPage: async ({ page }, use) => {
    logger.debug("Creating RadioButtonPage fixture", "Fixtures");
    const radioButtonPage = new RadioButtonPage(page);
    await use(radioButtonPage);
  },

  /**
   * ApiHelper fixture
   * Initializes API helper with base URL.
   */
  apiHelper: async ({ request }, use) => {
    logger.debug("Creating ApiHelper fixture", "Fixtures");
    const helper = new ApiHelper(request, config.apiUrl);
    await use(helper);
  },
});

// Re-export expect so consumers only need to import from fixtures
export { expect } from "@playwright/test";
