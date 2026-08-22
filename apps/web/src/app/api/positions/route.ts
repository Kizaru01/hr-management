import { authenticatedApi } from "@/lib/api/authenticated-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId");

  if (!departmentId) {
    return NextResponse.json(
      { message: "Department is required." },
      { status: 400 },
    );
  }

  const result = await authenticatedApi(
    `/positions?departmentId=${departmentId}`,
  );

  return NextResponse.json(result);
}
