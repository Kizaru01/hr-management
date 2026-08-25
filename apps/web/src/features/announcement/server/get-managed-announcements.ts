import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { ManagedAnnouncement } from "../types/announcement";

export async function getManagedAnnouncements() {
  return authenticatedApi<ApiResponse<ManagedAnnouncement[]>>(
    "/announcements/manage",
  );
}
