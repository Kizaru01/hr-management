import type { ErrorResponse } from "@/types/error-response";
import { safeMessage } from "./safe-message";

type ApiRequestOptions = RequestInit & {
  fallbackMessage?: string;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;
  details?: ErrorResponse["error"]["details"];

  constructor(
    message: string,
    status: number,
    data?: unknown,
    details?: ErrorResponse["error"]["details"],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.details = details;
  }
}

const parseApiResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  const data = await safeJson(response);

  if (!response.ok) {
    const errorResponse = isErrorResponse(data) ? data : undefined;

    throw new ApiError(
      response.status >= 500
        ? fallbackMessage
        : safeMessage(errorResponse?.error.message, fallbackMessage),
      response.status,
      data,
      response.status < 500 && errorResponse?.error.details
        ? Object.fromEntries(
            Object.entries(errorResponse.error.details).map(
              ([field, messages]) => [
                field,
                (Array.isArray(messages) ? messages : []).map((message) =>
                  safeMessage(message, "Invalid value."),
                ),
              ],
            ),
          )
        : undefined,
    );
  }

  if (isErrorResponse(data))
    throw new ApiError(fallbackMessage, response.status, data);
  return data as T;
};

export const apiClient = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { fallbackMessage = "Something went wrong.", ...requestOptions } =
    options;

  let response: Response;

  try {
    response = await fetch(path, requestOptions);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      0,
    );
  }

  const data = await parseApiResponse<T>(response, fallbackMessage);

  if (
    (requestOptions.method ?? "GET").toUpperCase() !== "GET" &&
    response.status !== 204 &&
    (typeof data !== "object" ||
      data === null ||
      !("success" in data) ||
      data.success !== true)
  ) {
    throw new ApiError(
      "Could not confirm the result. Check the record before trying again.",
      502,
    );
  }

  return data;
};

const safeJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const isErrorResponse = (value: unknown): value is ErrorResponse =>
  typeof value === "object" &&
  value !== null &&
  "success" in value &&
  value.success === false &&
  "error" in value &&
  typeof value.error === "object" &&
  value.error !== null &&
  "message" in value.error &&
  typeof value.error.message === "string";
