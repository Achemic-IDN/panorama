import { prisma } from "@/lib/prisma";
import { validateSession } from "./sessionService";

export async function verifyStaff(request) {
  try {
    const staffIdRaw = request.cookies.get("staff_id")?.value;
    if (!staffIdRaw) {
      return { authenticated: false, staff: null, activeRole: null };
    }

    const staffId = parseInt(staffIdRaw, 10);
    if (Number.isNaN(staffId)) {
      return { authenticated: false, staff: null, activeRole: null };
    }

    // check session validity if session_id cookie present
    const sessionId = request.cookies.get("session_id")?.value;
    if (sessionId) {
      try {
        const sess = await validateSession(sessionId);
        if (!sess || sess.staffId !== staffId) {
          return { authenticated: false, staff: null, activeRole: null };
        }
      } catch (e) {
        console.error("session validation error:", e);
        return { authenticated: false, staff: null, activeRole: null };
      }
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        username: true,
        roles: true,
      },
    });

    if (!staff) {
      return { authenticated: false, staff: null, activeRole: null };
    }

    // determine active role from cookie; fall back to the single role if only one
    let activeRole = request.cookies.get("staff_role")?.value;
    if (!activeRole && Array.isArray(staff.roles)) {
      if (staff.roles.length === 1) {
        activeRole = staff.roles[0];
      }
    }
    // if cookie role is not in staff.roles, ignore it
    if (activeRole && Array.isArray(staff.roles) && !staff.roles.includes(activeRole)) {
      activeRole = null;
    }

    return { authenticated: true, staff, activeRole };
  } catch (error) {
    console.error("verifyStaff error:", error);
    return { authenticated: false, staff: null, activeRole: null };
  }
}

