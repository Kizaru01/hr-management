import { cache } from "react";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { UnreadNotificationCount } from "../types/notification";

export const getUnreadNotificationCount = cache(async () => {
  return authenticatedApi<ApiResponse<UnreadNotificationCount>>(
    "/notifications/unread-count",
  );
});
