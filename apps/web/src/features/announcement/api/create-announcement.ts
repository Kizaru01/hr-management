import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { CreateAnnouncementInput } from "@hr-management/validation";
import type { CreatedAnnouncement } from "../types/announcement";

export const createAnnouncement = async (
  input: CreateAnnouncementInput,
) =>
  apiClient<ApiResponse<CreatedAnnouncement>>("/api/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to create announcement.",
  });
