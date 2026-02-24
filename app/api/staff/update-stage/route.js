import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { verifyStaff } from "@/lib/staffAuth";
import { getNextStage } from "@/lib/workflowConfig";
import { updateQueueStage } from "@/lib/queueWorkflowService";

export const dynamic = "force-dynamic";

function getTargetStageForRole(role, currentStage) {
  switch (role) {
    case "ENTRY":
      return currentStage === "WAITING" ? "ENTRY" : null;
    case "TRANSPORT":
      return currentStage === "ENTRY" ? "TRANSPORT" : null;
    case "PACKAGING":
      // memungkinkan 2 step berurutan di area packaging: TRANSPORT->PACKAGING->READY
      if (currentStage === "TRANSPORT" || currentStage === "PACKAGING") {
        return getNextStage(currentStage);
      }
      return null;
    case "PICKUP":
      return currentStage === "READY" ? "COMPLETED" : null;
    case "ADMIN":
      // admin boleh update lewat endpoint admin; staff endpoint tidak memberi bebas stage
      return getNextStage(currentStage);
    default:
      return null;
  }
}

export async function PUT(request) {
  try {
    const { authenticated, staff } = await verifyStaff(request);
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

    if (queue.status === "COMPLETED" || queue.status === "CANCELLED") {
      return ApiResponse.conflict("Antrean sudah final (COMPLETED/CANCELLED)");
    }

    const targetStage = getTargetStageForRole(staff.role, queue.status);
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

    return ApiResponse.success(updated);
  } catch (error) {
    console.error("Staff update-stage error:", error);
    return ApiResponse.serverError("Gagal memperbarui stage antrean", { message: error?.message });
  }
}

