# 🎭 Playwright + TypeScript — Beginner to Industry-Level

> A complete, hands-on learning project: **9 practical example suites** + a **fully implemented industry-standard framework**.

---

## 📁 Project Structure

```
playwright-ts-practice-suite/
│
├── 📁 examples/                        ← Standalone, runnable examples
│   ├── 01-typescript-basics/           ← TypeScript language features
│   ├── 02-playwright-basics/           ← Navigation, title, URL
│   ├── 03-locators/                    ← All locator strategies
│   ├── 04-actions/                     ← Click, fill, keyboard, scroll
│   ├── 05-assertions/                  ← All assertion types
│   ├── 06-handling-elements/           ← Alerts, iFrames, popups, mocks
│   ├── 07-api-testing/                 ← REST API: GET/POST/PUT/DELETE
│   ├── 08-data-driven-testing/         ← Inline, JSON, dynamic data
│   └── 09-e2e-scenarios/               ← Multi-step E2E flows
│
├── 📁 framework/                       ← Industry-standard framework
│   ├── 📁 tests/
│   │   ├── elements/                   ← UI element tests (textbox, radio, checkbox)
│   │   ├── api/                        ← API-only tests
│   │   └── e2e/                        ← End-to-end scenarios
│   ├── 📁 pages/                       ← Page Object Models (POM)
│   │   ├── BasePage.ts                 ← Abstract base with shared utilities
│   │   ├── TextBoxPage.ts              ← Form interaction POM
│   │   ├── CheckBoxPage.ts             ← Checkbox tree POM
│   │   ├── RadioButtonPage.ts          ← Radio button POM
│   │   └── index.ts                    ← Barrel exports
│   ├── 📁 fixtures/
│   │   └── index.ts                    ← Custom test fixtures (DI)
│   ├── 📁 utils/
│   │   ├── logger.ts                   ← Colored console + file logger
│   │   ├── apiHelper.ts                ← Typed HTTP request wrapper
│   │   ├── randomDataHelper.ts         ← Unique test data generator
│   │   └── index.ts                    ← Barrel exports
│   ├── 📁 config/
│   │   └── envConfig.ts                ← Multi-environment config loader
│   ├── 📁 test-data/
│   │   ├── users.json                  ← Static user test data
│   │   └── posts.json                  ← API post test data
│   ├── 📁 reports/                     ← Auto-generated (gitignored)
│   ├── global-setup.ts                 ← One-time auth setup
│   └── playwright.config.ts            ← Framework Playwright config
│
├── 📁 docs/                            ← Theory documentation (Sections 1–8)
├── 📁 .github/workflows/
│   └── playwright.yml                  ← Full CI/CD pipeline
│
├── .env.qa                             ← QA environment (default)
├── .env.dev                            ← Dev environment
├── .env.prod                           ← Prod environment
├── playwright.config.ts                ← Root config (for examples)
├── tsconfig.json
└── package.json
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Install Playwright browsers
```bash
npx playwright install
```

### 3. Run all examples
```bash
npm test
```

### 4. Run the full framework
```bash
npm run test:framework
```

---

## 📚 Running Examples

Each example is self-contained and uses **public demo sites** — no login required.

```bash
# Run all examples
npx playwright test examples/ --project=chromium

# Run specific example folder
npm run test:ex:ts          # TypeScript basics
npm run test:ex:basics      # Playwright basics
npm run test:ex:locators    # Locators
npm run test:ex:actions     # Actions
npm run test:ex:assertions  # Assertions
npm run test:ex:elements    # Handling elements
npm run test:ex:api         # API testing
npm run test:ex:data        # Data-driven
npm run test:ex:e2e         # E2E scenarios

# Run headed (see the browser)
npx playwright test examples/ --headed --project=chromium

# Debug mode (step through)
npx playwright test examples/02-playwright-basics/ --debug

# UI mode (interactive)
npx playwright test --ui
```

### Example Sites Used
| Example | Site | Why |
|---------|------|-----|
| 02–06 | [demoqa.com](https://demoqa.com) | Rich form controls, alerts, iFrames |
| 07 | [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) | Free REST API |
| 01–06 | [playwright.dev](https://playwright.dev) | Stable public site |

---

## ⚙️ Running the Framework

The framework is a production-ready setup pointing at **demoqa.com** (no login needed out of the box).

```bash
# Default (QA environment, Chromium)
npm run test:framework

# Specific environment
npm run test:framework:qa
npm run test:framework:dev

# Smoke tests only (fast gate)
npm run test:framework:smoke

# Headed mode
npm run test:framework:headed

# Specific test file
npx playwright test framework/tests/elements/textbox.spec.ts \
  --config=framework/playwright.config.ts

# API tests only
npx playwright test framework/tests/api/ \
  --config=framework/playwright.config.ts \
  --project=api

# By tag
npx playwright test framework/tests/ \
  --config=framework/playwright.config.ts \
  --grep @smoke

