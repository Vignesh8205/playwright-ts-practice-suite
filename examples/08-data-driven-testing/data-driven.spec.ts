/**
 * EXAMPLES: 08 – Data-Driven Testing
 *
 * Demonstrates multiple approaches to data-driven tests:
 *  1. Inline test data table
 *  2. External JSON data file
 *  3. Dynamic/generated data
 *  4. Parameterized test.describe
 *  5. CSV-style data
 *
 * Run: npx playwright test examples/08-data-driven-testing/
 */

import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

// ════════════════════════════════════════════════════════════════
// 1. INLINE DATA TABLE — Simplest approach
// ════════════════════════════════════════════════════════════════

type Scenario = {
  id: string;
  description: string;
  url: string;
  expectedTitle: string;
};

const navigationScenarios: Scenario[] = [
  {
    id: "TC001",
    description: "Playwright homepage",
    url: "https://playwright.dev/",
    expectedTitle: "Playwright",
  },
  {
    id: "TC002",
    description: "JSONPlaceholder API",
    url: "https://jsonplaceholder.typicode.com/",
    expectedTitle: "JSON",
  },
  {
    id: "TC003",
    description: "DemoQA homepage",
    url: "https://demoqa.com/",
    expectedTitle: "DEMOQA",
  },
];

for (const scenario of navigationScenarios) {
  test(`${scenario.id} – ${scenario.description}`, async ({ page }) => {
    await page.goto(scenario.url);
    await expect(page).toHaveTitle(new RegExp(scenario.expectedTitle, "i"));
    console.log(`✅ ${scenario.id}: "${await page.title()}" at ${page.url()}`);
  });
}

// ════════════════════════════════════════════════════════════════
// 2. PARAMETERIZED FORM DATA
// ════════════════════════════════════════════════════════════════

type FormData = {
  name: string;
  email: string;
  currentAddress: string;
  expectedInOutput: string;
};

const formDataSet: FormData[] = [
  {
    name: "Alice Johnson",
    email: "alice@test.com",
    currentAddress: "100 QA Street",
    expectedInOutput: "Alice Johnson",
  },
  {
    name: "Bob Smith",
    email: "bob@automation.com",
    currentAddress: "200 Dev Avenue",
    expectedInOutput: "Bob Smith",
  },
  {
    name: "Carol White",
    email: "carol@example.com",
    currentAddress: "300 Test Blvd",
    expectedInOutput: "Carol White",
  },
];

for (const data of formDataSet) {
  test(`Form submission – ${data.name}`, async ({ page }) => {
    await page.goto("https://demoqa.com/text-box");

    await page.getByPlaceholder("Full Name").fill(data.name);
    await page.locator("#userEmail").fill(data.email);
    await page.locator("#currentAddress").fill(data.currentAddress);
    await page.locator("#submit").click();

    const output = page.locator("#output");
    await expect(output).toBeVisible({ timeout: 10_000 });
    await expect(output).toContainText(data.expectedInOutput);

    console.log(`✅ Form submitted for ${data.name}`);
  });
}

// ════════════════════════════════════════════════════════════════
// 3. EXTERNAL JSON FILE
// ════════════════════════════════════════════════════════════════

// Load test data from JSON file
const testDataPath = path.join(__dirname, "test-data.json");

interface PostTestData {
  id: number;
  title: string;
  shouldExist: boolean;
}

// Only run if test data file exists
if (fs.existsSync(testDataPath)) {
  const postsData: PostTestData[] = JSON.parse(fs.readFileSync(testDataPath, "utf-8"));

  for (const data of postsData) {
    test(`API – Validate post ${data.id}: "${data.title}"`, async ({ request }) => {
      const response = await request.get(
        `https://jsonplaceholder.typicode.com/posts/${data.id}`
      );

      if (data.shouldExist) {
        expect(response.status()).toBe(200);
        const post = await response.json();
        expect(post.id).toBe(data.id);
      } else {
        expect(response.status()).toBe(404);
      }

      console.log(`✅ Post ${data.id} validation: shouldExist=${data.shouldExist}`);
    });
  }
}

