export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          PANORAMA
        </h1>

        <p
          style={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          (VERSI TEST ONLINE)
        </p>

        <p
          style={{
            color: "#555",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Pelacakan Antrian Obat Real-time Mandiri
        </p>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>Prototype Sistem</h2>
          <ul style={{ lineHeight: "1.8" }}>
            <li>✔ Pengambilan nomor antrean</li>
            <li>✔ Pelacakan status obat</li>
            <li>✔ Dashboard pasien</li>
            <li>✔ Dashboard petugas</li>
            <li>✔ Notifikasi WhatsApp (konseptual)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
