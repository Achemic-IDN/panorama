import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get("auth")?.value;

  // ===== ADMIN =====
  if (pathname.startsWith("/admin/dashboard")) {
    if (auth !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ===== PASIEN =====
  if (pathname.startsWith("/dashboard")) {
    if (!auth || auth === "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};
