import { NextResponse } from "next/server";
import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import type { ApiResponse } from "@/types/api";
import type { MarkAllNotificationsReadResult } from "@/features/notification/types/notification";

export async function PATCH() {
  try {
    const result = await authenticatedApi<
      ApiResponse<MarkAllNotificationsReadResult>
    >("/notifications/read-all", { method: "PATCH" });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
