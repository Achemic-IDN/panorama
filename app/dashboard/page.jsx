export default function DashboardPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>
      <p>Status Pelayanan Obat:</p>

      <ul>
        <li>🟡 Entry Resep</li>
        <li>🟡 Transport</li>
        <li>⚪ Pengemasan</li>
        <li>⚪ Siap Diambil</li>
      </ul>
    </main>
  );
}
