import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PANORAMA_STATUSES } from "@/lib/status";
import { updateQueueStage } from "@/lib/queueWorkflowService";
import { emitQueueMovedStage, emitQueueCompleted } from "@/lib/socketUtils";
import { requireRole } from "@/lib/roleGuard";

export const dynamic = "force-dynamic";

async function verifyAuth(request) {
  const { ok } = await requireRole(request, "UTAMA");
  return ok;
}

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

    if (!PANORAMA_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const queueId = parseInt(id, 10);
    if (Number.isNaN(queueId)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    const existingQueue = await prisma.queue.findUnique({
      where: { id: queueId },
    });

    if (!existingQueue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    const previousStatus = existingQueue.status;

    let updatedQueue;
    try {
      updatedQueue = await updateQueueStage(queueId, status, null, null);
    } catch (error) {
      if (error.message === "QUEUE_NOT_FOUND") {
        return NextResponse.json({ error: "Queue not found" }, { status: 404 });
      }
      if (error.message === "QUEUE_STAGE_INVALID_ID") {
        return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
      }
      if (error.message === "QUEUE_STAGE_INVALID_TRANSITION") {
        return NextResponse.json(
          {
            error: "Invalid workflow transition",
            details: error.details || null,
          },
          { status: 400 }
        );
      }
      console.error("Workflow update failed:", error);
      return NextResponse.json(
        { error: "Failed to update queue stage" },
        { status: 500 }
      );
    }

    try {
      if (updatedQueue.status === "SELESAI") {
        emitQueueCompleted(updatedQueue);
      } else {
        emitQueueMovedStage(updatedQueue, previousStatus);
      }
    } catch (e) {
      console.error("Failed to broadcast queue update (admin):", e);
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