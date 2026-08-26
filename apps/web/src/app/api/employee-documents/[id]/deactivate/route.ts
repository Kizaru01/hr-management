import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { DeactivatedEmployeeDocument } from "@/features/employee-document/types/employee-document";

interface DeactivateEmployeeDocumentRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: DeactivateEmployeeDocumentRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<
      ApiResponse<DeactivatedEmployeeDocument>
    >(`/employee/documents/${encodeURIComponent(id)}/deactivate`, {
      method: "PATCH",
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
