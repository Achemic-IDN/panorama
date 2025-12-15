"use client";

import { useState } from "react";

export default function DashboardPasien() {
  // Simulasi data hasil login
  const [nomorAntrean] = useState("A-023");

  // Simulasi status resep
  const [statusResep] = useState([
    { tahap: "Entry Resep", status: "Selesai" },
    { tahap: "Transport Obat", status: "Selesai" },
    { tahap: "Pengemasan", status: "Diproses" },
    { tahap: "Siap Diambil", status: "Menunggu" },
  ]);

  const [feedback, setFeedback] = useState("");

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      alert("Feedback tidak boleh kosong");
      return;
    }

    alert("Terima kasih atas feedback Anda 🙏");
    setFeedback("");
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* Header */}
      <h1 style={{ marginBottom: "5px" }}>Dashboard Pasien</h1>
      <p style={{ color: "#555", marginBottom: "30px" }}>
        Selamat datang di sistem PANORAMA
      </p>

      {/* Info Antrean */}
      <div style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "30px",
        backgroundColor: "#f9fafb"
      }}>
        <h2>Nomor Antrean Anda</h2>
        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>
          {nomorAntrean}
        </p>
      </div>

      {/* Tabel Status Resep */}
      <div style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "30px"
      }}>
        <h2>Perkembangan Resep</h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9" }}>
              <th style={thStyle}>Tahap</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {statusResep.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.tahap}</td>
                <td style={tdStyle}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback */}
      <div style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }}>
        <h2>Feedback Pelayanan</h2>

        <textarea
          placeholder="Tulis kritik atau saran Anda di sini..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
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
          onClick={handleSubmitFeedback}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Kirim Feedback
        </button>
      </div>
    </main>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #ddd"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};
