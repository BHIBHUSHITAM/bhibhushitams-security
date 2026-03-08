import { NextRequest, NextResponse } from "next/server";

const roleAccessRules: Record<string, Array<"student" | "company" | "admin">> = {
  "/student": ["student", "admin"],
  "/company": ["company", "admin"],
  "/admin": ["admin"],
};

function getRequiredRoles(pathname: string) {
  if (pathname.startsWith("/student")) {
    return roleAccessRules["/student"];
  }
  if (pathname.startsWith("/company")) {
    return roleAccessRules["/company"];
  }
  if (pathname.startsWith("/admin")) {
    return roleAccessRules["/admin"];
  }
  return null;
}

function isTokenExpired(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return true;
    }

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalizedPayload);
    const payload = JSON.parse(decoded) as { exp?: number };

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRoles = getRequiredRoles(pathname);

  if (!requiredRoles) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value as
    | "student"
    | "company"
    | "admin"
    | undefined;

  if (!accessToken || !userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isTokenExpired(accessToken)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("userRole");
    return response;
  }

  if (!requiredRoles.includes(userRole)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/company/:path*", "/admin/:path*"],
};
