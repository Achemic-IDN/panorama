import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { createCsrfToken } from "@/lib/csrf";
import { createSession } from "@/lib/sessionService";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const body = await request.json();
    const username = (body?.username || "").trim();
    const password = body?.password || "";

    if (!username || !password) {
      return ApiResponse.badRequest("Username dan password wajib diisi");
    }

    const staff = await prisma.staff.findUnique({
      where: { username },
    });

    if (!staff) {
      return ApiResponse.unauthorized("Username atau password salah");
    }

    const ok = await bcrypt.compare(password, staff.passwordHash);
    if (!ok) {
      return ApiResponse.unauthorized("Username atau password salah");
    }

    // send back roles array so frontend can show selection if needed
    const res = NextResponse.json({
      success: true,
      data: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        roles: staff.roles,
      },
      timestamp: new Date().toISOString(),
    });

    const maxAge = parseInt(process.env.SESSION_MAX_AGE_SECONDS || "43200", 10); // default 12h
    res.cookies.set("staff_id", String(staff.id), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // if there is only one role we can set the active cookie immediately
    if (Array.isArray(staff.roles) && staff.roles.length === 1) {
      res.cookies.set("staff_role", staff.roles[0], {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    }

    // set birthdate for sliding expiration
    res.cookies.set("session_birthdate", new Date().toISOString(), {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // create DB session record
    try {
      const sess = await createSession(staff.id, maxAge);
      res.cookies.set("session_id", sess.id, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    } catch (e) {
      console.error("Failed to create session record:", e);
    }

    // generate csrf token for subsequent form submissions
    const csrfToken = createCsrfToken();
    res.cookies.set("csrf_token", csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return res;
  } catch (error) {
    console.error("Staff login error:", error);
    return ApiResponse.serverError("Gagal login staff", { message: error?.message });
  }
}

