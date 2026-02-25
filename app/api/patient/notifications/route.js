import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parsePatientDataCookie(request) {
  const raw = request.cookies.get("patientData")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    return null;
  }
}

/**
 * GET /api/patient/notifications?queueId=
 *
 * Security:
 * - Requires patientData cookie
 * - Ensures requested queueId belongs to that patient (queueNumber + MRN match)
 *
 * Response:
 * - Array of PatientStageNotification rows (latest first)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueIdParam = searchParams.get("queueId");
    if (!queueIdParam) {
      return NextResponse.json({ error: "queueId is required" }, { status: 400 });
    }

    const queueId = parseInt(queueIdParam, 10);
    if (Number.isNaN(queueId)) {
      return NextResponse.json({ error: "queueId is invalid" }, { status: 400 });
    }

    const patientData = parsePatientDataCookie(request);
    if (!patientData?.nomorAntrean || !patientData?.nomorRekamMedis) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      select: { id: true, queue: true, mrn: true },
    });
    if (!queue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    // Ensure this queue belongs to the current patient cookie identity
    const cookieQueue = String(patientData.nomorAntrean);
    const cookieMrn = String(patientData.nomorRekamMedis).toUpperCase();
    if (queue.queue !== cookieQueue || String(queue.mrn).toUpperCase() !== cookieMrn) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notifications = await prisma.patientStageNotification.findMany({
      where: { queueId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching patient notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

