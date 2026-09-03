import type { NextResponse } from "next/server";

export function setAccessTokenCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "access_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
}
