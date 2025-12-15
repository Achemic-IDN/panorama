import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
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
          marginBottom: "30px",
          textAlign: "left",
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

      {/* Tombol Login */}
      <Link href="/login">
        <button
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Masuk Login Pasien
        </button>
      </Link>
    </main>
  );
}
