import { authenticatedApi } from "@/lib/api/authenticated-api";
import { ApiResponse } from "@/types/api";
import { EmployeeDetails } from "../types/employee";

export async function getEmployee(id: string) {
  return authenticatedApi<ApiResponse<EmployeeDetails>>(`/employee/${id}`);
}
