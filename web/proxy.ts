import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_PAGE_PREFIXES,
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
} from "@/lib/auth-routes";

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = Boolean(sessionCookie);

  if (matchesPrefix(pathname, PROTECTED_ROUTE_PREFIXES) && !isAuthenticated) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users on login → role-aware redirect hub (not hard-coded /dashboard)
  if (matchesPrefix(pathname, AUTH_PAGE_PREFIXES) && isAuthenticated) {
    const redirectUrl = new URL(AUTH_ROUTES.redirect, request.url);
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

    if (callbackUrl) {
      redirectUrl.searchParams.set("callbackUrl", callbackUrl);
    }

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/login"],
};
