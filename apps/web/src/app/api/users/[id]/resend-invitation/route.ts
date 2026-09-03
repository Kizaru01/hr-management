import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await authenticatedApi<ApiResponse<undefined>>(
      `/user/${encodeURIComponent(id)}/resend-invitation`,
      { method: "POST" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
