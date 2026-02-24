import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Verify admin authentication
async function verifyAuth(request) {
  const auth = request.cookies.get('auth');
  return auth?.value === 'admin';
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Validate required fields
    if (!body.queue || !body.mrn || !body.message) {
      return NextResponse.json(
        { error: "Queue, MRN, and message are required" },
        { status: 400 }
      );
    }

    // Validate rating
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        queue: body.queue,
        mrn: body.mrn,
        message: body.message,
        rating: body.rating || 5,
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}
