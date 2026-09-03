import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const hasValidToken = token ? !isExpiredToken(token) : false;

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employee") ||
    pathname.startsWith("/users");

  const isLoginRoute = pathname === "/login";

  if (isProtectedRoute && !hasValidToken) {
    return redirectToLogin(request, token);
  }

  if (isLoginRoute && hasValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isLoginRoute && token) {
    return clearAccessToken(NextResponse.next());
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, token?: string) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  return token ? clearAccessToken(response) : response;
}

function clearAccessToken(response: NextResponse) {
  response.cookies.delete("access_token");
  return response;
}

function isExpiredToken(token: string): boolean {
  try {
    const payloadSegment = token.split(".")[1];

    if (!payloadSegment) {
      return true;
    }

    const payload = JSON.parse(atob(payloadSegment)) as {
      exp?: unknown;
    };

    return typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000;
  } catch {
    return true;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/employee/:path*", "/users/:path*", "/login"],
};
