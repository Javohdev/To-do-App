import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { routing } from "@/i18n/routing";
import { authConfig } from "@/lib/auth.config";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Static files and Next internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const locale = routing.locales.includes(segments[0] as any)
    ? segments[0]
    : routing.defaultLocale;

  const pathWithoutLocale = routing.locales.includes(segments[0] as any)
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  const isAuthRoute =
    pathWithoutLocale === "/login" || pathWithoutLocale === "/register";
  const isProtectedRoute =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale.startsWith("/tasks");

  const isLoggedIn = !!req.auth;

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
