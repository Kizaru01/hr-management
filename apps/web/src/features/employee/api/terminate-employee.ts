import type { TerminateEmployeeInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";

export const terminateEmployee = async (
  employeeId: string,
  input: TerminateEmployeeInput,
): Promise<void> => {
  await apiClient(
    `/api/employees/${encodeURIComponent(employeeId)}/terminate`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      fallbackMessage: "Unable to terminate employee.",
    },
  );
};
