/**
 * EXAMPLES: 01 – TypeScript Basics
 *
 * This file demonstrates core TypeScript concepts used in Playwright automation.
 * Run: npx playwright test examples/01-typescript-basics/
 *
 * NOTE: These are not real browser tests — they demonstrate TypeScript syntax
 *       and are run as Playwright tests to verify the code executes correctly.
 */

import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════
// 1. VARIABLES & DATA TYPES
// ════════════════════════════════════════════════════════════════

test("01 – Variables and Data Types", async () => {
  // String
  const username: string = "Alice";
  const appName: string = `Welcome to ${username}'s Dashboard`;

  // Number
  const timeout: number = 30_000;
  const percentage: number = 99.5;

  // Boolean
  const isHeadless: boolean = true;
  const isLoggedIn: boolean = false;

  // Arrays
  const browsers: string[] = ["chromium", "firefox", "webkit"];
  const testIds: number[] = [101, 102, 103, 104];

  // Tuple
  const viewport: [number, number] = [1280, 720];

  // Assertions to verify values
  expect(username).toBe("Alice");
  expect(appName).toContain("Alice");
  expect(timeout).toBe(30000);
  expect(isHeadless).toBeTruthy();
  expect(isLoggedIn).toBeFalsy();
  expect(browsers).toHaveLength(3);
  expect(browsers).toContain("chromium");
  expect(viewport[0]).toBe(1280);

  console.log("✅ Variables:", { username, timeout, isHeadless, browsers, viewport });
});

// ════════════════════════════════════════════════════════════════
// 2. ENUMS
// ════════════════════════════════════════════════════════════════

enum Environment {
  DEV = "dev",
  QA = "qa",
  STAGING = "staging",
  PROD = "prod",
}

enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

test("02 – Enums", async () => {
  const currentEnv: Environment = Environment.QA;
  const bugPriority: Priority = Priority.HIGH;

  expect(currentEnv).toBe("qa");
  expect(bugPriority).toBe(3);
  expect(Object.values(Environment)).toContain("dev");

  // Using enum in conditional
  const isProduction = currentEnv === Environment.PROD;
  expect(isProduction).toBeFalsy();

  console.log("✅ Enums:", { currentEnv, bugPriority, isProduction });
});

// ════════════════════════════════════════════════════════════════
// 3. INTERFACES
// ════════════════════════════════════════════════════════════════

interface TestUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  isActive: boolean;
  address?: string; // Optional
}

interface LoginCredentials {
  readonly username: string; // Cannot be changed after creation
  readonly password: string;
}

test("03 – Interfaces", async () => {
  const adminUser: TestUser = {
    id: 1,
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    isActive: true,
  };

  const credentials: LoginCredentials = {
    username: "admin@test.com",
    password: "SecurePass@1",
  };

  expect(adminUser.id).toBe(1);
  expect(adminUser.role).toBe("admin");
  expect(adminUser.address).toBeUndefined(); // Optional not set
  expect(credentials.username).toBe("admin@test.com");

  // Type narrowing
  const roles: Array<TestUser["role"]> = ["admin", "editor", "viewer"];
  expect(roles).toContain(adminUser.role);

  console.log("✅ Interfaces:", { adminUser, credentials });
});

// ════════════════════════════════════════════════════════════════
// 4. FUNCTIONS
// ════════════════════════════════════════════════════════════════

// Regular function with return type
function formatUrl(path: string, baseUrl: string = "https://qa.app.com"): string {
  return `${baseUrl}/${path.replace(/^\//, "")}`;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional & rest parameters
function buildSelector(tag: string, id?: string, ...classes: string[]): string {
  let selector = tag;
  if (id) selector += `#${id}`;
  if (classes.length > 0) selector += `.${classes.join(".")}`;
  return selector;
}

// Generic function
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

test("04 – Functions", async () => {
  expect(formatUrl("login")).toBe("https://qa.app.com/login");
  expect(formatUrl("/dashboard", "https://dev.app.com")).toBe("https://dev.app.com/dashboard");
  expect(multiply(4, 5)).toBe(20);
  expect(buildSelector("input", "username", "form-control", "active")).toBe(
    "input#username.form-control.active"
  );
  expect(getFirst([10, 20, 30])).toBe(10);
  expect(getFirst<string>(["a", "b"])).toBe("a");
  expect(getFirst([])).toBeUndefined();

  console.log("✅ Functions work correctly");
});

// ════════════════════════════════════════════════════════════════
// 5. CLASSES
// ════════════════════════════════════════════════════════════════

class TestDataBuilder {
  private static counter: number = 0;

  // Private method
  private static nextId(): number {
    return ++this.counter;
  }

  // Static factory method
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      id: this.nextId(),
      name: `User_${this.counter}`,
      email: `user${this.counter}@test.com`,
      role: "viewer",
      isActive: true,
      ...overrides,
    };
  }

  static createAdmin(): TestUser {
    return this.createUser({ role: "admin", name: "Admin User" });
  }

  static createMany(count: number): TestUser[] {
    return Array.from({ length: count }, () => this.createUser());
  }

  static reset(): void {
    this.counter = 0;
  }
}

