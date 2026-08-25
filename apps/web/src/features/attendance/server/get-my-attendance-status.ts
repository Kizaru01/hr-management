import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { MyAttendanceStatus } from "../types/attendance";

export async function getMyAttendanceStatus() {
  return authenticatedApi<ApiResponse<MyAttendanceStatus>>(
    "/attendance/me/status",
  );
}
