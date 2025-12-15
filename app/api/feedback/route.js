import { NextResponse } from "next/server";

// Simpan sementara di memory (prototype)
let feedbacks = [];

export async function POST(request) {
  try {
    const body = await request.json();

    const { nama, nomorAntrian, pesan } = body;

    if (!nama || !nomorAntrian || !pesan) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const newFeedback = {
      id: Date.now(),
      nama,
      nomorAntrian,
      pesan,
      waktu: new Date().toISOString(),
    };

    feedbacks.push(newFeedback);

    return NextResponse.json({
      success: true,
      message: "Feedback berhasil dikirim",
      data: newFeedback,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// OPTIONAL: untuk admin melihat semua feedback
export async function GET() {
  return NextResponse.json({
    success: true,
    total: feedbacks.length,
    data: feedbacks,
  });
}
