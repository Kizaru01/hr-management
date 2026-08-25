import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { NotificationReadResult } from "../types/notification";

export const markNotificationAsRead = async (notificationId: string) =>
  apiClient<ApiResponse<NotificationReadResult>>(
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to mark notification as read.",
    },
  );
