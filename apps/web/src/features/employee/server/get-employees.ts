import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeListItem } from "../types/employee";

export async function getEmployees() {
  return authenticatedApi<ApiResponse<EmployeeListItem[]>>("/employee");
}
