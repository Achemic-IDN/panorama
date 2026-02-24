import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queue = searchParams.get("queue") || "";
    const mrn = searchParams.get("mrn") || "";

    if (!queue || !mrn) {
      return ApiResponse.badRequest("Parameter queue dan mrn wajib diisi");
    }

    const normalizedMrn = mrn.toUpperCase();

    const record = await prisma.queue.findFirst({
      where: {
        queue,
        mrn: normalizedMrn,
      },
    });

    if (!record) {
      return ApiResponse.notFound("Data antrean tidak ditemukan");
    }

    const payload = {
      queue: record.queue,
      mrn: record.mrn,
      status: record.status,
      updatedAt: record.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };

    return ApiResponse.success(payload);
  } catch (error) {
    console.error("Error fetching queue status:", error);
    return ApiResponse.serverError("Gagal mengambil status antrean", {
      message: error?.message,
    });
  }
}

