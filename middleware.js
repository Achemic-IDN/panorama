import { NextResponse } from "next/server";

export function middleware(req) {
  const auth = req.cookies.get("auth")?.value;
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/admin/dashboard"],
};
