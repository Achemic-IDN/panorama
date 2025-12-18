import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const queues = await prisma.queue.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(queues);
  } catch (error) {
    console.error("Error fetching queues:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { queue, mrn } = body;

    if (!queue || !mrn) {
      return NextResponse.json({ error: "Queue and MRN required" }, { status: 400 });
    }

    const newQueue = await prisma.queue.create({
      data: { queue, mrn },
    });

    return NextResponse.json(newQueue);
  } catch (error) {
    console.error("Error creating queue:", error);
    return NextResponse.json({ error: "Failed to create queue" }, { status: 500 });
  }
}