import type { CreateEmployeeInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { CreatedEmployee } from "../types/employee";

export const createEmployee = (input: CreateEmployeeInput) =>
  apiClient<ApiResponse<CreatedEmployee>>("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to create employee.",
  });
