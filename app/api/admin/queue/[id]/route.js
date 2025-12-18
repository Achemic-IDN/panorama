import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json(updatedQueue);
  } catch (error) {
    console.error("Error updating queue:", error);
    return NextResponse.json({ error: "Failed to update queue" }, { status: 500 });
  }
}