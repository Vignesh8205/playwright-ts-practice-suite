# 🧪 Section 6: Real-Time Examples

> **Goal:** Apply everything learned to real-world automation scenarios.

---

## 6.1 Login Tests (Valid & Invalid)

```typescript
// tests/auth/login.spec.ts
import { test, expect } from "../../fixtures";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import users from "../../test-data/users.json";

test.describe("Login Feature", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  // ── Positive Tests ─────────────────────────────────────────
  test("TC001 – valid admin login redirects to dashboard", async () => {
    await loginPage.login(users.admin.email, users.admin.password);
    await dashboardPage.expectDashboardLoaded();
    await expect(dashboardPage.page).toHaveURL(/dashboard/);
  });

  test("TC002 – valid login with Remember Me persists session", async ({ page }) => {
    await loginPage.loginWithRememberMe(users.admin.email, users.admin.password);
    await dashboardPage.expectDashboardLoaded();

    // Simulate browser restart by clearing storage manually
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === "session_id");
    expect(sessionCookie?.expires).toBeGreaterThan(-1); // Persistent cookie
  });

  // ── Negative Tests ─────────────────────────────────────────
  test("TC003 – wrong password shows error message", async () => {
    await loginPage.login(users.admin.email, "WrongPass@999");
    await loginPage.expectErrorMessage("Invalid username or password");
    await expect(loginPage.page).toHaveURL(/login/); // Stays on login page
  });

  test("TC004 – non-existent user shows error", async () => {
    await loginPage.login("ghost@nowhere.com", "AnyPass@1");
    await loginPage.expectErrorMessage("Invalid username or password");
  });

  test("TC005 – empty username shows validation", async () => {
    await loginPage.fillPassword("anypassword");
    await loginPage.clickLoginButton();
    await loginPage.expectErrorMessage("Username is required");
  });

  test("TC006 – empty password shows validation", async () => {
    await loginPage.fillUsername("user@test.com");
    await loginPage.clickLoginButton();
    await loginPage.expectErrorMessage("Password is required");
  });

  test("TC007 – blank form shows both validations", async () => {
    await loginPage.clickLoginButton();
    // Soft assertions to collect all failures
    await expect.soft(loginPage.page.locator("#username-error")).toContainText("required");
    await expect.soft(loginPage.page.locator("#password-error")).toContainText("required");
  });

  test("TC008 – SQL injection attempt is rejected", async () => {
    await loginPage.login("admin' OR '1'='1", "' OR '1'='1");
    await loginPage.expectErrorMessage("Invalid username or password");
  });
});
```

---

## 6.2 Test Data File

```json
// test-data/users.json
{
  "admin": {
    "email": "admin@qa.myapp.com",
    "password": "AdminPass@1",
    "role": "admin",
    "name": "Admin User"
  },
  "editor": {
    "email": "editor@qa.myapp.com",
    "password": "EditorPass@1",
    "role": "editor",
    "name": "Editor User"
  },
  "viewer": {
    "email": "viewer@qa.myapp.com",
    "password": "ViewerPass@1",
    "role": "viewer",
    "name": "Viewer User"
  },
  "locked": {
    "email": "locked@qa.myapp.com",
    "password": "LockedPass@1",
    "role": "user",
    "name": "Locked User"
  }
}
```

---

## 6.3 Form Submission Test

```typescript
// pages/RegistrationPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RegistrationPage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly phoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly genderMaleRadio: Locator;
  private readonly countrySelect: Locator;
  private readonly termsCheckbox: Locator;
  private readonly submitButton: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput    = page.getByLabel("First Name");
    this.lastNameInput     = page.getByLabel("Last Name");
    this.emailInput        = page.getByLabel("Email");
    this.phoneInput        = page.getByLabel("Phone");
    this.passwordInput     = page.getByLabel("Password", { exact: true });
    this.confirmPasswordInput = page.getByLabel("Confirm Password");
    this.genderMaleRadio   = page.getByLabel("Male");
    this.countrySelect     = page.getByLabel("Country");
    this.termsCheckbox     = page.getByLabel("I agree to Terms");
    this.submitButton      = page.getByRole("button", { name: "Register" });
    this.successMessage    = page.locator("[data-testid='success-message']");
  }

  async fillRegistrationForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    country: string;
  }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
    await this.genderMaleRadio.check();
    await this.countrySelect.selectOption({ label: data.country });
    await this.termsCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectRegistrationSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText("Account created successfully");
  }
}
```

