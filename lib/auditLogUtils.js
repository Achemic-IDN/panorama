import { prisma } from "@/lib/prisma";

/**
 * Create an audit log row for queue actions (stage moves, completion, cancellation, etc).
 * staffId is optional (null-safe).
 */
export async function createQueueLog({
  queueId,
  staffId = null,
  action,
  fromStage = null,
  toStage = null,
  notes = null,
}) {
  if (!queueId || !action) {
    throw new Error("QUEUE_AUDIT_LOG_INVALID_INPUT");
  }

  const numericQueueId = typeof queueId === "string" ? parseInt(queueId, 10) : queueId;
  if (Number.isNaN(numericQueueId)) {
    throw new Error("QUEUE_AUDIT_LOG_INVALID_QUEUE_ID");
  }

  const numericStaffId =
    staffId === null || staffId === undefined
      ? null
      : typeof staffId === "string"
        ? parseInt(staffId, 10)
        : staffId;

  if (numericStaffId !== null && Number.isNaN(numericStaffId)) {
    // Do not crash the workflow if staffId is malformed; store as null.
    // This protects production workflows where cookies might be corrupted.
  }

  return await prisma.queueAuditLog.create({
    data: {
      queueId: numericQueueId,
      staffId: numericStaffId && !Number.isNaN(numericStaffId) ? numericStaffId : null,
      action,
      fromStage: fromStage ?? null,
      toStage: toStage ?? null,
      notes: notes ?? null,
    },
  });
}

