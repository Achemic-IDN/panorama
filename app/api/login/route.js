import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { nomorAntrean, mrn } = body;

  // VALIDASI SEDERHANA (sementara)
  if (!nomorAntrean || !mrn) {
    return NextResponse.json(
      { message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  // Simpan ke cookie (AMAN)
  const response = NextResponse.json({ success: true });

  response.cookies.set("panorama_session", nomorAntrean, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60, // 1 jam
  });

  return response;
}
