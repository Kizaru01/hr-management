import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "../types/branch";

export const changeBranchStatus = (
  branchId: string,
  action: "deactivate" | "reactivate",
) =>
  apiClient<ApiResponse<Branch>>(
    `/api/branches/${encodeURIComponent(branchId)}/${action}`,
    {
      method: "PATCH",
      fallbackMessage: `Unable to ${action} branch.`,
    },
  );