// ════════════════════════════════════════════════════════════════
// 4. DYNAMIC / GENERATED DATA
// ════════════════════════════════════════════════════════════════

// Random data generator
function randomEmail(): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `test_${rand}_${timestamp}@automation.com`;
}

function randomName(): string {
  const firstNames = ["Alice", "Bob", "Carol", "David", "Eve", "Frank"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Davis"];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

test("Dynamic data – unique email per run", async ({ page }) => {
  const name = randomName();
  const email = randomEmail();

  console.log("Generated test data:", { name, email });

  await page.goto("https://demoqa.com/text-box");
  await page.getByPlaceholder("Full Name").fill(name);
  await page.locator("#userEmail").fill(email);
  await page.locator("#currentAddress").fill("Auto-generated address");
  await page.locator("#submit").click();

  const output = page.locator("#output");
  await expect(output).toBeVisible({ timeout: 10_000 });
  await expect(output).toContainText(name);

  console.log(`✅ Dynamic form test passed for: ${name} <${email}>`);
});

// ════════════════════════════════════════════════════════════════
// 5. BOUNDARY VALUE TESTING
// ════════════════════════════════════════════════════════════════

type BoundaryTest = {
  value: number;
  description: string;
  expected: "valid" | "invalid";
};

const ageTests: BoundaryTest[] = [
  { value: -1, description: "below minimum", expected: "invalid" },
  { value: 0, description: "minimum boundary", expected: "invalid" },
  { value: 1, description: "just above minimum", expected: "valid" },
  { value: 18, description: "legal age", expected: "valid" },
  { value: 100, description: "maximum valid age", expected: "valid" },
  { value: 101, description: "exceeds maximum", expected: "invalid" },
  { value: 999, description: "far above maximum", expected: "invalid" },
];

for (const tc of ageTests) {
  test(`Boundary – Age ${tc.value} (${tc.description})`, async () => {
    // Pure TypeScript validation (no browser needed)
    function validateAge(age: number): boolean {
      return age >= 1 && age <= 100;
    }

    const result = validateAge(tc.value);
    expect(result).toBe(tc.expected === "valid");
    console.log(`✅ Age ${tc.value}: ${result ? "valid" : "invalid"} (expected: ${tc.expected})`);
  });
}

// ════════════════════════════════════════════════════════════════
// 6. test.describe FOR GROUPING DATA-DRIVEN SUITES
// ════════════════════════════════════════════════════════════════

const browserEndpoints = [
  { name: "chromium", url: "https://playwright.dev/docs/browsers" },
  { name: "firefox", url: "https://playwright.dev/docs/browsers" },
];

for (const browser of browserEndpoints) {
  test.describe(`Browser docs – ${browser.name}`, () => {
    test("docs page loads", async ({ page }) => {
      await page.goto(browser.url);
      await expect(page).toHaveURL(/browsers/);
      console.log(`✅ Loaded docs for ${browser.name}`);
    });
  });
}

// ════════════════════════════════════════════════════════════════
// 7. ENVIRONMENT-BASED DATA
// ════════════════════════════════════════════════════════════════

const ENV = process.env.ENV || "qa";

const envUrls: Record<string, string> = {
  dev: "http://localhost:3000",
  qa: "https://playwright.dev",
  prod: "https://playwright.dev",
};

test("Environment-based URL test", async ({ page }) => {
  const targetUrl = envUrls[ENV] || envUrls["qa"];
  console.log(`Running on ENV=${ENV}, URL=${targetUrl}`);

  await page.goto(targetUrl);
  await expect(page).toHaveTitle(/.+/); // Any title
  console.log(`✅ Environment test passed on [${ENV.toUpperCase()}]: ${page.url()}`);
});
