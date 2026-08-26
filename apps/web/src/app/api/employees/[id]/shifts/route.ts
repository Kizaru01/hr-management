import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { EmployeeShiftAssignment } from "@/features/shift/types/shift";

interface AssignShiftRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: AssignShiftRouteContext,
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const result = await authenticatedApi<
      ApiResponse<EmployeeShiftAssignment>
    >(`/shift/employee/${encodeURIComponent(id)}`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error, "api");
  }
}
