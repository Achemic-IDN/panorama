import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/roleGuard";
import { emitQueueUpdated } from "@/lib/socketUtils";
import { createQueueLog } from "@/lib/auditLogUtils";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    // Only UTAMA (super-admin) can set priority
    const auth = await requireRole(request, ["UTAMA"]);
    if (!auth.ok) {
      return auth.response || NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { staff } = auth;

    const queueId = parseInt(params?.id, 10);
    if (Number.isNaN(queueId)) {
      return NextResponse.json({ success: false, message: "Invalid queue ID" }, { status: 400 });
    }

    const existing = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Queue not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const requested = body?.priority;
    const nextPriority = typeof requested === "boolean" ? requested : !existing.priority;

    // Priority is only meaningful until selesai/batal
    if ((existing.status === "SELESAI" || existing.status === "CANCELLED") && nextPriority === true) {
      return NextResponse.json(
        { success: false, message: "Tidak bisa set prioritas untuk antrean yang sudah selesai/batal" },
        { status: 400 }
      );
    }

    const updated = await prisma.queue.update({
      where: { id: queueId },
      data: { priority: nextPriority },
    });

    try {
      await createQueueLog({
        queueId: updated.id,
        staffId: staff?.id ?? null,
        action: nextPriority ? "PRIORITY_ON" : "PRIORITY_OFF",
        notes: `priority=${nextPriority}`,
      });
    } catch (e) {
      console.error("Failed to create audit log for priority toggle:", e);
    }

    try {
      emitQueueUpdated(updated);
    } catch (e) {
      console.error("Failed to broadcast priority update:", e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating queue priority:", error);
    return NextResponse.json({ success: false, message: "Failed to update priority" }, { status: 500 });
  }
}

