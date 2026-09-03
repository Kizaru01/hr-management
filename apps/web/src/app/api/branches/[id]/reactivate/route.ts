import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "@/features/branch/types/branch";

interface BranchStatusRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: BranchStatusRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<ApiResponse<Branch>>(
      `/branches/${encodeURIComponent(id)}/reactivate`,
      { method: "PATCH" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
