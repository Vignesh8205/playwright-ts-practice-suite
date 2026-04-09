# 🏗️ Section 5: Industry-Standard Framework Implementation

> **Goal:** Build a production-ready, scalable Playwright + TypeScript automation framework from scratch.

---

## 5.1 Complete Folder Structure

```
playwright-framework/
│
├── 📁 tests/
│   ├── 📁 auth/
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── 📁 dashboard/
│   │   └── dashboard.spec.ts
│   ├── 📁 api/
│   │   └── users-api.spec.ts
│   └── 📁 e2e/
│       └── purchase-flow.spec.ts
│
├── 📁 pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── index.ts
│
├── 📁 fixtures/
│   └── index.ts
│
├── 📁 utils/
│   ├── logger.ts
│   ├── apiHelper.ts
│   └── randomDataHelper.ts
│
├── 📁 config/
│   └── envConfig.ts
│
├── 📁 test-data/
│   └── users.json
│
├── 📁 .github/workflows/
│   └── playwright.yml
│
├── .env.dev
├── .env.qa
├── .env.prod
├── playwright.config.ts
├── global-setup.ts
├── tsconfig.json
└── package.json
```

---

## 5.2 package.json

```json
{
  "name": "playwright-framework",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test",
    "test:dev": "cross-env ENV=dev playwright test",
    "test:qa": "cross-env ENV=qa playwright test",
    "test:prod": "cross-env ENV=prod playwright test",
    "test:chrome": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report",
    "codegen": "playwright codegen"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@types/node": "^20.12.0",
    "typescript": "^5.4.5",
    "cross-env": "^7.0.3",
    "dotenv": "^16.4.5"
  }
}
```

---

## 5.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["pages/*"],
      "@utils/*": ["utils/*"],
      "@fixtures/*": ["fixtures/*"],
      "@config/*": ["config/*"],
      "@test-data/*": ["test-data/*"]
    },
    "outDir": "./dist",
    "skipLibCheck": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 5.4 playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const env = process.env.ENV || "qa";
dotenv.config({ path: `.env.${env}` });

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 2 : 0,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  globalSetup: "./global-setup.ts",

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  use: {
    baseURL: process.env.BASE_URL || "https://qa.myapp.com",
    headless: process.env.HEADLESS !== "false",
    storageState: "auth.json",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },

  projects: [
    { name: "setup", testMatch: "**/global-setup.spec.ts" },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    {
      name: "api",
      use: { baseURL: process.env.API_URL },
      testMatch: "**/api/**/*.spec.ts",
    },
  ],

  outputDir: "test-results/",
});
```

---

## 5.5 Environment Config

```typescript
// config/envConfig.ts
import * as dotenv from "dotenv";
import * as path from "path";

type Env = "dev" | "qa" | "staging" | "prod";
const currentEnv = (process.env.ENV || "qa") as Env;
dotenv.config({ path: path.resolve(process.cwd(), `.env.${currentEnv}`) });

export interface AppConfig {
  env: Env;
  baseUrl: string;
  apiUrl: string;
  adminUser: { username: string; password: string };
  timeout: number;
  headless: boolean;
}

export const config: AppConfig = {
  env: currentEnv,
  baseUrl: process.env.BASE_URL!,
  apiUrl: process.env.API_URL!,
  adminUser: {
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
  },
  timeout: parseInt(process.env.TIMEOUT || "30000"),
  headless: process.env.HEADLESS !== "false",
};

// Validate required env vars
const required = ["BASE_URL", "API_URL", "ADMIN_USERNAME", "ADMIN_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}
```

---

## 5.6 Logger Utility

```typescript
// utils/logger.ts
import * as fs from "fs";
import * as path from "path";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "PASS" | "FAIL";

class Logger {
  private logFile: string;

  constructor() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    this.logFile = path.join(logDir, `test-run-${timestamp}.log`);
  }

  private write(level: LogLevel, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : "";
    const formatted = `[${timestamp}] [${level}] ${prefix} ${message}`;
    const colors: Record<LogLevel, string> = {
      INFO: "\x1b[36m", WARN: "\x1b[33m", ERROR: "\x1b[31m",
      DEBUG: "\x1b[35m", PASS: "\x1b[32m", FAIL: "\x1b[31m",
    };
    console.log(`${colors[level]}${formatted}\x1b[0m`);
    fs.appendFileSync(this.logFile, formatted + "\n");
  }

  info(msg: string, ctx?: string): void  { this.write("INFO", msg, ctx); }
  warn(msg: string, ctx?: string): void  { this.write("WARN", msg, ctx); }
  error(msg: string, ctx?: string): void { this.write("ERROR", msg, ctx); }
  debug(msg: string, ctx?: string): void { this.write("DEBUG", msg, ctx); }
  pass(msg: string, ctx?: string): void  { this.write("PASS", msg, ctx); }
  fail(msg: string, ctx?: string): void  { this.write("FAIL", msg, ctx); }

  step(name: string): void {
    console.log(`\n${"─".repeat(60)}\n  📌 STEP: ${name}\n${"─".repeat(60)}`);
  }
}

