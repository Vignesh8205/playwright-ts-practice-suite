/**
 * FRAMEWORK: pages/TextBoxPage.ts
 * Page Object Model for the DemoQA Text Box page.
 * Demonstrates form interaction patterns.
 *
 * NOTE: DemoQA displays large banner ads — we scroll past them before interacting.
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { logger } from "../utils/logger";

export interface TextBoxFormData {
  name: string;
  email: string;
  currentAddress?: string;
  permanentAddress?: string;
}

export interface TextBoxOutput {
  name: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
}

export class TextBoxPage extends BasePage {
  readonly path = "/text-box";

  // ── Locators ────────────────────────────────────────────────────
  private readonly fullNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly currentAddressInput: Locator;
  private readonly permanentAddressInput: Locator;
  private readonly submitButton: Locator;
  private readonly outputSection: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput          = page.getByPlaceholder("Full Name");
    this.emailInput             = page.locator("#userEmail");
    this.currentAddressInput    = page.locator("#currentAddress");
    this.permanentAddressInput  = page.locator("#permanentAddress");
    this.submitButton           = page.locator("#submit");
    this.outputSection          = page.locator("#output");
  }

  // ── Actions ─────────────────────────────────────────────────────
  async fillName(name: string): Promise<void> {
    logger.debug(`Filling name: ${name}`, "TextBoxPage");
    await this.fullNameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    logger.debug(`Filling email: ${email}`, "TextBoxPage");
    await this.emailInput.fill(email);
  }

  async fillCurrentAddress(address: string): Promise<void> {
    await this.currentAddressInput.fill(address);
  }

  async fillPermanentAddress(address: string): Promise<void> {
    await this.permanentAddressInput.fill(address);
  }

  async fillForm(data: TextBoxFormData): Promise<void> {
    logger.step(`Filling TextBox form for: ${data.name}`);
    await this.fillName(data.name);
    await this.fillEmail(data.email);
    if (data.currentAddress) await this.fillCurrentAddress(data.currentAddress);
    if (data.permanentAddress) await this.fillPermanentAddress(data.permanentAddress);
  }

  async submit(): Promise<void> {
    logger.debug("Clicking submit", "TextBoxPage");
    await this.submitButton.click();
  }

  async fillAndSubmit(data: TextBoxFormData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  // ── Assertions ──────────────────────────────────────────────────
  async expectOutputVisible(): Promise<void> {
    await expect(this.outputSection).toBeVisible({ timeout: 10_000 });
  }

  async expectOutputContains(text: string): Promise<void> {
    await this.expectOutputVisible();
    await expect(this.outputSection).toContainText(text);
  }

  async expectNameInOutput(name: string): Promise<void> {
    await this.expectOutputContains(name);
  }

  async expectEmailInOutput(email: string): Promise<void> {
    await this.expectOutputContains(email);
  }

  async getOutputText(): Promise<string> {
    await this.expectOutputVisible();
    return (await this.outputSection.innerText()) || "";
  }

  async expectFormSubmittedSuccessfully(data: TextBoxFormData): Promise<void> {
    await this.expectOutputVisible();
    await this.expectNameInOutput(data.name);
    await this.expectEmailInOutput(data.email);
    logger.pass(`Form submission verified for: ${data.name}`, "TextBoxPage");
  }
}
