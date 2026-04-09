# ✅ Section 7: Best Practices (Industry Level)

> **Goal:** Write clean, maintainable, scalable automation code that teams can rely on.

---

## 7.1 Project Structure Best Practices

### ✅ DO

```
tests/auth/login.spec.ts         ← Tests grouped by feature
pages/LoginPage.ts               ← One POM per page
fixtures/index.ts                ← All fixtures in one place
utils/logger.ts                  ← Single-responsibility utilities
test-data/users.json             ← External test data
config/envConfig.ts              ← Centralized config
```

### ❌ DON'T

```
tests/test1.ts                   ← Meaningless names
tests/allTests.ts                ← Everything in one file
utils/everythingHelper.ts        ← God objects
```

---

## 7.2 Naming Conventions

### Test Files
```
login.spec.ts               ← Feature name
user-management.spec.ts     ← Kebab-case, descriptive
api-users.spec.ts           ← Prefix for API tests
```

### Test Names (use Given-When-Then style)
```typescript
// ✅ Descriptive
test("login with valid credentials redirects to dashboard")
test("login with invalid password shows error message")
test("empty form submission shows required field errors")

// ❌ Vague
test("test login")
test("check error")
test("form test")
```

### Variables & Methods
```typescript
// ✅ Clear intent
const adminUser = users.admin;
await loginPage.fillUsername(adminUser.email);
await loginPage.expectErrorMessage("Invalid credentials");

// ❌ Cryptic
const u = data.a;
await p.fill("#u", u.e);
```

---

## 7.3 Avoid Hardcoding

### ❌ Bad – Hardcoded values everywhere

```typescript
await page.goto("https://qa.myapp.com/login");       // hardcoded URL
await page.fill("#username", "admin@myapp.com");      // hardcoded user
await page.waitForTimeout(3000);                      // magic number
```

### ✅ Good – Centralized config and data

```typescript
// config/envConfig.ts
export const config = { baseUrl: process.env.BASE_URL! };

// tests/login.spec.ts
await page.goto("/login");                           // baseURL from config
await loginPage.login(config.adminUser.username, config.adminUser.password);
```

### ✅ Good – No magic numbers

```typescript
// config/constants.ts
export const TIMEOUTS = {
  DEFAULT: 30_000,
  LONG: 60_000,
  SHORT: 5_000,
  NETWORK: 15_000,
} as const;

// Usage
await page.waitForResponse("**/api/data", { timeout: TIMEOUTS.NETWORK });
```

---

## 7.4 Selector Best Practices

```typescript
// ✅ PRIORITY ORDER

// 1. Role-based (most resilient — survives UI redesign)
page.getByRole("button", { name: "Submit" })
page.getByRole("link", { name: "Dashboard" })

// 2. Label-based (great for forms)
page.getByLabel("Email Address")
page.getByLabel("Password")

// 3. Test ID (add data-testid to elements in dev)
page.getByTestId("submit-btn")
// HTML: <button data-testid="submit-btn">

// 4. Placeholder (for inputs without labels)
page.getByPlaceholder("Search...")

// 5. Text content (for static text)
page.getByText("Terms & Conditions")

// ── AVOID ──────────────────────────────────────────────────────
// ❌ XPath (fragile)
page.locator("//div[@class='a b c']/span[2]/button")

// ❌ CSS with IDs that change
page.locator("#react-component-123-button")

// ❌ Index-based (breaks when order changes)
page.locator("li").nth(3)
```

---

## 7.5 Assertion Best Practices

```typescript
// ✅ Use auto-retrying assertions (not manual wait + assertion)
await expect(page.locator(".success")).toBeVisible();        // ✅ retries
await expect(page.locator(".message")).toContainText("OK");  // ✅ retries

// ❌ Don't use manual wait + assertion
await page.waitForTimeout(2000);     // ❌
expect(await page.locator(".success").isVisible()).toBe(true); // ❌

// ✅ Assert what's meaningful — not just "element visible"
await expect(page.locator(".order-number")).toContainText("ORD-");
await expect(page.locator(".price")).toHaveText("$29.99");
await expect(page).toHaveURL(/confirmation/);

// ✅ Use soft assertions for form validations
await expect.soft(page.locator("#name-error")).toContainText("required");
await expect.soft(page.locator("#email-error")).toContainText("valid email");
// Test continues even if one assertion fails
```

