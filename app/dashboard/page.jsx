export default function DashboardPasien() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "5px" }}>
          Dashboard Pasien
        </h1>
        <p style={{ color: "#555" }}>
          Pelacakan Antrian Obat Real-time Mandiri
        </p>
      </div>

      {/* Informasi Antrean */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Informasi Antrean</h2>
        <p><strong>Nomor Antrean:</strong> A-023</p>
        <p><strong>Nomor Rekam Medis:</strong> 12345678</p>
      </div>

      {/* Status Proses Obat */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Status Proses Obat</h2>

        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          <li>✅ Entry Resep</li>
          <li>✅ Transport Obat</li>
          <li>⏳ Pengemasan</li>
          <li>⬜ Siap Diambil</li>
        </ul>
      </div>

      {/* Estimasi Waktu */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <h2>Estimasi Waktu</h2>
        <p style={{ fontSize: "20px", fontWeight: "bold", marginTop: "10px" }}>
          ± 10 menit
        </p>
      </div>

      {/* Lokasi Pengambilan */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <h2>Lokasi Pengambilan Obat</h2>
        <p>Loket Farmasi Rawat Jalan</p>
      </div>

      {/* Catatan */}
      <p style={{ marginTop: "30px", fontSize: "12px", color: "#777" }}>
        Informasi ini diperbarui secara berkala oleh petugas farmasi.
      </p>
    </main>
  );
}
