import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Shift } from "../types/shift";

export const deactivateShift = (shiftId: string) =>
  apiClient<ApiResponse<Shift>>(
    `/api/shifts/${encodeURIComponent(shiftId)}/deactivate`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to deactivate shift.",
    },
  );
