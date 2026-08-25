import type { UpdateEmployeeInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput,
): Promise<void> => {
  await apiClient(`/api/employees/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    fallbackMessage: "Unable to update employee.",
  });
};
