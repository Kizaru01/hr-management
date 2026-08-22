import { NextResponse } from "next/server";

import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";

export async function GET() {
  try {
    const result = await authenticatedApi("/auth/me");

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
