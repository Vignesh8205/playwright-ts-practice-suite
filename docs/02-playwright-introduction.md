# 🎭 Section 2: Playwright Introduction

> **Goal:** Set up a Playwright project with TypeScript and write your first test.

---

## 2.1 What is Playwright?

**Playwright** is a modern, open-source end-to-end testing framework developed by **Microsoft**. It supports:

- **Chromium**, **Firefox**, and **WebKit** (Safari engine)
- **Multiple languages**: TypeScript, JavaScript, Python, Java, C#
- **Multiple contexts**: browser, API, mobile emulation
- **Built-in features**: auto-wait, network interception, screenshots, videos, tracing

### Playwright vs Selenium vs Cypress

| Feature | Playwright | Selenium | Cypress |
|---------|-----------|---------|---------|
| Language Support | TS, JS, Python, Java, C# | Most languages | JS/TS only |
| Multi-browser | ✅ Chromium, Firefox, WebKit | ✅ All browsers | Limited |
| Auto-wait | ✅ Built-in | ❌ Manual waits | ✅ Limited |
| API Testing | ✅ Built-in | ❌ | Limited |
| Network Interception | ✅ Full | ❌ | ✅ Partial |
| Parallel Execution | ✅ Native | Via TestNG/JUnit | ✅ |
| Speed | ⚡ Very Fast | 🐢 Slow | ⚡ Fast |
| Shadow DOM | ✅ | Limited | Limited |
| iFrames | ✅ | ✅ | Limited |
| New Tab/Window | ✅ | ✅ | ❌ |

---

## 2.2 Installation & Project Setup

### Step 1: Create a new project

```bash
mkdir playwright-ts-demo
cd playwright-ts-demo
npm init -y
```

### Step 2: Install Playwright

```bash
# Install Playwright with browsers
npm init playwright@latest
```

This interactive setup will ask:
- **TypeScript or JavaScript?** → Select **TypeScript**
- **Test directory?** → `tests` (default)
- **GitHub Actions workflow?** → Yes (recommended)
- **Install browsers?** → Yes

### Step 3: Manual install (alternative)

```bash
npm install --save-dev @playwright/test
npx playwright install
npx playwright install-deps   # Linux only
```

### Step 4: Verify installation

```bash
npx playwright --version
# Playwright v1.44.0
```

---

## 2.3 Project Folder Structure

After setup, your project looks like:

```
playwright-ts-demo/
│
├── tests/                          # Test files
│   └── example.spec.ts
│
├── playwright.config.ts            # Main Playwright configuration
├── package.json
├── tsconfig.json
│
└── test-results/                   # Auto-generated after running tests
    ├── .playwright/
    └── *.png, *.zip (artifacts)
```

### Industry-level structure (we'll build this in Section 5):

```
playwright-ts-demo/
│
├── tests/                          # All test specifications
│   ├── login/
│   │   └── login.spec.ts
│   └── dashboard/
│       └── dashboard.spec.ts
│
├── pages/                          # Page Object Models
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── DashboardPage.ts
│
├── fixtures/                       # Custom test fixtures
│   └── index.ts
│
├── utils/                          # Helper utilities
│   ├── logger.ts
│   └── testDataHelper.ts
│
├── test-data/                      # Test data (JSON/TS)
│   └── users.json
│
├── config/                         # Environment configurations
│   └── envConfig.ts
│
├── .github/workflows/              # CI/CD
│   └── playwright.yml
│
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 2.4 Understanding `playwright.config.ts`

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.ENV || "qa"}` });

export default defineConfig({
  // ── Test Directory ──────────────────────────────────────────
  testDir: "./tests",

  // ── Test File Pattern ────────────────────────────────────────
  testMatch: "**/*.spec.ts",

  // ── Parallelism ───────────────────────────────────────────────
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  // ── Retries on failure ────────────────────────────────────────
  retries: process.env.CI ? 2 : 0,

  // ── Timeout per test ─────────────────────────────────────────
  timeout: 30_000,

  // ── Expect assertion timeout ──────────────────────────────────
  expect: {
    timeout: 10_000,
  },

  // ── Reporting ─────────────────────────────────────────────────
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }]
  ],

  // ── Global test settings ──────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL || "https://demo.playwright.dev",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // ── Browser Projects ──────────────────────────────────────────
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile emulation
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  // ── Output folder ─────────────────────────────────────────────
  outputDir: "test-results/",
});
```

---

## 2.5 Writing Your First Test

```typescript
// tests/example.spec.ts
import { test, expect } from "@playwright/test";

