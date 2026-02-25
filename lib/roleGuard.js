import { verifyStaff } from "./staffAuth";
import { NextResponse } from "next/server";

/**
 * Check whether the incoming request belongs to a logged-in staff member
 * whose **active role** is one of the allowed roles.  If the array of
 * allowedRoles is empty, any authenticated staff passes.  UTAMA always
 * succeeds (super‑admin wildcard).
 *
 * Returns an object similar to requireRole so callers can reuse the
 * response / staff info.
 */
export async function requireRole(request, allowedRoles = []) {
  const { authenticated, staff, activeRole } = await verifyStaff(request);
  if (!authenticated) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // always allow UTAMA
  if (activeRole === "UTAMA") {
    return { ok: true, staff, activeRole };
  }

  // if no specific role restriction, any authenticated staff is fine
  if (!allowedRoles || allowedRoles.length === 0) {
    return { ok: true, staff, activeRole };
  }

  // check against the allowed set
  if (allowedRoles.includes(activeRole)) {
    return { ok: true, staff, activeRole };
  }

  return {
    ok: false,
    response: NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    ),
  };
}

/**
 * Convenience boolean check that simply returns true/false and does not
 * prepare a NextResponse object.  Useful in client-like helpers.
 */
export async function hasRole(request, allowedRoles = []) {
  const { ok } = await requireRole(request, allowedRoles);
  return ok;
}
