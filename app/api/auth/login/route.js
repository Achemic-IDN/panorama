import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { username, password, role } = body;

  // contoh hardcode (sementara)
  if (role === "admin" && username === "admin" && password === "admin123") {
    const res = NextResponse.json({ success: true });

    res.cookies.set("admin-auth", "true", {
      httpOnly: true,
      path: "/",
    });

    return res;
  }

  if (role === "pasien" && username && password) {
    const res = NextResponse.json({ success: true });

    res.cookies.set("pasien-auth", "true", {
      httpOnly: true,
      path: "/",
    });

    return res;
  }

  return NextResponse.json(
    { success: false, message: "Login gagal" },
    { status: 401 }
  );
}
