# 📘 Section 1: TypeScript Basics

> **Goal:** Understand TypeScript fundamentals before diving into Playwright automation.

---

## 1.1 What is TypeScript?

TypeScript is a **statically typed superset of JavaScript** developed by Microsoft. It compiles down to plain JavaScript but adds optional type annotations, interfaces, and modern OOP features.

### Why TypeScript for Automation?

| Feature | Benefit in Test Automation |
|---------|---------------------------|
| **Static Typing** | Catch bugs at compile time, not runtime |
| **IntelliSense** | Auto-complete for Playwright APIs |
| **Interfaces** | Model test data structures clearly |
| **Enums** | Define constants (e.g., environments, browsers) |
| **Generics** | Write reusable utility functions |
| **Better Refactoring** | Rename/move code safely with IDE support |

---

## 1.2 Installation & Setup

### Step 1: Install Node.js
Download from [https://nodejs.org](https://nodejs.org) — install the **LTS** version.

```bash
# Verify installation
node --version   # e.g., v20.11.0
npm --version    # e.g., 10.2.4
```

### Step 2: Create a TypeScript project

```bash
mkdir ts-basics
cd ts-basics
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init
```

This creates a `tsconfig.json`. A recommended configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 3: Run TypeScript files

```bash
# Compile & run
npx ts-node src/hello.ts
```

---

## 1.3 Data Types

```typescript
// ── Primitives ──────────────────────────────────────────────
let username: string = "Alice";
let age: number = 30;
let isLoggedIn: boolean = true;
let notDefined: undefined = undefined;
let nothing: null = null;

// ── Arrays ──────────────────────────────────────────────────
let fruits: string[] = ["apple", "banana", "cherry"];
let scores: Array<number> = [98, 87, 76];

// ── Tuples ──────────────────────────────────────────────────
let coordinate: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["Bob", 25, true];

// ── Enums ───────────────────────────────────────────────────
enum Environment {
  DEV = "dev",
  QA = "qa",
  PROD = "prod"
}
const currentEnv: Environment = Environment.QA;
console.log(currentEnv); // "qa"

// ── Any (avoid in production) ────────────────────────────────
let dynamicValue: any = "hello";
dynamicValue = 42; // allowed

// ── Unknown (safer alternative to any) ──────────────────────
let userInput: unknown = "test";
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase());
}

// ── Union Types ──────────────────────────────────────────────
let id: string | number = "abc123";
id = 456; // also valid

// ── Literal Types ────────────────────────────────────────────
let direction: "left" | "right" | "up" | "down" = "left";

// ── Type Aliases ─────────────────────────────────────────────
type Credentials = {
  username: string;
  password: string;
};

const loginData: Credentials = {
  username: "admin",
  password: "secret123"
};
```

---

## 1.4 Interfaces

Interfaces define the **shape** of an object. They are ideal for modelling test data.

```typescript
// ── Basic Interface ──────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer" | "editor";
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  role: "admin"
};

// ── Optional Properties ──────────────────────────────────────
interface Product {
  id: number;
  name: string;
  description?: string;   // optional
  price: number;
}

// ── Readonly Properties ──────────────────────────────────────
interface Config {
  readonly baseURL: string;
  timeout: number;
}

const config: Config = { baseURL: "https://app.example.com", timeout: 30000 };
// config.baseURL = "other"; // ❌ Error: Cannot assign to 'baseURL'

// ── Interface Extension ──────────────────────────────────────
interface Animal {
  name: string;
  sound(): string;
}

interface Dog extends Animal {
  breed: string;
}

const myDog: Dog = {
  name: "Rex",
  breed: "Labrador",
  sound: () => "Woof!"
};

// ── Interface for Functions ──────────────────────────────────
interface ClickHandler {
  (selector: string, options?: { delay: number }): Promise<void>;
}
```

---

## 1.5 Functions

```typescript
// ── Basic Function ───────────────────────────────────────────
function add(a: number, b: number): number {
  return a + b;
}

// ── Arrow Function ───────────────────────────────────────────
const multiply = (a: number, b: number): number => a * b;

// ── Optional Parameters ──────────────────────────────────────
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

console.log(greet("Alice"));          // Hello, Alice!
console.log(greet("Bob", "Welcome")); // Welcome, Bob!

// ── Default Parameters ───────────────────────────────────────
function createUrl(path: string, baseUrl: string = "https://app.qa.com"): string {
  return `${baseUrl}/${path}`;
}

// ── Rest Parameters ──────────────────────────────────────────
function logMessages(...messages: string[]): void {
  messages.forEach(msg => console.log(`[LOG] ${msg}`));
}

// ── Overloaded Functions ─────────────────────────────────────
function formatId(id: number): string;
function formatId(id: string): string;
function formatId(id: number | string): string {
  return `ID-${id}`;
}

// ── Generic Functions ────────────────────────────────────────
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const firstNum = getFirst<number>([10, 20, 30]);  // 10
const firstStr = getFirst<string>(["a", "b"]);    // "a"
```

---

## 1.6 Classes

```typescript
// ── Basic Class ──────────────────────────────────────────────
class BrowserConfig {
  // Properties
  private _browserName: string;
  protected timeout: number;
  readonly headless: boolean;

  constructor(browserName: string, timeout: number = 30000, headless: boolean = true) {
    this._browserName = browserName;
    this.timeout = timeout;
    this.headless = headless;
  }

  // Getter
  get browserName(): string {
    return this._browserName;
  }

  // Method
  describe(): string {
    return `${this._browserName} | Timeout: ${this.timeout}ms | Headless: ${this.headless}`;
  }
}

const chromiumConfig = new BrowserConfig("chromium", 60000, false);
console.log(chromiumConfig.describe());
// chromium | Timeout: 60000ms | Headless: false

// ── Inheritance ──────────────────────────────────────────────
class TestConfig extends BrowserConfig {
  private environment: string;

  constructor(env: string, browser: string) {
    super(browser);
    this.environment = env;
  }

  describe(): string {
    return `[${this.environment.toUpperCase()}] ${super.describe()}`;
  }
}

const qaConfig = new TestConfig("qa", "firefox");
console.log(qaConfig.describe());
// [QA] firefox | Timeout: 30000ms | Headless: true

// ── Abstract Classes ─────────────────────────────────────────
abstract class BasePage {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  abstract navigate(): Promise<void>;  // Must be implemented by subclass

  async waitForLoad(timeout: number = 5000): Promise<void> {
    console.log(`Waiting ${timeout}ms for page to load...`);
  }
}

// ── Implements Interface ──────────────────────────────────────
interface Loggable {
  log(message: string): void;
}

class LoginPage extends BasePage implements Loggable {
  constructor() {
    super("/login");
  }

  async navigate(): Promise<void> {
    console.log(`Navigating to ${this.url}`);
  }

  log(message: string): void {
    console.log(`[LoginPage] ${message}`);
  }
}
```

---

## 1.7 Async / Await

This is **essential** for Playwright — all browser operations are asynchronous.

```typescript
// ── Promise basics ───────────────────────────────────────────
function fetchUser(id: number): Promise<{ name: string; role: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ name: "Alice", role: "admin" });
      } else {
        reject(new Error("Invalid user ID"));
      }
    }, 500);
  });
}

// ── async/await ──────────────────────────────────────────────
async function main(): Promise<void> {
  try {
    const user = await fetchUser(1);
    console.log(`User: ${user.name} (${user.role})`);
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    console.log("Done!");
  }
}

main();

// ── Parallel Execution ────────────────────────────────────────
async function runParallel(): Promise<void> {
  const [users, products] = await Promise.all([
    fetchUser(1),
    fetchUser(2)
  ]);
  console.log(users, products);
}

// ── Chaining ──────────────────────────────────────────────────
async function performLogin(username: string, password: string): Promise<string> {
  const isValid = await validateCredentials(username, password);
  if (!isValid) throw new Error("Invalid credentials");
  const token = await generateToken(username);
  return token;
}

async function validateCredentials(u: string, p: string): Promise<boolean> {
  return u === "admin" && p === "password";
}

async function generateToken(username: string): Promise<string> {
  return `token-${username}-${Date.now()}`;
}
```

---

## 1.8 Generics & Utility Types

```typescript
// ── Generics ─────────────────────────────────────────────────
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

interface LoginResponse {
  token: string;
  expiresIn: number;
}

const loginRes: ApiResponse<LoginResponse> = {
  data: { token: "abc123", expiresIn: 3600 },
  statusCode: 200,
  message: "Success"
};

// ── Built-in Utility Types ────────────────────────────────────
interface UserFull {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial — all properties optional
type UserOptional = Partial<UserFull>;

// Required — all properties required
type UserRequired = Required<UserOptional>;

// Pick — select specific keys
type UserPublic = Pick<UserFull, "id" | "name" | "email">;

// Omit — exclude specific keys
type UserSafe = Omit<UserFull, "password">;

// Readonly — all properties immutable
type ImmutableUser = Readonly<UserFull>;

// Record — key-value map
type UrlMap = Record<string, string>;
const urls: UrlMap = {
  login: "/login",
  dashboard: "/dashboard",
  profile: "/profile"
};
```

---

## 1.9 Type Guards & Narrowing

```typescript
// ── typeof guard ──────────────────────────────────────────────
function processInput(input: string | number): string {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  return input.toFixed(2);
}

// ── instanceof guard ─────────────────────────────────────────
class NetworkError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function handleError(error: unknown): void {
  if (error instanceof NetworkError) {
    console.error(`HTTP ${error.statusCode}: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("Unknown error");
  }
}

