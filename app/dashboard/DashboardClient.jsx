"use client";

import { useSearchParams } from "next/navigation";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const nomorAntrean = searchParams.get("antrean");

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>PANORAMA</h1>

      <p style={{ marginBottom: 20 }}>
        Selamat datang, pasien dengan nomor antrean:
      </p>

      <h2 style={{ marginBottom: 30 }}>
        {nomorAntrean || "-"}
      </h2>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Entry Resep</td>
            <td>✔</td>
          </tr>
          <tr>
            <td>Transport</td>
            <td>✔</td>
          </tr>
          <tr>
            <td>Pengemasan</td>
            <td>⏳</td>
          </tr>
          <tr>
            <td>Siap Diambil</td>
            <td>⏳</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 40 }}>
        <h3>Feedback Pelayanan</h3>
        <textarea
          placeholder="Tulis kritik dan saran..."
          rows={4}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button>Kirim</button>
      </div>
    </main>
  );
}
