import { appEnv } from "../config/env";

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_CONCURRENT_REQUESTS = 4;
const MIN_REQUEST_GAP_MS = 120;
const MAX_IDEMPOTENT_RETRIES = 1;
const RETRY_BASE_DELAY_MS = 250;
const RETRY_MAX_DELAY_MS = 1500;

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad request. Please review your input and try again.",
  401: "Authentication is required. Please sign in and try again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with current data. Please refresh and try again.",
  422: "Some fields are invalid. Please correct them and try again.",
  429: "Too many requests. Please wait and try again.",
  500: "Server error. Please try again shortly.",
  502: "Upstream service error. Please try again shortly.",
  503: "Service is temporarily unavailable. Please try again shortly.",
  504: "Gateway timeout. Please try again shortly.",
};

let activeRequests = 0;
const requestQueue: Array<() => void> = [];
let nextRequestAllowedAt = 0;
let rateGate: Promise<void> = Promise.resolve();

export interface RequestJsonOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  timeoutMs?: number;
  retry?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly details?: unknown;
  readonly retryAfterMs?: number;

  constructor(params: {
    message: string;
    status: number;
    code: string;
    retryable: boolean;
    details?: unknown;
    retryAfterMs?: number;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.retryable = params.retryable;
    this.details = params.details;
    this.retryAfterMs = params.retryAfterMs;
  }
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && (error as { name: string }).name === "AbortError";
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function isIdempotentMethod(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function calculateBackoffDelay(attempt: number): number {
  const exponentialDelay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 120);
  return Math.min(exponentialDelay + jitter, RETRY_MAX_DELAY_MS);
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidatePayload = payload as Record<string, unknown>;
  const candidateValues = [candidatePayload.message, candidatePayload.error, candidatePayload.detail];
  for (const value of candidateValues) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getStatusMessage(status: number, payload: unknown): string {
  return extractErrorMessage(payload) ?? HTTP_STATUS_MESSAGES[status] ?? "Unexpected response from server.";
}

function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  if (!Number.isNaN(seconds)) {
    return Math.max(0, Math.floor(seconds * 1000));
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return Math.max(0, timestamp - Date.now());
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

function shouldSerializeJsonBody(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return false;
  }

  return true;
}

function withRequestTimeout(timeoutMs: number, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const handleExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", handleExternalAbort, { once: true });
    }
  }

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", handleExternalAbort);
    }
  };

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup,
  };
}

function buildRequestUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!appEnv.apiBaseUrl) {
    throw new ApiError({
      message: "API base URL is not configured.",
      status: 500,
      code: "API_BASE_URL_MISSING",
      retryable: false,
    });
  }

  const baseUrl = appEnv.apiBaseUrl.endsWith("/") ? appEnv.apiBaseUrl : `${appEnv.apiBaseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, baseUrl).toString();
}

async function acquireRequestSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests += 1;
    return;
  }

  await new Promise<void>((resolve) => {
    requestQueue.push(resolve);
  });
  activeRequests += 1;
}

function releaseRequestSlot(): void {
  activeRequests = Math.max(0, activeRequests - 1);
  const next = requestQueue.shift();
  if (next) {
    next();
  }
}

async function waitForRequestGap(): Promise<void> {
  const currentStep = rateGate.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, nextRequestAllowedAt - now);
    if (waitMs > 0) {
      await sleep(waitMs);
    }
    nextRequestAllowedAt = Date.now() + MIN_REQUEST_GAP_MS;
  });
  rateGate = currentStep.catch(() => undefined);
  await currentStep;
}

async function runWithRequestLimits<T>(operation: () => Promise<T>): Promise<T> {
  await acquireRequestSlot();
  try {
    await waitForRequestGap();
    return await operation();
  } finally {
    releaseRequestSlot();
  }
}

async function requestAttempt<T>(url: string, method: string, options: RequestJsonOptions): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const headers = new Headers(options.headers);
  const body = options.body;

  let requestBody: BodyInit | null | undefined = body as BodyInit | null | undefined;
  if (shouldSerializeJsonBody(body)) {
    requestBody = JSON.stringify(body);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  const { signal, didTimeout, cleanup } = withRequestTimeout(timeoutMs, options.signal);

  try {
    const response = await runWithRequestLimits(() =>
      fetch(url, {
        ...options,
        method,
        body: requestBody,
        headers,
        signal,
      }),
    );

    const payload = await parseResponsePayload(response);
    if (!response.ok) {
      throw new ApiError({
        message: getStatusMessage(response.status, payload),
        status: response.status,
        code: `HTTP_${response.status}`,
        retryable: RETRYABLE_STATUS_CODES.has(response.status),
        details: payload,
        retryAfterMs: parseRetryAfterMs(response.headers.get("retry-after")),
      });
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isAbortError(error)) {
      if (didTimeout()) {
        throw new ApiError({
          message: "Request timed out. Please try again.",
          status: 408,
          code: "REQUEST_TIMEOUT",
          retryable: true,
        });
      }

      throw new ApiError({
        message: "Request was cancelled.",
        status: 499,
        code: "REQUEST_ABORTED",
        retryable: false,
      });
    }

    if (isNetworkError(error)) {
      throw new ApiError({
        message: "Network error. Check your connection and try again.",
        status: 0,
        code: "NETWORK_ERROR",
        retryable: true,
        details: error,
      });
    }

    throw new ApiError({
      message: "Unexpected request failure.",
      status: 0,
      code: "UNEXPECTED_ERROR",
      retryable: false,
      details: error,
    });
  } finally {
    cleanup();
  }
}

export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const requestUrl = buildRequestUrl(path);
  const maxAttempts =
    options.retry === false ? 1 : isIdempotentMethod(method) ? MAX_IDEMPOTENT_RETRIES + 1 : 1;

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await requestAttempt<T>(requestUrl, method, options);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError({
        message: "Unexpected request failure.",
        status: 0,
        code: "UNEXPECTED_ERROR",
        retryable: false,
        details: error,
      });

      const canRetry =
        attempt < maxAttempts &&
        isIdempotentMethod(method) &&
        apiError.retryable;

      if (!canRetry) {
        throw apiError;
      }

      const delayMs = apiError.retryAfterMs ?? calculateBackoffDelay(attempt);
      await sleep(delayMs);
    }
  }

  throw new ApiError({
    message: "Unexpected request failure.",
    status: 0,
    code: "UNEXPECTED_ERROR",
    retryable: false,
  });
}

export function isRetryableApiError(error: unknown): boolean {
  return error instanceof ApiError ? error.retryable : false;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected error. Please try again.";
}
