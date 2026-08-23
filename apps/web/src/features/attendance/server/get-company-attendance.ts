import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { AttendanceSummaryData } from "../types/attendance";

export async function getCompanyAttendance() {
  return authenticatedApi<ApiResponse<AttendanceSummaryData>>(
    "/attendance/company",
  );
}
