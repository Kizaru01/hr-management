import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "admin" | "hr" | "employee";
  lastLoginAt: string;
}

export const login = async (
  input: LoginInput,
): Promise<ApiResponse<AuthenticatedUser>> => {
  return apiClient<ApiResponse<AuthenticatedUser>>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to sign in.",
  });
};
