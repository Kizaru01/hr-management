import type { PositionQueryInput } from "@hr-management/validation";
import { queryString } from "@/lib/list-query";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Position } from "../types/position";

export async function getDepartmentPositions(
  departmentId: string,
  query: PositionQueryInput = {},
) {
  return authenticatedApi<ApiResponse<Position[]>>(
    `/departments/${encodeURIComponent(departmentId)}/positions` +
      queryString(query),
  );
}
