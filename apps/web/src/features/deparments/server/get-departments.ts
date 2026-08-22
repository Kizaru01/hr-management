import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";

interface Department {
  id: string;
  name: string;
}

export async function getDepartments() {
  return authenticatedApi<ApiResponse<Department[]>>("/department");
}
