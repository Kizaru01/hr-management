import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Department } from "../types/department";

export async function getDepartment(id: string) {
  return authenticatedApi<ApiResponse<Department>>(
    `/departments/${encodeURIComponent(id)}`,
  );
}
