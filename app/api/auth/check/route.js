import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const cookieStore = cookies();
  const auth = cookieStore.get("auth")?.value;
  if (auth === "admin") {
    return NextResponse.json({ role: "admin" });
  } else if (auth === "patient") {
    return NextResponse.json({ role: "patient" });
  } else {
    return NextResponse.json({ role: null }, { status: 401 });
  }
}