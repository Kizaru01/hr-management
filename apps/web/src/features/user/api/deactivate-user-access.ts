import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { ManagedUser } from "../types/user";

export const deactivateUserAccess = (userId: string) =>
  apiClient<ApiResponse<ManagedUser>>(
    `/api/users/${encodeURIComponent(userId)}/deactivate`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to deactivate account access.",
    },
  );
