# 🔬 Section 3: Core Playwright Concepts

> **Goal:** Master locators, actions, assertions, waits, and handling complex UI elements.

---

## 3.1 Locators

Playwright uses **smart locators** that automatically wait for elements and retry. This is fundamentally different from Selenium's `findElement`.

### 3.1.1 Recommended Locator Priority

Use in this order (most resilient → least resilient):

```
1. getByRole()        ← Best (accessibility-based)
2. getByLabel()       ← Forms
3. getByPlaceholder() ← Input fields
4. getByText()        ← Buttons, links
5. getByTestId()      ← data-testid attributes
6. locator()          ← CSS/XPath (last resort)
```

### 3.1.2 Role-Based Locators (Best Practice)

```typescript
// Buttons
const submitBtn = page.getByRole("button", { name: "Submit" });
const cancelBtn = page.getByRole("button", { name: /cancel/i }); // case-insensitive

// Links
const homeLink = page.getByRole("link", { name: "Home" });

// Headings
const heading = page.getByRole("heading", { name: "Dashboard", level: 1 });

// Form controls
const usernameInput = page.getByRole("textbox", { name: "Username" });
const rememberMe = page.getByRole("checkbox", { name: "Remember me" });
const country = page.getByRole("combobox", { name: "Country" });

// Lists and items
const menuItem = page.getByRole("menuitem", { name: "Settings" });
const row = page.getByRole("row", { name: "John Doe" });
```

### 3.1.3 Text-Based Locators

```typescript
// Exact text match
const exactBtn = page.getByText("Sign In");

// Case-insensitive partial match
const partialBtn = page.getByText(/sign in/i);

// Label (for form inputs)
const emailField = page.getByLabel("Email Address");

// Placeholder
const searchBox = page.getByPlaceholder("Search...");

// Test ID (data-testid attribute)
const loginForm = page.getByTestId("login-form");
// HTML: <form data-testid="login-form">
```

### 3.1.4 CSS Locators

```typescript
// By ID
const menu = page.locator("#main-menu");

// By class
const card = page.locator(".card.active");

// By attribute
const checkedBox = page.locator("input[checked]");
const input = page.locator("input[name='email']");
const type = page.locator("input[type='submit']");

// By combination
const activeTab = page.locator("nav > ul > li.active > a");

// Nth element
const firstRow = page.locator("table tr").nth(0);
const lastRow = page.locator("table tr").last();
const secondRow = page.locator("table tr").nth(1);

// Filter by text
const errorMsg = page.locator("div.message").filter({ hasText: "Error" });

// Filter by child
const card = page.locator(".card").filter({ has: page.locator(".badge.new") });
```

### 3.1.5 XPath Locators

```typescript
// Direct XPath
const header = page.locator("//h1[contains(text(),'Dashboard')]");

// Ancestor navigation
const parent = page.locator("//span[@class='label']/ancestor::div[@class='form-group']");

// Following sibling
const sibling = page.locator("//label[text()='Username']/following-sibling::input");

// Contains attribute
const link = page.locator("//a[contains(@href, '/dashboard')]");
```

### 3.1.6 Chaining Locators

```typescript
// Find inside an element
const form = page.locator("#login-form");
const usernameInForm = form.locator("input[name='username']");

// Get all matching elements
const allRows = page.locator("table tbody tr");
const count = await allRows.count();
for (let i = 0; i < count; i++) {
  const row = allRows.nth(i);
  const name = await row.locator("td:nth-child(1)").textContent();
  console.log(`Row ${i}: ${name}`);
}
```

---

## 3.2 Actions

### 3.2.1 Click Actions