// ── Custom type guard ────────────────────────────────────────
interface AdminUser { role: "admin"; permissions: string[] }
interface GuestUser { role: "guest"; sessionExpiry: Date }
type AppUser = AdminUser | GuestUser;

function isAdmin(user: AppUser): user is AdminUser {
  return user.role === "admin";
}

function checkAccess(user: AppUser): void {
  if (isAdmin(user)) {
    console.log("Admin permissions:", user.permissions);
  } else {
    console.log("Session expires:", user.sessionExpiry);
  }
}
```

---

## 1.10 Practice Programs

### Program 1: Test Data Builder

```typescript
// src/testDataBuilder.ts

interface TestUser {
  id: number;
  username: string;
  password: string;
  role: "admin" | "user" | "guest";
  email: string;
}

class TestDataBuilder {
  private static counter = 0;

  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    this.counter++;
    return {
      id: this.counter,
      username: `user_${this.counter}`,
      password: "Test@1234",
      role: "user",
      email: `user_${this.counter}@test.com`,
      ...overrides
    };
  }

  static createAdmin(): TestUser {
    return this.createUser({ role: "admin", username: "admin_user" });
  }

  static createMultiple(count: number): TestUser[] {
    return Array.from({ length: count }, () => this.createUser());
  }
}

// Usage
const admin = TestDataBuilder.createAdmin();
const users = TestDataBuilder.createMultiple(5);

