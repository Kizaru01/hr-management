import type { UpdatePositionInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Position } from "../types/position";

export const updatePosition = (id: string, input: UpdatePositionInput) =>
  apiClient<ApiResponse<Position>>(`/api/positions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to update position.",
  });
