import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { ManagedLeaveRequest } from "../types/leave";

export async function getLeaveRequests() {
  return authenticatedApi<ApiResponse<ManagedLeaveRequest[]>>("/leave");
}
