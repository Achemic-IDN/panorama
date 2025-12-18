import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = request.cookies.get("auth")?.value;
  if (auth === "admin") {
    return NextResponse.json({ role: "admin" });
  } else if (auth === "patient") {
    return NextResponse.json({ role: "patient" });
  } else {
    return NextResponse.json({ role: null }, { status: 401 });
  }
}