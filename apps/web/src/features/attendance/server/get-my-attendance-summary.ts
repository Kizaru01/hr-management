import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeAttendanceSummary } from "../types/attendance";

export async function getMyAttendanceSummary(from: string, to: string) {
  const query = new URLSearchParams({ from, to });

  return authenticatedApi<ApiResponse<EmployeeAttendanceSummary>>(
    `/attendance/me/summary?${query}`,
  );
}
