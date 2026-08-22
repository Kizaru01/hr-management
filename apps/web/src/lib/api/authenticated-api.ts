import { cookies } from "next/headers";

export class AuthenticatedApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "AuthenticatedApiError";
    this.status = status;
    this.data = data;
  }
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
    throw new Error("Unauthenticated.");
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

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new AuthenticatedApiError(
      typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
        ? String(data.message)
        : `API request failed with status ${response.status}.`,
      response.status,
      data,
    );
  }

  return data as T;
}
