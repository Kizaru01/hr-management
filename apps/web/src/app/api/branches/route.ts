import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "@/features/branch/types/branch";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = await authenticatedApi<ApiResponse<Branch>>("/branches", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error, "api");
  }
}
