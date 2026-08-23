import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { AttendanceMutationData } from "@/features/attendance/types/attendance";

export async function POST() {
  try {
    const result = await authenticatedApi<
      ApiResponse<AttendanceMutationData>
    >("/attendance/check-out", {
      method: "POST",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error, "api");
  }
}
