import { NextResponse } from "next/server";
import * as z from "zod";
import { env } from "./lib/config";

// simple in-memory rate limiter (per IP) for API routes
const rateMap = new Map();

// check if session birthdate is expired (sliding expiration can update this)
function isSessionExpired(birthdate) {
  if (!birthdate) return true;
  const maxAge = parseInt(env.SESSION_MAX_AGE_SECONDS, 10) || 3600;
  return (Date.now() - new Date(birthdate).getTime()) / 1000 > maxAge;
}
function checkRate(ip) {
  const now = Date.now();
  const windowMs = parseInt(env.RATE_LIMIT_WINDOW_MS, 10);
  const maxRequests = parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10);
  let entries = rateMap.get(ip) || [];
  entries = entries.filter((ts) => now - ts < windowMs);
  if (entries.length >= maxRequests) {
    rateMap.set(ip, entries);
    return false;
  }
  entries.push(now);
  rateMap.set(ip, entries);
  return true;
}

export function middleware(req) {
  const isProd = process.env.NODE_ENV === "production";
  const auth = req.cookies.get("auth")?.value;
  const staffId = req.cookies.get("staff_id")?.value;
  const birthdate = req.cookies.get("session_birthdate")?.value;
  const path = req.nextUrl.pathname;

  // if a session cookie exists but is expired, clear everything
  if (birthdate && isSessionExpired(birthdate)) {
    const res = NextResponse.next();
    res.cookies.set("staff_id", "", { maxAge: 0, path: "/" });
    res.cookies.set("staff_role", "", { maxAge: 0, path: "/" });
    res.cookies.set("auth", "", { maxAge: 0, path: "/" });
    res.cookies.set("session_birthdate", "", { maxAge: 0, path: "/" });
    return res;
  }

  // slide expiration for active session
  if (birthdate && !isSessionExpired(birthdate)) {
    const res = NextResponse.next();
    res.cookies.set("session_birthdate", new Date().toISOString(), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: parseInt(env.SESSION_MAX_AGE_SECONDS, 10) || 3600,
    });
    return res;
  }

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

  // ADMIN APIs - require admin auth cookie
  if (path.startsWith("/api/admin")) {
    if (auth !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

  // CSRF token + rate limit for mutating API requests
  const method = req.method.toUpperCase();
  if (path.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    // skip token check for login/logout endpoints since the client may not
    // yet possess a valid token
    if (
      path === "/api/auth/login" ||
      path === "/api/staff/login" ||
      path === "/api/auth/logout-all" ||
      path === "/api/staff/logout"
    ) {
      // still apply rate limit
      const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
      if (!checkRate(ip)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    } else {
      const header = req.headers.get("x-csrf-token");
      const csrfCookie = req.cookies.get("csrf_token")?.value;
      if (!header || !csrfCookie || header !== csrfCookie) {
        return NextResponse.json({ error: "Missing or invalid CSRF token" }, { status: 403 });
      }

      const origin = req.headers.get("origin") || req.headers.get("referer");
      if (origin && env.NEXT_PUBLIC_APP_URL && !origin.startsWith(env.NEXT_PUBLIC_APP_URL)) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
      }
      // rate limit by IP
      const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
      if (!checkRate(ip)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/admin/dashboard",
    "/staff/:path*",
    "/api/:path*", // apply auth/CSRF/rate-limit on all API endpoints
  ],
};