```typescript
// Single click
await page.getByRole("button", { name: "Submit" }).click();

// Double click
await page.locator(".item").dblclick();

// Right click (context menu)
await page.locator(".file-icon").click({ button: "right" });

// Click with modifier keys
await page.locator(".checkbox").click({ modifiers: ["Shift"] });
await page.locator(".item").click({ modifiers: ["Control"] }); // Ctrl+Click

// Click specific position within element
await page.locator(".dragzone").click({ position: { x: 10, y: 20 } });

// Click with force (bypass interceptors)
await page.locator(".covered-element").click({ force: true });

// Hover
await page.locator("#menu-trigger").hover();
```

### 3.2.2 Typing & Input

```typescript
// Fill input (clears first, then types)
await page.getByLabel("Username").fill("admin@example.com");

// Type slowly (character by character with delay)
await page.getByLabel("Search").type("playwright", { delay: 100 });

// Clear input
await page.locator("#search").clear();

// Press keyboard keys
await page.keyboard.press("Enter");
await page.keyboard.press("Tab");
await page.keyboard.press("Escape");
await page.keyboard.press("Control+A"); // Select all

// Press key on specific element
await page.getByLabel("Email").press("Enter");

// Type then press
await page.getByPlaceholder("Search...").fill("test query");
await page.keyboard.press("Enter");
```

### 3.2.3 Select / Dropdowns

```typescript
// Select by value
await page.locator("#country").selectOption("US");

// Select by label text
await page.locator("#country").selectOption({ label: "United States" });

// Select by index
await page.locator("#country").selectOption({ index: 2 });

// Multi-select
await page.locator("#skills").selectOption(["javascript", "typescript", "playwright"]);

// Custom dropdown (not <select> element — click-based)
await page.locator("#custom-dropdown-trigger").click();
await page.getByRole("option", { name: "Option 2" }).click();
```

### 3.2.4 Checkboxes & Radio Buttons

```typescript
// Check a checkbox
await page.getByRole("checkbox", { name: "Remember me" }).check();

// Uncheck a checkbox
await page.getByRole("checkbox", { name: "Subscribe" }).uncheck();

// Check if checked
const isChecked = await page.getByRole("checkbox", { name: "Accept" }).isChecked();

// Radio button
await page.getByRole("radio", { name: "Male" }).check();
await page.getByLabel("Female").check();

// Assert checked state
await expect(page.getByRole("checkbox", { name: "I agree" })).toBeChecked();
```

### 3.2.5 File Upload

```typescript
// Single file upload
await page.locator("input[type='file']").setInputFiles("./test-data/resume.pdf");

// Multiple files
await page.locator("input[type='file']").setInputFiles([
  "./test-data/file1.pdf",
  "./test-data/file2.pdf"
]);

// Clear uploaded files
await page.locator("input[type='file']").setInputFiles([]);

// Drag and drop file upload
const fileChooserPromise = page.waitForEvent("filechooser");
await page.locator(".upload-zone").click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles("./test-data/document.pdf");
```

### 3.2.6 Drag and Drop

```typescript
// Method 1: Playwright native
await page.locator("#source").dragTo(page.locator("#target"));

// Method 2: With offset
await page.locator("#source").dragTo(page.locator("#target"), {
  sourcePosition: { x: 10, y: 10 },
  targetPosition: { x: 20, y: 20 }
});

// Method 3: Mouse events
await page.locator("#draggable").hover();
await page.mouse.down();
await page.locator("#droptarget").hover();
await page.mouse.up();
```

---

## 3.3 Assertions (`expect`)

Playwright's `expect` provides **auto-retrying assertions** — they poll until the condition is met or timeout.

### 3.3.1 Page Assertions

```typescript
// URL assertions
await expect(page).toHaveURL("https://app.com/dashboard");
await expect(page).toHaveURL(/dashboard/);
await expect(page).not.toHaveURL(/login/);

// Title assertions
await expect(page).toHaveTitle("Dashboard | MyApp");
await expect(page).toHaveTitle(/Dashboard/);
```

### 3.3.2 Element Assertions

