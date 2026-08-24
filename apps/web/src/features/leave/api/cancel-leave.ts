import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { EmployeeLeaveRequest } from "../types/leave";

export const cancelLeave = async (leaveRequestId: string) =>
  apiClient<ApiResponse<EmployeeLeaveRequest>>(
    `/api/leave/${encodeURIComponent(leaveRequestId)}/cancel`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to cancel leave request.",
    },
  );
