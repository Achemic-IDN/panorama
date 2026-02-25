 import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/roleGuard";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/queue-stats
 * 
 * Returns real-time statistics for Admin UTAMA dashboard:
 * - Total Antrian Hari Ini
 * - Sedang Diproses
 * - Selesai
 * - Rata-rata Waktu Entry
 * - Rata-rata Waktu Packaging
 * - Rata-rata Total Pelayanan
 */
export async function GET(request) {
  try {
    const { ok } = await requireRole(request, "UTAMA");
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get queues created today
    const todayQueues = await prisma.queue.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Calculate statistics
    const totalHariIni = todayQueues.length;
    const menunggu = todayQueues.filter(q => q.status === "MENUNGGU").length;
    const sedangDiproses = todayQueues.filter(q => 
      ["ENTRY", "TRANSPORT", "PACKAGING", "PENYERAHAN"].includes(q.status)
    ).length;
    const selesai = todayQueues.filter(q => q.status === "SELESAI").length;
    const cancelled = todayQueues.filter(q => q.status === "CANCELLED").length;

    // Calculate averages for completed queues only
    const completedQueues = todayQueues.filter(q => q.status === "SELESAI" && q.durationTotal !== null);
    
    let avgEntry = null;
    let avgTransport = null;
    let avgPackaging = null;
    let avgPenyerahan = null;
    let avgTotal = null;

    if (completedQueues.length > 0) {
      const entryDurations = completedQueues.map(q => q.durationEntry).filter(d => d !== null);
      const transportDurations = completedQueues.map(q => q.durationTransport).filter(d => d !== null);
      const packagingDurations = completedQueues.map(q => q.durationPackaging).filter(d => d !== null);
      const penyerahanDurations = completedQueues.map(q => q.durationPenyerahan).filter(d => d !== null);
      const totalDurations = completedQueues.map(q => q.durationTotal).filter(d => d !== null);

      if (entryDurations.length > 0) {
        avgEntry = Math.round(entryDurations.reduce((a, b) => a + b, 0) / entryDurations.length);
      }
      if (transportDurations.length > 0) {
        avgTransport = Math.round(transportDurations.reduce((a, b) => a + b, 0) / transportDurations.length);
      }
      if (packagingDurations.length > 0) {
        avgPackaging = Math.round(packagingDurations.reduce((a, b) => a + b, 0) / packagingDurations.length);
      }
      if (penyerahanDurations.length > 0) {
        avgPenyerahan = Math.round(penyerahanDurations.reduce((a, b) => a + b, 0) / penyerahanDurations.length);
      }
      if (totalDurations.length > 0) {
        avgTotal = Math.round(totalDurations.reduce((a, b) => a + b, 0) / totalDurations.length);
      }
    }

    const stats = {
      // Basic counts
      totalHariIni,
      menunggu,
      sedangDiproses,
      selesai,
      cancelled,
      
      // Average durations in seconds
      avgEntry,
      avgTransport,
      avgPackaging,
      avgPenyerahan,
      avgTotal,
      
      // Additional metrics
      queuesInEachStage: {
        MENUNGGU: menunggu,
        ENTRY: todayQueues.filter(q => q.status === "ENTRY").length,
        TRANSPORT: todayQueues.filter(q => q.status === "TRANSPORT").length,
        PACKAGING: todayQueues.filter(q => q.status === "PACKAGING").length,
        PENYERAHAN: todayQueues.filter(q => q.status === "PENYERAHAN").length,
        SELESAI: selesai,
      },
      
      // Completed queue count for average calculation
      completedCount: completedQueues.length,
      
      // Timestamp
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching queue stats:", error);
    return NextResponse.json({ error: "Failed to fetch queue stats" }, { status: 500 });
  }
}
