import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type {
  CreateEmployeeLeaveInput,
  EmployeeLeaveRequest,
} from "../types/leave";

export const createLeave = async (input: CreateEmployeeLeaveInput) =>
  apiClient<ApiResponse<EmployeeLeaveRequest>>("/api/leave", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to submit leave request.",
  });
