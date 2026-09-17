import { NextResponse, type NextRequest } from "next/server";
import type { AuthUser } from "@/lib/api/types";

const PROTECTED_PREFIXES = ["/dashboard", "/tasks", "/admin", "/settings"];
const AUTH_ONLY_PAGES = ["/login", "/register", "/forgot-password"];

function readSessionUser(request: NextRequest): AuthUser | null {
  const raw = request.cookies.get("mt_user")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated =
    Boolean(request.cookies.get("mt_at")?.value) || Boolean(request.cookies.get("mt_rt")?.value);

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_ONLY_PAGES.some((page) => pathname.startsWith(page)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin")) {
    const user = readSessionUser(request);
    if (user?.role !== "admin") {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("reason", "forbidden");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
