import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Position } from "../types/position";

type PositionStatusAction = "deactivate" | "reactivate";

export const changePositionStatus = (
  id: string,
  action: PositionStatusAction,
) =>
  apiClient<ApiResponse<Position>>(
    `/api/positions/${encodeURIComponent(id)}/${action}`,
    {
      method: "PATCH",
      fallbackMessage: `Unable to ${action} position.`,
    },
  );
