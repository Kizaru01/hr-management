import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Announcement } from "../types/announcement";

export async function getAnnouncements() {
  return authenticatedApi<ApiResponse<Announcement[]>>("/announcements");
}