```typescript
// Visibility
await expect(page.locator(".modal")).toBeVisible();
await expect(page.locator(".spinner")).not.toBeVisible();
await expect(page.locator(".hidden-item")).toBeHidden();

// Existence in DOM
await expect(page.locator(".notification")).toBeAttached();

// Text content
await expect(page.locator("h1")).toHaveText("Welcome Back!");
await expect(page.locator(".message")).toContainText("Success");
await expect(page.locator("h1")).toHaveText(/welcome/i);

// Attribute
await expect(page.locator("input#email")).toHaveAttribute("type", "email");
await expect(page.locator(".btn-submit")).toHaveAttribute("disabled");

// Value (input fields)
await expect(page.getByLabel("Username")).toHaveValue("admin");
await expect(page.locator("#search")).toHaveValue(/test/);

// Count
await expect(page.locator("li.item")).toHaveCount(5);

// Class
await expect(page.locator(".btn")).toHaveClass(/active/);
await expect(page.locator(".item")).not.toHaveClass("disabled");

// CSS property
await expect(page.locator(".element")).toHaveCSS("background-color", "rgb(255, 0, 0)");

// Enabled/Disabled
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
await expect(page.getByRole("button", { name: "Loading" })).toBeDisabled();

// Checked state
await expect(page.getByRole("checkbox", { name: "Accept" })).toBeChecked();
await expect(page.getByRole("checkbox", { name: "Consent" })).not.toBeChecked();

// Focused
await expect(page.getByLabel("Email")).toBeFocused();

// Empty value
await expect(page.locator("input#search")).toBeEmpty();

// Screenshot comparison (Visual Testing)
await expect(page).toHaveScreenshot("dashboard.png");
await expect(page.locator(".chart")).toHaveScreenshot("chart.png", { maxDiffPixels: 100 });
```

### 3.3.3 Soft Assertions

Soft assertions do NOT stop the test on failure — they collect all failures and report at the end.

```typescript
test("form validation", async ({ page }) => {
  await page.goto("/registration");

  // These won't stop the test
  await expect.soft(page.locator("#name-error")).toBeHidden();
  await expect.soft(page.locator("#email-error")).toContainText("required");
  await expect.soft(page.locator("#phone-error")).toBeVisible();

  // Regular assertion (stops test here if fails)
  await expect(page.locator(".form-status")).toContainText("Please fix errors");
});
```

---

## 3.4 Waits & Timeouts

### 3.4.1 Auto-Wait (Built-in)

Playwright **automatically waits** for elements before performing actions. No need for explicit waits in most cases!

```typescript
// These automatically wait for element to be visible + stable:
await page.locator("#submit").click();      // waits for element
await page.locator("#username").fill("x");  // waits for element
await expect(page.locator(".msg")).toBeVisible(); // retries assertion
```

### 3.4.2 Explicit Waits

Use these when auto-wait isn't enough:

```typescript
// Wait for a network request to complete
await page.waitForResponse("**/api/login");
await page.waitForResponse(res => res.url().includes("/api/data") && res.status() === 200);

// Wait for URL change
await page.waitForURL("**/dashboard");
await page.waitForURL(/login/);

// Wait for specific element state
await page.waitForSelector(".spinner", { state: "hidden" });
await page.waitForSelector(".result", { state: "visible" });
await page.waitForSelector("#element", { state: "attached" });
await page.waitForSelector("#element", { state: "detached" });

// Wait for page load state
await page.waitForLoadState("load");
await page.waitForLoadState("domcontentloaded");
await page.waitForLoadState("networkidle"); // all network requests done

// Wait for a timeout (use sparingly!)
await page.waitForTimeout(2000); // ⚠️ Avoid in production tests

// Wait for an event
const popup = await page.waitForEvent("popup");
const download = await page.waitForEvent("download");
const dialog = await page.waitForEvent("dialog");
```

### 3.4.3 Custom Polling

