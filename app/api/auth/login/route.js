import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { username, password, role, queue, mrn } = body;

  // contoh hardcode (sementara)
  if (role === "admin" && username === "admin" && password === "panorama") {
    const res = NextResponse.json({ success: true });

    res.cookies.set("auth", "admin", {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: "/",
    });

    return res;
  }

  if (role === "patient" && queue === "ABC123" && mrn === "999999") {
    const res = NextResponse.json({ success: true });

    res.cookies.set("auth", "patient", {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: "/",
    });

    return res;
  }

  return NextResponse.json(
    { success: false, message: "Login gagal" },
    { status: 401 }
  );
}
