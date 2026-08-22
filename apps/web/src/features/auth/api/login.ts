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

export async function login(
  input: LoginInput,
): Promise<ApiResponse<AuthenticatedUser>> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ApiResponse<AuthenticatedUser>;

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}
