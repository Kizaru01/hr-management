import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";

interface PositionLookup {
  id: string;
  name: string;
}

export const getPositionsByDepartment = async (
  departmentId: string,
  signal?: AbortSignal,
) => {
  const query = new URLSearchParams({ departmentId });

  return apiClient<ApiResponse<PositionLookup[]>>(
    `/api/positions?${query}`,
    { signal, fallbackMessage: "Unable to load positions." },
  );
};
