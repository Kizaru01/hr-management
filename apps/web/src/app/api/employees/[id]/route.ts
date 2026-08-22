import { authenticatedApi } from "@/lib/api/authenticated-api";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const body = await request.json();

  const result = await authenticatedApi(`/employee/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return NextResponse.json(result);
}