---

## 7.6 Reusability Patterns

### Helper: Navigate and Login Once

```typescript
// utils/authHelper.ts
import { Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { config } from "../config/envConfig";

export async function loginAsAdmin(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(config.adminUser.username, config.adminUser.password);
}

export async function loginAsUser(page: Page, username: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);
}
```

### Reusable Table Helper

```typescript
// utils/tableHelper.ts
import { Page } from "@playwright/test";

export class TableHelper {
  constructor(private page: Page, private tableSelector: string) {}

  async getRowCount(): Promise<number> {
    return this.page.locator(`${this.tableSelector} tbody tr`).count();
  }

  async getCellText(row: number, col: number): Promise<string> {
    return this.page
      .locator(`${this.tableSelector} tbody tr`)
      .nth(row)
      .locator("td")
      .nth(col)
      .innerText();
  }

  async findRowByText(searchText: string): Promise<number> {
    const rows = this.page.locator(`${this.tableSelector} tbody tr`);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();
      if (text.includes(searchText)) return i;
    }
    return -1;
  }

  async clickActionInRow(row: number, action: string): Promise<void> {
    await this.page
      .locator(`${this.tableSelector} tbody tr`)
      .nth(row)
      .getByRole("button", { name: action })
      .click();
  }
}
```

---

## 7.7 Error Handling & Retry Patterns

```typescript
// utils/retryHelper.ts

/**
 * Retry a flaky operation up to maxAttempts times
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

// Usage in test
test("flaky network test", async ({ page }) => {
  await retry(async () => {
    await page.goto("/slow-page");
    await expect(page.locator(".content")).toBeVisible();
  }, 3, 2000);
});
```

---

## 7.8 Tagging & Test Filtering

```typescript
// Tag tests with @smoke, @regression, @critical
test("login – @smoke @critical", async ({ page }) => { /* ... */ });
test("profile update – @regression", async ({ page }) => { /* ... */ });
test("bulk delete – @e2e @slow", async ({ page }) => { /* ... */ });

// Run only smoke tests
// npx playwright test --grep @smoke

// Run everything except slow tests
// npx playwright test --grep-invert @slow
```

Using `test.info()` for metadata:

```typescript
test("important checkout test", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "issue", description: "JIRA-1234" });
  testInfo.annotations.push({ type: "owner", description: "QA Team" });
  // ...
});
```

---

## 7.9 Reporting Best Practices

### HTML Report (built-in)
```json
// playwright.config.ts reporter section
["html", { outputFolder: "playwright-report", open: "never" }]
```

### Allure Report (rich, with history)
```bash
npm install --save-dev allure-playwright
```

```typescript
// playwright.config.ts
reporter: [
  ["allure-playwright", {
    outputFolder: "allure-results",
    suiteTitle: false,
    categories: [
      { name: "Outdated tests", messagePattern: ".*screenshot.*" },
      { name: "Product defects", matchedStatuses: ["failed"] },
    ]
  }]
]
```

```bash
# Generate and serve
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
# Or serve live
npx allure serve allure-results
```

### Attach screenshots to report on failure

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach("failure-screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  }
});
```

---

## 7.10 Clean Code Rules (Summary)

| Rule | Explanation |
|------|-------------|
| **One assertion concept per test** | Don't test 10 things in one test |
| **3A Pattern** | Arrange → Act → Assert |
| **No `waitForTimeout`** | Use event/condition waits instead |
| **POM for every page** | No raw locators in test files |
| **Fixtures for shared state** | Don't repeat setup in every test |
| **External test data** | JSON files, not hardcoded strings |
| **Descriptive test names** | Names should document the behavior |
| **Tag tests** | `@smoke`, `@regression`, `@e2e` |
| **Log meaningful steps** | Use logger for traceability |
| **Type everything** | No `any` in TypeScript |

---

> 🔜 **Next:** [Section 8 – Bonus: CI/CD, Docker, BDD](./08-bonus-advanced.md)
