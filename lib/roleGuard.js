import { verifyStaff } from "./staffAuth";
import { NextResponse } from "next/server";

/**
 * Throws or returns response if not authenticated/authorized.
 * Allows role OR UTAMA wildcard.
 */
export async function requireRole(request, requiredRole) {
  const { authenticated, staff, activeRole } = await verifyStaff(request);
  if (!authenticated) {
    return { ok: false, response: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }
  // UTAMA can impersonate any role
  if (activeRole === "UTAMA" || activeRole === requiredRole) {
    return { ok: true, staff, activeRole };
  }
  return { ok: false, response: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }) };
}