```typescript
// Poll until condition is true
await expect(async () => {
  const count = await page.locator(".item").count();
  expect(count).toBeGreaterThan(5);
}).toPass({ timeout: 10_000 });

// Custom poll interval
await expect(async () => {
  const text = await page.locator("#status").textContent();
  expect(text).toBe("Complete");
}).toPass({
  intervals: [1000, 2000, 5000], // retry intervals in ms
  timeout: 30_000
});
```

---

## 3.5 Handling Frames (iFrames)

```typescript
// Get frame by name
const frame = page.frame("frameName");

// Get frame by URL
const frame = page.frameByUrl(/widget\.example\.com/);

// Get frame by locator
const frameLocator = page.frameLocator("iframe#payment-frame");

// Interact inside frame
await frameLocator.getByLabel("Card Number").fill("4111111111111111");
await frameLocator.getByLabel("Expiry").fill("12/26");
await frameLocator.getByLabel("CVV").fill("123");
await frameLocator.getByRole("button", { name: "Pay" }).click();

// Nested iframes
const innerFrame = page
  .frameLocator("iframe#outer")
  .frameLocator("iframe#inner");
await innerFrame.locator("#element").click();

// Assert inside frame
await expect(frameLocator.locator(".success-msg")).toBeVisible();
```

---

## 3.6 Handling Alerts & Dialogs

```typescript
// Accept alert
page.on("dialog", async dialog => {
  console.log(`Dialog type: ${dialog.type()}`);
  console.log(`Dialog message: ${dialog.message()}`);
  await dialog.accept();
});
await page.locator("#trigger-alert").click();

// Dismiss dialog (cancel)
page.on("dialog", async dialog => {
  await dialog.dismiss();
});

// Enter text in prompt dialog
page.on("dialog", async dialog => {
  await dialog.accept("John Doe"); // typed value
});
await page.locator("#show-prompt").click();

// One-time handler (recommended for specific tests)
const dialogPromise = page.waitForEvent("dialog");
await page.locator("#delete-btn").click();
const dialog = await dialogPromise;
expect(dialog.message()).toContain("Are you sure?");
await dialog.accept();
```

---

## 3.7 Handling New Tabs & Popups

```typescript
// Capture new tab/popup
const newPagePromise = page.waitForEvent("popup");
await page.locator("a[target='_blank']").click();
const newPage = await newPagePromise;

// Wait for new tab to load
await newPage.waitForLoadState();
await expect(newPage).toHaveURL(/expected-url/);

// Interact with new tab
await newPage.loginForm.fill("user@test.com");

// Close popup
await newPage.close();

// Work in new context
const context = await browser.newContext();
const page2 = await context.newPage();
await page2.goto("https://another-app.com");
```

---

## 3.8 Screenshots & Videos

```typescript
// Screenshot of full page
await page.screenshot({
  path: "screenshots/full-page.png",
  fullPage: true
});

// Screenshot of specific element
await page.locator(".dashboard-chart").screenshot({
  path: "screenshots/chart.png"
});

// Screenshot with clip area
await page.screenshot({
  clip: { x: 0, y: 0, width: 400, height: 300 },
  path: "screenshots/clipped.png"
});

// Videos are configured in playwright.config.ts:
// video: "on" | "off" | "retain-on-failure" | "on-first-retry"
```

---

## ✅ Summary

| Concept | Key Points |
|---------|-----------|
| **Locators** | Use role/label/text first; CSS/XPath as fallback |
| **Actions** | Auto-wait before every action |
| **Assertions** | Auto-retry until timeout |
| **Waits** | Never use `waitForTimeout`; use event/condition waits |
| **Frames** | Use `frameLocator()` for iFrame interaction |
| **Dialogs** | Register handler before triggering dialog |
| **Popups** | Use `waitForEvent("popup")` before click |

> 🔜 **Next:** [Section 4 – Advanced Concepts](./04-advanced-concepts.md)
