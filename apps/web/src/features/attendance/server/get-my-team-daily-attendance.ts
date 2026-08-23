import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { DailyAttendanceRecord } from "../types/attendance";

export async function getMyTeamDailyAttendance(date?: string) {
  const query = date ? new URLSearchParams({ date }) : null;

  return authenticatedApi<ApiResponse<DailyAttendanceRecord[]>>(
    `/attendance/team${query ? `?${query}` : ""}`,
  );
}
