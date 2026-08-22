import { HrDashboardData } from "@/features/dashboard/types/dashboard";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";

export async function getHrDashboard() {
  return authenticatedApi<ApiResponse<HrDashboardData>>("/dashboard/hr");
}
