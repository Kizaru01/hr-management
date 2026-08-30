import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { ManagedUser } from "../types/user";

export function getUsers() {
  return authenticatedApi<ApiResponse<ManagedUser[]>>("/user");
}
