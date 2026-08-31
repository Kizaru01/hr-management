import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { PerformanceReview } from "../types/performance-review";

export function getEmployeePerformanceReviews(employeeId: string) {
  return authenticatedApi<ApiResponse<PerformanceReview[]>>(
    `/employee/${encodeURIComponent(employeeId)}/performance-reviews`,
  );
}
