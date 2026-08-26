import type { CreateEmployeeDocumentInput } from "@hr-management/validation";
import { apiClient } from "@/lib/api/api.client";
import type { ApiResponse } from "@/types/api";
import type { CreatedEmployeeDocument } from "../types/employee-document";

export const uploadEmployeeDocument = (
  employeeId: string,
  file: File,
  input: CreateEmployeeDocumentInput,
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", input.title);
  formData.append("type", input.type);

  if (input.issuedAt) {
    formData.append("issuedAt", input.issuedAt);
  }

  if (input.expiresAt) {
    formData.append("expiresAt", input.expiresAt);
  }

  return apiClient<ApiResponse<CreatedEmployeeDocument>>(
    `/api/employees/${encodeURIComponent(employeeId)}/documents`,
    {
      method: "POST",
      body: formData,
      fallbackMessage: "Unable to upload employee document.",
    },
  );
};