console.log("Admin:", admin);
console.log("Users:", users);
```

### Program 2: Environment Config Manager

```typescript
// src/config/envConfig.ts

type Env = "dev" | "qa" | "staging" | "prod";

interface EnvConfig {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
  headless: boolean;
}

const envConfigs: Record<Env, EnvConfig> = {
  dev: {
    baseUrl: "http://localhost:3000",
    apiUrl: "http://localhost:4000/api",
    timeout: 60000,
    headless: false
  },
  qa: {
    baseUrl: "https://qa.myapp.com",
    apiUrl: "https://qa-api.myapp.com/api",
    timeout: 30000,
    headless: true
  },
  staging: {
    baseUrl: "https://staging.myapp.com",
    apiUrl: "https://staging-api.myapp.com/api",
    timeout: 30000,
    headless: true
  },
  prod: {
    baseUrl: "https://myapp.com",
    apiUrl: "https://api.myapp.com/api",
    timeout: 20000,
    headless: true
  }
};

function getConfig(env: Env = "qa"): EnvConfig {
  return envConfigs[env];
}

// Usage
const config = getConfig((process.env.ENV as Env) ?? "qa");
console.log("Config:", config);
```

---

## ✅ Summary

| Concept | Key Takeaway |
|---------|-------------|
| **Types** | Catch bugs at compile time |
| **Interfaces** | Define object shapes for test data |
| **Classes** | Model Page Objects and utilities |
| **Async/Await** | Handle all browser operations |
| **Generics** | Create reusable utility functions |
| **Type Guards** | Safely narrow union types |

> 🔜 **Next:** [Section 2 – Playwright Introduction](./02-playwright-introduction.md)
