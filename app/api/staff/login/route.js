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

    const res = NextResponse.json({
      success: true,
      data: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
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

    // Untuk UI convenience; backend tetap akan verifikasi role dari DB
    res.cookies.set("staff_role", String(staff.role), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch (error) {
    console.error("Staff login error:", error);
    return ApiResponse.serverError("Gagal login staff", { message: error?.message });
  }
}

