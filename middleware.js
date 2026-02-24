import { NextResponse } from "next/server";

export function middleware(req) {
  const auth = req.cookies.get("auth")?.value;
  const staffId = req.cookies.get("staff_id")?.value;
  const path = req.nextUrl.pathname;

  // ADMIN
  if (path.startsWith("/admin/dashboard")) {
    if (auth !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // PASIEN
  if (path.startsWith("/dashboard")) {
    if (!auth || auth === "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // STAFF pages
  if (path.startsWith("/staff")) {
    if (!staffId && !path.startsWith("/staff/login")) {
      return NextResponse.redirect(new URL("/staff/login", req.url));
    }
  }

  // STAFF APIs
  if (path.startsWith("/api/staff")) {
    if (path === "/api/staff/login") {
      return NextResponse.next();
    }
    if (!staffId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/admin/dashboard", "/staff/:path*", "/api/staff/:path*"],
};
