import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export function middleware(req) {
  const cookieStore = cookies();
  const auth = cookieStore.get("auth")?.value;
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
