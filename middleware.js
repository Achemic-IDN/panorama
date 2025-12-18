import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const adminAuth = request.cookies.get("admin-auth");
  const pasienAuth = request.cookies.get("pasien-auth");

  // 🔒 ADMIN
  if (pathname.startsWith("/admin")) {
    if (!adminAuth) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
  }

  // 🔒 PASIEN
  if (pathname.startsWith("/dashboard")) {
    if (!pasienAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
