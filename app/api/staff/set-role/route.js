import { NextResponse } from "next/server";
import { verifyStaff } from "@/lib/staffAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// simple endpoint to set active role cookie after selection
export async function POST(request) {
  const { authenticated, staff } = await verifyStaff(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { role } = body || {};
  if (!role || !Array.isArray(staff.roles) || !staff.roles.includes(role)) {
    return NextResponse.json({ success: false, message: "Role tidak valid" }, { status: 400 });
  }

  // audit log for role selection (non-queue-specific)
  try {
    await prisma.queueAuditLog.create({
      data: {
        queueId: null,
        staffId: staff.id,
        action: "SWITCH_ROLE",
        notes: `selected ${role}`,
      },
    });
  } catch (e) {
    console.error("Failed to audit role switch:", e);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("staff_role", String(role), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return res;
}
