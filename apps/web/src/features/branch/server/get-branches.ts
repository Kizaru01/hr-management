import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "../types/branch";

export async function getBranches() {
  return authenticatedApi<ApiResponse<Branch[]>>("/branches");
}
