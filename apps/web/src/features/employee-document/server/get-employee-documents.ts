import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeDocument } from "../types/employee-document";

export function getEmployeeDocuments(employeeId: string) {
  return authenticatedApi<ApiResponse<EmployeeDocument[]>>(
    `/employee/${encodeURIComponent(employeeId)}/documents`,
  );
}
