import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logQueueStatusChange } from "@/lib/queueLogService";

export const dynamic = 'force-dynamic';

// Verify admin authentication
async function verifyAuth(request) {
  const auth = request.cookies.get('auth');
  return auth?.value === 'admin';
}

// Enum status resmi PANORAMA
const VALID_STATUSES = [
  "WAITING",
  "ENTRY",
  "TRANSPORT",
  "PACKAGING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const NEXT_STATUS = {
  WAITING: "ENTRY",
  ENTRY: "TRANSPORT",
  TRANSPORT: "PACKAGING",
  PACKAGING: "READY",
  READY: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

export async function PUT(request, { params }) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const queueId = parseInt(id);
    if (isNaN(queueId)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    const currentQueue = await prisma.queue.findUnique({
      where: { id: queueId },
    });

    if (!currentQueue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    const currentStatus = currentQueue.status;

    // Izinkan idempoten: status tidak berubah
    if (currentStatus === status) {
      return NextResponse.json(currentQueue);
    }

    // Aturan workflow:
    // WAITING -> ENTRY -> TRANSPORT -> PACKAGING -> READY -> COMPLETED
    // Tidak boleh mundur, tidak boleh lompat.
    // CANCELLED diizinkan dari status apapun kecuali COMPLETED/CANCELLED.
    const allowedNext = NEXT_STATUS[currentStatus] || null;

    const isCancelTransition =
      status === "CANCELLED" &&
      currentStatus !== "COMPLETED" &&
      currentStatus !== "CANCELLED";

    if (!isCancelTransition && status !== allowedNext) {
      return NextResponse.json(
        {
          error: "Invalid workflow transition",
          details: {
            from: currentStatus,
            to: status,
            allowedNext,
          },
        },
        { status: 400 }
      );
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: queueId },
      data: { status },
    });

    // Log status change into QueueLog (maps to WAITING/PROCESSING/COMPLETED)
    try {
      await logQueueStatusChange({
        queueNumber: updatedQueue.queue,
        medicalRecordNumber: updatedQueue.mrn,
        newQueueStatus: updatedQueue.status,
      });
    } catch (logError) {
      console.error("Failed to log queue status change:", logError);
    }

    return NextResponse.json(updatedQueue);
  } catch (error) {
    console.error("Error updating queue:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update queue" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const queueId = parseInt(id);
    
    if (isNaN(queueId)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    await prisma.queue.delete({
      where: { id: queueId },
    });

    return NextResponse.json({ message: "Queue deleted successfully" });
  } catch (error) {
    console.error("Error deleting queue:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete queue" }, { status: 500 });
  }
}