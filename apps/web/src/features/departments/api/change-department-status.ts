import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Department } from "../types/department";

export const changeDepartmentStatus = (
  departmentId: string,
  action: "deactivate" | "reactivate",
) =>
  apiClient<ApiResponse<Department>>(
    `/api/departments/${encodeURIComponent(departmentId)}/${action}`,
    {
      method: "PATCH",
      fallbackMessage: `Unable to ${action} department.`,
    },
  );
