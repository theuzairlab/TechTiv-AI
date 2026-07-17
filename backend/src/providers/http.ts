export class ProviderHttpError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`HTTP ${status}: ${body.slice(0, 300)}`);
    this.name = "ProviderHttpError";
    this.status = status;
    this.body = body;
  }
}

export class ProviderNetworkError extends Error {
  readonly causeError?: unknown;

  constructor(url: string, cause: unknown) {
    const detail =
      cause instanceof Error
        ? `${cause.name}: ${cause.message}`
        : String(cause);
    super(`Network error calling ${url} — ${detail}`);
    this.name = "ProviderNetworkError";
    this.causeError = cause;
  }
}

type FetchJsonOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";

  const cause =
    "cause" in error ? (error as { cause?: unknown }).cause : undefined;
  const causeCode =
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    typeof (cause as { code?: unknown }).code === "string"
      ? (cause as { code: string }).code
      : "";

  const needle = `${message} ${code} ${causeCode}`.toLowerCase();

  return (
    needle.includes("econnreset") ||
    needle.includes("etimedout") ||
    needle.includes("econnrefused") ||
    needle.includes("enotfound") ||
    needle.includes("socket hang up") ||
    needle.includes("fetch failed") ||
    needle.includes("aborted") ||
    needle.includes("und_err") ||
    needle.includes("network")
  );
}

function isRetryableHttpStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function fetchOnce(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ProviderNetworkError(url, error);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(
  url: string,
  init?: FetchJsonOptions,
): Promise<T> {
  const {
    timeoutMs = 90_000,
    retries = 3,
    retryDelayMs = 1_250,
    ...requestInit
  } = init ?? {};

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchOnce(url, requestInit, timeoutMs);
      const text = await response.text();

      if (!response.ok) {
        if (isRetryableHttpStatus(response.status) && attempt < retries) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        throw new ProviderHttpError(response.status, text);
      }

      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      lastError = error;

      const retryable =
        error instanceof ProviderNetworkError ||
        (error instanceof ProviderHttpError &&
          isRetryableHttpStatus(error.status)) ||
        isRetryableNetworkError(error);

      if (!retryable || attempt >= retries) {
        throw error;
      }

      console.warn(
        `[http] retry ${attempt + 1}/${retries} for ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("fetchJson failed after retries");
}
