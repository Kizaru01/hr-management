import type { EmployeeQueryInput } from "@hr-management/validation";
import { queryString } from "@/lib/list-query";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { EmployeeListItem } from "../types/employee";

export async function getEmployees(query: EmployeeQueryInput = {}) {
  return authenticatedApi<ApiResponse<EmployeeListItem[]>>(
    "/employees" + queryString(query),
  );
}
