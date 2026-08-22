import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";

interface Branch {
  id: string;
  name: string;
}

export async function getBranches() {
  return authenticatedApi<ApiResponse<Branch[]>>("/branches");
}
