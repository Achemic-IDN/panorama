"use client";

import { useSearchParams } from "next/navigation";

export default function DashboardPasien() {
  const searchParams = useSearchParams();
  const nomorAntrian = searchParams.get("antrian") || "—";

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
      
      {/* Header */}
      <h1 style={{ fontSize: "28px", marginBottom: "5px" }}>
        Selamat Datang 👋
      </h1>

      <p style={{ color: "#555", marginBottom: "20px" }}>
        Nomor Antrean Anda:
        <strong style={{ marginLeft: "8px", fontSize: "18px" }}>
          {nomorAntrian}
        </strong>
      </p>

      {/* Status Resep */}
      <section style={{ marginBottom: "30px" }}>
        <h2>Status Perkembangan Resep</h2>

        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px"
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Tahapan</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Entry Resep</td>
              <td style={tdStyle}>✔ Selesai</td>
            </tr>
            <tr>
              <td style={tdStyle}>Transport Obat</td>
              <td style={tdStyle}>✔ Selesai</td>
            </tr>
            <tr>
              <td style={tdStyle}>Pengemasan</td>
              <td style={tdStyle}>⏳ Diproses</td>
            </tr>
            <tr>
              <td style={tdStyle}>Siap Diambil</td>
              <td style={tdStyle}>⏳ Menunggu</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Feedback */}
      <section>
        <h2>Umpan Balik Pelayanan</h2>

        <textarea
          placeholder="Tulis kritik atau saran Anda di sini..."
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Kirim Feedback
        </button>
      </section>

    </main>
  );
}

/* Style helper */
const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f3f4f6",
  textAlign: "left"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px"
};
