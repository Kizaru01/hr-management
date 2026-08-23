import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";

interface PositionLookup {
  id: string;
  name: string;
}

export const getPositionsByDepartment = async (departmentId: string) => {
  return apiClient<ApiResponse<PositionLookup[]>>(
    `/api/positions?departmentId=${departmentId}`,
    { fallbackMessage: "Unable to load positions." },
  );
};
