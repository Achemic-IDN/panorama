import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { verifyStaff } from "@/lib/staffAuth";

export const dynamic = "force-dynamic";

function getVisibleStatusesByRole(role) {
  switch (role) {
    case "ENTRY":
      return ["WAITING"];
    case "TRANSPORT":
      return ["ENTRY"];
    case "PACKAGING":
      // membutuhkan 2 tahap agar bisa TRANSPORT->PACKAGING->READY oleh role yang sama
      return ["TRANSPORT", "PACKAGING"];
    case "PICKUP":
      return ["READY"];
    case "ADMIN":
      return null; // lihat semua
    default:
      return [];
  }
}

export async function GET(request) {
  try {
    const { authenticated, staff } = await verifyStaff(request);
    if (!authenticated) {
      return ApiResponse.unauthorized("Unauthorized");
    }

    const visibleStatuses = getVisibleStatusesByRole(staff.role);

    const queues = await prisma.queue.findMany({
      where: visibleStatuses ? { status: { in: visibleStatuses } } : undefined,
      orderBy: { updatedAt: "asc" },
    });

    return ApiResponse.success({
      staff,
      filters: { visibleStatuses },
      queues,
    });
  } catch (error) {
    console.error("Error fetching staff queues:", error);
    return ApiResponse.serverError("Gagal mengambil antrean", { message: error?.message });
  }
}

