# 🎓 Section 8: Bonus – CI/CD, Docker, Visual Testing & BDD

> **Goal:** Master advanced topics that differentiate junior testers from senior automation engineers.

---

## 8.1 GitHub Actions CI/CD

GitHub Actions runs your Playwright tests automatically on every push or pull request.

### Basic Workflow

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: "0 6 * * 1-5"   # Run daily at 6 AM, Mon-Fri

jobs:
  test:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 60

    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run Playwright tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          ENV: qa
          BASE_URL: ${{ secrets.QA_BASE_URL }}
          API_URL: ${{ secrets.QA_API_URL }}
          ADMIN_USERNAME: ${{ secrets.QA_ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.QA_ADMIN_PASSWORD }}
          CI: "true"

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.browser }}
          path: test-results/
          retention-days: 7
```

### Advanced Workflow with Smoke + Regression Split

```yaml
# .github/workflows/playwright-advanced.yml
name: Playwright Advanced Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  smoke-tests:
    name: Smoke Tests (Fast Gate)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run smoke tests only
        run: npx playwright test --project=chromium --grep @smoke
        env:
          ENV: qa
          BASE_URL: ${{ secrets.QA_BASE_URL }}
          ADMIN_USERNAME: ${{ secrets.QA_ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.QA_ADMIN_PASSWORD }}

  regression-tests:
    name: Full Regression
    runs-on: ubuntu-latest
    needs: smoke-tests       # Only runs if smoke passes
    strategy:
      matrix:
        shard: [1, 2, 3, 4]  # Split tests into 4 parallel shards
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run regression shard ${{ matrix.shard }}
        run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          ENV: qa
          BASE_URL: ${{ secrets.QA_BASE_URL }}
          ADMIN_USERNAME: ${{ secrets.QA_ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.QA_ADMIN_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: report-shard-${{ matrix.shard }}
          path: playwright-report/

  merge-reports:
    name: Merge & Publish Report
    runs-on: ubuntu-latest
    needs: regression-tests
    if: always()
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - name: Download all reports
        uses: actions/download-artifact@v4
        with:
          path: all-reports/
          pattern: report-shard-*
      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-reports
      - name: Upload merged report
        uses: actions/upload-artifact@v4
        with:
          name: merged-playwright-report
          path: playwright-report/
```

---

## 8.2 Jenkins CI/CD

```groovy
// Jenkinsfile
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.44.0-jammy'
            args '--user root'
        }
    }

    parameters {
        choice(name: 'ENV', choices: ['qa', 'staging', 'prod'], description: 'Environment')
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'], description: 'Browser')
    }

    environment {
        BASE_URL      = credentials("${params.ENV}-base-url")
        ADMIN_USERNAME = credentials("${params.ENV}-admin-username")
        ADMIN_PASSWORD = credentials("${params.ENV}-admin-password")
        CI            = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    def projectArg = params.BROWSER == 'all' ? '' : "--project=${params.BROWSER}"
                    sh "ENV=${params.ENV} npx playwright test ${projectArg}"
                }
            }
        }
    }

    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
        failure {
            emailext(
                subject: "Playwright Tests FAILED – ${params.ENV} – ${currentBuild.displayName}",
                body: "Check Jenkins for details: ${BUILD_URL}",
                to: 'qa-team@company.com'
            )
        }
    }
}
```

---

## 8.3 Docker Integration

### Dockerfile

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Set default command
CMD ["npx", "playwright", "test"]
```

### docker-compose.yml

```yaml
# docker-compose.yml
version: "3.9"

services:
  playwright-tests:
    build: .
    environment:
      - ENV=${ENV:-qa}
      - BASE_URL=${BASE_URL}
      - API_URL=${API_URL}
      - ADMIN_USERNAME=${ADMIN_USERNAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - CI=true
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
      - ./logs:/app/logs
    command: >
      npx playwright test
      --project=chromium
      --reporter=html

  # Allure report service
  allure-report:
    image: frankescobar/allure-docker-service
    environment:
      - CHECK_RESULTS_EVERY_SECONDS=3
    ports:
      - "5050:5050"
    volumes:
      - ./allure-results:/app/allure-results
      - ./allure-report:/app/default-reports
```

### Running with Docker

```bash
# Build the image
docker build -t playwright-tests .

# Run tests (headless)
docker run --rm \
  -e ENV=qa \
  -e BASE_URL=https://qa.myapp.com \
  -e ADMIN_USERNAME=admin@qa.com \
  -e ADMIN_PASSWORD=QaPass@1 \
  -v $(pwd)/playwright-report:/app/playwright-report \
  playwright-tests

# Run with docker-compose
ENV=qa BASE_URL=https://qa.myapp.com \
ADMIN_USERNAME=admin@qa.com ADMIN_PASSWORD=QaPass@1 \
docker-compose up --build playwright-tests

# Run specific browser
docker run playwright-tests npx playwright test --project=firefox
```

