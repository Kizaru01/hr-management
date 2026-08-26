import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeShiftAssignment } from "../types/shift";

export function getEmployeeShiftAssignments(employeeId: string) {
  return authenticatedApi<ApiResponse<EmployeeShiftAssignment[]>>(
    `/shift/employee/${encodeURIComponent(employeeId)}`,
  );
}
