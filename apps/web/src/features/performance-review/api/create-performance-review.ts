import type { CreatePerformanceReviewInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { CreatedPerformanceReview } from "../types/performance-review";

export const createPerformanceReview = (
  employeeId: string,
  input: CreatePerformanceReviewInput,
) =>
  apiClient<ApiResponse<CreatedPerformanceReview>>(
    `/api/employees/${encodeURIComponent(employeeId)}/performance-reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to create performance review.",
    },
  );