export const logger = new Logger();
```

---

## 5.7 API Helper

```typescript
// utils/apiHelper.ts
import { APIRequestContext, expect } from "@playwright/test";
import { logger } from "./logger";

export class ApiHelper {
  constructor(
    private request: APIRequestContext,
    private baseUrl: string,
    private token?: string
  ) {}

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    logger.info(`GET ${this.baseUrl}${endpoint}`, "API");
    const res = await this.request.get(`${this.baseUrl}${endpoint}`, { headers: this.headers });
    expect(res.ok()).toBeTruthy();
    return res.json() as Promise<T>;
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    logger.info(`POST ${this.baseUrl}${endpoint}`, "API");
    const res = await this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: this.headers, data,
    });
    expect(res.ok()).toBeTruthy();
    return res.json() as Promise<T>;
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    logger.info(`PUT ${this.baseUrl}${endpoint}`, "API");
    const res = await this.request.put(`${this.baseUrl}${endpoint}`, {
      headers: this.headers, data,
    });
    expect(res.ok()).toBeTruthy();
    return res.json() as Promise<T>;
  }

  async delete(endpoint: string): Promise<void> {
    logger.info(`DELETE ${this.baseUrl}${endpoint}`, "API");
    const res = await this.request.delete(`${this.baseUrl}${endpoint}`, { headers: this.headers });
    expect(res.ok()).toBeTruthy();
  }
}
```

---

## 5.8 Random Data Helper

```typescript
// utils/randomDataHelper.ts
export class RandomData {
  static string(len = 8): string {
    return Array.from({ length: len }, () =>
      "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
    ).join("");
  }

  static email(): string {
    return `test_${this.string(6)}_${Date.now()}@automation.com`;
  }

  static number(min = 1, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static name(): string {
    const first = ["Alice", "Bob", "Carol", "David", "Eve"];
    const last = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
    return `${first[this.number(0, 4)]} ${last[this.number(0, 4)]}`;
  }

  static password(): string {
    return `Test@${this.number(1000, 9999)}!`;
  }

  static fromArray<T>(arr: T[]): T {
    return arr[this.number(0, arr.length - 1)];
  }
}
```

---

## 5.9 Fixtures

```typescript
// fixtures/index.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ApiHelper } from "../utils/apiHelper";
import { config } from "../config/envConfig";

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  apiHelper: ApiHelper;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  apiHelper: async ({ request }, use) => {
    const res = await request.post(`${config.apiUrl}/auth/login`, {
      data: { username: config.adminUser.username, password: config.adminUser.password },
    });
    const { token } = await res.json();
    await use(new ApiHelper(request, config.apiUrl, token));
  },
});

export { expect } from "@playwright/test";
```

---

## 5.10 Global Setup

```typescript
// global-setup.ts
import { chromium, FullConfig } from "@playwright/test";
import { config } from "./config/envConfig";
import { logger } from "./utils/logger";

async function globalSetup(_config: FullConfig): Promise<void> {
  logger.step("Global Setup – Authenticating Admin User");
  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({ baseURL: config.baseUrl, ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    await page.goto("/login");
    await page.getByLabel("Username").fill(config.adminUser.username);
    await page.getByLabel("Password").fill(config.adminUser.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard", { timeout: 30_000 });
    await context.storageState({ path: "auth.json" });
    logger.pass("Auth successful – session saved to auth.json");
  } catch (err) {
    logger.error(`Auth failed: ${err}`, "GlobalSetup");
    throw err;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
```

---

## 5.11 Sample .env Files

```bash
# .env.qa
BASE_URL=https://qa.myapp.com
API_URL=https://qa-api.myapp.com/api
ADMIN_USERNAME=admin@qa.com
ADMIN_PASSWORD=QaPass@1
GUEST_USERNAME=guest@qa.com
GUEST_PASSWORD=GuestPass@1
HEADLESS=true
TIMEOUT=30000
```

```bash
# .env.dev
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000/api
ADMIN_USERNAME=admin@dev.com
ADMIN_PASSWORD=DevPass@1
HEADLESS=false
TIMEOUT=60000
```

---

## ✅ Framework Checklist

| Component | Purpose |
|-----------|---------|
| `playwright.config.ts` | Multi-env, multi-browser config |
| `config/envConfig.ts` | Validated env variables |
| `global-setup.ts` | Auth once, reuse everywhere |
| `pages/BasePage.ts` | Shared page methods |
| `pages/LoginPage.ts` | Full POM implementation |
| `fixtures/index.ts` | Dependency injection |
| `utils/logger.ts` | Colored console + file logging |
| `utils/apiHelper.ts` | Typed API wrapper |
| `utils/randomDataHelper.ts` | Test data generation |
| `test-data/*.json` | Static test data |
| `.env.*` files | Per-environment config |

> 🔜 **Next:** [Section 6 – Real-Time Examples](./06-real-time-examples.md)
