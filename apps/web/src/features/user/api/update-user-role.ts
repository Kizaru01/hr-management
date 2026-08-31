import type { UpdateUserRoleInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { ManagedUser } from "../types/user";

export const updateUserRole = (
  userId: string,
  input: UpdateUserRoleInput,
) =>
  apiClient<ApiResponse<ManagedUser>>(
    `/api/users/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to update account role.",
    },
  );
