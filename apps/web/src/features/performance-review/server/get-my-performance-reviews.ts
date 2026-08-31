import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { PerformanceReview } from "../types/performance-review";

export function getMyPerformanceReviews() {
  return authenticatedApi<ApiResponse<PerformanceReview[]>>(
    "/employee/me/performance-reviews",
  );
}
