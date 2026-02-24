// Status enum resmi PANORAMA untuk antrean resep
export const PANORAMA_STATUSES = [
  "MENUNGGU",    // initial waiting state
  "ENTRY",
  "TRANSPORT",
  "PACKAGING",
  "PENYERAHAN", // in‑house transfer to patient
  "SELESAI",
  "CANCELLED",
];

// Urutan workflow utama (tanpa CANCELLED)
export const WORKFLOW_ORDER = [
  "MENUNGGU",
  "ENTRY",
  "TRANSPORT",
  "PACKAGING",
  "PENYERAHAN",
  "SELESAI",
];

// Transition berikutnya yang valid dalam workflow
export const NEXT_STATUS = {
  MENUNGGU: "ENTRY",
  ENTRY: "TRANSPORT",
  TRANSPORT: "PACKAGING",
  PACKAGING: "PENYERAHAN",
  PENYERAHAN: "SELESAI",
  SELESAI: null,
  CANCELLED: null,
};

// Label Indonesia untuk status
export function getStatusLabel(status) {
  switch (status) {
    case "MENUNGGU":
      return "Menunggu";
    case "ENTRY":
      return "Telah Entri";
    case "TRANSPORT":
      return "Dalam Transport";
    case "PACKAGING":
      return "Packing/Peracikan";
    case "PENYERAHAN":
      return "Menunggu Penyerahan";
    case "SELESAI":
      return "Selesai";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status || "-";
  }
}

// Helper untuk mengetahui apakah status termasuk sedang diproses
export function isInProgressStatus(status) {
  return ["ENTRY", "TRANSPORT", "PACKAGING", "PENYERAHAN"].includes(status);
}

