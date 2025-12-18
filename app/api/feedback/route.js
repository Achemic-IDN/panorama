import { NextResponse } from "next/server";
import { addFeedback } from "@/app/lib/feedbackStore";

export async function POST(req) {
  const body = await req.json();

  if (!body.queue || !body.mrn || !body.message) {
    return new NextResponse("Invalid data", { status: 400 });
  }

  addFeedback({
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
  });

  return NextResponse.json({ success: true });
}
