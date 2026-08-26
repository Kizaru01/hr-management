import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Shift } from "../types/shift";

export function getShifts() {
  return authenticatedApi<ApiResponse<Shift[]>>("/shift");
}