test("05 – Classes", async () => {
  TestDataBuilder.reset();

  const admin = TestDataBuilder.createAdmin();
  const viewer = TestDataBuilder.createUser({ isActive: false });
  const batch = TestDataBuilder.createMany(3);

  expect(admin.role).toBe("admin");
  expect(admin.id).toBe(1);
  expect(viewer.isActive).toBeFalsy();
  expect(batch).toHaveLength(3);
  expect(batch[0].id).not.toBe(batch[1].id); // Unique IDs

  console.log("✅ Classes:", { admin, viewer, batchCount: batch.length });
});

// ════════════════════════════════════════════════════════════════
// 6. ASYNC / AWAIT
// ════════════════════════════════════════════════════════════════

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUserSimulated(id: number): Promise<TestUser | null> {
  await delay(10); // Simulate network delay
  if (id <= 0) return null;
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@test.com`,
    role: "viewer",
    isActive: true,
  };
}

async function fetchMultipleUsers(ids: number[]): Promise<TestUser[]> {
  // Parallel execution with Promise.all
  const users = await Promise.all(ids.map((id) => fetchUserSimulated(id)));
  return users.filter((u): u is TestUser => u !== null);
}

test("06 – Async/Await", async () => {
  // Sequential await
  const user1 = await fetchUserSimulated(1);
  expect(user1).not.toBeNull();
  expect(user1?.id).toBe(1);

  // Null check
  const invalid = await fetchUserSimulated(-1);
  expect(invalid).toBeNull();

  // Parallel with Promise.all
  const users = await fetchMultipleUsers([1, 2, 3]);
  expect(users).toHaveLength(3);
  expect(users.every((u) => u.isActive)).toBeTruthy();

  // Error handling
  let errorCaught = false;
  try {
    await Promise.reject(new Error("Simulated API failure"));
  } catch (error) {
    errorCaught = true;
    expect((error as Error).message).toBe("Simulated API failure");
  }
  expect(errorCaught).toBeTruthy();

  console.log("✅ Async/Await works correctly");
});

// ════════════════════════════════════════════════════════════════
// 7. TYPE ALIASES & UTILITY TYPES
// ════════════════════════════════════════════════════════════════

type BrowserName = "chromium" | "firefox" | "webkit";
type UrlMap = Record<string, string>;
type OptionalUser = Partial<TestUser>;
type UserPublic = Omit<TestUser, "id">;
type UserReadonly = Readonly<TestUser>;

test("07 – Type Aliases and Utility Types", async () => {
  const browser: BrowserName = "chromium";
  const urls: UrlMap = {
    login: "/login",
    dashboard: "/dashboard",
    profile: "/profile",
  };

  const partial: OptionalUser = { name: "Partial User" }; // Only name required
  const publicUser: UserPublic = {
    name: "Public",
    email: "p@test.com",
    role: "viewer",
    isActive: true,
  };

  expect(browser).toBe("chromium");
  expect(urls["login"]).toBe("/login");
  expect(Object.keys(urls)).toHaveLength(3);
  expect(partial.name).toBe("Partial User");
  expect(partial.id).toBeUndefined();
  expect(publicUser).not.toHaveProperty("id");

  console.log("✅ Utility Types work correctly");
});

// ════════════════════════════════════════════════════════════════
// 8. GENERICS
// ════════════════════════════════════════════════════════════════

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

function createResponse<T>(data: T, status: number = 200): ApiResponse<T> {
  return {
    data,
    status,
    message: status === 200 ? "Success" : "Error",
    timestamp: new Date().toISOString(),
  };
}

test("08 – Generics", async () => {
  interface LoginResponse {
    token: string;
    expiresIn: number;
  }

  const loginResp = createResponse<LoginResponse>(
    { token: "abc123", expiresIn: 3600 },
    200
  );
  const errorResp = createResponse<null>(null, 404);

  expect(loginResp.status).toBe(200);
  expect(loginResp.data.token).toBe("abc123");
  expect(loginResp.message).toBe("Success");
  expect(errorResp.status).toBe(404);
  expect(errorResp.data).toBeNull();

  // Generic array util
  function last<T>(arr: T[]): T {
    return arr[arr.length - 1];
  }

  expect(last([1, 2, 3])).toBe(3);
  expect(last(["a", "b", "c"])).toBe("c");

  console.log("✅ Generics work correctly");
});
