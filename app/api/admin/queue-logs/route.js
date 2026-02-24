import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function verifyAuth(request) {
  const auth = request.cookies.get("auth");
  return auth?.value === "admin";
}

function parseDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function minutesDiff(start, end) {
  if (!start || !end) return null;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null;
  return Math.round(diffMs / 60000);
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // WAITING, PROCESSING, COMPLETED, CANCELLED, or null
    const search = searchParams.get("search") || "";
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");
    const pageParam = searchParams.get("page") || "1";
    const pageSizeParam = searchParams.get("pageSize") || "20";
    const format = searchParams.get("format"); // 'csv' for export

    const page = Math.max(parseInt(pageParam, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), 200);

    const dateFrom = parseDate(dateFromParam);
    const dateToRaw = parseDate(dateToParam);
    // Make dateTo inclusive (end of day)
    const dateTo = dateToRaw
      ? new Date(dateToRaw.getFullYear(), dateToRaw.getMonth(), dateToRaw.getDate() + 1)
      : undefined;

    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: "insensitive" } },
        { medicalRecordNumber: { contains: search, mode: "insensitive" } },
        { queueNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.queueLog.count({ where });

    const logs = await prisma.queueLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Stats for the selected date range (or today if no range given)
    let statsWhere = { ...where };
    if (!dateFrom && !dateTo) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      statsWhere.createdAt = { gte: startOfDay, lte: endOfDay };
    }

    const todayLogs = await prisma.queueLog.findMany({
      where: statsWhere,
    });

    const completedLogs = todayLogs.filter(
      (log) => log.status === "COMPLETED" && log.completedAt
    );

    const waitingTimes = completedLogs
      .map((log) => minutesDiff(log.createdAt, log.calledAt))
      .filter((v) => v !== null);

    const serviceTimes = completedLogs
      .map((log) => minutesDiff(log.calledAt, log.completedAt))
      .filter((v) => v !== null);

    const avgWaitingMinutes =
      waitingTimes.length > 0
        ? Math.round(
            waitingTimes.reduce((sum, v) => sum + v, 0) / waitingTimes.length
          )
        : null;

    const avgServiceMinutes =
      serviceTimes.length > 0
        ? Math.round(
            serviceTimes.reduce((sum, v) => sum + v, 0) / serviceTimes.length
          )
        : null;

    // Build per-hour aggregates (for charts)
    const hourlyBuckets = new Array(24).fill(null).map((_, hour) => ({
      hour,
      count: 0,
      waitingMinutes: [],
    }));

    todayLogs.forEach((log) => {
      if (!log.createdAt) return;
      const h = log.createdAt.getHours();
      if (h < 0 || h > 23) return;
      const bucket = hourlyBuckets[h];
      bucket.count += 1;
      const w = minutesDiff(log.createdAt, log.calledAt);
      if (w !== null) bucket.waitingMinutes.push(w);
    });

    const hourly = hourlyBuckets.map((b) => ({
      hour: b.hour,
      count: b.count,
      avgWaitingMinutes:
        b.waitingMinutes.length > 0
          ? Math.round(
              b.waitingMinutes.reduce((sum, v) => sum + v, 0) /
                b.waitingMinutes.length
            )
          : null,
    }));

    const stats = {
      totalToday: todayLogs.length,
      avgWaitingMinutes,
      avgServiceMinutes,
      completedCount: completedLogs.length,
      hourly,
    };

    if (format === "csv") {
      const header = [
        "Queue Number",
        "Patient Name",
        "Medical Record Number",
        "Service Type",
        "Status",
        "Created At",
        "Called At",
        "Completed At",
        "Waiting Time (minutes)",
        "Service Time (minutes)",
      ];

      const rows = logs.map((log) => {
        const waiting = minutesDiff(log.createdAt, log.calledAt);
        const service = minutesDiff(log.calledAt, log.completedAt);
        return [
          log.queueNumber,
          log.patientName ?? "",
          log.medicalRecordNumber,
          log.serviceType ?? "",
          log.status,
          log.createdAt?.toISOString?.() ?? "",
          log.calledAt?.toISOString?.() ?? "",
          log.completedAt?.toISOString?.() ?? "",
          waiting ?? "",
          service ?? "",
        ];
      });

      const csv = [header, ...rows]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=queue_logs.csv",
        },
      });
    }

    const items = logs.map((log) => ({
      ...log,
      waitingTimeMinutes: minutesDiff(log.createdAt, log.calledAt),
      serviceTimeMinutes: minutesDiff(log.calledAt, log.completedAt),
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      stats,
    });
  } catch (error) {
    console.error("Error fetching queue logs:", error);
    return NextResponse.json({ error: "Failed to fetch queue logs" }, { status: 500 });
  }
}

