import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyStaff } from "@/lib/staffAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // allow any authenticated staff (any role) OR legacy admin cookie
    const authCookie = request.cookies.get("auth")?.value;
    const { authenticated } = await verifyStaff(request);
    if (!authenticated && authCookie !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const queues = await prisma.queue.findMany({
      where: {
        status: { notIn: ["SELESAI", "CANCELLED"] },
      },
      orderBy: { updatedAt: "asc" },
    });

    const mrns = Array.from(new Set(queues.map((q) => q.mrn).filter(Boolean)));
    let patientsByMrn = new Map();
    if (mrns.length) {
      const patients = await prisma.patient.findMany({
        where: { mrn: { in: mrns } },
        select: { mrn: true, name: true },
      });
      patientsByMrn = new Map(patients.map((p) => [String(p.mrn).toUpperCase(), p.name]));
    }

    const data = queues.map((q) => ({
      ...q,
      patientName: patientsByMrn.get(String(q.mrn).toUpperCase()) || null,
    }));

    return NextResponse.json({ success: true, data: { queues: data } });
  } catch (error) {
    console.error("Monitor queues error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch queues" }, { status: 500 });
  }
}

