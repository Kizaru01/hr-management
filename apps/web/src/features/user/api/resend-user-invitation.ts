import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";

export const resendUserInvitation = (userId: string) =>
  apiClient<ApiResponse<undefined>>(
    `/api/users/${encodeURIComponent(userId)}/resend-invitation`,
    {
      method: "POST",
      fallbackMessage: "Unable to resend the invitation.",
    },
  );
