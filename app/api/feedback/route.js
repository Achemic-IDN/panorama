import { NextResponse } from "next/server";
import { feedbackStore } from "@/app/lib/feedbackStore";

export async function POST(req) {
  const body = await req.json();

  const feedback = {
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
    time: new Date().toISOString(),
  };

  feedbackStore.push(feedback);

  return NextResponse.json({ success: true });
}
