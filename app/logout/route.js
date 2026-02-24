import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/", "http://localhost"));

  // Clear the "auth" cookie that is set during login
  response.cookies.set("auth", "", {
    maxAge: 0,
    path: "/",
  });

  // Also clear the patientData cookie
  response.cookies.set("patientData", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
