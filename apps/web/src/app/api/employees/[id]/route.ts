import {
  AuthenticatedApiError,
  authenticatedApi,
} from "@/lib/api/authenticated-api";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await authenticatedApi(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthenticatedApiError) {
      return NextResponse.json(error.data, {
        status: error.status,
      });
    }

    console.error("Update employee failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update employee.",
      },
      {
        status: 500,
      },
    );
  }
}