```typescript
// tests/registration/registration.spec.ts
import { test } from "../../fixtures";
import { RegistrationPage } from "../../pages/RegistrationPage";
import { RandomData } from "../../utils/randomDataHelper";

test.describe("Registration Form", () => {
  test("TC010 – complete registration with valid data", async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await page.goto("/register");

    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: RandomData.email(),       // Unique email each run
      phone: "+14155552671",
      password: RandomData.password(),
      country: "United States",
    };

    await regPage.fillRegistrationForm(userData);
    await regPage.submit();
    await regPage.expectRegistrationSuccess();
  });
});
```

---

## 6.4 API Testing with Playwright

```typescript
// tests/api/users-api.spec.ts
import { test, expect } from "@playwright/test";
import { config } from "../../config/envConfig";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

test.describe("Users API", () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${config.apiUrl}/auth/login`, {
      data: { username: config.adminUser.username, password: config.adminUser.password },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    authToken = body.token;
  });

  test("GET /users – returns list of users", async ({ request }) => {
    const res = await request.get(`${config.apiUrl}/users`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status()).toBe(200);
    const users: User[] = await res.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("id");
    expect(users[0]).toHaveProperty("email");
  });

  test("GET /users/:id – returns specific user", async ({ request }) => {
    const res = await request.get(`${config.apiUrl}/users/1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status()).toBe(200);
    const user: User = await res.json();
    expect(user.id).toBe(1);
  });

  test("POST /users – creates a new user", async ({ request }) => {
    const newUser = {
      name: "Test User",
      email: `test_${Date.now()}@automation.com`,
      role: "viewer",
    };

    const res = await request.post(`${config.apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: newUser,
    });

    expect(res.status()).toBe(201);
    const created: User = await res.json();
    expect(created.email).toBe(newUser.email);
    expect(created.id).toBeDefined();
  });

  test("PUT /users/:id – updates user", async ({ request }) => {
    const res = await request.put(`${config.apiUrl}/users/1`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: "Updated Name" },
    });

    expect(res.status()).toBe(200);
    const updated: User = await res.json();
    expect(updated.name).toBe("Updated Name");
  });

  test("DELETE /users/:id – deletes user", async ({ request }) => {
    // First create
    const createRes = await request.post(`${config.apiUrl}/users`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: "To Delete", email: `delete_${Date.now()}@test.com`, role: "viewer" },
    });
    const { id } = await createRes.json();

    // Then delete
    const deleteRes = await request.delete(`${config.apiUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(deleteRes.status()).toBe(204);

    // Verify deleted
    const getRes = await request.get(`${config.apiUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(getRes.status()).toBe(404);
  });

  test("Unauthorized – 401 without token", async ({ request }) => {
    const res = await request.get(`${config.apiUrl}/users`);
    expect(res.status()).toBe(401);
  });
});
```

---

## 6.5 Data-Driven Testing

```typescript
// tests/login/login-data-driven.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

// ── Test data table ────────────────────────────────────────────
const loginScenarios = [
  {
    id: "TC001",
    description: "Valid admin login",
    username: "admin@myapp.com",
    password: "AdminPass@1",
    expectedUrl: "/dashboard",
    expectedError: null,
  },
  {
    id: "TC002",
    description: "Invalid password",
    username: "admin@myapp.com",
    password: "WrongPass",
    expectedUrl: null,
    expectedError: "Invalid username or password",
  },
  {
    id: "TC003",
    description: "Non-existent user",
    username: "ghost@nowhere.com",
    password: "AnyPass@1",
    expectedUrl: null,
    expectedError: "Invalid username or password",
  },
  {
    id: "TC004",
    description: "Empty credentials",
    username: "",
    password: "",
    expectedUrl: null,
    expectedError: "Username is required",
  },
];

