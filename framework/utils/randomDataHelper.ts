/**
 * FRAMEWORK: utils/randomDataHelper.ts
 * Generates random/unique test data to avoid data collisions between runs.
 */

export class RandomData {
  /**
   * Random lowercase string of given length
   */
  static string(length = 8): string {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  /**
   * Unique email address safe for each test run
   */
  static email(domain = "automation.test"): string {
    return `test_${this.string(6)}_${Date.now()}@${domain}`;
  }

  /**
   * Random US-style phone number
   */
  static phone(): string {
    const num = Math.floor(2000000000 + Math.random() * 7999999999);
    return `+1${num}`;
  }

  /**
   * Random integer between min and max (inclusive)
   */
  static number(min = 1, max = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Random first + last name from sample lists
   */
  static fullName(): string {
    const first = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Henry"];
    const last = ["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson"];
    return `${this.fromArray(first)} ${this.fromArray(last)}`;
  }

  /**
   * Random strong password meeting common requirements
   */
  static password(): string {
    return `Test@${this.number(1000, 9999)}!`;
  }

  /**
   * Random date in past (ISO format)
   */
  static pastDate(maxDaysAgo = 365): string {
    const daysAgo = this.number(1, maxDaysAgo);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  }

  /**
   * Random future date (ISO format)
   */
  static futureDate(maxDaysAhead = 365): string {
    const daysAhead = this.number(1, maxDaysAhead);
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split("T")[0];
  }

  /**
   * Pick a random element from an array
   */
  static fromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Shuffle an array (Fisher-Yates)
   */
  static shuffle<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Random alphanumeric string (for IDs, codes)
   */
  static alphanumeric(length = 10): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  /**
   * Unique test ID for identifying test runs
   */
  static testRunId(): string {
    return `RUN_${Date.now()}_${this.alphanumeric(6)}`;
  }
}