test("should display correct title on Playwright docs page", async ({ page }) => {
  // Navigate to URL
  await page.goto("https://playwright.dev");

  // Assert the page title
  await expect(page).toHaveTitle(/Playwright/);

  // Find an element and assert its text
  const heading = page.locator("h1");
  await expect(heading).toContainText("Playwright");
});

test("should navigate to docs", async ({ page }) => {
  await page.goto("https://playwright.dev");

  // Click a link
  await page.getByRole("link", { name: "Docs" }).click();

  // Assert URL changed
  await expect(page).toHaveURL(/docs/);
});
```

---

## 2.6 Running Tests

### Run all tests (headless)
```bash
npx playwright test
```

### Run in headed mode (browser visible)
```bash
npx playwright test --headed
```

### Run a specific file
```bash
npx playwright test tests/login/login.spec.ts
```

### Run specific test by name
```bash
npx playwright test --grep "should display correct title"
```

### Run on a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug mode (step-through in Inspector)
```bash
npx playwright test --debug
```

### UI mode (interactive test runner)
```bash
npx playwright test --ui
```

### Codegen (record and generate tests)
```bash
npx playwright codegen https://example.com
```

### Show HTML report
```bash
npx playwright show-report
```

---

## 2.7 Understanding Test Anatomy

```typescript
import { test, expect } from "@playwright/test";

// ── Test Suite (group of tests) ───────────────────────────────
test.describe("Login Feature", () => {

  // ── Hook: runs before ALL tests in this suite ─────────────────
  test.beforeAll(async () => {
    console.log("Suite starting...");
  });

  // ── Hook: runs before EACH test ───────────────────────────────
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  // ── Individual Test ───────────────────────────────────────────
  test("valid login should succeed", async ({ page }) => {
    // Arrange: fill form
    await page.fill("#username", "admin");
    await page.fill("#password", "password");

    // Act: submit
    await page.click("#submit");

    // Assert: check result
    await expect(page).toHaveURL("/dashboard");
  });

  test("invalid login should show error", async ({ page }) => {
    await page.fill("#username", "wrong");
    await page.fill("#password", "wrong");
    await page.click("#submit");

    await expect(page.locator(".error-message")).toBeVisible();
    await expect(page.locator(".error-message")).toContainText("Invalid credentials");
  });

  // ── Hook: runs after EACH test ────────────────────────────────
  test.afterEach(async ({ page }) => {
    await page.screenshot({ path: "screenshots/after-test.png" });
  });

  // ── Hook: runs after ALL tests ────────────────────────────────
  test.afterAll(async () => {
    console.log("Suite done!");
  });
});
```

---

## 2.8 The `page` Object

The `page` object is the **heart of Playwright**. It represents a browser tab and gives you access to:

```typescript
test("page object overview", async ({ page }) => {
  // Navigation
  await page.goto("https://example.com");
  await page.goBack();
  await page.goForward();
  await page.reload();

  // Info
  const url = page.url();
  const title = await page.title();
  const content = await page.content(); // full HTML

  // Screenshots
  await page.screenshot({ path: "screenshot.png" });
  await page.screenshot({ path: "full.png", fullPage: true });

  // Evaluate JavaScript
  const cookies = await page.evaluate(() => document.cookie);

  // Wait for conditions
  await page.waitForURL("**/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector(".loaded");
});
```

---

## ✅ Summary

| Command | Purpose |
|---------|---------|
| `npx playwright test` | Run all tests |
| `npx playwright test --headed` | Run with browser visible |
| `npx playwright test --debug` | Step-through debugging |
| `npx playwright test --ui` | Interactive UI mode |
| `npx playwright codegen` | Record tests visually |
| `npx playwright show-report` | View HTML report |

> 🔜 **Next:** [Section 3 – Core Playwright Concepts](./03-core-concepts.md)
