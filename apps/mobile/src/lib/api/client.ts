export class ApiError extends Error {
  constructor(
    public readonly kind:
      | "network"
      | "http"
      | "configuration"
      | "response"
      | "cancelled",
    message: string,
    public readonly status?: number,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function apiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured)
    throw new ApiError(
      "configuration",
      "The API address is not configured. Set EXPO_PUBLIC_API_URL and restart Expo.",
    );
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ApiError(
      "configuration",
      "The configured API address is invalid.",
    );
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new ApiError(
      "configuration",
      "Use an HTTP(S) API address without credentials, query parameters or a fragment.",
    );
  }
  if (!__DEV__ && url.protocol !== "https:")
    throw new ApiError(
      "configuration",
      "A secure HTTPS API address is required for release builds.",
    );
  return configured.replace(/\/+$/, "");
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// All mobile traffic goes directly to Nest. Never log bodies, passwords or tokens.
export async function apiRequest<T>(
  path: string,
  options: { token?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const base = apiBaseUrl();
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort);
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${base}${path}`, {
      method: options.body === undefined ? "GET" : "POST",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      // An expired token must still invalidate the session even if its error body is malformed.
      if (!response.ok)
        throw new ApiError(
          "http",
          "The request could not be completed.",
          response.status,
        );
      // A dropped connection or timeout while reading the body is still a network failure.
      if (!(error instanceof SyntaxError)) throw error;
      throw new ApiError(
        "response",
        "The server returned an unreadable response. Please try again.",
      );
    }
    if (!response.ok) {
      const fields: Record<string, string> = {};
      if (isRecord(body) && isRecord(body.errors)) {
        for (const key of ["email", "password"]) {
          const message = body.errors[key];
          if (typeof message === "string") fields[key] = message;
        }
      }
      // Known status messages only: do not surface internal error details.
      const message =
        response.status === 401
          ? "Your session has expired or access was revoked. Please sign in again."
          : response.status === 403
            ? "Your account is not authorized for this information."
            : response.status === 404
              ? "This information is not available. Please contact HR if your employee profile is missing."
              : response.status === 429
                ? "Too many requests. Please wait a moment and try again."
                : response.status >= 500
                  ? "The service is temporarily unavailable. Please try again."
                  : "The request could not be completed. Please check your details.";
      throw new ApiError("http", message, response.status, fields);
    }
    if (!isRecord(body) || body.success !== true || !("data" in body))
      throw new ApiError(
        "response",
        "The server returned an unexpected response. Please try again.",
      );
    return body.data as T;
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted)
      throw new ApiError("cancelled", "Request cancelled.");
    throw new ApiError(
      "network",
      "Cannot reach HRMS. Check your connection and try again. Your saved session has not been removed.",
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}
