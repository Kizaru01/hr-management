import type { AssignManagerInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";

export const assignManager = async (
  employeeId: string,
  managerId: AssignManagerInput["managerId"],
): Promise<void> => {
  await apiClient(
    `/api/employees/${encodeURIComponent(employeeId)}/manager`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId }),
      fallbackMessage: "Unable to assign manager.",
    },
  );
};
