import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { NotificationReadResult } from "@/features/notification/types/notification";

interface MarkNotificationReadRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: MarkNotificationReadRouteContext,
) {
  try {
    const { id } = await params;
    const result = await authenticatedApi<
      ApiResponse<NotificationReadResult>
    >(`/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
