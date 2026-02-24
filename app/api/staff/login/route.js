import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
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

    res.cookies.set("staff_id", String(staff.id), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 jam
    });

    // if there is only one role we can set the active cookie immediately
    if (Array.isArray(staff.roles) && staff.roles.length === 1) {
      res.cookies.set("staff_role", staff.roles[0], {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12,
      });
    }

    return res;
  } catch (error) {
    console.error("Staff login error:", error);
    return ApiResponse.serverError("Gagal login staff", { message: error?.message });
  }
}

