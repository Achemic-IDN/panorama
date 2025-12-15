import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>PANORAMA</h1>

      <p style={{ fontWeight: "bold" }}>
        PANORAMA (VERSI TEST ONLINE)
      </p>

      <p style={{ color: "#555", marginBottom: "30px" }}>
        Pelacakan Antrian Obat Real-time Mandiri
      </p>

      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h2>Prototype Sistem</h2>
        <ul style={{ textAlign: "left" }}>
          <li>✔ Pengambilan nomor antrean</li>
          <li>✔ Pelacakan status obat</li>
          <li>✔ Dashboard pasien</li>
          <li>✔ Dashboard petugas</li>
          <li>✔ Notifikasi WhatsApp (konseptual)</li>
        </ul>

        <Link href="/login">
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Masuk Login Pasien
          </button>
        </Link>
      </div>
    </main>
  );
}
