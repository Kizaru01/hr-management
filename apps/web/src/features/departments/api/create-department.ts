import type { CreateDepartmentInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Department } from "../types/department";

export const createDepartment = (input: CreateDepartmentInput) =>
  apiClient<ApiResponse<Department>>("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to create department.",
  });
