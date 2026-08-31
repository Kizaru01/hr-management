import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { Shift } from "@/features/shift/types/shift";

interface DeactivateShiftRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: DeactivateShiftRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<ApiResponse<Shift>>(
      `/shift/${encodeURIComponent(id)}/deactivate`,
      { method: "PATCH" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
