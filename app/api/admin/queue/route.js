import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logQueueCreated } from "@/lib/queueLogService";
import { broadcastQueueUpdate } from "@/lib/realtime";

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

    const queues = await prisma.queue.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(queues);
  } catch (error) {
    console.error("Error fetching queues:", error);
    return NextResponse.json({ error: "Failed to fetch queues" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { queue, mrn } = body;

    if (!queue || !mrn) {
      return NextResponse.json({ error: "Queue and MRN required" }, { status: 400 });
    }

    // Check for duplicate queue
    const existing = await prisma.queue.findUnique({
      where: { queue }
    });

    if (existing) {
      return NextResponse.json({ error: "Queue number already exists" }, { status: 409 });
    }

    const newQueue = await prisma.queue.create({
      data: { queue, mrn },
    });

    // Log initial queue creation as WAITING in QueueLog
    try {
      await logQueueCreated({
        queueNumber: newQueue.queue,
        medicalRecordNumber: newQueue.mrn,
      });
    } catch (logError) {
      console.error("Failed to log queue creation:", logError);
    }

    // Broadcast antrean baru
    try {
      broadcastQueueUpdate(newQueue);
    } catch (e) {
      console.error("Failed to broadcast new queue:", e);
    }

    return NextResponse.json(newQueue, { status: 201 });
  } catch (error) {
    console.error("Error creating queue:", error);
    return NextResponse.json({ error: "Failed to create queue" }, { status: 500 });
  }
}