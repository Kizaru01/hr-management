import { NextResponse } from "next/server";
import { setAccessTokenCookie } from "@/features/auth/server/set-access-token-cookie";
import { apiResponse } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";

interface ActivationResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: "admin" | "hr" | "employee" | "manager";
      lastLoginAt: string | null;
    };
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      throw new Error("API_URL is not configured.");
    }

    const response = await fetch(`${apiUrl}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await apiResponse<ActivationResponse>(response);
    const result = NextResponse.json({
      success: true,
      message: data.message,
      data: data.data.user,
    });

    setAccessTokenCookie(result, data.data.accessToken);

    return result;
  } catch (error) {
    return handleError(error, "api");
  }
}
