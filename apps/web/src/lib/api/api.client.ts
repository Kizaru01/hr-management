import type { ErrorResponse } from "@/types/error-response";

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
      errorResponse?.error.message ?? fallbackMessage,
      response.status,
      data,
      errorResponse?.error.details,
    );
  }

  return data as T;
};

export const apiClient = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { fallbackMessage = "Something went wrong.", ...requestOptions } =
    options;
  const response = await fetch(path, requestOptions);

  return parseApiResponse<T>(response, fallbackMessage);
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
