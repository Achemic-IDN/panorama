import { NextResponse } from "next/server";
import { addFeedback } from "@/app/lib/feedbackStore";

export async function POST(req) {
  const body = await req.json();

  addFeedback({
    role: "patient",
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
  });

  return NextResponse.json({ success: true });
}
