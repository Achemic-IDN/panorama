import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mrn = searchParams.get('mrn');

    if (!mrn) {
      return NextResponse.json({ error: "MRN required" }, { status: 400 });
    }

    const queues = await prisma.queue.findMany({
      where: { mrn },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(queues);
  } catch (error) {
    console.error("Error fetching patient queues:", error);
    return NextResponse.json({ error: "Failed to fetch queues" }, { status: 500 });
  }
}