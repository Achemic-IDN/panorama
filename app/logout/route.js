import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/login", "http://localhost"));

  response.cookies.set("panorama_session", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
