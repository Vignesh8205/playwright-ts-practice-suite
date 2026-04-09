# 🚀 Section 4: Advanced Concepts

> **Goal:** Learn Page Object Model, fixtures, parallel execution, cross-browser testing, and environment management.

---

## 4.1 Page Object Model (POM)

The **Page Object Model** is the most important design pattern in automation. It separates:
- **Test logic** (what to test) from
- **Page logic** (how to interact with the page)

### 4.1.1 Without POM (❌ Bad Practice)

```typescript
test("login test", async ({ page }) => {
  await page.goto("https://app.com/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "password");
  await page.click("#submit");
  await expect(page).toHaveURL("/dashboard");
});

test("another test that uses login", async ({ page }) => {
  // Duplicated code ❌
  await page.goto("https://app.com/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "password");
  await page.click("#submit");
  // Now do something else...
});
```

### 4.1.2 BasePage Class

```typescript
// pages/BasePage.ts
import { Page, Locator } from "@playwright/test";

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  protected async getTitle(): Promise<string> {
    return this.page.title();
  }

  protected async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
```

### 4.1.3 LoginPage POM

```typescript
// pages/LoginPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  // Locators as private properties
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Sign In" });
    this.errorMessage = page.locator("[data-testid='error-message']");
    this.rememberMeCheckbox = page.getByRole("checkbox", { name: "Remember me" });
    this.forgotPasswordLink = page.getByRole("link", { name: "Forgot password?" });
  }

  // Page URL
  async goto(): Promise<void> {
    await this.navigate("/login");
  }

  // Action Methods
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.check();
  }

  // Composite Actions (high-level steps)
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async loginWithRememberMe(username: string, password: string): Promise<void> {
    await this.checkRememberMe();
    await this.login(username, password);
  }

  // Assertion Helpers
  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoginButtonDisabled(): Promise<void> {
    await expect(this.loginButton).toBeDisabled();
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/login/);
    await expect(this.page).toHaveTitle(/Login/);
  }
}
```

### 4.1.4 DashboardPage POM

```typescript
// pages/DashboardPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  private readonly welcomeMessage: Locator;
  private readonly navMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly userAvatar: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator("[data-testid='welcome-message']");
    this.navMenu = page.getByRole("navigation");
    this.logoutButton = page.getByRole("button", { name: "Logout" });
    this.userAvatar = page.locator(".user-avatar");
  }

  async expectDashboardLoaded(username?: string): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.welcomeMessage).toBeVisible();
    if (username) {
      await expect(this.welcomeMessage).toContainText(username);
    }
  }

  async navigateTo(section: string): Promise<void> {
    await this.navMenu.getByRole("link", { name: section }).click();
  }

  async logout(): Promise<void> {
    await this.userAvatar.click();
    await this.logoutButton.click();
  }
}
```

### 4.1.5 Using POMs in Tests (✅ Good Practice)

```typescript
// tests/login/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";

test.describe("Login Feature", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test("valid login redirects to dashboard", async () => {
    await loginPage.login("admin@example.com", "Password@1");
    await dashboardPage.expectDashboardLoaded("Admin");
  });

  test("invalid password shows error", async () => {
    await loginPage.login("admin@example.com", "wrong_password");
    await loginPage.expectErrorMessage("Invalid username or password");
  });

  test("empty fields show validation errors", async () => {
    await loginPage.clickLoginButton();
    await loginPage.expectErrorMessage("Username is required");
  });
});
```

---

## 4.2 Test Hooks

