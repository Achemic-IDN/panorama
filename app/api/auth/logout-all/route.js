import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const isProd = process.env.NODE_ENV === "production";
  // this endpoint logs the current user out from all devices (staff only)
  const staffId = request.cookies.get("staff_id")?.value;
  if (!staffId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // revoke sessions in database if session model exists
  try {
    await prisma.session.updateMany({
      where: { staffId: parseInt(staffId, 10) },
      data: { revoked: true },
    });
  } catch (e) {
    // silent failure if session table not present
  }

  const res = NextResponse.json({ success: true, message: "Logged out from all sessions" });
  res.cookies.set("staff_id", "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set("staff_role", "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set("session_birthdate", "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set("auth", "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set("csrf_token", "", { httpOnly: false, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
