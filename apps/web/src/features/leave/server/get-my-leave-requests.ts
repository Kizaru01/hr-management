import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeLeaveRequest } from "../types/leave";

export async function getMyLeaveRequests() {
  return authenticatedApi<ApiResponse<EmployeeLeaveRequest[]>>("/leave/me");
}
