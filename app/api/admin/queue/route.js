import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logQueueCreated } from "@/lib/queueLogService";
import { emitQueueCreated } from "@/lib/socketUtils";
import { requireRole } from "@/lib/roleGuard";

export const dynamic = "force-dynamic";

// we no longer use simple auth cookie – staff with UTAMA role are considered admin
async function verifyAuth(request) {
  // allow any authenticated staff to manage queues; the workflow service
  // itself enforces stage‑specific permissions via `isValidTransition`.
  const { ok, staff, activeRole, response } = await requireRole(request, []);
  return { ok, staff, activeRole, response };
}

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.ok) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const auth = await verifyAuth(request);
    if (!auth.ok) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { staff } = auth;

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

    // Log initial queue creation as WAITING in QueueLog (aggregate) and
    // add audit entry recording who created it.
    try {
      await logQueueCreated({
        queueNumber: newQueue.queue,
        medicalRecordNumber: newQueue.mrn,
      });
    } catch (logError) {
      console.error("Failed to log queue creation:", logError);
    }

    try {
      // create audit log row; staff may be null in some contexts
      await import("@/lib/auditLogUtils").then((m) =>
        m.createQueueLog({
          queueId: newQueue.id,
          staffId: staff?.id ?? null,
          action: "CREATE_QUEUE",
        })
      );
    } catch (auditError) {
      console.error("Failed to create audit log for queue creation:", auditError);
    }

    // Broadcast antrean baru (SSE + WebSocket)
    try {
      emitQueueCreated(newQueue);
    } catch (e) {
      console.error("Failed to broadcast new queue:", e);
    }

    return NextResponse.json(newQueue, { status: 201 });
  } catch (error) {
    console.error("Error creating queue:", error);
    return NextResponse.json({ error: "Failed to create queue" }, { status: 500 });
  }
}