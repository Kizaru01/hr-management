import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";

interface UnreadCountData {
  count: number;
}

export async function getUnreadCount() {
  return authenticatedApi<ApiResponse<UnreadCountData>>(
    "/notifications/unread-count",
  );
}
