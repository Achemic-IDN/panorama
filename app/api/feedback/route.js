import { NextResponse } from "next/server";

// 🔹 penyimpanan sementara (in-memory)
global.feedbacks = global.feedbacks || [];

export async function POST(req) {
  const body = await req.json();

  if (!body.queue || !body.mrn || !body.message) {
    return new NextResponse("Invalid data", { status: 400 });
  }

  const feedback = {
    queue: body.queue,
    mrn: body.mrn,
    message: body.message,
    rating: body.rating || 5,
    time: new Date().toISOString(),
  };

  global.feedbacks.push(feedback);

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({
    feedbacks: global.feedbacks || [],
  });
}
