import type { DepartmentQueryInput } from "@hr-management/validation";
import { queryString } from "@/lib/list-query";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Department } from "../types/department";

export async function getDepartments(query: DepartmentQueryInput = {}) {
  return authenticatedApi<ApiResponse<Department[]>>(
    "/departments" + queryString(query),
  );
}
