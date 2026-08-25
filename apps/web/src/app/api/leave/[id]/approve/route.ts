import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { LeaveDecision } from "@/features/leave/types/leave";

interface ApproveLeaveRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: ApproveLeaveRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<
      ApiResponse<LeaveDecision<"approved">>
    >(`/leave/${encodeURIComponent(id)}/approve`, { method: "PATCH" });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