```typescript
import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.describe("User Profile Tests", () => {
  // Runs ONCE before all tests in this describe block
  test.beforeAll(async ({ browser }) => {
    // Create a shared browser context (e.g., authenticated state)
    const context = await browser.newContext();
    const page = await context.newPage();
    // Perform login once
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("admin@example.com", "Password@1");
    // Save storage state for reuse
    await context.storageState({ path: "auth.json" });
    await context.close();
  });

  // Runs before EACH test
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });

  test("profile name is displayed", async ({ page }) => {
    // Test runs with pre-authenticated state
  });

  // Runs after EACH test
  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = `screenshots/${testInfo.title}.png`;
      await page.screenshot({ path: screenshotPath });
      testInfo.attachments.push({
        name: "screenshot",
        path: screenshotPath,
        contentType: "image/png"
      });
    }
  });

  // Runs ONCE after all tests
  test.afterAll(async () => {
    // Cleanup: remove temp files, reset DB, etc.
    console.log("Cleanup complete");
  });
});
```

---

## 4.3 Fixtures

Fixtures provide **dependency injection** for tests — the cleanest way to share state.

### 4.3.1 Custom Fixture Setup

```typescript
// fixtures/index.ts
import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";

// Define fixture types
type PageObjects = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

type AuthState = {
  authenticatedPage: Page;
};

// Extend base test with custom fixtures
export const test = base.extend<PageObjects & AuthState>({

  // Page Object fixture — auto-instantiated for each test
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Teardown (runs after test)
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // Pre-authenticated page fixture
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "auth.json"  // Saved login session
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// Re-export expect for convenience
export { expect } from "@playwright/test";
```

### 4.3.2 Using Fixtures in Tests

```typescript
// tests/dashboard/dashboard.spec.ts
import { test, expect } from "../../fixtures";  // ← import from fixtures!

test("login using fixture", async ({ loginPage, dashboardPage }) => {
  // loginPage and dashboardPage are auto-created!
  await loginPage.goto();
  await loginPage.login("admin@example.com", "Password@1");
  await dashboardPage.expectDashboardLoaded();
});

test("access protected page", async ({ authenticatedPage }) => {
  // Already logged in!
  await authenticatedPage.goto("/profile");
  await expect(authenticatedPage.locator("h1")).toContainText("Profile");
});
```

### 4.3.3 Global Setup (Authentication Once)

```typescript
// global-setup.ts
import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.getByLabel("Username").fill(process.env.TEST_USERNAME!);
  await page.getByLabel("Password").fill(process.env.TEST_PASSWORD!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");

  // Save authenticated state
  await page.context().storageState({ path: "auth.json" });
  await browser.close();
}

export default globalSetup;
```

In `playwright.config.ts`:
```typescript
export default defineConfig({
  globalSetup: "./global-setup.ts",
  use: {
    storageState: "auth.json",  // Apply to all tests
  }
});
```

---

## 4.4 Environment Configuration

### 4.4.1 .env Files

```bash
# .env.dev
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000/api
TEST_USERNAME=admin@dev.com
TEST_PASSWORD=DevPass@1

# .env.qa
BASE_URL=https://qa.myapp.com
API_URL=https://qa-api.myapp.com/api
TEST_USERNAME=admin@qa.com
TEST_PASSWORD=QaPass@1

# .env.prod  (read-only, never write to prod!)
BASE_URL=https://myapp.com
API_URL=https://api.myapp.com/api
TEST_USERNAME=readonly@prod.com
TEST_PASSWORD=ProdPass@1
```

### 4.4.2 Config Manager

```typescript
// config/envConfig.ts
import * as dotenv from "dotenv";

type Environment = "dev" | "qa" | "staging" | "prod";

export interface AppConfig {
  baseUrl: string;
  apiUrl: string;
  username: string;
  password: string;
  timeout: number;
  headless: boolean;
  browser: string;
}

// Load env file based on ENV variable
const env = (process.env.ENV || "qa") as Environment;
dotenv.config({ path: `.env.${env}` });

export const config: AppConfig = {
  baseUrl: process.env.BASE_URL || "https://qa.myapp.com",
  apiUrl: process.env.API_URL || "https://qa-api.myapp.com/api",
  username: process.env.TEST_USERNAME || "admin@qa.com",
  password: process.env.TEST_PASSWORD || "QaPass@1",
  timeout: parseInt(process.env.TIMEOUT || "30000"),
  headless: process.env.HEADLESS !== "false",
  browser: process.env.BROWSER || "chromium",
};
```

