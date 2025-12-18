import { NextResponse } from "next/server";
import { feedbackStore } from "@/app/lib/feedbackStore";
import { cookies } from "next/headers";

export async function POST(req) {
  const body = await req.json();
  const cookie = cookies().get("auth");

  if (!cookie) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let user;
  try {
    user = JSON.parse(cookie.value);
  } catch {
    return new NextResponse("Invalid auth", { status: 401 });
  }

  if (user.role !== "patient") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  feedbackStore.push({
    queue: user.queue,
    message: body.message,
    time: new Date().toLocaleString("id-ID"),
  });

  return NextResponse.json({ success: true });
}
