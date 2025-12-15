import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // 🔥 hapus cookie
  });

  return response;
}
