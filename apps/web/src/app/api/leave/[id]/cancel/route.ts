import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { EmployeeLeaveRequest } from "@/features/leave/types/leave";

interface CancelLeaveRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: CancelLeaveRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<ApiResponse<EmployeeLeaveRequest>>(
      `/leave/${encodeURIComponent(id)}/cancel`,
      { method: "PATCH" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
