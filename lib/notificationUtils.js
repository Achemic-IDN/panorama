import { prisma } from "@/lib/prisma";
import { emitPatientNotification } from "@/lib/socketUtils";

function normalizeStage(stage) {
  if (!stage) return null;

  // Accept both legacy synonyms and current PANORAMA enum names.
  const s = String(stage).toUpperCase();

  // Legacy / alternative names
  if (s === "READY") return "PENYERAHAN";
  if (s === "COMPLETED") return "SELESAI";

  return s;
}

function getMessageForStage(stage) {
  switch (stage) {
    case "ENTRY":
      return "Resep Anda sedang diproses oleh petugas farmasi.";
    case "TRANSPORT":
      return "Resep Anda sedang dikirim ke bagian penyiapan obat.";
    case "PACKAGING":
      return "Obat Anda sedang disiapkan oleh petugas farmasi.";
    case "PENYERAHAN":
      return "Obat Anda sedang menuju loket penyerahan.";
    case "SELESAI":
      return "Terima kasih telah menggunakan layanan farmasi kami.";
    default:
      return null;
  }
}

/**
 * Create an in-app patient notification for a queue stage transition.
 *
 * - Uses queue.mrn to resolve Patient (if exists)
 * - Does not crash if Patient is missing or phone is null
 * - Optionally emits realtime event PATIENT_NOTIFICATION (best-effort)
 */
export async function createStageNotification(queue, stage) {
  if (!queue?.id || !queue?.mrn) {
    return null;
  }

  const normalizedStage = normalizeStage(stage);
  if (!normalizedStage) return null;

  // Skip notifications for non-workflow terminal states not specified
  if (normalizedStage === "CANCELLED" || normalizedStage === "MENUNGGU") {
    return null;
  }

  const message = getMessageForStage(normalizedStage);
  if (!message) return null;

  const patient = await prisma.patient.findUnique({
    where: { mrn: String(queue.mrn).toUpperCase() },
    select: { id: true },
  });

  const created = await prisma.patientStageNotification.create({
    data: {
      queueId: queue.id,
      patientId: patient?.id ?? null,
      stage: normalizedStage,
      message,
    },
  });

  // Optional realtime event (best-effort)
  try {
    emitPatientNotification({
      queueId: queue.id,
      queueNumber: queue.queue,
      stage: normalizedStage,
      message,
      createdAt: created.createdAt,
    });
  } catch (e) {
    console.error("Failed to emit patient notification realtime:", e);
  }

  return created;
}

