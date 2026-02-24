import { prisma } from "@/lib/prisma";

export async function verifyStaff(request) {
  try {
    const staffIdRaw = request.cookies.get("staff_id")?.value;
    if (!staffIdRaw) {
      return { authenticated: false, staff: null };
    }

    const staffId = parseInt(staffIdRaw, 10);
    if (Number.isNaN(staffId)) {
      return { authenticated: false, staff: null };
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });

    if (!staff) {
      return { authenticated: false, staff: null };
    }

    return { authenticated: true, staff };
  } catch (error) {
    console.error("verifyStaff error:", error);
    return { authenticated: false, staff: null };
  }
}

