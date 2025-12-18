import { NextResponse } from "next/server";
import { addFeedback } from "@/app/lib/feedbackStore";

export async function POST(req) {
  const body = await req.json();

  addFeedback({
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
    time: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
