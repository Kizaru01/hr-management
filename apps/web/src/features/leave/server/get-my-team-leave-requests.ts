import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { ManagedLeaveRequest } from "../types/leave";

export async function getMyTeamLeaveRequests() {
  return authenticatedApi<ApiResponse<ManagedLeaveRequest[]>>("/leave/team");
}
