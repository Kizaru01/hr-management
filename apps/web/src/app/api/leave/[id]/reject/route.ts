import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { LeaveDecision } from "@/features/leave/types/leave";

interface RejectLeaveRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RejectLeaveRouteContext,
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const result = await authenticatedApi<
      ApiResponse<LeaveDecision<"rejected">>
    >(`/leave/${encodeURIComponent(id)}/reject`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
