import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { ManagedUser } from "@/features/user/types/user";

interface UserRoleRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: UserRoleRouteContext) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const result = await authenticatedApi<ApiResponse<ManagedUser>>(
      `/user/${encodeURIComponent(id)}/role`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
