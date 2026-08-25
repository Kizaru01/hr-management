import type { RejectLeaveInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { LeaveDecision } from "../types/leave";

export const rejectLeave = async (
  leaveRequestId: string,
  input: RejectLeaveInput,
) =>
  apiClient<ApiResponse<LeaveDecision<"rejected">>>(
    `/api/leave/${encodeURIComponent(leaveRequestId)}/reject`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to reject leave request.",
    },
  );
