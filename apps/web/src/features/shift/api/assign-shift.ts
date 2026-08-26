import type { AssignShiftInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { EmployeeShiftAssignment } from "../types/shift";

export const assignShift = (
  employeeId: string,
  input: AssignShiftInput,
) =>
  apiClient<ApiResponse<EmployeeShiftAssignment>>(
    `/api/employees/${encodeURIComponent(employeeId)}/shifts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to assign shift.",
    },
  );
