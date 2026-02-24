import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Verify admin authentication
async function verifyAuth(request) {
  const auth = request.cookies.get('auth');
  return auth?.value === 'admin';
}

export async function PUT(request, { params }) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ["Menunggu", "Dipanggil", "Selesai"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const queueId = parseInt(id);
    if (isNaN(queueId)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: queueId },
      data: { status },
    });

    return NextResponse.json(updatedQueue);
  } catch (error) {
    console.error("Error updating queue:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update queue" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const queueId = parseInt(id);
    
    if (isNaN(queueId)) {
      return NextResponse.json({ error: "Invalid queue ID" }, { status: 400 });
    }

    await prisma.queue.delete({
      where: { id: queueId },
    });

    return NextResponse.json({ message: "Queue deleted successfully" });
  } catch (error) {
    console.error("Error deleting queue:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete queue" }, { status: 500 });
  }
}