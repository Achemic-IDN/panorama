import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  // ADMIN
  if (
    body.role === "admin" &&
    body.username === "admin" &&
    body.password === "panorama"
  ) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("auth", "admin", { httpOnly: true, path: "/" });
    return res;
  }

  // PASIEN
  if (body.role === "patient" && body.queue && body.mrn) {
    const res = NextResponse.json({ success: true });
    res.cookies.set(
      "auth",
      JSON.stringify({ role: "patient", queue: body.queue }),
      { httpOnly: true, path: "/" }
    );
    return res;
  }

  return new NextResponse("Unauthorized", { status: 401 });
}
