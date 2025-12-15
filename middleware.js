import { NextResponse } from "next/server";

export function middleware(req) {
  const auth = req.cookies.get("auth")?.value;
  const path = req.nextUrl.pathname;

  // Proteksi dashboard pasien
  if (path.startsWith("/dashboard") && !auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Proteksi admin
  if (path.startsWith("/admin") && auth !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}
