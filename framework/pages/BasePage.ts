/**
 * FRAMEWORK: pages/BasePage.ts
 * Abstract base class for all Page Object Models.
 * Contains shared navigation, screenshot, and wait utilities.
 */
import { Page, Locator, expect } from "@playwright/test";
import { logger } from "../utils/logger";

export abstract class BasePage {
  protected readonly page: Page;
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ──────────────────────────────────────────────────
  async navigate(): Promise<void> {
    logger.info(`Navigating to: ${this.path}`, this.constructor.name);
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  // ── Page Info ──────────────────────────────────────────────────
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  // ── Screenshot ─────────────────────────────────────────────────
  async takeScreenshot(name: string): Promise<void> {
    const filename = `./reports/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    logger.debug(`Screenshot saved: ${filename}`, this.constructor.name);
  }

  // ── Utility ────────────────────────────────────────────────────
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async waitForElement(locator: Locator, timeout = 10_000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) || "";
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async clickIfVisible(locator: Locator): Promise<boolean> {
    if (await locator.isVisible()) {
      await locator.click();
      return true;
    }
    return false;
  }
}
