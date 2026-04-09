/**
 * FRAMEWORK: utils/apiHelper.ts
 * Typed HTTP request helper wrapping Playwright's APIRequestContext.
 */
import { APIRequestContext, expect } from "@playwright/test";
import { logger } from "./logger";

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  ok: boolean;
}

export class ApiHelper {
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
    private readonly authToken?: string
  ) {
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
  }

  private buildUrl(endpoint: string): string {
    return endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.info(`GET ${url}`, "ApiHelper");

    const response = await this.request.get(url, {
      headers: { ...this.defaultHeaders, ...options?.headers },
      params: options?.params as Record<string, string>,
      timeout: options?.timeout,
    });

    const data = await response.json() as T;
    logger.debug(`Response [${response.status()}]: ${JSON.stringify(data).substring(0, 150)}`, "ApiHelper");

    return {
      data,
      statusCode: response.status(),
      headers: response.headers(),
      ok: response.ok(),
    };
  }

  async post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.info(`POST ${url}`, "ApiHelper");

    const response = await this.request.post(url, {
      headers: { ...this.defaultHeaders, ...options?.headers },
      data: body,
      timeout: options?.timeout,
    });

    const data = await response.json() as T;
    return {
      data,
      statusCode: response.status(),
      headers: response.headers(),
      ok: response.ok(),
    };
  }

  async put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.info(`PUT ${url}`, "ApiHelper");

    const response = await this.request.put(url, {
      headers: { ...this.defaultHeaders, ...options?.headers },
      data: body,
    });

    const data = await response.json() as T;
    return { data, statusCode: response.status(), headers: response.headers(), ok: response.ok() };
  }

  async patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    logger.info(`PATCH ${url}`, "ApiHelper");

    const response = await this.request.patch(url, {
      headers: { ...this.defaultHeaders, ...options?.headers },
      data: body,
    });

    const data = await response.json() as T;
    return { data, statusCode: response.status(), headers: response.headers(), ok: response.ok() };
  }

  async delete(endpoint: string, options?: RequestOptions): Promise<{ statusCode: number; ok: boolean }> {
    const url = this.buildUrl(endpoint);
    logger.info(`DELETE ${url}`, "ApiHelper");

    const response = await this.request.delete(url, {
      headers: { ...this.defaultHeaders, ...options?.headers },
    });

    return { statusCode: response.status(), ok: response.ok() };
  }

  // ── Assertion Helpers ──────────────────────────────────────────
  assertSuccess<T>(response: ApiResponse<T>, expectedStatus = 200): void {
    expect(response.statusCode).toBe(expectedStatus);
    expect(response.ok).toBeTruthy();
  }

  assertStatus<T>(response: ApiResponse<T>, expectedStatus: number): void {
    expect(response.statusCode).toBe(expectedStatus);
  }
}
