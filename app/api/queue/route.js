import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mrn = searchParams.get('mrn');

    if (!mrn) {
      return NextResponse.json([], { status: 200 });
    }

    const queues = await prisma.queue.findMany({
      where: { mrn },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(queues);
  } catch (error) {
    console.error("Error fetching patient queues:", error);
    return NextResponse.json([], { status: 200 });
  }
}