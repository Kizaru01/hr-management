import type { BranchQueryInput } from "@hr-management/validation";
import { queryString } from "@/lib/list-query";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "../types/branch";

export async function getBranches(query: BranchQueryInput = {}) {
  return authenticatedApi<ApiResponse<Branch[]>>(
    "/branches" + queryString(query),
  );
}
