import type { ActivateAccountInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { AuthenticatedUser } from "./login";

export const activateAccount = (input: ActivateAccountInput) =>
  apiClient<ApiResponse<AuthenticatedUser>>("/api/auth/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to activate the account.",
  });
