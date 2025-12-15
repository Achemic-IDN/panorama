"use client";

import { useSearchParams } from "next/navigation";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const antrean = searchParams.get("antrean");

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Dashboard Pasien</h1>

      <p>
        Selamat datang, pasien dengan nomor antrean:
      </p>

      <h2 style={{ color: "#2563eb" }}>
        {antrean || "Tidak tersedia"}
      </h2>

      <div style={{ marginTop: 30 }}>
        <h3>Status Resep</h3>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Tahap</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Entry</td><td>✔</td></tr>
            <tr><td>Transport</td><td>⏳</td></tr>
            <tr><td>Pengemasan</td><td>⏳</td></tr>
            <tr><td>Siap Diambil</td><td>❌</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
