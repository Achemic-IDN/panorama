import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = cookies().get("auth");

  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const parsed = JSON.parse(auth.value);

  return NextResponse.json({
    queue: parsed.queue,
    status: "Entry",
  });
}
