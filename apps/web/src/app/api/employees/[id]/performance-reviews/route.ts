import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { CreatedPerformanceReview } from "@/features/performance-review/types/performance-review";

interface CreatePerformanceReviewRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: CreatePerformanceReviewRouteContext,
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const result = await authenticatedApi<
      ApiResponse<CreatedPerformanceReview>
    >(`/employee/${encodeURIComponent(id)}/performance-reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const response: ApiResponse<CreatedPerformanceReview> = {
      success: result.success,
      message: result.message,
      data: {
        id: result.data.id,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleError(error, "api");
  }
}
