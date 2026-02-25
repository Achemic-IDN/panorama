import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = cookies().get("auth");

  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let parsed;
  try {
    parsed = JSON.parse(auth.value);
  } catch (err) {
    console.error("Failed to parse auth cookie in /api/dashboard:", err, "value=", auth.value);
    // fallback to blank object so response still returns something
    parsed = {};
  }

  return NextResponse.json({
    queue: parsed.queue,
    status: "Entry",
  });
}
