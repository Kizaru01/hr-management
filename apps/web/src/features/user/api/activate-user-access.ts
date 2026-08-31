import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { ManagedUser } from "../types/user";

export const activateUserAccess = (userId: string) =>
  apiClient<ApiResponse<ManagedUser>>(
    `/api/users/${encodeURIComponent(userId)}/activate`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to activate account access.",
    },
  );
