import type { ApiResponse } from "@/types/api";
import type { EmployeeDetails, UpdateEmployeeInput } from "../types/employee";

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput,
) => {
  const response = await fetch(`/api/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to update employee.");
  }

  return data as ApiResponse<EmployeeDetails>;
};
