import { prisma } from "@/lib/prisma";

// Map Queue.status (enum PANORAMA) to QueueLogStatus enum
// QueueStatus:
//  MENUNGGU | ENTRY | TRANSPORT | PACKAGING | PENYERAHAN | SELESAI | CANCELLED
function mapQueueStatusToLogStatus(queueStatus) {
  switch (queueStatus) {
    case "MENUNGGU":
      return "WAITING";
    case "SELESAI":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    case "ENTRY":
    case "TRANSPORT":
    case "PACKAGING":
    case "PENYERAHAN":
    default:
      return "PROCESSING";
  }
}

export async function logQueueCreated({
  queueNumber,
  medicalRecordNumber,
  patientName = null,
  serviceType = null,
  adminId = null,
}) {
  if (!queueNumber || !medicalRecordNumber) {
    return;
  }

  // Upsert to avoid duplicate errors if called twice for same queue
  await prisma.queueLog.upsert({
    where: { queueNumber },
    create: {
      queueNumber,
      medicalRecordNumber,
      patientName,
      serviceType,
      adminId,
      status: "WAITING",
    },
    update: {
      medicalRecordNumber,
      patientName,
      serviceType,
      adminId,
    },
  });
}

export async function logQueueStatusChange({
  queueNumber,
  medicalRecordNumber,
  newQueueStatus,
  adminId = null,
}) {
  if (!queueNumber || !medicalRecordNumber || !newQueueStatus) {
    return;
  }

  const logStatus = mapQueueStatusToLogStatus(newQueueStatus);

  // Ensure a log row exists
  const existing = await prisma.queueLog.findUnique({
    where: { queueNumber },
  });

  const now = new Date();

  if (!existing) {
    // Create with appropriate timestamps based on status
    await prisma.queueLog.create({
      data: {
        queueNumber,
        medicalRecordNumber,
        status: logStatus,
        createdAt:
          logStatus === "WAITING" || logStatus === "PROCESSING" || logStatus === "COMPLETED"
            ? now
            : undefined,
        calledAt:
          logStatus === "PROCESSING" || logStatus === "COMPLETED" ? now : undefined,
        completedAt: logStatus === "COMPLETED" ? now : undefined,
        adminId,
      },
    });
    return;
  }

  const dataToUpdate = {
    status: logStatus,
    adminId: adminId ?? existing.adminId,
  };

  if (logStatus === "PROCESSING" && !existing.calledAt) {
    dataToUpdate.calledAt = now;
  }

  if (logStatus === "COMPLETED" && !existing.completedAt) {
    dataToUpdate.completedAt = now;
  }

  await prisma.queueLog.update({
    where: { queueNumber },
    data: dataToUpdate,
  });
}

