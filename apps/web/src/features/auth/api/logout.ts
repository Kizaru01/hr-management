import { apiClient } from "@/lib/api/api.client";

interface LogoutResponse {
  success: true;
  message: string;
}

export const logout = async () =>
  apiClient<LogoutResponse>("/api/auth/logout", {
    method: "POST",
    fallbackMessage: "Unable to log out.",
  });
