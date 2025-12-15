export default function Home() {
  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
        PANORAMA
      </h1>

      <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
        (VERSI TEST ONLINE)
      </p>

      <p style={{ color: "#555", marginBottom: "30px" }}>
        Pelacakan Antrian Obat Real-time Mandiri
      </p>

      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          display: "inline-block",
          textAlign: "left"
        }}
      >
        <h2>Prototype Sistem</h2>
        <ul>
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
