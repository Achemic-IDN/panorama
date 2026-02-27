export function getRoleLabel(role) {
  switch (role) {
    case "UTAMA":
      return "Admin Utama";
    case "ENTRY":
      return "Admin Entry";
    case "TRANSPORT":
      return "Admin Transport";
    case "PACKAGING":
      return "Admin Packaging";
    case "PENYERAHAN":
      return "Admin Penyerahan Obat";
    case "MONITORING":
      return "Layar Monitoring";
    default:
      return role || "-";
  }
}
