import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { ManagedEmployeeDocument } from "../types/employee-document";

export function getManagedEmployeeDocuments() {
  return authenticatedApi<ApiResponse<ManagedEmployeeDocument[]>>(
    "/employee/documents",
  );
}
