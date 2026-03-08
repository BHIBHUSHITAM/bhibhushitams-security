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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRoles = getRequiredRoles(pathname);

  if (!requiredRoles) {
    return NextResponse.next();
  }

  const userRole = request.cookies.get("userRole")?.value as
    | "student"
    | "company"
    | "admin"
    | undefined;

  if (!userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!requiredRoles.includes(userRole)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/company/:path*", "/admin/:path*"],
};
