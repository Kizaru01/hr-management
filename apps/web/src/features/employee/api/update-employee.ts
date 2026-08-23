import type { UpdateEmployeeInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { EmployeeDetails } from "../types/employee";

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput,
) => {
  return apiClient<ApiResponse<EmployeeDetails>>(`/api/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to update employee.",
  });
};
