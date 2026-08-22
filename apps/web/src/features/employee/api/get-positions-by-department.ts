import type { ApiResponse } from "@/types/api";

interface PositionLookup {
  id: string;
  name: string;
}

export const getPositionsByDepartment = async (departmentId: string) => {
  const response = await fetch(`/api/positions?departmentId=${departmentId}`);

  if (!response.ok) {
    throw new Error("Unable to load positions.");
  }

  return response.json() as Promise<ApiResponse<PositionLookup[]>>;
};
