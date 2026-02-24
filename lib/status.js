// Status enum resmi PANORAMA untuk antrean resep
export const PANORAMA_STATUSES = [
  "WAITING",
  "ENTRY",
  "TRANSPORT",
  "PACKAGING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

// Urutan workflow utama (tanpa CANCELLED)
export const WORKFLOW_ORDER = [
  "WAITING",
  "ENTRY",
  "TRANSPORT",
  "PACKAGING",
  "READY",
  "COMPLETED",
];

// Transition berikutnya yang valid dalam workflow
export const NEXT_STATUS = {
  WAITING: "ENTRY",
  ENTRY: "TRANSPORT",
  TRANSPORT: "PACKAGING",
  PACKAGING: "READY",
  READY: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

// Label Indonesia untuk status
export function getStatusLabel(status) {
  switch (status) {
    case "WAITING":
      return "Menunggu";
    case "ENTRY":
      return "Entri Resep";
    case "TRANSPORT":
      return "Pengambilan Obat";
    case "PACKAGING":
      return "Peracikan / Pengemasan";
    case "READY":
      return "Siap Diambil";
    case "COMPLETED":
      return "Selesai";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status || "-";
  }
}

// Helper untuk mengetahui apakah status termasuk sedang diproses
export function isInProgressStatus(status) {
  return ["ENTRY", "TRANSPORT", "PACKAGING", "READY"].includes(status);
}

