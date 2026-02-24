import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out",
    timestamp: new Date().toISOString(),
  });

  res.cookies.set("staff_id", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("staff_role", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}

