import type { UpdateBranchInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "../types/branch";

export const updateBranch = (branchId: string, input: UpdateBranchInput) =>
  apiClient<ApiResponse<Branch>>(
    `/api/branches/${encodeURIComponent(branchId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to update branch.",
    },
  );
