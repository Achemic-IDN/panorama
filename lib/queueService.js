import { prisma } from "@/lib/prisma";

/**
 * Helper untuk mendapatkan data antrean berdasarkan
 * kombinasi nomor antrean (queue) dan MRN pasien.
 *
 * Mengembalikan:
 * - Queue record (Prisma) jika ditemukan
 * - null jika tidak ada yang cocok
 *
 * Melempar error hanya untuk kegagalan database yang tidak terduga.
 */
export async function getQueueByPatient(queue, mrn) {
  if (!queue || !mrn) {
    return null;
  }

  const normalizedMrn = mrn.toUpperCase();

  try {
    const record = await prisma.queue.findFirst({
      where: {
        queue,
        mrn: normalizedMrn,
      },
    });

    return record || null;
  } catch (error) {
    console.error("Error querying Queue by patient:", error);
    throw error;
  }
}

