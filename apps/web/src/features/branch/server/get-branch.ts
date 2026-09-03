import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "../types/branch";

export async function getBranch(id: string) {
  return authenticatedApi<ApiResponse<Branch>>(
    `/branches/${encodeURIComponent(id)}`,
  );
}
