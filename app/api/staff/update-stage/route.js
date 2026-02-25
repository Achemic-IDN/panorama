import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { verifyStaff } from "@/lib/staffAuth";
import { getNextStage } from "@/lib/workflowConfig";
import { updateQueueStage } from "@/lib/queueWorkflowService";
import { emitQueueMovedStage, emitQueueCompleted } from "@/lib/socketUtils";

export const dynamic = "force-dynamic";

function getTargetStageForRole(role, currentStage) {
  switch (role) {
    case "ENTRY":
      return currentStage === "MENUNGGU" ? "ENTRY" : null;
    case "TRANSPORT":
      return currentStage === "ENTRY" ? "TRANSPORT" : null;
    case "PACKAGING":
      // packaging may take from TRANSPORT and then advance itself to PENYERAHAN
      if (currentStage === "TRANSPORT" || currentStage === "PACKAGING") {
        return getNextStage(currentStage);
      }
      return null;
    case "PENYERAHAN":
      return currentStage === "PENYERAHAN" ? "SELESAI" : null;
    case "UTAMA":
      // utama can move along any next stage, acts like super‑user
      return getNextStage(currentStage);
    default:
      return null;
  }
}

export async function PUT(request) {
  try {
    const { authenticated, staff, activeRole } = await verifyStaff(request);

    // if the staff has an activeRole cookie, use that; otherwise infer from staff.roles
    if (!authenticated) {
      return ApiResponse.unauthorized("Unauthorized");
    }

    const body = await request.json();
    const queueId = body?.queueId;
    const notes = body?.notes || null;

    if (!queueId) {
      return ApiResponse.badRequest("queueId wajib diisi");
    }

    const numericId = typeof queueId === "string" ? parseInt(queueId, 10) : queueId;
    if (Number.isNaN(numericId)) {
      return ApiResponse.badRequest("queueId tidak valid");
    }

    const queue = await prisma.queue.findUnique({
      where: { id: numericId },
    });

    if (!queue) {
      return ApiResponse.notFound("Antrean tidak ditemukan");
    }

    if (queue.status === "SELESAI" || queue.status === "CANCELLED") {
      return ApiResponse.conflict("Antrean sudah final (SELESAI/CANCELLED)");
    }

    const previousStatus = queue.status;

    // use activeRole (from cookie or inferred) for permission checks
    const roleToUse = activeRole || (Array.isArray(staff.roles) ? staff.roles[0] : null);
    const targetStage = getTargetStageForRole(roleToUse, queue.status);
    if (!targetStage) {
      return ApiResponse.forbidden("Role tidak memiliki izin untuk stage ini");
    }

    let updated;
    try {
      updated = await updateQueueStage(queue.id, targetStage, staff.id, notes);
    } catch (error) {
      if (error.message === "QUEUE_STAGE_INVALID_TRANSITION") {
        return ApiResponse.badRequest("Transisi stage tidak valid", error.details || null);
      }
      if (error.message === "QUEUE_NOT_FOUND") {
        return ApiResponse.notFound("Antrean tidak ditemukan");
      }
      console.error("updateQueueStage failed:", error);
      return ApiResponse.serverError("Gagal memperbarui stage antrean", { message: error?.message });
    }

    // Broadcast ke semua listener realtime (SSE + WebSocket)
    try {
      if (updated.status === "SELESAI") {
        emitQueueCompleted(updated);
      } else {
        emitQueueMovedStage(updated, previousStatus);
      }
    } catch (e) {
      console.error("Failed to broadcast queue update (staff):", e);
    }

    return ApiResponse.success(updated);
  } catch (error) {
    console.error("Staff update-stage error:", error);
    return ApiResponse.serverError("Gagal memperbarui stage antrean", { message: error?.message });
  }
}

