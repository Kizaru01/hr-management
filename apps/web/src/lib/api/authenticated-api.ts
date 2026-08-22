import { cookies } from "next/headers";
import { RequestError } from "@/lib/errors/http-errors";

interface ErrorBody {
  message?: unknown;
  errors?: unknown;
  error?: {
    message?: unknown;
    details?: unknown;
  };
}

export async function authenticatedApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not configured.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    throw new RequestError(401, "Unauthenticated.");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  return apiResponse<T>(response);
}

export async function apiResponse<T>(response: Response): Promise<T> {
  const body = await safeJson<ErrorBody | T>(response);

  if (!response.ok) {
    const errorBody = isObject(body) ? (body as ErrorBody) : undefined;
    const nestedError = isObject(errorBody?.error)
      ? errorBody.error
      : undefined;

    throw new RequestError(
      response.status,
      getErrorMessage(errorBody, nestedError, response.status),
      normalizeErrorDetails(errorBody?.errors ?? nestedError?.details),
    );
  }

  return body as T;
}

function getErrorMessage(
  errorBody: ErrorBody | undefined,
  nestedError: ErrorBody["error"] | undefined,
  statusCode: number,
): string {
  if (typeof errorBody?.message === "string") {
    return errorBody.message;
  }

  if (typeof nestedError?.message === "string") {
    return nestedError.message;
  }

  return statusCode >= 500
    ? "Internal server error"
    : `API request failed with status ${statusCode}.`;
}

function normalizeErrorDetails(
  details: unknown,
): Record<string, string[]> | undefined {
  if (!isObject(details)) {
    return undefined;
  }

  const normalizedDetails = Object.entries(details).reduce<
    Record<string, string[]>
  >((result, [field, value]) => {
    const messages = Array.isArray(value)
      ? value.filter(
          (message): message is string => typeof message === "string",
        )
      : typeof value === "string"
        ? [value]
        : [];

    if (messages.length > 0) {
      result[field] = messages;
    }

    return result;
  }, {});

  return Object.keys(normalizedDetails).length > 0
    ? normalizedDetails
    : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function safeJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
