import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "../types/notification";

export async function getNotifications() {
  return authenticatedApi<ApiResponse<Notification[]>>("/notifications");
}
