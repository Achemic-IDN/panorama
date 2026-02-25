import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/roleGuard";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { ok } = await requireRole(request, ["UTAMA"]);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queueIdParam = searchParams.get("queueId");
    const staffIdParam = searchParams.get("staffId");
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");
    const format = searchParams.get("format"); // csv

    const where = {};
    if (queueIdParam) {
      const qid = parseInt(queueIdParam, 10);
      if (!isNaN(qid)) where.queueId = qid;
    }
    if (staffIdParam) {
      const sid = parseInt(staffIdParam, 10);
      if (!isNaN(sid)) where.staffId = sid;
    }

    if (dateFromParam || dateToParam) {
      where.createdAt = {};
      if (dateFromParam) {
        const d = new Date(dateFromParam);
        if (!isNaN(d.getTime())) where.createdAt.gte = d;
      }
      if (dateToParam) {
        const d2 = new Date(dateToParam);
        if (!isNaN(d2.getTime())) {
          // make inclusive
          const inclusive = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate() + 1);
          where.createdAt.lte = inclusive;
        }
      }
    }

    const logs = await prisma.queueAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        queue: { select: { queue: true } },
        staff: { select: { name: true } },
      },
    });

    if (format === "csv") {
      const header = [
        "ID",
        "Queue",
        "Staff",
        "Action",
        "From Stage",
        "To Stage",
        "Notes",
        "Created At",
      ];
      const rows = logs.map((l) => [
        l.id,
        l.queue?.queue || "",
        l.staff?.name || "",
        l.action,
        l.fromStage || "",
        l.toStage || "",
        l.notes || "",
        l.createdAt?.toISOString() || "",
      ]);
      const csv = [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=audit_logs.csv",
        },
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