### 4.4.3 Running with Different Environments

```bash
# Run on QA (default)
npx playwright test

# Run on DEV
ENV=dev npx playwright test

# Run on STAGING with Firefox
ENV=staging npx playwright test --project=firefox

# Run with specific browser visible
ENV=qa HEADLESS=false npx playwright test
```

---

## 4.5 Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  // All tests in different files run parallel
  fullyParallel: true,

  // Number of parallel workers
  workers: process.env.CI ? 2 : 4,

  // ...
});
```

### Controlling Parallelism per Suite

```typescript
// Run this entire suite serially (one by one)
test.describe.serial("Critical Purchase Flow", () => {
  test("add to cart", async ({ page }) => { /* ... */ });
  test("checkout", async ({ page }) => { /* ... */ });  // Depends on above
  test("payment", async ({ page }) => { /* ... */ });
});

// Run this suite in parallel
test.describe.parallel("Independent Tests", () => {
  test("test A", async ({ page }) => { /* ... */ });
  test("test B", async ({ page }) => { /* ... */ });
  test("test C", async ({ page }) => { /* ... */ });
});

// Skip parallelism for one test
test("serial test", async ({ page }) => { /* ... */ });
test.serial("must run alone", async ({ page }) => { /* ... */ });
```

---

## 4.6 Cross-Browser Testing

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // Desktop browsers
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",  // Use installed Chrome
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "safari",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "edge",
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
      },
    },

    // Mobile browsers
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad Pro"] },
    },

    // API testing project (no browser)
    {
      name: "api-tests",
      use: { baseURL: process.env.API_URL },
      testMatch: "**/api/**/*.spec.ts",
    },

    // Setup project (run first)
    {
      name: "setup",
      testMatch: "**/global-setup.spec.ts",
    },
    {
      name: "authenticated",
      use: { storageState: "auth.json" },
      dependencies: ["setup"],  // Run after setup project
    },
  ],
});
```

### Run specific browser:
```bash
# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Multiple browsers
npx playwright test --project=chromium --project=firefox

# All browsers
npx playwright test
```

---

## 4.7 Network Interception & Mocking

```typescript
test("mock API response", async ({ page }) => {
  // Intercept and mock API call
  await page.route("**/api/users", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, name: "Alice", email: "alice@test.com" },
        { id: 2, name: "Bob", email: "bob@test.com" }
      ])
    });
  });

  await page.goto("/users");
  await expect(page.locator(".user-row")).toHaveCount(2);
});

test("simulate network error", async ({ page }) => {
  await page.route("**/api/data", route => {
    route.abort("failed");
  });

  await page.goto("/dashboard");
  await expect(page.locator(".error-banner")).toBeVisible();
  await expect(page.locator(".error-banner")).toContainText("Network error");
});

test("modify request headers", async ({ page }) => {
  await page.route("**/api/**", async route => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        "x-test-mode": "true",
        "Authorization": "Bearer test-token"
      }
    });
  });

  await page.goto("/secure-page");
});

test("capture API response", async ({ page }) => {
  const responsePromise = page.waitForResponse("**/api/login");
  await page.goto("/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "password");
  await page.click("#submit");

  const response = await responsePromise;
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.token).toBeTruthy();
});
```

---

## ✅ Summary

| Concept | Key Benefit |
|---------|------------|
| **POM** | Maintainable, reusable test code |
| **Fixtures** | Clean dependency injection for page objects |
| **Global Setup** | Login once, reuse session across all tests |
| **Env Config** | Switch environments with one variable |
| **Parallel** | 4x faster test execution |
| **Cross-Browser** | Test on Chrome, FF, Safari simultaneously |
| **Network Mock** | Test edge cases without real backend |

> 🔜 **Next:** [Section 5 – Industry-Standard Framework](./05-industry-framework.md)
