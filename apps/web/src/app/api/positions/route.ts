import { authenticatedApi } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";
import { RequestError } from "@/lib/errors/http-errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    if (!departmentId) {
      throw new RequestError(400, "Department is required.");
    }

    const result = await authenticatedApi(
      `/positions?departmentId=${departmentId}`,
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "api");
  }
}
