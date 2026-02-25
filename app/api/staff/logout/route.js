import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/sessionService";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const sessionId = request.cookies.get("session_id")?.value;
  if (sessionId) {
    try {
      await revokeSession(sessionId);
    } catch {
      // ignore
    }
  }

  const res = NextResponse.json({
    success: true,
    message: "Logged out",
    timestamp: new Date().toISOString(),
  });

  res.cookies.set("staff_id", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("staff_role", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("session_id", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("csrf_token", "", {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}

