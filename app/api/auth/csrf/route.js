import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = request.cookies.get("csrf_token")?.value || "";
  return NextResponse.json({ csrfToken: token });
}
