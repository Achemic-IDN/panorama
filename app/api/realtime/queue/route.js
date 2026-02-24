import { addClient, removeClient } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const wrap = {
        enqueue(chunk) {
          controller.enqueue(encoder.encode(chunk));
        },
      };

      // Simpan client
      addClient(wrap);

      // Kirim comment awal/heartbeat
      wrap.enqueue(": connected\n\n");
    },
    cancel() {
      // cancel dipanggil saat client disconnect;
      // controller instance sudah tidak tersedia di sini,
      // jadi pembersihan dilakukan di sisi broadcast saat error.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

