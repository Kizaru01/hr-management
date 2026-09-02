import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { Position } from "@/features/positions/types/position";

interface DepartmentPositionsRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: DepartmentPositionsRouteContext,
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const result = await authenticatedApi<ApiResponse<Position>>(
      "/positions",
      {
        method: "POST",
        body: JSON.stringify({
          ...body,
          departmentId: id,
        }),
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error, "api");
  }
}
