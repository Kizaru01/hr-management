import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { ManagedUser } from "@/features/user/types/user";

interface DeactivateUserRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: DeactivateUserRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<ApiResponse<ManagedUser>>(
      `/user/${encodeURIComponent(id)}/deactivate`,
      { method: "PATCH" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
