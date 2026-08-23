import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeAttendanceHistoryRecord } from "../types/attendance";

export async function getEmployeeAttendanceHistory(
  employeeId: string,
  from: string,
  to: string,
) {
  const query = new URLSearchParams({ from, to });

  return authenticatedApi<ApiResponse<EmployeeAttendanceHistoryRecord[]>>(
    `/attendance/employee/${employeeId}?${query}`,
  );
}
