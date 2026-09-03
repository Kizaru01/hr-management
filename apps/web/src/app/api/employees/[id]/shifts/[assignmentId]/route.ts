import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";

interface AssignmentRouteContext {
  params: Promise<{ id: string; assignmentId: string }>;
}

export async function DELETE(
  _request: Request,
  { params }: AssignmentRouteContext,
) {
  try {
    const { assignmentId } = await params;
    const result = await authenticatedApi<ApiResponse<undefined>>(
      `/shift/assignment/${encodeURIComponent(assignmentId)}`,
      { method: "DELETE" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
