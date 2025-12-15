"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const queue = searchParams.get("queue");
  const mrn = searchParams.get("mrn");

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard Pasien</h1>

      <p><strong>Selamat datang!</strong></p>
      <p>Nomor Antrean: <b>{queue}</b></p>
      <p>Nomor Rekam Medis: <b>{mrn}</b></p>

      <hr style={{ margin: "20px 0" }} />

      <h2>Status Resep</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Tahap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Entry</td><td>✔ Selesai</td></tr>
          <tr><td>Transport</td><td>✔ Selesai</td></tr>
          <tr><td>Pengemasan</td><td>⏳ Proses</td></tr>
          <tr><td>Siap Diambil</td><td>⏺ Menunggu</td></tr>
        </tbody>
      </table>

      <hr style={{ margin: "20px 0" }} />

      <h2>Feedback Pasien</h2>
      <textarea
        placeholder="Tulis kritik dan saran Anda..."
        style={{ width: "100%", height: "80px", marginBottom: "10px" }}
      />
      <button>Kirim Feedback</button>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