---

## 8.4 Visual Testing (Screenshot Comparison)

Playwright supports **pixel-perfect screenshot comparison** out of the box.

```typescript
// playwright.config.ts – visual testing config
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 50,        // Allow up to 50 different pixels
    threshold: 0.2,           // 20% color threshold per pixel
    animations: "disabled",   // Disable CSS animations for consistency
  },
  toMatchSnapshot: {
    maxDiffPixelRatio: 0.02,  // Allow 2% pixel ratio difference
  }
}
```

```typescript
// tests/visual/homepage-visual.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests", () => {

  test("homepage – full page snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot("homepage-full.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("dashboard chart – component snapshot", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector(".chart-container.loaded");

    await expect(page.locator(".chart-container")).toHaveScreenshot("dashboard-chart.png");
  });

  test("mobile – login page layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    await page.goto("/login");

    await expect(page).toHaveScreenshot("login-mobile.png");
  });
});
```

```bash
# Create baseline screenshots (first run)
npx playwright test tests/visual/ --update-snapshots

# Compare against baseline (subsequent runs)
npx playwright test tests/visual/
```

---

## 8.5 BDD with Cucumber + Playwright

### Setup

```bash
npm install --save-dev @cucumber/cucumber @cucumber/pretty-formatter ts-node
```

### Feature File

```gherkin
# features/login.feature
Feature: User Authentication
  As a registered user
  I want to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  @smoke
  Scenario: Successful login with valid credentials
    When I enter username "admin@myapp.com" and password "AdminPass@1"
    And I click the Sign In button
    Then I should be redirected to the dashboard
    And I should see welcome message "Welcome, Admin"

  @regression
  Scenario: Login failure with invalid password
    When I enter username "admin@myapp.com" and password "WrongPass"
    And I click the Sign In button
    Then I should see error message "Invalid username or password"
    And I should remain on the login page

  @regression
  Scenario Outline: Login with multiple user roles
    When I enter username "<username>" and password "<password>"
    And I click the Sign In button
    Then I should be redirected to "<expectedUrl>"

    Examples:
      | username           | password      | expectedUrl      |
      | admin@myapp.com    | AdminPass@1   | /dashboard       |
      | editor@myapp.com   | EditorPass@1  | /editor-home     |
      | viewer@myapp.com   | ViewerPass@1  | /viewer-home     |
```

### Step Definitions

```typescript
// steps/loginSteps.ts
import { Given, When, Then, BeforeAll, AfterAll, Before, After } from "@cucumber/cucumber";
import { chromium, Browser, Page, BrowserContext, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { config } from "../../config/envConfig";

let browser: Browser;
let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let dashboardPage: DashboardPage;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: config.headless });
});

AfterAll(async () => {
  await browser.close();
});

Before(async () => {
  context = await browser.newContext({ baseURL: config.baseUrl });
  page = await context.newPage();
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);
});

After(async function (scenario) {
  if (scenario.result?.status === "FAILED") {
    const screenshot = await page.screenshot({ fullPage: true });
    this.attach(screenshot, "image/png");
  }
  await context.close();
});

Given("I am on the login page", async () => {
  await loginPage.goto();
});

When("I enter username {string} and password {string}", async (username: string, password: string) => {
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When("I click the Sign In button", async () => {
  await loginPage.clickLoginButton();
});

Then("I should be redirected to the dashboard", async () => {
  await dashboardPage.expectDashboardLoaded();
});

Then("I should see welcome message {string}", async (message: string) => {
  await expect(page.locator(".welcome-message")).toContainText(message);
});

Then("I should see error message {string}", async (message: string) => {
  await loginPage.expectErrorMessage(message);
});

Then("I should remain on the login page", async () => {
  await loginPage.expectOnLoginPage();
});

Then("I should be redirected to {string}", async (url: string) => {
  await expect(page).toHaveURL(new RegExp(url));
});
```

### Cucumber Config

```javascript
// cucumber.config.js (or .cucumberrc.js)
module.exports = {
  default: {
    require: ["steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: [
      "@cucumber/pretty-formatter",
      "json:reports/cucumber-report.json",
      "html:reports/cucumber-report.html",
    ],
    paths: ["features/**/*.feature"],
    tags: process.env.TAGS || "",
  }
};
```