npx playwright test framework/tests/ \
  --config=framework/playwright.config.ts \
  --grep @regression

# Cross-browser
npx playwright test framework/tests/ \
  --config=framework/playwright.config.ts \
  --project=chromium --project=firefox --project=webkit

# View HTML report
npm run report:framework
```

---

## 🌍 Environment Configuration

Create/edit `.env.<environment>` files:

```bash
# Switch environments
ENV=dev  npm run test:framework    # Development
ENV=qa   npm run test:framework    # QA (default)
ENV=prod npm run test:framework    # Production
```

Environment files:
- `.env.qa` — QA (default, committed as reference)
- `.env.dev` — Local development
- `.env.prod` — Production (read-only tests only!)

---

## 🏗️ Framework Architecture

### Key Patterns

| Pattern | File | Purpose |
|---------|------|---------|
| **Page Object Model** | `framework/pages/*.ts` | Encapsulate page interactions |
| **Fixtures** | `framework/fixtures/index.ts` | Dependency injection for pages |
| **Global Setup** | `framework/global-setup.ts` | One-time auth before all tests |
| **Env Config** | `framework/config/envConfig.ts` | Multi-environment support |
| **Logger** | `framework/utils/logger.ts` | Structured logging + file output |
| **ApiHelper** | `framework/utils/apiHelper.ts` | Typed HTTP requests |
| **RandomData** | `framework/utils/randomDataHelper.ts` | Unique data per test run |

### How Tests Are Tagged

```bash
@smoke      # Core, must-pass tests (run in < 5 min)
@regression # Full test suite
@e2e        # Multi-step end-to-end scenarios
@api        # API-only tests
@elements   # UI element tests
```

### Adding a New Test

1. **Create a Page Object** in `framework/pages/MyPage.ts`
2. **Add it to** `framework/pages/index.ts`
3. **Register fixture** in `framework/fixtures/index.ts`
4. **Write test** in `framework/tests/<category>/my-test.spec.ts`
5. **Import from fixtures**: `import { test, expect } from "../../fixtures"`

---

## 📊 Reports

| Report | Command | Location |
|--------|---------|----------|
| HTML Report | `npm run report` | `playwright-report/` |
| Framework HTML | `npm run report:framework` | `framework/reports/html/` |
| JSON Results | auto-generated | `framework/reports/json/results.json` |
| Test Logs | auto-generated | `framework/reports/logs/` |

---

## 🔄 CI/CD (GitHub Actions)

The workflow in `.github/workflows/playwright.yml` runs:

1. **Smoke Tests** — Fast gate on every push (Chromium only)
2. **Example Tests** — Verifies all 4 stable example folders
3. **Regression Tests** — Full suite, 2 browsers × 2 shards (parallel)
4. **API Tests** — API-only project
5. **Merge & Publish** — Merged HTML report as artifact

### Setup Required Secrets
```
QA_BASE_URL        → https://your-qa-app.com
QA_API_URL         → https://your-qa-api.com
QA_ADMIN_USERNAME  → admin@qa.yourapp.com
QA_ADMIN_PASSWORD  → YourPassword@1
```

---

## 📖 Documentation

Full theory guides are in the `docs/` folder:

| # | Section | Topics |
|---|---------|--------|
| 1 | [TypeScript Basics](./docs/01-typescript-basics.md) | Types, interfaces, classes, async/await |
| 2 | [Playwright Intro](./docs/02-playwright-introduction.md) | Setup, config, first test, run modes |
| 3 | [Core Concepts](./docs/03-core-concepts.md) | Locators, actions, assertions, waits |
| 4 | [Advanced Concepts](./docs/04-advanced-concepts.md) | POM, fixtures, parallel, cross-browser |
| 5 | [Industry Framework](./docs/05-industry-framework.md) | Full framework implementation |
| 6 | [Real-Time Examples](./docs/06-real-time-examples.md) | Login, API, E2E, data-driven |
| 7 | [Best Practices](./docs/07-best-practices.md) | Naming, selectors, clean code |
| 8 | [Bonus: CI/CD & BDD](./docs/08-bonus-advanced.md) | GitHub Actions, Docker, Cucumber |

---

## 🛠️ Useful Commands Reference

```bash
# ── Development ──────────────────────────────────────────────
npx playwright test --ui                   # Interactive test runner
npx playwright test --debug                # Step-through debugger
npx playwright codegen https://demoqa.com  # Record tests visually
npx playwright show-report                 # Open HTML report

# ── Filtering ────────────────────────────────────────────────
npx playwright test --grep @smoke          # By tag
npx playwright test --grep-invert @slow   # Exclude tag
npx playwright test -k "login"            # By test name keyword

# ── Browsers ─────────────────────────────────────────────────
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# ── Parallel ─────────────────────────────────────────────────
npx playwright test --workers=4
npx playwright test --shard=1/3           # Distributed sharding
```

---

*Happy Testing! 🎭 Built with Playwright v1.44 + TypeScript v5.4*
