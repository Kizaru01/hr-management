import type { CreateUserInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { CreatedUser } from "../types/user";

export const createUser = (input: CreateUserInput) =>
  apiClient<ApiResponse<CreatedUser>>("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to create account.",
  });
