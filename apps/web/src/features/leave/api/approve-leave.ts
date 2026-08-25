import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { LeaveDecision } from "../types/leave";

export const approveLeave = async (leaveRequestId: string) =>
  apiClient<ApiResponse<LeaveDecision<"approved">>>(
    `/api/leave/${encodeURIComponent(leaveRequestId)}/approve`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to approve leave request.",
    },
  );
