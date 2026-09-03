import type { CreateBranchInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "../types/branch";

export const createBranch = (input: CreateBranchInput) =>
  apiClient<ApiResponse<Branch>>("/api/branches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to create branch.",
  });
