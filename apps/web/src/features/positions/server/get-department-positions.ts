import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Position } from "../types/position";

export async function getDepartmentPositions(departmentId: string) {
  return authenticatedApi<ApiResponse<Position[]>>(
    `/departments/${encodeURIComponent(departmentId)}/positions`,
  );
}
