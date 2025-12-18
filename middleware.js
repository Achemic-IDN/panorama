import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const auth = request.cookies.get("auth")?.value;

  // 🔐 Proteksi dashboard admin
  if (pathname.startsWith("/admin/dashboard")) {
    if (!auth) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const parsed = JSON.parse(auth);
      if (parsed.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
