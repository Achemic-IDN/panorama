import { NextResponse } from "next/server";
import { feedbackStore } from "@/app/lib/feedbackStore";

export async function GET() {
  return NextResponse.json(feedbackStore);
}
