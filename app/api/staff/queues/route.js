import ApiResponse from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { verifyStaff } from "@/lib/staffAuth";

export const dynamic = "force-dynamic";

function getVisibleStatusesByRole(role) {
  switch (role) {
    case "ENTRY":
      return ["MENUNGGU"];
    case "TRANSPORT":
      return ["ENTRY"];
    case "PACKAGING":
      // packaging user should be able to take over from TRANSPORT and
      // to advance to PENYERAHAN as well (two steps in a row)
      return ["TRANSPORT", "PACKAGING"];
    case "PENYERAHAN":
      return ["PENYERAHAN"];
    case "UTAMA":
      return null; // see everything
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

    // determine active role either from cookie or from staff.roles (fallback to first)
    const activeRole = request.cookies.get("staff_role")?.value || (Array.isArray(staff.roles) ? staff.roles[0] : null);
    const visibleStatuses = getVisibleStatusesByRole(activeRole);

    const queues = await prisma.queue.findMany({
      where: visibleStatuses ? { status: { in: visibleStatuses } } : undefined,
      orderBy: [{ priority: "desc" }, { updatedAt: "asc" }],
    });

    return ApiResponse.success({
      staff,
      activeRole,
      filters: { visibleStatuses },
      queues,
    });
  } catch (error) {
    console.error("Error fetching staff queues:", error);
    return ApiResponse.serverError("Gagal mengambil antrean", { message: error?.message });
  }
}

