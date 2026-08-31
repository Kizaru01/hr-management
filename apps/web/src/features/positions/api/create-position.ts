import type { CreatePositionInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Position } from "../types/position";

type CreatePositionDetails = Omit<CreatePositionInput, "departmentId">;

export const createPosition = (
  departmentId: string,
  input: CreatePositionDetails,
) =>
  apiClient<ApiResponse<Position>>(
    `/api/departments/${encodeURIComponent(departmentId)}/positions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to create position.",
    },
  );
