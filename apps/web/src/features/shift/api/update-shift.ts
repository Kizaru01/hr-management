import type { UpdateShiftInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Shift } from "../types/shift";

export const updateShift = (shiftId: string, input: UpdateShiftInput) =>
  apiClient<ApiResponse<Shift>>(
    `/api/shifts/${encodeURIComponent(shiftId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to update shift.",
    },
  );
