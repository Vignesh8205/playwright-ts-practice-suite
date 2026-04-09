/**
 * FRAMEWORK: utils/logger.ts
 * Structured logger with colored console output and file writing.
 */
import * as fs from "fs";
import * as path from "path";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "PASS" | "FAIL" | "STEP";

const COLORS: Record<LogLevel, string> = {
  INFO:  "\x1b[36m",   // Cyan
  WARN:  "\x1b[33m",   // Yellow
  ERROR: "\x1b[31m",   // Red
  DEBUG: "\x1b[35m",   // Magenta
  PASS:  "\x1b[32m",   // Green
  FAIL:  "\x1b[31m",   // Red
  STEP:  "\x1b[34m",   // Blue
};

const ICONS: Record<LogLevel, string> = {
  INFO:  "ℹ️ ",
  WARN:  "⚠️ ",
  ERROR: "❌",
  DEBUG: "🔍",
  PASS:  "✅",
  FAIL:  "❌",
  STEP:  "📌",
};

const RESET = "\x1b[0m";

class Logger {
  private logFilePath: string;
  private isCI = !!process.env.CI;

  constructor() {
    const logsDir = path.join(process.cwd(), "framework", "reports", "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").substring(0, 19);
    this.logFilePath = path.join(logsDir, `run_${ts}.log`);
  }

  private write(level: LogLevel, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : "";
    const plain = `[${timestamp}] [${level}] ${ctx} ${message}`;

    // Console (colored in dev, plain in CI)
    if (this.isCI) {
      console.log(plain);
    } else {
      const colored = `${COLORS[level]}${ICONS[level]} ${plain}${RESET}`;
      console.log(colored);
    }

    // File
    try {
      fs.appendFileSync(this.logFilePath, plain + "\n");
    } catch {
      // Fail silently if log file write fails
    }
  }

  info(message: string, context?: string): void  { this.write("INFO", message, context); }
  warn(message: string, context?: string): void  { this.write("WARN", message, context); }
  error(message: string, context?: string): void { this.write("ERROR", message, context); }
  debug(message: string, context?: string): void { this.write("DEBUG", message, context); }
  pass(message: string, context?: string): void  { this.write("PASS", message, context); }
  fail(message: string, context?: string): void  { this.write("FAIL", message, context); }

  step(stepName: string): void {
    const line = "═".repeat(60);
    const msg = `\n${line}\n  📌 STEP: ${stepName}\n${line}`;
    console.log(`${COLORS.STEP}${msg}${RESET}`);
    try {
      fs.appendFileSync(this.logFilePath, msg + "\n");
    } catch { /* ignore */ }
  }

  getLogFilePath(): string {
    return this.logFilePath;
  }
}

export const logger = new Logger();
