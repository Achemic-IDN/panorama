import { NextResponse } from "next/server";
import { feedbackStore } from "@/app/lib/feedbackStore";
import { cookies } from "next/headers";

export async function GET() {
  const cookie = cookies().get("auth");

  if (!cookie || cookie.value !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(feedbackStore);
}
