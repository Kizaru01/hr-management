import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { AttendanceSummaryData } from "../types/attendance";

export async function getAttendanceSummary(date?: string) {
  const query = date ? `?date=${date}` : "";

  return authenticatedApi<ApiResponse<AttendanceSummaryData>>(
    `/attendance/summary${query}`,
  );
}
