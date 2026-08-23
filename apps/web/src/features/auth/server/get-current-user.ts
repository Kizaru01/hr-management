import { authenticatedApi } from "@/lib/api/authenticated-api";
import { RequestError } from "@/lib/errors/http-errors";

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
  try {
    const result = await authenticatedApi<CurrentUserResponse>("/auth/me");

    return result.data;
  } catch (error) {
    if (error instanceof RequestError) {
      return null;
    }

    throw error;
  }
}
