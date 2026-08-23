import { NextResponse } from "next/server";

import { apiResponse } from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    id: string;
    email: string;
    role: "admin" | "hr" | "employee";
    lastLoginAt: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      throw new Error("API_URL is not configured.");
    }

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await apiResponse<LoginResponse>(response);

    const result = NextResponse.json({
      success: true,
      message: data.message,
      data: {
        id: data.data.id,
        email: data.data.email,
        role: data.data.role,
        lastLoginAt: data.data.lastLoginAt,
      },
    });

    result.cookies.set({
      name: "access_token",
      value: data.data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return result;
  } catch (error) {
    return handleError(error, "api");
  }
}
