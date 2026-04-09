/**
 * FRAMEWORK: config/envConfig.ts
 * Loads and validates environment-specific configuration.
 * Usage: import { config } from "../config/envConfig"
 */
import * as dotenv from "dotenv";
import * as path from "path";

// ── Environment Type ────────────────────────────────────────────
export type Env = "dev" | "qa" | "staging" | "prod";

// ── Load .env file ──────────────────────────────────────────────
const currentEnv = (process.env.ENV || "qa") as Env;
const envFilePath = path.resolve(process.cwd(), `.env.${currentEnv}`);
dotenv.config({ path: envFilePath });

// ── Config Interface ────────────────────────────────────────────
export interface AppConfig {
  env: Env;
  baseUrl: string;
  apiUrl: string;
  adminUser: { username: string; password: string };
  timeout: number;
  headless: boolean;
  browser: string;
}

// ── Built Config ────────────────────────────────────────────────
export const config: AppConfig = {
  env: currentEnv,
  baseUrl: process.env.BASE_URL || "https://demoqa.com",
  apiUrl: process.env.API_URL || "https://jsonplaceholder.typicode.com",
  adminUser: {
    username: process.env.ADMIN_USERNAME || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
  },
  timeout: parseInt(process.env.TIMEOUT || "30000"),
  headless: process.env.HEADLESS !== "false",
  browser: process.env.BROWSER || "chromium",
};

// ── Log loaded config (hide password) ──────────────────────────
console.info(`[Config] ENV=${config.env} | BASE_URL=${config.baseUrl} | ` +
             `HEADLESS=${config.headless} | BROWSER=${config.browser}`);
