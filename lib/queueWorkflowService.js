import { prisma } from "@/lib/prisma";
import { isValidTransition, getNextStage } from "@/lib/workflowConfig";
import { logQueueStatusChange } from "@/lib/queueLogService";
import { createQueueLog } from "@/lib/auditLogUtils";
import { createStageNotification } from "@/lib/notificationUtils";

/**
 * Calculate duration in seconds between two dates
 */
function calculateDurationSeconds(start, end) {
  if (!start || !end) return null;
  return Math.floor((new Date(end) - new Date(start)) / 1000);
}

/**
 * Update one queue to the next stage with full time tracking.
 * 
 * Handles:
 * - Validates queue exists
 * - Validates transition is valid (no jumping backward)
 * - Sets start timestamp when entering a stage
 * - Sets end timestamp and calculates duration when leaving a stage
 * - Uses transaction for Queue + QueueStageLog updates
 * - Logs to QueueLog (aggregate history)
 * 
 * @param {number|string} queueId - Queue ID
 * @param {string} nextStage - Next stage (ENTRY, TRANSPORT, etc.)
 * @param {number|null} staffId - Staff ID who performed the action
 * @param {string|null} notes - Optional notes
 * @returns {Promise<object>} Updated queue record
 */
export async function updateQueueStage(queueId, nextStage, staffId = null, notes = null) {
  if (!queueId || !nextStage) {
    throw new Error("QUEUE_STAGE_INVALID_INPUT");
  }

  const numericId = typeof queueId === "string" ? parseInt(queueId, 10) : queueId;
  if (Number.isNaN(numericId)) {
    throw new Error("QUEUE_STAGE_INVALID_ID");
  }

  let previousStage = null;
  const result = await prisma.$transaction(async (tx) => {
    const queue = await tx.queue.findUnique({
      where: { id: numericId },
    });

    if (!queue) {
      throw new Error("QUEUE_NOT_FOUND");
    }

    const currentStage = queue.status;
    previousStage = currentStage;

    // Idempotent: no change needed
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
    const durationUpdates = {};

    // Handle stage entry (set start timestamps)
    if (nextStage === "ENTRY" && !queue.entryAt) {
      timestampUpdates.entryAt = now;
      timestampUpdates.entryStartAt = now;
    }
    if (nextStage === "TRANSPORT" && !queue.transportAt) {
      timestampUpdates.transportAt = now;
      timestampUpdates.transportStartAt = now;
    }
    if (nextStage === "PACKAGING" && !queue.packagingAt) {
      timestampUpdates.packagingAt = now;
      timestampUpdates.packagingStartAt = now;
    }
    if (nextStage === "PENYERAHAN" && !queue.readyAt) {
      timestampUpdates.readyAt = now;
      timestampUpdates.penyerahanStartAt = now;
    }

    // Handle stage exit (set end timestamps and calculate durations)
    // When moving FROM currentStage TO nextStage, calculate duration of currentStage
    if (currentStage === "ENTRY" && queue.entryStartAt) {
      timestampUpdates.entryEndAt = now;
      durationUpdates.durationEntry = calculateDurationSeconds(queue.entryStartAt, now);
    }
    if (currentStage === "TRANSPORT" && queue.transportStartAt) {
      timestampUpdates.transportEndAt = now;
      durationUpdates.durationTransport = calculateDurationSeconds(queue.transportStartAt, now);
    }
    if (currentStage === "PACKAGING" && queue.packagingStartAt) {
      timestampUpdates.packagingEndAt = now;
      durationUpdates.durationPackaging = calculateDurationSeconds(queue.packagingStartAt, now);
    }
    if (currentStage === "PENYERAHAN" && queue.penyerahanStartAt) {
      timestampUpdates.penyerahanEndAt = now;
      durationUpdates.durationPenyerahan = calculateDurationSeconds(queue.penyerahanStartAt, now);
    }

    // Handle completion
    if (nextStage === "SELESAI") {
      if (!queue.completedAt) {
        timestampUpdates.completedAt = now;
      }
      // Calculate total duration from creation to completion
      durationUpdates.durationTotal = calculateDurationSeconds(queue.createdAt, now);
    }

    const updatedQueue = await tx.queue.update({
      where: { id: numericId },
      data: {
        status: nextStage,
        ...timestampUpdates,
        ...durationUpdates,
      },
    });

    // Log stage transition
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
    // Log additional to QueueLog aggregate (best-effort, outside main transaction)
    await logQueueStatusChange({
      queueNumber: result.queue,
      medicalRecordNumber: result.mrn,
      newQueueStatus: result.status,
      adminId: staffId ?? null,
    });
  } catch (error) {
    console.error("Failed to log queue status change (aggregate log):", error);
  }

  // Audit log + patient notification (best-effort, do not break workflow)
  try {
    const didChangeStage = previousStage && previousStage !== result.status;
    if (didChangeStage) {
      const action =
        result.status === "SELESAI"
          ? "COMPLETED"
          : result.status === "CANCELLED"
            ? "CANCELLED"
            : "MOVE_STAGE";

      await createQueueLog({
        queueId: result.id,
        staffId: staffId ?? null,
        action,
        fromStage: previousStage,
        toStage: result.status,
        notes: notes ?? null,
      });
    }
  } catch (error) {
    console.error("Failed to create queue audit log:", error);
  }

  try {
    const didChangeStage = previousStage && previousStage !== result.status;
    if (didChangeStage) {
      await createStageNotification(result, result.status);
    }
  } catch (error) {
    console.error("Failed to create stage notification:", error);
  }

  return result;
}
