import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { CreatedEmployeeDocument } from "@/features/employee-document/types/employee-document";

interface UploadEmployeeDocumentRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: UploadEmployeeDocumentRouteContext,
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const result = await authenticatedApi<
      ApiResponse<CreatedEmployeeDocument>
    >(`/employee/${encodeURIComponent(id)}/documents`, {
      method: "POST",
      body: formData,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error, "api");
  }
}
