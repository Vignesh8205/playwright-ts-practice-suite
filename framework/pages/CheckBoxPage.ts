/**
 * FRAMEWORK: pages/CheckBoxPage.ts
 * Page Object Model for DemoQA Checkbox page.
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { logger } from "../utils/logger";

export class CheckBoxPage extends BasePage {
  readonly path = "/checkbox";

  private readonly expandAllBtn: Locator;
  private readonly collapseAllBtn: Locator;
  private readonly checkboxTree: Locator;
  private readonly resultDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.expandAllBtn   = page.locator(".rct-option-expand-all");
    this.collapseAllBtn = page.locator(".rct-option-collapse-all");
    this.checkboxTree   = page.locator(".rct-tree");
    this.resultDisplay  = page.locator("#result");
  }

  async expandAll(): Promise<void> {
    logger.debug("Expanding all nodes", "CheckBoxPage");
    await this.expandAllBtn.click();
  }

  async collapseAll(): Promise<void> {
    await this.collapseAllBtn.click();
  }

  async checkItemByLabel(label: string): Promise<void> {
    logger.debug(`Checking: ${label}`, "CheckBoxPage");
    await this.page.getByText(label, { exact: true }).click();
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

  async expectItemSelected(itemName: string): Promise<void> {
    const selected = await this.getSelectedItems();
    const found = selected.some(s => s.toLowerCase().includes(itemName.toLowerCase()));
    expect(found, `Expected "${itemName}" to be selected`).toBeTruthy();
    logger.pass(`Item selected: ${itemName}`, "CheckBoxPage");
  }

  async expectSelectionCount(count: number): Promise<void> {
    const selected = await this.getSelectedItems();
    expect(selected.length).toBe(count);
  }
}