// ── Data-driven test loop ──────────────────────────────────────
for (const scenario of loginScenarios) {
  test(`${scenario.id} – ${scenario.description}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    if (scenario.username) await loginPage.fillUsername(scenario.username);
    if (scenario.password) await loginPage.fillPassword(scenario.password);
    await loginPage.clickLoginButton();

    if (scenario.expectedUrl) {
      await expect(page).toHaveURL(new RegExp(scenario.expectedUrl));
    }

    if (scenario.expectedError) {
      await loginPage.expectErrorMessage(scenario.expectedError);
    }
  });
}
```

---

## 6.6 End-to-End Purchase Flow

```typescript
// tests/e2e/purchase-flow.spec.ts
import { test, expect } from "../../fixtures";
import { logger } from "../../utils/logger";

test.describe("E2E – Purchase Flow", () => {
  test.use({ storageState: "auth.json" });

  test("complete purchase: search → cart → checkout → confirmation", async ({ page }) => {

    // ── Step 1: Search for product ─────────────────────────────
    logger.step("1. Search for Product");
    await page.goto("/shop");
    await page.getByPlaceholder("Search products...").fill("Playwright Book");
    await page.keyboard.press("Enter");
    await expect(page.locator(".product-card")).toHaveCount(1);

    // ── Step 2: View product & add to cart ─────────────────────
    logger.step("2. Add Product to Cart");
    await page.locator(".product-card").click();
    await expect(page.locator("h1.product-title")).toContainText("Playwright Book");
    const price = await page.locator(".product-price").textContent();
    logger.info(`Product price: ${price}`);

    await page.locator("#quantity").fill("2");
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.locator(".cart-count")).toContainText("2");

    // ── Step 3: View cart ──────────────────────────────────────
    logger.step("3. Review Cart");
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.locator(".cart-item")).toHaveCount(1);
    await expect(page.locator(".cart-item-qty")).toHaveValue("2");

    // ── Step 4: Proceed to checkout ────────────────────────────
    logger.step("4. Checkout");
    await page.getByRole("button", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL(/checkout/);

    // Fill shipping
    await page.getByLabel("Full Name").fill("John Doe");
    await page.getByLabel("Address").fill("123 Test St");
    await page.getByLabel("City").fill("San Francisco");
    await page.getByLabel("ZIP").fill("94102");
    await page.getByLabel("Country").selectOption("US");

    // ── Step 5: Payment ────────────────────────────────────────
    logger.step("5. Enter Payment Details");
    const paymentFrame = page.frameLocator("iframe#payment-frame");
    await paymentFrame.getByLabel("Card Number").fill("4111111111111111");
    await paymentFrame.getByLabel("MM/YY").fill("12/26");
    await paymentFrame.getByLabel("CVC").fill("123");

    // ── Step 6: Place order ────────────────────────────────────
    logger.step("6. Place Order");
    await page.getByRole("button", { name: "Place Order" }).click();

    // ── Step 7: Confirm ────────────────────────────────────────
    logger.step("7. Verify Confirmation");
    await expect(page).toHaveURL(/order-confirmation/, { timeout: 30_000 });
    await expect(page.locator("h1")).toContainText("Order Confirmed!");
    const orderNumber = await page.locator(".order-number").textContent();
    logger.pass(`Order placed successfully: ${orderNumber}`);

    expect(orderNumber).toMatch(/ORD-\d{6}/);
  });
});
```

---

## 6.7 Visual Regression Testing

```typescript
// tests/visual/dashboard-visual.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression Tests", () => {
  test("login page matches snapshot", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("login-page.png", {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test("dashboard chart matches snapshot", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector(".chart-loaded");

    await expect(page.locator(".analytics-chart")).toHaveScreenshot("analytics-chart.png");
  });
});
```

> Run with: `npx playwright test --update-snapshots` to create baseline screenshots.

---

## ✅ Summary

| Example | Key Patterns Used |
|---------|------------------|
| Login Tests | POM, assertions, soft-assert, negative testing |
| Form Submission | POM, random data, await chains |
| API Tests | `request` fixture, status checks, CRUD |
| Data-Driven | `for...of` loop with test table |
| E2E Flow | Multi-step, logger, iframe, URL assertions |
| Visual | `toHaveScreenshot`, baseline snapshots |

> 🔜 **Next:** [Section 7 – Best Practices](./07-best-practices.md)
