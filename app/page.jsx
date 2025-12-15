export default function Home() {
  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "6px" }}>
          PANORAMA
        </h1>

        <p style={{ fontWeight: "bold", marginBottom: "6px" }}>
          PANORAMA (VERSI TEST ONLINE)
        </p>

        <p style={{ color: "#555" }}>
          Pelacakan Antrian Obat Real-time Mandiri
        </p>
      </div>

      {/* Konten utama */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>
          Prototype Sistem
        </h2>

        <ul style={{ lineHeight: "1.8" }}>
          <li>✔ Pengambilan nomor antrean</li>
          <li>✔ Pelacakan status obat</li>
          <li>✔ Dashboard pasien</li>
          <li>✔ Dashboard petugas</li>
          <li>✔ Notifikasi WhatsApp (konseptual)</li>
        </ul>
      </div>
    </main>
  );
}
