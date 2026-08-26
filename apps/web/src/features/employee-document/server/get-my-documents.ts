import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeDocument } from "../types/employee-document";

export function getMyDocuments() {
  return authenticatedApi<ApiResponse<EmployeeDocument[]>>(
    "/employee/me/documents",
  );
}
