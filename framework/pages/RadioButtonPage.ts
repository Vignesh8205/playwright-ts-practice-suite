/**
 * FRAMEWORK: pages/RadioButtonPage.ts
 * Page Object Model for DemoQA Radio Button page.
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { logger } from "../utils/logger";

export type RadioOption = "Yes" | "Impressive" | "No";

export class RadioButtonPage extends BasePage {
  readonly path = "/radio-button";

  private readonly yesRadio: Locator;
  private readonly impressiveRadio: Locator;
  private readonly noRadio: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.yesRadio         = page.locator("#yesRadio");
    this.impressiveRadio  = page.locator("#impressiveRadio");
    this.noRadio          = page.locator("#noRadio");
    this.successMessage   = page.locator(".mt-3");
  }

  async selectOption(option: RadioOption): Promise<void> {
    logger.debug(`Selecting radio option: ${option}`, "RadioButtonPage");
    await this.page.getByText(option, { exact: true }).click();
  }

  async expectOptionSelected(option: RadioOption): Promise<void> {
    const locatorMap: Record<RadioOption, Locator> = {
      Yes: this.yesRadio,
      Impressive: this.impressiveRadio,
      No: this.noRadio,
    };
    await expect(locatorMap[option]).toBeChecked();
    logger.pass(`Option checked: ${option}`, "RadioButtonPage");
  }

  async expectSuccessMessage(text: string): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 5_000 });
    await expect(this.successMessage).toContainText(text);
  }

  async getSuccessMessage(): Promise<string> {
    await expect(this.successMessage).toBeVisible({ timeout: 5_000 });
    return (await this.successMessage.textContent()) || "";
  }
}
