import { NextResponse } from "next/server";
import { getAllFeedback } from "@/app/lib/feedbackStore";

export async function GET() {
  return NextResponse.json(getAllFeedback());
}
