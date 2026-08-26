import type { CreateShiftInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Shift } from "../types/shift";

export const createShift = (input: CreateShiftInput) =>
  apiClient<ApiResponse<Shift>>("/api/shifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to create shift.",
  });
