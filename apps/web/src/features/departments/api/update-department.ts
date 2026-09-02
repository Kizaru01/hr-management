import type { UpdateDepartmentInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Department } from "../types/department";

export const updateDepartment = (
  departmentId: string,
  input: UpdateDepartmentInput,
) =>
  apiClient<ApiResponse<Department>>(
    `/api/departments/${encodeURIComponent(departmentId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to update department.",
    },
  );
