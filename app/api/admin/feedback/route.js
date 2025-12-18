import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma.js";

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { time: 'desc' },
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.queue || !body.mrn || !body.message) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        queue: body.queue,
        mrn: body.mrn,
        message: body.message,
        rating: body.rating || 5,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}
