import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { AttendanceMutationData } from "../types/attendance";

export const checkOut = async () =>
  apiClient<ApiResponse<AttendanceMutationData>>(
    "/api/attendance/check-out",
    {
      method: "POST",
      fallbackMessage: "Unable to check out.",
    },
  );