### Running BDD Tests

```bash
# Run all features
npx cucumber-js

# Run with specific tags
npx cucumber-js --tags @smoke
npx cucumber-js --tags "@regression and not @slow"

# Run with custom environment
ENV=qa npx cucumber-js --tags @smoke
```

---

## 8.6 Playwright Test Sharding (Distributed Execution)

```bash
# Split tests into 4 shards (run on 4 machines/containers)
npx playwright test --shard=1/4  # Machine 1
npx playwright test --shard=2/4  # Machine 2
npx playwright test --shard=3/4  # Machine 3
npx playwright test --shard=4/4  # Machine 4

# Merge reports from all shards
npx playwright merge-reports --reporter html ./all-blob-reports
```

In CI (GitHub Actions matrix):
```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]

steps:
  - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

---

## 8.7 Performance Testing with Playwright

```typescript
// tests/performance/page-load.spec.ts
import { test, expect } from "@playwright/test";

test("homepage loads within 3 seconds", async ({ page }) => {
  const startTime = Date.now();

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const loadTime = Date.now() - startTime;
  console.log(`Page load time: ${loadTime}ms`);

  expect(loadTime).toBeLessThan(3000);
});

test("Core Web Vitals – LCP check", async ({ page }) => {
  await page.goto("/");

  const lcp = await page.evaluate(() => {
    return new Promise<number>(resolve => {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1].startTime);
      }).observe({ entryTypes: ["largest-contentful-paint"] });
    });
  });

  console.log(`LCP: ${lcp}ms`);
  expect(lcp).toBeLessThan(2500); // Google's "Good" threshold
});

test("API response time is acceptable", async ({ request }) => {
  const start = Date.now();
  const response = await request.get("https://api.myapp.com/users");
  const duration = Date.now() - start;

  expect(response.status()).toBe(200);
  expect(duration).toBeLessThan(1000); // API should respond within 1s
  console.log(`API response time: ${duration}ms`);
});
```

---

## 8.8 Accessibility Testing

```bash
npm install --save-dev @axe-core/playwright
```

```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("login page has no WCAG violations", async ({ page }) => {
    await page.goto("/login");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test("dashboard has no critical violations", async ({ page }) => {
    await page.goto("/dashboard");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .exclude(".third-party-widget")  // Exclude known issues
      .analyze();

    const criticalViolations = results.violations.filter(
      v => v.impact === "critical"
    );
    expect(criticalViolations).toHaveLength(0);
  });
});
```

---

## 8.9 Key CI/CD Commands Reference

```bash
# ── Local Development ──────────────────────────────────────────
npx playwright test                      # Run all tests
npx playwright test --ui                 # Interactive UI mode
npx playwright test --debug              # Step-through debugger
npx playwright codegen https://app.com   # Record tests
npx playwright show-report               # View HTML report

# ── Environment-specific ──────────────────────────────────────
ENV=dev npx playwright test
ENV=qa npx playwright test --project=chromium
ENV=staging npx playwright test --grep @smoke

# ── CI Optimized ─────────────────────────────────────────────
npx playwright test --shard=1/4
npx playwright merge-reports --reporter html ./blob-reports

# ── Docker ────────────────────────────────────────────────────
docker build -t pw-tests .
docker run --rm -e ENV=qa pw-tests

# ── Reports ───────────────────────────────────────────────────
npx allure generate allure-results --clean
npx allure serve allure-results
```

---

## ✅ Final Checklist: Job-Ready Playwright Engineer

| Area | Skills |
|------|--------|
| **TypeScript** | Types, interfaces, async/await, generics |
| **Framework** | POM, fixtures, global setup |
| **Locators** | Role, label, testId, CSS as last resort |
| **Assertions** | Auto-retrying, soft assertions |
| **API Testing** | CRUD, auth, status codes |
| **Data-Driven** | JSON data, table-driven, random data |
| **Cross-Browser** | Chrome, Firefox, Safari, mobile |
| **Parallel** | Workers, sharding |
| **Network** | Intercept, mock, capture |
| **Visual** | Screenshot comparison |
| **Reporting** | HTML, Allure, Cucumber |
| **CI/CD** | GitHub Actions, Jenkins |
| **Docker** | Container-based test execution |
| **BDD** | Cucumber, Gherkin, step definitions |
| **Accessibility** | axe-core integration |
| **Best Practices** | Naming, tags, no magic numbers |

---

*🎉 Congratulations! You are now equipped to build and maintain industry-standard Playwright + TypeScript automation frameworks.*
