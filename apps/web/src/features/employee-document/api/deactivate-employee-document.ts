import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { DeactivatedEmployeeDocument } from "../types/employee-document";

export const deactivateEmployeeDocument = (documentId: string) =>
  apiClient<ApiResponse<DeactivatedEmployeeDocument>>(
    `/api/employee-documents/${encodeURIComponent(documentId)}/deactivate`,
    {
      method: "PATCH",
      fallbackMessage: "Unable to deactivate employee document.",
    },
  );
