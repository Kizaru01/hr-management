import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";

export const removeShiftAssignment = (
  employeeId: string,
  assignmentId: string,
) =>
  apiClient<ApiResponse<undefined>>(
    `/api/employees/${encodeURIComponent(employeeId)}/shifts/${encodeURIComponent(assignmentId)}`,
    {
      method: "DELETE",
      fallbackMessage: "Unable to remove shift assignment.",
    },
  );
