import { cookies } from "next/headers";

export interface CurrentUser {
  id: string;
  email: string;
  role: "admin" | "hr" | "employee";
}

interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: CurrentUser;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
  }

  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not configured.");
  }

  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },

    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as CurrentUserResponse;

  return result.data;
}
