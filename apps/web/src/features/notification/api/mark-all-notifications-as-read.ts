import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { MarkAllNotificationsReadResult } from "../types/notification";

export const markAllNotificationsAsRead = async () =>
  apiClient<ApiResponse<MarkAllNotificationsReadResult>>(
    "/api/notifications/read-all",
    {
      method: "PATCH",
      fallbackMessage: "Unable to mark all notifications as read.",
    },
  );
