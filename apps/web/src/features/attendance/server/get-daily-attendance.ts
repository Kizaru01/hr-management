import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import { DailyAttendanceRecord } from "../types/attendance";

export async function getDailyAttendance(date?: string) {
  const query = date ? `?date=${date}` : "";

  return authenticatedApi<ApiResponse<DailyAttendanceRecord[]>>(
    `/attendance/daily${query}`,
  );
}
