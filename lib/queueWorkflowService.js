import { prisma } from "@/lib/prisma";
import { isValidTransition, getNextStage } from "@/lib/workflowConfig";
import { logQueueStatusChange } from "@/lib/queueLogService";

/**
 * Update satu antrean ke stage berikutnya secara aman.
 * - Memastikan antrean ada
 * - Memastikan transition valid (tidak lompat/mundur)
 * - Menggunakan transaksi untuk update Queue + QueueStageLog
 * - Mencatat log tambahan ke QueueLog (agregasi historis)
 */
export async function updateQueueStage(queueId, nextStage, staffId = null, notes = null) {
  if (!queueId || !nextStage) {
    throw new Error("QUEUE_STAGE_INVALID_INPUT");
  }

  const numericId = typeof queueId === "string" ? parseInt(queueId, 10) : queueId;
  if (Number.isNaN(numericId)) {
    throw new Error("QUEUE_STAGE_INVALID_ID");
  }

  const result = await prisma.$transaction(async (tx) => {
    const queue = await tx.queue.findUnique({
      where: { id: numericId },
    });

    if (!queue) {
      throw new Error("QUEUE_NOT_FOUND");
    }

    const currentStage = queue.status;

    // Idempoten: tidak ada perubahan
    if (currentStage === nextStage) {
      return queue;
    }

    if (!isValidTransition(currentStage, nextStage)) {
      const allowedNext = getNextStage(currentStage);
      const error = new Error("QUEUE_STAGE_INVALID_TRANSITION");
      error.details = {
        from: currentStage,
        to: nextStage,
        allowedNext,
      };
      throw error;
    }

    const now = new Date();

    const timestampUpdates = {};
    if (nextStage === "ENTRY" && !queue.entryAt) {
      timestampUpdates.entryAt = now;
    }
    if (nextStage === "TRANSPORT" && !queue.transportAt) {
      timestampUpdates.transportAt = now;
    }
    if (nextStage === "PACKAGING" && !queue.packagingAt) {
      timestampUpdates.packagingAt = now;
    }
    if (nextStage === "READY" && !queue.readyAt) {
      timestampUpdates.readyAt = now;
    }
    if (nextStage === "COMPLETED" && !queue.completedAt) {
      timestampUpdates.completedAt = now;
    }

    const updatedQueue = await tx.queue.update({
      where: { id: numericId },
      data: {
        status: nextStage,
        ...timestampUpdates,
      },
    });

    await tx.queueStageLog.create({
      data: {
        queueId: numericId,
        stage: nextStage,
        staffId: staffId ?? null,
        notes: notes ?? null,
      },
    });

    return updatedQueue;
  });

  try {
    // Log tambahan ke QueueLog agregat (best-effort, di luar transaksi utama)
    await logQueueStatusChange({
      queueNumber: result.queue,
      medicalRecordNumber: result.mrn,
      newQueueStatus: result.status,
      adminId: staffId ?? null,
    });
  } catch (error) {
    console.error("Failed to log queue status change (aggregate log):", error);
  }

  return result;
}

